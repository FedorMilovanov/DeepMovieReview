#!/usr/bin/env bash
# Film 001 — master evidence bundle extractor
#
# Turns the local viewing master into a small, reviewable bundle of derived
# metadata and review stills so that an editor working on another machine can
# verify scene boundaries, staging, dialog wording and cue timing.
#
# The movie file itself never leaves the local machine. Only derived artifacts
# (JSON/CSV/SRT + small JPEGs) are produced.
#
# Usage:
#   bash make-evidence-bundle.sh "<input.mkv>" [outdir] [subtitle-map]
#
# Examples:
#   bash make-evidence-bundle.sh "/c/Users/Fedor/Downloads/The Truman Show (1998) BDRip.mkv"
#   bash make-evidence-bundle.sh "<file>" ./truman-bundle 0:s:2
#
# Defaults: outdir=./truman-bundle, subtitle-map=0:s:2 (embedded English SRT:
# subtitle stream index 2 = 3rd subtitle track, 0-based, matching the intake doc).
#
# Requirements: ffmpeg + ffprobe on PATH (winget install Gyan.FFmpeg).
#
# Output:
#   00-manifest.txt           parameters, tool versions, timestamp mapping
#   01-probe.json             ffprobe -show_format -show_streams -show_chapters
#   02-chapters.csv           index,id,start_s,end_s,title
#   03-subs-en.srt            embedded English subtitle track
#   04-cuts.csv               shot-boundary candidates: time_s,score
#   05-frames/f_%05d.jpg      one still every GRID_STEP seconds (default 30)
#   06-sheets/sheet_%03d.jpg  contact sheets, SHEET_TILE tiles, one tile per
#                             SHEET_STEP seconds; sheet N starts at (N-1)*SHEET_CHUNK
#   07-srt-plain.txt          subtitle dialogue text only
#
set -u -o pipefail

IN="${1:-}"
OUT="${2:-./truman-bundle}"
SUB_MAP="${3:-0:s:2}"

# Recorded Film 001 viewing-master digest (docs/38-FILM-001-VIEWING-MASTER-INTAKE.md).
# A different digest means a different master: the bundle is still produced, but it
# must never be treated as Film 001 evidence until the difference is recorded.
EXPECTED_SHA256="${EXPECTED_SHA256:-E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575}"

# --- tunables (override via env) -------------------------------------------
GRID_STEP="${GRID_STEP:-30}"        # seconds between individual stills
SHEET_STEP="${SHEET_STEP:-10}"      # seconds between contact-sheet thumbnails
SHEET_TILE="${SHEET_TILE:-6x5}"     # contact-sheet grid
SHEET_CHUNK="${SHEET_CHUNK:-$((SHEET_STEP * 30))}"  # implied sheet length
FRAME_W="${FRAME_W:-800}"           # individual still width
THUMB_W="${THUMB_W:-360}"           # contact-sheet thumb width
SCENE_THRESHOLD="${SCENE_THRESHOLD:-0.32}"
# ---------------------------------------------------------------------------

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
step() { printf '\n[%s] %s\n' "$1" "$2"; }

[ -n "$IN" ] || die "usage: bash $0 \"<input.mkv>\" [outdir] [subtitle-map]"
[ -f "$IN" ] || die "input file not found: $IN"
command -v ffmpeg  >/dev/null 2>&1 || die "ffmpeg not found on PATH"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found on PATH"

mkdir -p "$OUT/05-frames" "$OUT/06-sheets"

FFVER="$(ffmpeg  -hide_banner -version 2>/dev/null | head -n 1)"
FPVER="$(ffprobe -hide_banner -version 2>/dev/null | head -n 1)"
DURATION="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN" 2>/dev/null | tr -d '\r' | head -n 1)"
case "$DURATION" in ''|*[!0-9.]*) DURATION=0 ;; esac

printf '== input:    %s\n' "$IN"
printf '== out:      %s\n' "$OUT"
printf '== duration: %s s\n' "$DURATION"
TIMING="$(date +%s)"

