/** Responsive reader paths, native keyboard navigation and spoiler projection.
 * CSS zoom below is a layout stress test, not native browser zoom; the latter
 * is independently exercised by assistive-audit.mjs on the desktop OS.
 * Chromium's accessibility tree is inspected, not a substitute for a reader.
 */
import assert from "node:assert/strict";
import { chromium, firefox, webkit } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { workflowError } from "./lib/audit-report.mjs";

const base = (process.env.BASE_URL ?? "http://127.0.0.1:3212").replace(/\/$/, "");
const engineName = process.env.MOBILE_BROWSER ?? "chromium";
const engine = { chromium, firefox, webkit }[engineName];
assert.ok(engine, `Unknown mobile audit browser ${engineName}`);
const dir = resolve(process.env.MOBILE_AUDIT_DIR ?? `browser-audit/mobile-${engineName}`);
mkdirSync(dir, { recursive: true });
const report = { browser: engineName, results: [], failures: [], inProgress: null, completed: false };
const browser = await engine.launch({
  ...(engineName === "chromium" && process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
  ...(engineName === "chromium" ? { args: ["--no-sandbox", "--disable-dev-shm-usage"] } : {}),
});
let page;
async function check(name, run) {
  report.inProgress = name;
  writeFileSync(`${dir}/summary.json`, JSON.stringify(report, null, 2));
  try { await run(); report.results.push({ name, pass: true }); console.log(`PASS ${name}`); }
  catch (error) {
    report.results.push({ name, pass: false }); report.failures.push({ name, error: String(error?.stack ?? error) });
    const message = `FAIL ${name}\n${error?.stack ?? error}`;
    console.error(process.env.GITHUB_ACTIONS === "true" ? workflowError(message) : message);
    try { await page?.screenshot({ path: `${dir}/failure-${report.failures.length}.png` }); } catch { /* keep original error */ }
  } finally {
    report.inProgress = null;
    writeFileSync(`${dir}/summary.json`, JSON.stringify(report, null, 2));
  }
}
async function inHorizontalViewport(locator, viewport) {
  const rect = await locator.boundingBox(), box = await viewport.boundingBox();
  assert.ok(rect && box, "control and table viewport must have a layout box");
  assert.ok(rect.x >= box.x - 1 && rect.x + rect.width <= box.x + box.width + 1,
    `control lies outside its scroll viewport: ${JSON.stringify({ rect, box })}`);
}
async function anchorSettled(page, selector) {
  await page.waitForFunction((s) => {
    const r = document.querySelector(s)?.getBoundingClientRect();
    return r && r.top >= 50 && r.top < innerHeight - 20;
  }, selector, { timeout: 10000 });
}

// At some keyboard-reachable scroll position, every visible line in every data
// cell must fit between the viewport edges and any pinned row header. Merely
// reaching scrollLeft=max misses middle columns concealed beneath that header.
async function exposedCells(viewport) {
  return viewport.evaluate((el) => {
    const view = el.getBoundingClientRect();
    return [...el.querySelectorAll("tbody tr")].flatMap((row, ri) => {
      const header = row.querySelector('th[scope="row"]');
      const pinned = header && getComputedStyle(header).position === "sticky";
      const left = pinned ? Math.max(view.left, header.getBoundingClientRect().right) : view.left;
      return [...row.querySelectorAll(":scope > td")].map((cell, ci) => {
        const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
        const rects = [];
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent.trim()) continue;
          const range = document.createRange(); range.selectNodeContents(walker.currentNode);
          rects.push(...[...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0));
        }
        return { id: `${ri}:${ci}`, visible: rects.length > 0 && rects.every((r) =>
          r.left >= left - 1 && r.right <= view.right + 1) };
      });
    });
  });
}
async function checkAllCellsByKeyboard(page, viewport) {
  await viewport.focus();
  const seen = new Set(); let ids = [];
  for (let i = 0; i <= 26; i++) {
    const cells = await exposedCells(viewport); ids = cells.map((cell) => cell.id);
    cells.filter((cell) => cell.visible).forEach((cell) => seen.add(cell.id));
    await page.keyboard.press("ArrowRight"); await page.waitForTimeout(30);
  }
  assert.deepEqual(ids.filter((id) => !seen.has(id)), [], "every data cell must become readable without being hidden by the row header");
}
try {
  for (const width of [320, 390]) for (const js of [false, true]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, javaScriptEnabled: js, reducedMotion: "reduce" });
    page = await context.newPage();
    await check(`${width}px ${js ? "JS" : "no JS"} homepage → scene → evidence by keyboard`, async () => {
      await page.goto(`${base}/`, { waitUntil: "load" });
      const entry = page.locator('a[href$="#scene-truman-sc-day-10909"]');
      assert.equal(await entry.count(), 1);
      await entry.focus();
      await page.keyboard.press("Enter");
      await page.waitForURL(/#scene-truman-sc-day-10909$/);
      const scene = page.locator("#scene-truman-sc-day-10909");
      await anchorSettled(page, "#scene-truman-sc-day-10909");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "scene-truman-sc-day-10909", "scene target receives focus");
      const wrapper = page.locator(".filmSceneTableWrap");
      assert.equal(await wrapper.evaluate((el) => el.scrollLeft), 0);
      const summary = scene.locator(".filmSceneSupports summary");
      await inHorizontalViewport(summary, wrapper);
      await page.keyboard.press("Tab");
      assert.equal(await summary.evaluate((el) => document.activeElement === el), true, "next tab reaches scene support");
      await page.keyboard.press("Enter");
      assert.equal(await scene.locator(".filmSceneSupports").getAttribute("open"), "");
      await page.keyboard.press("Tab");
      const evidenceLink = scene.locator('.filmSceneSupports a[href="#evidence-truman-ev-daycount"]');
      assert.equal(await evidenceLink.getAttribute("aria-label"), "«День 10 909» — опора сцены «День 10 909»");
      assert.equal(await evidenceLink.evaluate((el) => document.activeElement === el), true);
      await inHorizontalViewport(evidenceLink, wrapper);
      await page.keyboard.press("Enter");
      await page.waitForURL(/#evidence-truman-ev-daycount$/);
      await anchorSettled(page, "#evidence-truman-ev-daycount");
      const target = page.locator("#evidence-truman-ev-daycount");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "evidence-truman-ev-daycount");
      const register = page.locator(".evidenceRegisterWrap");
      assert.equal(await register.evaluate((el) => el.scrollLeft), 0);
      await inHorizontalViewport(target.locator('th[scope="row"]'), register);
      const text = await target.innerText();
      for (const label of ["Титры", "Таймкод", "Сцена", "Основа", "Итог"]) assert.ok(text.includes(label), label);
      assert.equal(await target.locator(".evidenceRegisterMobileMeta .evidenceRegisterBasis summary").isVisible(), true);
      assert.equal(await page.locator("#evidence-truman-ev-wall").count(), 0, "NONE must not reveal ending evidence");
    });
    await check(`${width}px ${js ? "JS" : "no JS"} six readings and native tables`, async () => {
      const details = page.locator("#scene-lenses-truman-sc-day-10909");
      assert.equal(await details.getAttribute("open"), "");
      assert.deepEqual(await details.locator("li strong").allTextContents(), ["История", "Люди", "Отношения", "Идеи", "Моральный мир", "Мастерство"]);
      assert.match(await details.innerText(), /один эпизод, а не отдельные полные разборы/i);
      assert.equal(await page.locator(".filmSceneTable table caption").count(), 1);
      assert.equal(await page.locator(".evidenceRegisterWrap table caption").count(), 1);
      if (engineName === "chromium") {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Accessibility.enable");
        const { nodes } = await cdp.send("Accessibility.getFullAXTree");
        assert.ok(nodes.some((node) => !node.ignored && node.role?.value === "table" && /Сцены фильма/.test(node.name?.value ?? "")));
        assert.ok(nodes.some((node) => !node.ignored && node.role?.value === "rowheader" && /День 10 909.*Сцена 02/.test(node.name?.value ?? "")));
        assert.ok(nodes.some((node) => !node.ignored && node.role?.value === "rowheader" && /День 10 909.*Таймкод.*Основа.*Итог/.test(node.name?.value ?? "")));
        assert.ok(nodes.some((node) => !node.ignored && /DisclosureTriangle|button/.test(node.role?.value ?? "") && /Опоры сцены «День 10 909»/.test(node.name?.value ?? "")));
        await cdp.detach();
      }
    });
    await check(`${width}px ${js ? "JS" : "no JS"} article columns by keyboard`, async () => {
      await page.goto(`${base}/films/the-truman-show/article?spoilers=full`, { waitUntil: "load" });
      for (const figure of await page.locator(".articleTableFigure").all()) {
        assert.equal(await figure.locator(".articleTableScrollHint").isVisible(), true);
        const viewport = figure.locator(".articleTableViewport");
        assert.ok(await viewport.getAttribute("aria-describedby"));
        assert.ok(await viewport.locator('tbody th[scope="row"]').count() > 0);
        assert.ok(await viewport.locator('thead th[scope="col"]').count() >= 2);
        await viewport.scrollIntoViewIfNeeded();
        const max = await viewport.evaluate((el) => el.scrollWidth - el.clientWidth);
        await checkAllCellsByKeyboard(page, viewport);
        if (max > 1) {
          await page.waitForFunction((el) => el.scrollLeft >= el.scrollWidth - el.clientWidth - 2, await viewport.elementHandle());
          const geometry = await viewport.evaluate((el) => {
            const view = el.getBoundingClientRect(), first = el.querySelector('tbody th[scope="row"]').getBoundingClientRect();
            const last = el.querySelector('tbody tr td:last-child').getBoundingClientRect();
            return { viewLeft: view.left, viewRight: view.right, firstLeft: first.left, firstRight: first.right, lastLeft: last.left, lastRight: last.right };
          });
          assert.ok(Math.abs(geometry.firstLeft - geometry.viewLeft) < 2, `row header must remain visible: ${JSON.stringify(geometry)}`);
          assert.ok(geometry.lastLeft >= geometry.firstRight - 1 && geometry.lastRight <= geometry.viewRight + 1,
            `last cell is obscured or clipped: ${JSON.stringify(geometry)}`);
        }
      }
      for (const id of ["truman-ev-knife", "truman-ev-knife-tools", "truman-ev-cocoa-subtitles", "truman-ev-tools-subtitles"]) {
        assert.equal(await page.locator(`.articleCorrections a[href$="#evidence-${id}"]`).count(), 1);
      }
    });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  page = await context.newPage();
  await check("all spoiler levels: projected scenes, lens readings and article server data", async () => {
    for (const level of ["none", "minor", "major", "ending", "full"]) {
      const film = await page.goto(`${base}/films/the-truman-show?spoilers=${level}`, { waitUntil: "load" });
      assert.equal(film.status(), 200);
      const raw = await film.text();
      const endAllowed = level === "ending" || level === "full";
      assert.equal(raw.includes("Он отвечает привычным приветствием"), endAllowed, `${level} film HTML/RSC`);
      assert.equal(await page.locator("#evidence-truman-ev-wall").count(), endAllowed ? 1 : 0);
      assert.equal(await page.locator("#scene-lenses-truman-sc-day-10909 li strong").count(), 6);
      const article = await page.goto(`${base}/films/the-truman-show/article?spoilers=${level}`, { waitUntil: "load" });
      const html = await article.text();
      assert.equal(html.includes("Весь рекламный текст относится к ножу"), level === "full", `${level} correction HTML/RSC`);
      assert.equal(await page.locator(".articleCorrections").count(), level === "full" ? 1 : 0);
    }
  });
  for (const js of [false, true]) {
    const craftContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: js, reducedMotion: "reduce" });
    const craftPage = await craftContext.newPage(); page = craftPage;
    await check(`radio craft disclosure at MINOR, keyboard and ${js ? "JS" : "no JS"}`, async () => {
      await craftPage.goto(`${base}/films/the-truman-show?spoilers=none`, { waitUntil: "load" });
      assert.equal(await craftPage.locator(".filmCraftDetail").count(), 0, "MINOR craft detail must not enter NONE DOM");
      await craftPage.goto(`${base}/films/the-truman-show?spoilers=minor`, { waitUntil: "load" });
      const detail = craftPage.locator(".filmCraftDetail");
      assert.equal(await detail.count(), 1);
      await detail.locator("summary").focus(); await craftPage.keyboard.press("Enter");
      assert.equal(await detail.getAttribute("open"), "");
      const text = await detail.innerText();
      for (const token of ["На экране по источнику", "На съёмке", "После съёмки", "широкоугольный", "маску", "цифровые индикаторы", "Питер Бизу"]) {
        assert.ok(text.toLowerCase().includes(token.toLowerCase()), token);
      }
      assert.ok(await detail.locator('xpath=..').locator('a[href="https://theasc.com/article/the-truman-show-cinematography/"]').count());
      assert.equal(await detail.locator("img, video").count(), 0, "Disclosure must not present a reconstruction as a film still");
    });
    await craftContext.close();
  }
  page = await context.newPage();
  await check("CSS zoom 200% layout stress: measurement columns still reachable", async () => {
    await page.goto(`${base}/films/the-truman-show/article?spoilers=full`, { waitUntil: "load" });
    await page.addStyleTag({ content: "html { zoom: 2 }" });
    const viewport = page.locator(".articleTableViewport").first();
    await viewport.scrollIntoViewIfNeeded();
    const before = await viewport.evaluate((el) => el.scrollLeft);
    await checkAllCellsByKeyboard(page, viewport);
    const after = await viewport.evaluate((el) => el.scrollLeft);
    assert.ok(after > before, `keyboard scrolling must work under CSS zoom: ${before} → ${after}`);
    assert.ok(await page.locator(".articleTableScrollHint").first().isVisible());
  });
  await context.close();
  report.completed = true;
} finally {
  await browser.close();
  writeFileSync(`${dir}/summary.json`, JSON.stringify(report, null, 2));
}
console.log(`${engineName}: ${report.results.length - report.failures.length}/${report.results.length} passed`);
if (report.failures.length || !report.completed) process.exitCode = 1;
