# Film 001 — Master segmentation contract

> Film: **The Truman Show (1998)**
> Viewing master: SHA-256 `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`
> Structural source: embedded Matroska chapters
> Coverage: **COMPLETE — 0.000 through 6177.792 seconds**

## Why this is a separate domain layer

The identified master contains 24 embedded chapters. Those boundaries are exact, reproducible properties of this file, but they are not automatically claims about dramatic scene grammar.

A container chapter can:
- contain several dramatic scenes;
- divide one continuous dramatic sequence;
- exist for navigation rather than analysis;
- include credits or other non-scene material.

Therefore DeepMovieReview models master segmentation separately from `FilmPackage.scenes`.

## Domain contract

`FilmPackage.ingest.masterSegmentation` is optional and may be present only after the exact viewing master is identified/measured.

For `basis: "EMBEDDED_CHAPTERS"` and `coverage: "COMPLETE"`, integrity requires:

1. at least one segment;
2. unique IDs and sequence indexes;
3. one-based array order;
4. finite non-negative start times;
5. finite end times greater than starts;
6. first segment starts at 0;
7. every adjacent boundary is gapless and non-overlapping;
8. no segment exceeds the measured runtime;
9. final segment ends at the measured runtime.

A small floating-point tolerance is used only for boundary comparison; it does not relax the semantic contract.

## Film 001 source of truth

The chapter table now lives once in:

`src/data/films/the-truman-show-master-segmentation.ts`

The re-anchor ledger re-exports the chapter API for compatibility, and the master-derived metrics read the segmentation source directly.

## What this does not do

Adding the 24 chapters to ingest does **not**:
- mark any research scene VERIFIED;
- replace the 15 current DRAFT scene estimates;
- assign a canonical scene to any evidence record;
- resolve picture-only evidence;
- permit the transition to `LOCKED`.

The 15 research-era scene IDs must be rebuilt by manual master review. Their measured re-anchor audit already demonstrates that several old scene records combine events from non-adjacent chapters.

## Scene Autopsy consequence

The current “Стена и дверь” autopsy spans material located across embedded chapters 21–23. That is evidence that chapter boundaries and editorial-scene boundaries are not interchangeable.

Do not weaken the existing Autopsy anchor integrity to force chapter alignment. Either verify an editorial scene/sequence range that honestly contains the anchors, or deliberately evolve the product to support a multi-scene sequence autopsy in a separate schema change.
