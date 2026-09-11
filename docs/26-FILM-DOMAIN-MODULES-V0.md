# DeepMovieReview — Film Domain Modules v0

> Status: pre-Film-001 renderer contract  
> Purpose: close the gap between the homepage analytical promise and the reusable film package before real editorial production begins.

## 1. Principle

A real film analysis must not require route-specific JSX simply because it uses another analytical domain.

The film package is responsible for selecting modules. The route and renderer are responsible for rendering any registered module kind exhaustively and applying the same spoiler policy.

This version extends the renderer with four domains already present in the canonical analysis/data contracts:

- Family / Youth / Social Formation;
- Teaching Signals;
- Craft / Form / Audience Pressure;
- Decision / Knowledge Fog.

It also deepens the existing Characters module with optional belief, self-deception and arc fields without creating a separate diagnostic psychology taxonomy.

## 2. Family / Youth / Social Formation

This module is optional. Not every film needs it.

Use it when the film materially depicts formation through parents, adults, peers, authority, discipline, rebellion, responsibility, sexual formation, substance risk, work/study, maturity or role models.

Each observation has:

- a domain;
- a subject;
- a claim;
- optional counterevidence;
- confidence;
- spoiler level.

The module must not collapse into a generic parental advisory checklist. It analyzes formation, example and responsibility in the narrative.

## 3. Teaching Signals

A film can teach without stating a lesson in dialogue.

Supported signals include:

- explicit lesson;
- repeated pattern;
- role model / anti-model;
- reward;
- cost or punishment;
- comic normalization;
- romanticization;
- ridicule;
- unchallenged assumption;
- ending resolution;
- genre convention;
- formal glamour.

Every signal carries an interpretation, optional counterevidence, confidence and spoiler level.

Teaching Signals remain separate from Narrative Permission. A reward is evidence; it does not automatically prove celebration. Formal glamour can coexist with propositional condemnation.

## 4. Craft / Form / Audience Pressure

Craft is analytical evidence, not a decorative score for cinematography.

A craft observation records:

- mechanism, such as point of view, camera distance, movement, lighting, music, editing, performance or production design;
- what is formally observable;
- the interpretive effect attributed to it;
- confidence;
- spoiler level.

Audience pressure is modeled separately as empathy or imitation pressure. High empathy pressure must never be treated as automatic moral endorsement.

## 5. Decision / Knowledge Fog

Difficult decisions must be judged from the information and options available at decision time rather than from audience hindsight.

The module separates:

- options actually available then;
- facts known to the character;
- facts reasonably inferable;
- facts unknown at the time;
- facts revealed later;
- pressures;
- duties or goods in tension;
- optional editorial judgment and qualification.

For real-film packages, each option, fact, pressure and duty/good must carry canonical evidence support. These are not free-form planning notes: they are claims about the decision-time situation and must resolve through the evidence ledger to a verified scene/timestamp in the locked edition. The editorial judgment uses its own support graph.

This structure allows the analysis to say that an act was wrong while still taking coercion, fear, incomplete knowledge or genuine competing duties seriously.

## 6. Character depth without diagnosis

Characters can now optionally record:

- `believes`;
- `selfDeception`;
- `arcSummary`;
- `roleInArgument`.

These are narrative interpretations, not clinical diagnoses. A separate psychology taxonomy should be added only after real-film calibration demonstrates that it is useful and reliably evidence-based.

## 7. Spoiler contract

Every new analytical record that can disclose plot information carries a spoiler level where practical.

The module renderer filters nested records with the same global spoiler grammar used by the route. Editorial judgment in Decision can remain hidden even while the decision setup is visible.

A module must not reveal later knowledge merely because its outer section is visible.

## 8. Fixture policy

The pilot package exercises the new module kinds using synthetic structural copy only.

Fixture statements:

- are not a real film review;
- do not carry moral or biblical authority;
- exist to prove type safety, layout, spoiler behavior and optional composition;
- must be replaced with evidence-backed records for Film 001.

The second fixture intentionally remains sparse. Its purpose is to prove that a film does not have to instantiate every module kind.

## 9. Exit criteria before Film 001

- the renderer switch is exhaustive for every registered module kind;
- the pilot fixture renders all core domains without route-specific branches;
- nested spoiler filtering works for new domains;
- mobile layouts remain readable without horizontal analytical tables;
- Family/Youth is optional rather than mandatory;
- Teaching Signals remain distinct from Narrative Permission;
- Craft sympathy does not imply endorsement;
- Decision separates hindsight from knowledge at decision time;
- typecheck, lint and production build pass on the exact PR head.
