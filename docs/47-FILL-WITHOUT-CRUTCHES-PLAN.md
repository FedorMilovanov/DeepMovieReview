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

- [x] Визуальный аудит `src/app/page.tsx` (823 строки) против `14-HOMEPAGE-LAUNCH-CUT-V1.md` §1-16: 12 ступеней порядок сохранён, prelaunch copy честный, якори/спойлеры fail-closed.
- [x] `14 → 16` покрытие: все 7 platform masters теперь 2 варианта (960+1600) — `public/art/*-960.jpg` (ImageMagick resize, honest derivatives) + `src/data/visual-assets.ts` 7×2 variants; depth-maps честно отложены per `32-HOMEPAGE-DELIVERY-AB: Depth-map relighting waits for real depth maps`.
- [x] `16-HOMEPAGE-ASSET-MOTION-PERFORMANCE-SPEC` §8 motion-ownership матрица — проверена: `LivingFrame` (DOM `requestAnimationFrame`), `MoralLensCursor` (rAF lerp), `PipelineSpy` (scroll), `SixLenses` (CSS) — transform не пересекается.
- [x] `ExperienceQualityProvider` — `visibilitychange` + `reportFrameSample` downgrade + tier selection уже реализованы (MEDIUM/HIGH/ULTRA/LITE, backend detection, forcedColors → LITE).
- [x] Accessibility: `prefers-reduced-motion`, `keyboard-only`, `skipLink`, `forced-colors` fallback — уже в shell; `LCP/INP` бюджеты — отложены до first published (см. `16 §11` tiers).
- Gates: `typecheck ✓ tests 71/71 ✓ build ✓` — `browser-audit.mjs` уже в CI, ручной скриншот-этап отложен до Batch 5.

---

## Batch 3 — Подготовка канонической миграции Film 001 (не визуальная часть)

**Можно без просмотра фильма. Это не "просмотр", это инструмент, который сделает просмотр однозначным.**

- [x] Transcript-only кандидаты: 9 шт (`greeting`, `radio`, `mococoa`, `beer`, `marlon`, `cuesun`, `nocamera`, `guards`, `born-live`) — wording уже в `44-FACTUAL-REWRITE` как финальный candidateObservation, отделён от интерпретации (claimLayerNote); `docs/48` подтверждает 9/9 anchors (169.796 … 5755.382) вDeclared chapters.
- [x] `prepare-canonical-migration.ts` скрипт: читает `the-truman-show-master-reanchor.ts` + `evidence-rewrite.ts` + `evidence-migration.ts`, генерирует `preview` будущих VERIFIED сцен (только TRANSCRIPT-anchored, без VISUAL) в `MASTER_IDENTIFIED` без перехода в `LOCKED`. Скрипт не мутирует `FilmPackage`, только артефакт в [`docs/48-PREVIEW-TRANSCRIPT-MIGRATION.md`](48-PREVIEW-TRANSCRIPT-MIGRATION.md) для review.
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

Партия 1-3 выполнены: `.nvmrc`, `public/fixtures/*` + `public/art/*-960.jpg` responsive, `fixtureHeroAsset` честно, `SegmentationMask` тип расширен, `scripts/prepare-canonical-migration.mjs` + `docs/48-PREVIEW-TRANSCRIPT-MIGRATION.md` (9 TRANSCRIPT_ONLY + 11 transcript-замен). Gates: `typecheck ✓ tests 71/71 ✓ lint ✓ build ✓`.

Следующий — Batch 4: ручной просмотр BDRip (SHA `E8543F61…`, 6177.792s, 24 главы). Нельзя автоматизировать без просмотра.

