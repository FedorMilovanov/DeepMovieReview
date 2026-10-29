import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
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
    mkdirSync(join(root, "src/components/experience"), { recursive: true });
    cpSync("src/components/experience/verdict-core.module.css", join(root, "src/components/experience/verdict-core.module.css"));
    cpSync("src/components/labs", join(root, "src/components/labs"), { recursive: true });
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
  const expected = ["body", "tables", "entry", "production", "reading"]
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

rejects("migrated components cannot return to legacy tokens", ({ write }) => {
  write("src/styles/modules/analysis.css", ".shared { color: var(--text); }");
}, /use --ink-1 instead of --text/);

rejects("compatibility aliases cannot silently change meaning", ({ root, write }) => {
  const tokens = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
  write("src/styles/tokens.css", tokens.replace("--text: var(--ink-1)", "--text: var(--ink-4)"));
}, /--text: must map to --ink-1/);

rejects("compatibility aliases cannot reference missing canonical tokens", ({ root, write }) => {
  const tokens = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
  write("src/styles/tokens.css", tokens.replace(/--ink-1:[^;]+;/, ""));
}, /missing canonical token --ink-1/);

rejects("compatibility aliases cannot acquire per-component overrides", ({ root, write }) => {
  const tokens = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
  write("src/styles/tokens.css", tokens + "\n.article { --text: red; }");
}, /keep one compatibility definition/);

for (const path of [
  "src/styles/methodology.css",
  "src/components/experience/verdict-core.module.css",
  "src/styles/home/hero.css",
]) {
  rejects(`${path}: migrated styles reject legacy tokens`, ({ write }) => {
    write(path, ".shared { color: var(--text); }");
  }, /use --ink-1 instead of --text/);
}

rejects("new CSS Modules cannot escape canonical token governance", ({ write }) => {
  write("src/components/experience/new-component.module.css", ".copy { color: var(--text); }");
}, /use --ink-1 instead of --text/);

rejects("components cannot redefine the legacy compatibility bridge", ({ write }) => {
  write("src/components/labs/six-lenses-lab.module.css", ".copy { --text: red; }");
}, /do not redefine legacy alias --text/);

rejects("platform utilities cannot return to legacy tokens", ({ write }) => {
  write("src/styles/platform.css", "@utility dmr-example { color: var(--muted); }");
}, /use --ink-3 instead of --muted/);

test("Tailwind bridge emits canonical font and colour utilities without font self-reference", async () => {
  const result = await postcss([tailwind({ base: process.cwd() })]).process(
    '@import "./platform.css"; @source inline("font-body font-display bg-dmr-canvas text-dmr-muted");',
    { from: resolve("src/styles/font-contract.css") },
  );
  const tree = postcss.parse(result.css);
  for (const [selector, prop, value] of [
    [".font-body", "font-family", "var(--font-body)"],
    [".font-display", "font-family", "var(--font-display)"],
    [".bg-dmr-canvas", "background-color", "var(--surface-canvas)"],
    [".text-dmr-muted", "color", "var(--ink-3)"],
  ]) {
    const values = [];
    tree.walkRules(selector, (rule) => rule.walkDecls(prop, (node) => values.push(node.value)));
    assert.deepEqual(values, [value], selector);
  }
  for (const name of ["--font-body", "--font-display"]) {
    tree.walkDecls(name, (node) => {
      assert.notEqual(node.value, `var(${name})`, `${name}: circular theme definition`);
    });
  }
});

// Native audit environment selection must not depend on the runner's old default.
test("Apple toolchain selection ignores beta/default aliases and rejects incompatible iOS majors", async () => {
  const { newestStableXcode, runtimeMatchesSdk } = await import("../scripts/lib/apple-toolchain.mjs");
  assert.equal(newestStableXcode(["Xcode.app", "Xcode_16.4.app", "Xcode_26.2.app", "Xcode_26.3.app", "Xcode_27_beta.app"]), "Xcode_26.3.app");
  assert.throws(() => newestStableXcode(["Xcode.app", "Xcode_27_beta.app"]), /No versioned stable/);
  assert.equal(runtimeMatchesSdk("com.apple.CoreSimulator.SimRuntime.iOS-26-2", "18.5"), false);
  assert.equal(runtimeMatchesSdk("com.apple.CoreSimulator.SimRuntime.iOS-18-6", "18.5"), true);
  assert.equal(runtimeMatchesSdk("com.apple.CoreSimulator.SimRuntime.iOS-26-2", "26.2"), true);
  assert.equal(runtimeMatchesSdk("com.apple.CoreSimulator.SimRuntime.tvOS-26-2", "26.2"), false);
  assert.equal(runtimeMatchesSdk("invalid", "invalid"), false);
});

