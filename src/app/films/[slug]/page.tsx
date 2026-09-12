import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmMediaFrame } from "@/components/film-media-frame";
import { FilmModuleList, getVisibleFilmModules } from "@/components/film-modules/film-module-renderer";
import { SpoilerDeepLinkGuard } from "@/components/spoiler-deep-link-guard";
import { SpoilerLevelControl } from "@/components/spoiler-level-control";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { isPreviewContentEnabled } from "@/data/site-config";
import { parseSpoilerLevel, withSpoilerQuery } from "@/lib/spoilers";

type FilmPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spoilers?: string | string[] }>;
};

const statusLabels = {
  fixture: "фикстура",
  draft: "черновик",
  published: "опубликовано",
} as const;

function pluralRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const dynamicParams = false;

export function generateStaticParams() {
  const previewContentEnabled = isPreviewContentEnabled();
  return filmPackages
    .filter((filmPackage) => previewContentEnabled || filmPackage.film.status === "published")
    .map((filmPackage) => ({ slug: filmPackage.film.slug }));
}

export async function generateMetadata({ params }: FilmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage || (filmPackage.film.status !== "published" && !isPreviewContentEnabled())) return {};
  const { film } = filmPackage;
  return {
    title: film.title,
    description:
      film.status === "published"
        ? `${film.title} (${film.year}) — ${film.premise}`
        : `${film.title} — структурный стенд платформы «Глубокие воды».`,
    robots: film.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function FilmPage({ params, searchParams }: FilmPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage || (filmPackage.film.status !== "published" && !isPreviewContentEnabled())) notFound();

  const { film, modules } = filmPackage;
  const spoilerLevel = parseSpoilerLevel(query.spoilers);
  const pathname = `/films/${film.slug}`;
  const visibleModules = getVisibleFilmModules(modules, spoilerLevel);
  const hiddenModuleCount = modules.length - visibleModules.length;
  const outlineBase = withSpoilerQuery(pathname, spoilerLevel);

  return (
    <>
      <SpoilerDeepLinkGuard spoilerLevel={spoilerLevel} />

      <section className="sectionShell filmPageHero" aria-labelledby="film-title">
        <Link className="microLabel" href="/films">← Фильмы</Link>
        <FilmMediaFrame slug={film.slug} variant="hero" />
        <div className="sectionIndex">Фильм / {statusLabels[film.status]} / Схема {filmPackage.schemaVersion}</div>
        <h1 id="film-title">{film.title}</h1>
        <p className="sectionIntro">{film.premise}</p>
        <div className="meaningGrid">
          <div><span>Год</span><strong>{film.year}</strong></div>
          <div><span>Режиссёр</span><strong>{film.director}</strong></div>
          <div><span>Жанр</span><strong>{film.genre.join(" / ")}</strong></div>
          <div><span>Вопрос</span><strong>{film.thesisQuestion}</strong></div>
        </div>
        {film.status === "fixture" ? (
          <p className="fixtureNotice">Этот маршрут лишь проверяет переиспользуемый рендерер фильмов. Язык фикстуры не несёт опубликованной моральной, психологической или библейской позиции.</p>
        ) : null}
      </section>

      <section className="sectionShell sectionRule filmOutlineSection" aria-labelledby="film-outline-title">
        <div>
          <div className="sectionIndex">Фильм / План</div>
          <h2 id="film-outline-title">Адресный разбор, отфильтрованный под ваш уровень спойлеров.</h2>
        </div>
        <nav className="filmOutline" aria-label={`${film.title}: разделы разбора`}>
          {visibleModules.map((filmModule, index) => (
            <Link key={filmModule.id} href={`${outlineBase}#${filmModule.id}`} scroll>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{filmModule.eyebrow ?? filmModule.kind}</strong>
              <small>{filmModule.heading}</small>
            </Link>
          ))}
        </nav>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="spoiler-title">
        <div className="sectionIndex">Платформа / Спойлеры</div>
        <div className="spoilerHeading">
          <div>
            <h2 id="spoiler-title">Показывать только то, что разрешил читатель.</h2>
            <p className="sectionIntro">Видимость модулей и их пунктов вычисляется из того же уровня спойлеров — до рендера аналитического содержимого.</p>
          </div>
          <SpoilerLevelControl pathname={pathname} current={spoilerLevel} />
        </div>
        {hiddenModuleCount > 0 ? (
          <p className="spoilerOmissionNotice" aria-live="polite">По текущему уровню спойлеров скрыт{pluralRu(hiddenModuleCount, "", "ы", "о")} {hiddenModuleCount} {pluralRu(hiddenModuleCount, "аналитический", "аналитических", "аналитических")} {pluralRu(hiddenModuleCount, "модуль", "модуля", "модулей")}.</p>
        ) : (
          <p className="spoilerOmissionNotice" aria-live="polite">Сейчас видны все модули разбора.</p>
        )}
      </section>

      <FilmModuleList modules={visibleModules} />
    </>
  );
}
