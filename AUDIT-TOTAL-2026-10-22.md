# DeepMovieReview — Тотальный аудит (2026-10-22)

> Ветка: `arena/b538422b-deepmoviereview` (от `main@0aa0240`)
> Дата аудита: 2026-10-22
> Автор: Arena Agent
> Статус проекта по `README.md`: **Film 001 vertical-slice production**, `TARGET_ONLY → MASTER_IDENTIFIED + SECONDARY_SOURCES`, публикаций — 0

---

## 0. Executive Summary

**Оценка зрелости: 7.2 / 10 для pre-launch оболочки; 2.5 / 10 для публичного продукта.**

Проект — один из самых дисциплинированных pre-launch репозиториев, что я видел. Онтология, контракты, spoiler-state, publication policy и CI — на уровне продакшн-компании. Но **публиковать нечего**: 0 опубликованных разборов, homepage всё ещё показывает `pilot-film` фикстуру, Film 001 и Film 002 заблокированы (39 evidence-записей требуют расщепления/переписывания/визуальной проверки), WebGPU-ядро — заглушка, пер-фильмовая арт-дирекция отсутствует.

Два продукта внутри одного репозитория:
1. **Оболочка (Shell A/B/C + Launch Cut v1)** — *почти готова*. Можно показывать инвесторам.
2. **Вертикальный срез Film 001 (The Truman Show)** — *застрял на этапе ingest*. Это сейчас главный bottleneck.

**Фатальных архитектурных ошибок — нет. Но без завершения Film 001 promotion pipeline сайт остаётся витриной без товара.**

---

## 1. Что УЖЕ сделано — зачёт

### 1.1 Документация (14948 строк в `docs/`)

46 документов, все с датой/версией/статусом. Покрыто:
- `00-PROJECT-CHARTER.md` — тезис, дифференциатор, 11 слоёв продукта, что НЕ делать.
- `09-AGENT-BUILD-RULES.md` — 25 инвариантов (Depiction≠Endorsement, Editorial≠Crowd, Moral Severity≠Quality и т.д.).
- `12-ANALYSIS-ONTOLOGY-V2.md` + `03-RATING-METHODOLOGY.md` — полная онтология (story, characters, relationships, teaching signals, moral forensics, biblical synthesis).
- `14-HOMEPAGE-LAUNCH-CUT-V1.md` (1059 строк) + `15-HOMEPAGE-DATA-CONTRACTS.md` (964) + `16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md` (912) — жёсткий контракт на 12-ступенчатый launch.
- `28-PILOT-FILM-SELECTION.md` — выбор Film 001 обоснован по 6 критериям.
- `29..46` — весь трек ingest Film 001: master intake, segmentation, re-anchor ledger, 3 волны миграции, rewrite, promotion readiness matrix.

**Вердикт: документация — эталон. Редкий случай, когда docs опережают код и это осознанно.**

### 1.2 App Shell — Platform Layer

| Компонент | Файл | Статус |
|-----------|------|--------|
| Next.js 16.3.4 App Router + strict TS | `package.json`, `tsconfig.json`, `next.config.ts` | ✅ |
| Node 24.x fail-fast (`engine-strict=true`, `.npmrc`) | `.npmrc` | ✅ (но локально в аудите Node 22 — см. §3.1) |
| Design tokens, grid, typography, motion roles | `src/styles/tokens.css`, `primitives.css`, `platform.css` | ✅ |
| Семантический DOM → GPU как прогрессивное улучшение | `living-frame.tsx` (DOM-only, B/C архитектура) | ✅ |
| Адаптивный runtime: `ULTRA/HIGH/MEDIUM/LITE` + `ExperienceQualityProvider` | `experience-quality-provider.tsx` (357 строк) | ✅ Базовый |
| Spoiler-state как data projection (filter_BEFORE_render) | `film-module-projection.ts`, `spoilers.ts` | ✅ |
| Homepage projection (read-model, не копия) | `homepage-projection.ts` | ✅ |
| FilmPackage — единый канонический контракт | `film-package.ts` (568 строк, 14 module kinds) | ✅ |
| Referertial integrity — валидатор (824 строки) | `film-package-integrity.ts` | ✅ Очень сильный |
| Visual asset manifest — focal point, safe zones, depth/masks, provenance | `visual-assets.ts`, `visual-asset-integrity.ts` | ✅ Типы готовы |
| Registry — единственный вход (`film-registry.ts` → `assertValidFilmRegistry`) | `film-registry.ts` | ✅ |
| Routes: `/`, `/films`, `/films/[slug]`, `/methodology`, `/labs/*` | `src/app/` | ✅ |
| Site Header (scroll-aware, mobile disclosure) + Footer | `site-header.tsx`, `site-footer.tsx` | ✅ |
| FilmMediaFrame (per-slug stand-in art + view-transition) | `film-media-frame.tsx` | ✅ |
| Publication policy — fail-closed (`canIndexSite`, `resolveSiteOrigin`) | `site-publication-policy.ts`, `robots.ts`, `sitemap.ts` | ✅ |
| Security headers (CSP, X-Frame, etc.) | `next.config.ts` | ✅ |
| SEO: metadataBase, OG, canonical, alternates | `layout.tsx`, `films/[slug]/page.tsx` | ✅ |

### 1.3 Homepage Launch Cut v1 — реализовано

**`src/app/page.tsx` (823 строки)** — все 12 стадий в семантическом DOM:

```
ARRIVAL / LIVING FRAME → SIX LENSES → STORY → PEOPLE+RELATIONSHIP OBSERVATORY
→ FAMILY/YOUTH → MEANING → NARRATIVE PERMISSION → FORM SHAPES SYMPATHY
→ SCENE AUTOPSY → KNOWLEDGE FOG/DECISION → BIBLICAL LENS + SYNTHESIS → DISCOVERY
```

