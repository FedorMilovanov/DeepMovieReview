// Test-only, loopback observation of the unmodified app's real native input.
// The proxy adds a passive observer script to the article HTML; it never sends
// gestures, scrolls, clicks, changes styles, or supplies a successful result.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import http from "node:http";
import { once } from "node:events";

export const nativeArticlePath = "/films/the-truman-show/article";
const scriptPath = "/__dmr_native_ios_observer.js";
const eventPath = "/__dmr_native_ios_event";

export function nativeObservationScript(token) {
  assert.match(token, /^[a-f0-9]{32}$/);
  return `(() => {
    'use strict';
    const token = ${JSON.stringify(token)};
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
    function record(kind, event) {
      const target = event && event.target instanceof Element ? event.target : null;
      const touch = event && event.changedTouches && event.changedTouches[0];
      const targetRail = !!target?.closest('.readingOutlineTrigger');
      const inspectRail = kind === 'ready' || kind === 'rail-click' || kind === 'rail-state' || (kind === 'touchstart' && targetRail);
      const value = { token, pageId, seq: ++seq, time: performance.now(), kind,
        trusted: event ? event.isTrusted : null, url: location.href, scrollY,
        width: innerWidth, height: innerHeight, lang: document.documentElement.lang,
        targetRail,
        x: touch?.clientX ?? event?.clientX ?? null, y: touch?.clientY ?? event?.clientY ?? null,
        rail: inspectRail ? railState() : null,
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
      if (event.target instanceof Element && event.target.closest('.readingOutlineTrigger')) record('rail-click', event);
    }, { capture: true, passive: true });
    window.addEventListener('scroll', event => {
      if (Math.abs(scrollY - lastScroll) < 15) return;
      lastScroll = scrollY;
      record('scroll', event);
    }, { passive: true });
    new MutationObserver(records => {
      if (records.some(record => record.target instanceof Element && record.target.matches('.readingOutlineTrigger'))) record('rail-state');
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['aria-expanded'] });
    function whenReady(remaining) {
      if (document.querySelector('.readingOutlineTrigger') && document.querySelector('.articleSection')) record('ready');
      else if (remaining > 0) setTimeout(() => whenReady(remaining - 1), 100);
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
export async function startNativeObservationProxy({ upstream = "http://127.0.0.1:3213", onEvent = () => {} } = {}) {
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
      response.end(nativeObservationScript(token)); return;
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
          assert.ok(["ready", "touchstart", "touchmove", "touchend", "touchcancel", "scroll", "rail-click", "rail-state"].includes(entry.kind));
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
      const isArticle = url.pathname === nativeArticlePath && request.method === "GET" &&
        /^text\/html\b/i.test(String(outgoing["content-type"] ?? ""));
      if (!isArticle) { response.writeHead(upstreamResponse.statusCode, outgoing); upstreamResponse.pipe(response); return; }
      const chunks = []; let size = 0;
      upstreamResponse.on("data", chunk => { size += chunk.length; chunks.push(chunk); });
      upstreamResponse.on("end", () => {
        const html = Buffer.concat(chunks).toString("utf8");
        if (size > 10 * 1024 * 1024 || outgoing["content-encoding"] || !html.includes("</head>")) {
          errors.push("Article HTML cannot be safely instrumented"); response.writeHead(502).end(); return;
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
  return { baseUrl: `http://127.0.0.1:${server.address().port}`, events, errors,
    async close() { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); } };
}

function inViewport(rail, event) {
  const r = rail?.rect;
  return Boolean(rail?.hitContained && r && r.width > 0 && r.height > 0 &&
    r.left >= 0 && r.top >= 0 && r.right <= event.width + 1 && r.bottom <= event.height + 1);
}

// All observations must belong to one full-spoiler article document, in the
// order generated by that document. A command, screenshot, programmatic scroll,
// untrusted event, stale page, occluded target or zero-test run cannot pass.
export function validateNativeGestureTrace(events, baseUrl) {
  const matching = events.filter(event => {
    try {
      const url = new URL(event.url);
      return url.origin === baseUrl && url.pathname === nativeArticlePath &&
        url.searchParams.getAll("spoilers").length === 1 && url.searchParams.get("spoilers").toLowerCase() === "full";
    } catch { return false; }
  });
  const ready = matching.findLast(event => event.kind === "ready");
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
  const names = ["DMR-before-native-scroll", "DMR-after-native-scroll", "DMR-after-native-rail-tap"];
  const rows = manifest.flatMap(test => test.attachments ?? []);
  return names.map(name => {
    const found = rows.filter(row => typeof row.suggestedHumanReadableName === "string" &&
      row.suggestedHumanReadableName.startsWith(`${name}_`) &&
      /^[A-Za-z0-9-]+\.png$/i.test(row.exportedFileName ?? ""));
    assert.equal(found.length, 1, `Exactly one named XCTest screenshot is required: ${name}`);
    return { name, file: found[0].exportedFileName };
  });
}
