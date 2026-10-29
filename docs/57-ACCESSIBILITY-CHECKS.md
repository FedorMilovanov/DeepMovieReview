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

`150d8b8`: app-shell и Windows AT **SUCCESS**; atomic geometry подтвердился CI.
VoiceOver теперь доказанно вошёл на настоящий skip link, но лишний `next` перевёл
его в banner перед h1 search. Этот marker-detour удалён: synthetic marker на
странице не создаётся. Строгая роль heading по-прежнему обязательна, нового pass
ещё нет. На Apple Silicon Simulator загрузился сразу; теперь timeout на первом
launch MobileSafari, выбран был oldest iOS18.5. Следующий выбор сортирует только
установленные available iOS runtimes от новых к старым и сохраняет Xcode/OS/arch,
список runtimes, стадию и stdout launch. Это проверяемая смена окружения, не pass.
Подтверждение runner label/architecture: `actions/runner-images/README.md`.

`2024fb3` проверен по API: app-shell/Windows AT/security **SUCCESS**, macOS AT
**FAIL**. Проверенные SHA256 receipts: VoiceOver123676175582 и iOS123678226802.
Удаление banner detour не исправило VO-Command-H: он всё ещё объявляет web group,
не heading. Следующая проверка использует настоящий VoiceOver Headings rotor,
сохраняя native category/title utterances, без DOM-focus или injected marker.
В iOS receipt обнаружен конкретный mismatch: iOS26.2 выбран при Xcode16.4/SDK18.
Теперь выбирается новейший установленный stable Xcode через process-local
DEVELOPER_DIR; xcrun, Simulator.app и spawned SafariDriver наследуют один toolchain.
Runtime отсекается по поддерживаемому SDK major; system xcode-select не изменяется.
Pure selection покрыт тестом (beta/default aliases и несовместимые major versions).
Новый pass до выполнения CI не заявляется; публичный контур и данные не менялись.

`d1b7acc` receipts проверены: iOS123695977245 подтвердил Xcode26.3/SDK26.2,
успешный boot iPhone17Pro/iOS26.2 и настоящий launch MobileSafari (PID9049).
Следующий timeout был в предварительном `simctl terminate`, не в launch.
Этот ненужный stop удалён: Safari должен остаться запущенным для RWI discovery;
функциональные assertions не исключались. Desktop receipt123693152543 в этот раз
отказал ещё на local Safari/RWI session startup, поэтому rotor **не проверен**.
Перед SR/WebDriver теперь явно активируется Safari; --diagnose и ограниченные
логи именно текущего PID экспортируются вместе с причиной startup failure.
Изоляция PID/размер диагностики покрыты тестом; новый native pass пока pending.

`3b39f73` desktop receipt123697633383 (SHA256 verified) уже создал Safari26.6.1
session; Windows actual AT завершился SUCCESS. VoiceOver остановился раньше rotor:
Item Chooser дал «Page Menu, Translation Available», не требуемую роль меню.
В pinned Guidepup keyboard.perform/interact активируют приложение VoiceOver перед
sendKeys; keyboard.press этого не делает. Теперь те же native command codes идут
через press без дополнительной смены приложения. Mapping берётся из SDK, неизвестные
keys/modifiers отклоняются, round-trip покрыт тестом. Это гипотеза исправления AT
навигации, не доказательство native pass; все speech/role assertions сохранены.

iOS receipt123699870046 (`3b39f73`, SHA256 verified) подтвердил согласованные
Xcode26.3/SDK26.2 и boot92s, но отдельный simctl launch в этом запуске завис60s.
Поэтому прежний успешный PID9049 не означает стабильный iOS pass. Убрана ручная
предварительная launch: создание native Safari теперь поручено самому SafariDriver
через стандартную W3C session с useSimulator/deviceUDID. Ни одна проверка страниц,
нативных taps или reflow не удалена; результат следующей сессии пока неизвестен.

