# DeepMovieReview — Agent Build Rules

> Purpose: stop future coding/design agents from simplifying away the product's core distinctions, collapsing whole-film analysis into a sin counter, or turning the project into an effect demo.

## 1. Product invariants

Any implementation agent must preserve:

- `Depiction ≠ Endorsement`;
- `Explanation ≠ Justification`;
- `Representation ≠ Prescription`;
- `Editorial ≠ Crowd`;
- `Moral Severity ≠ Film Quality`;
- `Popularity ≠ Biblical Authority`;
- the film is analyzed as story/people/relationships/ideas/craft before final normative synthesis;
- relationships, themes/messages and social models can be first-class structured data;
- scene-level evidence can support high-level verdicts;
- structured data survives presentation changes;
- accessibility and Lite mode retain all meaning.

If a schema/API/component proposal violates one of these, stop and redesign it.

## 2. Do not collapse the domain model for convenience

Forbidden shortcuts:

- one `moral_score` column for everything;
- one `worldview_score` column standing in for argued claims;
- one `relationship_score` or `family_score` replacing actual analysis;
- storing all analysis as one Markdown blob;
- storing plot, character, relationship and theme observations only as prose if the product needs to query/compare them later;
- attaching scene timestamps only to the abstract film when multiple editions can exist;
- overwriting old rubric meanings in place;
- storing community votes in the same field as editorial judgments;
- treating every morally significant event as a “sin” when virtues, omissions, pressures, consequences and repentance also exist;
- treating protagonist == role model;
- treating unpunished == endorsed;
- treating represented == prescribed.

## 3. Whole-film analysis rule

Before building a film page, identify which of these domains are materially relevant:

- STORY;
- PEOPLE / CHARACTERS;
- RELATIONSHIPS;
- FAMILY / PARENTS / YOUTH / AUTHORITY;
- THEMES / NARRATIVE QUESTIONS;
- NARRATIVE CLAIMS / WORLDVIEW;
- TEACHING SIGNALS / NARRATIVE PERMISSION;
- CRAFT / FORM;
- MORAL EVENTS / DECISIONS;
- BIBLICAL PRINCIPLES.

Not every film uses every module. But no agent may assume the moral-event branch is the entire product.

## 4. Relationship-analysis rule

Relationships are not just collections of sex/romance content warnings.

When central, model:

- trust/honesty;
- responsibility;
- commitment/fidelity where applicable;
- power/boundaries;
- sacrifice;
- conflict;
- repair/reconciliation;
- enabling/manipulation;
- relationship arc across scenes.

Keep descriptive observation separate from normative assessment.

## 5. Family / youth rule

Do not reduce parent/teen analysis to `appropriate for children`.

Potential structured concerns include:

- adult presence/responsibility;
- authority quality;
- parental modeling/hypocrisy;
- boundaries/discipline;
- peer pressure;
- rebellion vs healthy autonomy;
- maturation;
- risky behavior and consequences;
- adult role models;
- the film's picture of adulthood.

Avoid assuming youth independence is automatically rebellion or that adult authority is automatically legitimate.

## 6. Message / teaching rule

Do not infer `the film teaches X` from one line of dialogue.

Message claims can draw from:

- explicit lesson;
- recurring pattern;
- role model/cautionary model;
- reward/cost;
- normalization;
- admiration/romanticization;
- humor/ridicule;
- ending resolution;
- counterevidence.

`UNCHALLENGED ≠ ENDORSED` remains a mandatory caution.

## 7. Craft-as-evidence rule

Camera, music, editing, performance, production design, humor and genre can be evidence for sympathy/meaning/stance.

Do not separate `film craft` so completely from analysis that it cannot support interpretive claims.

At the same time:

- empathy ≠ endorsement;
- visual beauty ≠ moral approval;
- satire requires contextual reading.

## 8. Version methodology-affecting data

Version at least:

- rubrics;
- score dimensions;
- taxonomies;
- editorial reviews;
- major story/character/relationship interpretations when revised materially;
- moral events;
- narrative claims;
- teaching signals / narrative permissions where methodology changes;
- community questions/options;
- aggregation algorithms.

Historical data must remain interpretable under the rules that produced it.

## 9. Visual implementation rule

Before adding an effect, identify its semantic primitive:

- FRAME;
- LENS;
- FRACTURE;
- TRACE;
- FOG;
- CORE;
- LIGHT;
- FIELD only if the project formally adopts it across multiple semantic uses.

If no primitive applies, document why a new primitive is necessary instead of silently adding another visual language.

## 10. GPU rule

GPU is enhancement, not content ownership.

Meaningful text, navigation, ratings, evidence and conclusions stay available in semantic DOM.

Every signature GPU module needs:

- load boundary;
- dispose lifecycle;
- WebGL2 or Lite fallback;
- reduced-motion behavior;
- touch behavior;
- keyboard-accessible functional equivalent where interaction matters;
- performance measurement.

## 11. No decorative overengineering

Do not add a dependency because it is fashionable.

For every major library, state its unique responsibility.

Example allocation:

