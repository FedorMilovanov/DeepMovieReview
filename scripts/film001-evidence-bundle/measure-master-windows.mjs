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
 *   cue          one cue from the selected subtitle track (as recorded by ffprobe).
 *   cue start    a cue belongs to a window when its start lies in [from, to).
 *                A cue already active at the window start is not counted.
 *   silence      internal gap in the union of subtitle cue intervals. This is
 *                absence of subtitle coverage, not evidence of acoustic silence.
 *                The tail after the final covered instant is reported separately;
 *                it is not assumed to be silence or a credit roll.
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
if (!Number.isInteger(top) || top < 1) fail("--top must be a positive integer");
const requestedThreshold = arg("scene");

const round = (value, digits) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

// Both manifest runtime and the producer's CSV/SRT timestamps are serialized
// to milliseconds. Two independent roundings can differ by at most 1 ms at
// the endpoint. Only that endpoint tolerance is clamped; it never corrects a
// nonzero source offset or a timestamp before zero.
const END_ROUNDING_TOLERANCE_SECONDS = 0.001;

/** "HH:MM:SS.mmm" or elapsed "MM:SS" -> nonnegative seconds. */
function clockToSeconds(value, location) {
  const match = value.match(/^(?:(\d+):)?(\d{1,}):(\d{1,2})(?:[,.](\d{1,3}))?$/);
  if (!match) fail(`${location}: unreadable clock value "${value}"`);
  const [, rawHours, rawMinutes, rawSeconds, rawFraction = ""] = match;
  const hours = Number(rawHours ?? 0);
  const minutes = Number(rawMinutes);
  const seconds = Number(rawSeconds);
  if (![hours, minutes, seconds].every(Number.isSafeInteger) || seconds >= 60 || (rawHours !== undefined && minutes >= 60)) {
    fail(`${location}: impossible clock value "${value}"`);
  }
  const total = hours * 3600 + minutes * 60 + seconds + Number(`0.${rawFraction || "0"}`);
  if (!Number.isFinite(total)) fail(`${location}: impossible clock value "${value}"`);
  return total;
}

function withinRuntime(value, runtime, location) {
  if (!Number.isFinite(value) || value < 0) fail(`${location}: time must not be negative or non-finite`);
  if (value > runtime + END_ROUNDING_TOLERANCE_SECONDS + 1e-9) {
    fail(`${location}: time ${value}s exceeds runtime ${runtime}s (maximum endpoint rounding tolerance 0.001s)`);
  }
  return Math.min(value, runtime);
}

function readCuts(file, threshold, runtime) {
  const text = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const header = lines.shift()?.toLowerCase() ?? "";
  if (!/^time_s\s*,\s*score\s*$/.test(header)) fail("04-cuts.csv must start with a time_s,score header row");
  const cuts = [];
  for (const [index, line] of lines.entries()) {
    const [rawTime, rawScore, ...extra] = line.split(",");
    const time = Number(rawTime);
    const score = Number(rawScore);
    if (!rawTime?.trim() || !Number.isFinite(time) || time < 0 || !rawScore?.trim() || !Number.isFinite(score) || score < 0 || score > 1 || extra.length) fail(`bad cut row "${line}"`);
    // FFmpeg's strict gt(scene, threshold) selection precedes metadata printed
    // to six decimals, which our producers then serialize to four. A rounded
    // score at the threshold can have come from above it. Allow both rounding
    // steps and a tiny floating-point tolerance: reject only an impossible bin,
    // not a borderline value whose original score is no longer available.
    if (!/^(?:0|1)(?:\.\d{1,4})?$/.test(rawScore.trim())) fail(`bad cut row "${line}": score must have at most four decimal places`);
    const possibleUpperBound = Math.min(1, score + 0.0000505);
    if (threshold === 1 || possibleUpperBound + 1e-12 < threshold) {
      fail(`cut score "${rawScore.trim()}" is inconsistent with scene threshold ${threshold} after four-decimal rounding`);
    }
    const boundedTime = withinRuntime(time, runtime, `04-cuts.csv: row ${index + 2}`);
    cuts.push({ time: boundedTime, score });
  }
  cuts.sort((a, b) => a.time - b.time);
  return cuts;
}

function readCues(file, runtime) {
  const text = readFileSync(file, "utf8").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const cues = [];
  const lines = text.split("\n");
  let index = 0;
  let block = 0;
  while (index < lines.length) {
    while (index < lines.length && !lines[index].trim()) index += 1;
    if (index >= lines.length) break;
    const firstLine = index + 1;
    const content = [];
    while (index < lines.length && lines[index].trim()) content.push(lines[index++]);
    block += 1;
    const location = `03-subs-en.srt: block ${block}, line ${firstLine}`;
    // Explicit NOTE comment blocks are accepted as a harmless extension. An
    // unknown block or cue missing its timing arrow is never silently skipped.
    if (/^NOTE(?:[ \t].*)?$/.test(content[0].trim())) continue;
    const timingIndex = /^\d+$/.test(content[0].trim()) ? 1 : 0;
    const timing = content[timingIndex];
    const match = timing?.match(/^\s*(\S+)\s+-->\s+(\S+)(?:\s+.*)?\s*$/);
    if (!match || timing.includes("-->", timing.indexOf("-->") + 3)) {
      fail(`${location}: malformed subtitle timing (expected "start --> end")`);
    }
    if (!content.slice(timingIndex + 1).some((line) => line.trim())) {
      fail(`${location}: subtitle cue has no text`);
    }
    const timingLocation = `03-subs-en.srt: block ${block}, line ${firstLine + timingIndex}`;
    const from = withinRuntime(clockToSeconds(match[1], timingLocation), runtime, timingLocation);
    const to = withinRuntime(clockToSeconds(match[2], timingLocation), runtime, timingLocation);
    if (!(to > from)) fail(`${timingLocation}: subtitle cue ends before or at its start`);
    cues.push({ from, to });
  }
  cues.sort((a, b) => a.from - b.from);
  return cues;
}

