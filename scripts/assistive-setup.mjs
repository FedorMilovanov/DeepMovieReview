// Preserve setup failures over the API as well as logs/artifacts (log CDN may be blocked).
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { workflowError } from "./lib/audit-report.mjs";

mkdirSync("at-report", { recursive: true });
const commands = [
  { label: "locked-install", command: process.platform === "win32" ? "npm.cmd" : "npm", args: ["ci", "--no-audit", "--no-fund"], shell: process.platform === "win32" },
  ...[["setup", "--ci"], ["install"]].map(args => ({ label: args[0], command: process.execPath, args: ["node_modules/@guidepup/setup/bin/guidepup", ...args] })),
];
for (const { label, command, args, shell = false } of commands) {
  const result = spawnSync(command, args, {
    shell,
    encoding: "utf8", timeout: 600000, maxBuffer: 16 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.stack ?? ""}`;
  writeFileSync(`at-report/${label}.log`, output);
  console.log(output);
  if (result.status !== 0) {
    console.error(workflowError(`Actual AT ${label} failed (${result.status}): ${output.slice(-3500)}`));
    process.exit(result.status || 1);
  }
}