`1c8461f` desktop receipt123702681711 (SHA256 verified) подтвердил настоящее
открытие Item Chooser, выбор web content и вход в web area с озвученным skip link.
Замена perform→press устранила предыдущий menu failure в этом запуске. Следующая
проверка rotor не нашла Headings через lastSpokenPhrase; промежуточные фразы раньше
терялись при exception. Теперь сохраняется речь даже неуспешного action и каждой
rotor category, ищется category во всей текущей последовательности (не только в
последнем item/help). Перед Enter лог очищается: обязательные title+heading должны
быть озвучены выбранным заголовком, не старым названием страницы/категории.
Native heading pass пока **не подтверждён**.

iOS receipt123704547813 (`1c8461f`, SHA256 verified): boot99s завершился,
но теперь стандартная W3C session выявила timeout «Booting Simulator.app if not
already running». Native iOS ещё не стартовал. Для следующего запуска сохраняются
bounded read-only ps snapshots host Simulator/CoreSimulator executable paths после
boot и при failure: это позволит проверить реальную версию GUI, не выдавая одну
лишь переменную DEVELOPER_DIR за доказательство правильного host process.

`8039b7f` receipt123707907803 (SHA256 verified) сохранил настоящий rotor trace:
category1/7 озвучили «On item 1: ШОУ ТРУМАНА: ЧЕЛОВЕК…», но слово Headings вообще
не прозвучало; другие категории дали ссылки, table, landmarks и Window Spots.
Это не доказывает роль выбранного элемента. Следующая проверка выбирает native
entry и отдельно выполняет штатный VO-F3 Describe Item, очищая всю старую речь:
по-прежнему обязательны название статьи **и heading/заголовок** из этого описания.
Никакие DOM role/text в speech не подмешиваются; describeItem mapping также проверен.

iOS receipt123709747324 (`8039b7f`, SHA256 verified) boot88s завершился, но native
session опять отказала на remote Safari/RWI discovery. Bounded ps snapshot оказался
переполнен guest-daemons: их runtime paths тоже содержат CoreSimulator. Фильтр
исправлен на настоящие host executable paths и основной MobileSafari; есть тест
с500 guest paths, сохраняющий host GUI. Версия реального GUI пока не подтверждена.
При отсутствии PID diagnostic log теперь экспортируется только bounded список имён
файлов, не содержимое чужого PID: нужно проверить фактический filename format.

### Reproducible Checks API read-back (no artifact-storage access)

```sh
node scripts/read-a11y-evidence.mjs CHECK_ID at-report/receipt.json EXPECTED_REVISION
```

Node24 + authenticated `gh`; read-only, no rerun/dispatch, no credentials in files.
Requires the GitHub Actions publisher, its evidence check name, completed transport,
explicit full revision, matching check head, exactly ordered unique chunks, canonical
base64, compressed length/SHA256, bounded gzip expansion and payload revision.
Writes a new output only after validation; never overwrites an existing receipt.
For deliberately historical evidence published on another head, a fourth argument
must explicitly supply EXPECTED_CHECK_HEAD; historical data is never promoted to fresh.
Tests reject wrong publisher/head, incomplete transport, absent/duplicate/corrupt chunks,
wrong hash/length; successful transport preserves underlying audit failures verbatim.
Real integration read-back of123707907803 restored the8039b7f rotor receipt (88412bytes,
SHA256 verified), including its failed role assertion, not a synthetic pass.

`b3afaed` iOS receipt123716470316 restored with the checked-in reader (full SHA,
compressed SHA256 and publisher verified). Failure was in optional host `ps`
diagnostics after boot, not a page assertion:10s ETIMEDOUT prevented session attempt.
That read-only snapshot now records unavailability without blocking native W3C.
The failure snapshot did confirm the actual Xcode26.3 Simulator.app executable.
Filename listing also exposed the real driver child14346 versus launcher14345.
Collect observed descendant driver PIDs before cold boot, test ancestry (not pid+1),
and read only those PID logs; other processes' log contents remain excluded.
Desktop publisher123714171048 failed with no chunks: no fresh native speech result
can be claimed from that receipt. Its underlying native step also failed; exact
assertion awaits job annotations/recovery, not guessed from transport status.

