// Synthetic harness checks, deliberately separate from real product assessments.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { renderedContrast } from "./rendered-contrast.mjs";

export async function calibrateRenderedContrast(browser, directory, name) {
  const fixtures = [
    { name: "bounded-distant-high-contrast", html: '<div style="height:150000px"></div><p id="target" style="color:white;background:black">Target far below the fold</p><div style="height:150000px"></div>', pass: true, bounded: true },
    { name: "bounded-distant-gradient", html: '<div style="height:150000px"></div><p id="target" style="color:white;background-image:linear-gradient(#eee,#eee)">Target far below the fold must fail</p><div style="height:150000px"></div>', pass: false, bounded: true },
    { name: "white-black", html: '<p id="target" style="color:white;background:black">Known text</p>', pass: true },
    { name: "transitioned-text-mask", html: '<p id="target" style="color:white;background:black;transition:all 0.01ms">Deferred text paint must settle</p>', pass: true },
    { name: "white-own-gray", html: '<p id="target" style="color:white;background:#eee">White on pale gray must fail</p>', pass: false },
    { name: "white-own-gray-gradient", html: '<p id="target" style="color:white;background-image:linear-gradient(#eee,#eee)">White on pale gray must fail</p>', pass: false },
    { name: "white-own-white-gradient", html: '<p id="target" style="color:white;background-image:linear-gradient(white,white)">White on white must fail</p>', pass: false },
    { name: "white-parent-gradient", html: '<div style="background-image:linear-gradient(#eee,#eee)"><p id="target" style="color:white">White on pale gray must fail</p></div>', pass: false },
    { name: "white-pseudo-background", html: '<style>#target{position:relative;isolation:isolate}#target::before{content:"";position:absolute;inset:0;background:#eee;z-index:-1}</style><p id="target" style="color:white">A painted pseudo-element must not disappear</p>', pass: false },
    { name: "currentColor-background", html: '<p id="target" style="color:white;background:currentColor">Invisible text must fail</p>', pass: false },
    { name: "ancestor-decoration", html: '<div style="text-decoration:line-through red"><span id="target">Foreground decoration is not background</span></div>', pass: true },
    { name: "sticky-occlusion", html: '<header style="position:fixed;inset:0 0 auto;height:100px;background:white;z-index:10"></header><p id="target" style="margin:750px 0 500px;width:200px">' + "Known text under an overlay while scrolling. ".repeat(20) + "</p>", pass: true },
    { name: "font-range-descent", html: '<div id="target" style="padding-top:100px"><h1 style="font:80px/60px sans-serif;margin:0">TITLE</h1><p style="margin:0">Ordinary adjacent line box</p></div>', pass: true },
    { name: "permanent-opacity", html: '<p id="target" style="opacity:0.8">Unsupported ancestor opacity must not pass</p>', pass: false },
    { name: "entrance-filter", html: '<style>@keyframes entrance {from{filter:brightness(0.4)}to{filter:none}}</style><p id="target" style="animation:entrance 800ms backwards">Wait for actual filter settling</p>', pass: true },
    { name: "permanent-filter", html: '<p id="target" style="filter:brightness(0.8)">Unsupported permanent filter must fail</p>', pass: false },
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
      const assessment = await renderedContrast(page, [{ target: ["#target"] }], `${directory}/calibration-pairs`, `${name}-${fixture.name}`, { restrictToTargetBounds: fixture.bounded });
      receipt.actions.push({ label: `Synthetic harness only: ${fixture.name}`, expectedPass: fixture.pass, assessment });
      writeFileSync(file, JSON.stringify(receipt, null, 2));
      assert.equal(assessment.pass, fixture.pass, `${name}: calibration ${fixture.name}`);
      if (fixture.bounded) assert.ok(assessment.frames.length <= 8 && !assessment.tileLimit, `${name}: scoped sweep traversed unrelated page space`);
    } finally { await page.close(); }
  }
}
