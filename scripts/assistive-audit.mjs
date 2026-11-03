// Actual OS screen readers and installed Safari/Chrome. Never a virtual SR substitute.
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { arch, platform, release } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";
import { nvda, voiceOver, macOSActivate, MacOSApplications } from "@guidepup/guidepup";
import { firstTableCellSpoken, firstTableHeaderSpoken, libraryDetectionRowSpeech, macKeyboardShortcut, nativeTableRoleSpeech, needsNamedTableRead, needsTableRowRead, sceneSupportDisclosureCollapsed, sceneSupportDisclosureRole, sceneSupportDisclosureSpeech, settleNativeSpeech, validateVoiceOverSkipLink, voiceOverChooserSpeech, warmVoiceOver } from "./lib/assistive-commands.mjs";
import { safariDesktop } from "./lib/safari-desktop.mjs";
import { workflowError } from "./lib/audit-report.mjs";

assert.ok(["darwin", "win32"].includes(platform()), "Real AT requires macOS or Windows");
const mac = platform() === "darwin";
const reader = mac ? voiceOver : nvda;
const name = mac ? "safari-voiceover" : "chrome-nvda";
const directory = `at-report/${name}`;
mkdirSync(directory, { recursive: true });
const report = { revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  os: { platform: platform(), release: release(), arch: arch() }, results: [], failures: [] };
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
  const message = `${name}: eight-minute scenario deadline at ${phase}`;
  report.failures.push(message);
  report.results = [{ browser: name, version: report.browser?.version ?? "not-started", width: 0,
    route: "/films/the-truman-show/article?spoilers=full", state: "timeout", scope: "actual desktop OS", file: "actual-at.json" }];
  checkpoint(phase);
  console.error(workflowError(message));
  server.kill();
  process.exit(1);
}, 480000);
// Guidepup counts total attempts here: 0 never invokes the macOS delegate.
// One attempt avoids replaying mutating navigation while actually issuing it.
const speechOptions = { capture: "initial", timeout: 20000, retries: 1 };
// VoiceOver may announce a delayed group/help hint before the actual destination.
// Semantic assertions need the complete utterance, not only its initial fragment.
const navigationOptions = mac ? { ...speechOptions, capture: "all" } : speechOptions;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3213"], { stdio: "inherit" });
const base = "http://127.0.0.1:3213";
const execute = async expression => page.evaluate(expression);
const go = async route => {
  if (mac) return safari.goto(base + route);
  await page.goto(base + route);
  await page.waitForLoadState("networkidle");
  await execute("document.fonts.ready.then(() => true)");
};
const perform = (command, options) => mac
  ? reader.press(macKeyboardShortcut(command), options)
  : reader.perform(command, options);
