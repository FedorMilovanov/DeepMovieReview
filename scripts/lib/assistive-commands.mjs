import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import { MacOSKeyCodes } from "@guidepup/guidepup";

// Require the named row and the actual detector count, not the nearby 0,0/min
// rate or an unqualified (and now inaccurate) "0 переходов" announcement.
export const libraryDetectionRowSpeech = /библиотека[\s\S]*\b0 обнаруженных переходов/i;
export const needsTableRowRead = speech => !libraryDetectionRowSpeech.test(speech.join(" "));

// The visible count is part of the accessible name. NVDA may omit the middle
// dot in speech; VoiceOver retains it. Require the count and the specific scene
// together, then independently require an announced role and collapsed state.
export const sceneSupportDisclosureSpeech = /опоры\s*(?:·\s*)?6\s*[—–-]\s*сцена\s*[«"]?\s*день\s*10\s*909(?!\d)\s*[»"]?/i;
export const sceneSupportDisclosureRole = /\b(?:button|summary)\b|кнопк|сводк/i;
export const sceneSupportDisclosureCollapsed = /\bcollapsed\b|св[её]рнут/i;

// VoiceOver may announce the selected skip link and Safari's Page Menu rather
// than saying "Item Chooser" (observed on bab389e). This only gates the setup:
// selecting web content, entering it, and speaking the real link remain required.
export const voiceOverChooserSpeech = /item chooser|VoiceOver Menu|On item\s+Перейти к содержимому\.\s*Page Menu/i;

// A generic VoiceOver table-help hint proves neither the expected caption nor
// the role. A read-only Describe Item can request the missing announcement.
export const nativeTableRoleSpeech = /table|таблиц/i;
export function needsNamedTableRead(speech, name) {
  const text = speech.join(" ");
  return !name.test(text) || !nativeTableRoleSpeech.test(text);
}

// Both speech and native browser focus must identify the real skip link. Keep
// spontaneous entry speech separate: Guidepup polls "last phrase" and may only
// retain the subsequent help hint, so it must not be invented from DOM focus.
export function validateVoiceOverSkipLink(entrySpeech, describedSpeech, focus) {
  const name = /перейти к содержимому/i;
  assert.match(entrySpeech.join(" "), /web content|перейти к содержимому/i, "VoiceOver must enter web content");
  assert.match(describedSpeech.join(" "), name, "VoiceOver Describe Item must speak the link name");
  assert.match(describedSpeech.join(" "), /link|ссылк/i, "VoiceOver Describe Item must speak the link role");
  assert.equal(focus?.tag, "A", "Native focus must be on a link");
  assert.equal(focus?.href, "#main", "Native focus must target main content");
  assert.match(focus?.text ?? "", name, "Native focus must be the named skip link");
  return { automaticNameObserved: name.test(entrySpeech.join(" ")) };
}

// NVDA may announce the table caption without literally saying "caption".
// Only an explicit cell coordinate proves that row-navigation is ready.
export function firstTableCellSpoken(phrases) {
  return /(?:row\s*1[\s\S]*column\s*1|строка\s*1[\s\S]*столбец\s*1)/i.test(phrases.join(" "));
}

export function firstTableHeaderSpoken(phrases, pattern) {
  return phrases.some((phrase) => firstTableCellSpoken([phrase]) && pattern.test(phrase));
}

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
