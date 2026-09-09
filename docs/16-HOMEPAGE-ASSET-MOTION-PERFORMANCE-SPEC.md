# DeepMovieReview — Homepage Asset, Motion & Performance Spec

> Status: v0.1 production-prep specification  
> Date: 2026-09-09  
> Scope: media generation, depth/mask pipeline, motion ownership, quality tiers, responsive behavior, performance and test criteria for Homepage Launch Cut v1.

---

## 1. Principle

The homepage may look expensive, but it must not be expensive everywhere at once.

The visual system should be designed around:

- a **small set of excellent source artworks**;
- multiple derived assets per source;
- semantic reuse across sections;
- bounded GPU moments;
- progressive enhancement;
- strong mobile-specific composition;
- measurable budgets.

Do not solve every section by generating another 8K image and another canvas.

---

## 2. Asset families for launch

A one-film homepage should ideally ship from approximately **5–7 master visual concepts**, not 20 unrelated artworks.

Recommended master families:

1. `HERO_MASTER` — primary Living Frame.
2. `RELATIONSHIP_MASTER` — two-person relationship composition.
3. `FAMILY_YOUTH_MASTER` — family/peer/authority composition if applicable.
4. `CRAFT_SCENE_MASTER` — scene used for Form Shapes Sympathy.
5. `AUTOPSY_SCENE_MASTER` — scene with clear depth/evidence anchors.
6. `DECISION_MASTER` — difficult-decision composition.
7. `DISCOVERY_MASTER` — optional alternate artwork/card system.

A single master may serve multiple roles when composition supports it.

---

## 3. AI/editorial artwork brief template

Every generated/editorial master should have a stored brief.

```text
ASSET ROLE:
FILM:
SCENE / CONCEPT:
EMOTIONAL PURPOSE:
SUBJECTS:
FOREGROUND:
MIDGROUND:
BACKGROUND:
PRIMARY LIGHT:
NEGATIVE SPACE:
CAMERA / LENS FEEL:
COLOR TEMPERATURE:
TEXT-SAFE REGION:
DEPTH REQUIREMENTS:
MOBILE RECOMPOSITION NOTES:
DO-NOT-INCLUDE:
PROVENANCE / MODEL / PROMPT VERSION:
ART-DIRECTION REVIEW STATE:
```

Generated imagery must be art-directed for interaction, not merely for standalone beauty.

---

## 4. Hero Master specification

### Composition

- cinematic, usually landscape/wide;
- clear subject silhouette;
- at least three separable depth zones;
- avoid dense detail along all four edges;
- preserve optional negative space;
- visual center should survive a 2.39:1 crop;
- mobile alternate may be separately generated/recomposed rather than crop-only.

### Derived files

- original archival master;
- desktop 2560-ish responsive candidate;
- desktop 1920-ish;
- tablet;
- mobile portrait/4:5 or tall alternate;
- low-quality placeholder;
- depth map;
- subject mask;
- foreground mask if useful;
- optional rough normal/derived map only if testing proves visual value.

Exact dimensions should be determined by image pipeline and DPR strategy; avoid blindly serving 2x desktop resolution to all devices.

---

## 5. Depth map requirements

Depth maps are production metadata, not disposable experiment files.

Store:

- source asset ID;
- generation method/model/version;
- dimensions;
- near/far convention;
- cleanup status;
- known artifacts;
- manual correction state.

Quality check:

- hair/limbs should not create catastrophic halos;
- foreground edges should not tear under intended displacement;
- background depth should remain smooth enough for micro-camera movement;
- faces must not distort under normal pointer range.

If depth quality is weak, prefer segmented 2.5D planes over aggressive mesh displacement.

---

## 6. Segmentation mask requirements

Masks are useful for:

- subject isolation;
- foreground occlusion;
- selective relighting;
- Scene Autopsy separation;
- controlled focus/depth effects;
- responsive recomposition.

Do not require masks for every image.

For launch, prioritize masks on:

- Hero;
- Relationship Master if people overlap;
- Autopsy Master;
- Decision Master if fog/depth separation depends on them.

---

## 7. Scene anchor coordinate system

