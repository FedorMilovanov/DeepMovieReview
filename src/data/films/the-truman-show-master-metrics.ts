import { trumanMasterChapters } from "./the-truman-show-master-reanchor";

/**
 * Reproducible, master-derived editorial metrics for Film 001.
 *
 * These values are NOT canonical narrative scene counts and are not public
 * analytical conclusions. Scene-change candidates were produced by a full
 * FFmpeg decode using a downscaled 320px-wide analysis stream and
 * select='gt(scene,0.32)'. Subtitle cue counts come from the embedded English
 * SubRip stream of the exact identified viewing master.
 */
export const TRUMAN_SCENE_CHANGE_THRESHOLD = 0.32;
export const TRUMAN_MASTER_SCENE_CHANGE_CANDIDATES = 1036;
export const TRUMAN_MASTER_ENGLISH_SUBTITLE_CUES = 695;

export type TrumanMasterChapterMetric = {
  chapterId: string;
  sceneChangeCandidates: number;
  embeddedEnglishSubtitleCues: number;
};

export const trumanMasterChapterMetrics: TrumanMasterChapterMetric[] = [
  { chapterId: "truman-ch-01", sceneChangeCandidates: 14, embeddedEnglishSubtitleCues: 25 },
  { chapterId: "truman-ch-02", sceneChangeCandidates: 59, embeddedEnglishSubtitleCues: 32 },
  { chapterId: "truman-ch-03", sceneChangeCandidates: 23, embeddedEnglishSubtitleCues: 12 },
  { chapterId: "truman-ch-04", sceneChangeCandidates: 11, embeddedEnglishSubtitleCues: 5 },
  { chapterId: "truman-ch-05", sceneChangeCandidates: 6, embeddedEnglishSubtitleCues: 19 },
  { chapterId: "truman-ch-06", sceneChangeCandidates: 59, embeddedEnglishSubtitleCues: 41 },
  { chapterId: "truman-ch-07", sceneChangeCandidates: 87, embeddedEnglishSubtitleCues: 70 },
  { chapterId: "truman-ch-08", sceneChangeCandidates: 71, embeddedEnglishSubtitleCues: 38 },
  { chapterId: "truman-ch-09", sceneChangeCandidates: 78, embeddedEnglishSubtitleCues: 44 },
  { chapterId: "truman-ch-10", sceneChangeCandidates: 40, embeddedEnglishSubtitleCues: 19 },
  { chapterId: "truman-ch-11", sceneChangeCandidates: 48, embeddedEnglishSubtitleCues: 19 },
  { chapterId: "truman-ch-12", sceneChangeCandidates: 54, embeddedEnglishSubtitleCues: 38 },
  { chapterId: "truman-ch-13", sceneChangeCandidates: 23, embeddedEnglishSubtitleCues: 14 },
  { chapterId: "truman-ch-14", sceneChangeCandidates: 23, embeddedEnglishSubtitleCues: 24 },
  { chapterId: "truman-ch-15", sceneChangeCandidates: 25, embeddedEnglishSubtitleCues: 49 },
  { chapterId: "truman-ch-16", sceneChangeCandidates: 88, embeddedEnglishSubtitleCues: 90 },
  { chapterId: "truman-ch-17", sceneChangeCandidates: 54, embeddedEnglishSubtitleCues: 31 },
  { chapterId: "truman-ch-18", sceneChangeCandidates: 77, embeddedEnglishSubtitleCues: 59 },
  { chapterId: "truman-ch-19", sceneChangeCandidates: 33, embeddedEnglishSubtitleCues: 15 },
  { chapterId: "truman-ch-20", sceneChangeCandidates: 86, embeddedEnglishSubtitleCues: 21 },
  { chapterId: "truman-ch-21", sceneChangeCandidates: 28, embeddedEnglishSubtitleCues: 0 },
  { chapterId: "truman-ch-22", sceneChangeCandidates: 31, embeddedEnglishSubtitleCues: 26 },
  { chapterId: "truman-ch-23", sceneChangeCandidates: 17, embeddedEnglishSubtitleCues: 4 },
  { chapterId: "truman-ch-24", sceneChangeCandidates: 1, embeddedEnglishSubtitleCues: 0 },
];

export type TrumanDerivedChapterMetric = TrumanMasterChapterMetric & {
  durationSeconds: number;
  sceneChangeCandidatesPerMinute: number;
  embeddedEnglishSubtitleCuesPerMinute: number;
  meanSecondsPerCandidateSegment: number;
};

const round = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export function deriveTrumanMasterChapterMetrics(): TrumanDerivedChapterMetric[] {
  const metricsByChapterId = new Map(
    trumanMasterChapterMetrics.map((metric) => [metric.chapterId, metric]),
  );

  return trumanMasterChapters.map((chapter) => {
    const metric = metricsByChapterId.get(chapter.id);
    if (!metric) {
      throw new Error(`Missing master-derived metrics for ${chapter.id}`);
    }

    const durationSeconds =
      chapter.endTimestampSeconds - chapter.startTimestampSeconds;

    return {
      ...metric,
      durationSeconds,
      sceneChangeCandidatesPerMinute: round(
        (metric.sceneChangeCandidates / durationSeconds) * 60,
        2,
      ),
      embeddedEnglishSubtitleCuesPerMinute: round(
        (metric.embeddedEnglishSubtitleCues / durationSeconds) * 60,
        2,
      ),
      meanSecondsPerCandidateSegment: round(
        durationSeconds / (metric.sceneChangeCandidates + 1),
        3,
      ),
    };
  });
}
