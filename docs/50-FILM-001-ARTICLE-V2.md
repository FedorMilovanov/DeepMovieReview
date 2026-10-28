# Film 001 — Article v2: the readable layer, and the claim it cost us

> Film: **The Truman Show** (1998), реж. Питер Уир
> Издание: `LOCKED`, SHA-256 `E8543F61…B3B575`, 6177.792 с
> Статья: `src/data/films/the-truman-show-article.ts` (article-v2, 2026-10-28)
> Предыдущая версия текста: `docs/49-FILM-001-ARTICLE-V1.md` (историческая)

This document records what happened when article v1 was ported from a markdown
file into the site as structured content. The port was not a copy job: it put
every number in the text through a measurement script and every timestamp
through the canonical evidence graph. One of the article's central claims did
not survive.

## 1. Why the article became data

v1 lived in `docs/49` as prose. Prose cannot be checked by a build, so the site
could only have quoted it by pasting it into JSX — which would have made a
public article the one surface on the platform with no integrity contract.

v2 is a typed `FilmArticle` on the package (`FilmPackage.article`), validated by
`src/lib/film-article-integrity.ts` on every build and in the test suite. The
rules are deliberately narrow:

1. **Edition binding.** An article may exist only for a `LOCKED` edition, and it
   must name that edition's `sourceId` and `measuredRuntimeSeconds`. A
   `MASTER_IDENTIFIED` package cannot carry one.
2. **No clock readings in prose.** Every timecode is a `timeline` item whose
   `timestampSeconds` must be *identical* to the cited evidence record's value.
   Manuscript timestamps are therefore impossible; the only colon allowed in
   prose is a declared Scripture reference (`scriptureRefs`), because
   «Деяния 17:26–27» and «87:44» look the same to a regex.
3. **No measured numbers in prose.** Every measured figure is a `measurement` or
   `measurement-table` reference into a committed dataset. The validator rejects
   prose containing any digit string the dataset produced (1019, 695, 124.75 …).
4. **Corrections must be sourced.** A `corrections` row cites evidence, a
   measurement, or declares `absentFromMaster` — never nothing, never both.
5. **Spoiler levels rise monotonically** across sections, so the reader's level
   hides a *suffix* rather than punching holes.
6. **Publication needs a human.** A published article without
   `byline.reviewedAt` fails validation. The build cannot sign for an editor.

Rendering: `/films/[slug]/article`, spoiler-gated, preview-only and `noindex`
while the film is `draft` — the same gate as the film page, not a second one.

## 2. The measurement dataset

`src/data/films/the-truman-show-master-windows.json` is generated, never
hand-written:

```
node scripts/film001-evidence-bundle/measure-master-windows.mjs \
  --bundle <bundle dir> --out src/data/films/the-truman-show-master-windows.json
```

Inputs are the derived-bundle artifacts of the locked master:

| Input | SHA-256 |
| --- | --- |
| `04-cuts.csv` (native resolution, `scene > 0.32`) | `77d91365975e99c89944f5c3f8b7fee9eb85ceb58d1964a6a99b80529ad392b6` |
| `03-subs-en.srt` (embedded English SubRip, 695 cues) | `db464c73e14a0d8d363e0d6fa5472e1483ad3d081580a90e9daff726628ef72d` |

Definitions, fixed once so the numbers cannot drift with the question:

- **transition** — one row of `04-cuts.csv`; threshold detection, not a shot log.
  A long dissolve can stay below the threshold. All prose says «обнаруженный
  переход», never «склейка».
- **hold** — the gap between two consecutive detected transitions.
- **cue start** — a subtitle cue belongs to a window when its start lies in
  `[from, to)`.
- **silence** — the gap between the end of one cue and the start of the next.
  The 418 s tail after the final cue is the credit roll and is excluded.

