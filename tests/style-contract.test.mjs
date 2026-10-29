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

test("launchd SafariDriver listener ownership is checked independently of parent PID", async () => {
  const { safariListenerPids } = await import("../scripts/lib/apple-toolchain.mjs");
  const processes = "901 1 /installed/safaridriver\n902 1 /other/server\n903 1 /unrelated/safaridriver";
  assert.deepEqual(safariListenerPids("p901\np902\n", processes), [901]);
  assert.deepEqual(safariListenerPids("p904\n", processes), []);
});

test("native navigation has its own bounded deadline, not a generic 30s command timeout", async () => {
  const { safariRequestTimeout } = await import("../scripts/lib/native-safari.mjs");
  assert.equal(safariRequestTimeout("/session"), 90000);
  assert.equal(safariRequestTimeout("/session/id/url"), 90000);
  assert.equal(safariRequestTimeout("/status"), 1500);
  assert.equal(safariRequestTimeout("/session/id/execute/sync"), 30000);
  assert.equal(safariRequestTimeout("/session/id/screenshot"), 30000);
});

test("native Safari read-only probes preserve values without injected focus or CSS", async () => {
  const { safariProbe } = await import("../scripts/lib/safari-desktop.mjs");
  const { runInNewContext } = await import("node:vm");
  const value = runInNewContext(safariProbe("geometry"), {
    innerWidth: 480, outerWidth: 960, devicePixelRatio: 2, document: { documentElement: { scrollWidth: 480 } },
  });
  assert.deepEqual(JSON.parse(value), { width: 480, outer: 960, dpr: 2, scroll: 480 });
});

test("native Safari restores CI-only JavaScript preference on close and setup failure", async () => {
  const { safariDesktop } = await import("../scripts/lib/safari-desktop.mjs");
  const calls = [];
  const run = async (file, args) => {
    calls.push([file, ...args]);
    if (file === "defaults" && args[0] === "read") throw Object.assign(new Error("absent"), { code: 1 });
    if (file === "/usr/bin/osascript" && args[1].includes("make new document")) return "99";
    if (file === "/usr/bin/osascript" && args[1].includes("get version")) return "26.6.1";
    return "";
  };
  const browser = await safariDesktop({ run, ci: true });
  assert.equal(browser.version, "26.6.1");
  await browser.close();
  assert.ok(calls.some(row => row[0] === "defaults" && row[1] === "delete"));
  calls.length = 0;
  await assert.rejects(safariDesktop({ run, ci: false }), /local preferences are not changed/);
  assert.ok(!calls.some(row => row[0] === "defaults" && row[1] === "write"));
  calls.length = 0;
  await assert.rejects(safariDesktop({ ci: true, run: async (file, args) => {
    if (file === "/usr/bin/osascript" && args[1].includes("make new document")) throw new Error("window failed");
    return run(file, args);
  } }), /window failed/);
  assert.ok(calls.some(row => row[0] === "defaults" && row[1] === "delete"));
});

test("native Safari Apple Events adapter waits for real DOM/fonts and reads geometry", async () => {
  const { safariDesktop } = await import("../scripts/lib/safari-desktop.mjs");
  const { runInNewContext } = await import("node:vm");
  let url = "about:blank", checks = 0;
  const browser = await safariDesktop({ ci: false, run: async (file, args) => {
    if (file === "defaults") return "1";
    const script = args[1];
    if (script.includes("make new document")) return "321";
    if (script.includes("get version")) return "26.6.1";
    if (script.includes("set URL")) { url = args.at(-1); return ""; }
    if (script.includes("do JavaScript")) {
      assert.equal(args[2], "321", "Probe must target the owned native window");
      checks++;
      return runInNewContext(args[3], { devicePixelRatio: 3, location: { href: url }, innerWidth: 320,
        outerWidth: 960, document: { readyState: "complete", fonts: { status: "loaded" }, documentElement: { scrollWidth: 320 } } });
    }
    return "";
  } });
  await browser.goto("http://127.0.0.1:3213/films");
  assert.ok(checks > 0, "Navigation must actually verify page/font readiness");
  assert.deepEqual(await browser.geometry(), { width: 320, outer: 960, dpr: 3, scroll: 320 });
  await browser.close();
});

