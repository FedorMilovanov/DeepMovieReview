# Как закрывать ограничения accessibility-проверок: 64 метода

Исследование: 29 октября 2026. Область: DeepMovieReview, Firefox/WebKit,
реальные скринридеры и незавершённая проверка контраста axe.
Это каталог проверок и способов их организации, **не заявление, что все 64 выполнены**.
Рекомендации ниже — предлагаемый план для нашего продукта; возможности инструментов
подтверждены первичными источниками. Нельзя подменять проверку соответствия одним
автоматическим баллом: W3C требует также квалифицированную человеческую оценку.
[4](https://www.w3.org/WAI/resources/)

## 1. Что действительно есть в репозитории и этой среде

- Проверенный предыдущий head: `3e134dd34763dd1c7bb08e1b88190bfeb1394390`.
  Через GitHub API повторно подтверждены пять успешных check-runs этого SHA.
- `scripts/browser-audit.mjs` — собственный **Chromium/CDP** runner, не Playwright Test.
  Он использует `/json/version`, `/json/new` и `Input.dispatchKeyEvent`.
  Поменять CHROME_BIN на Firefox/WebKit недостаточно: нужен другой транспорт.
- В package.json нет Playwright, axe-core, Guidepup или Selenium. Старые разовые
  axe-прогоны не являются постоянным npm/CI gate. `audit:premium` считает контраст
  заданных токенов, а не произвольного фактически скомпонованного фона.
- Исторические результаты предыдущего шага: 574 browser checks, 28 visual views,
  26 style + 121 regression tests; axe main статьи: violations=0,
  color-contrast incomplete=290 узлов на каждом из двух viewport.
  Это не новый прогон и не доказательство покрытия всего сайта/всех состояний.
- При текущем исследовании sandbox восстановлен из файлового снимка: нет прежних
  `/tmp/chromium`, NSS-библиотек, node_modules и вспомогательных инструментов.
  Системный Node — 22.22.3; репозиторию нужен Node24. Сначала восстановить инструменты,
  не отключать engine-strict. Из npm повторно подтверждены версии Node24.22.2,
  playwright-core1.64.1 и @sparticuz/chromium153.0.0 — это не их установка.
- Не обнаружены системные Firefox/Chromium, Docker, Xvfb или Orca. Есть npm, git, gh.
  Egress разрешён к GitHub, npm и PyPI, не к обычным browser CDN/apt/MCR/AT-облакам.
  Наличие npm-библиотеки само по себе не обеспечивает executable и системные .so.
- Чтобы не терять историю после восстановления, локальные файлы сверены со всеми
  327 файлами remote head (различий нет), дубликат сохранён stash, выполнен только
  fast-forward той же arena-ветки. Другие изменения продукта не внесены.

### Обозначения места выполнения

**S** — можно реализовать в sandbox после восстановления Node24/Chromium/зависимостей.
**CI** — запуск в GitHub Actions с необходимыми браузерами/библиотеками; ещё надо внедрить.
**D** — desktop/реальное устройство с нужной ОС и разрешениями.
**R** — доверенная удалённая среда; нужны доступ/разрешённый egress и проверка приватности.
Ни одна метка не означает «уже выполнено». Несколько продуктов на axe — не независимые движки.

## 2. Браузерные движки и настоящие браузеры — методы 01–08

Playwright поставляет специальные сборки Firefox/WebKit. Его WebKit происходит из
WebKit main и не является branded Safari; официальная документация прямо разделяет их.
[1](https://playwright.dev/docs/browsers)
Selenium/WebDriver — отдельный путь к установленным браузерам.
[1](https://www.selenium.dev/selenium/docs/api/py/index.html)

| № | Метод и применение к DMR | Где | Что сохранить / критерий |
|---|---|---|---|
| 01 | Playwright Firefox: статьи, таблицы, оглавление, tabs и spoilers | CI | Версии движка/ОС; trace, DOM assertions, реальные клавиши; нет потери содержимого |
| 02 | Playwright WebKit на Linux: тот же общий набор контрактов | CI | Отдельный результат WebKit; не называть его Safari/iOS certification |
| 03 | Chromium как контрольный проект рядом с двумя движками | S/CI | Одинаковые входные данные; отличия не смешивать с разницей fixture/state |
| 04 | Headed Firefox через geckodriver/Selenium | D/CI | Проверка официального Firefox и браузерного zoom, а не только patched build |
| 05 | Safari macOS через safaridriver | D/CI | Версии Safari/macOS, включённая Remote Automation, результат сценариев |
| 06 | Реальный Safari на iPhone: touch, viewport, прокрутка таблиц | D/R | Модель/iOS/Safari, видео жестов, доступность всех колонок и текста |
| 07 | Safari iOS Simulator через safaridriver на Mac | D/CI | Отдельно маркировать simulator; затем подтвердить критические сценарии на устройстве |
| 08 | Playwright WebKit на macOS плюс сравнение с Safari stable | D/CI | Отделить ошибки движка от портовых/OS-особенностей и браузерной оболочки |

Safari и iOS WebDriver требуют соответствующего Apple-окружения; для iOS есть путь
через подключённое устройство или Simulator. Не обещать native Safari внутри Debian.
[1](https://webkit.org/blog/6900/webdriver-support-in-safari-10/)
[2](https://webkit.org/blog/9395/webdriver-is-coming-to-safari-in-ios-13/)

## 3. Как доставить выполнение при ограниченной сети — методы 09–16

Это способы организации запуска, не восемь новых доказательств WCAG.
Playwright документирует установку системных зависимостей, cache path и собственный
artifact repository. Docker-образ содержит браузеры и system dependencies, но не npm
пакет Playwright; версии клиента/образа нужно согласовать.
[1](https://playwright.dev/python/docs/browsers)
[3](https://playwright.dev/docs/docker)

| № | Способ | Где | Условие / профессиональное ограничение |
|---|---|---|---|
| 09 | GitHub Actions: install --with-deps firefox webkit и отдельный browser job | CI | Проверить egress именно runner; отсутствие бинарника — blocked/failure, не pass |
| 10 | Pinned официальный Playwright Docker image | CI/D | Docker daemon и доступ к MCR; закрепить digest/версию; здесь Docker не обнаружен |
| 11 | Восстановление доверенного browser cache | S/CI | Ключ включает Playwright revision, ОС/архитектуру; cache miss не считается проверкой |
| 12 | Разрешённый внутренний mirror через PLAYWRIGHT_DOWNLOAD_HOST | S/CI | Проверенные оригинальные артефакты и целостность; это не обход egress случайным зеркалом |
| 13 | Заранее подготовленный self-hosted runner | CI/D | Учёт обновлений ОС/браузеров, изоляция draft, отсутствие секретов в PR-коде |
| 14 | browserType.connect к доверенному Playwright Server | R | Совместимые версии; auth/TLS/сеть; не выставлять управляющий browser endpoint публично |
| 15 | Selenium Remote WebDriver/Grid для installed Firefox/Safari | R | Нужны browser nodes и драйверы; одна установка selenium из PyPI их не создаёт |
| 16 | Согласованная browser/device farm для настоящего Safari/iPhone | R | Подтвердить реальные устройства/браузеры, стоимость и политику данных до загрузки draft |

Нельзя выдавать `npm install playwright` или `@playwright/browser-firefox` за обход
CDN: библиотека и скачивание браузерного executable — разные этапы.
[4](https://playwright.dev/docs/library)
Удалённый Playwright Server и сетевое разделение описаны в официальном Docker guide.
[3](https://playwright.dev/docs/docker)
Для №15 основа — Remote protocol Selenium, для №16 это наше предложение размещения,
не заявление о подключённом сервисе или уже купленной подписке.
[1](https://www.selenium.dev/selenium/docs/api/py/index.html)

## 4. Разбор axe incomplete без догадок — методы 17–24

`incomplete` означает, что автоматике не хватило информации для pass/fail; это не pass.
API отдаёт target, checks any/all/none, data, messages и relatedNodes.
[4](https://www.deque.com/blog/upgrade-accessibility-testing-axe-extension-3-0/)
[1](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)
Официальный Playwright guide требует сначала привести страницу в нужное состояние.
[1](https://playwright.dev/docs/accessibility-testing)

| № | Метод | Где | Артефакт / что именно проверять |
|---|---|---|---|
| 17 | Сохранять полный результат axe, не только counts | S/CI | Все четыре массива: violations/incomplete/passes/inapplicable; версии и контекст |
| 18 | Классифицировать incomplete по check.id/message/data | S/CI | Таблица причин и числа узлов; не объявлять все 290 следствием градиента без данных |
| 19 | Поднимать ancestor chain каждого спорного текста | S/CI | color/background/opacity/filter/blend/pseudo-elements; CSS-владелец и selector |
| 20 | Повторять после появления контента, шрифтов и гидратации | S/CI | Readiness assertion, fonts.ready, отсутствие transient duplicates; не просто большой sleep |
| 21 | Сканировать видимые секции после реальной прокрутки | S/CI | Section/viewport/scroll position; проверить влияние content-visibility, не отключая его для «зелени» |
| 22 | Отдельные scans normal/hover/focus/selected/open | S/CI | Например меню и spoiler controls; закрытое меню не покрывает открытое |
| 23 | Минимальное воспроизведение и сравнение pinned axe versions | S/CI | Один CSS/DOM root cause; новый движок не оправдывает удаление исходного дефекта |
| 24 | Второе представление проблемы в Firefox/Chrome DevTools | D/CI | Сопоставить конкретный selector и фон; другой UI поверх axe не независимое подтверждение |

Причины контрастной неопределённости могут включать изображения, градиенты,
перекрытия и положение элемента. Это диагностические гипотезы, не установленная
причина наших 290 узлов. Deque описывает такие ограничения; Firefox Inspector
отдельно умеет показывать диапазон контраста для сложного фона.
[1](https://dequeuniversity.com/rules/axe/4.7/color-contrast)
[1](https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/)

## 5. Контраст вне возможностей одного axe scan — методы 25–32

Нормативный минимум текста: 4.5:1, крупного текста — 3:1; крупный означает
18pt (24 CSS px) либо 14pt bold, не «любой h2». Порог не округлять вверх.
[1](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
[2](https://www.w3.org/WAI/WCAG20/Understanding/contrast-minimum.html)

| № | Метод | Где | Артефакт / критерий |
|---|---|---|---|
| 25 | Расчёт token foreground/background pairs | S/CI | Уже есть audit:premium; хранить пары и ratio, но не считать ими доказанным итоговый render |
| 26 | Расчёт effective colors через все alpha/opacity layers | S/CI | Список слоёв, исходные CSS colors, итоговый фон; одного computed color недостаточно |
| 27 | Проверка худшего фона под текстом на градиенте | D/S | Диапазон/минимум ratio под областью текста, не средний цвет всей карточки |
| 28 | Проверка текста над изображением на всех responsive crops | D/S | Снимок, координаты, фон и защитный scrim; каждый значимый crop/state |
| 29 | Chrome DevTools CSS Overview/Color Picker | D | Ручная проверка конкретных computed pairs и состояний; сохранить selector и показания |
| 30 | Firefox Accessibility Inspector contrast range | D | Независимая проверка сложного фона и диапазона, не только solid tokens |
| 31 | TPGi Colour Contrast Analyser с ручным выбором пары | D | Зафиксировать цвета/ratio; не брать сглаженный край буквы за её исходный цвет |
| 32 | Non-text contrast: focus, active tab, границы значимых controls | S/D | Проверить необходимые индикаторы относительно соседних цветов, а не только текст |

Chrome описывает CSS Overview и Color Picker, Mozilla — contrast range, TPGi —
анализ пар цветов. Pixel sampling — вспомогательная проверка сложного фона:
антиалиасинг краёв букв нельзя превращать в нормативное измерение цвета текста.
[1](https://developer.chrome.com/docs/devtools/accessibility/contrast)
[1](https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/)
[1](https://developer.paciellogroup.com/color-contrast-checker/)
[2](https://doit.illinois.gov/initiatives/accessibility/guides/color.html)
Контраст необходимого нетекстового индикатора обычно 3:1 с применимыми исключениями.
Focus Appearance 2.4.13 — отдельный **AAA**, не общий обязательный AA-критерий.
[1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
[2](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

## 6. Матрица настоящих скринридеров — методы 33–40

Это независимые сочетания платформы/браузера/AT; никакой один не доказывает остальные.
Предлагаемая приоритетная матрица DMR: №33, 34, 35, 36, затем №37; расширение по аудитории.
Команды NVDA, VoiceOver, TalkBack, Narrator и Orca описаны их авторами.
[3](https://download.nvaccess.org/releases/2026.3/documentation/userGuide.html)
[3](https://support.apple.com/guide/voiceover/browse-webpages-vo27974/mac)
[1](https://support.google.com/accessibility/android/answer/2633135?hl=en)
[2](https://support.microsoft.com/en-us/accessibility/copilot/introduction-to-microsoft-narrator)
[1](https://help.gnome.org/users/orca/stable/howto_structural_navigation.html.en)

| № | Реальная связка | Где | Что получить |
|---|---|---|---|
| 33 | Windows + NVDA + Chrome | D/R | Полный пользовательский маршрут; Speech Viewer transcript и версии |
| 34 | Windows + NVDA + Firefox | D/R | Тот же маршрут; различия Gecko accessibility, таблиц и режима чтения |
| 35 | macOS + VoiceOver + Safari | D/R | Rotor, последовательное чтение, таблицы; speech/caption log и видео действий |
| 36 | iPhone + VoiceOver + Safari | D/R | Swipe/explore by touch, rotor и double tap; отсутствие недостижимого текста |
| 37 | Android + TalkBack + Chrome | D/R | Reading controls, headings/links, жесты и активация элементов |
| 38 | Windows + Narrator + Edge | D/R | Scan mode, чтение и таблицы; отдельный результат Windows accessibility stack |
| 39 | Windows + JAWS + Chrome/Edge | D/R | Virtual cursor, таблицы и Speech History; проверить лицензию, не предполагать бесплатный доступ |
| 40 | Linux desktop + Orca + Firefox | D/R | AT-SPI/структурная навигация; нужен настоящий desktop bus/session, не только npm |

NVDA Speech Viewer даёт текст озвучивания; у JAWS есть Speech History.
[5](https://download.nvaccess.org/releases/2024.1rc1/documentation/userGuide.html)
[1](https://support.freedomscientific.com/teachers/lessons/4.3.4_SelectTextOrImagesOnTheWeb.htm)
Версию руководства не принимать за установленную/актуальную на машине версию AT.

## 7. Конкретные сценарии для AT — методы 41–48

Структурная навигация NVDA/VoiceOver/Orca и различие browse/focus требуют реального
скринридера; наличие role/aria-label в DOM само по себе не доказывает озвучивание.
[3](https://download.nvaccess.org/releases/2026.3/documentation/userGuide.html)
[3](https://support.apple.com/guide/voiceover/browse-webpages-vo27974/mac)
[3](https://help.gnome.org/users/orca/stable/commands_structural_navigation.html.en)

| № | Сценарий DMR | Где | Ожидаемая наблюдаемая проверка |
|---|---|---|---|
| 41 | Перейти по заголовкам статьи и оглавлению | D/R | Уровни/тексты понятны, Enter приводит в нужный раздел; запись сказанного |
| 42 | Перейти по landmarks и заметке «К слову» | D/R | Понятное именование; заметка не разрушает структуру основного материала |
| 43 | Войти в обе таблицы, пройти клетки и заголовки | D/R | Озвучиваются имя таблицы и применимые row/column headers; не требовать одинаковой фразы у разных AT |
| 44 | Сравнить browse navigation и keyboard focus в scroll region | D/R | Табличные команды AT работают; обычные ArrowRight проверять в корректном режиме передачи клавиш |
| 45 | Понизить spoiler level с открытым глубоким разделом | D/R | Скрытый текст отсутствует из чтения/навигации; фокус не остаётся на удалённом узле |
| 46 | Сменить lens/tab и прочитать panel | D/R | Понятны выбранная вкладка, имя/связь панели; проверить ручную/автоактивацию согласно реализации |
| 47 | Открыть/закрыть мобильное меню и продолжить чтение | D/R | Expanded state, логичный focus order/возврат; нет ловушки и чтения скрытого меню |
| 48 | Прочитать иллюстрацию, подпись, ссылки и русский текст | D/R | Alt полезен, нет бессмысленной повторной информации, ссылки понятны вне окружающего абзаца |

Для tabs источник — APG, а не произвольная привычка тестового инструмента.
Не добавлять role=application или blanket tabindex только ради теста.
[1](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

## 8. Клавиатура, масштаб и восприятие — методы 49–56

Это предлагаемые проверки продукта по WCAG/APG. Часть уже есть в CDP audit;
переносить нужно намерение проверки, не Chromium-specific команды.

| № | Метод | Где | Артефакт / критерий |
|---|---|---|---|
| 49 | Мышь → Shift+Tab/Tab → ArrowRight в таблице | S/CI/D | Реальный input, focus-visible и scrollLeft; программный focus не выдавать за клавиатурный |
| 50 | Пройти Tab/Shift+Tab, Enter/Space и Escape по странице | S/CI/D | Порядок, отсутствие traps, видимость под sticky/overlays; не только список focusable nodes |
| 51 | Реальный browser zoom/resize text до 200% | D/CI | Читаемость и доступность функций; deviceScaleFactor=2 **не равен** 200% browser zoom |
| 52 | Reflow 320 CSS px и эквивалент 400% zoom при 1280 | S/CI/D | Нет потери обычного текста; допустимый 2D layout таблицы не распространять на всю страницу |
| 53 | Пользовательские text-spacing overrides | D/CI | line-height1.5, paragraphs2em, letters0.12em, words0.16em: нет потери/перекрытия текста |
| 54 | Forced colors и настоящая Windows High Contrast | S/CI/D | Эмуляция — ранняя проверка; итоговые focus/selected/control states подтвердить на Windows |
| 55 | Reduced motion и отдельно normal motion | S/CI/D | При reduce всё читается; normal smooth scroll/tilt не заменять статичным fingerprint |
| 56 | Симуляция color-vision deficiency/contrast loss | D/S | Оценить различимость состояний без цвета; это вспомогательный просмотр, не доказательство numeric contrast |

Reflow имеет нормативную ширину 320 CSS px и исключения для необходимых 2D layouts;
200% resize text — отдельная задача. Text-spacing — устойчивость к настройкам пользователя,
не требование навсегда сменить дизайн на эти интервалы.
[1](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
[2](https://www.w3.org/TR/WCAG22/)
[1](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
Доступны assisted Tab stops и visual helper Accessibility Insights; не считать весь
FastPass полностью автоматическим. Симуляции зрения документирует Chrome.
[1](https://accessibilityinsights.io/docs/web/getstarted/fastpass/)
[2](https://accessibilityinsights.io/docs/web/reference/faq/)
[2](https://developer.chrome.com/docs/devtools/rendering/apply-effects)

## 9. Структурные пробы, настоящие пользователи и доказательства — методы 57–64

| № | Метод | Где | Как не завысить вывод |
|---|---|---|---|
| 57 | ARIA snapshots/role-name-state assertions | S/CI | Проверяют семантический контракт, не речь NVDA/VoiceOver и не весь OS accessibility tree |
| 58 | Guidepup Virtual Screen Reader в component tests | S/CI | Дополняет реальный AT, не заменяет его; отдельно маркировать virtual |
| 59 | Guidepup с реальным NVDA/VoiceOver | D/CI | Нужны поддерживаемая ОС, machine setup, разрешения и рабочая desktop session; сохранять spoken output |
| 60 | Удалённая лаборатория с настоящим AT | R | Например Assistiv Labs; подтвердить состав услуги, tunnel, доступ и приватность draft до запуска |
| 61 | Сценарное тестирование с опытным незрячим пользователем | D/R | Задача, успешность, затраты/препятствия, согласие на запись; не заменять «просмотром глазами» |
| 62 | Репрезентативная оценка по WCAG-EM | D/CI/R | Явные scope, критерии, страницы, состояния и ограничения; не выдавать одну статью за весь сайт |
| 63 | CI check annotations плюс JSON/trace/screenshots | CI | Failed assertion и measured details доступны через API; не зависеть только от недоступного ZIP |
| 64 | Реестр закрытия needs-review с evidence и ревизией | Repo | Для каждой группы: pass/fail/not-applicable/blocked, основание, reviewer/date/SHA/state; pending не превращать в pass |

Playwright предоставляет ARIA snapshots; Guidepup прямо предупреждает, что virtual
screen reader не заменяет реальные AT и пользователей. Setup для настоящих AT
является отдельным OS-level действием, не свойством Linux DOM-теста.
[1](https://playwright.dev/python/docs/release-notes)
[1](https://www.guidepup.dev/docs/support)
[4](https://www.guidepup.dev/docs/guides/machine-setup)
Для удалённой лаборатории есть документированный путь к настоящим AT; он не подключён
к этому sandbox и не предполагает разрешение отправлять туда draft.
[2](https://assistivlabs.com/use-cases/online-screen-reader-testing)
Подход к ручной оценке и человеческой экспертизе — W3C, не «100% score».
[2](https://www.w3.org/WAI/test-evaluate/)
[4](https://www.w3.org/WAI/resources/)

## 10. Практический порядок внедрения именно у нас

1. **P0, permanent axe evidence.** Отдельный pinned collector, полный JSON и summary
   причин incomplete. Проверять весь document и отдельно нужные states/components;
   старый main-only scan не покрывает header/footer. Не менять дизайн ради инструмента.
2. **P0, три движка CI.** Общие portable сценарии через Playwright, projects
   chromium/firefox/webkit; сохранить имеющийся CDP audit для его специфичных измерений.
   Начать с статьи/досье, таблиц, outline, spoilers, меню и six-lenses.
3. **P0, контраст.** Сначала классифицировать 290 узлов; только затем выбирать
   computed-alpha, gradient range или ручную проверку реального фона. Ни одного exclude
   и ни одного отключения color-contrast для получения зелёного результата.
4. **P1, настоящие AT.** NVDA+Chrome/Firefox на Windows, VoiceOver+Safari на Mac/iPhone.
   Отчёт по сценариям41–48. Можно организовать самому на self-hosted/remote AT без
   просьбы к владельцу повторять весь аудит; платный доступ и раскрытие draft согласовать.
5. **P1, реальный zoom/Windows contrast/TalkBack.** Уточнить границы старой CDP эмуляции:
   геометрия640px при DPR2 полезна, но не доказывает нативный browser zoom или Safari.
6. **P2, регрессии.** ARIA snapshots, Guidepup и ledger; выборочная экспертная оценка.

### Фрагмент collector, не уже установленный npm-скрипт

Предусловия: page создан в Playwright, pinned axe.source инъецирован в страницу,
контент готов по assertions и fonts.ready. Полный axe scan и targeted diagnosis —
два отдельных результата; targeted scan не заменяет общий.

```js
const full = await page.evaluate(async () => axe.run(document));
// Сохранить full целиком, включая incomplete и passes.
const reasons = full.incomplete.flatMap(rule => rule.nodes.map(node => ({
  rule: rule.id, target: node.target, html: node.html,
  summary: node.failureSummary,
  checks: [...node.any, ...node.all, ...node.none].map(check => ({
    id: check.id, message: check.message, data: check.data,
    relatedNodes: check.relatedNodes,
  })),
})));
// reasons + SHA/OS/browser/axe/state/viewport -> JSON и краткие CI annotations.
```

Поле data и структура checks документированы axe; не утверждать диагноз по одному
агрегату count=290.
[1](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)

### Команды и границы

Существующие проверки после Node24 + npm ci: `npm test`, `npm run lint`,
`npm run typecheck`, `npm run audit:premium -- --base <running-base-url>`;
Chromium runner: `BASE_URL=... CHROME_BIN=<actual-executable> node scripts/browser-audit.mjs`.
Зависимости движков нужны отдельно. Preview/public сборки запускать последовательно,
останавливая сервер перед заменой .next. Draft не публиковать ради внешнего scanner.

Будущий CI setup после добавления **проверенных pinned** Playwright-зависимостей:
`npx playwright install --with-deps chromium firefox webkit`, затем portable suite.
Это план, не команда, которая уже работает в текущем package.json; случайные lifecycle
scripts не разрешать и не обходить strict allowlist. На sandbox скачивание с CDN
может остаться blocked: тогда выполнять в доверенном CI, а не подменять движок UA.
[1](https://playwright.dev/docs/browsers)

## 11. Когда ограничения действительно можно снять

- **Firefox/WebKit:** есть успешный результат точного SHA для каждого движка,
  browser/OS versions и portable сценариев. Safari/iOS остаются отдельно, пока нет
  соответствующих настоящих/явно маркированных simulator-прогонов.
- **Ручной screen-reader:** есть реальный AT, оператор, версии, сценарии, transcript
  и найденные проблемы/решения. Guidepup automation не записывать как ручную сессию.
- **Контраст:** известен scope; violations устранены, каждый incomplete разобран
  или честно остаётся blocked/pending. Ручное обоснованное закрытие допустимо даже
  если движок продолжает возвращать incomplete; «0 violations» само по себе недостаточно.
- **Итог:** не «сайт полностью доступен», а проверяемый отчёт о выполненных критериях,
  охваченных страницах/состояниях, реальных ограничениях и оставшихся рисках.
