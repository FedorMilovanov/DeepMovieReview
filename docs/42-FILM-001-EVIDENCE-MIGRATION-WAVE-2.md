# Film 001 — Evidence Migration Wave 2

> State: **MASTER_IDENTIFIED + SECONDARY_SOURCES**
> Depends on: #97–#100
> Scope: four medium-fan-out compound evidence records / 24 current support references

## Goal

Wave 2 separates four evidence records whose current prose mixes film observation with unrelated master moments or secondary/contextual facts.

No FilmPackage evidence is mutated by this PR. The purpose is to freeze a dependency-safe replacement contract before consumer rewiring.

## Migration set

| Retiring ID | Current support refs | Replacement direction |
| --- | ---: | --- |
| `truman-ev-daycount` | 7 | retain only the visible day counter as future visual evidence |
| `truman-ev-sylvia` | 4 | retain the disclosure sequence as transcript-grounded evidence |
| `truman-ev-fiji` | 6 | split Fiji departure dialogue from the visual Sylvia collage |
| `truman-ev-reunion` | 7 | split reunion staging from later amnesia explanation |

Total downstream support references guarded by this wave: **24**.

## Provenance cleanup

Wave 2 deliberately does **not** create canonical-film replacements for every sentence currently present in the research observations.

Examples:

- “about five thousand cameras”, age calculations and continuous-broadcast metadata are not visible merely because an on-screen day counter exists;
- Sylvia's later identity/activism context is not the same evidence moment as her disclosure to Truman;
- the thematic meaning of Fiji is interpretation, not an observable subtitle cue;
- ratings impact and “return to normal” language are not the same observation as the father/son reunion.

Those facts may remain in Sources/Method or supported analytical prose only when their provenance is explicit. They must not be silently reclassified as master observation.

## Implementation order after this plan

1. visually verify the day counter, collage and father-reunion timestamps;
2. create atomic replacement research evidence with exact DRAFT scene/timestamp ranges;
3. rewire the 24 support consumers according to what each claim actually needs;
4. assert all four retiring IDs have zero remaining consumers;
5. retire the compound records;
6. keep the package pre-lock until the remaining evidence waves are complete.

Wave 3 remains intentionally separate because `truman-ev-knife`, `truman-ev-storm` and `truman-ev-exit` jointly carry 33 support references, including Scene Autopsy wiring.
