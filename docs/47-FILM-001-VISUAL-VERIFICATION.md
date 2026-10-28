# Film 001 — Visual verification and canonical scene inventory v1

> Film: **The Truman Show (1998)**
> Viewing master: SHA-256 `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`
> Measured runtime: **6177.792 s**
> Date: 2026-10-28
> State produced by this document: **MASTER_IDENTIFIED + SECONDARY_SOURCES** (unchanged)
> Canonical promotion performed: **none**

## 1. What this closes

`docs/46-FILM-001-PROMOTION-READINESS.md` left two gates on all 39 research
evidence records:

- `EDITORIAL_SCENE_VERIFICATION` — no VERIFIED editorial scene existed;
- `VISUAL_REVIEW` — 22 of the 39 records depend on picture-level facts.

Both gates now have real, reproducible answers for most of the graph, and the
answer for the remainder is an explicit, evidence-backed "not yet" rather than
"unknown".

This is still not a licence to flip the edition to `LOCKED`. It is the map that
makes that flip a finite, checkable task.

## 2. Evidence channel and method

The 12.2 GiB master never left the machine that holds it. Verification ran on a
derived bundle produced by `scripts/film001-evidence-bundle/` and delivered
through Google Drive:

| Artifact | Content |
| --- | --- |
| `00-manifest.txt` | identity, parameters, timestamp mapping |
| `01-probe.json` | full stream/chapter/format probe |
| `02-chapters.csv` | 24 embedded chapter boundaries |
| `03-subs-en.srt` | embedded English subtitle track, **695 cues** |
| `04-cuts.csv` | **1019** shot-change candidates above scene score 0.32 |
| `05-frames/f_%05d.jpg` | 206 stills every 30 s at 800 px |
| `06-sheets/sheet_%03d.jpg` | 21 contact sheets, one 360 px thumbnail per 10 s |

Bundle manifest reported `identity_vs_recorded_master: MATCH`.

Because the stills are 30 s apart but the contact sheets sample every 10 s, every
observation below was read from the contact-sheet tile at the stated second, then
cross-checked against the subtitle cue when one exists. A tile at time `t` is
`sheet (⌊t/300⌋+1)`, tile index `⌊(t mod 300)/10⌋`, row-major 6×5.

Structural context used to choose boundaries:

- 24 embedded chapters, first at `0.000`, credits from `01:36:00.755`;
- cut density by minute: peaks at 46–47 (29 and 26 cuts) and 50 (30 cuts); the
  film is *cutless* in minute 22 and nearly so in minute 56;
- `04-cuts.csv` places a cut within ±2 s of 22 of the 23 dialogue-gap transitions
  longer than 8 s, i.e. chapter boundaries and dramatic transitions coincide.

## 3. Canonical scene inventory v1

New file: `src/data/films/the-truman-show-scene-inventory.ts`.

**23 scenes, all `VERIFIED`, covering `0 → 5760.755`, gapless and non-overlapping.**
Chapter 24 (credits) is recorded as master material, never as a scene.

| # | Scene id | Range (s) | Chapter |
| ---: | --- | --- | --- |
| 1 | `truman-sc-prologue` | 0 – 162.537 | ch-01 |
| 2 | `truman-sc-day-10909` | 162.537 – 409.283 | ch-02 |
| 3 | `truman-sc-aquaphobia` | 409.283 – 546.712 | ch-03 |
| 4 | `truman-sc-chefs-pal` | 546.712 – 583.457 | ch-04 |
| 5 | `truman-sc-dreaming-of-fiji` | 583.457 – 691.357 | ch-05 |
| 6 | `truman-sc-memories-of-dad` | 691.357 – 1034.7 | ch-06 |
| 7 | `truman-sc-lauren-sylvia` | 1034.7 – 1769.225 | ch-07 |
| 8 | `truman-sc-paranoia` | 1769.225 – 2218.215 | ch-08 |
| 9 | `truman-sc-no-place-like-home` | 2218.215 – 2553.926 | ch-09 |
| 10 | `truman-sc-travelers-beware` | 2553.926 – 2741.113 | ch-10 |
| 11 | `truman-sc-lady-flowers-dented-beetle` | 2741.113 – 2863.819 | ch-11 |
| 12 | `truman-sc-im-being-spontaneous` | 2863.819 – 3072.444 | ch-12 |
| 13 | `truman-sc-blocked-at-every-turn` | 3072.444 – 3176.631 | ch-13 |
| 14 | `truman-sc-mococoa` | 3176.631 – 3323.028 | ch-14 |
| 15 | `truman-sc-father-and-son-reunion` | 3323.028 – 3668.039 | ch-15 |
| 16 | `truman-sc-trutalk` | 3668.039 – 4197.985 | ch-16 |
| 17 | `truman-sc-do-you-think-he-knows` | 4197.985 – 4400.896 | ch-17 |
| 18 | `truman-sc-hes-gone` | 4400.896 – 4861.356 | ch-18 |
| 19 | `truman-sc-setting-sail` | 4861.356 – 5002.747 | ch-19 |
| 20 | `truman-sc-cue-the-storm` | 5002.747 – 5264.092 | ch-20 |
| 21 | `truman-sc-skys-the-limit` | 5264.092 – 5511.214 | ch-21 |
| 22 | `truman-sc-who-am-i` | 5511.214 – 5689.308 | ch-22 |
| 23 | `truman-sc-good-afternoon` | 5689.308 – 5760.755 | ch-23 |

