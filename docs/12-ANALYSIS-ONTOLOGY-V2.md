# DeepMovieReview — Analysis Ontology v0.2

> Status: domain expansion proposal  
> Date: 2026-09-09  
> Purpose: broaden the project from moral-event analysis into a full structured analysis of story, people, relationships, meaning, social models, narrative permission, craft and biblical judgment.

## 1. Why this expansion is required

DeepMovieReview must not imply that a film is reducible to a ledger of sins and virtues.

A serious analysis needs to answer several different classes of questions:

- What is the story actually about?
- How is the plot constructed?
- Who are these characters and what drives them?
- Which relationships define the film?
- What models of marriage, family, friendship, authority and adolescence does it portray?
- What does the film imply about how those relationships should work?
- What themes and existential questions recur?
- What does the film explicitly say, and what does it implicitly teach through reward, consequence, admiration, comedy or omission?
- Which behavior is condemned, questioned, normalized, ignored, rewarded or celebrated?
- How does filmmaking form create sympathy, disgust, admiration, distance or imitation pressure?
- How should the film's claims and examples be assessed biblically?

The ontology therefore needs to represent the **whole interpretive object**, not only morally significant actions.

## 2. Revised domain graph

The previous core graph remains valid but becomes one branch of a larger model.

```text
FILM
├── EDITION
│   ├── SEQUENCE / SCENE
│   └── RELEASE-SPECIFIC EVIDENCE
├── STORY MODEL
│   ├── PREMISE
│   ├── CONFLICT
│   ├── PLOT BEATS
│   ├── TURNING POINTS
│   └── ENDING / RESOLUTION
├── CHARACTER
│   ├── DESIRE / FEAR / NEED
│   ├── ARC
│   ├── PSYCHOLOGICAL MODEL
│   └── NARRATIVE FUNCTION
├── RELATIONSHIP
│   ├── TYPE
│   ├── BASELINE
│   ├── RELATIONSHIP EVENTS
│   ├── POWER / RESPONSIBILITY
│   ├── CONFLICT / REPAIR
│   └── ARC / OUTCOME
├── THEME / QUESTION
│   ├── NARRATIVE CLAIM
│   ├── COUNTERCLAIM
│   └── EVIDENCE
├── WORLDVIEW / SOCIAL MODEL
│   ├── FAMILY
│   ├── PARENTHOOD
│   ├── YOUTH / ADOLESCENCE
│   ├── ROMANCE / MARRIAGE
│   ├── FRIENDSHIP
│   ├── AUTHORITY
│   ├── WORK / VOCATION
│   ├── COMMUNITY
│   └── SPIRITUAL / EXISTENTIAL CLAIMS
├── TEACHING SIGNAL
│   ├── EXPLICIT LESSON
│   ├── ROLE MODEL
│   ├── REWARD / PUNISHMENT
│   ├── NORMALIZATION
│   ├── HUMOR / RIDICULE
│   ├── ENDING RESOLUTION
│   └── UNCHALLENGED ASSUMPTION
├── MORAL EVENT
│   ├── ACTOR / MORAL AGENT
│   ├── ACT
│   ├── MOTIVE / INTENTION
│   ├── KNOWLEDGE / FREEDOM / PRESSURE
│   ├── CONSEQUENCE
│   └── RESPONSIBILITY
├── CRAFT OBSERVATION
│   ├── CAMERA / POV
│   ├── PERFORMANCE
│   ├── EDITING
│   ├── MUSIC / SOUND
│   ├── PRODUCTION DESIGN
│   ├── GENRE / HUMOR
│   └── EMPATHY / IMITATION EFFECT
└── EDITORIAL CLAIM
    ├── EVIDENCE
    ├── CONFIDENCE
    ├── BIBLICAL PRINCIPLE
    ├── COUNTEREVIDENCE
    └── VERDICT
```

## 3. Story and plot model

A film needs structured story analysis before normative judgment.

### 3.1 Synopsis layers

Store at least three possible synopsis depths:

- **PREMISE** — spoiler-safe one or two sentence setup;
- **EXTENDED SYNOPSIS** — major setup/conflict, avoids ending when possible;
- **FULL STORY SYNOPSIS** — complete analytical summary including ending.

These should be separate records/versions rather than one paragraph with CSS blur.

### 3.2 Plot structure

Candidate entities/fields:

- central dramatic question;
- protagonist goal;
- primary obstacle;
- stakes;
- inciting disruption;
- turning points;
- midpoint/reversal where analytically useful;
- crisis;
- climax;
- resolution;
- unresolved thread;
- narrative causality;
- subplot relationships.

Do not force every film into one screenplay template. Structure labels are analytical aids, not universal laws.

### 3.3 Story coherence

Possible analytical dimensions:

- causal coherence;
- motivation continuity;
- setup/payoff quality;
- pacing;
- internal rules;
- ending coherence;
- thematic integration.

## 4. Character analysis

A character record should contain more than a moral arc.

### 4.1 Character core

Candidate fields:

- dramatic role;
- initial condition;
- stated desire;
- deeper need where supported;
- central fear;
- loyalties;
- contradictions;
- strengths;
- weaknesses;
- self-image;
- how others see the character;
- narrative point-of-view weight;
- role-model / cautionary / ambiguous function;
- ending state.

### 4.2 Character arc

Candidate arc events:

- challenge;
- temptation;
- compromise;
- revelation;
- escalation;
- moral fall;
- resistance;
- sacrifice;
- repentance;
- repair;
- hardening;
- transformation;
- tragic recognition;
- restoration.

Arc labels must be evidence-backed. Characters may remain static by design.

### 4.3 Image of the person

The platform should be able to ask what image of human nature the film constructs.

Examples of analytical questions:

- Are people primarily self-interested, relational, redeemable, trapped, free, determined, heroic, absurd, spiritually hungry?
- Does the story treat character as changeable?
- Is identity received, chosen, performed, imposed or discovered within the film's logic?
- What does the story think a mature person looks like?

These are interpretive claims, not score columns by default.

## 5. Relationship model

Relationships should be first-class entities.

### 5.1 Relationship types

Examples:

- marriage;
- romance / dating;
- parent ↔ child;
- sibling;
- friendship;
- mentor ↔ student;
- peer group;
- leader ↔ follower;
- employer ↔ worker;
- authority ↔ citizen;
- caregiver ↔ dependent;
- rival;
- exploiter ↔ victim;
- community / group belonging.

A relationship can change type or contain multiple roles over time.

### 5.2 Relationship dimensions

Candidate descriptive dimensions:

- trust;
- honesty;
- communication;
- reciprocity;
- commitment;
- fidelity;
- responsibility;
- affection;
- sacrifice;
- respect;
- power asymmetry;
- authority;
- dependence;
- boundaries;
- manipulation;
- fear;
- control;
- enabling;
- conflict;
- forgiveness;
- repair;
- restitution;
- stability.

Do not publish all as numeric bars. Most are evidence tags or prose-supported states.

### 5.3 Relationship event

A scene can change a relationship.

Candidate fields:

- relationship_id;
- scene_id;
- event type;
- before state;
- action/interaction;
- after state;
- trust change;
- power change;
- responsibility fulfilled/neglected;
- repair attempt;
- consequence;
- film framing;
- confidence.

This powers a `Relationship Trace` across the film.

### 5.4 Descriptive vs normative relationship analysis

Always separate:

**OBSERVED RELATIONSHIP** — how it functions in the film;

from:

**NORMATIVE ASSESSMENT** — how specific behaviors or relational patterns should be evaluated biblically.

Avoid vague claims such as “this is how relationships should be.” Prefer specific principles:

- truthfulness;
- fidelity;
- sacrificial love;
- parental responsibility;
- honoring rightful authority;
- protection of the vulnerable;
- boundaries against abuse/manipulation;
- reconciliation where possible;
- justice and restitution.

## 6. Marriage and romance

