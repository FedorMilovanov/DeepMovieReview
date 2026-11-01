// Runner workflow commands truncate annotation messages at 4096 characters.
// Use bounded Checks API chunks, multipart receipts and read-back verification.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { planEvidence, publishEvidence } from "./lib/evidence-publisher.mjs";
import { workflowError } from "./lib/audit-report.mjs";

const directory = process.argv[2] ?? "a11y-report";
const label = process.argv[3] ?? "current";

async function main() {
  assert.match(label, /^[a-z-]+$/);
  const summary = JSON.parse(readFileSync(`${directory}/summary.json`, "utf8"));
  assert.ok(Array.isArray(summary.results) && Array.isArray(summary.failures), "Evidence summary must retain results and failures");
  const scans = summary.results.map(scan => {
    const result = JSON.parse(readFileSync(`${directory}/${scan.file}`, "utf8"));
    return { scan, violations: result.violations, incomplete: result.incomplete,
      ...(result.actions ? { assistiveEvidence: result } : {}) };
  });
  // Include original mobile article PNGs, not regenerated images or a text-only substitute.
  const screenshots = summary.results.filter(scan => scan.state === "page" && scan.width === 390 && scan.route.includes("/article?")).map(scan => {
    const file = scan.file.replace(/-page\.json$/, ".png");
    const image = readFileSync(`${directory}/${file}`);
    return { browser: scan.browser, file, sha256: createHash("sha256").update(image).digest("hex"), data: image.toString("base64") };
  });
  const bytes = gzipSync(Buffer.from(JSON.stringify({ summary, scans, screenshots })));
  if (process.env.GITHUB_ACTIONS !== "true") {
    const { manifest, chunks, groups } = planEvidence(bytes, summary.revision);
    console.log(JSON.stringify({ manifest, chunks, partSizes: groups.map(group => group.length) }));
    return;
  }
  assert.ok(process.env.GH_TOKEN, "Checks write token required only for publication step");
  const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const root = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/check-runs`;
  async function api(path, method = "GET", body) {
    const response = await fetch(root + path, { method, headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json",
      "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28",
    }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const text = await response.text();
    assert.ok(response.ok, `Checks API ${method}: HTTP ${response.status}; response excerpt (${text.length} chars): ${text.slice(0, 4000)}`);
    return JSON.parse(text);
  }
  const result = await publishEvidence({ bytes, revision: summary.revision, head, label, summary, api });
  console.log(`${label}: verified ${result.manifest.chunks} chunks in ${result.checks.length} part(s), ${bytes.length} bytes, SHA ${summary.revision}`);
}

try { await main(); }
catch (error) {
  const message = `Evidence transport (${label}): ${error.stack ?? error}`;
  console.error(process.env.GITHUB_ACTIONS === "true" ? workflowError(message) : message);
  process.exitCode = 1;
}
