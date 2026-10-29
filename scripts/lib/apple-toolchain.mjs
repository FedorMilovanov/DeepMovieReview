import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Pure selection logic: never change the machine-wide xcode-select setting.
export function newestStableXcode(applications) {
  const releases = applications.filter(name => /^Xcode_\d+(?:\.\d+){0,2}\.app$/.test(name));
  releases.sort((a, b) => b.localeCompare(a, "en", { numeric: true }));
  if (!releases.length) throw new Error("No versioned stable Xcode installation found");
  return releases[0];
}

export function runtimeMatchesSdk(runtime, sdkVersion) {
  const ios = /\.iOS-(\d+)(?:-|$)/.exec(runtime);
  const sdk = /^(\d+)(?:\.|$)/.exec(sdkVersion);
  // Minor OS updates can use the same major SDK; iOS26 cannot use Xcode16's SDK18.
  return Boolean(ios && sdk && Number(ios[1]) <= Number(sdk[1]));
}

// SafariDriver --diagnose writes to files, not its stdout/stderr streams.
export function safariDriverLog(directory, pid) {
  try {
    const entries = readdirSync(directory);
    const files = entries.filter(name => name.startsWith(`safaridriver.${pid}.`) && name.endsWith(".txt")).sort();
    if (!files.length) return `No SafariDriver diagnostic file for pid ${pid}; available file names: ${entries.slice(0, 20).join(", ")}`.slice(-3000);
    return files.slice(-3).map(name => `${name}\n${readFileSync(join(directory, name), "utf8")}`).join("\n").slice(-12000);
  } catch (error) { return `SafariDriver diagnostics unavailable: ${error.message}`; }
}

// Runtime daemon paths also contain CoreSimulator: do not let them displace
// the host GUI/service/driver paths in a bounded diagnostic snapshot.
export function nativeSimulatorProcessLines(text) {
  return text.split("\n").filter(line => /Simulator\.app\/|\/CoreSimulator\.framework\/|\/MobileSafari\.app\/MobileSafari(?:\s|$)|safaridriver/.test(line))
    .join("\n").slice(-12000);
}

// /usr/bin/safaridriver can be a launcher. Trust only observed descendants,
// never an assumed pid+1 or another concurrent driver's diagnostics.
export function safariDriverPids(processes, rootPid) {
  const rows = [...processes.matchAll(/^\s*(\d+)\s+(\d+)\s+(.+)$/gm)]
    .map(([, pid, parent, command]) => ({ pid: Number(pid), parent: Number(parent), command: command.trim() }));
  const descendants = new Set([rootPid]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const row of rows) if (descendants.has(row.parent) && !descendants.has(row.pid)) {
      descendants.add(row.pid); changed = true;
    }
  }
  return [...descendants].filter(pid => pid === rootPid || rows.some(row => row.pid === pid && /(?:^|\/)safaridriver$/.test(row.command)));
}

// Listener ownership and executable identity both matter when launchd reparents
// the driver. A PID from a filename or an unrelated TCP listener is not enough.
export function safariListenerPids(listeners, processes) {
  const pids = [...listeners.matchAll(/^p(\d+)$/gm)].map(([, pid]) => Number(pid));
  return pids.filter(pid => processes.split("\n").some(line => {
    const row = /^\s*(\d+)\s+\d+\s+(.+)$/.exec(line);
    return row && Number(row[1]) === pid && /(?:^|\/)safaridriver$/.test(row[2].trim());
  }));
}
