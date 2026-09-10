import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmModuleList } from "@/components/film-modules/film-module-renderer";
import { SpoilerLevelControl } from "@/components/spoiler-level-control";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-packages";
import { canRevealSpoiler, parseSpoilerLevel } from "@/lib/spoilers";

type FilmPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spoilers?: string | string[] }>;
};

export function generateStaticParams() {
  return filmPackages.map((filmPackage) => ({ slug: filmPackage.film.slug }));
}

export async function generateMetadata({ params }: FilmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage) return {};
  return {
    title: filmPackage.film.title,
    description: `${filmPackage.film.title} — DeepMovieReview film shell.`,
  };
}

export default async function FilmPage({ params, searchParams }: FilmPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage) notFound();

  const { film, modules } = filmPackage;
  const spoilerLevel = parseSpoilerLevel(query.spoilers);
  const pathname = `/films/${film.slug}`;
  const hiddenModuleCount = modules.filter(
    (module) => !canRevealSpoiler(spoilerLevel, module.spoilerLevel),
  ).length;

  return (
    <>
      <section className="sectionShell filmPageHero" aria-labelledby="film-title">
        <Link className="microLabel" href="/films">← Films</Link>
        <div className="sectionIndex">FILM / {film.status.toUpperCase()} / SCHEMA {filmPackage.schemaVersion}</div>
        <h1 id="film-title">{film.title}</h1>
        <p className="sectionIntro">{film.premise}</p>
        <div className="meaningGrid">
          <div><span>Year</span><strong>{film.year}</strong></div>
          <div><span>Director</span><strong>{film.director}</strong></div>
          <div><span>Genre</span><strong>{film.genre.join(" / ")}</strong></div>
          <div><span>Question</span><strong>{film.thesisQuestion}</strong></div>
        </div>
        {film.status === "fixture" ? (
          <p className="fixtureNotice">
            This route proves the reusable film renderer only. Fixture language carries no published moral, psychological or biblical authority.
          </p>
        ) : null}
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="spoiler-title">
        <div className="sectionIndex">PLATFORM / SPOILER STATE</div>
        <div className="spoilerHeading">
          <div>
            <h2 id="spoiler-title">Reveal only what the reader has allowed.</h2>
            <p className="sectionIntro">
              Module and item visibility is resolved from the same spoiler level before analytical content renders.
            </p>
          </div>
          <SpoilerLevelControl pathname={pathname} current={spoilerLevel} />
        </div>
        {hiddenModuleCount > 0 ? (
          <p className="spoilerOmissionNotice" aria-live="polite">
            {hiddenModuleCount} analytical {hiddenModuleCount === 1 ? "module is" : "modules are"} omitted at the current spoiler level.
          </p>
        ) : (
          <p className="spoilerOmissionNotice" aria-live="polite">All modules in this fixture are currently visible.</p>
        )}
      </section>

      <FilmModuleList modules={modules} spoilerLevel={spoilerLevel} />
    </>
  );
}
