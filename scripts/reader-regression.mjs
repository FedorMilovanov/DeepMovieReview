/** Production browser checks for readable, spoiler-safe and progressively
 * enhanced film routes. No device emulation is claimed to be a physical iOS
 * or assistive-technology test. Run against an already-started production app.
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, firefox, webkit } from "playwright-core";
import { parseArticleSectionIds } from "./lib/ios-spoiler-observation.mjs";
import { workflowError } from "./lib/audit-report.mjs";

const engines = { chromium, firefox, webkit };
const base = (process.env.BASE_URL ?? "http://127.0.0.1:3212").replace(/\/$/, "");
const requested = (process.env.READER_BROWSERS ?? "chromium").split(",").map((s) => s.trim()).filter(Boolean);
const dir = resolve(process.env.READER_AUDIT_DIR ?? "browser-audit/reader");
mkdirSync(dir, { recursive: true });
const results = [];
const stillsAtLevel = {
  NONE: ["truman-light-210.jpg"],
  MINOR: ["truman-light-210.jpg", "truman-rain-750.jpg", "truman-radio-1800.jpg"],
  MAJOR: ["truman-light-210.jpg", "truman-rain-750.jpg", "truman-radio-1800.jpg", "truman-monitor-3450.jpg",
    "truman-meryl-tools-3265.jpg", "truman-kitchen-screen-3275.jpg", "truman-reunion-3591.jpg"],
};
stillsAtLevel.ENDING = [...stillsAtLevel.MAJOR, "truman-kitchen-3240.jpg", "truman-exit-5700.jpg"];
stillsAtLevel.FULL = stillsAtLevel.ENDING;
let failures = 0;
async function check(name, page, action) {
  try {
    await action();
    results.push({ name, pass: true });
  } catch (error) {
    failures++;
    const details = String(error?.stack ?? error);
    results.push({ name, pass: false, details });
    const message = `FAIL ${name}\n${details}`;
    console.error(process.env.GITHUB_ACTIONS === "true" ? workflowError(message) : message);
    try { await page.screenshot({ path: `${dir}/failure-${failures}.png` }); } catch { /* preserve original error */ }
  }
}

