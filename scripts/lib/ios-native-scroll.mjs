import assert from "node:assert/strict";
import { waitForNativeValue } from "./native-safari.mjs";

// Reach a target using recorded W3C touch drags, not programmatic DOM scrolling.
// Each drag must deliver a touchstart and actually move the viewport. Stop before
// touching the target unless it is both in the safe viewport and hit-contained.
export async function scrollToNativeTarget({ readTarget, readEvents, swipe, attempts = [], wait = waitForNativeValue }) {
  const ready = target => target.rect.top >= 70 && target.rect.bottom <= target.innerHeight - 50 && target.hitContained;
  for (let attempt = 0; attempt < 3; attempt++) {
    const before = await readTarget();
    if (ready(before)) return before;
    const down = before.rect.bottom > before.innerHeight - 50;
    assert.ok(down || before.rect.top < 70, "Visible spoiler control is occluded; do not tap blindly");
    const probeBefore = (await readEvents()).length;
    const points = { x: Math.round(before.innerWidth / 2),
      fromY: Math.round(before.innerHeight * (down ? 0.75 : 0.3)),
      toY: Math.round(before.innerHeight * (down ? 0.35 : 0.7)) };
    const entry = { before, points }; attempts.push(entry);
    try {
      await swipe(points);
      await wait(async () => Math.abs((await readTarget()).scrollY - before.scrollY) >= 30 ? "moved" : "same", "moved", { timeout: 10000 });
    } finally {
      try { entry.after = await readTarget(); entry.events = (await readEvents()).slice(probeBefore); }
      catch (diagnosticError) { entry.diagnosticError = diagnosticError.message; }
    }
    assert.ok(entry.events?.some(event => event.type === "touchstart"), "A native swipe must deliver a touch event, not merely change scrollY");
  }
  const target = await readTarget();
  assert.ok(ready(target), "Native scrolling must leave the spoiler control visible and hit-contained");
  return target;
}
