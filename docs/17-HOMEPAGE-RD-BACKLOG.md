# DeepMovieReview — Homepage R&D Backlog

> Status: execution backlog v0.1  
> Date: 2026-09-09  
> Purpose: split Homepage Launch Cut v1 into bounded prototypes that multiple agents can implement without silently redesigning the product.

---

## 1. Rules for all spikes

Every R&D spike must:

- use fixture data shaped according to `15-HOMEPAGE-DATA-CONTRACTS.md`;
- preserve semantic DOM content;
- provide reduced-motion and Lite behavior;
- report asset weight and measured runtime behavior;
- test touch and keyboard equivalents;
- avoid choosing a final global dependency merely to make one demo work;
- update relevant docs if the spike disproves an architectural assumption.

A spike is allowed to conclude **do not use this effect**.

---

# R&D-01 — Homepage shell + rhythm

## Goal

Build a bare 12-stage native-scroll shell with no premium GPU effects.

## Include

- header behavior;
- desktop 12-column / mobile 4-column grid;
- all 12 stage placeholders using real semantic headings/content fixtures;
- sticky sections only where intended;
- reduced-motion baseline;
- keyboard navigation;
- responsive breakpoints.

## Exclude

- WebGPU;
- advanced shaders;
- final art;
- final typography licensing choice.

## Questions

- Does 12 stages feel too long?
- Which stages can share one scroll chapter?
- Does the quiet/loud rhythm work without effects?
- Can user reach Films/Methodology quickly?

## Pass criteria

- page is understandable in plain DOM/CSS;
- no scroll trap;
- no stage requires mouse hover to reveal essential meaning;
- mobile order feels intentional.

---

# R&D-02 — Living Frame

> **Completed decision:** use **B / segmented planes** as the launch path and **C / Lite static** for Lite/Reduced Motion. Do not make A / depth mesh the production default. See `27-LIVING-FRAME-RD-RESULTS.md`.

## Goal

Prove hero depth/light interaction and determine whether depth mesh, layered planes or simpler treatment is best.

## Variants

### A — depth mesh

Master + depth displacement.

### B — segmented planes

Foreground / subject / background.

### C — Lite

Static image + minimal DOM/CSS reveal.

## Measure

- visual quality;
- face/edge distortion;
- frame time;
- texture memory;
- pointer latency;
- mobile thermal/performance behavior;
- implementation complexity.

## Pass criteria

- effect remains subtle and cinematic;
- fallback still looks designed;
- no permanent continuous render at idle;
- hero content does not wait for GPU init.

---

# R&D-03 — Six Lenses

## Goal

Use one frame to explain the six analysis domains without becoming a tabbed SaaS dashboard.

## Prototype states

- STORY;
- PEOPLE;
- RELATIONSHIPS;
- IDEAS;
- MORAL WORLD;
- CRAFT.

## Required interaction

- pointer/focus selection;
- keyboard selection;
- mobile tab/segmented equivalent;
- no six separate heavyweight scenes.

## Pass criteria

After a short test, user can name at least four analysis domains and understands that morality is only one lens.

---

# R&D-04 — Relationship Observatory

## Goal

Visualize a relationship evolving over 3–5 scenes.

## First prototype

DOM/SVG only.

Data:

- two characters;
- one relationship;
- four relationship events;
- dimensions changed qualitatively, not as fake numeric gauges.

## Optional enhancement

Subtle depth/portrait response.

## Test questions

- What changed between the two people?
- Where did trust fracture?
- Was the relationship repaired?
- Which scene caused the largest change?

## Pass criteria

Users can answer those questions without reading a full paragraph first.

## Failure signs

- resembles finance chart;
- resembles social-network graph;
- requires legend decoding before meaning;
- too many simultaneous dimensions.

---

# R&D-05 — Narrative Permission Field

## Goal

Prove the states:

- condemned;
- costly;
- questioned;
- unchallenged;
- normalized;
- rewarded;
- celebrated;
- ambiguous.

## First prototype

DOM/SVG, not GPU.

Use 4–5 behavior subjects.

Each item must expose:

- state;
- rationale;
- evidence;
- confidence/counterevidence where needed.

## Critical comprehension test

Ask users to explain the difference between:

- `UNCHALLENGED` and `NORMALIZED`;
- `COSTLY` and `CONDEMNED`;
- `REWARDED` and `CELEBRATED`.

## Pass criteria

At least the first two distinctions are understood consistently; otherwise revise terminology/visual placement before implementation.

---

# R&D-06 — Form Shapes Sympathy

## Goal

Show how camera/music/editing/performance change audience identification without equating sympathy with endorsement.

## Prototype

One still + 3 craft observations + empathy/imitation distinction.

## Pass criteria

User can articulate:

- how the film makes them feel toward the character;
- whether that feeling implies admiration/imitation or merely understanding.

No heavy shader is necessary for pass.

---

# R&D-07 — Scene Autopsy

## Goal

Build the core signature forensic interaction.

## Phase A — semantic static version

- scene image;
- normalized evidence anchors;
- accessible evidence list;
- ACT/MOTIVE/KNOWLEDGE/PRESSURE/CONSEQUENCE;
- claim + counterevidence.

## Phase B — depth enhancement

- depth map;
- subject/foreground masks;
- restrained layer separation;
- analytical relighting;
- trace lines.

## Phase C — responsive/mobile

- numbered anchors;
- bottom/inline panel;
- no tiny floating labels.

## Pass criteria

- user understands the claim/evidence relationship faster than with plain prose alone;
- all content survives no-GPU mode;
- active GPU interaction is smooth on target hardware tier;
- leaving section stops unnecessary render work.

---

# R&D-08 — Knowledge Fog / Decision Chamber

## Goal

Make known-at-the-time vs revealed-later information immediately understandable.

## Phase A — DOM

- decision prompt;
- options;
- known facts;
- inferable facts;
- unknown facts;
- later revelations;
- pressures/duties.

## Phase B — visual fog

Add spatial/depth obscuration only if semantic version already works.

## Test

Ask user:

- What did the character know?
- What could they reasonably infer?
- What did only the viewer learn later?
- Does later outcome change what the character could be blamed for knowing?

## Pass criteria

Users correctly separate epistemic information from moral justification.

---

# R&D-09 — Biblical Lens / normative editorial component

## Goal

Prove a calm normative layer that reads as serious editorial work rather than a verse sticker.

## Fixture

- observation claim;
- biblical principle;
- Scripture refs;
- application;
- qualification;
- application type;
- confidence.

## Pass criteria

- Scripture/principle hierarchy is visually clear;
- direct command vs wisdom/prudential judgment can be distinguished;
- long text remains comfortable on mobile;
- motion never competes with reading.

---

# R&D-10 — Shared media navigation

## Goal

Prototype Stage 12 film card/artwork → film hero continuity.

## Compare

1. native View Transition;
2. Motion layout/shared element;
3. immediate navigation fallback.

Do not begin with GPU route transition.

## Measure

- focus behavior;
- back navigation;
- interruption;
- scroll restoration;
- browser support;
- implementation complexity;
- image aspect-ratio changes.

## Pass criteria

Transition preserves context without delaying navigation or breaking accessibility.

---

# R&D-11 — Quality controller

## Goal

Implement tier selection and runtime downgrade independently from visual polish.

## State

- backend;
- DPR;
- quality tier;
- reduced motion;
- active frame-time sample;
- downgrade reason.

## Simulate

- WebGPU unavailable;
- forced WebGL2;
- low frame rate;
- high-DPR mobile;
- visibility loss;
- reduced motion.

## Pass criteria

- deterministic tier changes;
- no oscillation;
- no analytical content disappears;
- diagnostics available in dev mode.

---

# R&D-12 — Homepage integration

## Goal

Integrate only spikes that passed their own comprehension/performance gates.

## Required before integration

- final-ish launch fixture for one film;
- responsive asset set;
- documented motion ownership;
- no unresolved duplicate animation systems;
- baseline accessibility review.

## Integration order

1. shell;
2. Arrival/Living Frame;
3. Six Lenses;
4. Story;
5. Relationships;
6. Family/Youth;
7. Meaning;
8. Narrative Permission;
9. Craft;
10. Scene Autopsy;
11. Decision;
12. Biblical synthesis;
13. Discovery/navigation.

## Final acceptance

Test page once with all premium effects disabled.

If the no-GPU version feels like broken leftovers, the integration is not finished.

---

## Suggested ownership split

### Product/UX agent

- R&D-01;
- R&D-03;
- R&D-04 information design;
- R&D-05;
- R&D-08 semantic version;
- R&D-09.

### Visual/GPU agent

- R&D-02;
- R&D-07 Phase B;
- R&D-08 Phase B;
- selected R&D-06 enhancement.

### Platform/data agent

- fixtures/data contracts;
- spoiler filtering;
- media manifest;
- quality diagnostics infrastructure.

### Performance/accessibility agent

- R&D-11;
- test matrix;
- reduced motion;
- keyboard/touch audits;
- integration regression gates.

No owner may silently redefine editorial taxonomy to simplify their component.

---

## Recommended immediate next build package

The first coding package should contain only:

- R&D-01 Homepage shell;
- R&D-02 Living Frame;
- R&D-04 Relationship Observatory static prototype;
- R&D-05 Narrative Permission static prototype;
- R&D-07 Scene Autopsy static version.

This package proves the homepage's identity while minimizing technology lock-in.
