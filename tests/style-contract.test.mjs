import { hasUnprefixedDeclaration } from "../scripts/lib/style-compat.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { readStylesheet } from "../scripts/lib/style-sources.mjs";

const script = resolve("scripts/style-contract.mjs");

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "dmr-style-contract-"));
  try {
    cpSync("src/styles", join(root, "src/styles"), { recursive: true });
    mkdirSync(join(root, "src/data/films"), { recursive: true });
    mkdirSync(join(root, "src/app"), { recursive: true });
    cpSync("src/app/globals.css", join(root, "src/app/globals.css"));
    const write = (path, text) => writeFileSync(join(root, path), text);
    const check = () => spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
    run({ root, write, check });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function rejects(name, mutate, message) {
  test(name, () => fixture((context) => {
    mutate(context);
    const result = context.check();
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, message);
  }));
}

test("shared style contract accepts another data-only article", () => fixture(({ write, check }) => {
  write("src/data/films/another-film.ts", 'export const article = { title: "Another film", blocks: [{ kind: "paragraph", text: "Text" }] };');
  const result = check();
  assert.equal(result.status, 0, result.stderr);
}));

rejects("composition entries reject appended rules", ({ write }) => {
  write("src/styles/homepage.css", '@import "./home/hero.css";\n.newArticle { color: red; }');
}, /put rules in the responsible file/);

rejects("style imports reject cycles", ({ write }) => {
  write("src/styles/article/body.css", '@import "../film-article.css";');
}, /CSS import cycle/);

rejects("style imports reject missing owners", ({ write }) => {
  write("src/styles/article/body.css", '@import "./missing.css";');
}, /ENOENT/);

rejects("shared owners cannot grow beyond the line budget", ({ write }) => {
  write("src/styles/article/body.css", "\n".repeat(451));
}, /450 lines/);

rejects("new priority overrides fail closed", ({ write }) => {
  write("src/styles/modules/analysis.css", ".shared { color: red !important; }");
}, /do not resolve cascade conflicts by force/);

rejects("film-specific shared styles fail closed", ({ write }) => {
  write("src/styles/article/body.css", '.the-truman-show { color: red; }');
}, /cannot know film identity/);

rejects("film data cannot ship its own stylesheet", ({ write }) => {
  write("src/data/films/another-film.css", ".newArticle { color: red; }");
}, /article data cannot own styles/);

rejects("film data cannot import styles", ({ write }) => {
  write("src/data/films/another-film.ts", 'import "./article.css";');
}, /use shared renderers/);

rejects("film data cannot choose presentation classes", ({ write }) => {
  write("src/data/films/another-film.ts", 'export const block = { className: "bespokeArticle" };');
}, /content cannot select presentation/);

rejects("film data cannot bypass styles with inline declarations", ({ write }) => {
  write("src/data/films/another-film.ts", 'export const block = { style: { color: "red" } };');
}, /content cannot select presentation/);

test("import reader preserves declarations in cascade order", () => fixture(({ root }) => {
  const surface = readStylesheet(join(root, "src/styles/film-article.css"));
  const expected = ["body", "entry", "production", "reading"]
    .map((name) => readFileSync(join(root, `src/styles/article/${name}.css`), "utf8")).join("");
  const rules = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s/g, "");
  assert.equal(rules(surface), rules(expected));
}));

rejects("shell entry cannot become a new catch-all stylesheet", ({ write }) => {
  write("src/app/globals.css", '@import "../styles/shell/base.css";\n.customArticle { color: red; }');
}, /put rules in the responsible file/);

test("vendor twins are accepted before or after the standard declaration", () => {
  for (const declarations of [
    "-webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);",
    "backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);",
  ]) assert.equal(hasUnprefixedDeclaration(`.header { ${declarations} }`, "backdrop-filter"), false);
});

test("vendor twins cannot come from a neighbouring selector or a comment", () => {
  for (const css of [
    ".other {-webkit-backdrop-filter: blur(10px)} .header {backdrop-filter: blur(10px)}",
    ".header {/* -webkit-backdrop-filter: blur(10px); */ backdrop-filter: blur(10px)}",
    ".header {-webkit-backdrop-filter: blur(5px); backdrop-filter: blur(10px)}",
  ]) assert.equal(hasUnprefixedDeclaration(css, "backdrop-filter"), true);
});
