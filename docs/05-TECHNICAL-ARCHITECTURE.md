# DeepMovieReview — Technical Architecture

> Status: v0.1 recommendation  
> Audited: 2026-09-09  
> Exact dependency versions must be pinned only when implementation starts.

## 1. Architectural goal

Build an editorial website first, with a GPU experience layer — not a game engine pretending to be a website.

The architecture must preserve:

- SEO and server-rendered content;
- fast first meaningful render;
- accessible DOM text;
- deep linking;
- spoiler-aware content loading;
- progressive enhancement;
- strong mobile behavior;
- optional high-end GPU presentation.

## 2. Recommended application stack

Current baseline candidate:

- **Next.js 16.3.x** / App Router;
- **React 19**;
- **TypeScript**;
- server-rendered editorial content;
- modern native CSS plus a disciplined token system;
- **Motion** for DOM/layout/gesture animation;
- **Three.js** for 3D/GPU;
- React Three Fiber where it materially improves scene composition;
- **Three.js WebGPURenderer + TSL** for new signature GPU systems, with WebGL2 fallback;
- GSAP only where timeline/path/infinite-gallery tooling is genuinely superior, not as an automatic dependency for every animation.

Current Next.js 16.3 emphasizes improved memory/build behavior and Instant Navigations. This makes it a plausible foundation for a route-heavy editorial experience.

## 3. DOM vs GPU responsibility

### DOM owns

- headings;
- body text;
- links;
- buttons;
- forms;
- ratings;
- citations;
- SEO content;
- accessibility tree;
- most metadata;
- tables / lists;
- semantic article structure.

### GPU owns

- Moral Core;
- depth relighting;
- distortion / lens;
- Scene Autopsy visual layers;
- selected particles;
- optical transitions;
- interactive spatial graph;
- optional post-processing;
- premium background scenes.

### Rule

If content must be read, copied, searched, indexed, focused or announced by assistive technology, it should not exist only in canvas.

## 4. Persistent scene architecture

A single persistent GPU layer is preferred over many unrelated canvases.

Potential layout:

```text
<AppShell>
  <PersistentGpuStage />
  <RouteContent />
  <GlobalOverlay />
</AppShell>
```

The GPU stage can register scene modules by route/section and render only active layers.

Benefits:

- shared film-card → film-hero transitions;
- reused GPU context/resources;
- fewer context limits;
- better memory control;
- one pointer coordinate system;
- coherent visual grammar.

Do not keep every historical scene resident in VRAM.

## 5. WebGPU strategy

WebGPU remains limited-availability / not Baseline as of September 2026. Therefore:

- detect capabilities;
- use Three.js WebGPURenderer where appropriate because it can use WebGPU and fall back to a WebGL2 backend;
- keep an explicit Lite DOM path;
- test `forceWebGL` / equivalent fallback during development;
- do not build critical information that only appears in WebGPU;
- avoid assuming identical shader/performance behavior across backends.

Three.js itself still describes WebGPURenderer as maturing/experimental in some areas; use focused spikes before committing highly custom effects.

## 6. TSL strategy

Prefer TSL for new custom materials targeting WebGPURenderer because it provides:

- JS/TS-integrated shader logic;
- backend-independent compilation to WebGPU/WebGL targets;
- shared nodes/functions;
- modern render pipeline support;
- MRT/post-processing integration;
- compute support where available.

Avoid creating a large new GLSL-only shader estate unless a specific effect requires it.

## 7. Rendering policy

Do not run a 60/120 fps render loop when nothing changes.

Use:

- demand rendering where possible;
- invalidation on pointer/scroll/transition state change;
- continuous loop only for truly continuous effects;
- paused GPU scenes when offscreen;
- `document.visibilityState` awareness;
- battery-aware restraint where practical.

React Three Fiber documents `frameloop="demand"`, adaptive DPR and performance monitoring patterns; use the same philosophy even if parts of the stage are written without R3F.

## 8. Performance quality tiers

Determine tier from capability + measured runtime, not only user agent.

### ULTRA

