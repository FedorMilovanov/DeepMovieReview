import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const buildDir = ".test-build";
const tsc = require.resolve("typescript/bin/tsc");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

rmSync(buildDir, { recursive: true, force: true });

let status = 1;
try {
  const compileStatus = run(process.execPath, [tsc, "-p", "tsconfig.tests.json"]);
  if (compileStatus !== 0) {
    status = compileStatus;
  } else {
    status = run(process.execPath, ["--test", buildDir + "/tests/regression.test.js"]);
  }
} finally {
  rmSync(buildDir, { recursive: true, force: true });
}

process.exitCode = status;
