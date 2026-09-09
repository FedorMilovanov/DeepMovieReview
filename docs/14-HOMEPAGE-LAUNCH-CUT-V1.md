# DeepMovieReview — Homepage Launch Cut v1

> Status: implementation-oriented experience specification  
> Date: 2026-09-09  
> Parent documents: `01-VISUAL-CONSTITUTION.md`, `11-HOMEPAGE-ARCHITECTURE.md`, `12-ANALYSIS-ONTOLOGY-V2.md`  
> Goal: reduce the 22-stage long-form homepage concept into a launchable 12-stage experience that demonstrates the whole product without becoming a methodology slideshow.

---

## 1. Launch-cut principle

The homepage is not the full review and not the full ontology.

Its job is to prove four things quickly:

1. **This is cinema-first.** The visitor should emotionally enter a film before seeing analytical machinery.
2. **The analysis is broader than morality.** Story, character, relationships, meaning and craft appear before the explicitly biblical verdict.
3. **The analysis is deeper than opinion.** Claims visibly connect to scenes, behavior, form and consequences.
4. **The site has a distinctive interactive language.** Living Frame, Relationship Trace, Narrative Permission, Scene Autopsy and Knowledge Fog should feel like one system rather than unrelated demos.

The launch homepage should therefore use **12 major stages**, not the full 22-stage research storyboard.

Recommended rhythm:

```text
CINEMA
  ↓
WHOLE-FILM BREADTH
  ↓
STORY / PEOPLE / RELATIONSHIPS
  ↓
MEANING / TEACHING
  ↓
NARRATIVE PERMISSION
  ↓
CRAFT SHAPES SYMPATHY
  ↓
SCENE AUTOPSY
  ↓
DIFFICULT DECISION
  ↓
BIBLICAL LENS
  ↓
SYNTHESIS
  ↓
ENTER THE LIBRARY
```

The page should feel shorter than its information depth suggests because several stages reuse the same cinematic asset and transition through state rather than hard section breaks.

---

## 2. Global shell

### Header

Desktop:

- transparent/near-black shell;
- logo left;
- `FILMS`, `EXPLORE`, `TOPICS`, `METHODOLOGY` center/right depending on final grid;
- search icon/control;
- no account UI until community exists;
- header initially low-opacity and gains contrast after the first content transition.

Mobile:

- logo;
- search;
- menu trigger;
- no permanent horizontal nav row.

### Grid

Desktop target:

- 12-column editorial grid;
- max content width around 1600–1760 px, fluid below;
- body/article widths remain narrower where reading matters;
- full-bleed GPU/media surfaces may escape the content grid but annotations return to it.

Mobile target:

- 4-column grid;
- 20–24 px outer gutter typical range;
- avoid forensic microcopy smaller than comfortably readable UI text.

### Background

- default `#030303` / near-black;
- local warmer black in Biblical Lens / Verdict;
- no permanent gradient wash;
- grain is subtle and should not materially harm compression or readability.

### Cursor

Desktop fine-pointer only:

- default: native-feeling light point / restrained ring;
- over Living Frame: `EXAMINE` / reticle;
- over relationship node: magnetic but never forceful;
- over Scene Autopsy: `TRACE` / evidence focus;
- over Decision: `WEIGH`;
- over normal text/control: return to conventional cursor behavior where clarity wins.

Touch:

- no fake cursor;
- explicit tap targets and state controls.

### Sound

Launch default: **silent**.

Sound is not required to prove the visual identity. If added later, it must be opt-in and semantic, never autoplay music.

---

# 3. Stage 01 — ARRIVAL / LIVING FRAME

## Purpose

Deliver the first emotional proof: this is a premium film experience, not a rating dashboard.

## Desktop composition

Initial viewport:

- near-total black;
- headline occupies roughly columns 2–8, vertically around 28–42% viewport;
- one short sub-line at lower contrast;
- the cinematic frame is initially absent or nearly invisible.

After first scroll/pointer intent:

- a 2.39:1 frame grows from darkness into roughly 68–76vw width;
- frame center sits slightly below optical center;
- headline moves/recomposes rather than simply fading away;
- tiny scene/timecode marks appear only after the image resolves.

Suggested copy direction:

```text
A FILM IS MORE THAN WHAT HAPPENS ON SCREEN.

It shows us what to admire, fear, excuse, desire — and believe.
```

Final copy may be Russian/localized; structure matters more than wording.

## Artwork

One featured-film master image, preferably editorially generated/original rather than a generic poster wall.

Requirements:

- 16:9 or wider master with 2.39:1 safe crop;
- strong foreground/midground/background separation;
- one clear human/emotional focus;
- dark-negative-space region for text if needed;
- avoid clutter and tiny faces;
- no embedded text.

Derived assets:

- desktop AVIF/WebP hero;
- mobile portrait/4:5 alternate composition;
- depth map;
- optional subject mask;
- optional foreground mask;
- low-resolution placeholder.

## GPU behavior

ULTRA/HIGH:

- depth-based micro-parallax;
- pointer-localized relighting;
- soft volumetric/depth haze only if it materially improves separation;
- maximum camera displacement intentionally small.

MEDIUM:

- 2.5D depth shift or segmented-plane parallax;
- no expensive lighting pass.

LITE/reduced motion:

- static responsive image;
- subtle opacity/contrast reveal;
- no meaning lost.

## Motion timing

- no forced loader;
- typography reveal: ~400–800 ms perceived sequence;
- frame emergence: ~900–1400 ms but interruptible by scroll;
- pointer response should feel immediate, not viscous.

## Exit transition

The frame does **not** disappear. It remains the carrier into Stage 02.

---

# 4. Stage 02 — THE WHOLE FILM / SIX LENSES

## Purpose

Correct the strongest possible misconception: DeepMovieReview is not merely a sin counter.

## Core labels

- `STORY`
- `PEOPLE`
- `RELATIONSHIPS`
- `IDEAS`
- `MORAL WORLD`
- `CRAFT`

## Desktop composition

- same Living Frame remains center-right or full-center;
- labels live mostly outside the image in the editorial grid;
- one active label at a time;
- active lens changes 2–4 visible analytical annotations inside/around the same frame.

Examples:

### STORY active

- inciting problem marker;
- cause/effect trace;
- central conflict phrase.

### PEOPLE active

- key character focus;
- `WANTS / FEARS / BELIEVES` annotations.

### RELATIONSHIPS active

- two character nodes;
- trust/control/loyalty trace.

### IDEAS active

- question + apparent claim.

### MORAL WORLD active

- consequence / normalization marker.

### CRAFT active

- point-of-view, music, framing, reaction-shot note.

## Interaction

Desktop:

- hover or keyboard focus switches active lens;
- scroll may auto-advance once through 2–3 lenses, then stop forcing state;
- user can revisit any lens.

Mobile:

- horizontal segmented control or stacked tabs;
- one lens rendered at a time;
- do not require swipe precision.

## Visual rule

No six rounded cards. No SaaS tab dashboard.

One film, six readings.

## Exit

The `STORY` lens remains selected and the frame expands/recomposes into Stage 03.

---

# 5. Stage 03 — STORY / WHAT HAPPENS AND WHY IT MATTERS

## Purpose

Show that the site can explain narrative structure before judging it.

## Homepage scope

Only spoiler-safe structure:

- premise;
- central conflict;
- first major disruption;
- what the protagonist wants;
- what stands in the way.

Do not expose the full ending on the homepage.

## Desktop composition

Left 4–5 columns:

- `STORY` label;
- 1–2 paragraph spoiler-safe synopsis;
- one central conflict statement.

Right 7–8 columns:

- restrained cinematic plot trace;
- 4–5 beats represented as changes in tension/state, not screenplay software cards.

Example:

```text
ORDINARY STATE
      ────────╮
              │ disruption
              ▼
         NEW PRESSURE
              │
              ▼
        CHOICE / COST
```

## Visual behavior

- TRACE is the main primitive;
- no 3D spectacle;
- timeline movement tied to scroll using CSS/native scroll-driven motion where appropriate;
- labels remain DOM text.

## Mobile

Timeline becomes vertical.

## Exit

One story beat expands into the people involved, creating Stage 04.

---

# 6. Stage 04 — PEOPLE + RELATIONSHIP OBSERVATORY

## Purpose

Show characters as persons in relationships, not isolated moral-score containers.

This combines two research stages to keep the homepage focused.

