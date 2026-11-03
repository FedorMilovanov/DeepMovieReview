import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ESLint, Linter } from "eslint";
import next from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y-x";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const oxConfig = JSON.parse(readFileSync(join(root, ".oxlintrc.json"), "utf8"));
const oxlint = join(root, "node_modules/oxlint/bin/oxlint");
const runOxlint = args => spawnSync(process.execPath, [oxlint, "--config", join(root, ".oxlintrc.json"), ...args],
  { cwd: root, encoding: "utf8", timeout: 30000, maxBuffer: 10 * 1024 * 1024 });

// The v11 override is deliberately narrow in its consumers, not a general
// promise that old minimatch APIs or every glob behave identically.
test("reviewed lint consumers resolve the patched minimatch and no local adapter", () => {
  const reviewed = {
    "node_modules/@eslint/config-array": "0.23.5",
    "node_modules/@typescript-eslint/typescript-estree": "8.72.1",
    "node_modules/eslint": "10.14.0",
    "node_modules/eslint-plugin-jsx-a11y-x": "0.2.0",
  };
  const consumers = Object.fromEntries(Object.entries(lock.packages)
    .filter(([, entry]) => entry.dependencies?.minimatch)
    .map(([path, entry]) => [path, entry.version]));
  assert.deepEqual(consumers, reviewed);
  assert.deepEqual(manifest.overrides, { minimatch: "11.0.3" });
  assert.equal(manifest.devDependencies.eslint, "10.14.0");
  assert.equal(manifest.devDependencies.oxlint, "1.90.0");
  assert.equal(manifest.devDependencies["eslint-config-next"], undefined);
  assert.equal(manifest.devDependencies["@deepmoviereview/minimatch-compat"], undefined);
  assert.equal(lock.packages["scripts/minimatch-compat"], undefined);
  assert.equal(lock.packages["node_modules/minimatch"].version, "11.0.3");
  assert.match(lock.packages["node_modules/minimatch"].resolved, /minimatch-11\.0\.3\.tgz$/);
  assert.match(lock.packages["node_modules/minimatch"].integrity, /^sha512-/);
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (path.endsWith("/minimatch") || entry.name === "minimatch") {
      assert.equal(entry.version, "11.0.3", path);
      assert.notEqual(entry.link, true, path);
    }
  }
  const engine = require("minimatch");
  for (const parent of Object.keys(reviewed)) {
    const parentRequire = createRequire(join(root, parent, "package.json"));
    assert.equal(parentRequire("minimatch").Minimatch, engine.Minimatch, parent);
  }
  const matcher = new engine.Minimatch("src/**/*.tsx", { dot: true });
  assert.equal(matcher.match("src/app", true), true);
  assert.equal(matcher.match("other", true), false);
  assert.equal(engine.minimatch("src/.hidden/a.ts", "**/*.ts", { dot: true }), true);
  assert.equal(engine.minimatch("src/.hidden/a.ts", "**/*.ts"), false);
});

