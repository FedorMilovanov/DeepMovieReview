# DeepMovieReview — Homepage Architecture

> Status: v0.2 product/experience specification  
> Date: 2026-09-09  
> Purpose: define the homepage as a cinematic demonstration of the whole DeepMovieReview product, not merely a moral-rating landing page.

## 1. Homepage thesis

The homepage must communicate within the first 10–20 seconds that DeepMovieReview is a **deep film-analysis platform**.

The biblical/moral layer is essential, but it is not the only lens. The site analyzes at least six connected domains:

1. **STORY** — what happens, how the plot is built, what conflicts and turns shape the film;
2. **PEOPLE** — who the characters are, how coherent and psychologically credible they are, what they become;
3. **RELATIONSHIPS** — love, marriage, friendship, parents and children, peers, authority, loyalty, exploitation, repair;
4. **IDEAS / MEANING** — what questions the film asks, what it appears to say about life, truth, happiness, family, power, justice, identity, death, hope, God, etc.;
5. **MORAL WORLD** — acts, motives, responsibility, consequences, what the film condemns, questions, excuses, normalizes, rewards or celebrates;
6. **CRAFT / FORM** — how direction, acting, cinematography, editing, music, humor, genre and point of view shape meaning and audience sympathy.

The homepage should therefore feel like:

**CINEMA → STORY → PEOPLE → RELATIONSHIPS → IDEAS → MORAL WORLD → EVIDENCE → BIBLICAL JUDGMENT → DISCOVERY**

not simply:

**CINEMA → SIN COUNT → SCORE**.

## 2. Product comprehension goals

A first-time visitor should leave the first major sequence understanding all of these points:

- this is about films as films, not only objectionable content;
- the site contains spoiler-safe material and deep spoiler analysis;
- plot and characters are analyzed before final judgment;
- relationships and social models matter;
- a movie can depict bad behavior without endorsing it;
- what the film *teaches or normalizes* matters as much as what it shows;
- the biblical layer is argued from evidence, not attached as a decorative verse;
- the interface itself demonstrates the method through interaction;
- users will eventually be able to rate films and answer dilemmas, but editorial and audience layers remain separate.

## 3. Homepage design principle: reveal breadth before methodology

Do not lead with a dense moral rubric.

The first reveal should move from familiar film language to deeper analysis:

```text
A FILM
↓
A STORY
↓
PEOPLE
↓
RELATIONSHIPS
↓
IDEAS
↓
A MORAL WORLD
↓
A CLAIM ABOUT LIFE
```

Only after the visitor understands this breadth should we reveal detailed moral/biblical analysis.

This makes the project feel like a serious film publication first and a sophisticated normative analysis system second.

## 4. Recommended homepage master sequence

The following is the preferred long-form desktop storyboard. Launch versions may omit later sections when the corpus is small.

### 01 — BLACK / ARRIVAL

**Purpose:** establish tone and remove visual noise.

Visual:

- near-black field;
- tiny film grain / optical texture;
- one small focus mark or cursor point;
- no dashboard, no card wall;
- logo/navigation nearly invisible until the first pointer or scroll input.

Copy direction, not final copy:

> A film is more than what happens on screen.

Then:

> It tells us what to admire, fear, excuse, desire — and believe.

Motion:

- restrained type reveal;
- no heavy particles;
- no long forced loader.

### 02 — THE LIVING FRAME

A 2.39:1 cinematic frame appears out of darkness.

Content:

- one high-quality hero artwork from a featured analysis;
- title initially hidden or secondary;
- subtle timecode / frame marks;
- depth map + segmented foreground/background where supported;
- pointer acts as light/focus, not as gimmicky tilt.

Interaction:

- `LENS` cursor appears near the image;
- slight depth/parallax;
- optional relighting on HIGH/ULTRA quality tiers;
- reduced-motion version uses a static high-quality image with subtle light transition.

This is the first proof that still imagery can behave like a living film frame.

### 03 — FROM FRAME TO FILM

The frame gains context without losing atmosphere.