This deliberately **replaces** the research-era 15 DRAFT scenes with 23
chapter-verified units. The old registry did not merely have inaccurate numbers:
it merged and split the film along the wrong joints.

> **Amendment (same day).** The canonical package merges the last three scenes
> into one continuous `truman-sc-final-act` (5264.092 – 5760.755), so the locked
> edition carries **21** scenes, not the 23 listed above. The Scene Autopsy
> contract requires a single honest range that contains all four of its anchors,
> and the wall → creator dialogue → exit sequence never leaves one location. See
> `docs/48-FILM-001-EDITION-LOCK.md` §4.

## 4. Visual verification ledger

New file: `src/data/films/the-truman-show-visual-verification.ts`.

| Status | Records |
| --- | ---: |
| `VISUAL_CONFIRMED` | **30** |
| `TRANSCRIPT_CONFIRMED` | 8 |
| `PENDING_LOCAL_REVIEW` | 0 |
| `CONTRADICTED` | **1** |
| **Total** | **39** |

**38 of 39 records are now verified**, each with the exact second its observation
was read from. One record is contradicted by the film and is held fail-closed.

## 5. Editorial findings

These are corrections to the research tier, not cosmetic edits.

### 5.1 One record is contradicted by the film

`truman-ev-raincloud` — «личный дождь». The record places a localized rain cloud
over Truman in chapter 08. Picture review of chapter 08 at 10 s granularity
(1790–1960 s) shows a dry drive, a dry street and no rain mechanism, and the
embedded English track contains **no rain cue anywhere in the film**. The beat
does not exist as described. The record may not be promoted as written.

### 5.2 Two records cite props that are different in the actual film

- `truman-ev-fingers` claims crossed fingers on a wedding-register photo. The
  actual picture fact is Truman's own **«HOW'S IT GOING TO END?» lapel button**
  at 1700 s, pinned with visibly crossed fingers, in the basement sequence. The
  interpretation survives; the stated object does not.
- `truman-ev-europe` claims a headline «Who needs Europe?». The legible front
  page at 1830 s reads **«CRACKDOWN ON HOMELESS — City Fathers say "Enough is
  Enough!"»** over a photograph of Kirk being taken away. The control argument
  survives and is in fact stronger, because the paper prints the very removal the
  audience just watched.

### 5.3 Three records mix two scenes and must be split

- `truman-ev-quota` — insurance quota (ch-03) + school flashback (ch-06).
- `truman-ev-reunion` — the embrace (ch-15) + the invented amnesia explanation
  and the return of Kirk, shown much later inside TruTalk (ch-16).
- `truman-ev-boat` — the control-room search (ch-18) + the sailing footage that
  opens ch-19.

### 5.4 The scene-autopsy warning is now measurable

`docs/45` warned that a chapter boundary is not a scene boundary. The inventory
above shows where that cuts both ways: the research scene «Стена и дверь» spanned
chapters 21–23, while the actual film keeps the painted-horizon walk in ch-21,
the creator conversation in ch-22 and the exit in ch-23, with the «ON AIR»
control-room material sitting in ch-17. Any autopsy anchored on the old estimate
would have quoted the wrong seconds.

## 6. What is still open

1. **Five records closed in the second pass** — ghost, knife, reunion, escape and
   cuesun are now `VISUAL_CONFIRMED`, each with a correction:
   - `truman-ev-knife` — the prop is not a kitchen knife but the **«Chef's Pal»
     dicer in its blister packaging**, the same product placed in chapter 04. The
     advertisement becomes the weapon, which sharpens the record.
   - `truman-ev-escape` — the bed is shown occupied at 4470 s and empty in the
     identical framing at 4570 s, so the absence is staged on camera. The «подкоп»
     (tunnel) part does not survive: no tunnel showing an escape route exists in
     that chapter and the text must be rewritten.
   - `truman-ev-reunion` — the embrace sits at 3610 s in the reunion scene, the
     invented «amnesia» 270 s later in TruTalk; the split is now evidenced rather
     than assumed.
   - `truman-ev-ghost` — the seizure is visible, and the newspaper that follows is
     the same front page already confirmed for `truman-ev-europe`.
   - `truman-ev-cuesun` — the command and the out-of-schedule dawn over the
     rooftops are both in picture.
2. **Consumer rewire** — the 14 compound research records still carry their old
   consumers, and the migration waves in `the-truman-show-evidence-migration.ts`
   must actually execute.
3. **Factual rewrite** — the contradicted and mis-cited records above must be
   rewritten before their stable IDs can survive into canon.
4. **`LOCKED` transition** — still atomic and still forbidden until 1–3 are done.

## 6b. Rewire map

`trumanResearchSceneRewire` in the inventory file maps all 15 research scene ids
onto the canonical inventory, and `trumanCanonicalScenesWithoutResearchOrigin`
names the six canonical scenes with no research-era predecessor. A test proves
every research scene is rewired exactly once, every target exists, and every
canonical scene is either rewired or explicitly new — so a wrong edge fails CI
instead of silently re-pointing a claim at the wrong second of the film.

## 7. Reproducibility contract

`tests/regression.test.ts` now enforces:

- the inventory is contiguous, gapless, starts at 0 and ends at the credits
  boundary, with sequential indexes and chapter ids that exist;
- every one of the live FilmPackage evidence ids has exactly one verification
  record and no id is duplicated;
- every observed frame time lies inside its declared scene and inside the
  measured runtime;
- the contradicted set is exactly `["truman-ev-raincloud"]` and every
  contradicted record states that it may not be promoted.

If any of those drift, CI fails before the edition can be promoted.
