# DeepMovieReview — Open Questions & Next Audit Targets

> Status: active decision log v0.2  
> These are intentionally unresolved. They should be answered by prototypes, editorial calibration and user testing, not intuition alone.

## 1. Naming / brand

- Final product name: DeepMovieReview or new public brand?
- Should the visual language use English analytical micro-labels (`STORY`, `TRACE`, `VERDICT`) on a Russian-language launch, or localized labels?
- Is `Moral Core` public-facing terminology or only internal design-system language?
- Is `Narrative Permission` understandable public wording or should it receive a clearer editorial label?

## 2. Audience and language

- Russian-first, English-first or multilingual from launch?
- Does multilingual support need to exist in schema from day one?
- How are Scripture translations selected/displayed by locale?
- How do film titles/character names/localized releases map cleanly across locales?

## 3. Theological methodology

- Exact confessional/doctrinal editorial statement.
- Which moral judgments are direct biblical claims vs theological synthesis vs prudential judgment?
- How should disputed Christian ethical questions be marked?
- What review process is required before a normative conclusion is published?
- How should Scripture citations be versioned when translation wording differs?

## 4. Rating scale calibration

The v0 authoring contract already uses categorical interpretive confidence — `HIGH | MEDIUM | LOW` — across claim-bearing modules. That resolves the internal confidence representation for the current schema, but not how confidence should be surfaced publicly or how any future rating scale should be calibrated.

- Which dimensions are genuinely numerical?
- 0–10 vs 0–100 internally?
- Should public film craft use a familiar 10-point scale while analytical dimensions use categories?
- What dimensions have acceptable inter-editor reliability?
- How is confidence displayed?
- Is there any public letter-grade verdict or does prose do the job better?
- Should `Discussion Value` be numeric, categorical or prose-only?

## 5. Story / plot model

The v0 Story contract deliberately avoids a fixed act taxonomy: it stores one module-level summary plus an ordered list of free-form plot beats, each with its own label, summary, spoiler boundary and evidence support. Real-film Story modules are validator-gated to contain at least one beat, and both the summary and beats participate in the evidence chain. This settles the current authoring shape without forcing a three-act template.

- Does the free-form ordered-beat model remain expressive enough across very different narrative structures?
- Are summary + supported beats enough synopsis levels for editorial production and public reading?
- Are plot beats stored as editorial analysis or semi-factual structural metadata?
- How should nonlinear narratives be modeled?
- How are anthology films handled?
- How should unreliable narration affect plot summaries and evidence?

## 6. Character model

The v0 character contract already structures a spoiler-safe base profile (`wants`, `fears`, `contradiction`) and a separate optional deeper interpretation layer (`believes`, `selfDeception`, `arcSummary`, `roleInArgument`). The two layers carry independent spoiler boundaries and independent `profileSupport` / `interpretiveSupport`, so deeper interpretation cannot silently inherit evidence from the base profile. This resolves the current field/layer split, not whether every field generalizes equally well across genres.

- Do the current base-profile and deeper-interpretation fields remain useful across genres and ensemble structures?
- Should a distinct `need` field ever be added, or remain prose/interpretation rather than canonical structure?
- How do we mark an interpretive character motive as uncertain?
- Is role-model classification public-facing or primarily internal?
- How do we model ensemble films without artificially choosing one protagonist?

## 7. Relationship model

The v0 relationship contract already models change through authored events plus optional before/after dimension shifts across `TRUST`, `TRUTHFULNESS`, `POWER`, `BOUNDARIES`, `RESPONSIBILITY` and `REPAIR`; published real-film relationships also bind to stable participant character IDs. That settles the current data shape as event-driven change with structured dimension deltas, while the reliability and interpretation of those dimensions still require calibration.

- Which of the current relationship dimensions remain sufficiently reliable for structured comparison after editorial calibration?
- Does the event + dimension-shift model remain expressive enough across very different relationship types?
- How do relationship types change over time?
- How should one-sided/unreciprocated relationships be represented?
- What is the minimum evidence for claims about a marriage/friendship/family system?
- How do we avoid turning relationships into pseudo-scientific scoring?
- Which relationship patterns deserve future atlas surfaces first?

## 8. Parent / child / family model

- What counts as responsible parental presence across different cultures/eras?
- How do we distinguish flawed parenting from abuse, neglect or ordinary imperfection?
- How do we analyze children forced into adult responsibility without romanticizing parentification?
- How should adopted, foster, blended and nontraditional household structures be represented descriptively before normative claims?
- Which family-system terms need formal definitions?

