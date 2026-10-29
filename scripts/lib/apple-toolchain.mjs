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
