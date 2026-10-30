import type { NarrativePermissionState, ShellFilm } from "@/lib/content";
import type { SpoilerLevel } from "@/lib/spoilers";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

/**
 * Canonical evidence is stored once at package level. Interpretive claims point to
 * these records instead of copying observations into each module independently.
 */
/**
 * What a verification actually covered.
 *
 * `VERIFIED` on its own is a promise, not a description: it does not say whether
 * anyone looked at the picture, listened to the track, or what part of the film
 * was in front of them. The basis is derived from the verification ledger — it is
 * never typed next to a claim — so a reader can see the size of the check behind
 * an evidence record instead of taking the word for it.
 */
export type EvidenceReviewBasis = {
  /** The material that was actually examined. */
  material: "frames" | "subtitle-track";
  /**
   * Seconds of the master the examination covered: the first and the last
   * observation in the ledger. Absent when the ledger records no times.
   */
  window?: { from: number; to: number };
  /** How many separate observations the ledger lists. */
  observations: number;
  /**
   * What the check concluded. `pending` means the check exists for the compound
   * record, but nothing was recorded at this record's own second — the honest
   * state of a half that inherited its parent's review.
   */
  outcome: "seen" | "heard" | "refused" | "pending";
  /**
   * Fields the ledger does not record. Reported, not guessed: an empty list means
   * the basis is complete, and a non-empty one is shown to the reader as-is.
   */
  unrecorded?: ("reviewer" | "date")[];
  /**
   * Research record this one was split from. The check was performed once, on the
   * compound record, so a half may only claim the parent's window when its own
   * second actually falls inside it.
   */
  inheritedFrom?: string;
  /**
   * Research record this one replaces. It is set only when the ledger refused the
   * original formulation, so the card can say that a check said no — a map that
   * shows only successes is a brochure, not evidence.
   */
  refusedAncestor?: string;
};

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
  /** Derived from the verification ledger, when the edition has one. */
  basis?: EvidenceReviewBasis;
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
  /** Evidence for the module-level story synthesis. */
  summarySupport?: ClaimSupport;
  beats: Array<{
    id: string;
    label: string;
    summary: string;
    spoilerLevel: SpoilerLevel;
    /** Canonical evidence for this plot beat / turning-point description. */
    support?: ClaimSupport;
  }>;
};

/**
 * How the film presents a character (docs/03 §5): the question a whole-film
 * analysis must answer for every central figure. Aspirational is not the same
 * as "protagonist", and focal does not imply approval.
 */
export type CharacterPresentation = "ASPIRATIONAL" | "CAUTIONARY" | "MIXED" | "FOCAL";

/** How strongly the film's camera/script invites the viewer to inhabit a character (docs/03 §5). */
export type IdentificationStrength = "HIGH" | "PARTIAL" | "LOW";

export type ArcCredibility = "HIGH" | "MEDIUM" | "LOW";

export type CharactersModule = FilmModuleBase & {
  kind: "characters";
  characters: Array<{
    id: string;
    name: string;
    /**
     * Presentation mode. Required once the edition is LOCKED: the analytical
     * order in docs/03 asks this question before any normative synthesis.
     */
    presentation?: CharacterPresentation;
    /** How strongly the film invites identification with this character. */
    identification?: IdentificationStrength;
    wants: string;
    fears: string;
    /** Which loyalties shape the character's decisions. */
    loyalties?: string;
    contradiction: string;
    /** Hide the whole profile when wants/fears/contradiction would themselves reveal protected story information. */
    profileSpoilerLevel?: SpoilerLevel;
    /** Additional boundary for deeper beliefs/arc interpretation after the basic profile is visible. */
    interpretiveSpoilerLevel?: SpoilerLevel;
    believes?: string;
    selfDeception?: string;
    arcSummary?: string;
    /** What survives the arc unchanged. */
    unchanged?: string;
    /** Whether the arc reads as psychologically credible, with the reason. */
    arcCredibility?: { level: ArcCredibility; note: string };
    roleInArgument?: string;
    /** Evidence for the spoiler-safe/base profile fields. */
    profileSupport?: ClaimSupport;
    /** Evidence for believes/self-deception/arc/argument interpretation. */
    interpretiveSupport?: ClaimSupport;
  }>;
};

