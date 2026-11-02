// Keep the Swift security gate independent of the CodeQL upload/check conclusion:
// analysis tools can succeed while reporting findings or extraction errors.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const expectedSource = "scripts/ios-native-ui/Tests/NativeGestureTests.swift";

export function trackedSwiftSources() {
  const files = execFileSync("git", ["ls-files", "--", "*.swift"], { encoding: "utf8" }).split("\n").filter(Boolean).sort();
  assert.ok(files.includes(expectedSource), `Tracked native test source is missing: ${expectedSource}`);
  return files;
}

export function validateSwiftCodeQL(document, expectedSources = trackedSwiftSources()) {
  assert.equal(document.version, "2.1.0", "Expected SARIF 2.1.0");
  assert.ok(Array.isArray(document.runs) && document.runs.length === 1, "Expected one Swift CodeQL run");
  const run = document.runs[0];
  assert.match(run.tool?.driver?.name ?? "", /codeql/i, "Expected CodeQL, not another scanner");
  const extensions = run.tool?.extensions ?? [];
  assert.ok(!run.properties?.incrementalMode && !extensions.some(item => item.name === "codeql-action/pr-diff-range"),
    "Swift scan must be full, not restricted to the PR diff or an overlay");
  assert.ok(run.properties?.codeqlConfigSummary?.queries?.some(item => item.type === "builtinSuite" && item.uses === "security-extended"),
    "Expected the security-extended query suite");
  // Current CodeQL puts query-pack rules in tool.extensions, not driver.rules.
  const packs = extensions.filter(item => item.name === "codeql/swift-queries");
  assert.equal(packs.length, 1, "Expected exactly one Swift query pack");
  const rules = (packs[0].rules ?? []).filter(rule => rule.id?.startsWith("swift/") && rule.properties?.tags?.includes("security"));
  assert.ok(rules.length > 0, "CodeQL must actually run Swift security rules");
  assert.ok(Array.isArray(run.invocations) && run.invocations.length > 0 &&
    run.invocations.every(item => item.executionSuccessful === true), "CodeQL invocation must complete successfully");
  const notifications = run.invocations.flatMap(item => [
    ...(item.toolExecutionNotifications ?? []), ...(item.toolConfigurationNotifications ?? []),
  ]);
  const problematic = notifications.filter(item => item.level === "error" || item.level === "warning" ||
    item.descriptor?.id === "swift/diagnostics/extraction-errors");
  assert.deepEqual(problematic, [], `CodeQL reported Swift extraction/configuration errors or warnings: ${JSON.stringify(problematic)}`);
  // A successful build alone does not prove every tracked Swift file was
  // extracted. The diagnostic can include files with errors, rejected above.
  assert.ok(Array.isArray(expectedSources) && expectedSources.includes(expectedSource), "Expected tracked Swift source list is missing");
  const extracted = new Set();
  for (const item of notifications.filter(note => note.descriptor?.id === "swift/diagnostics/successfully-extracted-files")) {
    for (const location of item.locations ?? []) {
      const artifact = location.physicalLocation?.artifactLocation;
      if (artifact?.uriBaseId !== "%SRCROOT%" || typeof artifact.uri !== "string") continue;
      try { extracted.add(decodeURIComponent(artifact.uri).replace(/^\.\//, "")); } catch { /* malformed URI is not evidence */ }
    }
  }
  assert.deepEqual(expectedSources.filter(path => !extracted.has(path)), [], "Every tracked Swift source must be extracted");
  const metrics = run.properties?.metricResults ?? [];
  const metric = id => metrics.find(item => item.ruleId === id)?.value;
  assert.equal(metric("swift/diagnostics/unresolved-ast-nodes"), 0, "Swift must have no unresolved AST nodes");
  assert.ok(metric("swift/diagnostics/ast-nodes") > 0 && metric("swift/diagnostics/successfully-extracted-lines") > 0,
    "Swift extraction must have nonzero AST nodes and source lines");
  assert.ok(Array.isArray(run.results), "CodeQL must report an explicit result list");
  assert.deepEqual(run.results, [], `Swift CodeQL reported findings: ${JSON.stringify(run.results)}`);
  return { rules: rules.length, extracted: expectedSources, findings: 0, problematicNotifications: 0 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = process.argv[2];
  assert.ok(directory, "Usage: node scripts/check-swift-codeql.mjs SARIF_DIRECTORY");
  const files = readdirSync(directory).filter(name => name.endsWith(".sarif"));
  assert.deepEqual(files, ["swift.sarif"], "Expected the one original Swift SARIF file");
  const document = JSON.parse(readFileSync(resolve(directory, files[0]), "utf8"));
  console.log(JSON.stringify(validateSwiftCodeQL(document)));
}
