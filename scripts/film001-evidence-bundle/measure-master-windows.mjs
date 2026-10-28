#!/usr/bin/env node
/**
 * Film 001 — master timing measurement.
 *
 * Reads the derived bundle produced by `make-evidence-bundle.mjs` and emits the
 * timing table the public article is allowed to quote:
 *
 *   - total detected transitions and subtitle cues;
 *   - the longest stretches without a detected transition ("holds");
 *   - the longest stretches without a subtitle cue ("silences");
 *   - named editorial windows.
 *
 * Why this exists: prose numbers in an article drift away from the master. This
 * script is the only sanctioned source for those numbers, `src/data/films/
 * the-truman-show-master-windows.json` is its committed output, and the article
 * validator refuses measurement blocks that do not resolve to a window here.
 *
 * Method (deliberately narrow, so every number is falsifiable):
 *
 *   transition   one row of 04-cuts.csv: an ffmpeg `scene` score above
 *                `--scene` on the native-resolution stream. Threshold detection
 *                is not a shot log — a long dissolve can stay below the
 *                threshold and read as one continuous stretch. Every claim built
 *                on this data must say "detected transition", never "shot".
 *   hold         interval between two consecutive detected transitions.
 *   cue          one embedded English SubRip cue.
 *   cue start    a cue belongs to a window when its start lies in
 *                [from, to). Cues that straddle a boundary are not counted.
 *   silence      interval between the end of one cue and the start of the next.
 *                The tail after the final cue is reported separately, because it
 *                is the credit roll and not part of the film body.
 *
 * Usage:
 *   node measure-master-windows.mjs --bundle "<dir>" [--out <file>] [--top 6]
 *
 * Nothing here reads or writes the movie file itself.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const argv = process.argv.slice(2);

function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const value = argv[i + 1];
  if (value === undefined || value.startsWith("--")) fail(`--${name} requires a value`);
  return value;
}

function fail(message) {
  process.stderr.write(`measure-master-windows: ${message}\n`);
  process.exit(1);
}

const bundleDir = arg("bundle");
if (!bundleDir) fail("--bundle <dir> is required (the directory make-evidence-bundle.mjs wrote)");

const outFile = arg("out");
const top = Number(arg("top", "6"));
const threshold = Number(arg("scene", "0.32"));

const round = (value, digits) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/** "HH:MM:SS.mmm" or "MM:SS" -> seconds. */
function clockToSeconds(value) {
  const parts = value.trim().split(":");
  if (parts.length < 2 || parts.length > 3) fail(`unreadable clock value "${value}"`);
  const seconds = Number(parts.pop().replace(",", "."));
  const minutes = Number(parts.pop());
  const hours = parts.length ? Number(parts.pop()) : 0;
  if (![seconds, minutes, hours].every(Number.isFinite)) fail(`unreadable clock value "${value}"`);
  return hours * 3600 + minutes * 60 + seconds;
}

function readCuts(file) {
  const text = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const header = lines.shift()?.toLowerCase() ?? "";
  if (!header.startsWith("time_s")) fail("04-cuts.csv must start with a time_s header row");
  const cuts = [];
  for (const line of lines) {
    const [rawTime, rawScore] = line.split(",");
    const time = Number(rawTime);
    const score = Number(rawScore);
    if (!Number.isFinite(time) || time < 0) fail(`bad cut timestamp "${line}"`);
    cuts.push({ time, score: Number.isFinite(score) ? score : null });
  }
  cuts.sort((a, b) => a.time - b.time);
  return cuts;
}

function readCues(file) {
  const text = readFileSync(file, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const cues = [];
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split("\n");
    const arrowIndex = lines.findIndex((line) => line.includes("-->"));
    if (arrowIndex === -1) continue;
    const [rawFrom, rawTo] = lines[arrowIndex].split("-->");
    const from = clockToSeconds(rawFrom.trim());
    const to = clockToSeconds(rawTo.trim().split(/\s+/)[0]);
    if (!(to > from)) fail(`subtitle cue ends before it starts near ${rawFrom.trim()}`);
    cues.push({ from, to });
  }
  cues.sort((a, b) => a.from - b.from);
  return cues;
}

function readRuntimeSeconds(manifestFile) {
  const text = readFileSync(manifestFile, "utf8");
  const match = text.match(/^duration_seconds:\s*([0-9.]+)\s*$/m);
  if (!match) fail("00-manifest.txt has no duration_seconds line");
  return Number(match[1]);
}

