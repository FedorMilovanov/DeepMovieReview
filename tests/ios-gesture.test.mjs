import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nativeArticlePath, nativeMenuRoutes, nativeScenePath, nativeObservationScript, selectNativeGestureAttachments, startNativeObservationProxy,
  validateNativeGestureTrace, validateNativeMenuSequence, validateNativeMenuTrace, validateNativeSceneTrace, validateNativeSpoilerTrace, validateXCTestSummary } from "../scripts/lib/ios-gesture-probe.mjs";
import { nativeMenuBarrierReady, nativePageBarrierReady, nativeRouteMarkers, openInitialNativePage, shouldRunGestureAfterDriverFailure, simctlCommandOutcome, validateMenuNavigationOutcome, validateNativeRouteMarker, validateSceneNavigationOutcome, validateSpoilerNavigationOutcome } from "../scripts/lib/ios-xctest-gesture.mjs";
import { cancelledTouchWindow, collectTouchDiagnostics, touchLogExcerpt } from "../scripts/lib/ios-touch-diagnostics.mjs";
import { retryableSimulatorCancellation } from "../scripts/lib/ios-cancellation-retry.mjs";
import { withFreshGestureSimulator } from "../scripts/lib/ios-fresh-simulator.mjs";
import { validateSwiftCodeQL } from "../scripts/check-swift-codeql.mjs";
import { packageSwiftEvidence } from "../scripts/publish-swift-codeql-evidence.mjs";
import { projectSafariCapabilities, safariSessionId } from "../scripts/lib/safari-capabilities.mjs";

const origin = "http://127.0.0.1:1234";
const rail = { expanded: "false", hitContained: true, rect: { left: 320, top: 640, right: 390, bottom: 690, width: 70, height: 50 } };
function trace() {
  const common = { pageId: "doc-1", url: `${origin}${nativeArticlePath}?spoilers=full`, width: 390, height: 714, lang: "ru", rail, targetRail: false, scrollY: 0 };
  return [
    { ...common, seq: 1, kind: "ready", sectionIds: ["a", "b"] },
    { ...common, seq: 2, kind: "touchstart", trusted: true, x: 195, y: 528 },
    { ...common, seq: 3, kind: "touchmove", trusted: true },
    { ...common, seq: 4, kind: "scroll", trusted: true, scrollY: 240 },
    { ...common, seq: 5, kind: "touchstart", trusted: true, targetRail: true, scrollY: 240 },
    { ...common, seq: 6, kind: "rail-click", trusted: true, targetRail: true, scrollY: 240 },
    { ...common, seq: 7, kind: "rail-state", rail: { ...rail, expanded: "true" }, scrollY: 240 },
  ];
}

function menuTrace(route = "/", id = "menu-1", start = 100) {
  const control = { hitContained: true, rect: { left: 305, top: 10, right: 385, bottom: 60, width: 80, height: 50 } };
  const closed = { ...control, expanded: "false", navVisible: false, navInert: true, labels: ["Фильмы", "Обзор", "Методология"] };
  const opened = { ...control, expanded: "true", navVisible: true, navInert: false, labels: closed.labels };
  const base = { pageId: id, url: new URL(route, origin).href, width: 390, height: 714, lang: "ru", scrollY: 0, targetMenu: false };
  const row = (seq, kind, extra = {}) => ({ ...base, seq, timestamp: start + seq, kind, ...extra });
  return [row(1, "menu-ready", { menu: closed }),
    row(2, "touchstart", { trusted: true, targetMenu: true, menu: closed }),
    row(3, "touchend", { trusted: true, targetMenu: true }),
    row(4, "menu-click", { trusted: true, targetMenu: true }),
    row(5, "menu-state", { menu: opened }),
    row(6, "touchstart", { trusted: true, targetMenu: true, menu: opened }),
    row(7, "touchend", { trusted: true, targetMenu: true }),
    row(8, "menu-click", { trusted: true, targetMenu: true }),
    row(9, "menu-state", { menu: closed })];
}

test("initial Simulator navigation recovery never retries input and never masks other errors", async () => {
  const timeout = Object.assign(new Error("simctl timeout"), { stderr: "domain=NSPOSIXErrorDomain, code=60: Operation timed out" });
  const wait = async () => {};
  let calls = 0;
  let result = await openInitialNativePage({ open: async () => { calls++; }, events: [], baseUrl: origin, wait });
  assert.equal(calls, 1); assert.equal(result.status, "completed");
  calls = 0;
  result = await openInitialNativePage({ open: async () => { if (++calls === 1) throw timeout; }, events: [], baseUrl: origin, wait });
  assert.equal(calls, 2); assert.equal(result.status, "setup-navigation-retried");
  assert.deepEqual(result.attempts.map(item => item.status), ["timeout", "completed"]);
  calls = 0;
  result = await openInitialNativePage({ open: async () => { calls++; throw timeout; },
    events: [{ kind: "menu-ready", url: `${origin}/` }], baseUrl: origin, wait });
  assert.equal(calls, 1); assert.equal(result.status, "timed-out-home-observed");
  calls = 0;
  result = await openInitialNativePage({ open: async () => { calls++; throw timeout; }, events: [], baseUrl: origin, wait });
  assert.equal(calls, 2); assert.equal(result.status, "timed-out-awaiting-home-observation");
  // The initial URL command result alone never satisfies the real menu oracle.
  assert.throws(() => validateNativeMenuSequence([], origin));
  calls = 0;
  await assert.rejects(openInitialNativePage({ open: async () => { calls++; throw timeout; },
    events: [{ kind: "touchstart" }], baseUrl: origin, wait }), /simctl timeout/);
  assert.equal(calls, 1);
  calls = 0;
  const lateInput = [];
  await assert.rejects(openInitialNativePage({ open: async () => { calls++; throw timeout; },
    events: lateInput, baseUrl: origin, wait: async () => { lateInput.push({ kind: "touchstart" }); } }), /simctl timeout/);
  assert.equal(calls, 1, "Late input must prevent a setup navigation retry");
  calls = 0;
  await assert.rejects(openInitialNativePage({ open: async () => { calls++; throw new Error("different failure"); },
    events: [], baseUrl: origin, wait }), /different failure/);
  assert.equal(calls, 1);
});

