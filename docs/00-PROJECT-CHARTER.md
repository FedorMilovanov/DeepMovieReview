# DeepMovieReview — Project Charter

> Status: foundation specification v0.2  
> Audited: 2026-09-09  
> This document defines the product thesis and non-negotiable boundaries. It is intentionally broader than the MVP.

## 1. Product thesis

DeepMovieReview is not a parental-content checker and not a clone of IMDb, Letterboxd, Movieguide, Plugged In, Common Sense Media, or CinemaSins.

The long-term product is an **interactive atlas for deep analysis of cinema as stories about people**. It combines structured analysis of:

- story and plot;
- characters and psychological development;
- relationships;
- family, parents, youth, friendship, romance, marriage, authority and other social models;
- themes, questions, meaning and worldview claims;
- what the film explicitly or implicitly teaches, normalizes, rewards, punishes or leaves unchallenged;
- moral actions, motives, responsibility and consequences;
- filmmaking craft and the way form shapes sympathy/admiration;
- biblical principles and editorial judgments;
- later, independent audience/community data.

The platform's moral/biblical analysis is a central differentiator, but **the film must be understood as a film before it is reduced to any normative conclusion**.

The first release must remain much narrower: a small number of exceptionally deep film analyses with a visually distinctive cinematic experience.

## 2. The core differentiator

Existing Christian review systems already evaluate movies through biblical or moral frameworks. Existing family/media systems already discuss messages, role models and content categories. Therefore the defensible claim is **not** “the first Christian site that rates films.”

The differentiator is the combination of:

1. structured story/plot analysis;
2. first-class character and relationship models;
3. dedicated analysis of parents, youth, marriage, friendship, authority and social formation where relevant;
4. structured themes, narrative questions, narrative claims and counterevidence;
5. explicit modeling of what a film teaches through role models, consequences, normalization, humor, admiration and endings;
6. scene-level moral events;
7. distinction between act, motive, knowledge, intent, freedom/coercion, culpability, consequence, repentance and redemption;
8. explicit analysis of the film's own stance toward what it depicts;
9. psychological explanation without confusing explanation with justification;
10. structured difficult-decision analysis;
11. analysis of how camera, performance, music, editing and genre shape audience sympathy;
12. interactive timelines, causal graphs, relationship traces and spatial visualizations;
13. independent editorial and audience layers;
14. later, cross-film theme, relationship, moral-question and dilemma atlases.

## 3. Three methodological axioms

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

### Representation ≠ Prescription

Showing a family, relationship, youth culture, social practice or worldview does not automatically mean prescribing it as ideal.

The system must distinguish:

- what is represented;
- how frequently it appears;
- how the film emotionally frames it;
- what happens because of it;
- whether it is challenged or left unchallenged;
- whether it is rewarded, normalized, ridiculed, condemned or celebrated;
- how confident the interpretation is.

## 4. Editorial authority vs audience data

DeepMovieReview will eventually contain both editorial judgments and community data, but they must never collapse into one score.

**Editorial/Biblical layer** answers: “What is our argued judgment according to the published methodology?”

**Audience layer** answers questions such as:

- Did viewers like the film as a film?
- How did viewers understand its themes/messages?
- How did viewers perceive the film's moral stance?
- What would viewers do in a dilemma?
- How divided is the audience?
- Where does the audience disagree with the editorial analysis?

Popularity is not truth. Editorial authority is not popularity. Film quality is not moral acceptability.

## 5. Product layers

The long-term platform has eleven separable layers:

1. **Film Database** — films, editions, releases, people, scenes.
2. **Story / Plot Model** — premise, conflict, plot beats, resolution, causal structure.
3. **Character Analysis** — desires, fears, contradictions, arcs, psychological realism and narrative function.
4. **Relationship Analysis** — marriage, romance, parents/children, friendship, peers, authority, conflict and repair.
5. **Themes / Meaning / Worldview** — questions, claims, counterclaims, social/spiritual assumptions and meaning.
6. **Narrative Formation / Teaching** — role models, consequences, normalization, rewards, ridicule, silence and ending resolution.
7. **Moral Event Database** — acts, motives, pressures, consequences, responsibility, virtues and failures.
8. **Decision Database** — dilemmas, known facts, unknown facts, options, pressures and duties.
9. **Craft & Reception Mechanics** — camera, performance, editing, music, genre, empathy and imitation pressure.
10. **Audience Research** — film scores, interpretation/moral perception, decision votes, polarization.
11. **Community** — reviews, scene notes, counterarguments, lists, profiles, reputation.

The launch does **not** need layers 10–11 to be useful.

