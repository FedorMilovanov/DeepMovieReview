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
#   06-sheets/sheet_%03d.jpg  contact sheets, SHEET_TILE tiles
#   05-frame-times.csv        selected frame PTS by filename
#   06-sheet-times.csv        selected PTS by filename and row-major tile
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
# Derived after validating the grid; a custom tile count must not inherit 30.
FRAME_W="${FRAME_W:-800}"           # individual still width
THUMB_W="${THUMB_W:-360}"           # contact-sheet thumb width
SCENE_THRESHOLD="${SCENE_THRESHOLD:-0.32}"
# ---------------------------------------------------------------------------

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
step() { printf '\n[%s] %s\n' "$1" "$2"; }

[[ "$SHEET_TILE" =~ ^([1-9][0-9]*)x([1-9][0-9]*)$ ]] || die "SHEET_TILE must be a positive WxH grid"
TILES_PER_SHEET=$(( BASH_REMATCH[1] * BASH_REMATCH[2] ))
[[ "$GRID_STEP" =~ ^[0-9]+([.][0-9]+)?$ && "$SHEET_STEP" =~ ^[0-9]+([.][0-9]+)?$ ]] || die "GRID_STEP and SHEET_STEP must be positive numbers"
awk -v g="$GRID_STEP" -v s="$SHEET_STEP" 'BEGIN { exit !(g > 0 && s > 0) }' || die "GRID_STEP and SHEET_STEP must be positive"
[[ "$SCENE_THRESHOLD" =~ ^[0-9]+([.][0-9]+)?$ ]] || die "SCENE_THRESHOLD must be between 0 and 1"
awk -v t="$SCENE_THRESHOLD" 'BEGIN { exit !(t >= 0 && t <= 1) }' || die "SCENE_THRESHOLD must be between 0 and 1"
[[ "$FRAME_W" =~ ^[1-9][0-9]*$ && "$THUMB_W" =~ ^[1-9][0-9]*$ ]] || die "FRAME_W and THUMB_W must be positive integers"
SHEET_CHUNK="$(awk -v s="$SHEET_STEP" -v n="$TILES_PER_SHEET" 'BEGIN { print s*n }')"
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
SUBTITLE_STATUS="failed"
if ffmpeg -nostdin -y -hide_banner -loglevel error -i "$IN" -map "$SUB_MAP" \
     -c:s srt "$OUT/03-subs-en.srt" 2>"$OUT/.subs.err"; then
  SUBTITLE_STATUS="complete"
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
SCAN_STATUS="failed"
printf 'time_s,score\n' > "$OUT/04-cuts.csv"
if ffmpeg -nostdin -hide_banner -loglevel error -i "$IN" \
     -vf "select='gt(scene,$SCENE_THRESHOLD)',metadata=print:file=-" \
     -an -f null - 2>"$OUT/.cuts.log" | awk '
    /^frame:/ { for (i=1;i<=NF;i++) if ($i ~ /^pts_time:/) { split($i,a,":"); t=a[2] } }
    /lavfi.scene_score=/ { split($0,b,"="); if (t != "") { printf "%.3f,%.4f\n", t, b[2]; t="" } }
  ' >> "$OUT/04-cuts.csv"; then
  SCAN_STATUS="complete"
  printf '   cut candidates: %s\n' "$(awk 'END { print NR-1 }' "$OUT/04-cuts.csv")"
else
  printf '   WARNING: scene scan failed\n'
  sed -n 1,4p "$OUT/.cuts.log" 2>/dev/null | sed 's/^/   /' || true
  printf 'time_s,score\n' > "$OUT/04-cuts.csv"
fi
rm -f "$OUT/.cuts.log"

