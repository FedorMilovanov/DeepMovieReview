/** Read local CSS imports in cascade order; audits follow surfaces, not file size. */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, relative, join } from "node:path";

export function readStylesheet(path, ancestors = []) {
  const absolute = resolve(path);
  if (ancestors.includes(absolute)) throw new Error(`CSS import cycle: ${path}`);
  return readFileSync(absolute, "utf8").replace(
    /@import\s+["'](\.[^"']+)["']\s*;/g,
    (_, target) => readStylesheet(resolve(dirname(absolute), target), [...ancestors, absolute]),
  );
}

export function listStyles(dir = "src/styles") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listStyles(path) : entry.name.endsWith(".css") ? [relative(process.cwd(), resolve(path))] : [];
  }).sort();
}
