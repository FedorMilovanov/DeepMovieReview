# Film 001 — Editorial Scene Migration Readiness

> State: **MASTER_IDENTIFIED + SECONDARY_SOURCES**
> Current research scene registry: **15 DRAFT scenes**
> Current dependencies: **39 evidence→scene placements + 1 direct module→scene reference**
> Canonical scene IDs created here: **none**

## Why this layer is separate

The exact viewing master now exposes 24 continuous embedded Matroska chapters through `ingest.masterSegmentation`.

Those chapters are objective edition metadata. They are **not** automatically dramatic/editorial scenes.

The current Film 001 package still contains 15 research-era DRAFT scenes whose ranges were estimated before the master was available. This migration contract describes how those old scene buckets relate to measured master segments without pretending that the relation defines final canonical scene boundaries.

Machine-readable source:

`src/data/films/the-truman-show-scene-migration.ts`

## Current topology

| Shape | Old DRAFT scenes |
| --- | ---: |
| Single master-segment candidate | 6 |
| Multi-segment aggregate | 9 |
| **Total** | **15** |

The six single-segment candidates are still blocked by manual editorial-scene review. “All current evidence falls inside one chapter” is a locator fact, not proof that the chapter and the semantic scene are identical.

The nine multi-segment aggregates are structurally unsafe to promote as-is.

## Dependency accounting

The current 15 scene IDs carry:

- **39** evidence `sceneId` placements;
- **1** direct module-level scene reference.

The direct consumer is the Scene Autopsy:

`truman-mod-autopsy.sceneId → truman-sc-door`

That direct dependency must migrate atomically with the autopsy's evidence anchors when the final scene registry is rebuilt.

## Particularly invalid research aggregates

- `truman-sc-morning` spans ch01 + ch02;
- `truman-sc-school` spans ch03 + ch06;
- `truman-sc-travel` spans ch05 + ch10 + ch14;
- `truman-sc-meryl` spans ch09 + ch14;
- `truman-sc-reunion` spans ch15 + ch16 + ch17;
- `truman-sc-door` spans ch21 + ch22 + ch23.

These demonstrate why retiming the old 15 scene records would be unsafe.

## Fail-closed migration rule

No entry in this file proposes a final replacement scene ID or VERIFIED range.

Before an old DRAFT scene can retire:

1. all affected evidence has completed its own split/rewrite/verification path;
2. actual editorial boundaries have been reviewed against the master picture and sound;
3. a replacement VERIFIED FilmSceneRecord exists;
4. every evidence `sceneId` consumer has moved to the correct replacement;
5. any direct module scene consumer has moved in the same bounded change;
6. the old research scene has zero remaining consumers;
7. only then may it be removed.

## CI contract

Regression coverage must prove:

- exactly 15 current DRAFT scene IDs are covered once;
- exactly 39 current evidence placements are accounted for;
- exactly 1 current direct module scene reference is accounted for;
- current evidence IDs attached to each scene still match the live FilmPackage;
- every referenced master segment exists in `ingest.masterSegmentation`;
- shape classification matches segment cardinality;
- all current scenes remain `DRAFT`;
- `truman-mod-autopsy` still points to `truman-sc-door` until a deliberate atomic migration occurs.

This gives the canonical scene rebuild the same dependency safety already established for evidence migration.
