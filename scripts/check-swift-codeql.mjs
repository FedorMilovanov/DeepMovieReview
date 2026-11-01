// Keep the Swift security gate independent of the CodeQL upload/check conclusion:
// analysis tools can succeed while reporting findings or extraction errors.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function validateSwiftCodeQL(document) {
  assert.equal(document.version, "2.1.0", "Expected SARIF 2.1.0");
  assert.ok(Array.isArray(document.runs) && document.runs.length === 1, "Expected one Swift CodeQL run");
  const run = document.runs[0];
  assert.match(run.tool?.driver?.name ?? "", /codeql/i, "Expected CodeQL, not another scanner");
  assert.ok(Array.isArray(run.tool.driver.rules) && run.tool.driver.rules.length > 0, "CodeQL must actually run security rules");
  assert.ok(Array.isArray(run.invocations) && run.invocations.length > 0 &&
    run.invocations.every(item => item.executionSuccessful === true), "CodeQL invocation must complete successfully");
  const notifications = run.invocations.flatMap(item => [
    ...(item.toolExecutionNotifications ?? []), ...(item.toolConfigurationNotifications ?? []),
  ]);
  const problematic = notifications.filter(item => item.level === "error" || item.level === "warning");
  assert.deepEqual(problematic, [], `CodeQL reported Swift extraction/configuration errors or warnings: ${JSON.stringify(problematic)}`);
  assert.ok(Array.isArray(run.results), "CodeQL must report an explicit result list");
  assert.deepEqual(run.results, [], `Swift CodeQL reported findings: ${JSON.stringify(run.results)}`);
  return { rules: run.tool.driver.rules.length, findings: 0, problematicNotifications: 0 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = process.argv[2];
  assert.ok(directory, "Usage: node scripts/check-swift-codeql.mjs SARIF_DIRECTORY");
  const files = readdirSync(directory).filter(name => name.endsWith(".sarif"));
  assert.deepEqual(files, ["swift.sarif"], "Expected the one original Swift SARIF file");
  const document = JSON.parse(readFileSync(resolve(directory, files[0]), "utf8"));
  console.log(JSON.stringify(validateSwiftCodeQL(document)));
}
