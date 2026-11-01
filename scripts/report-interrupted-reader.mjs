// The Actions log/artifact store can be unavailable to a reviewer. Preserve a
// bounded, escaped diagnostic in the check when the browser step fails. This
// never changes or substitutes for the failing audit.
import { existsSync, readFileSync } from "node:fs";
import { workflowError } from "./lib/audit-report.mjs";

const paths = [
  ...["chromium", "firefox", "webkit"].flatMap(engine => [
    `/tmp/dmr-reader-${engine}.log`,
    `browser-audit/reader-${engine}/results.json`,
    `/tmp/dmr-mobile-${engine}.log`,
    `browser-audit/mobile-${engine}/summary.json`,
  ]),
  "/tmp/dmr-browser-audit.log",
  "/tmp/dmr-axe-audit.log",
  "/tmp/deep-movie-review-browser-next.log",
];
let found = 0;
for (const path of paths) {
  if (!existsSync(path)) continue;
  found++;
  let body = readFileSync(path, "utf8");
  if (path.endsWith(".json")) {
    try {
      const report = JSON.parse(body);
      body = JSON.stringify({ browser: report.browser, completed: report.completed, inProgress: report.inProgress,
        checks: report.results?.length, recent: report.results?.slice(-3), failures: report.failures }, null, 2);
    } catch { /* keep the incomplete bytes as diagnostic evidence */ }
  }
  console.log(workflowError(`Interrupted audit diagnostic: ${path} (last 8000 characters)\n${body.slice(-8000)}`));
}
if (!found) console.log(workflowError("Browser audit failed before any audit or server log was available."));