Детали:
- `LivingFrame` — production DOM-only (bounded parallax + relight, `requestAnimationFrame`, без persistent render loop, static fallback в LITE/reduced-motion).
- `Six Lenses` — grades + SVG trace, same-frame state machine.
- `PipelineSpy` — scroll-spy (IntersectionObserver-паттерн).
- `SpoilerLadder` — 5 интерактивных уровней.
- `AutopsyExamine` — EXAMINE SCENE toggle + 3 anchor-точки.
- `AnalysisWorkbench` (AnalysisWorkbench.tsx) — 3 режима (autopsy/relationship/decision) + fog slider.
- `MoralLensCursor` — fine-pointer-only, 4 состояния (EXAMINE/TRACE/WEIGH/OPEN), rAF+lerp, отключается на touch/forced-colors/reduced-motion.
- 7 оригинальных platform masters (2.39:1, `public/art/*.jpg`, 86–227 КБ каждый) + валидированные манифесты.

**Вердикт: homepage — главное достижение. Работает без JS, деградирует gracefully, не требует WebGPU для понимания продукта.**

### 1.4 Film Package Renderer

- `film-module-renderer.tsx` + `module-components.tsx` (377 строк) + `evidence-map.tsx` + `final-synthesis-view.tsx`
- Рендерит все 14 `FilmModuleKind`, включая `decision` (options/facts/pressures/dutiesOrGoods), `moral-analysis`, `craft` (pressureAssessments), `autopsy` (anchors).
- Spoiler-aware: `projectFilmModules` + `SpoilerDeepLinkGuard` (чистит hash если цель скрыта).
- Film index — клиентский фильтр (`film-index-filter.tsx`) с полным SSR-листом.

### 1.5 CI — один из самых жёстких, что я видел

`.github/workflows/ci.yml` (`app-shell` job, ubuntu-24.04, 20 мин):

```
verify checkout SHA → Node 24 → verify npm policy (strict-allow-scripts, engine-strict)
→ npm ci → typecheck → domain regression tests → lint → build → production smoke
  → security headers check → prelaunch vs published-preview detection
  → lab routes noindex → robots Disallow → sitemap leak check
  → film index exposes both drafts → film page smoke (FULL spoiler)
  → internal token leak check (WRONGDOING, film-edition, etc.)
  → spoiler leak check (MAJOR content not in NONE)
  → not-found check → build audit
```

Плюс branch protection: app-shell CI + CodeQL должны пройти до merge, зависимости pinned на SHA.

**Вердикт: CI — отлично. Fail-closed по всем ключевым инвариантам.**

### 1.6 Domain тесты

`tests/regression.test.ts` — обширные регрессии на:
- `validateFilmPackage` (scene verification, evidence timestamp ranges, spoiler monotonicity, claim-support ceilings, character profile/interpretive split, moral event severity/culpability, etc.)
- `canIndexSite` (launch gate matrix)
- `resolveSiteOrigin`
- `filterBySpoilerLevel`, `projectFilmModules`, `projectHomepage`
- `validateVisualAssetRegistry`
- Promotion readiness matrix (counts 14/23/2, support totals 71/92/19=182)

Запуск: `npm test` → compile via `tsconfig.tests.json` → `node --test`.

---

## 2. Что НЕ доделано — критичные gaps

### 2.1 P0 — Блокирует публикацию (launch невозможно без этого)

#### 2.1.1 Film 001 — застрял в `MASTER_IDENTIFIED + SECONDARY_SOURCES`

**Статус по `29-FILM-001-INGEST-STATUS.md` + `46-FILM-001-PROMOTION-READINESS.md`:**

| Метрика | Значение |
|---------|----------|
| Master file | `The Truman Show (1998) BDRip.mkv`, Matroska, 13 ГБ, SHA-256 `E8543F61...`, 6177.792s (01:42:57.792), 1920×1080 H.264 24000/1001, DTS 5.1 | 
| Измерение | ✅ `ffprobe 8.1.2`, 24 embedded chapters, 1036 shot boundaries, 695 subrip blocks |
| Editorial scenes | ❌ **15 DRAFT сцен** с приблизительными timestamp'ами (30–4680s). Нужны VERIFIED сцены с точными диапазонами |
| Evidence records | ❌ **39 research записей**, все цитируют secondary sources (`truman-src-imdb`, `wiki-en`, `script`, `wikiquote` и т.д.), **0 canonical** с `film-edition` source |
| Promotion readiness | 14× `SPLIT_REQUIRED` (71 support refs), 23× `FACTUAL_REWRITE` (92 refs), 2× `ALREADY_ATOMIC` (19 refs) = **182 downstream refs заблокированы** |
| Блокеры | `CONSUMER_REWIRE`, `FACTUAL_REWRITE`, `VISUAL_REVIEW`, `EDITORIAL_SCENE_VERIFICATION`, `LOCKED_FILM_EDITION` — **каждая запись заблокирована минимум 2-мя** |
| Master segmentation | ✅ 24 embedded chapters → `masterSegmentation` (objective metadata, не editorial scenes) |
| Re-anchor ledger | ✅ `the-truman-show-master-reanchor.ts` — 39 записей, 3 состояния (TRANSCRIPT_ANCHORED / MIXED / VISUAL) |
| Visual review | ❌ **Не проведена** — picture-dependent факты (props, staging, gestures) не верифицированы |
| Canonical timestamps | ❌ Старые timestamps не связаны константным offset'ом с новым master'ом — нужен record-by-record re-observe |
| Edition transition | ❌ `MASTER_IDENTIFIED` → `LOCKED` атомарно только после полной перепривязки |
| Published modules | ❌ **0 published** — все 14 module kinds в draft, biblical/final synthesis — непроверенные hypotheses |

**Что конкретно нужно сделать (в порядке из `29-FILM-001-INGEST-STATUS.md` §5):**

```
1. Sources/edition — уже MASTER_IDENTIFIED, но verifiedAt отсутствует (требует LOCKED)
2. Scene inventory — пересобрать с нуля по 24 chapters + narrative transitions → VERIFIED scenes
3. Canonical evidence — re-observe каждую из 39 записей против фильма (не против transcript!)
4. Story structure — spoiler-safe beats с ClaimSupport → VERIFIED scene/timestamp
5. Character profiles — profileSupport + interpretiveSupport (раздельные, с spoiler ceilings)
6. Relationship events — с dimension shifts, participantCharacterIds
7. Craft observations — с mechanism + pressure assessments
8. Teaching Signals / Narrative Permission — с поддержкой
9. Decision / Knowledge Fog — options/facts/pressures/duties каждый со своим support
10. Scene Autopsy — выбор 1 candidate из shortlist (из 5), с anchors
11. Moral-event ledger — с valence/severity/culpability/repentance/narrativeStance
12. Meaning / thematic synthesis
13. Biblical synthesis — Scripture refs + qualification (не аллегория Christof=God)
14. Final synthesis — facets (6 keys) без master-score
15. Удалить research tier + transition to LOCKED атомарно
16. Независимый editorial review + калибровка rubric
17. Publication gate (lastReviewedAt, published status, homepage feature flag)
```

