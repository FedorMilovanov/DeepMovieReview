// A finite rendered-background bound, not an axe-incomplete waiver or WCAG certificate.
import { PNG } from "pngjs";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { rectangleContrast } from "./contrast-pixels.mjs";

// Scoped axe scans only need tiles intersecting their own live text ranges.
// Whole-document scans still traverse the document, except the explicitly
// reported comparison-only assessment. Coverage remains checked independently.
export function restrictContrastToTargets(scope, comparisonOnly = false) {
  return comparisonOnly || scope !== "document";
}

// Mask text foreground paint only. Changing CSS color would also change currentColor
// backgrounds/borders/icons and could manufacture an apparently better bound.
export function maskTextPaint(s) {
  const elements = new Set(s.records.filter(record => s.visibleIds.has(record.id)).map(record => record.element));
  // Decorations are foreground paint, not the background behind the glyphs.
  // They propagate from ancestors, so preserve/restore their actual paint owners.
  const decorations = new Set();
  for (const element of elements) for (let parent = element; parent; parent = parent.parentElement) {
    if (getComputedStyle(parent).textDecorationLine !== "none") decorations.add(parent);
  }
  s.saved = [...new Set([...elements, ...decorations])].map(element => ({ element, properties: ["-webkit-text-fill-color", "text-shadow", "fill", "text-decoration-color", "visibility"].map(name => ({ name, value: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name) })) }));
  for (const { element } of s.saved) {
    if (decorations.has(element)) element.style.setProperty("text-decoration-color", "transparent");
    if (!elements.has(element)) continue;
    element.style.setProperty("-webkit-text-fill-color", "transparent");
    element.style.setProperty("text-shadow", "none");
    if (element.namespaceURI === "http://www.w3.org/2000/svg") element.style.setProperty("fill", "transparent");
  }
}
export function restoreTextPaint(s) {
  for (const { element, properties } of s.saved) for (const { name, value, priority } of properties) {
    if (value) element.style.setProperty(name, value, priority); else element.style.removeProperty(name);
  }
  s.saved = [];
}

// A text-coloured background is a real contrast failure, not a failed mask.
// Only call the mask lost when no opaque ancestor paints that same colour.
export function samePaintedColor(a, b, tolerance = 12) {
  if (!a || !b || a.length < 3 || b.length < 3) return false;
  if ((a[3] ?? 1) < 1 || (b[3] ?? 1) < 1) return false;
  return [0, 1, 2].every(index => Math.abs(a[index] - b[index]) <= tolerance);
}

// Visibility is only a valid second mask when hiding the text owner cannot
// remove any of the background being measured. A gradient, pseudo-element,
// border, shadow, SVG or descendant might paint behind the glyphs. In that case
// retain the foreground-only mask; if it still leaks, report an incomplete/fail.
// This function is serialised into the page and must remain self-contained.
export function hardMaskTextPaint(s) {
  const protectedIds = [];
  for (const record of s.records) {
    if (!s.visibleIds.has(record.id)) continue;
    const element = record.element;
    const style = getComputedStyle(element);
    const hasPaint = value => Boolean(value && value !== "none" && value !== "normal");
    const transparent = value => !value || value === "transparent" || value === "rgba(0, 0, 0, 0)";
    const generated = ["::before", "::after"].some(pseudo => {
      const part = getComputedStyle(element, pseudo);
      return part.display !== "none" && part.visibility !== "hidden" &&
        part.content && part.content !== "none" && part.content !== "normal";
    });
    const ownsPaint = element.namespaceURI === "http://www.w3.org/2000/svg" ||
      (element.children?.length ?? 0) > 0 || generated ||
      !transparent(style.backgroundColor) || hasPaint(style.backgroundImage) ||
      hasPaint(style.boxShadow) || hasPaint(style.borderImageSource) ||
      hasPaint(style.maskImage) || hasPaint(style.webkitMaskImage) ||
      ["Top", "Right", "Bottom", "Left"].some(side =>
        parseFloat(style[`border${side}Width`] || "0") > 0 &&
        style[`border${side}Style`] !== "none");
    if (ownsPaint) protectedIds.push(record.id);
    else element.style.setProperty("visibility", "hidden");
  }
  s.protectedMaskIds = protectedIds;
  s.usedHardMask = true;
}