`src/data/films/the-truman-show-master-windows.ts` wraps the JSON, maps each
measurement to a verified scene, formats the figures (plurals, thousand
separators, timecodes) and exposes the resolver the validator needs. Display
spans are computed from the rounded length, so a reader who subtracts the
printed end from the printed start always lands on the printed length.

## 3. What the re-measurement cost us

v1's craft section rested on one sentence: that the library minute (22:00–23:00)
is *the only* minute in the film without an edit. Re-deriving the data showed
that the sentence is false.

| v1 claimed | Measured on the locked master |
| --- | --- |
| «22:00–23:00 — единственный такой отрезок в фильме» | Минута действительно без обнаруженных переходов (0 переходов, 5 реплик), но не единственная: нулевые 60-секундные окна есть ещё в шести местах основной части. |
| «склейки нет ни на приветствии, ни на её репликах» | Верно только для секунд: внутри библиотечной сцены два провала — 101.226 с (21:59–23:41) и 90.007 с (25:02–26:32). |
| «87:44–91:51: четыре минуты семь секунд, 28 склеек» | Самый длинный отрезок без реплик — 251.771 с (4:12, 87:40–91:52) и **30** обнаруженных переходов. 28 переходов — это число внутри окна 5264.092–5511.000, то есть подокна, а не всего отрезка. |
| «46:29–47:34: 29 склеек, 26 реплик» | 31 переход, 12 реплик. Прежние числа сняты разовым скриптом с другим правилом границ; теперь правило одно и записано в §2. |
| «восемь минут без реплик у края нарисованного неба» | 4:12. |
| «73:20–81:00: 76 склеек, 59 реплик» | Подтверждено: 76 / 59. |
| «1019 переходов, разница с 1036 — цена разрешения» | Подтверждено: 1019 на полном разрешении; 1036 — ранний прогон по копии 320 px из `the-truman-show-master-metrics.ts`. |

The replacement argument is stronger than the one it replaced, and it is the
argument the film actually makes: **the two longest stretches in the whole
picture without a detected transition are the two scenes where the show loses
control.**

| Rank | Stretch | Length | Scene | Cue starts |
| --- | --- | ---: | --- | ---: |
| 1 | 55:23–57:28 | 124.75 с | `truman-sc-father-and-son-reunion` — возвращение отца | 21 |
| 2 | 21:59–23:41 | 101.226 с | `truman-sc-lauren-sylvia` — библиотека, девушка в красном | 9 |
| 3 | 25:02–26:32 | 90.007 с | там же, дорога из города | 6 |

Threshold detection cannot prove «один непрерывный план». It can prove that the
edit does not intervene for two minutes in the scene where a dead man comes
back, and for a minute and a half in the scene where a stranger tells the hero
that the sky is fake. That is what the article now says, and it is enough.

## 4. Three evidence records added after the lock

The article needed three anchors the first forty-one records could not carry:
Christof's own statement of design intent, the production's admission that
limits were manufactured, and the classroom line that closes the escape route
before childhood. All three are dialogue facts read off the embedded English
subtitle track, inside the already verified `truman-sc-trutalk`.

| Evidence record | Second | Claim type |
| --- | ---: | --- |
| `truman-ev-manufactured-limits` | 3842.5 | dialogue only |
| `truman-ev-nothing-left` | 3847.7 | dialogue only |
| `truman-ev-seahaven-design` | 4052.5 | dialogue only |

They are ledgered in `trumanPostLockEvidenceVerifications` as
`TRANSCRIPT_CONFIRMED`, with **no picture claim**. The research-era ledger in
`the-truman-show-visual-verification.ts` stays pinned to its original 39
records; the addition is a separate batch and a separate count. Canonical
evidence goes 41 → 46 in total: these three, plus two more added by the module
audit in `docs/51` (`truman-ev-marlon-retake`, `truman-ev-camera-count`).
`trumanCanonicalEvidenceSummary.postLock` names all five so the promotion ledger
in `docs/48` still reconciles.

## 5. What changed in the package