The platform should be able to analyze more than presence/absence of sexual content.

Questions can include:

- What does the film say love is?
- Is love portrayed as desire, covenant, sacrifice, possession, validation, escape, self-discovery, mutual formation, etc.?
- Are honesty and fidelity treated as essential, optional or obstacles?
- How are jealousy, control, sacrifice and forgiveness framed?
- Does romance displace all other duties?
- Are harmful patterns romanticized by music/camera/performance?
- Does the ending reward relational irresponsibility?
- Does the film distinguish attraction from mature love?

Potential structured observations:

- courtship model;
- commitment model;
- fidelity state;
- sexual-boundary portrayal;
- consent / coercion where relevant;
- conflict pattern;
- repair pattern;
- power imbalance;
- sacrifice / self-giving;
- ending model.

## 7. Parent / child and family model

Family portrayal is a major analytical surface.

### 7.1 Parent / caregiver dimensions

Observe:

- presence / absence;
- attentiveness;
- warmth;
- protection;
- provision;
- consistency;
- discipline;
- boundaries;
- instruction;
- modeling;
- hypocrisy;
- sacrifice;
- negligence;
- indulgence;
- abuse / manipulation;
- enabling;
- willingness to repair;
- responsibility under pressure.

### 7.2 Child / adolescent dimensions

Observe:

- honesty with parents;
- respect / contempt;
- dependence / healthy autonomy;
- peer pressure;
- rebellion;
- responsibility;
- work / school attitude;
- sexuality / romance;
- risk behavior;
- substances;
- digital/social behavior where relevant;
- self-control;
- vulnerability;
- teachability;
- consequences;
- maturation.

### 7.3 Family system questions

- Who actually carries responsibility in the household?
- Are adults present and competent?
- Are children forced into adult roles?
- Is parental authority represented as wise, arbitrary, absent, abusive or ridiculous?
- Does the film confuse rejection of abusive authority with rejection of authority itself?
- Does the family repair conflict, avoid it, manipulate around it or dissolve under it?
- What patterns are inherited across generations?

These should be represented as claims with evidence, not broad stereotypes.

## 8. Youth / adolescent portrayal

A dedicated youth model is justified because many films shape expectations about adolescence.

Potential questions:

- What behavior is presented as normal teenage behavior?
- What behavior is framed as immature vs admirable independence?
- Are parents/teachers uniformly incompetent to make youth rebellion look automatically wise?
- How is peer approval used?
- Are sex, alcohol, drugs, dishonesty, rule-breaking or risk presented as rites of passage?
- Are consequences shown or erased?
- What forms of courage, loyalty, responsibility, restraint or repentance are modeled?
- What image of adulthood is offered?

Suggested public module names:

- `YOUTH & FORMATION`;
- `PARENTS & AUTHORITY`;
- `WHAT GROWING UP MEANS HERE`.

Avoid turning this into a generic age-appropriateness score.

## 9. Friendship and loyalty

Friendship deserves structured analysis because films frequently treat loyalty as a supreme good without distinguishing loyalty from complicity.

Questions:

- Is the friendship reciprocal?
- Does one person tell the other the truth?
- Does loyalty protect wrongdoing?
- Is sacrifice ordered toward another person's good or toward enabling them?
- Does friendship survive disagreement?
- Are betrayal and reconciliation meaningful?
- Does the film celebrate “ride or die” loyalty even when it becomes complicity?

This connects directly to the Dilemma Atlas topic `loyalty vs complicity`.

## 10. Authority, institutions and social models

Films frequently make implicit claims about authority.

Possible subjects:

- parents;
- teachers;
- police;
- courts;
- church/religious leaders;
- employers;
- government;
- military;
- medical authority;
- community norms.

Analyze:

- legitimacy;
- competence;
- corruption;
- abuse;
- accountability;
- obedience / resistance;
- responsibility of leaders;
- responsibility of subjects;
- film's generalization from one authority figure to authority as such.

## 11. Theme, meaning and narrative questions

### 11.1 Theme

