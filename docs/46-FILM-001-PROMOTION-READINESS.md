# Film 001 — Promotion Readiness Matrix

> State: **MASTER_IDENTIFIED + SECONDARY_SOURCES**
> Scope: **all 39 current Film 001 evidence records / all 182 current downstream references**
> Canonical promotion performed by this document: **none**

## Purpose

Film 001 now has several deliberately separate pre-lock contracts:

- exact viewing-master identity;
- objective master segmentation;
- master re-anchor ledger;
- three compound-evidence migration waves;
- factual rewrite candidates for stable IDs.

The readiness matrix combines those contracts into one machine-readable control plane:

`src/data/films/the-truman-show-promotion-readiness.ts`

Its purpose is to answer, for every **current** evidence ID:

1. which migration path it belongs to;
2. how many current downstream consumers depend on it;
3. which gates still block canonical promotion.

## Exhaustive partition

The current 39 research evidence records are partitioned exactly once:

| Path | Records | Current support refs |
| --- | ---: | ---: |
| `SPLIT_REQUIRED` | 14 | 71 |
| `FACTUAL_REWRITE` | 23 | 92 |
| `ALREADY_ATOMIC` | 2 | 19 |
| **Total** | **39** | **182** |

The two already-atomic records are:

- `truman-ev-interviews`;
- `truman-ev-dialog`.

“Already atomic” does **not** mean canonical or publishable. It only means those records do not need structural decomposition before the normal master-lock gates.

## Blocking gates

### `CONSUMER_REWIRE`

A compound research record will retire into new atomic evidence IDs. Every ClaimSupport / direct consumer must move deliberately before the old ID is removed.

### `FACTUAL_REWRITE`

The stable ID may remain, but its current observation prose mixes fact and interpretation. The factual rewrite contract must replace that prose before canonical promotion.

### `VISUAL_REVIEW`

At least part of the evidentiary force depends on picture-level facts: staging, props, gestures, framing, on-screen text or action not certified by an English subtitle cue.

A transcript timestamp is never accepted as a substitute for this gate.

### `EDITORIAL_SCENE_VERIFICATION`

Every current Film 001 editorial scene remains research-era `DRAFT`.

The 24 embedded Matroska chapters now live in `masterSegmentation` as objective edition metadata, but they are intentionally **not** FilmPackage scenes. Canonical evidence therefore still needs manual editorial-scene review and a VERIFIED scene range.

### `LOCKED_FILM_EDITION`

Current research evidence cites secondary/reference sources. Canonical real-film evidence must cite the locked active `film-edition` source.

No current record may bypass this gate merely because its transcript timestamp is known.

## CI contract

Regression coverage for this matrix must prove:

- all 39 current FilmPackage evidence IDs appear exactly once;
- no migration-wave, factual-rewrite or atomic classification overlaps;
- support fan-out for every ID still equals the current source graph;
- the three path counts remain 14 / 23 / 2;
- support totals remain 71 / 92 / 19 = 182;
- every current record is still blocked by editorial-scene verification and locked film-edition provenance;
- a visual blocker is derived only where the underlying migration/rewrite contract actually requires picture review.

Any drift means the readiness matrix is stale and CI must fail before canonical migration continues.

## What this enables next

After this contract is green, the remaining non-visual work can be sequenced precisely:

1. finish exact dialogue/cue wording for transcript-grounded atomic candidates;
2. prepare canonical source/scene migration mechanics without activating them;
3. keep all picture-dependent records fail-closed;
4. perform visual master review;
5. rebuild VERIFIED editorial scenes;
6. execute evidence migration and source switch atomically;
7. only then transition the edition from `MASTER_IDENTIFIED` to `LOCKED`.

This avoids both failure modes: pretending transcript cues verify the picture, and waiting on visual review before finishing every safe structural task.