test("Swift CodeQL gate rejects findings, extraction failures and vacuous reports", () => {
  // Structure mirrors the actual 881efd6 SARIF: Swift queries live in a pack
  // extension, while the CodeQL driver's own rules array is empty.
  const sources = ["scripts/ios-native-ui/Package.swift", "scripts/ios-native-ui/Tests/NativeGestureTests.swift"];
  const extracted = path => ({ level: "none", descriptor: { id: "swift/diagnostics/successfully-extracted-files" },
    locations: [{ physicalLocation: { artifactLocation: { uri: path, uriBaseId: "%SRCROOT%" } } }] });
  const clean = { version: "2.1.0", runs: [{ tool: { driver: { name: "CodeQL", rules: [] }, extensions: [
    { name: "codeql/swift-queries", rules: [{ id: "swift/rule", properties: { tags: ["security"] } }] },
  ] }, properties: { codeqlConfigSummary: { queries: [{ type: "builtinSuite", uses: "security-extended" }] }, metricResults: [
    { ruleId: "swift/diagnostics/unresolved-ast-nodes", value: 0 },
    { ruleId: "swift/diagnostics/ast-nodes", value: 100 },
    { ruleId: "swift/diagnostics/successfully-extracted-lines", value: 20 },
  ] }, invocations: [{ executionSuccessful: true, toolExecutionNotifications: sources.map(extracted) }], results: [] }] };
  assert.deepEqual(validateSwiftCodeQL(clean), { rules: 1, extracted: sources, findings: 0, problematicNotifications: 0 });
  const raw = Buffer.from(JSON.stringify(clean, null, 2) + "\n");
  const receipt = packageSwiftEvidence(raw, "a".repeat(40));
  assert.deepEqual(Buffer.from(receipt.scans[0].base64, "base64"), raw);
  assert.deepEqual(receipt.summary.failures, []);
  const failed = structuredClone(clean); failed.runs[0].results.push({ ruleId: "swift/security" });
  assert.match(packageSwiftEvidence(Buffer.from(JSON.stringify(failed)), "a".repeat(40)).summary.failures[0], /reported findings/);
  for (const change of [
    data => { data.version = "1.0.0"; },
    data => { data.runs = []; },
    data => { data.runs[0].tool.driver.name = "other"; },
    data => { data.runs[0].tool.extensions[0].rules = []; },
    data => { data.runs[0].tool.extensions[0].rules[0].properties.tags = ["correctness"]; },
    data => { data.runs[0].properties.codeqlConfigSummary.queries[0].uses = "security-default"; },
    data => { data.runs[0].properties.incrementalMode = "diff-informed"; },
    data => { data.runs[0].tool.extensions.push({ name: "codeql-action/pr-diff-range" }); },
    data => { data.runs[0].properties.metricResults[0].value = 1; },
    data => { data.runs[0].properties.metricResults[1].value = 0; },
    data => { data.runs[0].properties.metricResults.pop(); },
    data => { data.runs[0].invocations = []; },
    data => { data.runs[0].invocations[0].executionSuccessful = false; },
    data => { data.runs[0].invocations[0].toolExecutionNotifications.push({ level: "warning" }); },
    data => { data.runs[0].invocations[0].toolConfigurationNotifications = [{ level: "error" }]; },
    data => { data.runs[0].invocations[0].toolExecutionNotifications = []; },
    data => { data.runs[0].invocations[0].toolExecutionNotifications[0].locations[0].physicalLocation.artifactLocation.uri = "scripts/ios-native-ui/another.swift"; },
    data => { delete data.runs[0].invocations[0].toolExecutionNotifications[0].locations[0].physicalLocation.artifactLocation.uriBaseId; },
    data => { data.runs[0].invocations[0].toolExecutionNotifications.push({ level: "none", descriptor: { id: "swift/diagnostics/extraction-errors" } }); },
    data => { delete data.runs[0].results; },
    data => { data.runs[0].results.push({ ruleId: "swift/security", level: "warning" }); },
  ]) { const changed = structuredClone(clean); change(changed); assert.throws(() => validateSwiftCodeQL(changed)); }
});

test("SafariDriver evidence retains only validated simulator identity", () => {
  const input = { browserName: "Safari", browserVersion: "26.5", platformName: "iOS", "safari:useSimulator": true,
    "safari:deviceType": "iPhone", "safari:deviceName": "iPhone 17 Pro", "safari:platformVersion": "26.5",
    "safari:deviceUDID": "F0C70C77-E423-4478-B648-3D25045B311B", "safari:platformBuildVersion": "23F77",
    unexpected: "arbitrary network content" };
  const output = projectSafariCapabilities(input);
  assert.equal(output.browserVersion, "26.5");
  assert.equal(output["safari:deviceUDID"], input["safari:deviceUDID"]);
  assert.equal(Object.hasOwn(output, "unexpected"), false);
  assert.equal(safariSessionId("A1-2B"), "A1-2B");
  for (const invalid of ["", "../session", "foo?bar", "x".repeat(129), null]) assert.throws(() => safariSessionId(invalid));
  for (const change of [
    value => { value.browserName = "Chrome"; },
    value => { value.platformName = "macOS"; },
    value => { value["safari:useSimulator"] = false; },
    value => { value["safari:deviceType"] = "iPad"; },
    value => { value.browserVersion = "26.5\n<script>"; },
    value => { value["safari:deviceName"] = "../../evil"; },
    value => { value["safari:platformVersion"] = "26.5.0.0.1"; },
    value => { value["safari:deviceUDID"] = "../secret"; },
    value => { value["safari:platformBuildVersion"] = "<html>"; },
    value => { delete value.browserVersion; },
  ]) { const changed = { ...input }; change(changed); assert.throws(() => projectSafariCapabilities(changed)); }
});

test("simctl diagnostics preserve failure without treating command completion as page arrival", () => {
  assert.deepEqual(simctlCommandOutcome(undefined), { status: "completed" });
  const error = Object.assign(new Error("timeout"), { code: 60, killed: true, signal: "SIGTERM", stderr: "operation timed out" });
  assert.deepEqual(simctlCommandOutcome(error), { status: "failed", code: 60, killed: true, signal: "SIGTERM", detail: "timeout\noperation timed out" });
  assert.equal(simctlCommandOutcome(new Error("x".repeat(5000))).detail.length, 4000);
  // This diagnostic is not a passing navigation result without a new page.
  assert.throws(() => validateMenuNavigationOutcome({ error: undefined, from: { closed: { timestamp: 1 } },
    to: "/films", next: undefined, baseUrl: origin }));
});

test("menu readiness barrier waits for a fresh observed route without treating it as a passing tap", () => {
  const menus = validateNativeMenuSequence(nativeMenuRoutes.flatMap((route, i) => menuTrace(route, `menu-${i}`, 100 + 100 * i)), origin);
  const ready = { ...menuTrace("/films", "new-films", 210)[0] };
  const check = (events, extra = {}) => nativeMenuBarrierReady({ stage: "menu-films", events, baseUrl: origin, completedMenus: menus.slice(0, 1), ...extra });
  assert.equal(check([]), false, "no document observed yet");
  assert.equal(check([{ ...ready, kind: "touchstart", targetMenu: false }, ready]), true, "barrier is readiness only; final trace rejects a bad tap");
  assert.throws(() => validateNativeMenuTrace([ready], origin, "/films"), /trusted touch/);
  assert.equal(check([{ ...ready, timestamp: 100 }]), false, "ready must follow the previous close");
  assert.equal(check([{ ...ready, pageId: menus[0].pageId }]), false, "previous document is stale");
  assert.equal(check([{ ...ready, url: `${origin}/` }]), false);
  assert.equal(check([{ ...ready, menu: { ...ready.menu, hitContained: false } }]), false);
  assert.equal(check([{ ...ready, menu: { ...ready.menu, expanded: "true" } }]), false);
  assert.equal(check([{ ...ready, width: 1000 }]), false);
  assert.equal(check([ready], { completedMenus: [] }), false);
  assert.equal(check([ready], { completedMenus: [{ ...menus[0], route: "/wrong" }] }), false);
  assert.equal(check([ready], { completedMenus: [{ ...menus[0], closed: {} }] }), false);
  assert.equal(check([ready], { stage: "unknown" }), false);
  assert.equal(check([menuTrace("/", "home", 100)[0]], { stage: "menu-home", completedMenus: [] }), true);
  for (let i = 0; i < nativeMenuRoutes.length; i++) {
    const stage = ["menu-home", "menu-films", "menu-article", "menu-making"][i];
    const event = menuTrace(nativeMenuRoutes[i], `fresh-${i}`, 1000 + i * 100)[0];
    assert.equal(check([event], { stage, completedMenus: menus.slice(0, i) }), true, stage);
    assert.match(readFileSync("scripts/ios-native-ui/Tests/NativeGestureTests.swift", "utf8"), new RegExp(`waitForBarrier\\(\\"${stage}\\"\\)`));
  }
});