- WebGPU;
- high-resolution depth relighting;
- full Moral Core materials;
- richer particles;
- premium post effects;
- higher DPR within cap.

### HIGH

- WebGPU/WebGL2;
- reduced samples/particles;
- moderate DPR;
- selective post-processing.

### MEDIUM

- WebGL2;
- 2.5D depth/parallax;
- simpler Core material;
- little/no expensive post.

### LITE

- static responsive artwork;
- DOM/CSS/Motion transitions;
- no essential loss of content;
- reduced or no canvas.

A quality downgrade must never remove evidence, conclusions or navigation.

## 9. Dynamic quality controller

Potential signals:

- frame-time moving average;
- long tasks / main-thread pressure;
- DPR;
- viewport area;
- GPU backend;
- memory pressure proxies;
- reduced motion;
- battery/data preference where appropriate.

Possible adaptive levers:

- DPR;
- particle count;
- texture resolution;
- post-processing;
- shadow resolution;
- depth-map resolution;
- animation frequency;
- render-loop mode.

Avoid quality oscillation; use hysteresis / debounce.

## 10. Asset pipeline

Per-film media should be generated/processed offline, not synthesized expensively in the browser.

Suggested pipeline:

```text
Master artwork
  → crop variants
  → segmentation masks
  → depth map
  → optional normals/derived maps
  → AVIF/WebP image variants
  → GPU texture variants
  → metadata manifest
```

3D assets:

- glTF/GLB;
- Draco/Meshopt where appropriate;
- KTX2/Basis compressed textures where practical;
- aggressive LOD;
- instance repeated geometry;
- remove unused attributes/materials.

## 11. Initial budgets

Budgets need validation on the first prototype, but define them early.

Suggested launch targets for normal film pages:

- HTML/content should become usable before premium GPU assets finish;
- no multi-megabyte font bundles;
- hero image responsive by viewport;
- defer noncritical scene-autopsy assets;
- avoid shipping all film scenes on initial route;
- one signature 3D object should not silently pull tens of MB;
- mobile route should be materially smaller than desktop Ultra.

A future CI budget file should fail regressions for JS, CSS and asset weight.

## 12. Image loading

Priority order:

1. LCP hero asset;
2. above-fold editorial UI;
3. first analytical scene;
4. upcoming timeline assets;
5. offscreen deep analysis;
6. optional premium 3D/social extras.

Use preloading only for assets highly likely to be needed. Immersive sites often become slower because everything is treated as “hero.”

## 13. View transitions

Use native View Transition API / Motion layout transitions for ordinary shared-element continuity when possible.

GPU transitions are reserved for cases that require:

- distortion;
- film dissection;
- persistent material state;
- depth-aware continuity.

Rule: the selected film media should often be the transition object itself. Avoid adding an unrelated transition effect over it unless conceptually justified.

## 14. Scroll architecture

Use native scrolling as the default physical model.

Prefer:

- CSS scroll-driven animations for simple progress-linked UI;
- IntersectionObserver / viewport logic for activation;
- Motion for UI-level scroll mappings;
- GSAP/ScrollTrigger for special cinematic timelines where needed;
- camera-path scroll only in bounded featured experiences.

Do not hijack wheel/touch globally without a compelling reason.

## 15. Scene Autopsy implementation sketch

Potential inputs:

- master image;
- depth map;
- segmentation masks;
- annotated evidence anchors;
- analytical state JSON.

Potential GPU behavior:

- displaced subdivided plane or layered planes;
- local pointer light;
- mask-driven separation;
- fog/desaturation;
- annotation anchor projection back into DOM coordinates.

Keep labels in DOM; GPU returns anchor positions / state.

## 16. Moral Core implementation sketch

Separate:

- semantic input vector;
- geometry-generation rules;
- material rules;
- animation rules;
- presentation presets.

Example:

```text
CoreSemanticVector
  moralAmbiguity
  romanticization
  consequenceDensity
  culpabilityDensity
  repentance
  redemptiveMovement
  narrativeContradiction
  confidence
```

The same semantic vector must render consistently enough for film-to-film comparison.

Do not hand-art-direct each Core so much that comparison becomes meaningless.

