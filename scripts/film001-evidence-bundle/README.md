# Film 001 — Master Evidence Bundle

Purpose: give a remote editor (an agent session without access to the local
machine) enough **derived, reviewable evidence** to do canonical master work on
The Truman Show, without the 12.2 GiB viewing master ever leaving the machine
that holds it.

This directory ships **tooling only**. No movie file, still frame, subtitle dump
or movie excerpt is committed. Every artifact it produces is generated locally on
demand and stays outside git.

## Why derived artifacts

The Film 001 promotion gates in
[`docs/46-FILM-001-PROMOTION-READINESS.md`](../../docs/46-FILM-001-PROMOTION-READINESS.md)
are blocked by two things that cannot be guessed from prose sources:

1. **`EDITORIAL_SCENE_VERIFICATION`** — 15 research-era DRAFT scenes must be
   rebuilt against the measured master (6177.792 s, chapters in
   [`the-truman-show-master-segmentation.ts`](../../src/data/films/the-truman-show-master-segmentation.ts)).
2. **`VISUAL_REVIEW`** — 39 evidence records, of which a large share depend on
   picture-level facts (staging, props, on-screen text, gestures) that no
   subtitle cue can certify.

A transcript alone cannot close either gate. What *can* close most of them is a
compact bundle of exact timings plus small images the editor can actually look at.

## What the bundle contains

| File | Content | Size (Film 001 estimate) |
| --- | --- | --- |
| `00-manifest.txt` | parameters, ffmpeg version, timestamp mapping | < 1 KB |
| `01-probe.json` | full stream/chapter/format probe | ~30 KB |
| `02-chapters.csv` | 24 embedded chapter boundaries | ~2 KB |
| `03-subs-en.srt` | embedded English subtitle track (695 cues) | ~40 KB |
| `04-cuts.csv` | shot-boundary candidates + scene scores | ~25 KB |
| `05-frames/f_%05d.jpg` | one still every 30 s, 800 px wide (~206 files) | ~15–20 MB |
| `06-sheets/sheet_%03d.jpg` | contact sheets: 6×5 tiles, 10 s per tile, 300 s per sheet, 360 px thumbs (~21 sheets) | ~8 MB |
| `07-srt-plain.txt` | dialogue text only | ~25 KB |

Total: roughly **25–30 MB** as a ZIP with defaults. Use `SHEET_STEP`/`GRID_STEP`
to trade resolution for size; `GRID_STEP=0`-style skipping is not supported, so
raise `GRID_STEP` to 60 to halve the stills.

Timestamp mapping is exact and documented in the manifest:

- `f_0000N.jpg` = `(N-1) * GRID_STEP` seconds;
- contact sheet `N`, tile `k` (row-major from 0) = `(N-1) * SHEET_CHUNK + k * SHEET_STEP`.

## Usage

Install ffmpeg first (Windows: `winget install Gyan.FFmpeg`, then reopen the shell).

Git Bash / WSL / macOS / Linux:

```bash
cd scripts/film001-evidence-bundle
bash make-evidence-bundle.sh \
  "/c/Users/Fedor/Downloads/The Truman Show (1998) BDRip.mkv" \
  ./truman-bundle 0:s:2
```

PowerShell:

```powershell
cd scripts\film001-evidence-bundle
powershell -ExecutionPolicy Bypass -File .\run-bundle.ps1 `
  -InputFile "C:\Users\Fedor\Downloads\The Truman Show (1998) BDRip.mkv"
```

Then ZIP the output folder and hand it over through an agreed channel.

Expected local runtime: three full decodes of a 13 GB 1080p H.264 file, roughly
**10–15 minutes** on a normal desktop CPU. Run it once; do not rerun per revision.

## Choosing the subtitle map

`0:s:2` means *subtitle stream index 2* (0-based) — the third subtitle track,
which the intake document identifies as the embedded English SRT for Film 001.

If that map fails, the script prints a warning and continues. Inspect
`01-probe.json` → `streams[]` for `codec_type: "subtitle"` entries and pass the
correct index, e.g. `0:s:0`, or the absolute stream index `0:8`.

Never substitute the OpenSubtitles closed-caption file for this track: it is
1638 cues with service advertising and different cue segmentation, and
`docs/38-FILM-001-VIEWING-MASTER-INTAKE.md` §4 explicitly demotes it from
canonical timestamp duty.

## Comparison against the recorded intake

The first run should reproduce these known master facts. If any differ, stop and
record the discrepancy instead of proceeding:

- runtime `6177.792 s`;
- 24 chapters, first at `0.000`, credits boundary at `01:36:00.755`;
- English SRT with 695 cues, last cue ending near `01:35:59.375`;
- shot candidates in the low thousands (a recorded scan found 1036 above
  threshold `0.32` on a 320 px downscale; this script scans at full resolution,
  so expect a somewhat different count — the *count* is not the contract).

## Boundaries

- The bundle is **working evidence**, not a publication artifact.
- No still is authorized for publication by this tooling. See
  `docs/38-FILM-001-VIEWING-MASTER-INTAKE.md` §9.
- Producing the bundle does not move Film 001 out of
  `MASTER_IDENTIFIED + SECONDARY_SOURCES`; that transition stays atomic and
  gated by `npm test`.
