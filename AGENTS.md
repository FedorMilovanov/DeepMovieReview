# DeepMovieReview — coding agent entrypoint

Before changing product behavior or visual language, read:

1. `README.md`
2. `docs/09-AGENT-BUILD-RULES.md`
3. `docs/14-HOMEPAGE-LAUNCH-CUT-V1.md`
4. `docs/15-HOMEPAGE-DATA-CONTRACTS.md`
5. `docs/16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md`
6. `docs/05-TECHNICAL-ARCHITECTURE.md`

## Current implementation phase

Phase 0.5 — App Shell.

The immediate goal is a semantic, responsive, accessible platform shell before premium GPU effects and before any deep real-film editorial analysis.

## Current rules

- Next.js App Router + strict TypeScript.
- Prefer Server Components by default.
- Meaningful content stays in semantic DOM.
- Do not introduce WebGPU/Three.js into the global shell until the plain DOM/CSS homepage is stable.
- Do not hard-code authoritative film analysis inside React components; use typed content/domain fixtures or adapters.
- `fixture` content is structural test data, not a published editorial judgment.
- Preserve `Depiction ≠ Endorsement`, `Explanation ≠ Justification`, `Representation ≠ Prescription`, `Editorial ≠ Crowd`.
- Respect reduced motion and touch from the first implementation.
- No new animation library without documenting its unique ownership/responsibility.

## Next.js specifics

This project targets Next.js 16.3.x. Remember that route `params` / `searchParams` are asynchronous in modern App Router patterns. Keep client boundaries narrow and serializable.
