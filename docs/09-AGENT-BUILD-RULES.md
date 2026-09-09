# DeepMovieReview — Agent Build Rules

> Purpose: stop future coding/design agents from simplifying away the product's core distinctions or turning the project into an effect demo.

## 1. Product invariants

Any implementation agent must preserve:

- `Depiction ≠ Endorsement`;
- `Explanation ≠ Justification`;
- `Editorial ≠ Crowd`;
- `Moral Severity ≠ Film Quality`;
- `Popularity ≠ Biblical Authority`;
- scene-level evidence can support high-level verdicts;
- structured data survives presentation changes;
- accessibility and Lite mode retain all meaning.

If a schema/API/component proposal violates one of these, stop and redesign it.

## 2. Do not collapse the domain model for convenience

Forbidden shortcuts:

- one `moral_score` column for everything;
- storing all analysis as one Markdown blob;
- attaching scene timestamps only to the abstract film when multiple editions can exist;
- overwriting old rubric meanings in place;
- storing community votes in the same field as editorial judgments;
- treating every morally significant event as a “sin” when virtues, omissions, pressures, consequences and repentance also exist.

## 3. Version methodology-affecting data

Version at least:

- rubrics;
- score dimensions;
- moral taxonomy;
- editorial reviews;
- moral events where interpretation changes;
- community questions/options;
- aggregation algorithms.

Historical data must remain interpretable under the rules that produced it.

## 4. Visual implementation rule

Before adding an effect, identify its semantic primitive:

- FRAME;
- LENS;
- FRACTURE;
- TRACE;
- FOG;
- CORE;
- LIGHT.

If no primitive applies, document why a new primitive is necessary instead of silently adding another visual language.

## 5. GPU rule

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

## 6. No decorative overengineering

Do not add a dependency because it is fashionable.

For every major library, state its unique responsibility.

Example allocation:

- Motion: DOM/layout/gesture animation;
- Three.js: GPU/3D;
- TSL: new shader/material systems;
- GSAP: only bounded timeline/path/Flip use cases that are genuinely better than native/Motion alternatives.

Avoid overlapping animation ownership for the same element.

## 7. Route and transition rule

The content object should usually carry the transition.

Example: selected film artwork grows/recomposes into the film hero.

Avoid unrelated transition overlays unless the transition expresses a project concept such as Film Dissection.

## 8. Performance rule

No “works on developer RTX” acceptance criterion.

Every signature feature must be tested on:

- mid/low Android;
- iOS Safari;
- desktop Safari;
- Firefox;
- forced WebGL2;
- Lite mode;
- reduced motion.

Measure frame time, input responsiveness and asset cost.

## 9. Accessibility rule

WCAG 2.2 AA is the baseline.

In particular:

- dragging must have a non-drag alternative;
- custom cursor must never remove accessible focus;
- reduced motion must disable large parallax/camera travel;
- moving content must not block reading;
- target sizes must be adequate;
- canvas-only controls require DOM equivalents;
- contrast must be tested in the actual dark palette.

## 10. Editorial integrity rule

Do not automatically generate authoritative biblical verdicts from numeric rules.

AI/automation may assist:

- tagging;
- candidate extraction;
- scene indexing;
- draft summaries;
- asset generation;
- consistency checks.

But published normative conclusions require editorial review and explicit methodology version.

## 11. Community integrity rule

Never weight user contribution by agreement with editors.

Allowed trust signals concern behavior and contribution quality:

- verified account;
- accepted factual corrections;
- useful/well-reasoned contributions;
- anti-spam history;
- normal activity patterns.

Dissent is not abuse.

## 12. Privacy rule

Do not infer or expose sensitive personal traits from film ratings or dilemma answers.

Moral Mirror and recommendations describe observed site behavior only.

Never output “you are X% biblical” or equivalent spiritual/personality diagnosis.

## 13. Spoiler rule

Spoilers are structured data state, not only UI blur.

Any query/API/page composition must be able to filter claims/events/components by spoiler level.

## 14. Evidence rule

A high-level editorial claim should eventually be traceable to structured evidence.

Prefer:

`claim → scene/event → evidence → principle`

over untraceable assertions embedded only in prose.

## 15. AI image rule

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

## 16. Design review checklist

Before merging a new surface:

- Is the hierarchy clear without motion?
- Is red carrying meaning or merely style?
- Is the section calmer than the previous signature moment when appropriate?
- Can a user skip interaction and still understand it?
- Is typography readable at 200% zoom?
- Does touch have an intentional layout?
- Does the effect map to the visual grammar?
- Is there a measured cost budget?

## 17. Schema review checklist

Before merging a migration:

- Does it preserve editorial/community separation?
- Does it allow versions?
- Is identity stable and title-independent?
- Does it support film editions where timestamps matter?
- Can a claim point to evidence?
- Can a community suggestion exist without overwriting editorial truth?
- Does deletion/privacy behavior remain possible?
- Are aggregates separable from raw events?

## 18. Rating review checklist

Before publishing a numeric aggregate:

- Is sample size sufficient?
- Is confidence state shown?
- Is it raw or weighted?
- Can unusual voting distort it?
- Is the aggregation version recorded?
- Are editorial numbers being accidentally averaged with audience numbers?
- Is the precision justified?

## 19. Documentation rule

Large architectural decisions should update the relevant `/docs` file in the same PR.

If implementation intentionally diverges from these foundations, document:

- what changed;
- why;
- what evidence justified it;
- migration impact;
- version/date.

Do not let code become the only documentation of product philosophy.