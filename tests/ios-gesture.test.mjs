import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import vm from "node:vm";
import { nativeArticlePath, nativeScenePath, nativeObservationScript, selectNativeGestureAttachments, startNativeObservationProxy,
  validateNativeGestureTrace, validateNativeSceneTrace, validateXCTestSummary } from "../scripts/lib/ios-gesture-probe.mjs";

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

test("native scene trace requires trusted touches, the real disclosure, visible evidence and NONE projection", () => {
  const control = { hitContained: true, rect: { left: 30, top: 120, right: 150, bottom: 165, width: 120, height: 45 } };
  const scene = { open: false, support: control, link: control, sceneScroll: 0, evidenceScroll: 0,
    evidenceRect: { top: 100 }, evidenceText: "Титры Таймкод Сцена Основа Итог", noneSelected: true, endingPresent: false };
  const base = { pageId: "scene-1", url: `${origin}${nativeScenePath}?spoilers=none#scene-truman-sc-day-10909`,
    width: 390, height: 714, lang: "ru", scrollY: 4500, scene, targetSupport: false, targetEvidence: false };
  const trace = () => [
    { ...base, seq: 1, kind: "scene-ready" },
    { ...base, seq: 2, kind: "touchstart", trusted: true, targetSupport: true },
    { ...base, seq: 3, kind: "scene-support-click", trusted: true, targetSupport: true },
    { ...base, seq: 4, kind: "scene-support-state", scene: { ...scene, open: true } },
    { ...base, seq: 5, kind: "touchstart", trusted: true, targetEvidence: true, scene: { ...scene, open: true } },
    { ...base, seq: 6, kind: "scene-evidence-click", trusted: true, targetEvidence: true },
    { ...base, seq: 7, kind: "scene-evidence-arrived", url: `${origin}${nativeScenePath}?spoilers=none#evidence-truman-ev-daycount` },
  ];
  assert.equal(validateNativeSceneTrace(trace().reverse(), origin).opened.scene.open, true);
  for (const [name, change] of [
    ["untrusted support touch", rows => { rows[1].trusted = false; }],
    ["untrusted support click", rows => { rows[2].trusted = false; }],
    ["control never opens", rows => { rows[3].scene = scene; }],
    ["link was not touched", rows => { rows[4].targetEvidence = false; }],
    ["link is occluded", rows => { rows[4].scene = { ...scene, open: true, link: { ...control, hitContained: false } }; }],
    ["untrusted link click", rows => { rows[5].trusted = false; }],
    ["wrong final anchor", rows => { rows[6].url = base.url; }],
    ["hidden ending exposed", rows => { rows[6].scene = { ...scene, endingPresent: true }; }],
    ["wrong spoiler level", rows => { rows[6].scene = { ...scene, noneSelected: false }; }],
    ["evidence not visible", rows => { rows[6].scene = { ...scene, evidenceRect: { top: -300 } }; }],
    ["missing basis", rows => { rows[6].scene = { ...scene, evidenceText: "Титры" }; }],
  ]) { const rows = trace(); change(rows); assert.throws(() => validateNativeSceneTrace(rows, origin), undefined, name); }
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
    "DMR-scene-before-support", "DMR-scene-support-open", "DMR-scene-evidence"].map((name, i) => ({
    suggestedHumanReadableName: `${name}_0_AAAAAAAA-BBBB.png`, exportedFileName: `F${i}-A.png`,
  }));
  assert.deepEqual(selectNativeGestureAttachments([{ attachments: [...rows, { suggestedHumanReadableName: "Failure", exportedFileName: "fail.png" }] }]).map(x => x.file), ["F0-A.png", "F1-A.png", "F2-A.png", "F3-A.png", "F4-A.png", "F5-A.png"]);
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
