// Real desktop Safari without WebDriver's remote-control window. Native keyboard
// and VoiceOver remain the interaction path; JavaScript is only a read-only probe.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const executeFile = promisify(execFile);
const nativeRun = async (file, args) => (await executeFile(file, args, { timeout: 20000, maxBuffer: 8 * 1024 * 1024 })).stdout.trim();
export const safariProbe = script => `JSON.stringify((()=>{${script}\n})())`;

export async function safariDesktop({ run = nativeRun, ci = process.env.GITHUB_ACTIONS === "true" } = {}) {
  const osa = (script, ...args) => run("/usr/bin/osascript", ["-e", script, ...args.map(String)]);
  let previous, changed = false, windowId;
  async function restorePreference() {
    if (!changed) return;
    if (previous === undefined) await run("defaults", ["delete", "com.apple.Safari", "AllowJavaScriptFromAppleEvents"]);
    else await run("defaults", ["write", "com.apple.Safari", "AllowJavaScriptFromAppleEvents", "-bool", previous === "1" ? "true" : "false"]);
    changed = false;
  }
  async function close() {
    try {
      if (windowId) await osa('on run argv\ntell application "Safari"\nif exists window id (item 1 of argv as integer) then close window id (item 1 of argv as integer)\nend tell\nend run', windowId);
    } finally { await restorePreference(); }
  }
  try {
    try { previous = await run("defaults", ["read", "com.apple.Safari", "AllowJavaScriptFromAppleEvents"]); }
    catch (error) { if (error.code !== 1) throw error; }
    if (previous !== "1") {
      assert.ok(ci, "Enable Safari Develop > Allow JavaScript from Apple Events before a local audit; local preferences are not changed automatically");
      changed = true;
      await run("defaults", ["write", "com.apple.Safari", "AllowJavaScriptFromAppleEvents", "-bool", "true"]);
      await osa('tell application "Safari" to quit');
    }
    windowId = Number(await osa('tell application "Safari"\nactivate\nmake new document with properties {URL:"about:blank"}\nreturn id of front window\nend tell'));
    assert.ok(Number.isSafeInteger(windowId) && windowId > 0, "Safari did not create a native window");
    const version = await osa('tell application "Safari" to get version');
    assert.match(version, /^\d+\./, "Native Safari version is missing");
    async function execute(script) {
      const value = await osa('on run argv\ntell application "Safari" to do JavaScript (item 2 of argv) in current tab of window id (item 1 of argv as integer)\nend run', windowId, safariProbe(script));
      return JSON.parse(value);
    }
    return {
      version, control: "Safari Apple Events + native keyboard; OS window PNG",
      execute,
      async goto(url) {
        await osa('on run argv\ntell application "Safari" to set URL of current tab of window id (item 1 of argv as integer) to item 2 of argv\nend run', windowId, url);
        const deadline = Date.now() + 90000;
        while (Date.now() < deadline) {
          if (await execute(`return location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && document.fonts.status === 'loaded'`)) return;
          await delay(100);
        }
        throw new Error(`Native Safari page/fonts readiness timed out: ${url}`);
      },
      async resize(width, height) {
        assert.ok(Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0);
        await osa('on run argv\ntell application "Safari" to set bounds of window id (item 1 of argv as integer) to {0, 25, (item 2 of argv as integer), (item 3 of argv as integer) + 25}\nend run', windowId, width, height);
      },
      async screenshot() {
        const bounds = (await osa('on run argv\ntell application "Safari" to get bounds of window id (item 1 of argv as integer)\nend run', windowId)).split(",").map(Number);
        assert.ok(bounds.length === 4 && bounds.every(Number.isFinite), "Invalid native Safari window bounds");
        const [x, y, right, bottom] = bounds;
        assert.ok(right > x && bottom > y);
        const directory = mkdtempSync(join(tmpdir(), "dmr-safari-screen-"));
        try {
          const file = join(directory, "window.png");
          await run("/usr/sbin/screencapture", ["-x", "-R", `${x},${y},${right - x},${bottom - y}`, file]);
          const bytes = readFileSync(file);
          assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "Native capture is not PNG");
          return bytes.toString("base64");
        } finally { rmSync(directory, { recursive: true, force: true }); }
      },
      close,
    };
  } catch (error) {
    try { await close(); }
    catch (cleanup) { throw new AggregateError([error, cleanup], "Native Safari setup and preference restoration failed"); }
    throw error;
  }
}
