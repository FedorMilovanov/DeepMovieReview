# DeepMovieReview — Project Charter

> Status: foundation specification v0.1  
> Audited: 2026-09-09  
> This document defines the product thesis and non-negotiable boundaries. It is intentionally broader than the MVP.

## 1. Product thesis

DeepMovieReview is not a parental-content checker and not a clone of IMDb, Letterboxd, Movieguide, Plugged In, Common Sense Media, or CinemaSins.

The long-term product is an **interactive atlas of the moral structure of cinema**: a film database in which stories, characters, choices, motives, consequences, moral claims, psychological pressures, biblical principles, editorial judgments, and audience responses can all be represented as structured, inspectable data.

The first release must remain much narrower: a small number of exceptionally deep film analyses with a visually distinctive cinematic experience.

## 2. The core differentiator

Existing Christian review systems already evaluate movies through biblical or moral frameworks. Therefore the defensible claim is **not** “the first Christian site that rates films.”

The differentiator is the combination of:

1. scene-level moral events;
2. distinction between act, motive, knowledge, intent, freedom/coercion, culpability, consequence, repentance and redemption;
3. explicit analysis of the film's own stance toward what it depicts;
4. psychological explanation without confusing explanation with justification;
5. structured difficult-decision analysis;
6. interactive timelines, causal graphs and spatial visualizations;
7. independent editorial and audience layers;
8. later, cross-film moral-question and dilemma atlases.

## 3. Two methodological axioms

### Depiction ≠ Endorsement

A film may depict grave evil while condemning it. Mere presence, frequency or graphic intensity of evil cannot be used as a proxy for the film's moral claim.

The system must separately model:

- what happens;
- who does it;
- how responsible the character is;
- what consequences follow;
- how the narrative frames the act;
- whether the film condemns, questions, normalizes, excuses, celebrates or romanticizes it.

### Explanation ≠ Justification

Psychological, social or narrative explanation of a character's behavior does not by itself reduce moral responsibility.

The system must be able to say simultaneously:

- “this behavior is psychologically understandable”; and
- “this behavior remains morally unjustified.”

## 4. Editorial authority vs audience data

DeepMovieReview will eventually contain both editorial judgments and community data, but they must never collapse into one score.

**Editorial/Biblical layer** answers: “What is our argued judgment according to the published methodology?”

**Audience layer** answers questions such as:

- Did viewers like the film as a film?
- How did viewers perceive the film's moral stance?
- What would viewers do in a dilemma?
- How divided is the audience?
- Where does the audience disagree with the editorial analysis?

Popularity is not truth. Editorial authority is not popularity. Film quality is not moral acceptability.

## 5. Product layers

The long-term platform has seven separable layers:

1. **Film Database** — films, editions, releases, people, characters, scenes.
2. **Editorial Analysis** — reviews, claims, scores, evidence, biblical principles.
3. **Moral Event Database** — acts, motives, pressures, consequences, responsibility.
4. **Psychological Analysis** — motivation, coherence, rationalization, pressure, empathy mechanics.
5. **Decision Database** — dilemmas, known facts, unknown facts, options, tradeoffs.
6. **Audience Research** — film scores, moral perception, decision votes, polarization.
7. **Community** — reviews, scene notes, counterarguments, lists, profiles, reputation.

The launch does **not** need layers 6–7 to be useful.

## 6. Initial target experience

The launch experience should feel closer to an interactive film investigation than to a review portal.

Narrative rhythm:

**FILM → EXAMINATION → DISSECTION → EVIDENCE → MORAL STRUCTURE → BIBLICAL PRINCIPLE → VERDICT**

A visitor should first feel the film, then understand the analysis.

## 7. What DeepMovieReview must not become

- A simplistic “sin counter” where more depicted sins automatically means a worse film.
- A purity leaderboard.
- A BuzzFeed-style “how biblical are you?” quiz.
- A Christian reskin of Letterboxd.
- A dashboard with 30 equally prominent metrics.
- A WebGL demo gallery whose effects are unrelated to content.
- A platform where agreement with editors increases user reputation.
- A review-bombing battleground.
- A site where beautiful visuals destroy readability, accessibility or mobile performance.

## 8. Editorial output model

A final review can contain several independent judgments instead of one master number:

- artistic / cinematic quality;
- moral clarity of the narrative;
- severity of depicted evil;
- romanticization / normalization pressure;
- complexity of decisions;
- psychological realism;
- motivational coherence;
- redemptive movement;
- repentance / moral restoration;
- confidence in the interpretation.

Some dimensions should be categorical rather than numeric. Example:

`CONDEMNS → QUESTIONS → AMBIVALENT → NORMALIZES → CELEBRATES`

Numbers are tools, not the ontology of the site.

## 9. Future unique products

### Moral Atlas

Explore films by moral structure rather than only genre:

- highest moral complexity;
- strongest redemptive arcs;
- most debated decisions;
- strongest editorial–audience gap;
- highest polarization;
- films that romanticize villains;
- films about guilt, revenge, deceit, sacrifice, repentance, justice, mercy, etc.

### Dilemma Atlas

A database of recurring moral questions across cinema, for example:

- Is lying permissible to protect an innocent person?
- Can revenge ever constitute justice?
- What duties remain under coercion?
- When does loyalty become complicity?

Each dilemma can link multiple films and compare knowledge, pressure, intention and consequences.

### Moral Parallels

For a scene or moral event, show comparable cases from other films with structured differences.

## 10. North-star quality bar

The product should combine:

- the editorial seriousness of a high-end publication;
- the visual polish of a leading interactive studio;
- the structured data quality of a research database;
- the explainability of a well-designed analytical tool;
- the restraint needed for long-form reading.

The desired reaction is not “there are many effects.” It is: **“this interface seems to understand the moral anatomy of a film.”**

## 11. MVP boundary

The first serious prototype should prove one film end-to-end before scaling breadth.

Minimum proving ground:

- Film Hero;
- Editorial Verdict Snapshot;
- Moral Timeline;
- at least one Scene Autopsy;
- at least one Decision Chamber;
- one Scripture/Principle section;
- final Verdict;
- accessible no-GPU / reduced-motion fallback;
- data model that does not block later community features.

Do not begin by building thousands of shallow film pages.