- `FilmPackage.article?: FilmArticle` (`src/lib/film-package.ts`) — the article
  layer itself, including `measurement` references and `scriptureRefs`.
- `src/lib/film-article-integrity.ts` — the six rules above.
- `src/lib/film-article.ts` — suffix projection, reading time, the
  presentation-neutral measurement view type.
- `src/data/films/the-truman-show-article.ts` — the text (article-v2).
- `src/data/films/the-truman-show-master-windows.{json,ts}` — the dataset.
- `src/data/article-measurements.ts` — the per-film measurement registry; an
  article without a registered dataset fails closed at the route.
- `src/app/films/[slug]/article/page.tsx` — the route.
- `src/components/film-article/article-view.tsx`, `src/styles/film-article.css`
  — the reading surface.
- `src/app/films/[slug]/page.tsx` gained the entry link; `sitemap.ts` gains the
  article URL for published films only.
- `editorialRevision` moved `canonical-lock-1` → `article-v2`; the article's
  byline must match it (rule 1 of the validator is edition binding, and the
  revision check forces text and methodology to move together).

Twelve new tests cover the validator (edition binding, prose clock readings,
prose measured numbers, timestamp/evidence equality, measurement resolution,
human signature, suffix gating, corrections), plus the dataset's internal
consistency and the «printed span minus printed start equals printed length»
invariant.

## 6. What remains open

- **`byline.reviewedAt`** — the human editorial signature. Until an editor
  signs, the article cannot be validly published, by construction.
- **Publication gate** — the film is still `draft`, the route is preview-only
  and `noindex`. `docs/46` gates are closed; publication is a separate decision.
- **Stills** — the article carries no imagery. Authorizing stills is still the
  open question from `docs/38` §9, and it is an editorial-rights decision, not a
  build decision.

## 7. Second pass: the article was re-read against its own ledger

Recorded 2026-10-28, same edition, same revision (`article-v2`, still a draft).
The pass had one rule: every sentence that carries a fact about the film has to
be checkable against `the-truman-show-canonical-evidence.ts`, and every number
against the measurement dataset. What could not be checked was rewritten or
dropped.

### 7.1 A gap, not a typo: no character analysis

`docs/03` §3 puts characters and relationships (steps 2–3) before themes, form
and moral analysis. The article went from the plot (`02 / История`) straight to
props, craft and morality — the characters were discussed only where the
argument needed them. That made the readable layer weaker than the package it
sits on, which has a full `characters` module.

A seventh section, `03 / Персонажи` («Шесть человек, которые держат его небо»),
now stands between the plot and the props. It carries the dimensions the
schema gained in `docs/52` §3.1 — presentation, identification, loyalties,
unchanged — as prose: Truman as the film's one non-actor, Christof as the
cautionary figure with almost no identification invitation, Meryl and Marlon as
mixed cases (the ad recited into a quarrel; the promise delivered twice),
Sylvia as the one person removed for telling the truth, the mother as the case
where tenderness and job description cannot be told apart. The section is
`MAJOR`; the following three sections stay `ENDING` and the verdict `FULL`, so
gating is still a suffix, and the renderer hides exactly the last section at
`ENDING` (verified by `curl` on all five levels).

### 7.2 Claims this pass corrected

