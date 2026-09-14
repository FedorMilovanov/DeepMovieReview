# DeepMovieReview — Control Audit (visual / quality / logic)

> Date: 2026-09-14
> Scope: homepage shell, film routes, spoiler projection, Living Frame, Moral Lens cursor, index filter, transitions, CSS system
> Method: gates + SSR crawl of all routes + focused source review (no headless browser in sandbox; browser visual/a11y evidence stays a CI responsibility)

## 1. Gates at audit head

typecheck, lint, **52/52** regression tests, production build (15 pages), route smoke — green.

## 2. SSR crawl (all 200s, 404 correct)

Every route: `lang="ru"`, exactly one `h1` and one `main`, zero images without `alt`, prelaunch `noindex` everywhere, no canonical on draft/fixture film pages, `robots.txt` disallows all, sitemap empty, labs `noindex`. Canonicals resolve through build-time `DMR_SITE_URL` (documented in `layout.tsx`); localhost default is dev-only by construction.

## 3. Fixed by this audit

1. **Spoiler projection deduplication** — `film-module-projection.ts` carried a private `visible()` duplicating the exported (and previously unused) `filterBySpoilerLevel`. Projection now uses the shared helper; the spoiler-helpers test covers it.
2. **Evidence-card heading level** — `EvidenceCard` rendered `h4` directly under the map's `h2`. Now `h3`; the card rule neutralizes the global uppercase display treatment so long evidence labels keep sentence case and pixel-identical rendering.
3. **Cursor overflow clip** — the lens state tag extends past the cursor; `.lens` gets `overflow: clip` so edge positions never widen the scrollable overflow area.
4. **View-transition stale-DOM race** — the navigation waiter matched `[data-film-transition-media]` which exists on BOTH the old index row (`div`) and the new hero (`figure`); in the commit window where the URL has flipped but old DOM is still mounted, the waiter could snapshot stale DOM as "new". It now waits on `figure[…]` (hero only); the morph selector is unchanged.
5. **iOS input auto-zoom** — the index filter input was 14.4px; bumped to 16px under 720px so iOS Safari does not zoom on focus.
6. **Living Frame accessible label** — the `label` prop rendered as `aria-label` on `figure`, which never computes (no implicit role without `figcaption`) and would override the caption when one exists. It now renders as screen-reader-only text via a new `.visuallyHidden` utility; five homepage usages keep working, and the film hero gains an honesty note for assistive technology ("not a film still").
7. **`DMR_SITE_URL` diagnostics** — a non-URL value used to die in `new URL` with a cryptic `ERR_INVALID_URL`; it now throws a build-time error naming the variable and the offending value. Regression-tested.

## 4. Reviewed, no change needed

- **Spoiler integrity**: registry is validated on import (`assertValidFilmRegistry`); the evidence map renders records only through supports collected from projected modules; character interpretive fields are allowlist-stripped (fail-closed for future fields). No leak path found.
- **Homepage projection throw** on a missing required module after NONE projection is fail-closed by design (forces an editorial decision instead of a half-empty feature).
- **`motion` static import** in the transition link: touch users do exercise view transitions, so only reduced-motion/legacy engines carry dead weight. Keep.
- **Menu focus trap**: Escape + focus return + `inert` meets the bar; a full trap is an enhancement, not a gap.
- **Global `h1 14ch`** and methodology `12ch` are deliberate editorial style with `text-wrap: balance`, not breakage.
- **ExperienceDiagnostics** is production-gated (`return null` + dead-code elimination).
- **Homepage is three.js-free** by construction (only `verdict-core` + labs import three; nothing on the `/` path imports the film renderer).
- **Focus visibility**: global `:focus-visible` rule plus per-component treatments; skip link + `main` focus management present.
- **Reduced motion**: smooth scroll and transitions are reset under the media query; cursor and parallax are gated in both JS and CSS.
