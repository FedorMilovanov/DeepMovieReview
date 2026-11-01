import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { nativeArticlePath, nativeScenePath, selectNativeGestureAttachments, startNativeObservationProxy,
  validateNativeGestureTrace, validateNativeSceneTrace, validateXCTestSummary } from "./ios-gesture-probe.mjs";

const exec = promisify(execFile);
const screenshotSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// A failed driver scenario stays failed, but an independent native test may
// still run once after the driver closes when the actual iOS session existed.
export function shouldRunGestureAfterDriverFailure(report, gestureReport) {
  return Boolean(report.failures.length && report.device?.state === "Booted" && report.capabilities &&
    gestureReport.phase === "not started" && gestureReport.attempted !== true);
}

// simctl can report its own CoreSimulator timeout even when the navigation
// subsequently completes. Do not infer success from that error or from XCTest
// alone: the complete, ordered, trusted scene trace is still mandatory. Other
// errors, missing events and failed UI tests remain failures.
export function validateSceneNavigationOutcome({ error, events, baseUrl }) {
  if (error) {
    const detail = String(error.stderr ?? error.message ?? error);
    if (!/domain=NSPOSIXErrorDomain, code=60/.test(detail) || !/operation timed out/i.test(detail)) throw error;
  }
  const scene = validateNativeSceneTrace(events, baseUrl);
  return { scene, status: error ? "simctl-timed-out-but-scene-independently-observed" : "simctl-completed",
    ...(error ? { commandError: String(error.message ?? error) } : {}) };
}

async function runXcodebuild(args, logFile, deadlineMs = 480000) {
  const output = createWriteStream(logFile, { flags: "wx" });
  const child = spawn("xcodebuild", args, { stdio: ["ignore", "pipe", "pipe"] });
  let tail = "", timedOut = false;
  for (const stream of [child.stdout, child.stderr]) stream.on("data", chunk => {
    output.write(chunk); process.stdout.write(chunk); tail = (tail + chunk.toString()).slice(-16000);
  });
  const timer = setTimeout(() => { timedOut = true; child.kill("SIGTERM"); }, deadlineMs);
  const killer = setTimeout(() => { if (timedOut) child.kill("SIGKILL"); }, deadlineMs + 5000);
  try {
    const result = await new Promise((resolveRun, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => resolveRun({ code, signal, timedOut, tail }));
    });
    return result;
  } finally {
    clearTimeout(timer); clearTimeout(killer);
    await new Promise((resolveStream, reject) => output.end(error => error ? reject(error) : resolveStream()));
  }
}

