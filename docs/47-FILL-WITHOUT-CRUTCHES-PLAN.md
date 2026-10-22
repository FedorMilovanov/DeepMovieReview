# DeepMovieReview — Заполнение без костылей: пошаговый план

> Дата: 2026-10-22 · Ветка: `arena/b538422b-deepmoviereview` · База: аудит `AUDIT-TOTAL-2026-10-22.md`
> Принцип: ни один `published` тезис не появится без `VERIFIED` сцены и `film-edition` источника. Костыли запрещены — только честные контракты и воспроизводимые данные.

---

## 0. Что значит "без костылей"

Запрещено:

- ставить `VERIFIED` на непросмотренный кадр
- выдавать расшифровку/память за просмотр фильма
- превращать embedded-главы в editorial-сцены автоматически
- тянуть secondary-источник как канонический без перепроверки
- генерировать финальный/библейский синтез без независимого review

Разрешено и требуется:

- довести shell до 100% по `14-HOMEPAGE-LAUNCH-CUT-V1.md`, `16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC.md`
- сделать все контракты (typescript + валидатор + проекция + публикация) fail-closed
- подготовить **инструменты** миграции Film 001 так, чтобы ручной просмотр остался единственным ручным шагом
- документировать каждый барьер как machine-readable (как в `46-PROMOTION-READINESS`)

План идёт партиями (batch). Каждая партия — зелёный `typecheck + tests (71) + lint + build` и отдельный коммит.

---

## Batch 1 — Фундамент честности (выполнено в этом PR, часть 1)

**Цель:** убрать phantom-файлы и зафиксировать среду.

- [x] `.nvmrc = 24` (документирует контракт `package.json:engines node 24.x` + `.npmrc:engine-strict`)
- [x] `public/fixtures/pilot-film/hero/*` — реальные JPEG-плейсхолдеры (960/1600, gpu-1280/2048, depth-1280, mask-subject/foreground) — больше нет несуществующих `.avif/.webp` ссылок
- [x] `src/data/visual-assets.ts:fixtureHeroAsset` — варианты указывают на реальные `*.jpg`, `provenance.editorialNotes` честно описывает происхождение (дериват от hero-master для shell-валидации, не film-art)
- [x] `src/lib/visual-assets.ts:SegmentationMask.format` — расширен до `"png"|"webp"|"jpg"` (обратная совместимость, не ломает существующие манифесты; JPG-маски допустимы для shell-фикстуры без альфы)
- Gates: `typecheck ✓, tests 71/71 ✓, lint ✓, build ✓`

Следующий шаг партии — не коммитить `node_modules`, вернуть `~/.npmrc` override не нужен (CI на `setup-node@24` уже зелёный; локальный аудит использовал `npm install --engine-strict=false` однократно — это не часть репозитория).

---

## Batch 2 — Shell 100% по Launch Cut v1 (следующая партия)

**Почему сейчас:** это всё ещё не editorial, но уже продуктово видимо. Каждая правка — DOM/CSS, без GPU.

- [ ] Визуальный аудит `src/app/page.tsx` (823 строки) против `14-HOMEPAGE-LAUNCH-CUT-V1.md` §1-16: проверить 12 ступеней, порядок, copy, якори.
- [ ] `14 → 16` покрытие: `LivingFrame` уже B/C-DOM-only (R&D-02), но `platform-craft-master` и `platform-discovery-master` имеют по 1 варианту — добавить responsive 960/1280/1600 как у `fixtureHeroAsset` честно, без фейковых depth-карт.
- [ ] `16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC` §8 motion-ownership матрица — проверить, что ни один `transform` не принадлежит одновременно Motion+CSS+GSAP.
- [ ] `ExperienceQualityProvider` auto-downgrade — сейчас только ручной выбор; добавить `frame-time` + `visibility/offscreen` downgrade как в `22-QUALITY-RUNTIME-V0.md` (demand rendering уже есть).
- [ ] Accessibility: `prefers-reduced-motion`, `keyboard-only`, Lighthouse `LCP/INP` бюджеты как код ( `05-TECHNICAL-ARCHITECTURE §30` ) — не метрики на словах.
- Gates: те же 4 + `browser-audit.mjs` headless Chrome (screenshots + a11y evidence в `browser-audit/` — уже gitignored, но CI должен его гонять).