test("reviewed TypeScript project-service glob uses the patched matcher", async () => {
  const { clearCaches, parseAndGenerateServices } = await import("@typescript-eslint/typescript-estree");
  const dir = mkdtempSync(join(tmpdir(), "dmr-project-service-"));
  const source = "export const value: number = 1;";
  try {
    // Neither file is included in the configured project. The hidden fixture
    // succeeds only through allowDefaultProject's dot-enabled minimatch call.
    writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ include: ["src/**/*.ts"] }));
    writeFileSync(join(dir, ".fixture.ts"), source);
    writeFileSync(join(dir, "excluded.ts"), source);
    const options = (file, glob) => ({ filePath: join(dir, file), tsconfigRootDir: dir,
      projectService: { allowDefaultProject: [glob] } });
    clearCaches();
    const parsed = parseAndGenerateServices(source, options(".fixture.ts", "*.ts"));
    assert.ok(parsed.services.program, "the matching hidden file must get type information");
    assert.equal(parsed.ast.body[0].type, "ExportNamedDeclaration");
    // Project service options are cached globally, so isolate the negative case.
    clearCaches();
    assert.throws(() => parseAndGenerateServices(source, options("excluded.ts", "allowed*.ts")),
      /does not match 'excluded\.ts'/);
  } finally {
    clearCaches();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("current browser, Node and ECMAScript globals remain usable", async () => {
  const eslint = new ESLint({ cwd: root, overrideConfig: { rules: { "no-undef": "error" } } });
  const [result] = await eslint.lintText(
    "Intl.DateTimeFormat(); console.log(window.location, process.env.NODE_ENV); MissingProjectGlobal();",
    { filePath: join(root, "src/__lint_globals__.js") },
  );
  const undefinedNames = result.messages.filter(message => message.ruleId === "no-undef").map(message => message.message);
  assert.deepEqual(undefinedNames, ["'MissingProjectGlobal' is not defined."]);
});

test("patched minimatch bounds optimization-level-two expansion", () => {
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

test("Next, Hooks, TypeScript and accessibility rules remain enabled", async () => {
  const eslint = new ESLint({ cwd: root });
  const config = await eslint.calculateConfigForFile(join(root, "src/__lint_probe__.tsx"));
  const expected = {
    ...reactHooks.configs.recommended.rules,
    ...next.configs.recommended.rules,
    ...next.configs["core-web-vitals"].rules,
  };
  const severity = value => {
    const raw = Array.isArray(value) ? value[0] : value;
    return typeof raw === "number" ? raw : { off: 0, warn: 1, error: 2 }[raw];
  };
  for (const [name, value] of Object.entries(expected)) {
    assert.equal(config.rules[name]?.[0], severity(value), name);
  }
  for (const name of ["alt-text", "aria-props", "aria-proptypes", "aria-unsupported-elements", "role-has-required-aria-props", "role-supports-aria-props"]) {
    assert.equal(config.rules[`jsx-a11y/${name}`]?.[0], 1, name);
  }
  assert.deepEqual(config.rules["jsx-a11y/alt-text"][1], { elements: ["img"], img: ["Image"] });
  assert.equal(config.rules["@typescript-eslint/no-unused-vars"]?.[0], 1);
  assert.equal(config.rules["project/no-deprecated-react-api"]?.[0], 2);
  assert.equal(config.rules["project/no-anonymous-default-memo"]?.[0], 2);
  for (const path of [".next/fake.js", ".test-build/fake.js", ".audit-build/fake.js", "next-env.d.ts"]) {
    assert.equal(await eslint.isPathIgnored(join(root, path)), true, path);
  }
  assert.equal(await eslint.isPathIgnored(join(root, "src/example.tsx")), false);

  const cases = [
    ["jsx-a11y/alt-text", 'const A = () => <img alt={false || false} />;'],
    ["jsx-a11y/aria-props", 'const A = () => <div aria-whoops="x" />;'],
    ["jsx-a11y/aria-proptypes", "const A = () => <div aria-label />;"],
    ["jsx-a11y/aria-unsupported-elements", 'const A = () => <meta aria-label="x" />;'],
    ["jsx-a11y/role-has-required-aria-props", 'const A = () => <div role="checkbox" />;'],
    ["jsx-a11y/role-supports-aria-props", 'const A = () => <div role="doc-pagefooter" aria-checked />;'],
    ["@next/next/no-img-element", 'const A = () => <img alt="" src="x" />;'],
    ["@typescript-eslint/no-unused-vars", "const unused = 1;"],
    ["react-hooks/rules-of-hooks", 'import { useState } from "react"; function A({ready}) { if (ready) useState(0); return null; }'],
  ];
  for (const [rule, source] of cases) {
    const [result] = await eslint.lintText(source, { filePath: join(root, "src/__lint_probe__.tsx") });
    assert.ok(result.messages.some(message => message.ruleId === rule), `${rule}: ${JSON.stringify(result.messages)}`);
  }
  for (const extension of ["jsx", "tsx"]) {
    const [result] = await eslint.lintText('import React from "react"; const Header = () => <div/>; export default () => <Header/>;',
      { filePath: join(root, `src/__lint_used__.${extension}`) });
    assert.ok(!result.messages.some(message => message.ruleId === "@typescript-eslint/no-unused-vars"), JSON.stringify(result.messages));
  }
});

test("JSX accessibility component glob matching uses the real v11 API", () => {
  const linter = new Linter();
  const config = {
    files: ["**/*.jsx"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "jsx-a11y": jsxA11y },
    rules: { "jsx-a11y/label-has-associated-control": ["error", { controlComponents: ["Custom*"], assert: "nesting" }] },
  };
  const lint = source => linter.verify(source, config, { filename: "fixture.jsx" }).map(message => message.ruleId);
  assert.deepEqual(lint("const A = () => <label>Name<CustomInput /></label>;"), []);
  assert.deepEqual(lint("const A = () => <label>Name<OtherInput /></label>;"), ["jsx-a11y/label-has-associated-control"]);
});

test("local React policy retains deprecated API and direct anonymous wrapper checks", async () => {
  assert.match(manifest.dependencies.react, /^19\./, "review the legacy API policy if React is downgraded");
  const eslint = new ESLint({ cwd: root });
  const lint = async source => (await eslint.lintText(source, { filePath: join(root, "src/__react_policy__.jsx") }))[0].messages;
  const deprecated = [
    "React.renderComponent()", "React.renderComponentToString()", "React.isValidComponent()", "React.isValidClass()",
    "React.createClass({})", "React.PropTypes.string", "React.PropTypes.renderable", "React.DOM.div",
    "React.addons.classSet({})", "React.addons.cloneWithProps()", "React.addons.TestUtils", "this.transferPropsTo()",
    "React.render()", "ReactDOM.render()", "ReactDOM.hydrate()", "ReactDOM.unmountComponentAtNode()",
    "ReactDOMServer.renderToNodeStream()", "ReactPerf.printDOM()", "Perf.getMeasurementsSummaryMap()",
    'import { createClass, PropTypes } from "react";', 'const { createClass } = require("react");',
    'import { render } from "react-dom";', 'const { renderToNodeStream } = require("react-dom/server");',
    "/** @jsx Foo.createElement */ Foo.createClass({});",
  ];
  for (const source of deprecated) {
    const messages = await lint(source);
    assert.ok(messages.some(message => message.ruleId === "project/no-deprecated-react-api"), `${source}: ${JSON.stringify(messages)}`);
  }
  for (const source of ["React.createElement('div');", "other.createClass();", "ReactDOMServer.renderToString(x);"]) {
    assert.ok(!(await lint(source)).some(message => message.ruleId === "project/no-deprecated-react-api"), source);
  }
  for (const source of [
    "export default React.memo(() => <div/>);",
    "export default React.forwardRef((props, ref) => <div ref={ref}/>);",
    'import { memo as m } from "react"; export default m(() => <div/>);',
    "/** @jsx Foo.createElement */ export default Foo.memo(() => <div/>);",
  ]) assert.ok((await lint(source)).some(message => message.ruleId === "project/no-anonymous-default-memo"), source);
  for (const source of [
    "export default React.memo(function Named() { return <div/>; });",
    "const Component = () => <div/>; export default React.memo(Component);",
    "const Other = { memo: x => x }; export default Other.memo(() => <div/>);",
  ]) assert.ok(!(await lint(source)).some(message => message.ruleId === "project/no-anonymous-default-memo"), source);
});

test("native React and import rules reject representative legacy regressions", () => {
  const fixtures = {
    "react/display-name": "export default () => <div/>;",
    "react/jsx-key": "const items = [<div/>, <span/>];",
    "react/jsx-no-comment-textnodes": "const A = () => <div>// comment</div>;",
    "react/jsx-no-duplicate-props": 'const A = () => <div id="a" id="b"/>;',
    "react/jsx-no-undef": "const A = () => <Missing />;",
    "react/no-children-prop": 'const A = () => <div children="x"/>;',
    "react/no-danger-with-children": 'const A = () => <div dangerouslySetInnerHTML={{__html:"x"}}>child</div>;',
    "react/no-direct-mutation-state": 'import React from "react"; class A extends React.Component { componentDidMount() { this.state.x = 1; } render() { return <div/>; } }',
    "react/no-find-dom-node": 'import ReactDOM from "react-dom"; ReactDOM.findDOMNode(null);',
    "react/no-is-mounted": 'import React from "react"; class A extends React.Component { componentDidMount() { this.isMounted(); } render() { return <div/>; } }',
    "react/no-render-return-value": 'import ReactDOM from "react-dom"; const x = ReactDOM.render(<div/>, document.body);',
    "react/no-string-refs": 'const A = () => <div ref="x"/>;',
    "react/no-unescaped-entities": "const A = () => <div>It's bad</div>;",
    "react/require-render-return": 'import React from "react"; class A extends React.Component { render() { console.log("x"); } }',
    "react/no-unsafe": 'import React from "react"; class A extends React.Component { componentWillMount() {} render() { return null; } }',
    "import/no-anonymous-default-export": "export default {};",
  };
  const dir = mkdtempSync(join(tmpdir(), "dmr-lint-fixtures-"));
  try {
    const paths = Object.entries(fixtures).map(([rule, code], i) => {
      assert.ok(oxConfig.rules[rule], `${rule} must be configured`);
      const path = join(dir, `fixture-${i}.tsx`);
      writeFileSync(path, code);
      return path;
    });
    const result = runOxlint(["--format=json", ...paths]);
    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.status, 1, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.number_of_files, paths.length);
    for (const [i, rule] of Object.keys(fixtures).entries()) {
      const [plugin, name] = rule.split("/");
      assert.ok(output.diagnostics.some(diagnostic => basename(diagnostic.filename) === `fixture-${i}.tsx` && diagnostic.code === `${plugin}(${name})`), rule);
    }
    assert.ok(output.diagnostics.every(diagnostic => diagnostic.code), "parser failures must not stand in for lint findings");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("both lint engines visit the same project files", async () => {
  const eslint = new ESLint({ cwd: root });
  const fromEslint = (await eslint.lintFiles(".")).map(result => relative(root, result.filePath).replaceAll("\\", "/")).sort();
  const result = runOxlint(["--debug=files", "."]);
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
  const fromOxlint = result.stdout.split(/\r?\n/).filter(Boolean).map(path => path.replaceAll("\\", "/")).sort();
  assert.ok(fromEslint.length > 0);
  assert.deepEqual(fromOxlint, fromEslint);
});
