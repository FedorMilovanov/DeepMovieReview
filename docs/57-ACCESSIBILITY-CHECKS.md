# Постоянные проверки доступности

## Минимальная структура

- `scripts/browser-audit.mjs`: существующий подробный Chromium/CDP audit сохраняется.
- `npm run test:a11y`: короткий общий сценарий через playwright-core + axe-core,
  без второго test framework, Docker, облака или нового workflow.
- Существующий CI устанавливает Chromium/Firefox/WebKit, запускает оба аудита на
  preview production build, затем отдельно пересобирает и проверяет public build.
- Playwright и axe закреплены в lockfile. Браузеры устанавливаются отдельно:
  `npx playwright-core install --with-deps chromium firefox webkit`.
- По умолчанию нужны все три движка. Ошибка установки/запуска — failure, не skip.
  `A11Y_BROWSERS=chromium CHROME_BIN=<path> npm run test:a11y` — только локальная
  частичная проверка; она не доказывает Firefox/WebKit. Нужен Node24.

## Охват

Четыре поверхности: главная, каталог, статья с FULL, производственное досье;
1440/390 CSS px на каждом движке. Это narrow viewport, не настоящий mobile Safari
и не доказательство browser zoom200. Сканируется весь document после готовности
страницы/шрифтов. Открытое disclosure-меню проверяется отдельно в `.siteHeader`:
это component scan, не повторная оценка контента под раскрытой навигацией.

Проверяются язык, h1, reflow, runtime errors, Enter/Escape и возврат фокуса меню,
оглавление под sticky header, scope заголовков таблиц, настоящий Tab после мыши,
видимый focus ring, локальный ArrowRight scroll при широких данных и удаление
скрытого spoiler-раздела из DOM. После смены spoilers выполняется новый document scan.
Синтетическая широкая ячейка существует только в изолированном browser context.

## Результаты и ограничения axe

`a11y-report/` (не Git) содержит полные axe JSON, обычные и явно помеченные stress
screenshots, summary с версиями движков/axe/Playwright, URL/state/scope и причинами
incomplete. CI загружает эту папку вместе с прежним browser-audit; нарушения и ошибки
сценария также попадают в экранированные GitHub-аннотации. Автоматические нарушения
WCAG A/AA и best-practice вызывают failure, без exclude/отключённых правил.

Incomplete не становится pass. При первом локальном полном Chromium scan обычной
статьи причины включали bgGradient с relatedNode=body и pseudo-elements: body имеет
radial-gradient, header — сложные поверхности. Есть также non-text/1:1/overlap cases.
Все причины сохраняются; это не автоматически подтверждённый контраст.
`audit:premium` отдельно защищает численные token pairs, но не заменяет ручную
оценку сложного фона. Проверка допускает merge технических регрессий, а не заявление
о полном соответствии WCAG или закрытии всех needs-review.

Первый scan выявил мелкие source links в досье (~15×15px) и неоднозначное ARIA
именование: ссылки увеличены до24×24px без перекрытия соседей; подписанные группы
получили role=group. Дизайн остальных страниц и публикационные статусы не менялись.

## Ручной чек-лист перед существенным релизом reader UI

На Windows: NVDA+Firefox/Chrome. На Mac: VoiceOver+Safari; для mobile — iPhone.
Не требовать одинаковых дословных фраз у разных AT. Сохранить дату, SHA,
OS/browser/AT versions, действия, spoken transcript и найденные проблемы.

- Заголовки/оглавление и main находятся структурной навигацией.
- Обе таблицы имеют понятное имя, row/column headers читаются при движении по клеткам.
- Browse mode и передача клавиш scroll region не создают ловушку.
- Меню открывается/закрывается, фокус возвращается, скрытые links не читаются.
- Снижение spoilers убирает защищённый текст из чтения, не теряет контекст фокуса.
- Подписи/alt полезны, русский текст и имена ссылок понятны.
- На настоящем browser zoom200 и при reflow320 нет потери текста/функций.
- Спорные contrast nodes проверены на реальном фоне; записать пары/ratio/screenshot
  либо честный pending. Не убирать градиент только для сканера.

Ручная AT-проверка пока не выполнена. Автоматизация браузера не заменяет её.
Расширенный справочник методов — `56-ACCESSIBILITY-VERIFICATION-PLAYBOOK.md`.
