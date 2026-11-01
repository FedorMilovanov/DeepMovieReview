import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const tool = resolve("scripts/film001-evidence-bundle");
function run(command, args, env = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", env: { ...process.env, ...env }, maxBuffer: 32 * 1024 * 1024 });
  if (result.error) throw result.error;
  return result;
}
function ok(command, args, env) {
  const result = run(command, args, env);
  assert.equal(result.status, 0, `${command} failed:\n${result.stdout}\n${result.stderr}`);
  return result;
}

test("Node and shell bundle tools preserve source PTS, scan threshold and subtitle identity", () => {
  // CI installs/probes FFmpeg explicitly; absence is a failure, not a false pass.
  ok("ffmpeg", ["-version"]); ok("ffprobe", ["-version"]);
  const dir = mkdtempSync(join(tmpdir(), "dmr-bundle-test-"));
  try {
    const input = join(dir, "sample.mkv");
    const subs = join(dir, "sample.srt");
    writeFileSync(subs, "1\n00:00:00,300 --> 00:00:01,200\nFirst\n\n2\n00:00:03,000 --> 00:00:04,200\nSecond\n");
    // Black for one second, then white. Old fps=1/2 sampled a white frame but
    // labelled it 0s; checking the actual pixels catches the timing lie.
    ok("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error",
      "-f", "lavfi", "-i", "color=black:s=64x36:r=4:d=1",
      "-f", "lavfi", "-i", "color=white:s=64x36:r=4:d=5",
      "-i", subs, "-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]",
      "-map", "[v]", "-map", "2:s:0", "-map", "2:s:0", "-c:v", "mpeg4", "-c:s", "srt",
      "-metadata:s:s:0", "language=eng", "-metadata:s:s:1", "language=ces", input]);
    const nodeBundle = join(dir, "node");
    const shellBundle = join(dir, "shell");
    ok(process.execPath, [join(tool, "make-evidence-bundle.mjs"), "--input", input, "--out", nodeBundle,
      "--sub", "0:s:1", "--grid", "2", "--sheet", "1", "--tile", "2x2", "--width", "64", "--thumb", "32", "--skip-hash"]);
    ok("bash", [join(tool, "make-evidence-bundle.sh"), input, shellBundle, "0:s:1"],
      { GRID_STEP: "2", SHEET_STEP: "1", SHEET_TILE: "2x2", FRAME_W: "64", THUMB_W: "32" });
    for (const bundle of [nodeBundle, shellBundle]) {
      const manifest = readFileSync(join(bundle, "00-manifest.txt"), "utf8");
      assert.match(manifest, /scene_scan_status: complete/);
      assert.match(manifest, /frame_timestamp_status: complete/);
      assert.match(manifest, /sheet_chunk_seconds: 4/);
      assert.equal(readFileSync(join(bundle, "05-frame-times.csv"), "utf8"),
        "file,pts_time_s\nf_00001.jpg,0\nf_00002.jpg,2\nf_00003.jpg,4\n");
      assert.match(readFileSync(join(bundle, "06-sheet-times.csv"), "utf8"), /sheet_002\.jpg,0,4/);
      assert.match(readFileSync(join(bundle, "04-cuts.csv"), "utf8"), /^time_s,score\n/);
      const pixel = spawnSync("ffmpeg", ["-v", "error", "-i", join(bundle, "05-frames/f_00001.jpg"),
        "-vf", "scale=1:1", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { encoding: null });
      assert.equal(pixel.status, 0, String(pixel.stderr));
      assert.ok(pixel.stdout[0] < 32, `first source frame must be black, got ${pixel.stdout[0]}`);
      const report = JSON.parse(ok(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", bundle]).stdout);
      assert.equal(report.inputs.sceneScoreThreshold, 0.32);
      assert.match(report.inputs.subtitleTrack, /ces SubRip \(stream 2\)/);
      assert.deepEqual(report.windows, [], "Truman-specific windows outside a synthetic clip must not be reported");
      const mismatch = run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", bundle, "--scene", "0.99"]);
      assert.notEqual(mismatch.status, 0);
      assert.match(mismatch.stderr, /re-scan the master/);
    }
    // A different scan threshold and grid must survive end-to-end, rather than
    // being relabelled by the consumer or calculated from a fixed 30-tile grid.
    const alternate = join(dir, "alternate");
    ok(process.execPath, [join(tool, "make-evidence-bundle.mjs"), "--input", input, "--out", alternate,
      "--sub", "0:s:0", "--scene", "0.99", "--grid", "1.2", "--sheet", "1", "--tile", "1x3", "--width", "64", "--thumb", "32", "--skip-hash"]);
    const alternateManifest = readFileSync(join(alternate, "00-manifest.txt"), "utf8");
    assert.match(alternateManifest, /sheet_chunk_seconds: 3/);
    const alternateReport = JSON.parse(ok(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", alternate, "--scene", "0.99"]).stdout);
    assert.equal(alternateReport.inputs.sceneScoreThreshold, 0.99);
    assert.match(alternateReport.inputs.subtitleTrack, /English SubRip \(stream 1\)/);
    assert.notEqual(run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", alternate, "--scene", "0.32"]).status, 0);

    // Container PTS start at .375s; the bundle explicitly uses FFmpeg's
    // normalized presentation timeline. Its first displayed picture is still
    // the first real input frame, not a fabricated nominal frame.
    const offset = join(dir, "offset.mkv");
    ok("ffmpeg", ["-y", "-v", "error", "-itsoffset", "0.375", "-i", input, "-map", "0", "-c", "copy", offset]);
    const offsetProbe = JSON.parse(ok("ffprobe", ["-v", "error", "-show_entries", "stream=start_time", "-select_streams", "v:0", "-of", "json", offset]).stdout);
    assert.ok(Math.abs(Number(offsetProbe.streams[0].start_time) - 0.375) < 0.002);
    const offsetBundle = join(dir, "offset-output");
    ok(process.execPath, [join(tool, "make-evidence-bundle.mjs"), "--input", offset, "--out", offsetBundle, "--sub", "0:s:0", "--grid", "2", "--sheet", "1", "--tile", "2x2", "--width", "64", "--thumb", "32", "--skip-hash"]);
    assert.match(readFileSync(join(offsetBundle, "00-manifest.txt"), "utf8"), /after ffmpeg input-start normalization/);
    assert.match(readFileSync(join(offsetBundle, "05-frame-times.csv"), "utf8"), /^file,pts_time_s\nf_00001.jpg,0\n/);

    // Remove the frame at 1s: the selected source frame for the next sheet tile
    // must be 1.25s, not the nominal 1s that the old fps approach reported.
    const irregular = join(dir, "irregular.mkv");
    ok("ffmpeg", ["-y", "-v", "error", "-i", input, "-map", "0:v:0", "-map", "0:s:0", "-vf", "select='not(eq(n,4))'", "-fps_mode", "vfr", "-c:v", "mpeg4", "-c:s", "copy", irregular]);
    for (const mode of ["node", "shell"]) {
      const out = join(dir, `irregular-${mode}`);
      if (mode === "node") ok(process.execPath, [join(tool, "make-evidence-bundle.mjs"), "--input", irregular, "--out", out, "--sub", "0:s:0", "--grid", "2", "--sheet", "1", "--tile", "2x2", "--width", "64", "--thumb", "32", "--skip-hash"]);
      else ok("bash", [join(tool, "make-evidence-bundle.sh"), irregular, out, "0:s:0"], { GRID_STEP: "2", SHEET_STEP: "1", SHEET_TILE: "2x2", FRAME_W: "64", THUMB_W: "32" });
      assert.match(readFileSync(join(out, "06-sheet-times.csv"), "utf8"), /sheet_001\.jpg,1,1\.25/);
    }

    const alternateShell = join(dir, "alternate-shell");
    ok("bash", [join(tool, "make-evidence-bundle.sh"), input, alternateShell, "0:s:1"],
      { GRID_STEP: "1.2", SHEET_STEP: "1", SHEET_TILE: "1x3", FRAME_W: "64", THUMB_W: "32", SCENE_THRESHOLD: "0.99" });
    assert.match(readFileSync(join(alternateShell, "00-manifest.txt"), "utf8"), /sheet_chunk_seconds: 3/);
    const shellReport = JSON.parse(ok(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", alternateShell, "--scene", "0.99"]).stdout);
    assert.equal(shellReport.inputs.sceneScoreThreshold, 0.99);
    assert.match(shellReport.inputs.subtitleTrack, /ces SubRip \(stream 2\)/);
    assert.notEqual(run(process.execPath, [join(tool, "make-evidence-bundle.mjs"), "--input", input, "--tile", "2x0"]).status, 0);
    assert.notEqual(run("bash", [join(tool, "make-evidence-bundle.sh"), input, join(dir, "invalid-grid")], { SHEET_TILE: "2x0" }).status, 0);

    const skipped = join(dir, "skipped");
    ok(process.execPath, [join(tool, "make-evidence-bundle.mjs"), "--input", input, "--out", skipped, "--sub", "0:s:0",
      "--grid", "2", "--sheet", "1", "--tile", "2x2", "--width", "64", "--thumb", "32", "--skip-hash", "--skip-scan"]);
    const noScan = run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", skipped]);
    assert.notEqual(noScan.status, 0);
    assert.match(noScan.stderr, /scene scan was skipped/);
    // A failed extraction, malformed scan row or stale partial result must not
    // be quietly promoted to a complete measurement report.
    const manifestPath = join(alternate, "00-manifest.txt");
    const manifest = readFileSync(manifestPath, "utf8");
    writeFileSync(manifestPath, manifest.replace("subtitle_extraction_status: complete", "subtitle_extraction_status: failed"));
    const failedSubs = run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", alternate]);
    assert.notEqual(failedSubs.status, 0); assert.match(failedSubs.stderr, /subtitle extraction was not complete/);
    writeFileSync(manifestPath, manifest.replace("scene_scan_status: complete", "scene_scan_status: failed"));
    const failedScan = run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", alternate]);
    assert.notEqual(failedScan.status, 0); assert.match(failedScan.stderr, /scene scan was failed/);
    writeFileSync(manifestPath, manifest);
    writeFileSync(join(alternate, "04-cuts.csv"), "time_s,score\n1,not-a-score\n");
    const malformed = run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", alternate]);
    assert.notEqual(malformed.status, 0); assert.match(malformed.stderr, /bad cut row/);
    for (const csv of ["time_s,score\n,0.4\n", "time_s,score\n1,0.4,unexpected\n", "time_s,other\n1,0.4\n"]) {
      writeFileSync(join(alternate, "04-cuts.csv"), csv);
      const rejected = run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", alternate]);
      assert.notEqual(rejected.status, 0, `malformed cut data must fail: ${csv}`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// These tiny bundles exercise the measurement consumer independently of FFmpeg
// and of the copyrighted master. All times in the SRT are integer seconds.
function withMeasurementBundle({ cues = [], cuts = [], threshold = 0.32, runtime = 100 }, check) {
  const dir = mkdtempSync(join(tmpdir(), "dmr-measure-test-"));
  const clock = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},000`;
  };
  try {
    writeFileSync(join(dir, "00-manifest.txt"), `duration_seconds: ${runtime}\nscene_threshold: ${threshold}\nsubtitle_map: 0:s:0\n`);
    writeFileSync(join(dir, "01-probe.json"), JSON.stringify({ streams: [{ index: 0, codec_type: "subtitle", codec_name: "subrip", tags: { language: "eng" } }] }));
    writeFileSync(join(dir, "03-subs-en.srt"), cues.map(([from, to], index) => `${index + 1}\n${clock(from)} --> ${clock(to)}\nText\n`).join("\n"));
    writeFileSync(join(dir, "04-cuts.csv"), `time_s,score\n${cuts.map(([time, score]) => `${time},${score}\n`).join("")}`);
    check(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

function measureBundle(dir, ...args) {
  return run(process.execPath, [join(tool, "measure-master-windows.mjs"), "--bundle", dir, "--top", "50", ...args]);
}

test("subtitle gaps use the union of nested, overlapping, touching and separate SRT cues", () => {
  const cases = [
    { name: "nested", cues: [[1, 10], [2, 3], [4, 5], [12, 13]], gaps: [[10, 12]] },
    { name: "overlapping", cues: [[1, 6], [4, 8], [9, 10]], gaps: [[8, 9]] },
    { name: "touching", cues: [[1, 2], [2, 3], [4, 5]], gaps: [[3, 4]] },
    { name: "separate", cues: [[8, 9], [1, 2], [4, 5]], gaps: [[2, 4], [5, 8]] },
    { name: "nested final cue", cues: [[1, 20], [3, 4]], gaps: [], lastEnd: 20 },
  ];
  for (const { name, cues, gaps, lastEnd } of cases) {
    withMeasurementBundle({ cues }, (dir) => {
      const result = measureBundle(dir);
      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      const actual = report.silences.map(({ from, to }) => [from, to]).sort((a, b) => a[0] - b[0]);
      assert.deepEqual(actual, gaps, name);
      if (lastEnd !== undefined) {
        assert.equal(report.totals.lastCueEndSeconds, lastEnd, name);
        assert.equal(report.totals.tailAfterLastCueSeconds, 100 - lastEnd, name);
      }
    });
  }
});

test("a rounded CSV score must be consistent with the recorded strict detection threshold", () => {
  for (const { threshold, score, valid } of [
    { threshold: 0.32, score: "0.3199", valid: false },
    // A true score slightly above .32 can round to .3200; equality is not proof
    // of a bad CSV or proof of the original unrounded score.
    { threshold: 0.32, score: "0.3200", valid: true },
    { threshold: 0.32, score: "0.3201", valid: true },
    { threshold: 0.320049, score: "0.3200", valid: true },
    // FFmpeg first prints six decimals, then the bundle rounds to four. A
    // threshold on that boundary cannot safely be rejected after both rounds.
    { threshold: 0.32005, score: "0.3200", valid: true },
    { threshold: 0.30005, score: "0.3000", valid: true },
    { threshold: 0.320051, score: "0.3200", valid: false },
    { threshold: 1, score: "1.0000", valid: false },
  ]) {
    withMeasurementBundle({ threshold, cuts: [[5, score]] }, (dir) => {
      const result = measureBundle(dir);
      assert.equal(result.status === 0, valid, `score ${score}, threshold ${threshold}: ${result.stderr}`);
      if (!valid) assert.match(result.stderr, /threshold/i);
    });
  }
});

test("zero or one detected transition never invents an adjacent interval", () => {
  for (const cuts of [[], [[20, "0.5000"]]]) {
    withMeasurementBundle({ cuts }, (dir) => {
      const result = measureBundle(dir);
      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      assert.equal(report.totals.detectedTransitions, cuts.length);
      assert.equal(report.totals.runtimeSecondsPerDetectedTransition, cuts.length ? 100 : null);
      assert.equal(report.totals.adjacentTransitionGapCount, 0);
      assert.equal(report.totals.meanSecondsBetweenTransitions, null);
      assert.deepEqual(report.holds, []);
      assert.equal(report.longestHold, null);
      assert.equal(report.totals.firstTransitionSeconds, cuts.length ? 20 : null);
      assert.equal(report.totals.lastTransitionSeconds, cuts.length ? 20 : null);
    });
  }
});

test("runtime per detection differs from the mean of adjacent detection gaps", () => {
  withMeasurementBundle({ cuts: [[50, "0.4000"], [10, "0.5000"], [20, "0.6000"]] }, (dir) => {
    const result = measureBundle(dir);
    assert.equal(result.status, 0, result.stderr);
    const { totals } = JSON.parse(result.stdout);
    assert.equal(totals.runtimeSecondsPerDetectedTransition, 33.33); // 100 / 3
    assert.equal(totals.adjacentTransitionGapCount, 2);
    assert.equal(totals.meanSecondsBetweenTransitions, 20); // (50 - 10) / 2
  });
});

test("cue starts are counted in [from,to), not by interval intersection", () => {
  withMeasurementBundle({ runtime: 2000, cuts: [[1320, "0.5000"], [1380, "0.5000"]],
    cues: [[1319, 1321], [1321, 1322], [1379, 1380], [1380, 1381]] }, (dir) => {
    const result = measureBundle(dir);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const library = report.windows.find(({ id }) => id === "library");
    assert.equal(library.subtitleCueStarts, 2); // the active-before-start block is not a start
    assert.equal(report.holds[0].subtitleCueStarts, 2);
    assert.equal([[1319, 1321], [1321, 1322], [1379, 1380], [1380, 1381]]
      .filter(([from, to]) => from < 1380 && to > 1320).length, 3);
  });
});

test("measurement inputs stay within the rounded runtime and never produce a negative tail", () => {
  const invalidSrt = [
    "1\n-00:00:01,000 --> 00:00:02,000\ntext\n",
    "1\n00:60:01,000 --> 01:01:02,000\ntext\n",
    "1\n00:00:61,000 --> 00:01:02,000\ntext\n",
    "1\n00:01:39,000 --> 00:01:41,000\ntext\n",
    "1\n00:01:41,000 --> 00:01:42,000\ntext\n",
    "1\n00:00:02,000 --> 00:00:01,000\ntext\n",
  ];
  withMeasurementBundle({}, (dir) => {
    for (const srt of invalidSrt) {
      writeFileSync(join(dir, "03-subs-en.srt"), srt);
      const result = measureBundle(dir);
      assert.notEqual(result.status, 0, `invalid cue accepted: ${srt}`);
      assert.match(result.stderr, /03-subs-en\.srt: block 1, line [12]/);
    }
    writeFileSync(join(dir, "03-subs-en.srt"), "1\n00:01:39,000 --> 00:01:40,001\ntext\n");
    const rounded = measureBundle(dir);
    assert.equal(rounded.status, 0, rounded.stderr);
    assert.equal(JSON.parse(rounded.stdout).totals.tailAfterLastCueSeconds, 0);
    writeFileSync(join(dir, "03-subs-en.srt"), "1\n00:01:39,000 --> 00:01:40,002\ntext\n");
    assert.notEqual(measureBundle(dir).status, 0, "an actual overrun is not endpoint rounding");
    writeFileSync(join(dir, "03-subs-en.srt"), "");
    for (const csv of ["time_s,score\n-1,0.4\n", "time_s,score\n101,0.4\n", "time_s,score\n100.002,0.4\n"]) {
      writeFileSync(join(dir, "04-cuts.csv"), csv);
      assert.notEqual(measureBundle(dir).status, 0, `invalid cut accepted: ${csv}`);
    }
    writeFileSync(join(dir, "04-cuts.csv"), "time_s,score\n100.001,0.4\n");
    const roundedCut = measureBundle(dir);
    assert.equal(roundedCut.status, 0, roundedCut.stderr);
    assert.equal(JSON.parse(roundedCut.stdout).totals.lastTransitionSeconds, 100);
  });
});

test("subtitle parsing ignores blanks and declared NOTE blocks but reports malformed cue location", () => {
  withMeasurementBundle({}, (dir) => {
    const file = join(dir, "03-subs-en.srt");
    writeFileSync(file, "\uFEFF\nNOTE imported metadata\nnot a subtitle cue\n\n1\n00:00:01,000 --> 00:00:02,000\nText\n\n\n");
    const valid = measureBundle(dir);
    assert.equal(valid.status, 0, valid.stderr);
    assert.equal(JSON.parse(valid.stdout).totals.subtitleCues, 1);
    for (const broken of [
      "1\n00:00:01,000 -> 00:00:02,000\nText\n",
      "1\n00:00:01,000 --> nonsense\nText\n",
      "1\n00:00:01,000 --> 00:00:02,000 --> 00:00:03,000\nText\n",
      "4\nno timing at all\n",
      "1\n00:00:01,000 --> 00:00:02,000\n",
    ]) {
      writeFileSync(file, `\nNOTE a comment\n\n${broken}`);
      const result = measureBundle(dir);
      assert.notEqual(result.status, 0, `corrupt cue accepted: ${broken}`);
      assert.match(result.stderr, /03-subs-en\.srt: block 2, line [45]/);
    }
    writeFileSync(file, "\n  \n");
    const empty = measureBundle(dir);
    assert.equal(empty.status, 0, empty.stderr);
    assert.equal(JSON.parse(empty.stdout).totals.tailAfterLastCueSeconds, 100);
  });
});
