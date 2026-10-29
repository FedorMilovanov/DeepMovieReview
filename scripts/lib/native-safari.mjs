// Minimal W3C WebDriver client for Apple's installed Safari, not Playwright WebKit.
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { homedir } from "node:os";
import { join } from "node:path";
import { safariDriverLog, safariDriverPids, safariListenerPids, safariHttpServicePids } from "./apple-toolchain.mjs";
import { setTimeout as delay } from "node:timers/promises";

export function safariRequestTimeout(path) {
  return path === "/session" || path.endsWith("/url") ? 90000 : path === "/status" ? 1500 : 30000;
}

// Observe asynchronous native browser/UI completion; never replay the input.
export async function waitForNativeValue(read, expected, { timeout = 10000, now = Date.now, pause = () => delay(100) } = {}) {
  const deadline = now() + timeout;
  let actual;
  do {
    actual = await read();
    if (Object.is(actual, expected)) return actual;
    await pause();
  } while (now() < deadline);
  assert.equal(actual, expected, "Native UI state did not reach the expected value before its deadline");
}

export async function nativeSafari(capabilities = {}, { beforeSession = async () => {} } = {}) {
  // Never attach iOS to a desktop driver's leftover fixed-port listener.
  const reservation = createServer().listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = reservation.address().port;
  await new Promise((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
  const driver = spawn("/usr/bin/safaridriver", ["--diagnose", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
  let diagnostics = "", lastError;
  let cleanupPids = [driver.pid], diagnosticPids = cleanupPids;
  function stopDriver() {
    driver.kill();
    for (const pid of cleanupPids) if (pid !== driver.pid) {
      try { process.kill(pid); } catch (error) {
        if (error.code !== "ESRCH") diagnostics += `\nDriver ${pid} cleanup: ${error.message}`;
      }
    }
  }
  for (const stream of [driver.stdout, driver.stderr]) stream.on("data", chunk => {
    diagnostics = `${diagnostics}${chunk}`.slice(-8000);
    process.stderr.write(chunk);
  });
  driver.on("error", error => { lastError = error; });
  let session;
  async function request(path, body, method = body === undefined ? "GET" : "POST") {
    try {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        signal: AbortSignal.timeout(safariRequestTimeout(path)),
        method, headers: { "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const result = await response.json();
      assert.ok(response.ok && !result.value?.error, JSON.stringify(result));
      return result.value;
    } catch (error) {
      throw new Error(`SafariDriver ${method} ${path}: ${error.message}`, { cause: error });
    }
  }
  try {
    let ready = false;
    const startupDeadline = Date.now() + 90000;
    while (Date.now() < startupDeadline) {
      try { await request("/status"); ready = true; break; } catch (error) {
        lastError = error;
        if (driver.exitCode !== null || driver.signalCode !== null) break;
        await delay(250);
      }
    }
    assert.ok(ready, `SafariDriver did not start (exit=${driver.exitCode}, signal=${driver.signalCode}): ${inspect(lastError, { depth: 5 })}; ${diagnostics}`);
    // Observe the launcher's real driver before expensive Simulator boot. This
    // is optional diagnostics: failure must not prevent the W3C session attempt.
    try {
      // Read the listener first: the shim may start its helper after /status.
      const listeners = execFileSync("lsof", ["-nP", "-a", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fp"], { encoding: "utf8", timeout: 5000 });
      diagnostics += `\nListener ownership on port ${port}: ${listeners}`;
      const processes = execFileSync("ps", ["-axww", "-o", "pid=,ppid=,comm="], { encoding: "utf8", timeout: 5000 });
      const listenerIds = new Set([...listeners.matchAll(/^p(\d+)$/gm)].map(([, pid]) => Number(pid)));
      diagnostics += `\nDriver/listener process rows:\n${processes.split("\n").filter(line => /safaridriver/.test(line) || listenerIds.has(Number(line.trim().split(/\s+/)[0]))).join("\n").slice(-5000)}`;
      cleanupPids = [...new Set([...safariDriverPids(processes, driver.pid), ...safariListenerPids(listeners, processes)])];
      diagnosticPids = [...new Set([...cleanupPids, ...safariHttpServicePids(listeners, processes)])];
    } catch (error) { diagnostics += `\nDriver process snapshot unavailable: ${error.message}`; }
    await beforeSession();
    const result = await request("/session", { capabilities: { alwaysMatch: { browserName: "safari", ...capabilities } } });
    session = result.sessionId;
    const path = `/session/${session}`;
    return {
      version: result.capabilities.browserVersion,
      capabilities: result.capabilities,
      async click(selector) {
        const element = await request(`${path}/element`, { using: "css selector", value: selector });
        if (capabilities.platformName?.toLowerCase() === "ios") {
          // Mobile Safari element/click can deliver a move without a tap.
          // Use a real W3C touch gesture; release is required to dispatch up.
          const point = await request(`${path}/execute/sync`, {
            script: "arguments[0].scrollIntoView({block:'center',behavior:'instant'});const r=arguments[0].getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}", args: [element],
          });
          try {
            return await request(`${path}/actions`, { actions: [{ type: "pointer", id: "finger", parameters: { pointerType: "touch" }, actions: [
              { type: "pointerMove", duration: 0, ...point }, { type: "pointerDown", button: 0 },
              { type: "pause", duration: 80 }, { type: "pointerUp", button: 0 },
            ] }] });
          } finally { await request(`${path}/actions`, undefined, "DELETE"); }
        }
        return request(`${path}/element/${element["element-6066-11e4-a52e-4f735466cecf"]}/click`, {});
      },
      execute: script => request(`${path}/execute/sync`, { script, args: [] }),
      goto: url => request(`${path}/url`, { url }),
      screenshot: () => request(`${path}/screenshot`),
      resize: (width, height) => request(`${path}/window/rect`, { width, height }),
      async close() { try { await request(path, undefined, "DELETE"); } finally { stopDriver(); } },
    };
  } catch (error) {
    const exited = driver.exitCode !== null || driver.signalCode !== null ? Promise.resolve() : once(driver, "exit").catch(() => {});
    stopDriver();
    await Promise.race([exited, delay(2000)]);
    const log = diagnosticPids.map(pid => safariDriverLog(join(homedir(), "Library/Logs/com.apple.WebDriver"), pid)).join("\n").slice(-12000);
    throw new Error(`${error.message}\nSafariDriver diagnostics (observed PIDs ${diagnosticPids.join(", ")}):\n${diagnostics}\n${log}`, { cause: error });
  }
}
