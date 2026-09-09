# DeepMovieReview — Information Architecture

> Status: v0.2 foundation  
> Purpose: define the long-term domain graph without forcing all features into MVP.

## 1. Architectural principle

DeepMovieReview should be modeled as a **graph of film evidence and interpretation**, not as a blog with rating columns attached.

The moral-event graph remains important, but it is only one branch of a larger analytical system.

Canonical high-level relationships:

```text
FILM → EDITION → SCENE
FILM → STORY STRUCTURE → PLOT BEAT
FILM → CHARACTER → CHARACTER ARC
FILM → RELATIONSHIP → RELATIONSHIP EVENT
FILM → THEME → NARRATIVE QUESTION → NARRATIVE CLAIM → EVIDENCE
FILM → WORLDVIEW / SOCIAL MODEL → CLAIM → EVIDENCE
FILM → TEACHING SIGNAL / NARRATIVE PERMISSION → EVIDENCE
SCENE → MORAL EVENT → CLAIM → PRINCIPLE → VERDICT
DECISION → KNOWN FACTS / UNKNOWN FACTS / OPTIONS / PRESSURES / DUTIES
SCENE / FILM → CRAFT OBSERVATION → EMPATHY / IMITATION EFFECT
USER → FILM RATING / QUESTION RESPONSE / REVIEW / NOTE
```

## 2. Core entities

### Film

Canonical work-level record.

Suggested fields:

- id;
- slug;
- canonical title;
- original title;
- year;
- runtime;
- countries;
- languages;
- genres;
- premise / spoiler-safe synopsis relation;
- release metadata;
- poster/hero asset relations;
- spoiler policy;
- publication state.

### Film Edition

Important because theatrical, director's cut, extended and streaming edits may differ.

Fields:

- film_id;
- edition name;
- runtime;
- release date;
- region;
- source / verification;
- canonical-for-review flag.

Scenes, timestamps and edition-specific evidence should attach to an edition, not only the abstract film.

### Person

Actors, directors, writers, cinematographers, composers and editorial contributors should be separate entities where relevant.

### Scene

A scene is a primary evidence container.

Fields:

- edition_id;
- sequence index;
- start/end timestamp;
- title / internal label;
- spoiler level;
- summary;
- participants;
- location;
- visual assets;
- transcript/excerpt references only where legally appropriate;
- verification state.

## 3. Story / plot entities

### Story Summary

Versioned summaries at different spoiler depths:

- premise;
- extended synopsis;
- full synopsis.

### Story Structure

Candidate fields:

- central dramatic question;
- protagonist goal;
- central conflict;
- stakes;
- resolution type;
- ending state;
- coherence notes;
- methodology/analysis version.

### Plot Beat

Optional structured event for meaningful turning points.

Fields:

- film/edition relation;
- sequence/scene relation;
- beat type;
- description;
- spoiler level;
- causal predecessor/successor relations;
- affected characters/relationships;
- confidence.

Do not force every film into one fixed screenplay paradigm.

## 4. Character entities

### Character

Suggested fields/relations:

- film / franchise relation;
- performer relation;
- dramatic role;
- short description;
- initial state;
- desire;
- fear;
- loyalties;
- contradiction;
- strengths/weaknesses;
- self-image;
- narrative point-of-view weight;
- role-model / cautionary / ambiguous function;
- ending state;
- spoiler state.

### Character Arc

A versioned interpretive object.

Possible arc-event tags:

- challenge;
- temptation;
- compromise;
- fall;
- revelation;
- resistance;
- sacrifice;
- repentance;
- repair;
- hardening;
- transformation;
- restoration.

### Psychological Observation

Descriptive mechanism, not diagnosis by default.

Examples:

- fear;
- shame/guilt;
- pride;
- attachment;
- self-preservation;
- conformity;
- anger;
- revenge;
- rationalization;
- self-deception;
- social pressure;
- motivational coherence.

