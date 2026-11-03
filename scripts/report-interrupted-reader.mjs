// The Actions log/artifact store can be unavailable to a reviewer. Preserve a
// bounded, escaped diagnostic in the check when the browser step fails. This
// never changes or substitutes for the failing audit.
import { existsSync, readFileSync } from "node:fs";
import { workflowError } from "./lib/audit-report.mjs";

const engines = ["chromium", "firefox", "webkit"];
const paths = [
  // Report reading failures first: Actions limits annotations per step, and
  // older reader/mobile logs must not crowd out the test that just failed.
  ...engines.flatMap(engine => [
    `browser-audit/reading-${engine}/results.json`,
    `/tmp/dmr-reading-${engine}.log`,
  ]),
  "/tmp/dmr-pdf-inspection.log",
  ...engines.flatMap(engine => [
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
      body = JSON.stringify({ revision: report.revision, browser: report.browser, completed: report.completed, inProgress: report.inProgress,
        checks: report.results?.length, recent: report.results?.slice(-3), failures: report.failures }, null, 2);
    } catch { /* keep the incomplete bytes as diagnostic evidence */ }
  }
  // Keep both the report's identity/first failure and its tail when a long
  // network dump or stack trace exceeds the annotation budget.
  const excerpt = body.length <= 8000 ? body : `${body.slice(0, 3900)}\n… diagnostic truncated …\n${body.slice(-3900)}`;
  console.log(workflowError(`Interrupted audit diagnostic: ${path} (bounded to 8000 characters)\n${excerpt}`));
}
if (!found) console.log(workflowError("Browser audit failed before any audit or server log was available."));
