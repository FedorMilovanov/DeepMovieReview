import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EVIDENCE_CHUNK_SIZE, EVIDENCE_MAX_PARTS, EVIDENCE_PART_CHUNKS } from "./evidence-transfer.mjs";

const digest = buffer => createHash("sha256").update(buffer).digest("hex");
// Newly created GitHub Checks may briefly return 404 on PATCH/GET before
// propagation. Reconcile exact annotations with a bounded read instead of
// replaying a possibly accepted PATCH blindly; missing data remains fatal.
const transient = error => Number.isInteger(error?.status) &&
  (error.status === 404 || (error.status >= 500 && error.status < 600));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function readAnnotations(api, id, maximum, wait) {
  const all = [];
  for (let page = 1; ; page++) {
    let rows;
    for (let attempt = 0; ; attempt++) {
      try { rows = await api(`/${id}/annotations?per_page=100&page=${page}`); break; }
      catch (error) {
        if (!transient(error) || attempt >= 2) throw error;
        await wait(1000 * (attempt + 1));
      }
    }
    assert.ok(Array.isArray(rows), "Invalid annotation response");
    all.push(...rows);
    assert.ok(all.length <= maximum, "Extra annotation chunks");
    if (rows.length < 100) return all;
  }
}

// PATCH annotations append, so a 5xx can mean none, some, or all were saved.
// Never resend the batch blindly: compare two bounded reads against the exact
// expected titles/messages and send only missing chunks. Final whole-receipt
// read-back/hash remains mandatory and fails closed if a late duplicate appears.
async function appendAnnotations(api, check, manifest, previous, batch, wait) {
  const expected = [...previous, ...batch];
  let pending = batch;
  for (let attempt = 0; ; attempt++) {
    try {
      await api(`/${check.id}`, "PATCH", { output: { title: check.name, summary: JSON.stringify(manifest), annotations: pending } });
      return;
    } catch (error) {
      if (!transient(error)) throw error;
      await wait(1000 * (attempt + 1));
      const first = await readAnnotations(api, check.id, expected.length, wait);
      await wait(1000);
      const second = await readAnnotations(api, check.id, expected.length, wait);
      const normalize = rows => rows.map(({ title, message }) => ({ title, message })).sort((a, b) => a.title.localeCompare(b.title));
      assert.deepEqual(normalize(first), normalize(second), "Annotation read-back changed during reconciliation");
      const allowed = new Map(expected.map(row => [row.title, row.message]));
      const present = new Set();
      for (const row of second) {
        assert.ok(allowed.has(row.title) && allowed.get(row.title) === row.message, "Unexpected annotation during reconciliation");
        assert.ok(!present.has(row.title), "Duplicate annotation during reconciliation");
        present.add(row.title);
      }
      assert.ok(previous.every(row => present.has(row.title)), "Previously accepted annotations disappeared during reconciliation");
      pending = batch.filter(row => !present.has(row.title));
      if (!pending.length) return;
      if (attempt >= 2) throw error;
    }
  }
}

// GitHub's Checks API can acknowledge PATCH before new annotations become
// visible through GET. Observe only: never resend a successfully PATCHed batch.
// Absent chunks remain a hard failure after this bounded visibility budget.
async function readAnnotationsUntilComplete(api, id, count, wait) {
  let rows = [];
  for (let attempt = 0; attempt < 30; attempt++) {
    rows = await readAnnotations(api, id, count, wait);
    if (rows.length === count) return rows;
    if (attempt < 29) await wait(2000);
  }
  assert.equal(rows.length, count, "Missing annotation chunks after bounded read-back");
  return rows;
}

/** Keep the 1,000-annotation budget per check, not per complete receipt. */
export function planEvidence(bytes, revision) {
  assert.match(revision, /^[a-f0-9]{40}$/);
  assert.ok(Buffer.isBuffer(bytes) && bytes.length > 0);
  const chunks = bytes.toString("base64").match(new RegExp(`.{1,${EVIDENCE_CHUNK_SIZE}}`, "g"));
  assert.ok(chunks.length <= EVIDENCE_PART_CHUNKS * EVIDENCE_MAX_PARTS, "Evidence exceeds the multipart Checks API budget; never truncate diagnostics");
  const groups = [];
  for (let start = 0; start < chunks.length; start += EVIDENCE_PART_CHUNKS) groups.push(chunks.slice(start, start + EVIDENCE_PART_CHUNKS));
  return { manifest: { revision, sha256: digest(bytes), encoding: "gzip+base64", chunks: chunks.length, bytes: bytes.length }, chunks, groups };
}

