// Best-effort forensic excerpts from an XCTest result bundle. These facts never
// change the native test verdict and a similar log in another project is not
// proof of the cause of our own cancellation.
import { execFile } from "node:child_process";
import { readdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

export function cancelledTouchWindow(events) {
  if (!Array.isArray(events)) return null;
  const cancelled = events.filter(event => event.kind === "touchcancel" && event.trusted === true &&
    Number.isFinite(event.timestamp) && typeof event.pageId === "string" && Number.isSafeInteger(event.seq))
    .sort((a, b) => a.timestamp - b.timestamp)[0];
  if (!cancelled) return null;
  const trace = events.filter(event => event.pageId === cancelled.pageId && Number.isSafeInteger(event.seq)).sort((a, b) => a.seq - b.seq);
  const previous = trace.filter(event => event.seq < cancelled.seq && ["touchstart", "touchend", "touchcancel"].includes(event.kind)).at(-1);
  if (!previous || previous.kind !== "touchstart" || previous.trusted !== true || !Number.isFinite(previous.timestamp) ||
    previous.timestamp > cancelled.timestamp || cancelled.timestamp - previous.timestamp > 10000) return null;
  return { pageId: cancelled.pageId, started: previous.timestamp, cancelled: cancelled.timestamp,
    start: previous.timestamp - 10000, end: cancelled.timestamp + 10000 };
}

// Accept a small, auditable vocabulary only; never echo arbitrary runner logs.
export function touchLogExcerpt(text) {
  return String(text).split(/\r?\n/).filter(line => /\b(?:backboardd|testmanagerd)\b/i.test(line) &&
    /(?:digitizer|senderID|skipping event|touch down|range.in|canceling paths|playback|service cancel)/i.test(line) &&
    !/(?:https?:\/\/|\btoken\b|GH_TOKEN|authorization:|bearer\s|password|secret)/i.test(line))
    .slice(0, 60).map(line => line.slice(0, 800)).join("\n").slice(0, 16000);
}

function logDate(time) {
  return `${new Date(time).toISOString().slice(0, 19).replace("T", " ")}+0000`;
}

function findDeviceArchives(root, udid) {
  const found = [], pending = [root];
  let visited = 0;
  while (pending.length) {
    const current = pending.pop();
    if (++visited > 20000) throw new Error("Diagnostics directory exceeds traversal budget");
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
      const path = join(current, entry.name);
      if (entry.name.endsWith(".logarchive")) {
        if (entry.name === "system.logarchive" && path.toLowerCase().includes(udid.toLowerCase())) found.push(path);
      } else pending.push(path);
    }
  }
  return found;
}

export async function collectTouchDiagnostics({ bundle, udid, events }, { run = exec } = {}) {
  const window = cancelledTouchWindow(events);
  if (!window) return { status: "no-observed-complete-cancellation-window" };
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(udid)) throw new Error("Invalid Simulator UDID");
  const temporary = mkdtempSync(join(tmpdir(), "dmr-ios-diagnostics-"));
  try {
    const exported = join(temporary, "exported");
    await run("xcrun", ["xcresulttool", "export", "diagnostics", "--path", bundle, "--output-path", exported],
      { timeout: 120000, maxBuffer: 2 * 1024 * 1024 });
    const archives = findDeviceArchives(exported, udid);
    if (archives.length !== 1) return { status: "device-logarchive-unavailable-or-ambiguous", window, archiveCount: archives.length };
    const result = await run("/usr/bin/log", ["show", "--archive", archives[0], "--style", "compact", "--timezone", "UTC",
      "--start", logDate(window.start), "--end", logDate(window.end), "--info", "--debug",
      "--predicate", 'process == "backboardd" OR process == "testmanagerd"'], { timeout: 60000, maxBuffer: 16 * 1024 * 1024 });
    const excerpt = touchLogExcerpt(result.stdout);
    return { status: excerpt ? "excerpt-captured" : "no-matching-log-lines", source: "XCTest result bundle's Simulator system.logarchive",
      window, excerpt, note: "Diagnostic only; neither a log phrase nor its absence establishes the cause or changes the native verdict." };
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}
