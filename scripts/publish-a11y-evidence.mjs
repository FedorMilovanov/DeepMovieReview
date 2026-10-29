// Runner workflow commands truncate annotation messages at 4096 characters.
// Use the Checks API, bounded chunks, and read-back verification instead.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

const directory = process.argv[2] ?? "a11y-report";
const label = process.argv[3] ?? "current";
assert.match(label, /^[a-z-]+$/);
const summary = JSON.parse(readFileSync(`${directory}/summary.json`, "utf8"));
const scans = summary.results.map(scan => {
  const result = JSON.parse(readFileSync(`${directory}/${scan.file}`, "utf8"));
  return { scan, violations: result.violations, incomplete: result.incomplete };
});
// Include original mobile article PNGs, not regenerated images or a text-only substitute.
const screenshots = summary.results.filter(scan => scan.state === "page" && scan.width === 390 && scan.route.includes("/article?")).map(scan => {
  const file = scan.file.replace(/-page\.json$/, ".png");
  const image = readFileSync(`${directory}/${file}`);
  return { browser: scan.browser, file, sha256: createHash("sha256").update(image).digest("hex"), data: image.toString("base64") };
});
const bytes = gzipSync(Buffer.from(JSON.stringify({ summary, scans, screenshots })));
const encoded = bytes.toString("base64");
const chunks = encoded.match(/.{1,4000}/g);
assert.ok(chunks.length <= 1000, "Evidence exceeds Checks API budget; never truncate diagnostics");
const digest = buffer => createHash("sha256").update(buffer).digest("hex");
const manifest = { revision: summary.revision, sha256: digest(bytes),
  encoding: "gzip+base64", chunks: chunks.length, bytes: bytes.length };
if (process.env.GITHUB_ACTIONS !== "true") {
  console.log(JSON.stringify({ manifest, chunks }));
} else {
  assert.ok(process.env.GH_TOKEN, "Checks write token required only for publication step");
  const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const root = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/check-runs`;
  async function api(url, method = "GET", body) {
    const response = await fetch(url, { method, headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json",
      "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28",
    }, ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.ok(response.ok, `Checks API ${method}: HTTP ${response.status}`);
    return response.json();
  }
  const title = `Accessibility evidence (${label})`;
  const check = await api(root, "POST", { name: title, head_sha: head, status: "in_progress" });
  try {
    for (let start = 0; start < chunks.length; start += 50) {
      await api(`${root}/${check.id}`, "PATCH", { output: {
        title, summary: JSON.stringify(manifest), annotations: chunks.slice(start, start + 50).map((message, index) => ({
          path: "docs/57-ACCESSIBILITY-CHECKS.md", start_line: 1, end_line: 1,
          annotation_level: "notice", title: `chunk-${String(start + index + 1).padStart(4, "0")}`, message,
        })),
      } });
    }
    const received = [];
    for (let page = 1; received.length < chunks.length; page++) {
      const rows = await api(`${root}/${check.id}/annotations?per_page=100&page=${page}`);
      assert.ok(rows.length, "Missing annotation chunks");
      received.push(...rows);
    }
    received.sort((a, b) => a.title.localeCompare(b.title));
    assert.equal(received.length, chunks.length);
    const restored = Buffer.from(received.map(row => row.message).join(""), "base64");
    assert.equal(restored.length, bytes.length);
    assert.equal(digest(restored), manifest.sha256, "API read-back must be lossless");
    await api(`${root}/${check.id}`, "PATCH", { status: "completed", conclusion: "success" });
    console.log(`${label}: verified ${chunks.length} chunks, ${bytes.length} bytes, SHA ${summary.revision}`);
  } catch (error) {
    await api(`${root}/${check.id}`, "PATCH", { status: "completed", conclusion: "failure" });
    throw error;
  }
}