test("Safari diagnostics are bounded and isolated to the actual driver pid", async () => {
  const { safariDriverLog } = await import("../scripts/lib/apple-toolchain.mjs");
  const directory = mkdtempSync(join(tmpdir(), "dmr-safari-logs-"));
  try {
    writeFileSync(join(directory, "safaridriver.42.session.txt"), "x".repeat(14000) + "RWI startup failed");
    writeFileSync(join(directory, "safaridriver.43.session.txt"), "unrelated driver");
    const log = safariDriverLog(directory, 42);
    assert.ok(log.length <= 12000);
    assert.ok(log.endsWith("RWI startup failed"));
    assert.ok(!log.includes("unrelated driver"));
    assert.match(safariDriverLog(directory, 99), /No SafariDriver diagnostic file/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});


test("VoiceOver shortcuts retain native command codes without app activation", async () => {
  const { macKeyboardShortcut } = await import("../scripts/lib/assistive-commands.mjs");
  const { voiceOverKeyCodeCommands: commands, MacOSKeyCodes } = await import("@guidepup/guidepup");
  for (const name of ["openItemChooser", "openWebItemRotor", "interactWithItem", "findNextTable", "moveToNextColumn", "moveDown", "describeItem"]) {
    const command = commands[name];
    const parts = macKeyboardShortcut(command).split("+");
    assert.equal(MacOSKeyCodes[parts.pop()], command.keyCode);
    assert.deepEqual(parts, command.modifiers.map(modifier => ({ control: "Control", option: "Alt", command: "Meta", shift: "Shift" })[modifier]));
  }
  assert.throws(() => macKeyboardShortcut({ keyCode: -1 }), /Unknown native key/);
  assert.throws(() => macKeyboardShortcut({ keyCode: 34, modifiers: ["unsupported"] }), /Unknown native modifier/);
});


test("host Simulator diagnostics do not get displaced by runtime daemon paths", async () => {
  const { nativeSimulatorProcessLines } = await import("../scripts/lib/apple-toolchain.mjs");
  const host = "1 /Applications/Xcode_26.3.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator";
  const safari = "2 /Library/Developer/CoreSimulator/Volumes/iOS/RuntimeRoot/Applications/MobileSafari.app/MobileSafari";
  const guests = Array(500).fill("3 /Library/Developer/CoreSimulator/Volumes/iOS/RuntimeRoot/usr/libexec/guestd");
  assert.equal(nativeSimulatorProcessLines([host, safari, ...guests].join("\n")), `${host}\n${safari}`);
});

test("evidence transport verifies provenance and rejects corruption without hiding audit failures", async () => {
  const { decodeEvidence } = await import("../scripts/lib/evidence-transfer.mjs");
  const { gzipSync } = await import("node:zlib");
  const { createHash } = await import("node:crypto");
  const revision = "a".repeat(40), otherHead = "b".repeat(40);
  const data = { summary: { revision, failures: ["real native AT failure"] }, scans: [] };
  const bytes = gzipSync(Buffer.from(JSON.stringify(data)));
  const encoded = bytes.toString("base64");
  const half = Math.floor(encoded.length / 2);
  const rows = [{ title: "chunk-0001", message: encoded.slice(0, half) }, { title: "chunk-0002", message: encoded.slice(half) }];
  const manifest = { revision, encoding: "gzip+base64", chunks: 2, bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex") };
  const check = { app: { slug: "github-actions" }, name: "Accessibility evidence (current)", head_sha: revision, status: "completed", conclusion: "success", output: { summary: JSON.stringify(manifest) } };
  assert.deepEqual(decodeEvidence(check, rows.toReversed(), revision).payload, data);
  assert.throws(() => decodeEvidence({ ...check, app: { slug: "other" } }, rows, revision), /Unexpected publisher/);
  assert.throws(() => decodeEvidence(check, rows, otherHead), /Unexpected check head/);
  assert.throws(() => decodeEvidence({ ...check, status: "in_progress" }, rows, revision), /not complete/);
  assert.throws(() => decodeEvidence(check, [rows[0], rows[0]], revision), /Duplicate or missing/);
  assert.throws(() => decodeEvidence(check, rows.slice(1), revision), /Missing or extra/);
  assert.throws(() => decodeEvidence(check, [{ ...rows[0], message: "!" + rows[0].message.slice(1) }, rows[1]], revision), /base64/);
  assert.throws(() => decodeEvidence({ ...check, output: { summary: JSON.stringify({ ...manifest, sha256: "0".repeat(64) }) } }, rows, revision), /SHA256/);
  assert.throws(() => decodeEvidence({ ...check, output: { summary: JSON.stringify({ ...manifest, bytes: bytes.length + 1 }) } }, rows, revision), /size mismatch/);
  assert.throws(() => decodeEvidence({ ...check, head_sha: otherHead }, rows, revision), /Unexpected check head/);
  assert.deepEqual(decodeEvidence({ ...check, head_sha: otherHead }, rows, revision, otherHead).payload, data);
});

test("SafariDriver log PIDs come from the observed launcher tree, not arithmetic", async () => {
  const { safariDriverPids } = await import("../scripts/lib/apple-toolchain.mjs");
  const processes = "997 81 /actual/safaridriver\n81 40 /bin/sh\n40 1 /usr/bin/safaridriver\n41 2 /other/safaridriver\n998 81 /helper/service";
  assert.deepEqual(safariDriverPids(processes, 40), [40, 997]);
  assert.deepEqual(safariDriverPids("", 40), [40]);
});
