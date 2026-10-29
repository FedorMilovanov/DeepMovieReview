// Minimal W3C WebDriver client for Apple's installed Safari, not Playwright WebKit.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

export async function nativeSafari(capabilities = {}) {
  const driver = spawn("/usr/bin/safaridriver", ["-p", "4444"], { stdio: "inherit" });
  let session;
  async function request(path, body, method = body === undefined ? "GET" : "POST") {
    const response = await fetch(`http://127.0.0.1:4444${path}`, {
      signal: AbortSignal.timeout(path === "/session" ? 90000 : 30000),
      method, headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.ok(response.ok && !result.value?.error, JSON.stringify(result));
    return result.value;
  }
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try { await request("/status"); ready = true; break; } catch { await delay(250); }
    }
    assert.ok(ready, "SafariDriver did not start");
    const result = await request("/session", { capabilities: { alwaysMatch: { browserName: "safari", ...capabilities } } });
    session = result.sessionId;
    const path = `/session/${session}`;
    return {
      version: result.capabilities.browserVersion,
      capabilities: result.capabilities,
      async click(selector) {
        const element = await request(`${path}/element`, { using: "css selector", value: selector });
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