Completed b3afaed macOS annotations confirm native step failure was a Safari
DOMException TimeoutError; they do not prove whether VO-F3 passed. Its publisher
failed before persisting any chunks, while app-shell/Windows/security passed.
A subsequent authorized runner now recovers the latest retained completed-head
VoiceOver artifact, checks its revision against the run, and re-exports it under
`native-historical` with run/artifact/SHA provenance. No rerun/dispatch and no older
result relabeled current. Missing expired history is explicitly reported, not passed.
Publisher HTTP failures now retain response diagnostics plus the manifest/source
failure details in a failed check; this does not bypass chunk/hash verification.
Historical read-back requires both explicit SHAs:
`node scripts/read-a11y-evidence.mjs CHECK_ID OUTPUT SOURCE_SHA CHECK_HEAD_SHA`.

`05d669f` recovery123720307803 successfully restored original b3afaed run40948592555,
artifact12931626017, with checked source/current SHA separation. Raw speech proves
native VO-F3 «heading level1 is in the VoiceOver cursor», both table captions/column
headers and first-table row/value. Current receipt123721602864 independently repeats
those semantic passes. Both actual table PNGs exist in both receipts: the later
DOMException cannot be blamed on the second screenshot. Native zoom is still pending.
Add exact screenshot/navigation/geometry phases and method/path to protocol errors;
remove redundant same-article reload before zoom and allow bounded90s page navigation
rather than the generic30s command timer. Six-minute scenario/semantic assertions stay.

iOS123723370871 reached W3C but remote Safari/RWI discovery still timed out. Actual
host GUI is Xcode26.3. Driver log PID14704 was not launcher's descendant14699: launchd
can reparent it. Fixed port4444 also allowed accidental attachment to a prior driver.
Each session now selects a fresh ephemeral loopback port, observes its listener PID
and verifies safaridriver executable identity before log access/cleanup. Unrelated
PIDs remain excluded. This removes a lifecycle hazard, not a claim that iOS passes.

`2e3e593` desktop123725571406 verified transport but stopped at Item Chooser:
only «On item Перейти к содержимому» was captured, not the required menu role.
No new heading/zoom pass is claimed. Use the SDK's native Commander ITEM_CHOOSER
AppleScript command instead of posting VO-I; keep the same menu/selection/heading
assertions, no replay of mutating keys. Preserve failedPhase before a diagnostic
screenshot updates phase, including failed publisher diagnostics.

05d669f current123720342158 independently restored42 complete scans: Chromium14/
2582 color-contrast incomplete nodes; Firefox14/2034; WebKit14/2582. All had0 axe
violations, but the7198 incomplete nodes remain a separate assessment obligation.
Actual SHA-verified mobile article PNGs from all3 engines were opened and visually
reviewed: no clipped heading, horizontal overflow or overlapping hero controls in
that viewport; WebKit wraps body text differently. This finite visual check is not
an all-background contrast measurement or human screen-reader assessment.

iOS2e3e593 receipt123728361003 still failed W3C «Booting Simulator.app» although
bootstatus said already booted. Port isolation alone did not fix it. Observed TCP
owner PID4986 still differed from log writer4987; retain bounded raw process/listener
metadata to understand that relationship instead of guessing ownership or reading
an unrelated PID's contents. Host GUI uses26.3, but machine-wide Xcode selection
remained16.4: XPC/LaunchServices helpers need not inherit Node's DEVELOPER_DIR.
On disposable GitHub-hosted runners only, also select the matching system Xcode,
verify it with DEVELOPER_DIR removed, and restore the original selection in finally.
Restoration failure is a real failure; local machines are not changed system-wide.
This is a pending native experiment, not an iOS pass or established root cause.

`788fe59` native receipts123732580424/123734486579 verified with the repository
reader. Desktop Commander chooser, VO-F3 heading and both tables passed again;
failedPhase now identifies plain geometry execute/sync after native interaction.
iOS system selection26.3 was verified but RWI discovery still failed; restoration
itself hit sudo30s timeout, recorded as a failure, not hidden. No native iOS pass.
Listener15542 appeared after the process snapshot15541: collect listener before
wide ps output to avoid losing the real worker's identity.

