# DeepMovieReview — Rating & Analysis Methodology

> Status: v0.1 foundation  
> This is a methodological framework, not final theology or final numerical calibration.

## 1. First principle: no single master score

A film can be artistically excellent and morally dark. It can depict extreme evil while strongly condemning it. It can be morally serious yet psychologically implausible. A single number destroys these distinctions.

Therefore DeepMovieReview must keep at least these domains independent:

- **Film Craft**
- **Moral Content / Severity**
- **Narrative Moral Stance**
- **Decision Complexity**
- **Psychological Realism**
- **Repentance / Redemptive Movement**
- **Interpretive Confidence**

A compact UI may summarize them, but storage and reasoning remain separate.

## 2. Editorial analysis unit

The fundamental unit is not “the movie contains X.” It is a structured moral event.

For each significant event ask:

1. **ACT** — What was done or omitted?
2. **OBJECT / TARGET** — Toward whom or what?
3. **MOTIVE** — Why did the character act?
4. **INTENTION** — What outcome did the character intend?
5. **KNOWLEDGE** — What did the character know at the time?
6. **FREEDOM** — How free was the choice?
7. **PRESSURE / COERCION** — What constrained the character?
8. **FORESEEABILITY** — What consequences were reasonably foreseeable?
9. **CONSEQUENCE** — What actually followed?
10. **CULPABILITY** — How responsible is the character?
11. **REPENTANCE / RESTITUTION** — Is wrongdoing recognized and addressed?
12. **NARRATIVE STANCE** — How does the film frame the event?
13. **CONFIDENCE** — How certain is our interpretation?

## 3. Depiction vs endorsement model

Never derive narrative moral stance solely from the number or graphic intensity of immoral events.

Evidence for the film's stance may include:

- consequences;
- character arc;
- framing and point of view;
- music and aestheticization;
- rewarded / punished behavior;
- explicit dialogue;
- irony / satire;
- ending resolution;
- contrast characters;
- recurring motifs;
- what the film asks the viewer to admire, pity, fear or reject.

Suggested stance scale:

`CONDEMNS → QUESTIONS → AMBIVALENT → NORMALIZES → CELEBRATES`

Additional modifiers can coexist:

- romanticizes;
- aestheticizes;
- trivializes;
- excuses;
- grieves;
- satirizes;
- exposes;
- rewards;
- punishes.

## 4. Explanation vs justification model

Psychological explanation is descriptive. Moral judgment is normative. They must be represented separately.

For a character action, store both:

### Psychological explanation

- fear;
- shame;
- pride;
- attachment;
- trauma context where actually supported;
- self-preservation;
- conformity;
- revenge;
- anger;
- rationalization;
- identity pressure;
- social pressure.

### Moral responsibility

- knowledge;
- freedom;
- coercion;
- intention;
- foreseeable harm;
- alternatives;
- duty.

A high-explanation score does not automatically lower culpability.

## 5. Candidate editorial dimensions

These are candidates; final rubric must be calibrated on real films.

### Artistic / cinematic quality

Possible subdimensions:

- direction;
- screenplay;
- acting;
- cinematography;
- editing;
- sound / music;
- production design;
- narrative coherence;
- thematic coherence.

Do not over-fragment the public UI. Internal structure can be deeper than public presentation.

### Moral Clarity

How clearly does the film distinguish moral goods and evils within its own narrative logic?

High moral clarity does **not** mean low amounts of sin or violence.

### Depicted Evil Severity

How grave is the morally objectionable material actually depicted?

This is closer to content severity than endorsement.

### Romanticization / Normalization Pressure

How strongly does form or narrative invite admiration, imitation, normalization, trivialization or emotional exemption of wrongdoing?

### Decision Complexity

How genuinely difficult are the central decisions given competing duties, uncertainty, coercion and consequences?

### Psychological Realism

How plausible and coherent are the characters' motives, reactions and changes?

### Motivational Coherence

Do actions arise intelligibly from established character, knowledge and situation?

### Consequence Visibility

Does the film meaningfully show consequences of wrongdoing, or erase them?

### Repentance / Restitution

Does the story contain recognition, remorse, confession, restitution or change?

### Redemptive Movement

Does the narrative move toward truth, reconciliation, sacrificial love, justice, mercy, repentance or restoration?

This must not become a simplistic “happy Christian ending” score.

## 6. Numerical vs categorical dimensions

Not every concept benefits from numbers.

Recommended:

### Numeric internally / optionally publicly

- film craft: 0–100 or 0–10;
- moral complexity;
- severity;
- psychological realism;
- confidence;
- polarization (audience aggregate).

### Categorical preferred

- film stance toward an act;
- decision verdict;
- repentance state;
- type of pressure;
- moral category;
- spoiler level.

Public precision should never exceed methodological precision.

## 7. Confidence

Every interpretive claim can have confidence:

- `HIGH`
- `MEDIUM`
- `LOW`

or an internal numeric equivalent.

Confidence should depend on evidence clarity, not on how strongly an editor feels.

Low-confidence interpretations should be visibly distinguished from settled factual events.

## 8. Biblical principle layer

The biblical layer should not be reduced to attaching a verse to a score.

A normative judgment should ideally connect:

`MORAL EVENT → MORAL PRINCIPLE → SCRIPTURE REFERENCES → EXPLANATION → VERDICT`

