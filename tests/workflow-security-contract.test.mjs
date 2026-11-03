import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflow = readFileSync(resolve(root, ".github/workflows/secret-scan.yml"), "utf8");

test("secret scanning declares only read-only repository permissions", () => {
  const match = workflow.match(/^permissions:\n((?:  [^\n]*\n)+)/m);
  assert.ok(match, "top-level permissions block must exist");
  assert.deepEqual(match[1].trim().split("\n").map(line => line.trim()), ["contents: read"]);
  assert.doesNotMatch(workflow, /write-all|security-events:\s*write|contents:\s*write/);
});

test("every external action in secret scanning is pinned to a full SHA and version", () => {
  const lines = workflow.split(/\r?\n/).filter(line => /^\s+uses:\s*/.test(line));
  assert.ok(lines.length >= 2, "expected checkout and Gitleaks actions");
  for (const line of lines) {
    assert.match(line, /^\s+uses:\s+[^@\s]+@[0-9a-f]{40}\s+#\s+v\d+\.\d+\.\d+\s*$/, line);
  }
});

test("the workflow scans full reachable history on main changes and scheduled runs", () => {
  assert.match(workflow, /^  push:\n    branches: \[main\]/m);
  assert.match(workflow, /^  pull_request:\n    branches: \[main\]/m);
  assert.match(workflow, /^  schedule:/m);
  assert.match(workflow, /^  workflow_dispatch:/m);
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /--all --full-history --sparse/);
  assert.match(workflow, /--redact/);
});

test("the scan does not publish findings as workflow artifacts or PR comments", () => {
  assert.match(workflow, /GITLEAKS_ENABLE_COMMENTS: "false"/);
  assert.match(workflow, /GITLEAKS_ENABLE_UPLOAD_ARTIFACT: "false"/);
});
