// Publish the original SARIF through the same lossless Checks API bridge used
// for accessibility evidence. Transport success is not an analysis verdict.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { validateSwiftCodeQL } from "./check-swift-codeql.mjs";
import { publishEvidence } from "./lib/evidence-publisher.mjs";

export function packageSwiftEvidence(original, revision) {
  assert.ok(Buffer.isBuffer(original) && original.length > 0);
  assert.match(revision, /^[a-f0-9]{40}$/);
  const document = JSON.parse(original.toString("utf8"));
  const summary = { revision, results: [], failures: [] };
  try { summary.validation = validateSwiftCodeQL(document); }
  catch (error) { summary.failures.push(String(error)); }
  return { summary, scans: [{ name: "swift.sarif", sha256: createHash("sha256").update(original).digest("hex"),
    bytes: original.length, base64: original.toString("base64") }], screenshots: [] };
}

async function main() {
  assert.equal(process.env.GITHUB_ACTIONS, "true", "Checks publication is CI-only");
  assert.ok(process.env.GH_TOKEN && process.env.GITHUB_REPOSITORY, "Checks write token and repository required");
  const directory = process.argv[2];
  assert.ok(directory, "Usage: node scripts/publish-swift-codeql-evidence.mjs SARIF_DIRECTORY");
  const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const payload = packageSwiftEvidence(readFileSync(resolve(directory, "swift.sarif")), head);
  const bytes = gzipSync(Buffer.from(JSON.stringify(payload)));
  const root = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/check-runs`;
  async function api(path, method = "GET", body) {
    const response = await fetch(root + path, { method, headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json",
      "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28",
    }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(`Checks API ${method}: HTTP ${response.status}; response excerpt (${text.length} chars): ${text.slice(0, 4000)}`);
      error.status = response.status;
      throw error;
    }
    return JSON.parse(text);
  }
  const result = await publishEvidence({ bytes, revision: head, head, label: "swift-codeql", kind: "security", summary: payload.summary, api });
  console.log(`Swift SARIF transport verified: ${result.manifest.chunks} chunks, ${bytes.length} bytes, SHA ${head}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