## Desktop composition

- two principal character portraits/stills occupy opposite sides of the frame;
- relationship trace runs between/through them;
- center contains only one changing relationship state at a time.

First state:

```text
WHAT A WANTS
WHAT B WANTS
```

Then:

```text
TRUST
TRUTHFULNESS
POWER
SACRIFICE
BOUNDARIES
REPAIR
```

Do not expose all dimensions as gauges.

Use 3–4 scene moments to show evolution.

## Example relationship trace

```text
TRUST
  ↓
WITHHELD TRUTH
  ↓
CONTROL
  ↓
FRACTURE
  ↓
CONFRONTATION
  ↓
REPAIR? / FURTHER BREAK
```

## Interaction

- hovering/focusing a trace point reveals one concise scene note;
- selecting a portrait shifts emphasis to that character's perspective;
- the relationship graph must still read in static form.

## Craft layer

Portraits may use depth separation but should not rotate like trading cards.

## Mobile

- characters stacked;
- trace vertical;
- tap trace point → inline note;
- no tiny line graph between far-separated screen regions.

## Exit

If the pilot film supports family/youth analysis, the trace zooms out to family/social context. Otherwise Stage 05 uses a different social-model example.

---

# 7. Stage 05 — FAMILY / PARENTS / YOUTH / SOCIAL FORMATION

## Purpose

Show a domain that conventional film databases rarely structure deeply and that directly supports future discovery surfaces.

## Homepage questions

Select only 3–4 based on featured film:

- Are parents present, wise, absent, indulgent, hypocritical or abusive?
- Do adults model the standards they demand?
- How does the young character respond to authority?
- Is peer pressure rewarded or resisted?
- What behavior is presented as “growing up”?
- What kind of adulthood does the story invite?

## Desktop composition

- one family/peer-group frame;
- vertical generational or authority lines;
- large editorial statement on the opposite side;
- 2–3 evidence anchors maximum.

Example:

```text
THE FILM DOES NOT SIMPLY SHOW REBELLION.
IT DEFINES WHAT MATURITY LOOKS LIKE.
```

## Analytical distinctions

Must preserve:

- rebellion ≠ healthy autonomy;
- parental authority ≠ automatic wisdom;
- explanation ≠ justification;
- representation ≠ prescription.

## Visual style

More editorial, less forensic.

This stage should provide a quiet beat between signature interactions.

---

# 8. Stage 06 — MEANING / WHAT IS THE FILM SAYING?

## Purpose

Demonstrate interpretation with evidence and uncertainty.

## Content structure

One theme/question only.

```text
THEME
Fatherhood

QUESTION
What does a father owe his child?

APPARENT NARRATIVE CLAIM
Presence without truth cannot sustain trust.

CONFIDENCE
High
```

A second, weaker counter-reading can appear below or on interaction.

## Desktop composition

- huge editorial typography;
- image recedes substantially;
- 45–70 character line lengths for prose;
- almost no GPU motion.

## Counterevidence

A `WHY WE THINK THIS` control reveals 2–3 supporting scene references.

A `WHAT COMPLICATES IT` control reveals counterevidence.

This is critical: the homepage must demonstrate that interpretation is argued, not merely asserted.

## Mobile

Same hierarchy, no visual downgrade needed.

---

# 9. Stage 07 — MESSAGE FIELD + NARRATIVE PERMISSION

## Purpose

Answer one of the product's most distinctive questions:

> What does the film repeatedly permit, punish, reward, normalize or celebrate?

## Model

Use separate concepts:

### Teaching signal

- explicit lesson;
- repeated pattern;
- admired model;
- comic normalization;
- reward;
- punishment/cost;
- ending resolution;
- unchallenged assumption.

### Narrative permission state

- `CONDEMNED`
- `COSTLY`
- `QUESTIONED`
- `UNCHALLENGED`
- `NORMALIZED`
- `REWARDED`
- `CELEBRATED`
- `AMBIGUOUS`

## Desktop visual

Avoid red/green moral traffic lights.

Use a horizontal semantic field with behavior/topic labels positioned according to state.

Example subjects:

```text
DISHONESTY        COSTLY
PARENTAL NEGLECT  UNCHALLENGED
LOYALTY           REWARDED
VENGEANCE         AMBIGUOUS
SACRIFICE         CELEBRATED
```

