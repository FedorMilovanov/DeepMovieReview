/**
 * Film 001 — canonical scene inventory v1.
 *
 * Control-plane data only: this file declares the editorial scene units derived
 * from the measured viewing master, but it does NOT mutate `FilmPackage.scenes`
 * and does NOT authorize publication.
 *
 * Why a separate file
 * -------------------
 * The research-era `FilmPackage.scenes` (15 DRAFT estimates) are not reusable:
 * their numeric ranges are research approximations, several of them combine
 * material from non-adjacent chapters, and at least one evidence record points at
 * a beat that is not where the record says it is (see
 * `the-truman-show-visual-verification.ts`).
 *
 * The inventory below is built from the only independently reproducible
 * structure the master offers — the 24 embedded chapters — and then *checked
 * against picture* at every boundary. Where the chapter boundary is also a real
 * dramatic transition, it becomes a scene boundary.
 *
 * Two deliberate deviations from the chapter map:
 *
 * 1. chapter 24 (credits) is not a scene;
 * 2. chapters 2–4 are one continuous morning in Seahaven and are promoted to a
 *    single editorial scene group with sub-beats, not three scenes.
 *
 * Every range is expressed in seconds from the Matroska presentation origin of
 * the locked master (measured runtime 6177.792 s).
 */

export type TrumanSceneVerification = "VERIFIED" | "PENDING";

export type TrumanCanonicalScene = {
  id: string;
  sequenceIndex: number;
  shortLabel: string;
  summary: string;
  startTimestampSeconds: number;
  endTimestampSeconds: number;
  /** Embedded master chapter(s) the scene is anchored to. */
  chapterIds: string[];
  verificationState: TrumanSceneVerification;
  note: string;
};

