// Safari inside Apple's iOS Simulator; never claim physical iPhone or iOS VoiceOver.
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { arch, release } from "node:os";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { nativeSafari } from "./lib/native-safari.mjs";
import { workflowError } from "./lib/audit-report.mjs";
const directory = "at-report/ios-safari";
mkdirSync(directory, { recursive: true });
const report = { revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), results: [], failures: [] };
const evidence = { violations: [], incomplete: [], actions: [], screenshots: [] };
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3213"], { stdio: "inherit" });
let safari;
try {
  report.host = { platform: process.platform, release: release(), arch: arch(),
    xcode: execFileSync("xcodebuild", ["-version"], { encoding: "utf8", timeout: 30000 }).trim() };
  const devices = JSON.parse(execFileSync("xcrun", ["simctl", "list", "devices", "available", "-j"], { encoding: "utf8" }));
  report.availableRuntimes = Object.keys(devices.devices);
  // The list is oldest-first on hosted images; prefer the newest installed iOS
  // runtime rather than silently pairing Safari26 with the first iOS18 device.
  const candidates = Object.entries(devices.devices)
    .filter(([runtime]) => runtime.includes(".iOS-"))
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
      execFileSync("open", ["-a", "Simulator", "--args", "-CurrentDeviceUDID", device.udid], { stdio: "inherit", timeout: 30000 });
      report.bootLog = execFileSync("xcrun", ["simctl", "bootstatus", device.udid, "-b"], {
        encoding: "utf8", timeout: 480000, maxBuffer: 16 * 1024 * 1024,
      }).slice(-12000);
      console.log(report.bootLog);
      report.device.state = "Booted";
      // Prime MobileSafari once, then let WebDriver create its automation tab.
      report.phase = "priming native MobileSafari";
      report.safariLaunchLog = execFileSync("xcrun", ["simctl", "launch", device.udid, "com.apple.mobilesafari"], {
        encoding: "utf8", timeout: 60000, maxBuffer: 16 * 1024 * 1024,
      }).slice(-12000);
      execFileSync("xcrun", ["simctl", "terminate", device.udid, "com.apple.mobilesafari"], { stdio: "inherit", timeout: 30000 });
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
  report.failures.push(inspect(error, { depth: 8, maxStringLength: 16000 }));
  console.error(workflowError(`iOS Safari Simulator: ${error.stack ?? error}`));
} finally {
  report.results.push({ browser: "ios-safari-simulator", version: safari?.version ?? "not-started", width: 0,
    route: "/", state: "native-ios-simulator", scope: "iPhone Simulator, not physical hardware", file: "actual-ios.json" });
  writeFileSync(`${directory}/actual-ios.json`, JSON.stringify(evidence, null, 2));
  writeFileSync(`${directory}/summary.json`, JSON.stringify(report, null, 2));
  await safari?.close().catch(() => {}); server.kill();
}
process.exitCode = report.failures.length ? 1 : 0;
