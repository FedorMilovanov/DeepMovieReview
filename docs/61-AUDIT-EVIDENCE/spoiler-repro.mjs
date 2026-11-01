// Audit-only reproduction against a running isolated build.
// DMR_AUDIT_ROOT=/path/to/checkout BASE_URL=http://127.0.0.1:3211 CHROME_BIN=/path/to/chromium node spoiler-repro.mjs
// Checks exact observed phrases, not all equivalent spoilers or the adequacy of a new warning.
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

if (!process.env.BASE_URL) throw new Error("Set BASE_URL to the running audited build.");
const root = resolve(process.env.DMR_AUDIT_ROOT ?? process.cwd());
const require = createRequire(join(root, "package.json"));
const { chromium } = require("playwright-core");
const baseUrl = process.env.BASE_URL.replace(/\/$/, "");
const cases = [
  { path: "/", phrase: "выходу из клетки он придаёт ликование большого финала" },
  { path: "/films/the-truman-show?spoilers=NONE", phrase: "выходу из клетки он придаёт ликование большого финала" },
  { path: "/films/the-truman-show?spoilers=NONE", phrase: "Финал: поклон, дверь, зрители" },
  { path: "/films/the-truman-show/making", phrase: "Финальный побег", incompatiblePromise: "Здесь нет ни одного спойлера" },
];
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
let violations = 0;
try {
  const page = await context.newPage();
  let currentPath = "";
  for (const item of cases) {
    if (item.path !== currentPath) {
      const response = await page.goto(`${baseUrl}${item.path}`, { waitUntil: "networkidle" });
      if (!response || response.status() !== 200) throw new Error(`Unexpected response for ${item.path}: ${response?.status()}`);
      currentPath = item.path;
    }
    // innerText omits collapsed/hidden DOM and includes displayed text outside the viewport.
    const visibleText = await page.locator("main").innerText();
    const visible = visibleText.includes(item.phrase);
    const incompatiblePromiseVisible = item.incompatiblePromise
      ? visibleText.includes(item.incompatiblePromise)
      : null;
    // A warned making-of may contain spoilers; only flag the exact false promise.
    const violation = visible && (incompatiblePromiseVisible ?? true);
    console.log(JSON.stringify({ ...item, visible, incompatiblePromiseVisible, violation }));
    if (violation) violations++;
  }
} finally {
  await context.close();
  await browser.close();
}
console.log(`${violations} known spoiler/promise violation(s).`);
if (violations) process.exitCode = 1;
