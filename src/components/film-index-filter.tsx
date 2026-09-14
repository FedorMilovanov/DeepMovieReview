"use client";

import { useMemo, useState } from "react";
import { FilmMediaFrame } from "@/components/film-media-frame";
import { FilmTransitionLink } from "@/components/film-transition-link";
import { filterFilmIndex, type FilmIndexSearchEntry } from "@/lib/film-index";
import { pluralRu } from "@/lib/plural-ru";

export type FilmIndexEntry = FilmIndexSearchEntry & {
  slug: string;
  modules: number;
  position: number;
};

/**
 * Client-side index filter. The full list renders in SSR (empty query is
 * the initial state), so no film is ever hidden without user input.
 */
export function FilmIndexFilter({ films }: { films: FilmIndexEntry[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => filterFilmIndex(films, query), [films, query]);

  return (
    <>
      <div className="filmFilter">
        <label htmlFor="film-filter">Поиск по индексу</label>
        <input
          id="film-filter"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Название, год, статус…"
          autoComplete="off"
        />
      </div>
      <p className="filmFilterCount" aria-live="polite">
        Показано {visible.length} из {films.length}
      </p>
      <div className="filmList">
        {visible.map((film) => (
          <FilmTransitionLink
            className="filmRow"
            href={`/films/${film.slug}`}
            key={film.slug}
            slug={film.slug}
          >
            <span className="filmRowIndex">{String(film.position).padStart(3, "0")}</span>
            <FilmMediaFrame slug={film.slug} variant="index" />
            <span className="filmRowTitle"><strong>{film.title}</strong></span>
            <span className="filmRowMeta">
              {film.year} · {film.status} · {film.modules} {pluralRu(film.modules, "модуль", "модуля", "модулей")}
            </span>
          </FilmTransitionLink>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="fixtureNotice">Ничего не найдено. Попробуйте другое название.</p>
      ) : null}
    </>
  );
}
