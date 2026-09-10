export const SPOILER_LEVELS = ["NONE", "MINOR", "MAJOR", "ENDING", "FULL"] as const;

export type SpoilerLevel = (typeof SPOILER_LEVELS)[number];

const SPOILER_RANK: Record<SpoilerLevel, number> = {
  NONE: 0,
  MINOR: 1,
  MAJOR: 2,
  ENDING: 3,
  FULL: 4,
};

export const SPOILER_QUERY_KEY = "spoilers";

export function isSpoilerLevel(value: unknown): value is SpoilerLevel {
  return typeof value === "string" && SPOILER_LEVELS.includes(value.toUpperCase() as SpoilerLevel);
}

export function parseSpoilerLevel(value: string | string[] | undefined | null): SpoilerLevel {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return "NONE";
  const normalized = candidate.toUpperCase();
  return isSpoilerLevel(normalized) ? normalized : "NONE";
}

export function canRevealSpoiler(current: SpoilerLevel, required: SpoilerLevel): boolean {
  return SPOILER_RANK[current] >= SPOILER_RANK[required];
}

export type SpoilerScoped = {
  spoilerLevel: SpoilerLevel;
};

export function filterBySpoilerLevel<T extends SpoilerScoped>(
  items: readonly T[],
  current: SpoilerLevel,
): T[] {
  return items.filter((item) => canRevealSpoiler(current, item.spoilerLevel));
}

export function withSpoilerQuery(pathname: string, level: SpoilerLevel): string {
  if (level === "NONE") return pathname;
  const separator = pathname.includes("?") ? "&" : "?";
  return `${pathname}${separator}${SPOILER_QUERY_KEY}=${level.toLowerCase()}`;
}
