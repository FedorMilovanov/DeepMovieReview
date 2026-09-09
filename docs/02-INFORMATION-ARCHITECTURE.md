# DeepMovieReview — Information Architecture

> Status: v0.1 foundation  
> Purpose: define the long-term domain graph without forcing all features into MVP.

## 1. Architectural principle

DeepMovieReview should be modeled as a **graph of evidence and interpretation**, not as a blog with rating columns attached.

The fundamental relationships are:

`FILM → EDITION → SCENE → MORAL EVENT → CLAIM → EVIDENCE → PRINCIPLE → VERDICT`

Additional graphs:

`FILM → CHARACTER → ARC → DECISION → CONSEQUENCE`

`DECISION → KNOWN FACTS / UNKNOWN FACTS / OPTIONS / PRESSURES / DUTIES`

`USER → FILM RATING / SCENE RESPONSE / QUESTION RESPONSE / REVIEW / NOTE`

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
- synopsis;
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

Moral events and timestamps should ultimately attach to an edition, not only the abstract film.

### Person

Actors, directors, writers, cinematographers, composers and editorial contributors should be separate entities where relevant.

### Character

- film / franchise relation;
- performer relation;
- role type;
- short description;
- arc summary;
- moral arc classification;
- spoiler state.

### Scene

A scene is an evidence container.

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

### Moral Event

A structured morally significant action, omission, decision or consequence occurring in a scene.

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
- confidence;
- evidence links;
- editorial notes;
- methodology version.

### Moral Category

Taxonomy node. Categories can be hierarchical and versioned.

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

Do not force every category into “sin” because the platform also models virtues, pressures, restoration and morally neutral context.

### Decision / Dilemma

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

### Claim

Editorial analysis should be broken into claims that can point to evidence.

Examples:

- “The film frames the violence as corrosive rather than admirable.”
- “The character acts with substantial knowledge and low coercion.”
- “The ending weakens the earlier condemnation of revenge.”

Fields:

- claim text;
- claim type;
- confidence;
- spoiler level;
- evidence relations;
- supporting principle relations;
- counterevidence relations;
- review version.

### Biblical Principle

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

### Editorial Review

Long-form synthesis that references structured entities rather than duplicating them.

### Editorial Score

A score is always attached to:

- dimension definition;
- rubric version;
- subject (film, character, scene, event or decision);
- value;
- confidence;
- rationale / claim links.

Never create permanent schema columns such as `moral_score`, `psychological_score`, etc. Use versioned dimensions.

## 3. Score dimensions: likely candidates

Not all are required for MVP.

### Film craft

- artistic quality;
- narrative coherence;
- character writing;
- psychological realism;
- thematic coherence.

### Moral analysis

- moral clarity;
- severity of depicted evil;
- romanticization / normalization pressure;
- complexity of moral decisions;
- culpability density;
- consequence visibility;
- repentance / restitution;
- redemptive movement.

### Interpretive confidence

Every high-level judgment may carry confidence rather than pretending all interpretation is equally certain.

## 4. Film attitude model

Represent the narrative stance separately from content incidence.

Candidate categorical scale:

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

A film can have different attitudes toward different categories or characters.

## 5. Psychological model

Psychological analysis should describe mechanism without claiming diagnosis unless appropriately sourced and justified.

Useful structured dimensions:

- motivational coherence;
- self-deception;
- rationalization;
- fear;
- pride;
- attachment / loyalty;
- shame / guilt;
- anger;
- revenge drive;
- self-preservation;
- conformity;
- coercive pressure;
- empathy pressure created by filmmaking;
- moral disengagement mechanisms.

Potential moral-disengagement tags:

- euphemistic labeling;
- displacement of responsibility;
- diffusion of responsibility;
- dehumanization;
- victim blaming;
- advantageous comparison;
- minimization of consequences.

These are analytical tags, not clinical diagnoses.

## 6. Navigation model

Long-term primary surfaces:

### Home

Brand thesis + featured analysis + entry to atlas.

