# Film 001 — Viewing Master Intake

> Film: **The Truman Show (1998)**
> Intake date: **2026-09-15**
> Tracking: issue #43
> Status: **exact file-based viewing master identified; canonical re-verification in progress**

## 1. Scope and provenance boundary

This document identifies the exact local viewing copy now used for Film 001 editorial verification.

It is **not** a claim that the file is a studio master, a direct remux, the previously targeted Paramount 25th Anniversary 4K UHD (2023), or a particular retail disc/region. The container title/filename calls the copy a BDRip and its structure is consistent with a Blu-ray-sourced encode, but the retail-disc / region / encode lineage is not independently established.

That distinction is deliberate. The exact file identity below is reproducible; the upstream physical-media lineage is not yet proven.

No original movie file, subtitle dump, still frame or movie excerpt is committed by this intake.

## 2. Exact file identity

| Field | Verified value |
| --- | --- |
| Basename | `The Truman Show (1998) BDRip.mkv` |
| Container | Matroska / WebM |
| Size | **13,099,008,485 bytes** (12.199 GiB) |
| Container title | `The Truman Show (1998) BDRip` |
| Container creation tag | `2013-12-01T12:33:51Z` |
| Measured runtime | **6177.792 s** — **01:42:57.792** |
| Container start | **0.000 s** |
| Overall measured bitrate | **16,962,705 bit/s** |
| SHA-256 | `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575` |

The digest is the canonical identity guard for the viewing copy. A file with the same display name but a different digest is a different master for editorial purposes.

## 3. Video presentation

- codec: H.264 / AVC, High profile, level 4.0;
- raster: **1920×1080**;
- display aspect ratio: **16:9**;
- frame rate: **24000/1001 ≈ 23.976 fps**;
- scan: progressive;
- pixel format: yuv420p, 8-bit;
- color: BT.709, TV range;
- video stream starts at `0.000`.

The repository must use the exact rational frame rate `24000/1001` when frame-rate identity matters; rounded labels such as 23.98 are display shorthand only.

## 4. Audio and subtitle tracks

Audio streams present in the master:

| Stream | Language | Codec / layout | Label |
| --- | --- | --- | --- |
| 1 | ru | DTS 5.1, 1536 kb/s | MVO (Pozitiv Multimedia) |
| 2 | ru | AC-3 5.1, 448 kb/s | MVO (Universal Pictures Rus) |
| 3 | ru | AC-3 5.1, 224 kb/s | MVO (STS) |
| 4 | ru | DTS 5.1, 1536 kb/s | AVO (Zhivov) |
| 5 | **en** | **DTS 5.1, 1536 kb/s** | **Original** |

Subtitle streams:

| Stream | Language | Codec | Label |
| --- | --- | --- | --- |
| 6 | ru | SubRip | #1 |
| 7 | ru | SubRip | #2 |
| 8 | **en** | **SubRip** | embedded English track |

For dialogue wording and canonical cue timing, Film 001 uses **audio stream 5 (English Original)** together with **subtitle stream 8 (embedded English SRT)**.

The embedded English track contains **695 subtitle blocks** and is synchronized to this exact Matroska file. Its last dialogue block ends at approximately `01:35:59.375`; the remaining runtime is credits / non-dialogue material.

A separately supplied OpenSubtitles closed-caption file is useful as a secondary transcript because it is much more granular (**1638 cues**, including sound descriptions), but it also contains service advertising and its cue segmentation/timing differs from the embedded master track. Spot checks show differences ranging from milliseconds to roughly 1–2 seconds. It is therefore **not** the canonical timestamp source.

## 5. Measurement tooling and timestamp convention

Technical verification was performed with:

- `ffprobe 8.1.2-full_build-www.gyan.dev`;
- `ffmpeg 8.1.2-full_build-www.gyan.dev`.

Canonical Film 001 timestamp convention for this master:

1. `00:00:00.000` is the first timestamp of the Matroska presentation timeline;
2. all elapsed timestamps include logos / leader / opening material present in this file;
3. timestamps are stored as seconds from Matroska PTS and displayed as `HH:MM:SS.mmm`;
4. chapter and evidence times are measured against this exact SHA-256 identity;
5. player UI rounding must never replace the numeric timestamp stored in the evidence ledger;
6. dialogue wording is checked against the original English audio and the embedded English subtitle track.

## 6. Reproducibility landmarks — embedded chapter map

The file contains 24 named chapters. These are strong coarse-grained landmarks for the first canonical scene-inventory pass; they are not automatically identical to editorial/narrative scenes.

