"use client";

import { useMemo, useState } from "react";
import { FilmMediaFrame } from "@/components/film-media-frame";
import { FilmTransitionLink } from "@/components/film-transition-link";

export type FilmIndexEntry = {
  slug: string;
  title: string;
  year: number;
  status: string;
  modules: number;
  position: number;
};

/**
 * Client-side index filter. The full list renders in SSR (empty query is
 * the initial state), so no film is ever hidden without user input.
 */
export function FilmIndexFilter({ films }: { films: FilmIndexEntry[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      films.filter(
        (film) =>
          normalized.length === 0 ||
          `${film.title} ${film.year} ${film.status}`.toLowerCase().includes(normalized),
      ),
    [films, normalized],
  );

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
              {film.year} · {film.status} · {film.modules} {pluralModules(film.modules)}
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

function pluralModules(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "модуль";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "модуля";
  return "модулей";
}