test("late native VoiceOver speech is awaited without replaying navigation", async () => {
  const { settleNativeSpeech } = await import("../scripts/lib/assistive-commands.mjs");
  const values = ["Page Menu", "VoiceOver Menu"], reads = [];
  let clock = 0;
  const result = await settleNativeSpeech(["old phrase"], /VoiceOver Menu/, async () => {
    const value = values.shift(); reads.push(value); return value;
  }, { now: () => clock++, pause: async () => {}, timeout: 10 });
  assert.deepEqual(result.speech, ["old phrase", "Page Menu", "VoiceOver Menu"]);
  assert.equal(reads.length, 2);
  assert.deepEqual(result.readErrors, []);
});

test("native speech timeout never manufactures a semantic pass", async () => {
  const { settleNativeSpeech } = await import("../scripts/lib/assistive-commands.mjs");
  let clock = 0;
  const result = await settleNativeSpeech(["Page Menu"], /VoiceOver Menu/, async () => { throw new Error("reader unavailable"); },
    { now: () => clock++, pause: async () => {}, timeout: 3 });
  assert.deepEqual(result.speech, ["Page Menu"]);
  assert.ok(result.readErrors.length > 0);
  assert.doesNotMatch(result.speech.join(" "), /VoiceOver Menu/);
});

test("rendered contrast bounds use every background pixel, not averages or rounding", async () => {
  const { contrast, rectangleContrast } = await import("../scripts/lib/contrast-pixels.mjs");
  assert.equal(contrast([255, 255, 255, 1], [0, 0, 0]), 21);
  assert.ok(contrast([119, 119, 119, 1], [255, 255, 255]) < 4.5);
  const image = { width: 2, height: 1, data: Buffer.from([0, 0, 0, 255, 255, 255, 255, 255]) };
  const result = rectangleContrast(image, { x: 0, y: 0, width: 2, height: 1 }, [255, 255, 255, 1]);
  assert.equal(result.minimum, 1);
  assert.equal(result.pixels, 2);
  assert.deepEqual(result.worstBackground.rgb, [255, 255, 255]);
  assert.ok(contrast([255, 255, 255, 0.5], [0, 0, 0]) < 6);
  assert.throws(() => rectangleContrast(image, { x: 0, y: 0, width: 2, height: 1 }, [255, 255, 255, 0]));
});

test("contrast background isolation preserves color/currentColor paint and restores inline style", async () => {
  const { maskTextPaint, restoreTextPaint } = await import("../scripts/lib/rendered-contrast.mjs");
  const values = new Map([["color", "rgb(200, 200, 200)"], ["background-color", "currentColor"], ["-webkit-text-fill-color", "rgb(200, 200, 200)"]]);
  const style = { getPropertyValue: name => values.get(name) ?? "", getPropertyPriority: () => "",
    setProperty: (name, value) => values.set(name, value), removeProperty: name => values.delete(name) };
  const state = { records: [{ id: 0, element: { style, namespaceURI: "http://www.w3.org/1999/xhtml" } }], visibleIds: new Set([0]) };
  const before = [...values];
  const { runInNewContext } = await import("node:vm");
  runInNewContext(`(${maskTextPaint.toString()})(state)`, { state, getComputedStyle: () => ({ textDecorationLine: "none" }) });
  assert.equal(values.get("color"), "rgb(200, 200, 200)");
  assert.equal(values.get("background-color"), "currentColor");
  assert.equal(values.get("-webkit-text-fill-color"), "transparent");
  restoreTextPaint(state);
  assert.deepEqual([...values], before);
});


