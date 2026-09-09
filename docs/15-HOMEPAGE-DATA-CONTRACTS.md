# DeepMovieReview — Homepage Data Contracts

> Status: v0.1 implementation contract  
> Date: 2026-09-09  
> Scope: semantic data required by `14-HOMEPAGE-LAUNCH-CUT-V1.md`.  
> Important: this document defines boundaries and payload shapes, not a final database ORM schema.

---

## 1. Principle

The homepage must not become a hand-authored parallel copy of the film review.

It should compose **preview projections** from canonical structured analysis.

Preferred flow:

```text
canonical film/editorial entities
        ↓
server-side homepage projection
        ↓
semantic DOM content
        ↓
optional GPU/media enhancement
```

The homepage may choose shorter wording and featured subsets, but those selections should point back to canonical entities where possible.

---

## 2. Homepage projection root

Conceptual TypeScript shape:

```ts
type HomepageLaunchProjection = {
  schemaVersion: string
  locale: string
  generatedAt: string

  featuredAnalysis: FeaturedAnalysisPreview
  arrival: ArrivalProjection
  lenses: SixLensProjection
  story: StoryPreviewProjection
  peopleRelationships: PeopleRelationshipsProjection
  familyYouth: FamilyYouthProjection | null
  meaning: MeaningProjection
  narrativePermission: NarrativePermissionProjection
  craftSympathy: CraftSympathyProjection
  sceneAutopsy: SceneAutopsyProjection
  decision: DecisionProjection | null
  biblicalSynthesis: BiblicalSynthesisProjection
  discovery: DiscoveryProjection

  methodology: MethodologyReference
}
```

The server projection should be small enough that the page can render meaningful DOM before deep media assets resolve.

---

## 3. Featured analysis preview

```ts
type FeaturedAnalysisPreview = {
  film: {
    id: string
    slug: string
    title: string
    originalTitle?: string
    year: number
    runtimeMinutes?: number
    directorNames: string[]
    genres: string[]
  }

  review: {
    id: string
    version: number
    publicationState: "PUBLISHED"
    spoilerPolicy: SpoilerLevel
    shortThesis: string
    finalSynthesis?: string
  }

  canonicalEditionId?: string
  heroAssetId: string
}
```

No homepage component should infer title/year/director from media filename or alt text.

---

## 4. Arrival projection

```ts
type ArrivalProjection = {
  eyebrow?: string
  headline: string
  subline: string
  featuredQuestion?: string
  heroAsset: HomepageAssetRef
}
```

`headline` and `subline` are homepage editorial copy and may be homepage-specific.

The `featuredQuestion` should ideally reference a canonical narrative question.

---

## 5. Six-lens projection

```ts
type LensKind =
  | "STORY"
  | "PEOPLE"
  | "RELATIONSHIPS"
  | "IDEAS"
  | "MORAL_WORLD"
  | "CRAFT"

type LensPreview = {
  kind: LensKind
  title: string
  summary: string
  claimId?: string
  sourceEntityRefs: EntityRef[]
  annotations: LensAnnotation[]
}

type SixLensProjection = {
  defaultLens: LensKind
  lenses: LensPreview[] // exactly six in launch grammar
}
```

Annotation:

```ts
type LensAnnotation = {
  id: string
  label: string
  shortText: string
  anchor?: MediaAnchor
  evidenceRefs?: EntityRef[]
  spoilerLevel: SpoilerLevel
}
```

Do not store the six-lens labels as arbitrary CMS blocks with no semantic kind.

---

## 6. Story projection

Canonical story model should support more depth than the homepage shows.

```ts
type StoryBeatKind =
  | "ORDINARY_STATE"
  | "INCITING_DISRUPTION"
  | "GOAL_FORMATION"
  | "MAJOR_TURN"
  | "CRISIS"
  | "CLIMAX"
  | "RESOLUTION"
  | "OTHER"

type StoryBeat = {
  id: string
  kind: StoryBeatKind
  sequenceIndex: number
  shortLabel: string
  summary: string
  sceneRef?: EntityRef
  spoilerLevel: SpoilerLevel
}

type StoryPreviewProjection = {
  spoilerSafeSynopsis: string
  premise: string
  centralConflict: string
  protagonistGoal?: string
  obstacle?: string
  beats: StoryBeat[]
}
```

