// Safari inside Apple's iOS Simulator; never claim physical iPhone or iOS VoiceOver.
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { arch, release } from "node:os";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { newestStableXcode, runtimeMatchesSdk, nativeSimulatorProcessLines, simulatorBootLog } from "./lib/apple-toolchain.mjs";
import { simulatorAutomation } from "./lib/simulator-automation.mjs";
import { nativeSafari, waitForStableNativeTarget } from "./lib/native-safari.mjs";
import { runNativeGestureXCTest, shouldRunGestureAfterDriverFailure } from "./lib/ios-xctest-gesture.mjs";
import { retryableSimulatorCancellation } from "./lib/ios-cancellation-retry.mjs";
import { withFreshGestureSimulator } from "./lib/ios-fresh-simulator.mjs";
import { parseArticleSectionIds } from "./lib/ios-spoiler-observation.mjs";
import { workflowError } from "./lib/audit-report.mjs";
const directory = "at-report/ios-safari", gestureDirectory = "at-report/ios-gesture";
mkdirSync(directory, { recursive: true });
mkdirSync(gestureDirectory, { recursive: true });
const report = { revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), results: [], failures: [] };
const evidence = { violations: [], incomplete: [], actions: [], screenshots: [] };
const newGestureReport = () => ({ revision: report.revision, phase: "not started", failures: ["Native gesture test did not run"],
  results: [{ browser: "ios-safari-simulator", width: 0, route: "/films/the-truman-show/article?spoilers=full",
    state: "native-xctest-gesture", scope: "iPhone Simulator, not physical hardware", file: "actual-ios-gesture.json" }] });
const newGestureEvidence = () => ({ violations: [], incomplete: [], actions: [], screenshots: [] });
let gestureReport = newGestureReport(), gestureEvidence = newGestureEvidence();
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3213"], { stdio: "inherit" });
const systemEnv = { ...process.env };
delete systemEnv.DEVELOPER_DIR;
let safari, restoreDeveloperDirectory, automation;
const sceneRoute = "/films/the-truman-show?spoilers=none#scene-truman-sc-day-10909";
const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
let capturedSimulatorScreenshots = 0;
// Capture the real displayed iPhone Simulator framebuffer independently of
// SafariDriver. Screenshot transport must not hold the WebDriver session in
// a state where XCTest cannot acquire the same device's accessibility service.
// An absent/corrupt native PNG is still an unconditional test FAILURE.
function captureNativeSimulatorScreenshot() {
  assert.match(report.device?.udid ?? "", /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i);
  const file = `${directory}/native-simulator-screen-${String(++capturedSimulatorScreenshots).padStart(2, "0")}.png`;
  execFileSync("xcrun", ["simctl", "io", report.device.udid, "screenshot", file], { timeout: 45000 });
  const bytes = readFileSync(file);
  assert.ok(bytes.length > pngHeader.length && bytes.subarray(0, pngHeader.length).equals(pngHeader),
    "Native simulator display capture must be a real PNG");
  report.nativeScreenshotTransport = { command: "simctl io screenshot", count: capturedSimulatorScreenshots };
  return bytes.toString("base64");
}