Reveal in sequence:

- title;
- year / director / genre;
- one-sentence premise;
- one non-spoiler analytical thesis.

Example information hierarchy:

```text
FILM / 0041
TITLE

A story about ...

Underneath the plot:
What does this film believe love requires?
```

Do not show ten scores yet.

### 04 — SIX LENSES / THE WHOLE FILM

The image is dissected into six conceptual layers:

- STORY;
- PEOPLE;
- RELATIONSHIPS;
- IDEAS;
- MORAL WORLD;
- CRAFT.

Visual direction:

- not six rounded cards;
- one cinematic image whose layers separate slightly in depth;
- labels appear as editorial annotations attached to meaningful regions;
- hover/focus changes the active analytical layer without replacing the entire scene.

This section is the homepage's key correction against the misconception that the product is only a sin counter.

### 05 — STORY / PLOT AS STRUCTURE

Show that we can explain a film before judging it.

Visual:

- a calm structural timeline with premise, inciting disruption, major turn, crisis, resolution;
- abstracted enough to remain spoiler-safe by default;
- an `Unlock full structure` action can reveal spoilered labels later.

Possible microcopy:

- `PREMISE`
- `CENTRAL CONFLICT`
- `TURNING POINT`
- `WHAT CHANGES?`

Do not imitate a screenplay app. The timeline should remain cinematic/editorial.

### 06 — PEOPLE / CHARACTER PORTRAITS

Introduce a small cast constellation.

For each key character, show only one sentence first:

- what the character wants;
- what the character fears;
- what inner contradiction drives them.

On interaction, reveal:

- character arc;
- psychological realism;
- role in the film's argument;
- whether the film invites admiration, pity, fear, identification or rejection.

Visual:

- portrait fragments or depth-separated character layers;
- character connections drawn with `TRACE` rather than boxes.

### 07 — RELATIONSHIP OBSERVATORY

This should become a signature DeepMovieReview section.

Purpose: prove that relationships are analyzed as dynamic systems, not only as isolated sexual/content events.

Examples:

- husband ↔ wife;
- parent ↔ child;
- siblings;
- friends;
- mentor ↔ student;
- peer group;
- authority ↔ subordinate;
- exploiter ↔ victim.

For the featured relationship, visualize dimensions such as:

- trust;
- truthfulness;
- reciprocity;
- responsibility;
- power;
- boundaries;
- sacrifice;
- repair after conflict.

Do not show all dimensions at once. Animate one relational trace through 3–5 scenes.

### 08 — FAMILY / PARENTS / YOUTH

A compact but distinctive module.

Questions the site can answer:

- Are parents present and responsible?
- Do adults model what they demand?
- Is authority loving, absent, hypocritical, abusive, indulgent or wise?
- How do adolescents relate to parents, teachers and peers?
- Is rebellion treated as inherently admirable, comic, costly, immature or justified in a specific case?
- Are risky or sexual behaviors followed by consequences, growth, indifference or reward?
- What kind of adulthood does the story invite young characters to become?

Visual direction:

- one family/peer-group still;
- vertical generational relationship lines;
- labels appear only on focus;
- use warm/cool lighting contrast rather than a school-dashboard aesthetic.

### 09 — WHAT IS THE FILM SAYING?

A major editorial typography section.

The site should distinguish:

- **THEME** — recurring subject/problem;
- **QUESTION** — issue the story explores;
- **NARRATIVE CLAIM** — what the story appears to assert;
- **COUNTERCLAIM** — evidence complicating that reading;
- **CONFIDENCE** — how certain we are.

Example:

```text
QUESTION
Can loyalty survive without truth?

FILM'S APPARENT ANSWER
Love without truth becomes possession.

CONFIDENCE
High
```

This is where large editorial typography and silence should dominate.

### 10 — MESSAGE FIELD / WHAT THE VIEWER IS TAUGHT

Not every film teaches through explicit dialogue. Model multiple teaching channels:

