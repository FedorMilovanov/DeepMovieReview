# Универсальные стили и добавление статей

## Решение

Новая статья — новые типизированные данные, а не новая таблица стилей.
`FilmArticle` / `ArticleBlock` в `src/lib/film-package.ts` остаются единственным
контрактом статьи. `ArticleView` рендерит все фильмы одинаковыми семантическими
блоками. Производственное досье остаётся отдельным материалом и рендерером.
Ни фильм, ни редакторский текст не выбирают CSS-классы, цвета или inline-style.
Публикационные ограничения, preview и noindex не меняются.

## Что перенесено из проектов владельца

Изучены исходники, не только README (anchors на момент исследования):

- `FedorMilovanov/gb-is-my-strength`, `54877be`: [DESIGN-TOKENS.md](https://github.com/FedorMilovanov/gb-is-my-strength/blob/54877be/docs/DESIGN-TOKENS.md),
  [ARTICLE-STANDARD-CHARTER.md](https://github.com/FedorMilovanov/gb-is-my-strength/blob/54877be/docs/ARTICLE-STANDARD-CHARTER.md), [check-design-tokens.js](https://github.com/FedorMilovanov/gb-is-my-strength/blob/54877be/scripts/check-design-tokens.js),
  [css-layer-validator.js](https://github.com/FedorMilovanov/gb-is-my-strength/blob/54877be/scripts/css-layer-validator.js), `AGENTS.md`.
  Берём семантические токены, постепенную миграцию без глобальных замен,
  машинный контракт вместо устных обещаний и разделение текста/источников/подачи.
- `FedorMilovanov/TheLegendaryPoet`, `1a9f1b3`: `POET_AUTHORING_GUIDE.md`,
  `COMPONENT_BLUEPRINTS.md`.
  Берём «одна сущность — один модуль данных», единый registry, общие renderer-компоненты
  и разделение authoring/publication. Новый реестр рядом с film-registry не создаём.
- `FedorMilovanov/AuditRepo`, `4943c56`: `AUDITREPO_OPERATING_MODEL.md`.
  Берём проверку причины, а не накопление симптомов; Product владеет runtime-истиной.
  Этот документ — контракт, не второй архив всех найденных багов.

Не копируем чужую визуальную идентичность, Tailwind/reset или исторические
`!important`-потолки. У DeepMovieReview уже есть собственные токены и качество runtime.

## Владельцы файлов

`src/styles/film-article.css` — только ordered imports:

| Файл в `src/styles/article/` | Ответственность |
|---|---|
| `body.css` | Заголовок, byline, оглавление, разделы, типизированные блоки, таблицы |
| `entry.css` | Ссылка-вход в статью с карточки фильма |
| `production.css` | Производственное досье, факты, история, группы источников |
| `reading.css` | Типографическая доводка, motion fallback, печать, breadcrumbs |

`src/styles/homepage.css` — только ordered imports из `src/styles/home/`:
`hero`, `analysis`, `evidence`, `craft`, `discovery`, `responsive`.
`homepage-optics.css` пока сохраняет собственного владельца — оптические эффекты.

Порядок правил сохранён. Сплит сам по себе не вводит cascade layers: перенос
unlayered-правил в layers меняет приоритет относительно CSS Modules и utilities.
Это отдельная миграция с собственной проверкой, а не безопасное переименование.

Общие основы: `tokens.css`, `primitives.css`, `platform.css`, `tilt.css`,
`experience.css`. Не создаём вторую палитру `--color-*` рядом с имеющимися
`--surface-*` / `--ink-*` / `--accent-*`. Legacy-алиасы пока совместимы;
мигрируем только затронутые компоненты с проверкой контраста.

## Как добавить статью без CSS

1. Создать модуль фильма в `src/data/films/`, подключить через существующий registry.
2. Заполнить ArticleBlock: paragraph, aside, illustration, subhead, pullquote,
   timeline, measurement, measurement-table, corrections. Все эти блоки уже оформлены.
3. Иллюстрация выбирает только семантический `layout: wide | inset` и assetId из
   существующего реестра. Нельзя передавать CSS-класс или произвольный цвет.
4. Прогнать domain validation, тесты и аудиты; проверить spoiler projection.
5. Проверить рендер на 1440 и 390, клавиатуру, reduced motion и печать.

Если реально нужен новый тип блока: сначала общий тип и validator, затем один
переиспользуемый renderer и файл ответственного компонента, тесты и browser evidence.
Не делаем исключения по slug, nth-child или названию фильма. Одноразовый спецэффект
не является достаточным основанием для нового блока.

## Проверки

- `npm run audit:styles`: импортный граф без циклов, entry-файлы только компонуют,
  файлы home/article не растут сверх 450 строк, не знают film identity и не вводят
  `!important`; данные фильма не импортируют CSS и не выбирают className/cssText.
- `scripts/lib/style-sources.mjs`: аудиты читают поверхность вместе с локальными
  импортами, а не ошибочно считают import-only файл пустой статьёй.
- `CHROME_BIN=… BASE_URL=… npm run audit:style-parity`: 6 маршрутов × 2 ширины,
  computed styles и геометрия элементов сравниваются с до-рефакторинговой базой.
  Это **проверка статического каскада**, не замена скриншотам/axe/motion-проверкам.
  Проба намеренно стабилизирует движение; по ней нельзя заявлять корректность tilt.
- `--write` у fingerprint дважды снимает текущий build и отказывается писать
  невоспроизводимую базу. Обновлять baseline можно только после разбора отличий.
  Сжатый JSON раскрывается обычным gzip; детали сравнения доступны через `--diff`.

## Следующие отдельные волны

Оставшиеся крупные владельцы: film-modules, film-verdict, homepage-optics и shell.
Не считаем файловый сплит завершением всей дизайн-системы. Нужны отдельные волны
токенизации legacy-использований и browser-проверки новых типов блоков; нельзя
маскировать их механическим распиливанием файлов или обещать отсутствие любого
будущего CSS. Рост контента не должен вызывать рост стилей; рост UI-возможностей может.
