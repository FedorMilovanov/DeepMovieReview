import CoreGraphics
import Foundation
import XCTest

private final class BarrierStatus: @unchecked Sendable {
    private let lock = NSLock()
    private var value = 0
    func set(_ code: Int) { lock.lock(); value = code; lock.unlock() }
    func get() -> Int { lock.lock(); defer { lock.unlock() }; return value }
}

// Safari is opened on the home page by simctl before the test. This UI-test
// runner has no test host and drives the real MobileSafari app, not a WebView
// fixture or the isolated SafariDriver automation window. The independent,
// passive page probe must still prove every touch and resulting UI state.
final class NativeGestureTests: XCTestCase {
    @MainActor
    func testNativeScrollAndRail() {
        continueAfterFailure = false
        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        safari.activate()
        XCTAssertTrue(safari.wait(for: .runningForeground, timeout: 45), "Mobile Safari did not come to the foreground")
        // One native open and close on each distinct page. The Node harness
        // navigates to the next route only after the passive observer validates
        // the previous page's ordered trusted touchstart/end/click and real
        // expanded/navigation state. No gesture is replayed or synthesized.
        verifyMenu(in: safari, screenshot: "DMR-menu-home-open")
        waitForPageMarker("Индекс предпросмотра", in: safari, name: "films index")
        verifyMenu(in: safari, screenshot: "DMR-menu-films-open")
        let articleRail = safari.buttons.matching(identifier: "Оглавление статьи").firstMatch
        XCTAssertTrue(articleRail.waitForExistence(timeout: 90), "The FULL article did not arrive for its menu test")
        verifyMenu(in: safari, screenshot: "DMR-menu-article-open")
        waitForPageMarker("поиск режиссёра и город", in: safari, name: "making article")
        verifyMenu(in: safari, screenshot: "DMR-menu-making-open")

        // Safari can briefly expose the earlier article's AX tree while the
        // new document is loading. Wait for the passive observer to see the
        // distinct FULL document after the fourth close before issuing input.
        waitForBarrier("gesture")
        let rail = safari.buttons.matching(identifier: "Оглавление статьи").firstMatch
        XCTAssertTrue(rail.waitForExistence(timeout: 90), "The fresh article's reading rail is not in Mobile Safari's accessibility tree")
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
        // The visible reading rail uniquely distinguishes the article from the
        // scene page. On e07dd23 the observer saw the returned FULL article but
        // XCTest did not find a different, FULL-only link; do not assume that
        // unrelated link is exposed in Mobile Safari's accessibility tree.
        waitForBarrier("spoiler")
        let returnedRail = safari.buttons.matching(identifier: "Оглавление статьи").firstMatch
        XCTAssertTrue(returnedRail.waitForExistence(timeout: 90), "The article's reading rail did not return after the scene")
        // The label is visually uppercased by CSS. Match its accessible text
        // without assuming casing; still require a real link in Safari's AX tree.
        let noSpoilers = safari.links.matching(NSPredicate(format: "label CONTAINS[cd] %@", "Без спойлеров")).firstMatch
        if !noSpoilers.waitForExistence(timeout: 20) {
            // Keep a bounded hierarchy for diagnosing role/name mismatches.
            print("DMR Safari AX hierarchy: \(String(safari.debugDescription.prefix(16000)))")
            XCTFail("The NONE spoiler option is absent from Mobile Safari's accessibility tree")
            return
        }
        Thread.sleep(forTimeInterval: 2)
        capture("DMR-spoiler-before-full")
        tapVisibleCenter(noSpoilers, in: safari, name: "NONE spoiler option")
        // A screenshot after input is diagnostic, not a projection assertion.
        // The independent observer strictly requires the new NONE document,
        // its exact SSR sections and the trusted uninterrupted touch + click.
        Thread.sleep(forTimeInterval: 5)
        capture("DMR-spoiler-after-input")
    }

    @MainActor
    private func waitForBarrier(_ stage: String) {
        guard let address = ProcessInfo.processInfo.environment["DMR_BARRIER_URL"],
              var components = URLComponents(string: address) else {
            XCTFail("Native readiness barrier URL was not supplied to the test runner")
            return
        }
        components.queryItems = (components.queryItems ?? []) + [URLQueryItem(name: "stage", value: stage)]
        guard let url = components.url else { XCTFail("Invalid native readiness barrier URL"); return }
        let deadline = Date().addingTimeInterval(100)
        while Date() < deadline {
            let response = BarrierStatus()
            let done = DispatchSemaphore(value: 0)
            var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 5)
            request.httpMethod = "GET"
            let task = URLSession.shared.dataTask(with: request) { _, result, _ in
                response.set((result as? HTTPURLResponse)?.statusCode ?? 0)
                done.signal()
            }
            task.resume()
            if done.wait(timeout: .now() + 6) == .timedOut { task.cancel() }
            let status = response.get()
            if status == 200 { return }
            if status >= 400 { XCTFail("Native readiness barrier rejected \(stage): HTTP \(status)"); return }
            Thread.sleep(forTimeInterval: 0.25)
        }
        XCTFail("Timed out waiting for the distinct \(stage) article document")
    }

    @MainActor
    private func waitForPageMarker(_ text: String, in app: XCUIApplication, name: String) {
        // The visible, route-specific text is not an instruction to click it.
        // The independent observer also verifies the exact URL and a new page.
        let marker = app.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS[cd] %@", text)).firstMatch
        XCTAssertTrue(marker.waitForExistence(timeout: 90), "The \(name) page did not arrive in Safari's accessibility tree")
    }

    @MainActor
    private func verifyMenu(in app: XCUIApplication, screenshot: String) {
        let closed = app.buttons.matching(NSPredicate(format: "label ==[cd] %@", "Меню")).firstMatch
        XCTAssertTrue(closed.waitForExistence(timeout: 60), "The hydrated menu button is absent")
        // Let the passive observer record the ready state before the one tap.
        Thread.sleep(forTimeInterval: 2)
        tapVisibleCenter(closed, in: app, name: "Open menu")
        let opened = app.buttons.matching(NSPredicate(format: "label ==[cd] %@", "Закрыть")).firstMatch
        XCTAssertTrue(opened.waitForExistence(timeout: 20), "The menu button did not expose its open state")
        capture(screenshot)
        tapVisibleCenter(opened, in: app, name: "Close menu")
        XCTAssertTrue(closed.waitForExistence(timeout: 20), "The menu did not return to the closed state")
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
