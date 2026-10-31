import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium, firefox, webkit } from "playwright-core";
import axe from "axe-core";
import { calibrateRenderedContrast } from "./lib/contrast-calibration.mjs";
import { renderedContrast, restrictContrastToTargets } from "./lib/rendered-contrast.mjs";
import { workflowError } from "./lib/audit-report.mjs";

const require = createRequire(import.meta.url);
const base = process.env.BASE_URL ?? "http://127.0.0.1:3212";
const out = "a11y-report";
const engines = { chromium, firefox, webkit };
const selected = (process.env.A11Y_BROWSERS ?? "chromium,firefox,webkit").split(",");
const routes = ["/", "/films", "/films/the-truman-show?spoilers=ENDING", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"];
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
    if (process.env.A11Y_RENDERED_CONTRAST === "true") {
      report.results.push({ browser: name, version: browser.version(), width: 390, route: "synthetic harness only", state: "rendered-calibration",
        scope: "synthetic fixtures, not product scans", file: `${name}-calibration.json` });
      await calibrateRenderedContrast(browser, out, name);
    }
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
          if (route.includes("/films/the-truman-show?")) {
            // Audit the settled interactive state; the no-script fallback is
            // independently exercised by reader-regression.mjs.
            await page.waitForFunction(() => !document.querySelector('#truman-comparison input[type="radio"]')?.disabled);
          }
          assert.equal(await page.locator("main h1").count(), 1, "one main heading");
          assert.equal(await page.locator("html").getAttribute("lang"), "ru");
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "page reflow");

          // Scan the whole document, not just main. Preserve every axe result.
          const scan = async (state, scope = "document") => {
            // Axe samples computed colors at one instant. A disclosure that is
            // still fading in would be judged mid-transition at ~1.9:1. Wait for
            // finite entrance animations to finish, never for infinite ones and
            // never by forcing styles; the settled colors are the real ones.
            await page.waitForFunction(root => {
              const element = root === "document" ? document.documentElement : document.querySelector(root);
              if (!element) return true;
              const running = element.getAnimations({ subtree: true }).filter(animation =>
                animation.playState === "running" && Number.isFinite(animation.effect?.getComputedTiming().endTime));
              return running.length === 0;
            }, scope, { timeout: 5000 }).catch(() => {});
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
            if (process.env.A11Y_RENDERED_CONTRAST === "true") {
              const comparisonOnly = route.includes("/films/the-truman-show?") && scope === "document";
              // The full film page is axe-scanned above. Its additional rendered
              // assessment is explicitly limited to the new comparison so a
              // multi-hour full-page sweep is not misreported as completed.
              const contrastResult = comparisonOnly ? await page.evaluate(async () => window.axe.run(document.querySelector("#truman-comparison"), {
                runOnly: { type: "rule", values: ["color-contrast"] },
              })) : result;
              if (comparisonOnly) writeFileSync(`${out}/${id}-${state}-comparison-axe.json`, JSON.stringify(contrastResult, null, 2));
              const nodes = contrastResult.incomplete.filter(rule => rule.id === "color-contrast").flatMap(rule => rule.nodes);
              if (nodes.length) {
                const bounded = restrictContrastToTargets(scope, comparisonOnly);
                const assessment = await renderedContrast(page, nodes, `${out}/paint-pairs`, `${id}-${state}`, { restrictToTargetBounds: bounded });
                const file = `${id}-${state}-rendered.json`;
                writeFileSync(`${out}/${file}`, JSON.stringify({ violations: [], incomplete: [], actions: [{ label: "finite rendered contrast assessment", assessment }] }, null, 2));
                const coverage = comparisonOnly ? "comparison section only" : scope === "document" ? "whole-document targets" : `${scope} only`;
                report.results.push({ browser: name, version: browser.version(), width, route, state: `${state}-rendered-contrast`, scope: `${coverage}: paired native renderer text-range backgrounds`, file, needsReview: !assessment.pass });
                if (!assessment.pass) failure(`${id}/${state}: rendered contrast requires review: ${assessment.ranges.filter(range => !range.pass).length} ranges, ${assessment.missing.length} missing owners, tileLimit=${assessment.tileLimit}`);
              }
            }
          };
          await scan("page");
          await page.screenshot({ path: `${out}/${id}.png` });

          if (route.includes("/films/the-truman-show?")) {
            // These newly navigable controls lie outside the comparison-only
            // rendered assessment of the long film page. Audit their real,
            // keyboard-open state separately, without claiming the whole page.
            await scan("reading-paths", ".filmReadingPaths");
            const wrap = page.locator(".filmSceneTableWrap");
            await wrap.evaluate(el => { el.scrollLeft = el.scrollWidth; });
            const row = page.locator("#scene-truman-sc-day-10909");
            const disclosure = row.locator(".filmSceneSupports details");
            await disclosure.locator("summary").focus();
            await page.keyboard.press("Enter");
            assert.ok(await disclosure.evaluate(el => el.open), "scene evidence opens by keyboard");
            assert.ok(await disclosure.locator("a").first().isVisible(), "visible scene has a reachable evidence link");
            await scan("scene-links-open", "#scene-truman-sc-day-10909");
            await disclosure.locator("summary").focus();
            await page.keyboard.press("Enter");
            await wrap.evaluate(el => { el.scrollLeft = 0; });
          }
          if (route.endsWith("/making")) {
            const claims = page.locator(".productionParagraphClaims").first();
            await claims.locator("summary").focus();
            await page.keyboard.press("Enter");
            assert.ok(await claims.evaluate(el => el.open), "paragraph sources open by keyboard");
            assert.ok(await claims.locator("a").first().isVisible(), "claim has a reachable source");
            await scan("production-claim-open", ".productionParagraphClaims");
            await claims.locator("summary").focus();
            await page.keyboard.press("Enter");
          }

          if (width === 390 && route === "/") {
            for (const lens of ["story", "people", "relationships", "ideas", "moral-world", "craft"]) {
              await page.locator(`label[for="lens-radio-${lens}"]`).click();
              await page.waitForFunction(lens => {
                const group = document.querySelector(`.lensMarkGroup[data-lens="${lens}"]`);
                const section = group.closest(".sectionRule");
                return +getComputedStyle(group).opacity === 1 && (!section || +getComputedStyle(section).opacity === 1);
              }, lens);
              // One layout snapshot: separate protocol calls can straddle the
              // section's reveal translation and invent an overlap on slow CI.
              const geometry = await page.evaluate(lens => ({
                meta: document.querySelector(".lensFrame .frameMeta").getBoundingClientRect().toJSON(),
                marks: [...document.querySelectorAll(`.lensMarkGroup[data-lens="${lens}"] .lensMark`)].map(mark => mark.getBoundingClientRect().toJSON()),
              }), lens);
              assert.ok(geometry.marks.length > 0, `${lens}: visible label group must not be empty`);
              for (const box of geometry.marks) {
                assert.ok(box.y >= geometry.meta.bottom, `${lens}: chips must not overlap frame metadata: ${JSON.stringify({ box, meta: geometry.meta })}`);
              }
            }
            await page.locator('label[for="lens-radio-story"]').click();
          }

          if (route === "/") {
            const layers = await page.evaluate(() => ({
              marks: +getComputedStyle(document.querySelector('.lensMarkGroup[data-lens="story"]')).zIndex,
              position: getComputedStyle(document.querySelector('.lensMarkGroup[data-lens="story"]')).position,
              trace: +getComputedStyle(document.querySelector('.lensTrace')).zIndex,
            }));
            assert.ok(layers.position !== "static" && layers.marks > layers.trace, "decorative trace must not paint over lens label glyphs");
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
            const outline = page.getByRole("button", { name: "Оглавление статьи" });
            assert.ok(await page.evaluate(() => {
              const title = document.querySelector('.articleTitle');
              const controls = document.querySelector('.articleSpoilerBar');
              return Boolean(title.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING);
            }), "reading opens with the title, not five spoiler buttons");
            // Check both directions across long sections, not a forced active state.
            for (const index of [sectionCount - 1, 0]) {
              const section = page.locator('.articleSection').nth(index);
              const id = await section.getAttribute('id');
              await section.evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
              await page.waitForFunction(id => document.querySelector(`.readingOutlinePanel a[href="#${id}"]`)?.getAttribute('aria-current') === 'location', id);
            }
            if (width === 1440) {
              await page.setViewportSize({ width: 900, height: 320 });
              for (const index of [sectionCount - 1, Math.floor(sectionCount / 2), 0]) {
                const section = page.locator('.articleSection').nth(index);
                const id = await section.getAttribute('id');
                await section.evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
                await page.waitForFunction(id => document.querySelector(`.readingOutlinePanel a[href="#${id}"]`)?.getAttribute('aria-current') === 'location', id);
              }
              await outline.focus(); await page.keyboard.press('Enter');
              await page.waitForFunction(() => document.querySelector('.readingOutlineTrigger')?.getAttribute('aria-expanded') === 'true');
              assert.ok(await page.locator('.readingOutlinePanel').evaluate(el => {
                const r = el.getBoundingClientRect();
                return r.x >= 0 && r.y >= document.querySelector(".siteHeader").getBoundingClientRect().bottom && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
              }), "landscape contents panel fits the viewport");
              await page.screenshot({ path: `${out}/${id}-landscape-outline.png` });
              await page.keyboard.press('Escape');
              await page.setViewportSize({ width, height: 900 });
            }
            const analysis = page.locator('.articleAnalysis');
            if (await analysis.count()) {
              await analysis.locator('summary').focus();
              await page.keyboard.press('Enter');
              assert.ok(await analysis.evaluate(el => el.open), "canonical decision map opens natively");
              assert.ok(await analysis.locator('.filmDecisionOptions article').count());
              const counter = analysis.locator('.filmCounterevidence');
              if (await counter.count()) {
                assert.equal(await counter.evaluate(el => getComputedStyle(el).color),
                  await page.locator('.articleStandfirst').evaluate(el => getComputedStyle(el).color),
                  'counterevidence computed ink-2 survives the module paragraph cascade');
              }
              await scan('decision-open', '.articleAnalysis');
              await page.keyboard.press('Enter');
              assert.equal(await analysis.evaluate(el => el.open), false);
            }
            const context = page.locator('#article-verdict .articleVerdictContext');
            if (await context.count()) {
              await context.locator('summary').focus();
              await page.keyboard.press('Enter');
              assert.ok(await context.evaluate(el => el.open), "native qualifications disclosure opens by keyboard");
              assert.ok(await context.locator('li').count(), "canonical qualifications rendered");
              await page.keyboard.press('Enter');
              assert.equal(await context.evaluate(el => el.open), false);
            }
            await page.locator('.articleSection').last().evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
            await page.waitForFunction(() => document.querySelector('.readingOutlinePanel a:last-child')?.getAttribute('aria-current') === 'location');
            const readingPosition = await page.evaluate(() => scrollY);
            await outline.focus(); await page.keyboard.press('Enter');
            await page.waitForFunction(() => {
              const panel = document.querySelector('.readingOutlinePanel');
              const item = panel.querySelector('[aria-current="location"]');
              const heading = panel.querySelector('.readingOutlineHeading');
              return !panel.hidden && item.getBoundingClientRect().top >= heading.getBoundingClientRect().bottom - 1 &&
                item.getBoundingClientRect().bottom <= panel.getBoundingClientRect().bottom + 1;
            });
            assert.equal(await page.evaluate(() => scrollY), readingPosition, 'opening contents does not move the article');
            await page.keyboard.press('Escape');
            await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));

            if (width === 1440) {
              // Escape correctly restores keyboard focus. Move it naturally
              // before testing mouse-only dismissal; focused contents stay open.
              await page.keyboard.press("Tab");
              assert.ok(await outline.evaluate(el => !el.closest(".readingOutline").contains(document.activeElement)));
              await outline.hover();
              await page.waitForFunction(() => document.querySelector('.readingOutlineTrigger')?.getAttribute('aria-expanded') === 'true');
              await page.mouse.move(1, 100);
              await page.waitForFunction(() => document.querySelector('.readingOutlineTrigger')?.getAttribute('aria-expanded') === 'false');
            }
            await outline.focus();
            await page.keyboard.press("Enter");
            await page.waitForFunction(() => document.querySelector('.readingOutlineTrigger')?.getAttribute('aria-expanded') === 'true');
            assert.equal(await outline.getAttribute("aria-expanded"), "true");
            await page.keyboard.press("Escape");
            await page.waitForFunction(() => document.querySelector('.readingOutlineTrigger')?.getAttribute('aria-expanded') === 'false');
            assert.equal(await outline.getAttribute("aria-expanded"), "false");
            assert.ok(await outline.evaluate(el => el === document.activeElement), "outline focus restored");
            await page.keyboard.press("Enter");
            await page.waitForFunction(() => document.querySelector('.readingOutlineTrigger')?.getAttribute('aria-expanded') === 'true');
            assert.ok(await page.locator('.readingOutlinePanel').evaluate(el => {
              const rect = el.getBoundingClientRect();
              return rect.left >= 0 && rect.right <= innerWidth + 1 && rect.top >= 0 && rect.bottom <= innerHeight + 1;
            }), "open outline fits the actual viewport");
            await scan("outline-open", ".readingOutline");
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
const axeScans = report.results.filter(result => Number.isInteger(result.violations)).length;
const renderedScans = report.results.filter(result => result.state.endsWith("-rendered-contrast")).length;
console.log(`axe: ${axeScans} scans; ${renderedScans} separate rendered assessments; ${report.failures.length} failures. Raw incomplete results retained; see ${out}/summary.json.`);
process.exitCode = report.failures.length ? 1 : 0;