- explicit lesson;
- repeated pattern;
- admired role model;
- punished behavior;
- rewarded behavior;
- comic normalization;
- romanticization;
- unchallenged assumption;
- ending resolution;
- genre convention.

Visual concept:

A small set of statements orbit the film frame at varying visual strength. The strongest supported message resolves into focus; weaker/ambiguous readings remain softer.

Critical rule: `unchallenged` is not automatically `endorsed`. Confidence and counterevidence remain visible.

### 11 — NARRATIVE PERMISSION MAP

This should be another signature system.

Question:

> What kinds of behavior does this film's world treat as costly, questionable, normal, rewarded or admirable?

Candidate states:

- `CONDEMNED`
- `COSTLY`
- `QUESTIONED`
- `UNCHALLENGED`
- `NORMALIZED`
- `REWARDED`
- `CELEBRATED`
- `AMBIGUOUS`

Examples of subjects:

- dishonesty;
- manipulation;
- promiscuity;
- vengeance;
- cruelty;
- cowardice;
- sacrificial love;
- loyalty;
- courage;
- forgiveness;
- parental responsibility.

Visual:

- horizontal semantic field, not a red/green moral traffic light;
- evidence traces connect each state back to scenes.

### 12 — FORM SHAPES SYMPATHY

The site must show that filmmaking craft can alter moral perception.

Use one scene to demonstrate:

- camera proximity;
- music;
- slow motion;
- glamorous lighting;
- comic timing;
- point of view;
- editing rhythm;
- reaction shots;
- performance.

Question:

> What does the film make us feel before it asks us to think?

This is the visual home for `EMPATHY PRESSURE` and related craft observations.

### 13 — SCENE AUTOPSY

Now the forensic language is fully introduced.

A still frame separates into layers and annotations:

- what happened;
- who knew what;
- motive;
- pressure;
- immediate consequence;
- narrative framing.

This is a compact live demo rather than explanatory marketing prose.

### 14 — DIFFICULT DECISION / KNOWLEDGE FOG

Show one genuine dilemma.

Two modes:

- `WHAT THE CHARACTER KNEW THEN`;
- `WHAT THE VIEWER KNOWS NOW`.

Unknown information remains visually fogged until the second state.

Purpose: demonstrate fairness of analysis and the distinction between outcome and responsibility.

### 15 — BIBLICAL LENS / NORM

Only now does the homepage reach the explicit normative layer.

Visual tone changes:

- warmer black;
- ivory typography;
- reduced GPU motion;
- no red glow spectacle;
- Scripture references and principle language are calm and legible.

Structure:

`OBSERVATION → PRINCIPLE → SCRIPTURE → APPLICATION → CONFIDENCE / QUALIFICATION`

The site should distinguish:

- direct command/prohibition;
- broader biblical moral principle;
- wisdom judgment;
- disputed application;
- prudential judgment.

### 16 — VERDICT WITHOUT REDUCTION

Show why one master score is insufficient.

A featured film can have independent facets:

- cinematic quality;
- storytelling;
- character writing;
- relationship depth;
- thematic depth;
- psychological realism;
- depicted-content severity;
- narrative moral stance;
- redemptive movement.

Only 3–5 appear at once in the homepage demo.

The conclusion remains prose-first.

### 17 — FEATURED ANALYSIS

Now offer the full case study.

Presentation:

- one featured film large;
- 2–3 secondary films smaller only if the corpus exists;
- direct entry into `Read analysis`;
- shared-element/image transition into film page.

### 18 — EXPLORE BY QUESTION, NOT ONLY GENRE

Future-ready discovery teaser.

Examples:

- `What does cinema say about fatherhood?`
- `Films about revenge without repentance`
- `Teen rebellion and absent parents`
- `Friendship that becomes complicity`
- `Marriage under betrayal`
- `Truth vs loyalty`
- `Stories where villains are romanticized`
- `Films about guilt and forgiveness`

This demonstrates why themes, relationships and messages must be structured entities.

### 19 — AUDIENCE LAYER / FUTURE