**Оценка effort: 3–6 недель сфокусированной editorial + engineering работы.**

#### 2.1.2 Film 002 — The Fast and the Furious (2001) — тоже draft

`src/data/films/the-fast-and-the-furious.ts` + `31-FILM-002-INGEST-STATUS.md`:

- 14 DRAFT scenes, evidence по secondary sources (IMDb, Wikiquote, FanWiki, Ringer, BonAppetit, etc.)
- `TARGET_ONLY` или `MASTER_IDENTIFIED`? — нужно проверить `ingest.edition.state` (по файлу — `SECONDARY_SOURCES` tier, assembled 2026-09-12)
- Тот же promotion путь, что и Film 001, но даже не начат (нет master intake, нет re-anchor ledger)
- В реестре (`film-registry.ts`) подключён как `theFastAndTheFuriousDraftPackage` — виден в `/films` только в preview

**Вопрос: нужен ли Film 002 сейчас?** По `07-ROADMAP.md` Phase 1 — только Film 001. Film 002 — это either полезный stress-test универсальности контрактов, или premature оптимизация. Рекомендация: заморозить Film 002 до публикации Film 001.

#### 2.1.3 Homepage всё ещё показывает фикстуру

`src/data/site-config.ts`:
```ts
export const homepageFeaturedFilmSlug = "pilot-film";
```

Это `fixture` из `src/data/film-fixtures.ts` (548 строк, `pilot-film` + `second-fixture`). В `src/app/page.tsx` весь homepage рендерится из `requireFilmPackageBySlug(homepageFeaturedFilmSlug)` — т.е. синтетических данных.

**Следствия:**
- В production без `DMR_PREVIEW_CONTENT_ENABLED=true` homepage — prelaunch заглушка ("Материалы готовятся", "Структурный стенд").
- В production с `DMR_PREVIEW_CONTENT_ENABLED=true` — preview build, **обязательно noindex** (проверяется в CI).
- `canIndexSite()` требует `published` статус + preview disabled + `DMR_SITE_INDEXING_ENABLED=true` — сейчас всегда `false` (publishedCount = 0).
- Sitemap пуст (`sitemap.ts` → `return []` пока не published).
- Robots — `Disallow: /`.

**Что нужно:** переключить `homepageFeaturedFilmSlug` на `the-truman-show` только после публикации Film 001. До этого — это корректное fail-closed поведение, не баг. Но это означает: **публичный launch невозможен физически**.

#### 2.1.4 Visual assets — некомплект

`public/art/` — 7 JPG masters (hero, lens, relationship, autopsy, decision, craft, discovery) + `og-home.png`. Это Phase A платформенные masters.

Чего нет:
- ❌ AVIF/WebP responsive variants (в `visual-assets.ts` у `fixtureHeroAsset` они были, у platform masters — только один 1600w JPG на каждый)
- ❌ DPR-aware variants (1x/2x)
- ❌ Depth maps (отложены сознательно — "AI-guessed depth would repeat distortion risk", `32-HOMEPAGE-DELIVERY-AB.md`)
- ❌ Segmentation masks (кроме 2 масок у fixture hero, у platform masters — 0)
- ❌ Per-film art direction (стоит `STANDIN_ART` в `film-media-frame.tsx` — честно помечено как "platform stand-in", но это placeholder)
- ❌ Mobile recomposition (только `mobileFocalPoint`, без отдельных кропов)
- ❌ GPU texture variants (`minTier` variants отсутствуют у platform masters)

**Это не критично для launch (DOM-only работает), но для ULTRA/HIGH tier — пусто.** Depth-map relighting ждёт Depth Anything pipeline.

#### 2.1.5 WebGPU / Verdict Core — заглушка

`src/components/experience/verdict-core.tsx` (229 строк):

> WebGPU-oriented Verdict Core with WebGL2/static fallback — но GPU сцены не реализованы, Three.js используется только в `package.json` (`@react-three/fiber`, `@react-three/drei`, `three`) и не в homepage (0 chunks с three.js в homepage — это намеренно, зафиксировано в `32-HOMEPAGE-DELIVERY-AB.md`).

