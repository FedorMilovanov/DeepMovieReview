import assert from "node:assert/strict";
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
