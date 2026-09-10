# DeepMovieReview — Film Outline, Deep Links & Sources v0

> Status: reusable film-shell contract  
> Purpose: make long-form analyses addressable, spoiler-aware and transparent before Film 001.

## 1. Stable section IDs

Every rendered film module owns a stable `id` that becomes its DOM anchor.

Requirements:

- IDs come from structured film-package data;
- IDs do not depend on translated/display heading text;
- ordinary editorial copy changes must not break inbound links;
- duplicate IDs are invalid within a film package.

Future scene/evidence entities may expose deeper anchors, but module IDs are the first stable public layer.

## 2. Spoiler-aware outline

The film outline is derived from the same visible-module projection used by the renderer.

Therefore:

- a hidden spoiler module is absent from the outline;
- outline links preserve the current spoiler query;
- the outline cannot reveal the existence/title of a hidden ending module by accident;
- raising spoiler permission can reveal additional outline entries.

Do not maintain a separate hand-authored table of contents.

## 3. Deep-link behavior

Current visible-module links use:

```text
/films/<slug>?spoilers=<level>#<module-id>
```

or a clean URL without the query parameter for `NONE`.

Future entity-level deep links should follow the same principle.

A link targeting content above the current permission must not silently reveal it; the future deep-link gate should explain the required spoiler level and allow an explicit escalation.

## 4. Sources & Method module

Every production film should eventually contain a `sources-method` module.

Current fields:

- methodology version;
- editorial revision;
- analyzed film edition;
- optional last-reviewed date;
- typed source records.

Source kinds:

- `film-edition`;
- `scripture`;
- `reference`;
- `editorial-note`.

This module is transparency infrastructure, not a conventional bibliography dump.

## 5. Film edition identity

The analyzed edition matters because:

- cuts may differ;
- timestamps differ;
- dialogue/scenes can change;
- dubbed/subtitled editions may affect wording;
- streaming masters can change over time.

A production film package should identify enough of the edition to make scene/timestamp claims reproducible.

Future edition metadata may include:

- distributor/platform;
- region;
- runtime;
- cut/version name;
- release/master date;
- language/subtitle track;
- checksum or other internal ingest identifier when practical.

## 6. Methodology version vs package schema

Keep these separate:

- `FilmPackage.schemaVersion` — technical data contract;
- `methodologyVersion` — editorial/rubric rules;
- `editorialRevision` — revision of this specific film analysis.

A schema migration does not necessarily mean the film was re-evaluated. A methodology revision may require re-analysis even if the technical schema stays unchanged.

## 7. Corrections

Future corrections should record whether a change is:

- factual/metadata;
- timestamp/edition;
- interpretive claim;
- moral classification;
- biblical application;
- source/citation;
- visual asset/evidence anchor.

Public revision history can remain concise while internal audit history stays complete.

## 8. Sources in the renderer

The module view presents source metadata as semantic DOM.

Rules:

- external references may be links;
- non-linkable internal/editorial records remain readable text;
- source labels must remain meaningful without icons;
- citations/evidence deeper in the future film page should reference stable source IDs rather than duplicating source metadata.

## 9. Search and sharing

Stable module URLs allow future:

- search results landing directly on Meaning, Relationship or Scene Autopsy;
- editorial links between films;
- Dilemma/Relationship Atlas links;
- community counterarguments targeting a specific claim/module;
- share cards for a specific analytical section.

Search must still honor spoiler state when generating result snippets.

## 10. Exit criteria before Film 001

- film outline is generated from renderer data;
- hidden modules never leak through outline labels;
- every production module has a stable ID;
- sources-method module identifies methodology/editorial revision/analyzed edition;
- source IDs are stable;
- film-specific timestamps can later point to an edition record;
- deep-link spoiler escalation behavior is specified before public indexing of deep sections.
