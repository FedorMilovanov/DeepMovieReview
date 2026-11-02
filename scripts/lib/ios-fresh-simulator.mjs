// A single disposable CI Simulator for a complete second native test. Never
// erase a user's existing device, and do not repeat an individual gesture.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { simulatorBootLog } from "./apple-toolchain.mjs";

const udidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export async function withFreshGestureSimulator({ original, simulatorApp, ci, diagnostic }, action, { run = execFileSync } = {}) {
  assert.equal(ci, true, "A fresh retry Simulator may only be created on the disposable CI host");
  assert.equal(original?.physicalDevice, false);
  assert.match(original.udid, udidPattern);
  assert.match(original.deviceTypeIdentifier, /^com\.apple\.CoreSimulator\.SimDeviceType\.iPhone-[A-Za-z0-9-]+$/);
  assert.match(original.runtime, /^com\.apple\.CoreSimulator\.SimRuntime\.iOS-\d+(?:-\d+)*$/);
  assert.match(simulatorApp, /^\/Applications\/.+\/Simulator\.app$/);
  assert.equal(typeof action, "function");
  assert.equal(typeof diagnostic, "function");
  // Stop the first device only after its automation preference has been restored
  // by the caller, so the two Simulators cannot compete for CPU/display input.
  run("xcrun", ["simctl", "shutdown", original.udid], { encoding: "utf8", timeout: 120000 });
  diagnostic({ phase: "original-shutdown", originalUdid: original.udid });
  let udid, primaryError, result;
  try {
    const created = String(run("xcrun", ["simctl", "create", "DMR isolated native retry", original.deviceTypeIdentifier, original.runtime],
      { encoding: "utf8", timeout: 120000 })).trim();
    assert.match(created, udidPattern, "simctl did not return a new device UDID");
    assert.notEqual(created.toLowerCase(), original.udid.toLowerCase(), "Retry must use a distinct Simulator");
    udid = created;
    const device = { udid, name: "DMR isolated native retry", deviceTypeIdentifier: original.deviceTypeIdentifier,
      runtime: original.runtime, state: "Booting", isAvailable: true, physicalDevice: false };
    diagnostic({ phase: "created", device });
    run("open", ["-a", simulatorApp, "--args", "-CurrentDeviceUDID", udid], { encoding: "utf8", timeout: 30000 });
    let bootNote = "";
    try { run("xcrun", ["simctl", "boot", udid], { encoding: "utf8", timeout: 120000, maxBuffer: 1024 * 1024 }); }
    catch (error) {
      const detail = `${error.stdout ?? ""}${error.stderr ?? ""}${error.message ?? ""}`;
      if (!/current state: Boot(ed|ing)/.test(detail)) throw error;
      bootNote = `simctl reported the idempotent boot state: ${detail.trim().split("\n").at(-1)}`;
    }
    const started = performance.now();
    let output = "", errorOutput = "";
    try { output = run("xcrun", ["simctl", "bootstatus", udid], { encoding: "utf8", timeout: 480000, maxBuffer: 16 * 1024 * 1024 }); }
    catch (error) { output = error.stdout ?? ""; errorOutput = error.stderr ?? ""; throw error; }
    finally { diagnostic({ phase: "bootstatus", elapsedMs: Math.round(performance.now() - started), timeoutMs: 480000,
      bootLog: simulatorBootLog(bootNote, output, errorOutput) }); }
    device.state = "Booted";
    diagnostic({ phase: "running", device });
    result = await action(device);
  } catch (error) { primaryError = error; }
  let cleanupError;
  if (udid) {
    try { run("xcrun", ["simctl", "shutdown", udid], { encoding: "utf8", timeout: 120000 }); }
    catch (error) { diagnostic({ phase: "retry-shutdown-error", error: String(error.message ?? error) }); }
    try {
      run("xcrun", ["simctl", "delete", udid], { encoding: "utf8", timeout: 120000 });
      diagnostic({ phase: "deleted", udid });
    } catch (error) { cleanupError = error; }
  }
  if (primaryError && cleanupError) throw new AggregateError([primaryError, cleanupError], "Fresh Simulator test and cleanup both failed");
  if (primaryError) throw primaryError;
  if (cleanupError) throw cleanupError;
  return result;
}
