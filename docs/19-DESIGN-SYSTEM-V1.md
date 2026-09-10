# DeepMovieReview — Design System v1

> Status: Shell B implementation contract  
> Scope: semantic tokens, typography roles, layout rhythm, focus/accessibility and low-cost motion primitives.  
> This is **not** the final film art direction layer and does not include WebGPU.

## 1. Principle

The design system must make the site feel cinematic and editorial even when:

- all GPU effects are disabled;
- all motion is disabled;
- no final film artwork is available;
- a page contains long-form text instead of a hero spectacle.

The visual system therefore owns **structure and hierarchy**, while film-specific art direction owns imagery and atmosphere.

## 2. Semantic color roles

Do not spread raw hexadecimal values through components.

### Surfaces

- `--surface-canvas` — global near-black canvas;
- `--surface-1` — subtle raised analytical surface;
- `--surface-2` — stronger separation surface;
- `--surface-3` — rare dense panel;
- `--surface-warm` — restrained biblical/synthesis warmth.

### Ink

- `--ink-1` — primary readable ivory;
- `--ink-2` — secondary readable text;
- `--ink-3` — metadata / lower-emphasis copy;
- `--ink-4` — decorative/very quiet metadata only;
- `--ink-inverse` — text on light controls.

### Semantic accents

- `--accent-fracture` / `--accent-fracture-bright` — rupture, grave consequence, conflict, severe evidence state;
- `--accent-restoration` / `--accent-restoration-soft` — restoration, repentance, reconciliation, restrained biblical emphasis.

Rules:

- crimson is not a generic hover color;
- amber is not generic luxury decoration;
- neither accent implies a complete moral verdict by itself;
- information must remain understandable without color.

### Strokes

Use `--stroke-subtle`, `--stroke-default`, `--stroke-strong` and `--stroke-warm` instead of random translucent whites.

## 3. Typography roles

The system currently uses robust system fallbacks until the final type-license/font decision is made.

Roles:

- `--font-display` — large editorial/cinematic headlines;
- `--font-body` — reading and analytical prose;
- `--font-meta` — scene IDs, timestamps, section labels, evidence labels.

The type scale is semantic:

- `--type-display-1` — page/hero statement;
- `--type-display-2` — major section thesis;
- `--type-display-3` — module heading;
- `--type-lede` — opening explanation;
- `--type-body` — long-form reading;
- `--type-meta` — forensic/editorial metadata.

Long-form film analysis should normally remain near `--reading-max` rather than expanding to full viewport width.

## 4. Spatial rhythm

Use `--space-1` through `--space-10` for repeated layout decisions.

Core shell dimensions:

- `--container-max`: 1440px;
- `--gutter`: fluid viewport gutter;
- `--grid-gap`: fluid grid gap;
- `--reading-max`: long-form reading width.

The homepage and film page share these primitives.

## 5. Responsive grid

The reusable `.shellGrid` primitive exposes:

- 12 columns on desktop;
- 8 columns on compact/tablet widths;
- 4 columns on mobile.

This is a composition tool, not a demand that every component visually show a grid.

Mobile is a recomposition, not a scaled desktop screenshot.

## 6. Motion roles

CSS variables:

- `--duration-fast`;
- `--duration-standard`;
- `--duration-slow`;
- `--ease-standard`;
- `--ease-quiet`.

Use these for low-cost interface motion only.

Signature interactions such as Living Frame, Scene Autopsy or Knowledge Fog may later use Motion/Three.js, but they must still respect the same reduced-motion state and visual hierarchy.

## 7. Focus and selection

Every interactive DOM control must provide a visible `:focus-visible` state independent of hover.

The global system provides:

- focus color;
- focus offset;
- high-contrast response;
- forced-colors fallbacks;
- explicit text selection styling.

Do not hide the native cursor for reading/forms/navigation.

## 8. High-contrast / forced-colors

`prefers-contrast: more` increases line/text/accent contrast.

`forced-colors: active` removes decorative gradient dependence and maps semantic accents/strokes to system colors.

A film analysis must remain usable when:

- gradients disappear;
- artwork is missing;
- custom accents collapse to system colors.

## 9. Compatibility strategy

Shell v0 originally introduced variables such as `--bg`, `--text`, `--line`, `--crimson` and `--amber`.

Design System v1 maps those to the new semantic token names instead of forcing a risky one-shot rewrite.

Future code should prefer the new names. Legacy aliases can be removed only after migration is complete.

## 10. Non-goals

This layer does not decide:

- final licensed fonts;
- per-film color grading;
- GPT Image prompt language;
- WebGPU materials;
- Moral Core geometry;
- final motion choreography;
- community UI themes.

Those must build on this system rather than bypass it.