// Updating Text.nodeValue collapses existing DOM Range offsets in WebKit.
// Re-select the same connected text node, and version its actual content; never
// transfer old geometry/coverage to replacement text or resurrect detached DOM.
export function refreshTextRanges(s) {
  for (const record of s.records) if (record.text.isConnected) {
    const content = record.text.textContent;
    if (content !== record.content) {
      s.textChanges.push({ id: record.id, version: ++record.version, from: record.content, to: content });
      record.content = content;
    }
    record.range.selectNodeContents(record.text);
  }
}

export function missingRangeIds(expected, measurements) {
  return new Set(expected.filter(record => {
    if (!record.connected || record.lines === 0) return true;
    // A zero-area line box draws nothing and can never be sampled. Requiring it
    // would report a permanently uncovered owner for text that paints no glyphs —
    // a wrapped trailing space, not a reading risk.
    const empty = new Set(record.emptyLines ?? []);
    return Array.from({ length: record.lines }, (_, line) => line).filter(line => !empty.has(line))
      .some(line => !measurements.has(`${record.id}:${record.version ?? 0}:${line}`));
  }).map(record => record.id));
}


// A line box can straddle the sticky header's bottom edge. Pixels inside the
// bar paint the bar, not the text background, and the glyphs there are not
// visible at all. Keep the longest fully exposed band of rows: a finite bound
// over what a reader can actually see, never a waiver for ordinary overlaps.
export function exposedRows(height, isOverlay) {
  const rows = Math.max(0, Math.ceil(height));
  let best = null, start = null;
  for (let row = 0; row <= rows; row++) {
    const blocked = row < rows && isOverlay(row);
    if (!blocked && start === null) start = row;
    if ((blocked || row === rows) && start !== null) {
      if (!best || row - start > best[1] - best[0]) best = [start, row];
      start = null;
    }
  }
  return best && best[1] > best[0] ? best : null;
}

