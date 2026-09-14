/**
 * Pure film-index search logic. The query matches against the title, the
 * year and the human-readable status label; an empty query keeps the full
 * list. Matching is case-insensitive and whitespace-tolerant so the
 * component layer stays a thin controlled input over this function.
 */
export type FilmIndexSearchEntry = {
  title: string;
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
    normalizeSearchText(`${film.title} ${film.year} ${film.status}`).includes(normalized),
  );
}
