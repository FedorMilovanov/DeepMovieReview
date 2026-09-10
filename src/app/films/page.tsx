import type { Metadata } from "next";
import Link from "next/link";
import { filmPackages } from "@/data/film-registry";
import { isPreviewContentEnabled } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Films",
  description: "Film analyses from DeepMovieReview.",
};

export default function FilmsPage() {
  const publishedPackages = filmPackages.filter((filmPackage) => filmPackage.film.status === "published");
  const previewContentEnabled = isPreviewContentEnabled();
  const isPrelaunch = publishedPackages.length === 0;
  const visiblePackages = previewContentEnabled ? filmPackages : publishedPackages;

  return (
    <section className="sectionShell filmIndexHero" aria-labelledby="films-title">
      <div className="sectionIndex">FILMS / INDEX</div>
      <h1 id="films-title">Films</h1>
      <p className="sectionIntro">
        {isPrelaunch
          ? "The platform shell comes first. Real analyses will be loaded into this index as structured content packages."
          : "Published analyses connect story, people, relationships, ideas, craft, moral reasoning and biblical synthesis."}
      </p>
      {isPrelaunch && previewContentEnabled ? (
        <p className="fixtureNotice">
          Current entries are fixtures for route, layout and renderer-contract testing. They are not published reviews.
        </p>
      ) : null}
      {visiblePackages.length === 0 ? (
        <p className="fixtureNotice">No published film analyses are available yet.</p>
      ) : null}
      <div className="filmList">
        {visiblePackages.map((filmPackage, index) => {
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
