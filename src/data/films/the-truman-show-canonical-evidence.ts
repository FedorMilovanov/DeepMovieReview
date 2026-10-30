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
 * - `timestampSeconds` is measured from the master's Matroska presentation
 *   origin and falls inside that scene;
 * - `sourceIds` cites the locked `film-edition` source;
 * - `spoilerLevel` is never lower than the referenced scene's level;
 * - the observation text states only what is on screen or on the subtitle
 *   track at that second — no interpretation, no unverified prop.
 *
 * Records that failed verification are deliberately absent or rewritten. Two
 * cases have a history worth keeping:
 *
 * - the research-tier «personal rain» record is retired, but *not* because the
 *   beat is absent. A frame pass over the master's 12:41–13:06 window shows the
 *   opposite: a narrow stream of rain falls on the seated Truman, he steps out
 *   from under it, the stream stays where it was, and the rain then widens. The
 *   retired record had two defects — it placed the beat in chapter 08, and it
 *   asserted that the cloud follows the hero. The beat is rewritten here as
 *   `truman-ev-rain`, in the scene where it actually stands;
 * - the tunnel in the escape record was not found in picture.
 *
 * A retraction is not permission to overclaim in the other direction: the
 * rewritten record states the stream as observed and names the mechanism
 * («technical failure of the dome») as an interpretation, because no frame shows
 * a mechanism.
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
  record(
    "truman-ev-interviews",
    "Интервью создателя",
    "truman-sc-prologue",
    19.1,
    "NONE",
    "Фильм открывается не городом, а разговором о герое: зрителям «надоели фальшивые эмоции актёров». Говорящий стоит на фоне, которого нет ни в одном кадре города; кто он и откуда говорит, по этому кадру не установить.",
  ),
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
  record(
    "truman-ev-light",
    "Прожектор «Сириус»",
    "truman-sc-day-10909",
    210,
    "NONE",
    "На тротуаре лежит студийный прибор с трафаретной надписью «SIRIUS (9 CANIS MAJOR)».",
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
   * knows that the ledger does not. Two frames, 12:41 and 13:06, both watched.
   */
  {
    ...record(
      "truman-ev-rain",
      "Дождь, который стоит на месте",
      "truman-sc-memories-of-dad",
      761,
      "MINOR",
      "После разговора у воды начинается дождь: узкая струя падает на сидящего Трумана. Он встаёт и отходит в сторону — струя остаётся на прежнем месте, отдельно от него, — затем возвращается к ней. Через полминуты дождь расширяется на всю сцену. Кадры не показывают ни механизма, ни «тучи, которая следует за героем»: это домысел, а не увиденное.",
    ),
    basis: {
      material: "frames",
      window: { from: 761, to: 786 },
      observations: 2,
      outcome: "seen",
      unrecorded: ["reviewer", "date"],
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
  record(
    "truman-ev-radio",
    "Чужая частота",
    "truman-sc-paranoia",
    1798.265,
    "MINOR",
    "Автомобильное радио на 92.5 ловит служебный эфир: голос называет маршрут Трумана и командует статистами.",
  ),
  record(
    "truman-ev-europe",
    "Первая полоса о бездомных",
    "truman-sc-paranoia",
    1830,
    "MINOR",
    "В руках у Трумана газета «The Island» с заголовком «CRACKDOWN ON HOMELESS — Enough is Enough!» и фотографией, на которой полицейский уводит человека: ровно та сцена, которую зритель только что видел.",
  ),
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
    "Посреди семейной ссоры Мэрил отворачивается к невидимой камере и рекламным голосом расхваливает какао «Мококея».",
  ),
  record(
    "truman-ev-knife",
    "«Сделай же что-нибудь!»",
    "truman-sc-mococoa",
    3250,
    "MAJOR",
    "Прижатая вопросами Трумана, Мэрил берёт со стола кухонные инструменты «Chef's Pal» и держит их перед собой, пока камера чередует её лицо и реакцию Трумана. Упаковка до этого лежит на столе: в кадре не нож, не блистер в руках и не он.",
  ),
  record(
    "truman-ev-knife-call",
    "Крик в пустоту",
    "truman-sc-mococoa",
    3272.199,
    "MAJOR",
    "Выйдя из роли, Мэрил кричит не Труману, а в пространство: «Сделай же что-нибудь!»",
  ),
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
    "«Последнее, что я стал бы делать — врать тебе»",
    "truman-sc-father-and-son-reunion",
    3464.272,
    "MAJOR",
    "Ночью на мосту Марлон говорит: «Последнее, что я стал бы делать, — это врать тебе».",
  ),
  record(
    "truman-ev-reunion",
    "Возвращение отца",
    "truman-sc-father-and-son-reunion",
    3610,
    "MAJOR",
    "Кирк и Труман обнимаются в дверях дома; сцену показывает контрольный центр на мониторе.",
  ),
  record(
    "truman-ev-reunion-amnesia",
    "«Амнезия»",
    "truman-sc-trutalk",
    3880.242,
    "MAJOR",
    "Через двести семьдесят секунд после объятия контрольный центр объясняет возвращение отца амнезией: «утонул, но выжил и всё забыл».",
  ),
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
  record(
    "truman-ev-escape",
    "Первый перерыв за 30 лет",
    "truman-sc-hes-gone",
    4570,
    "ENDING",
    "Камера в спальне показывает ту же кровать, что и раньше, но под одеялом никого нет: эфир впервые останавливают — «он ушёл».",
  ),
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
    "Контрольный центр перебирает камеры буёв и маяка в поисках Трумана; на мониторе с метками камер показывают город и воду.",
  ),
  record(
    "truman-ev-setting-sail",
    "«Санта-Мария» выходит в море",
    "truman-sc-setting-sail",
    4970,
    "ENDING",
    "Труман стоит у руля парусника в открытом море; на корме читается имя «Santa Maria».",
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
  record(
    "truman-ev-dialog",
    "Разговор с создателем",
    "truman-sc-final-act",
    5544.206,
    "ENDING",
    "Из-за «неба» звучит голос Кристофа: «Я — создатель телешоу, которое даёт надежду и вдохновение миллионам».",
  ),
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
  record(
    "truman-ev-seahaven-design",
    "«Сихейвен — это то, каким мир должен быть»",
    "truman-sc-trutalk",
    4052.5,
    "MAJOR",
    "В студийном эфире Кристоф отвечает на обвинение в эксплуатации: «Мир, в котором вы живёте, — больной. Сихейвен — это то, каким мир должен быть».",
  ),
  // ---- Second post-lock batch (module audit) ------------------------------
  // Both records replace claims the modules had carried without an anchor: an
  // unverified «earpiece» and a camera count that lived in a secondary source.
  record(
    "truman-ev-marlon-retake",
    "Обещание, произнесённое дважды",
    "truman-sc-father-and-son-reunion",
    3459.2,
    "MAJOR",
    "Ночью на мосту обещание звучит дважды почти дословно: «скорее брошусь под машину» и «последнее, что я стал бы делать, — врать тебе», — и оба раза фраза повторяется через несколько секунд с небольшим изменением. Кто произносит каждый повтор и почему он повторён — по субтитрам не установить: запись фиксирует повтор, а не его причину.",
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
   * One research record that was split into two canonical records because its
   * two halves sit in different scenes.
   */
  split: {
    "truman-ev-knife": ["truman-ev-knife", "truman-ev-knife-call"],
    "truman-ev-reunion": ["truman-ev-reunion", "truman-ev-reunion-amnesia"],
    // The ledger's boat note already said the sailing footage «must be anchored
    // there when the record is split»; the split was never declared, and the
    // review-basis pass is what surfaced it.
    "truman-ev-boat": ["truman-ev-boat", "truman-ev-setting-sail"],
  },
  /** Canonical records that have no research-era counterpart. */
  added: [
    "truman-ev-manufactured-limits",
    "truman-ev-nothing-left",
    "truman-ev-seahaven-design",
    "truman-ev-marlon-retake",
    "truman-ev-camera-count",
  ],
  /**
   * Records added after the edition was LOCKED, in a separate batch, to support
   * article v2. They are dialogue facts only: no picture claim, no scene change.
   * See `trumanPostLockEvidenceVerifications` in
   * `the-truman-show-visual-verification.ts` and docs/50.
   */
  postLock: [
    "truman-ev-manufactured-limits",
    "truman-ev-nothing-left",
    "truman-ev-seahaven-design",
    "truman-ev-marlon-retake",
    "truman-ev-camera-count",
  ],
} as const;
