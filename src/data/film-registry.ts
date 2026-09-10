import {
  filmPackages as rawFilmPackages,
  pilotFilmPackage as rawPilotFilmPackage,
} from "@/data/film-packages";
import { assertValidFilmRegistry } from "@/lib/film-package-integrity";

assertValidFilmRegistry(rawFilmPackages);

/** Canonical validated read surface for application routes and projections. */
export const filmPackages = rawFilmPackages;
export const pilotFilmPackage = rawPilotFilmPackage;

export function getFilmPackageBySlug(slug: string) {
  return filmPackages.find((filmPackage) => filmPackage.film.slug === slug);
}
