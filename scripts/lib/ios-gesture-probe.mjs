// Test-only, loopback observation of the unmodified app's real native input.
// The proxy adds a passive observer script to the tested page HTML; it never
// sends gestures, scrolls, clicks, changes styles, or supplies a successful result.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import http from "node:http";
import { once } from "node:events";
import { noneArticleProjectionReached } from "./ios-spoiler-observation.mjs";

export const nativeArticlePath = "/films/the-truman-show/article";
export const nativeScenePath = "/films/the-truman-show";
export const nativeMenuRoutes = Object.freeze(["/", "/films", `${nativeArticlePath}?spoilers=full`, `${nativeScenePath}/making`]);
export const nativeMenuStages = Object.freeze(["menu-home", "menu-films", "menu-article", "menu-making"]);
const scriptPath = "/__dmr_native_ios_observer.js";
const eventPath = "/__dmr_native_ios_event";
const barrierPath = "/__dmr_native_ios_barrier";

export function nativeObservationScript(token, { spoilerLastSectionId = null } = {}) {
  assert.match(token, /^[a-f0-9]{32}$/);
  assert.ok(spoilerLastSectionId === null || (typeof spoilerLastSectionId === "string" && spoilerLastSectionId.length > 0));
  return `(() => {
    'use strict';
    const token = ${JSON.stringify(token)};
    const lastFullSectionId = ${JSON.stringify(spoilerLastSectionId)};
    const pageId = String(performance.timeOrigin) + '-' + Math.random().toString(36).slice(2);
    let seq = 0, moved = false, lastScroll = -Infinity;
    function railState() {
      const el = document.querySelector('.readingOutlineTrigger');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { expanded: el.getAttribute('aria-expanded'), hitContained: !!hit && el.contains(hit),
        rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } };
    }
    function box(el) {
      if (!el) return null;
      const rect = el.getBoundingClientRect(), hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        hitContained: !!hit && el.contains(hit) };
    }
    function menuState() {
      const button = document.querySelector('.menuButton'), nav = document.getElementById('site-menu');
      if (!button || !nav) return null;
      const rect = nav.getBoundingClientRect();
      return { ...box(button), expanded: button.getAttribute('aria-expanded'),
        navVisible: getComputedStyle(nav).display !== 'none' && rect.width > 0 && rect.height > 0,
        navInert: nav.inert, labels: Array.from(nav.querySelectorAll('a'), el => el.textContent.trim()) };
    }
    function spoilerState() {
      const options = document.querySelectorAll('.spoilerOption');
      if (options.length !== 5) return null;
      return { noneSelected: options[0].getAttribute('aria-current') === 'true',
        fullSelected: options[4].getAttribute('aria-current') === 'true', target: box(options[0]),
        lastSectionPresent: lastFullSectionId ? !!document.getElementById(lastFullSectionId) : null };
    }
    function sceneState() {
      const details = document.querySelector('#scene-truman-sc-day-10909 .filmSceneSupports');
      if (!details) return null;
      const support = details.querySelector('summary');
      const link = details.querySelector('a[href="#evidence-truman-ev-daycount"]');
      const target = document.getElementById('evidence-truman-ev-daycount');
      return { open: details.open, support: box(support), link: box(link),
        sceneScroll: details.closest('.filmSceneTableWrap')?.scrollLeft,
        evidenceScroll: target?.closest('.evidenceRegisterWrap')?.scrollLeft,
        evidenceRect: target?.getBoundingClientRect().toJSON(), evidenceText: target?.innerText,
        noneSelected: document.querySelector('.spoilerOption')?.getAttribute('aria-current') === 'true',
        endingPresent: !!document.getElementById('evidence-truman-ev-wall') };
    }
    function record(kind, event) {
      const target = event && event.target instanceof Element ? event.target : null;
      const touch = event && event.changedTouches && event.changedTouches[0];
      const targetRail = !!target?.closest('.readingOutlineTrigger');
      const targetMenu = !!target?.closest('.menuButton');
      const targetSupport = !!target?.closest('#scene-truman-sc-day-10909 .filmSceneSupports summary');
      const targetEvidence = !!target?.closest('#scene-truman-sc-day-10909 .filmSceneSupports a[href="#evidence-truman-ev-daycount"]');
      const targetSpoiler = !!target?.closest('.spoilerOption:first-child');
      const inspectMenu = kind === 'menu-ready' || kind === 'menu-click' || kind === 'menu-state' || (kind === 'touchstart' && targetMenu);
      const inspectRail = kind === 'ready' || kind === 'rail-click' || kind === 'rail-state' || (kind === 'touchstart' && targetRail);
      const inspectScene = kind.startsWith('scene-') || (kind === 'touchstart' && (targetSupport || targetEvidence));
      const inspectSpoiler = kind === 'ready' || kind === 'spoiler-click' || (kind === 'touchstart' && targetSpoiler);
      const time = performance.now();
      const value = { token, pageId, seq: ++seq, time, timestamp: performance.timeOrigin + time, kind,
        trusted: event ? event.isTrusted : null, url: location.href, scrollY,
        width: innerWidth, height: innerHeight, lang: document.documentElement.lang,
        targetRail, targetMenu, targetSupport, targetEvidence, targetSpoiler,
        x: touch?.clientX ?? event?.clientX ?? null, y: touch?.clientY ?? event?.clientY ?? null,
        menu: inspectMenu ? menuState() : null, rail: inspectRail ? railState() : null, scene: inspectScene ? sceneState() : null,
        spoiler: inspectSpoiler ? spoilerState() : null,
        ...(kind === 'ready' ? { sectionIds: Array.from(document.querySelectorAll('.articleSection'), node => node.id) } : {}) };
      navigator.sendBeacon(${JSON.stringify(eventPath)}, JSON.stringify(value));
    }
    for (const kind of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
      document.addEventListener(kind, event => {
        if (kind === 'touchstart') moved = false;
        if (kind === 'touchmove') { if (moved) return; moved = true; }
        record(kind, event);
      }, { capture: true, passive: true });
    }
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('.menuButton')) record('menu-click', event);
      if (event.target.closest('.readingOutlineTrigger')) record('rail-click', event);
      if (event.target.closest('.spoilerOption:first-child')) record('spoiler-click', event);
      if (event.target.closest('#scene-truman-sc-day-10909 .filmSceneSupports summary')) record('scene-support-click', event);
      if (event.target.closest('#scene-truman-sc-day-10909 .filmSceneSupports a[href="#evidence-truman-ev-daycount"]')) record('scene-evidence-click', event);
    }, { capture: true, passive: true });
    window.addEventListener('scroll', event => {
      if (Math.abs(scrollY - lastScroll) < 15) return;
      lastScroll = scrollY;
      record('scroll', event);
    }, { passive: true });
    window.addEventListener('hashchange', () => {
      if (location.hash === '#evidence-truman-ev-daycount') setTimeout(() => record('scene-evidence-arrived'), 800);
    });
    new MutationObserver(records => {
      if (records.some(item => item.target instanceof Element && item.target.matches('.menuButton'))) record('menu-state');
      if (records.some(item => item.target instanceof Element && item.target.matches('.readingOutlineTrigger'))) record('rail-state');
      if (records.some(item => item.target instanceof Element && item.target.matches('#scene-truman-sc-day-10909 .filmSceneSupports'))) record('scene-support-state');
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['aria-expanded', 'open'] });
    let reportedMenu = false, reportedContent = false;
    function whenReady(remaining) {
      const menu = menuState();
      if (!reportedMenu && menu && menu.rect.width > 0 && menu.rect.height > 0) {
        record('menu-ready'); reportedMenu = true;
      }
      if (!reportedContent && document.querySelector('.readingOutlineTrigger') && document.querySelector('.articleSection')) {
        record('ready'); reportedContent = true;
      }
      const scene = sceneState();
      if (!reportedContent && scene && scene.support?.hitContained && scene.support.rect.top >= 60 && scene.support.rect.bottom <= innerHeight) {
        record('scene-ready'); reportedContent = true;
      }
      const needsContent = location.pathname === ${JSON.stringify(nativeArticlePath)} || location.pathname === ${JSON.stringify(nativeScenePath)};
      if ((!reportedMenu || (needsContent && !reportedContent)) && remaining > 0) setTimeout(() => whenReady(remaining - 1), 100);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => whenReady(100), { once: true });
    else whenReady(100);
  })();`;
}

