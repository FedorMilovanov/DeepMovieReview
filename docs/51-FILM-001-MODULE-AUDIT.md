# Film 001 — Module prose audit

> Film: **The Truman Show** (1998)
> Edition: `LOCKED`, SHA-256 `E8543F61…B3B575`, 6177.792 с
> Date: 2026-10-28
> Scope: the fourteen analysis modules of `the-truman-show-canonical.ts`
> Result: **eight corrections, five new or promoted anchors, three new guards**

The article layer (`docs/50`) has structural guards: it cannot quote a timestamp
or a measured number that the master does not support. The modules had no such
protection, because their claims are prose that cites evidence — and prose can
cite a record that does not actually say what the sentence says. This audit
checked every module claim against the record it cites, and every quotation
against the embedded English subtitle track.

## 1. Method

Three passes, in this order:

1. **Support pass.** For each item: does the cited evidence record carry the
   claim as written? Records were read, not skimmed for keywords.
2. **Quotation pass.** Every quoted line in the modules was searched in the
   embedded English SubRip stream (695 cues) and matched to its second. A quote
   with no cue is either a translation of a line that was cut or an invention.
3. **Credits pass.** Production facts (cast, crew, music) were checked against
   the credit crawl of the master itself — frames at 5760–5940 s — and were
   removed when the master could not settle them. A film-site claim that the
   film cannot settle is a claim the film does not have.

## 2. Corrections

| # | Where | What was wrong | Verdict | Fix |
| ---: | --- | --- | --- | --- |
| 1 | `characters` → Сильвия `believes`; `moral-analysis` → `truman-moral-sylvia` `consequence` | «Как всё это закончится?» приписан Сильвии, «на булавке» | В кадре кнопка «HOW'S IT GOING TO END?» прижата к груди **самого Трумана** в подвале (1700 с), Сильвии в этой сцене нет | Атрибуция убрана у обоих пунктов |
| 2 | `relationship` → `truman-rel-knife` | Заголовок «**Нож** и „Сделай же что-нибудь!“» | В кадре кухонная тёрка «Chef's Pal» в блистере (3250 с) | «Тёрка и „Сделай же что-нибудь!“» |
| 3 | `characters` → Марлон; `relationship` → `truman-friend-earpiece`; `permission`; `moral-analysis`; `biblical-synthesis` | «Подсказки через наушник» — устройство, которого нет ни в одном леджере | Диалоговая дорожка показывает другое: обещание произносится **дважды, с поправкой** (3447.8 → 3459.2 и 3464.3 → 3469.9) | Пять формулировок заменены на проверяемый дубль; добавлена запись `truman-ev-marlon-retake` |
| 4 | `family-youth` → `truman-fam-authority` | Цитата «Ты опоздал — всё уже открыто» + support указывал на запись о страховом агентстве | Реплика: «There's nothing left to explore» — «Исследовать больше нечего» (3847.7) | Цитата и support исправлены, уровень поднят до `MAJOR` по уровню записи |
| 5 | `family-youth`, `teaching-signals`, `craft` | Битая лексика research-эпохи: «немошеннического», «реклама вшейта», «переназывает», «сопережевании» | Не слова | Исправлено |
| 6 | `characters` → Мэрил, Мать; `family-youth` → `truman-fam-mother` | Каст: «актриса Ханна Гилл», «актриса Аланис Монклер» | Титральный блок каста не разрешается покадровой выборкой 30 с (5760–5940 — блоки продюсеров, костюмов, VFX, музыки); мастер имён не подтверждает | Имена актрис и придуманная фамилия убраны, характеристики сохранены |
| 7 | `moral-analysis` → `truman-moral-corp` | «Корпорация Omnicom», «5000 камер» — из вторичного разбора | Названия корпорации в мастере нет; число камер **есть** — 3895 с: «где-то порядка пяти тысяч» | Название убрано, число анкорено новой записью `truman-ev-camera-count` |
| 8 | `sources-method` → четыре `locator` | Опровергнутые факты («подкоп», «Кто нуждается в Европе?», «Личный дождь», «наушник») поданы как содержание фильма | Это утверждения вторичных источников | Локаторы переписаны: сначала утверждение источника, затем явная пометка «в фильме отсутствует / не подтверждено» |