function readMasterDigest(manifestFile) {
  const text = readFileSync(manifestFile, "utf8");
  const match = text.match(/^input_sha256:\s*([A-Fa-f0-9]{64})\s*$/m);
  return match ? match[1].toUpperCase() : null;
}

const digest = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

/** Named editorial windows: fixed, reviewable, and quoted by the article. */
const NAMED_WINDOWS = [
  { id: "library", key: "22:00-23:00", from: 1320, to: 1380 },
  { id: "panic", key: "46:29-47:34", from: 2789, to: 2854 },
  { id: "hes-gone", key: "73:20-81:00", from: 4400, to: 4860 },
  { id: "wall", key: "87:44-91:51", from: 5264.092, to: 5511 },
];

const cutsPath = path.join(bundleDir, "04-cuts.csv");
const cuesPath = path.join(bundleDir, "03-subs-en.srt");
const manifestPath = path.join(bundleDir, "00-manifest.txt");

const cuts = readCuts(cutsPath);
const cues = readCues(cuesPath);
const runtimeSeconds = readRuntimeSeconds(manifestPath);

const transitionsIn = (from, to) => cuts.filter((cut) => cut.time >= from && cut.time < to).length;
const cueStartsIn = (from, to) => cues.filter((cue) => cue.from >= from && cue.from < to).length;

const holds = [];
for (let i = 0; i < cuts.length - 1; i += 1) {
  const from = cuts[i].time;
  const to = cuts[i + 1].time;
  holds.push({
    from: round(from, 3),
    to: round(to, 3),
    durationSeconds: round(to - from, 3),
    subtitleCueStarts: cueStartsIn(from, to),
  });
}

const silences = [];
for (let i = 0; i < cues.length - 1; i += 1) {
  const from = cues[i].to;
  const to = cues[i + 1].from;
  if (to <= from) continue;
  silences.push({
    from: round(from, 3),
    to: round(to, 3),
    durationSeconds: round(to - from, 3),
    detectedTransitions: transitionsIn(from, to),
  });
}

const longestHold = holds.reduce((best, hold) => (hold.durationSeconds > (best?.durationSeconds ?? -1) ? hold : best), null);

const report = {
  $comment:
    "Generated by scripts/film001-evidence-bundle/measure-master-windows.mjs from the derived Film 001 bundle. Do not hand-edit: re-run the script.",
  inputs: {
    masterSha256: readMasterDigest(manifestPath),
    durationSeconds: runtimeSeconds,
    sceneScoreThreshold: threshold,
    cutsCsvSha256: digest(cutsPath),
    subtitleSrtSha256: digest(cuesPath),
    subtitleTrack: "Embedded English SubRip (stream 8)",
  },
  method: {
    transition: "ffmpeg scene score above threshold on the native-resolution stream; written by make-evidence-bundle.mjs",
    hold: "gap between two consecutive detected transitions",
    cueWindow: "a subtitle cue belongs to a window when its start lies in [from, to)",
    silence: "gap between the end of one subtitle cue and the start of the next",
    caveat: "threshold detection is not a shot log: a long dissolve can stay below the threshold",
  },
  totals: {
    detectedTransitions: cuts.length,
    subtitleCues: cues.length,
    meanSecondsBetweenTransitions: round(runtimeSeconds / cuts.length, 2),
    firstTransitionSeconds: round(cuts[0]?.time ?? 0, 3),
    lastTransitionSeconds: round(cuts.at(-1)?.time ?? 0, 3),
    lastCueEndSeconds: round(cues.at(-1)?.to ?? 0, 3),
    tailAfterLastCueSeconds: round(runtimeSeconds - (cues.at(-1)?.to ?? 0), 3),
  },
  longestHold,
  holds: holds
    .slice()
    .sort((a, b) => b.durationSeconds - a.durationSeconds)
    .slice(0, top),
  silences: silences
    .slice()
    .sort((a, b) => b.durationSeconds - a.durationSeconds)
    .slice(0, top),
  windows: NAMED_WINDOWS.map((window) => ({
    id: window.id,
    label: window.key,
    from: window.from,
    to: window.to,
    durationSeconds: round(window.to - window.from, 3),
    detectedTransitions: transitionsIn(window.from, window.to),
    subtitleCueStarts: cueStartsIn(window.from, window.to),
  })),
};

const json = `${JSON.stringify(report, null, 2)}\n`;
if (outFile) writeFileSync(outFile, json, "utf8");
process.stdout.write(json);
