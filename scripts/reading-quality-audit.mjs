/** Reading/keyboard/print regressions against an already-running production app.
 * READING_BROWSER=chromium|firefox|webkit; Chromium also creates A4 PDFs.
 * Device emulation and axe do not stand in for a physical device or a screen
 * reader. Inspect the generated PDF pages with inspect-reading-pdf.py as well.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, firefox, webkit } from "playwright-core";

const base = (process.env.BASE_URL ?? "http://127.0.0.1:3212").replace(/\/$/, "");
const name = process.env.READING_BROWSER ?? "chromium";
const engine = { chromium, firefox, webkit }[name];
assert.ok(engine, `Unknown reading audit browser: ${name}`);
const dir = resolve(process.env.READING_AUDIT_DIR ?? `browser-audit/reading-${name}`);
mkdirSync(dir, { recursive: true });
const article = "/films/the-truman-show/article";
const levels = ["NONE", "MINOR", "MAJOR", "ENDING", "FULL"];
const viewports = [
  { label: "phone", width: 390, height: 844 },
  { label: "small-phone", width: 320, height: 480 },
  { label: "landscape", width: 844, height: 390 },
  { label: "desktop", width: 1440, height: 900 },
];
const report = {
  browser: name,
  base,
  revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  worktreeDirty: Boolean(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()),
  results: [], failures: [], console: [], expectedConsole: [], pageErrors: [], pageErrorContexts: [], requests: [], httpErrors: [],
  inProgress: null, completed: false,
};
const pdfManifest = { browser: name, files: [], fullSections: [] };
function save() {
  writeFileSync(`${dir}/results.json`, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(`${dir}/pdf-manifest.json`, `${JSON.stringify(pdfManifest, null, 2)}\n`);
}
save();

const browser = await engine.launch({
  ...(name === "chromium" && process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
  ...(name === "chromium" ? { args: ["--no-sandbox", "--disable-dev-shm-usage"] } : {}),
});
report.version = browser.version();

function observe(page, label, lifecycle, blockedScripts = false, javascriptDisabled = false) {
  const pending = new Set();
  const rscRequests = new Map();
  page.on("request", request => {
    pending.add(request);
    const url = new URL(request.url());
    if (!url.searchParams.has("_rsc")) return;
    const headers = request.headers();
    rscRequests.set(request, { url: request.url(), prefetch: headers["next-router-prefetch"] === "1" || headers.purpose === "prefetch", outcome: "pending" });
  });
  page.on("requestfinished", request => {
    pending.delete(request);
    const entry = rscRequests.get(request);
    if (entry) entry.outcome = "finished";
  });
  page.on("pageerror", error => {
    const message = String(error);
    const rsc = /[?&]_rsc=([^&\s]+)/.exec(message)?.[1];
    const relatedRsc = rsc ? [...rscRequests.values()].filter(entry => new URL(entry.url).searchParams.get("_rsc") === rsc).slice(-10) : [];
    report.pageErrors.push(message);
    report.pageErrorContexts.push({ label, phase: lifecycle.phase, page: page.url(), message, relatedRsc });
  });
  page.on("console", message => {
    if (message.type() !== "error") return;
    if (blockedScripts && /Failed to load resource:.*ERR_(FAILED|ABORTED)/i.test(message.text())) report.expectedConsole.push(message.text());
    else report.console.push(message.text());
  });
  page.on("requestfailed", request => {
    pending.delete(request);
    const entry = rscRequests.get(request);
    if (entry) entry.outcome = `failed: ${request.failure()?.errorText ?? "unknown"}`;
    const url = new URL(request.url());
    const error = request.failure()?.errorText ?? "unknown";
    const headers = request.headers();
    const aborted = /aborted|cancelled|canceled/i.test(error);
    const prefetch = headers["next-router-prefetch"] === "1" || headers.purpose === "prefetch";
    let kind = "unexpected";
    if (blockedScripts && url.pathname.endsWith(".js")) kind = "deliberately-blocked-script";
    else if (javascriptDisabled && url.pathname.endsWith(".js") && error === "csp") kind = "javascript-disabled-by-test";
    else if (url.origin !== new URL(base).origin) kind = "external-egress";
    else if (aborted && url.searchParams.has("_rsc") && prefetch) kind = "cancelled-rsc-prefetch";
    else if (aborted && url.searchParams.has("_rsc")) kind = "cancelled-rsc-navigation";
    else if (aborted) kind = "cancelled-navigation";
    report.requests.push({ kind, url: request.url(), error, prefetch });
  });
  page.on("response", response => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(base).origin) {
      report.httpErrors.push({ status: response.status(), url: response.url() });
    }
  });
  return () => new Promise((resolveQuiet, rejectQuiet) => {
    let quietTimer;
    const deadline = setTimeout(() => finish(new Error(`${label}: requests did not settle: ${[...pending].map(request => request.url()).join(", ")}`)), 10000);
    function finish(error) {
      clearTimeout(quietTimer);
      clearTimeout(deadline);
      page.off("request", update);
      page.off("requestfinished", update);
      page.off("requestfailed", update);
      if (error) rejectQuiet(error); else resolveQuiet();
    }
    function update() {
      clearTimeout(quietTimer);
      if (!pending.size) quietTimer = setTimeout(() => finish(), 500);
    }
    page.on("request", update);
    page.on("requestfinished", update);
    page.on("requestfailed", update);
    update();
  });
}

async function withPage(options, label, run) {
  const { blockedScripts = false, ...contextOptions } = options;
  const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce", ...contextOptions });
  const page = await context.newPage();
  const lifecycle = { phase: "active" };
  const waitForQuiet = observe(page, label, lifecycle, blockedScripts, contextOptions.javaScriptEnabled === false);
  try {
    const result = await run(page, context);
    // Do not tear down a page while ordinary link prefetches are still in
    // flight: some engines report close-induced rejections as page errors.
    // A quiet-period timeout is itself a failed test; no error is filtered.
    lifecycle.phase = "draining";
    await waitForQuiet();
    return result;
  } catch (error) {
    await page.screenshot({ path: `${dir}/failure-${label}.png` }).catch(() => {});
    throw error;
  } finally {
    lifecycle.phase = "closing";
    await context.close();
  }
}

async function check(label, run) {
  report.inProgress = label;
  save();
  try {
    const detail = await run();
    report.results.push({ label, status: "pass", ...(detail === undefined ? {} : { detail }) });
    console.log(`PASS ${label}`);
  } catch (error) {
    report.failures.push({ label, error: error.stack ?? String(error) });
    console.error(`FAIL ${label}: ${error.message}`);
  }
  report.inProgress = null;
  save();
}

async function openArticle(page, level = "FULL") {
  await page.goto(`${base}${article}?spoilers=${level}`, { waitUntil: "load" });
  await page.locator(".readingOutlineTrigger").waitFor({ state: "visible" });
}

// Range geometry intersects the trigger and the actual topmost hit target. A
// line behind an *opaque* sticky header is not a visible reading-line overlap.
// Wheel input is real; this check never sets scrollTop or calls scrollTo.
async function wheelReading(page, viewport) {
  await page.mouse.move(8, Math.max(80, Math.floor(viewport.height / 2)));
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const delta = Math.max(220, Math.ceil(totalHeight / 60));
  const samples = { wheels: 0, maximumScroll: 0, behindOpaqueHeader: 0, visibleOverlaps: [], firstBehind: null };
  for (let index = 0; index < 65; index += 1) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(45);
    const sample = await page.evaluate(() => {
      const button = document.querySelector(".readingOutlineTrigger");
      const header = document.querySelector(".siteHeader");
      const buttonRect = button.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const background = getComputedStyle(header).backgroundColor;
      const opaque = /^rgb\(/.test(background) || (/^rgba\(/.test(background) && /,\s*1\s*\)$/.test(background));
      let behind = 0;
      const visible = [];
      let example = null;
      for (const element of document.querySelectorAll(".articleParagraph, .articleStandfirst, .sectionIntro")) {
        const parentRect = element.getBoundingClientRect();
        if (parentRect.bottom <= buttonRect.top || parentRect.top >= buttonRect.bottom) continue;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            const left = Math.max(rect.left, buttonRect.left);
            const right = Math.min(rect.right, buttonRect.right);
            const top = Math.max(rect.top, buttonRect.top);
            const bottom = Math.min(rect.bottom, buttonRect.bottom);
            if (right - left < 1 || bottom - top < 1) continue;
            const x = (left + right) / 2;
            const y = (top + bottom) / 2;
            if (!button.contains(document.elementFromPoint(x, y))) continue;
            const underHeader = opaque && x >= headerRect.left && x <= headerRect.right && bottom <= headerRect.bottom + 0.5;
            const collision = { text: node.textContent.trim().slice(0, 100), x, y, top, bottom, headerBottom: headerRect.bottom, background };
            if (underHeader) { behind += 1; example ??= collision; } else visible.push(collision);
          }
        }
      }
      return { y: scrollY, behind, visible, example, atEnd: scrollY + innerHeight >= document.documentElement.scrollHeight - 2 };
    });
    samples.wheels += 1;
    samples.maximumScroll = Math.max(samples.maximumScroll, sample.y);
    samples.behindOpaqueHeader += sample.behind;
    samples.firstBehind ??= sample.example;
    samples.visibleOverlaps.push(...sample.visible);
    if (sample.atEnd) break;
  }
  assert.ok(samples.maximumScroll > viewport.height, "real wheel did not scroll the article");
  assert.deepEqual(samples.visibleOverlaps, [], "the outline trigger intercepted visible article text");
  return samples;
}

// Passive diagnostics for cross-engine anchor failures: never dispatch input or
// change focus/scroll here. The trace survives in the failed audit report.
async function observeOutlineEvents(page) {
  await page.evaluate(() => {
    if (window.__readingOutlineTrace) return;
    const trace = window.__readingOutlineTrace = [];
    const record = event => {
      const target = event.target instanceof Element ? event.target : null;
      trace.push({ type: event.type, target: target?.tagName, targetId: target?.id,
        href: target?.closest("a")?.getAttribute("href"), hash: location.hash,
        active: document.activeElement?.tagName, activeId: document.activeElement?.id,
        prevented: event.defaultPrevented, y: scrollY });
      if (trace.length > 30) trace.shift();
    };
    document.addEventListener("focusin", record, true);
    document.addEventListener("click", record, true);
    window.addEventListener("hashchange", record);
  });
}

async function waitForOutlineArrival(page, hash, { requireVisible = false, timeout = 30000 } = {}) {
  try {
    await page.waitForFunction(({ expected, visible }) => {
      const section = document.getElementById(expected.slice(1));
      const heading = document.getElementById(section?.getAttribute("aria-labelledby") ?? "");
      if (location.hash !== expected || !section || document.activeElement !== heading) return false;
      const rect = heading?.getBoundingClientRect();
      return !visible || (rect && rect.top >= document.querySelector(".siteHeader").getBoundingClientRect().bottom - 1 && rect.top < innerHeight);
    }, { expected: hash, visible: requireVisible }, { timeout });
  } catch (error) {
    const state = await page.evaluate(expected => {
      const section = document.getElementById(expected.slice(1));
      const heading = document.getElementById(section?.getAttribute("aria-labelledby") ?? "");
      const active = document.activeElement;
      return { expected, hash: location.hash, y: scrollY, active: active?.outerHTML.slice(0, 250),
        headingId: heading?.id, headingTop: heading?.getBoundingClientRect().top,
        headerBottom: document.querySelector(".siteHeader")?.getBoundingClientRect().bottom,
        panelHidden: document.querySelector(".readingOutlinePanel")?.hidden,
        events: window.__readingOutlineTrace?.slice(-12) };
    }, hash);
    throw new Error(`Outline arrival failed: ${JSON.stringify(state)}; ${error.message}`);
  }
}

// Firefox may include a scrollable navigation region itself in sequential
// focus order before its links. Accept that one meaningful stop, but still
// verify every link in order; never skip an unknown focus target.
async function tabThroughOutline(page, hashes, lastIndex) {
  const readActive = () => page.evaluate(() => ({
    hash: document.activeElement?.hash,
    panel: document.activeElement?.matches(".readingOutlinePanel"),
    tag: document.activeElement?.tagName,
    className: document.activeElement?.className,
    expanded: document.querySelector(".readingOutlineTrigger")?.getAttribute("aria-expanded"),
  }));
  let panelStop = false;
  for (let index = 0; index <= lastIndex; index += 1) {
    await page.keyboard.press("Tab");
    let active = await readActive();
    if (index === 0 && active.panel) {
      panelStop = true;
      await page.keyboard.press("Tab");
      active = await readActive();
    }
    assert.equal(active.hash, hashes[index], `Tab order skipped an outline link: ${JSON.stringify(active)}`);
  }
  return panelStop;
}

async function testOutline(page, viewport) {
  await openArticle(page);
  const trigger = page.locator(".readingOutlineTrigger");
  const bounds = await page.evaluate(() => {
    const header = document.querySelector(".siteHeader").getBoundingClientRect();
    const button = document.querySelector(".readingOutlineTrigger").getBoundingClientRect();
    const menu = document.querySelector(".menuButton").getBoundingClientRect();
    return { header: header.toJSON(), button: button.toJSON(), menu: menu.toJSON(), scrollWidth: document.documentElement.scrollWidth, width: innerWidth };
  });
  assert.ok(bounds.button.left >= bounds.header.left - 1 && bounds.button.right <= bounds.header.right + 1);
  assert.ok(bounds.button.top >= bounds.header.top && bounds.button.bottom <= bounds.header.bottom + 1);
  assert.ok(bounds.scrollWidth <= bounds.width + 1, `horizontal overflow: ${JSON.stringify(bounds)}`);
  if (bounds.menu.width > 0) assert.ok(bounds.button.right <= bounds.menu.left + 1, "outline and menu overlap");
  const wheel = await wheelReading(page, viewport);
  await page.screenshot({ path: `${dir}/wheel-${viewport.label}.png` });

  // Return with ordinary navigation, not an artificial scrollTop adjustment.
  await openArticle(page);
  await observeOutlineEvents(page);
  await trigger.click();
  const panel = page.locator(".readingOutlinePanel");
  await panel.waitFor({ state: "visible" });
  const box = await panel.boundingBox();
  assert.ok(box.x >= -1 && box.x + box.width <= viewport.width + 1, `panel outside viewport: ${JSON.stringify(box)}`);
  assert.ok(box.y >= 0 && box.y + box.height <= viewport.height + 1, `panel outside viewport: ${JSON.stringify(box)}`);
  await page.screenshot({ path: `${dir}/outline-${viewport.label}.png` });
  const beforeScroll = await panel.evaluate(element => ({ panel: element.scrollTop, page: scrollY }));
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, Math.max(350, viewport.height));
  await page.waitForTimeout(100);
  const afterScroll = await panel.evaluate(element => ({ panel: element.scrollTop, page: scrollY, max: element.scrollHeight - element.clientHeight }));
  assert.ok(afterScroll.max > 0 && afterScroll.panel > beforeScroll.panel, `panel did not scroll: ${JSON.stringify(afterScroll)}`);
  assert.ok(Math.abs(afterScroll.page - beforeScroll.page) < 2, "panel wheel scrolled the article instead");
  await page.keyboard.press("Escape");
  assert.equal(await trigger.getAttribute("aria-expanded"), "false");
  assert.ok(await trigger.evaluate(element => document.activeElement === element), "Escape did not return focus to outline trigger");

  const hashes = await panel.locator("a").evaluateAll(links => links.map(link => link.hash));
  const sectionIds = await page.locator(".articleSection").evaluateAll(sections => sections.map(section => `#${section.id}`));
  assert.deepEqual(hashes, sectionIds, "outline must expose exactly the projected sections");
  const reached = [];
  let panelStops = 0;
  for (let index = 0; index < hashes.length; index += 1) {
    await trigger.focus();
    await page.keyboard.press("Enter");
    await panel.waitFor({ state: "visible" });
    if (await tabThroughOutline(page, hashes, index)) panelStops += 1;
    await page.keyboard.press("Enter");
    await waitForOutlineArrival(page, hashes[index]);
    const landing = await page.evaluate(() => ({
      hash: location.hash, active: document.activeElement.id,
      headingTop: document.activeElement.getBoundingClientRect().top,
      headerBottom: document.querySelector(".siteHeader").getBoundingClientRect().bottom,
      height: innerHeight,
    }));
    assert.ok(landing.headingTop >= landing.headerBottom - 1 && landing.headingTop < landing.height, `heading hidden: ${JSON.stringify(landing)}`);
    reached.push(landing);
  }
  if (panelStops && process.env.GITHUB_ACTIONS === "true") {
    console.log(`::notice title=Outline focus::${name}/${viewport.label}: the scrollable panel was a Tab stop before its links on ${panelStops}/${hashes.length} openings; every link was then checked in order.`);
  }
  return { bounds, wheel, panel: { box, beforeScroll, afterScroll, panelStops }, reached };
}

async function tabTo(page, selector, limit = 16) {
  for (let attempt = 0; attempt < limit; attempt += 1) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(target => document.activeElement?.matches(target), selector)) return;
  }
  throw new Error(`Tab did not reach ${selector}`);
}
async function menuNavigation(page, source, input) {
  await page.goto(`${base}${source}`, { waitUntil: "load" });
  await page.locator(".menuButton").waitFor({ state: "visible" });
  if (input === "keyboard") {
    await tabTo(page, ".menuButton");
    await page.keyboard.press("Enter");
    await tabTo(page, '#site-menu a[href="/#lenses"]');
    await page.keyboard.press("Enter");
  } else {
    await page.locator(".menuButton").click();
    await page.locator('#site-menu a[href="/#lenses"]').click();
  }
  await page.waitForFunction(() => location.pathname === "/" && location.hash === "#lenses" && document.activeElement?.id === "lenses");
  const landing = await page.evaluate(() => ({
    hash: location.hash, active: document.activeElement.id, y: scrollY,
    top: document.querySelector("#lenses").getBoundingClientRect().top,
    headerBottom: document.querySelector(".siteHeader").getBoundingClientRect().bottom,
    height: innerHeight, expanded: document.querySelector(".menuButton").getAttribute("aria-expanded"),
  }));
  assert.equal(landing.expanded, "false");
  assert.ok(landing.top >= landing.headerBottom - 1 && landing.top < landing.height, `anchor is obscured: ${JSON.stringify(landing)}`);
  await page.keyboard.press("Tab");
  const next = await page.evaluate(() => ({ id: document.activeElement.id, inside: Boolean(document.activeElement.closest("#lenses")), y: scrollY }));
  assert.ok(next.inside, `next Tab left the selected section: ${JSON.stringify(next)}`);
  assert.ok(next.y > landing.y - 200, "next Tab jumped to the hero");
  await page.goBack({ waitUntil: "load" });
  await page.waitForURL(`${base}${source}`);
  await page.goForward({ waitUntil: "load" });
  await page.waitForURL(`${base}/#lenses`);
  return { landing, next, back: source, forward: new URL(page.url()).hash };
}

async function manifest(page) {
  return page.evaluate(() => ({
    sections: [...document.querySelectorAll(".articleSection")].map(section => ({
      id: section.id, title: document.getElementById(section.getAttribute("aria-labelledby"))?.textContent.trim(),
    })),
    supportItems: [...document.querySelectorAll("details.articleSupport li")].map(item => item.textContent.trim()),
    decisionItems: [...document.querySelectorAll("details.articleVerdictContext :is(.filmDecisionOptions > *, .filmKnowledgeGrid > *, .filmDecisionContext > *)")].map(item => item.textContent.trim()),
    qualifications: [...document.querySelectorAll(".articleVerdictContext:last-of-type li")].map(item => item.textContent.trim()),
    tableCells: [...document.querySelectorAll("table.articleTable :is(th,td)")].map(cell => cell.textContent.trim()).filter(Boolean),
    verdict: document.querySelector(".articleVerdictGrid")?.textContent.trim() ?? null,
    skipLink: document.querySelector(".skipLink")?.textContent.trim() ?? null,
  }));
}
async function pdf(page, file, metadata, background) {
  const before = await page.locator(".articleShell details").evaluateAll(details => details.map(item => item.open));
  await page.pdf({ path: `${dir}/${file}`, format: "A4", preferCSSPageSize: true, printBackground: background });
  const after = await page.locator(".articleShell details").evaluateAll(details => details.map(item => item.open));
  assert.deepEqual(after, before, `${file}: printing changed the screen disclosure state`);
  pdfManifest.files.push({ file, background, disclosureStates: before, ...metadata, ...(await manifest(page)) });
  save();
}

try {
  for (const viewport of viewports) {
    await check(`outline ${viewport.label}: real wheel, panel, Escape, every link`, () =>
      withPage({ viewport: { width: viewport.width, height: viewport.height } }, `outline-${viewport.label}`, page => testOutline(page, viewport)));
  }
  for (const source of ["/", "/films"]) {
    for (const input of ["keyboard", "mouse"]) {
      await check(`menu ${source} ${input}: hash, focus, next Tab, history`, () =>
        withPage({ viewport: { width: 390, height: 844 } }, `menu-${source === "/" ? "home" : "films"}-${input}`,
          page => menuNavigation(page, source, input)));
    }
  }
  await check("headlines: article and making retain readable line spacing", async () => {
    const measured = [];
    for (const [label, path] of [["article", `${article}?spoilers=FULL`], ["making", "/films/the-truman-show/making"]]) {
      // These are independent layout checks, not a navigation scenario. Give
      // each document its own observed page and drain it before closing: a
      // forced second goto can interrupt Next's automatic prefetches in WebKit.
      // Page errors still fail the audit, and real menu/history navigation is
      // exercised by the separate checks above and below.
      measured.push(await withPage({ viewport: { width: 390, height: 844 } }, `headline-${label}`, async page => {
        await page.goto(`${base}${path}`, { waitUntil: "load" });
        const title = page.locator("h1.articleTitle");
        const dimensions = await title.evaluate(element => {
          const style = getComputedStyle(element);
          return { fontSize: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight) };
        });
        assert.ok(dimensions.lineHeight / dimensions.fontSize >= 1.15, `${label}: headline line height is too tight`);
        await page.screenshot({ path: `${dir}/headline-${label}.png` });
        return { label, ...dimensions };
      }));
    }
    return measured;
  });
  await check("homepage: single character card fills its desktop grid", () =>
    withPage({ viewport: { width: 1440, height: 900 } }, "character-grid", async page => {
      await page.goto(`${base}/`, { waitUntil: "load" });
      const grid = page.locator(".characterGridSingle");
      assert.equal(await grid.locator(".characterCard").count(), 1, "fixture must contain one character card");
      await grid.screenshot({ path: `${dir}/single-character-card.png` });
      const sizes = await grid.evaluate(element => ({
        grid: element.getBoundingClientRect().width,
        card: element.querySelector(".characterCard").getBoundingClientRect().width,
        imageWidth: element.querySelector("img")?.naturalWidth,
      }));
      assert.ok(sizes.card / sizes.grid > 0.98, `single card leaves an empty column: ${JSON.stringify(sizes)}`);
      assert.ok(sizes.imageWidth > 0, "character image did not load");
      return sizes;
    }));
  await check("footer: settings panel is opaque over underlying text", () =>
    withPage({ viewport: { width: 390, height: 844 } }, "footer-settings", async page => {
      await page.goto(`${base}/`, { waitUntil: "load" });
      await page.locator(".experienceControls summary").click();
      const panel = page.locator(".experienceControlsPanel");
      await panel.waitFor({ state: "visible" });
      const background = await panel.evaluate(element => getComputedStyle(element).backgroundColor);
      assert.equal(background, "rgb(5, 5, 5)");
      await page.screenshot({ path: `${dir}/footer-settings.png` });
      return { background };
    }));
  await check("menu: Escape returns focus; a repeated same-hash link scrolls back to the section", () =>
    withPage({ viewport: { width: 390, height: 844 } }, "menu-repeat", async page => {
      await page.goto(`${base}/#lenses`, { waitUntil: "load" });
      const trigger = page.locator(".menuButton");
      await trigger.waitFor({ state: "visible" });
      await trigger.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Escape");
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");
      assert.ok(await trigger.evaluate(element => document.activeElement === element));
      await page.mouse.move(10, 400);
      await page.mouse.wheel(0, -900);
      await page.waitForTimeout(150);
      await trigger.click();
      await page.locator('#site-menu a[href="/#lenses"]').click();
      await page.waitForFunction(() => document.activeElement?.id === "lenses" && document.querySelector("#lenses").getBoundingClientRect().top < innerHeight);
      const result = await page.evaluate(() => ({ top: document.querySelector("#lenses").getBoundingClientRect().top, header: document.querySelector(".siteHeader").getBoundingClientRect().bottom }));
      assert.ok(result.top >= result.header - 1);
      await page.keyboard.press("Tab");
      assert.ok(await page.evaluate(() => Boolean(document.activeElement.closest("#lenses"))));
      return result;
    }));

  await check("outline mouse: repeated hash and back/forward history", () =>
    withPage({ viewport: { width: 390, height: 844 } }, "outline-mouse-history", async page => {
      await openArticle(page);
      await observeOutlineEvents(page);
      const trigger = page.locator(".readingOutlineTrigger");
      const links = page.locator(".readingOutlinePanel a");
      const first = await links.first().getAttribute("href");
      const last = await links.last().getAttribute("href");
      const historyBefore = await page.evaluate(() => history.length);
      await trigger.click();
      await links.first().click();
      await waitForOutlineArrival(page, first, { requireVisible: true });
      const historyFirst = await page.evaluate(() => history.length);
      assert.equal(historyFirst, historyBefore + 1, "first outline link must add a history entry");

      // A repeated selection must re-land after real user scrolling, without
      // adding a duplicate history entry for the same fragment.
      await page.mouse.move(8, 400);
      await page.mouse.wheel(0, 1100);
      await page.waitForTimeout(200);
      await trigger.click();
      await links.first().click();
      await waitForOutlineArrival(page, first, { requireVisible: true });
      assert.equal(await page.evaluate(() => history.length), historyFirst, "same-hash click duplicated history");

      await trigger.click();
      await links.last().click();
      await waitForOutlineArrival(page, last, { requireVisible: true });
      assert.equal(await page.evaluate(() => history.length), historyFirst + 1, "different outline link must add a history entry");
      await page.goBack({ waitUntil: "load" });
      await page.waitForFunction(hash => location.hash === hash, first);
      await page.goForward({ waitUntil: "load" });
      await page.waitForFunction(hash => location.hash === hash, last);
      return { first, last, historyBefore, historyFirst, back: first, forward: last };
    }));

  await check("outline keyboard: first and last projected links at every spoiler level", async () => {
    const projections = [];
    for (const level of levels) {
      projections.push(await withPage({ viewport: { width: 390, height: 844 } }, `outline-level-${level}`, async page => {
        await openArticle(page, level);
        await observeOutlineEvents(page);
        const trigger = page.locator(".readingOutlineTrigger");
        const panel = page.locator(".readingOutlinePanel");
        const hashes = await panel.locator("a").evaluateAll(links => links.map(link => link.hash));
        const sectionIds = await page.locator(".articleSection").evaluateAll(sections => sections.map(section => `#${section.id}`));
        assert.ok(hashes.length > 0, `${level}: projected outline is empty`);
        assert.deepEqual(hashes, sectionIds, `${level}: outline includes a section outside the projection`);
        for (const index of [...new Set([0, hashes.length - 1])]) {
          await trigger.focus();
          await page.keyboard.press("Enter");
          await panel.waitFor({ state: "visible" });
          await tabThroughOutline(page, hashes, index);
          await page.keyboard.press("Enter");
          await waitForOutlineArrival(page, hashes[index], { requireVisible: true });
        }
        return { level, links: hashes.length };
      }));
    }
    return projections;
  });

  if (name === "chromium") {
    await check("outline: modified click opens the projected fragment in a new tab", () =>
      withPage({ viewport: { width: 390, height: 844 } }, "outline-modified-click", async (page, context) => {
        await openArticle(page, "NONE");
        await page.locator(".readingOutlineTrigger").click();
        const hash = await page.locator(".readingOutlinePanel a").first().getAttribute("href");
        const [newPage] = await Promise.all([
          context.waitForEvent("page"),
          page.locator(".readingOutlinePanel a").first().click({ modifiers: ["Control"] }),
        ]);
        await newPage.waitForLoadState("domcontentloaded");
        const original = new URL(page.url());
        const opened = new URL(newPage.url());
        assert.equal(original.hash, "", "modified click changed the original tab");
        assert.equal(opened.hash, hash);
        assert.equal(opened.searchParams.get("spoilers"), "NONE", "new tab lost the spoiler projection");
        await newPage.close();
        return { original: original.pathname + original.search, opened: opened.pathname + opened.search + opened.hash };
      }));
  }

  await check("outline: delayed fragment completion retains heading focus", () =>
    withPage({ viewport: { width: 390, height: 844 } }, "outline-delayed-hash", async page => {
      // Model a slow browser fragment navigation without replacing the real
      // keyboard test above: the actual hash navigation still runs, later.
      await page.addInitScript(() => {
        document.addEventListener("click", event => {
          const link = event.target instanceof Element ? event.target.closest(".readingOutlinePanel a") : null;
          if (!link || event.defaultPrevented) return;
          event.preventDefault();
          const hash = link.hash;
          window.__finishOutlineFragment = () => { window.location.hash = hash; };
        }, true);
      });
      await openArticle(page);
      await observeOutlineEvents(page);
      const trigger = page.locator(".readingOutlineTrigger");
      const hash = await page.locator(".readingOutlinePanel a").first().getAttribute("href");
      const headingId = await page.locator(`[id="${hash.slice(1)}"]`).getAttribute("aria-labelledby");
      await trigger.focus();
      await page.keyboard.press("Enter");
      await page.locator(".readingOutlinePanel").waitFor({ state: "visible" });
      await tabThroughOutline(page, [hash], 0);
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => typeof window.__finishOutlineFragment === "function");
      await page.waitForTimeout(100);
      const before = await page.evaluate(() => ({ hash: location.hash, active: document.activeElement?.id }));
      assert.equal(before.hash, "", `the simulated delay did not occur: ${JSON.stringify(before)}`);
      assert.notEqual(before.active, headingId, "focus moved before fragment navigation completed");
      await page.evaluate(() => window.__finishOutlineFragment());
      await waitForOutlineArrival(page, hash, { requireVisible: true });
      return { hash, simulatedDelay: true, before };
    }));

  await check("outline: long-distance and repeated same-hash jumps with motion enabled", () =>
    withPage({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" }, "outline-motion", async page => {
      await openArticle(page);
      await observeOutlineEvents(page);
      await page.locator(".articleTableFigure").first().evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
      const trigger = page.locator(".readingOutlineTrigger");
      const first = page.locator(".readingOutlinePanel a").first();
      const hash = await first.getAttribute("href");
      for (let attempt = 0; attempt < 2; attempt += 1) {
        if (attempt) {
          await page.mouse.move(8, 400);
          await page.mouse.wheel(0, 1100);
          await page.waitForTimeout(200);
        }
        await trigger.focus();
        await page.keyboard.press("Enter");
        await page.locator(".readingOutlinePanel").waitFor({ state: "visible" });
        await tabThroughOutline(page, [hash], 0);
        await page.keyboard.press("Enter");
        await waitForOutlineArrival(page, hash, { requireVisible: true, timeout: 6000 });
      }
      return { hash, repeated: true };
    }));

  await check("print media exposes closed support and context without changing screen state", () =>
    withPage({ viewport: { width: 390, height: 844 } }, "print-media", async page => {
      await openArticle(page);
      const details = page.locator(".articleShell details");
      const before = await details.evaluateAll(items => items.map(item => item.open));
      assert.ok(before.length > 2 && before.every(open => !open));
      await page.emulateMedia({ media: "print" });
      for (const selector of [".siteHeader", ".siteFooter", ".skipLink", ".articleVerdictCore"]) {
        assert.equal(await page.locator(selector).first().evaluate(element => getComputedStyle(element).display), "none", `${selector} must not print`);
      }
      assert.ok(await page.locator(".articleVerdictGrid").isVisible(), "textual verdict must print");
      assert.equal(await page.locator(".articleClosing").evaluate(element => getComputedStyle(element).breakInside), "avoid",
        "the editorial kicker, heading and note must stay together when possible");
      const contents = await page.locator("details.articleSupport li, details.articleVerdictContext li").evaluateAll(items => items.map(item => {
        const rect = item.getBoundingClientRect();
        return { text: item.textContent.trim().slice(0, 100), visible: rect.width > 0 && rect.height > 0 && getComputedStyle(item).visibility === "visible" };
      }));
      assert.ok(contents.length > 10 && contents.every(item => item.visible), JSON.stringify(contents.filter(item => !item.visible)));
      assert.deepEqual(await details.evaluateAll(items => items.map(item => item.open)), before);
      await page.emulateMedia({ media: "screen" });
      assert.ok(!(await page.locator(".articleVerdictContext").last().locator("li").first().isVisible()));
      return { closedDetails: before.length, printVisibleItems: contents.length };
    }));

  if (name === "chromium") {
    await check("safe-area insets: landscape and portrait controls, text, and panel", async () => {
      const cases = [
        { label: "safe-landscape", viewport: { width: 844, height: 390 }, insets: { top: 24, left: 44, right: 20, bottom: 21 } },
        { label: "safe-portrait", viewport: { width: 390, height: 844 }, insets: { top: 44, left: 20, right: 0, bottom: 34 } },
      ];
      const results = [];
      for (const test of cases) {
        results.push(await withPage({ viewport: test.viewport }, test.label, async (page, context) => {
          const session = await context.newCDPSession(page);
          await session.send("Emulation.setSafeAreaInsetsOverride", { insets: test.insets });
          await openArticle(page);
          await page.locator(".readingOutlineTrigger").click();
          const measurements = await page.evaluate(() => {
            const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
            return { button: rect(".readingOutlineTrigger"), panel: rect(".readingOutlinePanel"), text: rect(".articleHeader"), scrollWidth: document.documentElement.scrollWidth };
          });
          assert.ok(measurements.button.top >= test.insets.top - 1);
          for (const item of [measurements.button, measurements.panel, measurements.text]) {
            assert.ok(item.left >= test.insets.left - 1 && item.right <= test.viewport.width - test.insets.right + 1, `${test.label}: ${JSON.stringify(measurements)}`);
          }
          assert.ok(measurements.panel.bottom <= test.viewport.height - test.insets.bottom + 1);
          assert.ok(measurements.scrollWidth <= test.viewport.width + 1);
          await page.screenshot({ path: `${dir}/${test.label}.png` });
          return { ...test, measurements };
        }));
      }
      return results;
    });
    await check("zoom reflow equivalents at 200% and 400%", async () => {
      const sizes = [{ width: 640, height: 450 }, { width: 320, height: 225 }];
      return Promise.all(sizes.map((viewport, index) => withPage({ viewport, deviceScaleFactor: index === 0 ? 2 : 4 }, `zoom-reflow-${index}`, async page => {
        await openArticle(page);
        await page.locator(".readingOutlineTrigger").click();
        const panel = await page.locator(".readingOutlinePanel").boundingBox();
        const overflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(panel.x >= -1 && panel.x + panel.width <= viewport.width + 1 && panel.y + panel.height <= viewport.height + 1);
        assert.ok(overflow.scrollWidth <= overflow.width + 1);
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => {
          const link = document.activeElement;
          return { isLink: link.matches(".readingOutlinePanel a"), link: link.getBoundingClientRect().toJSON(), panel: document.querySelector(".readingOutlinePanel").getBoundingClientRect().toJSON() };
        });
        assert.ok(focused.isLink && focused.link.top >= focused.panel.top - 1 && focused.link.bottom <= focused.panel.bottom + 1,
          `focused link clipped at zoom reflow: ${JSON.stringify(focused)}`);
        await page.screenshot({ path: `${dir}/zoom-reflow-${index === 0 ? 200 : 400}.png` });
        return { viewport, panel, overflow, focused, note: "reflow-equivalent viewport; not an actual browser zoom control" };
      })));
    });

    // Four independent factors are all recorded: light/dark, backgrounds,
    // open/closed, and preserved disclosure state. Inspect PNGs and text later.
    await check("Chromium A4 PDFs: light/dark × backgrounds × open/closed", async () => {
      for (const theme of ["dark", "light"]) {
        for (const background of [false, true]) {
          for (const opened of [false, true]) {
            const file = `${theme}-${background ? "backgrounds" : "no-backgrounds"}-${opened ? "open" : "closed"}.pdf`;
            await withPage({ viewport: { width: 390, height: 844 }, colorScheme: theme }, `pdf-${file}`, async page => {
              await openArticle(page);
              if (opened) await page.locator(".articleVerdictContext").last().locator("summary").click();
              const item = { level: "FULL", javascript: true, theme, opened };
              await pdf(page, file, item, background);
              if (!pdfManifest.fullSections.length) pdfManifest.fullSections = (await manifest(page)).sections;
            });
          }
        }
      }
      return { files: 8 };
    });
    await check("Chromium A4 PDFs: all spoiler levels, with and without JavaScript", async () => {
      for (const level of levels) {
        for (const javascript of [true, false]) {
          if (level === "FULL" && javascript) continue; // covered by the matrix above
          await withPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: javascript }, `pdf-${level}-${javascript}`, async page => {
            await page.goto(`${base}${article}?spoilers=${level}`, { waitUntil: "load" });
            if (javascript) await page.locator(".readingOutlineTrigger").waitFor({ state: "visible" });
            else {
              const fallback = page.locator('nav[aria-label="Разделы статьи без JavaScript"]');
              assert.ok(await fallback.isVisible());
              const hashes = await fallback.locator("a").evaluateAll(links => links.map(link => link.hash));
              const ids = await page.locator(".articleSection").evaluateAll(sections => sections.map(section => `#${section.id}`));
              assert.deepEqual(hashes, ids);
              await fallback.locator("a").last().click();
              assert.equal(new URL(page.url()).hash, ids.at(-1));
            }
            await pdf(page, `level-${level.toLowerCase()}-${javascript ? "js" : "nojs"}.pdf`, { level, javascript, theme: "dark", opened: false }, false);
          });
        }
      }
      return { files: 9 };
    });
  }

  await check("fallback contents works when scripts are blocked", () =>
    withPage({ viewport: { width: 390, height: 844 }, blockedScripts: true }, "blocked", async page => {
      await page.route("**/*.js", route => route.abort());
      await page.goto(`${base}${article}?spoilers=FULL`, { waitUntil: "domcontentloaded" });
      const fallback = page.locator('nav[aria-label="Разделы статьи без JavaScript"]');
      assert.ok(await fallback.isVisible());
      const hashes = await fallback.locator("a").evaluateAll(links => links.map(link => link.hash));
      const ids = await page.locator(".articleSection").evaluateAll(sections => sections.map(section => `#${section.id}`));
      assert.deepEqual(hashes, ids);
      await fallback.locator("a").last().click();
      assert.equal(new URL(page.url()).hash, ids.at(-1));
      return { links: hashes.length };
    }));
} finally {
  await browser.close();
  report.completed = true;
  save();
}
const unexpected = report.requests.filter(request => request.kind === "unexpected");
if (report.pageErrors.length || report.console.length || report.httpErrors.length || unexpected.length) {
  report.failures.push({ label: "browser errors/network", pageErrors: report.pageErrors, pageErrorContexts: report.pageErrorContexts, console: report.console, httpErrors: report.httpErrors, unexpected });
  save();
}
console.log(JSON.stringify({ browser: name, version: report.version, passed: report.results.length, failures: report.failures.length,
  network: Object.groupBy(report.requests, request => request.kind), output: dir }, null, 2));
if (report.failures.length) process.exitCode = 1;