function forwardedHeaders(headers) {
  const copy = { ...headers };
  for (const key of ["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade"]) delete copy[key];
  return copy;
}

// One fresh observer per run. Refuse other hosts, an invalid token, malformed
// events, oversized data and HTML that cannot be instrumented without guessing.
export async function startNativeObservationProxy({ upstream = "http://127.0.0.1:3213", onEvent = () => {},
  onBarrier = () => false, spoilerLastSectionId = null } = {}) {
  const origin = new URL(upstream);
  assert.equal(origin.protocol, "http:");
  assert.equal(origin.hostname, "127.0.0.1", "The audit proxy may only reach the local build");
  const token = randomBytes(16).toString("hex");
  const events = [], errors = [];
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    if (url.pathname === scriptPath && request.method === "GET") {
      if (url.searchParams.get("token") !== token) { response.writeHead(403).end(); return; }
      response.writeHead(200, { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-store" });
      response.end(nativeObservationScript(token, { spoilerLastSectionId })); return;
    }
    if (url.pathname === barrierPath) {
      if (request.method !== "GET" || url.searchParams.get("token") !== token) { response.writeHead(403).end(); return; }
      const stage = url.searchParams.get("stage");
      if (![...nativeMenuStages, "gesture", "spoiler"].includes(stage)) { response.writeHead(400).end(); return; }
      // Read-only readiness: cannot navigate, inject input, or pass an oracle.
      try { response.writeHead(onBarrier(stage) === true ? 200 : 202, { "cache-control": "no-store" }).end(); }
      catch (error) { errors.push(`Barrier: ${error.message}`); response.writeHead(500).end(); }
      return;
    }
    if (url.pathname === eventPath && request.method === "POST") {
      const chunks = []; let size = 0, oversized = false;
      request.on("data", chunk => {
        size += chunk.length;
        if (size > 16384) { oversized = true; return; }
        chunks.push(chunk);
      });
      request.on("end", () => {
        if (oversized || events.length >= 2000) { errors.push("Observer data exceeded its budget"); response.writeHead(413).end(); return; }
        try {
          const entry = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          assert.equal(entry.token, token);
          assert.equal(typeof entry.pageId, "string");
          assert.ok(Number.isSafeInteger(entry.seq) && entry.seq > 0);
          assert.ok(["ready", "menu-ready", "menu-click", "menu-state", "touchstart", "touchmove", "touchend", "touchcancel", "scroll", "rail-click", "rail-state", "spoiler-click",
            "scene-ready", "scene-support-click", "scene-support-state", "scene-evidence-click", "scene-evidence-arrived"].includes(entry.kind));
          delete entry.token;
          events.push(entry); onEvent(entry);
          response.writeHead(204, { "cache-control": "no-store" }).end();
        } catch (error) { errors.push(`Invalid observer event: ${error.message}`); response.writeHead(400).end(); }
      });
      return;
    }
    const headers = forwardedHeaders(request.headers);
    headers["accept-encoding"] = "identity";
    const upstreamRequest = http.request({ protocol: origin.protocol, hostname: origin.hostname, port: origin.port,
      path: request.url, method: request.method, headers }, upstreamResponse => {
      const outgoing = forwardedHeaders(upstreamResponse.headers);
      const isObservedPage = ["/", "/films", nativeArticlePath, nativeScenePath, `${nativeScenePath}/making`].includes(url.pathname) && request.method === "GET" &&
        /^text\/html\b/i.test(String(outgoing["content-type"] ?? ""));
      if (!isObservedPage) { response.writeHead(upstreamResponse.statusCode, outgoing); upstreamResponse.pipe(response); return; }
      const chunks = []; let size = 0;
      upstreamResponse.on("data", chunk => { size += chunk.length; chunks.push(chunk); });
      upstreamResponse.on("end", () => {
        const html = Buffer.concat(chunks).toString("utf8");
        if (size > 10 * 1024 * 1024 || outgoing["content-encoding"] || !html.includes("</head>")) {
          errors.push("Test page HTML cannot be safely instrumented"); response.writeHead(502).end(); return;
        }
        const tag = `<script defer src="${scriptPath}?token=${token}"></script>`;
        const body = Buffer.from(html.replace("</head>", `${tag}</head>`));
        delete outgoing.etag; delete outgoing["content-length"];
        outgoing["content-length"] = body.length; outgoing["cache-control"] = "no-store";
        response.writeHead(upstreamResponse.statusCode, outgoing); response.end(body);
      });
    });
    upstreamRequest.on("error", error => { errors.push(`Proxy: ${error.message}`); if (!response.headersSent) response.writeHead(502); response.end(); });
    request.pipe(upstreamRequest);
  });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return { baseUrl, barrierUrl: `${baseUrl}${barrierPath}?token=${token}`, events, errors,
    async close() { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); } };
}

