# DeepMovieReview — Cinematic UI Platform 2026

> Status: platform contract
> Date: 2026-09-10
> Purpose: define the production UI, motion and GPU stack before Film 001 is authored.

## 1. Platform decision

DeepMovieReview uses a hybrid presentation stack rather than forcing every surface through one styling or rendering abstraction.

### Core application

- Next.js `16.3.4`
- React / React DOM `19.2.8`
- TypeScript `5.9.x`
- Node.js `22+`

### Styling and layout

- Tailwind CSS `4.3.3` as a zero-runtime utility and token engine;
- `@tailwindcss/postcss` `4.3.3` + PostCSS `8.5.28`;
- authored CSS Modules / scoped CSS for signature cinematic surfaces;
- native modern CSS for cascade layers, container queries, `@property`, `color-mix()`, masks, logical properties, scroll-driven animation and view transitions.

Tailwind does **not** replace the visual system. It accelerates composition. Complex optical scenes remain authored where their structure is clearest.

Tailwind Preflight is intentionally disabled because the application already owns its base/reset and typography contract.

### Motion

- Motion `13.1.1` for DOM animation, gesture orchestration, layout motion and View Transition integration;
- native CSS scroll-driven animation where it is expressive enough;
- native View Transition API / Motion transition helpers before inventing custom route-transition runtimes.

No global scroll hijacking is allowed.

### 3D / GPU

- three.js `0.186.0`;
- React Three Fiber `9.7.0` for React 19;
- Drei `10.7.8` for proven reusable scene helpers;
- `WebGPURenderer` as the preferred high-end renderer;
- WebGL2 backend/fallback through the Three.js WebGPU renderer path;
- TSL/node materials for signature shaders and future post-processing instead of hand-maintaining separate WGSL/GLSL versions where possible.

Alpha/canary versions are not used on the production path merely because they are newer. Stable current releases win unless a measured requirement cannot be met otherwise.

## 2. Rendering tiers

The existing Experience Quality runtime owns the platform tier.

### ULTRA

- WebGPU where available;
- DPR capped around 2 rather than blindly using device DPR;
- signature 3D, node materials and selective high-end lighting/post effects;
- full semantic pointer response;
- render loop only while the surface is visible/needed.

### HIGH

- WebGPU or WebGL2;
- DPR capped below ULTRA;
- reduced expensive effects while preserving depth, material quality and interaction grammar.

### MEDIUM

- WebGPU/WebGL2 only where a surface materially benefits;
- restrained 3D and lower DPR;
- 2.5D/CSS/Motion remains first-class, not a broken fallback.

### LITE

- no mandatory canvas;
- static/cinematic CSS art and DOM motion only where allowed;
- full content, hierarchy and meaning remain present.

Forced colors and reduced motion can independently suppress visual effects regardless of nominal GPU tier.

## 3. GPU component rules

1. GPU scenes are progressive enhancement; semantic content is always DOM-first.
2. A canvas must have a visually intentional fallback, not an empty box or loading spinner.
3. WebGPU initialization failure must not fail the route.
4. Hidden tabs must stop expensive frame loops.
5. DPR is bounded by the quality tier.
6. Frame samples feed the Experience Quality runtime so sustained misses can downgrade quality.
7. Do not create a canvas per ordinary card. Prefer one persistent/featured surface where the experience justifies it.
8. Do not use OrbitControls for decorative production experiences unless direct model inspection is the actual product task.
9. Touch and keyboard cannot depend on hover-only meaning.

## 4. CSS architecture

### Layer A — platform/theme

`src/styles/platform.css`

- Tailwind theme and utility imports;
- no Tailwind Preflight;
- theme bridge into DeepMovieReview tokens;
- typed custom properties;
- reusable modern utility primitives.

### Layer B — global editorial grammar

Existing global styles/tokens/primitives own typography, page rhythm, shell, accessibility and broad editorial composition.

### Layer C — domain surfaces

Film modules own semantic presentation of story, people, relationships, moral events, decisions and synthesis.

### Layer D — signature effects

CSS Modules and TSL own optically complex components such as:

- Verdict Core;
- Living Frame;
- Scene Autopsy;
- Moral Lens;
- future depth/deformation and material studies.

This keeps local effects isolated and prevents a giant global stylesheet from becoming the product architecture.

## 5. Modern CSS features to prefer

When browser support and fallback behavior are appropriate, prefer:

- container queries over viewport-only component breakpoints;
- logical properties over left/right-specific layout rules;
- `color-mix(in oklab, ...)` for derived tonal states;
- registered custom properties via `@property` for compositor-friendly optical values;
- `text-wrap: balance` / `text-wrap: pretty` for editorial typography;
- `@starting-style` for simple enter transitions;
- `animation-timeline: view()` for non-critical scroll-linked reveals;
- masks / gradients for optical depth before adding raster overlays;
- native CSS transforms and individual transform properties for cheap 2.5D motion;
- CSS cascade layers for third-party/runtime isolation.

Every enhancement must degrade to a complete readable static presentation.

## 6. Motion rules

Motion communicates hierarchy or analysis; it is not ambient decoration everywhere.

Target distribution:

- roughly 80% visually calm;
- roughly 15% restrained movement;
- roughly 5% signature WOW moments.

Prefer transform/opacity/filter changes that are measurable and bounded. Avoid continuous blur, giant backdrop-filter regions, layout-thrashing measurements and dozens of independent RAF loops.

## 7. Verdict Core v0

The first production-adjacent GPU proof is the Final Synthesis Verdict Core.

It currently proves:

- R3F on React 19;
- Three.js `WebGPURenderer` async initialization;
- WebGPU/WebGL2 progressive rendering path;
- Motion overlay orchestration;
- Drei scene helper integration;
- tier-aware DPR and shadow budget;
- hidden-document frame-loop stop;
- reduced-motion freeze;
- LITE / forced-colors CSS fallback;
- error-boundary fallback if renderer initialization fails;
- frame sampling back into Experience Quality.

The v0 geometry is deliberately abstract. Film-specific imagery, generated depth assets, TSL material language and final art direction come later and must not require changing the semantic Final Synthesis contract.

## 8. What we deliberately do not adopt

- no all-in-one component kit for the cinematic core;
- no generic dashboard visual language;
- no full-site GSAP dependency when Motion/native APIs cover the required interaction;
- no global smooth-scroll library by default;
- no unstable alpha/canary R3F merely to claim a newer version;
- no WebGPU-only hard requirement;
- no Three.js effect that removes content when GPU support is absent;
- no utility-class-only rule for signature scenes;
- no unbounded high-DPR rendering.

## 9. Acceptance before Film 001

The platform is ready for the first real film only when:

- install, typecheck, lint and production build are green on one exact head;
- Tailwind utilities compile without disturbing existing shell styles;
- the Verdict Core fails safely on LITE / no-GPU / reduced-motion paths;
- Moral Analysis and Final Synthesis render from the reusable film package registry;
- no master moral score is introduced;
- all meaning remains available without canvas;
- performance downgrade remains owned by one Experience Quality runtime.