test("contrast coverage rejects a disappearing target even after prior measurements", async () => {
  const { missingRangeIds } = await import("../scripts/lib/rendered-contrast.mjs");
  const measurements = new Map([["0:0:0", {}], ["1:0:0", {}], ["2:0:0", {}], ["3:0:0", {}]]);
  assert.deepEqual([...missingRangeIds([
    { id: 0, connected: true, lines: 1 },
    { id: 1, connected: false, lines: 1 },
    { id: 2, connected: true, lines: 0 },
    { id: 3, connected: true, lines: 2 },
  ], measurements)], [1, 2, 3]);
});

test("text decoration paint is isolated at its ancestor without changing background paint", async () => {
  const { maskTextPaint, restoreTextPaint } = await import("../scripts/lib/rendered-contrast.mjs");
  const { runInNewContext } = await import("node:vm");
  const makeElement = (values, parentElement = null) => ({ parentElement, namespaceURI: "http://www.w3.org/1999/xhtml",
    style: { getPropertyValue: name => values.get(name) ?? "", getPropertyPriority: () => "",
      setProperty: (name, value) => values.set(name, value), removeProperty: name => values.delete(name) } });
  const ancestorValues = new Map([["text-decoration-color", "red"], ["color", "white"], ["background-color", "currentColor"]]);
  const ancestor = makeElement(ancestorValues), childValues = new Map(), child = makeElement(childValues, ancestor);
  const state = { records: [{ id: 0, element: child }], visibleIds: new Set([0]) };
  const original = [...ancestorValues];
  runInNewContext(`(${maskTextPaint.toString()})(state)`, { state,
    getComputedStyle: element => ({ textDecorationLine: element === ancestor ? "line-through" : "none" }) });
  assert.equal(ancestorValues.get("text-decoration-color"), "transparent");
  assert.equal(ancestorValues.get("color"), "white");
  assert.equal(ancestorValues.get("background-color"), "currentColor");
  assert.equal(ancestorValues.has("-webkit-text-fill-color"), false);
  restoreTextPaint(state);
  assert.deepEqual([...ancestorValues], original);
  assert.deepEqual([...childValues], []);
});


test("Safari XPC diagnostic log requires exact system executable and actual TCP ownership", async () => {
  const { safariHttpServicePids } = await import("../scripts/lib/apple-toolchain.mjs");
  const executable = "/System/Volumes/Preboot/Cryptexes/App/System/Library/StagedFrameworks/Safari/WebDriver.framework/Versions/A/XPCServices/com.apple.WebDriver.HTTPService.xpc/Contents/MacOS/com.apple.WebDriver.HTTPService";
  const processes = `8798 1 ${executable}\n8799 1 ${executable}\n8800 1 /tmp/com.apple.WebDriver.HTTPService\n8801 1 ${executable}.fake`;
  assert.deepEqual(safariHttpServicePids("p8798\np8800\np8801\n", processes), [8798]);
  assert.deepEqual(safariHttpServicePids("p8797\n", processes), []);
});


test("iOS automation switch is CI-only, verified, exactly restored and idempotent", async () => {
  const { simulatorAutomation } = await import("../scripts/lib/simulator-automation.mjs");
  const udid = "f0c70c77-e423-4478-b648-3d25045b311b";
  for (const original of [null, false, true]) {
    let value = original, timeout = 30000; const writes = [];
    const run = (file, args, options) => {
      assert.equal(file, "xcrun"); assert.deepEqual(args.slice(0, 4), ["simctl", "spawn", udid, "defaults"]);
      assert.equal(options.timeout, timeout);
      if (args[4] === "read") {
        if (value === null) throw Object.assign(new Error("absent"), { status: 1, stderr: "domain/default pair does not exist" });
        return value ? "1" : "0";
      }
      writes.push(args);
      value = args[4] === "delete" ? null : args.at(-1) === "true";
      return "";
    };
    if (original !== true) assert.throws(() => simulatorAutomation(udid, { run }), /local preferences are not changed/);
    assert.equal(writes.length, 0);
    timeout = 120000;
    const automation = simulatorAutomation(udid, { ci: true, run });
    assert.equal(value, true); assert.equal(automation.original, original);
    automation.restore(); assert.equal(value, original);
    const count = writes.length; automation.restore(); assert.equal(writes.length, count);
  }
});

