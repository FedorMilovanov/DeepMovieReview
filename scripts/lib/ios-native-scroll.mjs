import assert from "node:assert/strict";
import { waitForNativeValue } from "./native-safari.mjs";

// Each native W3C drag must deliver a touchstart and actually move the viewport.
// The retained attempt remains diagnostic even if the driver times out.
export async function nativeSwipeAndObserve({ readTarget, readEvents, swipe, attempts = [], wait = waitForNativeValue }, { before, down = true } = {}) {
  before ??= await readTarget();
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
  return entry;
}

// Reach a target using the recorded W3C drags, not programmatic DOM scrolling.
// Stop before touching the target unless it is visible and hit-contained.
export async function scrollToNativeTarget(options) {
  const { readTarget } = options;
  const ready = target => target.rect.top >= 70 && target.rect.bottom <= target.innerHeight - 50 && target.hitContained;
  for (let attempt = 0; attempt < 3; attempt++) {
    const before = await readTarget();
    if (ready(before)) return before;
    const down = before.rect.bottom > before.innerHeight - 50;
    assert.ok(down || before.rect.top < 70, "Visible spoiler control is occluded; do not tap blindly");
    await nativeSwipeAndObserve(options, { before, down });
  }
  const target = await readTarget();
  assert.ok(ready(target), "Native scrolling must leave the spoiler control visible and hit-contained");
  return target;
}