| # | Start | End | Embedded chapter title |
| ---: | ---: | ---: | --- |
| 01 | 00:00:00.000 | 00:02:42.537 | A Day In A Life |
| 02 | 00:02:42.537 | 00:06:49.283 | Day 10,909 |
| 03 | 00:06:49.283 | 00:09:06.712 | Aquaphobia |
| 04 | 00:09:06.712 | 00:09:43.457 | The Chef's Pal |
| 05 | 00:09:43.457 | 00:11:31.357 | Dreaming Of Fiji |
| 06 | 00:11:31.357 | 00:17:14.700 | Memories Of Dad |
| 07 | 00:17:14.700 | 00:29:29.225 | "Lauren"...or Is It Sylvia? |
| 08 | 00:29:29.225 | 00:36:58.215 | Paranoia |
| 09 | 00:36:58.215 | 00:42:33.926 | There's No Place Like Home |
| 10 | 00:42:33.926 | 00:45:41.113 | Travelers Deware |
| 11 | 00:45:41.113 | 00:47:43.819 | Lady...Flowers... Dented Beetle |
| 12 | 00:47:43.819 | 00:51:12.444 | "I'm Being Spontaneous!" |
| 13 | 00:51:12.444 | 00:52:56.631 | Blocked At Every Turn |
| 14 | 00:52:56.631 | 00:55:23.028 | Mococoa - It's The Best! |
| 15 | 00:55:23.028 | 01:01:08.039 | Father And Son Reunion |
| 16 | 01:01:08.039 | 01:09:57.985 | Trutalk |
| 17 | 01:09:57.985 | 01:13:20.896 | Do You Think He Knows? |
| 18 | 01:13:20.896 | 01:21:01.356 | "He's Gone." |
| 19 | 01:21:01.356 | 01:23:22.747 | Setting Sail |
| 20 | 01:23:22.747 | 01:27:44.092 | Cue The Storm |
| 21 | 01:27:44.092 | 01:31:51.214 | The Sky's The Limit |
| 22 | 01:31:51.214 | 01:34:49.308 | "Who am I?" |
| 23 | 01:34:49.308 | 01:36:00.755 | Good Afternoon, Good Evening, & Good Night |
| 24 | 01:36:00.755 | 01:42:57.792 | Credits |

These landmarks also establish a reproducible credits boundary at **01:36:00.755**.

## 7. Shot-boundary scan

A full read-only decode of the video stream was performed with FFmpeg. The analysis downscaled frames to 320 px width for detection and selected changes above scene-score threshold `0.32`.

Results:

- full video decode completed in **261.93 s**;
- **1036** cut/change candidates;
- median interval between candidates: **3.253 s**;
- 90th-percentile interval: **11.303 s**.

This scan is an editorial aid only. A visual cut, dissolve or large luminance change is not automatically a narrative scene boundary. The cut list may help locate transitions inside long chapters, but canonical scene ranges require human/editorial verification against the master.

## 8. Current repository transition state

The viewing-master blocker is now removed. The package therefore uses the explicit intermediate state `MASTER_IDENTIFIED + SECONDARY_SOURCES`: exact master metadata is machine-readable, while canonical promotion remains fail-closed.

The existing Film 001 package contains provisional secondary-source scene ranges and evidence. Several estimated timestamps differ materially from the measured master timeline. They must be re-anchored to this file before becoming canonical.

Safe promotion order:

1. keep this exact master recorded as the active `MASTER_IDENTIFIED` analyzed edition;
2. build canonical scene inventory v1 from the master, using embedded chapter boundaries plus verified narrative transitions;
3. re-observe each retained evidence claim against the film itself;
4. assign an exact `sceneId` and numeric master timestamp;
5. replace secondary-only evidence provenance with the locked `film-edition` source only where the claim has actually been verified against the film;
6. retain secondary references for production/history/craft-intention claims they actually support;
7. only when the package satisfies the canonical integrity graph, drop `SECONDARY_SOURCES` and transition the edition atomically from `MASTER_IDENTIFIED` to `LOCKED`;
8. keep Film 001 `draft`, preview-only and noindex until the separate publication gate is satisfied.

## 9. Copyright / publication boundary

This intake does not authorize publication of movie footage.

There is no repository policy that treats an arbitrary number of seconds as automatically safe. No original clips are committed during master intake or evidence authoring. If short review excerpts are ever introduced later, that is a separate legal/editorial feature decision and each excerpt must have a concrete criticism/review purpose rather than decorative use.

The viewing master itself remains local and is never committed to GitHub.