# ------------------------------------------------------- 0. identity guard ---
step 0 "sha256 identity guard (reads the whole file)"
SHA256=""
hash_path() { printf '%s' "$1"; }
if command -v sha256sum >/dev/null 2>&1; then
  SHA256="$(sha256sum "$IN" 2>/dev/null | cut -d' ' -f1)"
elif command -v shasum >/dev/null 2>&1; then
  SHA256="$(shasum -a 256 "$IN" 2>/dev/null | cut -d' ' -f1)"
elif command -v certutil >/dev/null 2>&1; then
  WINTARGET="$IN"
  command -v cygpath >/dev/null 2>&1 && WINTARGET="$(cygpath -w "$IN")"
  SHA256="$(certutil -hashfile "$WINTARGET" SHA256 2>/dev/null | sed -n '2p' | tr -d ' \r')"
fi
SHA256="$(printf '%s' "$SHA256" | tr '[:lower:]' '[:upper:]')"

IDENTITY="UNKNOWN"
if [ -z "$SHA256" ]; then
  printf '   WARNING: no hashing tool found (sha256sum / shasum / certutil)\n'
else
  printf '   sha256: %s\n' "$SHA256"
  if [ "$SHA256" = "$EXPECTED_SHA256" ]; then
    IDENTITY="MATCH"
    printf '   identity: MATCHES recorded Film 001 viewing master\n'
  else
    IDENTITY="MISMATCH"
    printf '   identity: *** DIFFERENT FILE ***\n'
    printf '   expected: %s\n' "$EXPECTED_SHA256"
    printf '   The bundle will be produced, but it is NOT Film 001 evidence until\n'
    printf '   this difference is recorded in the intake document.\n'
  fi
fi

# ---------------------------------------------------------------- 1. probe ---
step 1 "ffprobe -> 01-probe.json"
ffprobe -v error -print_format json -show_format -show_streams -show_chapters \
  "$IN" > "$OUT/01-probe.json" || die "ffprobe failed"

# ------------------------------------------------------------- 2. chapters ---
step 2 "chapters -> 02-chapters.csv"
if ffprobe -v error -show_chapters -of csv=p=0 "$IN" > "$OUT/.chapters.raw" 2>/dev/null \
   && [ -s "$OUT/.chapters.raw" ]; then
  awk -F',' '{
    title=""
    for (i=5;i<=NF;i++) title = title (i>5 ? "," : "") $i
    printf "%s,%s,%s,%s,%s\n", $1, $2, $3, $4, title
  }' "$OUT/.chapters.raw" > "$OUT/02-chapters.csv"
  printf '   chapters: %s\n' "$(wc -l < "$OUT/02-chapters.csv" | tr -d ' ')"
else
  printf '   WARNING: no chapters found / chapter probe failed\n'
  : > "$OUT/02-chapters.csv"
fi
rm -f "$OUT/.chapters.raw"

# ----------------------------------------------------------- 3. subtitles ----
step 3 "subtitles (\$SUB_MAP=$SUB_MAP) -> 03-subs-en.srt"
if ffmpeg -nostdin -y -hide_banner -loglevel error -i "$IN" -map "$SUB_MAP" \
     -c:s srt "$OUT/03-subs-en.srt" 2>"$OUT/.subs.err"; then
  grep -v -- '-->' "$OUT/03-subs-en.srt" \
    | grep -vE '^[[:space:]]*[0-9]+[[:space:]]*$' \
    | sed '/^[[:space:]]*$/d' > "$OUT/07-srt-plain.txt" || true
  printf '   cues: %s\n' "$(grep -c -- '-->' "$OUT/03-subs-en.srt" || true)"
else
  printf '   WARNING: subtitle extraction failed for map %s\n' "$SUB_MAP"
  printf '   Available subtitle streams are listed in 01-probe.json -> streams[].index\n'
  sed -n 1,4p "$OUT/.subs.err" 2>/dev/null | sed 's/^/   /' || true
fi
rm -f "$OUT/.subs.err"

