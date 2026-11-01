import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EVIDENCE_CHUNK_SIZE, EVIDENCE_MAX_PARTS, EVIDENCE_PART_CHUNKS } from "./evidence-transfer.mjs";

const digest = buffer => createHash("sha256").update(buffer).digest("hex");

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
export async function publishEvidence({ bytes, revision, head, label, summary, api }) {
  assert.match(head, /^[a-f0-9]{40}$/);
  assert.match(label, /^[a-z-]+$/);
  const { manifest, chunks, groups } = planEvidence(bytes, revision);
  const title = `Accessibility evidence (${label})`;
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
      for (let start = 0; start < group.length; start += 50) {
        await api(`/${check.id}`, "PATCH", { output: {
          title: check.name, summary: JSON.stringify(manifest), annotations: group.slice(start, start + 50).map((message, index) => ({
            path: "docs/57-ACCESSIBILITY-CHECKS.md", start_line: 1, end_line: 1,
            annotation_level: "notice", title: `chunk-${String(first + start + index).padStart(4, "0")}`, message,
          })),
        } });
      }
      first += group.length;
    }
    const received = [];
    for (const [partIndex, group] of groups.entries()) {
      const partRows = [];
      for (let page = 1; ; page++) {
        const rows = await api(`/${created[partIndex].id}/annotations?per_page=100&page=${page}`);
        assert.ok(Array.isArray(rows), "Invalid annotation response");
        partRows.push(...rows);
        assert.ok(partRows.length <= group.length, "Extra annotation chunks");
        if (rows.length < 100) break;
      }
      assert.equal(partRows.length, group.length, "Missing annotation chunks");
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
