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

export type TrumanDirectEvidenceRewire = {
  consumerId: string;
  replacementId: string;
  note: string;
};

export type TrumanEvidenceMigrationPlan = {
  retiringEvidenceId: string;
  expectedSupportReferences: number;
  migrationKind: "SPLIT" | "REWRITE";
  replacements: TrumanEvidenceReplacementCandidate[];
  claimLayerNotes: string[];
  sourceReanchorStatus: TrumanReanchorStatus;
  directEvidenceRewires?: TrumanDirectEvidenceRewire[];
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


/**
 * Second dependency-safe migration wave.
 *
 * These four compound records have medium fan-out (24 support references
 * total). As in wave 1, this is a pre-mutation contract: it distinguishes
 * film-observable replacements from secondary/contextual assertions that
 * should leave the canonical evidence graph rather than being laundered
 * through the viewing master.
 */
export const trumanEvidenceMigrationWave2: TrumanEvidenceMigrationPlan[] = [
  {
    retiringEvidenceId: "truman-ev-daycount",
    expectedSupportReferences: 7,
    migrationKind: "REWRITE",
    sourceReanchorStatus: "VISUAL_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-day-counter",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-02"],
        note: "On-screen day counter only; exact picture timestamp remains pending visual review.",
      },
    ],
    claimLayerNotes: [
      "Do not carry age, continuous-broadcast duration or camera-count metadata into this film observation unless separately supported.",
      "Off-screen production scale belongs in Sources/Method or separately attributed secondary context, not canonical film observation.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-sylvia",
    expectedSupportReferences: 4,
    migrationKind: "REWRITE",
    sourceReanchorStatus: "TRANSCRIPT_ANCHORED",
    replacements: [
      {
        id: "truman-ev-sylvia-disclosure",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-07"],
        anchorTimestampSeconds: 1592.136,
        note: "Sylvia's disclosure sequence begins here; the stronger explicit set/fabrication cue follows at 1615.201.",
      },
    ],
    claimLayerNotes: [
      "Do not bundle later identity/activism context into the beach/library disclosure observation.",
      "Any claim that she is part of an organized Free Truman movement needs its own on-screen or secondary provenance.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-fiji",
    expectedSupportReferences: 6,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-fiji-departure",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-07"],
        anchorTimestampSeconds: 1644.899,
        note: "Departure-to-Fiji dialogue is master-grounded.",
      },
      {
        id: "truman-ev-sylvia-collage",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-02", "truman-ch-07"],
        note: "Magazine/collage imagery requires picture-level location and timestamp verification; candidate chapters intentionally remain broad.",
      },
    ],
    claimLayerNotes: [
      "The interpretation that Fiji becomes the name of everything real outside Seahaven belongs in a supported thematic/character claim, not raw evidence.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-reunion",
    expectedSupportReferences: 7,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-father-reunion",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-15"],
        note: "Father/son reunion staging requires picture-level verification.",
      },
      {
        id: "truman-ev-amnesia-explanation",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-16"],
        anchorTimestampSeconds: 3880.242,
        note: "Control-room dialogue explicitly labels the amnesia explanation.",
      },
    ],
    claimLayerNotes: [
      "Ratings impact and the assertion that Truman is returned to normal routine are separate editorial/contextual claims and must not remain inside one evidence observation.",
    ],
  },
];


/**
 * Third migration wave: high-fan-out compound evidence.
 *
 * These three records carry 33 downstream references. They are intentionally
 * modeled last and include explicit direct-consumer rewires where a consumer
 * stores one evidenceId outside normal ClaimSupport arrays.
 */
export const trumanEvidenceMigrationWave3: TrumanEvidenceMigrationPlan[] = [
  {
    retiringEvidenceId: "truman-ev-knife",
    expectedSupportReferences: 8,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-meryl-confrontation",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-14"],
        note: "Kitchen confrontation and weapon handling require picture verification.",
      },
      {
        id: "truman-ev-meryl-call-for-help",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-14"],
        anchorTimestampSeconds: 3272.199,
        note: "Meryl's direct appeal for intervention is master-grounded.",
      },
      {
        id: "truman-ev-marlon-intervention",
        grounding: "MIXED",
        chapterIds: ["truman-ch-14"],
        note: "Marlon's arrival/intervention is a separate event and still needs exact picture/dialogue boundary verification.",
      },
    ],
    claimLayerNotes: [
      "Do not keep the interpretation that performer/character can no longer endure the fake marriage inside raw evidence.",
      "Consumers about weapon use, performance break and third-party intervention must not all receive the same replacement automatically.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-storm",
    expectedSupportReferences: 11,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "TRANSCRIPT_ANCHORED",
    replacements: [
      {
        id: "truman-ev-storm-escalation",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-20"],
        note: "Manufactured storm escalation is picture/sound-sequence evidence requiring manual verification.",
      },
      {
        id: "truman-ev-storm-defiance",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-20"],
        anchorTimestampSeconds: 5169.945,
        note: "Truman's verbal defiance sequence begins here; the explicit kill-me continuation follows at 5173.407.",
      },
      {
        id: "truman-ev-storm-control-decision",
        grounding: "MIXED",
        chapterIds: ["truman-ch-20"],
        note: "Control-room continuation/stop decision must be verified independently from Truman's own defiance.",
      },
    ],
    claimLayerNotes: [
      "Decision/autonomy claims should use defiance; Christof/moral-control claims need escalation/control-decision evidence.",
      "Craft/music consumers must not inherit a moralized umbrella event merely because they refer to the same sequence.",
    ],
  },
  {
    retiringEvidenceId: "truman-ev-exit",
    expectedSupportReferences: 14,
    migrationKind: "SPLIT",
    sourceReanchorStatus: "MIXED_REVIEW_REQUIRED",
    replacements: [
      {
        id: "truman-ev-final-greeting",
        grounding: "TRANSCRIPT",
        chapterIds: ["truman-ch-23"],
        anchorTimestampSeconds: 5691.316,
        note: "Final signature greeting is master-grounded.",
      },
      {
        id: "truman-ev-final-exit",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-23"],
        note: "Bow, door and physical departure require picture-level verification.",
      },
      {
        id: "truman-ev-final-audience-reaction",
        grounding: "VISUAL",
        chapterIds: ["truman-ch-23"],
        note: "Worldwide audience-reaction montage is a separate visual observation.",
      },
    ],
    claimLayerNotes: [
      "Truman's final act and the audience's reaction must not remain one evidence record.",
      "Craft-ending claims should combine the verified exit event with the already-separate guards evidence when appropriate.",
    ],
    directEvidenceRewires: [
      {
        consumerId: "truman-anchor-bow",
        replacementId: "truman-ev-final-exit",
        note: "Scene Autopsy bow/door anchor must point specifically to the physical exit observation.",
      },
    ],
  },
];
