# DeepMovieReview — Phased Roadmap

> Status: v0.1 planning framework  
> Principle: prove depth and visual language before breadth or social scale.

## Phase 0 — Foundation / current

Goals:

- freeze product thesis;
- define methodology boundaries;
- define visual grammar;
- define domain model;
- define performance/accessibility constraints;
- choose one pilot film;
- create design tokens and technical spikes.

Deliverables:

- project docs;
- pilot content outline;
- data fixtures for one film;
- visual prototypes for signature interactions;
- initial schema draft;
- CI/performance budget proposal.

Exit criteria:

- no unresolved contradiction between editorial model and database model;
- every signature effect has a semantic purpose;
- fallback path exists in prototype.

## Phase 1 — One-film vertical slice

Build one complete film analysis at production-level quality.

Required:

- Home minimal shell;
- Film Hero;
- Verdict Snapshot;
- Synopsis / thesis;
- Moral Timeline;
- one Scene Autopsy;
- one Decision Chamber;
- Depiction vs Endorsement section;
- Psychological X-Ray;
- Scripture / Principle section;
- Final Verdict;
- sources/method version;
- responsive mobile treatment;
- reduced-motion/Lite path.

Optional only if time remains:

- one simple viewer film rating;
- useful/not useful feedback.

Do **not** build social profiles, follower graphs or huge catalogs.

## Phase 1A — Signature technical spikes

Each spike is allowed to fail and be replaced.

### A. Persistent GPU Stage

Prove one canvas can survive route/section transitions without leaking resources.

### B. Living Frame

Master image + depth map + local light + safe mobile fallback.

### C. Moral Lens

Pointer/touch/keyboard-compatible examination state.

### D. Scene Autopsy

Depth separation + DOM annotations.

### E. Moral Core

Deterministic semantic vector → geometry/material.

### F. Knowledge Fog

Character-known vs viewer-known state in Decision Chamber.

### G. Shared media transition

Film card → film hero using native/Motion transition first; GPU only if it adds meaningful value.

## Phase 2 — Small curated corpus

Target: enough films to test taxonomy and comparisons, not “large database” optics.

Suggested 15–30 films chosen deliberately across:

- genres;
- eras;
- moral severity;
- clear vs ambiguous narrative stance;
- simple vs complex dilemmas;
- strong/weak repentance arcs;
- different psychological structures.

Goals:

- calibrate rubric;
- test inter-editor consistency;
- refine category taxonomy;
- prove search/filtering;
- build Index catalog;
- add compare prototype;
- validate Moral Core comparability.

## Phase 2A — Methodology calibration

Editors independently score the same film sample.

Measure:

- disagreement by dimension;
- category confusion;
- dimensions with poor reliability;
- over-precise numbers;
- unclear biblical applications.

Actions:

- revise rubric;
- version methodology;
- change weak numerical dimensions to categories/prose;
- publish transparent methodology.

## Phase 3 — Audience basics

Only after editorial product already works.

Add:

- authentication;
- Viewer Film Score;
- useful/not useful;
- Moral Perception question;
- one or more Decision polls;
- vote-first/crowd-second reveal;
- weighted aggregates;
- anomaly logging;
- rating confidence state.

Avoid comments until moderation model is ready.

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

## Phase 6 — Moral Atlas

When structured corpus is large enough:

- topic discovery;
- moral complexity filters;
- repentance/redemption filters;
- romanticization / narrative stance filters;
- difficult decisions;
- editorial–audience gap;
- polarization;
- Moral Core browsing.

This is where the database becomes much more than a review publication.

## Phase 7 — Dilemma Atlas / Moral Parallels

Build cross-film analytical products:

- dilemma pages;
- recurring moral question taxonomy;
- decision comparison;
- known/unknown facts comparison;
- pressure/coercion comparison;
- editorial conclusions;
- audience distributions.

## Phase 8 — Advanced community intelligence

Possible:

- Audience Field visualization;
- Reception Over Time;
- trusted contributors;
- reviewer compatibility;
- taste-based film recommendations;
- richer personal analytics.

Must remain privacy-conscious and explainable.

## Phase 9 — Editorial tooling / scale

As corpus grows, invest heavily in internal tools:

- film ingest;
- edition/timestamp management;
- scene editor;
- moral-event editor;
- claim/evidence graph;
- rubric scoring;
- Scripture principle linking;
- review workflow;
- asset/depth/mask pipeline;
- revision diff;
- moderation dashboard;
- aggregate inspection.

A good public product will eventually depend on excellent editorial tooling.

## Suggested first pilot film criteria

Choose a film that has:

- recognizable audience appeal;
- several morally significant scenes;
- at least one genuinely difficult decision;
- enough psychological depth;
- nontrivial depiction-vs-endorsement question;
- strong visual material for Scene Autopsy;
- a meaningful ending/verdict;
- no need to invent dozens of edge-case taxonomies immediately.

Avoid beginning with the single most controversial culture-war film available. Prove the method before stress-testing public controversy.

## Workstream separation

Multiple agents/teams should have bounded ownership:

### Editorial Methodology

Taxonomy, rubrics, principles, pilot analysis.

### Visual R&D

Moral Lens, Core, Scene Autopsy, transitions.

### Product/UX

Information architecture, spoiler flow, mobile, community interactions.

### Platform/Data

Schema, versioning, APIs, search.

### Performance/Accessibility

Budgets, quality tiers, reduced motion, test matrix.

### Community/Integrity

Later: ratings, anti-abuse, moderation, privacy.

Do not let visual R&D silently redesign the methodology or let schema implementation silently collapse distinctions to simplify code.

## Prioritization rule

When choosing between two tasks, prefer the task that increases one of:

- methodological credibility;
- content depth;
- visual distinctiveness tied to meaning;
- accessibility/performance confidence;
- future architectural optionality.

Deprioritize work whose primary purpose is to make the repository look large.