# DeepMovieReview — Homepage & Content-Model Research Audit

> Audited: 2026-09-09  
> Scope: current immersive-web patterns plus film/media-review systems relevant to the expanded homepage and non-moral analysis model.

This document supplements `08-REFERENCE-AUDIT.md`. It is deliberately focused on two questions:

1. How should the homepage demonstrate a complex product without becoming an effects reel?
2. What analytical domains are missing if DeepMovieReview looks only at moral events?

## 1. Current interactive-web signals

### FWA — current winners feed
https://thefwa.com/rss/

The September 2026 sequence is useful because several consecutive winners demonstrate different interaction models rather than one dominant trend.

Current examples include:

- Awards Racing — physics/game world;
- Superlocal — clean visual event experience with motion;
- Lidar Drone Scanning — live browser point cloud;
- The Last Tango — WebGL/point-cloud memory storytelling;
- Gionatan Nese '26 — portfolio identity;
- Delafolla — walkable 3D world instead of conventional scrolling;
- Squarespace Foundations — interactive chapters explaining a system;
- Order & Chaos — experimental minimal layout system.

**DeepMovieReview takeaway:** there is no need to imitate one interaction fashion. The strongest principle is to choose a motion/space model that explains the subject. For us, the subject is the progressive opening of a film into story, people, relationships, ideas and judgment.

### Squarespace Foundations — FWA
https://thefwa.com/cases/squarespace-foundations

**Borrow:** interactive chapters can teach a system progressively.  
**Application:** homepage should reveal the DeepMovieReview analytical grammar through use, rather than front-loading a methodology diagram.

### The Last Tango — FWA
https://thefwa.com/cases/the-last

**Borrow:** particles/point clouds gain value when they carry a clear memory metaphor.  
**Application:** reserve point-cloud treatment for memory, legacy, consequence or audience field — never use particles as default atmosphere.

### Lidar Drone Scanning — FWA
https://thefwa.com/cases/lidar-drone-scanning

**Borrow:** raw spatial data can become an immediate visual object.  
**Application:** reinforces the idea that DeepMovieReview's structured analytical data should generate visual forms rather than sit only behind tables.

### Delafolla — FWA
https://thefwa.com/cases/porfolio-delafolla

**Borrow:** strong authored world and spatial exploration.  
**Do not borrow:** replacing standard research-site navigation with a game world.

### Superlocal — FWA
https://thefwa.com/cases/superlocal

**Borrow:** clean, visual, tightly sequenced storytelling can still feel contemporary without maximal 3D density.

## 2. Codrops / technical-creative patterns relevant to homepage

### Podium — cinematic storytelling through restraint
https://tympanus.net/codrops/2026/06/23/podium-building-a-website-where-running-becomes-storytelling/

**Key lesson:** rhythm, typography, spacing and selected transitions can preserve cinematic flow better than constant effects.

**DeepMovieReview application:** the homepage should alternate spectacle and editorial silence. Relationship, theme and biblical-principle sections need room to read.

### HAOQI.DESIGN — DOM and WebGL sharing a stage
https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/

**Key lesson:** DOM can own real layout/content/accessibility while WebGL owns distortion, lighting, glass and image-space effects.

**DeepMovieReview application:** relationship labels, plot claims, Scripture and analysis remain semantic DOM; GPU effects enrich them but never become the only representation.

### Relighting Images with Three.js
https://tympanus.net/codrops/2026/08/19/relighting-images-with-depth-maps-and-three-js/

**Key lesson:** depth maps can turn still imagery into responsive spatial surfaces.

**Application:** Living Film Frame, character portraits and relationship scenes can share a reusable depth/relighting pipeline.

### Mouse-Following Lens Distortion
https://tympanus.net/codrops/2026/08/25/mouse-following-square-lens-distortion-effect-with-rgb-shift/

**Application:** reference for Moral/Analytical Lens interaction; keep distortion subtle and semantic.

### Infinite Loom
https://tympanus.net/codrops/2026/09/05/building-an-infinite-loom-unravelling-images-into-threads-with-three-js/