## 5. Relationship entities

### Relationship

Relationships are first-class domain objects.

Candidate types:

- marriage;
- romance / dating;
- parent-child;
- sibling;
- friendship;
- mentor-student;
- peer group;
- leader-follower;
- authority-subordinate;
- caregiver-dependent;
- rival;
- exploiter-victim;
- community/group belonging.

Fields/relations:

- participants;
- relationship type(s);
- initial state;
- trust/honesty state;
- power asymmetry;
- responsibility structure;
- commitment/fidelity where applicable;
- conflict pattern;
- repair/reconciliation pattern;
- ending state;
- narrative framing;
- spoiler level;
- confidence.

### Relationship Event

Scene-level change to a relationship.

Possible fields:

- relationship_id;
- scene_id;
- event type;
- before/after state;
- trust change;
- power change;
- responsibility fulfilled/neglected;
- conflict/repair;
- consequence;
- film framing;
- evidence;
- confidence.

This powers `Relationship Trace` / `Relationship Observatory` UI.

## 6. Family, youth and social-model entities

### Social Model Observation

A structured observation about how the film portrays a recurring social role/system.

Candidate subject types:

- parenthood;
- family system;
- adolescence/youth;
- friendship;
- romance;
- marriage;
- authority;
- education;
- work/vocation;
- community;
- religious/spiritual institution;
- justice/law.

Candidate fields:

- subject type;
- film/scene/character/relationship relations;
- descriptive claim;
- narrative framing;
- consequence pattern;
- confidence;
- evidence;
- normative assessment relation where applicable.

### Youth / Formation Observation

Potential tags:

- peer pressure;
- authority relation;
- rebellion;
- healthy autonomy;
- responsibility;
- work/school attitude;
- risk behavior;
- sexuality/romance;
- substances;
- digital behavior;
- self-control;
- teachability;
- maturation;
- adult role-model presence.

This is analysis, not an age rating.

## 7. Theme / meaning entities

### Theme

A recurring subject/tension.

Examples:

- guilt;
- revenge;
- fatherhood;
- truth;
- identity;
- belonging;
- justice;
- sacrifice;
- forgiveness;
- mortality;
- hope.

### Narrative Question

A question the film substantially explores.

### Narrative Claim

An evidence-backed interpretation of what the film appears to say.

Fields:

- claim text;
- claim family/type;
- scope;
- confidence;
- spoiler level;
- supporting evidence;
- counterevidence;
- ending weight;
- character/relationship/theme relations;
- craft evidence;
- review version.

A film can contain competing claims.

### Worldview Topic / Worldview Claim

Possible families:

- anthropology / human nature;
- moral order;
- freedom/responsibility;
- meaning/purpose;
- happiness/flourishing;
- love/relationships;
- family/generations;
- authority/power;
- justice;
- spiritual/transcendent claims.

Avoid one opaque `worldview_score`.

## 8. Teaching / formation entities

### Teaching Signal

Represents how the film can shape a viewer's understanding beyond explicit dialogue.

Candidate channels:

- explicit lesson;
- role model;
- cautionary example;
- reward;
- punishment/cost;
- normalization;
- romanticization;
- humor/comic permission;
- ridicule;
- repetition;
- ending resolution;
- unchallenged assumption;
- countermodel.

Fields:

- subject;
- signal type;
- strength;
- audience relevance where justified;
- supporting evidence;
- counterevidence;
- confidence.

Critical rule: `unchallenged` does not automatically equal `endorsed`.

### Narrative Permission

A broader classification of how the film's world treats a behavior/value/pattern.

Candidate states:

1. `CONDEMNED`
2. `COSTLY`
3. `QUESTIONED`
4. `UNCHALLENGED`
5. `NORMALIZED`
6. `REWARDED`
7. `CELEBRATED`
8. `AMBIGUOUS`

Optional modifiers:

- romanticized;
- aestheticized;
- comic;
- tragic;
- satirical;
- excused;
- grieved;
- culturally assumed.

This is distinct from a specific event-level film stance.

## 9. Moral Event

A structured morally significant action, omission, decision, virtue or consequence occurring in a scene.

An event should not be only `sin_type`.

Candidate structure:

- act / omission type;
- target / victim / beneficiary;
- motive(s);
- intention;
- knowledge state;
- freedom / coercion;
- pressure;
- foreseeable consequence;
- actual consequence;
- culpability assessment;
- severity assessment;
- repentance / restitution state;
- narrative stance;
- confidence;
- evidence links;
- editorial notes;
- methodology version.

### Moral Category

Hierarchical/versioned taxonomy.

Examples:

- deception;
  - lie;
  - concealment;
  - manipulation;
- violence;
- betrayal;
- pride;
- greed;
- lust;
- cowardice;
- complicity;
- vengeance;
- sacrificial love;
- courage;
- truthfulness;
- mercy;
- justice;
- repentance.

Do not force every category into “sin” because the platform also models virtues, pressures, restoration and neutral context.

## 10. Decision / dilemma

A decision is a structured object, not merely a paragraph.

Fields:

- scene_id;
- deciding character(s);
- prompt;
- options;
- known facts at decision time;
- unknown facts;
- uncertainty;
- coercive pressures;
- duties / goods in conflict;
- predicted consequences;
- actual consequences;
- editorial judgment;
- confidence;
- linked moral principles;
- linked audience question.

## 11. Craft Observation

Film form can serve as evidence for meaning and reception.

Candidate types:

- camera / POV;
- blocking;
- lighting;
- performance;
- editing;
- music/sound;
- production design;
- genre convention;
- humor/satire;
- visual motif.

Fields:

- scene/film relation;
- observation;
- interpretive effect;
- empathy effect;
- imitation/aspiration effect where supported;
- evidence;
- confidence.

### Empathy Pressure

How strongly form asks the viewer to feel with/understand a character.

Empathy is not endorsement.

### Imitation Pressure

How strongly form makes a behavior/lifestyle look aspirational, glamorous, socially rewarded or identity-conferring.

This is especially relevant to youth/formation analysis.

## 12. Claim

Editorial analysis should be broken into claims that point to evidence.

Claim types now include:

- factual/plot;
- character;
- relationship;
- psychological;
- thematic;
- worldview;
- teaching/message;
- narrative permission;
- craft/reception;
- moral;
- biblical/normative.

Fields:

- claim text;
- claim type;
- confidence;
- spoiler level;
- evidence relations;
- principle relations where normative;
- counterevidence relations;
- review version.

## 13. Biblical Principle

A normative principle should not be stored as a loose quote blob.

Candidate fields:

- principle title;
- concise formulation;
- theological explanation;
- Scripture references;
- scope / qualification;
- related topics;
- editorial methodology notes.

Separate Scripture reference metadata from quoted translation text.

Normative conclusions should distinguish:

- direct biblical command/prohibition;
- broader biblical principle;
- wisdom judgment;
- disputed application;
- prudential judgment.

## 14. Editorial Review and scores

Long-form synthesis should reference structured entities rather than duplicate them.

### Editorial Score

A score is always attached to:

- dimension definition;
- rubric version;
- subject (film, character, relationship, scene, event or decision);
- value;
- confidence;
- rationale / claim links.

Never create permanent schema columns such as `moral_score`, `psychological_score`, `family_score` etc. Use versioned dimensions.

## 15. Candidate score/facet domains

Not all are numeric and not all belong on every film.

### Film / craft

- cinematic quality;
- storytelling;
- narrative coherence;
- performances;
- visual/sound craft.

### Character / psychology

- character depth;
- psychological realism;
- motivational coherence;
- arc credibility.

### Relationships / social portrayal

