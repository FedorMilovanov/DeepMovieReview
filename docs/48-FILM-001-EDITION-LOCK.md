# Film 001 — Edition lock

> Film: **The Truman Show (1998)**
> Viewing master: SHA-256 `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`
> Measured runtime: **6177.792 s**
> Transition performed: **`MASTER_IDENTIFIED + SECONDARY_SOURCES` → `LOCKED`**
> Date: **2026-10-28**
> Publication status: **unchanged — the film is still `draft`**

## 1. What changed

Film 001 now has a canonical package:

`src/data/films/the-truman-show-canonical.ts`

It replaces the research draft in the validated registry
(`src/data/film-registry.ts`), so every route and projection now reads a locked
edition. The research draft file is kept in the tree as the historical research
contract; it is no longer the package the application serves.

| Layer | Before | After |
| --- | --- | --- |
| Edition state | `MASTER_IDENTIFIED` | **`LOCKED`** |
| Research tier | `SECONDARY_SOURCES` | **removed** |
| Scenes | 15 × `DRAFT` | **21 × `VERIFIED`**, gapless to the credits boundary |
| Evidence | 39 research records, secondary provenance | **41 canonical records**, all citing the locked `film-edition` source |
| Scene provenance | research estimates | chapter-verified ranges (`docs/47`) |
| Film status | `draft` | **`draft`** (unchanged) |
| Indexing | closed | **closed** (unchanged) |

Locking the edition is an *evidence* milestone. It says: the analysis now cites
the film itself, at seconds that another editor can reproduce. It does not say the
text is finished, ready, or cleared for publication — the publication gate in
`src/lib/site-publication-policy.ts` is untouched.

## 2. The canonical evidence graph

41 records in `src/data/films/the-truman-show-canonical-evidence.ts`. Every one
carries:

- `sceneId` → a `VERIFIED` canonical scene;
- `timestampSeconds` → seconds from the Matroska presentation origin, inside that
  scene;
- `sourceIds: ["truman-src-master-bdrip"]` → the locked edition, and nothing else;
- a `spoilerLevel` never lower than its scene's level;
- observation prose that states only what is on screen or on the subtitle track
  at that second.

### 2.1 Retired, then rewritten

`truman-ev-raincloud` («личный дождь»). **This entry used to say the beat does not
exist in the film. That was wrong, and the record of the mistake is kept here on
purpose.**

Three picture passes (chapter 08 at 10 s granularity, 240–270 s, 1180–1210 s)
found no localized rain, and the subtitle track has no rain cue. None of those
windows contains 761 s: the beat sits at the water in chapter 06, which the pass
never sampled. «Not in the window we looked at» was escalated into «not in the
film», and a silent look at the track was treated as confirmation although the
scene is nearly wordless.

The record is therefore retired **as written** (wrong placement, wrong «the cloud
follows him» staging) and rewritten as `truman-ev-rain` at 761 s in
`truman-sc-memories-of-dad`; the lineage is recorded in
`trumanCanonicalEvidenceSummary.rewritten`, and docs/47 §8 holds the full
retraction. The two modules that cited the old record still cite the newspaper
front page for the control argument.

### 2.2 Split

| Research record | Canonical records | Why |
| --- | --- | --- |
| `truman-ev-knife` | `truman-ev-knife`, `truman-ev-knife-call` | The prop at 3250 s and the line at 3272 s are different observations, and the prop is a product-placement dicer, not a kitchen knife. |
| `truman-ev-reunion` | `truman-ev-reunion`, `truman-ev-reunion-amnesia` | The embrace is at 3610 s in the reunion scene; the invented «amnesia» explanation is 270 s later, inside TruTalk. |

### 2.3 Added

`truman-ev-setting-sail` — the sailing departure at 4970 s. It had no research
record at all; the «Santa Maria» departure was only ever described indirectly.

## 3. Editorial corrections carried into canon

These are the places where the research tier was wrong, not merely unsourced.

1. **The knife is a dicer.** At 3250 s Meryl holds the «Chef's Pal» hand-dicer,
   still in its blister packaging — the same product placed in chapter 04. The
   moral-analysis entry that said *Truman* grabbed a knife was rewritten: he
   presses her with questions, she is the one who picks the object up.
2. **The newspaper is not about Europe.** The legible front page at 1830 s reads
   «CRACKDOWN ON HOMELESS — Enough is Enough!», printed over a photograph of the
   very removal the audience has just watched.
3. **The crossed fingers are not on a wedding photo.** They belong to Truman's
   own «HOW'S IT GOING TO END?» lapel button at 1700 s. The relationship module's
   wedding beat was replaced with the ad-break beat that the film actually stages.
4. **There is no tunnel.** The escape is a staged absence: the room camera shows
   the bed occupied at 4470 s and empty in the same framing at 4570 s.
5. **The sky is a wall with a staircase.** At 5510 s the painted horizon ends in a
   flat panel with a ladder against it.

## 4. The final-act scene

The canon has **21** scenes rather than the 23 first drafted in `docs/47`. The
three final chapters collapse into one editorial scene, `truman-sc-final-act`
(5264.092 – 5760.755), because:

