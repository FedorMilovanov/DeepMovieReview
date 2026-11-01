import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { nativeArticlePath, nativeMenuRoutes, nativeScenePath, selectNativeGestureAttachments, startNativeObservationProxy,
  validateNativeGestureTrace, validateNativeMenuSequence, validateNativeMenuTrace, validateNativeSceneTrace, validateNativeSpoilerTrace, validateXCTestSummary } from "./ios-gesture-probe.mjs";
import { parseArticleSectionIds } from "./ios-spoiler-observation.mjs";
import { collectTouchDiagnostics } from "./ios-touch-diagnostics.mjs";

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
function allowObservedSimctlTimeout(error) {
  if (!error) return;
  const detail = String(error.stderr ?? error.message ?? error);
  if (!/domain=NSPOSIXErrorDomain, code=60/.test(detail) || !/operation timed out/i.test(detail)) throw error;
}

export function validateMenuNavigationOutcome({ error, from, to, next, baseUrl }) {
  allowObservedSimctlTimeout(error);
  assert.ok(from?.closed && next && ["menu-ready", "ready"].includes(next.kind) &&
    next.pageId !== from.pageId && Number.isFinite(next.timestamp) && next.timestamp > from.closed.timestamp,
  "The next page must be a distinct document observed after the preceding menu closed");
  assert.equal(next.url, new URL(to, baseUrl).href, "The observed next document must be the requested route");
  return { status: error ? "simctl-timed-out-but-next-page-independently-observed" : "simctl-completed",
    ...(error ? { commandError: String(error.message ?? error) } : {}) };
}

export function validateSceneNavigationOutcome({ error, events, baseUrl }) {
  allowObservedSimctlTimeout(error);
  const scene = validateNativeSceneTrace(events, baseUrl);
  return { scene, status: error ? "simctl-timed-out-but-scene-independently-observed" : "simctl-completed",
    ...(error ? { commandError: String(error.message ?? error) } : {}) };
}

export function validateSpoilerNavigationOutcome({ error, events, baseUrl, baseline, afterScene }) {
  allowObservedSimctlTimeout(error);
  const spoiler = validateNativeSpoilerTrace(events, baseUrl, { ...baseline, afterScene });
  return { spoiler, status: error ? "simctl-timed-out-but-spoiler-independently-observed" : "simctl-completed",
    ...(error ? { commandError: String(error.message ?? error) } : {}) };
}

async function articleSectionBaseline(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `Article baseline must be a real response: ${url}`);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/i);
  return parseArticleSectionIds(await response.text());
}

