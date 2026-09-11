# DeepMovieReview

**DeepMovieReview** is an interactive platform for deep analysis of cinema as stories about people. It combines plot and story structure, characters and psychology, relationships, family/youth/social formation, themes and worldview claims, narrative teaching signals, filmmaking craft, scene-level moral analysis, difficult decisions, biblical principles, editorial synthesis and — later — a clearly separate audience/community layer.

The repository is now in **Film 001 vertical-slice production**. The reusable shell is hardened, and **The Truman Show (1998)** has entered the registry as a real `draft` research package. Structural fixture content remains separate and is still not a published film judgment.

## Core thesis

DeepMovieReview is intentionally **not** a sin counter, parental-content checklist, or Christian reskin of a conventional movie-rating platform.

Interpretive axioms:

- **Depiction ≠ Endorsement**
- **Explanation ≠ Justification**
- **Representation ≠ Prescription**

Product invariants:

- **Editorial ≠ Crowd**
- **Moral Severity ≠ Film Quality**
- **Popularity ≠ Biblical Authority**
- claims should be traceable to evidence
- spoiler state is structured data, not a CSS blur
- GPU effects enhance meaning but never own it

The intended analytical progression is:

`FILM → STORY → PEOPLE → RELATIONSHIPS → IDEAS → TEACHING / NARRATIVE PERMISSION → CRAFT / SYMPATHY → MORAL FORENSICS → BIBLICAL LENS → SYNTHESIS`

The visual direction remains **Cinematic Moral Forensics**, but the product is broader than moral-event counting. A film must first be understood as film: story, people, relationships, form, values and claims about life.

## Current implemented foundation

The shell now proves the main architectural boundaries that Film 001 will depend on:

- Next.js App Router + strict TypeScript foundation;
- one canonical `FilmPackage` registry used by routes and homepage projections; optional homepage slices such as Family/Youth and Decision stay nullable rather than forcing every film into every module;
- build-time referential-integrity validation for evidence, sources, characters, decisions and analytical support;
- machine-readable real-film edition locking: `TARGET_ONLY` packages cannot contain analytical modules beyond `sources-method`, canonical scenes or evidence; `LOCKED` evidence must cite the exact locked `film-edition` source;
- canonical edition-bound `scenes[]` with numeric time ranges and verification state; real-film evidence scene references must resolve to verified scenes and numeric evidence timestamps are range-checked;
- spoiler monotonicity from scene → evidence/autopsy: derived scene content may stay at the same level or become more restricted, never less restricted than its canonical scene;
- publication locator integrity: published real-film scenes must be VERIFIED and every published evidence record must include a canonical scene ID plus numeric timestamp in the locked master;
- evidence-backed real-film authoring: interpretive ClaimSupport is required during LOCKED draft work, not deferred until publication;
- module-summary provenance: Relationship, Family/Youth and Moral Analysis summary prose has dedicated `summarySupport` instead of inheriting evidence implicitly from nested items;
- claim-support spoiler integrity for real films: explicit-level claims, Craft pressure assessments and Scene Autopsy anchors cannot depend on more revealing referenced evidence/observations;
- split character evidence graphs: base profile fields use `profileSupport`, deeper beliefs/arc interpretation use `interpretiveSupport`, and each layer is validated against its own spoiler ceiling;
- canonical evidence records shared by interpretive claims instead of copied prose evidence;
- structured Story, Characters, Relationships, Family/Youth, Meaning, Teaching Signals, Narrative Permission, Craft, Scene Autopsy, Decision, Moral Analysis, Biblical Synthesis, Final Synthesis and Sources/Method modules;
- one spoiler projection stage that removes forbidden nested data **before** presentation; the projected module array is shared by outline and renderer, and real featured-film homepage data is reduced to spoiler-safe `NONE` content before composition;
- spoiler-aware deep-link cleanup when a hash targets content hidden by a lower spoiler level;
- fixture/draft `noindex`, permanent `/labs/*` `noindex`, a fail-closed launch gate requiring `DMR_SITE_INDEXING_ENABLED=true` plus a published configured homepage feature **with preview mode disabled**, and a separate `DMR_PREVIEW_CONTENT_ENABLED=true` gate before non-published film routes exist in production; when preview mode is disabled, the public prelaunch homepage does not project fixture/draft film data at all;
- adaptive experience runtime with Auto/Lite mode, reduced-motion control, document/offscreen awareness, renderer-backend reporting and measured quality downgrades;
- WebGPU-oriented Verdict Core with WebGL2/static fallback behavior and no semantic content trapped in canvas;
- visual asset manifest types with focal points, safe zones, depth maps, masks, provenance, responsive/DPR-aware variant selection and a fail-closed validated asset registry;
- semantic accessibility work for Six Lenses tabs and Scene Autopsy interaction;
- CI gates for locked dependency install, typecheck, domain regression tests, lint, preview production build/smoke, a real headless-Chrome DOM/accessibility/visual audit with screenshot evidence, and a clean public production rebuild/access-security smoke;
- strict npm install-script allowlisting rather than implicitly executing newly introduced dependency scripts.

