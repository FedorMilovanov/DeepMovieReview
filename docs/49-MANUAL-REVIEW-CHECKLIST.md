# Batch 4 — Manual Review Checklist (cannot be automated)

> Status: **human-only, fail-closed gate** · Зависит от: Batch 3 preview (`48-PREVIEW-TRANSCRIPT-MIGRATION.md`) · Блокирует: `LOCKED` → `published`
> Viewing master: `The Truman Show (1998) BDRip.mkv` · SHA-256 `E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575` · 6177.792s (01:42:57.792) · 1920×1080 H.264 24000/1001 · EN Original DTS 5.1 (stream 5) + embedded EN SubRip 695 cues (stream 8)

---

## 0. Принцип честности

- Ни одна запись с `VISUAL_REVIEW_REQUIRED` не становится канонической по транскрипту.
- `VISUAL_ONLY` candidateObservation остаётся `null` до просмотра (см. `44-FACTUAL-REWRITE`).
- 15 текущих DRAFT сцен (`30–4680s` приблизительные) **не равны** 24 embedded главам — главы — навигационные вехи, сцены — editorial решение.

---

## 1. Что подготовить до просмотра

- [ ] Воспроизвести точную копию BDRip (сверить SHA-256; другая сборка = другой master).
- [ ] Использовать timestamp-конвенцию Matroska `00:00:00.000` → PTS seconds (см. `38-VIEWING-MASTER-INTAKE` §5).
- [ ] Открыть `39-MASTER-REANCHOR-LEDGER` (39 записей) + `40/42/43-MIGRATION` (волны 1-3, 14 SPLIT) + `44-FACTUAL-REWRITE` (23 candidates, 8 VISUAL_ONLY) + `41-MASTER-DERIVED-METRICS` (1036 кандидатов, median 3.25s).
- [ ] Открыть `48-PREVIEW-TRANSCRIPT-MIGRATION.md` — 9 TRANSCRIPT_ONLY уже готовы к финальному wording, 11 transcript-замен из волн — тоже.

---

## 2. Просмотр — что фиксировать

Для каждой из 25 `VISUAL_REVIEW_REQUIRED` (см. `46-PROMOTION-READINESS: visualReviewBlocked=25`):

| # | evidenceId | chapter | что смотреть | новый atomic ID (пример) |
|---|---|---|---|---|
| 1 | `truman-ev-daycount` | ch-02 | on-screen day counter цифра | `truman-ev-day-counter` (VISUAL) |
| 2 | `truman-ev-routine` | ch-02 | montage повторений | (VISUAL) |
| 3 | `truman-ev-kaiser` | ch-02 | blocking относительно щита | (VISUAL) |
| 4 | `truman-ev-raincloud` | ch-08 | локализованный дождь | (VISUAL) |
| 5 | `truman-ev-drowning` | ch-06 | flashback лодка/шторм | (VISUAL) |
| 6 | `truman-ev-fingers` | ch-09 | скрещенные пальцы Мэрил | (VISUAL) |
| 7 | `truman-ev-wall` | ch-21 | столкновение с горизонтом | (VISUAL) |
| 8 | `truman-ev-europe` | ch-06 | газетный заголовок | (VISUAL) |
| 9 | `truman-ev-sleep` | ch-17 | Кристоф у монитора | (VISUAL) |
| 10 | `truman-ev-ghost` (part) | ch-06 | identity/removal staging | `truman-ev-father-reappearance` (MIXED) |
| 11 | `truman-ev-light` (part) | ch-02 | falling fixture | `truman-ev-light-fall` (VISUAL) |
| 12 | `truman-ev-fiji` (part) | ch-02/07 | collage | `truman-ev-sylvia-collage` (VISUAL) |
| ... | ... | ... | ... | ... |
| 25 | (все MIXED/VISUAL из миграций) | — | см. `45-MASTER-SEGMENTATION` + волны | — |

**Правило записи:** `observation` = только то, что видно на экране; `claimLayerNote` → отдельный `Meaning/Character/Decision` модуль с поддержкой.

---

## 3. Пересборка сцен

- Текущие: `15 DRAFT` с `start:30,300,540…` `end:300,470,680…` — приблизительные, **не покрывают** 6177.792s.
- Будущие: `N VERIFIED` с точными `start/endTimestampSeconds` внутри 24 глав (главы непрерывны 0.000→6177.792, см. `45`).
- Использовать `41-METRICS`: `sceneChangeCandidatesPerMinute` и `subtitleCuesPerMinute` как подсказку плотности, но не как авто-разрезание.
- Каждая новая сцена → `verificationState: "VERIFIED"`, `spoilerLevel` монотонна (сцена ≥ evidence, проверка в `film-package-integrity`).

---

## 4. Атомарный переход

После просмотра и пересборки сцен, выполнить одним коммитом:

```
MASTER_IDENTIFIED + SECONDARY_SOURCES  →  LOCKED
- удалить FilmPackage.research
- добавить ingest.edition.verifiedAt (YYYY-MM-DD, валидная календарная дата)
- у каждого evidence: sourceIds = ["<locked-film-edition-sourceId>"], sceneId → VERIFIED, timestampSeconds внутри сцены
- 14 SPLIT: старые IDs retired → замены (71 refs rewired)
- 23 REWRITE: factual observation заменён per candidateObservation (92 refs intact, IDs stable)
- 2 ATOMIC: только смена provenance (19 refs)
- все 182 refs должны остаться 14/23/2 и 71/92/19 (тест `promotion readiness exhaustive`)
```

Только после этого `film.status` может стать `published` и `homepageFeaturedFilmSlug` переключиться с `pilot-film` → `the-truman-show` (Batch 5).

---

## 5. Критерий готовности к `published`

- [ ] Все VISUAL факты просмотрены и задокументированы.
- [ ] Все сцены VERIFIED, покрытие 0→6177.792 без дыр/нахлёстов.
- [ ] Все evidence с `sceneId + timestampSeconds` + `film-edition` source.
- [ ] `film-package-integrity` green (71/71 тестов + `spoiler monotonicity` + `VISUAL_REVIEW` gate снят только там, где просмотр был).
- [ ] Независимый review библейского/финального синтеза (`03-RATING-METHODOLOGY`).

---

*Этот чек-лист — последний ручной барьер. Автоматика больше ничего не заполнит честно.*