## 9. Youth / formation model

The v0 Family/Youth contract already represents social-formation observations through a categorical `SocialFormationDomain` plus subject, claim, optional counterevidence, confidence and evidence support. The current domain vocabulary explicitly includes parental presence/example, authority, discipline/boundaries, peer pressure, rebellion/autonomy, responsibility, sexual formation, substance risk, work/study, maturity and adult role models. That settles how these concerns are encoded today, while their interpretation and public presentation remain open.

- What age bands matter analytically, if any?
- How do we distinguish healthy autonomy from rebellion in a consistent methodology?
- When is risky behavior merely represented vs normalized/aspirational?
- Does the current `PEER_PRESSURE` / `ADULT_ROLE_MODELS` domain encoding capture those formation dynamics with enough nuance?
- Should youth-facing `Imitation Pressure` receive a dedicated public indicator?
- How do we avoid assuming adolescents interpret media identically?

## 10. Themes / meaning / worldview

The v0 `MeaningModule` already links a `theme`, `question`, `apparentClaim`, `counterevidence` and categorical confidence in one authored record. The current schema therefore treats Narrative Question and the apparent Narrative Claim as a paired analytical unit; whether that rule survives broader corpus calibration remains a methodology question.

- How many theme tags before taxonomy becomes generic?
- Does requiring a question + apparent claim pair for every Meaning module remain useful across films that deliberately refuse or destabilize an answer?
- How do we represent films that intentionally refuse an answer?
- How do we distinguish a film's textual claim from creator interviews/intent?
- Which worldview topic families are stable enough for structured comparison?
- Should existential/spiritual claims be first-class even when no explicit religion appears?

## 11. Teaching signals / Narrative Permission

The v0 `NarrativePermissionState` contract is already fixed as `CONDEMNED / COSTLY / QUESTIONED / UNCHALLENGED / NORMALIZED / REWARDED / CELEBRATED / AMBIGUOUS`, and Permission records may carry categorical confidence, counterevidence and evidence support. Treat that as the current authored vocabulary rather than an unresolved implementation choice; calibration may still justify a deliberate later revision.

- Does the current v0 state set remain sufficient after multi-film editorial calibration and user-comprehension testing?
- Should `NORMALIZED` be a state or modifier?
- How much repetition is needed before calling behavior normalized?
- How should comedy/satire alter interpretation?
- When does lack of consequence become meaningful evidence rather than narrative compression?
- How should ending resolution be weighted relative to earlier scenes?
- Can `unchallenged` be displayed publicly without users reading it as `endorsed`?

## 12. Role models / imitation pressure

- What evidence distinguishes protagonist, sympathetic focal character and role model?
- Can `charismatic-but-destructive` be defined reliably?
- How should aspirational visual framing be measured without pseudo-precision?
- Is youth-specific imitation pressure different enough from general audience aspiration to justify separate analysis?

## 13. Moral-event taxonomy

The v0 moral-event contract already represents positive and negative acts symmetrically through `MoralValence = WRONGDOING | VIRTUE | MIXED | PRUDENTIAL`, while each event may separately carry severity, culpability, repentance state, narrative stance, confidence and evidence support. The event `category` itself remains open-ended text, so the source and granularity of the eventual moral taxonomy are intentionally **not** resolved by the schema.

- Build the category taxonomy from biblical/theological categories, common-language categories, or layered mapping?
- How granular should deception, violence, sexuality, pride, complicity, omission, etc. become?
- Does the current valence model remain sufficient for virtues, mixed acts and prudential choices?
- How should repeated low-severity events be aggregated without reducing analysis to counting?

## 14. Film attitude / endorsement model

The v0 moral-event contract already fixes `MoralNarrativeStance` as `CONDEMNS → QUESTIONS → AMBIVALENT → NORMALIZES → CELEBRATES`, with categorical confidence and evidence support on each authored moral event. This resolves the current implementation vocabulary, not whether later calibration will require another orthogonal dimension or a revised state set.

- Does the current v0 stance set remain sufficient after cross-film editorial calibration?
- Should romanticization be a separate orthogonal dimension?
- How do we model a film that condemns an act propositionally but aestheticizes it strongly?
- How do unreliable narration and satire affect stance?
- How do we model different stance toward the same act by different characters?
- How does event-level stance relate to broader Narrative Permission?

## 15. Psychological layer

