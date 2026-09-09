# DeepMovieReview — Community & Audience Architecture

> Status: future-facing foundation  
> Principle: design the data hooks now; do not overbuild social features in MVP.

## 1. Why this layer exists

The audience layer should create additional analytical value, not merely add stars and comments.

The strongest future question is not only “did users like this movie?” but:

- how did viewers interpret its moral stance?
- what would they choose in the same dilemma?
- where is consensus high or low?
- where does public perception diverge from editorial analysis?
- what reasons drive disagreement?

## 2. Four independent community signals

### A. Viewer Film Score

“How much did you value/enjoy this film as a film?”

Separate from biblical or moral score.

### B. Audience Moral Perception

“How do you perceive the film's stance toward this behavior/theme?”

Example options:

- condemns;
- questions;
- ambivalent;
- normalizes;
- celebrates.

### C. Decision Votes

“What should the character have done?” or “Was the action justified under the known circumstances?”

### D. Contribution Layer

Long-form reviews, scene notes, factual corrections, counterarguments and questions.

These are different content types and should remain different in schema and moderation.

## 3. Vote-first, crowd-second

For interpretive and dilemma questions:

1. hide distribution;
2. collect the user's independent answer;
3. reveal distribution afterward.

This creates better data and a more interesting reveal moment.

Do not show “82% agree” before asking the user to think.

## 4. Interaction ladder

Community participation must support different levels of effort.

### ~1 second

- like / save;
- basic film rating.

### ~5 seconds

- film rating + one categorical perception question.

### ~20 seconds

- a few dimensions or a single dilemma.

### ~2 minutes

- several Decision Chamber votes.

### 10+ minutes

- review;
- scene note;
- counterargument;
- proposed correction.

Never force a long form where a quick action is sufficient.

## 5. Rate This Film UX

The rating surface should feel integrated into the cinematic system, not like a modal form.

Candidate behavior:

- hero/poster recedes;
- one large numeric value becomes focus;
- drag/click/keyboard control chooses rating;
- save immediately;
- optional “go deeper” questions appear afterward.

Accessibility:

- drag cannot be the only mechanism;
- arrow keys / buttons / direct selection must work;
- explicit accessible labels;
- no hidden destructive rating changes.

## 6. Judge the Scene

A flagship future interaction.

Potential steps:

1. confirm / challenge act classification;
2. estimate responsibility / culpability;
3. identify strongest pressure;
4. judge whether the action was justified;
5. report perceived narrative stance;
6. optionally give reason.

Results reveal only after user's response.

This interaction lets users partially apply the same analytical framework as editors without pretending that the crowd defines the methodology.

## 7. Moral Mirror

A future personal reflection surface based on user's decisions.

Must be descriptive, not spiritually diagnostic.

Allowed outputs:

- “You agreed with the editorial conclusion in 8 of 12 dilemmas.”
- “You selected coercion as decisive more often than the community average.”
- “Your largest disagreement was Scene 14.”

Forbidden framing:

- “You are 74% biblical.”
- “Your morality score is 61.”
- “You are a consequentialist” based on a few entertainment votes.

The system should not infer sensitive personal identity or worldview labels from entertainment behavior.

## 8. Audience Field

Visual counterpart to the Editorial Moral Core.

### Editorial Core

A deterministic or editorially controlled film fingerprint.

### Audience Field

A surrounding distribution of audience interpretations / decisions.

Possible visual behavior:

- high consensus → compact coherent field;
- high polarization → multiple clusters;
- strong editorial–audience gap → audience centroid visibly displaced from Core;
- low response count → sparse / explicitly “early” field.

Never mutate the Editorial Core based on crowd voting.

## 9. Consensus and polarization

Potential derived metrics:

- consensus percentage;
- normalized entropy / polarization;
- response count;
- effective response count;
- confidence state;
- editorial–audience gap.

The UI must make sample size visible enough to prevent false authority.

## 10. Why People Disagree

After a vote, optionally ask for one primary reason:

- necessity;
- protection of another;
- truth duty;
- insufficient knowledge;
- coercion;
- loyalty;
- justice;
- mercy;
- consequences;
- other.

This produces a second-order dataset more useful than comments alone.

## 11. Community Reveal

A strong film-page pattern:

1. visitor reads editorial analysis without crowd contamination;
2. reaches final Verdict;
3. chooses `SEE COMMUNITY`;
4. audience traces / distributions become visible over already familiar scenes.

This preserves editorial clarity and makes community data feel like a second analytical layer.

## 12. Review content types

Do not create one generic `comments` bucket.

### User Review

A film-level review.

### Moral Response

A response to overall editorial analysis.

