import type { FilmPackage } from "./film-package";
import { getFilmHomeAsset } from "../data/film-home-assets";

/**
 * Pure film-index search logic. The query matches against the localized
 * title, optional original title, year and human-readable status label; an
 * empty query keeps the full list. Matching is case-insensitive and
 * whitespace-tolerant so the component layer stays a thin controlled input
 * over this function.
 */
export type FilmIndexSearchEntry = {
  title: string;
  originalTitle?: string;
  year: number;
  status: string;
};

function normalizeSearchText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
}

export function filterFilmIndex<T extends FilmIndexSearchEntry>(
  films: readonly T[],
  query: string,
): T[] {
  const normalized = normalizeSearchText(query);
  if (normalized.length === 0) return [...films];
  return films.filter((film) =>
    normalizeSearchText(
      `${film.title} ${film.originalTitle ?? ""} ${film.year} ${film.status}`,
    ).includes(normalized),
  );
}

/** Editorial availability is independent of the requested spoiler level. */
export function filmIndexStatusLabel(filmPackage: FilmPackage): string {
  if (filmPackage.research?.state === "SECONDARY_SOURCES") {
    return "исследовательский черновик · статьи нет · мастер не заблокирован";
  }
  if (filmPackage.film.status === "fixture") return "фикстура";
  if (filmPackage.film.status === "published") return "опубликовано";
  return filmPackage.article ? "статья · предпросмотр" : "черновик · статьи нет";
}

export type FilmIndexEntry = FilmIndexSearchEntry & {
  slug: string;
  position: number;
  published: boolean;
  teaser?: string;
  coverSrc?: string;
};

/** One registry projection for the journal and catalogue. Only an explicit
 * spoiler-free teaser may leave the package; no scene, article or module
 * data is projected into the public card. Preview drafts are opt-in. */
export function projectFilmIndex(packages: readonly FilmPackage[], includePreview = false): FilmIndexEntry[] {
  return packages.filter(pkg => pkg.film.status === "published" || includePreview)
    .map((pkg, index) => ({
      slug: pkg.film.slug,
      title: pkg.film.title,
      originalTitle: pkg.film.originalTitle,
      year: pkg.film.year,
      status: filmIndexStatusLabel(pkg),
      position: index + 1,
      published: pkg.film.status === "published",
      teaser: pkg.film.status === "published" ? pkg.film.catalogTeaser : undefined,
      coverSrc: getFilmHomeAsset(pkg.film.slug)?.variants.find(variant => variant.purpose === "display")?.src,
    }));
}
