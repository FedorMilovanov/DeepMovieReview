// Own the short-lived preview server for the dedicated rendered-contrast job.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

const base = "http://127.0.0.1:3214";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3214"], { stdio: "inherit" });
let serverError;
server.on("error", error => { serverError = error; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (serverError) throw serverError;
    if (server.exitCode !== null) break;
    try { if ((await fetch(base, { signal: AbortSignal.timeout(2000) })).ok) { ready = true; break; } }
    catch { /* bounded startup wait, not an audit result */ }
    await delay(250);
  }
  assert.ok(ready, "Rendered-contrast preview did not start");
  const audit = spawn(process.execPath, ["scripts/accessibility-audit.mjs"], {
    stdio: "inherit", env: { ...process.env, BASE_URL: base, A11Y_RENDERED_CONTRAST: "true" },
  });
  const [code] = await once(audit, "exit");
  process.exitCode = code === 0 ? 0 : 1;
} finally { server.kill(); }