# ------------------------------------------- 5+6. stills and contact sheets ---
step 5 "stills + contact sheets -> 05-frames + 06-sheets (single full decode)"
FRAME_STATUS="incomplete"
if ffmpeg -nostdin -y -hide_banner -loglevel info -i "$IN" -filter_complex \
     "[0:v]split=2[g][s];[g]select='isnan(prev_selected_t)+gte(t-prev_selected_t,$GRID_STEP)',showinfo@grid,scale=${FRAME_W}:-2[grid];[s]select='isnan(prev_selected_t)+gte(t-prev_selected_t,$SHEET_STEP)',showinfo@sheet,scale=${THUMB_W}:-2,tile=${SHEET_TILE}[sheet]" \
     -map "[grid]"  -q:v 4 -fps_mode passthrough "$OUT/05-frames/f_%05d.jpg" \
     -map "[sheet]" -q:v 4 -fps_mode passthrough "$OUT/06-sheets/sheet_%03d.jpg" 2>"$OUT/.frames.log"; then
  FRAME_STATUS="complete"
else
  printf '   WARNING: still extraction failed\n'
  tail -n 6 "$OUT/.frames.log" 2>/dev/null | sed 's/^/   /' || true
fi
# showinfo occurs before scaling/tile. Index the selected source PTS, not the
# output of fps=1/step, whose timestamp can describe a different input frame.
awk '/showinfo@grid/ && /pts_time:/ && / n:/ {
  n=""; t=""; for (i=1;i<=NF;i++) {if ($i=="n:") n=$(i+1); if ($i ~ /^pts_time:/) {split($i,a,":"); t=a[2]}}
  if (n!="" && t!="") printf "f_%05d.jpg,%s\n", n+1, t
}' "$OUT/.frames.log" > "$OUT/.grid-times.raw"
awk -v tiles="$TILES_PER_SHEET" '/showinfo@sheet/ && /pts_time:/ && / n:/ {
  n=""; t=""; for (i=1;i<=NF;i++) {if ($i=="n:") n=$(i+1); if ($i ~ /^pts_time:/) {split($i,a,":"); t=a[2]}}
  if (n!="" && t!="") printf "sheet_%03d.jpg,%d,%s\n", int(n/tiles)+1, n%tiles, t
}' "$OUT/.frames.log" > "$OUT/.sheet-times.raw"
{ printf 'file,pts_time_s\n'; cat "$OUT/.grid-times.raw"; } > "$OUT/05-frame-times.csv"
{ printf 'file,tile_index,pts_time_s\n'; cat "$OUT/.sheet-times.raw"; } > "$OUT/06-sheet-times.csv"
GRID_ROWS="$(wc -l < "$OUT/.grid-times.raw" | tr -d ' ')"
SHEET_ROWS="$(wc -l < "$OUT/.sheet-times.raw" | tr -d ' ')"
FRAME_COUNT="$(find "$OUT/05-frames" -maxdepth 1 -type f -name 'f_*.jpg' | wc -l | tr -d ' ')"
SHEET_COUNT="$(find "$OUT/06-sheets" -maxdepth 1 -type f -name 'sheet_*.jpg' | wc -l | tr -d ' ')"
if [ "$GRID_ROWS" -ne "$FRAME_COUNT" ] || [ "$FRAME_COUNT" -eq 0 ] || [ "$(( (SHEET_ROWS + TILES_PER_SHEET - 1) / TILES_PER_SHEET ))" -ne "$SHEET_COUNT" ]; then
  FRAME_STATUS="incomplete"
  printf '   WARNING: frame timestamp index incomplete; do not use the stills as timed evidence\n'
fi
printf '   stills: %s\n   sheets: %s\n' "$FRAME_COUNT" "$SHEET_COUNT"
rm -f "$OUT/.frames.log" "$OUT/.grid-times.raw" "$OUT/.sheet-times.raw"

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
  echo "subtitle_extraction_status: $SUBTITLE_STATUS"
  echo "scene_scan_status: $SCAN_STATUS"
  echo "frame_timestamp_status: $FRAME_STATUS"
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
  echo "timestamp_convention: selected decoded presentation PTS after ffmpeg input-start normalization; not raw container PTS"
  echo "mapping_stills: 05-frame-times.csv records actual selected PTS, not a nominal grid"
  echo "mapping_sheets: 06-sheet-times.csv records actual selected PTS per row-major tile"
} > "$OUT/00-manifest.txt"

step 6 "done"
du -sh "$OUT" 2>/dev/null || true
printf 'files: %s\n' "$(find "$OUT" -type f | wc -l | tr -d ' ')"
printf '\nNext: compress the folder to a single ZIP and hand it over.\n'