| Was | Now | Why |
| --- | --- | --- |
| «Эту сцену **полвека** читают…» | «почти три десятилетия» | The film is from 1998; the claim was simply wrong about time. |
| «самая короткая роль в фильме» | «одна из самых коротких ролей» | A comparative no data supports. |
| «Это **единственные** места, где никто не монтирует героя»; «монтаж исчезает совсем — **ровно один раз**» | «места, где…»; «в двух сценах монтаж пропадает на минуту и на полторы» | §3 of this document records **seven** zero-transition minutes in the main body, so uniqueness was false — and it was false against our own ledger. |
| «Свадебных фотографий в фильме достаточно» | dropped | No evidence record supports the existence of wedding photos; the correction table keeps the point that the crossed fingers are on the button. |
| «Фиджи, **самолёт**, посмотреть мир» | «Фиджи, вырваться, посмотреть мир» | No canonical record anchors the ticket. |
| «Кристоф держит волну **собственными руками**» | «не отдаёт команду прекратить, пока человек не оказывается на грани гибели» | Keeps the fact (the storm is his decision) and drops the picture claim. |
| «самый любимый человек на планете» | «его знает весь мир, а он об этом не знает» | Hyperbole stated as fact. |
| «Мы **всё время** на его стороне кадра» | «почти всегда» | The film does cut away to the control room and to the audience. |
| «в переполохе камеры мечутся, **в тишине — стоят**» | «в переполохе город режется в несколько раз чаще, чем у стены» | The old sentence contradicted the table printed directly above it: the quiet wall window has 28 transitions of its own. |
| «средняя плотность… один переход на несколько секунд» | «один переход примерно на шесть секунд» | The dataset measured 6.06 s; the round number is now a word, not a typed figure. |
| Correction row: «ни в субтитрах, ни в кадрах **соответствующей главы**» | «ни в одной проверенной главе, а в дорожке субтитров слово rain не встречается ни разу» | The old cell described a check we had not run that way; the new one states exactly what was checked. |
| Byline printed «редакция article-v2» | «черновик · article-v2» | An unsigned draft may not present itself as a reviewed edition. |

### 7.3 Scripture references are declared, not implied

The biblical section paraphrased Psalm 138, Acts 17 and Exodus 20 without
naming them. It now names them in the text and declares them in
`scriptureRefs`, which is the only way a colon may appear in article prose:
the validator strips declared references before it checks for clock readings.
Numbering follows the Synodal tradition the sources module already uses
(Псалом 138 = Hebrew 139).

### 7.4 The article now links into the analysis

Every section names the module it reads alongside (`moduleId`), and the page
renders that as a link that carries the reader's current spoiler level:
`/films/the-truman-show?spoilers=major#truman-mod-characters`. The rule is
enforced, not decorative — `validateFilmArticle` rejects an unknown module id,
a module whose spoiler level sits above the section's, and a run with no module
index at all (fail closed). `docs/09` §19 asks for traceability from the
readable layer into the evidence graph; this is the first link of that chain
that the reader can click.

### 7.5 State after the pass

- Article: 8 sections, `NONE → MINOR → MAJOR → ENDING ×4 → FULL`.
- Tests: 98 (the spoiler-gating test now derives its expectation from the
  section levels instead of hard-coding numbers, so adding a section no longer
  needs a test edit but a level regression still fails).
- Unchanged: edition `LOCKED`, 46 canonical records, no `reviewedAt`, film still
  `draft` and unindexed.

## 8. Third pass: the decision the article had been avoiding

Recorded 2026-10-28. Reading the eight sections back to back showed a hole in
the middle of the argument: the article discussed the world, the people, the
props, the craft and the guilt — and skipped the one action the film is built
around. `docs/03` §3 puts morally significant decisions (step 7) between form
and moral analysis (step 8), and the package has a full `decision` module. The
prose had no section for it.

`06 / Решение` («Дверь, море и поклон») now sits between craft and morality and
does what the module does, in prose: the knowledge fog (what he actually knows
at the door — and that Christof's «снаружи правды не больше» cannot be checked
by anyone in the story), the four pressures at once (threat, the voice that
sounds like a parent, the crowd, and his own fear of water), the goods genuinely
at stake (safety, home, the only family he has), the boat named «Санта-Мария»,
and the bow — the last thing he does inside the show is a performer's gesture,
which is how he leaves: using the show's own grammar against the show.

The section carries the editorial judgement with its qualification: the exit is
justified not because happiness waits outside — the film never promises that —
but because a person who is not trusted with his own life stops being a person
before he reaches the door.