## 6. Initial target experience

The launch experience should feel like an interactive deep reading of a film rather than a rating portal.

Narrative rhythm:

**FILM → STORY → PEOPLE → RELATIONSHIPS → IDEAS → EXAMINATION → EVIDENCE → MORAL STRUCTURE → BIBLICAL PRINCIPLE → SYNTHESIS**

A visitor should first feel the film, then understand it, then see the judgment.

## 7. What DeepMovieReview must not become

- A simplistic “sin counter” where more depicted sins automatically means a worse film.
- A purity leaderboard.
- A parental checklist disguised as deep criticism.
- A BuzzFeed-style “how biblical are you?” quiz.
- A Christian reskin of Letterboxd.
- A dashboard with 30 equally prominent metrics.
- A WebGL demo gallery whose effects are unrelated to content.
- A platform where agreement with editors increases user reputation.
- A review-bombing battleground.
- A site where beautiful visuals destroy readability, accessibility or mobile performance.
- A system that assumes every sympathetic character is a role model.
- A system that assumes every unpunished act is endorsed.
- A system that turns every family or relationship into a simplistic numeric score.

## 8. Editorial output model

A final review can contain several independent judgments instead of one master number.

### Film / story

- artistic / cinematic quality;
- storytelling and narrative coherence;
- character writing;
- thematic depth / coherence.

### Character / psychology

- psychological realism;
- motivational coherence;
- character/arc depth.

### Relationships / social models

Where central to the film:

- relational realism/depth;
- marriage/romance portrayal;
- parent-child/family portrayal;
- youth/formation portrayal;
- friendship/loyalty;
- authority/responsibility.

### Moral / biblical

- moral clarity of the narrative;
- severity of depicted evil;
- romanticization / normalization pressure;
- complexity of decisions;
- consequence visibility;
- redemptive movement;
- repentance / moral restoration;
- confidence in the interpretation.

Some dimensions should be categorical rather than numeric. Example:

`CONDEMNS → QUESTIONS → AMBIVALENT → NORMALIZES → CELEBRATES`

A broader `Narrative Permission` model can use:

`CONDEMNED / COSTLY / QUESTIONED / UNCHALLENGED / NORMALIZED / REWARDED / CELEBRATED / AMBIGUOUS`.

Numbers are tools, not the ontology of the site.

## 9. Future unique products

### Film Meaning Atlas

Explore films by themes/questions/claims rather than only genre:

- what cinema says about fatherhood;
- love vs truth;
- adulthood as responsibility;
- revenge and grief;
- guilt and forgiveness;
- authority and rebellion;
- meaning, mortality and hope.

### Relationship Atlas

Cross-film relationship patterns:

- father/child reconciliation;
- absent or irresponsible parents;
- marriage after betrayal;
- friendship becoming complicity;
- manipulative romance;
- sacrificial friendship;
- mentor corruption;
- healthy vs abusive authority.

### Youth & Formation Atlas

Explore:

- films that romanticize teen rebellion;
- responsible adult role models;
- peer pressure;
- risky behavior with/without consequences;
- rites of passage;
- portrayals of maturity and adulthood.

### Moral Atlas

Explore films by moral structure:

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

### Narrative Permission Atlas

Explore what different films treat as:

- condemned;
- costly;
- questioned;
- unchallenged;
- normalized;
- rewarded;
- celebrated.

### Moral / Narrative Parallels

For a scene, relationship, theme or moral event, show comparable cases from other films with structured differences.

## 10. North-star quality bar

The product should combine:

- the editorial seriousness of a high-end film/culture publication;
- the visual polish of a leading interactive studio;
- the structured data quality of a research database;
- the explainability of a well-designed analytical tool;
- the biblical seriousness of an argued normative methodology;
- the restraint needed for long-form reading.

The desired reaction is not “there are many effects.” It is:

> **“This interface seems to understand how a film tells a story, forms sympathy, models relationships and makes claims about life — and it can show why.”**

## 11. MVP boundary

The first serious prototype should prove one film end-to-end before scaling breadth.

Minimum proving ground should now include:

- Film Hero / Living Frame;
- Story at a Glance;
- one Character Portrait/Arc;
- one Relationship Observatory or relationship trace;
- `What the Film Appears to Say`;
- Editorial Verdict Snapshot;
- Moral Timeline;
- at least one Scene Autopsy;
- at least one Decision Chamber where appropriate;
- one `Narrative Permission` or teaching/message example;
- one Scripture/Principle section;
- final synthesis;
- accessible no-GPU / reduced-motion fallback;
- data model that does not block later community features.

Do not begin by building thousands of shallow film pages.