test("macOS26 XPC diagnostic identity is still a sealed-system path, not a look-alike", async () => {
  const { safariHttpServicePids } = await import("../scripts/lib/apple-toolchain.mjs");
  const executable = "/System/Library/PrivateFrameworks/WebDriver.framework/Versions/A/XPCServices/com.apple.WebDriver.HTTPService.xpc/Contents/MacOS/com.apple.WebDriver.HTTPService";
  assert.deepEqual(safariHttpServicePids("p2017\np2018\n", `2017 1 ${executable}\n2018 1 /tmp${executable}\n2019 1 ${executable}`), [2017]);
});


test("live text ranges refresh on the same node and old versions cannot cover new text", async () => {
  const { refreshTextRanges, missingRangeIds } = await import("../scripts/lib/rendered-contrast.mjs");
  const text = { isConnected: true, textContent: "MEDIUM / unknown" }; let selections = 0;
  const record = { id: 0, version: 0, text, content: text.textContent, range: { selectNodeContents: node => { assert.equal(node, text); selections++; } } };
  const state = { records: [record], textChanges: [] };
  refreshTextRanges(state); assert.equal(record.version, 0);
  text.textContent = "LOW / webgl2"; refreshTextRanges(state);
  assert.equal(record.version, 1); assert.equal(selections, 2); assert.equal(state.textChanges.length, 1);
  assert.deepEqual([...missingRangeIds([{ id: 0, connected: true, version: 1, lines: 1 }], new Map([["0:0:0", {}]]))], [0]);
  assert.deepEqual([...missingRangeIds([{ id: 0, connected: true, version: 1, lines: 1 }], new Map([["0:1:0", {}]]))], []);
  text.isConnected = false; refreshTextRanges(state); assert.equal(selections, 2);
});


test("native Safari probes reject arbitrary code and hostile URL data", async () => {
  const { safariProbe } = await import("../scripts/lib/safari-desktop.mjs");
  const hostile = 'https://example.test/Кино?x=";globalThis.injected=true;//\\\n`</script>\u2028\u2029';
  for (const value of [hostile, "return location.href", "__proto__", "constructor"]) {
    assert.throws(() => safariProbe(value), /Unknown native Safari read-only probe/);
  }
  assert.ok(!safariProbe("ready").includes(hostile));
  assert.equal(safariProbe("ready"), "JSON.stringify({href:location.href,readyState:document.readyState,fonts:document.fonts.status})");
});


test("real VoiceOver CI preflight starts once and waits for actual service output", async () => {
  const { warmVoiceOver } = await import("../scripts/lib/assistive-commands.mjs");
  let starts = 0, clock = 0; const phrases = ["", "Real desktop speech"];
  const start = async () => { starts++; };
  await assert.rejects(warmVoiceOver({ start }), /CI-only/); assert.equal(starts, 0);
  const receipt = await warmVoiceOver({ ci: true, start, now: () => clock++, pause: async () => {}, read: async () => phrases.shift(), timeout: 10 });
  assert.equal(starts, 1); assert.equal(receipt.lastPhrase, "Real desktop speech");
  await assert.rejects(warmVoiceOver({ ci: true, start, now: () => clock++, pause: async () => {}, read: async () => "", timeout: 3 }), /did not become responsive/);
});


test("native UI observation waits without replaying input and fails a persistent state", async () => {
  const { waitForNativeValue } = await import("../scripts/lib/native-safari.mjs");
  let clock = 0, reads = 0;
  assert.equal(await waitForNativeValue(async () => ++reads < 3 ? "true" : "false", "false", { now: () => clock++, pause: async () => {}, timeout: 10 }), "false");
  assert.equal(reads, 3);
  await assert.rejects(waitForNativeValue(async () => "true", "false", { now: () => clock++, pause: async () => {}, timeout: 3 }), /Native UI state/);
});
