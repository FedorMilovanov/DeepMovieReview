# DeepMovieReview — Control Audit, Wave 3 (visual / quality / logic)

> Date: 2026-09-14, follows `docs/33-CONTROL-AUDIT.md` and `docs/34-CONTROL-AUDIT-WAVE-2.md`
> Scope: labs isolation + lab surfaces, integrity-gate spot checks, error/loading
> boundaries, methodology page, Tailwind payload, icon/og assets, fixture voice,
> data honesty, group-label sweep
> Method: gates + scripted checks + focused source review (no headless browser
> in sandbox; pixel approval stays a CI/browser responsibility)

## 1. Gates at audit head

typecheck, lint, **52/52** regression tests, production build (15 pages), route smoke — green.

## 2. Fixed by this audit

1. **Correction to wave 2 (§34 fix 1)** — the moral-ledger glow was never visibly
   broken: `--dmr-pointer-x/y` are `@property`-registered with 50% initials, so
   modern browsers rendered the centered glow all along. The added `var()`
   fallbacks only help pre-`@property` engines. `docs/34` is amended; the CSS
   change itself stays as cheap progressive enhancement.
2. **Global error landmark** — `role="alert"` sat on `<main>`, overriding the
   landmark and wrapping the recovery actions. It now wraps only the text block;
   `error.tsx` already had this shape.
3. **Six orphaned group labels** — `aria-label` on role-less `div`s never
   computes (same bug class as waves 1–2). Added `role="group"` in four labs
   (scene-autopsy, narrative-permission, relationship-observatory, six-lenses),
   `final-synthesis-view` facets and the moral-ledger meta block. A repo-wide
   sweep confirms no further instances.

## 3. Reviewed, no change needed

- **Labs**: route-isolated (zero production imports), uniformly `noindex` with
  back-links, honest fixture framing, working keyboard paths (evidence lists),
  R3F depth lab disposes textures and cancels frames. English copy is accepted
  for internal R&D surfaces.
- **Integrity gate**: LOCKED runtime, researchRole required/rejected,
  timestamp finiteness + scene-range containment, VERIFIED enforcement — all
  doc-promised invariants verified present in code, on top of the 52 tests.
- **Error/loading/not-found**: `error.tsx` (alert + reset + nav), root and
  films loadings, canonical 404 — all present and correctly shaped.
- **Methodology**: keys, heading order, list roles, canonical, calibration
  honesty notice — clean. A suspected mojibake string verified byte-clean UTF-8
  (read-tool rendering artifact, confirmed via `od` + served bytes).
- **Tailwind bridge**: zero utility residue in production CSS (v4 tree-shakes
  the unused `@utility`s); homepage ships ~109 KB CSS total. Keeping the bridge
  is effectively free.
- **Icons/social**: `/icon.svg`, `/apple-icon.png`, `/og-home.png` all 200 with
  sane payloads; metadata routes follow the Next convention.
- **Footer `aria-current`**: deliberately absent — the footer is a server
  component and the header already marks the current page; parity is not worth
  a client boundary.
- **Code hygiene**: zero `any` / `@ts-ignore` / `eslint-disable` in `src`;
  all 20 homepage `.map()` calls carry `key`s; all dependencies justified.
- **Experience quality lib**: tier selection conservative on unknown hardware,
  downgrade path total, frame budgets sane, reduced motion handled per-surface
  by design rather than forced LITE.
