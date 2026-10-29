// Enable the real iOS Safari Remote Automation preference only on disposable CI.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

export function simulatorAutomation(udid, { ci = false, run = execFileSync } = {}) {
  assert.match(udid, /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i);
  const domain = "com.apple.mobilesafari", key = "RemoteAutomationEnabled";
  const defaults = (...args) => String(run("xcrun", ["simctl", "spawn", udid, "defaults", ...args], { encoding: "utf8", timeout: 30000 })).trim();
  const read = () => {
    try {
      const value = defaults("read", domain, key);
      assert.match(value, /^(?:0|1|false|true|NO|YES)$/);
      return /^(?:1|true|YES)$/.test(value);
    } catch (error) {
      if (error.status === 1 && /does not exist/i.test(String(error.stderr))) return null;
      throw error;
    }
  };
  const original = read();
  if (original === true) return { original, enabled: true, restore() {} };
  assert.ok(ci, "Enable Remote Automation in the selected Simulator's Safari settings; local preferences are not changed");
  const restore = () => {
    if (read() === original) return;
    if (original === null) defaults("delete", domain, key);
    else defaults("write", domain, key, "-bool", String(original));
    assert.equal(read(), original, "Simulator Safari automation preference restored");
  };
  try {
    defaults("write", domain, key, "-bool", "true");
    assert.equal(read(), true, "Simulator Safari Remote Automation must actually be enabled");
  } catch (error) {
    try { restore(); } catch (restoreError) { throw new AggregateError([error, restoreError], "Simulator setup and restoration failed"); }
    throw error;
  }
  return { original, enabled: true, restore };
}
