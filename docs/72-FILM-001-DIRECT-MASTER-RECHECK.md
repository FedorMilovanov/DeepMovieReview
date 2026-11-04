# Film 001 — direct master provenance and bounded audiovisual witness

> Recorded: **2026-11-04**. Supplements [the historical ingest](29-FILM-001-INGEST-STATUS.md), [edition lock](48-FILM-001-EDITION-LOCK.md) and [2026-11-03 source-basis audit](71-FILM-001-SOURCE-BASIS-RECHECK.md). Tracker: [issue #43](https://github.com/FedorMilovanov/DeepMovieReview/issues/43).
>
> This is a **source-led, selected-window technical review** of the exact local viewing master, **not** a continuous full-length human picture/audio review, restoration of upstream retail provenance, rights clearance, or authorization to index the site.

## Exact-master identity

The owner's actual local file, identified publicly only by basename `The Truman Show (1998) BDRip.mkv`, was **read in place** (not uploaded or committed). A fresh full-file Windows PowerShell `Get-FileHash -Algorithm SHA256` on 2026-11-04 returned:

`E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575`

This **exactly matches** the existing locked edition's recorded digest. `ffprobe` independently reported:

| Measurement | Direct observation |
| --- | --- |
| File size | `13,099,008,485` bytes |
| Runtime | `6,177.792` seconds, Matroska |
| Video | H.264, 1920×1080, `24000/1001` FPS |
| Embedded chapters | 24 |
| English original | DTS, six channels at 48 kHz, stream `0:5` |
| Embedded English transcript | SubRip, stream `0:8`; two Russian SubRip streams also present |

This settles the **current file-to-edition identity** for the checked local copy, but not a claim that it is a particular physical disc, untouched retail remux or studio master. The original size and modification timestamp were reconfirmed after inspection.

## Method and evidence levels

- **Picture:** FFmpeg sampled frames at the listed regular intervals from that exact MKV; contact sheets and a few full-resolution frames were inspected. A reported window is a sampling window, **not every frame observed** and not a whole-scene visual continuity review.
- **Sound:** FFmpeg decoded bounded windows from the original English DTS track to memory; the preinstalled offline `faster-whisper-small` CPU model generated candidate phrases, then those were compared against the embedded English SubRip cues where available. Speech recognition is **not** speaker diarization, independent human listening or reliable transcription of low-speech/music passages.
- **Time convention:** offsets in seconds from the declared Matroska presentation origin. Contact-sheet and ASR sample offsets are approximate; when corroborated by original SRT, that cue's own timing is cited separately. No sampled image was promoted into proof that a detail appears nowhere else.
- **Privacy/rights:** no original film, soundtrack, frames, ASR verbatim transcript or screenshot artifacts were committed or uploaded to GitHub. Local temporary diagnostic media and the ASR script were removed after this ledger was written. Public stills and generated images have their own use-rights review gate in issue #43.

## Selected-window witness ledger

| Witness | Direct local window | Observed and verified | Boundaries that remain |
| --- | --- | --- | --- |
| `F001-RAIN` | Picture ~736–816 s, 4 s sampling | Localized rain falls over Truman and subsequently broadens across more of the scene. This corrects the former denial of the localized-rain beat. | The exact artificial-rain mechanism, director's intent and every intervening image were not audited. Earlier nominal still `truman-ev-rain` retains its historical basis. |
| `F001-NEWS` | Picture 1830–1910 s, 4 s sampling; original English SRT cue starting `1841.935` s | Newspaper visibly bears `CRACKDOWN ON HOMELESS`; matching title is in the embedded SRT. | The photograph's subject is **not** independently identified as the man Truman had encountered; the competing `Who Needs Europe?` headline is not disproved elsewhere. Existing `truman-ev-europe` dates to an earlier still-only witness. |
| `F001-KITCHEN` | Picture 3210–3310 s, 5 s sampling; original sound 3235–3295 s; SRT cue `3272.199–3275.236` | Cocoa presentation, tools and subsequent physical restraint appear in separate frames. The isolated English soundtrack and SRT both contain the brief `Do something!` request, followed by questions directed at the utterance. | ASR and SRT do not alone authenticate every speaker, addressee, motive or continuous physical action. Updated `truman-ev-knife-call` reflects only the added sound witness. |
| `F001-MARLON` | Original English sound 3400–3535 s, sampled picture ~3410–3640 s | The soundtrack contains two close phrasings of a pledge to step into traffic for Truman, then the pledge not to lie to him. Sampled picture shows Marlon near Truman and alternating production-control imagery. | These checks establish an audible repetition, **not** its full behind-the-scenes causal chain or unique attribution of each overlapping voice. Do not infer what Marlon secretly feels. |
| `F001-FATHER` | Sampled picture ~3500–3640 s | A figure approaches across the bridge in fog; Truman reacts; the scene alternates with production-control screens and a later reunion. | The exact prior knowledge and production role of every participant were not independently established. |
| `F001-ESCAPE` | Picture 4530–4690 s (8 s), tighter 4580–4660 s (4 s); sound 4580–4680 s | Camera/control-room views show a search of the cluttered basement, followed by discovery that Truman is missing. The original soundtrack and SRT include `He's gone` and `Cut transmission!`. | The exact physical exit route, presence/extent of a tunnel and who spoke each overlapping line are not established by these samples. The external tunnel narrative remains unpromoted. |
| `F001-SAIL` | Picture ~4880–5080 and 5040–5520 s; full-resolution sampled frames **5234–5236 s** | Numerals **139** are visibly printed on the sail during the storm, independently of a secondary interpretation. | The boat name **Santa Maria** has not been independently established by these checked frames; an intentional reference to Psalm 139 cannot be deduced from a visible number alone. The older `truman-ev-setting-sail` at ~4970 s is an earlier, different narrative point and must not be silently treated as a witness to 5235 s. |
| `F001-FINALE` | Picture ~5380–5650 s at 7–8 s sampling; sound 5490–5650 s | The vessel meets a painted sky barrier, Truman goes toward a stairway, and the sequence alternates his reactions with the control room. The English dialogue track was decoded; ASR accurately caught portions but is unreliable for long pauses/music. | Full line-by-line speaker attribution, soundtrack scoring/silence, theological symbolism and complete continuity still need synchronized human review. The embedded SRT remains the text basis. |

## All nine published stills: exact binary digests and bounded direct-master matches

On 2026-11-04, fetched the repository's nine JPEG and nine AVIF **bytes** under `assets/film-stills/` directly into disposable local memory and confirmed **all 18 SHA-256 values** match the corresponding `imageSha256` and `avifSha256` in `src/data/films/the-truman-show-stills.ts`. This is a complete check of the **registered image inventory**, not a determination of permission to publish film frames.

The first **coarse** local comparison sampled decoded original-master frames at one-second intervals around each nominal mark and produced misleadingly low correlations for three visually matching shots. Those coarse scores were **not** used for the final matching assessment. A second independent check explicitly decoded **one original-master frame at the specified source second per still**, scaled that RGB frame and the registered JPEG to the same 400×225 dimensions, then computed full-image luminance Pearson correlation and RGB mean absolute pixel difference (`MAE` in 0–255 channel values). Crucially, this was a fresh direct decode, **not the previous indexed-frame result**. Full-resolution source frames were also inspected where the first search was ambiguous.

| Still | Historical nominal time (s) | Direct seek in original MKV (s) | Correlation | RGB MAE | Bounded result |
| --- | ---: | ---: | ---: | ---: | --- |
| Light | 210 | 225 | 0.99683 | 3.87 | Same fixture and composition; ~15 s bin offset |
| Rain | 750 | 766 | 0.89545 | 3.37 | Same localized rainfall; ~16 s bin offset |
| Radio | 1800 | 1815 | 0.96368 | 10.08 | Same turning face and in-car composition; former weak coarse score discarded |
| Monitor | 3450 | 3464 | 0.92598 | 8.69 | Same monitor shot; ~14 s bin offset |
| Kitchen product | 3240 | 3255 | 0.95533 | 5.99 | Same hand, kitchen counter and tool packaging; former weak coarse score discarded |
| Meryl tools | 3265 | 3265 | 0.99883 | 2.68 | Same actress, tools and framing; former weak coarse score discarded |
| Meryl held | 3275 | 3275 | 0.99877 | 2.77 | Same TV-monitor shot |
| Reunion | 3591 | 3590 | 0.80801 | 7.60 | Same reunion, approximately one second different |
| Exit | 5700 | 5716 | 0.94457 | 5.35 | Same exit shot; ~16 s bin offset |

**Important:** `sampleTimeSeconds` for each 30-second `samplingKind: "grid"` still is the **nominal start of a historical sampling bin** (multiples of 30), not an independently verified exact source-frame presentation timestamp (PTS). The selected image falls approximately at the bin midpoint. Do not silently replace canonical scene/evidence anchor times with these matched still-frame estimates, relabel nominal bins as exact film PTS, or claim that every byte of a film-derived JPG/AVIF is identical to a new decode. Per-file SHA-256 verifies the **repository image bytes**; scene matching against the exact master is a **separate** visual check with time and resolution limits. The clip-derived stills use their independently recorded clip start + offset. These checks cannot establish film-image use rights or complete synchronized viewing of the original.

No copyrighted stills or extracted master frames were committed or uploaded. Temporary local script, fetched still bytes and sampled media were deleted after the checks.

## Canonical direct-source evidence for sail numerals

The 2026-11-04 source witness now carries a distinct canonical record `truman-ev-sail-139`, anchored in VERIFIED `truman-sc-cue-the-storm` at 5235 s. Its three bounded direct-MKV picture samples are recorded in `trumanPostLockEvidenceVerifications` as `VISUAL_CONFIRMED`. The earlier `truman-ev-setting-sail` at historical 4970 s **remains PENDING for the different assertion about the boat name**. A visible number neither confirms `Santa Maria` nor proves deliberate Psalm symbolism. No changes to image binaries or rights/serving settings.

## Open editorial decisions — do not claim full closure

1. Complete and sign off a **continuous picture-plus-sound master pass** for contested scene causal chains, speaker identities, character inferences, editorial synopsis and moral/biblical synthesis; record evidence/counterevidence per claim. A successful hash and sampled ASR do not satisfy this.
2. Audit every currently public still and derivative according to a jurisdiction-appropriate rights/use determination. As of this check the still registry has **nine images in two encodings (18 binaries)**; the earlier publication memo's four stills describe its own historical milestone.
3. Keep indexing disabled on the existing preview host unless the owner authorizes a public searchable launch; `LOCKED`, `published`, successful CI and full-file SHA match are **not** indexing permission.
4. Keep historical dated documents intact and update present-tense descriptions through dated addenda; avoid claiming the pre-2026-11-04 reviewers had evidence they lacked.

No media is included in this repository entry. Further changes to canonical evidence graph IDs or spoiler constraints require their own tested atomic migration; the direct observations above do **not** silently promote unsupported interpretation.