test("native readiness barrier rejects stale articles and requires a new FULL document at each stage", () => {
  const menus = validateNativeMenuSequence(nativeMenuRoutes.flatMap((route, i) => menuTrace(route, `menu-${i}`, 100 + 100 * i)), origin);
  const options = { baseUrl: origin, completedMenus: menus, stage: "gesture" };
  const ready = { ...trace()[0], pageId: "fresh", timestamp: 510, spoiler: { fullSelected: true, noneSelected: false } };
  const check = (events, extra = {}) => nativePageBarrierReady({ ...options, events, ...extra });
  assert.equal(check([]), false);
  assert.equal(check([ready], { completedMenus: menus.slice(0, 3) }), false);
  assert.equal(check([{ ...ready, timestamp: 408 }]), false, "old document predates final menu close");
  assert.equal(check([{ ...ready, pageId: menus[2].pageId }]), false, "menu article is not the fresh document");
  assert.equal(check([{ ...ready, url: `${origin}${nativeArticlePath}` }]), false, "NONE is not FULL");
  assert.equal(check([{ ...ready, spoiler: { fullSelected: false, noneSelected: true } }]), false);
  assert.equal(check([{ ...ready, rail: { ...rail, hitContained: false } }]), false);
  assert.equal(check([ready]), true);
  assert.equal(check([ready], { stage: "spoiler" }), false, "scene evidence must arrive first");
  const arrived = { kind: "scene-evidence-arrived", timestamp: 600, pageId: "scene" };
  assert.equal(check([ready, arrived], { stage: "spoiler" }), false, "gesture document is stale after the scene");
  assert.equal(check([ready, arrived, { ...ready, timestamp: 610, pageId: "fresh-spoiler" }], { stage: "spoiler" }), true);
  assert.equal(check([ready], { stage: "unknown" }), false);
});

test("four native menus require distinct ordered documents and uninterrupted trusted open/close touches", () => {
  const rows = nativeMenuRoutes.flatMap((route, i) => menuTrace(route, `menu-${i}`, 100 + 100 * i));
  const measured = validateNativeMenuSequence([...rows].reverse(), origin);
  assert.deepEqual(measured.map(item => item.route), nativeMenuRoutes);
  assert.equal(measured[0].opened.menu.navVisible, true);
  assert.equal(measured[3].closed.menu.navInert, true);
  assert.equal(validateNativeMenuTrace([...menuTrace()].reverse(), origin, "/").opening.click.trusted, true);
  assert.throws(() => validateNativeMenuTrace(rows, origin, "/unknown"));
  for (const [name, change] of [
    ["wrong route", list => { list[0].url += "films"; }],
    ["wide viewport", list => { list[0].width = 1000; }],
    ["wrong language", list => { list[0].lang = "en"; }],
    ["scrolled initial state", list => { list[0].scrollY = 80; }],
    ["occluded menu", list => { list[0].menu = { ...list[0].menu, hitContained: false }; }],
    ["initially open", list => { list[0].menu = { ...list[0].menu, expanded: "true" }; }],
    ["untrusted touch", list => { list[1].trusted = false; }],
    ["wrong target", list => { list[1].targetMenu = false; }],
    ["missing touchend", list => { list[2].kind = "touchcancel"; }],
    ["untrusted opening click", list => { list[3].trusted = false; }],
    ["earlier failed touch", list => { list.splice(1, 0, { ...list[1], seq: 1.5, timestamp: 101.5, trusted: false }); }],
    ["repeated touch inside gesture", list => { list.splice(3, 0, { ...list[1], seq: 3.5, timestamp: 103.5 }); }],
    ["navigation never visibly opens", list => { list[4].menu = { ...list[4].menu, navVisible: false }; }],
    ["navigation remains inert", list => { list[4].menu = { ...list[4].menu, navInert: true }; }],
    ["missing navigation link", list => { list[4].menu = { ...list[4].menu, labels: ["Фильмы"] }; }],
    ["closing touch cancelled", list => { list[6].kind = "touchcancel"; }],
    ["untrusted closing click", list => { list[7].trusted = false; }],
    ["navigation never closes", list => { list[8].menu = list[4].menu; }],
    ["closed navigation not inert", list => { list[8].menu = { ...list[8].menu, navInert: false }; }],
    ["extra tap after close", list => { list.push({ ...list[1], seq: 10, timestamp: 110 }); }],
    ["duplicate sequence", list => { list[6].seq = list[5].seq; }],
    ["time goes backwards", list => { list[7].timestamp = 104; }],
    ["route changed mid-document", list => { list[7].url += "#fragment"; }],
  ]) { const list = menuTrace(); change(list); assert.throws(() => validateNativeMenuTrace(list, origin, "/"), undefined, name); }
  const sameDoc = nativeMenuRoutes.flatMap((route, i) => menuTrace(route, i === 1 ? "menu-0" : `menu-${i}`, 100 + 100 * i));
  assert.throws(() => validateNativeMenuSequence(sameDoc, origin));
  const outOfOrder = nativeMenuRoutes.flatMap((route, i) => menuTrace(route, `menu-${i}`, i === 1 ? 90 : 100 + 100 * i));
  assert.throws(() => validateNativeMenuSequence(outOfOrder, origin));
});

test("menu navigation errors are never accepted without the subsequent distinct exact page", () => {
  const from = validateNativeMenuTrace(menuTrace(), origin, "/");
  const next = menuTrace("/films", "next", 300)[0];
  const timeout = Object.assign(new Error("simctl timed out"), {
    stderr: "domain=NSPOSIXErrorDomain, code=60: Operation timed out",
  });
  const input = { from, to: "/films", next, baseUrl: origin };
  assert.equal(validateMenuNavigationOutcome(input).status, "simctl-completed");
  assert.equal(validateMenuNavigationOutcome({ ...input, error: timeout }).status, "simctl-timed-out-but-next-page-independently-observed");
  assert.throws(() => validateMenuNavigationOutcome({ ...input, error: new Error("permission denied") }), /permission denied/);
  assert.throws(() => validateMenuNavigationOutcome({ ...input, error: timeout, next: undefined }));
  assert.throws(() => validateMenuNavigationOutcome({ ...input, next: { ...next, pageId: from.pageId } }));
  assert.throws(() => validateMenuNavigationOutcome({ ...input, next: { ...next, timestamp: from.closed.timestamp } }));
  assert.throws(() => validateMenuNavigationOutcome({ ...input, next: { ...next, url: `${origin}/` } }));
});

