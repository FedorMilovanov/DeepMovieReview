#!/usr/bin/env node
/**
 * Film 001 — master evidence bundle extractor (Node entry point).
 *
 * Turns the exact local viewing master into a small, reviewable bundle of
 * derived metadata and review stills, so canonical master work can proceed
 * without shipping the 12.2 GiB movie file anywhere.
 *
 * Cross-platform on purpose: no bash, no PowerShell, no GNU coreutils. Only
 * Node (>=20) and ffmpeg/ffprobe on PATH.
 *
 * Usage:
 *   node make-evidence-bundle.mjs --input "<file.mkv>" --out "<dir>" [--sub 0:s:2]
 *
 * Options:
 *   --input  <path>   viewing master (required)
 *   --out    <path>   output directory (default ./truman-bundle)
 *   --sub    <map>    ffmpeg subtitle map (default 0:s:2 = 3rd subtitle track)
 *   --grid   <sec>    seconds between individual stills (default 30)
 *   --sheet  <sec>    seconds between contact-sheet thumbnails (default 10)
 *   --tile   <WxH>    contact-sheet grid (default 6x5)
 *   --width  <px>     still width (default 800)
 *   --thumb  <px>     thumbnail width (default 360)
 *   --scene  <score>  shot-change threshold (default 0.32)
 *   --skip-hash       do not hash the input (faster re-runs)
 *   --skip-scan       do not run the shot-boundary scan
 *
 * Nothing here writes into the git working tree: the output directory is
 * whatever you pass with --out.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/** Digest recorded in docs/38-FILM-001-VIEWING-MASTER-INTAKE.md. */
const EXPECTED_SHA256 =
  "E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575";

const argv = process.argv.slice(2);

function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const value = argv[i + 1];
  if (value === undefined || value.startsWith("--")) {
    fail(`--${name} requires a value`);
  }
  return value;
}
const flag = (name) => argv.includes(`--${name}`);

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

const INPUT = arg("input");
const OUT = arg("out", "./truman-bundle");
const SUB_MAP = arg("sub", "0:s:2");
const GRID_STEP = Number(arg("grid", "30"));
const SHEET_STEP = Number(arg("sheet", "10"));
const SHEET_TILE = arg("tile", "6x5");
const FRAME_W = Number(arg("width", "800"));
const THUMB_W = Number(arg("thumb", "360"));
const SCENE_THRESHOLD = Number(arg("scene", "0.32"));
const SKIP_HASH = flag("skip-hash");
const SKIP_SCAN = flag("skip-scan");

const tileMatch = SHEET_TILE.match(/^(\d+)x(\d+)$/i);
if (!tileMatch || Number(tileMatch[1]) < 1 || Number(tileMatch[2]) < 1) fail("--tile must be a positive WxH grid");
const TILES_PER_SHEET = Number(tileMatch[1]) * Number(tileMatch[2]);
const SHEET_CHUNK = SHEET_STEP * TILES_PER_SHEET; // nominal duration only

if (!INPUT) fail("--input is required");
if (!Number.isFinite(GRID_STEP) || GRID_STEP <= 0) fail("--grid must be positive");
if (!Number.isFinite(SHEET_STEP) || SHEET_STEP <= 0) fail("--sheet must be positive");
if (!Number.isFinite(SCENE_THRESHOLD) || SCENE_THRESHOLD < 0 || SCENE_THRESHOLD > 1) fail("--scene must be between 0 and 1");
if (![FRAME_W, THUMB_W].every(value => Number.isInteger(value) && value > 0)) fail("--width and --thumb must be positive integers");

const startedAt = Date.now();
const log = (msg) => console.log(msg);
const step = (n, msg) => console.log(`\n[${n}] ${msg}`);

