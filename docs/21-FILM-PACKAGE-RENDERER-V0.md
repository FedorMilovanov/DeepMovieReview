# DeepMovieReview — Film Package Renderer v0

> Status: shell architecture  
> Purpose: prove that films are structured content packages rendered by one reusable route.

## 1. Principle

A film should be added primarily by supplying validated data and assets, not by cloning route code.

The renderer must preserve:

- optional analytical modules;
- stable section IDs;
- spoiler-aware visibility;
- semantic DOM;
- mobile/reduced-motion compatibility;
- film-specific art direction without redefining module semantics.

## 2. Film package

Current root contract:

```ts
type FilmPackage = {
  schemaVersion: 1;
  film: ShellFilm;
  evidence?: EvidenceRecord[];
  modules: FilmModule[];
};
```

`schemaVersion` belongs to the package format, not the editorial methodology version. Those may diverge later and must remain separate concepts.

## 3. Current module union

The reusable renderer now supports the full Phase 0.7 foundation set:

- Story;
- Characters;
- Relationship;
- Family / Youth / Social Formation;
- Meaning;
- Teaching Signals;
- Narrative Permission;
- Craft / Form;
- Scene Autopsy;
- Decision / Knowledge Fog;
- Moral Analysis;
- Biblical Synthesis;
- Final Synthesis;
- Sources / Method.

Not every film must contain every optional analytical slice. Published packages are validated against stronger evidence, source and referential-integrity rules before they can enter the registry.

## 4. Discriminated union

Every module has:

- stable `id`;
- discriminating `kind`;
- `heading`;
- optional `eyebrow`;
- minimum `spoilerLevel`.

The renderer uses an exhaustive switch over the typed union.

A new module kind should therefore produce a TypeScript failure until the registry learns how to render it.

## 5. Spoiler behavior

One projection boundary in `src/lib/film-module-projection.ts` removes both root modules and protected nested records before presentation. The outline and renderer consume the same projected array.

Granular filtering currently covers:

- story beats;
- relationship events;
- Narrative Permission assessments.

This allows a spoiler-safe Relationship Observatory, for example, without requiring an entirely separate relationship module.

## 6. Optional modules

A film package may omit irrelevant modules.

The second fixture intentionally contains only Story + Meaning. It exists to verify:

- route code does not change;
- missing modules do not leave placeholders;
- the index automatically discovers the package;
- spoiler handling still works.

Never force every film into every analytical module for visual symmetry.

## 7. Route contract

`/films/[slug]` now:

1. resolves the package by slug;
2. parses spoiler state;
3. renders shared Film Hero metadata;
4. renders spoiler control/status;
5. passes package modules into `FilmModuleList`.

The route does not manually author Story/Character/Relationship sections.

## 8. Registry structure

Current code:

- `src/lib/film-package.ts` — data types;
- `src/data/film-packages.ts` — temporary fixtures/registry;
- `src/components/film-modules/module-components.tsx` — module views;
- `src/components/film-modules/film-module-renderer.tsx` — exhaustive registry/list;
- `src/styles/film-modules.css` — shared module layout.

The fixture registry is temporary. A database/CMS adapter should later project into the same `FilmPackage` boundary.

## 9. Editorial boundary

React components must not become the canonical location for editorial claims.

Real Film 001 content should originate from structured records and be projected into module props.

Film-specific copy may vary freely, but the renderer should not contain statements about a particular movie.

## 10. Art direction boundary

A film may provide:

- hero art;
- depth/mask manifests;
- scene artwork;
- character artwork;
- tonal/accent metadata;
- optional signature visual moments.

Those may change the presentation *inside* known semantic boundaries.

They must not turn `Relationship` into a different domain concept or make hidden evidence inaccessible to non-GPU users.

## 11. Next validation

Before calling the renderer production-ready:

- integrate the design-system branch;
- add first-class Family/Youth module only if pilot needs it;
- add Decision/Knowledge Fog when pilot proves a real dilemma;
- add sources/method/version module;
- validate stable anchors and deep-link spoiler gating;
- test two genuinely different real films before freezing schema v1.
