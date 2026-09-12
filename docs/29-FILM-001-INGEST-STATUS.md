# DeepMovieReview — Film 001 Ingest Status

> Film: **The Truman Show (1998)**
> Status: **draft research ingest (SECONDARY_SOURCES tier)**
> Date: 2026-09-11 — updated 2026-09-12
> Tracking: issue #43

## 1. Current boundary

Film 001 is now allowed to enter the application as a real `draft` package, but it is **not** a published analysis.

The repository currently knows:

- the selected title / year / director;
- official production metadata;
- a target 25th Anniversary Paramount 4K presentation;
- secondary craft/development/script research sources;
- a machine-validated **research-tier draft analysis** (see §7): fifteen DRAFT scenes with estimated bounds, thirty-five secondary-source evidence records and all fourteen module kinds, assembled under `ingest.research.state = "SECONDARY_SOURCES"`;
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

- `TARGET_ONLY` means a release/master target is selected but canonical `scenes[]`, evidence **and analytical FilmPackage modules** are forbidden; only `sources-method` may exist until the exact viewing master is locked;
- `LOCKED` requires exact edition identity, positive `measuredRuntimeSeconds`, timestamp convention and verification date;
- every real-film Sources/Method module requires nonblank `methodologyVersion`, `editorialRevision` and human-readable `analyzedEdition` during draft authoring; `lastReviewedAt` remains a publication/review field;
- real-film scenes use numeric start/end seconds from that declared timestamp origin;
- a scene must be `VERIFIED` before canonical evidence or a Scene Autopsy may reference it;
- real-film evidence may use `timestampSeconds` only with a canonical `sceneId`, and the point must fall inside the verified scene range;
- scene-linked evidence and Scene Autopsy modules cannot use a lower spoiler level than the canonical scene they derive from;
- publication requires every real-film scene to be `VERIFIED`;
- every real-film canonical evidence record, including draft evidence, must carry both a canonical `sceneId` and numeric `timestampSeconds`, so another editor can reproduce the observation in the locked master;
- explicit-level real-film claims cannot cite support/counterevidence with a higher spoiler level than the claim; Craft pressure assessments cannot cite more revealing craft observations; Scene Autopsy anchors cannot cite more revealing evidence;
- character evidence is split into `profileSupport` and `interpretiveSupport`, each checked against its own spoiler boundary; published base profiles require profile support, while published deep interpretation fields require separate interpretive support;
- `interpretiveSpoilerLevel` cannot be lower than the character profile boundary; deeper interpretation may stay equally restricted or become more restricted, never less;
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

Every high-level interpretive claim in a real-film package, including draft authoring after the master is locked, must trace through:

`claim → evidence record → verified scene → locked film edition`

Draft status is not a license for unsupported analysis. Fixtures remain flexible because they are structural test data, not film judgments.

Relationship, Family/Youth and Moral Analysis module-level summaries are also editorial claims. When those summaries are present in a real-film package they require their own `summarySupport`; nested events/observations do not automatically prove unrelated summary prose.

Real-film Story structure is evidence-backed as well: the module summary has `summarySupport`, each plot beat has its own canonical `support`, and every supported evidence record already resolves to a verified scene/timestamp in the locked master.

Decision / Knowledge Fog uses the same rule before judgment is added: each option, knowledge-state fact, pressure and duty/good is a claim about the decision-time situation and therefore carries its own canonical `support`. The optional editorial judgment keeps a separate support graph.

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

## 7. Research tier: `SECONDARY_SOURCES` (added 2026-09-12)

**What changed.** `FilmPackage` gained an optional `research` block
(`{ state: "SECONDARY_SOURCES", note, assembledAt }`). While it is declared,
a `TARGET_ONLY` real-film package may carry analytical modules, a scene
registry and an evidence ledger that would otherwise require a `LOCKED`
edition (see §2).

**Why.** Between "edition selected" and "master locked" the honest editorial
work is assembling the analysis from published scripts, interviews, frame
documentation and reference catalogs. The previous all-or-nothing gate forced
editors to choose between an empty package and fabricated canonical evidence.
The research tier names that middle state instead of faking the end state.

**Rules (enforced by `film-package-integrity.ts` and regression tests):**

- scenes must stay `DRAFT` — `VERIFIED` is a lock-time claim;
- every evidence record must cite at least one **secondary** source;
- evidence must **not** cite the target `film-edition` source (the master has
  not been watched; nothing is verified against it);
- `research` cannot coexist with a `LOCKED` edition;
- a `published` package cannot remain in the research tier — publication
  still requires the full canonical chain of §3.

**Migration impact.** The canonical evidence chain of §3 is unchanged for
published work: `claim → evidence → verified scene → locked film edition`.
Research-tier claims trace `claim → evidence → secondary source + DRAFT
scene`. At lock time the `research` block must be dropped, every scene
re-verified against the measured master, and every evidence record re-anchored
to the locked `film-edition` source with a reproduced timestamp. Nothing
assembled in the research tier is inherited as canonical.
