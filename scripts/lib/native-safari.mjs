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

// An absent or navigation-lost probe is not evidence that input was undelivered.
export function noNativeEventsDelivered(probe) {
  return Boolean(probe && !probe.lostAfterNavigation && Array.isArray(probe.events) && probe.events.length === 0);
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

// Observe scrolling, font and visual-viewport completion before ONE native input.
// Never replay a gesture because its postcondition failed.
export async function waitForStableNativeTarget(read, { timeout = 10000, now = Date.now, pause = () => delay(100) } = {}) {
  const deadline = now() + timeout;
  let previous, stable = 0;
  while (now() < deadline) {
    const target = await read();
    const key = target?.ready ? JSON.stringify(target) : undefined;
    stable = key && key === previous ? stable + 1 : 0;
    previous = key;
    if (stable >= 2) return target;
    await pause();
  }
  throw new Error("Native touch target did not settle or remained occluded before input");
}

export async function nativeSafari(capabilities = {}, { beforeSession = async () => {}, retrySetup = async () => {} } = {}) {
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
  const inputs = [];
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
    // Host-level session setup on a cold Simulator can time out while the
    // browser's RWI service is still starting. Retry SESSION CREATION once with
    // a real relaunch; product gestures are never replayed.
    let result;
    for (let attempt = 1; !result; attempt++) {
      await beforeSession();
      try {
        result = await request("/session", { capabilities: { alwaysMatch: { browserName: "safari", ...capabilities } } });
      } catch (error) {
        if (attempt >= 2) throw error;
        diagnostics += `\nSession attempt ${attempt} failed: ${error.message}`;
        await retrySetup();
      }
    }
    session = result.sessionId;
    const path = `/session/${session}`;
    return {
      version: result.capabilities.browserVersion,
      capabilities: result.capabilities,
      inputs,
      async click(selector) {
        const element = await request(`${path}/element`, { using: "css selector", value: selector });
        if (capabilities.platformName?.toLowerCase() === "ios") {
          // Mobile Safari element/click can deliver a move without a tap.
          // Use a real W3C touch gesture; release is required to dispatch up.
          await request(`${path}/execute/sync`, {
            script: "arguments[0].scrollIntoView({block:'center',behavior:'instant'})", args: [element],
          });
          const point = await waitForStableNativeTarget(() => request(`${path}/execute/sync`, {
            script: `const el=arguments[0],r=el.getBoundingClientRect(),v=visualViewport;
              const point={x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
              const hit=document.elementFromPoint(point.x,point.y);
              // The gesture now uses the element as its W3C origin, so the
              // driver resolves the centre itself. Readiness waits for a stable
              // box in a settled document; the hit-test is recorded, not used as
              // a precondition on coordinates this driver does not honour.
              return {ready:el.isConnected&&document.readyState==='complete'&&document.fonts.status==='loaded'&&
                point.x>=0&&point.x<innerWidth&&point.y>=0&&point.y<innerHeight,
                point,hitContained:!!hit&&el.contains(hit),rect:r.toJSON(),scroll:{x:scrollX,y:scrollY},
                viewport:v?{x:v.offsetLeft,y:v.offsetTop,width:v.width,height:v.height,scale:v.scale}:null};`,
            args: [element],
          }));
          inputs.push({ selector, ...point, gesture: "single native touch after stable hit-test" });
          try {
            // Absolute viewport coordinates from this driver landed on a
            // different element (measured: a touch aimed at y=32 reached
            // appShell). Give the driver the element itself as the W3C origin
            // so it resolves its own centre; still one native touch.
            return await request(`${path}/actions`, { actions: [{ type: "pointer", id: "finger", parameters: { pointerType: "touch" }, actions: [
              { type: "pointerMove", duration: 0, origin: element, x: 0, y: 0 }, { type: "pointerDown", button: 0 },
              { type: "pause", duration: 80 }, { type: "pointerUp", button: 0 },
            ] }] });
          } finally { await request(`${path}/actions`, undefined, "DELETE"); }
        }
        return request(`${path}/element/${element["element-6066-11e4-a52e-4f735466cecf"]}/click`, {});
      },
      // Standard W3C element activation, used only when a delivered touch is
      // proven absent by a DOM event probe. Never a JS .click() substitute.
      async elementClick(selector) {
        const element = await request(`${path}/element`, { using: "css selector", value: selector });
        return request(`${path}/element/${element["element-6066-11e4-a52e-4f735466cecf"]}/click`, {});
      },
      // A second W3C touch coordinate system, attempted only by the caller
      // after both the element-origin gesture and element activation delivered
      // zero DOM events. It is not a synthetic DOM click and it may still fail.
      async viewportTouch(selector) {
        assert.equal(capabilities.platformName?.toLowerCase(), "ios", "viewport touch is iOS-only");
        const element = await request(`${path}/element`, { using: "css selector", value: selector });
        const target = await waitForStableNativeTarget(() => request(`${path}/execute/sync`, {
          script: `const el=arguments[0],r=el.getBoundingClientRect(),v=visualViewport;
            const point={x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
            const hit=document.elementFromPoint(point.x,point.y);
            return {ready:el.isConnected&&document.readyState==='complete'&&document.fonts.status==='loaded'&&
              point.x>=0&&point.x<innerWidth&&point.y>=0&&point.y<innerHeight&&!!hit&&el.contains(hit),
              point,hitContained:!!hit&&el.contains(hit),rect:r.toJSON(),scroll:{x:scrollX,y:scrollY},
              viewport:v?{x:v.offsetLeft,y:v.offsetTop,width:v.width,height:v.height,scale:v.scale}:null};`,
          args: [element],
        }));
        inputs.push({ selector, ...target, gesture: "single W3C viewport-origin touch after two undelivered inputs" });
        try {
          return await request(`${path}/actions`, { actions: [{ type: "pointer", id: "finger-viewport", parameters: { pointerType: "touch" }, actions: [
            { type: "pointerMove", duration: 0, origin: "viewport", x: target.point.x, y: target.point.y },
            { type: "pointerDown", button: 0 }, { type: "pause", duration: 80 }, { type: "pointerUp", button: 0 },
          ] }] });
        } finally { await request(`${path}/actions`, undefined, "DELETE"); }
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
