# DeepMovieReview

**DeepMovieReview** is a planned interactive atlas of the moral structure of cinema: deep film analysis combining scene-level moral events, difficult decisions, psychology, narrative stance, biblical principles, editorial verdicts, and — later — independent audience/community data.

This repository is currently in **foundation / research / architecture** stage. Do not treat the present docs as a finished public methodology; they are the working specification to build and calibrate from.

## Core thesis

The project is intentionally **not** a simple sin counter, parental-content checklist, or Christian reskin of a conventional movie-rating platform.

Two methodological axioms:

- **Depiction ≠ Endorsement**
- **Explanation ≠ Justification**

Additional product invariants:

- **Editorial ≠ Crowd**
- **Moral Severity ≠ Film Quality**
- **Popularity ≠ Biblical Authority**

The long-term product direction is **Cinematic Moral Forensics**: film first, then examination, evidence, moral structure, biblical principle, and verdict.

## Foundation documents

Read in this order:

1. [`docs/00-PROJECT-CHARTER.md`](docs/00-PROJECT-CHARTER.md) — product thesis, differentiation, non-goals.
2. [`docs/01-VISUAL-CONSTITUTION.md`](docs/01-VISUAL-CONSTITUTION.md) — art direction, visual grammar, signature interactions.
3. [`docs/02-INFORMATION-ARCHITECTURE.md`](docs/02-INFORMATION-ARCHITECTURE.md) — film/scene/event/decision/claim/principle domain graph.
4. [`docs/03-RATING-METHODOLOGY.md`](docs/03-RATING-METHODOLOGY.md) — editorial dimensions, audience-score separation, confidence, aggregation principles.
5. [`docs/04-COMMUNITY-AND-AUDIENCE.md`](docs/04-COMMUNITY-AND-AUDIENCE.md) — future viewer score, decision voting, Moral Mirror, Audience Field, anti-brigading foundations.
6. [`docs/05-TECHNICAL-ARCHITECTURE.md`](docs/05-TECHNICAL-ARCHITECTURE.md) — Next.js/React/Three.js direction, persistent GPU stage, WebGPU/WebGL2/Lite tiers, accessibility/performance.
7. [`docs/06-EXPERIENCE-BLUEPRINT.md`](docs/06-EXPERIENCE-BLUEPRINT.md) — homepage storyboard and 30+ possible film-page modules.
8. [`docs/07-ROADMAP.md`](docs/07-ROADMAP.md) — phased delivery plan from one-film vertical slice to Moral/Dilemma Atlas.
9. [`docs/08-REFERENCE-AUDIT.md`](docs/08-REFERENCE-AUDIT.md) — 70+ current visual, technical, ratings and competitor references audited through 2026-09-09.
10. [`docs/09-AGENT-BUILD-RULES.md`](docs/09-AGENT-BUILD-RULES.md) — non-negotiable guardrails for coding/design agents.
11. [`docs/10-OPEN-QUESTIONS.md`](docs/10-OPEN-QUESTIONS.md) — unresolved decisions and next audit targets.

## Signature interaction vocabulary

The visual system uses a small semantic grammar rather than arbitrary effects:

- **FRAME** — cinema / viewpoint
- **LENS** — examination
- **FRACTURE** — moral rupture
- **TRACE** — causality / consequence
- **FOG** — limited knowledge / uncertainty
- **CORE** — structured moral fingerprint
- **LIGHT** — truth / disclosure

Primary future signature systems include:

- Moral Lens
- Living Film Frame
- Scene Autopsy
- Film Dissection
- Moral Core
- Moral Timeline
- Decision Chamber / Knowledge Fog
- Audience Field (later)
- Moral Mirror (later)

## Initial implementation strategy

Do **not** begin by building a giant movie database or social network.

The first meaningful milestone is one production-quality film vertical slice proving:

`Hero → Verdict Snapshot → Moral Timeline → Scene Autopsy → Decision Chamber → Biblical Principle → Final Verdict`

with a real structured data model and usable reduced-motion/Lite fallback.

## Status

Current phase: **Phase 0 — Foundation / audit / architecture**.

Next major decision: select the pilot film and turn the foundation docs into bounded technical/editorial prototypes.