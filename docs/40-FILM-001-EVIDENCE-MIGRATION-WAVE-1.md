# Film 001 — Evidence Migration Wave 1

> State: **MASTER_IDENTIFIED + SECONDARY_SOURCES**
> Depends on: master intake #97, edition-state model #98, master re-anchor ledger #99
> Scope: seven low-fan-out compound evidence records

## Why this exists

Film 001 currently has 39 research evidence IDs and 182 downstream support references. Several evidence records combine multiple master moments or mix observable facts with editorial conclusions.

Changing those IDs directly would be risky because ClaimSupport, summarySupport, Story beats, character support, Decision/Knowledge Fog, craft, moral and final-synthesis layers can all reference the same evidence.

Wave 1 therefore freezes the replacement graph **before** mutating FilmPackage.

Machine-readable plan:

`src/data/films/the-truman-show-evidence-migration.ts`

## Selection rule

Wave 1 contains compound evidence with relatively low support fan-out:

| Retiring ID | Current support refs | Planned result |
| --- | ---: | --- |
| `truman-ev-light` | 1 | split visual fall / transcript explanation |
| `truman-ev-quota` | 2 | split office pressure / school exploration |
| `truman-ev-ghost` | 2 | split father reappearance / cover-story response |
| `truman-ev-escape` | 3 | split escape method / broadcast interruption |
| `truman-ev-boat` | 1 | split sailing / audience reaction |
| `truman-ev-conception` | 3 | rewrite as one factual plan; move privacy conclusion to claims |
| `truman-ev-trutalk` | 2 | split Christof interview / Sylvia call / control-room setting |

## Fail-closed contract

Regression tests for this plan must verify:

- every retiring evidence ID still exists in the current Film 001 research package;
- its support-reference count is exactly the expected value above;
- every proposed replacement ID is unique and does not already exist;
- every replacement chapter exists in the measured-master chapter backbone;
- every declared transcript timestamp lies inside one of its declared chapters;
- a declared transcript timestamp must correspond to a cue already represented by the master re-anchor ledger for the retiring evidence record.

If any of those conditions drift, the migration plan must fail CI before a content rewrite is attempted.

## Next implementation step

After this plan merges, migrate **one retiring ID at a time** or one tightly coupled pair:

1. add the replacement research evidence records;
2. rewire every consumer in the same change;
3. assert the retiring ID has zero downstream references;
4. remove the old compound record;
5. keep the replacements research-tier until the required picture/dialogue verification is complete;
6. do not move the film to `LOCKED` merely because a replacement exists.

High-fan-out evidence such as `truman-ev-exit`, `truman-ev-storm`, `truman-ev-marlon` and `truman-ev-routine` intentionally remain for later waves.