async function runAndRecordNativeGesture(device = report.device, directory = gestureDirectory) {
  gestureReport.attempted = true;
  gestureReport.failures = [];
  gestureReport.device = device;
  const driverVersion = report.safariVersion ?? report.capabilities?.browserVersion ?? "not-started";
  gestureReport.results[0].version = device.udid === report.device.udid ? driverVersion : `same installed iOS runtime as SafariDriver (${driverVersion}); retry version not independently queried`;
  try {
    await runNativeGestureXCTest({ device, directory, report: gestureReport, evidence: gestureEvidence });
  } catch (error) {
    if (!gestureReport.failures.length) gestureReport.failures.push(String(error.stack ?? error));
    throw error;
  }
  assert.ok(gestureReport.observedMenus?.length === 4 && gestureReport.observedGesture && gestureReport.observedScene &&
    gestureReport.observedSpoiler && gestureReport.screenshots?.length === 12,
  "All four native menus, gestures, FULL → NONE and named screenshots must pass");
  report.nativeMenus = gestureReport.observedMenus;
  for (const menu of gestureReport.observedMenus) evidence.actions.push({ route: menu.route,
    label: "XCUITest native menu open and close; full trusted-event trace and screenshots in ios-gesture evidence", observed: menu });
  report.postScrollInput = gestureReport.observedGesture;
  if (report.spoilerBaseline) {
    assert.deepEqual(gestureReport.spoilerBaseline.fullSectionIds, report.spoilerBaseline.fullSectionIds,
      "SafariDriver and the independent FULL response must agree on sections");
    assert.deepEqual(gestureReport.spoilerBaseline.expectedSectionIds, report.spoilerBaseline.expectedSectionIds,
      "Both independently fetched NONE baselines must agree");
  }
  const spoiler = gestureReport.observedSpoiler;
  report.spoilerProjection = { before: spoiler.before.sectionIds.length, after: spoiler.after.sectionIds.length,
    by: "native XCUITest touch with passive observer", url: spoiler.after.url,
    expectedSectionIds: spoiler.expectedSectionIds, observation: spoiler.after };
  evidence.actions.push({ route: "/films/the-truman-show/article?spoilers=full",
    label: "native XCUITest scroll and post-scroll rail input; full trace and screenshots in ios-gesture evidence",
    scrollY: gestureReport.observedGesture.opened.scrollY, expanded: gestureReport.observedGesture.opened.rail.expanded });
  evidence.actions.push({ route: "/films/the-truman-show/article?spoilers=full",
    label: "native XCUITest FULL → NONE; trusted touch, click and exact SSR projection in ios-gesture evidence",
    ...report.spoilerProjection });
  evidence.actions.push({ route: sceneRoute, label: "native XCUITest scene support → evidence; full trace and screenshots in ios-gesture evidence",
    observed: gestureReport.observedScene });
}
async function runNativeGestureWithOneIsolatedRetry() {
  try { await runAndRecordNativeGesture(); return; }
  catch (firstError) {
    const trigger = retryableSimulatorCancellation(gestureReport);
    if (!trigger || process.env.GITHUB_ACTIONS !== "true") throw firstError;
    // Save the failed attempt in the verified Checks receipt and raw artifact.
    // No partial results can pass: the new Simulator must run the entire strict
    // scenario, and both failures remain visible if the second run fails.
    const firstAttempt = structuredClone(gestureReport), firstEvidence = structuredClone(gestureEvidence);
    writeFileSync(`${gestureDirectory}/first-attempt-summary.json`, JSON.stringify(firstAttempt, null, 2));
    writeFileSync(`${gestureDirectory}/first-attempt-evidence.json`, JSON.stringify(firstEvidence, null, 2));
    report.nativeGestureRetry = { trigger, outcome: "in progress", lifecycle: [] };
    gestureReport = newGestureReport();
    gestureReport.firstAttempt = firstAttempt;
    gestureReport.firstAttemptEvidence = firstEvidence;
    gestureReport.isolatedRetry = { trigger, originalFailureRemains: true };
    gestureEvidence = newGestureEvidence();
    try {
      if (automation) {
        automation.restore();
        report.restoredAutomationPreference = automation.original;
        automation = undefined;
      }
      await withFreshGestureSimulator({ original: report.device, simulatorApp: report.toolchain.simulatorApp, ci: true,
        diagnostic: item => {
          report.nativeGestureRetry.lifecycle.push(structuredClone(item));
          if (item.phase === "original-shutdown") report.device.state = "Shutdown";
        } }, async device => {
        await runAndRecordNativeGesture(device, `${gestureDirectory}/isolated-retry`);
      });
      report.nativeGestureRetry.outcome = "passed full strict second run";
      gestureReport.isolatedRetry.outcome = report.nativeGestureRetry.outcome;
    } catch (retryError) {
      report.nativeGestureRetry.outcome = "failed";
      gestureReport.isolatedRetry.outcome = "failed";
      gestureReport.failures.push(`Isolated retry failed: ${retryError.stack ?? retryError}`);
      throw new AggregateError([firstError, retryError], "Both the original native attempt and the isolated retry failed");
    }
  }
}

