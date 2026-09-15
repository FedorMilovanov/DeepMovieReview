# Film 001 — Factual evidence rewrite candidates

> State: **pre-canonical editorial contract**
> Scope: **23 stable evidence IDs / 92 current support references**
> FilmPackage mutation: **none**

## Purpose

Fourteen compound evidence records are already covered by migration Waves 1–3. The remaining 23 records do not need new IDs, but many of their current `observation` strings mix:

- observable dialogue/action;
- picture-only staging;
- secondary production/context facts;
- editorial interpretation.

This contract defines what may remain in a future factual observation and what must move back to visual verification, Sources/Method, or the supported claim layer.

Machine-readable source:

`src/data/films/the-truman-show-evidence-rewrite.ts`

## Verification groups

- **9 TRANSCRIPT_ONLY** — a measured embedded-English cue can support a narrowed factual observation now;
- **6 TRANSCRIPT_PLUS_VISUAL** — transcript supports only part of the event; picture-dependent assertions remain pending;
- **8 VISUAL_ONLY** — no factual rewrite text is accepted yet; `candidateObservation` is deliberately `null`.

Total: **23**.

## Why visual-only candidateObservation is null

A polished sentence can look verified even when it was reconstructed from a script, memory or secondary plot summary. For visual-only evidence this file therefore stores only a precise `visualReviewTarget`.

That is a deliberate fail-closed boundary.

## Support graph

These 23 stable IDs currently feed **92 downstream support references**. Their IDs are preserved by design, so future factual cleanup does not require mass consumer rewiring.

CI must nevertheless freeze current fan-out counts. If another branch changes a consumer, this rewrite plan should drift visibly rather than silently assuming an old graph.

## Canonical migration rule

A candidate may enter the canonical FilmPackage only when:

1. its required verification mode is satisfied;
2. the exact timestamp and canonical scene range are known;
3. the active locked `film-edition` source supports the film observation;
4. secondary/context assertions retain their own provenance;
5. interpretation remains in modules/claims rather than being smuggled into the raw observation.

This contract does not itself change `MASTER_IDENTIFIED + SECONDARY_SOURCES`.
