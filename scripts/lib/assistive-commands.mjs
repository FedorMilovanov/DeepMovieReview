import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import { MacOSKeyCodes } from "@guidepup/guidepup";

// Keep Guidepup's native command mapping, but send it via reader.press: unlike
// reader.perform(keyboardCommand), this does not activate VoiceOver's app first.
export function macKeyboardShortcut(command) {
  assert.equal(typeof command.keyCode, "number", "Expected a single native key code");
  const key = MacOSKeyCodes[command.keyCode];
  assert.ok(key, "Unknown native key code");
  const names = { control: "Control", option: "Alt", command: "Meta", shift: "Shift" };
  const modifiers = (command.modifiers ?? []).map(modifier => {
    assert.ok(Object.hasOwn(names, modifier), `Unknown native modifier: ${modifier}`);
    return names[modifier];
  });
  return [...modifiers, key].join("+");
}

const execute = promisify(execFile);
export async function nativeVoiceOverPhrase() {
  const { stdout } = await execute("/usr/bin/osascript", ["-e", 'tell application "VoiceOver" to return content of last phrase'], { timeout: 2000, maxBuffer: 65536 });
  return stdout.trim();
}

// Guidepup's stored phrase log can stabilize before the menu's delayed speech.
// Poll the public VoiceOver last-phrase API, never replay a mutating command or
// inject expected content. Absence/timeout still fails the caller's assertion.
export async function settleNativeSpeech(initial, expected, read = nativeVoiceOverPhrase, {
  timeout = 8000, pause = () => delay(100), now = Date.now,
} = {}) {
  const speech = [...initial], readErrors = [];
  const patterns = Array.isArray(expected) ? expected : [expected];
  const matches = () => patterns.every(pattern => pattern.test(speech.join(" ")));
  const deadline = now() + timeout;
  while (!matches() && now() < deadline) {
    try {
      const phrase = await read();
      if (phrase && phrase !== speech.at(-1)) speech.push(phrase);
    } catch (error) { readErrors.push(error.message); }
    if (!matches()) await pause();
  }
  return { speech, readErrors };
}

// Guidepup's private native start request has a hard-coded 5s subprocess bound.
// Warm the real public app/AppleEvents service once on disposable CI, then still
// require Guidepup's complete fresh lifecycle and every semantic assertion.
export async function warmVoiceOver({ ci = false,
  start = () => execute("/usr/bin/open", ["-a", "VoiceOver"], { timeout: 30000 }),
  read = nativeVoiceOverPhrase, now = Date.now, pause = () => delay(100), timeout = 60000,
} = {}) {
  assert.ok(ci, "VoiceOver preflight is disposable-CI-only");
  await start();
  const deadline = now() + timeout, readErrors = [];
  while (now() < deadline) {
    try {
      const phrase = await read();
      if (phrase.trim()) return { publicAppPreflight: true, lastPhrase: phrase, readErrors };
    } catch (error) { readErrors.push(error.message); }
    await pause();
  }
  throw new Error(`Native VoiceOver preflight did not become responsive: ${readErrors.join("; ")}`);
}