## Foundation documents

Start with these documents:

1. [`docs/00-PROJECT-CHARTER.md`](docs/00-PROJECT-CHARTER.md) — thesis, scope, differentiation and non-goals.
2. [`docs/01-VISUAL-CONSTITUTION.md`](docs/01-VISUAL-CONSTITUTION.md) — art direction, visual grammar and signature interactions.
3. [`docs/11-HOMEPAGE-ARCHITECTURE.md`](docs/11-HOMEPAGE-ARCHITECTURE.md) — full homepage research architecture.
4. [`docs/14-HOMEPAGE-LAUNCH-CUT-V1.md`](docs/14-HOMEPAGE-LAUNCH-CUT-V1.md) — selected launch sequence and interaction/layout requirements.
5. [`docs/15-HOMEPAGE-DATA-CONTRACTS.md`](docs/15-HOMEPAGE-DATA-CONTRACTS.md) — structured homepage projections and canonical-domain boundaries.
6. [`docs/16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md`](docs/16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md) — asset, depth/mask, motion, quality-tier and performance rules.
7. [`docs/12-ANALYSIS-ONTOLOGY-V2.md`](docs/12-ANALYSIS-ONTOLOGY-V2.md) — whole-film analytical ontology.
8. [`docs/02-INFORMATION-ARCHITECTURE.md`](docs/02-INFORMATION-ARCHITECTURE.md) — long-term domain graph and conceptual schema.
9. [`docs/03-RATING-METHODOLOGY.md`](docs/03-RATING-METHODOLOGY.md) — analysis/rating methodology and separation of independent dimensions.
10. [`docs/04-COMMUNITY-AND-AUDIENCE.md`](docs/04-COMMUNITY-AND-AUDIENCE.md) — future viewer score, voting and anti-brigading foundations.
11. [`docs/05-TECHNICAL-ARCHITECTURE.md`](docs/05-TECHNICAL-ARCHITECTURE.md) — Next.js/React/Three.js architecture and progressive enhancement.
12. [`docs/06-EXPERIENCE-BLUEPRINT.md`](docs/06-EXPERIENCE-BLUEPRINT.md) — film-page experience library.
13. [`docs/07-ROADMAP.md`](docs/07-ROADMAP.md) — phased delivery plan.
14. [`docs/08-REFERENCE-AUDIT.md`](docs/08-REFERENCE-AUDIT.md) — visual, technical, ratings and competitor reference bank.
15. [`docs/13-HOMEPAGE-AND-CONTENT-RESEARCH-AUDIT.md`](docs/13-HOMEPAGE-AND-CONTENT-RESEARCH-AUDIT.md) — focused September 2026 homepage/content research.
16. [`docs/09-AGENT-BUILD-RULES.md`](docs/09-AGENT-BUILD-RULES.md) — non-negotiable implementation guardrails.
17. [`AGENTS.md`](AGENTS.md) — current coding-agent entrypoint and implemented invariants.

Implementation-state documents:

- [`docs/18-APP-SHELL-PHASE.md`](docs/18-APP-SHELL-PHASE.md)
- [`docs/19-DESIGN-SYSTEM-V1.md`](docs/19-DESIGN-SYSTEM-V1.md)
- [`docs/20-SPOILER-STATE-V1.md`](docs/20-SPOILER-STATE-V1.md)
- [`docs/21-FILM-PACKAGE-RENDERER-V0.md`](docs/21-FILM-PACKAGE-RENDERER-V0.md)
- [`docs/22-QUALITY-RUNTIME-V0.md`](docs/22-QUALITY-RUNTIME-V0.md)
- [`docs/23-VISUAL-ASSET-MANIFEST-V0.md`](docs/23-VISUAL-ASSET-MANIFEST-V0.md)
- [`docs/24-FILM-OUTLINE-SOURCES-V0.md`](docs/24-FILM-OUTLINE-SOURCES-V0.md)
- [`docs/25-CINEMATIC-UI-PLATFORM-2026.md`](docs/25-CINEMATIC-UI-PLATFORM-2026.md)
- [`docs/25-EXPERIENCE-CONTROLS-V0.md`](docs/25-EXPERIENCE-CONTROLS-V0.md)
- [`docs/26-FILM-DOMAIN-MODULES-V0.md`](docs/26-FILM-DOMAIN-MODULES-V0.md)
- [`docs/27-LIVING-FRAME-RD-RESULTS.md`](docs/27-LIVING-FRAME-RD-RESULTS.md) — measured A/B/C Living Frame decision.
- [`docs/28-PILOT-FILM-SELECTION.md`](docs/28-PILOT-FILM-SELECTION.md) — Film 001 selection and research boundary.
- [`docs/29-FILM-001-INGEST-STATUS.md`](docs/29-FILM-001-INGEST-STATUS.md) — active edition/evidence ingest gate.
- [`docs/30-FILM-001-SECONDARY-RESEARCH.md`](docs/30-FILM-001-SECONDARY-RESEARCH.md) — production/craft/development context kept separate from canonical film evidence.

