/**
 * Film 001 — canonical evidence graph.
 *
 * This is the promotion payload. It is written as its own module so that the
 * atomic `MASTER_IDENTIFIED → LOCKED` switch stays a single, reviewable
 * operation instead of a sprawling edit inside the draft package.
 *
 * Every record below satisfies the canonical contract enforced by
 * `src/lib/film-package-integrity.ts`:
 *
 * - `sceneId` resolves to a VERIFIED canonical scene from
 *   `the-truman-show-scene-inventory.ts`;
 * - `timestampSeconds` is the ledger's locator on the edition timeline and falls
 *   inside that scene; old sampled-frame PTS may differ from nominal grid times;
 * - `sourceIds` cites the locked `film-edition` source, not independent proof of
 *   the unavailable master or a continuous viewing;
 * - `spoilerLevel` is never lower than the referenced scene's level;
 * - observations should distinguish images, subtitles and interpretation. See
 *   each record's review basis and docs/63 for the scope of later corrections.
 *
 * Records that failed verification are deliberately absent or rewritten. Two
 * cases have a history worth keeping:
 *
 * - the research-tier «personal rain» record is retired, but *not* because the
 *   beat is absent: a supplied, nominal-grid frame shows Truman under a narrow
 *   stream. The old ledger described further motion across a 12:41–13:06
 *   window, but its two recorded observations do not independently establish
 *   that sequence. The new record is limited to what the available frame shows;
 * - the available samples do not establish the tunnel alleged by a retelling;
 *   they do not establish its absence from the entire film either.
 *
 * A retraction is not permission to overclaim in the other direction: neither
 * motion nor a mechanism follows from the available single image.
 */

import type { EvidenceRecord } from "@/lib/film-package";

/** Locked edition source id: the only provenance canonical evidence may cite. */
export const TRUMAN_LOCKED_EDITION_SOURCE_ID = "truman-src-master-bdrip";

/** Exact viewing-master digest, kept next to the evidence it authorizes. */
export const TRUMAN_LOCKED_MASTER_SHA256 =
  "E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575";

const record = (
  id: string,
  label: string,
  sceneId: string,
  timestampSeconds: number,
  spoilerLevel: EvidenceRecord["spoilerLevel"],
  observation: string,
): EvidenceRecord => ({
  id,
  label,
  observation,
  sceneId,
  timestampSeconds,
  sourceIds: [TRUMAN_LOCKED_EDITION_SOURCE_ID],
  spoilerLevel,
});

