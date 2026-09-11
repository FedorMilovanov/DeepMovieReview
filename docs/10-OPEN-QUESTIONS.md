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

- Which dimensions are genuinely numerical?
- 0–10 vs 0–100 internally?
- Should public film craft use a familiar 10-point scale while analytical dimensions use categories?
- What dimensions have acceptable inter-editor reliability?
- How is confidence displayed?
- Is there any public letter-grade verdict or does prose do the job better?
- Should `Discussion Value` be numeric, categorical or prose-only?

## 5. Story / plot model

- Which structural labels are useful without forcing every film into a three-act template?
- How many synopsis levels are practical to author?
- Are plot beats stored as editorial analysis or semi-factual structural metadata?
- How should nonlinear narratives be modeled?
- How are anthology films handled?
- How should unreliable narration affect plot summaries and evidence?

## 6. Character model

- Which character fields are worth structuring vs leaving as prose?
- Can desire/fear/need be used consistently across genres?
- How do we mark an interpretive character motive as uncertain?
- Is role-model classification public-facing or primarily internal?
- How do we model ensemble films without artificially choosing one protagonist?

## 7. Relationship model

- Which relationship dimensions are sufficiently reliable for structured tags?
- Should `trust`, `power`, `responsibility`, `repair` be states, events or both?
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

- What age bands matter analytically, if any?
- How do we distinguish healthy autonomy from rebellion in a consistent methodology?
- When is risky behavior merely represented vs normalized/aspirational?
- How should peer pressure and adult role-model absence be encoded?
- Should youth-facing `Imitation Pressure` receive a dedicated public indicator?
- How do we avoid assuming adolescents interpret media identically?

## 10. Themes / meaning / worldview

- How many theme tags before taxonomy becomes generic?
- Should `Narrative Question` and `Narrative Claim` always be linked?
- How do we represent films that intentionally refuse an answer?
- How do we distinguish a film's textual claim from creator interviews/intent?
- Which worldview topic families are stable enough for structured comparison?
- Should existential/spiritual claims be first-class even when no explicit religion appears?

## 11. Teaching signals / Narrative Permission

- Is `CONDEMNED / COSTLY / QUESTIONED / UNCHALLENGED / NORMALIZED / REWARDED / CELEBRATED / AMBIGUOUS` the right state set?
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

- Build taxonomy from biblical/theological categories, common-language categories, or layered mapping?
- How granular should deception, violence, sexuality, pride, complicity, omission, etc. become?
- How are virtues/positive moral acts represented symmetrically?
- How should repeated low-severity events be aggregated without reducing analysis to counting?

## 14. Film attitude / endorsement model

- Is `CONDEMNS → QUESTIONS → AMBIVALENT → NORMALIZES → CELEBRATES` sufficient?
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

- Which craft observations should be structured?
- How do we represent music/camera/editing as evidence without overclaiming intentional symbolism?
- Is `Empathy Pressure` categorical or prose-only?
- Is `Imitation Pressure` useful across enough films to justify a reusable component?
- Which genre/satire qualifications need methodology notes?

## 17. Scene model

- What exactly counts as a scene across editing styles?
- Should timestamps be frame-accurate, second-accurate or chapter-like?
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

`11-HOMEPAGE-ARCHITECTURE.md` defines 22 possible stages. Launch should not ship all of them blindly.

Open decisions:

- Which 8–12 sections best communicate product breadth?
- How long should the first cinematic sequence take without user frustration?
- Is `Six Lenses` clear enough without explanatory text?
- Is Relationship Observatory strong enough to become a homepage signature?
- Does Narrative Permission need a homepage demo or only film-page proof?
- At what point does the explicit Biblical Lens appear?
- How many featured films are required before the home stops feeling like a one-film microsite?
- Does homepage sound add enough value to justify controls/asset cost?

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

- Depth-map-only vs segmentation + layered planes?
- How are annotation anchors stored?
- Can anchors survive responsive crops?
- When should local relighting be used?
- Is the effect legible on mobile?
- Can Scene Autopsy display story/relationship/theme evidence as well as moral evidence without clutter?

## 23. Decision Chamber

- Maximum options before spatial UI fails?
- How is incomplete information authored?
- Do later consequences appear only after explicit spoiler action?
- How is coercion represented without implying automatic excuse?
- What part is interactive in Lite mode?

## 24. Catalog / discovery

- Should Index be default and Explore optional, or vice versa?
- Which filters are useful before corpus is large?
- How do we avoid empty Atlas experiences at launch?
- Which early discovery surfaces matter most: Themes, Relationships, Youth/Family, Moral Topics or Dilemmas?

## 25. AI imagery and copyright strategy

- Are film stills licensed/embedded, or do we primarily create original editorial art?
- What policy governs likeness of actors/characters in generated imagery?
- How is AI editorial artwork labeled so it is not mistaken for an actual frame?
- What provenance metadata is stored?
- Which assets require human art-direction review?
- Can depth/masks be generated in the same production pipeline?

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