// Audit-only reproduction against a running isolated production build.
// DMR_AUDIT_ROOT=/path/to/checkout BASE_URL=http://127.0.0.1:3211 CHROME_BIN=/path/to/chromium node nojs-repro.mjs
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

if (!process.env.BASE_URL) throw new Error("Set BASE_URL to the running audited build.");
const root = resolve(process.env.DMR_AUDIT_ROOT ?? process.cwd());
const require = createRequire(join(root, "package.json"));
const { chromium } = require("playwright-core");
const baseUrl = process.env.BASE_URL.replace(/\/$/, "");
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined, args: ["--no-sandbox"] });
// The capital S is important. `javascriptEnabled` is not the Playwright option.
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
let failures = 0;
try {
  const page = await context.newPage();
  for (const path of ["/", "/films", "/films/the-truman-show", "/films/the-truman-show/article?spoilers=full", "/films/the-truman-show/making"]) {
    const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
    const state = await page.evaluate(() => {
      const heading = document.querySelector("main h1");
      const sections = [...document.querySelectorAll(".articleSection")];
      const visible = (element) => Boolean(element && element.getClientRects().length);
      return {
        visibleHeading: visible(heading),
        visibleHeadingText: visible(heading) ? heading.textContent : null,
        visibleLoading: [...document.querySelectorAll(".routeLoading")].filter(visible).length,
        articleSectionsInDom: sections.length,
        visibleArticleSections: sections.filter(visible).length,
        articleInsideHiddenStream: Boolean(sections[0]?.closest("[hidden]")),
      };
    });
    const pass = response?.status() === 200 && state.visibleHeading && state.visibleLoading === 0 &&
      (!path.includes("/article?") || state.visibleArticleSections > 0);
    console.log(JSON.stringify({ path, status: response?.status(), ...state, pass }));
    if (!pass) failures++;
  }
} finally {
  await context.close();
  await browser.close();
}
console.log(`${failures} route(s) failed the visible-content check.`);
if (failures) process.exitCode = 1;
