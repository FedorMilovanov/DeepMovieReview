import type { TrumanReanchorStatus } from "./the-truman-show-master-reanchor";

export type TrumanEvidenceReplacementGrounding =
  | "TRANSCRIPT"
  | "VISUAL"
  | "MIXED";

export type TrumanEvidenceReplacementCandidate = {
  id: string;
  grounding: TrumanEvidenceReplacementGrounding;
  chapterIds: string[];
  anchorTimestampSeconds?: number;
  note: string;
};

export type TrumanEvidenceMigrationPlan = {
  retiringEvidenceId: string;
  expectedSupportReferences: number;
  migrationKind: "SPLIT" | "REWRITE";
  replacements: TrumanEvidenceReplacementCandidate[];
  claimLayerNotes: string[];
  sourceReanchorStatus: TrumanReanchorStatus;
};

/**
 * First dependency-safe migration wave.
 *
 * These are deliberately the compound evidence records with the smallest
 * support fan-out. The plan does not mutate FilmPackage yet; it freezes the
 * replacement graph and expected consumer counts so the eventual migration
 * can fail closed if another change rewires support in parallel.
 */
export const trumanEvidenceMigrationWave1: TrumanEvidenceMigrationPlan[] = [
  {
    retiringEvidenceId: "truman-ev-light",
    expectedSupportReferences: 1,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-light-fall",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-02"],
        note: "Falling fixture and visible marking; picture verification required.",
      },
      {
        id: "truman-ev-light-explanation",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-02"],
        anchorTimestampSeconds: 230.943,
        note: "Broadcast explanation after the falling-object event.",
      },
    ],
    claimLayerNotes: [
      "Do not embed the interpretation that this is the first 'crack in the world' inside either evidence observation.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-quota",
    expectedSupportReferences: 2,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-quota-pressure",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-03"],
        anchorTimestampSeconds: 431.983,
        note: "Insurance-office quota pressure.",
      },
      {
        id: "truman-ev-school-explorer",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-06"],
        anchorTimestampSeconds: 832.896,
        note: "School-memory exchange about exploration.",
      },
    ],
    claimLayerNotes: [
      "The broader claim that Seahaven engineers aspiration belongs in Family/Youth interpretation, not in raw evidence.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-ghost",
    expectedSupportReferences: 2,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-father-reappearance",
        grounding: "MIXED",
        chapterIds: ["truman-ch-06"],
        anchorTimestampSeconds: 914.188,
        note: "Recognition cue is transcript-anchored; identity/removal staging needs picture review.",
      },
      {
        id: "truman-ev-homelessness-cover-story",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-06"],
        note: "Newspaper/public-response cover story requires picture-level verification.",
      },
    ],
    claimLayerNotes: [
      "Do not merge the father's unscripted return with the later institutional cover story into one canonical observation.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-escape",
    expectedSupportReferences: 3,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-escape-method",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-18"],
        note: "Fake-sleep/subfloor escape method; picture verification required.",
      },
      {
        id: "truman-ev-broadcast-interruption",
        grounding: "MIXED",
        chapterIds: ["truman-ch-18"],
        anchorTimestampSeconds: 4642.986,
        note: "Control-room recognition that Truman is missing anchors the interruption sequence.",
      },
    ],
    claimLayerNotes: [
      "Historical/superlative wording about the first interruption in thirty years must retain independent provenance if kept.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-boat",
    expectedSupportReferences: 1,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "VISUAL_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-setting-sail",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-19"],
        note: "Truman's sailboat departure requires picture verification.",
      },
      {
        id: "truman-ev-audience-boat-reaction",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-19", "truman-ch-20"],
        note: "Audience-reaction montage is a separate visual observation.",
      },
    ],
    claimLayerNotes: [
      "The conclusion that sailing represents victory over fear belongs in interpretive support, not the raw boat observation.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-conception",
    expectedSupportReferences: 3,
    migrationKind: "REWRITE",
    sourceReanchorStatus: "TRANSCRIPT_ANCHORED",
    replacements: [
      {
        id: "truman-ev-conception-plan",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-16"],
        anchorTimestampSeconds: 4122.283,
        note: "The show states its plan for an on-air conception.",
      },
    ],
    claimLayerNotes: [
      "The privacy/body-as-content conclusion belongs in the supported moral/family claim layer rather than the evidence observation.",
      "Any separate claim about what is or is not shown in the broadcast requires its own verified source.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-trutalk",
    expectedSupportReferences: 2,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "TRANSCRIPT_ANCHORED",
    replacements: [
      {
        id: "truman-ev-trutalk-christof",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-16"],
        anchorTimestampSeconds: 4058.134,
        note: "Christof's claim that Truman can leave; continuation is also anchored later in the same interview.",
      },
      {
        id: "truman-ev-trutalk-sylvia-call",
        grounding: "MIXED",
        chapterIds: ["truman-ch-16"],
        note: "Sylvia's live-call response requires its own exact cue/picture verification before promotion.",
      },
      {
        id: "truman-ev-trutalk-control-room",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-16"],
        note: "Moon/control-room setting is a separate picture-level observation.",
      },
    ],
    claimLayerNotes: [
      "Do not treat Christof's stated rationale, Sylvia's rebuttal and the physical control-room location as one evidence record.",
    ],
  },
];