export function snapshotTextPaint(s) {
  // A fully visible line can be sampled on an overlapping scroll tile. Do not use
  // a fixed header's paint as if it were the background behind an occluded line.
  // Range ascent/descent boxes can extend into ordinary neighbouring line boxes;
  // a different normal-flow hit is not proof that it paints over the glyphs.
  function exposed(element, rect, width, height, hitTest) {
    // Existing pointer-events:none paint (e.g. lens annotations) cannot own a
    // hit. Use its nearest hit-testable container, without changing any style.
    while (element.parentElement && getComputedStyle(element).pointerEvents === "none") element = element.parentElement;
    if (rect.left < 0 || rect.right > width || rect.top < 0 || rect.bottom > height) return false;
    for (const x of [rect.left + Math.min(0.5, rect.width / 2), rect.right - Math.min(0.5, rect.width / 2)]) {
      for (const y of [rect.top + Math.min(0.5, rect.height / 2), rect.bottom - Math.min(0.5, rect.height / 2)]) {
        const top = hitTest(x, y);
        if (!top) return false;
        for (let overlay = top; overlay; overlay = overlay.parentElement) {
          if (["fixed", "sticky"].includes(getComputedStyle(overlay).position) &&
              !(overlay === element || element.contains(overlay) || overlay.contains(element))) return false;
        }
      }
    }
    return true;
  }
  const boxes = [];
  const rgba = color => {
    s.ctx.clearRect(0, 0, 1, 1); s.ctx.fillStyle = color; s.ctx.fillRect(0, 0, 1, 1);
    const value = [...s.ctx.getImageData(0, 0, 1, 1).data]; value[3] /= 255; return value;
  };
  for (const record of s.records) {
    const rects = [...record.range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth);
    if (!rects.length) continue;
    const style = getComputedStyle(record.element);
    const color = record.element.namespaceURI === "http://www.w3.org/2000/svg" ? style.fill : style.webkitTextFillColor || style.color;
    const foreground = rgba(color);
    let issue;
    if (!foreground[3]) issue = "Transparent/gradient text foreground requires separate assessment";
    if (style.textShadow !== "none" || parseFloat(style.webkitTextStrokeWidth || "0") > 0) issue = "Text shadow/stroke requires separate assessment";
    let settling = false, unpainted = false;
    for (let element = record.element; element; element = element.parentElement) {
      const parent = getComputedStyle(element);
      if (+parent.opacity === 0) unpainted = true;
      if (+parent.opacity !== 1) { settling = true; issue = "Ancestor opacity is not one"; }
      if (parent.filter !== "none" || parent.mixBlendMode !== "normal") {
        issue = `Filter/blend requires separate assessment (${parent.filter}; ${parent.mixBlendMode})`;
        // WebKit can report an animation finished before its computed filter
        // commits to none. Wait for the actual style, not an identity tolerance
        // or animation clock. A permanent/paused filter remains uncovered/fails.
        settling = true;
      }
    }
    if (unpainted) continue;
    // Walk real ancestors for an opaque background colour equal to the glyphs.
    // Inline comparison: this function is serialised into the page, so it may
    // not reference module-scope helpers.
    const samePainted = (a, b, tolerance = 12) => (a[3] ?? 1) >= 1 && (b[3] ?? 1) >= 1 &&
      [0, 1, 2].every(index => Math.abs(a[index] - b[index]) <= tolerance);
    let backgroundExplainable = false;
    for (let element = record.element; element; element = element.parentElement) {
      const painted = rgba(getComputedStyle(element).backgroundColor);
      if (samePainted(painted, foreground)) { backgroundExplainable = true; break; }
    }
    const threshold = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontWeight) >= 700 && parseFloat(style.fontSize) >= 14 * 4 / 3) ? 3 : 4.5;
    [...record.range.getClientRects()].forEach((rect, line) => {
      if (!(rect.width > 0 && rect.height > 0 && exposed(record.element, rect, innerWidth, innerHeight, (x, y) => document.elementFromPoint(x, y)))) return;
      const overlayAt = (x, y) => {
        const top = document.elementFromPoint(x, y);
        if (!top) return true;
        for (let overlay = top; overlay; overlay = overlay.parentElement) {
          if (["fixed", "sticky"].includes(getComputedStyle(overlay).position) &&
              !(overlay === record.element || record.element.contains(overlay) || overlay.contains(record.element))) return true;
        }
        return false;
      };
      const inset = Math.min(0.5, rect.width / 2);
      // Sample whole device pixels, not fractional font boxes: a line box that
      // starts 0.14px above the sticky bar would otherwise drag the bar's last
      // painted row into the bound.
      const rowOrigin = Math.floor(rect.top), rowEnd = Math.ceil(rect.bottom);
      const occluded = Array.from({ length: Math.max(0, rowEnd - rowOrigin) }, (_, row) =>
        overlayAt(rect.left + inset, rowOrigin + row + 0.5) || overlayAt(rect.right - inset, rowOrigin + row + 0.5));
      boxes.push({ id: record.id, version: record.version, line, rect: rect.toJSON(), rowOrigin, occluded, foreground, color, threshold, issue, settling, backgroundExplainable });
    });
  }
  s.visibleIds = new Set(boxes.map(box => box.id));
  s.currentBoxes = boxes;
  return { boxes, scroll: scrollY, width: innerWidth, height: innerHeight, end: scrollY + innerHeight >= document.documentElement.scrollHeight };
}