function readRuntimeSeconds(manifestFile) {
  const text = readFileSync(manifestFile, "utf8");
  const match = text.match(/^duration_seconds:\s*([0-9.]+)\s*$/m);
  if (!match) fail("00-manifest.txt has no duration_seconds line");
  const duration = Number(match[1]);
  if (!Number.isFinite(duration) || duration <= 0) fail("duration_seconds must be positive");
  return duration;
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
const probePath = path.join(bundleDir, "01-probe.json");
const manifest = readFileSync(manifestPath, "utf8");
const manifestValue = (key) => manifest.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m"))?.[1];
const recordedThreshold = Number(manifestValue("scene_threshold"));
if (!manifestValue("scene_threshold") || !Number.isFinite(recordedThreshold) || recordedThreshold < 0 || recordedThreshold > 1) {
  fail("00-manifest.txt must record a valid scene_threshold between 0 and 1");
}
const threshold = requestedThreshold === undefined ? recordedThreshold : Number(requestedThreshold);
if (!Number.isFinite(threshold) || threshold !== recordedThreshold) {
  fail(`--scene ${requestedThreshold} does not match the bundle scan threshold ${recordedThreshold}; re-scan the master at the requested threshold`);
}
if (manifestValue("scene_scan_status") && manifestValue("scene_scan_status") !== "complete") {
  fail(`scene scan was ${manifestValue("scene_scan_status")}; produce a complete scan before measuring`);
}
if (manifestValue("subtitle_extraction_status") && manifestValue("subtitle_extraction_status") !== "complete") {
  fail("subtitle extraction was not complete; choose a valid subtitle map and regenerate the bundle");
}
let probe;
try { probe = JSON.parse(readFileSync(probePath, "utf8")); }
catch { fail("01-probe.json is missing or unreadable; cannot establish the selected subtitle track"); }
const subtitleMap = manifestValue("subtitle_map") ?? "";
const relative = subtitleMap.match(/^0:s:(\d+)$/);
const absolute = subtitleMap.match(/^0:(\d+)$/);
const subtitleStreams = (probe.streams ?? []).filter(stream => stream.codec_type === "subtitle");
const subtitle = relative ? subtitleStreams[Number(relative[1])] : absolute
  ? subtitleStreams.find(stream => stream.index === Number(absolute[1])) : undefined;
if (!subtitle || !Number.isInteger(subtitle.index)) fail(`subtitle_map "${subtitleMap}" does not resolve to a subtitle stream in 01-probe.json`);
const language = subtitle.tags?.language;
const codec = subtitle.codec_name === "subrip" ? "SubRip" : (subtitle.codec_name ?? "unknown codec");
const subtitleTrack = language === "eng" && subtitle.codec_name === "subrip"
  ? `Embedded English SubRip (stream ${subtitle.index})`
  : `Embedded ${language || "language unspecified"} ${codec} (stream ${subtitle.index})`;

const runtimeSeconds = readRuntimeSeconds(manifestPath);
const cuts = readCuts(cutsPath, threshold, runtimeSeconds);
const cues = readCues(cuesPath, runtimeSeconds);

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
// Merge coverage, not merely neighbouring rows: a short nested cue must not
// expose a false gap before the earlier, longer cue has actually ended.
let lastCueEnd = cues[0]?.to ?? 0;
for (let i = 1; i < cues.length; i += 1) {
  const cue = cues[i];
  if (cue.from > lastCueEnd) {
    silences.push({
      from: round(lastCueEnd, 3),
      to: round(cue.from, 3),
      durationSeconds: round(cue.from - lastCueEnd, 3),
      detectedTransitions: transitionsIn(lastCueEnd, cue.from),
    });
  }
  lastCueEnd = Math.max(lastCueEnd, cue.to);
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
    subtitleTrack,
  },
  method: {
    transition: "ffmpeg scene score above threshold on the native-resolution stream; written by make-evidence-bundle.mjs",
    hold: "gap between two consecutive detected transitions",
    cueWindow: "a subtitle cue belongs to a window when its start lies in [from, to)",
    silence: "internal gap between merged subtitle cue intervals; no inference about audio",
    caveat: "threshold detection is not a shot log: a long dissolve can stay below the threshold",
  },
  totals: {
    detectedTransitions: cuts.length,
    subtitleCues: cues.length,
    runtimeSecondsPerDetectedTransition: cuts.length ? round(runtimeSeconds / cuts.length, 2) : null,
    adjacentTransitionGapCount: Math.max(0, cuts.length - 1),
    meanSecondsBetweenTransitions: cuts.length > 1
      ? round((cuts.at(-1).time - cuts[0].time) / (cuts.length - 1), 2)
      : null,
    firstTransitionSeconds: cuts.length ? round(cuts[0].time, 3) : null,
    lastTransitionSeconds: cuts.length ? round(cuts.at(-1).time, 3) : null,
    lastCueEndSeconds: round(lastCueEnd, 3),
    tailAfterLastCueSeconds: round(runtimeSeconds - lastCueEnd, 3),
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
  windows: NAMED_WINDOWS.filter((window) => window.to <= runtimeSeconds).map((window) => ({
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
