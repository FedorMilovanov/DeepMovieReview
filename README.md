# DeepMovieReview

**DeepMovieReview** is a planned interactive platform for deep analysis of cinema as stories about people. It combines story/plot analysis, characters, psychology, relationships, family/youth/social models, themes, narrative messages, filmmaking craft, scene-level moral analysis, difficult decisions, biblical principles, editorial verdicts and — later — independent audience/community data.

This repository is currently in **foundation / research / architecture** stage. Do not treat the present docs as a finished public methodology; they are the working specification to build and calibrate from.

## Core thesis

The project is intentionally **not** a simple sin counter, parental-content checklist, or Christian reskin of a conventional movie-rating platform.

Three interpretive axioms:

- **Depiction ≠ Endorsement**
- **Explanation ≠ Justification**
- **Representation ≠ Prescription**

Additional product invariants:

- **Editorial ≠ Crowd**
- **Moral Severity ≠ Film Quality**
- **Popularity ≠ Biblical Authority**

The intended analytical progression is:

`FILM → STORY → PEOPLE → RELATIONSHIPS → IDEAS → WHAT THE FILM TEACHES / NORMALIZES → CRAFT / SYMPATHY → MORAL FORENSICS → BIBLICAL LENS → SYNTHESIS`.

The visual direction remains **Cinematic Moral Forensics**, but the product scope is broader than moral events: the film must first be understood as film, story, human relationships and a set of claims about life.

## Foundation documents

Read in this order:

1. [`docs/00-PROJECT-CHARTER.md`](docs/00-PROJECT-CHARTER.md) — product thesis, expanded scope, differentiation and non-goals.
2. [`docs/01-VISUAL-CONSTITUTION.md`](docs/01-VISUAL-CONSTITUTION.md) — art direction, visual grammar and signature interactions.
3. [`docs/11-HOMEPAGE-ARCHITECTURE.md`](docs/11-HOMEPAGE-ARCHITECTURE.md) — detailed homepage architecture: 22-stage sequence from Living Frame through relationships/messages to biblical synthesis.
4. [`docs/12-ANALYSIS-ONTOLOGY-V2.md`](docs/12-ANALYSIS-ONTOLOGY-V2.md) — broadened whole-film ontology for story, characters, relationships, family/youth, themes, teaching signals, craft and moral/biblical analysis.
5. [`docs/02-INFORMATION-ARCHITECTURE.md`](docs/02-INFORMATION-ARCHITECTURE.md) — canonical long-term domain graph and conceptual schema.
6. [`docs/03-RATING-METHODOLOGY.md`](docs/03-RATING-METHODOLOGY.md) — v0.2 analysis/rating methodology including relationships, narrative permission, messages and audience-score separation.
7. [`docs/04-COMMUNITY-AND-AUDIENCE.md`](docs/04-COMMUNITY-AND-AUDIENCE.md) — future viewer score, decision voting, Moral Mirror, Audience Field and anti-brigading foundations.
8. [`docs/05-TECHNICAL-ARCHITECTURE.md`](docs/05-TECHNICAL-ARCHITECTURE.md) — Next.js/React/Three.js direction, persistent GPU stage, WebGPU/WebGL2/Lite tiers, accessibility/performance.
9. [`docs/06-EXPERIENCE-BLUEPRINT.md`](docs/06-EXPERIENCE-BLUEPRINT.md) — expanded film-page library with story, relationships, messages, craft, moral forensics and biblical modules.
10. [`docs/07-ROADMAP.md`](docs/07-ROADMAP.md) — phased delivery plan from one-film vertical slice to larger atlases/community.
11. [`docs/08-REFERENCE-AUDIT.md`](docs/08-REFERENCE-AUDIT.md) — broad current visual, technical, ratings and competitor reference bank.
12. [`docs/13-HOMEPAGE-AND-CONTENT-RESEARCH-AUDIT.md`](docs/13-HOMEPAGE-AND-CONTENT-RESEARCH-AUDIT.md) — focused September 2026 audit supporting the homepage and expanded content model.
13. [`docs/09-AGENT-BUILD-RULES.md`](docs/09-AGENT-BUILD-RULES.md) — non-negotiable guardrails for coding/design agents, including anti-sin-counter safeguards.
14. [`docs/10-OPEN-QUESTIONS.md`](docs/10-OPEN-QUESTIONS.md) — unresolved decisions and next audit targets.

## Whole-film analytical lenses

The product should be able to examine a film across at least these connected lenses:

- **STORY** — premise, conflict, plot structure, causality, ending.
- **PEOPLE** — characters, desires, fears, contradictions, arcs, psychological realism.
- **RELATIONSHIPS** — marriage, romance, parents/children, friendship, peers, authority, trust, responsibility, conflict and repair.
- **FAMILY / YOUTH / FORMATION** — parent responsibility, adult role models, peer pressure, rebellion/autonomy, maturation and consequences.
- **IDEAS / MEANING** — themes, narrative questions, worldview claims, meaning and purpose.
- **TEACHING / NARRATIVE PERMISSION** — what is modeled, rewarded, costly, unchallenged, normalized, ridiculed or celebrated.
- **CRAFT / FORM** — how camera, editing, music, performance, genre and visual framing shape sympathy and imitation pressure.
- **MORAL FORENSICS** — acts, motives, knowledge, freedom, consequences, responsibility, repentance and redemption.
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
- **FIELD** — proposed primitive for messages/permissions/audience distributions; adopt only if it proves reusable

Primary signature systems include:

- Living Film Frame
- Six Lenses
- Relationship Observatory / Relationship Trace
- Message Field
- Narrative Permission Map
- Moral Lens
- Scene Autopsy
- Film Dissection
- Moral Core
- Moral Timeline
- Decision Chamber / Knowledge Fog
- Audience Field (later)
- Moral Mirror (later)

## Initial implementation strategy

Do **not** begin by building a giant movie database or social network.

The first meaningful milestone is one production-quality film vertical slice proving both whole-film analysis and the signature visual system.

A stronger current proving path is:

`Hero / Living Frame → Story at a Glance → Character → Relationship Observatory → What the Film Appears to Say → Narrative Permission example → Scene Autopsy → Decision Chamber where relevant → Biblical Principle → Final Synthesis`

with a real structured data model and usable reduced-motion/Lite fallback.

Moral Timeline/Moral Core remain important, but they should not crowd story, relationships and meaning out of the first prototype.

## Status

Current phase: **Phase 0 — Foundation / audit / architecture**.

Next major decisions:

- choose the pilot film;
- choose which homepage sections enter the first launch cut;
- turn the v0.2 ontology into an ER/schema proposal;
- define the first calibrated editorial rubric;
- prototype Living Frame, Relationship Trace, Narrative Permission Map and Scene Autopsy as bounded R&D spikes.