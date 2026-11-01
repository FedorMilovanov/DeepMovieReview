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
    }

    @MainActor
    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
