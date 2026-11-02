// A narrow, evidence-preserving eligibility check for ONE fresh Simulator run.
// A correlated OS signature is not proof of cause or a pass for the failed run.
import { nativeMenuRoutes, nativeMenuStages, validateNativeMenuTrace } from "./ios-gesture-probe.mjs";
import { nativeMenuBarrierReady } from "./ios-xctest-gesture.mjs";

export function retryableSimulatorCancellation(report) {
  try {
    const build = report.xcodebuild, summary = report.xctestSummary, diagnostic = report.systemTouchDiagnostics;
    if (build?.code !== 65 || build.timedOut !== false || build.signal !== null ||
      summary?.result !== "Failed" || summary.totalTestCount !== 1 || summary.failedTests !== 1 ||
      summary.passedTests !== 0 || summary.skippedTests !== 0 || summary.expectedFailures !== 0 ||
      summary.testFailures?.length !== 1 ||
      summary.testFailures[0].failureText !== "XCTAssertTrue failed - The menu button did not expose its open state" ||
      summary.testFailures[0].testName !== "testNativeScrollAndRail()" ||
      summary.devicesAndConfigurations?.length !== 1 ||
      summary.devicesAndConfigurations[0]?.device?.deviceId !== report.device?.udid ||
      summary.devicesAndConfigurations[0]?.device?.platform !== "iOS Simulator" || report.device?.physicalDevice !== false ||
      !Array.isArray(report.failures) || report.failures.length !== 1 ||
      !/XCUITest failed or timed out/.test(report.failures[0]) ||
      !Array.isArray(report.events) || !Array.isArray(report.observerErrors) || report.observerErrors.length !== 0 ||
      diagnostic?.status !== "excerpt-captured" || diagnostic.source !== "XCTest result bundle's Simulator system.logarchive") return null;
    const probeUrl = new URL(report.probe.url);
    if (probeUrl.protocol !== "http:" || probeUrl.hostname !== "127.0.0.1" || probeUrl.pathname !== "/" || probeUrl.search || probeUrl.hash) return null;
    const origin = probeUrl.origin;
    const { pageId, started, cancelled } = diagnostic.window;
    const trace = report.events.filter(event => event.pageId === pageId).sort((a, b) => a.seq - b.seq);
    if (!pageId || !Number.isFinite(started) || !Number.isFinite(cancelled) || started > cancelled || cancelled - started > 1000 ||
      trace.some(event => !Number.isSafeInteger(event.seq)) || new Set(trace.map(event => event.seq)).size !== trace.length) return null;
    const ready = trace.find(event => event.kind === "menu-ready");
    const index = nativeMenuRoutes.findIndex(route => ready?.url === new URL(route, origin).href);
    if (index < 0) return null;
    const completedMenus = [];
    for (const route of nativeMenuRoutes.slice(0, index)) {
      const previous = validateNativeMenuTrace(report.events, origin, route,
        { afterTimestamp: completedMenus.at(-1)?.closed.timestamp ?? -Infinity });
      if (completedMenus.some(menu => menu.pageId === previous.pageId)) return null;
      completedMenus.push(previous);
    }
    if (!nativeMenuBarrierReady({ stage: nativeMenuStages[index], events: [ready], baseUrl: origin, completedMenus })) return null;
    const input = trace.filter(event => ["touchstart", "touchmove", "touchend", "touchcancel", "menu-click"].includes(event.kind));
    if (input.length !== 2) return null;
    const [start, cancel] = input;
    if (start.kind !== "touchstart" || cancel.kind !== "touchcancel" || start.trusted !== true || cancel.trusted !== true ||
      start.targetMenu !== true || cancel.targetMenu !== true || start.seq <= ready.seq || cancel.seq <= start.seq ||
      start.timestamp !== started || cancel.timestamp !== cancelled || ready.timestamp > started ||
      start.menu?.expanded !== "false" || start.menu.navVisible !== false || start.menu.navInert !== true ||
      start.menu.hitContained !== true || !Number.isFinite(start.x) || !Number.isFinite(start.y) ||
      start.x < start.menu.rect?.left || start.x > start.menu.rect?.right || start.y < start.menu.rect?.top || start.y > start.menu.rect?.bottom ||
      !nativeMenuBarrierReady({ stage: nativeMenuStages[index],
        events: [{ ...start, kind: "menu-ready" }], baseUrl: origin, completedMenus }) ||
      trace.some(event => event.kind === "menu-state" && event.menu?.expanded === "true")) return null;
    // The logs and browser timestamps are not guaranteed to align exactly. A
    // short window and the same virtual sender constrain the correlation; they
    // still cannot prove that the system caused this particular cancellation.
    const lines = String(diagnostic.excerpt).split("\n").filter(line => {
      const match = /^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d\.\d+)/.exec(line);
      const timestamp = match && Date.parse(`${match[1]}T${match[2]}Z`);
      return Number.isFinite(timestamp) && timestamp >= started - 2000 && timestamp <= cancelled + 2000 && /\bbackboardd\b/i.test(line);
    });
    const attached = lines.map(line => /digitizer attached \(sender ([0-9a-f]+)\).*transport:Recap/i.exec(line)?.[1]).filter(Boolean);
    const disappeared = attached.some(sender => lines.some(line => line.toLowerCase().includes(`senderid: 0x${sender.toLowerCase()}`) &&
      /cancel -- digitizer did disappear/i.test(line) && /contacts:.*touching/i.test(line) && /com\.apple\.mobilesafari/i.test(line)));
    if (!disappeared || !lines.some(line => /already have a main display digitizer/i.test(line)) ||
      !lines.some(line => /didn't see a previous touch down or range-in event.*skipping event/i.test(line))) return null;
    return { route: nativeMenuRoutes[index], pageId, started, cancelled,
      reason: "Menu-targeted touch cancellation correlated with duplicate Recap digitizer and dropped events; cause not proven",
      policy: "One complete, independent retry on a fresh Simulator; the original attempt remains failed and preserved" };
  } catch { return null; }
}
