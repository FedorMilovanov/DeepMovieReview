import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpoilerLevelControl } from "@/components/spoiler-level-control";
import { films, getFilmBySlug } from "@/lib/content";
import {
  filterBySpoilerLevel,
  parseSpoilerLevel,
  type SpoilerLevel,
} from "@/lib/spoilers";

type FilmPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spoilers?: string | string[] }>;
};

type FixtureSpoilerBeat = {
  spoilerLevel: SpoilerLevel;
  label: string;
  copy: string;
};

const fixtureSpoilerBeats: FixtureSpoilerBeat[] = [
  {
    spoilerLevel: "NONE",
    label: "Spoiler-free",
    copy: "The platform can expose premise, themes and selected relationships without revealing decisive turns.",
  },
  {
    spoilerLevel: "MINOR",
    label: "Minor detail",
    copy: "A relationship fracture can be discussed once a viewer opts into limited plot detail.",
  },
  {
    spoilerLevel: "MAJOR",
    label: "Major turn",
    copy: "Major causal and character reversals remain absent from the rendered document until explicitly allowed.",
  },
  {
    spoilerLevel: "ENDING",
    label: "Ending",
    copy: "Ending claims, resolution evidence and final consequences require a dedicated ending permission level.",
  },
  {
    spoilerLevel: "FULL",
    label: "Full analysis",
    copy: "Full mode can expose every scene-level evidence chain, dilemma and synthesis required by the editorial package.",
  },
];

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

export default async function FilmPage({ params, searchParams }: FilmPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const film = getFilmBySlug(slug);
  if (!film) notFound();

  const spoilerLevel = parseSpoilerLevel(query.spoilers);
  const visibleSpoilerBeats = filterBySpoilerLevel(fixtureSpoilerBeats, spoilerLevel);
  const pathname = `/films/${film.slug}`;

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

      <section className="sectionShell sectionRule" aria-labelledby="spoiler-title">
        <div className="sectionIndex">PLATFORM / SPOILER STATE</div>
        <div className="spoilerHeading">
          <div>
            <h2 id="spoiler-title">Reveal only what the reader has allowed.</h2>
            <p className="sectionIntro">
              Spoiler scope is resolved on the server before analytical modules render. The URL remains shareable and inspectable.
            </p>
          </div>
          <SpoilerLevelControl pathname={pathname} current={spoilerLevel} />
        </div>
        <div className="spoilerEvidence" aria-live="polite">
          {visibleSpoilerBeats.map((beat) => (
            <article key={beat.spoilerLevel}>
              <span className="microLabel">{beat.spoilerLevel}</span>
              <h3>{beat.label}</h3>
              <p>{beat.copy}</p>
            </article>
          ))}
        </div>
        {spoilerLevel !== "FULL" ? (
          <p className="spoilerOmissionNotice">
            Higher-level fixture content is not present in the rendered page at the current spoiler setting.
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
