# DeepMovieReview — Living Frame R&D Decision

> Status: R&D-02 completed
> Date: 2026-09-11
> Issue: #5
> Decision: **B / segmented planes is the launch path; C / Lite static is the mandatory fallback. A / depth mesh is not the production default.**

## 1. Question

The Living Frame spike compared one semantic fixture through three rendering strategies:

- **A / depth mesh** — 2.39:1 procedural master + matched depth texture on a subdivided R3F plane;
- **B / segmented planes** — environment / architecture / subject DOM planes with bounded pointer-driven CSS transforms;
- **C / Lite static** — the same composition without pointer choreography or GPU dependency.

The goal was not to prove that GPU is impressive. It was to select the cheapest treatment that preserves cinematic presence, semantic DOM, accessibility and graceful degradation.

## 2. Exact-head evidence

Final verified PR head before this decision document:

`4755f49cf6098beca6bd9925f8a1fc051de90e09`

CI run **#197** passed:

- locked install;
- typecheck;
- domain regression tests;
- lint;
- production build / route smoke;
- browser visual + accessibility audit;
- clean public rebuild;
- public access / preview-isolation smoke.

The browser artifact reported no failed checks, no console/runtime errors and no failed HTTP resources.

### Controlled CI measurements

| Variant | active frame p95 | pointer → render p95 | modeled GPU texture working set | network asset transfer |
| --- | ---: | ---: | ---: | ---: |
| A / depth mesh | 165.5 ms | 164.9 ms | 465,664 B (~455 KiB) | 0 B / procedural fixture |
| B / segmented planes | 16.7 ms | 14.2 ms | 0 B | 0 B / procedural fixture |
| C / Lite static | 0 ms | 0 ms | 0 B | 0 B / procedural fixture |

These numbers are **comparative CI evidence, not target-device performance claims**. The GitHub runner uses a headless/software graphics environment and is intentionally hostile to GPU benchmarking. The useful signal is the relative cost and architectural behavior under the same environment.

## 3. Visual / distortion finding

### A / depth mesh

The prototype now matches the master/depth texture aspect ratio to the 2.39:1 frame; the earlier 2:1 texture stretch was removed before the final decision.

Even after that correction, A has the highest complexity and a structural distortion risk because displacement can bend silhouette and facial boundaries. The current abstract fixture cannot honestly certify real-face quality. Therefore the project must **not** adopt mesh displacement by default before Film 001 production art exists.

A remains a bounded reference implementation for later real-device / real-master experiments only.

### B / segmented planes

B moves complete visual planes rather than deforming image geometry. It therefore avoids mesh-induced facial/edge warping while still providing visible depth and pointer response.

Its work is event-driven and settles when input stops. No persistent render loop or GPU texture working set is required.

### C / Lite static

C remains visually intentional rather than looking like a failed enhanced mode. It carries the same semantic content and composition with no animation cost.

Reduced Motion forces the **effective** path to C even when A or B remains selected in the comparison UI.

## 4. Mobile and accessibility

The final browser audit verifies:

- a dedicated taller mobile composition;
- no horizontal overflow;
- standard keyboard-accessible variant controls;
- Reduced Motion collapses to C;
- Reduced Motion leaves no Living Frame canvas active;
- semantic page content exists before / independently of GPU initialization;
- GPU failure is locally contained by a designed fallback boundary.

Touch does not require pointer choreography: the composition remains meaningful without hover or fine-pointer input.

## 5. Decision

For Homepage Launch Cut / Film 001:

1. **Default enhanced Living Frame: B / segmented planes.**
2. **Lite and Reduced Motion: C / static composition.**
3. **A / depth mesh: rejected as the default.** Re-evaluate only if a production film master demonstrates a visible gain on real hardware without face/edge artifacts and within measured budgets.

This is intentionally conservative. The film image is the subject; the rendering technique is not.

## 6. What moves to Film 001 asset QA

The following are not hidden blockers for closing this R&D spike:

- compressed transfer size of the eventual editorial hero master;
- real actor-face / hair / limb depth-map cleanup;
- production masks;
- Safari/iOS/Android real-device frame measurements.

Those cannot be truthfully measured before a production master exists. They belong to the selected Film 001 visual-asset pipeline. The R&D decision avoids depending on them by choosing B/C as the launch architecture.
