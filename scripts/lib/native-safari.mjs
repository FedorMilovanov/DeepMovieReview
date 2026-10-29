// Minimal W3C WebDriver client for Apple's installed Safari, not Playwright WebKit.
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

export async function nativeSafari(capabilities = {}, { beforeSession = async () => {} } = {}) {
  const driver = spawn("/usr/bin/safaridriver", ["-p", "4444"], { stdio: ["ignore", "pipe", "pipe"] });
  let diagnostics = "", lastError;
  for (const stream of [driver.stdout, driver.stderr]) stream.on("data", chunk => {
    diagnostics = `${diagnostics}${chunk}`.slice(-8000);
    process.stderr.write(chunk);
  });
  driver.on("error", error => { lastError = error; });
  let session;
  async function request(path, body, method = body === undefined ? "GET" : "POST") {
    const response = await fetch(`http://127.0.0.1:4444${path}`, {
      signal: AbortSignal.timeout(path === "/session" ? 90000 : path === "/status" ? 1500 : 30000),
      method, headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.ok(response.ok && !result.value?.error, JSON.stringify(result));
    return result.value;
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
      async close() { try { await request(path, undefined, "DELETE"); } finally { driver.kill(); } },
    };
  } catch (error) { driver.kill(); throw error; }
}
