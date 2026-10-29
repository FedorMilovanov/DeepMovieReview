// Actual OS screen readers and installed Safari/Chrome. Never a virtual SR substitute.
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { platform, release } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";
import { nvda, voiceOver, macOSActivate, MacOSApplications } from "@guidepup/guidepup";
import { nativeSafari } from "./lib/native-safari.mjs";
import { workflowError } from "./lib/audit-report.mjs";

assert.ok(["darwin", "win32"].includes(platform()), "Real AT requires macOS or Windows");
const mac = platform() === "darwin";
const reader = mac ? voiceOver : nvda;
const name = mac ? "safari-voiceover" : "chrome-nvda";
const directory = `at-report/${name}`;
mkdirSync(directory, { recursive: true });
const report = { revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  os: { platform: platform(), release: release() }, results: [], failures: [] };
const evidence = { violations: [], incomplete: [], actions: [], screenshots: [] };
let browser, safari, page;
let phase = "initializing";
function checkpoint(next, announce = false) {
  phase = next;
  report.phase = phase;
  writeFileSync(`${directory}/actual-at.json`, JSON.stringify(evidence, null, 2));
  writeFileSync(`${directory}/summary.json`, JSON.stringify(report, null, 2));
  if (announce) console.log(`::notice title=Actual AT phase::${name}: ${phase}`);
}
const deadline = setTimeout(() => {
  const message = `${name}: six-minute scenario deadline at ${phase}`;
  report.failures.push(message);
  report.results = [{ browser: name, version: report.browser?.version ?? "not-started", width: 0,
    route: "/films/the-truman-show/article?spoilers=full", state: "timeout", scope: "actual desktop OS", file: "actual-at.json" }];
  checkpoint(phase);
  console.error(workflowError(message));
  server.kill();
  process.exit(1);
}, 360000);
const speechOptions = { capture: "initial", timeout: 20000, retries: 0 };
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3213"], { stdio: "inherit" });
const base = "http://127.0.0.1:3213";
const execute = async expression => mac ? safari.execute(`return (${expression})`) : page.evaluate(expression);
const go = async route => {
  if (mac) await safari.goto(base + route);
  else { await page.goto(base + route); await page.waitForLoadState("networkidle"); }
  await execute("document.fonts.ready.then(() => true)");
};
async function action(label, run, expected) {
  checkpoint(label);
  await reader.clearSpokenPhraseLog();
  await run();
  const speech = [...await reader.spokenPhraseLog()];
  evidence.actions.push({ label, speech });
  checkpoint(`${label}: recorded`);
  console.log(label, JSON.stringify(speech));
  if (expected) assert.match(speech.join(" "), expected, `${label}: actual spoken output`);
}
async function screenshot(label) {
  const bytes = mac ? Buffer.from(await safari.screenshot(), "base64") : await page.screenshot();
  writeFileSync(`${directory}/${label}.png`, bytes);
  evidence.screenshots.push({ label, data: bytes.toString("base64") });
}
async function geometry() {
  return execute("({width:innerWidth,outer:outerWidth,dpr:devicePixelRatio,scroll:document.documentElement.scrollWidth})");
}
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* server starting */ }
    await delay(250);
  }
  assert.ok(ready, "Production server did not start");
  checkpoint("starting real screen reader", true);
  await reader.start(speechOptions);
  checkpoint("screen reader started", true);
  report.screenReader = { name: reader.name, version: reader.version };
  if (mac) {
    checkpoint("starting installed Safari WebDriver", true);
    safari = await nativeSafari();
    checkpoint("Safari session started", true);
    await safari.resize(960, 1000);
    report.browser = { name: "Safari", version: safari.version };
  } else {
    browser = await chromium.launch({ channel: "chrome", headless: false, args: ["--window-size=1280,1000"] });
    const context = await browser.newContext({ viewport: null });
    page = await context.newPage();
    // Resize the actual OS window; never emulate the page viewport for native zoom.
    const session = await context.newCDPSession(page);
    const { windowId } = await session.send("Browser.getWindowForTarget");
    const frame = await page.evaluate(() => outerWidth - innerWidth);
    await session.send("Browser.setWindowBounds", { windowId, bounds: { width: 960 + frame, height: 1000, windowState: "normal" } });
    await session.detach();
    report.browser = { name: "Chrome", version: browser.version() };
  }
  checkpoint("opening article", true);
  await go("/films/the-truman-show/article?spoilers=full");
  checkpoint("article loaded; positioning real AT cursor", true);
  if (mac) {
    await macOSActivate(MacOSApplications.Safari);
    await reader.perform(reader.keyboardCommands.openItemChooser, speechOptions);
    await reader.type("web content", speechOptions);
    await reader.press("Enter", speechOptions);
    await reader.interact(speechOptions);
  } else {
    await page.bringToFront();
    await reader.perform(reader.keyboardCommands.exitFocusMode, { capture: false });
    await reader.press("Control+Home");
  }
  await action("structural heading navigation", () => reader.nextHeading(speechOptions), /шоу трумана/i);
  await action("native table navigation", () => reader.perform(mac ? reader.keyboardCommands.findNextTable : reader.keyboardCommands.moveToNextTable, speechOptions), /table|таблиц/i);
  if (mac) await reader.interact(speechOptions);
  await action("table column movement", () => reader.perform(reader.keyboardCommands.moveToNextColumn, speechOptions), /\S/);
  await screenshot("table-reading");
  if (mac) await reader.stopInteracting();

  // Browser UI zoom, not CSS zoom, deviceScaleFactor or a narrower emulated viewport.
  await go("/films/the-truman-show/article?spoilers=full");
  const original = await geometry();
  let zoom = original;
  for (let i = 0; i < 10 && original.width / zoom.width < 1.98; i++) {
    await reader.press(mac ? "Meta+Equals" : "Control+NumPadPlus", { capture: false });
    await delay(300);
    zoom = await geometry();
  }
  assert.ok(Math.abs(original.width / zoom.width - 2) < 0.04, `Native zoom200: ${JSON.stringify({ original, zoom })}`);
  assert.ok(Math.abs(original.outer - zoom.outer) < 4, "Zoom must not resize the physical window");
  evidence.actions.push({ label: "native browser zoom200", original, zoom });
  for (const route of ["/", "/films", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"]) {
    await go(route);
    const box = await geometry();
    assert.ok(box.scroll <= box.width + 1, `${route}: zoom200 overflow`);
    evidence.actions.push({ label: "zoom200 reflow", route, box });
  }
  await screenshot("zoom200");
  for (let i = 0; i < 10 && zoom.width > 321; i++) {
    await reader.press(mac ? "Meta+Equals" : "Control+NumPadPlus", { capture: false });
    await delay(300);
    zoom = await geometry();
  }
  assert.ok(zoom.width >= 300 && zoom.width <= 321, `Native reflow320: ${JSON.stringify(zoom)}`);
  for (const route of ["/", "/films", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"]) {
    await go(route);
    const box = await geometry();
    assert.ok(box.scroll <= box.width + 1, `${route}: reflow320 overflow`);
    evidence.actions.push({ label: "native zoom reflow320", route, box });
  }
  await screenshot("reflow320");
  await reader.press(mac ? "Meta+0" : "Control+0", { capture: false });
  report.results.push({ browser: name, version: report.browser.version, width: original.width,
    route: "/films/the-truman-show/article?spoilers=full", state: "real-AT-native-zoom", scope: "desktop OS", file: "actual-at.json" });
} catch (error) {
  const message = error.stack ?? String(error);
  report.failures.push(message);
  console.error(workflowError(`${name}: ${message}`));
  if (safari || page) await screenshot("failure").catch(() => {});
  report.results.push({ browser: name, version: report.browser?.version ?? "not-started", width: 0,
    route: "/films/the-truman-show/article?spoilers=full", state: "failure", scope: "desktop OS", file: "actual-at.json" });
} finally {
  clearTimeout(deadline);
  writeFileSync(`${directory}/actual-at.json`, JSON.stringify(evidence, null, 2));
  writeFileSync(`${directory}/summary.json`, JSON.stringify(report, null, 2));
  await reader.stop().catch(() => {});
  await safari?.close().catch(() => {});
  await browser?.close();
  server.kill();
}
process.exitCode = report.failures.length ? 1 : 0;
