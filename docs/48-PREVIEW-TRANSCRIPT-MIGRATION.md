# Batch 3 — Preview: TRANSCRIPT-anchored migration (no VISUAL)

> Статус: **preview, не мутация FilmPackage**. Сгенерирован скриптом `scripts/prepare-canonical-migration.mjs`.
> Дата: 2026-10-22 · Master: SHA-256 `E8543F61…` · Chapters: 24 · TRANSCRIPT_ONLY: 9

## Что это и что не это

- ✅ Это — проверочный артефакт: какие будущие VERIFIED сцены можно построить **только** из subtitle-anchors без просмотра картинки.
- ❌ Это — не публикация. VISUAL_ONLY и MIXED остаются `VISUAL_REVIEW_REQUIRED`.
- ❌ Не меняет `the-truman-show.ts` (`MASTER_IDENTIFIED + SECONDARY_SOURCES` сохранён).

## Кандидаты TRANSCRIPT_ONLY (9)

| evidenceId | chapter | anchor | candidateObservation |
|---|---|---|---|
| `truman-ev-greeting` | `truman-ch-02` | `169.796` | Труман произносит свою повторяющуюся утреннюю приветственную формулу. |
| `truman-ev-radio` | `truman-ch-08` | `1798.265` | В автомобильном радио звучит служебный эфир, который отслеживает маршрут Трумана. |
| `truman-ev-mococoa` | `truman-ch-14` | `3226.152` | Мэрил начинает рекламную речь о Mococoa во время семейного конфликта. |
| `truman-ev-beer` | `truman-ch-05` | `587.226` | Марлон произносит рекламно звучащую реплику о пиве. |
| `truman-ev-marlon` | `truman-ch-15` | `3464.272` | Марлон заверяет Трумана, что последнее, что он стал бы делать, — лгать ему. |
| `truman-ev-cuesun` | `truman-ch-18` | `4810.033` | В контрольной среде звучит команда включить солнце. |
| `truman-ev-nocamera` | `truman-ch-22` | `5596.426` | Труман отвечает Кристофу, что у него никогда не было камеры в голове. |
| `truman-ev-guards` | `truman-ch-23` | `5755.382` | После окончания шоу зрители спрашивают, что ещё идёт. |
| `truman-ev-born-live` | `truman-ch-20` | `5101.959` | Кристоф отвечает, что Труман родился на телевидении. |

## Дополнительно: TRANSCRIPT-заземлённые замены из волн миграции

Волны 1-3 содержат смешанные замены; часть из них — TRANSCRIPT-anchored и потому тоже может быть preview без VISUAL:

| replacementId | chapter | anchor | note |
|---|---|---|---|
| `truman-ev-light-explanation` | `truman-ch-02` | `230.943` | TRANSCRIPT |
| `truman-ev-quota-pressure` | `truman-ch-03` | `431.983` | TRANSCRIPT |
| `truman-ev-school-explorer` | `truman-ch-06` | `832.896` | TRANSCRIPT |
| `truman-ev-conception-plan` | `truman-ch-16` | `4122.283` | TRANSCRIPT |
| `truman-ev-trutalk-christof` | `truman-ch-16` | `4058.134` | TRANSCRIPT |
| `truman-ev-sylvia-disclosure` | `truman-ch-07` | `1592.136` | TRANSCRIPT |
| `truman-ev-fiji-departure` | `truman-ch-07` | `1644.899` | TRANSCRIPT |
| `truman-ev-amnesia-explanation` | `truman-ch-16` | `3880.242` | TRANSCRIPT |
| `truman-ev-meryl-call-for-help` | `truman-ch-14` | `3272.199` | TRANSCRIPT |
| `truman-ev-storm-defiance` | `truman-ch-20` | `5169.945` | TRANSCRIPT |
| `truman-ev-final-greeting` | `truman-ch-23` | `5691.316` | TRANSCRIPT |

Всего TRANSCRIPT-заземлённых замен в волнах: **11**

## Следующий ручной шаг (Batch 4, нельзя автоматизировать)

- Просмотр BDRip по `docs/38-VIEWING-MASTER-INTAKE`.
- Для каждой `VISUAL_REVIEW_REQUIRED` — picture-fact + staging → новый atomic ID.
- Пересборка `15 DRAFT (30–4680s)` → `N VERIFIED` с точными `start/endTimestampSeconds`.
- Атомарный переход `MASTER_IDENTIFIED + SECONDARY_SOURCES` → `LOCKED`.
