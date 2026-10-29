// Preserve setup failures over the API as well as logs/artifacts (log CDN may be blocked).
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { workflowError } from "./lib/audit-report.mjs";

mkdirSync("at-report", { recursive: true });
for (const args of [["setup", "--ci"], ["install"]]) {
  const result = spawnSync(process.execPath, ["node_modules/@guidepup/setup/bin/guidepup", ...args], {
    encoding: "utf8", timeout: 600000, maxBuffer: 16 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.stack ?? ""}`;
  writeFileSync(`at-report/${args[0]}.log`, output);
  console.log(output);
  if (result.status !== 0) {
    console.error(workflowError(`Actual AT ${args[0]} failed (${result.status}): ${output.slice(-3500)}`));
    process.exit(result.status || 1);
  }
}