Sections renumber to nine: `NONE → MINOR → MAJOR → ENDING ×5 → FULL`. Verified
on the built server: `NONE` 1 section, `MINOR` 2, `MAJOR` 3, `ENDING` 8, `FULL` 9.

## 9. Share cards described the site, not the page

Found while re-reading the head of the rendered document: `og:title` on both
the film page and the article was the site title, and `og:description` was the
site tagline. `<title>` was page-specific, so the defect was invisible in a
browser tab and very visible in a messenger.

Two things were wrong and both are now tested:

1. **No page-level `openGraph`.** The layout's card was inherited by every
   route. `src/lib/page-metadata.ts` now builds page identity — title,
   description, `og:type`, `og:url`, `og:site_name`, `og:locale`, image — and
   `generateMetadata` only adds routing concerns (canonical, robots).
2. **A trap under the fix.** Next replaces the page-level `openGraph` object
   wholesale instead of deep-merging it, so setting a title silently dropped
   `og:image`. The first attempt served a card with no picture at all. The
   builder now carries the image explicitly, and the regression test pins it.

Spoiler safety is part of the rule and part of the test: the article's share
description is the standfirst and nothing else, and the test fails if any
heading or standfirst from a section above `MINOR` appears in it. A share card
has no spoiler control next to it.

## 10. What is still missing

Written down so it is not rediscovered as a surprise. None of these is a
shortcut we took; each is work that needs an editor, a designer or a network
the build does not have.

| Gap | Why it is still open | Who closes it |
| --- | --- | --- |
| **Editorial signature** (`reviewedAt`, `lastReviewedAt`) | A human has to read the text and own it; the build cannot sign — an agent-issued date would turn a verifiable claim about an editorial act into a false one. Protocol ready: `docs/53` §1–§4 | editor |
| **Stills in the article** | The page is text-only. Stills need an editorial decision on quotation and a provenance entry in the visual-asset manifest (`docs/38` §9) | editor |
| **Per-film share art** | Closed: the film and its article now share their own card (`/og/truman-show-share.jpg`), declared in `src/data/film-share-assets.ts` and validated by the visual-asset registry — see §12 | done |
| **External source liveness** | Partly closed: the three load-bearing references (Wikipedia EN, BFI film card, BFI interview) were reachability- and content-checked on 2026-10-28 — see `docs/53` §5. The remaining ~27 hrefs are still shape-only; `curl` from the sandbox cannot leave it (000) | editor's browser or a CI link checker |
| **Production facts** (budget, gross, awards) | Cross-checked against Wikipedia/BFI on 2026-10-28 and recorded in `docs/53` §6. They stay in source locators, not in the evidence graph — by construction they are unverifiable against the master, and no conclusion in the article rests on them | editor |
| **Manual quality passes** | ~~Contrast~~ — now measured by a test (see `docs/52` §3.4: it found `--ink-4` at 3.90:1 under six blocks of small article text). Still manual: 200 % zoom, touch targets on a real phone, Lite mode on a mid-range Android. The repo has no browser/E2E/axe tooling | editor for the rest, or a new test tier |
| **Reader-facing evidence** | The reader can jump to a module but cannot see which evidence record backs a paragraph. Data-level traceability is enforced; the UI step is a product decision | product |
| **Article discovery** | There is no `/articles` index; the article is reachable from the film page and the sitemap, nothing else | product |
| **Relationship-module depth** | The article now carries the relationships in prose, but `truman-mod-relationship` still has research-era depth in places (`docs/48` §6) | editorial pass |

## 11. Fourth pass: the relationships the readable layer did not have

The third pass left a hole it could not see from inside the article: the package
analyses three relationships in depth — marriage as a contract
(`truman-mod-relationship`), friendship as a shift (`truman-mod-friendship`) and
the one-way bond with the creator (`truman-mod-creator`) — and **none of them
appeared in the readable layer**. A reader could learn what each of the six
characters is like and never learn what the film says about the links between
them, which is where its ethics actually live.

### 11.1 What was added