function inViewport(rail, event) {
  const r = rail?.rect;
  return Boolean(rail?.hitContained && r && r.width > 0 && r.height > 0 &&
    r.left >= 0 && r.top >= 0 && r.right <= event.width + 1 && r.bottom <= event.height + 1);
}

// Each of the four pages gets one real open and one real close in normal
// MobileSafari. Sequence numbers reconstruct the order even if beacons arrive
// out of order. Neither DOM state alone, a JS click nor a cancelled/repeated
// touch can pass. The page remains unchanged; the observer only reads it.
export function validateNativeMenuTrace(events, baseUrl, route, { afterTimestamp = -Infinity } = {}) {
  assert.ok(nativeMenuRoutes.includes(route), "Unknown native menu route");
  const expected = new URL(route, baseUrl);
  const ready = events.filter(event => {
    try {
      const url = new URL(event.url);
      return event.kind === "menu-ready" && Number.isFinite(event.timestamp) && event.timestamp > afterTimestamp &&
        url.origin === expected.origin && url.pathname === expected.pathname && url.search === expected.search && !url.hash;
    } catch { return false; }
  }).sort((a, b) => a.timestamp - b.timestamp)[0];
  assert.ok(ready, `No new mobile menu document observed for ${route}`);
  const trace = events.filter(event => event.pageId === ready.pageId).sort((a, b) => a.seq - b.seq);
  assert.equal(new Set(trace.map(event => event.seq)).size, trace.length, "Menu observer sequence must be unique");
  assert.ok(ready.lang === "ru" && ready.width > 0 && ready.width < 500 && ready.height > 0 &&
    Number.isFinite(ready.scrollY) && ready.scrollY >= 0 && ready.scrollY < 30,
  "Each menu must start on a fresh Russian mobile document near the top");
  const closedState = state => state?.expanded === "false" && state.navVisible === false && state.navInert === true;
  const openState = state => state?.expanded === "true" && state.navVisible === true && state.navInert === false &&
    ["Фильмы", "Обзор", "Методология"].every(label => state.labels?.includes(label));
  assert.ok(closedState(ready.menu) && inViewport(ready.menu, ready), "The menu must initially be closed, visible and hit-contained");
  const next = (after, predicate, message) => {
    const found = trace.find(event => event.seq > after.seq && predicate(event));
    assert.ok(found, message); return found;
  };
  const tap = (after, expectedState, label) => {
    const start = next(after, event => event.kind === "touchstart" && event.trusted === true && event.targetMenu &&
      expectedState(event.menu) && inViewport(event.menu, event), `${label}: expected a trusted touch on the visible menu button`);
    assert.ok(!trace.some(event => event.seq > after.seq && event.seq < start.seq && event.targetMenu &&
      ["touchstart", "touchend", "touchcancel", "menu-click"].includes(event.kind)), `${label}: an earlier failed touch cannot be hidden`);
    const end = next(start, event => event.kind === "touchend" && event.trusted === true && event.targetMenu,
      `${label}: the native touch must end on the menu button`);
    const click = next(end, event => event.kind === "menu-click" && event.trusted === true && event.targetMenu,
      `${label}: the completed touch must produce a trusted click`);
    assert.ok(!trace.some(event => event.seq > start.seq && event.seq < click.seq &&
      (event.kind === "touchcancel" || event.kind === "touchstart")), `${label}: the click must belong to the uninterrupted touch`);
    return { start, end, click };
  };
  const opening = tap(ready, closedState, "Open menu");
  const opened = next(opening.click, event => event.kind === "menu-state" && openState(event.menu),
    "The native click must visibly open the actual navigation");
  const closing = tap(opened, openState, "Close menu");
  const closed = next(closing.click, event => event.kind === "menu-state" && closedState(event.menu),
    "The native click must close and make navigation inert again");
  assert.deepEqual(trace.filter(event => event.targetMenu && ["touchstart", "touchend", "touchcancel", "menu-click"].includes(event.kind))
    .map(event => event.seq), [opening.start, opening.end, opening.click, closing.start, closing.end, closing.click].map(event => event.seq),
  "Exactly one uninterrupted open and one close are allowed; extra menu input cannot be hidden");
  const sequence = [ready, opening.start, opening.end, opening.click, opened, closing.start, closing.end, closing.click, closed];
  assert.ok(sequence.every(event => Number.isFinite(event.timestamp)) &&
    sequence.every((event, index) => index === 0 || sequence[index - 1].timestamp <= event.timestamp),
  "Menu event timestamps must be ordered within one document");
  assert.ok(trace.every(event => {
    try { const url = new URL(event.url); return url.origin === expected.origin && url.pathname === expected.pathname && url.search === expected.search && !url.hash; }
    catch { return false; }
  }), "A menu scenario cannot cross a document or route boundary");
  return { route, pageId: ready.pageId, ready, opening, opened, closing, closed };
}

