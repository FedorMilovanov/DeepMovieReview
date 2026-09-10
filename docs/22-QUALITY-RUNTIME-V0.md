# DeepMovieReview — Experience Quality Runtime v0

> Status: implemented GPU-aware platform foundation  
> Purpose: keep high-end effects adaptive, measurable and fail-soft before Film 001.

## 1. State model

The root client provider exposes:

- graphics backend: `unknown | webgpu | webgl2 | none`;
- quality tier: `ULTRA | HIGH | MEDIUM | LITE`;
- DPR;
- viewport width;
- hardware-concurrency hint;
- reduced-motion preference;
- forced-colors state;
- document visibility;
- downgrade reason;
- `reportFrameSample(frameMs)` for GPU modules, plus renderer backend/failure reporting.

This is presentation/runtime state, not editorial data.

## 2. Initial tier policy

Current conservative policy:

- no usable GPU backend → `LITE`;
- forced colors → `LITE`;
- WebGL2 → `MEDIUM` on appropriate desktop conditions, otherwise `LITE`;
- WebGPU → normally `HIGH`, with `ULTRA` reserved for stronger desktop conditions;
- small/high-DPR mobile WebGPU → `MEDIUM`.

The exact thresholds are provisional and must be calibrated on real devices.

## 3. Reduced motion

Reduced motion remains a separate signal rather than automatically meaning “low-resolution experience.”

It should suppress or simplify:

- camera travel;
- parallax;
- continuous particles;
- large shared-element motion;
- kinetic text;
- unnecessary transition choreography.

High-quality static imagery and typography can remain high quality.

## 4. Runtime downgrade

GPU modules report measured frame time through `reportFrameSample`.

v0 behavior:

- each tier has a provisional frame-time budget;
- isolated slow frames do not trigger downgrade;
- sustained over-budget samples accumulate;
- automatic runtime transition only moves **down** one tier;
- a cooldown prevents repeated rapid downgrades;
- no automatic upgrade occurs during the session.

This avoids visual/performance oscillation.

## 5. Capability changes

Resize, DPR, reduced-motion and forced-colors changes can lower the maximum allowed tier.

They do not automatically raise the tier again.

User-facing/manual quality overrides may be added later as a separate explicit mechanism.

## 6. Visibility

The provider tracks `document.visibilityState` and publishes it as `documentVisible` plus a root data attribute.

Future GPU scenes should treat hidden documents as a hard signal to stop/pause nonessential rendering.

## 7. Root data attributes

The provider publishes:

- `data-graphics-backend`;
- `data-quality-tier`;
- `data-reduced-motion`;
- `data-document-visible`.

CSS and non-React enhancement code may use these as progressive-enhancement hooks.

Do not put analytical meaning behind a quality attribute.

## 8. Dev diagnostics

A development-only diagnostics overlay exposes current backend/tier/DPR/motion/visibility and whether a downgrade occurred.

This is intentionally absent from production.

Visual R&D PRs should include screenshots/measurements identifying which tier/backend was tested.

## 9. Future Living Frame contract

A Living Frame implementation should roughly map:

- `ULTRA` — WebGPU depth/relighting/full material path;
- `HIGH` — WebGPU/WebGL2 reduced sampling/post;
- `MEDIUM` — restrained 2.5D / simplified GPU path;
- `LITE` — premium static image + DOM/CSS motion only.

Every tier must preserve the same editorial content and navigation.

## 10. Non-goals

v0 does not:

- benchmark or rank GPU vendors;
- infer VRAM or device memory from unreliable heuristics;
- guarantee a target FPS from hardware hints alone;
- trap semantic content inside the canvas;
- automatically oscillate quality upward after a downgrade.

Three/R3F and the Verdict Core now exercise the runtime through WebGPU/WebGL2/static fallback paths. Auto/Lite and System/Reduced user controls are implemented separately from automatic degradation. Real-device measurement remains authoritative.
