// Optional historical forensics: inspect the last completed prior CI run's
// failed native XCTest bundle. This never supplies or changes a current verdict.
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { collectTouchDiagnostics } from "./lib/ios-touch-diagnostics.mjs";

const exec = promisify(execFile);
const gh = async args => (await exec("gh", args, { timeout: 180000, maxBuffer: 8 * 1024 * 1024 })).stdout;
const escape = text => String(text).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
const notice = text => console.log(`::notice title=Prior iOS touch diagnostics (not current evidence)::${escape(text)}`);
let temporary, stage = "context";
try {
  if (!process.env.GITHUB_HEAD_REF || !process.env.GITHUB_REPOSITORY) throw new Error("No PR branch/repository context");
  const current = (await exec("git", ["rev-parse", "HEAD"])).stdout.trim();
  stage = "previous CI lookup";
  const runs = JSON.parse(await gh(["run", "list", "--workflow", "CI", "--branch", process.env.GITHUB_HEAD_REF,
    "--status", "completed", "--limit", "5", "--json", "databaseId,headSha,url"]));
  const prior = runs.find(run => run.headSha !== current);
  if (!prior) throw new Error("No completed prior run");
  const job = JSON.parse(await gh(["run", "view", String(prior.databaseId), "--json", "jobs"]))
    .jobs.find(item => item.name === "Native iOS Safari");
  if (job?.conclusion !== "failure") throw new Error("The immediately preceding native job did not fail");
  stage = "artifact lookup";
  const artifacts = JSON.parse(await gh(["api", `repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${prior.databaseId}/artifacts`])).artifacts;
  const matches = artifacts.filter(item => !item.expired && item.name === `actual-ios-${prior.headSha}` && item.size_in_bytes <= 250 * 1024 * 1024);
  if (matches.length !== 1) throw new Error("No unique bounded previous iOS artifact");
  temporary = mkdtempSync(join(tmpdir(), "dmr-prior-ios-"));
  stage = "artifact download";
  await gh(["run", "download", String(prior.databaseId), "--name", matches[0].name, "--dir", temporary]);
  stage = "artifact validation";
  const directory = join(temporary, "ios-gesture"), summaryPath = join(directory, "summary.json");
  const bundle = join(directory, "native-gesture.xcresult");
  if (!existsSync(summaryPath) || !existsSync(bundle)) throw new Error("Prior artifact has no complete XCTest bundle and summary");
  const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
  if (summary.revision !== prior.headSha || !summary.failures?.length) throw new Error("Prior artifact provenance/verdict mismatch");
  stage = "XCTest diagnostic export";
  const diagnostic = await collectTouchDiagnostics({ bundle, udid: summary.device?.udid, events: summary.events });
  notice(`Prior SHA ${prior.headSha}; run ${prior.url}; artifact ${matches[0].id}. ${JSON.stringify(diagnostic)}`);
} catch {
  // Do not echo child-process stderr: a failed download may contain a signed URL.
  notice(`Historical forensic extraction unavailable at ${stage}. No cause or current pass is inferred.`);
} finally { if (temporary) rmSync(temporary, { recursive: true, force: true }); }
