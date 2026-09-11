import type { NarrativePermissionState, ShellFilm } from "@/lib/content";
import type { SpoilerLevel } from "@/lib/spoilers";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

/**
 * Canonical evidence is stored once at package level. Interpretive claims point to
 * these records instead of copying observations into each module independently.
 */
export type EvidenceRecord = {
  id: string;
  label: string;
  observation: string;
  sceneId?: string;
  /** Legacy/fixture display locator. Real-film evidence uses timestampSeconds for validation. */
  timestamp?: string;
  /** Seconds from the locked edition's declared timestamp origin. */
  timestampSeconds?: number;
  sourceIds?: string[];
  spoilerLevel: SpoilerLevel;
};

export type FilmSceneVerificationState = "DRAFT" | "VERIFIED";

export type FilmSceneRecord = {
  id: string;
  sequenceIndex: number;
  /** Seconds from the locked edition's declared timestamp origin. */
  startTimestampSeconds: number;
  /** Required once the scene is VERIFIED. */
  endTimestampSeconds?: number;
  shortLabel: string;
  spoilerLevel: SpoilerLevel;
  summary?: string;
  verificationState: FilmSceneVerificationState;
};

export type ClaimSupport = {
  evidenceIds: string[];
  counterevidenceIds?: string[];
};

export type RelationshipDimension =
  | "TRUST"
  | "TRUTHFULNESS"
  | "POWER"
  | "BOUNDARIES"
  | "RESPONSIBILITY"
  | "REPAIR";

export type RelationshipDimensionShift = {
  dimension: RelationshipDimension;
  before: string;
  after: string;
};

export type SocialFormationDomain =
  | "PARENTAL_PRESENCE"
  | "PARENTAL_EXAMPLE"
  | "AUTHORITY"
  | "DISCIPLINE_BOUNDARIES"
  | "PEER_PRESSURE"
  | "REBELLION_AUTONOMY"
  | "RESPONSIBILITY"
  | "SEXUAL_FORMATION"
  | "SUBSTANCE_RISK"
  | "WORK_STUDY"
  | "MATURITY"
  | "ADULT_ROLE_MODELS"
  | "OTHER";

export type TeachingSignalType =
  | "EXPLICIT_LESSON"
  | "REPEATED_PATTERN"
  | "ROLE_MODEL"
  | "ANTI_MODEL"
  | "REWARD"
  | "COST_OR_PUNISHMENT"
  | "COMIC_NORMALIZATION"
  | "ROMANTICIZATION"
  | "RIDICULE"
  | "UNCHALLENGED_ASSUMPTION"
  | "ENDING_RESOLUTION"
  | "GENRE_CONVENTION"
  | "FORMAL_GLAMOUR"
  | "OTHER";

export type CraftMechanism =
  | "CAMERA_DISTANCE"
  | "POINT_OF_VIEW"
  | "CAMERA_MOVEMENT"
  | "LIGHTING"
  | "COLOR"
  | "MUSIC"
  | "SOUND"
  | "EDITING_RHYTHM"
  | "REACTION_SHOT"
  | "PERFORMANCE"
  | "COMIC_TIMING"
  | "SLOW_MOTION"
  | "PRODUCTION_DESIGN"
  | "COSTUME"
  | "OTHER";

export type DecisionKnowledgeState =
  | "KNOWN_TO_CHARACTER"
  | "REASONABLY_INFERABLE"
  | "UNKNOWN_AT_TIME"
  | "REVEALED_LATER";

export type DecisionPressureKind =
  | "TIME"
  | "THREAT"
  | "COERCION"
  | "SOCIAL"
  | "EMOTIONAL"
  | "INFORMATIONAL"
  | "OTHER";

export type MoralValence = "WRONGDOING" | "VIRTUE" | "MIXED" | "PRUDENTIAL";
export type MoralSeverity = "LOW" | "MODERATE" | "SERIOUS" | "GRAVE";
export type MoralCulpability = "LOW" | "PARTIAL" | "SUBSTANTIAL" | "HIGH" | "UNCERTAIN";
export type RepentanceState =
  | "NONE"
  | "RECOGNITION"
  | "REMORSE"
  | "CONFESSION"
  | "RESTITUTION"
  | "REPAIR"
  | "HARDENING"
  | "AMBIGUOUS";