**Application:** image decomposition can become `FILM → ANALYSIS`, but should happen only at meaningful transitions.

### Drawing With Light / GPU Tubes
https://tympanus.net/codrops/2026/09/07/drawing-with-light-an-exploration-of-lit-gpu-tubes-with-tsl-and-webgpu/

**Application:** relevant to `TRACE` as a physical light path connecting relationship events, plot causality or consequences.

### Infinite Liquid Glass Grid
https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/

**Application:** future Explore mode and one optical Lens surface. Avoid system-wide glass UI.

### Persistent WebGPU Page Transitions
https://tympanus.net/codrops/2026/06/30/building-persistent-page-transitions-with-webgpu-and-vanilla-javascript/

**Application:** film artwork can persist from homepage feature into film detail rather than cutting to a separate page.

### Infinite GSAP Gallery + Flip
https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/

**Application:** future `Explore` mode, but standard index/search must coexist.

### Scroll-Driven Blender Camera Path
https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/

**Application:** one authored journey/timeline can be effective, but do not force all film browsing onto a camera rail.

### More Than a Portfolio — scroll-driven world with a message
https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/

**Key lesson:** technical architecture should serve a message and scene composition.

### They Call Me Giulio — cinematic WebGPU portfolio
https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/

**Key lesson:** one project can justify different rendering strategies; pure Three.js may be preferable for render-target-heavy sequences while React can still handle structural DOM.

**Application:** do not lock every GPU subsystem behind one abstraction if signature effects need lower-level control.

### Goodgrowth portfolio case study
https://tympanus.net/codrops/2026/08/27/goodgrowth-boot-sequences-spinning-discs-and-the-art-of-the-portfolio/

**Application:** study system-level repetition of interaction motifs rather than copying individual boot/console aesthetics.

### ZERO — interactive narrative engineering
https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/

**Application:** a meaningful first interaction can teach the experience, but it must be fast and optional enough not to become a barrier.

## 3. Editorial / content-platform audit

### Common Sense Media — rating methodology
https://www.commonsensemedia.org/about-us/our-mission/about-our-ratings

Their system explicitly separates content categories from positive content. It asks questions about:

- overall takeaways/messages;
- responsible behavior;
- problematic viewpoints/stereotypes;
- whether characters are relatable or shallow;
- whether young viewers would want to emulate them;
- whether adults are present and responsible.

**DeepMovieReview takeaway:** `messages`, `role models`, `adult responsibility` and `consequences` are real product needs. We should go further by linking each to scenes, relationship arcs, film form and evidence-backed narrative claims.

### Common Sense Media — TV methodology
https://www.commonsensemedia.org/about-us/our-mission/about-our-ratings/tv

Useful explicit questions include whether adults are present/responsible and whether behavior has consequences.

**DeepMovieReview application:** validates dedicated `Parents & Authority`, `Youth & Formation` and `Narrative Permission` models.

### Common Sense Media — Keith example
https://www.commonsensemedia.org/movie-reviews/keith

This example explicitly discusses realistic teens, engaged adults, undesirable choices and which choices receive consequences.

**Application:** our model should separate:

- realistic portrayal;
- role-model status;
- narrative consequence;
- moral judgment.

These are not the same thing.

### Common Sense Media — Suite Life on Deck example
https://www.commonsensemedia.org/tv-reviews/the-suite-life-on-deck

Shows how absent/ineffective adults, weak discipline and peer behavior can be part of media analysis.

**Application:** family/authority analysis should not be limited to whether parents commit explicit sins.

### Common Sense Media — Daria example
https://www.commonsensemedia.org/tv-reviews/daria

Useful because satire and adolescent viewers complicate message interpretation.

**Application:** genre/satire and audience maturity must qualify message/role-model claims.

### Common Sense Media — Girl in Progress example
https://www.commonsensemedia.org/movie-reviews/girl-in-progress

Useful for parent/teen communication, adolescent imitation, risky behavior and consequences.

### Kids-In-Mind — methodology
https://kids-in-mind.com/about.htm

