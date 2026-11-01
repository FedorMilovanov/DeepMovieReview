// Optional, bounded historical diagnostics only; never a verdict on the current head.
import { execFileSync } from "node:child_process";
import { appShellFailureExcerpt, iosTransportErrorExcerpt } from "./lib/ios-transport-history.mjs";

const escape = text => String(text).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
const notice = text => console.log(`::notice title=Historical iOS transport::${escape(text)}`);
const gh = args => execFileSync("gh", args, { encoding: "utf8", timeout: 60000, maxBuffer: 24 * 1024 * 1024 });
try {
  if (!process.env.GITHUB_HEAD_REF) throw new Error("No pull request branch");
  const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const runs = JSON.parse(gh(["run", "list", "--workflow", "CI", "--branch", process.env.GITHUB_HEAD_REF,
    "--status", "completed", "--limit", "5", "--json", "databaseId,headSha,url"]));
  let recovered = false, appShellReviewed = false;
  for (const run of runs) {
    if (run.headSha === head) continue;
    const details = JSON.parse(gh(["run", "view", String(run.databaseId), "--json", "jobs"]));
    const app = details.jobs.find(item => item.name === "app-shell");
    if (!appShellReviewed && app?.conclusion === "success" && process.env.GITHUB_REPOSITORY) {
      appShellReviewed = true;
      try {
        const annotations = JSON.parse(gh(["api", `repos/${process.env.GITHUB_REPOSITORY}/check-runs/${app.databaseId}/annotations?per_page=100`]));
        if (annotations.some(item => item.annotation_level === "failure")) {
          const excerpt = appShellFailureExcerpt(gh(["run", "view", String(run.databaseId), "--job", String(app.databaseId), "--log"]));
          notice(`Prior app-shell SHA ${run.headSha}; run ${run.url}; job succeeded but carried a failure annotation. ${excerpt || "No bounded step error recovered; cause remains unknown."}`);
        }
      } catch { notice(`Prior app-shell SHA ${run.headSha}: annotation diagnostics unavailable; no cause claimed.`); }
    }
    const job = details.jobs.find(item => item.name === "Native iOS Safari");
    const native = job?.steps.find(step => step.name === "Native iOS Safari on installed iPhone Simulator");
    const publication = job?.steps.find(step => step.name === "Publish native iOS Safari evidence");
    if (native?.conclusion !== "success" || publication?.conclusion !== "failure") continue;
    const excerpt = iosTransportErrorExcerpt(gh(["run", "view", String(run.databaseId), "--job", String(job.databaseId), "--log"]));
    notice(`Prior SHA ${run.headSha}; run ${run.url}; native step passed, publication step failed. ${excerpt || "No bounded error line recovered; cause remains unknown."}`);
    recovered = true;
    break;
  }
  if (!recovered) notice("No matching completed prior iOS transport failure found; no historical result claimed.");
} catch {
  notice("Prior iOS transport diagnostics unavailable; current job remains independently gated and no historical cause is claimed.");
}