Each item can expand a short evidence trace back to a scene.

## Critical rules

- `UNCHALLENGED ≠ ENDORSED`;
- frequency alone does not imply normalization;
- aesthetic glamour alone does not prove endorsement;
- final state may differ by character/context;
- confidence is available when the reading is interpretive.

## Signature interaction

When user focuses a behavior label, its evidence traces appear through the surrounding field; unrelated items dim but do not vanish.

## Mobile

Use stacked state groups rather than a compressed horizontal map.

---

# 10. Stage 08 — FORM SHAPES SYMPATHY

## Purpose

Show that film craft is part of interpretation, not a separate “technical score” afterthought.

## Core question

> What does the film make us feel before it asks us to think?

## Single-scene demonstration

Use one scene and expose 3–4 formal mechanisms:

- camera proximity / point of view;
- music;
- editing rhythm;
- reaction shots;
- lighting/glamour;
- comic timing;
- performance charisma.

## Two distinct analytical concepts

### Empathy pressure

How strongly form invites us to understand, feel with or emotionally inhabit a character.

### Imitation pressure

How strongly form makes the character/lifestyle/action appear desirable, admirable or aspirational.

Do not equate empathy with endorsement.

## Visual composition

Desktop:

- large image/video-like still surface;
- one side contains formal controls/labels;
- as each label becomes active, the frame reveals what that technique is doing through annotation/light/crop—not by replaying copyrighted footage.

Example:

```text
CAMERA
Close subjective framing keeps us inside his fear.

MUSIC
Triumphant scoring pulls against the scene's moral cost.
```

## Motion

Calm and precise. No fake editing timeline UI.

---

# 11. Stage 09 — SCENE AUTOPSY

## Purpose

Deliver one of the homepage's strongest WOW moments and prove the evidence model.

## Entry

A normal cinematic frame fills the center.

CTA/state change:

`EXAMINE SCENE`

The user does not leave the page.

## Autopsy sequence

1. cinematic color state pauses;
2. foreground/subject/background separate slightly;
3. analytical light replaces atmospheric light;
4. timecode and scene ID appear;
5. 3–5 evidence anchors appear;
6. labels reveal sequentially:
   - `ACT`
   - `MOTIVE`
   - `KNOWLEDGE`
   - `PRESSURE`
   - `CONSEQUENCE`
7. TRACE lines connect evidence to one claim;
8. one counterevidence note is available.

## Desktop annotation architecture

Prefer DOM annotations anchored to image regions.

Use CSS anchor positioning where browser support is strong enough, with JS-measured fallback where required.

Annotations must never be baked into the image texture.

## GPU budget

This is a signature moment. It may temporarily become continuously rendered during active examination, then return to demand rendering when idle.

## Mobile

- no free-floating tiny annotations;
- tapping numbered anchors opens a bottom/inline evidence panel;
- image depth can be reduced to static layered parallax;
- all analytical content remains available.

## Reduced motion

- skip layer travel;
- switch image state instantly or with low-motion crossfade;
- show annotations and evidence normally.

---

# 12. Stage 10 — DIFFICULT DECISION / KNOWLEDGE FOG

## Purpose

Prove that the site's moral analysis considers what the character actually knew, not only the outcome known by the viewer.

## Layout

One decision only.

Desktop:

- character/decision focus center;
- Option A left;
- Option B right;
- known facts near the character;
- unknown/later facts in obscured depth;
- pressures/duties arranged below, not as decorative floating particles.

## Required modes

### WHAT THE CHARACTER KNEW THEN

Only facts available at decision time.

### WHAT THE VIEWER KNOWS NOW

Later facts/consequences revealed after explicit spoiler-safe action.

## Fog behavior

FOG represents epistemic limitation, not moral absolution.

Unknown facts should be visually present as obscured regions/labels, not deleted from the model.

## Moral-analysis summary

Below the interaction:

```text
AVAILABLE ALTERNATIVES
PRESSURE
DUTY
INTENTION
FORESEEABLE HARM
EDITORIAL JUDGMENT
CONFIDENCE
```

Only a subset is shown by default.

## Future community hook

Do not show empty voting at launch.

Later:

`WHAT WOULD YOU DO?` → vote first → community distribution second.

---

# 13. Stage 11 — BIBLICAL LENS + SYNTHESIS

## Purpose

Introduce the explicitly normative layer after the visitor has seen how the film was understood.

## Tone shift

- warmer black;
- ivory text;
- crimson largely disappears;
- reduced animation;
- no spectacle competing with Scripture/principle.

## Structure

```text
OBSERVATION
The story repeatedly treats deception as protective until its relational cost becomes unavoidable.

PRINCIPLE
Love and truthfulness cannot finally be separated without corruption of the relationship.

SCRIPTURE
[structured references]

APPLICATION
[careful application to the film]

QUALIFICATION
[where interpretation or application is disputed/limited]
```

## Important distinction

The homepage should demonstrate that the biblical layer may include:

- direct command/prohibition;
- broad biblical moral principle;
- wisdom judgment;
- disputed application;
- prudential judgment.

Do not flatten all five into identical certainty.

## Synthesis / verdict

The film receives a prose-first synthesis.

At most 4–5 compact facets visible:

- cinematic craft;
- story/character depth;
- thematic/relationship depth;
- moral/narrative stance;
- redemptive movement.

No single master “Christian score.”

## Motion

This should be one of the calmest parts of the homepage.

---

# 14. Stage 12 — ENTER THE LIBRARY / FEATURED + DISCOVERY

## Purpose

Convert comprehension into action.

The visitor now understands the product and should be offered real paths, not another manifesto.

## Launch state: tiny corpus

If only 1–3 films exist:

- one `FEATURED ANALYSIS` large;
- `NEXT ANALYSIS` / `IN PROGRESS` only if honest;
- methodology;
- topics demonstrated only where data exists;
- no fake “10,000 films analyzed” counters;
- no empty community surfaces.

## Mature state

When corpus supports it:

- `FILMS` index;
- Explore by question;
- Relationship topics;
- Meaning/themes;
- Narrative Permission;
- Dilemmas;
- Biblical principles;
- later audience signals.

## Discovery prompts

Examples:

- `What does cinema say about fatherhood?`
- `Marriage under betrayal`
- `Teen rebellion and absent parents`
- `Friendship that becomes complicity`
- `Truth vs loyalty`
- `Stories where revenge is visually glamorous but narratively costly`

## Transition to film page

Preferred:

- selected artwork becomes film-page hero through shared-element/native view transition or Motion layout continuity;
- GPU stage may preserve lighting/depth state where technically stable;
- transition must degrade to immediate navigation without loss of function.

## Footer

After discovery module:

- methodology/version;
- accessibility/experience settings;
- legal/editorial info;
- contact/contribution path when ready.

Nearly motionless.

---

# 15. Homepage emotional curve

The launch cut should feel like this:

| Stage | Energy | Role |
| --- | ---: | --- |
| 01 Living Frame | 9/10 | cinematic arrival |
| 02 Six Lenses | 7/10 | breadth reveal |
| 03 Story | 3/10 | comprehension |
| 04 Relationships | 6/10 | emotional/analytical depth |
| 05 Family/Youth | 3/10 | editorial quiet |
| 06 Meaning | 2/10 | intellectual stillness |
| 07 Narrative Permission | 6/10 | new analytical system |
| 08 Form/Sympathy | 4/10 | craft demonstration |
| 09 Scene Autopsy | 10/10 | signature spectacle |
| 10 Decision/Fog | 7/10 | interactive reasoning |
| 11 Biblical Lens | 2/10 | normative stillness |
| 12 Discovery | 4/10 | functional conversion |

Do not put Stage 09 and another 10/10 spectacle immediately adjacent.

---

# 16. What is deliberately NOT on the launch homepage

The following may exist in the ontology/film page but should not be prominent on launch home:

- full Moral Core procedural sculpture;
- full Moral Timeline;
- detailed sin/virtue inventory;
- many numerical ratings;
- community score distribution;
- audience polarization;
- user profile/taste features;
- large catalogue counters;
- compare mode;
- exhaustive biblical methodology.

Reason: the homepage should demonstrate depth without exposing the entire instrument panel.

Moral Core can re-enter later when there are enough films for comparison and when its mapping is calibrated.

---