### Films

Index and Explore modes.

### Film Detail

Progressive disclosure from spoiler-safe snapshot into deep analysis.

### Scene

Deep link to a scene-level analysis / evidence object.

### Characters

Character moral/psychological arcs.

### Themes / Moral Topics

Examples: revenge, deception, justice, sacrifice, guilt, repentance.

### Dilemmas

Cross-film moral questions.

### Biblical Principles

Normative principles with linked film examples.

### Compare

Compare films, characters, decisions or Moral Cores.

### Community

Later phase: reviews, debates, lists, trusted contributions.

## 7. Film page outline

Suggested canonical order:

1. Film Hero
2. Spoiler-safe Verdict Snapshot
3. Viewer film score (when community exists)
4. Synopsis / Context
5. What the Film Is Saying
6. Moral Timeline
7. Character Analysis
8. Moral Events / Failures / Virtues
9. Scene Autopsies
10. Difficult Decisions
11. Depiction vs Endorsement
12. Psychological X-Ray
13. Consequences
14. Repentance / Restitution / Redemption
15. Scripture / Moral Principles
16. Counterevidence / Interpretive Uncertainty
17. Final Verdict
18. Community Reveal (later)
19. Related Moral Parallels

This is a content model, not a requirement that every film render all sections.

## 8. Spoiler architecture

Spoiler state must be first-class data.

Suggested levels:

- `NONE` — safe for someone who has not seen the film;
- `MINOR` — premise / early setup;
- `MAJOR` — significant developments;
- `ENDING` — ending-specific;
- `FULL` — unrestricted analysis.

Users should be able to choose spoiler depth. Components, claims, moral events and decisions should respect it.

Do not implement spoilers only as CSS blur over text.

## 9. Evidence architecture

Every strong editorial conclusion should eventually be traceable to evidence.

Evidence can include:

- scene;
- timestamp;
- visual event;
- dialogue paraphrase / legally allowed excerpt;
- narrative consequence;
- recurring motif;
- production or creator source where relevant;
- Scripture / theological source for normative claim.

This allows the UI to support “why do we say this?” interactions without cluttering the primary reading experience.

## 10. Versioning

Version the things that affect interpretation or aggregation:

- methodology;
- rubric;
- score dimension definitions;
- moral category taxonomy;
- editorial reviews;
- moral events;
- questions and options;
- major claims.

A future methodology update must not silently reinterpret historical data.

## 11. Proposed conceptual schema

```text
films
film_editions
people
film_credits
characters
character_relations
scenes
scene_characters

moral_categories
moral_category_versions
moral_events
moral_event_versions
moral_event_categories

characters_arcs
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

Exact database normalization should be decided during implementation; this document defines the semantic boundaries.

## 12. API design principle

Do not expose one gigantic “film page JSON” as the only source of truth.

Prefer stable domain endpoints / server functions for:

- film core metadata;
- editorial snapshot;
- timeline;
- scene analysis;
- decisions;
- community aggregates;
- comparison;
- asset manifests.

The frontend can compose these by route and progressively load heavy layers.

## 13. Search and discovery

Search should eventually understand both canonical metadata and moral concepts.

Examples:

- `revenge`
- `lying to save a life`
- `films with repentance`
- `high moral ambiguity`
- `editorial audience disagreement`
- `character coerced into violence`

This is why moral topics, dilemmas and claims must be structured rather than buried only inside prose.

## 14. Data-quality states

Important analytical records should support status such as:

- draft;
- reviewed;
- verified;
- disputed;
- superseded;
- archived.

Community suggestions should not overwrite editorial data directly.

## 15. Immediate MVP data requirement

Even the one-film prototype should use real entities for:

- Film;
- Film Edition;
- Scene;
- Moral Event;
- Character;
- Decision;
- Biblical Principle;
- Editorial Review;
- Score Dimension;
- Editorial Score;
- Claim/Evidence relation.

This prevents the prototype from becoming throwaway hard-coded presentation data.