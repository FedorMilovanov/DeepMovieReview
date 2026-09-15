import type { FilmMasterSegment, FilmMasterSegmentation } from "@/lib/film-package";

export const TRUMAN_MASTER_RUNTIME_SECONDS = 6177.792;

export type TrumanMasterChapter = Omit<FilmMasterSegment, "label"> & {
  title: string;
};

export const trumanMasterChapters: TrumanMasterChapter[] = [
  { id: "truman-ch-01", sequenceIndex: 1, title: "A Day In A Life", startTimestampSeconds: 0, endTimestampSeconds: 162.537 },
  { id: "truman-ch-02", sequenceIndex: 2, title: "Day 10,909", startTimestampSeconds: 162.537, endTimestampSeconds: 409.283 },
  { id: "truman-ch-03", sequenceIndex: 3, title: "Aquaphobia", startTimestampSeconds: 409.283, endTimestampSeconds: 546.712 },
  { id: "truman-ch-04", sequenceIndex: 4, title: "The Chef's Pal", startTimestampSeconds: 546.712, endTimestampSeconds: 583.457 },
  { id: "truman-ch-05", sequenceIndex: 5, title: "Dreaming Of Fiji", startTimestampSeconds: 583.457, endTimestampSeconds: 691.357 },
  { id: "truman-ch-06", sequenceIndex: 6, title: "Memories Of Dad", startTimestampSeconds: 691.357, endTimestampSeconds: 1034.7 },
  { id: "truman-ch-07", sequenceIndex: 7, title: "\"Lauren\"...or Is It Sylvia?", startTimestampSeconds: 1034.7, endTimestampSeconds: 1769.225 },
  { id: "truman-ch-08", sequenceIndex: 8, title: "Paranoia", startTimestampSeconds: 1769.225, endTimestampSeconds: 2218.215 },
  { id: "truman-ch-09", sequenceIndex: 9, title: "There's No Place Like Home", startTimestampSeconds: 2218.215, endTimestampSeconds: 2553.926 },
  { id: "truman-ch-10", sequenceIndex: 10, title: "Travelers Deware", startTimestampSeconds: 2553.926, endTimestampSeconds: 2741.113 },
  { id: "truman-ch-11", sequenceIndex: 11, title: "Lady...Flowers... Dented Beetle", startTimestampSeconds: 2741.113, endTimestampSeconds: 2863.819 },
  { id: "truman-ch-12", sequenceIndex: 12, title: "\"I'm Being Spontaneous!\"", startTimestampSeconds: 2863.819, endTimestampSeconds: 3072.444 },
  { id: "truman-ch-13", sequenceIndex: 13, title: "Blocked At Every Turn", startTimestampSeconds: 3072.444, endTimestampSeconds: 3176.631 },
  { id: "truman-ch-14", sequenceIndex: 14, title: "Mococoa - It's The Best!", startTimestampSeconds: 3176.631, endTimestampSeconds: 3323.028 },
  { id: "truman-ch-15", sequenceIndex: 15, title: "Father And Son Reunion", startTimestampSeconds: 3323.028, endTimestampSeconds: 3668.039 },
  { id: "truman-ch-16", sequenceIndex: 16, title: "Trutalk", startTimestampSeconds: 3668.039, endTimestampSeconds: 4197.985 },
  { id: "truman-ch-17", sequenceIndex: 17, title: "Do You Think He Knows?", startTimestampSeconds: 4197.985, endTimestampSeconds: 4400.896 },
  { id: "truman-ch-18", sequenceIndex: 18, title: "\"He's Gone.\"", startTimestampSeconds: 4400.896, endTimestampSeconds: 4861.356 },
  { id: "truman-ch-19", sequenceIndex: 19, title: "Setting Sail", startTimestampSeconds: 4861.356, endTimestampSeconds: 5002.747 },
  { id: "truman-ch-20", sequenceIndex: 20, title: "Cue The Storm", startTimestampSeconds: 5002.747, endTimestampSeconds: 5264.092 },
  { id: "truman-ch-21", sequenceIndex: 21, title: "The Sky's The Limit", startTimestampSeconds: 5264.092, endTimestampSeconds: 5511.214 },
  { id: "truman-ch-22", sequenceIndex: 22, title: "\"Who am I?\"", startTimestampSeconds: 5511.214, endTimestampSeconds: 5689.308 },
  { id: "truman-ch-23", sequenceIndex: 23, title: "Good Afternoon, Good Evening, & Good Night", startTimestampSeconds: 5689.308, endTimestampSeconds: 5760.755 },
  { id: "truman-ch-24", sequenceIndex: 24, title: "Credits", startTimestampSeconds: 5760.755, endTimestampSeconds: 6177.792 },
];

export const trumanMasterSegmentation: FilmMasterSegmentation = {
  basis: "EMBEDDED_CHAPTERS",
  coverage: "COMPLETE",
  segments: trumanMasterChapters.map(({ title, ...segment }) => ({
    ...segment,
    label: title,
  })),
};
