import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

// Transport integrity is not an accessibility verdict. Keep original failures.
export function decodeEvidence(check, rows, revision, checkHead = revision) {
  for (const sha of [revision, checkHead]) assert.match(sha, /^[a-f0-9]{40}$/);
  assert.equal(check.app?.slug, "github-actions", "Unexpected publisher app");
  assert.match(check.name, /^Accessibility evidence \([a-z-]+\)$/);
  assert.equal(check.head_sha, checkHead, "Unexpected check head");
  assert.equal(check.status, "completed", "Evidence publication is not complete");
  assert.equal(check.conclusion, "success", "Evidence publication did not succeed");
  const manifest = JSON.parse(check.output.summary);
  assert.equal(manifest.revision, revision, "Unexpected evidence revision");
  assert.equal(manifest.encoding, "gzip+base64");
  assert.ok(Number.isInteger(manifest.chunks) && manifest.chunks > 0 && manifest.chunks <= 1000);
  assert.ok(Number.isInteger(manifest.bytes) && manifest.bytes > 0 && manifest.bytes <= 3000000);
  assert.match(manifest.sha256, /^[a-f0-9]{64}$/);
  assert.equal(rows.length, manifest.chunks, "Missing or extra chunks");
  const chunks = rows.toSorted((a, b) => a.title.localeCompare(b.title));
  for (const [index, row] of chunks.entries()) {
    assert.equal(row.title, `chunk-${String(index + 1).padStart(4, "0")}`, "Duplicate or missing chunk");
    assert.ok(typeof row.message === "string" && row.message.length > 0 && row.message.length <= 4000);
  }
  const encoded = chunks.map(row => row.message).join("");
  const compressed = Buffer.from(encoded, "base64");
  assert.equal(compressed.toString("base64"), encoded, "Non-canonical or corrupt base64");
  assert.equal(compressed.length, manifest.bytes, "Compressed size mismatch");
  assert.equal(createHash("sha256").update(compressed).digest("hex"), manifest.sha256, "SHA256 mismatch");
  const bytes = gunzipSync(compressed, { maxOutputLength: 64 * 1024 * 1024 });
  const payload = JSON.parse(bytes.toString("utf8"));
  assert.equal(payload.summary.revision, revision, "Payload revision mismatch");
  assert.ok(Array.isArray(payload.scans) && Array.isArray(payload.summary.failures));
  return { bytes, payload, manifest };
}
