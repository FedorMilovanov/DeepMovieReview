# DeepMovieReview — Visual Asset Manifest v0

> Status: pre-art / pre-GPU production contract  
> Purpose: make generated/editorial imagery reusable, responsive, inspectable and quality-aware before Film 001 art production begins.

## 1. Principle

Do not let components own arbitrary image paths.

A high-value film visual should enter the platform as a **versioned asset family** with enough metadata to support:

- editorial display;
- responsive/mobile recomposition;
- GPU enhancement;
- depth relighting;
- segmentation/layer separation;
- Scene Autopsy anchors;
- future provenance/revision tracking.

The browser should consume prepared assets. Expensive image generation, segmentation and depth estimation belong to the offline/editorial pipeline.

## 2. Asset roles

Current roles:

- `hero`;
- `character`;
- `relationship`;
- `scene-autopsy`;
- `decision`;
- `topic`;
- `background`;
- `social`.

A role describes **editorial purpose**, not file format.

## 3. Variant purposes

Current variant purposes:

- `editorial-master` — highest-quality source retained for production/reprocessing;
- `display` — normal responsive editorial image;
- `gpu-texture` — optimized texture for enhanced experiences;
- `depth-map` — derived depth field;
- `mask` — segmentation/semantic mask;
- `poster` — portrait/index use;
- `share-card` — social/OG-oriented asset.

Not every asset needs every variant, but every browser-facing manifest must include at least one `display` variant so Lite mode and GPU fallback always have a usable visual.

## 4. Master art brief

Before generating or licensing a master visual, define:

- film/section role;
- narrative purpose;
- emotional temperature;
- subject(s);
- environment;
- camera/lens feeling;
- lighting direction;
- period accuracy where relevant;
- forbidden modern/incorrect objects;
- intended text-safe side;
- expected desktop crop;
- expected mobile reframe;
- whether depth separation is required;
- whether Scene Autopsy anchors/masks are required.

Generation should not start from “make a cool cinematic image.”

## 5. Composition metadata

Each manifest has normalized `0..1` coordinates for:

- `focalPoint`;
- optional `mobileFocalPoint`;
- zero or more `textSafeZones`;
- optional `subjectSafeZone`;
- evidence/semantic `anchors`.

Normalized coordinates make the metadata independent of the delivered resolution.

## 6. Mobile recomposition

Mobile is not a blind center crop.

The manifest may provide:

- different focal point;
- different source variant later;
- different safe zones;
- eventually a dedicated mobile master if composition cannot survive reframing.

If a desktop hero depends on a wide two-character composition that collapses on portrait screens, produce a deliberate mobile composition rather than forcing CSS to solve the art problem.

## 7. Quality-tier integration

Asset variants may declare `minTier`.

Example intent:

- `LITE` — responsive display asset only;
- `MEDIUM` — moderate GPU texture and depth map;
- `HIGH` — larger texture/masks;
- `ULTRA` — highest approved GPU source plus richer derived assets.

The selector must fall back from GPU texture to normal display rather than producing a missing visual.

The quality tier never changes editorial meaning.

## 8. Depth-map policy

Depth maps are optional derived assets.

Requirements:

- inspect face/hair/hand edges manually;
- inspect foreground crossings;
- check large depth discontinuities;
- reject maps that create cardboard cutouts or facial warping;
- use depth for restrained camera/light response, not large perspective travel.

A static image with excellent composition is preferable to a broken depth effect.

## 9. Segmentation masks

Current semantic mask roles:

- foreground;
- subject;
- background;
- object;
- custom.

Masks can support:

- Living Frame layer separation;
- localized relighting;
- Scene Autopsy annotations;
- controlled focus/desaturation;
- rare dissection transitions.

Do not require masks for every image.

## 10. Scene Autopsy anchors

Evidence anchors use normalized coordinates and stable IDs.

They may identify:

- a person;
- reaction;
- object;
- gesture;
- spatial relationship;
- environmental clue.

The anchor itself is not the analytical claim. It is a visual reference that a structured evidence record can point to.

Future mobile UI may convert an image-side annotation into anchor → bottom sheet/panel interaction.

## 11. Provenance

Every manifest has `provenance`.

Source kinds:

- generated;
- licensed;
- editorial-original;
- fixture.

For generated assets retain, when available:

- generator/tool;
- model identifier;
- prompt/version identifier;
- creation date;
- editorial notes;
- source/reference relationship.

Do not treat prompt text as the only provenance record; final edits/crops/masks/depth derivations also need traceability later.

## 12. AI-generation pipeline

Recommended production flow:

```text
EDITORIAL ART BRIEF
        ↓
MASTER GENERATION / SOURCE
        ↓
EDITORIAL SELECTION + CORRECTION
        ↓
MASTER ARCHIVE
        ↓
DESKTOP + MOBILE COMPOSITION CHECK
        ↓
RESPONSIVE DISPLAY VARIANTS
        ↓
DEPTH / MASKS / OPTIONAL DERIVED MAPS
        ↓
GPU-TEXTURE VARIANTS
        ↓
MANIFEST VALIDATION
        ↓
VISUAL R&D / BROWSER QA
```

Do not automatically publish the first successful generation.

## 13. File-weight policy

Exact budgets must be measured on real art, but the default discipline is:

- LCP/hero display variant arrives before premium GPU derivatives;
- mobile should download materially less than desktop Ultra;
- masks/depth are deferred until enhancement is actually active/near viewport;
- never ship all scene assets for a film at route entry;
- byte size should be recorded in manifests once the production pipeline can measure it reliably.

## 14. Validation

`validateVisualAssetManifest()` currently checks:

- required ID/title/alt;
- positive aspect ratio;
- normalized focal points;
- normalized safe zones;
- at least one unconditional `display` variant available to Lite for universal static/GPU fallback; media-specific variants may only refine that baseline;
- duplicate variant IDs;
- valid dimensions;
- app-root paths;
- normalized evidence anchors.

Future CI should also verify referenced files exist and dimensions/byte sizes match metadata.

## 15. Fixture policy

The current `fixtureHeroAsset` proves the type system only.

Its `/fixtures/...` paths are placeholders and must not be described as real generated art.

Film 001 should replace fixture asset families with genuinely art-directed masters after the shell and Living Frame R&D are ready.

## 16. Exit criteria before Living Frame production

- manifest schema accepted;
- quality selector can choose display/GPU variants;
- Lite fallback path is explicit;
- mobile focal/composition metadata exists;
- depth/mask derivations are optional, not assumed;
- provenance is retained;
- one real art family can pass visual QA on desktop/mobile without component-specific path hacks.