Homepage query must filter out beats above current spoiler state.

---

## 7. Character projection

```ts
type CharacterPreview = {
  id: string
  name: string
  performerName?: string
  portraitAsset?: HomepageAssetRef
  wants?: string
  fears?: string
  believes?: string
  contradiction?: string
  arcSummary?: string
  roleInArgument?: string
  audienceInvitation?: AudienceInvitation[]
}

type AudienceInvitation =
  | "ADMIRE"
  | "IDENTIFY"
  | "PITY"
  | "FEAR"
  | "REJECT"
  | "LAUGH_WITH"
  | "LAUGH_AT"
  | "AMBIVALENT"
```

These states describe evidence-based narrative/formal invitation. They are not personality diagnoses.

---

## 8. Relationship model

Relationships are first-class entities.

```ts
type RelationshipType =
  | "MARRIAGE"
  | "ROMANCE"
  | "PARENT_CHILD"
  | "SIBLING"
  | "FRIENDSHIP"
  | "MENTOR_STUDENT"
  | "PEER_GROUP"
  | "AUTHORITY_SUBORDINATE"
  | "EXPLOITER_VICTIM"
  | "RIVALRY"
  | "OTHER"

type Relationship = {
  id: string
  filmId: string
  type: RelationshipType
  participantCharacterIds: string[]
  title?: string
  summary?: string
}
```

Relationship dimensions:

```ts
type RelationshipDimension =
  | "TRUST"
  | "TRUTHFULNESS"
  | "RECIPROCITY"
  | "RESPONSIBILITY"
  | "POWER"
  | "BOUNDARIES"
  | "LOYALTY"
  | "SACRIFICE"
  | "CONTROL"
  | "DEPENDENCE"
  | "FORGIVENESS"
  | "REPAIR"
```

Relationship event:

```ts
type RelationshipEvent = {
  id: string
  relationshipId: string
  sequenceIndex: number
  sceneId?: string
  spoilerLevel: SpoilerLevel

  eventKind:
    | "BUILD"
    | "STRAIN"
    | "WITHHOLDING"
    | "BETRAYAL"
    | "CONTROL"
    | "SACRIFICE"
    | "CONFRONTATION"
    | "FORGIVENESS"
    | "REPAIR"
    | "BREAK"
    | "OTHER"

  summary: string
  dimensionChanges?: {
    dimension: RelationshipDimension
    direction: "UP" | "DOWN" | "MIXED" | "UNKNOWN"
  }[]

  evidenceRefs: EntityRef[]
}
```

Do not force fake numeric `trust = 63` values unless later calibration proves them useful.

Homepage projection:

```ts
type PeopleRelationshipsProjection = {
  characters: CharacterPreview[]
  featuredRelationship: {
    relationship: Relationship
    events: RelationshipEvent[]
  }
}
```

---

## 9. Family / youth / social formation model

This domain should support observations without forcing every film into a family-review template.

```ts
type SocialFormationDomain =
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
  | "OTHER"

type SocialFormationObservation = {
  id: string
  domain: SocialFormationDomain
  subjectCharacterIds: string[]
  claim: string
  evidenceRefs: EntityRef[]
  counterevidenceRefs?: EntityRef[]
  confidence: Confidence
  spoilerLevel: SpoilerLevel
}

type FamilyYouthProjection = {
  heading: string
  summary?: string
  observations: SocialFormationObservation[]
  asset?: HomepageAssetRef
}
```

Important: absence of a `FamilyYouthProjection` is valid for films where this is not meaningful.

---

## 10. Theme / question / narrative claim model

Keep these separate.