Do not show an empty social network at launch.

When enabled, demonstrate separation:

- `EDITORIAL ANALYSIS`;
- `VIEWER FILM SCORE`;
- `AUDIENCE PERCEPTION`;
- `DECISION VOTES`.

Vote-first/crowd-second remains the rule for dilemmas.

### 20 — METHODOLOGY / TRANSPARENCY

Quiet section with direct links:

- methodology version;
- how scores work;
- how interpretation confidence works;
- how biblical principles are applied;
- corrections / revisions;
- how audience ratings are aggregated.

The method should feel inspectable rather than hidden behind authority branding.

### 21 — SEARCH / INDEX ENTRY

The final functional entry point.

Search must eventually understand:

- film title;
- person;
- character;
- theme;
- relationship type;
- dilemma;
- moral category;
- biblical principle;
- narrative message.

At launch, do not fake semantic search capability that does not yet exist.

### 22 — FOOTER

Almost motionless.

Include only useful navigation, methodology/version links, accessibility/motion controls, legal/editorial information and contact/contribution paths when ready.

## 5. Recommended hero direction

Three hero concepts were considered.

### A — Moral Core First

A procedural sculpture is the first visual.

**Strength:** technically impressive.  
**Weakness:** makes the site look like abstract morality/data before the visitor has felt a film.

**Verdict:** do not use as the primary hero.

### B — Cinematic Frame First — RECOMMENDED

A living film frame emerges first. Analysis is discovered inside it.

**Strengths:**

- cinema is primary;
- AI/depth imagery can look premium;
- easy transition into plot/character/relationship layers;
- the moral system feels earned rather than imposed.

**Verdict:** preferred.

### C — Editorial Manifesto First

Large typography explains the thesis before imagery.

**Strength:** seriousness and clarity.  
**Weakness:** less immediate emotional impact.

**Verdict:** use the manifesto language inside section 09/15, not as the only hero.

## 6. Navigation

Desktop navigation should remain compact.

Candidate information architecture:

```text
LOGO
FILMS
EXPLORE
TOPICS
DILEMMAS        (when corpus supports it)
METHODOLOGY
SEARCH
```

Do not create top-level navigation items for every analytical dimension.

`Relationships`, `Parents & Youth`, `Themes`, `Messages`, etc. can live inside Explore/Topics until the corpus justifies dedicated surfaces.

Persistent controls:

- search;
- spoiler state where relevant;
- reduced-motion / experience setting if needed;
- account only when community features exist.

## 7. Homepage visual grammar

Use the established primitives consistently:

- **FRAME** — the film itself / point of view;
- **LENS** — inspection / focus;
- **TRACE** — plot causality and relationship evolution;
- **FRACTURE** — rupture, conflict, moral break;
- **FOG** — uncertainty / missing knowledge;
- **CORE** — structured synthesis;
- **LIGHT** — disclosure / truth;
- **FIELD** — optional new primitive for messages, social models and audience distributions.

`FIELD` should be added only if it remains semantically useful across at least three components.

## 8. Motion budget

Recommended experiential ratio:

- ~70% calm cinematic/editorial;
- ~20% responsive micro-motion;
- ~7% meaningful GPU interaction;
- ~3% signature spectacle.

A visitor should remember 3–5 signature moments, not 40 effects.

### Signature homepage moments

1. Living Frame emergence;
2. six-lens dissection;
3. Relationship Trace;
4. Scene Autopsy;
5. Knowledge Fog / Decision Chamber.

Moral Core is a sixth optional climax, not a mandatory effect in every viewport.

## 9. Cursor system

Desktop custom cursor must remain semantic.

States:

- default point / ring;
- `OPEN` over film;
- `EXAMINE` over analytical frame;
- `TRACE` over relationship arc;
- timestamp over timeline;
- `WEIGH` over dilemma;
- `HOLD` only where drag is real.

Rules:

- no decorative tail;
- never hide native affordance on text inputs, controls or links that need conventional behavior;
- touch devices use no fake cursor;
- reduced-motion mode reduces inertial lag and shader response.