function tool(name) {
  const probe = spawnSync(name, ["-hide_banner", "-version"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (probe.error || probe.status !== 0) {
    fail(
      `${name} not found on PATH. Install ffmpeg (Windows: winget install Gyan.FFmpeg), ` +
        `reopen the terminal, then verify with: ${name} -version`,
    );
  }
  return (probe.stdout || "").split(/\r?\n/)[0];
}

function run(name, args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync(name, args, {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 256 * 1024 * 1024,
    stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "pipe"],
  });
  if (result.status !== 0 && !allowFailure) {
    const stderr = (result.stderr || "").trim().split(/\r?\n/).slice(-6).join("\n");
    fail(`${name} exited with code ${result.status}\n${stderr}`);
  }
  return result;
}

async function main() {
  const stat = await fs.stat(INPUT).catch(() => null);
  if (!stat || !stat.isFile()) fail(`input file not found: ${INPUT}`);
  if (stat.size === 0) fail(`input file is empty: ${INPUT}`);

  const ffmpegVersion = tool("ffmpeg");
  const ffprobeVersion = tool("ffprobe");

  await fs.mkdir(path.join(OUT, "05-frames"), { recursive: true });
  await fs.mkdir(path.join(OUT, "06-sheets"), { recursive: true });

  log(`== input:    ${INPUT}`);
  log(`== out:      ${path.resolve(OUT)}`);
  log(`== size:     ${stat.size} bytes (${(stat.size / 1024 ** 3).toFixed(3)} GiB)`);
  log(`== ffmpeg:   ${ffmpegVersion}`);
  log(`== ffprobe:  ${ffprobeVersion}`);

  // ------------------------------------------------------- 0. identity -----
  let sha256 = "SKIPPED";
  let identity = "UNVERIFIED";
  if (SKIP_HASH) {
    step(0, "sha256 identity guard skipped (--skip-hash)");
  } else {
    step(0, "sha256 identity guard (reads the whole file)");
    sha256 = await hashFile(INPUT, stat.size);
    if (sha256 === EXPECTED_SHA256) {
      identity = "MATCH";
      log(`   sha256:   ${sha256}`);
      log("   identity: MATCHES recorded Film 001 viewing master");
    } else {
      identity = "MISMATCH";
      log(`   sha256:   ${sha256}`);
      log("   identity: *** DIFFERENT FILE ***");
      log(`   expected: ${EXPECTED_SHA256}`);
      log("   The bundle is still produced, but it is NOT Film 001 evidence");
      log("   until this difference is recorded in the intake document.");
    }
  }

  // ---------------------------------------------------------- 1. probe -----
  step(1, "ffprobe -> 01-probe.json");
  const probeJson = run(
    "ffprobe",
    [
      "-v", "error",
      "-print_format", "json",
      "-show_format", "-show_streams", "-show_chapters",
      INPUT,
    ],
    { capture: true },
  ).stdout;
  await fs.writeFile(path.join(OUT, "01-probe.json"), probeJson, "utf8");

  const probe = JSON.parse(probeJson);
  const duration = Number(probe.format?.duration ?? 0);
  log(`   duration: ${duration.toFixed(3)} s (${clock(duration)})`);
  log(`   streams:  ${probe.streams?.length ?? 0}, chapters: ${probe.chapters?.length ?? 0}`);

  const subs = (probe.streams ?? []).filter(
    (s) => String(s.codec_type ?? "").toLowerCase() === "subtitle",
  );
  log(
    `   subtitle tracks: ${
      subs.length
        ? subs
            .map(
              (s, i) =>
                `[${i}] stream ${s.index} ${s.tags?.language ?? "?"} ${
                  s.tags?.title ?? ""
                }`.trim(),
            )
            .join("; ")
        : "none"
    }`,
  );

  // ------------------------------------------------------- 2. chapters -----
  step(2, "chapters -> 02-chapters.csv");
  const chapters = probe.chapters ?? [];
  const chapterRows = [
    "index,id,start_s,end_s,title",
    ...chapters.map((c, i) => {
      const [num, den] = String(c.time_base ?? "1/1000").split("/").map(Number);
      const tb = den ? num / den : 1;
      const start = (Number(c.start) * tb).toFixed(3);
      const end = (Number(c.end) * tb).toFixed(3);
      const title = String(c.tags?.title ?? "").replace(/,/g, " ");
      return `${i},${c.id ?? i},${start},${end},${title}`;
    }),
  ].join("\n");
  await fs.writeFile(path.join(OUT, "02-chapters.csv"), `${chapterRows}\n`, "utf8");
  log(`   chapters: ${chapters.length}`);

  // ------------------------------------------------------ 3. subtitles -----
  step(3, `subtitles (${SUB_MAP}) -> 03-subs-en.srt`);
  const srtPath = path.join(OUT, "03-subs-en.srt");
  const subsResult = run(
    "ffmpeg",
    ["-y", "-hide_banner", "-loglevel", "error", "-i", INPUT, "-map", SUB_MAP, "-c:s", "srt", srtPath],
    { allowFailure: true, capture: true },
  );
  const subtitleStatus = subsResult.status === 0 ? "complete" : "failed";
  if (subsResult.status === 0) {
    const srt = await fs.readFile(srtPath, "utf8");
    // A cue line is a timing line: "00:00:01,000 -> 00:00:03,500". Matching
    // the shape beats searching for the arrow token, which also appears inside
    // HTML comments and would make the filter ambiguous.
    const timing = /^\s*\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}\s*-{2}>\s*\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}/;
    const cueLines = srt.split(/\r?\n/).filter((line) => timing.test(line));
    const cues = cueLines.length;
    const plain = srt
      .split(/\r?\n/)
      .filter((line) => !timing.test(line))
      .filter((line) => !/^\s*\d+\s*$/.test(line))
      .filter((line) => line.trim() !== "")
      .join("\n");
    await fs.writeFile(path.join(OUT, "07-srt-plain.txt"), `${plain}\n`, "utf8");
    log(`   cues: ${cues}`);
  } else {
    log(`   WARNING: subtitle extraction failed for map ${SUB_MAP}`);
    log(`   ${(subsResult.stderr || "").trim().split(/\r?\n/).slice(-2).join(" ")}`);
    log("   Pick a real map from the subtitle track list printed in step 1.");
  }

  // ---------------------------------------------------- 4. shot changes -----
  step(4, "shot-boundary scan -> 04-cuts.csv (full decode)");
  let scanStatus = SKIP_SCAN ? "skipped" : "complete";
  if (SKIP_SCAN) {
    log("   skipped (--skip-scan)");
    await fs.writeFile(path.join(OUT, "04-cuts.csv"), "time_s,score\n", "utf8");
  } else {
    const scan = run(
      "ffmpeg",
      [
        "-hide_banner", "-loglevel", "error",
        "-i", INPUT,
        "-vf", `select='gt(scene,${SCENE_THRESHOLD})',metadata=print:file=-`,
        "-an", "-f", "null", "-",
      ],
      { capture: true, allowFailure: true },
    );
    if (scan.status !== 0) scanStatus = "failed";
    const rows = [];
    let pendingTime = null;
    for (const line of (scan.stdout ?? "").split(/\r?\n/)) {
      const timeMatch = line.match(/pts_time:\s*([0-9.]+)/);
      if (timeMatch) {
        pendingTime = timeMatch[1];
        continue;
      }
      const scoreMatch = line.match(/lavfi\.scene_score=([0-9.]+)/);
      if (scoreMatch && pendingTime !== null) {
        rows.push(`${Number(pendingTime).toFixed(3)},${Number(scoreMatch[1]).toFixed(4)}`);
        pendingTime = null;
      }
    }
    await fs.writeFile(
      path.join(OUT, "04-cuts.csv"),
      rows.length ? `time_s,score\n${rows.join("\n")}\n` : "time_s,score\n",
      "utf8",
    );
    log(`   cut candidates: ${rows.length}`);
    if (scan.status !== 0) {
      log(`   WARNING: scan exit ${scan.status}`);
    }
  }

  // ------------------------------------- 5. stills + contact sheets --------
  step(5, `stills every ${GRID_STEP}s + contact sheets ${SHEET_TILE}@${SHEET_STEP}s (single decode)`);
  // Select source frames rather than fps-filter output frames: fps=1/30 can
  // label a frame sampled around 15s as t=0. showinfo records each selected PTS
  // before tile/scale so the index never pretends a nominal grid is exact.
  const filter =
    `[0:v]split=2[g][s];` +
    `[g]select='isnan(prev_selected_t)+gte(t-prev_selected_t,${GRID_STEP})',showinfo@grid,scale=${FRAME_W}:-2[grid];` +
    `[s]select='isnan(prev_selected_t)+gte(t-prev_selected_t,${SHEET_STEP})',showinfo@sheet,scale=${THUMB_W}:-2,tile=${SHEET_TILE}[sheet]`;
  const framesResult = run(
    "ffmpeg",
    [
      "-y", "-hide_banner", "-loglevel", "info",
      "-i", INPUT,
      "-filter_complex", filter,
      "-map", "[grid]", "-q:v", "4", "-fps_mode", "passthrough",
      path.join(OUT, "05-frames", "f_%05d.jpg"),
      "-map", "[sheet]", "-q:v", "4", "-fps_mode", "passthrough",
      path.join(OUT, "06-sheets", "sheet_%03d.jpg"),
    ],
    { allowFailure: true, capture: true },
  );
  if (framesResult.status !== 0) {
    log("   WARNING: still extraction failed");
    log(`   ${(framesResult.stderr || "").trim().split(/\r?\n/).slice(-4).join("\n   ")}`);
  }
  const frameCount = (await fs.readdir(path.join(OUT, "05-frames"))).filter(name => /^f_\d+\.jpg$/.test(name)).length;
  const sheetCount = (await fs.readdir(path.join(OUT, "06-sheets"))).filter(name => /^sheet_\d+\.jpg$/.test(name)).length;
  const samples = { grid: [], sheet: [] };
  for (const line of (framesResult.stderr ?? "").split(/\r?\n/)) {
    const match = line.match(/\[showinfo@(grid|sheet)\s+@[^\]]+\].*?\bn:\s*(\d+)\s+pts:\s*[-\d]+\s+pts_time:\s*([-+\d.eE]+)/);
    if (match) samples[match[1]].push({ index: Number(match[2]), time: Number(match[3]) });
  }
  const frameRows = samples.grid.map(({ index, time }) => `f_${String(index + 1).padStart(5, "0")}.jpg,${time}`);
  const sheetRows = samples.sheet.map(({ index, time }) =>
    `sheet_${String(Math.floor(index / TILES_PER_SHEET) + 1).padStart(3, "0")}.jpg,${index % TILES_PER_SHEET},${time}`);
  await fs.writeFile(path.join(OUT, "05-frame-times.csv"), `file,pts_time_s\n${frameRows.join("\n")}${frameRows.length ? "\n" : ""}`);
  await fs.writeFile(path.join(OUT, "06-sheet-times.csv"), `file,tile_index,pts_time_s\n${sheetRows.join("\n")}${sheetRows.length ? "\n" : ""}`);
  const timestampsComplete = framesResult.status === 0 && frameRows.length === frameCount &&
    Math.ceil(sheetRows.length / TILES_PER_SHEET) === sheetCount && frameCount > 0;
  if (!timestampsComplete) log("   WARNING: frame timestamp index incomplete; do not use the stills as timed evidence");
  log(`   stills: ${frameCount}`);
  log(`   sheets: ${sheetCount}`);

  // ------------------------------------------------------- 6. manifest -----
  const manifest = [
    "Film 001 evidence bundle",
    `generated_at_utc: ${new Date().toISOString().replace(/\.\d+Z$/, "Z")}`,
    `elapsed_seconds: ${Math.round((Date.now() - startedAt) / 1000)}`,
    `generator: make-evidence-bundle.mjs`,
    `input_path: ${path.resolve(INPUT)}`,
    `input_basename: ${path.basename(INPUT)}`,
    `input_bytes: ${stat.size}`,
    `input_sha256: ${sha256}`,
    `identity_vs_recorded_master: ${identity}`,
    `duration_seconds: ${duration.toFixed(3)}`,
    `chapters: ${chapters.length}`,
    `subtitle_map: ${SUB_MAP}`,
    `subtitle_extraction_status: ${subtitleStatus}`,
    `scene_scan_status: ${scanStatus}`,
    `frame_timestamp_status: ${timestampsComplete ? "complete" : "incomplete"}`,
    `grid_step_seconds: ${GRID_STEP}`,
    `sheet_step_seconds: ${SHEET_STEP}`,
    `sheet_tile: ${SHEET_TILE}`,
    `sheet_chunk_seconds: ${SHEET_CHUNK}`,
    `frame_width: ${FRAME_W}`,
    `thumb_width: ${THUMB_W}`,
    `scene_threshold: ${SCENE_THRESHOLD}`,
    `ffmpeg: ${ffmpegVersion}`,
    `ffprobe: ${ffprobeVersion}`,
    "",
    `timestamp_convention: selected decoded presentation PTS after ffmpeg input-start normalization; not raw container PTS`,
    `mapping_stills: 05-frame-times.csv records actual selected PTS, not a nominal grid`,
    `mapping_sheets: 06-sheet-times.csv records actual selected PTS per row-major tile`,
    "",
  ].join("\n");
  await fs.writeFile(path.join(OUT, "00-manifest.txt"), manifest, "utf8");

  step(6, "done");
  log(`   elapsed: ${clock((Date.now() - startedAt) / 1000)}`);
  log(`   output:  ${path.resolve(OUT)}`);

  if (identity === "MISMATCH") {
    console.log(
      "\n!! The input does not match the recorded Film 001 master digest.\n" +
        "!! Do not treat this bundle as canonical evidence. Report the digest.\n",
    );
  }
  if (identity === "MATCH") {
    console.log("\nOK: bundle matches the recorded viewing master.\n");
  }
}

async function hashFile(file, size) {
  const hash = createHash("sha256");
  const stream = createReadStream(file, { highWaterMark: 8 * 1024 * 1024 });
  let read = 0;
  let lastLogged = -1;

  for await (const chunk of stream) {
    hash.update(chunk);
    read += chunk.length;
    const pct = Math.floor((read / size) * 10) * 10;
    if (pct !== lastLogged && pct < 100) {
      lastLogged = pct;
      process.stdout.write(`\r   hashing... ${pct}%`);
    }
  }
  process.stdout.write("\r   hashing... 100%\n");
  return hash.digest("hex").toUpperCase();
}

function clock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

await main();
