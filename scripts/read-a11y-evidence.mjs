// Read-only bridge for environments that cannot reach Actions artifact storage.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { decodeEvidence, evidenceManifest, EVIDENCE_PART_CHUNKS } from "./lib/evidence-transfer.mjs";

const [id, output, revision, checkHead = revision] = process.argv.slice(2);
assert.ok(id && output && revision, "Usage: node scripts/read-a11y-evidence.mjs CHECK_ID OUTPUT EXPECTED_REVISION [EXPECTED_CHECK_HEAD]");
assert.match(id, /^\d+$/);
const api = path => JSON.parse(execFileSync("gh", ["api", path], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));
const repository = JSON.parse(execFileSync("gh", ["repo", "view", "--json", "nameWithOwner"], { encoding: "utf8" })).nameWithOwner;
const root = `repos/${repository}/check-runs`;
const check = api(`${root}/${id}`);
// Validate the primary check and bound its part list before following any IDs.
const manifest = evidenceManifest(check, revision, checkHead);
function annotations(checkId) {
  const rows = [];
  for (let page = 1; page <= EVIDENCE_PART_CHUNKS / 100 + 1; page++) {
    const batch = api(`${root}/${checkId}/annotations?per_page=100&page=${page}`);
    assert.ok(Array.isArray(batch));
    rows.push(...batch);
    assert.ok(rows.length <= EVIDENCE_PART_CHUNKS, "Evidence part exceeds publication budget");
    if (batch.length < 100) break;
  }
  return rows;
}
const rows = annotations(id);
const continuation = (manifest.parts ?? []).slice(1).map(part => ({
  check: api(`${root}/${part.id}`), rows: annotations(part.id),
}));
const { bytes, payload } = decodeEvidence(check, rows, revision, checkHead, continuation);
mkdirSync(dirname(output), { recursive: true });
// Nothing is written until provenance, every part, chunks, size, hash and gzip are verified.
writeFileSync(output, bytes, { flag: "wx" });
console.log(JSON.stringify({ repository, checkId: id, checkHead: check.head_sha,
  transportVerified: true, sourceUrl: check.details_url, manifest, output, summary: payload.summary }, null, 2));