export const trumanCanonicalEvidence: EvidenceRecord[] = [
  {
    ...record(
      "truman-ev-interviews",
      "Начальное интервью: текст субтитров",
      "truman-sc-prologue",
      19.1,
      "NONE",
      "В первом блоке английских субтитров сказано, что зрителям надоели «фальшивые эмоции» актёров. Имя говорящего в записи не указано; звук и интонацию мы не проверяли.",
    ),
    basis: {
      material: "subtitle-track",
      window: { from: 19.1, to: 24.474 },
      observations: 1,
      outcome: "subtitle",
      unrecorded: ["reviewer", "date"],
      note: "SRT, блок 1; текст субтитров не удостоверяет голос или личность говорящего.",
    },
  },
  record(
    "truman-ev-daycount",
    "«День 10 909»",
    "truman-sc-day-10909",
    163.9,
    "NONE",
    "Титры объявляют «День 10 909» и передают эфир утреннему обходу города.",
  ),
  record(
    "truman-ev-greeting",
    "Фраза-подпись",
    "truman-sc-day-10909",
    169.796,
    "NONE",
    "Труман произносит соседям одну и ту же формулу: «А если не увидимся — добрый день, добрый вечер и доброй ночи».",
  ),
  record(
    "truman-ev-routine",
    "Жизнь по расписанию",
    "truman-sc-day-10909",
    170,
    "NONE",
    "Соседи, собака и приветствия повторяются в одном и том же порядке, а мир вокруг героя движется по заранее расставленным точкам.",
  ),
  {
    ...record(
      "truman-ev-light",
      "Прожектор «Сириус»",
      "truman-sc-day-10909",
      210,
      "NONE",
      "На крупном плане синего осветительного прибора видна надпись «Sirius»; продолжение наклейки закрыто головой Трумана. Номинальная отметка кадра приблизительна.",
    ),
    basis: {
      material: "frames",
      window: { from: 210, to: 210 },
      windowApproximate: true,
      observations: 1,
      outcome: "seen",
      unrecorded: ["reviewer", "date"],
      note: "Проверен файл f_00008 из сетки с номинальной отметкой 210 с; точный PTS исходного мастера не установлен.",
    },
  },
  record(
    "truman-ev-light-explanation",
    "Объяснение в тексте субтитров",
    "truman-sc-day-10909",
    230.943,
    "NONE",
    "В тексте английских субтитров обломки объясняются деталями самолёта; звук и говорящий по этой записи не проверены.",
  ),
  record(
    "truman-ev-kaiser",
    "Билборд Kaiser Chicken",
    "truman-sc-day-10909",
    290,
    "NONE",
    "Двое прохожих оттесняют Трумана спиной к щиту с логотипом «Kaiser Chicken» так, что человек оказывается частью рекламы.",
  ),
  record(
    "truman-ev-quota",
    "Страх как профессия",
    "truman-sc-aquaphobia",
    431.983,
    "MINOR",
    "В страховом агентстве коллега предупреждает: «Ты потеряешь больше, чем зубы», — и тут же выдаёт Труману поручение на другой берег.",
  ),
  record(
    "truman-ev-ferry",
    "Трап парома",
    "truman-sc-aquaphobia",
    459.928,
    "MINOR",
    "У трапа парома Труман произносит «Паром ещё здесь, да?» — и не поднимается на борт.",
  ),
  record(
    "truman-ev-beer",
    "«Вот это… пиво»",
    "truman-sc-dreaming-of-fiji",
    587.226,
    "MINOR",
    "На мосту Марлон поднимает банку и разворачивает её этикеткой к камере: «Вот это пиво».",
  ),
  record(
    "truman-ev-drowning",
    "Флешбэк: смерть отца",
    "truman-sc-memories-of-dad",
    709,
    "MINOR",
    "В лодке отец говорит: «Не нравится мне эта погода, сын», — и шторм уносит его за борт на глазах мальчика.",
  ),
  /**
   * Written after the lock, so it has no research-era ledger entry to inherit a
   * basis from: the basis is stated here, and it is the one thing this record
   * knows that the ledger does not. The old entry listed two observations;
   * the later audit independently inspected only the supplied nominal-grid still.
   */
  {
    ...record(
      "truman-ev-rain",
      "Кадр с узкой струёй дождя",
      "truman-sc-memories-of-dad",
      750,
      "MINOR",
      "На доступном отдельном кадре Труман наклонился под узкой струёй дождя. Это опровергает прежнее отрицание самого эпизода, но не устанавливает дальнейшее движение струи, её расширение или механизм. Номинальная отметка сетки — не проверенный PTS исходного кадра.",
    ),
    basis: {
      material: "frames",
      window: { from: 750, to: 750 },
      windowApproximate: true,
      observations: 1,
      outcome: "seen",
      unrecorded: ["reviewer", "date"],
      note: "Ранний журнал перечисляет две отметки 761–786 с, но не подтверждает последовательность движения. Сейчас отдельно осмотрен кадр сетки с номиналом 750 с; его точный PTS не установлен.",
    },
  },
  record(
    "truman-ev-ghost",
    "Призрак отца",
    "truman-sc-memories-of-dad",
    910,
    "MINOR",
    "В уличной толпе Труман видит человека, которого узнаёт, и двое прохожих тут же уводят старика силой.",
  ),
  record(
    "truman-ev-album",
    "Альбом как инструмент",
    "truman-sc-no-place-like-home",
    2222.262,
    "MINOR",
    "Мать достаёт семейный альбом и задерживается на странице со словами «Мой маленький клоун».",
  ),
  record(
    "truman-ev-sylvia",
    "Девочка из настоящей жизни",
    "truman-sc-lauren-sylvia",
    1615.201,
    "MINOR",
    "В библиотеке девушка в красном успевает сказать Труману: «Это фальшивка. Всё это для тебя. Небо…» — прежде чем её уводят.",
  ),
  record(
    "truman-ev-fiji",
    "Мотив Фиджи",
    "truman-sc-lauren-sylvia",
    1644.899,
    "MINOR",
    "Она говорит, что уезжает на Фиджи; позже Труман собирает её лицо из обрывков журнальных страниц на столе.",
  ),
  record(
    "truman-ev-fingers",
    "Скрещенные пальцы",
    "truman-sc-lauren-sylvia",
    1700,
    "MAJOR",
    "В подвале рука прижимает к груди кнопку с надписью «HOW'S IT GOING TO END?» — пальцы при этом скрещены.",
  ),
  {
    ...record(
      "truman-ev-radio",
      "Маршрут в тексте субтитров",
      "truman-sc-paranoia",
      1798.265,
      "MINOR",
      "В английских субтитрах появляется текст «He's heading west on Stuart. Stand by, all extras». Отдельный кадр показывает Трумана в машине; по нему нельзя установить частоту, говорящего или то, как звучит эфир.",
    ),
    basis: {
      material: "subtitle-track",
      window: { from: 1798.265, to: 1805.098 },
      observations: 1,
      outcome: "subtitle",
      unrecorded: ["reviewer", "date"],
      note: "SRT-блок 206; кадр с номинальной отметкой 1800 с — отдельное изображение, не проверка звука или точного PTS.",
    },
  },
  {
    ...record(
      "truman-ev-europe",
      "Первая полоса о бездомных",
      "truman-sc-paranoia",
      1830,
      "MINOR",
      "Выборочный кадр показывает газету «The Island» с заголовком «CRACKDOWN ON HOMELESS — Enough is Enough!» и фотографией полицейского с человеком. По одному изображению нельзя установить, тот ли это человек, которого Труман видел ранее.",
    ),
    basis: {
      material: "frames",
      window: { from: 1830, to: 1830 },
      windowApproximate: true,
      observations: 1,
      outcome: "seen",
      unrecorded: ["reviewer", "date"],
      note: "Файл сетки f_00062 с номиналом 1830 с; точный PTS исходного мастера не установлен, контактная сетка на том же номинале показывает другой кадр.",
    },
  },
  record(
    "truman-ev-elevator",
    "Лифт без кабины",
    "truman-sc-paranoia",
    2110,
    "MINOR",
    "За дверью служебного лифта — не кабина, а коридор с полками, за которым ходят люди со съёмочной группы.",
  ),
  record(
    "truman-ev-poster",
    "Плакат «Это может случиться с вами»",
    "truman-sc-travelers-beware",
    2555.4,
    "MINOR",
    "В турагентстве на стене висит плакат «TRAVELLERS BEWARE» с горящим самолётом, а рядом — «IT COULD HAPPEN TO YOU!».",
  ),
  record(
    "truman-ev-mococoa",
    "«Мококея» Мэрил",
    "truman-sc-mococoa",
    3226.152,
    "MAJOR",
    "В журнале визуальной проверки зафиксирована Мэрил в сцене с рекламой какао. Текст о Mococoa разобран отдельно по субтитрам; интонацию, точный адрес и звук отдельные изображения не устанавливают.",
  ),
  record(
    "truman-ev-cocoa-subtitles",
    "Какао в английских субтитрах",
    "truman-sc-mococoa",
    3226.152,
    "MAJOR",
    "В английских субтитрах записан рекламный текст о какао Mococoa. Текст субтитров не устанавливает говорящего, адресата или интонацию; звук отдельно не проверялся.",
  ),
  record(
    "truman-ev-tools-subtitles",
    "Вопрос об инструментах в субтитрах",
    "truman-sc-mococoa",
    3265.943,
    "MAJOR",
    "В английских субтитрах записано: «Dice me, slice me or peel me? There's so many choices». Текст не устанавливает говорящего или интонацию; звук отдельно не проверялся.",
  ),
  {
    ...record(
      "truman-ev-knife",
      "Упаковка на столе",
      "truman-sc-mococoa",
      3255,
      "MAJOR",
      "На столе лежит упаковка «Chef's Pal» с кухонным инструментом; рядом видна рука. Этот кадр сам по себе не показывает Мэрил с поднятыми инструментами.",
    ),
    basis: {
      material: "clip-frames", window: { from: 3255, to: 3255 }, windowApproximate: true,
      observations: 1, outcome: "seen", unrecorded: ["reviewer", "date"],
      note: "Кадр из предоставленного фрагмента; смещение взято из его манифеста, исходный мастер независимо не пересчитан.",
    },
  },
  {
    ...record(
      "truman-ev-knife-tools",
      "Мэрил держит кухонные инструменты",
      "truman-sc-mococoa",
      3265,
      "MAJOR",
      "Позже в той же сцене Мэрил держит инструменты перед собой. По отдельным кадрам нельзя определить намерение этого жеста.",
    ),
    basis: {
      material: "clip-frames", window: { from: 3265, to: 3270 }, windowApproximate: true,
      observations: 2, outcome: "seen", unrecorded: ["reviewer", "date"],
      note: "Кадры из предоставленного фрагмента; смещение взято из его манифеста, звук не проверен.",
    },
  },
  {
    ...record(
      "truman-ev-meryl-held",
      "Труман удерживает Мэрил",
      "truman-sc-mococoa",
      3275,
      "MAJOR",
      "На экране, показывающем кухню, Труман удерживает Мэрил руками. Отдельный кадр не устанавливает намерений участников.",
    ),
    basis: {
      material: "clip-frames", window: { from: 3275, to: 3275 }, windowApproximate: true,
      observations: 1, outcome: "seen", unrecorded: ["reviewer", "date"],
      note: "Кадр из предоставленного фрагмента; смещение взято из его манифеста, звук не проверен.",
    },
  },
  {
    ...record(
      "truman-ev-knife-call",
      "«Do something!» в субтитрах",
      "truman-sc-mococoa",
      3272.199,
      "MAJOR",
      "В английских субтитрах записана просьба «Do something!» («Сделай же что-нибудь!»). Текст не называет говорящего или адресата; звук отдельно не прослушан.",
    ),
    basis: {
      material: "subtitle-track", window: { from: 3272.199, to: 3275.236 },
      observations: 1, outcome: "subtitle", unrecorded: ["reviewer", "date"],
      note: "SRT, блок 391; родительские кадры — отдельный материал, не три проверки субтитров и не прослушанный звук.",
    },
  },
  record(
    "truman-ev-bridge",
    "Мост",
    "truman-sc-im-being-spontaneous",
    2950,
    "MAJOR",
    "Труман разворачивается спиной к дороге и зажмуривается, а Мэрил держит руль; машина идёт через мост над водой.",
  ),
  record(
    "truman-ev-plant",
    "«Всегда пожалуйста, Труман»",
    "truman-sc-blocked-at-every-turn",
    3122.337,
    "MAJOR",
    "Прорвавшись сквозь оцепление, Труман слышит от незнакомого полицейского спокойное «Всегда пожалуйста, Труман».",
  ),
  record(
    "truman-ev-marlon",
    "Обещание в субтитрах к разговору на мосту",
    "truman-sc-father-and-son-reunion",
    3464.272,
    "MAJOR",
    "В субтитрах записано: «Последнее, что я стал бы делать, — это врать тебе». По тексту нельзя надёжно установить повторяющего слова или их интонацию.",
  ),
  {
    ...record(
      "truman-ev-reunion",
      "Возвращение отца",
      "truman-sc-father-and-son-reunion",
      3591,
      "MAJOR",
      "У ограждения моста Труман обнимает Кирка; позднее объятие видно на мониторе аппаратной. Это наблюдение по отдельным кадрам предоставленного фрагмента.",
    ),
    basis: {
      material: "clip-frames", window: { from: 3591, to: 3611 }, windowApproximate: true,
      observations: 2, outcome: "seen", unrecorded: ["reviewer", "date"],
      note: "Кадры из предоставленного фрагмента; смещение взято из его манифеста, исходный мастер независимо не пересчитан, звук не проверен.",
    },
  },
  {
    ...record(
      "truman-ev-reunion-amnesia",
      "«Amnesia» в субтитрах TruTalk",
      "truman-sc-trutalk",
      3880.242,
      "MAJOR",
      "В английских субтитрах после слов о Кирке и вопроса о его 22-летнем отсутствии записаны реплики «Amnesia» и «Brilliant». Субтитры не называют говорящих; звук отдельно не прослушан.",
    ),
    basis: {
      material: "subtitle-track", window: { from: 3865.143, to: 3882.947 },
      observations: 4, outcome: "subtitle", unrecorded: ["reviewer", "date"],
      note: "SRT, блоки 487–490; тире разделяют реплики, но не удостоверяют их авторов. Объятие имеет отдельную основу из кадров фрагмента.",
    },
  },
  record(
    "truman-ev-trutalk",
    "Интервью TruTalk: «он предпочитает клетку»",
    "truman-sc-trutalk",
    4079.739,
    "MAJOR",
    "В студийном интервью Кристоф утверждает: «Труман предпочитает свою клетку»; звонящая Сильвия отвечает: «Он вам это докажет».",
  ),
  record(
    "truman-ev-conception",
    "«Зачатие в прямом эфире»",
    "truman-sc-trutalk",
    4122.283,
    "MAJOR",
    "Там же продюсеры анонсируют «первое в истории телевидения зачатие в прямом эфире» как очередную веху шоу.",
  ),
  record(
    "truman-ev-sleep",
    "Создатель у экрана",
    "truman-sc-do-you-think-he-knows",
    4200,
    "MAJOR",
    "Кристоф стоит спиной к залу перед гигантским экраном «ON AIR»; за стеклом — Сихейвен, за которым он наблюдает.",
  ),
  {
    ...record(
      "truman-ev-escape",
      "«Он ушёл»: текст субтитров",
      "truman-sc-hes-gone",
      4642.986,
      "ENDING",
      "В английских субтитрах записаны «He's gone» и «Cut transmission!». Текст не объясняет способ исчезновения и не устанавливает говорящих; звук отдельно не прослушан.",
    ),
    basis: {
      material: "subtitle-track", window: { from: 4642.986, to: 4650.235 },
      observations: 2, outcome: "subtitle", unrecorded: ["reviewer", "date"],
      note: "SRT, блоки 603–604; изображения в историческом журнале — отдельный материал и не устанавливают способ исчезновения.",
    },
  },
  record(
    "truman-ev-cuesun",
    "«Включите солнце»",
    "truman-sc-hes-gone",
    4810.033,
    "ENDING",
    "Кристоф командует «Cue the sun», и над ночным Сихейвеном вне расписания поднимается рассвет.",
  ),
  record(
    "truman-ev-boat",
    "Поиск на воде",
    "truman-sc-hes-gone",
    4840,
    "ENDING",
    "По соседним отметкам журнала сотрудники аппаратной решают, как искать лодку на воде, а затем Кристоф берёт управление на себя. Сам момент между этими отметками отдельно не записан; содержимое конкретных мониторов требует проверки.",
  ),
  record(
    "truman-ev-setting-sail",
    "Парусник «Santa Maria»: требуется проверка",
    "truman-sc-setting-sail",
    4970,
    "ENDING",
    "Утверждение о паруснике «Santa Maria» перенесено из прежней записи. В доступном журнале нет отдельной проверки кадра на этой отметке; соседние записи относятся к другой сцене.",
  ),
  record(
    "truman-ev-storm",
    "Шторм против одного человека",
    "truman-sc-cue-the-storm",
    5173.407,
    "ENDING",
    "Привязанный к мачте Труман кричит в небо: «Тебе придётся меня убить!»",
  ),
  record(
    "truman-ev-born-live",
    "«Он родился в прямом эфире»",
    "truman-sc-cue-the-storm",
    5101.959,
    "ENDING",
    "На требование остановить бурю Кристоф отвечает: «Он родился в прямом эфире».",
  ),
  record(
    "truman-ev-wall",
    "Небо оказалось стеной",
    "truman-sc-final-act",
    5510,
    "ENDING",
    "Нарисованное небо заканчивается плоской панелью, у которой стоит лестница; Труман идёт вдоль края мира.",
  ),
  {
    ...record(
      "truman-ev-dialog",
      "Финальный разговор: текст субтитров",
      "truman-sc-final-act",
      5544.206,
      "ENDING",
      "В субтитрах записаны реплики «Я — создатель телешоу», «Ничего не было настоящим?» — «Настоящим был ты», а также слова о внешнем мире. По этому тексту мы не проверяли голоса и интонации.",
    ),
    basis: {
      material: "subtitle-track",
      window: { from: 5544.206, to: 5593.579 },
      observations: 8,
      outcome: "subtitle",
      unrecorded: ["reviewer", "date"],
      note: "SRT, блоки 670–677; тире разделяют реплики, но не устанавливают личности говорящих и звучание. Это не прослушанный фрагмент.",
    },
  },
  record(
    "truman-ev-nocamera",
    "«У вас не было камеры в моей голове»",
    "truman-sc-final-act",
    5596.426,
    "ENDING",
    "На предложение вернуться Труман отвечает: «У вас никогда не было камеры в моей голове».",
  ),
  record(
    "truman-ev-exit",
    "Поклон и выход",
    "truman-sc-final-act",
    5691.316,
    "ENDING",
    "В проёме двери EXIT Труман произносит свою утреннюю формулу в последний раз и кланяется.",
  ),
  record(
    "truman-ev-guards",
    "«Что ещё идёт?»",
    "truman-sc-final-act",
    5755.382,
    "FULL",
    "Двое охранников на посту, смотревшие финал, спрашивают: «Ну что, что ещё идёт?» — и один тянется к пульту.",
  ),
  // ---- Post-lock additions (article v2) -----------------------------------
  // Added after the edition was LOCKED, because the article had to state three
  // things the first forty-one records could not carry. All three are dialogue
  // facts read off the embedded English subtitle track at the stated second and
  // sit inside the already verified `truman-sc-trutalk`. They claim nothing
  // about picture, which is why they are ledgered as TRANSCRIPT_CONFIRMED in
  // `trumanPostLockEvidenceVerifications` instead of the research-era ledger.
  record(
    "truman-ev-manufactured-limits",
    "«Мы придумывали способы удержать его»",
    "truman-sc-trutalk",
    3842.5,
    "MAJOR",
    "Поверх кадров взросления Трумана звучит голос производства: «Пока Труман рос, мы придумывали способы удержать его на острове».",
  ),
  record(
    "truman-ev-nothing-left",
    "«Исследовать больше нечего»",
    "truman-sc-trutalk",
    3847.7,
    "MAJOR",
    "В том же флешбэке мальчик говорит, что хочет стать исследователем, и слышит в ответ: «Исследовать больше нечего» — то есть отказ от мира вложен в него до всякого выбора.",
  ),
  {
    ...record(
      "truman-ev-seahaven-design",
      "«Сихейвен — это то, каким мир должен быть»",
      "truman-sc-trutalk",
      4052.5,
      "MAJOR",
      "В двух соседних блоках субтитров записано: «Мир, в котором вы живёте, — больной. Сихейвен — это то, каким мир должен быть». Имя говорящего и интонация в этих блоках не указаны.",
    ),
    basis: {
      material: "subtitle-track",
      window: { from: 4048.332, to: 4057.924 },
      observations: 2,
      outcome: "subtitle",
      unrecorded: ["reviewer", "date"],
      note: "SRT, блоки 523–524; субтитры не заменяют проверку звука и не называют говорящего.",
    },
  },
  // ---- Second post-lock batch (module audit) ------------------------------
  // Both records replace claims the modules had carried without an anchor: an
  // unverified «earpiece» and a camera count that lived in a secondary source.
  record(
    "truman-ev-marlon-retake",
    "Обещание, дважды записанное в субтитрах",
    "truman-sc-father-and-son-reunion",
    3459.2,
    "MAJOR",
    "В субтитрах к сцене на мосту обещание записано дважды почти дословно: «скорее брошусь под машину» и «последнее, что я стал бы делать, — врать тебе», — и оба раза фраза повторяется через несколько секунд с небольшим изменением. Кто произносит каждый повтор и почему он повторён — по субтитрам не установить: запись фиксирует повтор, а не его причину.",
  ),
  record(
    "truman-ev-camera-count",
    "«Порядка пяти тысяч камер»",
    "truman-sc-trutalk",
    3895,
    "MAJOR",
    "В студийном эфире на вопрос зрителя, сколько камер установлено в городе, отвечают: «где-то порядка пяти тысяч».",
  ),
];