Evidence anchors should use normalized master-image coordinates:

```text
x: 0..1

y: 0..1
```

Crop transforms must be stored/calculable so annotations stay attached under responsive crops.

Anchor rendering should support:

- preferred side;
- collision fallback;
- hidden/inline mode on small screens;
- semantic label;
- evidence ID.

Use modern CSS anchor-positioning capabilities where reliable, but maintain a fallback because some anchor-positioning subfeatures remain uneven across browsers.

---

## 8. Motion ownership matrix

Avoid multiple systems controlling the same transform.

| Motion class | Preferred owner |
| --- | --- |
| simple opacity/translate UI | CSS / Motion |
| component layout morph | Motion layout |
| route/shared-media transition | native View Transition / Motion wrapper where appropriate |
| basic scroll progress | CSS scroll-driven animation where support/behavior is sufficient |
| bounded authored timeline | Motion or GSAP only if sequencing requires it |
| GPU depth/light/refraction | Three.js / TSL |
| spatial Scene Autopsy | Three.js + DOM annotations |
| relationship trace lines | SVG/DOM first, GPU only if proven useful |
| Narrative Permission field | DOM/SVG first; GPU enhancement optional |
| Knowledge Fog | CSS/DOM + GPU depth/fog enhancement |

### Rule

A DOM element should not have its `transform` simultaneously owned by CSS scroll animation, Motion layout and GSAP.

---

## 9. Persistent GPU stage

Preferred architecture:

```text
<AppShell>
  <PersistentGpuStage />
  <HomepageDOM />
  <GlobalInteractionLayer />
</AppShell>
```

The stage hosts bounded scene modules:

- LivingFrameScene;
- SixLensSceneEnhancement;
- RelationshipSceneEnhancement if needed;
- CraftSceneEnhancement;
- SceneAutopsyScene;
- KnowledgeFogScene.

Scene modules register/unregister resources and active state.

Do not keep all full-resolution textures resident simultaneously.

---

## 10. Render-loop policy

Default: **demand rendering**.

Continuous rendering allowed only during:

- active pointer relighting that materially changes every frame;
- short transition windows;
- Scene Autopsy separation/reassembly;
- active Knowledge Fog animation;
- bounded procedural effect that cannot be represented event-driven.

When interaction stops:

- settle animation;
- render final frame;
- return to demand mode.

React Three Fiber's `frameloop="demand"` / invalidation philosophy is the reference behavior even if the final persistent stage is partly custom.

---

## 11. Quality tiers

### ULTRA

Eligibility:

- capable WebGPU path;
- healthy measured frame time;
- desktop/high-end mobile where thermals allow;
- user has not requested reduced motion/data restraint.

Features:

- depth mesh or high-quality layered displacement;
- pointer relighting;
- selective postprocessing;
- richer fog/optical response;
- high-quality Scene Autopsy separation;
- capped but higher DPR.

### HIGH

- WebGPU or WebGL2 backend;
- depth/layered parallax;
- simpler relighting;
- reduced postprocessing;
- moderate DPR.

### MEDIUM

- WebGL2;
- segmented-plane or low-cost depth parallax;
- no expensive post stack;
- simplified fog;
- Scene Autopsy still spatial but less layered.

### LITE

- no required canvas;
- static images;
- semantic DOM annotations;
- CSS/Motion transitions;
- Relationship Trace as SVG/DOM;
- Narrative Permission as DOM field/list;
- Decision knowledge states as explicit panels.

Lite is a deliberate design, not an error screen.

---

## 12. Reduced-motion behavior

`prefers-reduced-motion` should alter choreography, not merely shorten durations.

Remove/reduce:

- large camera travel;
- depth-plane separation;
- continuous pointer-following parallax;
- smooth inertial page motion;
- particle dispersal;
- fog drifting.

Keep:

- state changes;
- evidence reveal;
- focused highlighting;
- annotations;
- all analytical content.

Transition alternatives:

- instant switch;
- low-distance fade;
- short opacity/color state change.

---

## 13. Stage-specific asset/motion plan

### Stage 01 — Living Frame

Assets:

- Hero Master desktop/mobile;
- depth;
- subject/foreground mask optional.

GPU:

- active.

Render policy:

- continuous only while frame is emerging or pointer is actively moving;
- demand when settled.

### Stage 02 — Six Lenses

Assets:

- reuse Hero Master;
- annotation data only.

GPU:

- reuse hero texture/depth;
- lens state may change focus/light/depth emphasis.

Avoid loading six separate images.

### Stage 03 — Story

Assets:

- no new heavy GPU asset required;
- optional tiny beat thumbnails later.

Motion:

- DOM/SVG/CSS scroll-driven trace.

### Stage 04 — People/Relationship

Assets:

- Relationship Master;
- optional character cutout masks.

Motion:

- trace primarily SVG/DOM;
- subtle image depth.

### Stage 05 — Family/Youth

Assets:

- Family/Youth Master only if semantically strong;
- otherwise reuse a relationship/social frame.

Motion:

- intentionally quiet.

### Stage 06 — Meaning

Assets:

- no new heavy media required.

Motion:

- typography + evidence reveal only.

### Stage 07 — Narrative Permission

Assets:

- no new full-resolution cinematic asset required;
- optional dim background texture/frame reuse.

Motion:

- DOM/SVG field transitions;
- evidence traces;
- GPU only if prototype proves clear benefit.

### Stage 08 — Form Shapes Sympathy

Assets:

- Craft Scene Master;
- optional focus/mask metadata.

Motion:

- selective crop/light/focus response;
- not a fake video editor.

### Stage 09 — Scene Autopsy

Assets:

- Autopsy Master;
- depth;
- subject/foreground masks;
- evidence anchors.

GPU:

- highest priority signature system.

### Stage 10 — Decision / Knowledge Fog

Assets:

- Decision Master;
- depth/masks where useful;
- no need for many option-specific images.

GPU:

- fog/depth enhancement;
- semantic facts remain DOM.

### Stage 11 — Biblical Lens

Assets:

- none required beyond subtle carried texture.

Motion:

- near-static.

### Stage 12 — Discovery

Assets:

- responsive cards for actually published analyses only.

Motion:

- shared-media transition candidate.

---

## 14. Loading priority

### Priority 0 — immediately useful

- HTML/critical CSS;
- header;
- headline/subline;
- hero placeholder/responsive LCP image.

### Priority 1 — first interaction

- Hero depth/map assets only if quality tier supports them;
- minimal GPU runtime chunk.

### Priority 2 — next two stages

- Relationship Master when approaching Stage 04.

### Priority 3 — middle page

- Family/Youth/Craft assets as viewport proximity indicates.

### Priority 4 — signature deep section

- Autopsy depth/masks preloaded shortly before Stage 09.

### Priority 5

- Decision assets shortly before Stage 10.

### Priority 6

- discovery cards below.

Do not preload the entire homepage media manifest.

---

## 15. JavaScript ownership/bundling

The homepage should not ship every future platform feature.

Split at least conceptually:

- base shell/navigation;
- homepage editorial interactions;
- GPU stage core;
- Scene Autopsy module;
- Decision/Fog module;
- community code (absent at launch);
- compare/atlas code (absent at launch).

Avoid shipping admin/editor tooling to public routes.

---

## 16. GPU memory policy

Exact VRAM budgets depend on device/browser and cannot be trusted from a simple hardware string.

Rules:

- unload/dispose textures no longer needed;
- avoid duplicate texture uploads for reused assets;
- cap simultaneous full-resolution scene assets;
- downgrade texture resolution with quality tier;
- avoid uncompressed giant alpha masks where smaller single-channel/compressed formats suffice;
- test long-scroll memory growth, not only first load.

A homepage that starts at 60 fps and ends at 20 fps after scrolling is a failed implementation.

---

## 17. Typography motion

Use motion to reinforce hierarchy.

Allowed:

- subtle line reveal;
- tracking/position shifts in display headings;
- evidence labels entering near anchors;
- shared typography position changes.

Avoid:

- constant scramble text;
- every heading splitting into characters;
- text flying in from random directions;
- long opacity delays that make reading wait for animation.