## 10. Launch homepage when corpus is tiny

Do not build a homepage that only makes sense with 500 films.

With 1–3 deep analyses, the home should behave as an **editorial exhibition**:

- one hero film;
- one relationship example;
- one theme/message example;
- one Scene Autopsy;
- one dilemma;
- methodology;
- `More analyses coming` rather than fake database counts.

With 20+ films, add:

- topic clusters;
- search/index previews;
- cross-film parallels;
- early atlas surfaces.

With 100+ films, add:

- richer semantic discovery;
- relationship/family/youth collections;
- comparative message and narrative-permission views;
- audience aggregates if community is mature enough.

## 11. Data dependencies for homepage modules

The homepage should consume the same structured entities as film pages rather than unique hard-coded marketing JSON.

Examples:

- Living Frame ← `media_assets`, `film`, `editorial_review`;
- Story Structure ← `story_structure`, `plot_beats`;
- Character Portraits ← `characters`, `character_arcs`;
- Relationship Observatory ← `relationships`, `relationship_events`;
- Film Meaning ← `themes`, `narrative_questions`, `narrative_claims`;
- Message Field ← `teaching_signals`, `narrative_permissions`;
- Scene Autopsy ← `scene`, `claims`, `evidence`, `moral_events`;
- Decision Chamber ← `decision`, `decision_facts`, `pressures`;
- Biblical Lens ← `biblical_principles`, `scripture_references`, `claims`.

This prevents the home from drifting into a separate design-demo product.

## 12. AI / image asset plan for homepage

A featured film should ideally provide a structured asset manifest:

- hero master 16:9 / cinematic crop-safe;
- ultrawide crop;
- mobile portrait crop;
- clean environment plate where legally/artistically appropriate;
- subject-separated variant;
- depth map;
- masks for major subjects/regions;
- texture/detail crops;
- abstract thematic image;
- fallback AVIF/WebP stills.

Generated imagery must not misleadingly present invented frames as actual film screenshots. The UI should distinguish original editorial/AI artwork from licensed/official film stills.

## 13. Performance contract

The homepage is the heaviest emotional surface but must not become the heaviest technical failure.

Rules:

- one persistent GPU stage where practical;
- no canvas per card;
- lazy-load sections below first interaction;
- demand-render static scenes;
- adaptive DPR/quality tiers;
- compressed textures and geometry;
- no required audio;
- Lite path must preserve composition and meaning;
- initial above-the-fold experience must not wait for all 3D assets.

## 14. Accessibility contract

Every analytical claim visible in GPU space must have a DOM/text equivalent.

Required:

- keyboard navigation;
- visible focus;
- native text selection in editorial sections;
- semantic headings;
- accessible spoiler controls;
- reduced-motion mode;
- no color-only moral distinctions;
- captions/transcripts for any audio/video exposition;
- no cursor-only information.

## 15. Homepage anti-patterns

Reject:

- opening with a giant moral score;
- opening with a procedural blob without a film;
- six equal cards explaining six features;
- red everywhere;
- Christian visual clichés such as parchment/cross textures used as decoration;
- dashboard UI before cinematic context;
- fake statistics at launch;
- endless scroll effects with no analytical meaning;
- auto-playing voiceover/music;
- presenting AI editorial artwork as an authentic movie frame;
- hiding basic navigation until a long intro is complete;
- making the home impossible to understand without WebGPU.

## 16. North-star homepage test

After one minute on the homepage, a new visitor should be able to answer:

1. What film is being demonstrated?
2. What is DeepMovieReview doing beyond reviewing whether content is offensive?
3. How does it analyze story and character?
4. How does it analyze relationships?
5. How does it identify the film's themes/messages?
6. How does it distinguish depiction from endorsement?
7. Where does the biblical judgment enter?
8. Why is the interface interactive rather than merely decorative?
9. How do I open a full analysis or find another film?

If the visitor only remembers “dark 3D Christian movie rating site,” the homepage has failed.