[`docs/10-OPEN-QUESTIONS.md`](docs/10-OPEN-QUESTIONS.md) remains the backlog of unresolved product/methodology decisions rather than a statement of implemented behavior.

## Homepage Launch Cut v1

The launch grammar is deliberately narrower than the full research storyboard:

`ARRIVAL / LIVING FRAME → SIX LENSES → STORY → PEOPLE + RELATIONSHIP OBSERVATORY → FAMILY / YOUTH → MEANING → NARRATIVE PERMISSION → FORM SHAPES SYMPATHY → SCENE AUTOPSY → KNOWLEDGE FOG / DECISION → BIBLICAL LENS + SYNTHESIS → DISCOVERY`

The homepage intentionally delays Moral Core, the full Moral Timeline, community layers and dense score dashboards until the visitor understands the film-first analytical breadth.

## Whole-film analytical lenses

- **STORY** — premise, conflict, causality, structure and ending.
- **PEOPLE** — desires, fears, contradictions, beliefs, self-deception and arcs.
- **RELATIONSHIPS** — trust, truthfulness, power, boundaries, responsibility, conflict and repair.
- **FAMILY / YOUTH / FORMATION** — parents, authority, peer pressure, autonomy/rebellion, maturity and adult examples.
- **IDEAS / MEANING** — themes, narrative questions, worldview claims, purpose and meaning.
- **TEACHING / NARRATIVE PERMISSION** — what is rewarded, costly, normalized, questioned, ridiculed, romanticized or left unchallenged.
- **CRAFT / FORM** — how camera, editing, music, performance, humor and genre shape sympathy and imitation pressure.
- **MORAL FORENSICS** — acts, motives, knowledge, freedom, pressure, consequences, responsibility, repentance and redemption.
- **BIBLICAL LENS** — Scripture-grounded principles, qualifications, application and final synthesis.

## Signature interaction vocabulary

The visual system uses a small semantic grammar rather than arbitrary effects:

- **FRAME** — cinema / viewpoint
- **LENS** — examination
- **FRACTURE** — rupture / conflict
- **TRACE** — causality / relationship evolution / consequence
- **FOG** — limited knowledge / uncertainty
- **CORE** — structured synthesis / fingerprint
- **LIGHT** — truth / disclosure
- **FIELD** — only where a field/distribution visualization genuinely expresses the data

Primary signature systems include Living Film Frame, Six Lenses, Relationship Observatory, Message Field, Narrative Permission Map, Moral Lens, Scene Autopsy, Film Dissection, Moral Core, Moral Timeline, Decision Chamber / Knowledge Fog and — later — Audience Field / Moral Mirror.

## Audience/community layer

Community data is deliberately a later phase, but its separation is already an architectural invariant. Future audience ratings, dilemma votes, comments or corrections must not overwrite editorial analysis and must never be weighted by agreement with the editors. Popularity is descriptive data, not biblical authority.

## Current phase and next work

Current phase: **Phase 1 — Film 001 / The Truman Show canonical ingest and evidence build**.

The immediate next steps are:

- lock the exact Film 001 editorial master / region and timestamp convention;
- build stable scene IDs and a canonical evidence ledger from that locked master;
- author spoiler-safe Story, Characters, Relationships and Craft before deeper synthesis;
- add Teaching Signals / Narrative Permission, Decision / Knowledge Fog and Scene Autopsy only as evidence is verified;
- produce Film 001 art-directed masters using the selected Living Frame B/C architecture;
- independently review biblical and final synthesis before publication;
- calibrate the first real editorial rubric against the methodology before publishing numeric aggregates;
- evolve the current TypeScript contracts into persistent database/API schemas only after the Film 001 vertical slice proves which entities are truly required.

Do **not** begin by building a giant movie database or social network. The next meaningful milestone is one production-quality film vertical slice that proves both the analytical method and the signature visual system.