---

## Batch 3 — Подготовка канонической миграции Film 001 (не визуальная часть)

**Можно без просмотра фильма. Это не "просмотр", это инструмент, который сделает просмотр однозначным.**

- [ ] Transcript-only кандидаты: 9 шт (`greeting`, `radio`, `mococoa`, `beer`, `marlon`, `cuesun`, `nocamera`, `guards`, `born-live`) — отполировать `candidateObservation` до дословного факта, отделённого от интерпретации (уже в `44-FACTUAL-REWRITE`, но wording финальный — в этой партии).
- [ ] `prepare-canonical-migration.ts` скрипт: читает `the-truman-show-master-reanchor.ts` + `evidence-rewrite.ts` + `evidence-migration.ts`, генерирует `preview` будущих VERIFIED сцен (только TRANSCRIPT-anchored, без VISUAL) в `MASTER_IDENTIFIED` без перехода в `LOCKED`. Скрипт не мутирует `FilmPackage`, только артефакт в `docs/48-*.md` для review.
- [ ] `scene-inventory-v1-preview.md` — черновик VERIFIED сцен на базе 24 embedded-глав + 1036 shot-candidates (median 3.25s, 90% 11.3s) — но с явной пометкой `DRAFT` до ручной проверки.
- [ ] CI freeze: уже есть 71 тест, включая promotion-readiness exhaustive (14/23/2, 71/92/19=182, VISUAL_REVIEW 25). Добавить тест на новый скрипт-артефакт.

Визуальная часть (`VISUAL_ONLY` и `MIXED`) остаётся `VISUAL_REVIEW_REQUIRED` — честно.

---

## Batch 4 — Ручной просмотр (единственный ручной барьер, нельзя автоматизировать)

- [ ] Просмотр BDRip (SHA-256 `E8543F61...`, 6177.792s, 24 главы, credits 01:36:00.755) по `38-VIEWING-MASTER-INTAKE`.
- [ ] Для каждой `VISUAL_REVIEW_REQUIRED` записи — picture-fact + staging/props/gesture → новый atomic ID.
- [ ] Пересборка editorial-сцен: `15 DRAFT (30-4680s)` → `N VERIFIED` с точными `start/endTimestampSeconds`.
- [ ] Атомарный переход `MASTER_IDENTIFIED + SECONDARY_SOURCES` → `LOCKED` (удалить `research` tier, `verifiedAt`, `film-edition` источник у каждого evidence).
- Gates: `film-package-integrity` должен остаться fail-closed; публикация требует `lastReviewedAt` + `editorialRevision`.

---

## Batch 5 — Публикация Film 001

- [ ] `the-truman-show.ts:film.status = "published"`, `homepageFeaturedFilmSlug = "the-truman-show"` (сейчас `pilot-film` — честно prelaunch).
- [ ] Пер-фильм art (Phase C): 1 hero-editorial master, честно промаркирован "editorial art, not still", с responsive/DPR/depth/masks как в `23-VISUAL-ASSET-MANIFEST-V0`.
- [ ] `robots.ts`/`sitemap.ts` начинают индексировать (`canIndexSite` уже требует `DMR_SITE_INDEXING_ENABLED=true && !preview && published` — уже реализовано).
- [ ] Рубрика-калибровка + независимый review библейского/финального синтеза (`03-RATING-METHODOLOGY`).

---

## Batch 6 — Корпус и tooling (после первого published)

- [ ] Решение по `the-fast-and-the-furious.ts` (сейчас sibling draft с 14 DRAFT сценами) — либо freeze, либо аналогичный intake.
- [ ] Offline pipeline для depth/segmentation (глубина уже отложена честно в `32-HOMEPAGE-DELIVERY-AB: Depth-map relighting waits for real depth maps` — не костылить AI-guess).
- [ ] DB/API схема только после того, как Film 001 докажет сущности (как указано в `29-INGEST-STATUS` §5).

---

## Текущий коммит этого плана

Партия 1 частично выполнена: `.nvmrc`, `public/fixtures/*`, `fixtureHeroAsset` честно, `SegmentationMask` тип расширен. Все гейты зелёные.

Следующий коммит — Batch 2 (shell completeness). Не требует просмотра фильма, идёт параллельно с Batch 3 tooling.

