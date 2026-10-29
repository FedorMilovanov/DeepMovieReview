#!/usr/bin/env node
/**
 * Film 001 — targeted frame extractor.
 *
 * The evidence bundle already covers the whole film coarsely. This tool pulls
 * *specific* frames, with the timestamp burned into the picture, so a single
 * requested frame is self-identifying and cannot be confused with a neighbour.
 *
 * Usage:
 *   node extract-frames.mjs --input "<file.mkv>" --out "<dir>" \
 *     --at "00:03:12.500,00:11:47,412.3"
 *
 * Options:
 *   --at     comma-separated list; HH:MM:SS.mmm, MM:SS, or plain seconds
 *   --width  output width in px (default 640)
 *   --pad    seconds of extra frames around each timestamp (default 0)
 *   --label  prefix drawn above the timestamp (default "DMR")
 *
 * Output: <out>/f_<seconds>.jpg  (e.g. f_00192.500.jpg)
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const INPUT = arg("input");
const OUT = arg("out", "./frames");
const AT = arg("at");
const WIDTH = Number(arg("width", "640"));
const PAD = Number(arg("pad", "0"));
const LABEL = arg("label", "DMR");

if (!INPUT) {
  console.error("ERROR: --input is required");
  process.exit(1);
}
if (!AT) {
  console.error('ERROR: --at is required, e.g. --at "00:03:12.5,00:11:47"');
  process.exit(1);
}

/** Accept HH:MM:SS.mmm, MM:SS, or plain seconds; return seconds. */
function parseTime(raw) {
  const text = raw.trim();
  if (/^\d+(\.\d+)?$/.test(text)) return Number(text);
  const parts = text.split(":").map(Number);
  if (parts.some((p) => !Number.isFinite(p))) return NaN;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return NaN;
}

function clock(seconds) {
  const ms = Math.round((seconds % 1) * 1000);
  const total = Math.floor(seconds);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}.${String(ms).padStart(3, "0")}`;
}

const times = AT.split(",").map(parseTime);
const bad = times.filter((t) => !Number.isFinite(t) || t < 0);
if (bad.length) {
  console.error(`ERROR: could not parse timestamps: ${bad.join(", ")}`);
  process.exit(1);
}

await fs.mkdir(OUT, { recursive: true });
console.log(`== input: ${INPUT}`);
console.log(`== out:   ${path.resolve(OUT)}`);
console.log(`== frames requested: ${times.length} (${WIDTH}px)`);

let ok = 0;
for (const t of times) {
  const stamp = clock(t);
  const target = path.join(OUT, `f_${t.toFixed(3).padStart(9, "0")}.jpg`);

  // Burn the timestamp into the frame so a single image is self-identifying.
  const filter = [
    `scale=${WIDTH}:-2`,
    `drawtext=text='${LABEL} ${stamp}':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=5`,
  ].join(",");

  const result = spawnSync(
    "ffmpeg",
    [
      "-y", "-hide_banner", "-loglevel", "error",
      "-ss", String(Math.max(0, t - PAD)),
      "-i", INPUT,
      "-vf", filter,
      "-frames:v", "1",
      "-q:v", "3",
      target,
    ],
    { encoding: "utf8", windowsHide: true },
  );

  if (result.error) {
    console.error(`   ERROR: ffmpeg not runnable: ${result.error.message}`);
    process.exit(1);
  }

  // drawtext needs a font; if it is unavailable fall back to a plain frame.
  if (result.status !== 0) {
    const plain = spawnSync(
      "ffmpeg",
      [
        "-y", "-hide_banner", "-loglevel", "error",
        "-ss", String(Math.max(0, t - PAD)),
        "-i", INPUT,
        "-vf", `scale=${WIDTH}:-2`,
        "-frames:v", "1",
        "-q:v", "3",
        target,
      ],
      { encoding: "utf8", windowsHide: true },
    );
    if (plain.status !== 0) {
      console.error(`   FAIL ${stamp}: ${(result.stderr || "").trim().split("\n").pop()}`);
      continue;
    }
    console.log(`   ok   ${stamp} (no burned label: drawtext unavailable)`);
    ok += 1;
    continue;
  }

  console.log(`   ok   ${stamp} -> ${path.basename(target)}`);
  ok += 1;
}

console.log(`\n${ok}/${times.length} frames written to ${path.resolve(OUT)}`);
