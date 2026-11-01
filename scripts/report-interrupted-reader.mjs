// The Actions log/artifact store can be unavailable to a reviewer. Preserve a
// bounded, escaped tail in the check itself when the browser step fails. This
// is diagnostic only: it never changes or substitutes for the failing audit.
import { existsSync, readFileSync } from "node:fs";
import { workflowError } from "./lib/audit-report.mjs";

const paths = [
  ...["chromium", "firefox", "webkit"].flatMap(engine => [
    `/tmp/dmr-reader-${engine}.log`,
    `browser-audit/reader-${engine}/results.json`,
  ]),
  "/tmp/deep-movie-review-browser-next.log",
];
let found = 0;
for (const path of paths) {
  if (!existsSync(path)) continue;
  found++;
  const tail = readFileSync(path, "utf8").slice(-8000);
  console.log(workflowError(`Interrupted audit diagnostic: ${path} (last 8000 characters)\n${tail}`));
}
if (!found) console.log(workflowError("Browser audit failed before any reader or server log was available."));
