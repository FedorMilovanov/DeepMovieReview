# DeepMovieReview — Experience Controls v0

> Status: implemented user-control foundation  
> Purpose: keep high-end visuals optional, testable and respectful of motion preferences while GPU enhancement is active.

## 1. Principle

Premium visual effects are **progressive enhancement**, not a condition for reading the analysis.

Users must be able to explicitly choose a restrained presentation even on capable hardware.

## 2. Current controls

### Visual quality

- `Auto` — runtime selects and may downgrade `ULTRA / HIGH / MEDIUM / LITE`;
- `Lite` — explicitly caps the experience at the premium static/CSS path.

### Motion

- `System` — follows the operating-system reduced-motion preference;
- `Reduced` — explicitly requests less motion inside DeepMovieReview.

The two controls are independent.

A user may want:

- high-resolution imagery with reduced motion;
- normal motion but Lite GPU usage;
- full automatic adaptation.

## 3. Persistence

Preferences currently use local storage:

- `dmr:experience-mode`;
- `dmr:motion-preference`.

Persistence is optional. If storage is unavailable or throws, the site continues with safe default behavior.

Future authenticated preferences can mirror these same semantic values.

## 4. User override vs runtime downgrade

Automatic runtime logic does not silently upgrade after a performance downgrade.

However, an explicit user action switching from `Lite` back to `Auto` is allowed to recompute the initial capability tier. This is a deliberate user reset, not oscillating automatic behavior.

## 5. Reduced motion contract

`Reduced` should suppress or simplify:

- camera travel;
- large parallax;
- continuous particles;
- kinetic text;
- long shared-element choreography;
- cursor-follow distortion;
- unnecessary spring motion.

It does **not** require:

- low-resolution images;
- loss of analytical modules;
- weaker typography;
- removal of color/contrast hierarchy.

## 6. Lite contract

`Lite` means:

- no expensive persistent GPU scene unless needed for a trivial capability;
- static/normal responsive images;
- DOM/CSS transitions only;
- no depth relighting;
- no compute/particle systems;
- no loss of content, evidence, navigation or semantic relationships.

Lite is an intentional visual mode, not a broken fallback.

## 7. UI placement

The control currently lives in the site footer inside a native `<details>` surface.

Reasons:

- always discoverable without dominating the cinematic hero;
- keyboard/touch compatible;
- no modal dependency;
- no custom widget needed for a simple preference.

A future header shortcut may be added if user testing shows poor discoverability.

## 8. Runtime hooks

The root element exposes:

- `data-experience-mode`;
- `data-motion-preference`;
- existing quality/backend/reduced-motion data attributes.

CSS and future GPU modules can branch from the same resolved state.

## 9. Testing

Every signature visual R&D PR should be checked in at least:

- Auto + normal system motion;
- Auto + system reduced motion;
- Auto + explicit Reduced;
- Lite + normal motion;
- Lite + Reduced.

The result should still communicate the same meaning in every case.

## 10. Non-goals

v0 does not provide:

- arbitrary manual ULTRA/HIGH/MEDIUM selection;
- FPS counters to public users;
- vendor-specific presets;
- battery saver inference;
- bandwidth/data saver preference yet.

Those can be added only if measurement demonstrates a real need.