export async function renderedContrast(page, nodes, directory, id, options = {}) {
  mkdirSync(directory, { recursive: true });
  const state = await page.evaluateHandle(targets => {
    const records = [], owners = [], byText = new Map();
    for (const target of targets) {
      const owner = { target, ids: [] }; owners.push(owner);
      if (target.length !== 1 || typeof target[0] !== "string") { owner.error = "Unsupported nested target"; continue; }
      const root = document.querySelector(target[0]);
      if (!root) { owner.error = "Target absent"; continue; }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let text;
      while ((text = walker.nextNode())) {
        if (!text.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(text);
        if (!range.getClientRects().length) continue;
        if (!byText.has(text)) {
          const record = { id: records.length, element: text.parentElement, text, content: text.textContent, version: 0, range };
          byText.set(text, record.id); records.push(record);
        }
        owner.ids.push(byText.get(text));
      }
      if (!owner.ids.length) owner.error = "No rendered DOM text range";
    }
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
    return { records, owners, saved: [], textChanges: [], ctx: canvas.getContext("2d", { willReadFrequently: true }) };
  }, nodes.map(node => node.target));
  const previousScroll = await page.evaluate(() => scrollY);
  const measurements = new Map(), frames = [], deferred = [], maskEscalations = [], verifications = [], maskValidation = [], geometryWaits = [];
  let tileLimit = false;
  try {
    // An explicitly scoped audit (e.g. the comparison far down a long film
    // page) need not capture every unrelated viewport. Coverage is still
    // rechecked against live ranges below; anything missed is revisited or
    // fails closed. Ordinary whole-document scans keep their original traversal.
    const extent = options.restrictToTargetBounds ? await page.evaluate(s => {
      const rects = s.records.flatMap(record => [...record.range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0));
      return rects.length ? { top: Math.max(0, Math.min(...rects.map(rect => rect.top + scrollY)) - innerHeight * 0.25),
        bottom: Math.max(...rects.map(rect => rect.bottom + scrollY)) } : { top: 0, bottom: 0 };
    }, state) : null;
    let top = extent?.top ?? 0, revisiting = false, tile = 0;
    // Coverage is measured against the layout as it is, and a record can re-wrap
    // after its visit: an element that measured one line can be two lines by the
    // time the pass ends. Each record may therefore be revisited a bounded number
    // of times, and coverage is re-checked after the traversal.
    const revisitAttempts = new Map(), coverageRounds = [];
    for (let round = 0; round < 3; round++) {
      for (; tile < 250; tile++) {
        await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), top);
        await page.waitForTimeout(100);
        // A scroll-linked reveal can move text while opacity and filter already
        // look settled. Pair screenshots only after the actual scroll position
        // and every visible range have matched across three observations; never
        // force styles, round away movement, or waive a permanently moving box.
        let snapshot, previousGeometry, stable = 0, attempts = 0;
        for (; attempts < 30; attempts++) {
          await page.evaluate(refreshTextRanges, state);
          snapshot = await page.evaluate(snapshotTextPaint, state);
          const geometry = JSON.stringify({ scroll: snapshot.scroll, boxes: snapshot.boxes.map(box =>
            [box.id, box.version, box.line, box.rect.x, box.rect.y, box.rect.width, box.rect.height]) });
          stable = !snapshot.boxes.some(box => box.settling) && geometry === previousGeometry ? stable + 1 : 0;
          previousGeometry = geometry;
          if (stable >= 2) break;
          await page.waitForTimeout(100);
        }
        geometryWaits.push({ tile, observations: Math.min(attempts + 1, 30), settled: stable >= 2 });
        if (stable < 2) for (const box of snapshot.boxes) box.issue = "Text geometry did not settle before capture";
        for (const box of snapshot.boxes.filter(box => box.settling)) deferred.push({ id: box.id, line: box.line, tile, reason: box.issue });
        snapshot.boxes = snapshot.boxes.filter(box => !box.settling).flatMap(box => {
          const band = exposedRows(box.occluded.length, row => box.occluded[row]);
          if (!band) return [];
          const top = box.rowOrigin + band[0], bottom = box.rowOrigin + band[1];
          return [{ ...box, sample: { x: box.rect.x, y: top, width: box.rect.width, height: bottom - top } }];
        });
        await page.evaluate(({ s, boxes }) => {
          s.currentBoxes = boxes; s.visibleIds = new Set(boxes.map(box => box.id));
        }, { s: state, boxes: snapshot.boxes });
        const original = await page.screenshot();
        // A reveal animation can start after the settle probe and repaint the page
        // while the masked frame is captured. Wait for native animation completion
        // and a stable pair of animation frames before masking; never force styles.
        let background;
        // Two native frames settle a same-tick repaint without polling every
        // running animation on the page: an infinite ambient animation would
        // otherwise burn the job's whole budget.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        try {
          await page.evaluate(maskTextPaint, state);
          // A CSS transition can leave the computed text-fill colour at its
          // previous value for the current task even with reduced motion. Do
          // not call the mask invalid until its actual paint has committed.
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const invalidMask = await page.evaluate(s => {
            const moved = s.currentBoxes.flatMap(box => {
              const current = s.records[box.id].range.getClientRects()[box.line];
              if (current && ["x", "y", "width", "height"].every(key => current[key] === box.rect[key])) return [];
              return [{ id: box.id, line: box.line, before: box.rect, after: current?.toJSON() ?? null }];
            });
            const unmasked = s.records.filter(record => s.visibleIds.has(record.id)).flatMap(record => {
              const style = getComputedStyle(record.element);
              const color = record.element.namespaceURI === "http://www.w3.org/2000/svg" ? style.fill : style.webkitTextFillColor || style.color;
              s.ctx.clearRect(0, 0, 1, 1); s.ctx.fillStyle = color; s.ctx.fillRect(0, 0, 1, 1);
              const alpha = s.ctx.getImageData(0, 0, 1, 1).data[3];
              return alpha ? [{ id: record.id, color, alpha }] : [];
            });
            return { moved, unmasked, scroll: scrollY };
          }, state);
          if (invalidMask.moved.length || invalidMask.unmasked.length) maskValidation.push({ tile, ...invalidMask });
          for (const box of snapshot.boxes) {
            if (invalidMask.moved.some(record => record.id === box.id && record.line === box.line)) box.issue = "Text geometry changed during masked capture";
            else if (invalidMask.unmasked.some(record => record.id === box.id)) box.issue = "Text mask did not remove foreground";
          }
          // Let the masked paint commit before capture: a promoted layer can keep
          // the previous frame for one tick.
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          background = await page.screenshot();
          // Prove the capture is a real background, not the glyphs. If a sampled
          // band is (almost) exactly the text colour, the compositor kept the text
          // paint; hide the paint owner instead (visibility keeps every box in
          // place) and capture again. Both facts are recorded, never papered over.
          const leaked = (image, boxes) => boxes.filter(box => !box.issue && !box.backgroundExplainable &&
            rectangleContrast(image, box.sample, box.foreground).minimum < 1.05).map(box => box.id);
          if (leaked(PNG.sync.read(background), snapshot.boxes).length) {
            await page.evaluate(hardMaskTextPaint, state);
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            background = await page.screenshot();
            let still = leaked(PNG.sync.read(background), snapshot.boxes);
            if (still.length) {
              // WebKit can serve a cached composite of a fixed layer. Nudging the
              // scroll by one pixel and restoring it forces a real recomposite
              // without touching the product's styles or layout.
              await page.evaluate(() => { const y = scrollY; scrollTo({ top: y + 1, behavior: "instant" });
                scrollTo({ top: y, behavior: "instant" }); });
              await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
              background = await page.screenshot();
              still = leaked(PNG.sync.read(background), snapshot.boxes);
            }
            const protectedIds = await page.evaluate(s => s.protectedMaskIds, state);
            maskEscalations.push({ tile, escalated: snapshot.boxes.map(box => box.id), protectedIds, unresolved: still });
            for (const box of snapshot.boxes) if (still.includes(box.id)) box.issue = "Text paint survived both masks";
          }
        } finally {
          await page.evaluate(restoreTextPaint, state);
        }
        const image = PNG.sync.read(background);
        if (image.width !== snapshot.width || image.height !== snapshot.height) throw new Error("Pixel/viewport scale mismatch; do not emulate DPR as contrast evidence");
        const name = `${id}-${tile}`;
        writeFileSync(`${directory}/${name}-original.png`, original);
        writeFileSync(`${directory}/${name}-background.png`, background);
        const hash = bytes => createHash("sha256").update(bytes).digest("hex");
        frames.push({ tile, scroll: snapshot.scroll, original: `${name}-original.png`, originalSha256: hash(original), background: `${name}-background.png`, backgroundSha256: hash(background) });
        // Bounds are computed before they are recorded so that every below-threshold
        // box can be verified against a capture with only its own glyph paint
        // removed. A real failure keeps failing there; a compositor leak does not.
        const bounds = new Map();
        for (const box of snapshot.boxes) {
          if (box.rect.x < 0 || box.rect.right > snapshot.width) { box.issue = "Text range extends outside horizontal viewport"; continue; }
          if (box.issue) continue;
          bounds.set(box, rectangleContrast(image, box.sample, box.foreground));
        }
        const suspects = snapshot.boxes.filter(box => bounds.get(box)?.minimum != null && bounds.get(box).minimum < box.threshold);
        if (suspects.length) {
          const ids = [...new Set(suspects.map(box => box.id))];
          const before = suspects.map(box => ({ id: box.id, line: box.line, minimum: bounds.get(box).minimum }));
          const captures = [];
          try {
            // Reuse the same conservative mask as the first capture. Hide only
            // owners proven not to paint their own background/pseudo-elements;
            // otherwise a better-looking verification could be fabricated by
            // erasing the surface we are trying to measure.
            await page.evaluate(({ s, ids }) => {
              s.beforeVerificationVisibleIds = s.visibleIds;
              s.visibleIds = new Set(ids);
            }, { s: state, ids });
            await page.evaluate(maskTextPaint, state);
            await page.evaluate(hardMaskTextPaint, state);
            for (const pass of [0, 1]) {
              // A promoted layer can keep the previous frame even after a transparent
              // fill. The second pass nudges the scroll by one pixel and restores it,
              // which forces a real recomposite without touching styles or layout.
              if (pass === 1) await page.evaluate(() => { const y = scrollY; scrollTo({ top: y + 1, behavior: "instant" });
                scrollTo({ top: y, behavior: "instant" }); });
              await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
              captures.push(await page.screenshot());
            }
          } finally {
            await page.evaluate(restoreTextPaint, state);
            await page.evaluate(s => {
              if (s.beforeVerificationVisibleIds) s.visibleIds = s.beforeVerificationVisibleIds;
              delete s.beforeVerificationVisibleIds;
            }, state);
          }
          const read = (bytes, name) => {
            const png = PNG.sync.read(bytes);
            if (png.width !== snapshot.width || png.height !== snapshot.height) throw new Error("Pixel/viewport scale mismatch in a verification capture");
            writeFileSync(`${directory}/${name}-verified.png`, bytes);
            return new Map(suspects.map(box => [box, rectangleContrast(png, box.sample, box.foreground)]));
          };
          const passes = captures.map((bytes, index) => read(bytes, `${name}-${index}`));
          // Keep the highest of the two: a capture that still contains the glyphs can
          // only measure lower than the same capture without them.
          const applied = [];
          for (const box of suspects) {
            const best = passes.map(pass => pass.get(box)).reduce((a, b) =>
              (b.minimum ?? 0) > (a.minimum ?? 0) ? b : a);
            // Below 1.02 the capture is the glyph paint itself, not a background.
            // Then the original bound stands: the failure is kept, never waived.
            if (best.minimum != null && best.minimum >= 1.02) { bounds.set(box, best); applied.push(box.id); }
          }
          verifications.push({ tile, ids, captures: captures.map((_, index) => `${name}-${index}-verified.png`), before, applied,
            after: suspects.map(box => ({ id: box.id, line: box.line, minimum: bounds.get(box).minimum })) });
        }
        for (const box of snapshot.boxes) {
          const key = `${box.id}:${box.version}:${box.line}`;
          const measurement = measurements.get(key) ?? { id: box.id, version: box.version, line: box.line, threshold: box.threshold, height: Math.ceil(box.rect.height), intervals: [], minimum: Infinity, issues: [] };
          measurement.threshold = Math.max(measurement.threshold, box.threshold);
          measurement.height = Math.max(measurement.height, Math.ceil(box.rect.height));
          measurement.intervals.push([Math.max(0, Math.floor(-box.sample.y)), Math.min(measurement.height, Math.ceil(snapshot.height - box.sample.y))]);
          if (box.issue) {
            if (!measurement.issues.includes(box.issue)) measurement.issues.push(box.issue);
          } else {
            const bound = bounds.get(box);
            if (bound && bound.minimum !== null && bound.minimum < measurement.minimum) {
              Object.assign(measurement, { minimum: bound.minimum, worstBackground: bound.worstBackground, foreground: box.foreground, color: box.color, tile });
            }
          }
          measurements.set(key, measurement);
        }
        revisiting ||= snapshot.end || Boolean(extent && snapshot.scroll + snapshot.height >= extent.bottom);
        if (revisiting) {
          // Revisit only missing coverage, never discard a low bound in favour of
          // a later, prettier frame. Ordinary centered scrolling lets late reveal
          // animations settle and moves missed text away from sticky overlays.
          await page.evaluate(refreshTextRanges, state);
          const candidate = await page.evaluate(({ s, measured, attempts, limit }) => {
            for (const record of s.records) {
              if ((attempts[record.id] ?? 0) >= limit || !record.element.isConnected) continue;
              const rects = [...record.range.getClientRects()];
              if (!rects.some((_, line) => !measured.includes(`${record.id}:${record.version ?? 0}:${line}`))) continue;
              const rect = record.range.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) return { id: record.id, top: scrollY + rect.top - Math.max(0, (innerHeight - rect.height) / 2) };
            }
            return null;
          }, { s: state, measured: [...measurements.keys()], attempts: Object.fromEntries(revisitAttempts), limit: 3 });
          if (!candidate) break;
          revisitAttempts.set(candidate.id, (revisitAttempts.get(candidate.id) ?? 0) + 1);
          top = Math.max(0, candidate.top);
        } else top = snapshot.scroll + Math.floor(snapshot.height * 0.75);
        if (tile === 249) tileLimit = true;
      }
      // Re-check the coverage the pass actually achieved, against the layout the
      // reader is looking at now. Resume only for a record with attempts left, and
      // only once the whole document has been traversed.
      await page.evaluate(refreshTextRanges, state);
      const expectedNow = await page.evaluate(s => s.records.map(record => {
        const rects = [...record.range.getClientRects()];
        return { id: record.id, version: record.version,
          connected: record.element.isConnected && record.range.startContainer.isConnected, lines: rects.length,
          emptyLines: rects.map((rect, line) => (rect.width > 0 && rect.height > 0 ? -1 : line)).filter(line => line >= 0) };
      }), state);
      const absentNow = [...missingRangeIds(expectedNow, measurements)];
      coverageRounds.push({ round, absent: absentNow.length });
      if (!absentNow.length || !revisiting || tile >= 250) break;
      // Aim at the line box that is actually unmeasured, not at the record's
      // bounding box: a line at the wrap boundary can sit outside the frame the
      // whole record would be centred in.
      const resume = await page.evaluate(({ s, absent, attempts, limit, measured }) => {
        for (const id of absent) {
          const record = s.records[id];
          if (!record || (attempts[id] ?? 0) >= limit || !record.element.isConnected) continue;
          const rects = [...record.range.getClientRects()];
          const line = rects.findIndex((rect, index) => rect.width > 0 && rect.height > 0 &&
            !measured.includes(`${record.id}:${record.version ?? 0}:${index}`));
          const rect = line >= 0 ? rects[line] : record.range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) return { id, line, top: scrollY + rect.top - Math.max(0, (innerHeight - rect.height) / 2) };
        }
        return null;
      }, { s: state, absent: absentNow, attempts: Object.fromEntries(revisitAttempts), limit: 3, measured: [...measurements.keys()] });
      if (!resume) break;
      revisitAttempts.set(resume.id, (revisitAttempts.get(resume.id) ?? 0) + 1);
      top = Math.max(0, resume.top);
    }
    const owners = await page.evaluate(s => s.owners, state);
    await page.evaluate(refreshTextRanges, state);
    const textChanges = await page.evaluate(s => s.textChanges, state);
    const expected = await page.evaluate(s => s.records.map(record => {
      const rects = [...record.range.getClientRects()];
      return { id: record.id, version: record.version, connected: record.element.isConnected && record.range.startContainer.isConnected,
        lines: rects.length, emptyLines: rects.map((rect, line) => (rect.width > 0 && rect.height > 0 ? -1 : line)).filter(line => line >= 0) };
    }), state);
    const ranges = [...measurements.values()].map(record => {
      let covered = 0;
      for (const [start, end] of record.intervals.toSorted((a, b) => a[0] - b[0])) {
        if (start > covered) break;
        covered = Math.max(covered, end);
      }
      const result = { ...record };
      delete result.intervals;
      return { ...result, minimum: Number.isFinite(record.minimum) ? record.minimum : null, covered: covered >= record.height,
        pass: !record.issues.length && covered >= record.height && record.minimum >= record.threshold && Number.isFinite(record.minimum) };
    });
    const absent = missingRangeIds(expected, measurements);
    const missing = owners.filter(owner => owner.error || owner.ids.some(id => absent.has(id)));
    // An owner that stays uncovered has to explain itself: the live line boxes,
    // where they sit, and what is on top of them. A failed gate should arrive
    // with the reason attached, not with a count.
    const uncovered = absent.size ? await page.evaluate(({ s, absent }) => absent.map(id => {
      const record = s.records[id];
      if (!record) return { id, error: "record absent" };
      const rects = [...record.range.getClientRects()];
      return { id, connected: record.element.isConnected, lines: rects.length, scrollY, innerWidth, innerHeight,
        rects: rects.slice(0, 6).map(rect => ({
          x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height),
          hit: (() => {
            const x = Math.min(innerWidth - 0.5, Math.max(0.5, rect.left + rect.width / 2));
            const y = Math.min(innerHeight - 0.5, Math.max(0.5, rect.top + rect.height / 2));
            const top = document.elementFromPoint(x, y);
            return top ? String(top.className || top.tagName).slice(0, 40) : null;
          })(),
        })) };
    }), { s: state, absent: [...absent] }) : [];
    const failed = ranges.filter(range => !range.pass);
    return { restrictedToTargetBounds: Boolean(extent), method: "finite conservative full text-rectangle background pixel bounds; original foreground; paired original/masked frames; below-threshold bounds re-measured with the measured glyphs hidden", maskEscalations, verifications, coverageRounds, revisits: [...revisitAttempts], uncovered, owners: owners.length, targets: owners, ranges, frames, deferred, textChanges,
      missing, tileLimit, maskValidation, geometryWaits, pass: !missing.length && !failed.length && !tileLimit && ranges.length > 0 };
  } finally {
    await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), previousScroll);
    await state.dispose();
  }
}