A recurring subject, tension or idea.

Examples:

- guilt;
- fatherhood;
- revenge;
- ambition;
- belonging;
- mortality;
- forgiveness;
- justice;
- romantic love;
- truth;
- identity;
- sacrifice;
- hope.

### 11.2 Narrative question

A question the film meaningfully explores.

Examples:

- Can a person escape the consequences of self-deception?
- What does a father owe his child?
- Does revenge heal grief?
- Can love survive without truth?

### 11.3 Narrative claim

An evidence-backed interpretation of the film's apparent answer.

Candidate fields:

- claim text;
- scope;
- type;
- confidence;
- supporting scenes;
- counterevidence;
- ending weight;
- character/relationship relations;
- craft evidence;
- worldview topic relations.

A film can support multiple competing claims. Do not flatten ambiguity prematurely.

## 12. Worldview model

`Worldview` should not be one opaque score.

Possible claim families:

### Anthropology

What is a human person? What drives people? Can they change?

### Moral order

Is good/evil objective, negotiated, social, personal, arbitrary or meaningless within the film's logic?

### Freedom / responsibility

Are characters morally responsible or mostly determined by circumstance?

### Meaning / purpose

Where does purpose come from?

### Happiness / flourishing

What does the film portray as a good life?

### Love / relationships

What makes relationships good, durable or destructive?

### Family / generations

What duties bind parents, children, spouses and kin?

### Justice / power

What counts as justice? What legitimizes authority or resistance?

### Spiritual / transcendent claims

What does the film imply about God, faith, death, providence, fate, soul, transcendence or ultimate hope?

Public UI should present argued claims, not ideological labeling for its own sake.

## 13. Teaching signal model

The question `What does this film teach?` needs a model more precise than quoting dialogue.

A film can teach/shape perception through several channels.

### 13.1 Explicit teaching

Dialogue, narration, title cards, speeches or explicit resolutions.

### 13.2 Exemplary teaching

Characters presented as role models or cautionary examples.

### 13.3 Consequential teaching

What actions are followed by meaningful costs, growth, reward, reconciliation or destruction.

### 13.4 Affective teaching

What viewers are invited to admire, desire, enjoy, pity, fear or laugh at.

### 13.5 Normalizing teaching

Repeated behavior treated as unremarkable social reality.

### 13.6 Omission / silence

A behavior may be left morally unexamined.

Critical rule:

**Narrative silence ≠ automatic endorsement.**

But repeated unchallenged behavior can still be a meaningful reception/formation signal, especially when combined with admiration, reward and lack of consequence.

### 13.7 Ending teaching

The final resolution often carries disproportionate interpretive weight.

Store whether an ending:

- confirms earlier claims;
- complicates them;
- reverses them;
- evades consequences;
- rewards a behavior;
- restores a relationship;
- leaves tension unresolved.

## 14. Narrative Permission model

This model answers:

> How does the film's world treat a behavior, value or relationship pattern?

Candidate categorical states:

1. `CONDEMNED`
2. `COSTLY`
3. `QUESTIONED`
4. `UNCHALLENGED`
5. `NORMALIZED`
6. `REWARDED`
7. `CELEBRATED`
8. `AMBIGUOUS`

Modifiers:

- comic;
- romanticized;
- aestheticized;
- tragic;
- satirical;
- excused;
- grieved;
- imitated;
- marginalized;
- culturally assumed.

### 14.1 Why this is not the same as film stance

`Film stance` can be attached to a specific act/event/category.

`Narrative permission` is broader: it describes the practical moral atmosphere of the film's world.

Example:

A film may never explicitly celebrate casual dishonesty, yet make it a routine, consequence-free tool used by charming protagonists. That is a different analytical observation from an explicit moral endorsement claim.

## 15. Role-model and imitation analysis

A role model is not merely a “good person.”

Questions:

- Does the film invite identification with this character?
- Which traits are aspirational?
- Which flaws are recognized by the narrative?
- Which flaws are part of the character's charisma?
- Does success make harmful behavior attractive?
- Are adolescents or children likely to read the character differently from an adult viewer?
- Does the film itself supply a countermodel?