export type MoralNarrativeStance = "CONDEMNS" | "QUESTIONS" | "AMBIVALENT" | "NORMALIZES" | "CELEBRATES";

export type FinalSynthesisFacetKey =
  | "CRAFT"
  | "MORAL_CLARITY"
  | "DEPICTED_EVIL"
  | "ROMANTICIZATION"
  | "DECISION_COMPLEXITY"
  | "REDEMPTIVE_DIRECTION";

export type FilmModuleKind =
  | "story"
  | "characters"
  | "relationship"
  | "family-youth"
  | "meaning"
  | "teaching-signals"
  | "permission"
  | "craft"
  | "autopsy"
  | "decision"
  | "moral-analysis"
  | "biblical-synthesis"
  | "final-synthesis"
  | "sources-method";

export type FilmModuleBase = {
  id: string;
  kind: FilmModuleKind;
  heading: string;
  eyebrow?: string;
  spoilerLevel: SpoilerLevel;
};

export type StoryModule = FilmModuleBase & {
  kind: "story";
  summary: string;
  beats: Array<{ id: string; label: string; summary: string; spoilerLevel: SpoilerLevel }>;
};

export type CharactersModule = FilmModuleBase & {
  kind: "characters";
  characters: Array<{
    id: string;
    name: string;
    wants: string;
    fears: string;
    contradiction: string;
    /** Hide the whole profile when wants/fears/contradiction would themselves reveal protected story information. */
    profileSpoilerLevel?: SpoilerLevel;
    /** Additional boundary for deeper beliefs/arc interpretation after the basic profile is visible. */
    interpretiveSpoilerLevel?: SpoilerLevel;
    believes?: string;
    selfDeception?: string;
    arcSummary?: string;
    roleInArgument?: string;
    support?: ClaimSupport;
  }>;
};

