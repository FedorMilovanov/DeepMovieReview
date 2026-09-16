export type TrumanSceneMigrationShape =
  | "SINGLE_MASTER_SEGMENT_CANDIDATE"
  | "MULTI_SEGMENT_AGGREGATE";

export type TrumanSceneMigrationBlocker =
  | "EVIDENCE_REWIRE"
  | "EDITORIAL_SCENE_REVIEW"
  | "DIRECT_SCENE_CONSUMER_REWIRE";

export type TrumanDirectSceneConsumer = {
  consumerId: string;
  note: string;
};

export type TrumanSceneMigrationReadiness = {
  currentSceneId: string;
  evidenceIds: string[];
  expectedEvidenceReferences: number;
  expectedDirectModuleSceneReferences: number;
  masterSegmentIds: string[];
  shape: TrumanSceneMigrationShape;
  blockers: TrumanSceneMigrationBlocker[];
  directSceneConsumers?: TrumanDirectSceneConsumer[];
  note: string;
};

/**
 * Research-era scene migration map derived from the current Film 001 evidence
 * placements plus the measured master re-anchor ledger.
 *
 * These entries do NOT define replacement canonical scenes. Even a current
 * scene whose evidence fits one embedded master segment still requires manual
 * editorial-scene review before a VERIFIED FilmSceneRecord may be authored.
 */