export function validateNativeMenuSequence(events, baseUrl) {
  const result = [];
  for (const route of nativeMenuRoutes) {
    const trace = validateNativeMenuTrace(events, baseUrl, route, { afterTimestamp: result.at(-1)?.closed.timestamp ?? -Infinity });
    assert.ok(!result.some(previous => previous.pageId === trace.pageId), "Each menu must use a distinct document");
    result.push(trace);
  }
  return result;
}

// All observations must belong to one full-spoiler article document, in the
// order generated by that document. A command, screenshot, programmatic scroll,
// untrusted event, stale page, occluded target or zero-test run cannot pass.
export function validateNativeGestureTrace(events, baseUrl, { pageId } = {}) {
  const matching = events.filter(event => {
    try {
      const url = new URL(event.url);
      return url.origin === baseUrl && url.pathname === nativeArticlePath &&
        url.searchParams.getAll("spoilers").length === 1 && url.searchParams.get("spoilers").toLowerCase() === "full";
    } catch { return false; }
  });
  const ready = pageId ? matching.find(event => event.kind === "ready" && event.pageId === pageId) :
    matching.findLast(event => event.kind === "ready");
  assert.ok(ready, "No observed full article on the native test origin");
  const trace = matching.filter(event => event.pageId === ready.pageId).sort((a, b) => a.seq - b.seq);
  assert.equal(new Set(trace.map(event => event.seq)).size, trace.length, "Observer sequence must not contain duplicate events");
  assert.ok(ready.lang === "ru" && ready.width > 0 && ready.width < 500 && ready.height > 0, "Expected Russian mobile article viewport");
  assert.ok(Array.isArray(ready.sectionIds) && ready.sectionIds.length > 1 && ready.sectionIds.every(Boolean) &&
    new Set(ready.sectionIds).size === ready.sectionIds.length, "The full article sections must be present");
  assert.ok(Number.isFinite(ready.scrollY) && ready.scrollY < 30, "The native article must start near the top");
  assert.ok(ready.rail?.expanded === "false" && inViewport(ready.rail, ready), "Reading rail must start visible, hit-contained and closed");
  const next = (after, predicate, message) => {
    const found = trace.find(event => event.seq > after.seq && predicate(event));
    assert.ok(found, message); return found;
  };
  const touch = next(ready, event => event.kind === "touchstart" && event.trusted === true && !event.targetRail &&
    Number.isFinite(event.scrollY) && Math.abs(event.scrollY - ready.scrollY) < 30 &&
    Number.isFinite(event.x) && Number.isFinite(event.y) && event.x > 0 && event.x < event.width && event.y > 0 && event.y < event.height,
  "Native swipe must deliver a trusted touchstart within the article at its initial scroll position");
  const move = next(touch, event => event.kind === "touchmove" && event.trusted === true && !event.targetRail,
    "Native swipe must deliver a trusted touchmove");
  const scroll = next(move, event => event.kind === "scroll" && event.trusted === true &&
    Number.isFinite(event.scrollY) && event.scrollY - touch.scrollY >= 30,
  "Article must really scroll at least 30 CSS pixels after the native touch");
  assert.ok(!trace.some(event => event.kind === "touchstart" && event.seq > touch.seq && event.seq < scroll.seq),
    "The observed movement must belong to the initial touch, not a later gesture");
  const railTouch = next(scroll, event => event.kind === "touchstart" && event.trusted === true && event.targetRail &&
    event.scrollY - touch.scrollY >= 30 && event.rail?.expanded === "false" && inViewport(event.rail, event),
  "The visible, hit-contained rail must receive a native touch while the article remains scrolled");
  const click = next(railTouch, event => event.kind === "rail-click" && event.trusted === true && event.targetRail &&
    event.scrollY - touch.scrollY >= 30, "The post-scroll rail activation must produce a trusted click");
  const opened = next(click, event => event.kind === "rail-state" && event.rail?.expanded === "true" &&
    event.scrollY - touch.scrollY >= 30, "The native post-scroll rail input must open the actual disclosure");
  return { pageId: ready.pageId, before: ready, touch, move, scroll, railTouch, click, opened };
}

