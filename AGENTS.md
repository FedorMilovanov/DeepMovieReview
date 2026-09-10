# DeepMovieReview — coding agent entrypoint

Before changing product behavior, data contracts or visual language, read:

1. `README.md`
2. `docs/09-AGENT-BUILD-RULES.md`
3. `docs/14-HOMEPAGE-LAUNCH-CUT-V1.md`
4. `docs/15-HOMEPAGE-DATA-CONTRACTS.md`
5. `docs/16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md`
6. `docs/05-TECHNICAL-ARCHITECTURE.md`

## Current implementation phase

Phase 0.7 — architecture cleanup / vertical-slice readiness.

The semantic shell, bounded visual R&D, adaptive experience layer and reusable FilmPackage renderer exist. The immediate goal is to finish hardening these foundations before Film 001 introduces authoritative editorial content or production art.

## Non-negotiable implementation boundaries

- Next.js 16.3.x App Router + strict TypeScript. Prefer Server Components unless browser state or interaction requires a client boundary.
- Meaningful content, navigation, evidence and conclusions stay in semantic DOM. GPU is progressive enhancement.
- Application routes and projections read film data only through `src/data/film-registry.ts`.
- `src/data/film-fixtures.ts` is the raw construction source for structural fixtures. Do not import it from routes or presentation components.
- `src/lib/film-package.ts` is the canonical runtime content contract. Do not reintroduce a parallel homepage/editorial schema.
- Homepage content is a read-model produced by `src/lib/homepage-projection.ts`, not a second hand-authored review. Do not make optional analytical slices mandatory merely to satisfy homepage composition.
- `src/lib/film-package-integrity.ts` is a publish/build gate. Never bypass or weaken referential validation to make fixture data compile.
- High-level interpretive claims in published packages must trace to canonical evidence/source records.
- Stable IDs, not display names, own cross-entity references. Relationships use `participantCharacterIds`; decisions and attributable moral events use stable character IDs.
- Spoilers are a data projection boundary. Filter nested protected content through `src/lib/film-module-projection.ts` before it enters the render tree. Real film data projected onto the homepage is spoiler-safe by default; do not bypass that projection for visual convenience.
- `ExperienceQualityProvider` owns runtime quality, renderer backend, Lite/reduced-motion preferences and degradation. Do not create a second motion/capability state machine.
- Motion owns DOM/layout animation; Three/R3F owns GPU/3D. Do not overlap animation ownership for the same element without an explicit architectural reason.
- `fixture` content is structural test data, never a published moral, psychological or biblical judgment. `/labs/*` remains permanently `noindex`; public indexing requires the explicit launch flag and a published configured homepage feature. `noindex` is not access control: production fixture/draft film routes require `DMR_PREVIEW_CONTENT_ENABLED=true`.
- Preserve `Depiction ≠ Endorsement`, `Explanation ≠ Justification`, `Representation ≠ Prescription`, `Editorial ≠ Crowd`, and `Moral Severity ≠ Film Quality`.

## Quality gates

Before calling a branch merge-ready, the exact PR head must pass locked install, typecheck, lint, production build and production route smoke checks. Do not infer correctness from an older green commit after the head has moved.

Any new dependency with an install lifecycle script requires explicit review and a version-pinned `allowScripts` entry; `.npmrc` keeps unreviewed install scripts fail-closed.

## Next.js specifics

Route `params` and `searchParams` are asynchronous. Keep client boundaries narrow and serializable. Film slugs are generated from the validated registry; unknown slugs are not valid dynamic content. Remember that Next.js streamed `notFound()` responses can carry HTTP 200 while rendering the canonical not-found boundary, so tests must verify the semantic not-found result rather than assuming status alone.