export const trumanSceneMigrationReadiness: TrumanSceneMigrationReadiness[] = [
  {
    currentSceneId: "truman-sc-morning",
    evidenceIds: ["truman-ev-daycount", "truman-ev-greeting", "truman-ev-routine", "truman-ev-kaiser", "truman-ev-interviews"],
    expectedEvidenceReferences: 5,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-01", "truman-ch-02"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Research-era morning bucket combines opening interview material with Day 10,909 morning material.",
  },
  {
    currentSceneId: "truman-sc-light",
    evidenceIds: ["truman-ev-light"],
    expectedEvidenceReferences: 1,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-02"],
    shape: "SINGLE_MASTER_SEGMENT_CANDIDATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "All currently associated evidence localizes to one master segment, but the editorial scene range is still unverified.",
  },
  {
    currentSceneId: "truman-sc-radio",
    evidenceIds: ["truman-ev-radio", "truman-ev-raincloud"],
    expectedEvidenceReferences: 2,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-08"],
    shape: "SINGLE_MASTER_SEGMENT_CANDIDATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Radio and localized-rain research evidence localize to the same master segment; semantic boundaries still require review.",
  },
  {
    currentSceneId: "truman-sc-school",
    evidenceIds: ["truman-ev-quota", "truman-ev-drowning"],
    expectedEvidenceReferences: 2,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-03", "truman-ch-06"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "The old school bucket incorrectly spans workplace quota pressure and later childhood/explorer/father-loss material.",
  },
  {
    currentSceneId: "truman-sc-sylvia",
    evidenceIds: ["truman-ev-sylvia", "truman-ev-fiji"],
    expectedEvidenceReferences: 2,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-07"],
    shape: "SINGLE_MASTER_SEGMENT_CANDIDATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Current Sylvia/Fiji evidence localizes to one master segment, but compound evidence decomposition remains separate.",
  },
  {
    currentSceneId: "truman-sc-ferry",
    evidenceIds: ["truman-ev-ferry"],
    expectedEvidenceReferences: 1,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-03"],
    shape: "SINGLE_MASTER_SEGMENT_CANDIDATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Ferry evidence localizes to one segment; exact visual scene boundaries remain unverified.",
  },
  {
    currentSceneId: "truman-sc-father",
    evidenceIds: ["truman-ev-ghost", "truman-ev-album", "truman-ev-europe"],
    expectedEvidenceReferences: 3,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-06", "truman-ch-09"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Father reappearance/aftermath and later album material do not belong to one measured master segment.",
  },
  {
    currentSceneId: "truman-sc-elevator",
    evidenceIds: ["truman-ev-elevator"],
    expectedEvidenceReferences: 1,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-08"],
    shape: "SINGLE_MASTER_SEGMENT_CANDIDATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Elevator evidence localizes to one master segment but still needs picture-level scene verification.",
  },
  {
    currentSceneId: "truman-sc-travel",
    evidenceIds: ["truman-ev-poster", "truman-ev-mococoa", "truman-ev-beer"],
    expectedEvidenceReferences: 3,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-05", "truman-ch-10", "truman-ch-14"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Travel research bucket spans beer placement, travel-agency material and the much later Mococoa confrontation.",
  },
  {
    currentSceneId: "truman-sc-bridge",
    evidenceIds: ["truman-ev-bridge", "truman-ev-plant"],
    expectedEvidenceReferences: 2,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-12", "truman-ch-13"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Bridge crossing and later roadblock/police-name slip span adjacent but distinct master segments.",
  },
  {
    currentSceneId: "truman-sc-meryl",
    evidenceIds: ["truman-ev-knife", "truman-ev-fingers"],
    expectedEvidenceReferences: 2,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-09", "truman-ch-14"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Wedding-photo evidence and kitchen confrontation are widely separated in the measured master.",
  },
  {
    currentSceneId: "truman-sc-reunion",
    evidenceIds: ["truman-ev-marlon", "truman-ev-reunion", "truman-ev-trutalk", "truman-ev-sleep", "truman-ev-conception"],
    expectedEvidenceReferences: 5,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-15", "truman-ch-16", "truman-ch-17"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "The old reunion bucket spans reunion, TruTalk/control-room material and later monitoring imagery.",
  },
  {
    currentSceneId: "truman-sc-escape",
    evidenceIds: ["truman-ev-escape", "truman-ev-cuesun"],
    expectedEvidenceReferences: 2,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-18"],
    shape: "SINGLE_MASTER_SEGMENT_CANDIDATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Escape/disappearance and Cue the Sun localize to one broad embedded segment, not automatically one editorial scene.",
  },
  {
    currentSceneId: "truman-sc-storm",
    evidenceIds: ["truman-ev-boat", "truman-ev-storm", "truman-ev-born-live"],
    expectedEvidenceReferences: 3,
    expectedDirectModuleSceneReferences: 0,
    masterSegmentIds: ["truman-ch-19", "truman-ch-20"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW"],
    note: "Setting sail and the storm/control-room sequence occupy distinct master segments.",
  },
  {
    currentSceneId: "truman-sc-door",
    evidenceIds: ["truman-ev-wall", "truman-ev-dialog", "truman-ev-nocamera", "truman-ev-exit", "truman-ev-guards"],
    expectedEvidenceReferences: 5,
    expectedDirectModuleSceneReferences: 1,
    masterSegmentIds: ["truman-ch-21", "truman-ch-22", "truman-ch-23"],
    shape: "MULTI_SEGMENT_AGGREGATE",
    blockers: ["EVIDENCE_REWIRE", "EDITORIAL_SCENE_REVIEW", "DIRECT_SCENE_CONSUMER_REWIRE"],
    directSceneConsumers: [
      {
        consumerId: "truman-mod-autopsy",
        note: "Scene Autopsy currently points directly to truman-sc-door; its sceneId must migrate atomically with its evidence anchors.",
      },
    ],
    note: "Final boundary/autopsy bucket spans wall collision, creator dialogue and final exit across three embedded master segments.",
  },
];

export const trumanSceneMigrationSummary = {
  researchScenes: trumanSceneMigrationReadiness.length,
  evidenceSceneReferences: trumanSceneMigrationReadiness.reduce(
    (total, item) => total + item.expectedEvidenceReferences,
    0,
  ),
  directModuleSceneReferences: trumanSceneMigrationReadiness.reduce(
    (total, item) => total + item.expectedDirectModuleSceneReferences,
    0,
  ),
  singleSegmentCandidates: trumanSceneMigrationReadiness.filter(
    (item) => item.shape === "SINGLE_MASTER_SEGMENT_CANDIDATE",
  ).length,
  multiSegmentAggregates: trumanSceneMigrationReadiness.filter(
    (item) => item.shape === "MULTI_SEGMENT_AGGREGATE",
  ).length,
} as const;