## 17. Data / CMS architecture

Do not choose a CMS until structured-domain requirements are proven.

Needs:

- versioned editorial content;
- relational scenes/events/claims;
- asset metadata;
- moderation later;
- draft/review/publish workflow;
- stable IDs;
- audit log;
- migrations.

A conventional relational database (e.g. PostgreSQL) is likely a better core than a document-only CMS because the product depends on relationships and comparison. A CMS can sit on top of that model.

## 18. IDs and URLs

Use stable UUID/ULID-style identifiers internally and human slugs externally.

Examples:

```text
/films/the-godfather
/films/the-godfather/scenes/restaurant-killing
/dilemmas/lying-to-protect-an-innocent
/themes/revenge
/principles/truthfulness
```

Do not encode mutable titles as database identity.

## 19. Versioning and auditability

Append-only event history for mutable analytical/community actions is strongly recommended.

Examples:

- editorial score revised;
- moral event classification changed;
- user rating updated;
- question options revised;
- moderation action;
- aggregate recomputed.

Keep current projections for fast reads, history for audit.

## 20. Accessibility baseline

Target WCAG 2.2 AA for the product, even if some AAA motion guidance is voluntarily adopted.

Required practices:

- reduced-motion mode;
- keyboard navigation;
- visible focus;
- non-drag equivalent for drag controls;
- minimum target sizing;
- pause/stop for long-running nonessential motion where applicable;
- no harmful flashing;
- accessible names matching visible labels;
- semantic headings and landmarks;
- captions/transcripts for owned audio/video where required;
- readable contrast in dark UI.

## 21. Reduced-motion behavior

When `prefers-reduced-motion` is active:

- disable large parallax;
- disable auto-playing decorative video where appropriate;
- replace layout transforms with opacity/simple state transitions;
- remove camera travel;
- keep educational state changes understandable;
- keep all analytical content accessible.

Motion supports site-wide reduced-motion configuration and hooks; use them centrally.

## 22. Input model

Every important interaction supports:

- mouse;
- touch;
- keyboard;
- screen-reader meaningful equivalent.

Pointer-specific flourish is enhancement, never the only path.

## 23. SEO and structured data

Because content is editorial and film-based, plan for:

- canonical URLs;
- Open Graph / social metadata;
- Movie structured data where appropriate;
- Article/Review structured data where valid;
- breadcrumb structured data;
- sitemap partitioning as corpus grows;
- spoiler-safe metadata snippets;
- server-rendered critical content.

Do not misrepresent a proprietary moral score as an established external certification in structured data.

## 24. Observability

Instrument from first production prototype:

- LCP;
- INP;
- CLS;
- JS errors;
- WebGPU/WebGL initialization failures;
- GPU quality tier;
- device/backend breakdown;
- route transition failures;
- asset fetch errors;
- reduced-motion usage;
- abandonment around immersive sections.

Measure whether signature interactions help engagement instead of assuming they do.

## 25. Security / abuse foundations

Before community launch:

- verified authentication;
- rate limiting;
- CSRF protection where relevant;
- server-side authorization;
- audit logs;
- moderation roles;
- upload sanitization;
- content-length limits;
- anti-spam controls;
- anomaly detection hooks.

Never trust client-side score calculations as authoritative.

## 26. Testing matrix

At minimum:

- current Chromium desktop;
- Firefox desktop;
- Safari desktop;
- iOS Safari;
- Android Chrome on mid/low hardware;
- WebGPU enabled path;
- forced WebGL2 fallback;
- Lite/no-canvas path;
- reduced motion;
- keyboard-only;
- high zoom;
- slow network;
- route deep links;
- stale/missing optional assets.

## 27. Prototype order

Before building the full site, create bounded spikes for:

1. persistent GPU stage;
2. depth-relit image;
3. Moral Lens;
4. Scene Autopsy;
5. deterministic Moral Core;
6. film-card → film-hero transition;
7. Decision Chamber with Knowledge Fog;
8. quality-tier downgrade.

Only effects that survive performance, accessibility and semantic review graduate into the design system.