export const trumanCanonicalScenes: TrumanCanonicalScene[] = [
  {
    id: "truman-sc-prologue",
    sequenceIndex: 1,
    shortLabel: "Пролог: интервью без героя",
    summary: "Хроника, интервью создателя и зрителей до первого появления Трумана на улице.",
    startTimestampSeconds: 0,
    endTimestampSeconds: 162.537,
    chapterIds: ["truman-ch-01"],
    verificationState: "VERIFIED",
    note:
      "Christof is framed inside the lunar control room before the town is shown; the «phoney emotions» thesis is spoken over it.",
  },
  {
    id: "truman-sc-day-10909",
    sequenceIndex: 2,
    shortLabel: "День 10 909",
    summary:
      "Утренний обход Сихейвена: приветствия по кругу, щит Kaiser Chicken, упавший прожектор «Сириус».",
    startTimestampSeconds: 162.537,
    endTimestampSeconds: 409.283,
    chapterIds: ["truman-ch-02"],
    verificationState: "VERIFIED",
    note:
      "Opening walk is one continuous morning; the dropped studio lamp and its cover story sit inside it.",
  },
  {
    id: "truman-sc-aquaphobia",
    sequenceIndex: 3,
    shortLabel: "Водобоязнь и паром",
    summary: "Страховое агентство, квота, трап парома на остров Харбор и отступление.",
    startTimestampSeconds: 409.283,
    endTimestampSeconds: 546.712,
    chapterIds: ["truman-ch-03"],
    verificationState: "VERIFIED",
    note: "Fear is dramatized as a physical refusal at the ramp, not as dialogue about fear.",
  },
  {
    id: "truman-sc-chefs-pal",
    sequenceIndex: 4,
    shortLabel: "«Chef's Pal» и пиво",
    summary: "Мэрил с бесплатной тёркой; Марлон на мосту с банкой этикеткой к камере.",
    startTimestampSeconds: 546.712,
    endTimestampSeconds: 583.457,
    chapterIds: ["truman-ch-04"],
    verificationState: "VERIFIED",
    note: "Two product placements inside one domestic beat; the can is turned label-out on cue.",
  },
  {
    id: "truman-sc-dreaming-of-fiji",
    sequenceIndex: 5,
    shortLabel: "Мечта о Фиджи",
    summary: "Разговор с Марлоном о побеге; первый служебный эфир в машине.",
    startTimestampSeconds: 583.457,
    endTimestampSeconds: 691.357,
    chapterIds: ["truman-ch-05"],
    verificationState: "VERIFIED",
    note: "The escape wish is spoken before any evidence of the construction reaches Truman.",
  },
  {
    id: "truman-sc-memories-of-dad",
    sequenceIndex: 6,
    shortLabel: "Память об отце",
    summary: "Флешбэк гибели отца, встреча с «призраком», газета и семейный альбом.",
    startTimestampSeconds: 691.357,
    endTimestampSeconds: 1034.7,
    chapterIds: ["truman-ch-06"],
    verificationState: "VERIFIED",
    note:
      "Longest research-era chapter; it holds both the origin of the water trauma and the first crack in the story world — the rain that falls on one man and then on the whole street.",
  },
  {
    id: "truman-sc-lauren-sylvia",
    sequenceIndex: 7,
    shortLabel: "Лорен, она же Сильвия",
    summary: "Библиотека, признание «всё это подделка»; коллаж из журнальных вырезок.",
    startTimestampSeconds: 1034.7,
    endTimestampSeconds: 1769.225,
    chapterIds: ["truman-ch-07"],
    verificationState: "VERIFIED",
    note: "The only person who tells the truth is removed from the story world on camera.",
  },
  {
    id: "truman-sc-paranoia",
    sequenceIndex: 8,
    shortLabel: "Паранойя",
    summary:
      "Служебная частота, лифт без кабины, рухнувший лифт, крестик на кнопке и газета о бездомных.",
    startTimestampSeconds: 1769.225,
    endTimestampSeconds: 2218.215,
    chapterIds: ["truman-ch-08"],
    verificationState: "VERIFIED",
    note:
      "Densest chapter of the film (13 cuts/min). The research record placed the «personal rain» beat here; a frame pass over this window found no rain at the sampled times — the beat sits in the previous chapter, at the water, and is recorded there.",
  },
  {
    id: "truman-sc-no-place-like-home",
    sequenceIndex: 9,
    shortLabel: "«В гостях хорошо, а дома лучше»",
    summary: "Мать и альбом, подвал с макетом, разговор о ребёнке, вечер в Сихейвене.",
    startTimestampSeconds: 2218.215,
    endTimestampSeconds: 2553.926,
    chapterIds: ["truman-ch-09"],
    verificationState: "VERIFIED",
    note: "The wedding-photo beat from the research ledger is not here; the crossed fingers belong to the basement button.",
  },
  {
    id: "truman-sc-travelers-beware",
    sequenceIndex: 10,
    shortLabel: "«Путешественник, берегись»",
    summary: "Турагентство под плакатами о катастрофах, отказ в билете на Фиджи.",
    startTimestampSeconds: 2553.926,
    endTimestampSeconds: 2741.113,
    chapterIds: ["truman-ch-10"],
    verificationState: "VERIFIED",
    note: "The agency walls do the discouraging; no character has to forbid anything.",
  },
  {
    id: "truman-sc-lady-flowers-dented-beetle",
    sequenceIndex: 11,
    shortLabel: "Дама, цветы, помятый «жук»",
    summary: "Улица, автобус, попытка уехать и снова отказ.",
    startTimestampSeconds: 2741.113,
    endTimestampSeconds: 2863.819,
    chapterIds: ["truman-ch-11"],
    verificationState: "VERIFIED",
    note: "Transport is available and unusable; the obstacle is Truman's own conditioning.",
  },
  {
    id: "truman-sc-im-being-spontaneous",
    sequenceIndex: 12,
    shortLabel: "«Я спонтанен!»",
    summary: "Мэрил за рулём, машина через мост, «авария» на электростанции.",
    startTimestampSeconds: 2863.819,
    endTimestampSeconds: 3072.444,
    chapterIds: ["truman-ch-12"],
    verificationState: "VERIFIED",
    note: "First time Truman attacks the fear instead of avoiding it; the world answers with a fabricated emergency.",
  },
  {
    id: "truman-sc-blocked-at-every-turn",
    sequenceIndex: 13,
    shortLabel: "Заблокирован на каждом шагу",
    summary: "Оцепление, люди в химкостюмах, «Всегда пожалуйста, Труман».",
    startTimestampSeconds: 3072.444,
    endTimestampSeconds: 3176.631,
    chapterIds: ["truman-ch-13"],
    verificationState: "VERIFIED",
    note: "The name slip is the moment the city stops pretending he is a stranger.",
  },
  {
    id: "truman-sc-mococoa",
    sequenceIndex: 14,
    shortLabel: "«Мококея — это лучшее»",
    summary: "Ссора в доме, рекламная речь Мэрил в камеру, её срыв, Марлон-утешитель.",
    startTimestampSeconds: 3176.631,
    endTimestampSeconds: 3323.028,
    chapterIds: ["truman-ch-14"],
    verificationState: "VERIFIED",
    note: "The marriage fails on camera as an acting problem, not a relationship problem.",
  },
  {
    id: "truman-sc-father-and-son-reunion",
    sequenceIndex: 15,
    shortLabel: "Отец и сын",
    summary: "Ночной мост с Марлоном, возвращение Кирка, объятие под аплодисменты.",
    startTimestampSeconds: 3323.028,
    endTimestampSeconds: 3668.039,
    chapterIds: ["truman-ch-15"],
    verificationState: "VERIFIED",
    note: "The reunion is staged to repair ratings; the explanation is invented by the control room.",
  },
  {
    id: "truman-sc-trutalk",
    sequenceIndex: 16,
    shortLabel: "TruTalk",
    summary: "Студийное интервью Кристофа, звонок Сильвии, анонс «зачатия в эфире».",
    startTimestampSeconds: 3668.039,
    endTimestampSeconds: 4197.985,
    chapterIds: ["truman-ch-16"],
    verificationState: "VERIFIED",
    note: "Longest chapter of the film (530 s); the creator argues his ethics to an audience.",
  },
  {
    id: "truman-sc-do-you-think-he-knows",
    sequenceIndex: 17,
    shortLabel: "«Думаешь, он знает?»",
    summary: "Кристоф у экрана, ночное наблюдение за спящим Труманом.",
    startTimestampSeconds: 4197.985,
    endTimestampSeconds: 4400.896,
    chapterIds: ["truman-ch-17"],
    verificationState: "VERIFIED",
    note: "The creator watches the sleeper; the composition is the film's clearest claim about ownership.",
  },
  {
    id: "truman-sc-hes-gone",
    sequenceIndex: 18,
    shortLabel: "«Он ушёл»",
    summary: "Подкоп, пустая кровать, остановка эфира, поиски и команда «включите солнце».",
    startTimestampSeconds: 4400.896,
    endTimestampSeconds: 4861.356,
    chapterIds: ["truman-ch-18"],
    verificationState: "VERIFIED",
    note: "460 s with only nine cuts: the film slows down exactly when the show breaks.",
  },
  {
    id: "truman-sc-setting-sail",
    sequenceIndex: 19,
    shortLabel: "Выход в море",
    summary: "Труман уходит на паруснике; контрольный центр обнаруживает его на воде.",
    startTimestampSeconds: 4861.356,
    endTimestampSeconds: 5002.747,
    chapterIds: ["truman-ch-19"],
    verificationState: "VERIFIED",
    note: "The most feared element becomes the only exit.",
  },
  {
    id: "truman-sc-cue-the-storm",
    sequenceIndex: 20,
    shortLabel: "«Нагнать шторм»",
    summary: "Кристоф вручную усиливает бурю; Труман привязан к мачте и не сдаётся.",
    startTimestampSeconds: 5002.747,
    endTimestampSeconds: 5264.092,
    chapterIds: ["truman-ch-20"],
    verificationState: "VERIFIED",
    note: "Punishment is administered by the creator personally, not by the system.",
  },
  {
    id: "truman-sc-final-act",
    sequenceIndex: 21,
    shortLabel: "Край неба и дверь",
    summary:
      "Лодка бьётся в нарисованный горизонт, Труман идёт вдоль стены, говорит с создателем и уходит в дверь EXIT; охранники переключают канал.",
    startTimestampSeconds: 5264.092,
    endTimestampSeconds: 5760.755,
    chapterIds: ["truman-ch-21", "truman-ch-22", "truman-ch-23"],
    verificationState: "VERIFIED",
    note:
      "One continuous dramatic sequence with no intervening location, spanning three embedded chapters. Kept as a single editorial scene because the Scene Autopsy contract requires one honest range that actually contains all four anchors (wall, creator dialogue, «no camera in my head», exit). This is the case docs/45-FILM-001-MASTER-SEGMENTATION.md anticipated: the chapter map and the autopsy range are different objects.",
  },
];