```ts
type Theme = {
  id: string
  slug: string
  title: string
  description?: string
}

type NarrativeQuestion = {
  id: string
  filmId: string
  question: string
  themeIds: string[]
  spoilerLevel: SpoilerLevel
}

type NarrativeClaim = {
  id: string
  filmId: string
  questionId?: string
  claim: string
  claimType:
    | "APPARENT_NARRATIVE_CLAIM"
    | "WORLDVIEW_CLAIM"
    | "ENDING_CLAIM"
    | "CHARACTER_CLAIM"
    | "RELATIONSHIP_CLAIM"
  confidence: Confidence
  evidenceRefs: EntityRef[]
  counterevidenceRefs: EntityRef[]
  spoilerLevel: SpoilerLevel
}
```

Homepage:

```ts
type MeaningProjection = {
  theme: Theme
  question: NarrativeQuestion
  apparentClaim: NarrativeClaim
  alternateOrCounterReading?: NarrativeClaim
}
```

---

## 11. Teaching signal model

Teaching is not reducible to explicit dialogue.

```ts
type TeachingSignalType =
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
  | "OTHER"

type TeachingSignal = {
  id: string
  filmId: string
  type: TeachingSignalType
  subject: string
  interpretation: string
  evidenceRefs: EntityRef[]
  counterevidenceRefs?: EntityRef[]
  confidence: Confidence
  spoilerLevel: SpoilerLevel
}
```

---

## 12. Narrative Permission model

This is a key domain and must be explicit.

```ts
type NarrativePermissionState =
  | "CONDEMNED"
  | "COSTLY"
  | "QUESTIONED"
  | "UNCHALLENGED"
  | "NORMALIZED"
  | "REWARDED"
  | "CELEBRATED"
  | "AMBIGUOUS"

type NarrativePermissionAssessment = {
  id: string
  filmId: string

  subjectKind:
    | "MORAL_CATEGORY"
    | "BEHAVIOR"
    | "RELATIONSHIP_PATTERN"
    | "SOCIAL_MODEL"
    | "CHARACTER_TRAIT"
    | "WORLDVIEW_IDEA"

  subjectRef?: EntityRef
  subjectLabel: string
  state: NarrativePermissionState

  rationale: string
  teachingSignalIds: string[]
  evidenceRefs: EntityRef[]
  counterevidenceRefs: EntityRef[]

  characterScopeIds?: string[]
  contextQualifier?: string
  confidence: Confidence
  methodologyVersion: string
  spoilerLevel: SpoilerLevel
}
```

Rules:

- `UNCHALLENGED` must remain a separate state from `NORMALIZED`;
- `COSTLY` is not identical to `CONDEMNED`;
- one behavior may have multiple context-scoped assessments;
- a film can propositionally condemn something while formally romanticizing it; retain separate teaching/craft evidence rather than forcing one state to explain everything;
- assessment changes require versioning.

Homepage:

```ts
type NarrativePermissionProjection = {
  assessments: NarrativePermissionAssessment[]
  featuredTeachingSignals: TeachingSignal[]
}
```

---

## 13. Craft / form model

Craft observations should be linkable to interpretation.

```ts
type CraftMechanism =
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
  | "OTHER"

type CraftObservation = {
  id: string
  sceneId?: string
  filmId: string
  mechanism: CraftMechanism
  observation: string
  interpretiveEffect: string
  evidenceRefs: EntityRef[]
  confidence: Confidence
}
```

Audience effect:

```ts
type AudiencePressureKind = "EMPATHY" | "IMITATION"

type AudiencePressureAssessment = {
  id: string
  filmId: string
  sceneId?: string
  characterId?: string
  kind: AudiencePressureKind
  level?: "LOW" | "MEDIUM" | "HIGH"
  rationale: string
  craftObservationIds: string[]
  confidence: Confidence
}
```

Do not infer endorsement automatically from high empathy pressure.

Homepage:

```ts
type CraftSympathyProjection = {
  sceneId: string
  observations: CraftObservation[]
  pressureAssessments: AudiencePressureAssessment[]
  asset: HomepageAssetRef
}
```

---

## 14. Scene Autopsy contract

```ts
type SceneAutopsyProjection = {
  scene: {
    id: string
    editionId: string
    sequenceIndex: number
    startTimestamp?: number
    endTimestamp?: number
    shortLabel: string
    spoilerLevel: SpoilerLevel
  }

  asset: HomepageAssetRef
  anchorLayoutVersion: string

  anchors: EvidenceAnchor[]
  featuredClaim: ClaimPreview
  counterevidence?: ClaimEvidencePreview[]

  eventSummary?: {
    act?: string
    motive?: string
    knowledge?: string
    pressure?: string
    consequence?: string
  }
}
```

