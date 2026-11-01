# Swift / CodeQL: нативный тестовый сценарий

Единственный Swift-код в репозитории — `scripts/ios-native-ui/Tests/NativeGestureTests.swift`,
тестовый драйвер Mobile Safari, а не часть приложения. После squash merge PR #129
автоматическая конфигурация CodeQL обнаружила Swift, но отдельный её
[autobuild на `ef47abe`](https://github.com/FedorMilovanov/DeepMovieReview/actions/runs/41352142172/job/124984455518)
завершился ошибкой; штатная проверка JS/Python/Actions при этом прошла. Факт
сбоя не означает ни обнаруженной уязвимости, ни успешного анализа Swift.

Автосборщик CodeQL пропускает Xcode UI/unit-test targets. `Package.swift` в
`ios-native-ui` предоставляет для анализа обычный macOS library target с тем
же единственным файлом `Tests/NativeGestureTests.swift`, без копии исходника и
без зависимостей. Пакет не поставляется пользователю и не запускает XCTest:
реальный iOS тест по-прежнему собирается `NativeGesture.xcodeproj` и проходит
отдельный Simulator-gate. Это путь к анализу настоящего исходника, а не заглушка
вместо проверки.

CI отдельно запускает CodeQL Swift с autobuild и security-extended rules, сохраняет
оригинальный SARIF и проверяет отсутствие результатов и ошибок/предупреждений
экстрактора. Новый сценарий и загрузку результата требуется подтвердить на
точном SHA; до этого документ не заявляет, что Swift уже проанализирован или
что системный default setup исправлен. Инвентарь старых GitHub code-scanning
alerts через доступный API недоступен (HTTP 403); его состояние не предполагается.
