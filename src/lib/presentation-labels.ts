import type { NarrativePermissionState } from "@/lib/content";
import type {
  Confidence,
  CraftMechanism,
  DecisionKnowledgeState,
  DecisionPressureKind,
  MoralCulpability,
  MoralNarrativeStance,
  MoralSeverity,
  MoralValence,
  RepentanceState,
  ResearchSourceRole,
  SocialFormationDomain,
  SourcesMethodModule,
  TeachingSignalType,
} from "@/lib/film-package";

export const confidenceLabels: Record<Confidence, string> = {
  HIGH: "высокая",
  MEDIUM: "средняя",
  LOW: "низкая",
};

export const narrativePermissionLabels: Record<NarrativePermissionState, string> = {
  CONDEMNED: "осуждается",
  COSTLY: "имеет цену",
  QUESTIONED: "ставится под вопрос",
  UNCHALLENGED: "остаётся без вызова",
  NORMALIZED: "нормализуется",
  REWARDED: "вознаграждается",
  CELEBRATED: "прославляется",
  AMBIGUOUS: "неоднозначно",
};

export const socialFormationLabels: Record<SocialFormationDomain, string> = {
  PARENTAL_PRESENCE: "присутствие родителей",
  PARENTAL_EXAMPLE: "пример родителей",
  AUTHORITY: "власть и авторитет",
  DISCIPLINE_BOUNDARIES: "дисциплина и границы",
  PEER_PRESSURE: "давление сверстников",
  REBELLION_AUTONOMY: "бунт и самостоятельность",
  RESPONSIBILITY: "ответственность",
  SEXUAL_FORMATION: "сексуальное формирование",
  SUBSTANCE_RISK: "риск веществ",
  WORK_STUDY: "труд и учёба",
  MATURITY: "зрелость",
  ADULT_ROLE_MODELS: "взрослые образцы",
  OTHER: "другое",
};

export const teachingSignalLabels: Record<TeachingSignalType, string> = {
  EXPLICIT_LESSON: "прямой урок",
  REPEATED_PATTERN: "повторяющийся паттерн",
  ROLE_MODEL: "положительная модель",
  ANTI_MODEL: "отрицательная модель",
  REWARD: "вознаграждение",
  COST_OR_PUNISHMENT: "цена / наказание",
  COMIC_NORMALIZATION: "комическая нормализация",
  ROMANTICIZATION: "романтизация",
  RIDICULE: "высмеивание",
  UNCHALLENGED_ASSUMPTION: "неоспоренное допущение",
  ENDING_RESOLUTION: "разрешение в финале",
  GENRE_CONVENTION: "жанровая конвенция",
  FORMAL_GLAMOUR: "формальный гламур",
  OTHER: "другое",
};

export const craftMechanismLabels: Record<CraftMechanism, string> = {
  CAMERA_DISTANCE: "дистанция камеры",
  POINT_OF_VIEW: "точка зрения",
  CAMERA_MOVEMENT: "движение камеры",
  LIGHTING: "свет",
  COLOR: "цвет",
  MUSIC: "музыка",
  SOUND: "звук",
  EDITING_RHYTHM: "ритм монтажа",
  REACTION_SHOT: "реакционный кадр",
  PERFORMANCE: "актёрская игра",
  COMIC_TIMING: "комический тайминг",
  SLOW_MOTION: "замедление",
  PRODUCTION_DESIGN: "художественное решение",
  COSTUME: "костюм",
  OTHER: "другое",
};

export const decisionKnowledgeLabels: Record<DecisionKnowledgeState, string> = {
  KNOWN_TO_CHARACTER: "известно герою",
  REASONABLY_INFERABLE: "разумно выводимо",
  UNKNOWN_AT_TIME: "неизвестно тогда",
  REVEALED_LATER: "раскрыто позже",
};

export const decisionPressureLabels: Record<DecisionPressureKind, string> = {
  TIME: "время",
  THREAT: "угроза",
  COERCION: "принуждение",
  SOCIAL: "социальное",
  EMOTIONAL: "эмоциональное",
  INFORMATIONAL: "информационное",
  OTHER: "другое",
};

export const moralValenceLabels: Record<MoralValence, string> = {
  WRONGDOING: "проступок",
  VIRTUE: "добродетель",
  MIXED: "смешанное",
  PRUDENTIAL: "благоразумие",
};

export const moralSeverityLabels: Record<MoralSeverity, string> = {
  LOW: "низкая",
  MODERATE: "умеренная",
  SERIOUS: "серьёзная",
  GRAVE: "тяжкая",
};

export const moralCulpabilityLabels: Record<MoralCulpability, string> = {
  LOW: "низкая",
  PARTIAL: "частичная",
  SUBSTANTIAL: "существенная",
  HIGH: "высокая",
  UNCERTAIN: "неопределённая",
};

export const repentanceLabels: Record<RepentanceState, string> = {
  NONE: "нет",
  RECOGNITION: "осознание",
  REMORSE: "сожаление",
  CONFESSION: "признание",
  RESTITUTION: "возмещение",
  REPAIR: "восстановление",
  HARDENING: "ожесточение",
  AMBIGUOUS: "неоднозначно",
};

export const moralNarrativeStanceLabels: Record<MoralNarrativeStance, string> = {
  CONDEMNS: "осуждает",
  QUESTIONS: "ставит под вопрос",
  AMBIVALENT: "двойственно",
  NORMALIZES: "нормализует",
  CELEBRATES: "прославляет",
};

export const pressureKindLabels = {
  EMPATHY: "эмпатическое",
  IMITATION: "имитационное",
} as const;

export const sourceKindLabels: Record<SourcesMethodModule["sources"][number]["kind"], string> = {
  "film-edition": "издание фильма",
  scripture: "Писание",
  reference: "исследовательский источник",
  "editorial-note": "редакционная заметка",
};

export const researchSourceRoleLabels: Record<ResearchSourceRole, string> = {
  "primary-material": "первичный материал",
  "institutional-academic": "институциональный / академический",
  "professional-reference": "профессиональный источник",
  "database-transcript": "база / каталог / расшифровка",
  "tertiary-community": "третичный / общественный разбор",
};
