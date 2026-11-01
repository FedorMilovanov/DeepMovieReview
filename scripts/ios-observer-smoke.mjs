// Browser-level regression for the passive iOS observer. Chromium is only a
// local calibration here: it is NOT an iOS Simulator or physical-device test.
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";
import { nativeArticlePath, nativeScenePath, startNativeObservationProxy, validateNativeGestureTrace, validateNativeSceneTrace,
  validateNativeSpoilerTrace } from "./lib/ios-gesture-probe.mjs";
import { parseArticleSectionIds } from "./lib/ios-spoiler-observation.mjs";

const upstream = process.env.BASE_URL ?? "http://127.0.0.1:3212";
async function sections(url) {
  const response = await fetch(url); assert.equal(response.status, 200);
  return parseArticleSectionIds(await response.text());
}
const fullSectionIds = await sections(`${upstream}${nativeArticlePath}?spoilers=full`);
const expectedSectionIds = await sections(`${upstream}${nativeArticlePath}`);
const proxy = await startNativeObservationProxy({ upstream, spoilerLastSectionId: fullSectionIds.at(-1) });
let browser;
async function until(read, message) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const value = read(); if (value) return value;
    await delay(50);
  }
  throw new Error(message);
}
try {
  const configured = process.env.DMR_CHROMIUM_BIN;
  const args = process.env.DMR_CHROMIUM_ARGS ? JSON.parse(process.env.DMR_CHROMIUM_ARGS) : [];
  browser = await chromium.launch({ headless: true, ...(configured ? { executablePath: configured } : {}), args });
  const context = await browser.newContext({ viewport: { width: 390, height: 714 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(), browserErrors = [];
  page.on("pageerror", error => browserErrors.push(error.message));
  page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  const url = `${proxy.baseUrl}${nativeArticlePath}?spoilers=full`;
  await page.goto(url, { waitUntil: "load" });
  await page.locator(".readingOutlineTrigger").waitFor({ state: "visible" });
  const ready = await until(() => proxy.events.find(event => event.kind === "ready"), "Observer did not report the first document");
  const cdp = await context.newCDPSession(page);
  const point = y => [{ x: 195, y, id: 1, radiusX: 2, radiusY: 2, force: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: point(528) });
  for (let step = 1; step <= 10; step++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: point(Math.round(528 - 257 * step / 10)) });
    await delay(35);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await until(() => proxy.events.some(event => event.pageId === ready.pageId && event.kind === "scroll" && event.scrollY >= 30),
    "Chromium calibration touch did not scroll");
  await page.locator(".readingOutlineTrigger").tap();
  await until(() => proxy.events.some(event => event.pageId === ready.pageId && event.kind === "rail-state" && event.rail?.expanded === "true"),
    "Chromium calibration rail did not open");
  const measured = validateNativeGestureTrace(proxy.events, proxy.baseUrl);
  await page.goto(`${proxy.baseUrl}${nativeScenePath}?spoilers=none#scene-truman-sc-day-10909`, { waitUntil: "load" });
  const sceneReady = await until(() => proxy.events.find(event => event.kind === "scene-ready"), "Scene observer did not see a visible support");
  await page.locator('#scene-truman-sc-day-10909 .filmSceneSupports summary').tap();
  await until(() => proxy.events.some(event => event.pageId === sceneReady.pageId && event.kind === "scene-support-state" && event.scene?.open), "Scene did not open");
  await page.locator('#scene-truman-sc-day-10909 .filmSceneSupports a[href="#evidence-truman-ev-daycount"]').tap();
  await until(() => proxy.events.some(event => event.pageId === sceneReady.pageId && event.kind === "scene-evidence-arrived"), "Evidence anchor not observed");
  const sceneMeasured = validateNativeSceneTrace(proxy.events, proxy.baseUrl);
  await page.goto(url, { waitUntil: "load" });
  const spoilerReady = await until(() => proxy.events.find(event => event.kind === "ready" && event.pageId !== ready.pageId &&
    event.timestamp > sceneMeasured.arrived.timestamp && event.url === url), "Fresh FULL article not observed");
  await page.locator('.spoilerOption').first().tap();
  await until(() => proxy.events.some(event => event.kind === "ready" && event.pageId !== spoilerReady.pageId &&
    event.url === `${proxy.baseUrl}${nativeArticlePath}`), "NONE article not observed after touch");
  const spoilerMeasured = validateNativeSpoilerTrace(proxy.events, proxy.baseUrl, { fullSectionIds, expectedSectionIds, afterScene: sceneMeasured.arrived });
  assert.deepEqual(proxy.errors, []); assert.deepEqual(browserErrors, [], "The observer must not break hydration or page scripts");

  // JS scroll and click can change the same DOM state. They must never satisfy
  // the native-input oracle in place of the trusted touch sequence above.
  const negative = await context.newPage();
  const negativeRailStart = proxy.events.length;
  await negative.goto(url, { waitUntil: "load" });
  const second = await until(() => proxy.events.slice(negativeRailStart).find(event => event.kind === "ready"), "Second document not observed");
  await negative.evaluate(() => window.scrollTo(0, 250));
  await negative.locator(".readingOutlineTrigger").evaluate(element => element.click());
  await until(() => proxy.events.some(event => event.pageId === second.pageId && event.kind === "rail-state" && event.rail?.expanded === "true"),
    "Synthetic negative control did not reach its intended state");
  assert.throws(() => validateNativeGestureTrace(proxy.events, proxy.baseUrl));
  const syntheticScene = await context.newPage();
  await syntheticScene.goto(`${proxy.baseUrl}${nativeScenePath}?spoilers=none#scene-truman-sc-day-10909`, { waitUntil: "load" });
  const syntheticReady = await until(() => proxy.events.find(event => event.kind === "scene-ready" && event.pageId !== sceneReady.pageId), "Synthetic scene not observed");
  await syntheticScene.locator('#scene-truman-sc-day-10909 .filmSceneSupports summary').evaluate(element => element.click());
  await until(() => proxy.events.some(event => event.pageId === syntheticReady.pageId && event.kind === "scene-support-state" && event.scene?.open), "Synthetic scene did not open");
  await syntheticScene.locator('#scene-truman-sc-day-10909 .filmSceneSupports a[href="#evidence-truman-ev-daycount"]').evaluate(element => element.click());
  await until(() => proxy.events.some(event => event.pageId === syntheticReady.pageId && event.kind === "scene-evidence-arrived"), "Synthetic scene anchor not observed");
  assert.throws(() => validateNativeSceneTrace(proxy.events, proxy.baseUrl));
  const negativeStart = proxy.events.length;
  const syntheticSpoiler = await context.newPage();
  await syntheticSpoiler.goto(url, { waitUntil: "load" });
  const syntheticFull = await until(() => proxy.events.slice(negativeStart).find(event => event.kind === "ready"), "Synthetic spoiler document not observed");
  await syntheticSpoiler.locator('.spoilerOption').first().evaluate(element => element.click());
  await until(() => proxy.events.slice(negativeStart).some(event => event.kind === "ready" && event.pageId !== syntheticFull.pageId &&
    event.url === `${proxy.baseUrl}${nativeArticlePath}`), "Synthetic spoiler click did not reach NONE");
  assert.throws(() => validateNativeSpoilerTrace(proxy.events.slice(negativeStart), proxy.baseUrl,
    { fullSectionIds, expectedSectionIds, afterScene: sceneMeasured.arrived }));
  assert.deepEqual(proxy.errors, []); assert.deepEqual(browserErrors, []);
  console.log(JSON.stringify({ calibration: "Chromium CDP touch; not iOS", before: measured.touch.scrollY,
    scroll: measured.scroll.scrollY, railOpened: measured.opened.rail.expanded,
    sceneOpened: sceneMeasured.opened.scene.open, evidence: new URL(sceneMeasured.arrived.url).hash,
    spoilerSections: [spoilerMeasured.before.sectionIds.length, spoilerMeasured.after.sectionIds.length], syntheticControls: "rejected",
    browserErrors, observerErrors: proxy.errors }, null, 2));
} finally { await browser?.close(); await proxy.close(); }