Body copy should be readable immediately when section reaches normal reading state.

---

## 18. Scroll policy

Do not hijack native scroll globally.

Preferred:

- native document scroll;
- CSS scroll-driven animations for simple progress where appropriate;
- sticky/pinned sections only when the relationship between scroll and visual state is meaningful;
- limited smoothing only if proven not to harm input latency/accessibility.

Avoid a site where trackpad input feels disconnected from page position.

---

## 19. Shared media transitions

For Stage 12 → film detail:

Preferred decision tree:

1. native View Transition / React-Motion-compatible shared-media transition if robust;
2. Motion layout/shared element when element continuity is better handled directly;
3. GPU continuation only if it adds visible value and does not complicate navigation/focus;
4. instant navigation fallback.

The browser View Transition API now supports modern SPA/MPA transition workflows, but implementation must still handle unsupported/older environments gracefully.

Do not create a full-screen unrelated wipe merely because it is visually impressive.

---

## 20. Annotation positioning

Desktop:

- prefer semantic DOM labels positioned relative to image anchors;
- CSS anchor positioning is useful for modern browsers;
- maintain fallback placement logic;
- collision handling is mandatory.

Mobile:

- anchors remain visible as numbered/focusable markers;
- text appears in an inline/bottom panel;
- do not attempt desktop callout geometry on a 390 px viewport.

---

## 21. Custom cursor performance

Pointer layer should be cheap.

Rules:

- no DOM element per historical pointer sample;
- no giant trail array;
- one cursor/reticle state;
- GPU uniform updates only when necessary;
- pointer movement invalidates active scene, not every hidden scene;
- disable on coarse pointer/touch.

---

## 22. Performance metrics to record during prototype

At minimum:

### Web metrics

- LCP;
- INP;
- CLS;
- transferred bytes by route;
- JS executed before interaction;
- long tasks.

### GPU metrics

- backend: WebGPU / WebGL2 / none;
- average frame time during active signature interaction;
- 95th percentile frame time;
- DPR;
- texture resolution/tier;
- approximate active texture count;
- dropped quality events.

### Memory/lifecycle

- resource counts before/after entering Scene Autopsy;
- resource counts after leaving;
- route transition cleanup;
- repeated homepage↔film navigation.

---

## 23. Initial performance budgets

These are **prototype gates**, not permanent absolutes. Adjust only with measured justification.

### Semantic first render

- meaningful headline/hero still should not depend on GPU initialization;
- HTML should remain usable even if JS is delayed.

### Images

- first hero responsive image aggressively optimized;
- no desktop 4K master served to small mobile by default;
- depth/masks not part of LCP requirement.

### GPU

- no full-page continuous render when idle;
- signature scene should target smooth interaction on intended tier;
- if frame time degrades persistently, downgrade quality instead of insisting on effect fidelity.

### Fonts

- 1–2 primary families;
- subset/localize where licensing/technical strategy permits;
- no oversized multi-style bundle before first render.

### Motion

- no interaction-blocking 2–4 second intro;
- no scroll-locked loader.

---

## 24. Dynamic quality controller

Candidate state machine:

```text
START
  ↓
CAPABILITY CHECK
  ↓
INITIAL TIER
  ↓
MEASURE ACTIVE FRAME TIME
  ↓
STABLE? ─ yes → retain
  │
  no
  ↓
DOWNGRADE ONE LEVER
  ↓
HYSTERESIS WINDOW
  ↓
MEASURE AGAIN
```

Levers in preferred order:

1. DPR;
2. postprocessing;
3. shadow/depth quality;
4. texture resolution on future loads;
5. particles;
6. deformation complexity;
7. disable expensive local effect;
8. switch scene to Lite equivalent.

Do not bounce tiers every few seconds.

---

## 25. Responsive composition rules

Mobile is a separate composition, not a scaled desktop.

### Hero

- dedicated crop/composition;
- subject remains legible;
- headline not layered over visually busy face/detail.

### Six Lenses

- tabs/segmented list;
- one state at a time.

### Story

- vertical trace.

### Relationship

- stacked characters;
- vertical event sequence.

### Narrative Permission

