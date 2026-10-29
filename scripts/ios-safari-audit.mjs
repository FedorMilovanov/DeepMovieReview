// Safari inside Apple's iOS Simulator; never claim physical iPhone or iOS VoiceOver.
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { arch, release } from "node:os";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { newestStableXcode, runtimeMatchesSdk, nativeSimulatorProcessLines } from "./lib/apple-toolchain.mjs";
import { simulatorAutomation } from "./lib/simulator-automation.mjs";
import { nativeSafari } from "./lib/native-safari.mjs";
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
      report.safariLaunch = execFileSync("xcrun", ["simctl", "launch", device.udid, "com.apple.mobilesafari"], {
        encoding: "utf8", timeout: 60000,
      }).trim();
      report.phase = "creating native iOS Safari session";
    },
  });
  report.capabilities = safari.capabilities;
  for (const route of ["/", "/films", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"]) {
    await safari.goto(`http://127.0.0.1:3213${route}`);
    const box = await safari.execute("return ({width:innerWidth,scroll:document.documentElement.scrollWidth,lang:document.documentElement.lang,h1:document.querySelectorAll('main h1').length})");
    assert.ok(box.width < 500 && box.scroll <= box.width + 1, `${route}: native iOS reflow ${JSON.stringify(box)}`);
    assert.equal(box.lang, "ru"); assert.equal(box.h1, 1);
    await safari.click(".menuButton");
    assert.equal(await safari.execute("return document.querySelector('.menuButton').getAttribute('aria-expanded')"), "true");
    await safari.click(".menuButton");
    assert.equal(await safari.execute("return document.querySelector('.menuButton').getAttribute('aria-expanded')"), "false");
    const data = await safari.screenshot();
    evidence.screenshots.push({ route, data });
    evidence.actions.push({ route, label: "native iOS Safari layout and actual menu taps", box });
    if (route.includes("/article?")) {
      const count = await safari.execute("return document.querySelectorAll('.articleSection').length");
      await safari.click(".spoilerOption");
      let changed = false;
      for (let i = 0; i < 100; i++) {
        if (await safari.execute("return document.querySelectorAll('.articleSection').length") < count) { changed = true; break; }
        await delay(100);
      }
      assert.ok(changed, "iOS spoiler tap must change DOM projection");
    }
  }
} catch (error) {
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