// A native tap in normal MobileSafari must complete on the actual NONE option,
// navigate to a new document and produce the exact independently fetched SSR
// projection. The command, a cancelled touch, a URL alone, a partial update or
// a JS-generated click cannot satisfy this gate.
export function validateNativeSpoilerTrace(events, baseUrl, { fullSectionIds, expectedSectionIds, afterScene } = {}) {
  assert.ok(afterScene?.kind === "scene-evidence-arrived" && Number.isFinite(afterScene.timestamp),
    "The spoiler scenario must follow the observed scene evidence");
  assert.ok(Array.isArray(fullSectionIds) && fullSectionIds.length > 1 && fullSectionIds.every(id => typeof id === "string" && id) &&
    new Set(fullSectionIds).size === fullSectionIds.length, "A complete FULL SSR baseline is required");
  assert.ok(Array.isArray(expectedSectionIds) && expectedSectionIds.length > 0 && expectedSectionIds.length < fullSectionIds.length &&
    expectedSectionIds.every((id, index) => id === fullSectionIds[index]) && !expectedSectionIds.includes(fullSectionIds.at(-1)),
  "NONE SSR must be a proper prefix of the FULL projection");
  const articleUrl = `${baseUrl}${nativeArticlePath}`;
  const fullReadies = events.filter(event => {
    try {
      const url = new URL(event.url);
      return event.kind === "ready" && Number.isFinite(event.timestamp) && event.timestamp > afterScene.timestamp &&
        url.origin === baseUrl && url.pathname === nativeArticlePath && url.searchParams.getAll("spoilers").length === 1 &&
        url.searchParams.get("spoilers").toLowerCase() === "full";
    } catch { return false; }
  }).sort((a, b) => a.timestamp - b.timestamp);
  const before = fullReadies[0];
  assert.ok(before, "No new FULL article observed after the scene scenario");
  assert.ok(before.lang === "ru" && before.width > 0 && before.width < 500 && before.height > 0 &&
    Number.isFinite(before.scrollY) && before.scrollY >= 0 && before.scrollY < 30);
  assert.deepEqual(before.sectionIds, fullSectionIds, "The native FULL article must match the FULL SSR baseline");
  assert.ok(before.spoiler?.fullSelected && !before.spoiler.noneSelected && before.spoiler.lastSectionPresent === true,
    "FULL must start selected with its last section present");
  const trace = events.filter(event => event.pageId === before.pageId).sort((a, b) => a.seq - b.seq);
  assert.equal(new Set(trace.map(event => event.seq)).size, trace.length, "Spoiler observer sequence must be unique");
  const next = (after, predicate, message) => {
    const found = trace.find(event => event.seq > after.seq && predicate(event));
    assert.ok(found, message); return found;
  };
  const touch = next(before, event => event.kind === "touchstart" && event.trusted === true && event.targetSpoiler &&
    event.spoiler?.fullSelected && !event.spoiler.noneSelected && inViewport(event.spoiler.target, event),
  "The visible NONE control must receive a trusted touch in the FULL article");
  const end = next(touch, event => event.kind === "touchend" && event.trusted === true && event.targetSpoiler,
    "The native NONE touch must end on its original target");
  const click = next(end, event => event.kind === "spoiler-click" && event.trusted === true && event.targetSpoiler,
    "The NONE option must receive a trusted click after the touch");
  assert.ok(!trace.some(event => event.seq > before.seq && event.seq < touch.seq && event.targetSpoiler &&
    ["touchstart", "touchend", "touchcancel", "spoiler-click"].includes(event.kind)),
  "A prior failed or repeated touch on NONE cannot be hidden");
  assert.ok(!trace.some(event => event.seq > touch.seq && event.seq < click.seq &&
    (event.kind === "touchcancel" || event.kind === "touchstart")), "The click must belong to the uninterrupted native touch");
  assert.ok([touch.timestamp, end.timestamp, click.timestamp].every(Number.isFinite) &&
    before.timestamp <= touch.timestamp && touch.timestamp <= end.timestamp && end.timestamp <= click.timestamp,
  "The same-document touch and click timestamps must be ordered");
  const after = events.filter(event => {
    try {
      const url = new URL(event.url), levels = url.searchParams.getAll("spoilers");
      return event.kind === "ready" && event.pageId !== before.pageId && Number.isFinite(event.timestamp) &&
        event.timestamp > click.timestamp && url.origin === baseUrl && url.pathname === nativeArticlePath &&
        (levels.length === 0 || (levels.length === 1 && levels[0].toLowerCase() === "none"));
    } catch { return false; }
  }).sort((a, b) => a.timestamp - b.timestamp)[0];
  assert.ok(after && after.lang === "ru" && after.width > 0 && after.width < 500 && after.height > 0 &&
    after.spoiler?.fullSelected === false, "The NONE article must load in a new mobile document without FULL selected");
  assert.ok(noneArticleProjectionReached({ url: after.url, sectionIds: after.sectionIds,
    noneSelected: after.spoiler?.noneSelected === true, lastSectionPresent: after.spoiler?.lastSectionPresent }, {
    expectedUrl: articleUrl, beforeSections: fullSectionIds.length, expectedSectionIds,
  }), "Native NONE article must match the independently fetched SSR projection");
  return { before, touch, end, click, after, expectedSectionIds };
}

