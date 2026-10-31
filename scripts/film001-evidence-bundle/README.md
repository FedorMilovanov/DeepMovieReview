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
| `06-sheets/sheet_%03d.jpg` | contact sheets: 6×5 tiles, nominal 10 s interval, 360 px thumbs (~21 sheets) | ~8 MB |
| `05-frame-times.csv`, `06-sheet-times.csv` | selected input PTS for every still and row-major sheet tile | small |
| `07-srt-plain.txt` | dialogue text only | ~25 KB |

Total: roughly **25–30 MB** as a ZIP with defaults. Use `SHEET_STEP`/`GRID_STEP`
to trade resolution for size; `GRID_STEP=0`-style skipping is not supported, so
raise `GRID_STEP` to 60 to halve the stills.

For bundles produced by the current scripts, use the two PTS CSVs, not an
inferred grid: `showinfo` records the selected input frame before scale/tile.
These PTS use FFmpeg's decoded presentation timeline after input-start
normalization, not the container's raw PTS; a nonzero container `start_time`
may need to be accounted for when correlating with external tools. The
requested interval is nominal and actual PTS can drift with the time base or
frame rate. `frame_timestamp_status` must be `complete`; otherwise the output
is not a timestamped evidence set. The sheet chunk is derived from the requested
rows × columns × interval, not a fixed 30 tiles.

**Earlier bundles are different:** the old `fps` filter could label a frame
near the midpoint of an interval as its beginning. Their formula in the old
manifest is nominal, not a verified source PTS; do not silently assign exact
frame times. Re-extract from the master or verify the actual source frame.

## Usage

Install ffmpeg first (Windows: `winget install Gyan.FFmpeg`, then reopen the
shell) and confirm both binaries answer:

```powershell
ffmpeg -version
ffprobe -version
```

**Recommended entry point — plain Node, no shell required** (Node >= 20;
`ffprobe` must be the one shipped with ffmpeg):

```powershell
cd C:\Users\Fedor\Projects\film001-tools
node .\make-evidence-bundle.mjs `
  --input "C:\Users\Fedor\Downloads\The Truman Show (1998) BDRip.mkv" `
  --out   "C:\Users\Fedor\Projects\film001-bundle"
```

Options: `--sub 0:s:2` (subtitle map), `--grid 30`, `--sheet 10`, `--tile 6x5`,
`--scene 0.32`, `--skip-hash`, `--skip-scan`. The SHA-256 identity check runs
against the digest recorded in `docs/38` and prints `MATCH` / `DIFFERENT FILE`.

Other entry points, same behaviour (the `.sh` is the original tested engine):

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

## Measuring the bundle

`measure-master-windows.mjs` reads `04-cuts.csv`, `03-subs-en.srt` and
`00-manifest.txt`, and `01-probe.json` and emits the timing dataset the public article is allowed to
quote — total detected transitions, the longest stretches without a detected transition,
the longest gaps between subtitle cues (not necessarily silence), and named editorial windows:

```
node measure-master-windows.mjs --bundle <bundle dir> \
  --out ../../src/data/films/the-truman-show-master-windows.json
```

The report takes its threshold from the manifest. Passing `--scene` with a
different value is rejected: a filtered scan cannot recover transitions that
were not recorded. Skipped or failed scans and failed subtitle extraction also
fail closed. The subtitle language and absolute stream index come from the
manifest's actual map and `01-probe.json`; the historical filename
`03-subs-en.srt` alone does not prove the selected language is English.

The committed JSON is that command's output, verbatim. It records the SHA-256 of
its own inputs, so a different bundle cannot silently produce a different
article. Method and the definitions of *transition*, *hold*, *cue start* and
*silence* are in `docs/50-FILM-001-ARTICLE-V2.md` §2.

## Boundaries

- The bundle is **working evidence**, not a publication artifact.
- No still is authorized for publication by this tooling. See
  `docs/38-FILM-001-VIEWING-MASTER-INTAKE.md` §9.
- Producing a bundle does not by itself change the film registry's review or
  publication state; any state transition must be supported by the underlying
  review and quality gates. It also does not establish publication rights.