test("native gesture acceptance requires ordered trusted touch, real scroll and a visible rail activation", () => {
  assert.equal(validateNativeGestureTrace(trace().reverse(), origin).opened.rail.expanded, "true");
  const multiple = [...trace(), { ...trace()[0], pageId: "later-full" }];
  assert.equal(validateNativeGestureTrace(multiple, origin, { pageId: "doc-1" }).pageId, "doc-1");
  assert.throws(() => validateNativeGestureTrace(multiple, origin, { pageId: "later-full" }));
  for (const [name, change] of [
    ["no full article", rows => { rows[0].url = `${origin}${nativeArticlePath}`; }],
    ["different page", rows => { rows[3].pageId = "stale"; }],
    ["no actual touch", rows => { rows[1].trusted = false; }],
    ["touch outside viewport", rows => { rows[1].x = 500; }],
    ["no actual move", rows => { rows[2].trusted = false; }],
    ["movement belongs to another gesture", rows => { rows.splice(3, 0, { ...rows[1], seq: 3.5 }); }],
    ["no real scroll", rows => { rows[3].scrollY = 29; }],
    ["wrong order", rows => { rows[3].seq = 1.5; }],
    ["article returned to top before the rail tap", rows => { rows[4].scrollY = 0; }],
    ["occluded target", rows => { rows[4].rail = { ...rail, hitContained: false }; }],
    ["offscreen target", rows => { rows[4].rail = { ...rail, rect: { ...rail.rect, right: 900 } }; }],
    ["untrusted click", rows => { rows[5].trusted = false; }],
    ["disclosure did not open", rows => { rows[6].rail = rail; }],
    ["disclosure opened before click", rows => { rows[6].seq = 5.5; }],
    ["duplicate event", rows => { rows[2].seq = 2; }],
    ["not the full projection", rows => { rows[0].sectionIds = ["a"]; }],
    ["not mobile", rows => { rows[0].width = 1200; }],
  ]) {
    const rows = trace(); change(rows);
    assert.throws(() => validateNativeGestureTrace(rows, origin), undefined, name);
  }
});

test("native spoiler trace requires one completed trusted touch and the exact independent NONE projection", () => {
  const target = { hitContained: true, rect: { left: 20, top: 440, right: 200, bottom: 484, width: 180, height: 44 } };
  const full = { fullSelected: true, noneSelected: false, lastSectionPresent: true, target };
  const none = { fullSelected: false, noneSelected: true, lastSectionPresent: false, target };
  const common = { pageId: "full", url: `${origin}${nativeArticlePath}?spoilers=full`, width: 390, height: 714,
    lang: "ru", scrollY: 0, spoiler: full, targetSpoiler: false };
  const baseline = { fullSectionIds: ["one", "last"], expectedSectionIds: ["one"],
    afterScene: { kind: "scene-evidence-arrived", timestamp: 1000 } };
  const trace = () => [
    { ...common, seq: 1, timestamp: 1100, kind: "ready", sectionIds: ["one", "last"] },
    { ...common, seq: 2, timestamp: 1110, kind: "touchstart", trusted: true, targetSpoiler: true },
    { ...common, seq: 3, timestamp: 1120, kind: "touchend", trusted: true, targetSpoiler: true },
    { ...common, seq: 4, timestamp: 1130, kind: "spoiler-click", trusted: true, targetSpoiler: true },
    { ...common, seq: 1, timestamp: 1200, pageId: "none", url: `${origin}${nativeArticlePath}`,
      kind: "ready", sectionIds: ["one"], spoiler: none },
  ];
  assert.equal(validateNativeSpoilerTrace(trace().reverse(), origin, baseline).after.spoiler.noneSelected, true);
  const timeout = Object.assign(new Error("simctl navigation timed out"), {
    stderr: "An error was encountered processing the command (domain=NSPOSIXErrorDomain, code=60): Operation timed out",
  });
  assert.equal(validateSpoilerNavigationOutcome({ error: timeout, events: trace(), baseUrl: origin,
    baseline, afterScene: baseline.afterScene }).status, "simctl-timed-out-but-spoiler-independently-observed");
  assert.equal(validateSpoilerNavigationOutcome({ events: trace(), baseUrl: origin,
    baseline, afterScene: baseline.afterScene }).status, "simctl-completed");
  assert.throws(() => validateSpoilerNavigationOutcome({ error: new Error("permission denied"), events: trace(), baseUrl: origin,
    baseline, afterScene: baseline.afterScene }), /permission denied/);
  assert.throws(() => validateSpoilerNavigationOutcome({ error: timeout, events: trace().slice(0, -1), baseUrl: origin,
    baseline, afterScene: baseline.afterScene }), /NONE/);
  for (const [name, change] of [
    ["wrong FULL selection", rows => { rows[0].spoiler = none; }],
    ["FULL not equal to SSR", rows => { rows[0].sectionIds = ["one", "other"]; }],
    ["FULL precedes the scene", rows => { rows[0].timestamp = 999; }],
    ["untrusted touch", rows => { rows[1].trusted = false; }],
    ["wrong target", rows => { rows[1].targetSpoiler = false; }],
    ["occluded option", rows => { rows[1].spoiler = { ...full, target: { ...target, hitContained: false } }; }],
    ["offscreen option", rows => { rows[1].spoiler = { ...full, target: { ...target, rect: { ...target.rect, right: 500 } } }; }],
    ["touch cancelled", rows => { rows[2].kind = "touchcancel"; }],
    ["prior failed touch is not a retry", rows => { rows.splice(1, 0, { ...rows[1], seq: 1.5 }); }],
    ["click belongs to a second touch", rows => { rows.splice(3, 0, { ...rows[1], seq: 3.5 }); }],
    ["timestamps out of order", rows => { rows[2].timestamp = 1150; }],
    ["untrusted click", rows => { rows[3].trusted = false; }],
    ["same document", rows => { rows[4].pageId = "full"; }],
    ["NONE before the click", rows => { rows[4].timestamp = 1129; }],
    ["wrong spoiler URL", rows => { rows[4].url += "?spoilers=full"; }],
    ["incomplete NONE projection", rows => { rows[4].sectionIds = []; }],
    ["last FULL section leaked", rows => { rows[4].spoiler = { ...none, lastSectionPresent: true }; }],
    ["NONE not selected", rows => { rows[4].spoiler = { ...none, noneSelected: false }; }],
    ["FULL also selected", rows => { rows[4].spoiler = { ...none, fullSelected: true }; }],
    ["duplicate events", rows => { rows[2].seq = 2; }],
  ]) { const rows = trace(); change(rows); assert.throws(() => validateNativeSpoilerTrace(rows, origin, baseline), undefined, name); }
  assert.throws(() => validateNativeSpoilerTrace(trace(), origin, { ...baseline, expectedSectionIds: ["one", "last"] }));
  assert.throws(() => validateNativeSpoilerTrace(trace(), origin, { ...baseline, afterScene: { kind: "ready", timestamp: 1000 } }));
});