Evidence anchor:

```ts
type EvidenceAnchor = {
  id: string
  normalizedX: number // 0..1 relative to uncropped master
  normalizedY: number // 0..1
  semanticTarget?: string
  label: string
  shortText: string
  evidenceRef: EntityRef
  spoilerLevel: SpoilerLevel
}
```

For responsive crops, anchors should be transformed using crop metadata rather than manually duplicated per viewport when feasible.

---

## 15. Decision / Knowledge Fog contract

```ts
type DecisionProjection = {
  decision: {
    id: string
    sceneId: string
    decidingCharacterIds: string[]
    prompt: string
    spoilerLevel: SpoilerLevel
  }

  options: DecisionOption[]
  facts: DecisionFact[]
  pressures: DecisionPressure[]
  dutiesOrGoods: DecisionDuty[]
  editorialJudgment: DecisionJudgmentPreview
}
```

```ts
type DecisionFact = {
  id: string
  text: string
  knowledgeState:
    | "KNOWN_TO_CHARACTER"
    | "REASONABLY_INFERABLE"
    | "UNKNOWN_AT_TIME"
    | "REVEALED_LATER"
  spoilerLevel: SpoilerLevel
}
```

```ts
type DecisionOption = {
  id: string
  label: string
  description?: string
  availableAtDecisionTime: boolean
}
```

```ts
type DecisionPressure = {
  id: string
  kind: "TIME" | "THREAT" | "COERCION" | "SOCIAL" | "EMOTIONAL" | "RESOURCE" | "OTHER"
  description: string
  severity?: "LOW" | "MEDIUM" | "HIGH"
}
```

Knowledge Fog must read `knowledgeState`; it must not derive known/unknown status from spoiler CSS classes.

---

## 16. Biblical principle / synthesis contract

```ts
type BiblicalSynthesisProjection = {
  observationClaim: ClaimPreview
  principle: BiblicalPrinciplePreview
  scriptureRefs: ScriptureRef[]
  application: string
  qualification?: string
  applicationType:
    | "DIRECT_COMMAND_OR_PROHIBITION"
    | "BROAD_BIBLICAL_PRINCIPLE"
    | "WISDOM_JUDGMENT"
    | "DISPUTED_APPLICATION"
    | "PRUDENTIAL_JUDGMENT"
  confidence: Confidence
  synthesis: string
  facets: SynthesisFacet[]
}
```

```ts
type SynthesisFacet = {
  dimensionId: string
  publicLabel: string
  displayValue: string
  valueKind: "NUMERIC" | "CATEGORICAL" | "TEXT"
  rationaleClaimId?: string
}
```

Do not compute a hidden universal Christian master score from these facets.

---

## 17. Discovery contract

```ts
type DiscoveryProjection = {
  featured: PublishedAnalysisCard[]
  prompts: DiscoveryPrompt[]
  availableDimensions: DiscoveryCapability[]
}
```

```ts
type DiscoveryCapability =
  | "FILMS"
  | "THEMES"
  | "RELATIONSHIPS"
  | "FAMILY_YOUTH"
  | "NARRATIVE_PERMISSION"
  | "DILEMMAS"
  | "BIBLICAL_PRINCIPLES"
  | "AUDIENCE"
```

Only advertise a capability if enough published data exists to make the destination useful.

---

## 18. Shared primitives

```ts
type Confidence = "HIGH" | "MEDIUM" | "LOW"

type SpoilerLevel = "NONE" | "MINOR" | "MAJOR" | "ENDING" | "FULL"

type EntityRef = {
  kind: string
  id: string
}
```

Claim preview:

```ts
type ClaimPreview = {
  id: string
  text: string
  confidence: Confidence
  spoilerLevel: SpoilerLevel
  evidenceRefs: EntityRef[]
}
```

---

## 19. Homepage asset reference

