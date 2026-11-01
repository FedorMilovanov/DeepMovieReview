import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import vm from "node:vm";
import { nativeArticlePath, nativeScenePath, nativeObservationScript, selectNativeGestureAttachments, startNativeObservationProxy,
  validateNativeGestureTrace, validateNativeSceneTrace, validateNativeSpoilerTrace, validateXCTestSummary } from "../scripts/lib/ios-gesture-probe.mjs";
import { shouldRunGestureAfterDriverFailure, validateSceneNavigationOutcome, validateSpoilerNavigationOutcome } from "../scripts/lib/ios-xctest-gesture.mjs";

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
  const rows = ["DMR-before-native-scroll", "DMR-after-native-scroll", "DMR-after-native-rail-tap",
    "DMR-scene-before-support", "DMR-scene-support-open", "DMR-scene-evidence",
    "DMR-spoiler-before-full", "DMR-spoiler-after-none"].map((name, i) => ({
    suggestedHumanReadableName: `${name}_0_AAAAAAAA-BBBB.png`, exportedFileName: `F${i}-A.png`,
  }));
  assert.deepEqual(selectNativeGestureAttachments([{ attachments: [...rows, { suggestedHumanReadableName: "Failure", exportedFileName: "fail.png" }] }]).map(x => x.file), ["F0-A.png", "F1-A.png", "F2-A.png", "F3-A.png", "F4-A.png", "F5-A.png", "F6-A.png", "F7-A.png"]);
  assert.throws(() => selectNativeGestureAttachments([{ attachments: rows.slice(0, 2) }]));
  assert.throws(() => selectNativeGestureAttachments([{ attachments: [...rows, rows[0]] }]));
  assert.throws(() => selectNativeGestureAttachments([{ attachments: [{ ...rows[0], exportedFileName: "../secret.png" }, ...rows.slice(1)] }]));
});

test("loopback observer is valid JavaScript, is passive and requires a fresh token", async () => {
  const script = nativeObservationScript("0123456789abcdef0123456789abcdef");
  assert.doesNotThrow(() => new vm.Script(script));
  assert.throws(() => nativeObservationScript("not-a-token"));
  assert.doesNotMatch(script, /\.(?:click|scrollTo|scrollBy|dispatchEvent)\s*\(/);
  const upstream = http.createServer((req, res) => {
    if (req.url === "/asset") { res.writeHead(200, { "content-type": "text/plain", "x-original": "yes" }).end("asset"); return; }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-security-policy": "script-src 'self'" });
    res.end("<html><head><title>original</title></head><body>the unmodified article</body></html>");
  }).listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const proxy = await startNativeObservationProxy({ upstream: `http://127.0.0.1:${upstream.address().port}` });
  try {
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