Next desktop experiment uses actual Safari Apple Events, not a WebDriver remote
window: native document/window, read-only JSON DOM probes, native keyboard/rotor,
physical window bounds and system PNG screencapture. Readiness requires the real
URL, complete document and loaded fonts. Same speech/role/native zoom/reflow assertions;
no injected focus markers, CSS zoom, forced layout or synthetic speech. JavaScript
from Apple Events is enabled/restored only on disposable CI; local preferences are
not changed automatically. Cleanup failure remains a failure. Helper tests cover
probe values, owned-window targeting, readiness and preference restoration/error paths.
This alternative is pending native CI, not a declaration that WebDriver was the root
cause. Research: github.com/upyesp/trains/blob/main/scripts/vo-audit-safari.mjs and
crmitchelmore/todo acceptance/src/harness/safari.ts; their application-specific
focus/fixture injections were not copied. iOS stays on native W3C, not WebKit emulation.

`3f224ec` desktop123752354041 verified native Safari27.2 Apple Events/window/PNG
setup, but Item Chooser's Guidepup log again ended at «Page Menu, Translation
Available». The public VoiceOver AppleScript `content of last phrase` is the same
native source Guidepup polls internally; its stored log can stabilize before late
menu speech. Await that live source for up to8s when an expected phrase is absent,
without replaying keyboard/Commander actions. Store actual phrases and read errors
separately; unchanged menu/heading/table assertions still reject absence/timeout.
Tests demonstrate delayed native speech and rejection without fabricated content.

### Pending cross-engine rendered-background assessment

A dedicated Chromium/Firefox/WebKit matrix now runs the same42 route/width/state
scans with an additional finite pixel-bound assessment. Raw axe incomplete nodes
remain intact. For each target, real text Range rectangles are visited by natural
scroll/reveal. Save original viewport PNG, then temporarily remove only text paint
(text-fill/shadow/SVG glyph fill and text decorations; never CSS color), save its real background PNG, and restore the exact
inline properties/priorities. This is background-isolation instrumentation, not a
forced production foreground/layout or a screenshot presented as the original.
No new important rules, forced opacity, synthetic backgrounds or CSS/DPR zoom.

The original computed foreground is parsed by the engine; alpha is composited over
every background pixel within each text rectangle. Keep the conservative minimum,
not an average. Check image scale, masking/unchanged geometry, full range/owner
coverage and actual3:1/4.5:1 thresholds. Missing targets/ranges, partial horizontal
visibility, unmaskable text, unsettled opacity, filters/blend/stroke/shadow, tile cap
or a below-bound rectangle require review and fail the assessment gate. These are
not automatically called axe/WCAG violations; a conservative failure may need finer
actual-glyph/manual assessment. No exception list or silent skipping was added.

This covers only sampled settled viewport states, not every animation frame,
occlusion/readability issue, physical device or human AT assessment. All paired PNGs
and hash/scroll/minimum records are retained in CI artifacts, and metadata exported
through the existing verified Checks bridge. Existing app-shell/native/security
gates are unchanged. New pinned pure-JS pngjs7 has no dependency install lifecycle
hooks; audit0. Local math tests reject averaging, rounded4.5 passes and transparent
foreground. Full rendered results are explicitly pending the first matrix run.

Pixel instrumentation correction before relying on any matrix outcome: do not
change CSS color during masking, since currentColor backgrounds/borders/icons could
change with it. Mask only glyph text-fill (SVG text fill where applicable); preserve
CSS color and test restoration/currentColor explicitly. Unsupported masks still
require review. The earlier description's "color" removal is superseded by this rule.
3f224ec iOS123754625261 still failed RWI; system Xcode restoration succeeded this
time. Listener5221 was absent from name-filtered ps diagnostics, so retain its actual
process row regardless of executable spelling, without assuming a log writer's name.


### First matrix read-back and measurement hardening

Exact `9c77af7` has verified Checks read-back for all three rendered matrix results
(Chromium123761687015, Firefox123761103490, WebKit123762602570). Their gates failed;
transport success is not assessment success. Local Chromium153.0.8010.0 was also
obtained through the npm-distributed browser binary, with its bundled NSS libraries,
without the blocked Playwright CDN. Product dependencies remain unchanged.

Original/masked PNG review exposed sticky-header paint sampled over partially
occluded content and foreground strike-through paint mistaken for background.
The assessor now samples fully exposed lines on overlapping tiles, isolates actual
ancestor decoration paint as well as glyph paint, preserves CSS color/currentColor,
and restores inline properties. Decoration/non-text contrast is not certified by
this glyph contrast bound. Existing pointer-events:none annotations use their
nearest hit-testable container without changing any production style; this hit-test
guard is not a complete paint-occlusion certificate.

