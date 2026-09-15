/**
 * Pre-lock re-anchor ledger for The Truman Show (1998).
 *
 * This file deliberately does NOT modify FilmPackage canonical provenance.
 * It records reproducible chapter boundaries and master-grounded cue anchors
 * while Film 001 remains MASTER_IDENTIFIED + SECONDARY_SOURCES.
 *
 * TRANSCRIPT_ANCHORED means the relevant dialogue/text cue has an exact
 * timestamp in the embedded English subtitle track. It does not verify
 * picture-only staging, props, gestures, framing, or an interpretation.
 */

export {
  TRUMAN_MASTER_RUNTIME_SECONDS,
  trumanMasterChapters,
} from "./the-truman-show-master-segmentation";
export type { TrumanMasterChapter } from "./the-truman-show-master-segmentation";

const cue = (
  chapterId: string,
  timestampSeconds: number,
  note: string,
): TrumanTranscriptAnchor => ({
  chapterId,
  timestampSeconds,
  basis: "EMBEDDED_ENGLISH_SUBTITLE",
  note,
});

export const trumanEvidenceReanchors: TrumanEvidenceReanchor[] = [
  { evidenceId: "truman-ev-daycount", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-02"], note: "On-screen day counter requires picture-level verification." },
  { evidenceId: "truman-ev-greeting", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-02", 169.796, "Morning signature greeting cue.")], candidateChapterIds: [], note: "Dialogue timing is master-grounded." },
  { evidenceId: "truman-ev-routine", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-02"], note: "Routine/repetition is a montage and staging observation." },
  { evidenceId: "truman-ev-kaiser", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-02"], note: "Billboard placement and blocking require picture review." },
  { evidenceId: "truman-ev-interviews", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-01", 19.1, "Opening interview thesis begins.")], candidateChapterIds: [], note: "Dialogue timing is master-grounded." },
  { evidenceId: "truman-ev-light", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-02", 230.943, "Broadcast explanation of falling aircraft parts.")], candidateChapterIds: ["truman-ch-02"], note: "The explanation is transcript-anchored; the falling light and its marking remain visual." },
  { evidenceId: "truman-ev-radio", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-08", 1798.265, "Production radio audibly tracks Truman's route.")], candidateChapterIds: [], note: "Dialogue/radio timing is master-grounded." },
  { evidenceId: "truman-ev-raincloud", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-08"], note: "Localized rain behavior is picture-dependent." },
  { evidenceId: "truman-ev-quota", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-03", 431.983, "Insurance quota threat."), cue("truman-ch-06", 832.896, "School memory about wanting to explore.")], candidateChapterIds: ["truman-ch-03", "truman-ch-06"], note: "Existing evidence combines two different master moments and must be split or explicitly multi-anchored." },
  { evidenceId: "truman-ev-drowning", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-06"], note: "Father-loss flashback staging requires picture review." },
  { evidenceId: "truman-ev-sylvia", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-07", 1592.136, "Sylvia begins breaking the constructed reality."), cue("truman-ch-07", 1615.201, "Sylvia explicitly identifies the environment as fabricated.")], candidateChapterIds: [], note: "Core disclosure dialogue is master-grounded." },
  { evidenceId: "truman-ev-fiji", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-07", 1644.899, "Departure-to-Fiji dialogue.")], candidateChapterIds: ["truman-ch-07"], note: "Fiji dialogue is anchored; magazine-face collage remains visual." },
  { evidenceId: "truman-ev-ghost", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-06", 914.188, "Truman recognizes his father.")], candidateChapterIds: ["truman-ch-06"], note: "Recognition cue is anchored; identity/staging/removal remain visual." },
  { evidenceId: "truman-ev-poster", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-10", 2583.365, "Flight-to-Fiji request at travel agency.")], candidateChapterIds: ["truman-ch-10"], note: "Travel request is anchored; threatening poster composition remains visual." },
  { evidenceId: "truman-ev-mococoa", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-14", 3226.152, "Mococoa product-placement speech begins.")], candidateChapterIds: [], note: "Product-placement dialogue is master-grounded." },
  { evidenceId: "truman-ev-beer", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-05", 587.226, "Beer product-placement line.")], candidateChapterIds: [], note: "Dialogue timing is master-grounded; label-facing gesture can be reviewed separately." },
  { evidenceId: "truman-ev-bridge", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-12", 3033.162, "Dialogue confirms the bridge crossing.")], candidateChapterIds: ["truman-ch-12"], note: "Crossing is transcript-confirmed; fear/driver staging remains visual." },
  { evidenceId: "truman-ev-plant", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-13", 3122.337, "Officer addresses Truman by name.")], candidateChapterIds: ["truman-ch-13"], note: "Name slip is anchored; plant/emergency staging remains visual." },
  { evidenceId: "truman-ev-knife", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-14", 3272.199, "Meryl calls for intervention.")], candidateChapterIds: ["truman-ch-14"], note: "Dialogue is anchored; knife and blocking remain visual." },
  { evidenceId: "truman-ev-fingers", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-09"], note: "Wedding-photo crossed fingers are picture-only evidence." },
  { evidenceId: "truman-ev-marlon", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-15", 3464.272, "Marlon begins the assurance that he would not lie."), cue("truman-ch-15", 3469.903, "The assurance is repeated/continued.")], candidateChapterIds: [], note: "Core reassurance dialogue is master-grounded." },
  { evidenceId: "truman-ev-reunion", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-16", 3880.242, "Control-room dialogue labels the amnesia explanation.")], candidateChapterIds: ["truman-ch-15", "truman-ch-16"], note: "Existing evidence spans reunion staging and later explanation; it should be split or explicitly multi-scene." },
  { evidenceId: "truman-ev-escape", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-18", 4642.986, "Control room recognizes Truman is gone.")], candidateChapterIds: ["truman-ch-18"], note: "Disappearance is transcript-confirmed; escape method remains visual." },
  { evidenceId: "truman-ev-cuesun", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-18", 4810.033, "Artificial-sun command.")], candidateChapterIds: [], note: "Command timing is master-grounded." },
  { evidenceId: "truman-ev-boat", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-19"], note: "Boat identification and departure are primarily visual." },
  { evidenceId: "truman-ev-storm", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-20", 5169.945, "Truman challenges the storm."), cue("truman-ch-20", 5173.407, "Truman states the storm would have to kill him.")], candidateChapterIds: [], note: "Defiance dialogue is master-grounded; weather escalation can be reviewed visually." },
  { evidenceId: "truman-ev-wall", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-21"], note: "Collision with and examination of the painted horizon are picture-level evidence." },
  { evidenceId: "truman-ev-dialog", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-22", 5544.206, "Creator/Truman exchange begins.")], candidateChapterIds: [], note: "Dialogue timing is master-grounded." },
  { evidenceId: "truman-ev-nocamera", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-22", 5596.426, "Truman rejects the creator's claim to know his inner life.")], candidateChapterIds: [], note: "Dialogue timing is master-grounded." },
  { evidenceId: "truman-ev-exit", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-23", 5691.316, "Final signature greeting.")], candidateChapterIds: ["truman-ch-23"], note: "Final line is anchored; bow and physical exit remain visual." },
  { evidenceId: "truman-ev-guards", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-23", 5755.382, "Post-show viewers ask what else is on.")], candidateChapterIds: [], note: "Epilogue dialogue timing is master-grounded." },
  { evidenceId: "truman-ev-ferry", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-03", 459.928, "Ferry encounter dialogue begins.")], candidateChapterIds: ["truman-ch-03"], note: "Location/dialogue are anchored; fear response and retreat remain visual." },
  { evidenceId: "truman-ev-elevator", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-08", 2100.409, "Later dialogue explicitly refers to the elevator incident.")], candidateChapterIds: ["truman-ch-08"], note: "Transcript corroborates the incident; the backstage reveal itself remains visual." },
  { evidenceId: "truman-ev-trutalk", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-16", 4058.134, "TruTalk states Truman can leave."), cue("truman-ch-16", 4079.739, "TruTalk argues Truman prefers the enclosure.")], candidateChapterIds: [], note: "Interview dialogue is master-grounded." },
  { evidenceId: "truman-ev-sleep", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-17"], note: "Creator-at-monitor composition is picture-dependent." },
  { evidenceId: "truman-ev-conception", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-16", 4122.283, "On-air conception plan is stated.")], candidateChapterIds: [], note: "Dialogue timing is master-grounded." },
  { evidenceId: "truman-ev-album", status: "MIXED_REVIEW_REQUIRED", anchors: [cue("truman-ch-09", 2222.262, "Mother's photo-album reminiscence begins.")], candidateChapterIds: ["truman-ch-09"], note: "Dialogue is anchored; album-image selection/manipulation remains visual." },
  { evidenceId: "truman-ev-europe", status: "VISUAL_REVIEW_REQUIRED", anchors: [], candidateChapterIds: ["truman-ch-06"], note: "Newspaper headline is on-screen text and requires visual verification; exact frame time remains open." },
  { evidenceId: "truman-ev-born-live", status: "TRANSCRIPT_ANCHORED", anchors: [cue("truman-ch-20", 5101.959, "Control-room response states Truman was born on television.")], candidateChapterIds: [], note: "Dialogue timing is master-grounded." },
];
