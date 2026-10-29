// Synthetic harness checks, deliberately separate from real product assessments.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { renderedContrast } from "./rendered-contrast.mjs";

export async function calibrateRenderedContrast(browser, directory, name) {
  const fixtures = [
    { name: "white-black", html: '<p id="target" style="color:white;background:black">Known text</p>', pass: true },
    { name: "currentColor-background", html: '<p id="target" style="color:white;background:currentColor">Invisible text must fail</p>', pass: false },
    { name: "ancestor-decoration", html: '<div style="text-decoration:line-through red"><span id="target">Foreground decoration is not background</span></div>', pass: true },
    { name: "sticky-occlusion", html: '<header style="position:fixed;inset:0 0 auto;height:100px;background:white;z-index:10"></header><p id="target" style="margin:750px 0 500px;width:200px">' + "Known text under an overlay while scrolling. ".repeat(20) + "</p>", pass: true },
    { name: "font-range-descent", html: '<div id="target" style="padding-top:100px"><h1 style="font:80px/60px sans-serif;margin:0">TITLE</h1><p style="margin:0">Ordinary adjacent line box</p></div>', pass: true },
    { name: "permanent-opacity", html: '<p id="target" style="opacity:0.8">Unsupported ancestor opacity must not pass</p>', pass: false },
    { name: "live-text-update", html: '<p id="target">Original text</p><div style="height:1800px"></div><script>addEventListener("scroll",()=>{document.querySelector("#target").firstChild.nodeValue="Updated live text"},{once:true})</script>', pass: true },
    { name: "disconnected-target", html: '<p id="target">Measured before removal</p><div style="height:1800px"></div><script>addEventListener("scroll",()=>document.querySelector("#target")?.remove(),{once:true})</script>', pass: false },
  ];
  const receipt = { violations: [], incomplete: [], actions: [] };
  const file = `${directory}/${name}-calibration.json`;
  writeFileSync(file, JSON.stringify(receipt, null, 2));
  for (const fixture of fixtures) {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    try {
      await page.setContent(`<html><body style="margin:0;background:black;color:white;font:16px/22px sans-serif">${fixture.html}</body></html>`);
      const assessment = await renderedContrast(page, [{ target: ["#target"] }], `${directory}/calibration-pairs`, `${name}-${fixture.name}`);
      receipt.actions.push({ label: `Synthetic harness only: ${fixture.name}`, expectedPass: fixture.pass, assessment });
      writeFileSync(file, JSON.stringify(receipt, null, 2));
      assert.equal(assessment.pass, fixture.pass, `${name}: calibration ${fixture.name}`);
    } finally { await page.close(); }
  }
}