Only settled opaque observations contribute coverage. Deferred animation observations
remain in the report; every expected line must still have an assessed observation.
Missing lines get one additional ordinary centered-scroll visit, never a replacement
for a recorded low bound. Disconnected/zero-final-range targets fail even if previously
measured. Reports now map every range ID back to its original axe target.
Six independent synthetic positive/negative fixtures run before each engine's real
product scans: black/white, currentColor, ancestor decoration, sticky overlap,
permanent opacity and removal after measurement. They are labelled synthetic, not
counted as product coverage. All six passed locally. Updated local home390 measurement:
330 owners,523 lines,41 frames,28 deferred observations subsequently covered,0 missing,
0 below-bound lines. Three-engine results for these changes are pending, not zero.

Separately, exact9c native receipts123761784170 and123760464509 verified Safari26.6.1 /
VoiceOver and Chrome156.0.8078.48 / NVDA respectively: heading, both tables, headers /
row value, actual200% zoom and actual300% /320CSSpx reflow on all four routes passed.
The Safari outer width stayed960 while inner width changed960→480→320 and DPR1→2→3.
These are real OS AT automation, not human manual assessment. iOS receipt123763574753
still failed RWI discovery; original system Xcode16.4 restoration passed. Its actual
listener is Apple's com.apple.WebDriver.HTTPService XPC executable, not safaridriver;
its log must remain unread until listener plus exact executable identity is verified.

The next native diagnostic attempt now accepts the exact sealed-system WebDriver
HTTPService executable only when lsof independently identifies it on this run's
reserved TCP port. Look-alike names/paths and non-listeners are rejected by tests.
This expands read-only log provenance, not cleanup ownership: launchd's shared XPC
service is never added to the processes killed by the harness. No session success
or resolution of the RWI failure is inferred from this diagnostic change.

A subsequent desktop-width check found a second hit-test ambiguity: Range font
ascent/descent rectangles extend outside tight line-height boxes, and an ordinary
neighbouring paragraph can own a corner without painting over heading glyphs.
Only independently identified fixed/sticky foreign overlays defer those lines;
normal-flow hits are not treated as occlusion evidence. The full conservative
pixel bound still applies. A seventh synthetic fixture reproduces tight heading /
paragraph line boxes. Local films1440 now covers all32 owners/67 ranges with no
missing/below-bound ranges. A prematurely launched local full audit used preview
at build time but not server runtime; its dynamic article404/failure results are
not article coverage. The local server was restarted with the actual preview flag;
production CI already supplies this flag in both phases and was unaffected.


Exact74a349b local Chromium153 completed all14 real axe states +14 separate rendered
assessments +7 synthetic harness cases. Product:2582 incomplete owners retained,
6035 assessed ranges,570 paired frames,0 missing/failed bounds; minimum normal
4.956337426465952, large15.400209392796619. Console counts now separate actual axe
scans from rendered assessments and calibration;29 report rows never meant29 axe
scans. The three-engine gate must still confirm these changes on the pushed head.

Exactfef5157 native desktop VoiceOver/Safari again passed (receipt123767461410).
iOS receipt123769472732 now includes the real HTTPService log, proving an internal
30s RWI discovery timeout rather than our90s HTTP timeout. Increasing the client
wait would not solve it. Xcode restoration passed. The next iOS attempt is isolated
on a clean macos-26 runner, without Guidepup/TCC/VoiceOver or previous desktop Safari
activity; the same native Simulator scenarios remain fail-closed as a separate
job. macos-15 VoiceOver coverage is retained, not replaced by WebKit or a fake pass.
This is a new infrastructure experiment, not evidence of iOS success.


### fc1b87a evidence and next targeted corrections