```ts
type HomepageAssetRef = {
  assetId: string
  role:
    | "HERO"
    | "CHARACTER"
    | "RELATIONSHIP"
    | "FAMILY_YOUTH"
    | "CRAFT_SCENE"
    | "AUTOPSY_SCENE"
    | "DECISION_SCENE"
    | "DISCOVERY_CARD"

  altText: string
  focalPoint?: { x: number; y: number }
  variants: {
    desktop?: string
    tablet?: string
    mobile?: string
    placeholder?: string
  }

  depthMapAssetId?: string
  foregroundMaskAssetId?: string
  subjectMaskAssetId?: string
  metadataVersion: string
}
```

Actual URLs should be resolved by media infrastructure, not hard-coded into editorial content.

---

## 20. Server composition strategy

Recommended semantic split:

### Critical first payload

- navigation metadata;
- Arrival;
- Featured film metadata;
- Six Lenses text;
- Story preview;
- first hero image candidate.

### Deferred semantic payload

May still be server-rendered/streamed but need not block first useful render:

- relationship events;
- family/youth observations;
- meaning/counterevidence;
- Narrative Permission;
- craft observations;
- autopsy anchors;
- decision facts;
- full Biblical synthesis;
- discovery list.

### Media manifests

Loaded/prefetched according to viewport proximity and quality tier.

Do not make the semantic content wait for WebGPU capability detection.

---

## 21. Spoiler filtering contract

Every projection function receives spoiler state.

```ts
type HomepageProjectionContext = {
  locale: string
  spoilerLevel: SpoilerLevel
  qualityHint?: "ULTRA" | "HIGH" | "MEDIUM" | "LITE"
}
```

Server/domain functions filter:

- story beats;
- claims;
- counterevidence;
- scene anchors;
- decision facts;
- ending-derived teaching signals.

Do not fetch ending facts into the default public payload and merely blur them in CSS if avoidable.

---

## 22. Versioning

Version at least:

- homepage projection schema;
- narrative claim revisions;
- Narrative Permission assessments;
- relationship interpretation events when changed materially;
- teaching signals;
- audience-pressure assessments;
- scene anchor layouts;
- methodology;
- rubric/dimension definitions.

The homepage may change its visual treatment without altering the meaning of historical analytical records.

---

## 23. Editorial authoring implications

The internal editor must eventually make it easy to author:

- story beats;
- character wants/fears/beliefs;
- relationship events;
- social/family/youth observations;
- narrative questions/claims;
- counterevidence;
- teaching signals;
- Narrative Permission assessments;
- craft observations;
- empathy/imitation assessments;
- evidence anchors;
- decision facts and knowledge states;
- biblical principles/applications.

If these fields are painful to author, editors will fall back to giant prose blobs and the public product will lose its structured advantage.

---

## 24. Anti-patterns

Do not create:

```ts
homepageSections: Array<{
  title: string
  body: string
  image: string
  effect: string
}>
```

as the only content model.

That shape destroys the semantic value of the ontology.

Do not create:

```ts
film: {
  moralScore: 82,
  relationshipScore: 74,
  messageScore: 66
}
```

as a substitute for actual relationship/message evidence.

Do not let the GPU scene become the canonical store of annotation coordinates, meaning or state.

---

## 25. Contract tests to add during implementation

At minimum:

1. Default spoiler projection contains no `MAJOR/ENDING/FULL` records.
2. Every Narrative Permission item has evidence or explicit low-confidence rationale.
3. `UNCHALLENGED` remains distinguishable from `NORMALIZED` in serialization.
4. Scene anchor coordinates remain within `[0,1]`.
5. Every homepage claim resolves to canonical entity IDs.
6. Every relationship event belongs to its declared relationship and film.
7. Every decision fact has explicit knowledge state.
8. Biblical application contains methodology version/reference.
9. Homepage renders meaningful content without media depth/mask assets.
10. Discovery does not advertise unsupported/empty capability surfaces.

---

## 26. Definition of done

This contract is sufficiently implemented when the homepage can be rendered from one pilot film fixture with **zero analytical content hard-coded inside React components** except global marketing copy.