- the sequence is continuous — boat hits the wall, walks the shore, finds the
  stairs, argues with the creator, bows and exits, with no intervening location;
- the Scene Autopsy contract requires one honest range that actually contains all
  four anchors (wall, creator dialogue, «no camera in my head», exit).

This is precisely the case `docs/45` anticipated: the chapter map and the autopsy
range are different objects, and the schema is not to be weakened to force them to
agree. The chapters remain in `masterSegmentation` as objective provenance.

## 5. Gates

| Gate | State |
| --- | --- |
| `EDITORIAL_SCENE_VERIFICATION` | ✅ 21 VERIFIED scenes, gapless 0 → 5760.755 |
| `VISUAL_REVIEW` | ✅ 38 / 39 verified, 1 retired as non-existent |
| `CONSUMER_REWIRE` | ✅ 15 research scenes mapped, 39 records migrated |
| `FACTUAL_REWRITE` | ✅ five contradicted claims corrected in canon |
| `LOCKED_FILM_EDITION` | ✅ every record cites the locked source |

`npm test` runs the full graph validation on the canonical package itself:
`validateFilmPackage(theTrumanShowCanonicalPackage)` must return zero errors, or
CI fails.

## 6. What is deliberately still closed

- **Publication.** `film.status` is `draft`; indexing stays behind
  `DMR_SITE_INDEXING_ENABLED` and the published-feature gate.
- **Review.** No human editorial pass has signed the prose yet, so
  `sources-method.lastReviewedAt` remains unset.
- **Stills.** Nothing from the evidence bundle is authorized for publication
  (`docs/38` §9). The bundle lives outside git and stays there.
- **Character/relationship depth.** The modules still carry research-era depth in
  places. They are now *supported* by verified evidence, which is a different
  claim from being finished.

## 7. Post-lock amendment: three dialogue records for article v2

Recorded 2026-10-28. The lock covers the viewing master, not the editorial
surface built on it. Writing the public article exposed three statements that
carry the film's own argument and had no canonical anchor:

| Record | Second | Scene | Ledger status |
| --- | ---: | --- | --- |
| `truman-ev-manufactured-limits` | 3842.5 | `truman-sc-trutalk` | `TRANSCRIPT_CONFIRMED` |
| `truman-ev-nothing-left` | 3847.7 | `truman-sc-trutalk` | `TRANSCRIPT_CONFIRMED` |
| `truman-ev-seahaven-design` | 4052.5 | `truman-sc-trutalk` | `TRANSCRIPT_CONFIRMED` |

Each was read off the embedded English subtitle track at the stated second and
makes **no picture claim**: no prop, no gesture, no staging. They are ledgered in
`trumanPostLockEvidenceVerifications`, kept separate from the 39-record
research-era ledger, and named in `trumanCanonicalEvidenceSummary.postLock`.
Two further dialogue records (`truman-ev-marlon-retake`, 3459.2;
`truman-ev-camera-count`, 3895.0) were added in the same post-lock regime by the
module audit in `docs/51`, replacing an unverified «earpiece» claim and a camera
count borrowed from a secondary source.

Canonical evidence: 41 → 46. `editorialRevision` moved `canonical-lock-1` →
`article-v2`.

Nothing above is re-opened: the edition stays `LOCKED`, the scenes stay
`VERIFIED`, and the publication gate stays closed.

## 8. Post-lock amendment: character dimensions and reading order

Recorded 2026-10-28, from the rules-compliance audit in `docs/52`.

Two implementation rules were violated by the *presentation* of the package, not
by the master, so the lock itself is untouched:

1. **`docs/03` §5** asks nine questions of every central character. The schema
   could answer seven; `presentation` (aspirational / cautionary / mixed /
   merely focal), `loyalties`, `unchanged` and arc credibility had no field at
   all, and `identification` strength had none either. Without `presentation`
   `docs/09` §2's ban on *protagonist == role model* was unenforceable: the data
   simply could not say which one the film presents. All six characters of
   `truman-mod-characters` now carry `presentation`, `identification`,
   `loyalties`, `unchanged` and `arcCredibility{level,note}`; the five fields are
   required by the validator for any character in a **LOCKED** edition, and the
   spoiler projection keeps the profile-level ones (`presentation`,
   `identification`, `loyalties`) while still dropping the arc reading.

2. **`docs/03` §3** fixes the analytical order: form, then morally significant
   actions and decisions, then narrative stance and permission patterns, then
   biblical synthesis. `truman-mod-permission` was rendered *before* craft,
   autopsy and decision. It now stands after `truman-mod-moral`, and the module
   eyebrows run 01–14 without a gap: story, characters, relationship ×3, family,
   meaning, teaching signals, craft, autopsy, decision, moral analysis,
   permission, biblical synthesis, final synthesis, sources.

Neither change alters a scene, an evidence record, a timestamp or the runtime:
canonical evidence stays at 46, the 21 scenes stay `VERIFIED`, and the
publication gate stays closed. `lastReviewedAt` was **removed** from the
sources-method module rather than guessed: `docs/24` §4 calls that field
optional, the validator requires it only for a published analysis, and no human
editor has signed this one yet. The article keeps the same posture — `byline`
carries `draftedAt` and no `reviewedAt`.
