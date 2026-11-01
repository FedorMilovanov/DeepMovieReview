import CoreGraphics
import Foundation
import XCTest

// Safari is opened on the article by simctl before the test. This UI-test
// runner has no test host and drives the real MobileSafari app, not a WebView
// fixture or the isolated SafariDriver automation window. The independent,
// passive page probe must still prove trusted touch + scroll + rail activation.
final class NativeGestureTests: XCTestCase {
    @MainActor
    func testNativeScrollAndRail() {
        continueAfterFailure = false
        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        safari.activate()
        XCTAssertTrue(safari.wait(for: .runningForeground, timeout: 45), "Mobile Safari did not come to the foreground")
        let rail = safari.buttons.matching(identifier: "Оглавление статьи").firstMatch
        XCTAssertTrue(rail.waitForExistence(timeout: 60), "The article's reading rail is not in Mobile Safari's accessibility tree")
        XCTAssertTrue(rail.isHittable, "The reading rail is not visible before the native drag")
        capture("DMR-before-native-scroll")

        // Use the middle of the actual application surface, away from the OS
        // edges and the fixed rail. No JS scrolling or synthetic DOM event is
        // used. A completed XCUITest command alone never satisfies the gate.
        let start = safari.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.74))
        let end = safari.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.38))
        start.press(forDuration: 0.08, thenDragTo: end)
        // Allow momentum and Safari's browser chrome to settle. The Node side
        // independently requires a measured scroll and never retries the drag.
        Thread.sleep(forTimeInterval: 1)
        capture("DMR-after-native-scroll")
        XCTAssertTrue(rail.isHittable, "The reading rail is not visible after the native drag")
        rail.tap()
        Thread.sleep(forTimeInterval: 1)
        capture("DMR-after-native-rail-tap")

        // The harness then opens the safe scene URL in the same normal Safari.
        // It only navigates: all interactions below are native XCUITest input,
        // and the independent page observer must see the trusted events/state.
        let description = "Опоры сцены «День 10 909»"
        let predicate = NSPredicate(format: "label CONTAINS %@", description)
        let button = safari.buttons.matching(predicate).firstMatch
        let other = safari.descendants(matching: .any).matching(predicate).firstMatch
        let foundButton = button.waitForExistence(timeout: 65)
        let support = foundButton ? button : other
        XCTAssertTrue(foundButton || other.waitForExistence(timeout: 10), "Scene disclosure is absent from Safari's accessibility tree")
        // Hash scrolling and Safari chrome can still be settling when the AX
        // node appears. XCTest's isHittable/activation-point resolver reported
        // an invalid point on 683fc54 even though the independent observer and
        // screenshot showed the control in the viewport. Use an explicit native
        // coordinate based on the AX frame, not a DOM click or synthetic event.
        // The independent observer still requires a real touch on this exact
        // visible control and verifies its open state; this is not an iOS
        // VoiceOver test and does not diagnose XCTest's AX resolver failure.
        Thread.sleep(forTimeInterval: 3)
        capture("DMR-scene-before-support")
        tapVisibleCenter(support, in: safari, name: "Scene disclosure")
        // The same evidence name also appears farther down the register. Match
        // the scene-scoped accessible name, not the first similarly named link.
        let linkName = "«День 10 909» — опора сцены «День 10 909»"
        let link = safari.links.matching(NSPredicate(format: "label CONTAINS %@", linkName)).firstMatch
        XCTAssertTrue(link.waitForExistence(timeout: 20), "Opening the scene disclosure did not expose its evidence link")
        Thread.sleep(forTimeInterval: 1)
        capture("DMR-scene-support-open")
        tapVisibleCenter(link, in: safari, name: "Scene evidence link")
        Thread.sleep(forTimeInterval: 2)
        capture("DMR-scene-evidence")

        // The harness returns to a fresh FULL article after the evidence
        // screenshot. Its only automatic action is navigation to FULL: this
        // test performs the one native NONE tap, and the passive observer must
        // independently see touchstart/end, a trusted click and the exact NONE
        // server projection. XCTest success or the screenshot is not enough.
        let fullMarker = safari.links.matching(NSPredicate(format: "label CONTAINS %@", "Редакционная оценка")).firstMatch
        XCTAssertTrue(fullMarker.waitForExistence(timeout: 90), "The fresh FULL article did not appear after the scene")
        let noSpoilers = safari.links.matching(NSPredicate(format: "label CONTAINS %@", "Без спойлеров")).firstMatch
        XCTAssertTrue(noSpoilers.waitForExistence(timeout: 20), "The NONE spoiler option is absent from Mobile Safari's accessibility tree")
        Thread.sleep(forTimeInterval: 2)
        capture("DMR-spoiler-before-full")
        tapVisibleCenter(noSpoilers, in: safari, name: "NONE spoiler option")
        let disappeared = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: fullMarker)
        XCTAssertEqual(XCTWaiter.wait(for: [disappeared], timeout: 60), .completed,
                       "The FULL-only article link remained after the native NONE tap")
        Thread.sleep(forTimeInterval: 1)
        capture("DMR-spoiler-after-none")
    }

    @MainActor
    private func tapVisibleCenter(_ element: XCUIElement, in app: XCUIApplication, name: String) {
        let frame = element.frame
        let center = CGPoint(x: frame.midX, y: frame.midY)
        let appFrame = app.frame
        print("DMR native coordinate: \(name), frame=\(frame), app=\(appFrame)")
        XCTAssertGreaterThan(frame.width, 0, "\(name) must have a nonempty native accessibility frame")
        XCTAssertGreaterThan(frame.height, 0, "\(name) must have a nonempty native accessibility frame")
        XCTAssertTrue(appFrame.contains(center), "\(name) accessibility frame must intersect the native screen: \(frame)")
        // A brief native press is a single tap. On 5dc7fd7 XCTest's coordinate
        // tap produced a trusted touchstart followed by touchcancel; no click or
        // disclosure opening was observed. The oracle requires touchend and a
        // trusted click, so another cancelled gesture cannot count as success.
        element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).press(forDuration: 0.08)
    }

    @MainActor
    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
