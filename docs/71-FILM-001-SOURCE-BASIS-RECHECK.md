# Film 001: source and evidence-basis recheck

Rechecked 2026-11-03. This is an addendum to the historical ledgers, not a new continuous viewing of the master. The full master and audio were not available, and the declared master digest was not independently recalculated.

## External sources

- The old `paramountpictures.com/movies/the-truman-show` address resolves to the Paramount homepage, not the film card. The independently retrieved [current card](https://www.paramount.com/movies/the-truman-show) identifies **The Truman Show**, **1998**, and **Running Time 104 MIN**. The studio's rounded figure is not the precise duration of the separate master whose supplied metadata states 6177.792 seconds. The public registry and the frozen research data now use the current address; historical research documents remain historical.
- [FilmPlotHub](https://www.filmplothub.com/movies/the-truman-show-1998/) states that a makeshift tunnel beneath the basement reveals the escape route. That is the source's claim, not proof of the event. The available samples do not confirm this mechanism, and cannot prove it absent from the entire film. The scene summary and the correction table no longer assert either conclusion.
- [Adrian D'Ambra's running sheet](https://englishliteratureteacher.wordpress.com/2015/12/31/the-truman-show-directed-by-peter-weir-1998-running-sheet-by-adrian-dambra-2/) lists both *Who Needs Europe?* and *Crackdown on Homeless*. The available `f_00062` image reads *CRACKDOWN ON HOMELESS*; a different contact-sheet image carries the same nominal grid time, and the source PTS is not independently established. One image cannot exclude a different headline elsewhere, or identify the person in the photograph as Truman's father.
- [Lozier Institute](https://lozierinstitute.org/movie-reviews/the-truman-show-1998/) reports the boat's name as *Santa Maria* and the sail number as 139, and proposes a connection to Psalm 139; those are source claims and a reading, not an independent check of the image or creative intent. [Mark P. Shea](https://markpshea.com/archive_sheavings/a-catholic-look-at-the-truman-show/) names the boat but the retrieved text does not mention 139. The retrieved [Moviefone](https://www.moviefone.com/news/the-truman-show-jim-carrey-movie-trivia/) page did not expose its article body, so its earlier content could not be rechecked. The article and production dossier now preserve these distinctions.

`npm run audit:truman-source` follows redirects and checks the final HTTPS film-card path, HTTP 200, visible title, `Year 1998` and `Running Time 104 MIN`. Its offline tests include a simulated 200 homepage redirect containing all the expected words, missing fields, wrong paths, and hidden metadata/script text. The live CLI requires outbound access to Paramount; that direct connection was blocked in this sandbox. The independent web retrieval above is distinct from the simulated automated test and does not make the live CLI run successful.

## Subtitle and split-record scope

The supplied `film001-meta.zip` was retrieved again; its SHA-256 was `70e8bf79657edaf1bdccac0e7a758d25a7ec44d2cca6ab2990e2901312b37396`. Its `03-subs-en.srt` SHA-256 was `db464c73e14a0d8d363e0d6fa5472e1483ad3d081580a90e9daff726628ef72d`, matching the previously recorded bundle checksum. These hashes identify the retrieved archive and subtitle file; they do not independently identify the unavailable master.

| Record | Rechecked subtitle basis | What it does not establish |
| --- | --- | --- |
| `truman-ev-knife-call` | SRT block 391, 3272.199–3275.236: “Do something!”; one cue | Speaker, addressee, tone or audio. The old parent ledger's three entries at 3250, 3260 and 3272.199 are not three independent subtitle checks. |
| `truman-ev-reunion-amnesia` | SRT blocks 487–490, 3865.143–3882.947: context about Kirk and the 22-year absence, followed by “Amnesia” / “Brilliant”; four cues | Speaker identities or audio. The clip-frame basis for the separate embrace does not verify this text. |
| `truman-ev-escape` | SRT blocks 603–604, 4642.986–4650.235, include “He's gone” and “Cut transmission!”; two cues | How the disappearance happened, who speaks, or the audio. This basis supersedes the mixed image/text parent ledger for this record. |

The remaining split records were checked against their material: kitchen objects, tools and the embrace use the documented selected clip frames; the boat-search record and the sailing record retain a shared, explicitly pending parent basis. The sailing anchor is outside the parent window and is not presented as an independently checked frame. A parent ledger must not overwrite a child's own ledger or later explicit basis. The public evidence counts describe records, not independent checks.

The separate `truman-ev-dialog` record is based on SRT blocks 670–677, not on listening to the voices. Its wording and the article's parallel about a voice do not turn speaker attribution, sound or the visibility of the speaker into a result of that subtitle-only check.

The source and SRT assertions have deterministic regression tests, including a negative control that changes the subtitle claim back to a visual basis. Reader tests cover the corrected links, their basis, and the selected spoiler level in server HTML/RSC, no-JavaScript, blocked-script and hydrated navigation. Those tests do not replace a source-frame PTS mapping, continuous scene review, audio review, or a rights determination.
