// SafariDriver returns a JSON object over loopback. Only retain bounded,
// validated identity fields in the on-disk audit, never arbitrary driver data.
function version(value, field) {
  if (typeof value === "string" && /^[0-9]{1,4}(?:\.[0-9]{1,4}){0,3}$/.test(value)) return value;
  throw new Error(`Invalid SafariDriver ${field}`);
}
function deviceName(value) {
  if (typeof value === "string" && /^[A-Za-z0-9 .()-]{1,80}$/.test(value)) return value;
  throw new Error("Invalid SafariDriver device name");
}
function uuid(value) {
  if (typeof value === "string" && /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/.test(value)) return value;
  throw new Error("Invalid SafariDriver device UDID");
}
function build(value) {
  if (typeof value === "string" && /^[A-Za-z0-9]{1,20}$/.test(value)) return value;
  throw new Error("Invalid SafariDriver platform build");
}

export function safariSessionId(value) {
  if (typeof value === "string" && /^[A-Za-z0-9-]{1,128}$/.test(value)) return value;
  throw new Error("Invalid SafariDriver session ID");
}

export function projectSafariCapabilities(raw) {
  if (raw?.browserName !== "Safari" || raw?.platformName !== "iOS" ||
      raw?.["safari:useSimulator"] !== true || raw?.["safari:deviceType"] !== "iPhone") {
    throw new Error("SafariDriver did not identify an iPhone Simulator session");
  }
  const projected = {
    browserName: "Safari",
    browserVersion: version(raw.browserVersion, "browser version"),
    platformName: "iOS",
    "safari:useSimulator": true,
    "safari:deviceType": "iPhone",
    "safari:deviceName": deviceName(raw["safari:deviceName"]),
    "safari:platformVersion": version(raw["safari:platformVersion"], "platform version"),
    "safari:deviceUDID": uuid(raw["safari:deviceUDID"]),
  };
  if (raw["safari:platformBuildVersion"] !== undefined) projected["safari:platformBuildVersion"] = build(raw["safari:platformBuildVersion"]);
  return projected;
}
