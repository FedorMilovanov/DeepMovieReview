import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

export const EVIDENCE_CHUNK_SIZE = 4000;
export const EVIDENCE_PART_CHUNKS = 1000;
export const EVIDENCE_MAX_PARTS = 8;
const MAX_COMPRESSED_BYTES = EVIDENCE_CHUNK_SIZE * EVIDENCE_PART_CHUNKS * EVIDENCE_MAX_PARTS * 3 / 4;

/** Check provenance and the complete, bounded multipart plan before fetching other checks. */
export function evidenceManifest(check, revision, checkHead = revision) {
  for (const sha of [revision, checkHead]) assert.match(sha, /^[a-f0-9]{40}$/);
  assert.equal(check.app?.slug, "github-actions", "Unexpected publisher app");
  assert.match(check.name, /^Accessibility evidence \([a-z-]+\)$/);
  assert.equal(check.head_sha, checkHead, "Unexpected check head");
  assert.equal(check.status, "completed", "Evidence publication is not complete");
  assert.equal(check.conclusion, "success", "Evidence publication did not succeed");
  const manifest = JSON.parse(check.output.summary);
  assert.equal(manifest.revision, revision, "Unexpected evidence revision");
  assert.equal(manifest.encoding, "gzip+base64");
  const multipart = manifest.parts !== undefined;
  const maximumChunks = EVIDENCE_PART_CHUNKS * (multipart ? EVIDENCE_MAX_PARTS : 1);
  assert.ok(Number.isInteger(manifest.chunks) && manifest.chunks > 0 && manifest.chunks <= maximumChunks, "Invalid chunk count");
  assert.ok(Number.isInteger(manifest.bytes) && manifest.bytes > 0 && manifest.bytes <= (multipart ? MAX_COMPRESSED_BYTES : 3000000), "Invalid compressed size");
  assert.match(manifest.sha256, /^[a-f0-9]{64}$/);
  if (multipart) {
    assert.ok(Array.isArray(manifest.parts) && manifest.parts.length >= 2 && manifest.parts.length <= EVIDENCE_MAX_PARTS, "Invalid evidence parts");
    const ids = new Set();
    let next = 1;
    for (const part of manifest.parts) {
      assert.ok(Number.isSafeInteger(part.id) && part.id > 0 && !ids.has(part.id), "Invalid or duplicate part ID");
      assert.equal(part.first, next, "Evidence parts must be contiguous and ordered");
      assert.ok(Number.isInteger(part.chunks) && part.chunks > 0 && part.chunks <= EVIDENCE_PART_CHUNKS, "Invalid part chunk count");
      next += part.chunks;
      ids.add(part.id);
    }
    assert.equal(manifest.parts[0].id, check.id, "Root check does not match first part");
    assert.equal(next - 1, manifest.chunks, "Part counts do not match the manifest");
  }
  return manifest;
}

// Transport integrity is not an accessibility verdict. Keep original failures.
export function decodeEvidence(check, rows, revision, checkHead = revision, continuation = []) {
  const manifest = evidenceManifest(check, revision, checkHead);
  const parts = manifest.parts ?? [{ id: check.id, first: 1, chunks: manifest.chunks }];
  assert.equal(continuation.length, parts.length - 1, "Missing or extra evidence parts");
  const allRows = [rows];
  for (const [index, item] of continuation.entries()) {
    const part = parts[index + 1], child = item.check;
    assert.equal(child.id, part.id, "Unexpected evidence part ID");
    assert.equal(child.app?.slug, "github-actions", "Unexpected evidence part publisher");
    assert.equal(child.name, check.name.replace(/\)$/, `-part-${index + 2})`), "Unexpected evidence part name");
    assert.equal(child.head_sha, checkHead, "Unexpected evidence part head");
    assert.equal(child.status, "completed", "Evidence part publication is not complete");
    assert.equal(child.conclusion, "success", "Evidence part publication did not succeed");
    assert.deepEqual(JSON.parse(child.output.summary), manifest, "Evidence part manifest mismatch");
    allRows.push(item.rows);
  }
  const chunks = [];
  for (const [partIndex, partRows] of allRows.entries()) {
    const part = parts[partIndex];
    assert.equal(partRows.length, part.chunks, "Missing or extra chunks");
    const ordered = partRows.toSorted((a, b) => a.title.localeCompare(b.title));
    for (const [index, row] of ordered.entries()) {
      assert.equal(row.title, `chunk-${String(part.first + index).padStart(4, "0")}`, "Duplicate or missing chunk");
      assert.ok(typeof row.message === "string" && row.message.length > 0 && row.message.length <= EVIDENCE_CHUNK_SIZE);
      chunks.push(row.message);
    }
  }
  const encoded = chunks.join("");
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
