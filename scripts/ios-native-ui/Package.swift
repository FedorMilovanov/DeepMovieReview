// swift-tools-version: 5.9
import PackageDescription

// The sole Swift source in this repository is the native XCTest harness, not a
// shipping app. CodeQL's Swift autobuilder skips Xcode test targets; exposing the
// very same source as a dependency-free macOS library lets it build and analyze
// the real file instead of silently ignoring it. This package is never shipped
// or used to run the iOS test; NativeGesture.xcodeproj remains the test runner.
let package = Package(
    name: "NativeGestureSecurityScan",
    platforms: [.macOS(.v13)],
    products: [.library(name: "NativeGestureSecurityScan", targets: ["NativeGestureSecurityScan"])],
    targets: [.target(name: "NativeGestureSecurityScan", path: "Tests")]
)
