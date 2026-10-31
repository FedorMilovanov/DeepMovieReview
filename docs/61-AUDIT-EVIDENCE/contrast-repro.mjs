// Audit-only reproduction; run against an isolated checkout of the audited main.
// DMR_AUDIT_ROOT=/path/to/checkout CHROME_BIN=/path/to/chromium node contrast-repro.mjs
import { createRequire } from "node:module";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(process.env.DMR_AUDIT_ROOT ?? process.cwd());
const require = createRequire(join(root, "package.json"));
const { chromium } = require("playwright-core");
const { renderedContrast } = await import(pathToFileURL(join(root, "scripts/lib/rendered-contrast.mjs")).href);
const directory = mkdtempSync(join(tmpdir(), "dmr-contrast-repro-"));
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined, args: ["--no-sandbox"] });
const fixtures = [
  { name: "control-color", expected: false, html: '<p id="target" style="color:white;background:#eee">White on pale gray must fail</p>' },
  { name: "own-solid-gradient", expected: false, html: '<p id="target" style="color:white;background-image:linear-gradient(#eee,#eee)">White on pale gray must fail</p>' },
  { name: "own-white-gradient", expected: false, html: '<p id="target" style="color:white;background-image:linear-gradient(white,white)">White on white must fail</p>' },
  { name: "parent-gradient", expected: false, html: '<div style="background-image:linear-gradient(#eee,#eee)"><p id="target" style="color:white">White on pale gray must fail</p></div>' },
  { name: "high-contrast", expected: true, html: '<p id="target" style="color:white;background:black">White on black must pass</p>' },
];
let mismatches = 0;
try {
  for (const fixture of fixtures) {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    try {
      await page.setContent(`<html><body style="margin:0;background:black;color:white;font:16px/22px sans-serif">${fixture.html}</body></html>`);
      const actual = await renderedContrast(page, [{ target: ["#target"] }], directory, fixture.name);
      const item = {
        name: fixture.name,
        expected: fixture.expected,
        actual: actual.pass,
        initialMinimum: actual.verifications?.[0]?.before?.[0]?.minimum ?? null,
        finalMinimum: actual.ranges?.[0]?.minimum ?? null,
        threshold: actual.ranges?.[0]?.threshold ?? null,
        maskEscalations: actual.maskEscalations?.length ?? 0,
      };
      console.log(JSON.stringify(item));
      if (item.actual !== item.expected) mismatches++;
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
console.log(`Screenshots: ${directory}`);
console.log(`${mismatches} mismatched fixture(s).`);
if (mismatches) process.exitCode = 1;
