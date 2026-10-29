/** Shared article styles are infrastructure, never a per-film content payload. */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { listStyles, readStylesheet } from "./lib/style-sources.mjs";

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
const cssFiles = listStyles();
for (const entry of ["film-article", "homepage"]) {
  const path = `src/styles/${entry}.css`;
  const source = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(source, /@import/, `${path}: composition entry must import its owners`);
  assert.equal(source.replace(/@import\s+["'][^"']+["']\s*;/g, "").trim(), "", `${path}: put rules in the responsible file, not the entry`);
  readStylesheet(path); // Broken imports and cycles fail closed.
}
for (const path of cssFiles.filter((path) => /\/(article|home)\//.test(path))) {
  const source = readFileSync(path, "utf8");
  assert.ok(source.split("\n").length <= 450, `${path}: split by responsibility before growing beyond 450 lines`);
  assert.doesNotMatch(source, /!important\b/, `${path}: do not resolve cascade conflicts by force`);
  assert.doesNotMatch(source, /the-truman-show|the-fast-and-the-furious|film[-_]?001/i, `${path}: shared CSS cannot know film identity`);
}
for (const path of files("src/data/films")) {
  assert.ok(!/\.css$/.test(path), `${path}: article data cannot own styles`);
  if (/\.tsx?$/.test(path)) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /import\s+["'][^"']+\.css["']/, `${path}: use shared renderers, not per-film styles`);
    assert.doesNotMatch(source, /\b(?:className|cssText)\s*:/, `${path}: content cannot select presentation classes`);
  }
}
console.log(`Style contract passed: ${cssFiles.length} CSS files; composition, size, identity, data boundary and imports checked.`);