A new §4, «Три контракта вместо трёх отношений», at `MAJOR`:

- the marriage reads as an employment contract: the ad break in the middle of an
  argument, the supermarket grater raised at the husband, and the fact that
  «Сделай же что-нибудь!» is shouted past him, at the crew;
- the friendship reads as a shift: the beer that arrives over the honesty, and a
  promise delivered twice with a correction, so the retake itself is the
  evidence;
- the third bond is deliberately handed forward to §7, because the creator is
  an `ENDING` fact and dropping it in at `MAJOR` would have smuggled the ending
  into the middle of the piece.

Six timeline anchors (587.226 → 3464.272), all bound to canonical evidence, and
one pullquote that states the section's thesis without quoting the film.

### 11.2 The structural change it forced

A section could name exactly one module. This one needed two, and naming one
would have meant pointing at half of its own argument. `ArticleSection.moduleId`
became `moduleIds: string[]`:

- the validator resolves **every** id against the package's levels and rejects a
  blank list, a repeated id, and one bad id among good ones;
- the renderer lists the links under a single label, and the link text is the
  module's own heading, passed in from the package — so the article cannot drift
  from the module wording by paraphrasing it;
- four regression tests cover the plural form, including the fail-closed case
  when the package supplies no level index.

### 11.3 State

| | Before | After |
| --- | --- | --- |
| Sections | 9 | 10 |
| Words / reading time | ≈2245 / 23 min | ≈3713 / 25 min |
| Sections per spoiler level | 1 / 2 / 3 / 8 / 9 | 1 / 2 / 4 / 9 / 10 |
| Modules linked from the article | 9 of 16 | 11 of 16 |
| Tests | 100 | 100 |

Visibility at `NONE` is unchanged — one section, no relationships, no ending —
because the new section sits at `MAJOR` and the gating is a suffix, which the
integrity rule enforces rather than trusts.

## 12. The share card belongs to the film, not to the site

The gap register said per-film art was a design task. It was, and the design
task is done: two candidates were generated in one battle round, the editor
picked the first, and the winner was cropped to the share shape.

The image is an **original illustration, not a still**: a dome of painted sky
over an impeccable suburb, a man seen from behind with a suitcase, camera lenses
glinting in the architecture, a bright opening at the end of the street. No
frame of the film is reproduced and no performer's likeness is used, which is
what makes it publishable on the site's own account.

### 12.1 How it is declared

`src/data/film-share-assets.ts` holds the manifest — one declaration with two
readers:

- the **visual-asset registry** validates it like any other asset: id, alt text,
  aspect ratio, a `display` variant open to LITE, and generated provenance
  (`generator`, `promptVersion`, `createdAt`);
- **page metadata** takes only the `share-card` variant, so `og:image` is
  `1200×630` and cannot drift from the manifest.

The module uses relative imports because the regression build has no path
aliases; the app-side registry still imports it by alias. This is the same
split the test suite already forced on the measurement dataset.

### 12.2 Files

| Variant | Purpose | Size |
| --- | --- | --- |
| `/og/truman-show-share.jpg` | `share-card` (used by `og:image`) | 1200×630, 121 KB |
| `/og/truman-show-wide.jpg` | `display`, available to LITE | 1280×672, 138 KB |
| `/og/truman-show-master.jpg` | `editorial-master` | 2048×1075, 486 KB |

All three keep the declared 40:21 ratio, so any future crop starts from the same
frame instead of re-composing the picture.

### 12.3 What the tests now hold

- the manifest passes `validateVisualAssetManifest` — a broken card fails the
  suite, not the share;
- the film page **and** the article page emit the film's own `og:image`, and both
  agree with `twitter:image`;
- a film without art still gets the site card rather than no picture at all;
- the asset declares itself informative (not decorative), so empty alt text is a
  validation error.

Alt text deliberately describes the picture, not the plot: it says "a bright
opening at the end of the street", and does not name the ending.