- `LivingFrame` — DOM-only (это решение R&D-02, правильное для launch)
- `VerdictCore` / `Moral Core` — semantic HTML fallback существует, но 3D geometry/materials — не реализованы
- `SceneAutopsy` GPU separation — задуман, но homepage версия — CSS toggle
- Depth mesh / segmented planes (архитектура B) — спроектированы, не реализованы
- `ExperienceQualityProvider` — tier detection есть, но auto-downgrade по frame-time не измеряется (нет loop'а)

**Оценка: для Launch Cut v1 это ОК (требование — semantic DOM first). Для полноценного Film 001 вертикального среза — нужен хотя бы один Film 001 scene autopsy с real depth.**

---

### 2.2 P1 — Важно до/вскоре после launch (деградация продукта без этого)

#### 2.2.1 Нет persistence layer — всё в TS-файлах

`src/data/film-registry.ts`:
```ts
const rawFilmPackages = [...fixtureFilmPackages, theTrumanShowDraftPackage, theFastAndTheFuriousDraftPackage];
assertValidFilmRegistry(rawFilmPackages);
```

- Нет PostgreSQL, нет ORM, нет CMS, нет API.
- Каждый фильм — TS-файл в `src/data/films/` (136 КБ для Truman Show, 129 КБ для FaF).
- `AGENTS.md` прямо говорит: "evolve TypeScript contracts into persistent database/API schemas only after Film 001 vertical slice proves which entities are truly required" — это осознанное отложение (правильно по `10-OPEN-QUESTIONS.md` §29).
- Но: нет миграций, нет версионирования контента кроме `methodologyVersion`/`editorialRevision`, нет audit log, нет draft/review/publish workflow в UI (только поле `status`).

**Когда нужно решать:** после публикации Film 001, до добавления Film 002-003 (иначе файлы разрастутся до 500КБ+ каждый и merge conflicts станут адом).

#### 2.2.2 Spoiler system — хорош, но есть нюансы

Реализация (`spoilers.ts`, `film-module-projection.ts`, `spoiler-deep-link-guard.tsx`, `spoiler-level-control.tsx`) — одна из сильных сторон.

Что работает:
- 5 уровней (`NONE → MINOR → MAJOR → ENDING → FULL`), rank-based `canRevealSpoiler`
- `projectFilmModules` фильтрует до рендера, homepage принудительно на `NONE`
- Hash cleanup если линк указывает на скрытый контент

Что не доделано:
- ❌ Нет `?spoilers=` persistence across navigation (переход на другой фильм сбрасывает уровень — `FilmMediaFrame` не прокидывает query)
- ❌ Нет localStorage запоминания предпочтения
- ❌ Нет UX для "показать скрытый модуль" без смены глобального уровня (аккордеон)
- ❌ `homepage-projection.ts` редуцирует до `NONE`, но `page.tsx` дополнительно показывает static spoiler ladder demo (не связанный с реальным film spoiler state) — потенциальная путаница
- ⚠️ `EvidenceRecord.spoilerLevel` должен быть ≤ scene.spoilerLevel (проверяется валидатором), но в Truman draft все evidence — `NONE`/`MINOR`/`MAJOR`/`ENDING` — нужно перепроверить после re-anchor

#### 2.2.3 Accessibility — база есть, но неполно

Что реализовано:
- Skip link (`href="#main"`, `tabIndex -1` на `main`)
- `SiteHeader` mobile menu — disclosure pattern, `aria-expanded`, `aria-controls`, `inert`, Escape handler
- `LivingFrame` — семантический `figure`, `figcaption`, visuallyHidden label
- Focus-visible states, forced-colors fallbacks, prefers-reduced-motion (проверено в `browser-audit.mjs`)
- Semantic headings, landmarks, spoiler controls

Чего нет / gaps:
- ❌ Нет автоматических axe/ Lighthouse CI проверок (запланированы в `22-QUALITY-RUNTIME-V0.md`, но в CI только browser-audit)
- ❌ Нет keyboard trap проверки для labs
- ❌ `LivingFrame` pointer parallax — только mouse, нет keyboard эквивалента (но это enhancement, не контент — ОК)
- ❌ `AnalysisWorkbench` — 3 режима через buttons, но нет `role="tablist"`/`tabpanel` (хотя визуально это tabs)
- ❌ Нет `prefers-contrast: more` тестирования в CI (только forced-colors)
- ❌ Нет screen-reader теста для всей spoiler projection (что озвучивается при `FULL` vs `NONE`)
- ⚠️ `MoralLensCursor` скрывает нативный курсор на `data-lens-cursor` зонах — но текст-контролы сохранены (`05-TECHNICAL-ARCHITECTURE.md` §20) — нужно проверить, что `cursor: none` не применяется к `input`/`textarea`

#### 2.2.4 Performance budgets — не измерены

`16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md` и `05-TECHNICAL-ARCHITECTURE.md` §11 определяют бюджеты:
- JS per route, first-load image bytes, GPU asset bytes, texture memory, LCP/INP targets, FPS tiers

Но:
- ❌ Нет CI budget file (например, `bundlesize`, `lighthouse-budget.json`)
- ❌ Нет измеренных LCP/INP/CLS (observability запланирована в `05-...` §24, но не реализована)
- ❌ Нет `next/bundle-analyzer` или `import cost` gate
- ❌ Hero image — 86 КБ JPG + blur placeholder — ОК, но нет `priority` на всех masters (только hero — `priority={priority}`)
- ✅ Зато homepage ships 9 JS chunks, 0 three.js — это измерено и зафиксировано

#### 2.2.5 i18n — только русский

- `layout.tsx`: `<html lang="ru">` хардкод
- Весь UI, все FilmPackages, все docs — на RU (с EN-цитатами в evidence)
- `15-HOMEPAGE-DATA-CONTRACTS.md` упоминает `locale: string` в `HomepageLaunchProjection`, но не реализован
- Нет `next-intl` / `next-i18n-router`, нет locale routing

**Для MVP это ОК (целевая аудитория — RU), но закладывает техдолг если нужен EN.**

#### 2.2.6 Community / Audience layer — сознательно отложен

`04-COMMUNITY-AND-AUDIENCE.md`, `02-INFORMATION-ARCHITECTURE.md` §11, `AGENTS.md`:

> Future audience ratings, dilemma votes, comments, corrections must not overwrite editorial analysis.

Спроектировано, но не реализовано:
- ❌ Нет auth, нет user model
- ❌ Нет viewer score / voting / comments
- ❌ Нет anti-brigading (Bayesian prior, rate limiting — описаны в docs, но код отсутствует)
- ❌ Нет "Editorial vs Crowd" разделения в UI (пока только editorial)

**Это правильно для Phase 1, но `SiteFooter` уже показывает `publishedCount` — заготовка для будущего.**

---

### 2.3 P2 — Долгосрочно / когда корпус вырастет

#### 2.3.1 Нет каталога / discovery / атласа

`07-ROADMAP.md` описывает Phase 2+:

- Film Database, Moral Atlas, Dilemma Atlas, Relationship Atlas, Theme Atlas
- Search / recommendation (semantic/vector)
- Cross-film comparison
- Но `/films` сейчас — простой index с filter по title/year/status

`docs/10-OPEN-QUESTIONS.md` §24 — "Should Index be default and Explore optional?" — не решено.

#### 2.3.2 Нет API / search / recommendation

- `src/lib/film-index.ts` — локальный `filmPackages.filter`, не search
- Нет `/api/films`, нет vector embeddings, нет semantic search
- `10-OPEN-QUESTIONS.md` §28 — "Is semantic/vector search needed early?" — отложено

#### 2.3.3 Нет event sourcing / audit log

`05-TECHNICAL-ARCHITECTURE.md` §19 рекомендует append-only history для editorial actions. Не реализовано — только `editorialRevision: string`.

#### 2.3.4 Нет image optimization pipeline

`16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md` описывает offline pipeline (master → crop variants → depth → mask → AVIF/WebP → manifest). Реально — ручной `public/art/*.jpg` без pipeline скрипта.

#### 2.3.5 Docs drift risk

45 markdown файлов, но нет автоматической проверки что `AGENTS.md` инварианты совпадают с `09-AGENT-BUILD-RULES.md`, или что `site-config.ts` homepage slug ещё валиден после добавления фильма.

#### 2.3.6 Тестирование — coverage gaps

| Тип теста | Статус |
|-----------|--------|
| Domain regression (валидация FilmPackage) | ✅ Extensive |
| Typecheck | ✅ Gate в CI |
| Lint (eslint-config-next) | ✅ Gate в CI |
| Production build | ✅ Gate в CI |
| Route smoke (curl) | ✅ Gate в CI (headers, robots, sitemap, noindex, spoiler leaks) |
| Browser audit (headless Chrome, screenshots, a11y) | ✅ `scripts/browser-audit.mjs` (spawns Chrome, CDP, captures, checks) |
| Accessibility (axe) | ⚠️ Частично — в browser-audit, но не в CI matrix из `05-...` §26 (Firefox, Safari, iOS, Android) |
| Visual regression | ❌ Нет |
| E2E (Playwright/Cypress) | ❌ Нет |
| Unit для components | ❌ Нет (только domain) |
| Performance (Lighthouse) | ❌ Нет |

---

## 3. Технические находки — детали

### 3.1 Node version mismatch (в аудите, не в CI)

```json
// package.json
"engines": { "node": "24.x" }  // .npmrc: engine-strict=true

// Локально в контейнере аудита:
node -v → v22.22.3   // ← НЕ 24!
npm ci → не выполнялся (no node_modules, все npm команды падают "not found")
typecheck/lint/build/test → не воспроизводимы локально без Node 24
```

В CI это поймается (setup-node@24), но для локальной разработки — важно использовать `nvm`/`mise` с Node 24. `AGENTS.md` правильно требует не обходить `engine-strict`.

### 3.2 Отсутствует `node_modules` — аудит без установки

Все `npm` команды в аудите вернули `not found` — зависимости не установлены. Это значит:

- `package-lock.json` (277 КБ) не верифицирован на `npm audit`
- `allowScripts` allowlist (`unrs-resolver@1.12.2`) не проверен
- `npm run build` не прогнан — потенциальные type errors не обнаружены
- Но `git status` — clean, `git log` — HEAD совпадает с `origin/main@0aa0240` (1 коммит ahead? ветка `arena/...` от main, но diff — см. ниже)

### 3.3 Git state

```
git branch -a: arena/b538422b-deepmoviereview, main, origin/main
git log: 0aa0240 Add Film 001 promotion readiness matrix (#106) — последний на main
git status: nothing to commit, working tree clean
git diff main..HEAD --stat: (пусто — ветка не имеет новых коммитов сверх main)
```

Ветка — чистая копия main. Никаких незакоммиченных изменений, никаких ahead коммитов.

### 3.4 Структура `src/`

```
src/app/               — 7 routes (page, films, films/[slug], methodology, labs/* ×6)
src/components/        — 7 групп (experience, film-modules, home, labs, living-frame, film-media-frame, header/footer)
src/data/              — registry, fixtures, site-config, visual-assets, films/ (7 файлов)
src/lib/               — content, experience-quality, film-index, film-module-projection, film-package, film-package-integrity, homepage-projection, etc.
src/styles/            — 10 CSS файлов (tokens, platform, homepage, homepage-optics, film-modules, etc.)
public/art/            — 7 masters + og-home.png (всего 8 файлов, ~840 KB)
public/fixtures/       — (проверяется через visual-assets, но файлы не в git? — нужно проверить)
tests/                 — 1 regression.test.ts
scripts/               — browser-audit.mjs, run-regression-tests.mjs
```

`public/fixtures/pilot-film/hero/` — в `visual-assets.ts` указаны `/fixtures/pilot-film/hero/*.avif/webp`, но в `public/fixtures/` в репозитории может отсутствовать (проверка `ls public/fixtures` не выполнена — стоит проверить, но CI smoke на `/films/pilot-film` проходит, значит арт не критичен для build).

### 3.5 FilmPackage contract — сильный, но есть legacy

`src/lib/film-package.ts` — 568 строк, 14 module kinds, все с `spoilerLevel`, `ClaimSupport`, `Confidence`.

Сильные решения:
- `EvidenceRecord` хранится once, claim'ы ссылаются через `evidenceIds`
- `FilmSceneRecord` с `startTimestampSeconds`/`endTimestampSeconds` (numeric, не string)
- `ResearchSourceRole` (5 значений) для `reference` sources — явная provenance классификация, не numeric score
- Character split: `profileSupport` (wants/fears/contradiction) vs `interpretiveSupport` (believes/selfDeception/arc) — независимые spoiler ceilings
- `DecisionModule` — каждый fact/pressure/dutyOrGood со своим `support` + `knowledgeState` (4 значения)
- `FilmEditionLock` — discriminated union `TARGET_ONLY | MASTER_IDENTIFIED | LOCKED`

Legacy / tech debt:
- `EvidenceRecord.timestamp?: string` — legacy fixture display locator, помечен комментарием "Legacy/fixture display locator"
- `FilmSceneRecord.endTimestampSeconds?` — optional даже для VERIFIED (в валидаторе required для published, но тип — optional)
- `FilmPackage.ingest?` — optional (фикстуры его не имеют), но для real films required — валидатор это ловит
- `FilmPackage.research?` — только `SECONDARY_SOURCES`, но тип — single value (расширяемо)

### 3.6 Film-package-integrity.ts — 824 строки, очень тщательный

Проверяет:
- Duplicate IDs (film, scene, evidence, module, character, etc.)
- `LOCKED` edition required fields (sourceId, editionIdentity, measuredRuntimeSeconds, timestampConvention, verifiedAt date validation incl. leap year)
- `MASTER_IDENTIFIED` — `identifiedAt` + measuredRuntimeSeconds > 0
- Research tier coexistence rules (`SECONDARY_SOURCES` cannot coexist with `LOCKED`/`published`)
- Scene spoiler monotonicity (evidence/anchors cannot be LESS spoiler than scene)
- Evidence timestamp range checks (inside scene range)
- ClaimSupport spoiler ceilings (evidence cannot be MORE spoiler than claim)
- Character split ceilings
- Craft pressure → observation reference validity + spoiler monotonicity
- Decision completeness (≥2 options, ≥1 availableAtDecisionTime for published)
- Moral event completeness (severity/culpability required for WRONGDOING+published)
- Biblical synthesis (scriptureRefs non-empty for published)
- Final synthesis (facets unique, confidence required for published)
- Visual asset registry validity

**Недостающее:** нет проверки что `homepage-projection` не проецирует fixture/draft в prelaunch public build (но это проверяется в `layout.tsx` throw + CI smoke).

### 3.7 Security headers

`next.config.ts`:

```
CSP: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

- `script-src 'unsafe-inline'` — нужно для Next.js inline scripts (acceptable, но можно улучшить с nonce в будущем)
- `img-src 'self' data: blob:` — достаточно для current masters (нет external images)
- `connect-src 'self'` — блокирует external analytics — нужно расширить когда добавится observability
- `poweredByHeader: false` + `reactStrictMode: true` — ОК

---

## 4. Контент-аудит: Film 001 детально

### 4.1 Текущий draft — что внутри

`src/data/films/the-truman-show.ts` — 1988 строк, 136 КБ:

- Film meta: RU title "Шоу Трумана", director "Питер Уир", 1998, 103 мин, genres drama/comedy/dystopia, premise + thesisQuestion
- Ingest: `MASTER_IDENTIFIED` (BDRip.mkv, 6177.792s, Matroska PTS, frameRate 24000/1001, 24 chapters in masterSegmentation)
- Research: `SECONDARY_SOURCES`, assembled 2026-09-12, 15 DRAFT scenes (30–4680s), 39 evidence records
- Sources: ~15 secondary sources (IMDb, Wikipedia, Wikiquote, script, BBC, ACMI, etc.) с researchRoles
- Modules: 14 модулей (story с beats, characters с 5 персонажами, relationship, family-youth, meaning, teaching-signals, permission, craft, autopsy, decision, moral-analysis, biblical-synthesis, final-synthesis, sources-method) — все с ClaimSupport

**Качество prose:** высокое — все тексты на RU, evidence observations — factual, claims — аргументированы, counterevidence присутствует. Но **все это research-tier hypotheses, не canonical.**

### 4.2 Evidence breakdown (из promotion-readiness)

14 записей требуют расщепления (compound → atomic):
```
truman-ev-* (compound: dialog + visual + interpretation в одной записи)
→ replacements с grounding: TRANSCRIPT / VISUAL / MIXED
→ требует CONSUMER_REWIRE (182 refs) + VISUAL_REVIEW (частично) + SCENE_VERIFICATION + LOCKED_EDITION
```

23 записи требуют factual rewrite:
```
Stable ID остаётся, но observation смешивает fact и interpretation
→ candidate с verification: TRANSCRIPT_ONLY vs VISUAL_REQUIRED vs MIXED
→ требует FACTUAL_REWRITE + VISUAL_REVIEW (если не TRANSCRIPT_ONLY)
```

2 записи уже atomic:
```
truman-ev-interviews (5 refs) — Kristof interview, TRANSCRIPT-based
truman-ev-dialog (14 refs) — direct dialog, TRANSCRIPT-based
→ только SCENE_VERIFICATION + LOCKED_EDITION
```

### 4.3 Что блокирует visual review

`MIXED_REVIEW_REQUIRED` и `VISUAL_REVIEW_REQUIRED` записи — их нельзя верифицировать по subtitle cues. Нужен человек, смотрящий фильм:

- Props, staging, gestures (Kaiser Chicken billboard, falling spotlight "Sirius")
- Blocking, framing, on-screen text
- Performance nuances

**Transcript timestamp ≠ picture verification** — это ключевой инвариант из `29-FILM-001-INGEST-STATUS.md`.

### 4.4 Master intake — exemplary

`docs/38-FILM-001-VIEWING-MASTER-INTAKE.md` (158 строк) — образцовая документация:

- File identity: SHA-256, 13 ГБ, Matroska, ffprobe 8.1.2
- Video: 1920×1080 H.264, 24000/1001, BT.709, progressive, yuv420p
- Audio: 5 streams (4 RU dubs + EN Original DTS 5.1 stream 5)
- Subtitles: 3 streams (2 RU + EN SubRip stream 8, 695 blocks, last at 01:35:59.375)
- Chapters: 24 named, continuous 0.000–6177.792s, credits boundary 01:36:00.755
- Shot scan: 1036 cuts, median 3.253s, 90th percentile 11.303s, 261.93s decode

**Это лучший пример ingest-документации в проекте. Берите как шаблон для Film 002+.**

---

## 5. UX / Homepage аудит

### 5.1 Что работает отлично

- **Arrival** — мощный hero с LivingFrame, status strip (FILM 001 / МЕТОД / СТАТУС), mission statement, pipeline (10 шагов), evidence chain — всё в семантическом DOM
- **Six Lenses** — переключение линз с grades/traces, промпты — понятны без документации
- **Spoiler Ladder** — интерактивная, 5 уровней с preview
- **PipelineSpy** — scroll-highlight, graceful degradation без JS
- **AnalysisWorkbench** — наглядный демо-инструмент (autopsy/relationship/decision)
- **Methodology page** (`/methodology`) — отдельная страница с методологией
- **Film Index** (`/films`) — filter по title/originalTitle/year, prelaunch notice честный

### 5.2 Что можно улучшить

- **HeroScrollCue** — декоративная, но нет `aria-hidden`? (мелочь)
- **Lens stage** — `LivingFrame` показывает одну master (lens-master.jpg) для всех 6 линз — визуально не дифференцировано (grades/traces помогают, но art — один)
- **Relationship Observatory** — на homepage это static preview, интерактивная версия только в labs + film page
- **Narrative Permission** — на homepage это scale + examples, но без конкретного film subject (abstract examples: "Ложь во спасение" и т.д. — не про Truman Show)
- **Craft pressure** — "Давление эмпатии/подражания" — conceptually сильный, но на homepage это abstract cards, не привязанные к реальной сцене
- **Discovery** — последняя секция — самая слабая (пустой корпус, нет related films — показывает заглушку)
- **Prelaunch state** — homepage показывает "Материалы готовятся" + "незавершённые разборы остаются в редакции" — честно, но для внешнего посетителя выглядит как "сайт пуст"

---

## 6. Что нужно сделать — Prioritized Roadmap

### P0 — Must do before public launch (блокеры)

| # | Задача | Файл/Зона | Effort | Зависит от |
|---|--------|-----------|--------|------------|
| P0-1 | **Re-observe 39 evidence records** против BDRip master (record-by-record, с exact timestamps) | `the-truman-show.ts` + `master-reanchor.ts` | 2 нед | Visual review |
| P0-2 | **Rebuild editorial scenes** — 15 DRAFT → VERIFIED с точными `start/endTimestampSeconds` | `the-truman-show.ts` scenes | 1 нед | P0-1 (частично parallel) |
| P0-3 | **Execute evidence migration** — 14 SPLIT + 23 REWRITE по контрактам wave1-3 + rewrite candidates | `evidence-migration.ts`, `evidence-rewrite.ts` | 1 нед | P0-1, P0-2 |
| P0-4 | **Visual master review** — picture-dependent факты верифицированы человеком | `promotion-readiness.ts` VISUAL_REVIEW gate | 1 нед | P0-1 |
| P0-5 | **Transition to LOCKED** — атомарно: удалить `research` tier, установить `verifiedAt`, переключить evidence sourceIds на `film-edition` | `the-truman-show.ts` ingest | 1 день | P0-2, P0-3, P0-4 |
| P0-6 | **Independent editorial review** — biblical synthesis + final synthesis reviewed 2nd editor | modules biblical-synthesis, final-synthesis | 1 нед | P0-5 |
| P0-7 | **Publish + homepage switch** — `status: published`, `homepageFeaturedFilmSlug = "the-truman-show"`, `DMR_SITE_INDEXING_ENABLED=true` в deploy, `DMR_PREVIEW_CONTENT_ENABLED=false` в public build | `site-config.ts`, deploy env, `layout.tsx` | 1 день | P0-6 |
| P0-8 | **Per-film hero art** — Film 001 editorial master (1 hero image, honestly labeled "editorial art, not film still") | `public/art/truman-*`, `visual-assets.ts` | 1 нед | Может parallel с P0-1 |

**Итого P0: ~4–6 недель, 1 editorial + 1 engineering, можно parallelize P0-1/2/4/8.**

### P1 — Should do for quality launch (деградация без этого)

| # | Задача | Effort |
|---|--------|--------|
| P1-1 | **Node 24 локально** — `nvm use 24` / `mise`, прогнать `npm ci && npm run build` на Node 24, зафиксировать в README | 1 час |
| P1-2 | **Spoiler persistence** — localStorage + query propagation между `/films/*` | 1 день |
| P1-3 | **Responsive image variants** — WebP/AVIF для 7 masters, 2 DPR, `sizes` attribute audit | 2 дня |
| P1-4 | **Depth maps** — Depth Anything pipeline для 7 masters (отложен сознательно — разблокировать перед per-film art) | 3 дня |
| P1-5 | **Accessibility audit** — автоматический axe в `browser-audit.mjs` или Playwright, keyboard trap, contrast check | 2 дня |
| P1-6 | **Performance budgets** — `bundlesize` / Lighthouse CI gate (JS < 200KB, LCP < 2.5s) | 1 день |
| P1-7 | **SEO polish** — `og-home.png` актуальный (сейчас 139 КБ, проверить что не fixture), `sitemap.xml` с реальными films | 1 день |
| P1-8 | **Film page polish** — verify `truman-sc-*` anchors не уезжают на mobile, `EvidenceMap` readability | 1 день |
| P1-9 | **Freeze Film 002** — пометить `the-fast-and-the-furious.ts` как `status: draft` + `note: frozen until Film 001 published`, убрать из CI smoke или оставить как stress-test | 1 час |

### P2 — Nice to have (после Film 001 launch)

| # | Задача | Effort |
|---|--------|--------|
| P2-1 | **Persistence layer** — PostgreSQL + Prisma/Drizzle + CMS/editorial workflow (draft/review/publish) | 2–4 нед |
| P2-2 | **API + search** — `/api/films`, semantic search, filters по moral/theme/relationship | 2 нед |
| P2-3 | **Discovery / Atlas stubs** — empty-state дизайн для 1-film corpus (сейчас — weak) | 1 нед |
| P2-4 | **WebGPU Verdict Core** — 3D Moral Core geometry (семантический вектор → geometry), film-to-film comparison | 3–4 нед |
| P2-5 | **Full accessibility certification** — WCAG 2.2 AA external audit | 1 нед |
| P2-6 | **Observability** — LCP/INP/CLS instrument, GPU backend breakdown, error tracking | 1 нед |
| P2-7 | **Community foundation** — auth, user model, viewer score schema (без UI) | 2 нед |
| P2-8 | **Docs sync** — automated check что `AGENTS.md` инварианты покрывают `09-AGENT-BUILD-RULES.md` + `29-...` gates | 1 день |

---

## 7. Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Editorial burnout — 39 evidence + 15 scenes + visual review вручную | Высокая | P0 блок | Разбить P0-1 на батчи по 10 evidence/нед, parallelize |
| BDRip lineage — upstream retail disc не верифицирован (см. `29-...` §1 "не знаем encode lineage") | Средняя | Юридическая/методическая | Документировать как есть, не претендовать на retail lineage |
| Transcript vs picture gap — subtitle wording ≠ on-screen action | Высокая | Качество анализа | Строго соблюдать VISUAL_REVIEW gate, не принимать cue timestamp как verification |
| Scope creep — Film 002 тянет ресурсы с Film 001 | Средняя | P0 задержка | Заморозить Film 002 (P1-9) |
| Node 24 adoption — локально 22, CI 24 — drift | Низкая | CI green, local red | `mise.toml` + README update (P1-1) |
| Per-film art — AI likeness policy (актёры Truman) | Средняя | Юридическая | Не генерировать likeness Джим Керри без policy (см. `10-OPEN-QUESTIONS.md` §25) |
| WebGPU hype — потратить время на GPU вместо evidence | Средняя | P0 задержка | Держать GPU в P2, фокус P0 — data + editorial |

---

## 8. Итоговые рекомендации

### Что делать прямо сейчас (эта неделя)

1. **Заморозить Film 002** до публикации Film 001 — убрать из активного фокуса (P1-9).
2. **Начать visual review** — выделить 1 человека на просмотр BDRip master с `38-FILM-001-VIEWING-MASTER-INTAKE.md` chapter map, верифицировать picture-dependent evidence.
3. **Начать scene rebuild** — на основе 24 chapters + shot scan (1036 cuts) собрать VERIFIED editorial scenes v1.
4. **Поднять Node 24** локально и прогнать `npm ci && npm run build` — убедиться что текущая ветка зелёная перед большой editorial работой.
5. **Не трогать GPU** — все P2 задачи отложены.

### Что НЕ делать

- ❌ Не добавлять новые фильмы (Film 003+)
- ❌ Не строить PostgreSQL/CMS преждевременно (нарушит `AGENTS.md` инвариант)
- ❌ Не генерировать per-film art до мастер-лока (нет VERIFIED сцен — нечего иллюстрировать)
- ❌ Не менять `homepageFeaturedFilmSlug` до `LOCKED + published`
- ❌ Не ослаблять валидатор (`film-package-integrity.ts`) чтобы "прошёл" draft как published
- ❌ Не использовать `SECONDARY_SOURCES` evidence как канонический без re-anchor

### Финальная мысль

**Проект в отличной форме для pre-launch.** Архитектура, онтология, CI, docs — выше среднего продакшн-студий. Главная проблема — это не баг, а фаза: **товар ещё не готов, витрина уже готова.**

Самый быстрый путь к ценность = **сфокусироваться исключительно на Film 001 promotion pipeline (P0-1..P0-8)** и отложить всё остальное. Один опубликованный разбор снимет 80% вопросов из `10-OPEN-QUESTIONS.md` (31 секция open questions — многие требуют реального film data для ответа).

---

## 9. Приложение: инвентаризация репозитория

### 9.1 Файлы и размеры

```
README.md                    16 КБ  — overview, launch cut, methodology links
AGENTS.md                    9 КБ   — coding agent entrypoint, 15 инвариантов, quality gates
docs/*.md                    46 files, 14 948 строк total
src/lib/film-package.ts      568 строк — 14 module kinds
src/lib/film-package-integrity.ts 824 строки — валидатор
src/app/page.tsx             823 строки — homepage 12 stages
src/data/films/the-truman-show.ts  1988 строк / 136 КБ
src/data/films/the-fast-and-the-furious.ts  ~129 КБ
src/data/film-fixtures.ts    548 строк — 2 fixtures
public/art/                  7 JPG masters (~840 КБ total) + og-home.png (139 КБ)
package.json                  — Next 16.3.4, React 19.2.8, Three 0.186.0, Tailwind 4.3.3
package-lock.json            277 КБ
```

### 9.2 Docs coverage

| Док | Статус | Код покрытие |
|-----|--------|--------------|
| 00-Charter | ✅ Full | Частично (онтология в FilmPackage) |
| 01-Visual Constitution | ✅ Full | Homepage + LivingFrame |
| 02-IA | ✅ Full | FilmPackage отражает, но без DB |
| 03-Rating Methodology | ✅ Full | Отложено до calibrated rubric (P0-6) |
| 05-Technical Architecture | ✅ Full | ~70% реализовано (нет DB, observability) |
| 06-Experience Blueprint | ✅ Full | ~60% (нет Moral Core, Timeline) |
| 11-Homepage Architecture | ✅ Full | Реализовано в page.tsx |
| 14-Launch Cut v1 | ✅ Full | Реализовано |
| 15-Data Contracts | ✅ Full | Homepage + FilmPackage соответствуют |
| 16-Asset/Motion/Perf Spec | ✅ Full | Asset pipeline не реализован, motion — OK |
| 18-App Shell Phase | ✅ Full | Shell A/B/C done, D partial |
| 22-Quality Runtime | ✅ Full | Базовый, без auto-downgrade |
| 23-Visual Asset Manifest | ✅ Full | Типы готовы, пайплайн — нет |
| 27-Living Frame RD | ✅ Full | Decision B/C реализован (DOM-only) |
| 28-Pilot Film Selection | ✅ Full | Film 001 selected |
| 29-Ingest Status | 🔄 Active | MASTER_IDENTIFIED, 5 gates blocked |
| 30-Secondary Research | ✅ Full | Собрано, изолировано |
| 31-Film 002 Ingest | 🔄 Draft | Frozen? |
| 32-Homepage Delivery A/B | ✅ Shipped | Phase A+B done |
| 33-35 Control Audits | ✅ Done | — |
| 38-Viewing Master Intake | ✅ Full | Exemplary |
| 39-46 Migration/Readiness | ✅ Full | Contracts ready, execution blocked |

### 9.3 Coverage чек-лист `AGENTS.md` quality gates

```
[✅] locked dependency install (npm ci + engine-strict + allowScripts)
[✅] typecheck (tsc --noEmit)
[✅] domain regression tests (node scripts/run-regression-tests.mjs)
[✅] lint (eslint .)
[✅] preview production build/smoke (npm run build + curl checks)
[✅] headless Chrome DOM/a11y/visual audit (scripts/browser-audit.mjs)
[✅] clean public production rebuild (DMR_PREVIEW_CONTENT_ENABLED=false)
[✅] public access/security smoke (robots, sitemap, CSP headers, noindex)
[❌] Node 24 локально (сейчас 22 в аудите — CI ловит, local нет)
[⚠️] Browser audit не прогнан в этом аудите (нет node_modules, нет Chrome)
```

---

*Конец аудита. Ветка `arena/b538422b-deepmoviereview` не модифицирована (0 новых коммитов). Этот отчёт — единственный новый файл: `AUDIT-TOTAL-2026-10-22.md`.*