Principles need qualification and context. The site should distinguish:

- direct biblical prohibition / command;
- broader biblical moral principle;
- wisdom judgment;
- disputed application;
- prudential judgment.

This prevents false certainty.

## 9. Decision analysis rubric

For a difficult choice, evaluate:

- duties in conflict;
- goods at stake;
- forbidden means;
- uncertainty;
- character knowledge;
- available alternatives;
- time pressure;
- threat/coercion;
- foreseeable harm;
- intention;
- actual outcome;
- whether later consequences were knowable at decision time.

### Required UI distinction

**What the character knew then** must be separable from **what the viewer knows later**.

This supports fair responsibility analysis and powers Knowledge Fog in the Decision Chamber.

## 10. Audience film rating

Future user-facing film enjoyment/quality score:

- separate from biblical/editorial judgment;
- likely 0.0–10.0 display;
- simple interaction;
- one current rating per user per film;
- historical rating changes preserved in event log;
- ratings before release should be rejected or handled separately.

### Aggregate

Never use plain arithmetic mean as the sole public rating.

Use a weighted model with at least:

- prior / shrinkage for sparse titles;
- anomaly resistance;
- one effective vote per account;
- anti-brigading signals;
- confidence / maturity state;
- raw aggregates preserved for audit.

A simple initial Bayesian baseline can be:

`weighted = (n / (n + m)) * R + (m / (n + m)) * C`

where:

- `R` = observed mean;
- `n` = effective rating count;
- `C` = platform prior mean;
- `m` = prior strength.

This is only a baseline; it does not replace anti-abuse weighting.

## 11. Audience moral perception

Audience should not vote on “what the Bible says.”

They can report their perception of the film:

- condemns;
- questions;
- ambivalent;
- normalizes;
- celebrates.

This is useful empirical data about reception, not doctrinal authority.

## 12. Vote-first, crowd-second

For dilemmas and moral-perception questions, default behavior should be:

1. user answers independently;
2. only then show community distribution.

Reason: visible social proof can bias subsequent answers and reduce the value of the dataset.

## 13. Polarization metric

A future `POLARIZATION` score can measure how dispersed a community distribution is.

For categorical votes, normalized Shannon entropy is a strong candidate:

`H = -Σ p_i log(p_i)`

Normalize by `log(k)` for `k` available options so the result maps to 0–1 / 0–100.

Interpretation:

- low entropy → consensus;
- high entropy → divided audience.

Do not call polarization “controversy” without context; a balanced distribution may arise from legitimate ambiguity.

## 14. Editorial–Audience Gap

For dimensions that can be mapped onto comparable scales, calculate an explicit difference.

Examples:

- film stance perception;
- moral clarity perception;
- selected decision verdicts;
- film quality.

The gap is itself a discovery surface:

- largest disagreements;
- films where audience and editors converge;
- scenes with unusual divergence.

Never average the two sides into a new compromise score.

## 15. Rating maturity / confidence labels

Suggested public states:

- `EARLY` — too few effective ratings;
- `EMERGING`;
- `ESTABLISHED`;
- `HIGH CONFIDENCE`.

Avoid pretending that 17 ratings and 170,000 ratings are equivalent.

## 16. Anti-manipulation principles

Store raw data, but calculate public aggregates separately.

Possible behavior signals:

- account age;
- verified account state;
- rating velocity;
- extreme monotony;
- correlated voting bursts;
- referrer/source spikes;
- release timing;
- repeated coordinated target patterns;
- automation indicators.

Critical fairness rule:

**Weight must never depend on agreement with editorial ideology or theology.**

A dissenting user with normal behavior is a valid participant.

## 17. Transparent anomaly handling

If a title experiences suspicious activity:

- preserve raw votes;
- reduce aggregate influence where justified;
- log moderation/aggregation events;
- expose a public note if intervention is material;
- avoid silently rewriting history.

## 18. User reputation

Future reputation should measure contribution quality, not orthodoxy or agreement.

Signals can include:

- useful scene notes;
- accepted factual corrections;
- well-reasoned counterarguments;
- helpful reviews;
- citation quality;
- moderation reliability.

Do **not** award trust merely for matching editorial verdicts.

## 19. Calibration plan

Before publishing authoritative numerical scales:

1. select 20–30 films covering many genres and moral structures;
2. have multiple editors score independently;
3. compare disagreement;
4. refine definitions;
5. identify dimensions with poor inter-rater reliability;
6. turn weak numeric dimensions into categorical or prose judgments where necessary;
7. version the rubric;
8. publish methodology.

## 20. External systems audited

Useful lessons from existing platforms:

- IMDb: weighted average and alternate weighting under unusual voting activity.
- Letterboxd: weighted calculations, sparse-rating shrinkage and unusual-pattern handling.
- Rotten Tomatoes: separation of critic and audience signals; verified audience concept.
- Steam: anomaly/review-bomb detection and score exclusion while preserving visibility of reviews.
- Common Sense Media: expert layer and user layer can coexist without being identical.
- Kids-In-Mind: category-specific ratings and detailed contextual descriptions outperform one opaque age label.
- Movieguide / Plugged In / Christian Answers: Christian/biblical moral review territory already exists, so DeepMovieReview must differentiate through structured scene-level analysis and interactive moral modeling.

See `07-REFERENCE-AUDIT.md` for source links.