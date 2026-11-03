import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateFullCodeQL } from "../scripts/check-full-codeql.mjs";
import { packageFullCodeQLEvidence } from "../scripts/publish-full-codeql-evidence.mjs";

const config = {
  javascript: { prefix: "js", path: "src/app/page.tsx" },
  python: { prefix: "py", path: "scripts/recover-a11y-evidence.py" },
  actions: { prefix: "actions", path: ".github/workflows/ci.yml" },
};
function report(language) {
  const { prefix, path } = config[language];
  return { version: "2.1.0", runs: [{ tool: { driver: { name: "CodeQL", rules: [] }, extensions: [{
    name: `codeql/${language}-queries`, rules: [{ id: `${prefix}/example`, properties: { tags: ["security"] } }],
  }] }, properties: { codeqlConfigSummary: { queries: [{ type: "builtinSuite", uses: "security-extended" }] } },
  invocations: [{ executionSuccessful: true, toolExecutionNotifications: [{ level: "none",
    descriptor: { id: `${prefix}/diagnostics/successfully-extracted-files` },
    locations: [{ physicalLocation: { artifactLocation: { uriBaseId: "%SRCROOT%", uri: path } } }],
  }] }], results: [] }] };
}

test("full CodeQL keeps the database upload permission without enabling conflicting SARIF upload", () => {
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  const job = workflow.match(/^  full-codeql:\n([\s\S]*?)(?=^  [a-z][a-z0-9-]*:\n|$(?![\s\S]))/m)?.[1];
  assert.ok(job, "The full CodeQL job must exist");
  const permissions = job.match(/^    permissions:\n([\s\S]*?)(?=^    \S)/m)?.[1];
  assert.ok(permissions, "The job must declare scoped permissions");
  assert.match(permissions, /^      contents: read$/m);
  assert.match(permissions, /^      checks: write$/m);
  assert.match(permissions, /^      security-events: write$/m);
  const analyze = job.match(/- name: Analyze without conflicting with default setup\n([\s\S]*?)(?=^      - name:)/m)?.[1];
  assert.ok(analyze);
  assert.match(analyze, /^          upload: never$/m, "The supplemental SARIF must not conflict with default setup");
  assert.doesNotMatch(analyze, /^          upload-database: ["']?false["']?$/m, "The database upload must remain enabled");
  assert.match(job, /node scripts\/check-full-codeql\.mjs/);
  assert.match(job, /node scripts\/publish-full-codeql-evidence\.mjs/);
});

test("full CodeQL security gate rejects diff/overlay, missing coverage, diagnostics and findings", () => {
  for (const language of Object.keys(config)) {
    const clean = report(language), sources = [config[language].path];
    assert.deepEqual(validateFullCodeQL(clean, language, sources),
      { language, rules: 1, extracted: 1, findings: 0, problematicNotifications: 0 });
    const raw = Buffer.from(JSON.stringify(clean, null, 2) + "\n");
    const receipt = packageFullCodeQLEvidence(raw, "a".repeat(40), language, sources);
    assert.deepEqual(Buffer.from(receipt.scans[0].base64, "base64"), raw);
    assert.deepEqual(receipt.summary.failures, []);
    const changes = [
      data => { data.version = "1.0.0"; },
      data => { data.runs = []; },
      data => { data.runs[0].tool.driver.name = "other"; },
      data => { data.runs[0].tool.extensions[0].name = "other/queries"; },
      data => { data.runs[0].tool.extensions[0].rules[0].properties.tags = ["correctness"]; },
      data => { data.runs[0].properties.codeqlConfigSummary.queries[0].uses = "security-default"; },
      data => { data.runs[0].properties.incrementalMode = "diff-informed"; },
      data => { data.runs[0].properties.incrementalMode = "overlay"; },
      data => { data.runs[0].tool.extensions.push({ name: "codeql-action/pr-diff-range" }); },
      data => { data.runs[0].invocations = []; },
      data => { data.runs[0].invocations[0].executionSuccessful = false; },
      data => { data.runs[0].invocations[0].toolExecutionNotifications.push({ level: "warning" }); },
      data => { data.runs[0].invocations[0].toolConfigurationNotifications = [{ level: "error" }]; },
      data => { data.runs[0].invocations[0].toolExecutionNotifications.push({ level: "none", descriptor: { id: `${config[language].prefix}/diagnostics/extraction-errors` } }); },
      data => { data.runs[0].invocations[0].toolExecutionNotifications = []; },
      data => { data.runs[0].invocations[0].toolExecutionNotifications[0].locations[0].physicalLocation.artifactLocation.uri = "other"; },
      data => { delete data.runs[0].results; },
      data => { data.runs[0].results.push({ ruleId: `${config[language].prefix}/example` }); },
    ];
    for (const change of changes) {
      const changed = structuredClone(clean); change(changed);
      assert.throws(() => validateFullCodeQL(changed, language, sources));
    }
    const failed = structuredClone(clean); failed.runs[0].results.push({ ruleId: `${config[language].prefix}/example` });
    assert.match(packageFullCodeQLEvidence(Buffer.from(JSON.stringify(failed)), "a".repeat(40), language, sources).summary.failures[0], /reported findings/);
  }
  assert.throws(() => validateFullCodeQL(report("javascript"), "swift", ["file.swift"]));
});