- grouped semantic list/field rather than compressed continuum.

### Scene Autopsy

- image markers + evidence panel.

### Decision

- stacked options/facts;
- known vs later tabs/segmented state.

### Biblical Lens

- same editorial quality as desktop; no need for GPU reduction because it is already calm.

---

## 26. Browser/device test matrix

Before calling a signature component production-ready, test:

- current Chromium desktop;
- current Firefox desktop;
- current Safari desktop;
- iOS Safari;
- Android Chrome on mid-range hardware;
- forced WebGL2 path;
- no-WebGPU path;
- Lite mode;
- `prefers-reduced-motion`;
- keyboard-only;
- 200% zoom;
- touch-only/coarse pointer.

Optional additional stress:

- low-power mode;
- background tab / visibility changes;
- rapid route navigation;
- repeated Scene Autopsy open/close.

---

## 27. Visual QA checklist per generated master

- Does the image look like premium editorial cinema rather than generic AI concept art?
- Are hands/faces/architecture coherent enough for scrutiny?
- Is the visual claim appropriate to the film rather than merely dramatic?
- Does it survive desktop crop?
- Does a mobile composition exist?
- Are there usable depth zones?
- Does depth displacement expose artifacts?
- Are evidence anchor targets stable?
- Is there enough negative space for optional labels?
- Does the asset remain readable without GPU treatment?
- Has provenance/art-direction review state been recorded?

---

## 28. Motion QA checklist per section

- Can user understand the section before interacting?
- Does motion communicate a real relation/state change?
- Does it settle?
- Does it respond promptly?
- Does it remain usable with reduced motion?
- Does it remain usable with keyboard/touch?
- Is a second animation system fighting for the same property?
- Does leaving the section stop unnecessary rendering?
- Does returning to the section restore state correctly?

---

## 29. Signature effect acceptance gates

### Living Frame

Pass only if:

- depth/light adds presence without face distortion;
- pointer response is subtle;
- static version still feels premium.

### Relationship Observatory

Pass only if:

- users can explain how the relationship changed after viewing it;
- it does not look like a finance chart or social-network graph.

### Narrative Permission

Pass only if:

- users understand `UNCHALLENGED` vs `NORMALIZED`;
- evidence is discoverable;
- state cannot be mistaken for a simple “good/bad” rating.

### Scene Autopsy

Pass only if:

- the interaction makes evidence/interpretation clearer;
- annotations remain readable at common viewport sizes;
- mobile equivalent is genuinely usable;
- GPU failure does not remove content.

### Knowledge Fog

Pass only if:

- users understand known-at-the-time vs revealed-later;
- fog does not imply moral innocence;
- spoiler state is respected semantically.

---

## 30. Technology notes from current audit

As of the September 2026 audit:

- Three.js `WebGPURenderer` is designed to target WebGPU with a WebGL2 backend fallback; it remains a technology to prototype carefully rather than assume perfect backend parity.
- React Three Fiber documents demand rendering through `frameloop="demand"` and explicit invalidation patterns, aligning with the homepage's idle-render policy.
- the browser View Transition API is a strong candidate for shared context-preserving route/view changes;
- Motion can layer higher-level shared/view animations on top of native capabilities, but early-access APIs should not become hard dependencies without a bounded spike;
- CSS scroll-driven animations can handle simple scroll-linked progress without a JS animation loop;
- CSS anchor positioning is substantially more useful in 2026, but individual subfeatures still require compatibility/fallback review.

Pin exact library versions only when implementation begins.

---

## 31. Recommended R&D implementation order

1. Hero still + responsive composition only.
2. Living Frame depth experiment.
3. Quality-tier controller skeleton.
4. Relationship Observatory static/SVG prototype.
5. Narrative Permission DOM prototype.
6. Scene Autopsy static evidence version.
7. Add depth/masks to Scene Autopsy.
8. Knowledge Fog semantic DOM prototype.
9. Add GPU fog/depth enhancement.
10. Integrate into one native-scroll homepage shell.
11. Measure low/mid hardware.
12. Only then add polish/postprocessing.

This order prevents visual R&D from hiding weak information design.