export type RelationshipModule = FilmModuleBase & {
  kind: "relationship";
  label: string;
  summary: string;
  /** Stable character IDs; required by the publish validator. */
  participantCharacterIds?: [string, string];
  events: Array<{
    id: string;
    label: string;
    change: string;
    tone: "trust" | "fracture" | "pressure" | "repair";
    dimensions?: RelationshipDimensionShift[];
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type FamilyYouthModule = FilmModuleBase & {
  kind: "family-youth";
  summary?: string;
  observations: Array<{
    id: string;
    domain: SocialFormationDomain;
    subject: string;
    claim: string;
    counterevidence?: string;
    confidence: Confidence;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type MeaningModule = FilmModuleBase & {
  kind: "meaning";
  theme: string;
  question: string;
  apparentClaim: string;
  counterevidence: string;
  confidence: Confidence;
  support?: ClaimSupport;
};

export type TeachingSignalsModule = FilmModuleBase & {
  kind: "teaching-signals";
  signals: Array<{
    id: string;
    type: TeachingSignalType;
    subject: string;
    interpretation: string;
    counterevidence?: string;
    confidence: Confidence;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type PermissionModule = FilmModuleBase & {
  kind: "permission";
  assessments: Array<{
    id: string;
    subject: string;
    state: NarrativePermissionState;
    rationale: string;
    confidence?: Confidence;
    counterevidence?: string;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type CraftModule = FilmModuleBase & {
  kind: "craft";
  observations: Array<{
    id: string;
    mechanism: CraftMechanism;
    observation: string;
    interpretiveEffect: string;
    confidence: Confidence;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
  pressureAssessments?: Array<{
    id: string;
    kind: "EMPATHY" | "IMITATION";
    level?: "LOW" | "MEDIUM" | "HIGH";
    rationale: string;
    craftObservationIds: string[];
    confidence: Confidence;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type AutopsyModule = FilmModuleBase & {
  kind: "autopsy";
  /** Stable scene registry ID; required for published real-film autopsies. */
  sceneId?: string;
  sceneLabel: string;
  act: string;
  motive: string;
  knowledge: string;
  pressure: string;
  consequence: string;
  claim: string;
  counterevidence?: string;
  confidence?: Confidence;
  support?: ClaimSupport;
  anchors?: Array<{
    id: string;
    label: string;
    evidenceId: string;
    point?: { x: number; y: number };
  }>;
};

export type DecisionModule = FilmModuleBase & {
  kind: "decision";
  prompt: string;
  /** Stable IDs from the characters module, not display names. */
  decidingCharacters?: string[];
  options: Array<{
    id: string;
    label: string;
    description?: string;
    availableAtDecisionTime: boolean;
    spoilerLevel?: SpoilerLevel;
  }>;
  facts: Array<{ id: string; text: string; knowledgeState: DecisionKnowledgeState; spoilerLevel: SpoilerLevel }>;
  pressures: Array<{ id: string; kind: DecisionPressureKind; summary: string; spoilerLevel: SpoilerLevel }>;
  dutiesOrGoods: Array<{ id: string; label: string; summary?: string; spoilerLevel: SpoilerLevel }>;
  editorialJudgment?: {
    claim: string;
    qualification?: string;
    confidence: Confidence;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  };
};

export type MoralAnalysisModule = FilmModuleBase & {
  kind: "moral-analysis";
  summary?: string;
  events: Array<{
    id: string;
    /** Stable character IDs for the moral agent(s), when the event has an attributable actor. */
    actorCharacterIds?: string[];
    category: string;
    valence: MoralValence;
    act: string;
    target?: string;
    motive?: string;
    intention?: string;
    knowledge?: string;
    freedom?: string;
    pressure?: string;
    foreseeability?: string;
    consequence?: string;
    responsibility?: string;
    severity?: MoralSeverity;
    culpability?: MoralCulpability;
    repentance?: RepentanceState;
    narrativeStance: MoralNarrativeStance;
    confidence: Confidence;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type BiblicalSynthesisModule = FilmModuleBase & {
  kind: "biblical-synthesis";
  observation: string;
  principle: string;
  scriptureRefs: string[];
  application: string;
  qualification: string;
  support?: ClaimSupport;
};

export type FinalSynthesisModule = FilmModuleBase & {
  kind: "final-synthesis";
  thesis: string;
  facets: Array<{ key: FinalSynthesisFacetKey; label: string; value: string }>;
  verdict: string;
  qualifications: string[];
  confidence: Confidence;
  support?: ClaimSupport;
};

export type SourcesMethodModule = FilmModuleBase & {
  kind: "sources-method";
  methodologyVersion: string;
  editorialRevision: string;
  analyzedEdition: string;
  lastReviewedAt?: string;
  sources: Array<{
    id: string;
    label: string;
    kind: "film-edition" | "scripture" | "reference" | "editorial-note";
    locator?: string;
    href?: string;
  }>;
};

export type FilmEditionLock =
  | {
      state: "TARGET_ONLY";
      sourceId: string;
      note: string;
    }
  | {
      state: "LOCKED";
      sourceId: string;
      editionIdentity: string;
      measuredRuntimeSeconds: number;
      timestampConvention: string;
      verifiedAt: string;
      frameRate?: string;
      audioTrack?: string;
      subtitleTrack?: string;
      masterDigest?: string;
    };

export type FilmIngestMetadata = {
  edition: FilmEditionLock;
};

export type FilmModule =
  | StoryModule
  | CharactersModule
  | RelationshipModule
  | FamilyYouthModule
  | MeaningModule
  | TeachingSignalsModule
  | PermissionModule
  | CraftModule
  | AutopsyModule
  | DecisionModule
  | MoralAnalysisModule
  | BiblicalSynthesisModule
  | FinalSynthesisModule
  | SourcesMethodModule;

export type FilmPackage = {
  schemaVersion: 1;
  film: ShellFilm;
  /**
   * Real-film ingest state. Fixtures intentionally omit this.
   * TARGET_ONLY blocks canonical evidence; LOCKED identifies the exact viewing master.
   */
  ingest?: FilmIngestMetadata;
  /** Canonical edition-bound scene registry. Real-film scenes require a LOCKED edition. */
  scenes?: FilmSceneRecord[];
  /** Stable evidence graph shared by every analytical module. */
  evidence?: EvidenceRecord[];
  modules: FilmModule[];
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled film module: ${JSON.stringify(value)}`);
}
