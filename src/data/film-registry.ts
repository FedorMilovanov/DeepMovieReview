import { filmPackages as rawFilmPackages } from "@/data/film-fixtures";
import { assertValidFilmRegistry } from "@/lib/film-package-integrity";

assertValidFilmRegistry(rawFilmPackages);

/** Canonical validated read surface for application routes and projections. */
export const filmPackages = rawFilmPackages;

export function getFilmPackageBySlug(slug: string) {
  return filmPackages.find((filmPackage) => filmPackage.film.slug === slug);
}

export function requireFilmPackageBySlug(slug: string) {
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage) throw new Error(`Configured film package "${slug}" is not present in the validated registry.`);
  return filmPackage;
}
