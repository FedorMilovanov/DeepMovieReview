/** Extract only bounded error lines from the prior iOS evidence publication step. */
export function iosTransportErrorExcerpt(log) {
  const marker = "\tPublish native iOS Safari evidence\t";
  const lines = String(log).split(/\r?\n/).filter(line => line.includes(marker)).map(line =>
    line.slice(line.indexOf(marker) + marker.length).replace(/^\S+\s+/, ""));
  return lines.filter(line => /(?:AssertionError|\bError:|Evidence exceeds|Checks API|Process completed with exit code)/i.test(line))
    .filter(line => !/(?:GH_TOKEN|authorization:|bearer\s)/i.test(line))
    .slice(0, 12).join("\n").slice(0, 3200);
}