// A separate, deep-linked NONE document: real native touches must open the
// scene control and follow its first evidence link. Geometry, level and final
// content are observed independently of the XCUITest command succeeding.
export function validateNativeSceneTrace(events, baseUrl) {
  const matching = events.filter(event => {
    try {
      const url = new URL(event.url);
      return url.origin === baseUrl && url.pathname === nativeScenePath &&
        url.searchParams.getAll("spoilers").length === 1 && url.searchParams.get("spoilers").toLowerCase() === "none";
    } catch { return false; }
  });
  const ready = matching.findLast(event => event.kind === "scene-ready");
  assert.ok(ready, "No observed NONE scene on the native test origin");
  const trace = matching.filter(event => event.pageId === ready.pageId).sort((a, b) => a.seq - b.seq);
  assert.equal(new Set(trace.map(event => event.seq)).size, trace.length, "Scene observer sequence must be unique");
  assert.ok(ready.lang === "ru" && ready.width > 0 && ready.width < 500 && ready.height > 0);
  assert.equal(new URL(ready.url).hash, "#scene-truman-sc-day-10909");
  assert.ok(ready.scene && ready.scene.open === false && ready.scene.noneSelected && !ready.scene.endingPresent &&
    ready.scene.sceneScroll === 0 && inViewport(ready.scene.support, ready), "Scene disclosure must start visible, closed and spoiler-safe");
  const next = (after, predicate, message) => {
    const found = trace.find(event => event.seq > after.seq && predicate(event));
    assert.ok(found, message); return found;
  };
  const supportTouch = next(ready, event => event.kind === "touchstart" && event.trusted === true && event.targetSupport &&
    event.scene?.open === false && event.scene.sceneScroll === 0 && inViewport(event.scene.support, event),
  "The visible scene disclosure must receive a trusted native touch");
  const supportEnd = next(supportTouch, event => event.kind === "touchend" && event.trusted === true && event.targetSupport,
    "The scene disclosure touch must end on its original target");
  const supportClick = next(supportEnd, event => event.kind === "scene-support-click" && event.trusted === true && event.targetSupport,
    "The scene disclosure must receive a trusted native click");
  assert.ok(!trace.some(event => event.seq > supportTouch.seq && event.seq < supportClick.seq &&
    (event.kind === "touchcancel" || event.kind === "touchstart")),
  "The disclosure click must belong to the first uninterrupted native touch");
  const opened = next(supportClick, event => event.kind === "scene-support-state" && event.scene?.open === true,
    "The scene disclosure must really open after the click");
  const linkTouch = next(opened, event => event.kind === "touchstart" && event.trusted === true && event.targetEvidence &&
    event.scene?.open === true && event.scene.sceneScroll === 0 && inViewport(event.scene.link, event),
  "The visible evidence link must receive a trusted native touch");
  const linkEnd = next(linkTouch, event => event.kind === "touchend" && event.trusted === true && event.targetEvidence,
    "The evidence touch must end on its original target");
  const linkClick = next(linkEnd, event => event.kind === "scene-evidence-click" && event.trusted === true && event.targetEvidence,
    "The evidence link must receive a trusted native click");
  assert.ok(!trace.some(event => event.seq > linkTouch.seq && event.seq < linkClick.seq &&
    (event.kind === "touchcancel" || event.kind === "touchstart")),
  "The evidence click must belong to the first uninterrupted native touch");
  const arrived = next(linkClick, event => {
    const rect = event.scene?.evidenceRect;
    return event.kind === "scene-evidence-arrived" && new URL(event.url).hash === "#evidence-truman-ev-daycount" &&
      event.scene.noneSelected && !event.scene.endingPresent && event.scene.evidenceScroll === 0 &&
      rect && rect.top >= 50 && rect.top < event.height &&
      ["Титры", "Таймкод", "Сцена", "Основа", "Итог"].every(label => event.scene.evidenceText?.includes(label));
  }, "Evidence must be visible, complete and remain at NONE after native navigation");
  return { pageId: ready.pageId, ready, supportTouch, supportEnd, supportClick, opened, linkTouch, linkEnd, linkClick, arrived };
}