Verified current receipts: Chromium123773511235 covers2582 owners/6063 ranges and
Firefox123773077096 covers2033 owners/5156 ranges,14 assessments each,0 failures.
Native VoiceOver/Safari123774066772, NVDA123772313084 and app-shell also passed.
WebKit123775551136 passed all measured bounds but correctly rejected two owners:
`summary` / `summary > span`, the live experience-quality label. WebKit collapses
Range offsets when React updates the connected Text.nodeValue after GPU detection.
Keep a reference to the actual Text node and re-select its current contents; each
content change gets a new measurement version. Old versions cannot satisfy new
coverage, and recorded low bounds remain failures. Detached text is not rebound to
a convenient replacement. Report actual text changes and require final live coverage.
An eighth synthetic case now verifies live mutation, separately from the existing
negative removal case; all eight pass locally. The stricter observed font threshold
and maximum range height are retained when observations differ.

Clean macos-26 iOS receipt123773693553 still failed RWI (Xcode26.6 / SDK26.5), while
MobileSafari was actually running. Research identified the missing normal iOS Safari
Remote Automation setting, independently documented by:
- https://github.com/nathannncurtis/nathancurtis.me/blob/main/.github/workflows/ci.yml
- https://github.com/Darren-Corbett/doughnutforge-site/blob/main/tests/ios/real-safari.ts

Before the next session, read the selected Simulator's com.apple.mobilesafari /
RemoteAutomationEnabled boolean, enable it only in disposable CI, verify read-back,
then launch the actual Safari app once before Apple's30s discovery deadline. Restore
the original absent/false/true preference in finally, with read-back; local preferences
are never modified. No arbitrary domain/key scattershot or browser action replay.
Tests cover absent/false/true, local refusal, exact restoration and idempotence.
The new macOS26 sealed-system PrivateFrameworks HTTPService identity is also accepted
for port-verified diagnostics only, never for killing a shared Apple service.
This is pending verification, not an iOS success claim.

Additional exactfc local checks: typecheck,44 helper +121 regression and all28 style
fingerprints passed. The first full browser run passed573/574 checks; the GPU sample
check failed (no frame samples for sceneA) while another Chrome sweep was running,
with GPU tile-memory warnings. Do not relabel that run green. An isolated trusted-
content software-WebGL run is separately recorded; no production benchmark limits,
quality tiers, styles or error checks were weakened. Application dependency audit is0;
two bundled npm-tool advisories outside the repository remain separate from that audit.


CodeQL on c803980 reported one new medium "Improper code sanitization" annotation
at safari-desktop.mjs:13 despite a successful check conclusion. It is not accepted
as a clean security result. Native navigation had embedded a JSON-stringified URL
in a JavaScript probe. Separate trusted code from runtime data instead: pass URL as
an argument encoded as UTF-8 JSON / base64-only literal, decode it as data inside
the real Safari probe and use arguments[0]. No arbitrary URL text enters executable
source. A hostile Unicode/quote/newline/script-boundary test verifies round-trip
and non-execution. No CodeQL dismissal, suppression or rule change.

The c803980 iOS attempt stopped earlier, before any setting write or W3C session:
receipt123779107034 shows the initial simctl/defaults read reached its30s timeout
after a2m43 cold-boot/data-migration cycle. Unknown state was not treated as an
absent preference, and nothing was changed. Allow the disposable CI preference CLI
up to120s for cold service startup (local reads remain30s); still require successful
read/write/read-back/restoration, never blindly write after an unknown timeout.
The WebDriver HTTP timeout remains unchanged: this is a different observed boundary.

The c803980 VoiceOver run also exposed an intermittent interaction transition:
after reading the first table, next-table spoke "Last table" instead of the second
caption. Earlier exactfc/fef runs passed; those do not override this failure.
Make leaving the first table an explicit recorded native action and await genuine
"out of ... table" speech before searching for the next one. Do not replay keys,
programmatically focus a table or weaken the required second caption/header checks.
If the actual interaction level differs, the new assertion fails with its transcript.

WebKit c803980 receipt123781337501 confirmed live-status coverage is now complete
(0 missing), but six hero-frame ranges were sampled during the real CSS entrance
brightness filter. Opacity alone did not prove animation completion. Defer a
filter/blend observation only while its ancestor has an actually running/pending
animation, then measure the natural settled paint. Permanent/paused unsupported
filters remain failures, never identity/selector exceptions. Record exact filter /
blend values. New positive entrance and negative permanent-filter fixtures extend
the independent calibration to10 cases; transition frames are still not certified.
