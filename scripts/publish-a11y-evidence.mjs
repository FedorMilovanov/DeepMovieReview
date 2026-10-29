// Transport actual CI diagnostics through the checks API when artifact storage is blocked.
// Not a replacement for raw JSON/screenshots; chunks are gzip+base64, SHA-256 verified.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { workflowError } from "./lib/audit-report.mjs";

const directory = process.argv[2] ?? "a11y-report";
const label = process.argv[3] ?? "current";
assert.match(label, /^[a-z-]+$/);
const summary = JSON.parse(readFileSync(`${directory}/summary.json`, "utf8"));
const scans = summary.results.map(scan => {
  const result = JSON.parse(readFileSync(`${directory}/${scan.file}`, "utf8"));
  return { scan, violations: result.violations, incomplete: result.incomplete };
});
const bytes = gzipSync(Buffer.from(JSON.stringify({ summary, scans })));
const encoded = bytes.toString("base64");
const chunks = encoded.match(/.{1,60000}/g);
assert.ok(chunks.length <= 9, "Evidence exceeds annotation budget; do not truncate diagnostics");
const manifest = { revision: summary.revision, sha256: createHash("sha256").update(bytes).digest("hex"),
  encoding: "gzip+base64", chunks: chunks.length, bytes: bytes.length };
function notice(title, message) {
  // Reuse tested escaping; change only the workflow command and add a fixed safe title.
  console.log(workflowError(message).replace("::error title=Browser audit::", `::notice title=${label}-${title}::`));
}
notice("a11y-evidence-manifest", JSON.stringify(manifest));
chunks.forEach((chunk, index) => notice(`a11y-evidence-${index + 1}`, chunk));