async function action(label, run, expected, { required = true } = {}) {
  checkpoint(label);
  await reader.clearSpokenPhraseLog();
  let speech;
  try { await run(); }
  finally {
    speech = [...await reader.spokenPhraseLog().catch(error => [`Speech log unavailable: ${error.message}`])];
    let liveReadErrors;
    if (mac && expected) {
      const settled = await settleNativeSpeech(speech, expected);
      speech = settled.speech; liveReadErrors = settled.readErrors;
    }
    evidence.actions.push({ label, speech, ...(liveReadErrors?.length ? { liveReadErrors } : {}) });
    checkpoint(`${label}: recorded`);
    console.log(label, JSON.stringify(speech));
  }
  if (expected && required) for (const pattern of Array.isArray(expected) ? expected : [expected]) {
    assert.match(speech.join(" "), pattern, `${label}: actual spoken output`);
  }
  return speech;
}
// Guidepup can retain a delayed generic table-help hint instead of the first
// caption. Request the current VoiceOver item's description once, read-only,
// but still require its actual spoken caption AND table role before proceeding.
async function findNamedTable(label, name) {
  const expected = [name, nativeTableRoleSpeech];
  const automatic = await action(label, () => perform(mac ? reader.keyboardCommands.findNextTable : reader.keyboardCommands.moveToNextTable, navigationOptions),
    expected, { required: !mac });
  if (mac && needsNamedTableRead(automatic, name)) {
    await action(`${label}: VoiceOver Describe Item`, () => perform(reader.keyboardCommands.describeItem, navigationOptions), expected);
  }
  return automatic;
}
// Read-only Describe Item independently names the VoiceOver cursor. The entry
// and description remain separate recordings; a generic help phrase or DOM
// focus alone never counts as spoken link semantics.
async function enterVoiceOverWebArea(prefix, probeKey) {
  let entrySpeech, describedSpeech, focus;
  try {
    entrySpeech = await action(`${prefix} enter web area`, () => perform(reader.keyboardCommands.interactWithItem, navigationOptions), /web content|перейти к содержимому/i);
    describedSpeech = await action(`${prefix} describe skip link`, () => perform(reader.keyboardCommands.describeItem, navigationOptions), [/перейти к содержимому/i, /link|ссылк/i]);
  } finally {
    try { focus = await safari.focus(); }
    catch (error) { focus = { error: error.message }; }
    evidence[probeKey] = focus;
    report[probeKey] = focus;
    checkpoint(`${prefix} enter web area: native focus probed`);
  }
  const observation = validateVoiceOverSkipLink(entrySpeech, describedSpeech, focus);
  evidence.actions.push({ label: `${prefix} entry speech observation`, ...observation });
  checkpoint(`${prefix} skip link verified`);
}
// Move the real screen-reader cursor through the current table, capturing each
// utterance. A row may expose text and its disclosure as separate AX objects;
// hearing the row label alone is not proof that the action is reachable.
async function advanceUntil(pattern, limit = 24, sameItemPatterns = []) {
  for (let step = 0; step < limit; step++) {
    const before = sameItemPatterns.length ? (await reader.spokenPhraseLog()).length : 0;
    await perform(reader.keyboardCommands.moveToNext, navigationOptions);
    const speech = (await reader.spokenPhraseLog()).slice(before).join(" ");
    if ([pattern, ...sameItemPatterns].every(expected => expected.test(speech))) return;
  }
  throw new Error(`Actual screen reader did not reach ${[pattern, ...sameItemPatterns].join(" and ")} within ${limit} items`);
}
// A caption may contain the header's text. Require the coordinate and label in
// the same newly spoken item before using NVDA's table row-navigation command.
async function advanceUntilFirstHeader(pattern, limit = 6) {
  for (let step = 0; step < limit; step++) {
    const before = (await reader.spokenPhraseLog()).length;
    await perform(reader.keyboardCommands.moveToNext, navigationOptions);
    const speech = (await reader.spokenPhraseLog()).slice(before);
    if (firstTableHeaderSpoken(speech, pattern)) return;
  }
  throw new Error(`Actual screen reader did not reach the first table cell named ${pattern} within ${limit} items`);
}
async function screenshot(label) {
  checkpoint(`${label}: capturing screenshot`);
  const bytes = mac ? Buffer.from(await safari.screenshot(), "base64") : await page.screenshot();
  writeFileSync(`${directory}/${label}.png`, bytes);
  evidence.screenshots.push({ label, data: bytes.toString("base64") });
  checkpoint(`${label}: screenshot recorded`);
}
async function geometry() {
  return mac ? safari.geometry() : execute("({width:innerWidth,outer:outerWidth,dpr:devicePixelRatio,scroll:document.documentElement.scrollWidth})");
}
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* server starting */ }
    await delay(250);
  }
  assert.ok(ready, "Production server did not start");
  if (mac) {
    checkpoint("opening native Safari Apple Events window", true);
    safari = await safariDesktop();
    await safari.resize(960, 1000);
    report.browser = { name: "Safari", version: safari.version, control: safari.control };
    await macOSActivate(MacOSApplications.Safari, speechOptions);
  }
  if (mac && process.env.GITHUB_ACTIONS === "true") {
    checkpoint("warming real public VoiceOver app/service", true);
    report.nativeWarmup = await warmVoiceOver({ ci: true });
  }
  checkpoint("starting real screen reader", true);
  await reader.start(speechOptions);
  checkpoint("screen reader started", true);
  report.screenReader = { name: reader.name, version: reader.version };
  if (!mac) {
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
    // Initial-only capture can return while Item Chooser is still dismissing;
    // the following interact then lands outside, not inside, the web area.
    await action("VoiceOver Item Chooser", () => reader.perform(reader.commanderCommands.ITEM_CHOOSER, navigationOptions), voiceOverChooserSpeech);
    await action("VoiceOver web content selection", () => reader.type("web content", navigationOptions), /web content/i);
    await action("VoiceOver web content chosen", () => reader.press("Enter", navigationOptions), /web content/i);
    // With the real page (no injected marker), interact reaches its skip link.
    // An extra next would move into the banner instead of finding h1.
    await enterVoiceOverWebArea("VoiceOver", "focusProbe");
  } else {
    await page.bringToFront();
    await perform(reader.keyboardCommands.exitFocusMode, { capture: false });
    await reader.press("Control+Home");
  }
  await action("structural heading navigation", async () => {
    if (!mac) {
      // NVDA can announce only the host window when Chrome lost foreground focus
      // after page load. Heading navigation is read-only: re-assert document
      // focus and repeat once, recording the condition instead of accepting the
      // window title as a heading.
      for (let attempt = 1; ; attempt++) {
        await reader.nextHeading(navigationOptions);
        const speech = (await reader.spokenPhraseLog()).join(" ");
        if (attempt > 1 || !/\bwindow\b/i.test(speech)) {
          report.headingNavigation = { attempts: attempt, refocused: attempt > 1 };
          return;
        }
        await page.bringToFront();
        await perform(reader.keyboardCommands.exitFocusMode, { capture: false });
        await reader.press("Control+Home");
      }
    }
    // Use VoiceOver's actual Headings rotor rather than treating a Safari web
    // group announcement from VO-Command-H as proof of a heading.
    await perform(reader.keyboardCommands.openWebItemRotor, navigationOptions);
    for (let category = 0; category < 12; category++) {
      // Capture includes category, selected item and help as separate phrases;
      // the last phrase alone can be the item/help, not the category name.
      const speech = [...await reader.spokenPhraseLog()];
      evidence.actions.push({ label: "VoiceOver rotor category", category, speech });
      checkpoint(`VoiceOver rotor category ${category}`);
      // Some VoiceOver configurations speak only the selected rotor item,
      // e.g. "On item 1: TITLE", not its category. Select that native entry,
      // then independently require Describe Item to confirm the heading role.
      if (/headings|заголовки|On item 1:\s*шоу трумана/i.test(speech.join(" "))) break;
      assert.ok(category < 11, "VoiceOver web rotor must expose the article heading entry");
      await reader.press("ArrowRight", navigationOptions);
    }
    await reader.press("Home", navigationOptions);
    // The assertion below must come from the selected heading itself, not the
    // earlier web-area title or the rotor's category/help announcement.
    await reader.clearSpokenPhraseLog();
    await reader.press("Enter", navigationOptions);
    await reader.clearSpokenPhraseLog();
    await perform(reader.keyboardCommands.describeItem, navigationOptions);
  }, [/шоу трумана/i, /heading|заголовок/i]);
  await findNamedTable("native table navigation", /четыре окна/i);
  if (mac) await perform(reader.keyboardCommands.interactWithItem, navigationOptions);
  await action("table column header", () => perform(reader.keyboardCommands.moveToNextColumn, navigationOptions), /переходы/i);
  if (mac) {
    // The native command sometimes reaches the correct cell but Guidepup only
    // captures VoiceOver's later generic help (498b45a). Record that speech as
    // it was; when it lacks the actual row and count, issue VO-R, the read-only
    // Read Table Row command, on the current cursor. It must independently speak
    // both the named row and its detected count; no DOM text substitutes for AT.
    const automatic = await action("table row navigation", () => perform(reader.keyboardCommands.moveDown, navigationOptions));
    if (needsTableRowRead(automatic)) {
      await action("table row read on demand", () => perform(reader.keyboardCommands.readTableRow, navigationOptions), libraryDetectionRowSpeech);
    }
  } else {
    await action("table row header and value", () => perform(reader.keyboardCommands.moveToNextRow, navigationOptions), libraryDetectionRowSpeech);
  }
  await screenshot("table-reading");
  if (mac) await action("leave first table interaction", () => perform(reader.keyboardCommands.stopInteractingWithItem, navigationOptions), /out of[\s\S]*table|(?:вне|выход)[\s\S]*таблиц/i);
  await findNamedTable("corrections table name", /пять утверждений/i);
  if (mac) await perform(reader.keyboardCommands.interactWithItem, navigationOptions);
  await action("corrections column header", () => perform(reader.keyboardCommands.moveToNextColumn, navigationOptions), /что удалось проверить/i);
  await screenshot("corrections-table-reading");
  if (mac) await perform(reader.keyboardCommands.stopInteractingWithItem, navigationOptions);

  // Browser UI zoom, not CSS zoom, deviceScaleFactor or a narrower emulated viewport.
  // The actual article is already loaded and both native table reads completed.
  // Do not reload it merely to measure browser geometry before UI zoom.
  checkpoint("native zoom: reading original browser geometry", true);
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
    checkpoint(`native zoom: navigating ${route}`);
    await go(route);
    checkpoint(`native zoom: measuring ${route}`);
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
  for (const route of ["/", "/films", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making", "/films/the-truman-show?spoilers=none"]) {
    checkpoint(`native zoom: navigating ${route}`);
    await go(route);
    checkpoint(`native zoom: measuring ${route}`);
    const box = await geometry();
    assert.ok(box.scroll <= box.width + 1, `${route}: reflow320 overflow`);
    evidence.actions.push({ label: "native zoom reflow320", route, box });
  }
  // Read the actual responsive film tables using native screen-reader commands
  // at the measured ~320 CSS-pixel browser UI zoom, not a simulated AT tree.
  if (mac) {
    await macOSActivate(MacOSApplications.Safari);
    await action("mobile VoiceOver Item Chooser", () => reader.perform(reader.commanderCommands.ITEM_CHOOSER, navigationOptions), voiceOverChooserSpeech);
    await action("mobile VoiceOver web content selection", () => reader.type("web content", navigationOptions), /web content/i);
    await action("mobile VoiceOver web content chosen", () => reader.press("Enter", navigationOptions), /web content/i);
    await enterVoiceOverWebArea("mobile VoiceOver", "mobileFocusProbe");
  } else {
    await page.bringToFront();
    await perform(reader.keyboardCommands.exitFocusMode, { capture: false });
    await reader.press("Control+Home");
  }
  const sceneTableSpeech = await findNamedTable("mobile scene table name", /сцены фильма/i);
  if (mac) await perform(reader.keyboardCommands.interactWithItem, navigationOptions);
  // NVDA may enter at a native caption, which is outside the cells. Move into
  // the actual column header before using Ctrl+Alt+Down to traverse rows.
  else if (!firstTableCellSpoken(sceneTableSpeech)) {
    await action("mobile scene column header", () => advanceUntilFirstHeader(/сцена и опоры/i), /сцена и опоры/i);
  }
  await action("mobile first scene row", () => perform(mac ? reader.keyboardCommands.moveDown : reader.keyboardCommands.moveToNextRow, navigationOptions), /пролог/i);
  await action("mobile scene supports row", () => perform(mac ? reader.keyboardCommands.moveDown : reader.keyboardCommands.moveToNextRow, navigationOptions), /день\s*10\s*909/i);
  await action("mobile scene supports control", () => advanceUntil(sceneSupportDisclosureSpeech, 24,
    [sceneSupportDisclosureRole, sceneSupportDisclosureCollapsed]),
    [sceneSupportDisclosureSpeech, sceneSupportDisclosureRole, sceneSupportDisclosureCollapsed]);
  await action("mobile open scene supports", () => reader.press(mac ? "Control+Alt+Space" : "Enter", navigationOptions));
  const supportState = mac ? await safari.sceneSupport() : await execute("document.querySelector('#scene-truman-sc-day-10909 .filmSceneSupports').open");
  assert.equal(supportState, true, "The real screen reader must open the named scene disclosure");
  // Navigate by the real link command: VoiceOver can otherwise read the
  // summary name one word at a time and falsely stop on its day number.
  await action("mobile evidence link in scene", () => perform(mac ? reader.keyboardCommands.findNextLink : reader.keyboardCommands.moveToNextLink, navigationOptions),
    [/день\s*10\s*909/i, /link|ссылк/i]);
  if (mac) await perform(reader.keyboardCommands.stopInteractingWithItem, navigationOptions);
  const registerSpeech = await findNamedTable("mobile evidence register name", /реестр проверок/i);
  if (mac) await perform(reader.keyboardCommands.interactWithItem, navigationOptions);
  else if (!firstTableCellSpoken(registerSpeech)) {
    await action("mobile evidence column header", () => advanceUntilFirstHeader(/запись/i), /запись/i);
  }
  await action("mobile evidence observation", () => perform(mac ? reader.keyboardCommands.moveDown : reader.keyboardCommands.moveToNextRow, navigationOptions), /начальное интервью/i);
  await action("mobile evidence basis", () => advanceUntil(/основа/i, 24), /основа/i);
  await action("mobile evidence outcome", () => advanceUntil(/итог/i, 24), /итог/i);
  if (mac) await perform(reader.keyboardCommands.stopInteractingWithItem, navigationOptions);
  await screenshot("reflow320-film-tables");
  await reader.press(mac ? "Meta+0" : "Control+0", { capture: false });
  report.results.push({ browser: name, version: report.browser.version, width: original.width,
    route: "/films/the-truman-show/article?spoilers=full", state: "real-AT-native-zoom", scope: "desktop OS", file: "actual-at.json" });
} catch (error) {
  report.failedPhase = phase;
  const message = inspect(error, { depth: 8, maxStringLength: 16000 });
  report.failures.push(message);
  console.error(workflowError(`${name}: ${message}`));
  if (safari || page) await screenshot("failure").catch(() => {});
  report.results.push({ browser: name, version: report.browser?.version ?? "not-started", width: 0,
    route: "/films/the-truman-show/article?spoilers=full", state: "failure", scope: "desktop OS", file: "actual-at.json" });
} finally {
  clearTimeout(deadline);
  await reader.stop().catch(() => {});
  await safari?.close().catch(error => report.failures.push(`Native Safari cleanup failed: ${error.message}`));
  await browser?.close();
  server.kill();
  writeFileSync(`${directory}/actual-at.json`, JSON.stringify(evidence, null, 2));
  writeFileSync(`${directory}/summary.json`, JSON.stringify(report, null, 2));
}
process.exitCode = report.failures.length ? 1 : 0;