export type RelationshipModule = FilmModuleBase & {
  kind: "relationship";
  label: string;
  summary: string;
  /** Evidence for the module-level relationship synthesis. */
  summarySupport?: ClaimSupport;
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
  /** Required for a real-film summary when summary prose is present. */
  summarySupport?: ClaimSupport;
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
    support?: ClaimSupport;
    spoilerLevel?: SpoilerLevel;
  }>;
  facts: Array<{
    id: string;
    text: string;
    knowledgeState: DecisionKnowledgeState;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
  pressures: Array<{
    id: string;
    kind: DecisionPressureKind;
    summary: string;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
  dutiesOrGoods: Array<{
    id: string;
    label: string;
    summary?: string;
    support?: ClaimSupport;
    spoilerLevel: SpoilerLevel;
  }>;
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
  /** Required for a real-film module-level moral synthesis when summary prose is present. */
  summarySupport?: ClaimSupport;
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

export type ResearchSourceRole =
  | "primary-material"
  | "institutional-academic"
  | "professional-reference"
  | "database-transcript"
  | "tertiary-community";

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
    /** Editorial role of a secondary research reference; not a numeric quality score. */
    researchRole?: ResearchSourceRole;
    locator?: string;
    href?: string;
  }>;
};

/* ------------------------------------------------------------------------- *
 * Editorial article
 *
 * The article is the readable layer of a locked edition, not a marketing page.
 * It is stored as structured data so that three things are structurally
 * impossible: quoting a timestamp no evidence record supports, quoting a
 * measurement the master never produced, and publishing prose that outranks the
 * edition it describes.
 * ------------------------------------------------------------------------- */

/** Measurement tables committed for Film 001 by the measurement script. */
export type ArticleMeasurementTable = "totals" | "window" | "hold" | "silence";

/** A pointer into the committed measurement dataset. Never a literal number. */
export type ArticleMeasurementRef = {
  table: ArticleMeasurementTable;
  id: string;
};

/** A small editorial quotation from the measured master, never generated artwork. */
export type ArticleSceneStill = {
  src: string;
  avifSrc: string;
  avifSha256: string;
  width: number;
  height: number;
  alt: string;
  /** Nominal output-grid time; not the selected source frame PTS. */
  sampleTimeSeconds: number;
  samplingIntervalSeconds: 30;
  sourceId: string;
  masterDigest: string;
  imageSha256: string;
  credit: string;
  use: "critical-review";
};

export type ArticleTimelineItem = {
  id: string;
  /** Must equal the cited evidence record's timestampSeconds. */
  timestampSeconds: number;
  label: string;
  evidenceId: string;
  still?: ArticleSceneStill;
};

export type ArticleCorrectionRow = {
  id: string;
  /** The claim that circulates in secondary texts. */
  commonClaim: string;
  /** What the locked master actually shows or says. */
  onScreen: string;
  /** Canonical evidence for an observable correction. */
  evidenceId?: string;
  /** …or a measured pointer, for corrections the master proves by counting. */
  measurement?: ArticleMeasurementRef;
  /**
   * True only for a correction whose point is that the beat does not exist.
   * Such a row must not cite evidence for something it claims is absent.
   */
  absentFromMaster?: boolean;
};

export type ArticleDuelSide = {
  id: string;
  /** Whose reading this is, e.g. «Что слышит Труман». */
  label: string;
  reading: string;
  /** Every side needs its own proof; there is no unsupported side. */
  evidenceIds: string[];
};

export type ArticleTableRow = {
  id: string;
  /** Left column: what the article asserts about this row. */
  label: string;
  /** Right column: measured values, filled from the measurement dataset. */
  measurement: ArticleMeasurementRef;
};