- Which concepts can be responsibly used by non-clinical film editors?
- What language avoids accidental diagnosis?
- Which models should be cited rather than turned into proprietary pseudo-science?
- How do we distinguish empathy generated by filmmaking from moral endorsement?
- How much psychological explanation belongs in public UI before it becomes overanalysis?

## 16. Craft-as-evidence model

The v0 Craft contract already structures observations by `CraftMechanism` (camera distance/movement, point of view, lighting, color, music, sound, editing rhythm, reaction shot, performance, comic timing, slow motion, production design, costume and `OTHER`). It also supports reusable `EMPATHY` / `IMITATION` pressure assessments with an optional `LOW | MEDIUM | HIGH` level, prose rationale, linked craft observations, confidence and evidence support. Treat that as the current authoring shape, not as proof that every mechanism or pressure scale is editorially reliable.

- Does the current `CraftMechanism` vocabulary remain useful without encouraging over-structuring?
- How do we represent music/camera/editing as evidence without overclaiming intentional symbolism?
- Does optional categorical level + prose rationale give `Empathy Pressure` enough nuance?
- Is reusable `Imitation Pressure` justified across enough films after calibration?
- Which genre/satire qualifications need methodology notes?

## 17. Scene model

The current canonical ingest contract already chooses numeric seconds from the declared locked-edition timestamp origin: scenes carry `startTimestampSeconds` / `endTimestampSeconds`, evidence carries `timestampSeconds`, and canonical evidence must resolve inside a VERIFIED scene in that exact locked edition. Research-tier scene bounds remain explicitly DRAFT/provisional until master-lock re-verification. This settles the v0 locator precision and edition-binding model.

- What exactly counts as a scene across editing styles?
- Do any editorial workflows require frame-level precision beyond the current second-based canonical contract?
- What happens when streaming editions differ?
- How are alternate cuts represented?
- How much copyrighted dialogue may be quoted vs paraphrased?

## 18. Film 001 — selection resolved, ingest questions remain

**Resolved:** Film 001 is **The Truman Show (1998)**. See `28-PILOT-FILM-SELECTION.md`.

Remaining Film 001 questions belong to ingest/editorial production rather than title selection:

- Which exact Paramount 25th Anniversary 4K master / region will be the canonical editorial edition?
- What timestamp convention will be used across editorial evidence?
- Which Scene Autopsy candidate survives a full scene-by-scene evidence pass?
- Which claims remain stable after counterevidence and independent editorial review?
- Which original/editorial visual masters can be produced without implying that generated art is an actual film frame?

Track the active ingest boundary in `29-FILM-001-INGEST-STATUS.md`.

## 19. Homepage launch cut

`14-HOMEPAGE-LAUNCH-CUT-V1.md` now fixes the launch structure that was previously open here: a 12-stage cut; Relationship Observatory on the homepage; Narrative Permission as its own homepage stage; the explicit Biblical Lens after the descriptive/interpretive/craft sequence; a tiny-corpus library state that works with 1–3 films; and a silent launch default. Do not treat those choices as unresolved unless validation evidence requires a deliberate revision of Launch Cut v1.

Remaining validation questions:

- How long should the first cinematic sequence take without user frustration?
- Is `Six Lenses` clear enough without explanatory text?
- Does Relationship Observatory prove strong and understandable enough in user walkthroughs to remain a homepage signature interaction?

## 20. Visual identity

- Final serif/sans pairing.
- Final crimson and warm accent values.
- Is analog grain always present or scene-specific?
- How much forensic microcopy is acceptable before the page feels like a HUD?
- Is Moral Lens square/rectangular/circular/reticle-based?
- Should `FIELD` become an official visual primitive?

## 21. Moral Core semantics

- Which 5–8 semantic variables generate geometry?
- Which alter material rather than shape?
- Can two films be meaningfully compared without reading a legend?
- How stable is the sculpture across methodology versions?
- Can the Core be rendered as static SVG/illustration in Lite mode?
- Should relationship/theme/message variables influence Core, or should Core remain strictly moral to avoid semantic soup?

## 22. Scene Autopsy

Anchor storage is no longer an open question: `VisualAssetManifest` / `EvidenceAnchor` uses stable IDs plus normalized `0..1` points, with integrity validation for duplicate IDs and out-of-bounds coordinates. `23-VISUAL-ASSET-MANIFEST-V0.md` owns that contract.

Remaining questions:

- Depth-map-only vs segmentation + layered planes?
- Can anchors survive responsive crops?
- When should local relighting be used?
- Is the effect legible on mobile?
- Can Scene Autopsy display story/relationship/theme evidence as well as moral evidence without clutter?