async function runXcodebuild(args, logFile, deadlineMs = 660000) {
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
  let proxy, sceneNavigation, sceneNavigationError, sceneTriggerPageId, spoilerNavigation, spoilerNavigationError;
  const completedMenus = [], menuPromises = [], menuErrors = [];
  report.menuNavigations = [];
  try {
    // These are fresh responses from the same build, not hard-coded section
    // counts. The native FULL document and the reached NONE document must each
    // match their respective baseline exactly.
    const base = `http://127.0.0.1:3213${nativeArticlePath}`;
    const [fullSectionIds, expectedSectionIds] = await Promise.all([
      articleSectionBaseline(`${base}?spoilers=full`), articleSectionBaseline(base),
    ]);
    assert.ok(fullSectionIds.length > expectedSectionIds.length &&
      expectedSectionIds.every((id, index) => id === fullSectionIds[index]) && !expectedSectionIds.includes(fullSectionIds.at(-1)),
    "NONE SSR must be a proper prefix of FULL SSR");
    report.spoilerBaseline = { fullSectionIds, expectedSectionIds, lastSectionId: fullSectionIds.at(-1) };
    proxy = await startNativeObservationProxy({ spoilerLastSectionId: fullSectionIds.at(-1), onEvent: event => {
      // Schedule each following route only after the complete preceding native
      // open/close is independently observed. Beacons may arrive out of order;
      // the validator orders them by the document's own sequence numbers.
      if (completedMenus.length < nativeMenuRoutes.length) {
        const index = completedMenus.length, route = nativeMenuRoutes[index];
        let completed;
        try {
          completed = validateNativeMenuTrace(proxy.events, proxy.baseUrl, route,
            { afterTimestamp: completedMenus.at(-1)?.closed.timestamp ?? -Infinity });
        } catch { /* An incomplete or invalid trace cannot advance the test. */ }
        if (completed) {
          completedMenus.push(completed);
          const to = nativeMenuRoutes[index + 1] ?? `${nativeArticlePath}?spoilers=full`;
          const url = `${proxy.baseUrl}${to}`;
          report.menuNavigations.push({ from: route, to, method: "simctl openurl after validated native menu close" });
          // Screenshot is taken while the menu is open, before its close tap.
          // This small pause also lets XCTest finish its closed-state check.
          menuPromises.push(delay(2500).then(async () => {
            await exec("xcrun", ["simctl", "openurl", device.udid, url], { timeout: 60000 });
          }).catch(error => { menuErrors[index] = error; }));
        }
      }
      if (!sceneNavigation && event.kind === "rail-state" && event.rail?.expanded === "true") {
        sceneTriggerPageId = event.pageId;
        // Let XCTest retain its post-rail screenshot before opening the safe
        // scene. simctl only navigates; native input and the passive trace gate.
        sceneNavigation = delay(5000).then(async () => {
          const sceneUrl = `${proxy.baseUrl}${nativeScenePath}?spoilers=none#scene-truman-sc-day-10909`;
          report.sceneNavigation = { method: "simctl openurl after rail screenshot", url: sceneUrl };
          await exec("xcrun", ["simctl", "openurl", device.udid, sceneUrl], { timeout: 60000 });
        }).catch(error => { sceneNavigationError = error; });
      }
      if (!spoilerNavigation && event.kind === "scene-evidence-arrived") {
        // After the native evidence click and screenshot, return to a fresh FULL
        // article. XCTest must tap NONE; no helper navigates to NONE on its behalf.
        spoilerNavigation = delay(6000).then(async () => {
          const fullUrl = `${proxy.baseUrl}${nativeArticlePath}?spoilers=full`;
          report.spoilerNavigation = { method: "simctl openurl FULL after scene screenshot", url: fullUrl };
          await exec("xcrun", ["simctl", "openurl", device.udid, fullUrl], { timeout: 60000 });
        }).catch(error => { spoilerNavigationError = error; });
      }
    } });
  } catch (error) { rmSync(derivedData, { recursive: true, force: true }); throw error; }
  const url = `${proxy.baseUrl}/`;
  report.phase = "opening the home page in normal MobileSafari";
  report.probe = { kind: "passive observer inserted by loopback test proxy", url,
    note: "The observer does not perform input, scrolling or state changes." };
  let run, primaryError;
  try {
    await exec("xcrun", ["simctl", "openurl", device.udid, url], { timeout: 60000 });
    report.phase = "XCUITest four native menus, swipe, scene and spoiler input";
    const project = resolve("scripts/ios-native-ui/NativeGesture.xcodeproj");
    const args = ["test", "-project", project, "-scheme", "NativeGesture",
      "-destination", `platform=iOS Simulator,id=${device.udid}`, "-parallel-testing-enabled", "NO",
      "-derivedDataPath", derivedData, "-resultBundlePath", bundle];
    // The hosted runner needed more than eight minutes to start XCTest,
    // execute its assertions and finish failure teardown on e07dd23. Allow
    // eleven bounded minutes; this does not retry any input or relax the gate.
    const timeoutMs = 660000;
    report.xcodebuild = { args, timeoutMs };
    run = await runXcodebuild(args, join(root, "xcodebuild.log"), timeoutMs);
    report.xcodebuild = { ...report.xcodebuild, ...run };
    // Allow in-flight same-origin beacon requests to reach the loopback proxy.
    await delay(1000);
    assert.equal(run.code, 0, `XCUITest failed or timed out: ${JSON.stringify({ code: run.code, signal: run.signal, timedOut: run.timedOut })}`);
    assert.equal(menuPromises.length, nativeMenuRoutes.length, "All four native menu traces must trigger their next route");
    assert.ok(sceneNavigation && sceneTriggerPageId, "The observed rail opening must trigger the separate scene navigation");
    assert.ok(spoilerNavigation, "The observed scene evidence must trigger the separate FULL article navigation");
    await Promise.all(menuPromises); await sceneNavigation; await spoilerNavigation;
    const summaryText = await exec("xcrun", ["xcresulttool", "get", "test-results", "summary", "--path", bundle], { timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
    report.xctestSummary = JSON.parse(summaryText.stdout);
    validateXCTestSummary(report.xctestSummary, device.udid);
    assert.deepEqual(proxy.errors, [], "Observer transport must not lose or reject data");
    report.observedMenus = validateNativeMenuSequence(proxy.events, proxy.baseUrl);
    // Select the new FULL document whose rail opening triggered the scene, not
    // the earlier menu-test or later spoiler-test document.
    report.observedGesture = validateNativeGestureTrace(proxy.events, proxy.baseUrl, { pageId: sceneTriggerPageId });
    assert.ok(!report.observedMenus.some(menu => menu.pageId === report.observedGesture.pageId),
      "The scroll test must use a fresh document distinct from all menu pages");
    report.menuNavigations = report.menuNavigations.map((item, index) => {
      const next = report.observedMenus[index + 1]?.ready ?? report.observedGesture.before;
      return { ...item, ...validateMenuNavigationOutcome({ error: menuErrors[index], from: report.observedMenus[index],
        to: item.to, next, baseUrl: proxy.baseUrl }) };
    });
    const navigation = validateSceneNavigationOutcome({ error: sceneNavigationError, events: proxy.events, baseUrl: proxy.baseUrl });
    report.observedScene = navigation.scene;
    report.sceneNavigation = { ...report.sceneNavigation, status: navigation.status,
      ...(navigation.commandError ? { commandError: navigation.commandError } : {}) };
    const spoilerNavigationResult = validateSpoilerNavigationOutcome({ error: spoilerNavigationError, events: proxy.events,
      baseUrl: proxy.baseUrl, baseline: report.spoilerBaseline, afterScene: report.observedScene.arrived });
    report.observedSpoiler = spoilerNavigationResult.spoiler;
    report.spoilerNavigation = { ...report.spoilerNavigation, status: spoilerNavigationResult.status,
      ...(spoilerNavigationResult.commandError ? { commandError: spoilerNavigationResult.commandError } : {}) };
    for (const menu of report.observedMenus) evidence.actions.push({ route: menu.route,
      label: "XCUITest native menu open and close; ordered trusted touches and passive state observation", ...menu });
    evidence.actions.push({ route: `${nativeArticlePath}?spoilers=full`,
      label: "XCUITest native scroll and post-scroll rail input; passive DOM observation", ...report.observedGesture });
    evidence.actions.push({ route: `${nativeScenePath}?spoilers=none`,
      label: "XCUITest scene support → evidence; passive DOM observation", ...report.observedScene });
    evidence.actions.push({ route: `${nativeArticlePath}?spoilers=full`,
      label: "XCUITest FULL → NONE: trusted touch and exact independent SSR projection", ...report.observedSpoiler });
    report.phase = "exporting the native test screenshots";
    await exec("xcrun", ["xcresulttool", "export", "attachments", "--path", bundle, "--output-path", attachments], { timeout: 60000 });
    const manifest = JSON.parse(readFileSync(join(attachments, "manifest.json"), "utf8"));
    report.screenshots = selectNativeGestureAttachments(manifest).map(({ name, file }) => {
      const bytes = readFileSync(join(attachments, file));
      assert.ok(bytes.subarray(0, 8).equals(screenshotSignature), `${name} is not a PNG`);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const menuScreens = { "DMR-menu-home-open": nativeMenuRoutes[0], "DMR-menu-films-open": nativeMenuRoutes[1],
        "DMR-menu-article-open": nativeMenuRoutes[2], "DMR-menu-making-open": nativeMenuRoutes[3] };
      const route = menuScreens[name] ?? (name.startsWith("DMR-scene-") ? `${nativeScenePath}?spoilers=none` :
        name === "DMR-spoiler-after-input" ? `${nativeArticlePath} (post-input screenshot; URL verified separately)` : `${nativeArticlePath}?spoilers=full`);
      evidence.screenshots.push({ route: `${route} — ${name}`, data: bytes.toString("base64") });
      return { name, file, sha256, bytes: bytes.length };
    });
    report.phase = "native XCUITest and observer verified";
  } catch (error) {
    primaryError = error;
    report.failures.push(String(error.stack ?? error));
    throw error;
  } finally {
    // Do not leave scheduled simctl commands running after a failure.
    await Promise.allSettled([...menuPromises, ...(sceneNavigation ? [sceneNavigation] : []), ...(spoilerNavigation ? [spoilerNavigation] : [])]);
    report.events = proxy.events; report.observerErrors = proxy.errors;
    if (primaryError && existsSync(bundle)) {
      // Preserve a narrow OS-log excerpt for a cancelled native touch. This is
      // diagnostic only: it cannot retry input or clear the original failure.
      try { report.systemTouchDiagnostics = await collectTouchDiagnostics({ bundle, udid: device.udid, events: proxy.events }); }
      catch (error) { report.systemTouchDiagnostics = { status: "unavailable", error: error.message }; }
    }
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
