import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { PNG } from "pngjs";

// Poll synchronous image state from Node. A page-side decode() promise has no
// harness-level timeout and may not settle when scripting is disabled.
export async function waitForImageResource(read, { timeout = 15000, now = Date.now, pause = () => delay(100) } = {}) {
  const deadline = now() + timeout;
  let state;
  do {
    state = await read();
    if (state.complete && state.width > 0 && state.height > 0) return state;
    await pause();
  } while (now() < deadline);
  assert.fail(`Image did not load with intrinsic dimensions: ${JSON.stringify(state)}`);
}

// A rendered screenshot must show more than a uniform placeholder. This is not
// a perceptual or rights check; intrinsic dimensions and sources are checked too.
export function hasVariedImagePixels(bytes) {
  const image = PNG.sync.read(bytes);
  const colors = new Set();
  const stride = Math.max(1, Math.floor((image.width * image.height) / 4000)) * 4;
  for (let index = 0; index < image.data.length; index += stride) {
    if (image.data[index + 3] === 0) continue;
    colors.add(`${image.data[index] >> 4}:${image.data[index + 1] >> 4}:${image.data[index + 2] >> 4}`);
    if (colors.size >= 4) return true;
  }
  return false;
}