export type ArticleBlock =
  | {
      kind: "paragraph";
      id: string;
      text: string;
      support?: ClaimSupport;
      /**
       * Scripture references that appear verbatim in `text`. Declared so the
       * validator can tell «Деяния 17:26» from a film timecode: prose may not
       * carry a clock reading unless it is a declared Scripture reference.
       */
      scriptureRefs?: string[];
    }
  | {
      /**
       * A note that stands outside the argument: edification, not analysis.
       *
       * It is a separate kind rather than a paragraph with a soft opening
       * sentence because the distinction has to be structural. An aside names no
       * evidence — it may not cite a moment of the master, and the validator
       * rejects it if it tries — so it can never be mistaken for a reading of the
       * film. What it says is the site's own conviction, labelled as such.
       */
      kind: "aside";
      id: string;
      /** Where the note stands, e.g. «К слову». */
      label: string;
      text: string;
      /** Scripture references that appear verbatim in `text`. */
      scriptureRefs?: string[];
    }
  | {
      /**
       * An original illustration placed inside the argument.
       *
       * It may only reference a declared visual asset, and that asset must be a
       * generated illustration — the validator rejects a still, because the site
       * does not publish frames of a film. The caption is mandatory and must say
       * so in words: a picture that looks like a still has to be labelled as not
       * being one.
       */
      kind: "illustration";
      id: string;
      /** Id of a manifest in `src/data/film-illustrations.ts`. */
      assetId: string;
      caption: string;
      /**
       * How much of the column the picture takes. `wide` is the default and
       * belongs to the two large drawings; `inset` is a small vignette set to
       * the right of the text, for the caricatures that make one point and then
       * get out of the way.
       */
      layout?: "wide" | "inset";
    }
  | {
      kind: "subhead";
      id: string;
      text: string;
    }
  | {
      kind: "pullquote";
      id: string;
      text: string;
      attribution?: string;
      support?: ClaimSupport;
    }
  | {
      /** Canonical moments: every timestamp here is a verified evidence anchor. */
      kind: "timeline";
      id: string;
      items: ArticleTimelineItem[];
    }
  | {
      /** A single measured headline number, rendered from the dataset. */
      kind: "measurement";
      id: string;
      measurement: ArticleMeasurementRef;
      text: string;
      support?: ClaimSupport;
    }
  | {
      /** Several measured rows side by side. */
      kind: "measurement-table";
      id: string;
      caption: string;
      columns: [string, string, string];
      rows: ArticleTableRow[];
    }
  | {
      kind: "corrections";
      id: string;
      caption: string;
      rows: ArticleCorrectionRow[];
    }
  | {
      /**
       * Two or three readings of the same moment, side by side.
       *
       * This is the article's comparison surface, and it is built to make a
       * fight impossible: every side must cite evidence, no side is scored, and
       * the block cannot exist without an explicit statement of what the film
       * leaves open. A «who wins» panel is exactly the kind of confident effect
       * that outruns the master, so the type refuses to express one.
       */
      kind: "duel";
      id: string;
      /** Small label above the question, e.g. «Дуэль 01 · адресат». */
      label: string;
      /** The single question both sides answer differently. */
      question: string;
      sides: ArticleDuelSide[];
      /** What the evidence cannot settle. Required: the panel never declares a winner. */
      open: string;
    };

export type ArticleSection = {
  id: string;
  /** One-based reading order; sections are gated by spoiler level as a suffix. */
  number: number;
  eyebrow: string;
  heading: string;
  standfirst?: string;
  spoilerLevel: SpoilerLevel;
  /**
   * Analytical modules this section reads alongside. The article is the readable
   * layer over the package, not a separate silo: every link may only point at a
   * module the reader can open at this section's spoiler level.
   *
   * A list, because one section regularly spans several modules: marriage and
   * friendship are two separate analyses, and the section that compares them is
   * neither. Naming only one of them would leave the readable layer pointing at
   * half of its own argument.
   */
  moduleIds?: string[];
  /** Module-level claim, e.g. the section's thesis. */
  support?: ClaimSupport;
  blocks: ArticleBlock[];
};