for (const engine of requested) {
  if (!engines[engine]) throw new Error(`Unknown reader browser: ${engine}`);
  const browser = await engines[engine].launch({
    ...(engine === "chromium" && process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
    ...(engine === "chromium" ? { args: ["--no-sandbox", "--disable-dev-shm-usage"] } : {}),
  });
  try {
    for (const mode of ["no-js", "scripts-blocked"]) {
      for (const width of [320, 390, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 850 }, javaScriptEnabled: mode !== "no-js", reducedMotion: "reduce" });
        let blocked = 0;
        let delayedStyles = 0;
        if (mode === "no-js" && width === 320) {
          // DOMContentLoaded can precede CSS when scripting is disabled. Exercise
          // a slow stylesheet so layout checks cannot accidentally measure FOUC.
          await context.route("**/*.css", async (route) => {
            delayedStyles++;
            await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
            await route.continue();
          });
        }
        if (mode === "scripts-blocked") {
          await context.route("**/*", (route) => {
            if (route.request().resourceType() === "script") { blocked++; return route.abort(); }
            return route.continue();
          });
        }
        const page = await context.newPage();
        for (const level of ["NONE", "MINOR", "MAJOR", "ENDING", "FULL"]) {
          for (const route of ["", "/article"]) {
            const path = `/films/the-truman-show${route}?spoilers=${level}`;
            await check(`${engine} ${mode} ${width}px ${path}`, page, async () => {
              const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
              assert.equal(response?.status(), 200);
              // The heading must already be in the initial DOM, not inserted by
              // hydration. Firefox reported it invisible while a delayed sheet
              // was pending; styled visibility and geometry belong after load.
              assert.equal(await page.locator("main h1").count(), 1, "initial response must contain one heading");
              await page.waitForLoadState("load");
              const unloadedStyles = await page.locator('link[rel="stylesheet"]').evaluateAll((links) =>
                links.filter((link) => !link.sheet).map((link) => link.href),
              );
              assert.deepEqual(unloadedStyles, [], `stylesheets failed to load: ${unloadedStyles.join(", ")}`);
              assert.ok(await page.locator("main h1").isVisible(), "heading must be visible with styles loaded");
              assert.equal(await page.locator(".routeLoading:visible").count(), 0, "no permanent loading skeleton");
              assert.ok((await page.locator("main").innerText()).length > 500, "page needs substantive visible content");
              const geometry = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
              assert.ok(geometry.documentWidth <= geometry.viewport + 1, `global horizontal overflow ${JSON.stringify(geometry)}`);
              if (route === "/article") {
                assert.ok(await page.locator(".articleSection:visible").count() > 0, "article sections must render without scripts");
                assert.equal(await page.locator(".articleSceneStill img").count(), stillsAtLevel[level].length);
                const raw = await response.text();
                for (const file of stillsAtLevel.FULL) {
                  assert.equal(raw.includes(file), stillsAtLevel[level].includes(file), `${file}: spoiler projection must hold in HTML and RSC`);
                }
              }
              if (!route) {
                const paths = await page.locator('.filmReadingPaths a[href*="#"]').evaluateAll((links) =>
                  links.map((link) => link.getAttribute("href")),
                );
                assert.ok(paths.length >= 1, "quick paths must lead to visible sections");
                for (const href of paths) {
                  assert.equal(await page.locator(`[id="${href.split("#")[1]}"]`).count(), 1, `path ${href} has no unique visible target`);
                  if (level !== "NONE") assert.ok(href.includes(`spoilers=${level.toLowerCase()}`), `${href} loses the spoiler level`);
                }
                const shouldReveal = level === "ENDING" || level === "FULL";
                const raw = await response.text();
                assert.equal(raw.includes("Он отвечает привычным приветствием"), shouldReveal, "ending data must not appear in lower-level HTML or RSC payload");
                assert.equal(await page.locator("#truman-comparison").count(), shouldReveal ? 1 : 0);
                if (shouldReveal) {
                  assert.equal(await page.locator('#truman-comparison input[type="radio"]:disabled').count(), 6);
                  assert.ok((await page.locator("#truman-comparison").innerText()).includes("Вацлав Гавел"));
                }
              }
            });
          }
        }
        if (width === 390 && mode === "no-js") {
          await check(`${engine} no-js scene stills and provenance`, page, async () => {
            const figures = page.locator(".articleSceneStill");
            assert.equal(await figures.count(), 9);
            let grid = 0;
            let clips = 0;
            for (let i = 0; i < await figures.count(); i++) {
              const figure = figures.nth(i);
              const image = figure.locator("img");
              assert.match(await image.getAttribute("alt") ?? "", /\S/);
              await image.scrollIntoViewIfNeeded();
              await image.evaluate((element) => element.decode());
              const dimensions = await image.evaluate((element) => ({ width: element.naturalWidth, height: element.naturalHeight }));
              assert.deepEqual(dimensions, { width: 800, height: 450 });
              const caption = await figure.locator("figcaption").innerText();
              assert.match(caption, /Шоу Трумана.*1998.*Питер Уир/);
              if (caption.includes("Номинальная отметка сетки")) grid++;
              else { assert.match(caption, /Кадр из фрагмента.*примерно.*точный таймкод исходника не проверен/); clips++; }
              const jpeg = await image.getAttribute("src");
              const avif = await figure.locator('source[type="image/avif"]').getAttribute("srcset");
              for (const [path, type] of [[jpeg, "image/jpeg"], [avif, "image/avif"]]) {
                const response = await page.request.get(`${base}${path}`);
                assert.equal(response.status(), 200, `${path} must be served`);
                assert.match(response.headers()["content-type"] ?? "", new RegExp(`^${type}`));
                assert.ok((await response.body()).length > 1000, `${path} must contain image bytes`);
              }
            }
            assert.equal(grid, 6);
            assert.equal(clips, 3);
          });
          await check(`${engine} no-js article paragraph evidence link`, page, async () => {
            await page.goto(`${base}/films/the-truman-show/article?spoilers=FULL`, { waitUntil: "load" });
            const support = page.locator(".articleSupport").first();
            await support.locator("summary").click();
            const link = support.locator("a").first();
            const href = await link.getAttribute("href");
            assert.match(href ?? "", /spoilers=full#evidence-truman-ev-/);
            await link.click();
            await page.waitForURL(`${base}${href}`);
            const target = page.locator(`[id="${href.split("#")[1]}"]`);
            await target.waitFor({ state: "visible" });
            await target.locator("summary").click();
            assert.ok(await target.locator(".evidenceBasis").isVisible());
          });
          await check(`${engine} no-js reading time follows the visible article`, page, async () => {
            const byline = async (level) => {
              await page.goto(`${base}/films/the-truman-show/article?spoilers=${level}`, { waitUntil: "load" });
              return page.locator(".articleByline").innerText();
            };
            const none = await byline("NONE");
            const full = await byline("FULL");
            assert.match(none, /≈ \d+ мин основного текста · видимая часть/i);
            assert.match(full, /≈ \d+ мин основного текста/i);
            assert.doesNotMatch(full, /видимая часть/i);
            assert.ok(Number(/≈ (\d+)/.exec(none)?.[1]) < Number(/≈ (\d+)/.exec(full)?.[1]));
          });
          await check(`${engine} no-js scene to evidence and back`, page, async () => {
            await page.goto(`${base}/films/the-truman-show?spoilers=NONE`, { waitUntil: "load" });
            const scene = page.locator("#scene-truman-sc-day-10909");
            const disclosure = scene.locator(".filmSceneSupports details");
            await disclosure.locator("summary").click();
            const link = disclosure.locator('a[href="#evidence-truman-ev-light"]');
            assert.ok(await link.isVisible());
            await link.click();
            await page.waitForURL('**/films/the-truman-show?spoilers=NONE#evidence-truman-ev-light');
            const record = page.locator("#evidence-truman-ev-light");
            await record.waitFor({ state: "visible" });
            await record.locator("summary").click();
            assert.match(await record.locator(".evidenceBasis").innerText(), /номинальн|точный PTS/i);
            await record.locator('a[href="#scene-truman-sc-day-10909"]').click();
            await page.waitForURL('**/films/the-truman-show?spoilers=NONE#scene-truman-sc-day-10909');
            assert.ok(await scene.isVisible());
          });
          await check(`${engine} no-js duel reaches the exact subtitle record`, page, async () => {
            await page.goto(`${base}/films/the-truman-show/article?spoilers=MAJOR`, { waitUntil: "load" });
            const link = page.locator('.articleDuelEvidence a[href*="#evidence-truman-ev-marlon"]').first();
            const href = await link.getAttribute("href");
            assert.match(href ?? "", /spoilers=major#evidence-truman-ev-marlon/);
            await link.click();
            await page.waitForURL(`${base}${href}`);
            const row = page.locator(`[id="${href.split("#")[1]}"]`);
            await row.waitFor({ state: "visible" });
            await row.locator("summary").click();
            assert.match(await row.locator(".evidenceBasis").innerText(), /субтитр.*эта основа не проверяет звук и интонацию/i);
          });
          await check(`${engine} no-js article evidence link and detailed basis`, page, async () => {
            await page.goto(`${base}/films/the-truman-show/article?spoilers=FULL`, { waitUntil: "load" });
            const link = page.locator('.articleTimelineBasis a[href*="#evidence-truman-ev-knife-tools"]').first();
            assert.ok(await link.count());
            assert.match(await link.getAttribute("href") ?? "", /spoilers=full#evidence-truman-ev-knife-tools/);
            await link.click();
            await page.waitForURL('**/films/the-truman-show?spoilers=full#evidence-truman-ev-knife-tools');
            const row = page.locator("#evidence-truman-ev-knife-tools");
            await row.waitFor({ state: "visible" });
            await row.locator("summary").click();
            assert.match(await row.locator(".evidenceBasis").innerText(), /предоставленного фрагмента.*манифеста/);
          });
          await check(`${engine} no-js methodology states publication and review limits`, page, async () => {
            await page.goto(`${base}/films/the-truman-show?spoilers=NONE`, { waitUntil: "domcontentloaded" });
            const method = await page.locator(".filmMethodMeta").innerText();
            assert.match(method, /фильм опубликован/i);
            assert.match(method, /хеш повторно не пересчитан/i);
            assert.match(method, /не означает, что её прослушали/i);
            assert.doesNotMatch(method, /remains draft|scene-by-scene|Dialogue basis/i);
            await page.goto(`${base}/films/the-truman-show/article?spoilers=FULL`, { waitUntil: "domcontentloaded" });
            assert.match(await page.locator(".articleClosing").innerText(), /исходный файл здесь повторно не проверялся/i);
          });
        }
        if (width === 390) {
          await check(`${engine} ${mode} spoiler control loads projected article`, page, async () => {
            const article = `${base}/films/the-truman-show/article`;
            const baseline = await page.request.get(article);
            assert.equal(baseline.status(), 200);
            const expectedIds = parseArticleSectionIds(await baseline.text());
            await page.goto(`${article}?spoilers=FULL`, { waitUntil: "load" });
            assert.ok(await page.locator(".articleSection").count() > expectedIds.length);
            await page.locator(".spoilerOption").first().click();
            await page.waitForURL(article);
            await page.waitForLoadState("load");
            assert.deepEqual(await page.locator(".articleSection").evaluateAll((sections) => sections.map((section) => section.id)), expectedIds);
            assert.equal(await page.locator(".spoilerOption").first().getAttribute("aria-current"), "true");
          });
          await check(`${engine} ${mode} native mobile menu`, page, async () => {
            const details = page.locator("details.siteMenuFallback");
            assert.ok(await details.isVisible());
            await details.locator("summary").click();
            assert.ok(await details.locator('a[href="/films"]').isVisible());
          });
        }
        if (mode === "scripts-blocked") assert.ok(blocked > 0, `${engine}: blocked-script scenario did not block scripts`);
        if (mode === "no-js" && width === 320) assert.ok(delayedStyles > 0, `${engine}: slow-CSS scenario did not delay a stylesheet`);
        const progress = `Reader progress: ${engine} ${mode} ${width}px completed; ${failures} failures so far.`;
        console.log(process.env.GITHUB_ACTIONS === "true" ? `::notice title=Reader progress::${progress}` : progress);
        await context.close();
      }
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 850 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await check(`${engine} spoiler change loads the exact projected document`, page, async () => {
      const article = `${base}/films/the-truman-show/article`;
      const baseline = await page.request.get(article);
      assert.equal(baseline.status(), 200);
      const expectedIds = parseArticleSectionIds(await baseline.text());
      await page.goto(`${article}?spoilers=FULL`, { waitUntil: "load" });
      const fullIds = await page.locator(".articleSection").evaluateAll((sections) => sections.map((section) => section.id));
      assert.ok(fullIds.length > expectedIds.length);
      await page.evaluate(() => { window.__spoilerDocumentMarker = true; });
      await page.locator(".spoilerOption").first().click();
      await page.waitForURL(article);
      await page.waitForLoadState("load");
      assert.deepEqual(await page.locator(".articleSection").evaluateAll((sections) => sections.map((section) => section.id)), expectedIds);
      assert.equal(await page.locator(".spoilerOption").first().getAttribute("aria-current"), "true");
      assert.equal(await page.locator(`[id="${fullIds.at(-1)}"]`).count(), 0);
      assert.equal(await page.evaluate(() => window.__spoilerDocumentMarker), undefined, "a fresh document, not a stale client projection");
    });
    await check(`${engine} interactive comparison and keyboard`, page, async () => {
      await page.goto(`${base}/films/the-truman-show?spoilers=ENDING`, { waitUntil: "domcontentloaded" });
      const section = page.locator("#truman-comparison");
      await section.locator('input[type="radio"]').first().waitFor({ state: "visible" });
      // Wait for hydration rather than assuming an enabled-JS browser has it.
      await page.waitForFunction(() => !document.querySelector('#truman-comparison input[type="radio"]')?.disabled);
      assert.equal(await section.locator("tbody tr").count(), 7);
      assert.ok(await section.locator(".comparisonCellName").filter({ hasText: "Вацлав Гавел" }).first().isVisible());
      await section.getByRole("group", { name: "Вторая сторона" }).getByRole("radio", { name: "Кристоф" }).check();
      assert.match(await section.locator('[role="status"]').innerText(), /Труман Бёрбанк и Кристоф/);
      await section.getByRole("button", { name: "Поменять местами" }).focus();
      await page.keyboard.press("Enter");
      assert.match(await section.locator('[role="status"]').innerText(), /Кристоф и Труман Бёрбанк/);
      await section.getByRole("group", { name: "Вторая сторона" }).getByRole("radio", { name: "Вацлав Гавел" }).check();
      assert.match(await section.locator('[role="status"]').innerText(), /Кристоф и Вацлав Гавел/);
      assert.ok(await section.locator('a[href*="vaclavhavel.cz"]').first().isVisible());
      // At phone widths, the semantic matrix is presented as labelled pairs,
      // not a 40rem-wide clipped text column.
      assert.equal(await section.locator(".comparisonCellName:visible").count(), 14);
      assert.ok(await section.locator(".comparisonViewport").evaluate((el) => el.scrollWidth <= el.clientWidth + 1));
    });
    await check(`${engine} character evidence and mobile art`, page, async () => {
      await page.goto(`${base}/films/the-truman-show?spoilers=MAJOR`, { waitUntil: "domcontentloaded" });
      const cards = page.locator("#truman-mod-characters");
      assert.equal(await cards.locator(".characterCard").count(), 6);
      assert.equal(await cards.locator(".characterVisual").count(), 4);
      assert.ok(await cards.getByText("Другая перспектива").count() >= 4);
      assert.ok(await cards.getByText("Другая перспектива").first().isVisible(), "the counter-reading must be visible without opening a disclosure");
      const image = cards.locator(".characterVisual img").first();
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => element.decode());
      const dimensions = await image.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));
      assert.ok(dimensions.width <= 300 && Math.abs(dimensions.width / dimensions.height - 1.5) < 0.05,
        `mobile character art must not crowd the analysis: ${JSON.stringify(dimensions)}`);
      assert.match(await cards.locator(".characterVisual figcaption").first().innerText(), /не кадр/);
    });
    await check(`${engine} article source and keyboard table`, page, async () => {
      await page.goto(`${base}/films/the-truman-show/article?spoilers=FULL`, { waitUntil: "domcontentloaded" });
      const viewport = page.locator(".articleTableViewport").first();
      if (await viewport.count()) {
        await viewport.focus();
        const before = await viewport.evaluate((el) => el.scrollLeft);
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(100);
        const after = await viewport.evaluate((el) => el.scrollLeft);
        assert.ok(after > before, "focused wide table must respond to arrow keys");
      }
      assert.ok(await page.getByText("Источники мысли, не фильма:").first().isVisible());
    });
    await check(`${engine} production dossier source anchor`, page, async () => {
      await page.goto(`${base}/films/the-truman-show/making`, { waitUntil: "domcontentloaded" });
      assert.ok(await page.locator(".productionSpoilerNote").isVisible());
      const refs = await page.locator('.productionRefs a[href^="#source-"]').evaluateAll((links) =>
        links.map((link) => {
          const href = link.getAttribute("href");
          const target = document.getElementById(href.slice(1));
          return { href, text: link.textContent, aria: link.getAttribute("aria-label"), heading: target?.querySelector("h4")?.textContent };
        }),
      );
      assert.ok(refs.length > 0);
      for (const ref of refs) {
        const number = /·\s*(\d+)\s*$/.exec(ref.text ?? "")?.[1];
        assert.ok(number && ref.heading?.startsWith(`${number}.`), `reference and registry number differ: ${JSON.stringify(ref)}`);
        assert.ok(ref.aria?.startsWith(`Источник ${number}:`) && ref.aria.includes(ref.heading.slice(number.length + 1).trim()),
          `source title must be in the accessible name: ${JSON.stringify(ref)}`);
      }
      const wiki = refs.filter((ref) => ref.text?.startsWith("Wikipedia ·"));
      assert.ok(new Set(wiki.map((ref) => ref.href)).size >= 2, "distinct Wikipedia sources must be reachable");
      assert.ok(new Set(wiki.map((ref) => ref.text)).size >= 2, "distinct sources from one publisher need distinct visible labels");
      const firstLink = page.locator('a[href^="#source-"]').first();
      assert.ok(await firstLink.count());
      const parentDisclosure = firstLink.locator("xpath=ancestor::details[1]");
      if (await parentDisclosure.count() && !(await parentDisclosure.evaluate((el) => el.open))) {
        await parentDisclosure.locator("summary").first().click();
      }
      const targetSize = await firstLink.boundingBox();
      assert.ok(targetSize && targetSize.width >= 44 && targetSize.height >= 44,
        `source link must be a usable touch target: ${JSON.stringify(targetSize)}`);
      const href = await firstLink.getAttribute("href");
      await firstLink.click();
      assert.ok(await page.locator(href).isVisible(), `source target ${href} must not be hidden inside closed details`);
    });
    await check(`${engine} print comparison is not clipped`, page, async () => {
      await page.goto(`${base}/films/the-truman-show?spoilers=FULL`, { waitUntil: "domcontentloaded" });
      await page.emulateMedia({ media: "print" });
      const metric = await page.locator(".comparisonViewport").evaluate((el) => ({ width: el.clientWidth, scroll: el.scrollWidth, overflow: getComputedStyle(el).overflowX }));
      assert.ok(metric.scroll <= metric.width + 1, `print table is clipped: ${JSON.stringify(metric)}`);
      assert.notEqual(metric.overflow, "auto");
    });
    await context.close();

    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 850 }, reducedMotion: "reduce" });
    const desktop = await desktopContext.newPage();
    await check(`${engine} character art leaves room for analysis on desktop`, desktop, async () => {
      await desktop.goto(`${base}/films/the-truman-show?spoilers=MAJOR`, { waitUntil: "domcontentloaded" });
      const image = desktop.locator("#truman-mod-characters .characterVisual img").first();
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => element.decode());
      const dimensions = await image.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));
      assert.ok(dimensions.width <= 300 && Math.abs(dimensions.width / dimensions.height - 1.5) < 0.05,
        `desktop character art must not crowd the analysis: ${JSON.stringify(dimensions)}`);
    });
    await desktopContext.close();

    for (const motion of ["reduce", "no-preference"]) {
      const slowContext = await browser.newContext({ viewport: { width: 390, height: 850 }, reducedMotion: motion });
      const slowPage = await slowContext.newPage();
      let release;
      const hold = new Promise((resolveHold) => { release = resolveHold; });
      try {
        await slowPage.route("**/films/the-truman-show**", async (route) => {
          if (route.request().resourceType() === "fetch") await hold;
          await route.continue().catch(() => {});
        });
        await check(`${engine} slow client navigation (${motion})`, slowPage, async () => {
          await slowPage.goto(`${base}/films`, { waitUntil: "domcontentloaded" });
          await slowPage.waitForFunction(() => {
            const input = document.querySelector('input[type="search"]');
            return input && !input.disabled;
          });
          const link = slowPage.locator('a.filmRow[href="/films/the-truman-show"]');
          await link.click({ noWaitAfter: true });
          try {
            await link.locator(".filmLinkPending").getByText("Открываем разбор…").waitFor({ state: "visible", timeout: 5000 });
          } finally { release(); }
          await slowPage.waitForURL("**/films/the-truman-show**", { timeout: 15000 });
          assert.ok(await slowPage.locator("main h1").isVisible());
        });
      } finally { release(); await slowContext.close(); }
    }
  } finally {
    await browser.close();
  }
}
writeFileSync(`${dir}/results.json`, JSON.stringify({ base, results, failures }, null, 2));
console.log(`Reader checks: ${results.length - failures}/${results.length} passed; ${failures} failed. Engines: ${requested.join(", ")}.`);
if (failures) process.exitCode = 1;