In addition to separate content-severity categories, they provide `DISCUSSION TOPICS` and `MESSAGES`.

**DeepMovieReview takeaway:** `Discussion Topics` are valuable enough to become structured cross-film discovery entities rather than only a text list.

### Kids-In-Mind — current Midwinter Break example
https://kids-in-mind.com/m/midwinter-break-parents-guide-movie-review-rating.htm

Shows explicit `DISCUSSION TOPICS` and a concise `MESSAGE` field.

**Application:** our `Theme → Question → Narrative Claim` graph can be richer and evidence-based.

### Kids-In-Mind — current Finding Emily example
https://kids-in-mind.com/f/finding-emily-parents-guide-movie-review-rating.htm

Shows relationship/love discussions appearing inside content inventory.

**Application:** DeepMovieReview should extract relationship structure from the inventory layer and analyze it directly.

### Plugged In — About
https://www.pluggedin.com/about/

Plugged In explicitly uses a biblical worldview filter and separates positive/negative content elements.

**Boundary:** DeepMovieReview cannot claim uniqueness merely from biblical analysis.

### Plugged In — Positive Elements methodology
https://www.pluggedin.com/blog/plugged-in-talks-content-positive-elements/

Plugged In deliberately searches for redemptive/positive themes even in films it strongly criticizes.

**Application:** our model must include virtues, relational goods, growth, sacrifice and truthful insights — not only failures.

### Plugged In — Spiritual Elements methodology
https://www.pluggedin.com/blog/plugged-in-talks-content-spiritual-elements/

**Application:** spiritual/worldview content can be multilayered and should not be reduced to a simple presence/absence tag.

### Plugged In — Midwinter Break example
https://www.pluggedin.com/movie-reviews/midwinter-break-2026/

The review discusses a long marriage, mutual affection, misunderstanding, change over time and spiritual questions.

**Application:** validates a dedicated relationship arc and marriage-analysis layer.

### Plugged In — Disclosure Day example
https://www.pluggedin.com/movie-reviews/disclosure-day-2026/

Useful for explicit truth-seeking themes plus spiritual/worldview tension.

**Application:** same film can have positive moral goods and worldview claims that need separate evaluation.

## 4. Research conclusions now elevated to product requirements

### Requirement A — The homepage must demonstrate whole-film analysis

The first major sequence must expose at least:

`STORY / PEOPLE / RELATIONSHIPS / IDEAS / MORAL WORLD / CRAFT`.

### Requirement B — Relationships become first-class data

Do not bury marriage, parent-child, friendship or peer dynamics inside scene prose.

### Requirement C — Youth/family/authority deserve dedicated analysis when relevant

The platform should be able to distinguish:

- absent vs responsible adults;
- wise vs abusive authority;
- adolescent autonomy vs mere rebellion;
- peer pressure;
- rites-of-passage framing;
- consequences and maturation.

### Requirement D — “What the film teaches” must be evidence-based

Teaching/message signals can arise through:

- explicit dialogue;
- role models;
- reward;
- punishment;
- normalization;
- humor;
- emotional framing;
- ending resolution;
- repeated assumptions.

### Requirement E — Narrative silence requires caution

Unchallenged behavior is analytically meaningful, but it is not identical to endorsement.

### Requirement F — Craft is part of moral/message interpretation

Music, camera, editing, performance and genre can alter admiration, empathy and imitation pressure.

### Requirement G — Interactive effects must demonstrate these analytical ideas

Preferred homepage uses:

- depth/relighting → film presence;
- Trace → plot and relationships;
- Lens → examination;
- Fog → limited knowledge;
- Fracture → conflict/rupture;
- Field → messages/permissions;
- Core → synthesis.

No effect should survive merely because it is fashionable.

## 5. Updated differentiation statement

A stronger product claim is:

> DeepMovieReview is a structured, interactive analysis of films as stories about people: plot, characters, relationships, social models, themes, messages, moral choices, consequences, filmmaking and biblical evaluation — all connected back to evidence.

This is much more defensible than “a Christian movie-rating site” or “a sophisticated sin counter.”