test("native scene lookup retains the complete accessible name and emits failure diagnostics", () => {
  const swift = readFileSync("scripts/ios-native-ui/Tests/NativeGestureTests.swift", "utf8");
  assert.match(swift, /let description = "Опоры · 6 — сцена «День 10 909»"/);
  assert.match(swift, /NSPredicate\(format: "label CONTAINS %@", description\)/);
  assert.match(swift, /scene-related AX entries/);
  assert.match(swift, /DMR-scene-disclosure-missing/);
  const observer = nativeObservationScript("0123456789abcdef0123456789abcdef");
  assert.match(observer, /supportLabel: support\?\.getAttribute\('aria-label'\)/);
  assert.match(observer, /supportText: support\?\.textContent\?\.trim\(\)/);
});

test("native scene trace requires trusted touches, the real disclosure, visible evidence and NONE projection", () => {
  const control = { hitContained: true, rect: { left: 30, top: 120, right: 150, bottom: 165, width: 120, height: 45 } };
  const scene = { open: false, support: control, link: control, sceneScroll: 0, evidenceScroll: 0,
    evidenceRect: { top: 100 }, evidenceText: "Титры Таймкод Сцена Основа Итог", noneSelected: true, endingPresent: false };
  const base = { pageId: "scene-1", url: `${origin}${nativeScenePath}?spoilers=none#scene-truman-sc-day-10909`,
    width: 390, height: 714, lang: "ru", scrollY: 4500, scene, targetSupport: false, targetEvidence: false };
  const trace = () => [
    { ...base, seq: 1, kind: "scene-ready" },
    { ...base, seq: 2, kind: "touchstart", trusted: true, targetSupport: true },
    { ...base, seq: 3, kind: "touchend", trusted: true, targetSupport: true },
    { ...base, seq: 4, kind: "scene-support-click", trusted: true, targetSupport: true },
    { ...base, seq: 5, kind: "scene-support-state", scene: { ...scene, open: true } },
    { ...base, seq: 6, kind: "touchstart", trusted: true, targetEvidence: true, scene: { ...scene, open: true } },
    { ...base, seq: 7, kind: "touchend", trusted: true, targetEvidence: true },
    { ...base, seq: 8, kind: "scene-evidence-click", trusted: true, targetEvidence: true },
    { ...base, seq: 9, kind: "scene-evidence-arrived", url: `${origin}${nativeScenePath}?spoilers=none#evidence-truman-ev-daycount` },
  ];
  assert.equal(validateNativeSceneTrace(trace().reverse(), origin).opened.scene.open, true);
  const timeout = Object.assign(new Error("simctl navigation timed out"), {
    stderr: "An error was encountered processing the command (domain=NSPOSIXErrorDomain, code=60): Operation timed out",
  });
  assert.equal(validateSceneNavigationOutcome({ error: timeout, events: trace(), baseUrl: origin }).status,
    "simctl-timed-out-but-scene-independently-observed");
  assert.equal(validateSceneNavigationOutcome({ events: trace(), baseUrl: origin }).status, "simctl-completed");
  assert.throws(() => validateSceneNavigationOutcome({ error: new Error("permission denied"), events: trace(), baseUrl: origin }), /permission denied/);
  assert.throws(() => validateSceneNavigationOutcome({ error: Object.assign(new Error("other"), { stderr: "code=60: timeout" }), events: trace(), baseUrl: origin }));
  assert.throws(() => validateSceneNavigationOutcome({ error: timeout, events: trace().slice(0, -1), baseUrl: origin }), /destination|arriv|evidence/i,
    "A timeout is never enough without the complete independent scene trace");
  for (const [name, change] of [
    ["untrusted support touch", rows => { rows[1].trusted = false; }],
    ["support touch cancelled", rows => { rows[2].kind = "touchcancel"; }],
    ["support click belongs to a second gesture", rows => { rows.splice(3, 0, { ...rows[1], seq: 3.5 }); }],
    ["untrusted support click", rows => { rows[3].trusted = false; }],
    ["control never opens", rows => { rows[4].scene = scene; }],
    ["link was not touched", rows => { rows[5].targetEvidence = false; }],
    ["link is occluded", rows => { rows[5].scene = { ...scene, open: true, link: { ...control, hitContained: false } }; }],
    ["link touch cancelled", rows => { rows[6].kind = "touchcancel"; }],
    ["link click belongs to a second gesture", rows => { rows.splice(7, 0, { ...rows[5], seq: 7.5 }); }],
    ["untrusted link click", rows => { rows[7].trusted = false; }],
    ["wrong final anchor", rows => { rows[8].url = base.url; }],
    ["hidden ending exposed", rows => { rows[8].scene = { ...scene, endingPresent: true }; }],
    ["wrong spoiler level", rows => { rows[8].scene = { ...scene, noneSelected: false }; }],
    ["evidence not visible", rows => { rows[8].scene = { ...scene, evidenceRect: { top: -300 } }; }],
    ["missing basis", rows => { rows[8].scene = { ...scene, evidenceText: "Титры" }; }],
  ]) { const rows = trace(); change(rows); assert.throws(() => validateNativeSceneTrace(rows, origin), undefined, name); }
});

test("native route markers match the XCTest source and must exist in rendered HTML, not scripts", () => {
  const swift = readFileSync("scripts/ios-native-ui/Tests/NativeGestureTests.swift", "utf8");
  for (const marker of Object.values(nativeRouteMarkers)) {
    assert.ok(swift.includes(`waitForPageMarker("${marker}"`), `XCTest must wait for the same actual route text: ${marker}`);
    assert.doesNotThrow(() => validateNativeRouteMarker(`<p>${marker}: visible text</p>`, marker));
    assert.throws(() => validateNativeRouteMarker(`<p>Other page</p><script>${marker}</script>`, marker), /marker is absent/);
    assert.throws(() => validateNativeRouteMarker(`<p title="${marker}">Other page</p>`, marker), /marker is absent/);
  }
  assert.equal(nativeRouteMarkers["/films"], "Индекс предпросмотра", "Preview CI must not wait for the public-only index copy");
});

