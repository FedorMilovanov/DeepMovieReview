import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const compat = require("minimatch");
const engine = require("minimatch-secure");
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const adapterPath = realpathSync(join(root, "scripts/minimatch-compat/index.cjs"));

// These are the exact consumers whose usage of the adapter was reviewed. A new
// consumer or version needs review; the adapter is not a general v3 polyfill.
const reviewedConsumers = {
  "node_modules/@eslint/config-array": "0.21.2",
  "node_modules/@eslint/eslintrc": "3.3.7",
  "node_modules/@typescript-eslint/typescript-estree": "8.70.0",
  "node_modules/eslint": "9.39.5",
  "node_modules/eslint-plugin-import": "2.32.0",
  "node_modules/eslint-plugin-jsx-a11y": "6.10.2",
  "node_modules/eslint-plugin-react": "7.37.5",
};

test("all reviewed minimatch consumers resolve the adapter and the fixed upstream engine", () => {
  const consumers = Object.fromEntries(
    Object.entries(lock.packages)
      .filter(([, entry]) => entry.dependencies?.minimatch)
      .map(([path, entry]) => [path, entry.version]),
  );
  assert.deepEqual(consumers, reviewedConsumers);

  for (const parent of Object.keys(reviewedConsumers)) {
    const parentRequire = createRequire(join(root, parent, "package.json"));
    assert.equal(realpathSync(parentRequire.resolve("minimatch")), adapterPath, parent);
    assert.equal(parentRequire("minimatch"), compat, parent);
  }

  const installed = require("minimatch-secure/package.json");
  const locked = lock.packages["node_modules/minimatch-secure"];
  assert.equal(installed.name, "minimatch");
  assert.equal(installed.version, "11.0.3");
  assert.equal(locked.name, installed.name);
  assert.equal(locked.version, installed.version);
  assert.match(locked.resolved, /minimatch-11\.0\.3\.tgz$/);
  assert.ok(locked.integrity?.startsWith("sha512-"));
  assert.equal(compat.minimatch, engine.minimatch);
  assert.equal(compat.Minimatch, engine.Minimatch);

  // An audit result alone would not reveal an incorrectly linked local shim.
  // Every lock entry named minimatch must be either our reviewed link or the
  // explicitly pinned upstream engine above, never a v3/v10 package.
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (path.endsWith("/minimatch") || entry.name === "minimatch") {
      if (entry.link) assert.equal(entry.resolved, "scripts/minimatch-compat", path);
      else assert.equal(entry.version, "11.0.3", path);
    }
  }
});

test("CommonJS and ESM APIs delegate matching to minimatch 11", async () => {
  const esm = await import("minimatch");
  assert.equal(esm.default, compat);
  assert.equal(esm.minimatch, engine.minimatch);
  assert.equal(esm.Minimatch, engine.Minimatch);
  assert.equal(esm.makeRe, compat.makeRe);

  const cases = [
    ["src/app/page.tsx", "**/*.{js,jsx,mjs,ts,tsx,mts,cts}", { dot: true }, true],
    ["docs/readme.md", "**/*.{js,jsx,mjs,ts,tsx,mts,cts}", { dot: true }, false],
    [".next/server.js", ".next/**", { dot: true }, true],
    ["src/.hidden/a.ts", "**/*.ts", { dot: true }, true],
    ["src/.hidden/a.ts", "**/*.ts", {}, false],
    ["lib/internal/file.js", "lib/internal/**", {}, true],
    ["lib/public/file.js", "lib/internal/**", {}, false],
    ["WidgetDanger", "Widget*", { noglobstar: true }, true],
  ];
  for (const [path, pattern, options, expected] of cases) {
    assert.equal(compat(path, pattern, options), expected, `${path} vs ${pattern}`);
    assert.equal(compat.minimatch(path, pattern, options), expected);
  }
  const traversal = new compat.Minimatch("src/**/*.tsx", { dot: true });
  assert.equal(traversal.match("src/app", true), true);
  assert.equal(traversal.match("other", true), false);
  assert.equal(compat.makeRe("lib/internal/**").test("lib/internal/x"), true);
  assert.equal(compat.makeRe("lib/internal/**").test("lib/public/x"), false);
  assert.equal(compat.makeRe(""), false);
  assert.equal(compat.makeRe("#comment"), false);
  assert.equal(compat.defaults({ dot: true }).makeRe("**/*.ts").test(".hidden/a.ts"), true);
  assert.equal(compat.defaults({ dot: true }).defaults({ nocase: true })(".HIDDEN/A.TS", "**/*.ts"), true);

  // Older ESM consumers import a default callable rather than the v11 named API.
  const configArray = await import("@eslint/config-array");
  assert.equal(typeof configArray.ConfigArray, "function");
});

test("legacy React, JSX accessibility and import glob rules still reject the right input", () => {
  const { Linter } = require("eslint");
  const react = require("eslint-plugin-react");
  const importPlugin = require("eslint-plugin-import");
  const a11y = require("eslint-plugin-jsx-a11y");
  const linter = new Linter();
  const config = {
    files: ["**/*.jsx"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react, import: importPlugin, "jsx-a11y": a11y },
    rules: {
      "react/no-danger": ["error", { customComponentNames: ["Danger*"] }],
      "import/no-internal-modules": ["error", { forbid: ["restricted/**"] }],
      "jsx-a11y/label-has-associated-control": ["error", { controlComponents: ["Custom*"], assert: "nesting" }],
    },
  };
  const lint = (source) => linter.verify(source, config, { filename: "fixture.jsx" }).map((message) => message.ruleId);
  assert.deepEqual(
    lint('import x from "restricted/private"; const A = () => <><DangerWidget dangerouslySetInnerHTML={{__html:"x"}} /><label>Name<CustomInput /></label></>;'),
    ["import/no-internal-modules", "react/no-danger"],
  );
  assert.deepEqual(
    lint('import x from "safe/pkg"; const A = () => <><SafeWidget dangerouslySetInnerHTML={{__html:"x"}} /><label>Name<OtherInput /></label></>;'),
    ["jsx-a11y/label-has-associated-control"],
  );
});

test("the real Next.js lint configuration still applies and ignores generated files", async () => {
  const { ESLint } = require("eslint");
  const eslint = new ESLint({ cwd: root });
  assert.equal(await eslint.isPathIgnored(join(root, ".next/fake.js")), true);
  assert.equal(await eslint.isPathIgnored(join(root, "src/example.ts")), false);
  const [typescript] = await eslint.lintText("const unused = 1;", { filePath: "src/__glob_compat_probe__.ts" });
  assert.ok(typescript.messages.some((message) => message.ruleId === "@typescript-eslint/no-unused-vars"));
  const [jsx] = await eslint.lintText('const image = <img src="x" />;', { filePath: "src/__glob_compat_probe__.jsx" });
  assert.ok(jsx.messages.some((message) => message.ruleId === "jsx-a11y/alt-text"));
  assert.ok(jsx.messages.some((message) => message.ruleId === "@next/next/no-img-element"));
});

test("optimization-level-two expansion obeys the upstream security limit", () => {
  // A subprocess deadline also makes a future regression fail rather than hang CI.
  const program = `
    const { Minimatch } = require('minimatch');
    const pattern = Array(30).fill('**/../a/b').join('/');
    const matcher = new Minimatch(pattern, { optimizationLevel: 2, braceExpandMax: 64 });
    if (matcher.set.length !== 64) process.exit(1);
  `;
  const result = spawnSync(process.execPath, ["-e", program], { cwd: root, encoding: "utf8", timeout: 8000 });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