# ------------------------------------------------------ 4. shot boundaries ---
step 4 "shot-boundary scan -> 04-cuts.csv (full decode)"
if ffmpeg -nostdin -hide_banner -loglevel error -i "$IN" \
     -vf "select='gt(scene,$SCENE_THRESHOLD)',metadata=print:file=-" \
     -an -f null - 2>"$OUT/.cuts.log" | awk '
    /^frame:/ { for (i=1;i<=NF;i++) if ($i ~ /^pts_time:/) { split($i,a,":"); t=a[2] } }
    /lavfi.scene_score=/ { split($0,b,"="); if (t != "") { printf "%.3f,%.4f\n", t, b[2]; t="" } }
  ' > "$OUT/04-cuts.csv"; then
  printf '   cut candidates: %s\n' "$(wc -l < "$OUT/04-cuts.csv" | tr -d ' ')"
else
  printf '   WARNING: scene scan failed\n'
  sed -n 1,4p "$OUT/.cuts.log" 2>/dev/null | sed 's/^/   /' || true
  : > "$OUT/04-cuts.csv"
fi
rm -f "$OUT/.cuts.log"

# ------------------------------------------- 5+6. stills and contact sheets ---
step 5 "stills + contact sheets -> 05-frames + 06-sheets (single full decode)"
if ffmpeg -nostdin -y -hide_banner -loglevel error -i "$IN" -filter_complex \
     "[0:v]split=2[g][s];[g]fps=1/$GRID_STEP,scale=${FRAME_W}:-2[grid];[s]fps=1/$SHEET_STEP,scale=${THUMB_W}:-2,tile=${SHEET_TILE}[sheet]" \
     -map "[grid]"  -q:v 4 -fps_mode passthrough "$OUT/05-frames/f_%05d.jpg" \
     -map "[sheet]" -q:v 4 -fps_mode passthrough "$OUT/06-sheets/sheet_%03d.jpg" 2>"$OUT/.frames.err"; then
  printf '   stills: %s\n' "$(ls -1 "$OUT/05-frames" 2>/dev/null | wc -l | tr -d ' ')"
  printf '   sheets: %s\n' "$(ls -1 "$OUT/06-sheets" 2>/dev/null | wc -l | tr -d ' ')"
else
  printf '   WARNING: still extraction failed\n'
  sed -n 1,6p "$OUT/.frames.err" 2>/dev/null | sed 's/^/   /' || true
fi
rm -f "$OUT/.frames.err"

# ------------------------------------------------------------- 7. manifest ---
{
  echo "Film 001 evidence bundle"
  echo "generated_at_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "elapsed_seconds: $(( $(date +%s) - TIMING ))"
  echo "input_basename: $(basename "$IN")"
  echo "input_bytes: $(wc -c < "$IN" | tr -d ' ')"
  echo "duration_seconds: $DURATION"
  echo "input_sha256: ${SHA256:-UNKNOWN}"
  echo "identity_vs_recorded_master: $IDENTITY"
  echo "subtitle_map: $SUB_MAP"
  echo "grid_step_seconds: $GRID_STEP"
  echo "sheet_step_seconds: $SHEET_STEP"
  echo "sheet_tile: $SHEET_TILE"
  echo "sheet_chunk_seconds: $SHEET_CHUNK"
  echo "frame_width: $FRAME_W"
  echo "thumb_width: $THUMB_W"
  echo "scene_threshold: $SCENE_THRESHOLD"
  echo "ffmpeg: $FFVER"
  echo "ffprobe: $FPVER"
  echo
  echo "mapping_stills: f_00001.jpg = t=0s, f_0000N.jpg = t=(N-1)*${GRID_STEP}s"
  echo "mapping_sheets: sheet_N tile k (row-major, 0-based) = (N-1)*${SHEET_CHUNK} + k*${SHEET_STEP}s"
} > "$OUT/00-manifest.txt"

step 6 "done"
du -sh "$OUT" 2>/dev/null || true
printf 'files: %s\n' "$(find "$OUT" -type f | wc -l | tr -d ' ')"
printf '\nNext: compress the folder to a single ZIP and hand it over.\n'