export type FilmArticle = {
  id: string;
  /** Small label above the title. */
  kicker: string;
  title: string;
  standfirst: string;
  /**
   * Headline for the tab and the search result, when the editorial title is
   * longer than a tab can show. The layout appends the site name, so this is
   * budgeted at 49 characters.
   */
  seoTitle?: string;
  /** Snippet for search and social, budgeted at ~160 characters. */
  seoDescription?: string;
  byline: {
    author: string;
    /** Must match the sources-method module's editorialRevision. */
    editorialRevision: string;
    /** ISO calendar date the text was drafted. */
    draftedAt: string;
    /** ISO calendar date the editorial signature was issued. Absent while unsigned. */
    reviewedAt?: string;
    /**
     * On whose authority the signature was issued.
     *
     * `HUMAN` — the editor read the text and signed it personally.
     * `DELEGATED` — the editor explicitly authorised the signature in advance,
     * recorded in `docs/53` §1. The distinction exists so a delegated date can
     * never pass for a personal read: the field is required as soon as
     * `reviewedAt` is set.
     */
    signatureBasis?: "HUMAN" | "DELEGATED";
  };
  /** The article is edition-bound: it may only quote the master it names here. */
  edition: {
    sourceId: string;
    measuredRuntimeSeconds: number;
  };
  sections: ArticleSection[];
  closing?: {
    heading: string;
    text: string;
    support?: ClaimSupport;
  };
};

export type FilmEditionLock =
  | {
      state: "TARGET_ONLY";
      sourceId: string;
      note: string;
    }
  | {
      /**
       * Exact viewing master has been identified and measured, but canonical
       * scene/evidence promotion is still fail-closed until re-verification.
       */
      state: "MASTER_IDENTIFIED";
      sourceId: string;
      editionIdentity: string;
      measuredRuntimeSeconds: number;
      timestampConvention: string;
      identifiedAt: string;
      note: string;
      frameRate?: string;
      audioTrack?: string;
      subtitleTrack?: string;
      masterDigest?: string;
    }
  | {
      /**
       * Exact viewing master is the canonical evidence authority.
       * LOCKED is the only state that permits canonical scene/evidence chains.
       */
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

export type FilmMasterSegment = {
  id: string;
  /** One-based structural order inside the exact viewing master. */
  sequenceIndex: number;
  /** Optional display label supplied by the container/disc metadata. */
  label?: string;
  startTimestampSeconds: number;
  endTimestampSeconds: number;
};

export type FilmMasterSegmentation = {
  /** Objective structural metadata from the exact viewing master, not editorial scene grammar. */
  basis: "EMBEDDED_CHAPTERS";
  /** This basis is accepted only when the segments cover the measured master continuously. */
  coverage: "COMPLETE";
  segments: FilmMasterSegment[];
};

export type FilmIngestMetadata = {
  edition: FilmEditionLock;
  /**
   * Optional edition-bound structural segmentation. It is provenance/navigation
   * metadata and must never be treated as a substitute for FilmPackage.scenes.
   */
  masterSegmentation?: FilmMasterSegmentation;
};

/**
 * Research-draft tier for real films.
 *
 * The LOCKED+VERIFIED pipeline stays the only road to publication. This tier
 * exists throughout the pre-lock editorial stages: TARGET_ONLY before an exact
 * master is measured, and MASTER_IDENTIFIED after exact master identity/runtime
 * are known but canonical re-verification is still incomplete. Research scenes
 * stay DRAFT and evidence cites secondary references — never a film-edition —
 * until each retained observation is re-verified and the package transitions
 * atomically to LOCKED. Publishing from this tier is structurally impossible.
 */
export type FilmResearchState = {
  state: "SECONDARY_SOURCES";
  /** Documents the provisional provenance for readers and future editors. */
  note: string;
  /** ISO calendar date the research assembly was declared. */
  assembledAt: string;
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
   * TARGET_ONLY selects a target, MASTER_IDENTIFIED records the exact measured
   * viewing copy while canonical promotion stays fail-closed, and only LOCKED
   * permits canonical scene/evidence chains.
   */
  ingest?: FilmIngestMetadata;
  /**
   * Research tier declaration for real films whose analysis is assembled from
   * secondary sources before a viewing master is locked. Cannot coexist with
   * a LOCKED edition or a published status.
   */
  research?: FilmResearchState;
  /**
   * Editorial article bound to the locked edition. Optional: a locked package
   * may be analysed without a readable layer, but an article may never exist
   * without a LOCKED edition (see `validateFilmArticle`).
   */
  article?: FilmArticle;
  /** Canonical edition-bound scene registry. Real-film scenes require a LOCKED edition. */
  scenes?: FilmSceneRecord[];
  /** Stable evidence graph shared by every analytical module. */
  evidence?: EvidenceRecord[];
  modules: FilmModule[];
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled film module: ${JSON.stringify(value)}`);
}