# 17. Launch copy principles

Homepage copy should avoid three tones:

1. **culture-war outrage**;
2. **parental warning label**;
3. **vague Awwwards poetry that says nothing**.

Preferred tone:

- concise;
- intellectually serious;
- concrete;
- cinematic;
- confident but evidence-aware.

Good copy asks precise questions:

- What does this film believe love requires?
- Who pays for this character's freedom?
- What kind of adulthood does this story admire?
- Does the film condemn revenge, or merely show its cost?
- Why do we sympathize with someone we know is wrong?

Avoid:

- “Discover the soul of cinema.”
- “Where faith meets film.”
- “A revolutionary moral journey.”

These are too generic.

---

# 18. Accessibility acceptance criteria

The homepage is acceptable only if:

- all essential text/links exist in semantic DOM;
- all lens states are keyboard reachable;
- Scene Autopsy has a non-spatial evidence list;
- Relationship Trace has a linear reading order;
- Decision Chamber has form/control equivalents to spatial interactions;
- reduced-motion mode removes large camera/parallax travel;
- custom cursor is disabled where it harms clarity and entirely absent on touch;
- color is never the sole carrier of moral/narrative state;
- focus states remain visible against the dark palette;
- page remains understandable with GPU disabled;
- 200% zoom does not destroy reading or controls.

---

# 19. Performance acceptance criteria

Initial targets must be validated by prototype rather than treated as immutable numbers, but the homepage should be built under these principles:

- LCP content and hero still must appear before premium depth/GPU enhancement is ready;
- only Stage 01–02 assets are priority-loaded;
- Stage 04+ media is lazy/predictively loaded;
- Scene Autopsy assets load shortly before Stage 09, not at page start;
- Decision/Fog assets load only when approaching Stage 10;
- one persistent GPU stage rather than per-section canvases;
- demand rendering while idle;
- continuous render only during bounded active interactions;
- cap DPR and dynamic quality;
- Lite/mobile payload materially smaller than desktop Ultra;
- no section may require a large library solely for one trivial fade/scroll effect.

Implementation should consult current Three.js WebGPURenderer guidance, React Three Fiber performance guidance, Motion/native View Transition behavior and native CSS scroll-driven animation support.

---

# 20. Launch homepage data dependency map

Each stage must be able to render from structured data.

| Stage | Minimum data |
| --- | --- |
| 01 | featured film + hero asset manifest |
| 02 | six-lens preview claims |
| 03 | spoiler-safe synopsis + story beats |
| 04 | characters + relationship + relationship events |
| 05 | family/youth/social-model observations |
| 06 | theme/question/narrative claim + evidence/counterevidence |
| 07 | teaching signals + narrative permission assessments |
| 08 | craft observations + empathy/imitation pressure |
| 09 | scene + evidence anchors + analytical claim |
| 10 | decision + facts + options + pressures + spoiler states |
| 11 | biblical principle + Scripture refs + application + synthesis |
| 12 | published analyses + discovery topics |

The homepage must not own duplicate hand-written copies of canonical analysis if the film review already stores the structured source.

---

# 21. First prototype cut

Before building the whole homepage, prototype these four modules independently:

1. **Living Frame** — prove image/depth/light and quality fallback.
2. **Relationship Observatory** — prove structured relation changes are understandable without a dashboard.
3. **Narrative Permission Field** — prove states and evidence can be understood without moral traffic-light simplification.
4. **Scene Autopsy** — prove the signature forensic interaction improves comprehension on desktop and mobile.

Only after these pass should they be integrated into the 12-stage page.

---

# 22. Definition of done for Homepage Launch Cut v1

The launch homepage is conceptually successful if a first-time visitor can answer, without reading methodology docs:

1. What kind of site is this?
2. Does it analyze more than objectionable content?
3. Can it explain the plot and characters?
4. Does it examine relationships/family/youth behavior?
5. Can it distinguish what a film shows from what it teaches or normalizes?
6. Does filmmaking craft itself enter the analysis?
7. Are moral judgments connected to evidence?
8. Is the biblical layer reasoned rather than decorative?
9. Can I enter a full film analysis quickly?
10. Does the page still work if I ignore every 3D interaction?

If any answer is unclear, revise hierarchy before adding more effects.
