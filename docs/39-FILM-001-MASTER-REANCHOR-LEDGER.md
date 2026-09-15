# Film 001 — Master Re-anchor Ledger

> Film: **The Truman Show (1998)**
> State: **MASTER_IDENTIFIED + SECONDARY_SOURCES**
> Viewing-master identity: SHA-256 `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`
> Tracking: issue #43

## Purpose

This ledger is the fail-closed bridge between the old secondary-source research package and the future canonical `LOCKED` FilmPackage.

The machine-readable source of truth for this stage is:

`src/data/films/the-truman-show-master-reanchor.ts`

It deliberately lives **outside** the canonical FilmPackage evidence graph. Recording a master cue here does not make an old research claim canonical and does not permit publication.

## Three states

### `TRANSCRIPT_ANCHORED`

The relevant dialogue/text cue has an exact timestamp in the embedded English SubRip stream of the identified master.

This verifies **where the cue occurs**. It does not automatically verify every interpretive sentence currently attached to the corresponding evidence record.

### `MIXED_REVIEW_REQUIRED`

At least one component has a reproducible transcript anchor, but the existing evidence record also asserts picture-dependent facts, staging, props, gesture, framing, or combines multiple master moments.

These records normally need to be split or rewritten before canonical promotion.

### `VISUAL_REVIEW_REQUIRED`

The evidentiary force is primarily visual or on-screen graphic/text. No subtitle timestamp is accepted as a substitute for picture verification.

## Canonical chapter backbone

The 24 embedded master chapters are used as the objective first-pass provenance backbone because their boundaries are edition-bound and reproducible.

They are **not** treated as a claim that the film contains exactly 24 dramatic scenes. Finer editorial scenes, shots and Scene Autopsy units may be built inside them.

The backbone is continuous from `0.000` through the exact measured runtime `6177.792` seconds.

## Migration rule

A research evidence record may move into canonical FilmPackage evidence only after:

1. its retained factual observation has been re-observed against the identified master;
2. its canonical timestamp is assigned;
3. its canonical scene/chapter range is verified;
4. picture-dependent portions have actually been reviewed rather than inferred from subtitles;
5. the observation cites the locked `film-edition` source;
6. any production/history/craft-intention claims keep the relevant secondary provenance instead of being misrepresented as film observation.

Only after the complete retained evidence graph validates may Film 001 remove `SECONDARY_SOURCES` and transition atomically from `MASTER_IDENTIFIED` to `LOCKED`.

## Current coverage

The ledger covers **all 39 existing Film 001 evidence IDs**. CI enforces one-to-one coverage, unique evidence IDs, continuous chapter boundaries, valid chapter references, and that every transcript anchor falls inside its declared embedded-master chapter.

This is intentionally a re-anchor ledger, not a final review.
