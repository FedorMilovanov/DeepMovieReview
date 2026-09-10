import type { NarrativePermissionState, ShellFilm } from "@/lib/content";
import type { SpoilerLevel } from "@/lib/spoilers";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

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
  | "biblical-synthesis"
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
  beats: Array<{
    id: string;
    label: string;
    summary: string;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type CharactersModule = FilmModuleBase & {
  kind: "characters";
  characters: Array<{
    id: string;
    name: string;
    wants: string;
    fears: string;
    contradiction: string;
    interpretiveSpoilerLevel?: SpoilerLevel;
    believes?: string;
    selfDeception?: string;
    arcSummary?: string;
    roleInArgument?: string;
  }>;
};

export type RelationshipModule = FilmModuleBase & {
  kind: "relationship";
  label: string;
  summary: string;
  events: Array<{
    id: string;
    label: string;
    change: string;
    tone: "trust" | "fracture" | "pressure" | "repair";
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
    spoilerLevel: SpoilerLevel;
  }>;
  pressureAssessments?: Array<{
    id: string;
    kind: "EMPATHY" | "IMITATION";
    level?: "LOW" | "MEDIUM" | "HIGH";
    rationale: string;
    craftObservationIds: string[];
    confidence: Confidence;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type AutopsyModule = FilmModuleBase & {
  kind: "autopsy";
  sceneLabel: string;
  act: string;
  motive: string;
  knowledge: string;
  pressure: string;
  consequence: string;
  claim: string;
  counterevidence?: string;
};

export type DecisionModule = FilmModuleBase & {
  kind: "decision";
  prompt: string;
  decidingCharacters?: string[];
  options: Array<{
    id: string;
    label: string;
    description?: string;
    availableAtDecisionTime: boolean;
  }>;
  facts: Array<{
    id: string;
    text: string;
    knowledgeState: DecisionKnowledgeState;
    spoilerLevel: SpoilerLevel;
  }>;
  pressures: Array<{
    id: string;
    kind: DecisionPressureKind;
    summary: string;
    spoilerLevel: SpoilerLevel;
  }>;
  dutiesOrGoods: Array<{
    id: string;
    label: string;
    summary?: string;
    spoilerLevel: SpoilerLevel;
  }>;
  editorialJudgment?: {
    claim: string;
    qualification?: string;
    confidence: Confidence;
    spoilerLevel: SpoilerLevel;
  };
};

export type BiblicalSynthesisModule = FilmModuleBase & {
  kind: "biblical-synthesis";
  observation: string;
  principle: string;
  scriptureRefs: string[];
  application: string;
  qualification: string;
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
  | BiblicalSynthesisModule
  | SourcesMethodModule;

export type FilmPackage = {
  schemaVersion: 1;
  film: ShellFilm;
  modules: FilmModule[];
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled film module: ${JSON.stringify(value)}`);
}