### Scene Note

A note anchored to a specific scene/event.

### Counterargument

A reasoned challenge to an editorial claim.

### Factual Correction

A proposed correction to timestamp, plot fact, attribution, etc.

### Question

A question about analysis or method.

Different types can have different moderation and ranking rules.

## 13. Counterargument system

This can become a major intellectual feature.

Editorial claim:

> The character's action is unjustified despite extreme pressure.

Below it:

`STRONGEST COUNTERARGUMENT`

Community voting should ask:

- useful;
- well reasoned;
- well evidenced;

rather than simply “agree/disagree.”

Editors can respond or revise analysis while preserving version history.

## 14. Helpful voting and contribution trust

Community reputation should emerge from useful contribution.

Potential positive signals:

- accepted factual correction;
- scene note marked useful;
- counterargument rated well reasoned;
- cited evidence;
- consistent moderation quality;
- high-quality review history.

Never use agreement with the editorial biblical conclusion as a trust factor.

## 15. Contributor levels

Possible future progression:

- Level 0: ratings / polls;
- Level 1: comments / reviews;
- Level 2: scene notes;
- Level 3: propose category corrections;
- Level 4: propose missing moral events;
- Trusted Contributor: review community submissions.

Editorial publication rights remain separate.

## 16. Anti-brigading and review bombing

The platform is likely to attract coordinated voting around controversial films or cultural topics.

Prepare for:

- sudden signup spikes;
- mass 0/10 or 10/10 campaigns;
- external referral waves;
- automated accounts;
- synchronized category responses;
- retaliatory voting against contributors;
- pre-release rating campaigns.

Signals should focus on behavior and integrity, never theological agreement.

## 17. Raw vs public aggregates

Keep at least:

```text
raw_mean
raw_median
raw_count
effective_count
weighted_score
confidence_state
anomaly_state
aggregation_version
```

Preserve event history so public score changes can be audited.

## 18. Rating snapshots

Periodically persist aggregate snapshots.

Future feature: **Reception Over Time**.

Examples:

- Viewer score over years;
- moral-stance perception over time;
- polarization over time;
- editorial–audience gap over time.

This can make old films analytically interesting again.

## 19. User profile: cinema first

A profile should emphasize cinema behavior, not vanity metrics.

Potential sections:

- watched films;
- ratings;
- decisions answered;
- reviews;
- lists;
- favorite genres;
- most difficult dilemmas;
- recent contributions.

Follower counts should not dominate the profile.

## 20. Lists

Future editorial and user lists can be morally semantic, not only genre/year based:

- films about revenge;
- strongest depictions of repentance;
- stories where loyalty becomes complicity;
- films that romanticize villains;
- morally complex science fiction;
- difficult truth-vs-protection dilemmas;
- stories of guilt and restitution.

Lists should reference structured moral topics when possible.

## 21. Recommendations / taste engine

Very late phase.

Potential outputs:

- predicted film enjoyment;
- likely genre/style fit;
- warning that moral content is heavier than user's usual viewing pattern;
- recommended related dilemmas / themes.

Do not infer religious identity, politics, psychological diagnosis or moral worth from user behavior.

## 22. Reviewer compatibility

Possible future feature: historical similarity between a user’s film-quality ratings and specific editorial reviewers.

Frame only as rating compatibility, not ideological alignment.

## 23. Privacy defaults

Plan for:

- public/private ratings;
- private watch history;
- private decision answers if desired;
- delete/export pathways;
- no unnecessary exposure of behavioral profile;
- explicit control of public profile surfaces.

## 24. Minimum schema hooks now

Even before any community UI ships, reserve domain concepts for:

```text
users
user_film_ratings
user_dimension_ratings
user_scene_responses
user_question_responses
user_reviews
user_scene_notes
user_counterarguments
content_votes
rating_events
rating_aggregates
rating_snapshots
moderation_events
abuse_signals
contributor_reputation
```

They do not all need migrations on day one, but the current domain model must not assume “only editors ever create data.”

## 25. Rollout sequence

### Community Phase 1

- Rate This Film;
- Was This Analysis Useful?

### Community Phase 2

- Moral perception;
- Decision polls;
- audience histograms;
- weighted viewer score.

### Community Phase 3

- Judge the Scene;
- reviews;
- counterarguments;
- helpfulness;
- Community Reveal.

### Community Phase 4

- profiles;
- watchlist;
- lists;
- personal history;
- Moral Mirror.

### Community Phase 5

- Audience Field;
- Moral Atlas community filters;
- Dilemma Atlas;
- reception over time;
- trusted contributor system;
- recommendation/taste layer.

The launch should not depend on network effects.