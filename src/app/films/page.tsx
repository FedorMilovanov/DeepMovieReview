import type { Metadata } from "next";
import Link from "next/link";
import { filmPackages } from "@/data/film-packages";

export const metadata: Metadata = {
  title: "Films",
  description: "Film index shell for DeepMovieReview.",
};

export default function FilmsPage() {
  return (
    <section className="sectionShell filmIndexHero" aria-labelledby="films-title">
      <div className="sectionIndex">FILMS / INDEX</div>
      <h1 id="films-title">Films</h1>
      <p className="sectionIntro">
        The platform shell comes first. Real analyses will be loaded into this index as structured content packages.
      </p>
      <p className="fixtureNotice">
        Current entries are fixtures for route, layout and renderer-contract testing. They are not published reviews.
      </p>
      <div className="filmList">
        {filmPackages.map((filmPackage, index) => {
          const { film, modules } = filmPackage;
          return (
            <Link className="filmRow" href={`/films/${film.slug}`} key={film.slug}>
              <span className="filmRowIndex">{String(index + 1).padStart(3, "0")}</span>
              <strong>{film.title}</strong>
              <span className="filmRowMeta">
                {film.year} · {film.status} · {modules.length} modules
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
