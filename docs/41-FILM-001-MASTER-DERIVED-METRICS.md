# Film 001 — Master-derived editorial metrics

> Film: **The Truman Show (1998)**
> Viewing master: SHA-256 `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`
> State: **editorial measurement only; not canonical analytical evidence**

## Method

A complete read-only decode of the identified 1920×1080 master was performed with FFmpeg 8.1.2.

For scene-change navigation the video was downscaled to 320 pixels wide and evaluated with:

`select='gt(scene,0.32)'`

The resulting **1036 scene-change candidates** are algorithmic transition candidates. They are **not** asserted to be 1036 editorial cuts, shots or narrative scenes.

The exact embedded English SubRip stream contains **695 cues**. Cue count is not the same as dialogue-line count: one cue can contain multiple lines, and non-verbal stretches can contain no cue.

Machine-readable data:

`src/data/films/the-truman-show-master-metrics.ts`

## Chapter-level measurements

| Chapter | Duration (s) | Change candidates | Candidates/min | English cues | Cues/min |
| --- | ---: | ---: | ---: | ---: | ---: |
| 01 | 162.537 | 14 | 5.17 | 25 | 9.23 |
| 02 | 246.746 | 59 | 14.35 | 32 | 7.78 |
| 03 | 137.429 | 23 | 10.04 | 12 | 5.24 |
| 04 | 36.745 | 11 | 17.96 | 5 | 8.16 |
| 05 | 107.900 | 6 | 3.34 | 19 | 10.57 |
| 06 | 343.343 | 59 | 10.31 | 41 | 7.16 |
| 07 | 734.525 | 87 | 7.11 | 70 | 5.72 |
| 08 | 448.990 | 71 | 9.49 | 38 | 5.08 |
| 09 | 335.711 | 78 | 13.94 | 44 | 7.86 |
| 10 | 187.187 | 40 | 12.82 | 19 | 6.09 |
| 11 | 122.706 | 48 | 23.47 | 19 | 9.29 |
| 12 | 208.625 | 54 | 15.53 | 38 | 10.93 |
| 13 | 104.187 | 23 | 13.25 | 14 | 8.06 |
| 14 | 146.397 | 23 | 9.43 | 24 | 9.84 |
| 15 | 345.011 | 25 | 4.35 | 49 | 8.52 |
| 16 | 529.946 | 88 | 9.96 | 90 | 10.19 |
| 17 | 202.911 | 54 | 15.97 | 31 | 9.17 |
| 18 | 460.460 | 77 | 10.03 | 59 | 7.69 |
| 19 | 141.391 | 33 | 14.00 | 15 | 6.37 |
| 20 | 261.345 | 86 | 19.74 | 21 | 4.82 |
| 21 | 247.122 | 28 | 6.80 | 0 | 0.00 |
| 22 | 178.094 | 31 | 10.44 | 26 | 8.76 |
| 23 | 71.447 | 17 | 14.28 | 4 | 3.36 |
| 24 | 417.037 | 1 | 0.14 | 0 | 0.00 |

## What can be said safely now

These measurements support **navigation and later craft verification**.

Examples of factual comparisons:

- Chapter 11 has the highest candidate-transition density in this scan: **23.47/min**.
- Chapter 20 is also high at **19.74/min**, while its embedded-English cue density is only **4.82/min**.
- Chapter 15 is comparatively sparse in scene-change candidates at **4.35/min** while retaining **8.52 subtitle cues/min**.
- Chapter 21 contains **zero embedded-English subtitle cues** in this master.
- Credits (chapter 24) are intentionally kept in the data so all master-derived sums reconcile to the exact full runtime.

Those differences are measurements, not yet claims about dramatic meaning, pacing quality, audience psychology or editorial intent.

## Publication boundary

Do not cite these metrics as canonical FilmPackage evidence until the relevant analytical claim has an appropriate LOCKED film-edition evidence chain.

The data may guide:
- where to inspect pacing changes;
- where a Scene Autopsy may be especially useful;
- where dialogue density and visual transition density diverge;
- which chapters deserve closer manual craft review.

It must not replace manual review of composition, performance, editing intent, lighting or sound.
