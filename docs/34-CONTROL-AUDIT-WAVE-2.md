# DeepMovieReview — Control Audit, Wave 2 (visual / quality / logic)

> Date: 2026-09-14, follows `docs/33-CONTROL-AUDIT.md`
> Scope: everything wave 1 did not cover — Six Lenses machine, Analysis Workbench,
> VerdictCore, film-verdict CSS, methodology shell, link/ID/heading integrity,
> CSS variable integrity, dependency and documentation hygiene
> Method: gates + scripted SSR checks + focused source review (no headless browser
> in sandbox; pixel approval stays a CI/browser responsibility)

## 1. Gates at audit head

typecheck, lint, **52/52** regression tests, production build (15 pages), route smoke — green.

## 2. Scripted integrity checks (all passing)

- **CSS custom properties**: 104 defined / 87 used. 4 undefined at first glance —
  2 are set from JS by design (`--trace-pos`, `--veil-opacity`), 2 were a real
  dead effect (see fix 1).
- **Duplicate IDs**: 0 across 9 route variants (including `?spoilers=full`).
- **Heading order**: 0 level skips across 9 route variants (467 headings total,
  incl. 238 on Truman FULL).
- **Internal links**: 29 unique SSR links crawled, 0 broken.
- **Art masters**: all 7 `public/art/*-master.jpg` present (87–227 KB each).
- **Dependencies**: every package.json entry is imported, side-effect-imported,
  wired via config, or a required peer (react-dom) — nothing dead.
- **Stale suite-size references**: none outside the historical `docs/32` record.

## 3. Fixed by this audit

1. **Moral-ledger hover glow hardening** — `.filmMoralLedger > li::before` referenced
   `--dmr-pointer-x/y`. Correction to the first version of this note: the
   properties ARE registered via `@property` with 50% initial values, so modern
   browsers always rendered the glow (statically centered) — nothing was
   visibly broken. The added `var()` fallbacks only extend that to pre-`@property`
   engines and document the intent. Per-row pointer tracking remains a future
   nuance, not a silent breakage.
2. **VerdictCore shell label** — `aria-label` on a role-less `div` never computes;
   the shell now has `role="img"`.
3. **VerdictCore stale quality state** — shadows, tone mapping and exposure are
   set once at renderer init, so a runtime tier downgrade kept expensive shadows
   enabled. The canvas now remounts on tier change (`key={tier}`).
4. **Workbench group labels** — three `aria-label`s on role-less `div`s
   (anchor/event/decision rails) now have `role="group"`.
5. **Workbench reveal control** — the Knowledge Fog toggle's `aria-expanded` now
   points at the knowledge list via `aria-controls` + `id`.
6. **Lens mark AT noise** — inactive desktop `.lensMarkGroup`s were `opacity: 0`
   but still announced to assistive technology. They now use the same delayed
   `visibility` flip as `.lensReading` (plus the `no-:has` fallback).

## 4. Reviewed, no change needed

- **Living Frame geometry**: base rule carries `position: relative`, overflow
  clip, aspect ratio and min-height — layers cannot escape.
- **Six Lenses machine**: native radio group (keyboard + no-JS functional),
  `@supports not selector(:has(*))` fallback keeps all readings and marks
  present, live region announces selection.
- **Workbench tabs**: roving tabindex + arrows/Home/End with automatic activation;
  single swapping tabpanel is a valid pattern here. No-JS shows the autopsy mode
  statically — acceptable for the synthetic demo.
- **Homepage hero branches**: `PlatformLanding` / `FilmHero` / prelaunch are
  mutually exclusive — exactly one `h1`, one `#hero-title`, one `priority`
  image per render. Published features project through NONE spoiler levels.
- **Slider naming**: visible "Плотность тумана" is a prefix of the accessible
  name — WCAG label-in-name compliant.
- **Dead token observation**: `--color-dmr-*`, `--space-*`, `--content-max` and
  friends are defined but never consumed. Harmless (~30 lines of tokens);
  removal left out deliberately to avoid churn in shared files — revisit if
  `platform.css` is ever reworked.
- **AGENTS.md boundaries**: registry-only reads, server-first components, narrow
  client boundaries, motion/R3F ownership split, preview/indexing guards — all
  recent work complies.