- relationship depth/realism;
- parent-child/family portrayal when central;
- marriage/romance portrayal when central;
- friendship/loyalty when central;
- youth/formation when central;
- authority/responsibility when central.

### Ideas / meaning

- thematic depth;
- thematic coherence;
- worldview/message clarity;
- interpretive ambiguity;
- discussion value.

### Moral analysis

- moral clarity;
- severity of depicted evil;
- romanticization / normalization pressure;
- complexity of moral decisions;
- consequence visibility;
- repentance / restitution;
- redemptive movement.

### Interpretive confidence

High-level judgments may carry confidence rather than pretending all interpretation is equally certain.

## 16. Film attitude model

Represent narrative stance separately from content incidence.

Candidate event/topic scale:

1. `CONDEMNS`
2. `QUESTIONS`
3. `AMBIVALENT`
4. `NORMALIZES`
5. `CELEBRATES`

Optional modifiers:

- romanticizes;
- trivializes;
- excuses;
- satirizes;
- aestheticizes;
- exposes;
- grieves;
- rewards;
- punishes.

A film can have different attitudes toward different categories, characters, relationships or behaviors.

## 17. Navigation model

Long-term primary surfaces:

### Home

Cinematic demonstration of the complete analysis model.

### Films

Index and Explore modes.

### Film Detail

Progressive disclosure from spoiler-safe story/meaning snapshot into deep analysis.

### Scene

Deep link to scene-level evidence/analysis.

### Characters

Character/psychological/moral arcs.

### Relationships

Potential later cross-film relationship discovery surface.

### Topics / Themes

Revenge, fatherhood, truth, guilt, marriage, belonging, justice, sacrifice, etc.

### Youth / Family / Formation

Later collection/atlas surface once the corpus supports it.

### Dilemmas

Cross-film moral questions.

### Biblical Principles

Normative principles with linked film examples.

### Compare

Compare films, characters, relationships, decisions or synthesis visualizations.

### Community

Later phase: reviews, debates, lists, trusted contributions.

## 18. Film page outline

Suggested canonical content progression:

1. Film Hero / Living Frame
2. Spoiler-safe Story at a Glance
3. Verdict / Analysis Snapshot
4. Viewer Film Score (when community exists)
5. Synopsis / Context
6. Plot Structure / Why the Story Matters
7. Character Portraits / Arcs
8. Relationship Observatory
9. Family / Parents / Youth / Friendship / Authority modules where relevant
10. Themes & Narrative Questions
11. What the Film Appears to Say
12. What the Film Teaches by Example
13. Narrative Permission Map
14. Craft & Meaning / Form Shapes Sympathy
15. Moral Timeline
16. Moral Events / Virtues / Failures
17. Scene Autopsies
18. Difficult Decisions
19. Depiction vs Endorsement
20. Psychological X-Ray
21. Consequences
22. Repentance / Restitution / Redemption
23. Scripture / Biblical Principles
24. Counterevidence / Interpretive Uncertainty
25. Final Synthesis / Verdict
26. Community Reveal (later)
27. Related Narrative/Moral/Relationship Parallels

This is a component library, not a requirement that every film render all sections.

## 19. Spoiler architecture

Spoiler state is first-class data.

Suggested levels:

- `NONE` — safe before viewing;
- `MINOR` — premise / early setup;
- `MAJOR` — significant developments;
- `ENDING` — ending-specific;
- `FULL` — unrestricted analysis.

Apply spoiler state to:

- summaries;
- plot beats;
- character arcs;
- relationship arcs;
- themes/claims;
- teaching signals;
- moral events;
- decisions;
- ending/worldview conclusions.

Do not implement spoilers only as CSS blur over text.

## 20. Evidence architecture

Strong conclusions should be traceable to evidence.

Evidence can include:

- scene;
- timestamp;
- action;
- plot consequence;
- relationship change;
- recurring pattern;
- visual event;
- dialogue paraphrase / legally allowed excerpt;
- camera / editing / music / performance;
- ending resolution;
- recurring motif;
- creator/production source where relevant and clearly distinguished from textual evidence;
- Scripture / theological source for normative claims.

This allows `Why do we say this?` interactions without cluttering primary reading.

## 21. Versioning

Version things that affect interpretation or aggregation:

- methodology;
- rubric;
- score dimension definitions;
- category taxonomies;
- editorial reviews;
- story structures where materially revised;
- character/relationship analyses;
- moral events;
- narrative claims;
- teaching signals / narrative permissions;
- questions and options;
- major claims.

A future methodology update must not silently reinterpret historical data.

## 22. Proposed conceptual schema

```text
films
film_editions
people
film_credits
scenes

story_summaries
story_structures
plot_beats
plot_threads

characters
character_profiles
character_arcs
character_arc_events
psychological_observations

relationships
relationship_types
relationship_events
relationship_states
social_model_observations
youth_formation_observations

themes
narrative_questions
narrative_claims
worldview_topics
worldview_claims
teaching_signals
narrative_permissions
role_model_assessments
craft_observations
empathy_observations
imitation_observations
discussion_topics

moral_categories
moral_category_versions
moral_events
moral_event_versions
moral_event_categories

decisions
decision_options
decision_facts
decision_pressures
decision_consequences

biblical_principles
scripture_references
claims
claim_evidence
claim_principles

editorial_reviews
editorial_review_versions
rubrics
rubric_versions
score_dimensions
editorial_scores

media_assets
asset_variants
asset_depth_maps
asset_masks

questions
question_versions
question_options

users
user_film_ratings
user_dimension_ratings
user_question_responses
user_scene_responses
user_reviews
user_scene_notes
user_counterarguments
content_votes

rating_events
rating_aggregates
rating_snapshots
moderation_events
abuse_signals
contributor_reputation
```

Exact normalization is an implementation decision; this document defines semantic boundaries.

## 23. API design principle

Do not expose one gigantic `film page JSON` as the only source of truth.

Prefer stable domain endpoints/server functions for:

- film metadata;
- story summary/structure;
- characters;
- relationships;
- themes/questions/claims;
- teaching signals / narrative permission;
- editorial snapshot;
- timeline;
- scene analysis;
- decisions;
- biblical principles;
- community aggregates;
- comparison;
- asset manifests.

Frontend can compose these by route and progressively load heavy layers.

## 24. Search and discovery

Search should eventually understand canonical metadata plus narrative/relational/moral concepts.

Examples:

- `revenge`
- `lying to save a life`
- `films with repentance`
- `absent fathers`
- `parent child reconciliation`
- `teen rebellion romanticized`
- `friendship becomes complicity`
- `marriage after betrayal`
- `responsible adult role models`
- `love requires truth`
- `film normalizes dishonesty`
- `ending reverses message`
- `high discussion value family films`

This is why themes, relationships, teaching signals, dilemmas and claims must be structured rather than buried only inside prose.

## 25. Data-quality states

Important analytical records should support status such as:

- draft;
- reviewed;
- verified;
- disputed;
- superseded;
- archived.

Community suggestions should not overwrite editorial data directly.

## 26. Immediate MVP data requirement

Even the one-film prototype should use real entities for at least:

- Film;
- Film Edition;
- Story Summary / Story Structure;
- Scene;
- Character;
- one Character Arc;
- one Relationship + Relationship Events if central;
- Theme / Narrative Question / Narrative Claim;
- at least one Teaching Signal or Narrative Permission observation;
- Moral Event;
- Decision when the film contains a meaningful dilemma;
- Craft Observation where form materially shapes interpretation;
- Biblical Principle;
- Editorial Review;
- Score Dimension;
- Editorial Score;
- Claim/Evidence relation.

This prevents the prototype from becoming throwaway hard-coded presentation data.