## 23. Decision Chamber

The Decision / Knowledge Fog data semantics are now fixed by `15-HOMEPAGE-DATA-CONTRACTS.md` and `FilmPackage`: options declare whether they were available at decision time; every fact carries an explicit `knowledgeState`; `COERCION` is an explicit pressure kind; and Knowledge Fog must read those authored states rather than infer them from presentation. `14-HOMEPAGE-LAUNCH-CUT-V1.md` also requires later facts/consequences to appear only after explicit spoiler-safe action and states that epistemic limitation is not moral absolution.

Remaining questions:

- Maximum options before spatial UI fails?
- What part is interactive in Lite mode?

## 24. Catalog / discovery

- Should Index be default and Explore optional, or vice versa?
- Which filters are useful before corpus is large?
- How do we avoid empty Atlas experiences at launch?
- Which early discovery surfaces matter most: Themes, Relationships, Youth/Family, Moral Topics or Dilemmas?

## 25. AI imagery and copyright strategy

The asset-production mechanics are partly resolved by `23-VISUAL-ASSET-MANIFEST-V0.md`: every manifest carries structured provenance (`sourceKind`, plus generator/model/prompt-version/date/editorial/source-reference metadata when available), and depth maps / segmentation masks are derived inside the same offline editorial pipeline after master selection and responsive composition checks.

Remaining questions:

- Are film stills licensed/embedded, or do we primarily create original editorial art?
- What policy governs likeness of actors/characters in generated imagery?
- How is AI editorial artwork labeled so it is not mistaken for an actual frame?
- Which assets require human art-direction review?

## 26. Community timing / aggregation

- What audience size justifies public aggregates?
- Minimum effective vote count?
- Is login required for every rating?
- Which interactions can be anonymous and later claimed?
- How do we discourage pre-release voting?
- Bayesian prior strength by title type?
- Global vs locale-aware prior?
- How are suspicious campaigns downweighted?
- What transparency is shown publicly?
- Do we show raw histograms when weighted score is adjusted?

## 27. Community moderation

- Moderation roles/permissions.
- What qualifies as factual correction vs interpretive disagreement?
- Appeals process.
- How are theological disagreements moderated without suppressing good-faith dissent?
- When can trusted contributors suggest story/relationship/theme/moral-event edits?

## 28. Search / recommendation

- Is semantic/vector search needed early, or can structured filters cover initial corpus?
- How are spoiler-laden snippets handled?
- What embeddings/data can be used without leaking private behavior?
- When do recommendations become useful enough to justify profiling?
- How should semantic search distinguish `film depicts X` from `film endorses X`?

## 29. Data platform

- PostgreSQL schema design.
- ORM/query layer.
- CMS/editorial tooling.
- Search engine.
- object storage/image CDN.
- event log strategy.
- aggregate job strategy.
- moderation queue architecture.

Do not choose infrastructure before the pilot's expanded content model is represented faithfully.

## 30. Performance budgets

Concrete budgets still need prototype measurement:

- JS per route;
- first-load image bytes;
- maximum GPU asset bytes;
- texture memory;
- acceptable FPS/frame-time by quality tier;
- LCP/INP targets;
- mobile Lite thresholds.

## 31. Validation research

Before Phase 2, conduct:

- 5–10 user walkthroughs of one deep review;
- test whether users understand the project as whole-film analysis rather than sin counting;
- test comprehension of `Narrative Permission`;
- test Relationship Observatory usefulness;
- test youth/family analysis for nuance rather than judgmental simplification;
- accessibility audit;
- low-end mobile test;
- expert editorial rubric calibration;
- visual fatigue test;
- Index vs Explore catalog usability;
- test whether Moral Core is interpretable;
- test whether Scene Autopsy improves understanding or merely looks impressive.

## 32. Competitive research to repeat periodically

Re-audit at least quarterly:

- Movieguide;
- Plugged In;
- Christian Answers;
- Common Sense Media;
- Kids-In-Mind;
- IMDb;
- Letterboxd;
- Rotten Tomatoes;
- new film-analysis/media-literacy products;
- Awwwards/FWA/Codrops current interaction patterns.

## 33. Rule for resolving open questions

Prefer evidence in this order:

1. biblical/theological clarity for normative methodology;
2. editorial consistency;
3. user comprehension;
4. accessibility/performance;
5. product usefulness;
6. visual impact;
7. trend novelty.

A newer effect does not outrank a clearer product.