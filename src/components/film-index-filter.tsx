"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { filterFilmIndex, type FilmIndexEntry } from "@/lib/film-index";
import { useHydrated } from "@/lib/use-hydrated";

export type { FilmIndexEntry } from "@/lib/film-index";

/**
 * Client-side index filter. The full list renders in SSR (empty query is
 * the initial state), so no film is ever hidden without user input.
 */
export function FilmIndexFilter({ films }: { films: FilmIndexEntry[] }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const hydrated = useHydrated();
  const visible = useMemo(() => filterFilmIndex(films, query), [films, query]);

  return (
    <>
      {films.length > 1 ? <>
      <div className="filmFilter">
        <label htmlFor="film-filter">Поиск по индексу</label>
        <div className="filmFilterField">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
        <input
          ref={searchRef}
          id="film-filter"
          type="search"
          disabled={!hydrated}
          aria-describedby={!hydrated ? "film-filter-unavailable" : undefined}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Название, год, статус…"
          autoComplete="off"
        />
        {query ? <button type="button" className="filmFilterClear" aria-label="Очистить поиск" onClick={()=>{setQuery("");searchRef.current?.focus();}}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button> : null}
        </div>
        {!hydrated ? <p id="film-filter-unavailable">Поиск доступен после загрузки скриптов; полный список ниже.</p> : null}
      </div>
      <p className="filmFilterCount" aria-live="polite">
        Показано {visible.length} из {films.length}
      </p>
      </> : null}
      <div className="filmList">
        {visible.map((film) => (
          <Link className="filmRow" data-has-cover={Boolean(film.coverSrc)} href={`/films/${film.slug}`} key={film.slug} prefetch={false}>
            {film.coverSrc ? <span className="filmMediaFrame filmMediaFrameIndex" aria-hidden="true"><Image src={film.coverSrc} alt="" fill sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 1400px) 36vw, 460px" /></span>:null}
            <span className="filmRowTitle"><strong>{film.title}</strong>{film.originalTitle && film.originalTitle!==film.title ? <small>{film.originalTitle}</small>:null}{film.teaser ? <span className="filmRowTeaser">{film.teaser}</span>:null}{film.coverSrc ? <small className="filmRowArtNote">Редакционная иллюстрация · не кадр фильма</small>:null}</span>
            <span className="filmRowMeta">
              <span className="filmRowYear">{film.year}</span>{!film.published ? <span className="filmRowStatus">{film.status}</span>:null}<span className="filmRowRead">{film.published ? "Читать разбор" : "Предпросмотр"} <span aria-hidden="true">→</span></span>
            </span>
          </Link>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="fixtureNotice">Ничего не найдено. Попробуйте другое название.</p>
      ) : null}
    </>
  );
}
