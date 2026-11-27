import type { FilmPackage } from "@/lib/film-package";

/** Pilot capability is derived from the canonical package, never inferred from a title. */
export function getDiveOpening(filmPackage: FilmPackage) {
  if (filmPackage.film.slug !== "the-truman-show" || !filmPackage.article) return undefined;
  const observation = filmPackage.evidence?.find(record => record.id === "truman-ev-light" && record.spoilerLevel === "NONE");
  const report = filmPackage.evidence?.find(record => record.id === "truman-ev-light-explanation" && record.spoilerLevel === "NONE");
  if (!observation || !report) return undefined;
  return { observation: observation.observation, report: report.observation };
}