export const trumanCanonicalEvidenceSummary = {
  records: trumanCanonicalEvidence.length,
  /** Research records deliberately not promoted. */
  retired: ["truman-ev-raincloud"],
  /**
   * Retired research records that come back under a new id, rewritten to what
   * the master actually shows. A rewritten record is neither «retired» nor
   * «added»: it keeps a lineage, and the ledger above keeps its history.
   */
  rewritten: {
    "truman-ev-raincloud": ["truman-ev-rain"],
  },
  /**
   * Compound research records split into narrower observations. A replacement
   * can have its own later basis; otherwise it inherits the parent's limits.
   */
  split: {
    "truman-ev-knife": ["truman-ev-knife", "truman-ev-knife-tools", "truman-ev-knife-call", "truman-ev-meryl-held"],
    "truman-ev-reunion": ["truman-ev-reunion", "truman-ev-reunion-amnesia"],
    // The ledger's boat note already said the sailing footage «must be anchored
    // there when the record is split»; the split was never declared, and the
    // review-basis pass is what surfaced it.
    "truman-ev-boat": ["truman-ev-boat", "truman-ev-setting-sail"],
  },
  /** Canonical records that have no research-era counterpart. */
  added: [
    "truman-ev-light-explanation",
    "truman-ev-manufactured-limits",
    "truman-ev-nothing-left",
    "truman-ev-seahaven-design",
    "truman-ev-marlon-retake",
    "truman-ev-camera-count",
    "truman-ev-cocoa-subtitles",
    "truman-ev-tools-subtitles",
  ],
  /**
   * Records added after the edition was LOCKED, in a separate batch, to support
   * article v2. They are dialogue facts only: no picture claim, no scene change.
   * See `trumanPostLockEvidenceVerifications` in
   * `the-truman-show-visual-verification.ts` and docs/50.
   */
  postLock: [
    "truman-ev-light-explanation",
    "truman-ev-manufactured-limits",
    "truman-ev-nothing-left",
    "truman-ev-seahaven-design",
    "truman-ev-marlon-retake",
    "truman-ev-camera-count",
    "truman-ev-cocoa-subtitles",
    "truman-ev-tools-subtitles",
  ],
} as const;
