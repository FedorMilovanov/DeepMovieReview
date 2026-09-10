# DeepMovieReview — Phase 0.5 App Shell

> Status: active implementation phase  
> Date: 2026-09-10  
> Purpose: define the boundary between building the platform and producing individual film analyses.

## 1. Decision

Build the **platform shell first**, then load deep film analyses into it as structured content packages.

This does **not** mean building a visually empty generic CMS before learning from content. The shell must encode the domains already proven by the foundation work, while the first real film is postponed until the reusable surfaces and contracts exist.

The implementation order is:

```text
FOUNDATION / ONTOLOGY
        ↓
PLATFORM APP SHELL
        ↓
VISUAL RUNTIME + SIGNATURE COMPONENTS
        ↓
REUSABLE FILM PAGE SHELL
        ↓
EDITORIAL DATA / ASSET INGEST CONTRACTS
        ↓
FIRST FULL FILM ANALYSIS
        ↓
CALIBRATION + REFINEMENT
        ↓
MORE FILMS / CATALOG SCALE
```

## 2. What belongs to the platform shell

The shell owns reusable product behavior:

- application layout;
- navigation;
- homepage composition;
- film index route;
- film detail route boundaries;
- spoiler-state architecture;
- accessibility;
- reduced-motion policy;
- quality-tier / GPU capability state;
- design tokens;
- typography/grid system;
- shared transitions;
- content projection/adapters;
- evidence-anchor primitives;
- relationship-trace component contract;
- Narrative Permission component contract;
- Scene Autopsy component contract;
- Decision/Knowledge Fog component contract;
- Biblical synthesis presentation contract;
- error/not-found/loading states;
- future account/community attachment points without implementing community now.

These are platform responsibilities because every later film may reuse them.

## 3. What does NOT belong to the shell

Do not invent real editorial conclusions merely to make the shell look complete.

The shell must not contain authoritative claims about a real film unless they come from a reviewed film package.

Do not bake into shared components:

- film-specific themes;
- film-specific moral judgments;
- real Scripture applications;
- final relationship conclusions;
- exact scene timestamps;
- actual actor/character artwork;
- bespoke shaders that only make sense for one film;
- one film's data shape as if it were universal.

Temporary fixtures must remain explicitly marked as fixtures.

## 4. Why film production comes later

A complete film is a separate major workstream. One serious film package may require:

### Editorial

- canonical edition selection;
- spoiler-safe and full synopsis;
- story structure;
- character analysis;
- relationship analysis;
- family/youth/social-formation analysis;
- themes/questions/claims/counterevidence;
- filmmaking craft analysis;
- Teaching Signals / Narrative Permission;
- moral events;
- difficult decisions;
- psychological analysis;
- biblical principles and applications;
- final synthesis;
- citations/evidence verification;
- review/versioning.

### Visual production

- hero art direction;
- generated/editorial master images;
- mobile and crop-safe compositions;
- depth maps;
- segmentation masks;
- Scene Autopsy asset preparation;
- optional character/relationship imagery;
- metadata/provenance;
- compression and GPU variants.

### Structured data

- stable IDs;
- edition/timestamps;
- scenes;
- characters;
- relationships/events;
- claims/evidence;
- spoiler levels;
- taxonomy links;
- score/rubric versions;
- asset manifests.

Therefore the first film should enter once the machine is capable of receiving this package cleanly.

## 5. Shell implementation sequence

### Shell A — semantic foundation — CURRENT

Required:

- Next.js App Router project;
- root layout;
- navigation/footer;
- 12-stage homepage in semantic DOM/CSS;
- `/films`;
- `/films/[slug]`;
- typed structural fixture;
- responsive composition;
- reduced-motion baseline;
- CI typecheck/lint/build gate.

No Three.js dependency is required at this step.

### Shell B — visual foundation

After Shell A is stable:

- real design token refinement;
- final font strategy;
- cinematic master layout system;
- focus/cursor policy;
- native/shared transitions;
- lightweight scroll-linked behaviors;
- loading/skeleton states;
- image/asset component contract.

### Shell C — GPU/runtime foundation

Only after semantic structure remains strong without canvas:

- persistent GPU stage;
- capability detection;
- `ULTRA / HIGH / MEDIUM / LITE` quality tiers;
- demand rendering;
- visibility/offscreen suspension;
- runtime downgrade;
- reduced-motion integration;
- resource lifecycle instrumentation.

### Shell D — signature reusable interactions

Prototype independently, then integrate only if useful:

1. Living Frame;
2. Six Lenses;
3. Relationship Observatory;
4. Narrative Permission Field;
5. Scene Autopsy;
6. Decision Chamber / Knowledge Fog;
7. shared film-media transition.

Moral Core and full Moral Timeline can follow once the data model is calibrated against real films.

### Shell E — reusable film page

Create a film-page component grammar capable of rendering a real package without bespoke route code.

At minimum:

- Hero;
- Story/Synopsis;
- Character;
- Relationship;
- Meaning;
- Narrative Permission;
- Craft;
- Scene Autopsy;
- Decision if present;
- Moral/Biblical sections;
- Final Synthesis;
- source/method/version metadata.

Not every film must use every component.

## 6. Fixture policy

A fixture exists only to prove shape and interaction.

Requirements:

- `status: fixture` or equivalent;
- no real-world film judgment implied;
- stable IDs where useful;
- typed against the same projection contracts intended for production;
- easy replacement by the first canonical film package;
- no component-local hidden data source.

The fixture should gradually become more domain-shaped, not more editorially elaborate.

## 7. Database/CMS timing

Do not choose a large CMS or freeze the production database before the reusable shell and one canonical film fixture reveal actual authoring needs.

However, do preserve stable domain boundaries now so a future database maps cleanly onto:

- films/editions;
- scenes;
- characters;
- relationships/events;
- themes/questions/claims;
- teaching signals / Narrative Permission;
- craft observations;
- moral events;
- decisions/facts;
- biblical principles;
- evidence;
- assets;
- versions.

The first real film becomes the decisive test before final schema freeze.

## 8. Deployment order

Recommended environments:

1. PR preview — every code PR;
2. stable staging/main preview — after green CI;
3. production domain — only when shell identity and basic content are ready for public viewing.

Do not treat production deployment as evidence that a feature is production-quality.

## 9. Definition of shell-ready

The platform is ready to begin the first full film when all are true:

- homepage communicates whole-film scope without explanatory coaching;
- `/films` and `/films/[slug]` are stable;
- mobile layout is intentional;
- reduced-motion path is complete;
- Lite/no-GPU experience is visually credible;
- at least Relationship Observatory, Narrative Permission and Scene Autopsy have usable reusable implementations;
- content is driven through typed projections rather than component-local strings;
- evidence anchors have a stable representation;
- one film package can replace the fixture without redesigning the homepage;
- CI/build gates are green;
- visual runtime has a measured performance budget.

## 10. Principle for future work

**Do not make each film rebuild the site.**

A film may have a unique visual mood and selected bespoke moments, but the majority of the analytical experience should be composed from a durable platform grammar.

At the same time:

**Do not make the platform flatten every film into the same dashboard.**

The shell supplies structure; each film supplies its own visual art direction, evidence, relationships, themes, rhythm and interpretive depth.
