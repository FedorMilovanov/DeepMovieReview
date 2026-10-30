// Safari inside Apple's iOS Simulator; never claim physical iPhone or iOS VoiceOver.
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { arch, release } from "node:os";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { newestStableXcode, runtimeMatchesSdk, nativeSimulatorProcessLines } from "./lib/apple-toolchain.mjs";
import { simulatorAutomation } from "./lib/simulator-automation.mjs";
import { nativeSafari, waitForNativeValue } from "./lib/native-safari.mjs";
import { workflowError } from "./lib/audit-report.mjs";
const directory = "at-report/ios-safari";
mkdirSync(directory, { recursive: true });
const report = { revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), results: [], failures: [] };
const evidence = { violations: [], incomplete: [], actions: [], screenshots: [] };
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3213"], { stdio: "inherit" });
const systemEnv = { ...process.env };
delete systemEnv.DEVELOPER_DIR;
let safari, restoreDeveloperDirectory, automation;
function hostSimulatorProcesses() {
  try {
    return nativeSimulatorProcessLines(execFileSync("ps", ["-axo", "pid=,state=,pcpu=,comm="], { encoding: "utf8", timeout: 10000 }));
  } catch (error) { return `Host process diagnostics unavailable: ${error.message}`; }
}
try {
  report.initialDeveloperDirectory = execFileSync("xcode-select", ["-p"], { encoding: "utf8", timeout: 30000, env: systemEnv }).trim();
  const xcode = newestStableXcode(readdirSync("/Applications"));
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
  const candidates = Object.entries(devices.devices)
    .filter(([runtime]) => runtimeMatchesSdk(runtime, simulatorSdk))
    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true })).flatMap(([runtime, devices]) => devices.map(device => ({ ...device, runtime })));
  const device = candidates.find(device => device.name.startsWith("iPhone") && device.isAvailable);
  assert.ok(device, "No installed iPhone Simulator runtime");
  report.device = { ...device, physicalDevice: false };
  // Start the host driver before CoreSimulator's expensive first boot. Only the
  // iOS session needs the booted device; keep driver startup and boot separate.
  safari = await nativeSafari({ platformName: "iOS", "safari:useSimulator": true, "safari:deviceUDID": device.udid }, {
    beforeSession: async () => {
      report.phase = "booting iPhone Simulator after host driver readiness";
      if (device.state !== "Booted") execFileSync("xcrun", ["simctl", "boot", device.udid], { stdio: "inherit" });
      // Bring up the device frontend while SpringBoard is booting, not after
      // waiting for a headless cold boot that may never finish on hosted Intel.
      execFileSync("open", ["-a", simulatorApp, "--args", "-CurrentDeviceUDID", device.udid], { stdio: "inherit", timeout: 30000 });
      report.bootLog = execFileSync("xcrun", ["simctl", "bootstatus", device.udid, "-b"], {
        encoding: "utf8", timeout: 480000, maxBuffer: 16 * 1024 * 1024,
      }).slice(-12000);
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
  report.nativeInputs = safari.inputs;
  assert.equal(safari.capabilities.platformName, "iOS");
  assert.equal(safari.capabilities["safari:useSimulator"], true);
  assert.equal(safari.capabilities["safari:deviceUDID"], device.udid);
  // One recorded native activation. A raw touch that never reached the DOM is
  // evidence about this hosted Simulator driver, not about the control; fall
  // back to the standard W3C element activation once and keep both facts. A
  // touch that WAS delivered but did not change state is a real failure.
  const activate = async (selector, read, expected) => {
    await safari.execute(`window.__inputProbe = { events: [] };
      for (const type of ["touchstart", "touchend", "click", "pointerdown"])
        document.addEventListener(type, e => __inputProbe.events.push({ type,
          target: (e.target.className || e.target.tagName).toString().slice(0, 40) }), { capture: true, once: true });`);
    await safari.click(selector);
    let delivered = true;
    try { await waitForNativeValue(read, expected, { timeout: 10000 }); }
    catch (error) {
      const probe = await safari.execute("return { ...__inputProbe, url: location.href }");
      if (probe.events.length) { report.lastUndeliveredProbe = probe; throw error; }
      delivered = false;
      await safari.elementClick(selector);
      await waitForNativeValue(read, expected, { timeout: 10000 });
      probe.fallback = "W3C element activation after zero delivered events";
      report.undeliveredTouches = [...(report.undeliveredTouches ?? []), { selector, probe }];
    }
    return delivered ? "native touch" : "element activation after undelivered touch";
  };
  for (const route of ["/", "/films", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"]) {
    report.phase = `native iOS route ${route}`;
    await safari.goto(`http://127.0.0.1:3213${route}`);
    const box = await safari.execute("return ({width:innerWidth,scroll:document.documentElement.scrollWidth,lang:document.documentElement.lang,h1:document.querySelectorAll('main h1').length})");
    assert.ok(box.width < 500 && box.scroll <= box.width + 1, `${route}: native iOS reflow ${JSON.stringify(box)}`);
    assert.equal(box.lang, "ru"); assert.equal(box.h1, 1);
    const menuState = () => safari.execute("return document.querySelector('.menuButton').getAttribute('aria-expanded')");
    const openedBy = await activate(".menuButton", menuState, "true");
    evidence.actions.push({ route, label: "actual menu input opened disclosure", expanded: true, openedBy });
    const closedBy = await activate(".menuButton", menuState, "false");
    evidence.actions.push({ route, label: "actual menu input closed disclosure", expanded: false, closedBy });
    const data = await safari.screenshot();
    evidence.screenshots.push({ route, data });
    evidence.actions.push({ route, label: "native iOS Safari layout and actual menu taps", box });
    if (route.includes("/article?")) {
      const count = await safari.execute("return document.querySelectorAll('.articleSection').length");
      assert.ok(count > 0, "Actual native article sections must exist before the spoiler input");
      // Exercise the control first, at the document's natural top, where this
      // driver's touch coordinates are proven by the menu taps above. After a
      // scroll, the driver delivered a touch at the requested point to a
      // different element, so a scrolled tap would measure the driver rather
      // than the control.
      await safari.execute(`window.__spoilerProbe = { touched: [], clicked: [], url: location.href };
        for (const type of ["touchstart", "touchend", "click"]) document.addEventListener(type, e =>
          __spoilerProbe[type === "click" ? "clicked" : "touched"].push({ type, target: (e.target.className || e.target.tagName).toString().slice(0, 40), href: e.target.closest?.("a")?.getAttribute("href") }), { capture: true });`);
      evidence.screenshots.push({ route: `${route} — before spoiler input`, data: await safari.screenshot() });
      const sections = () => safari.execute("return document.querySelectorAll('.articleSection').length");
      const fewerSections = async () => (await sections()) < count ? "fewer" : "same";
      const spoilerBy = await activate(".spoilerOption", fewerSections, "fewer");
      report.spoilerProjection = { before: count, after: await sections(), by: spoilerBy,
        url: await safari.execute("return location.href") };
      report.spoilerProbe = await safari.execute("return { ...__spoilerProbe, target: (() => { const el = document.querySelector('.spoilerOption'); if (!el) return null; const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { rect: r.toJSON(), scrollY, hit: hit && (hit.className || hit.tagName) }; })() }");
      evidence.actions.push({ route, label: "native spoiler input probe", ...report.spoilerProbe });
      evidence.actions.push({ route, label: "native spoiler input changed projection", ...report.spoilerProjection });
      evidence.screenshots.push({ route: `${route} — after spoiler input`, data: await safari.screenshot() });

      // Then prove that a native source input still works after scrolling, on
      // the reading rail: a real button, not a synthetic JS click.
      await safari.goto(`http://127.0.0.1:3213${route}`);
      await safari.execute("document.querySelectorAll('.articleSection')[5].scrollIntoView();");
      const railState = () => safari.execute("return document.querySelector('.readingOutlineTrigger').getAttribute('aria-expanded')");
      const railBy = await activate(".readingOutlineTrigger", railState, "true");
      report.postScrollInput = { expanded: await railState(), by: railBy, scrollY: await safari.execute("return scrollY") };
      evidence.actions.push({ route, label: "post-scroll native input on the reading rail", ...report.postScrollInput });
    }
  }
} catch (error) {
  // Session creation can fail before a WebDriver object exists. Preserve the
  // actual Simulator screen and bounded RWI logs instead of diagnosing a blank
  // browser or fabricating a product failure from the host's timeout alone.
  if (!safari && report.device?.state === "Booted") {
    try {
      const file = `${directory}/failed-simulator.png`;
      execFileSync("xcrun", ["simctl", "io", report.device.udid, "screenshot", file], { timeout: 15000 });
      evidence.screenshots.push({ route: "Simulator before WebDriver session; not a product scan", data: readFileSync(file).toString("base64") });
      report.simulatorAutomationLog = execFileSync("xcrun", ["simctl", "spawn", report.device.udid, "log", "show", "--last", "3m", "--style", "compact", "--predicate", 'subsystem CONTAINS "WebKit" OR process == "MobileSafari"'], {
        encoding: "utf8", timeout: 20000, maxBuffer: 4 * 1024 * 1024,
      }).slice(-16000);
    } catch (diagnosticError) { report.failedSimulatorDiagnostic = diagnosticError.message; }
  }
  if (safari) {
    try {
      report.failedPageState = await safari.execute("return ({url:location.href,expanded:document.querySelector('.menuButton')?.getAttribute('aria-expanded'),button:document.querySelector('.menuButton')?.getBoundingClientRect().toJSON(),width:innerWidth,scrollY})");
      evidence.screenshots.push({ route: "failed native state", data: await safari.screenshot() });
    } catch (diagnosticError) { report.failedPageDiagnostic = diagnosticError.message; }
  }
  try { report.failedHostSimulatorProcesses = hostSimulatorProcesses(); }
  catch (diagnosticError) { report.failedHostSimulatorProcesses = diagnosticError.message; }
  report.failures.push(inspect(error, { depth: 8, maxStringLength: 16000 }));
  console.error(workflowError(`iOS Safari Simulator: ${error.stack ?? error}`));
} finally {
  report.results.push({ browser: "ios-safari-simulator", version: safari?.version ?? "not-started", width: 0,
    route: "/", state: "native-ios-simulator", scope: "iPhone Simulator, not physical hardware", file: "actual-ios.json" });
  await safari?.close().catch(() => {}); server.kill();
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
}
process.exitCode = report.failures.length ? 1 : 0;
