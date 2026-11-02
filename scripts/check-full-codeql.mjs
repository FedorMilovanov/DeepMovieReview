#!/usr/bin/env node
// Fail closed on incomplete/diff-only CodeQL or any finding, not just a green
// action. This complements (and does not upload over) GitHub's default setup.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const languages = {
  javascript: { prefix: "js", pack: "codeql/javascript-queries", source: path => /\.(?:[cm]?js|jsx|ts|tsx)$/.test(path) },
  python: { prefix: "py", pack: "codeql/python-queries", source: path => /\.py$/.test(path) },
  actions: { prefix: "actions", pack: "codeql/actions-queries", source: path => /^\.github\/(?:workflows\/.*\.(?:yml|yaml)|actions\/.+\/action\.(?:yml|yaml))$/.test(path) },
};

export function trackedCodeQLSources(language) {
  const config = languages[language];
  assert.ok(config, `Unsupported CodeQL language: ${language}`);
  const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(config.source).sort();
  assert.ok(files.length, `No tracked ${language} sources`);
  return files;
}

export function validateFullCodeQL(document, language, expectedSources = trackedCodeQLSources(language)) {
  const config = languages[language];
  assert.ok(config, `Unsupported CodeQL language: ${language}`);
  assert.equal(document.version, "2.1.0", "Expected SARIF 2.1.0");
  assert.ok(Array.isArray(document.runs) && document.runs.length === 1, "Expected one CodeQL run");
  const run = document.runs[0];
  assert.match(run.tool?.driver?.name ?? "", /codeql/i, "Expected CodeQL");
  const extensions = run.tool?.extensions ?? [];
  assert.ok(!run.properties?.incrementalMode && !extensions.some(item => item.name === "codeql-action/pr-diff-range"),
    "Scan must be full, not restricted to the PR diff or an overlay");
  assert.ok(run.properties?.codeqlConfigSummary?.queries?.some(item => item.type === "builtinSuite" && item.uses === "security-extended"),
    "Expected the security-extended query suite");
  const packs = extensions.filter(item => item.name === config.pack);
  assert.equal(packs.length, 1, `Expected exactly one ${config.pack} pack`);
  const rules = (packs[0].rules ?? []).filter(rule => rule.id?.startsWith(`${config.prefix}/`) && rule.properties?.tags?.includes("security"));
  assert.ok(rules.length, "Security rules must actually run");
  assert.ok(Array.isArray(run.invocations) && run.invocations.length && run.invocations.every(item => item.executionSuccessful === true),
    "CodeQL invocation must complete successfully");
  const notifications = run.invocations.flatMap(item => [...(item.toolExecutionNotifications ?? []), ...(item.toolConfigurationNotifications ?? [])]);
  const bad = notifications.filter(item => ["warning", "error"].includes(item.level) || /(?:extraction-errors|extraction-warnings)$/.test(item.descriptor?.id ?? ""));
  assert.deepEqual(bad, [], `CodeQL reported diagnostics: ${JSON.stringify(bad)}`);
  assert.ok(Array.isArray(expectedSources) && expectedSources.length, "Expected tracked source list is empty");
  const extracted = new Set();
  for (const item of notifications.filter(note => note.descriptor?.id === `${config.prefix}/diagnostics/successfully-extracted-files`)) {
    for (const location of item.locations ?? []) {
      const artifact = location.physicalLocation?.artifactLocation;
      if (artifact?.uriBaseId !== "%SRCROOT%" || typeof artifact.uri !== "string") continue;
      try { extracted.add(decodeURIComponent(artifact.uri).replace(/^\.\//, "")); } catch { /* malformed URI is not evidence */ }
    }
  }
  assert.deepEqual(expectedSources.filter(path => !extracted.has(path)), [], "Every tracked source must be extracted");
  assert.ok(Array.isArray(run.results), "CodeQL must report an explicit result list");
  assert.equal(run.results.length, 0, `CodeQL reported findings: ${run.results.map(result => result.ruleId ?? "unknown rule").join(", ")}`);
  return { language, rules: rules.length, extracted: expectedSources.length, findings: 0, problematicNotifications: 0 };
}

export function readSingleSarif(directory) {
  const names = readdirSync(directory).filter(name => name.endsWith(".sarif"));
  assert.equal(names.length, 1, `Expected one SARIF, found: ${names.join(", ")}`);
  return { name: names[0], original: readFileSync(resolve(directory, names[0])) };
}

function main() {
  const [directory, language] = process.argv.slice(2);
  assert.ok(directory && language, "Usage: node scripts/check-full-codeql.mjs SARIF_DIRECTORY LANGUAGE");
  const { original } = readSingleSarif(directory);
  console.log(JSON.stringify(validateFullCodeQL(JSON.parse(original.toString("utf8")), language), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exitCode = 1; }
}
