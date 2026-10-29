import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium, firefox, webkit } from "playwright-core";
import axe from "axe-core";
import { workflowError } from "./lib/audit-report.mjs";

const require = createRequire(import.meta.url);
const base = process.env.BASE_URL ?? "http://127.0.0.1:3212";
const out = "a11y-report";
const engines = { chromium, firefox, webkit };
const selected = (process.env.A11Y_BROWSERS ?? "chromium,firefox,webkit").split(",");
const routes = ["/", "/films", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"];
const report = { requestedBrowsers: selected, revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), axe: axe.version,
  playwright: require("playwright-core/package.json").version, results: [], failures: [] };
mkdirSync(out, { recursive: true });

function failure(message) {
  report.failures.push(message);
  console.error(process.env.GITHUB_ACTIONS === "true" ? workflowError(message) : message);
}

for (const name of selected) {
  let browser;
  try {
    assert.ok(engines[name], `Unknown browser: ${name}`);
    browser = await engines[name].launch({
      ...(name === "chromium" && process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
    });
    for (const width of [1440, 390]) {
      for (const [index, route] of routes.entries()) {
        const id = `${name}-${width}-${index}`;
        const context = await browser.newContext({ viewport: { width, height: 900 }, locale: "ru-RU" });
        const page = await context.newPage();
        const errors = [];
        const failuresBefore = report.failures.length;
        page.on("pageerror", error => errors.push(error.message));
        try {
          const response = await page.goto(base + route);
          assert.ok(response?.ok(), `${route}: HTTP ${response?.status()}`);
          await page.waitForLoadState("networkidle");
          await page.evaluate(() => document.fonts.ready);
          assert.equal(await page.locator("main h1").count(), 1, "one main heading");
          assert.equal(await page.locator("html").getAttribute("lang"), "ru");
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "page reflow");

          // Scan the whole document, not just main. Preserve every axe result.
          const scan = async (state, scope = "document") => {
            await page.addScriptTag({ content: axe.source });
            const result = await page.evaluate(async scope => window.axe.run(scope === "document" ? document : document.querySelector(scope), {
              runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
            }), scope);
            writeFileSync(`${out}/${id}-${state}.json`, JSON.stringify(result, null, 2));
            const review = result.incomplete.map(rule => ({ rule: rule.id, nodes: rule.nodes.length,
              reasons: [...new Set(rule.nodes.flatMap(node => [...node.any, ...node.all, ...node.none].map(check => check.message)))] }));
            report.results.push({ browser: name, version: browser.version(), width, route, url: page.url(), state, scope,
              violations: result.violations.length, review, file: `${id}-${state}.json` });
            for (const rule of result.violations) failure(`${id}/${state}: ${rule.id}: ${JSON.stringify(rule.nodes.map(node => ({ target: node.target, summary: node.failureSummary })))}`);
          };
          await scan("page");
          await page.screenshot({ path: `${out}/${id}.png` });

          if (width === 390 && route === "/") {
            for (const lens of ["story", "people", "relationships", "ideas", "moral-world", "craft"]) {
              await page.locator(`label[for="lens-radio-${lens}"]`).click();
              const meta = await page.locator(".lensFrame .frameMeta").boundingBox();
              for (const mark of await page.locator(`.lensMarkGroup[data-lens="${lens}"] .lensMark:visible`).all()) {
                const box = await mark.boundingBox();
                assert.ok(box && meta && box.y >= meta.y + meta.height, `${lens}: chips must not overlap frame metadata`);
              }
            }
            await page.locator('label[for="lens-radio-story"]').click();
          }

          if (width === 390) {
            const menu = page.locator(".menuButton");
            await menu.focus();
            await page.keyboard.press("Enter");
            await page.waitForFunction(() => document.querySelector(".menuButton")?.getAttribute("aria-expanded") === "true");
            await scan("menu-open", ".siteHeader");
            await page.keyboard.press("Escape");
            assert.equal(await menu.getAttribute("aria-expanded"), "false");
            assert.ok(await menu.evaluate(el => el === document.activeElement), "menu focus restored");
          }

          if (route.includes("/article?")) {
            const sectionCount = await page.locator(".articleSection").count();
            const hiddenId = await page.locator(".articleSection").last().getAttribute("id");
            const link = page.locator(".articleOutline a").first();
            await link.focus();
            await page.keyboard.press("Enter");
            await page.waitForFunction(() => {
              const section = document.getElementById(location.hash.slice(1));
              const heading = section?.querySelector("h2");
              if (!heading) return false;
              const top = heading.getBoundingClientRect().top;
              return top >= document.querySelector(".siteHeader").getBoundingClientRect().bottom - 1 && top < innerHeight;
            });
            const viewport = page.locator(".articleTableViewport").first();
            assert.equal(await viewport.getAttribute("role"), "region");
            assert.ok(await viewport.locator('th[scope="col"]').count());
            assert.ok(await viewport.locator('th[scope="row"]').count());
            const cell = viewport.locator("td").first();
            const originalCell = await cell.textContent();
            await cell.evaluate(el => { el.textContent = "1234567890".repeat(30); });
            await page.mouse.click(1, 100);
            await viewport.focus();
            await page.keyboard.press("Shift+Tab");
            assert.ok(await viewport.evaluate(el => el !== document.activeElement), "Tab leaves viewport");
            await page.keyboard.press("Tab");
            assert.ok(await viewport.evaluate(el => el === document.activeElement && getComputedStyle(el).outlineStyle !== "none"), "visible native keyboard focus");
            await page.keyboard.press("ArrowRight");
            await page.waitForFunction(() => document.querySelector(".articleTableViewport").scrollLeft > 0);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "wide data scrolls locally");
            await page.screenshot({ path: `${out}/${id}-table-input-stress.png` });
            await cell.evaluate((el, text) => { el.textContent = text; }, originalCell);
            await page.locator(".spoilerOption").first().click();
            await page.waitForFunction(count => document.querySelectorAll(".articleSection").length < count, sectionCount);
            await page.waitForLoadState("networkidle");
            assert.equal(await page.locator(`[id="${hiddenId}"]`).count(), 0, "hidden spoiler section absent from DOM");
            await scan("spoilers-none");
          }
          assert.deepEqual(errors, [], "no runtime errors");
          console.log(`${report.failures.length === failuresBefore ? "PASS" : "FAIL"} ${id} ${route}`);
        } catch (error) {
          failure(`${id} ${route}: ${error.stack ?? error}`);
          await page.screenshot({ path: `${out}/${id}-failure.png` }).catch(() => {});
        } finally {
          await context.close();
        }
      }
    }
  } catch (error) {
    // Missing engines and launch failures are failures, never silently skipped.
    failure(`${name}: ${error.stack ?? error}`);
  } finally {
    await browser?.close();
  }
}
writeFileSync(`${out}/summary.json`, JSON.stringify(report, null, 2));
console.log(`axe: ${report.results.length} scans; ${report.failures.length} failures. Incomplete results require review; see ${out}/summary.json.`);
process.exitCode = report.failures.length ? 1 : 0;
