/** Extract only bounded error lines from the prior iOS evidence publication step. */
export function iosTransportErrorExcerpt(log) {
  const marker = "\tPublish native iOS Safari evidence\t";
  const lines = String(log).split(/\r?\n/).filter(line => line.includes(marker)).map(line =>
    line.slice(line.indexOf(marker) + marker.length).replace(/^\S+\s+/, ""));
  return lines.filter(line => /(?:AssertionError|\bError:|Evidence exceeds|Checks API|Process completed with exit code)/i.test(line))
    .filter(line => !/(?:GH_TOKEN|authorization:|bearer\s)/i.test(line))
    .slice(0, 12).join("\n").slice(0, 3200);
}

/** Do not relay arbitrary logs: retain only the job step and known bounded errors. */
export function appShellFailureExcerpt(log) {
  const result = [];
  for (const line of String(log).split(/\r?\n/)) {
    const columns = line.split("\t");
    if (columns.length < 3 || columns[0] !== "app-shell") continue;
    const step = columns[1].replace(/[^\w .()-]/g, "").slice(0, 120);
    const text = columns.slice(2).join("\t");
    if (step === "Recover previous successful accessibility evidence" && text.includes("No previous successful CI run to recover")) {
      result.push(`${step}: No previous successful CI run to recover`);
    }
    const exit = text.match(/##\[error\]Process completed with exit code \d+\./);
    if (exit) result.push(`${step}: ${exit[0]}`);
  }
  return result.slice(0, 8).join("\n").slice(0, 1800);
}