export function validateXCTestSummary(summary, deviceId) {
  assert.equal(summary.result, "Passed", "XCTest did not pass");
  assert.equal(summary.totalTestCount, 1, "Exactly one native gesture test must execute");
  assert.equal(summary.passedTests, 1); assert.equal(summary.failedTests, 0);
  assert.equal(summary.skippedTests, 0); assert.equal(summary.expectedFailures, 0);
  assert.ok(Array.isArray(summary.devicesAndConfigurations) && summary.devicesAndConfigurations.some(({ device }) =>
    device?.deviceId?.toLowerCase() === deviceId.toLowerCase() && device?.platform === "iOS Simulator"),
  "XCTest must run on the selected iPhone Simulator, not a clone or another destination");
}

// Only named, explicitly kept test attachments count. Do not substitute an
// automatic failure screenshot or an arbitrary PNG from the result bundle.
export function selectNativeGestureAttachments(manifest) {
  assert.ok(Array.isArray(manifest));
  const names = ["DMR-menu-home-open", "DMR-menu-films-open", "DMR-menu-article-open", "DMR-menu-making-open",
    "DMR-before-native-scroll", "DMR-after-native-scroll", "DMR-after-native-rail-tap",
    "DMR-scene-before-support", "DMR-scene-support-open", "DMR-scene-evidence",
    "DMR-spoiler-before-full", "DMR-spoiler-after-input"];
  const rows = manifest.flatMap(test => test.attachments ?? []);
  return names.map(name => {
    const found = rows.filter(row => typeof row.suggestedHumanReadableName === "string" &&
      row.suggestedHumanReadableName.startsWith(`${name}_`) &&
      /^[A-Za-z0-9-]+\.png$/i.test(row.exportedFileName ?? ""));
    assert.equal(found.length, 1, `Exactly one named XCTest screenshot is required: ${name}`);
    return { name, file: found[0].exportedFileName };
  });
}