test("only a narrow, correlated menu cancellation can trigger one independent Simulator rerun", () => {
  const t = Date.UTC(2026, 10, 2, 20, 27, 24);
  const originalUdid = "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE";
  const report = () => {
    const prior = menuTrace("/", "home", t - 1000);
    const current = menuTrace("/films", "films", t);
    current[1].x = 345; current[1].y = 30;
    const cancel = { ...current[2], kind: "touchcancel", targetMenu: true, menu: null };
    const stamp = new Date(t).toISOString().replace("T", " ").replace("Z", "");
    const excerpt = [
      `${stamp} backboardd digitizer attached (sender ABC123) transport:Recap`,
      `${stamp} backboardd already have a main display digitizer`,
      `${stamp} backboardd didn't see a previous touch down or range-in event for pathIndex:2; skipping event`,
      `${stamp} backboardd cancel -- digitizer did disappear: senderID: 0xABC123; contacts: touching; com.apple.mobilesafari`,
    ].join("\n");
    return { probe: { url: `${origin}/` }, device: { udid: originalUdid, physicalDevice: false },
      xcodebuild: { code: 65, timedOut: false, signal: null },
      xctestSummary: { result: "Failed", totalTestCount: 1, failedTests: 1, passedTests: 0, skippedTests: 0, expectedFailures: 0,
        devicesAndConfigurations: [{ device: { deviceId: originalUdid, platform: "iOS Simulator" } }],
        testFailures: [{ failureText: "XCTAssertTrue failed - The menu button did not expose its open state", testName: "testNativeScrollAndRail()" }] },
      failures: ["XCUITest failed or timed out"], observerErrors: [], events: [...prior, ...current.slice(0, 2), cancel],
      systemTouchDiagnostics: { status: "excerpt-captured", source: "XCTest result bundle's Simulator system.logarchive",
        window: { pageId: "films", started: current[1].timestamp, cancelled: cancel.timestamp }, excerpt } };
  };
  const eligible = retryableSimulatorCancellation(report());
  assert.equal(eligible?.route, "/films");
  assert.match(eligible.reason, /cause not proven/);
  assert.match(eligible.policy, /original attempt remains failed/);
  for (const [name, change] of [
    ["cancelled outside menu", r => { r.events.at(-1).targetMenu = false; }],
    ["touch began elsewhere", r => { r.events.at(-2).targetMenu = false; }],
    ["coordinates outside button", r => { r.events.at(-2).x = 20; }],
    ["untrusted touch", r => { r.events.at(-2).trusted = false; }],
    ["page not ready before touch", r => { r.events.at(-3).seq = 4; }],
    ["gesture moved before cancelling", r => { r.events.splice(-1, 0, { ...r.events.at(-2), seq: 2.5, kind: "touchmove" }); }],
    ["click or second touch", r => { r.events.push({ ...r.events.at(-1), seq: 4, kind: "menu-click" }); }],
    ["previous menu invalid", r => { r.events[3].trusted = false; }],
    ["OS log missing", r => { r.systemTouchDiagnostics.status = "unavailable"; }],
    ["different digitizer", r => { r.systemTouchDiagnostics.excerpt = r.systemTouchDiagnostics.excerpt.replace("senderID: 0xABC123", "senderID: 0xDEF456"); }],
    ["log far from cancellation", r => { r.systemTouchDiagnostics.excerpt = r.systemTouchDiagnostics.excerpt.replaceAll("20:27:24", "20:27:10"); }],
    ["no skipped events", r => { r.systemTouchDiagnostics.excerpt = r.systemTouchDiagnostics.excerpt.replace("skipping event", "completed event"); }],
    ["other XCTest failure", r => { r.xctestSummary.testFailures.push({ failureText: "another" }); }],
    ["more than one source failure", r => { r.failures.push("observer shutdown failed"); }],
    ["observer error", r => { r.observerErrors.push("lost beacon"); }],
    ["timeout", r => { r.xcodebuild.timedOut = true; }],
    ["not Simulator", r => { r.device.physicalDevice = true; }],
    ["wrong device", r => { r.xctestSummary.devicesAndConfigurations[0].device.deviceId = "other"; }],
    ["non-loopback probe", r => { r.probe.url = "https://example.com/"; }],
  ]) { const candidate = report(); change(candidate); assert.equal(retryableSimulatorCancellation(candidate), null, name); }
});

test("fresh CI Simulator runs the complete callback once, uses another UDID and always deletes it", async () => {
  const original = { udid: "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE", physicalDevice: false,
    deviceTypeIdentifier: "com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro", runtime: "com.apple.CoreSimulator.SimRuntime.iOS-26-5" };
  const created = "BBBBBBBB-CCCC-DDDD-EEEE-FFFFFFFFFFFF", app = "/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app";
  const config = { original, simulatorApp: app, ci: true, diagnostic: () => {} };
  const makeRunner = (failure) => {
    const calls = [];
    return { calls, run(command, args) {
      calls.push([command, ...args]);
      if (failure && failure(command, args)) throw new Error("fake simctl failure");
      if (args[1] === "create") return created;
      return "";
    } };
  };
  let fake = makeRunner(), callbacks = 0;
  const result = await withFreshGestureSimulator(config, async device => { callbacks++; assert.equal(device.udid, created); return "strict pass"; }, fake);
  assert.equal(result, "strict pass"); assert.equal(callbacks, 1);
  const warmIndex = fake.calls.findIndex(call => call[1] === "simctl" && call[2] === "launch" &&
    call[3] === created && call[4] === "com.apple.mobilesafari");
  const bootIndex = fake.calls.findIndex(call => call[1] === "simctl" && call[2] === "bootstatus");
  assert.ok(bootIndex >= 0 && warmIndex > bootIndex,
    "Fresh native Safari must warm after boot and before XCTest");
  assert.deepEqual(fake.calls.filter(call => call[1] === "simctl" && ["shutdown", "delete"].includes(call[2]))
    .map(call => [call[2], call[3]]), [["shutdown", original.udid], ["shutdown", created], ["delete", created]]);
  fake = makeRunner((_command, args) => args[1] === "launch");
  callbacks = 0;
  await assert.rejects(withFreshGestureSimulator(config, async () => { callbacks++; }, fake),
    /fake simctl failure/);
  assert.equal(callbacks, 0, "Failed Safari launch must not invoke native tests");
  assert.ok(fake.calls.some(call => call[2] === "delete" && call[3] === created),
    "Failed warmup must clean up its disposable Simulator");
  fake = makeRunner(); callbacks = 0;
  await assert.rejects(withFreshGestureSimulator({ ...config, ci: false }, async () => { callbacks++; }, fake), /disposable CI/);
  assert.equal(fake.calls.length, 0); assert.equal(callbacks, 0);
  fake = makeRunner((_command, args) => args[1] === "bootstatus");
  await assert.rejects(withFreshGestureSimulator(config, async () => { callbacks++; }, fake), /fake simctl failure/);
  assert.ok(fake.calls.some(call => call[2] === "delete" && call[3] === created)); assert.equal(callbacks, 0);
  fake = makeRunner();
  await assert.rejects(withFreshGestureSimulator(config, async () => { callbacks++; throw new Error("strict second run failed"); }, fake), /strict second run failed/);
  assert.equal(callbacks, 1); assert.ok(fake.calls.some(call => call[2] === "delete" && call[3] === created));
  fake = makeRunner((_command, args) => args[1] === "delete");
  await assert.rejects(withFreshGestureSimulator(config, async () => "pass", fake), /fake simctl failure/);
  fake = makeRunner();
  fake.run = (command, args) => { fake.calls.push([command, ...args]); return args[1] === "create" ? original.udid : ""; };
  await assert.rejects(withFreshGestureSimulator(config, async () => "pass", fake), /distinct Simulator/);
  assert.ok(!fake.calls.some(call => call[2] === "delete"), "never delete the original device");
});

