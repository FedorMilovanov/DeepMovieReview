# DeepMovieReview — Film 001 Ingest Status

> Film: **The Truman Show (1998)**
> Status: **draft research ingest**
> Date: 2026-09-11
> Tracking: issue #43

## 1. Current boundary

Film 001 is now allowed to enter the application as a real `draft` package, but it is **not** a published analysis.

The repository currently knows:

- the selected title / year / director;
- official production metadata;
- a target 25th Anniversary Paramount 4K presentation;
- secondary craft/development/script research sources;
- the editorial rule that the finished locked film master outranks screenplay drafts and web summaries.

The repository does **not** yet know:

- the exact editorial master identity / region actually used for analysis;
- measured playback duration of that exact master;
- canonical scene timestamps;
- canonical film observations;
- reviewed character / relationship / moral claims;
- a publishable biblical synthesis;
- a final synthesis.

Those fields must not be fabricated merely to make the package look complete.

## 2. Edition-lock gate

The gate is machine-readable through `FilmPackage.ingest.edition`:

- `TARGET_ONLY` means a release/master target is selected but canonical evidence is forbidden;
- `LOCKED` requires exact edition identity, measured runtime, timestamp convention and verification date;
- every canonical evidence record for a real film must reference the locked `film-edition` source;
- published real-film packages cannot remain `TARGET_ONLY`.

Before scene authoring:

1. acquire the exact editorial viewing master;
2. record disc / region / file identity;
3. confirm the presented aspect ratio and measured playback duration;
4. define timestamp convention (playback clock, including any studio logos/leader policy);
5. record audio/subtitle track used when dialogue wording matters;
6. update `film-001-sources.analyzedEdition` from "target" to the actual master;
7. only then create scene IDs and timestamped evidence.

External runtime listings disagree by ordinary metadata/rounding: Paramount currently lists 104 min, while the referenced 2023 4K release listing reports 103 min. That is precisely why the package does not yet contain scene timestamps.

## 3. Evidence policy

Secondary production/craft/development research is maintained separately in `30-FILM-001-SECONDARY-RESEARCH.md`. It is intentionally **not** the canonical evidence ledger.

The locked finished film is the primary evidence source.

Secondary sources may support:

- production metadata;
- filmmakers' stated craft intentions;
- development history;
- screenplay comparison;
- terminology / context.

They may **not** silently replace observation of the final cut.

Every future high-level claim in a published package must trace through:

`claim → evidence record → source / locked film edition`

When an interpretation depends on a filmmaker interview rather than on-screen evidence, that distinction must remain explicit.

## 4. First scene-inventory pass

After edition lock, create stable scene IDs before writing analytical modules.

Candidate research zones from the selection decision include:

- ordinary Seahaven routine / controlled normality;
- falling studio light;
- radio tracking anomaly;
- backstage elevator rupture;
- travel / escape suppression;
- Meryl product-placement breakdown;
- Marlon / father reassurance intervention;
- Truman's disappearance and manufactured sunrise;
- boat escape / storm;
- studio boundary / final conversation / exit.

These are **inventory targets**, not final Scene Autopsy selections and not yet canonical evidence.

## 5. Module authoring order

Use this order to minimize interpretation outrunning evidence:

1. sources / edition;
2. scene inventory;
3. canonical evidence records;
4. spoiler-safe story structure;
5. character profiles;
6. relationship events;
7. craft observations;
8. Teaching Signals / Narrative Permission;
9. Decision / Knowledge Fog;
10. Scene Autopsy;
11. moral-event ledger;
12. meaning / thematic synthesis;
13. biblical synthesis;
14. final synthesis.

Every step may revise earlier hypotheses.

## 6. Publication gate

Do not change `status: "draft"` to `"published"` until:

- exact edition and timestamps are locked;
- evidence/source integrity passes;
- required published fields pass `film-package-integrity.ts`;
- spoiler classifications are reviewed;
- claims have counterevidence/qualification where needed;
- biblical applications receive independent editorial review;
- production visual assets are approved;
- exact-head CI and browser audit are green;
- the homepage feature slug is changed deliberately in a separate launch decision.

Until then Film 001 must remain preview-only and noindex.