// Runs AFTER the isolated SafariDriver session is closed. XCTest drives the
// normal MobileSafari window with native simulator gestures. A passive script,
// inserted by a loopback-only test proxy, observes the page; the app's code and
// styles are not modified. Both independent results must pass.
export async function runNativeGestureXCTest({ device, directory, report, evidence }) {
  assert.match(device.udid, /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i);
  mkdirSync(directory, { recursive: true });
  const root = resolve(directory), bundle = join(root, "native-gesture.xcresult"), attachments = join(root, "attachments");
  assert.ok(!existsSync(bundle) && !existsSync(attachments), "Native XCTest result paths must be fresh");
  const derivedData = mkdtempSync(join(tmpdir(), "dmr-ios-xctest-"));
  let proxy, sceneNavigation, sceneNavigationError;
  try {
    proxy = await startNativeObservationProxy({ onEvent: event => {
      if (sceneNavigation || event.kind !== "rail-state" || event.rail?.expanded !== "true") return;
      // Let XCTest retain its post-rail screenshot before opening the safe scene
      // in the same normal Safari. simctl only navigates; the test supplies the
      // scene touch, and the observer independently verifies every resulting event.
      sceneNavigation = delay(5000).then(async () => {
        const sceneUrl = `${proxy.baseUrl}${nativeScenePath}?spoilers=none#scene-truman-sc-day-10909`;
        report.sceneNavigation = { method: "simctl openurl after rail screenshot", url: sceneUrl };
        await exec("xcrun", ["simctl", "openurl", device.udid, sceneUrl], { timeout: 60000 });
      }).catch(error => { sceneNavigationError = error; });
    } });
  } catch (error) { rmSync(derivedData, { recursive: true, force: true }); throw error; }
  const url = `${proxy.baseUrl}${nativeArticlePath}?spoilers=full`;
  report.phase = "opening the full article in normal MobileSafari";
  report.probe = { kind: "passive observer inserted by loopback test proxy", url,
    note: "The observer does not perform input, scrolling or state changes." };
  let run, primaryError;
  try {
    await exec("xcrun", ["simctl", "openurl", device.udid, url], { timeout: 60000 });
    report.phase = "XCUITest native swipe and post-scroll rail tap";
    const project = resolve("scripts/ios-native-ui/NativeGesture.xcodeproj");
    const args = ["test", "-project", project, "-scheme", "NativeGesture",
      "-destination", `platform=iOS Simulator,id=${device.udid}`, "-parallel-testing-enabled", "NO",
      "-derivedDataPath", derivedData, "-resultBundlePath", bundle];
    report.xcodebuild = { args, timeoutMs: 480000 };
    run = await runXcodebuild(args, join(root, "xcodebuild.log"));
    report.xcodebuild = { ...report.xcodebuild, ...run };
    // Allow in-flight same-origin beacon requests to reach the loopback proxy.
    await delay(1000);
    assert.equal(run.code, 0, `XCUITest failed or timed out: ${JSON.stringify({ code: run.code, signal: run.signal, timedOut: run.timedOut })}`);
    assert.ok(sceneNavigation, "The observed rail opening must trigger the separate scene navigation");
    await sceneNavigation;
    const summaryText = await exec("xcrun", ["xcresulttool", "get", "test-results", "summary", "--path", bundle], { timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
    report.xctestSummary = JSON.parse(summaryText.stdout);
    validateXCTestSummary(report.xctestSummary, device.udid);
    assert.deepEqual(proxy.errors, [], "Observer transport must not lose or reject data");
    report.observedGesture = validateNativeGestureTrace(proxy.events, proxy.baseUrl);
    const navigation = validateSceneNavigationOutcome({ error: sceneNavigationError, events: proxy.events, baseUrl: proxy.baseUrl });
    report.observedScene = navigation.scene;
    report.sceneNavigation = { ...report.sceneNavigation, status: navigation.status,
      ...(navigation.commandError ? { commandError: navigation.commandError } : {}) };
    evidence.actions.push({ route: `${nativeArticlePath}?spoilers=full`,
      label: "XCUITest native scroll and post-scroll rail input; passive DOM observation", ...report.observedGesture });
    evidence.actions.push({ route: `${nativeScenePath}?spoilers=none`,
      label: "XCUITest scene support → evidence; passive DOM observation", ...report.observedScene });
    report.phase = "exporting the native test screenshots";
    await exec("xcrun", ["xcresulttool", "export", "attachments", "--path", bundle, "--output-path", attachments], { timeout: 60000 });
    const manifest = JSON.parse(readFileSync(join(attachments, "manifest.json"), "utf8"));
    report.screenshots = selectNativeGestureAttachments(manifest).map(({ name, file }) => {
      const bytes = readFileSync(join(attachments, file));
      assert.ok(bytes.subarray(0, 8).equals(screenshotSignature), `${name} is not a PNG`);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const route = name.startsWith("DMR-scene-") ? `${nativeScenePath}?spoilers=none` : `${nativeArticlePath}?spoilers=full`;
      evidence.screenshots.push({ route: `${route} — ${name}`, data: bytes.toString("base64") });
      return { name, file, sha256, bytes: bytes.length };
    });
    report.phase = "native XCUITest and observer verified";
  } catch (error) {
    primaryError = error;
    report.failures.push(String(error.stack ?? error));
    throw error;
  } finally {
    report.events = proxy.events; report.observerErrors = proxy.errors;
    if (primaryError && existsSync(bundle) && !report.xctestSummary) {
      try {
        const result = await exec("xcrun", ["xcresulttool", "get", "test-results", "summary", "--path", bundle], { timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
        report.xctestSummary = JSON.parse(result.stdout);
      } catch (error) { report.summaryDiagnostic = error.message; }
    }
    if (primaryError && existsSync(bundle) && !existsSync(attachments)) {
      try { await exec("xcrun", ["xcresulttool", "export", "attachments", "--path", bundle, "--output-path", attachments], { timeout: 60000 }); }
      catch (error) { report.attachmentDiagnostic = error.message; }
    }
    try { await proxy.close(); }
    catch (error) {
      report.failures.push(`Native observer shutdown: ${error.message}`);
      if (!primaryError) throw error;
    } finally { rmSync(derivedData, { recursive: true, force: true }); }
  }
}