test("OS touch diagnostics are bounded, retain cancellation provenance and never infer a cause", () => {
  const start = { kind: "touchstart", trusted: true, timestamp: 100000, pageId: "one", seq: 3 };
  const cancel = { kind: "touchcancel", trusted: true, timestamp: 100120, pageId: "one", seq: 4 };
  assert.deepEqual(cancelledTouchWindow([cancel, start]), { pageId: "one", started: 100000, cancelled: 100120, start: 90000, end: 110120 });
  assert.equal(cancelledTouchWindow([]), null);
  assert.equal(cancelledTouchWindow([start, { ...cancel, trusted: false }]), null);
  assert.equal(cancelledTouchWindow([start, { ...cancel, pageId: "different" }]), null);
  assert.equal(cancelledTouchWindow([start, { ...cancel, timestamp: 99999 }]), null);
  assert.equal(cancelledTouchWindow([start, { ...cancel, timestamp: 111000 }]), null);
  assert.equal(cancelledTouchWindow([start, { ...cancel, seq: 5 }, { ...start, seq: 4, kind: "touchend" }]), null);
  const log = ["2026 backboardd[12] unknown digitizer and skipping event",
    "2026 testmanagerd[4] playback initiated", "2026 unrelated[5] unknown digitizer",
    "2026 backboardd[12] unrelated line", "2026 backboardd[12] digitizer GH_TOKEN secret",
    "2026 testmanagerd[4] playback https://example.invalid/path"].join("\n");
  const excerpt = touchLogExcerpt(log);
  assert.match(excerpt, /unknown digitizer/); assert.match(excerpt, /playback initiated/);
  assert.doesNotMatch(excerpt, /unrelated|GH_TOKEN|secret|example\.invalid/);
  assert.ok(touchLogExcerpt(Array(100).fill("backboardd digitizer " + "x".repeat(1000)).join("\n")).length <= 16000);
});

test("touch forensics selects exactly the failed device archive and stays diagnostic-only", async () => {
  const udid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  const events = [{ kind: "touchstart", trusted: true, timestamp: 1793564203189, pageId: "doc", seq: 1 },
    { kind: "touchcancel", trusted: true, timestamp: 1793564203284, pageId: "doc", seq: 2 }];
  const commands = []; let exported;
  const run = async (command, args) => {
    commands.push({ command, args });
    if (command === "xcrun") {
      exported = args[args.indexOf("--output-path") + 1];
      mkdirSync(join(exported, "action", "simctl_diagnostics", udid.toUpperCase(), "system.logarchive"), { recursive: true });
      return { stdout: "" };
    }
    assert.equal(command, "/usr/bin/log");
    assert.ok(args.includes("2026-11-01 20:16:33+0000"));
    assert.ok(args.includes("2026-11-01 20:16:53+0000"));
    return { stdout: "2026 backboardd[12] unknown digitizer\nprivate unrelated text" };
  };
  const result = await collectTouchDiagnostics({ bundle: "/result.xcresult", udid, events }, { run });
  assert.equal(result.status, "excerpt-captured"); assert.match(result.excerpt, /unknown digitizer/);
  assert.match(result.note, /neither a log phrase nor its absence/); assert.equal(commands.length, 2);
  assert.equal(existsSync(exported), false, "temporary diagnostic exports must be removed");
  assert.deepEqual(await collectTouchDiagnostics({ bundle: "unused", udid, events: [] }, { run }),
    { status: "no-observed-complete-cancellation-window" });
  await assert.rejects(collectTouchDiagnostics({ bundle: "unused", udid: "invalid", events }, { run }), /Invalid Simulator/);
  const missing = await collectTouchDiagnostics({ bundle: "unused", udid, events }, { run: async (_command, args) => {
    mkdirSync(args[args.indexOf("--output-path") + 1], { recursive: true }); return { stdout: "" };
  } });
  assert.equal(missing.status, "device-logarchive-unavailable-or-ambiguous");
});

