# DeepMovieReview — Homepage Delivery A/B

> Status: shipped on `arena/01a09f09-deepmoviereview`
> Date: 2026-09-14
> Parent specs: `14-HOMEPAGE-LAUNCH-CUT-V1.md`, `16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md`, `27-LIVING-FRAME-RD-RESULTS.md`

## 1. What shipped

### Phase A — cinematic homepage without WebGL
- 7 original photorealistic 2.39:1 platform masters in `public/art/` (hero, lens, relationship, autopsy, decision, craft, discovery) + validated manifests in `src/data/visual-assets.ts`. No film stills, no posters.
- Production `LivingFrame` (`src/components/living-frame.tsx`): DOM-only launch path B from R&D-02 — bounded pointer parallax, pointer-tracked relight, blur placeholders, static premium fallback under reduced motion / LITE.
- Hero entrance choreography (CSS keyframes, load-only, interruptible by scroll).
- Six Lenses: per-lens grades + SVG TRACE draw for story/relationships, same-frame state machine.
- Pipeline scroll-spy, interactive spoiler ladder, permission scale markers, craft pressure-linked frame, `EXAMINE SCENE` autopsy toggle with evidence card.
- Analysis Workbench: per-mode art, art-matched anchors, Knowledge Fog density slider.

### Phase B — signature interactions + film surfaces
- Moral Lens cursor (`src/components/moral-lens-cursor.tsx`, constitution §8): fine-pointer-only light point + lagging ring with `EXAMINE / TRACE / WEIGH / OPEN` states via `data-lens-cursor`; disabled under reduced motion, forced colors and touch; native cursor preserved over text-entry controls. rAF + lerp, no new dependencies.
- `LivingFrame` props: `lensCursor`, `transitionSlug`.
- Film index + film hero carry per-slug platform stand-in art, honestly labeled; the existing view-transition morph now carries real art.
- Shell completion: scroll-aware header with mobile disclosure menu, expanded footer (sitemap, prelaunch status, honest draft notice), client-side index filter with full SSR list.
- Perf audit: homepage ships 9 JS chunks with zero three.js; WebGL stays scoped to film synthesis + labs.

## 2. Deliberately deferred
- **Depth-map relighting** waits for real depth maps (Depth Anything pass over the 7 masters + calibration). AI-guessed depth would repeat the distortion risk that R&D-02 rejected for the launch path.
- **Per-film art direction** waits for the Film 001 master lock and first publication (Phase C). Stand-in art is status-labeled and never presented as film stills.
- **Moral Core on the homepage** stays out per launch-cut §16; `VerdictCore` remains on the film-page synthesis.

## 3. Gates
typecheck, lint, 50 domain regression tests, production build, route smoke checks — green at the delivery head. Browser visual/a11y audit runs in CI per push.