/** Publish all parts and verify their read-back before marking the root successful. */
export async function publishEvidence({ bytes, revision, head, label, summary, api, wait = sleep, kind = "accessibility", annotationPath }) {
  assert.match(head, /^[a-f0-9]{40}$/);
  assert.match(label, /^[a-z-]+$/);
  assert.ok(["accessibility", "security"].includes(kind), "Unknown evidence kind");
  const { manifest, chunks, groups } = planEvidence(bytes, revision);
  const title = `${kind === "security" ? "Security" : "Accessibility"} evidence (${label})`;
  const path = annotationPath ?? (kind === "security" ? "scripts/check-swift-codeql.mjs" : "docs/57-ACCESSIBILITY-CHECKS.md");
  assert.match(path, /^(?:scripts|docs)\/[a-zA-Z0-9_./-]+$/, "Invalid annotation path");
  assert.ok(!path.split("/").includes(".."), "Invalid annotation path");
  const created = [];
  try {
    for (const [index] of groups.entries()) {
      const name = index ? title.replace(/\)$/, `-part-${index + 1})`) : title;
      const check = await api("", "POST", { name, head_sha: head, status: "in_progress" });
      assert.ok(Number.isSafeInteger(check.id) && check.id > 0, "Checks API returned an invalid check ID");
      created.push({ id: check.id, name });
    }
    if (created.length > 1) {
      let first = 1;
      manifest.parts = created.map((check, index) => {
        const part = { id: check.id, first, chunks: groups[index].length };
        first += part.chunks;
        return part;
      });
    }
    let first = 1;
    for (const [partIndex, group] of groups.entries()) {
      const check = created[partIndex];
      const annotations = group.map((message, index) => ({
        path, start_line: 1, end_line: 1,
        annotation_level: "notice", title: `chunk-${String(first + index).padStart(4, "0")}`, message,
      }));
      for (let start = 0; start < annotations.length; start += 50) {
        await appendAnnotations(api, check, manifest, annotations.slice(0, start), annotations.slice(start, start + 50), wait);
      }
      first += group.length;
    }
    const received = [];
    for (const [partIndex, group] of groups.entries()) {
      const partRows = await readAnnotationsUntilComplete(api, created[partIndex].id, group.length, wait);
      received.push(...partRows);
    }
    received.sort((a, b) => a.title.localeCompare(b.title));
    for (const [index, row] of received.entries()) {
      assert.equal(row.title, `chunk-${String(index + 1).padStart(4, "0")}`, "Duplicate or missing annotation chunk");
      assert.equal(row.message, chunks[index], "Annotation chunk changed on API read-back");
    }
    const restored = Buffer.from(received.map(row => row.message).join(""), "base64");
    assert.equal(restored.length, bytes.length);
    assert.equal(digest(restored), manifest.sha256, "API read-back must be lossless");
    // A successful root always points at already-completed, verified parts.
    for (const check of [...created.slice(1), created[0]]) {
      await api(`/${check.id}`, "PATCH", { status: "completed", conclusion: "success" });
    }
    return { manifest, checks: created };
  } catch (error) {
    const failure = { transportError: String(error), sourceRevision: revision,
      sourcePhase: summary.failedPhase ?? summary.phase, sourceFailures: summary.failures };
    const full = JSON.stringify(failure, null, 2);
    const text = full.length <= 60000 ? full : JSON.stringify({ transportError: String(error),
      sourceRevision: revision, sourcePhase: summary.failedPhase ?? summary.phase,
      sourceFailureCount: summary.failures.length, note: "Full source diagnostics exceed check text limit; original artifact retained." });
    for (const check of created) {
      try {
        await api(`/${check.id}`, "PATCH", { status: "completed", conclusion: "failure",
          output: { title: check.name, summary: JSON.stringify(manifest), text } });
      } catch { /* Preserve the original transport error even if failure reporting also fails. */ }
    }
    throw error;
  }
}