test("historical iOS recovery validates provenance and publishes only a neutral diagnostic", { skip: process.platform === "win32" }, () => {
  const directory = mkdtempSync(join(tmpdir(), "dmr-history-test-"));
  const fake = join(directory, "gh"), calls = join(directory, "posted.json"), previous = "a".repeat(40);
  try {
    writeFileSync(fake, `#!/usr/bin/env node
const fs = require("node:fs"), path = require("node:path");
const a = process.argv.slice(2), current = process.env.DMR_FAKE_CURRENT, previous = "${previous}";
if (a.includes("--status")) process.exit(9);
if (a[0] === "run" && a[1] === "list") console.log(JSON.stringify([
  { databaseId: 2, headSha: current, status: "in_progress", url: "https://github.com/current" },
  { databaseId: 1, headSha: previous, status: "completed", url: "https://github.com/prior" }]));
else if (a[0] === "run" && a[1] === "view") console.log(JSON.stringify({ jobs: [{ name: "Native iOS Safari", conclusion: "failure" }] }));
else if (a[0] === "run" && a[1] === "download") {
  const root = path.join(a[a.indexOf("--dir") + 1], "ios-gesture"); fs.mkdirSync(path.join(root, "native-gesture.xcresult"), { recursive: true });
  fs.writeFileSync(path.join(root, "summary.json"), JSON.stringify({ revision: process.env.DMR_FAKE_BAD ? "bad" : previous, failures: ["failed"], events: [] }));
} else if (a[0] === "api" && a.includes("POST")) { fs.writeFileSync(process.env.DMR_FAKE_CALLS, JSON.stringify(a)); console.log("{}"); }
else if (a[0] === "api") console.log(JSON.stringify({ artifacts: [{ id: 42, name: "actual-ios-" + previous, expired: false, size_in_bytes: 1000 }] }));
else process.exit(8);
`, { mode: 0o755 });
    const current = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    const env = { ...process.env, PATH: `${directory}:${process.env.PATH}`, GITHUB_HEAD_REF: "session", GITHUB_REPOSITORY: "owner/repo",
      DMR_FAKE_CURRENT: current, DMR_FAKE_CALLS: calls };
    const run = extra => execFileSync(process.execPath, ["scripts/recover-prior-ios-touch.mjs"], { encoding: "utf8", env: { ...env, ...extra }, timeout: 10000 });
    const result = run({});
    assert.match(result, new RegExp(previous)); assert.match(result, /artifact 42/); assert.match(result, /no-observed-complete-cancellation-window/);
    const posted = JSON.parse(readFileSync(calls, "utf8"));
    assert.ok(posted.includes("conclusion=neutral")); assert.ok(posted.some(arg => arg.includes("historical only")));
    assert.ok(posted.some(arg => arg.includes(previous) && arg.includes("does not change any native test verdict")));
    const rejected = run({ DMR_FAKE_BAD: "true" });
    assert.match(rejected, /unavailable at artifact validation/); assert.doesNotMatch(rejected, /artifact 42/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("a failed driver allows only one independent gesture on an established booted simulator", () => {
  const report = { failures: ["driver failed"], device: { state: "Booted" }, capabilities: { platformName: "iOS" } };
  const gesture = { phase: "not started" };
  assert.equal(shouldRunGestureAfterDriverFailure(report, gesture), true);
  assert.equal(shouldRunGestureAfterDriverFailure({ ...report, failures: [] }, gesture), false);
  assert.equal(shouldRunGestureAfterDriverFailure({ ...report, device: { state: "Shutdown" } }, gesture), false);
  assert.equal(shouldRunGestureAfterDriverFailure({ ...report, capabilities: null }, gesture), false);
  assert.equal(shouldRunGestureAfterDriverFailure(report, { phase: "opening Safari" }), false);
  assert.equal(shouldRunGestureAfterDriverFailure(report, { phase: "not started", attempted: true }), false);
  assert.deepEqual(report.failures, ["driver failed"], "independent eligibility cannot clear the original failure");
});

test("XCTest evidence must contain exactly one passed, unskipped test on the chosen iOS Simulator", () => {
  const udid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  const good = { result: "Passed", totalTestCount: 1, passedTests: 1, failedTests: 0, skippedTests: 0, expectedFailures: 0,
    devicesAndConfigurations: [{ device: { deviceId: udid.toUpperCase(), platform: "iOS Simulator" } }] };
  validateXCTestSummary(good, udid);
  for (const change of [
    { totalTestCount: 0, passedTests: 0 }, { totalTestCount: 2, passedTests: 2 }, { passedTests: 0, skippedTests: 1 },
    { failedTests: 1 }, { expectedFailures: 1 }, { result: "Failed" }, { devicesAndConfigurations: [] },
    { devicesAndConfigurations: [{ device: { deviceId: udid, platform: "iOS" } }] },
    { devicesAndConfigurations: [{ device: { deviceId: "other", platform: "iOS Simulator" } }] },
  ]) assert.throws(() => validateXCTestSummary({ ...good, ...change }, udid));
});

test("XCTest exports only the explicitly named screenshots, not arbitrary failure images", () => {
  const rows = ["DMR-menu-home-open", "DMR-menu-films-open", "DMR-menu-article-open", "DMR-menu-making-open",
    "DMR-before-native-scroll", "DMR-after-native-scroll", "DMR-after-native-rail-tap",
    "DMR-scene-before-support", "DMR-scene-support-open", "DMR-scene-evidence",
    "DMR-spoiler-before-full", "DMR-spoiler-after-input"].map((name, i) => ({
    suggestedHumanReadableName: `${name}_0_AAAAAAAA-BBBB.png`, exportedFileName: `F${i}-A.png`,
  }));
  assert.deepEqual(selectNativeGestureAttachments([{ attachments: [...rows, { suggestedHumanReadableName: "Failure", exportedFileName: "fail.png" }] }]).map(x => x.file), ["F0-A.png", "F1-A.png", "F2-A.png", "F3-A.png", "F4-A.png", "F5-A.png", "F6-A.png", "F7-A.png", "F8-A.png", "F9-A.png", "F10-A.png", "F11-A.png"]);
  assert.throws(() => selectNativeGestureAttachments([{ attachments: rows.slice(0, 2) }]));
  assert.throws(() => selectNativeGestureAttachments([{ attachments: [...rows, rows[0]] }]));
  assert.throws(() => selectNativeGestureAttachments([{ attachments: [{ ...rows[0], exportedFileName: "../secret.png" }, ...rows.slice(1)] }]));
});

test("loopback observer is valid JavaScript, is passive and requires a fresh token", async () => {
  const script = nativeObservationScript("0123456789abcdef0123456789abcdef");
  // Parse only; never evaluate the observer source as test-runner code.
  const syntax = spawnSync(process.execPath, ["--check"], { input: script, encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);
  const invalid = spawnSync(process.execPath, ["--check"], { input: "const = ;", encoding: "utf8" });
  assert.ok(Number.isInteger(invalid.status) && invalid.status !== 0, "syntax oracle must reject malformed JavaScript");
  assert.throws(() => nativeObservationScript("not-a-token"));
  assert.doesNotMatch(script, /\.(?:click|scrollTo|scrollBy|dispatchEvent)\s*\(/);
  const upstream = http.createServer((req, res) => {
    if (req.url === "/asset") { res.writeHead(200, { "content-type": "text/plain", "x-original": "yes" }).end("asset"); return; }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-security-policy": "script-src 'self'" });
    res.end("<html><head><title>original</title></head><body>the unmodified article</body></html>");
  }).listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const proxy = await startNativeObservationProxy({ upstream: `http://127.0.0.1:${upstream.address().port}`,
    onBarrier: stage => stage === "gesture" || stage === "menu-home" });
  try {
    assert.equal((await fetch(`${proxy.barrierUrl}&stage=menu-home`)).status, 200);
    assert.equal((await fetch(`${proxy.barrierUrl}&stage=menu-films`)).status, 202);
    assert.equal((await fetch(`${proxy.barrierUrl}&stage=gesture`)).status, 200);
    assert.equal((await fetch(`${proxy.barrierUrl}&stage=spoiler`)).status, 202);
    assert.equal((await fetch(`${proxy.barrierUrl}&stage=unknown`)).status, 400);
    assert.equal((await fetch(`${proxy.baseUrl}/__dmr_native_ios_barrier?token=bad&stage=gesture`)).status, 403);
    assert.equal((await fetch(`${proxy.barrierUrl}&stage=gesture`, { method: "POST" })).status, 403);
    for (const route of nativeMenuRoutes) {
      const menuResponse = await fetch(`${proxy.baseUrl}${route}`);
      assert.match(await menuResponse.text(), /__dmr_native_ios_observer\.js/);
    }
    const response = await fetch(`${proxy.baseUrl}${nativeArticlePath}?spoilers=full`);
    assert.equal(response.status, 200); assert.equal(response.headers.get("content-security-policy"), "script-src 'self'");
    const html = await response.text();
    assert.match(html, /<title>original<\/title>/); assert.match(html, /the unmodified article/);
    const source = /<script defer src="([^"]+)"/.exec(html)?.[1]; assert.ok(source);
    assert.equal((await fetch(`${proxy.baseUrl}/__dmr_native_ios_observer.js?token=bad`)).status, 403);
    assert.match(await (await fetch(`${proxy.baseUrl}${source}`)).text(), /addEventListener/);
    assert.equal(await (await fetch(`${proxy.baseUrl}/asset`)).text(), "asset");
    assert.equal((await fetch(`${proxy.baseUrl}/__dmr_native_ios_event`, { method: "POST", body: JSON.stringify({ token: "bad", pageId: "x", seq: 1, kind: "ready" }) })).status, 400);
    assert.equal(proxy.events.length, 0);
    assert.equal(proxy.errors.length, 1);
  } finally { await proxy.close(); await new Promise(resolve => upstream.close(resolve)); }
});
