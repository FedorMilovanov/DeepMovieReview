# DeepMovieReview — coding agent entrypoint

Before changing product behavior, data contracts or visual language, read:

1. `README.md`
2. `docs/09-AGENT-BUILD-RULES.md`
3. `docs/14-HOMEPAGE-LAUNCH-CUT-V1.md`
4. `docs/15-HOMEPAGE-DATA-CONTRACTS.md`
5. `docs/16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md`
6. `docs/05-TECHNICAL-ARCHITECTURE.md`
7. `docs/28-PILOT-FILM-SELECTION.md`
8. `docs/29-FILM-001-INGEST-STATUS.md`
9. `docs/30-FILM-001-SECONDARY-RESEARCH.md`

## Current implementation phase

Phase 1 — Film 001 vertical slice / canonical ingest.

The semantic shell, bounded visual R&D, adaptive experience layer and reusable FilmPackage renderer are hardened. Film 001 is **The Truman Show (1998)**. The exact viewing master is identified and measured; the immediate goal is to re-verify the scene/evidence graph against it, transition canonically to LOCKED only after that review, and author reviewed analytical modules without letting secondary sources or memory substitute for the finished film.

## Non-negotiable implementation boundaries

- Next.js 16.3.x App Router + strict TypeScript. Prefer Server Components unless browser state or interaction requires a client boundary.
- Meaningful content, navigation, evidence and conclusions stay in semantic DOM. GPU is progressive enhancement.
- Application routes and projections read film data only through `src/data/film-registry.ts`.
- `src/data/film-fixtures.ts` is the raw construction source for structural fixtures. Real film packages live separately under `src/data/films/`. Do not import either raw source from routes or presentation components; application reads go through `src/data/film-registry.ts`.
- `src/lib/film-package.ts` is the canonical runtime content contract. Do not reintroduce a parallel homepage/editorial schema.
- Homepage content is a read-model produced by `src/lib/homepage-projection.ts`, not a second hand-authored review. Do not make optional analytical slices mandatory merely to satisfy homepage composition.
- `src/lib/film-package-integrity.ts` is a publish/build gate. Never bypass or weaken referential validation to make fixture data compile.
- Outside the explicit `SECONDARY_SOURCES` research tier, every high-level interpretive claim in a real-film package — including draft authoring after master lock — must trace to canonical evidence/source records. Research-tier claims are provisional hypotheses only: they must trace to declared non-`film-edition` research evidence and must never be presented or inherited as canonical without re-verification against the locked master. Do not use generic draft status as a bypass for unsupported analysis.
- Relationship, Family/Youth and Moral Analysis module-level summary prose is itself an interpretive claim. Real-film summaries use `summarySupport`; nested-item support does not silently substitute for unsupported summary prose.
- Real-film Story is also evidence-backed: the Story summary uses `summarySupport`, every plot beat uses its own `support`, and a real-film Story module cannot exist with zero beats.
- Decision / Knowledge Fog context is evidence-backed record-by-record: each available option, knowledge fact, pressure and duty/good uses its own `support`. The editorial judgment keeps separate support.
- Real-film packages must declare `FilmPackage.ingest.edition`. The edition state machine is `TARGET_ONLY → MASTER_IDENTIFIED → LOCKED`: `TARGET_ONLY` means a target is selected but not measured; `MASTER_IDENTIFIED` requires exact measured master identity/runtime/timestamp metadata but still forbids canonical promotion; only `LOCKED` may own canonical scenes/evidence. The explicit `FilmPackage.research.state = "SECONDARY_SOURCES"` tier may coexist with either pre-lock state and carry **DRAFT-only** scene estimates, non-`film-edition` secondary-source evidence and analytical working modules, but it is structurally unpublishable. Identifying a master never promotes research hypotheses automatically; re-verify them record-by-record, then remove the research tier and transition to `LOCKED` atomically. Every canonical evidence record must reference the locked `film-edition` source.
- Exact-master structural segmentation and editorial scenes are different domain layers. `FilmPackage.ingest.masterSegmentation` may store objective container/disc segments only after the exact master is measured. Never mechanically promote embedded chapters, playlist marks or container segments into `FilmPackage.scenes`; editorial scene boundaries remain semantic claims that require independent master review.
- Real-film Sources/Method metadata is required from the start: `methodologyVersion`, `editorialRevision` and human-readable `analyzedEdition` must never be blank. `lastReviewedAt` remains a publication/review gate.
- In the `SECONDARY_SOURCES` tier, every `kind: "reference"` source must declare an explicit `researchRole` (`primary-material`, `institutional-academic`, `professional-reference`, `database-transcript`, or `tertiary-community`). This is provenance classification, **not** a numeric quality score. Never infer the role from a hostname at render time.
- Canonical real-film scenes live in `FilmPackage.scenes` with numeric timestamp seconds and verification state. Outside the explicit `SECONDARY_SOURCES` tier, evidence `sceneId` references must resolve to `VERIFIED` scenes. Research-tier evidence may reference only `DRAFT` scene estimates until master-lock re-verification. Numeric evidence timestamps must fall inside the referenced scene range in either tier.
- Scene-linked evidence and Scene Autopsy modules may be **equally or more** spoiler-restricted than their referenced scene, never less. This applies to both research-tier DRAFT scene estimates and canonical VERIFIED scenes. Do not downgrade a protected scene by labeling derived evidence/module content `NONE` or another lower level.
- Every real-film canonical evidence record — including draft authoring after master lock — must carry both a canonical `sceneId` and numeric `timestampSeconds`, and the referenced scene must be `VERIFIED`. Published real-film packages additionally may contain only `VERIFIED` scenes.
- For real films, explicit-level claims may only cite support/counterevidence that is equally or less spoiler-restricted than the claim itself. The same monotonic rule applies to Craft pressure → craft observation and Scene Autopsy anchor → evidence references.
- Character evidence is split by visibility layer: `profileSupport` belongs to wants/fears/contradiction at the profile spoiler boundary; `interpretiveSupport` belongs to believes/self-deception/arc/argument fields at the interpretive boundary. Never reuse one support object across both layers.
- Stable IDs, not display names, own cross-entity references. Relationships use `participantCharacterIds`; decisions and attributable moral events use stable character IDs.
- Spoilers are a data projection boundary. Filter nested protected content through `src/lib/film-module-projection.ts` before it enters the render tree. Real film data projected onto the homepage is spoiler-safe by default; do not bypass that projection for visual convenience.
- `ExperienceQualityProvider` owns runtime quality, renderer backend, Lite/reduced-motion preferences and degradation. Do not create a second motion/capability state machine.
- Motion owns DOM/layout animation; Three/R3F owns GPU/3D. Do not overlap animation ownership for the same element without an explicit architectural reason.
- `fixture` content is structural test data, never a published moral, psychological or biblical judgment. `/labs/*` remains permanently `noindex`; public indexing requires the explicit launch flag, a published configured homepage feature **and preview content disabled**. Preview builds are never indexable. `noindex` is not access control: production fixture/draft film routes require `DMR_PREVIEW_CONTENT_ENABLED=true`, and a public prelaunch homepage must not project fixture/draft FilmPackage content.
- Preserve `Depiction ≠ Endorsement`, `Explanation ≠ Justification`, `Representation ≠ Prescription`, `Editorial ≠ Crowd`, and `Moral Severity ≠ Film Quality`.

## Quality gates

Before calling a branch merge-ready, the exact PR head must pass locked install, typecheck, domain regression tests, lint, preview production build/smoke, the headless-Chrome browser/accessibility audit, a clean public production rebuild and public access/security smoke checks. Do not infer correctness from an older green commit after the head has moved.

Any new dependency with an install lifecycle script requires explicit review and a version-pinned `allowScripts` entry; `.npmrc` keeps unreviewed install scripts fail-closed.

## Next.js specifics

Route `params` and `searchParams` are asynchronous. Keep client boundaries narrow and serializable. Film slugs are generated from the validated registry; unknown slugs are not valid dynamic content. Remember that Next.js streamed `notFound()` responses can carry HTTP 200 while rendering the canonical not-found boundary, so tests must verify the semantic not-found result rather than assuming status alone.
