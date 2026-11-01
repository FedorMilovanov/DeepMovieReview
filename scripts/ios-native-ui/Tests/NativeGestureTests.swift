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
        XCTAssertTrue(support.isHittable, "Scene disclosure is not visible without horizontal scrolling")
        capture("DMR-scene-before-support")
        support.tap()
        // The same evidence name also appears farther down the register. Match
        // the scene-scoped accessible name, not the first similarly named link.
        let linkName = "«День 10 909» — опора сцены «День 10 909»"
        let link = safari.links.matching(NSPredicate(format: "label CONTAINS %@", linkName)).firstMatch
        XCTAssertTrue(link.waitForExistence(timeout: 20), "Opening the scene disclosure did not expose its evidence link")
        XCTAssertTrue(link.isHittable, "Evidence link is not visible after opening the disclosure: \(link.label), \(link.frame)")
        capture("DMR-scene-support-open")
        link.tap()
        Thread.sleep(forTimeInterval: 2)
        capture("DMR-scene-evidence")
    }

    @MainActor
    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
