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

## Дополнительная проверка 2026-10-29 — не сертификат соответствия

- На `ab659f4` реальный NVDA/Chrome156 прошёл обе таблицы, их названия,
  заголовки столбцов и строку первой таблицы с её row header и значением.
  Настоящий UI zoom изменил innerWidth960→480→320 при неизменном OS window;
  reflow проверен на четырёх маршрутах. Evidence check123643911102 восстановлен
  через Checks API с независимой проверкой размера, SHA256 и gzip.
- На том же SHA настоящий VoiceOver запустился в Safari26.6, прочитал первую
  таблицу, column header и row header/value. Сценарий второй таблицы **FAIL**:
  initial capture поймал отложенную подсказку, не название. Это не pass;
  полный захват семантических реплик и отдельная проверка heading role требуют CI.
  `retries:0` у Guidepup0.38 означает ноль вызовов macOS delegate; используется
  одна попытка, а не скрытые повторы навигации.
- Дополнительно измерены 2582 Chromium incomplete node/state pairs на1440/390:
  normal/background PNG при реальной opacity1, сохранении градиентов и text-range
  crop; шесть неоднозначных box bounds пересняты по самим text nodes, без SVG и
  псевдоэлементов. Найден trace поверх букв трёх lens marks: исправлены слой и
  mobile positioning. После пересъёмки этих трёх ranges все2582 bounds≥WCAG
  threshold; это ограниченный Chromium paint review, не автоматическое закрытие
  всех Firefox/WebKit incomplete или всех состояний шести линз.
- iPhone16Pro Simulator/iOS18.6 загрузился, но host SafariDriver readiness **FAIL**
  (check123647264931, verified659compressed bytes). Запуск host driver перенесён
  перед boot Simulator; status polling получил общий90s deadline и nested causes.
  Новый результат ещё не подтверждён. Simulator не означает physical iPhone/VO.
- Визуальная база обновлена только для двух homepage views: labels над trace,
  mobile label container relative. Остальные26records сохранены байт-в-байт.
  Двойная запись и финальный replay28pages прошли. Обнаруженный отдельный race
  измерителя устранён ожиданием настоящего hydrated graphics backend: SSR
  `MEDIUM / unknown` менял ширину footer; состояние не форсируется.

Следующий exact-head контроль `2f25482` намеренно отверг page-title speech как
доказательство h1: VoiceOver оставался на `web content group` и предлагал войти
в web area. Подготовка курсора теперь полностью дожидается Item Chooser,
выбора/Enter/interact, записывает каждый шаг и переходит к первому web item;
строгий heading-role guard не убран. Подтверждение исправления требует нового CI.
В том же run iOS уже дошёл до настоящего session handshake (device Booted), но
получил timeout поиска remote Safari/RWI application. Добавлены Simulator.app и
первый launch/terminate MobileSafari перед automation session, не подмена движка.
Метод: `SENAI4LIFE/RemoteIFES/e2e/harness/safari-smoke.js`; особенности настоящих
W3C touch actions/release описаны в `garrytan/gstack#3058`. Mobile taps теперь идут
через touch actions, не JS click. Итог этих исправлений ещё не подтверждён.
Отдельно проверены все6линз на1440/390:62text ranges, minimum bound6.369:1,
без перекрытия метаданных. Это дополняет, но не заменяет cross-engine review.

На `4103110` Safari26.6 назвал Item Chooser «VoiceOver Menu», а не буквальным
«Item Chooser»; guard подготовки принимает оба названия, не ослабляя h1/table
assertions. iOS не дошёл до нового launch: cold `bootstatus` на Intel превысил240s.
Следующая проверка использует поддерживаемый Apple Silicon `macos-15`, открывает
Simulator.app до bootstatus и сохраняет его stdout/ошибку с лимитом480s. Нельзя
считать это успехом до CI. Chromium CI также выявил необходимость снимать геометрию
в одном layout snapshot после естественного reveal, а не сравнивать bbox,
прочитанные по разные стороны анимации. Checks сохраняет реальные координаты при
любом следующем overlap failure; ни правило, ни текст не исключены из проверки.