- Motion: DOM/layout/gesture animation;
- Three.js: GPU/3D;
- TSL: new shader/material systems;
- GSAP: only bounded timeline/path/Flip use cases that are genuinely better than native/Motion alternatives.

Avoid overlapping animation ownership for the same element.

## 12. Route and transition rule

The content object should usually carry the transition.

Example: selected film artwork grows/recomposes into the film hero.

Avoid unrelated transition overlays unless the transition expresses a project concept such as Film Dissection.

## 13. Performance rule

No `works on developer RTX` acceptance criterion.

Every signature feature must be tested on:

- mid/low Android;
- iOS Safari;
- desktop Safari;
- Firefox;
- forced WebGL2;
- Lite mode;
- reduced motion.

Measure frame time, input responsiveness and asset cost.

## 14. Accessibility rule

WCAG 2.2 AA is the baseline.

In particular:

- dragging must have a non-drag alternative;
- custom cursor must never remove accessible focus;
- reduced motion must disable large parallax/camera travel;
- moving content must not block reading;
- target sizes must be adequate;
- canvas-only controls require DOM equivalents;
- contrast must be tested in the actual dark palette;
- analytical distinctions cannot rely on color alone.

## 15. Editorial integrity rule

Do not automatically generate authoritative biblical verdicts from numeric rules.

AI/automation may assist:

- tagging;
- candidate plot/scene extraction;
- character/relationship candidate extraction;
- draft summaries;
- theme/question candidates;
- asset generation;
- consistency checks.

But published interpretive and normative conclusions require editorial review and explicit methodology version.

## 16. Community integrity rule

Never weight user contribution by agreement with editors.

Allowed trust signals concern behavior and contribution quality:

- verified account;
- accepted factual corrections;
- useful/well-reasoned contributions;
- anti-spam history;
- normal activity patterns.

Dissent is not abuse.

## 17. Privacy rule

Do not infer or expose sensitive personal traits from film ratings or dilemma answers.

Moral Mirror and recommendations describe observed site behavior only.

Never output `you are X% biblical` or equivalent spiritual/personality diagnosis.

## 18. Spoiler rule

Spoilers are structured data state, not only UI blur.

Any query/API/page composition must be able to filter:

- story summaries;
- plot beats;
- character arcs;
- relationship arcs;
- themes/claims;
- teaching signals;
- moral events;
- decisions;
- ending/worldview conclusions.

## 19. Evidence rule

A high-level editorial claim should eventually be traceable to structured evidence.

Depending on claim type, prefer chains such as:

```text
narrative claim → scene/ending/craft evidence
relationship claim → relationship events → scenes
teaching signal → recurring pattern / reward / framing / ending
moral claim → scene/event → evidence → principle
```

Avoid untraceable assertions embedded only in prose.

## 20. AI image rule

Generated art is a production asset, not a substitute for design.

For important images, consider:

- depth map;
- masks;
- crop-safe variants;
- dark text-safe variant;
- compression;
- metadata/provenance;
- mobile composition.

Do not animate every generated image the same way.

Do not present invented AI editorial artwork as an authentic movie still.

## 21. Homepage rule

The homepage must not open with a giant moral score or abstract Moral Core before establishing the film.

Preferred sequence starts with:

`FILM → STORY → PEOPLE → RELATIONSHIPS → IDEAS → MORAL WORLD → BIBLICAL LENS`.

The homepage must communicate that DeepMovieReview analyzes more than objectionable content.

See `11-HOMEPAGE-ARCHITECTURE.md`.

## 22. Design review checklist

Before merging a new surface:

- Is the hierarchy clear without motion?
- Is the analysis domain obvious: story, character, relationship, theme, craft, moral or biblical?
- Is red carrying meaning or merely style?
- Is the section calmer than the previous signature moment when appropriate?
- Can a user skip interaction and still understand it?
- Is typography readable at 200% zoom?
- Does touch have an intentional layout?
- Does the effect map to the visual grammar?
- Is there a measured cost budget?

## 23. Schema review checklist

Before merging a migration:

- Does it preserve editorial/community separation?
- Does it allow versions?
- Is identity stable and title-independent?
- Does it support film editions where timestamps matter?
- Can a claim point to evidence?
- Can relationship/theme/message data be queried if the feature needs it?
- Can a community suggestion exist without overwriting editorial truth?
- Does deletion/privacy behavior remain possible?
- Are aggregates separable from raw events?

## 24. Rating review checklist

Before publishing a numeric aggregate:

- Is sample size sufficient?
- Is confidence state shown?
- Is it raw or weighted?
- Can unusual voting distort it?
- Is the aggregation version recorded?
- Are editorial numbers being accidentally averaged with audience numbers?
- Is the precision justified?
- Would prose/category be more honest than a number?

## 25. Documentation rule

Large architectural decisions should update the relevant `/docs` file in the same PR.

If implementation intentionally diverges from these foundations, document:

- what changed;
- why;
- what evidence justified it;
- migration impact;
- version/date.

Do not let code become the only documentation of product philosophy.