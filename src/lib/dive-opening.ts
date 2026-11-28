import type { FilmPackage } from "@/lib/film-package";
import { canRevealSpoiler, type SpoilerLevel } from "@/lib/spoilers";

/** Pilot capability is derived from the canonical package, never inferred from a title. */
export function getDiveOpening(filmPackage: FilmPackage) {
  if (filmPackage.film.slug !== "the-truman-show" || !filmPackage.article) return undefined;
  const observation = filmPackage.evidence?.find(record => record.id === "truman-ev-light" && record.spoilerLevel === "NONE");
  const report = filmPackage.evidence?.find(record => record.id === "truman-ev-light-explanation" && record.spoilerLevel === "NONE");
  if (!observation || !report) return undefined;
  return { observation: observation.observation, report: report.observation };
}

/** The next room gets only records actually permitted for this request. */
export function getDiveFear(filmPackage: FilmPackage, spoilerLevel: SpoilerLevel) {
  if (!getDiveOpening(filmPackage) || !canRevealSpoiler(spoilerLevel, "MINOR")) return undefined;
  const visible = filmPackage.evidence?.filter(record => canRevealSpoiler(spoilerLevel, record.spoilerLevel)) ?? [];
  const memory = visible.find(record => record.id === "truman-ev-drowning");
  const ferry = visible.find(record => record.id === "truman-ev-ferry");
  const warning = visible.find(record => record.id === "truman-ev-poster");
  if (!memory || !ferry || !warning) return undefined;
  return { memory: memory.observation, ferry: ferry.observation, warning: warning.observation };
}
export type DiveFearData = NonNullable<ReturnType<typeof getDiveFear>>;

/** Memory uses early records only; later explanations are deliberately not sent. */
export function getDiveMemory(filmPackage: FilmPackage, spoilerLevel: SpoilerLevel) {
  if (!getDiveOpening(filmPackage) || !canRevealSpoiler(spoilerLevel, "MINOR")) return undefined;
  const visible = filmPackage.evidence?.filter(record => canRevealSpoiler(spoilerLevel, record.spoilerLevel)) ?? [];
  const album = visible.find(record => record.id === "truman-ev-album");
  const fiji = visible.find(record => record.id === "truman-ev-fiji");
  if (!album || !fiji) return undefined;
  return { album: album.observation, fiji: fiji.observation };
}
export type DiveMemoryData = NonNullable<ReturnType<typeof getDiveMemory>>;
export type DiveDiscovery = { before: string; after: string; insight: string; grounds: string[] };
