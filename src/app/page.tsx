import type { Metadata } from "next";
import { ObservatoryHero } from "@/components/home/observatory-hero";
import { FilmIndexFilter } from "@/components/film-index-filter";
import { getObservatoryArtwork } from "@/data/observatory-artwork";
import { filmPackages } from "@/data/film-registry";
import { projectFilmIndex } from "@/lib/film-index";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const films = projectFilmIndex(filmPackages);
  return (
    <>
      <ObservatoryHero artwork={getObservatoryArtwork()} />
      <section id="films" tabIndex={-1} className="sectionShell journalFilms" aria-labelledby="journal-films-title">
        <div className="sectionIndex">Журнал / Фильмы</div>
        <h2 id="journal-films-title">Выберите фильм.</h2>
        <p className="sectionIntro">Каждый разбор начинается с истории и ведёт к её смыслу. Сюжет раскрывается постепенно, по вашему выбору.</p>
        {films.length ? <FilmIndexFilter films={films} /> : <p className="fixtureNotice">Первый выпуск готовится. Здесь появятся опубликованные разборы.</p>}
      </section>
    </>
  );
}
