# Case study: film analysis as a verified evidence graph

## Problem

A film can depict harmful behavior without endorsing it; a character's explanation need not justify the behavior; the film's craft and narrative intent are not reducible to a moral-event counter. A useful deep analysis must cover story, people, relationships, ideas, form, decisions and the editorial biblical lens **without** presenting a remembered scene, a secondary quotation or a hidden spoiler as verified direct evidence.

## What the repository implements

- **One film-package read authority.** [src/data/film-registry.ts](src/data/film-registry.ts) validates registered packages and exposes them to routes; presentation must not import draft and canonical film sources independently.
- **Explicit edition and evidence contracts.** [src/lib/film-package.ts](src/lib/film-package.ts) defines edition states, scenes, references and claims. [src/lib/film-package-integrity.ts](src/lib/film-package-integrity.ts) checks referential support and publication constraints before an invalid analysis becomes content.
- **Spoilers are a data boundary, not a visual blur.** [src/lib/film-module-projection.ts](src/lib/film-module-projection.ts) removes protected nested observations, interpretations or judgments **before** rendering them.
- **Evidence records retain their review basis.** The canonical [The Truman Show package](src/data/films/the-truman-show-canonical.ts) links the published film edition to recorded evidence, while distinguishing transcript checks, sampled frames, clips, unsupported/pending records and other verification limits. An identified master digest does **not** establish that the complete film was newly watched and listened to during a later review.
- **Editorial control is distinct from community judgment.** The protected product contracts in [AGENTS.md](AGENTS.md) reject collapsing film quality, moral severity and popularity into a single score.

The canonical Truman package is recorded as `published` since 2026-10-30, with a `LOCKED` edition. **Published is not synonymous with fully independently reverified, externally deployed, indexed or free of disputed interpretation.** The research-tier [earlier draft](src/data/films/the-truman-show.ts) is explicitly not a second active read authority.

## Reproducible local checks

Use the exact Node.js major specified by [package.json](package.json) (Node 24) and the repository's strict engine policy. The media tool tests also require FFmpeg and ffprobe.

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm audit --audit-level=info
npm run build
```

The tests examine integrity, styles, tooling, reading interactions and promotion constraints according to the repository's current configuration. On its own, a green CI does not prove the presence of permission to republish movie footage or that every historical scene reading has been verified in the locked master with sound. For current dependency security/compatibility scope read [docs/69-DEPENDENCY-SECURITY.md](docs/69-DEPENDENCY-SECURITY.md).

## Verifiable outcome and limits

**Verifiable in the repository:** a typed film-package domain, centralized evidence and version gates, spoiler-safe projections, a published canonical Truman film package with explicit review-basis metadata, a Node 24 build/test/CI contract and guarded preview/indexing policy.

**Not established by these facts:** a new complete video-and-sound rewatch of the exact viewing master, universal correctness of interpretation, current public-domain indexing, sustained live uptime, viewership, earnings or ownership of copyrighted film material.

For responsible attribution, source rights and human/AI boundaries see [OWNER.md](OWNER.md); for security disclosure see [SECURITY.md](SECURITY.md).
