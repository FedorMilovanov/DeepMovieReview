import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const buildDir = ".test-build";
// npm's "tsc" shim is provided by the explicit @typescript/native devDependency.
// Launch its JS entrypoint through Node so the test runner works without .cmd
// shell wrappers on Windows and uses the same compiler on every platform.
const tsc = resolve("node_modules", "@typescript", "native", "bin", "tsc");

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
