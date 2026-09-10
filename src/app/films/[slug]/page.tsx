import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { films, getFilmBySlug } from "@/lib/content";

type FilmPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return films.map((film) => ({ slug: film.slug }));
}

export async function generateMetadata({ params }: FilmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) return {};
  return {
    title: film.title,
    description: `${film.title} — DeepMovieReview film shell.`,
  };
}

export default async function FilmPage({ params }: FilmPageProps) {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) notFound();

  return (
    <>
      <section className="sectionShell filmPageHero" aria-labelledby="film-title">
        <Link className="microLabel" href="/films">← Films</Link>
        <div className="sectionIndex">FILM / {film.status.toUpperCase()}</div>
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
            This route proves the reusable film shell only. No moral, psychological or biblical conclusion on this page should be treated as a published review.
          </p>
        ) : null}
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="film-system-title">
        <div className="sectionIndex">FILM PAGE / FUTURE MODULES</div>
        <h2 id="film-system-title">A film becomes a structured analysis package.</h2>
        <div className="lensGrid">
          {[
            ["Story", "Synopsis, structure, causality and ending."],
            ["People", "Character profiles, arcs, psychology and role-model pressure."],
            ["Relationships", "Trust, power, loyalty, conflict, boundaries and repair."],
            ["Ideas", "Themes, questions, claims, worldview and counterevidence."],
            ["Moral world", "Acts, motives, responsibility, consequences and narrative permission."],
            ["Biblical lens", "Principles, Scripture, application, qualification and synthesis."],
          ].map(([title, copy], index) => (
            <article className="lensItem" key={title}>
              <span className="lensNumber">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
