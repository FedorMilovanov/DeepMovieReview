import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
const buildDir = ".test-build";
const tsc = process.platform === "win32" ? "tsc.cmd" : "tsc";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

rmSync(buildDir, { recursive: true, force: true });

let status = 1;
try {
  const compileStatus = run(tsc, ["-p", "tsconfig.tests.json"]);
  if (compileStatus !== 0) {
    status = compileStatus;
  } else {
    status = run(process.execPath, ["--test", buildDir + "/tests/regression.test.js"]);
  }
} finally {
  rmSync(buildDir, { recursive: true, force: true });
}

process.exitCode = status;