Candidate tags:

- aspirational;
- cautionary;
- charismatic-but-destructive;
- mixed;
- comic anti-model;
- mentor;
- corrupt mentor;
- absent adult;
- responsible adult;
- peer leader.

## 16. Craft and meaning

Craft analysis should not be a detached review score. It can supply evidence for interpretation.

### 16.1 Direction / blocking

Who controls the frame? Who is isolated? Who dominates physical space?

### 16.2 Cinematography

- POV;
- proximity;
- lighting;
- glamour / ugliness;
- scale;
- subjectivity;
- visual motif.

### 16.3 Editing

- causal association;
- juxtaposition;
- pace;
- withholding/revealing information;
- reaction shots;
- montage.

### 16.4 Music and sound

- triumph;
- romance;
- irony;
- dread;
- grief;
- comic permission;
- identification.

### 16.5 Performance

Actors can make an action sympathetic, frightening, comic or contemptible independent of dialogue.

### 16.6 Genre

Genre conventions can change how behavior is received. A joke, fantasy exaggeration, noir antihero or satire requires contextual analysis.

## 17. Empathy Pressure and Imitation Pressure

Keep these separate.

### Empathy Pressure

How strongly does the filmmaking ask the viewer to understand or feel with a character?

Empathy is not endorsement.

### Imitation Pressure

How strongly does the filmmaking make a behavior/lifestyle look admirable, desirable, glamorous, socially rewarded or identity-conferring?

Possible evidence:

- aspirational imagery;
- charisma;
- success/reward;
- peer approval;
- music;
- romantic framing;
- comic framing;
- absence of victims/consequences;
- repeated copyable behavior.

This is especially relevant for youth-facing analyses.

## 18. Proposed analysis facets

Public film pages should eventually support independent facets such as:

### Film / craft

- cinematic quality;
- storytelling;
- performances;
- visual/sound craft;
- narrative coherence.

### Character / psychology

- character depth;
- psychological realism;
- motivational coherence;
- arc credibility.

### Relationships

- relationship depth;
- relational realism;
- family/parent-child portrayal where central;
- friendship/romance/marriage analysis where central.

### Ideas / meaning

- thematic depth;
- thematic coherence;
- worldview/message clarity;
- interpretive ambiguity;
- discussion value.

### Moral / biblical

- depicted-content severity;
- moral clarity;
- normalization/romanticization pressure;
- consequence visibility;
- decision complexity;
- repentance/restitution;
- redemptive movement.

Not every facet needs a public number. Prose, category and confidence are often better.

## 19. Discussion Value

A useful non-moral summary dimension may be `DISCUSSION VALUE`.

It measures whether the film raises substantial questions worth discussing, not whether its answers are good.

Potential factors:

- genuine moral/relational dilemmas;
- thematic depth;
- interpretive openness;
- psychologically credible conflict;
- cross-generational questions;
- worldview tension;
- meaningful counterevidence.

A morally confused film can still have high discussion value.

## 20. Proposed new entities

The conceptual schema should grow to include structures such as:

```text
story_summaries
story_structures
plot_beats
plot_threads

character_profiles
character_arc_events

relationships
relationship_types
relationship_events
relationship_states

families_or_social_groups
social_model_observations
portrayal_assessments

themes
narrative_questions
narrative_claims
worldview_topics
worldview_claims

teaching_signals
narrative_permissions
role_model_assessments

craft_observations
empathy_observations
imitation_observations

discussion_topics
```

These complement rather than replace:

```text
scenes
moral_events
decisions
claims
biblical_principles
editorial_scores
```

Exact SQL normalization remains an implementation decision.

## 21. Evidence architecture expansion

Evidence can now support claims in several domains.

Evidence types may include:

- scene action;
- plot consequence;
- relationship change;
- repeated pattern;
- dialogue paraphrase / permitted excerpt;
- framing / camera;
- performance;
- music/sound cue;
- editing association;
- character reaction;
- ending resolution;
- omission/silence when analytically relevant;
- creator statement, clearly separated from textual evidence;
- biblical/theological source for normative claims.

Each claim should expose `Why do we say this?` without forcing all evidence into the first reading layer.

## 22. Confidence and counterevidence

The broader the analysis, the more important uncertainty becomes.

For themes/messages/relationship interpretations:

- `HIGH` — recurring and strongly resolved;
- `MEDIUM` — substantial evidence, meaningful counterevidence;
- `LOW` — plausible interpretation but underdetermined.

Strong analyses should include the best counterevidence.

Example:

> The film mostly portrays this relationship as healing, **but** two late scenes undermine the claim that honesty has actually been restored.

## 23. Spoiler architecture expansion

Spoiler levels must apply not only to events, but also to:

- full synopsis;
- relationship arcs;
- character transformations;
- theme conclusions;
- ending claims;
- narrative-permission findings;
- final worldview verdict.

A spoiler-safe page can still discuss premise, broad themes, tone and content concerns without revealing final resolution.

## 24. Review-page modular library expansion

Add optional modules beyond the existing moral-forensics sections:

- Story at a Glance;
- Full Plot Structure;
- Why This Story Works / Fails;
- Character Portrait;
- Character Arc;
- Relationship Observatory;
- Marriage / Romance;
- Parent & Child;
- Family System;
- Youth & Formation;
- Friendship / Loyalty;
- Authority / Institutions;
- Themes & Questions;
- What the Film Appears to Say;
- What the Film Teaches by Example;
- Narrative Permission Map;
- Role Models / Anti-Models;
- Form Shapes Sympathy;
- Craft & Meaning;
- Discussion Questions;
- Biblical Evaluation;
- Final Synthesis.

Not every film needs every module.

## 25. Search/discovery expansion

Structured data should eventually answer queries such as:

- films about absent fathers;
- strong father-child reconciliation arcs;
- films where teen rebellion is romanticized;
- movies with responsible adult role models;
- stories where friendship becomes complicity;
- marriages rebuilt after betrayal;
- films that treat casual dishonesty as normal;
- films that punish vengeance but glamorize it aesthetically;
- movies asking whether love requires truth;
- films about adulthood as responsibility;
- high discussion-value films about family;
- movies where the ending reverses the apparent message.

This is a major differentiator from shallow genre/content filters.

## 26. External audit lessons incorporated

Existing systems validate several parts of this broader model:

- Common Sense Media separately evaluates positive messages, role models, adult responsibility, consequences and other content categories.
- Kids-In-Mind includes `MESSAGES` and `DISCUSSION TOPICS` in addition to content severity.
- Plugged In explicitly separates `Positive Elements`, `Spiritual Elements`, sexual/romantic content, violence, language, substances and other noteworthy material.

DeepMovieReview should go further by connecting these ideas to structured scenes, relationships, narrative claims, evidence, confidence, film form and biblical principles rather than treating them only as review headings.

## 27. Non-goals / safety against overreach

Do not:

- diagnose characters clinically without sufficient basis;
- turn every family into a scorecard;
- assume every absent consequence equals endorsement;
- assume every sympathetic character is a role model;
- confuse representation with prescription;
- treat adolescence as inherently morally suspect;
- reduce relationships to sexual-content inventory;
- infer creator intent when only textual/narrative evidence is available;
- convert every interpretive judgment into a pseudo-precise number;
- force one biblical application where the issue is genuinely prudential or disputed.

## 28. Revised north-star statement

DeepMovieReview should eventually be able to answer, for a single film:

> What story is this telling? Who are these people? What do their relationships reveal? What kind of family, friendship, love, authority and adulthood does the film imagine? What questions does it ask? What answers does it imply? What does it make attractive, normal, costly or contemptible? How does filmmaking shape our sympathy? Where is the story truthful, confused or morally distorted? And how should its claims and examples be evaluated in light of Scripture?

That is the proper scope of the platform.