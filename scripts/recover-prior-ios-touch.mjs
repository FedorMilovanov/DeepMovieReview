// Optional historical forensics: inspect the most recent failed native job
// among a bounded set of prior CI runs. This never changes a current verdict.
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { cancelledTouchWindow, collectTouchDiagnostics } from "./lib/ios-touch-diagnostics.mjs";

const exec = promisify(execFile);
const gh = async args => (await exec("gh", args, { timeout: 180000, maxBuffer: 8 * 1024 * 1024 })).stdout;
const escape = text => String(text).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
const notice = text => console.log(`::notice title=Prior iOS touch diagnostics (not current evidence)::${escape(text)}`);
let temporary, current, message, stage = "context";
try {
  if (!process.env.GITHUB_HEAD_REF || !process.env.GITHUB_REPOSITORY) throw new Error("No PR branch/repository context");
  current = (await exec("git", ["rev-parse", "HEAD"])).stdout.trim();
  if (!/^[0-9a-f]{40}$/.test(current)) throw new Error("Invalid checkout revision");
  stage = "previous CI lookup";
  const runs = JSON.parse(await gh(["run", "list", "--workflow", "CI", "--branch", process.env.GITHUB_HEAD_REF,
    "--limit", "6", "--json", "databaseId,headSha,status,url"]));
  // At most two bounded downloads: a more recent failure may have no
  // cancellation (e.g. a wrong AX marker), while an older one does.
  let fallback, downloads = 0, totalBytes = 0;
  for (const prior of runs.filter(run => run.status === "completed" && run.headSha !== current)) {
    const job = JSON.parse(await gh(["run", "view", String(prior.databaseId), "--json", "jobs"]))
      .jobs.find(item => item.name === "Native iOS Safari");
    if (job?.conclusion !== "failure") continue;
    stage = "artifact lookup";
    const artifacts = JSON.parse(await gh(["api", `repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${prior.databaseId}/artifacts`])).artifacts;
    const matches = artifacts.filter(item => !item.expired && item.name === `actual-ios-${prior.headSha}` &&
      Number.isSafeInteger(item.size_in_bytes) && item.size_in_bytes > 0 && item.size_in_bytes <= 250 * 1024 * 1024);
    if (matches.length !== 1) continue;
    if (++downloads > 2 || (totalBytes += matches[0].size_in_bytes) > 500 * 1024 * 1024) break;
    temporary = mkdtempSync(join(tmpdir(), "dmr-prior-ios-"));
    stage = "artifact download";
    await gh(["run", "download", String(prior.databaseId), "--name", matches[0].name, "--dir", temporary]);
    stage = "artifact validation";
    const directory = join(temporary, "ios-gesture"), summaryPath = join(directory, "summary.json");
    const bundle = join(directory, "native-gesture.xcresult");
    if (!existsSync(summaryPath) || !existsSync(bundle)) throw new Error("Prior artifact has no complete XCTest bundle and summary");
    const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
    if (summary.revision !== prior.headSha || !summary.failures?.length) throw new Error("Prior artifact provenance/verdict mismatch");
    const provenance = `Prior SHA ${prior.headSha}; run ${prior.url}; artifact ${matches[0].id}.`;
    if (!cancelledTouchWindow(summary.events)) {
      fallback ??= `${provenance} ${JSON.stringify({ status: "no-observed-complete-cancellation-window" })}`;
      rmSync(temporary, { recursive: true, force: true }); temporary = undefined;
      continue;
    }
    stage = "XCTest diagnostic export";
    const diagnostic = await collectTouchDiagnostics({ bundle, udid: summary.device?.udid, events: summary.events });
    message = `${provenance} ${JSON.stringify(diagnostic)}`;
    break;
  }
  message ??= fallback ?? "No retained recent prior native cancellation found. No cause or current pass is inferred.";
} catch {
  // Do not echo child-process stderr: a failed download may contain a signed URL.
  message = `Historical forensic extraction unavailable at ${stage}. No cause or current pass is inferred.`;
} finally { if (temporary) rmSync(temporary, { recursive: true, force: true }); }
notice(message);
// The separate neutral check makes the bounded result readable while the long
// native job is still running. It is explicitly historical, never a gate/pass.
if (current && process.env.GITHUB_REPOSITORY) {
  try {
    await gh(["api", "--method", "POST", `repos/${process.env.GITHUB_REPOSITORY}/check-runs`,
      "-f", "name=Prior iOS forensic (historical only)", "-f", `head_sha=${current}`,
      "-f", "status=completed", "-f", "conclusion=neutral",
      "-f", "output[title]=Historical iOS diagnostic — not a current result",
      "-f", `output[summary]=${message}\n\nDiagnostic only. This does not change any native test verdict.`]);
  } catch { notice("Could not publish the optional historical diagnostic check."); }
}