## 3. Verified as correct (do not «fix» these)

Проверка не только отнимала. Ниже — то, что выдержало сверку и теперь может
опираться на мастера:

| Утверждение | Секунда | Формулировка в дорожке |
| --- | ---: | --- |
| «Порядка пяти тысяч камер» | 3895.0 | «Somewhere in the vicinity of 5,000» |
| «Мы принимаем реальность, которую нам предъявляют» | 3972.1 | «We accept the reality of the world with which we're presented» |
| «Та же ложь, тот же обман» | 5582.2 | «The same lies, the same deceit» |
| «В моём мире тебе нечего бояться» | 5587.5 | «But in my world, you have nothing to fear» |
| «Настоящим был ты» | 5565.1 | «You were real. That's what made you so good to watch» |
| «Там снаружи не больше правды, чем в моём мире» | 5574.4 | «There's no more truth out there than in the world I created for you» |
| «Звезда» | 5555.9 | «You're the star» |
| «Включите солнце» | 4810.0 | «Cue the sun» |
| Псалом 138 (синодальная нумерация) — «Куда пойду от Духа Твоего?» | — | Еврейский 139 = синодальный 138; нумерация в модуле верна |
| «Additional Original Music by PHILIP GLASS» | 5940 (титры) | Читается в кадре титров |

Утверждение о наушнике было особенно упорным именно потому, что звучит
правдоподобно: сцена действительно выдаёт постановку. Но выдаёт её **повтор
реплики**, а не устройство — и повтор проверяем.

## 4. New and promoted anchors

| Record | Second | Scene | Why |
| --- | ---: | --- | --- |
| `truman-ev-marlon-retake` | 3459.2 | `truman-sc-father-and-son-reunion` | Заменяет неподтверждённый наушник проверяемым дублем |
| `truman-ev-camera-count` | 3895.0 | `truman-sc-trutalk` | Переносит число камер из вторичного разбора в мастер |

Оба — диалоговые, без единого утверждения о картинке, и оба леджерятся в
`trumanPostLockEvidenceVerifications` как `TRANSCRIPT_CONFIRMED`. Всего
пост-замочных добавлений теперь **пять** (три — из статьи, два — из аудита);
канонический граф: 41 → 46 записей.

## 5. Guards

Три теста превращают находки в инварианты:

1. **Никакой битой лексики** в прозе модулей (`вшейт`, `немошен`, `переназ`,
   `сопережевании`, `Аланис`, `Ханна Гилл`, `Omnicom`).
2. **Ни одного опровергнутого факта в утвердительной форме.** Слова `наушник`,
   `подкоп`, `кто нуждается в европе`, `личный дождь`, `булавк` вне
   `sources-method` запрещены; внутри `locator` разрешены только вместе с
   маркером атрибуции («в источнике», «не подтверждено», «в фильме
   отсутствует», «не читается»).
3. **Кнопка и тёрка — у своих героев.** Кнопка не приписывается Сильвии, сцена
   срыва не описывается словом «нож».

## 6. What this audit did not settle

- **Производственные факты.** Сисайд (Флорида), оператор Питер Бизиу, Лора
  Линни, партитура Буркхарда Делвица и Филипа Гласса — это факты производства,
  а не кадра. Мастер их не подтверждает; они держатся на производственных
  материалах из списка источников. Следующий проход должен либо дать каждому
  такому факту ссылку на конкретный источник, либо убрать его — как уже убраны
  имена актрис в профилях персонажей.
- **Оценочные суждения.** «Двойная игра без единого слова „в лоб“», «дешёвый
  забор» — интерпретации, а не наблюдения; проверке не подлежат, но и
  выдаваться за измерения не должны.
- **Каст.** Титральный блок с именами актёров всё ещё не разрешён покадрово;
  если он понадобится, это отдельная задача с покадровым чтением титров
  5760–6177 с.