/** Chapters deliberately not treated as editorial scenes. */
export const trumanNonSceneChapters = [
  {
    chapterId: "truman-ch-24",
    reason: "Credits. Objective master material, never an editorial scene.",
  },
] as const;

export const TRUMAN_INVENTORY_RUNTIME_SECONDS = 6177.792;
export const TRUMAN_CREDITS_START_SECONDS = 5760.755;

export const trumanCanonicalSceneSummary = {
  scenes: trumanCanonicalScenes.length,
  verified: trumanCanonicalScenes.filter((s) => s.verificationState === "VERIFIED").length,
  pending: trumanCanonicalScenes.filter((s) => s.verificationState === "PENDING").length,
  coveredUntilSeconds:
    trumanCanonicalScenes[trumanCanonicalScenes.length - 1]?.endTimestampSeconds ?? 0,
} as const;

/**
 * Research-tier scene id → canonical scene id.
 *
 * The 15 DRAFT scenes cannot be renamed mechanically: two of them split across
 * several canonical scenes, and three canonical scenes have no research-era
 * counterpart at all. This map is the bridge the promotion must consume, and it
 * is deliberately explicit so a wrong edge fails a test instead of silently
 * re-pointing a claim at the wrong second of the film.
 */
export const trumanResearchSceneRewire: Record<string, string[]> = {
  "truman-sc-morning": ["truman-sc-day-10909"],
  "truman-sc-light": ["truman-sc-day-10909"],
  "truman-sc-radio": ["truman-sc-paranoia"],
  "truman-sc-school": ["truman-sc-aquaphobia", "truman-sc-memories-of-dad"],
  "truman-sc-sylvia": ["truman-sc-lauren-sylvia"],
  "truman-sc-ferry": ["truman-sc-aquaphobia"],
  "truman-sc-father": ["truman-sc-memories-of-dad"],
  "truman-sc-elevator": ["truman-sc-paranoia"],
  "truman-sc-travel": ["truman-sc-chefs-pal", "truman-sc-dreaming-of-fiji", "truman-sc-travelers-beware"],
  "truman-sc-bridge": ["truman-sc-im-being-spontaneous"],
  "truman-sc-meryl": ["truman-sc-mococoa"],
  "truman-sc-reunion": ["truman-sc-father-and-son-reunion", "truman-sc-trutalk"],
  "truman-sc-escape": ["truman-sc-hes-gone"],
  "truman-sc-storm": ["truman-sc-cue-the-storm"],
  "truman-sc-door": ["truman-sc-final-act"],
};

/** Canonical scenes with no research-era predecessor: they are new coverage. */
export const trumanCanonicalScenesWithoutResearchOrigin = [
  "truman-sc-prologue",
  "truman-sc-no-place-like-home",
  "truman-sc-lady-flowers-dented-beetle",
  "truman-sc-blocked-at-every-turn",
  "truman-sc-do-you-think-he-knows",
  "truman-sc-setting-sail",
] as const;
