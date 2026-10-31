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
    { name: "moving-high-contrast", html: '<div style="height:2000px"></div><p id="target" style="color:white;background:black">Moving text must settle before the paired capture</p><script>addEventListener("scroll",()=>document.querySelector("#target").animate([{transform:"translateY(40px)"},{transform:"translateY(0)"}],{duration:700}),{once:true})</script>', pass: true, bounded: true, mustMeasure: true },
    { name: "moving-low-contrast", html: '<div style="height:2000px"></div><p id="target" style="color:white;background:#eee">Moving text must still fail on a pale background</p><script>addEventListener("scroll",()=>document.querySelector("#target").animate([{transform:"translateY(40px)"},{transform:"translateY(0)"}],{duration:700}),{once:true})</script>', pass: false, bounded: true, mustMeasure: true },
    { name: "first-capture-shift-unwarmed", html: '<div style="height:1500px"></div><p id="target">Screenshot moves the scroll anchor</p><div style="height:1000px"></div>', pass: false, bounded: true, shiftOnCapture: 1, warmup: false, expectPhase: "before-background-capture" },
    { name: "first-capture-shift-warmed", html: '<div style="height:1500px"></div><p id="target">Discard the shifted screenshot and measure again</p><div style="height:1000px"></div>', pass: true, bounded: true, shiftOnCapture: 1, warmup: true, mustMeasure: true },
    { name: "background-capture-shift", html: '<div style="height:1500px"></div><p id="target">A moved background cannot cover the original text</p><div style="height:1000px"></div>', pass: false, bounded: true, shiftOnCapture: 2, warmup: false, expectPhase: "after-background-capture" },
    { name: "permanently-moving-text", html: '<p id="target" style="color:white;background:black">Unsettled geometry must not pass</p><script>let i=0;setInterval(()=>document.querySelector("#target").style.transform=`translateX(${i++%31}px)`,17)</script>', pass: false },
    { name: "blocked-text-mask", html: '<style>#target{-webkit-text-fill-color:white!important}</style><p id="target" style="color:white;background:black">An unremovable foreground must not pass as a background</p>', pass: false },
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
      if (fixture.shiftOnCapture) {
        // Synthetic driver behaviour: one screenshot moves the viewport after
        // capture. This tests the harness, not any real browser's implementation.
        const capture = page.screenshot.bind(page);
        let count = 0;
        page.screenshot = async (...args) => {
          const bytes = await capture(...args);
          if (++count === fixture.shiftOnCapture) await page.evaluate(() => scrollTo({ top: scrollY - 34, behavior: "instant" }));
          return bytes;
        };
      }
      const assessment = await renderedContrast(page, [{ target: ["#target"] }], `${directory}/calibration-pairs`, `${name}-${fixture.name}`, {
        restrictToTargetBounds: fixture.bounded, ...(fixture.warmup === undefined ? {} : { warmupFirstCapture: fixture.warmup }),
      });
      receipt.actions.push({ label: `Synthetic harness only: ${fixture.name}`, expectedPass: fixture.pass, assessment });
      writeFileSync(file, JSON.stringify(receipt, null, 2));
      assert.equal(assessment.pass, fixture.pass, `${name}: calibration ${fixture.name}`);
      if (fixture.mustMeasure) assert.ok(assessment.ranges.some(range => Number.isFinite(range.minimum) && !range.issues.length),
        `${name}: ${fixture.name} must actually measure the settled background`);
      if (fixture.expectPhase) assert.ok(assessment.maskValidation.some(item => item.phase === fixture.expectPhase && item.moved.length),
        `${name}: ${fixture.name} must identify which capture moved`);
      if (fixture.shiftOnCapture && fixture.warmup) assert.ok(assessment.screenshotWarmups.some(item => item.before - item.after === 34),
        `${name}: warm-up must record the simulated scroll change`);
      if (fixture.bounded) assert.ok(assessment.frames.length <= 8 && !assessment.tileLimit, `${name}: scoped sweep traversed unrelated page space`);
    } finally { await page.close(); }
  }
}
