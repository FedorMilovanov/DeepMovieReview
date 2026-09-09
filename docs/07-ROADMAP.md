# DeepMovieReview — Phased Roadmap

> Status: v0.2 planning framework  
> Principle: prove depth and visual language before breadth or social scale.

## Phase 0 — Foundation / current

Goals:

- freeze expanded product thesis;
- define methodology boundaries;
- define homepage architecture;
- define whole-film ontology;
- define visual grammar;
- define performance/accessibility constraints;
- choose one pilot film;
- create bounded design/technical spikes.

Deliverables:

- project docs;
- homepage launch-cut storyboard;
- pilot content outline;
- data fixtures for one film;
- visual prototypes for signature interactions;
- initial ER/schema draft;
- editorial rubric calibration plan;
- CI/performance budget proposal.

Exit criteria:

- no contradiction between editorial model and database model;
- homepage communicates story/character/relationships/themes as well as moral/biblical depth;
- every signature effect has semantic purpose;
- fallback path exists in prototype.

## Phase 1 — One-film vertical slice

Build one complete film analysis at production-level quality.

### Required whole-film content

- Home launch shell using selected sections from `11-HOMEPAGE-ARCHITECTURE.md`;
- Film Hero / Living Frame;
- Story at a Glance;
- Synopsis / plot structure;
- at least one Character Portrait/Arc;
- at least one Relationship Observatory/Trace if the film provides a meaningful relationship;
- `What the Film Appears to Say`;
- one teaching/message or Narrative Permission example;
- one `Form Shapes Sympathy` craft observation;
- Editorial Snapshot;
- Moral Timeline;
- one Scene Autopsy;
- one Decision Chamber if the film contains a genuine dilemma;
- Depiction vs Endorsement section;
- Psychological X-Ray;
- Scripture / Principle section;
- Final Synthesis;
- sources/method version;
- responsive mobile treatment;
- reduced-motion/Lite path.

### Optional only if time remains

- one simple viewer film rating;
- useful/not useful feedback.

Do **not** build social profiles, follower graphs or huge catalogs.

## Phase 1A — Signature technical/visual spikes

Each spike is bounded and allowed to fail.

### A. Persistent GPU Stage

Prove one canvas can survive route/section transitions without leaking resources.

### B. Living Frame

Master image + depth map + local light + safe mobile fallback.

### C. Six Lenses

Prove one film image can transition between `Story / People / Relationships / Ideas / Moral World / Craft` without becoming a six-card feature grid.

### D. Relationship Trace

Use `TRACE` to connect 3–5 relationship turning points through a film.

### E. Moral / Analytical Lens

Pointer/touch/keyboard-compatible examination state.

### F. Scene Autopsy

Depth separation + semantic DOM annotations.

### G. Narrative Permission Map

Prototype categorical film-world states without red/green moral-dashboard cliché.

### H. Moral Core

Deterministic semantic vector → geometry/material. Keep secondary to film/story at entry.

### I. Knowledge Fog

Character-known vs viewer-known state in Decision Chamber.

### J. Shared media transition

Film media → film hero using native/Motion transition first; GPU only if meaningful.

## Phase 1B — Editorial/data spike

Before production schema freezes, encode one pilot film with real entities for:

- story summary/structure;
- plot beats;
- characters/arcs;
- relationship/events;
- themes/questions/claims;
- teaching signals / Narrative Permission;
- craft observations;
- moral events;
- decision;
- principles;
- claims/evidence.

The purpose is to discover ontology failures before building the editorial CMS.

## Phase 2 — Small curated corpus

Target: 15–30 films chosen to stress-test the methodology, not to create “large database” optics.

Selection should vary across:

- genres;
- eras;
- story structures;
- character complexity;
- healthy/dysfunctional relationship models;
- family/parent-child patterns;
- youth-centered vs adult-centered stories;
- satire/straight drama;
- clear vs ambiguous themes/messages;
- moral severity;
- clear vs ambiguous narrative stance;
- simple vs complex dilemmas;
- strong/weak repentance arcs.

Goals:

- calibrate rubric;
- test inter-editor consistency;
- refine taxonomies;
- prove search/filtering;
- build Index catalog;
- add compare prototype;
- validate relationship/theme/message querying;
- validate Moral Core comparability only after the semantic model is stable.

## Phase 2A — Methodology calibration

Editors independently analyze the same sample.

Measure:

- disagreement by dimension;
- message/theme claim disagreement;
- relationship-analysis disagreement;
- category confusion;
- dimensions with poor reliability;
- over-precise numbers;
- unclear biblical applications.

Actions:

- revise rubric;
- version methodology;
- convert weak numeric dimensions to categories/prose;
- publish transparent methodology.

## Phase 2B — Discovery foundations

Once the corpus supports it, add early structured discovery:

- themes/questions;
- relationship types;
- parent/youth/family tags;
- narrative permission;
- moral topics;
- dilemmas.

Do not expose empty atlas pages.

## Phase 3 — Audience basics

Only after the editorial product works independently.

Add:

- authentication;
- Viewer Film Score;
- useful/not useful;
- interpretation/moral-perception question;
- one or more Decision polls;
- vote-first/crowd-second reveal;
- weighted aggregates;
- anomaly logging;
- rating confidence state.

Avoid open comments until moderation is ready.

## Phase 4 — Structured community

Add:

- user reviews;
- scene notes;
- counterarguments;
- factual correction proposals;
- helpful/well-reasoned voting;
- moderation queues;
- contributor trust.

Editorial records remain protected; community proposals create reviewable suggestions.

## Phase 5 — Personal cinema layer

Add:

- profile;
- watched;
- watchlist;
- rating history;
- lists;
- decision history;
- private/public controls;
- Moral Mirror descriptive comparisons.

Still avoid sensitive identity inference.

## Phase 6 — Meaning / Relationship / Formation Atlases

When structured corpus is large enough, introduce cross-film discovery beyond moral categories.

### Film Meaning Atlas

- themes;
- narrative questions;
- worldview claims;
- ending reversals;
- discussion value.

### Relationship Atlas

- marriage/romance patterns;
- parent-child arcs;
- friendship/complicity;
- mentors;
- authority;
- reconciliation/repair.

### Youth & Formation Atlas

- peer pressure;
- adult role models;
- rebellion/autonomy;
- maturation;
- risk/consequence patterns.

### Narrative Permission Atlas

Browse what films treat as condemned, costly, questioned, unchallenged, normalized, rewarded or celebrated.

## Phase 7 — Moral Atlas

Add:

- moral complexity filters;
- repentance/redemption;
- romanticization / narrative stance;
- difficult decisions;
- editorial–audience gap;
- polarization;
- Moral Core browsing.

The Moral Atlas becomes one major atlas among several, not the only conceptual map of the product.

## Phase 8 — Dilemma Atlas / Parallels

Build cross-film analytical products:

- dilemma pages;
- recurring moral-question taxonomy;
- decision comparison;
- known/unknown facts comparison;
- pressure/coercion comparison;
- narrative parallels;
- relationship parallels;
- editorial conclusions;
- audience distributions.

## Phase 9 — Advanced community intelligence

Possible:

- Audience Field visualization;
- Reception Over Time;
- trusted contributors;
- reviewer compatibility;
- taste-based film recommendations;
- richer personal analytics.

Must remain privacy-conscious and explainable.

## Phase 10 — Editorial tooling / scale

As corpus grows, invest heavily in internal tools:

- film ingest;
- edition/timestamp management;
- story/plot editor;
- character/arc editor;
- relationship trace editor;
- theme/question/claim graph;
- teaching-signal / Narrative Permission editor;
- craft-evidence editor;
- scene editor;
- moral-event editor;
- decision editor;
- claim/evidence graph;
- rubric scoring;
- Scripture-principle linking;
- review workflow;
- asset/depth/mask pipeline;
- revision diff;
- moderation dashboard;
- aggregate inspection.

A good public product will eventually depend on excellent editorial tooling.

## Suggested first pilot film criteria

Choose a film that has:

- recognizable audience appeal;
- a coherent but analyzable plot;
- at least two strong characters;
- at least one meaningful relationship arc;
- themes/messages that can be argued from evidence;
- several morally significant scenes;
- preferably one genuinely difficult decision;
- enough psychological depth;
- a nontrivial depiction-vs-endorsement or Narrative Permission question;
- strong visual material for Living Frame / Scene Autopsy;
- a meaningful ending/synthesis;
- no need to invent dozens of edge-case taxonomies immediately.

Avoid beginning with the single most controversial culture-war film available. Prove the method before stress-testing public controversy.

## Workstream separation

### Editorial / Film Analysis

Story, characters, relationships, themes, messages, craft, moral analysis, principles and pilot analysis.

### Visual R&D

Living Frame, Six Lenses, Relationship Trace, Lens, Scene Autopsy, Narrative Permission, Core, transitions.

### Product/UX

Homepage sequence, information architecture, spoiler flow, mobile, discovery and future community interactions.

### Platform/Data

Schema, versioning, APIs, search.

### Performance/Accessibility

Budgets, quality tiers, reduced motion, test matrix.

### Community/Integrity

Later: ratings, anti-abuse, moderation, privacy.

Do not let visual R&D silently redesign methodology or let schema implementation collapse distinctions to simplify code.

## Prioritization rule

Prefer tasks that increase one of:

- methodological credibility;
- whole-film analytical depth;
- visual distinctiveness tied to meaning;
- accessibility/performance confidence;
- future architectural optionality.

Deprioritize work whose main purpose is to make the repository look large.