function hostSimulatorProcesses() {
  try {
    return nativeSimulatorProcessLines(execFileSync("ps", ["-axo", "pid=,state=,pcpu=,comm="], { encoding: "utf8", timeout: 10000 }));
  } catch (error) { return `Host process diagnostics unavailable: ${error.message}`; }
}
try {
  report.initialDeveloperDirectory = execFileSync("xcode-select", ["-p"], { encoding: "utf8", timeout: 30000, env: systemEnv }).trim();
  // Pin a complete installed Xcode+iOS Simulator runtime only when CI
  // explicitly asks for one. Xcode 26.6/iOS 26.5 has shown a real CoreSimulator
  // Recap digitizer disappearing mid-tap (native touchstart → touchcancel);
  // this selects an independently installed stable toolchain for strict native
  // testing, not a relaxed/mocked gesture or a pass based on diagnostics.
  const installations = readdirSync("/Applications");
  const version = process.env.DMR_IOS_XCODE_VERSION;
  if (version) assert.match(version, /^\d+(?:\.\d+){1,2}$/, "Expected explicit stable Xcode version");
  const desired = version ? `Xcode_${version}.app` : newestStableXcode(installations);
  assert.ok(installations.includes(desired), `Requested installed native Xcode is missing: ${desired}`);
  const xcode = desired;
  const developerDirectory = realpathSync(`/Applications/${xcode}/Contents/Developer`);
  process.env.DEVELOPER_DIR = developerDirectory;
  // LaunchServices/XPC helpers do not necessarily inherit this Node process's
  // DEVELOPER_DIR. Align the disposable hosted runner's system selection too.
  if (process.env.GITHUB_ACTIONS === "true") {
    restoreDeveloperDirectory = report.initialDeveloperDirectory;
    execFileSync("sudo", ["-n", "xcode-select", "--switch", developerDirectory], { stdio: "inherit", timeout: 30000 });
  }
  report.systemDeveloperDirectory = execFileSync("xcode-select", ["-p"], { encoding: "utf8", timeout: 30000, env: systemEnv }).trim();
  if (process.env.GITHUB_ACTIONS === "true") assert.equal(report.systemDeveloperDirectory, developerDirectory);
  const simulatorApp = `${developerDirectory}/Applications/Simulator.app`;
  const simulatorSdk = execFileSync("xcrun", ["--sdk", "iphonesimulator", "--show-sdk-version"], { encoding: "utf8", timeout: 30000 }).trim();
  report.toolchain = { developerDirectory, simulatorApp, simulatorSdk };
  report.host = { platform: process.platform, release: release(), arch: arch(),
    xcode: execFileSync("xcodebuild", ["-version"], { encoding: "utf8", timeout: 30000 }).trim() };
  const devices = JSON.parse(execFileSync("xcrun", ["simctl", "list", "devices", "available", "-j"], { encoding: "utf8" }));
  report.availableRuntimes = Object.keys(devices.devices);
  // The list is oldest-first on hosted images; prefer the newest installed iOS
  // runtime rather than silently pairing Safari26 with the first iOS18 device.
  // A pinned Xcode must not silently select a newer Simulator runtime from a
  // different installed Xcode. In particular, Xcode 26.4 uses iOS 26.4, not
  // the 26.5 runtime whose Recap HID input failed the native touch contract.
  const pinnedMinor = version ? Number(simulatorSdk.split(".")[1] ?? 0) : null;
  const candidates = Object.entries(devices.devices)
    .filter(([runtime]) => {
      if (!runtimeMatchesSdk(runtime, simulatorSdk)) return false;
      if (pinnedMinor === null) return true;
      const found = /\.iOS-(\d+)-(\d+)/.exec(runtime);
      const sdkMajor = Number(simulatorSdk.split(".")[0]);
      return Boolean(found && Number(found[1]) === sdkMajor && Number(found[2]) <= pinnedMinor);
    })
    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true })).flatMap(([runtime, devices]) => devices.map(device => ({ ...device, runtime })));
  const device = candidates.find(device => device.name.startsWith("iPhone") && device.isAvailable);
  assert.ok(device, "No installed iPhone Simulator runtime");
  report.device = { ...device, physicalDevice: false };
  // Start the host driver before CoreSimulator's expensive first boot. Only the
  // iOS session needs the booted device; keep driver startup and boot separate.
  safari = await nativeSafari({ platformName: "iOS", "safari:useSimulator": true, "safari:deviceUDID": device.udid }, {
    beforeSession: async () => {
      report.phase = "booting iPhone Simulator after host driver readiness";
      // Bring up the device frontend while SpringBoard is booting, not after
      // waiting for a headless cold boot that may never finish on hosted Intel.
      execFileSync("open", ["-a", simulatorApp, "--args", "-CurrentDeviceUDID", device.udid], { stdio: "inherit", timeout: 30000 });
      // `bootstatus -b` also *boots* the device, and the frontend opened above is
      // already booting it: the boot attempt then exits non-zero with «Unable to
      // boot device in current state: Booted» (measured on 988fce5). A separate
      // `boot` raced the same way on two earlier heads. So: attempt the boot, but
      // treat exactly that idempotent outcome as the state we want, then wait for
      // boot completion with plain `bootstatus`, which never boots anything.
      let bootNote = "";
      try {
        execFileSync("xcrun", ["simctl", "boot", device.udid], { encoding: "utf8", timeout: 120000, maxBuffer: 1024 * 1024 });
      } catch (error) {
        const detail = `${error.stdout ?? ""}${error.stderr ?? ""}${error.message ?? ""}`;
        if (!/current state: Boot(ed|ing)/.test(detail)) throw error;
        bootNote = `simctl boot reported the idempotent state, not a failure: ${detail.trim().split("\n").slice(-1)[0]}`;
      }
      // On 15aa416 eight-minute bootstatus timed out; its early log showed
      // cold iOS migration. Generic error inspection kept the beginning, not the
      // final state. Retain the bounded tail and actual duration even on failure.
      const bootStarted = performance.now();
      report.bootTiming = { timeoutMs: 480000 };
      try {
        const output = execFileSync("xcrun", ["simctl", "bootstatus", device.udid], {
          encoding: "utf8", timeout: report.bootTiming.timeoutMs, maxBuffer: 16 * 1024 * 1024,
        });
        report.bootLog = simulatorBootLog(bootNote, output, "");
      } catch (error) {
        report.bootLog = simulatorBootLog(bootNote, error.stdout, error.stderr);
        throw error;
      } finally {
        report.bootTiming.elapsedMs = Math.round(performance.now() - bootStarted);
      }
      console.log(report.bootLog);
      report.device.state = "Booted";
      report.hostSimulatorProcesses = hostSimulatorProcesses();
      report.phase = "enabling Simulator Safari Remote Automation";
      automation = simulatorAutomation(device.udid, { ci: process.env.GITHUB_ACTIONS === "true" });
      report.automationPreference = { original: automation.original, enabled: automation.enabled };
      // This is Safari's actual iOS Settings switch, not a layout/AT simulation.
      // Warm the real app before the driver's internal 30s RWI deadline; never
      // terminate/relaunch it or replay a failed browser scenario.
      report.phase = "launching real Simulator Safari before RWI discovery";
      // Cold app launch is host setup, not the product's interaction deadline.
      // A measured 60s timeout left the real device on SpringBoard (97bf64f).
      // Allow one bounded 120s launch, record its actual cost, never replay it.
      const launchStarted = performance.now();
      report.safariLaunchTiming = { timeoutMs: 120000 };
      try {
        report.safariLaunch = execFileSync("xcrun", ["simctl", "launch", device.udid, "com.apple.mobilesafari"], {
          encoding: "utf8", timeout: report.safariLaunchTiming.timeoutMs,
        }).trim();
      } finally {
        report.safariLaunchTiming.elapsedMs = Math.round(performance.now() - launchStarted);
      }
      report.phase = "creating native iOS Safari session";
    },
    // A simulator Safari that never exposed RWI is restarted for a second
    // session attempt. This repairs host setup only; no product step is redone.
    retrySetup: async () => {
      report.sessionRetry = (report.sessionRetry ?? 0) + 1;
      try { execFileSync("xcrun", ["simctl", "terminate", device.udid, "com.apple.mobilesafari"], { timeout: 30000 }); }
      catch (error) { report.safariTerminate = error.message; }
      await new Promise(resolve => setTimeout(resolve, 3000));
    },
  });
  report.capabilities = safari.capabilities;
  assert.equal(safari.capabilities.platformName, "iOS");
  assert.equal(safari.capabilities["safari:useSimulator"], true);
  assert.equal(safari.capabilities["safari:deviceUDID"], device.udid);
  // SafariDriver measures the installed Safari layout but sends NO pointer or
  // touch actions. All four menu interactions remain mandatory in normal
  // MobileSafari/XCTest, with a stricter passive trusted-event/state oracle.
  for (const route of ["/", "/films", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"]) {
    report.phase = `native iOS route ${route}`;
    await safari.goto(`http://127.0.0.1:3213${route}`);
    const box = await waitForStableNativeTarget(() => safari.execute(`const el=document.querySelector('.menuButton');
      const nav=document.getElementById('site-menu'), r=el?.getBoundingClientRect();
      const hit=r&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      const conditions={documentComplete:document.readyState==='complete',fontsLoaded:document.fonts.status==='loaded',
        elementPresent:!!el,visibleRect:!!r&&r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,
        hitContained:!!hit&&!!el&&el.contains(hit)};
      return {ready:Object.values(conditions).every(Boolean),conditions,
        width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth,lang:document.documentElement.lang,
        h1:document.querySelectorAll('main h1').length,expanded:el?.getAttribute('aria-expanded'),inert:nav?.inert,
        visible:nav?getComputedStyle(nav).display!=='none':null,
        menuRect:r?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}:null};`));
    assert.ok(box.width > 0 && box.width < 500 && box.height > 0 && box.scroll <= box.width + 1,
      `${route}: native iOS reflow ${JSON.stringify(box)}`);
    assert.equal(box.lang, "ru"); assert.equal(box.h1, 1);
    assert.ok(box.expanded === "false" && box.inert === true && box.visible === false,
      `${route}: hydrated navigation must start closed and inert`);
    evidence.screenshots.push({ route, data: captureNativeSimulatorScreenshot() });
    evidence.actions.push({ route, label: "native iOS Safari layout and menu hit-test (no input)", box });
    if (route.includes("/article?")) {
      const sectionIds = await safari.execute("return Array.from(document.querySelectorAll('.articleSection'), section => section.id)");
      const count = sectionIds.length;
      const lastSectionId = sectionIds.at(-1);
      assert.ok(count > 1 && sectionIds.every(Boolean) && new Set(sectionIds).size === count,
        "Actual native full article sections must have unique IDs before the spoiler input");
      // Establish the expected NONE projection from a separate SSR response from
      // this very build. This adapts to new spoiler-safe sections without making
      // a partially updated page pass just because its total count decreased.
      const expectedUrl = `http://127.0.0.1:3213${route.split("?")[0]}`;
      const baselineResponse = await fetch(expectedUrl, { signal: AbortSignal.timeout(30000) });
      assert.equal(baselineResponse.status, 200, "NONE baseline must be a real article response");
      assert.match(baselineResponse.headers.get("content-type") ?? "", /text\/html/i);
      const expectedSectionIds = parseArticleSectionIds(await baselineResponse.text());
      assert.ok(expectedSectionIds.length < count && expectedSectionIds.every((id, index) => sectionIds[index] === id) &&
        !expectedSectionIds.includes(lastSectionId), "NONE baseline must be a proper prefix of the full article");
      report.spoilerBaseline = { fullSectionIds: sectionIds, expectedSectionIds, lastSectionId };
      // SafariDriver's W3C touch input repeatedly ended with cancellation or
      // an incomplete touch on this control (3a12 and 2a6d). Keep the native
      // FULL geometry and separate baseline here, but exercise FULL → NONE in
      // normal MobileSafari with XCUITest below. That test requires a trusted
      // completed touch, click, new document and exact independent projection;
      // neither a driver command nor a screenshot can stand in for the result.
      report.spoilerTarget = await safari.execute(`const el = document.querySelector('.spoilerOption');
        const rect = el.getBoundingClientRect(), hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return { rect: rect.toJSON(), scrollY, innerWidth, innerHeight, hitContained: !!hit && el.contains(hit) };`);
      evidence.actions.push({ route, label: "native FULL spoiler target before independent XCUITest", ...report.spoilerTarget });
      evidence.screenshots.push({ route: `${route} — FULL spoiler target before XCUITest`, data: captureNativeSimulatorScreenshot() });

    }
  }
  // A fresh native Safari navigation lands on the same safe scene the homepage
  // links to. Inspect its settled geometry here. Input on this deep-scrolled
  // page is exercised independently by normal MobileSafari/XCUITest below:
  // SafariDriver on dff4efc delivered zero events for three W3C attempts.
  report.phase = "native iOS scene support and evidence";
  await safari.goto(`http://127.0.0.1:3213${sceneRoute}`);
  const supportSelector = "#scene-truman-sc-day-10909 .filmSceneSupports summary";
  const supportGeometry = await waitForStableNativeTarget(() => safari.execute(`const el = document.querySelector(${JSON.stringify(supportSelector)}), wrap = el?.closest('.filmSceneTableWrap');
    const r = el?.getBoundingClientRect(), w = wrap?.getBoundingClientRect();
    const hit = r && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    const conditions = { documentComplete: document.readyState === 'complete', fontsLoaded: document.fonts.status === 'loaded',
      elementPresent: !!el && !!wrap, visibleRect: !!r && r.top >= 60 && r.bottom <= innerHeight,
      hitContained: !!hit && !!el && el.contains(hit) };
    return { ready: Object.values(conditions).every(Boolean), conditions,
      rect: r?.toJSON() ?? null, wrap: w?.toJSON() ?? null, scrollLeft: wrap?.scrollLeft ?? null, innerWidth, innerHeight,
      hitContained: conditions.hitContained };`));
  assert.ok(supportGeometry.rect.left >= supportGeometry.wrap.left && supportGeometry.rect.right <= supportGeometry.wrap.right + 1 &&
    supportGeometry.rect.top >= 60 && supportGeometry.rect.bottom <= supportGeometry.innerHeight && supportGeometry.hitContained && supportGeometry.scrollLeft === 0,
    `Mobile scene support must be visible and hittable without horizontal scrolling: ${JSON.stringify(supportGeometry)}`);
  evidence.actions.push({ route: sceneRoute, label: "native scene support geometry before independent XCUITest", supportGeometry });
  evidence.screenshots.push({ route: `${sceneRoute} — support before input`, data: captureNativeSimulatorScreenshot() });

  // Close the isolated SafariDriver automation window before XCUITest drives
  // normal MobileSafari. Both the earlier projection checks and this separate
  // native touch + scroll + post-scroll input remain required for the job.
  report.phase = "closing SafariDriver before independent native gesture test";
  report.safariVersion = safari.version;
  await safari.close();
  safari = undefined;
  report.phase = "XCUITest native menus, scroll, scene and spoiler input";
  await runNativeGestureWithOneIsolatedRetry();
} catch (error) {
  // These are bounded, boolean/timing-only samples from the failed passive
  // readiness wait; they do not turn the earlier failure into a passing scan.
  if (error?.nativeTargetDiagnostics) report.failedNativeTargetReadiness = error.nativeTargetDiagnostics;
  // Session creation can fail before a WebDriver object exists. Preserve the
  // actual Simulator screen and bounded RWI logs instead of diagnosing a blank
  // browser or fabricating a product failure from the host's timeout alone.
  if (!safari && !report.capabilities && report.device?.state === "Booted") {
    try {
      const file = `${directory}/failed-simulator.png`;
      execFileSync("xcrun", ["simctl", "io", report.device.udid, "screenshot", file], { timeout: 15000 });
      evidence.screenshots.push({ route: "Simulator before WebDriver session; not a product scan", data: readFileSync(file).toString("base64") });
      report.simulatorAutomationLog = execFileSync("xcrun", ["simctl", "spawn", report.device.udid, "log", "show", "--last", "3m", "--style", "compact", "--predicate", 'subsystem CONTAINS "WebKit" OR process == "MobileSafari"'], {
        encoding: "utf8", timeout: 20000, maxBuffer: 4 * 1024 * 1024,
      }).slice(-16000);
    } catch (diagnosticError) { report.failedSimulatorDiagnostic = diagnosticError.message; }
  }
  if (!safari && report.capabilities && report.device?.state === "Booted") {
    // XCTest uses a normal Safari window after WebDriver has closed. Its failed
    // screen is diagnostic only; it never replaces the required event trace.
    try {
      const file = `${directory}/failed-xctest-simulator.png`;
      execFileSync("xcrun", ["simctl", "io", report.device.udid, "screenshot", file], { timeout: 15000 });
      evidence.screenshots.push({ route: "Simulator display after failed native XCTest; diagnostic only", data: readFileSync(file).toString("base64") });
    } catch (diagnosticError) { report.failedXCTestSimulatorDiagnostic = diagnosticError.message; }
  }
  if (safari) {
    // A stuck WebDriver cannot capture its own viewport. Preserve the actual
    // Simulator display independently for diagnosis, never as a passing scan.
    try {
      const file = `${directory}/failed-active-simulator.png`;
      execFileSync("xcrun", ["simctl", "io", report.device.udid, "screenshot", file], { timeout: 15000 });
      evidence.screenshots.push({ route: "Simulator display after failed SafariDriver layout; diagnostic only", data: readFileSync(file).toString("base64") });
    } catch (diagnosticError) { report.failedActiveSimulatorDiagnostic = diagnosticError.message; }
    try {
      report.failedPageState = await safari.execute("return ({url:location.href,expanded:document.querySelector('.menuButton')?.getAttribute('aria-expanded'),button:document.querySelector('.menuButton')?.getBoundingClientRect().toJSON(),width:innerWidth,scrollY})");
      evidence.screenshots.push({ route: "failed native state", data: captureNativeSimulatorScreenshot() });
    } catch (diagnosticError) { report.failedPageDiagnostic = diagnosticError.message; }
  }
  try { report.failedHostSimulatorProcesses = hostSimulatorProcesses(); }
  catch (diagnosticError) { report.failedHostSimulatorProcesses = diagnosticError.message; }
  report.failures.push(inspect(error, { depth: 8, maxStringLength: 16000 }));
  console.error(workflowError(`iOS Safari Simulator: ${error.stack ?? error}`));
} finally {
  report.results.push({ browser: "ios-safari-simulator", version: report.safariVersion ?? safari?.version ?? "not-started", width: 0,
    route: "/", state: "native-ios-simulator", scope: "iPhone Simulator, not physical hardware", file: "actual-ios.json" });
  await safari?.close().catch(() => {});
  // A driver failure must remain a failure. Still try the independent real
  // XCUITest once after closing that session, so a stalled SafariDriver does
  // not make its separate native gesture evidence disappear entirely.
  if (shouldRunGestureAfterDriverFailure(report, gestureReport)) {
    report.independentGestureAfterDriverFailure = { attempted: true, driverFailurePhase: report.phase };
    try {
      await runAndRecordNativeGesture();
      report.independentGestureAfterDriverFailure.result = "passed";
    } catch (error) {
      report.independentGestureAfterDriverFailure.result = "failed";
      report.failures.push(`Independent native gesture after driver failure: ${error.stack ?? error}`);
      console.error(workflowError(`Independent iOS XCUITest after driver failure: ${error.stack ?? error}`));
    }
  }
  server.kill();
  if (automation) {
    try { automation.restore(); report.restoredAutomationPreference = automation.original; }
    catch (error) { report.failures.push(`Simulator Safari preference restoration failed: ${error.message}`); }
  }
  if (restoreDeveloperDirectory) {
    try {
      execFileSync("sudo", ["-n", "xcode-select", "--switch", restoreDeveloperDirectory], { stdio: "inherit", timeout: 30000 });
      report.restoredSystemDeveloperDirectory = execFileSync("xcode-select", ["-p"], { encoding: "utf8", timeout: 30000, env: systemEnv }).trim();
      assert.equal(report.restoredSystemDeveloperDirectory, restoreDeveloperDirectory);
    } catch (error) { report.failures.push(`System Xcode restoration failed: ${error.message}`); }
  }
  writeFileSync(`${directory}/actual-ios.json`, JSON.stringify(evidence, null, 2));
  writeFileSync(`${directory}/summary.json`, JSON.stringify(report, null, 2));
  writeFileSync(`${gestureDirectory}/actual-ios-gesture.json`, JSON.stringify(gestureEvidence, null, 2));
  writeFileSync(`${gestureDirectory}/summary.json`, JSON.stringify(gestureReport, null, 2));
}
process.exitCode = report.failures.length ? 1 : 0;
