import assert from "node:assert/strict";

const linear = value => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};
const table = Array.from({ length: 256 }, (_, value) => linear(value));
const channel = value => Number.isInteger(value) ? table[value] : linear(value);
export const luminance = rgb => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
export function contrast(foreground, background) {
  const alpha = foreground[3] ?? 1;
  const composite = foreground.slice(0, 3).map((value, index) => value * alpha + background[index] * (1 - alpha));
  const a = luminance(composite), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Every background pixel in the text advance rectangle is considered, not just
// an average or a cherry-picked point. This is a conservative contrast bound;
// it does not certify occlusion, readability, or antialiased glyph fringes.
export function rectangleContrast(image, rectangle, foreground) {
  assert.ok(image.width > 0 && image.height > 0 && image.data.length === image.width * image.height * 4);
  assert.ok(foreground.length === 4 && foreground.every(Number.isFinite));
  assert.ok(foreground.slice(0, 3).every(value => value >= 0 && value <= 255));
  assert.ok(foreground[3] > 0 && foreground[3] <= 1);
  assert.ok([rectangle.x, rectangle.y, rectangle.width, rectangle.height].every(Number.isFinite));
  const left = Math.max(0, Math.floor(rectangle.x)), top = Math.max(0, Math.floor(rectangle.y));
  const right = Math.min(image.width, Math.ceil(rectangle.x + rectangle.width));
  const bottom = Math.min(image.height, Math.ceil(rectangle.y + rectangle.height));
  let minimum = Infinity, worstBackground, pixels = 0;
  const colors = new Map();
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
    const offset = (y * image.width + x) * 4;
    assert.equal(image.data[offset + 3], 255, "Background PNG must be opaque");
    const rgb = [...image.data.subarray(offset, offset + 3)];
    const key = rgb[0] * 65536 + rgb[1] * 256 + rgb[2];
    let ratio = colors.get(key);
    if (ratio === undefined) { ratio = contrast(foreground, rgb); colors.set(key, ratio); }
    if (ratio < minimum) { minimum = ratio; worstBackground = { rgb, x, y }; }
    pixels++;
  }
  return { minimum: pixels ? minimum : null, worstBackground, pixels };
}
