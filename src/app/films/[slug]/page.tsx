import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmMediaFrame } from "@/components/film-media-frame";
import { FilmEvidenceMap } from "@/components/film-modules/evidence-map";
import { FilmModuleList, getVisibleFilmModules } from "@/components/film-modules/film-module-renderer";
import { FilmSceneTable } from "@/components/film-modules/scene-table";
import { FilmComparisonView } from "@/components/film-comparison";
import { projectFilmComparison } from "@/lib/film-module-projection";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SpoilerDeepLinkGuard } from "@/components/spoiler-deep-link-guard";
import { SpoilerLevelControl } from "@/components/spoiler-level-control";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { isPreviewContentEnabled } from "@/data/site-config";
import { getFilmShareAsset } from "@/data/film-share-assets";
import { getProductionDossier } from "@/data/films/production-dossiers";
import { pluralRu } from "@/lib/plural-ru";
import { formatTimecode } from "@/lib/timecode";
import { filmPageMetadata, shareImageFromAsset } from "@/lib/page-metadata";
import { siteIndexingEnabled } from "@/lib/site-indexing";
import { canRevealSpoiler, parseSpoilerLevel, withSpoilerQuery } from "@/lib/spoilers";

type FilmPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spoilers?: string | string[] }>;
};

const statusLabels = {
  fixture: "фикстура",
  draft: "черновик",
  published: "опубликовано",
} as const;

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
  const shareAsset = getFilmShareAsset(film.slug);
  const page = filmPageMetadata(
    filmPackage,
    shareAsset ? shareImageFromAsset(shareAsset) : undefined,
  );
  return {
    title: page.title,
    description: page.description,
    openGraph: page.openGraph,
    twitter: page.twitter,
    alternates: film.status === "published" ? { canonical: `/films/${film.slug}` } : undefined,
    // A published page is indexable only when the build itself is: on a preview
    // deployment the layout's noindex must not be dropped by this route.
    robots:
      film.status === "published" && siteIndexingEnabled()
        ? undefined
        : { index: false, follow: false },
  };
}

export default async function FilmPage({ params, searchParams }: FilmPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage || (filmPackage.film.status !== "published" && !isPreviewContentEnabled())) notFound();

  const { film, modules } = filmPackage;
  const researchDraft = filmPackage.research?.state === "SECONDARY_SOURCES";
  const spoilerLevel = parseSpoilerLevel(query.spoilers);
  const pathname = `/films/${film.slug}`;
  const visibleModules = getVisibleFilmModules(modules, spoilerLevel);
  const sourceRecords = visibleModules.flatMap((module) => module.kind === "sources-method" ? module.sources : []);
  const comparison = projectFilmComparison(filmPackage.comparison, spoilerLevel);
  const comparisonEvidenceIds = new Set(comparison?.sides.flatMap((side) =>
    Object.values(side.cells).flatMap((cell) => cell.evidenceIds ?? []),
  ) ?? []);
  const comparisonEvidence = (filmPackage.evidence ?? []).filter((record) =>
    comparisonEvidenceIds.has(record.id) && canRevealSpoiler(spoilerLevel, record.spoilerLevel),
  );
  const hiddenModuleCount = modules.length - visibleModules.length;
  const outlineBase = withSpoilerQuery(pathname, spoilerLevel);
  const characters = visibleModules.find((module) => module.kind === "characters");
  const decision = visibleModules.find((module) => module.kind === "decision");
  const hasVisibleScenes = (filmPackage.scenes ?? []).some((scene) => canRevealSpoiler(spoilerLevel, scene.spoilerLevel));
  const hasVisibleEvidence = (filmPackage.evidence ?? []).some((record) => canRevealSpoiler(spoilerLevel, record.spoilerLevel));
  const moduleContext = {
    evidenceById: new Map((filmPackage.evidence ?? []).map((record) => [record.id, record])),
    formatTimecode,
    spoilerLevel,
  };

  return (
    <>
      <SpoilerDeepLinkGuard spoilerLevel={spoilerLevel} />

      <section className="sectionShell filmPageHero" aria-labelledby="film-title">
        <Breadcrumbs
          trail={[{ label: "Фильмы", href: "/films" }, { label: film.title }]}
        />
        <FilmMediaFrame slug={film.slug} variant="hero" />
        <div className="sectionIndex">Фильм / {researchDraft ? "исследовательский черновик" : statusLabels[film.status]} / Схема {filmPackage.schemaVersion}</div>
        <h1 id="film-title">{film.title}</h1>
        <p className="sectionIntro">{film.premise}</p>
        <div className="meaningGrid">
          <div><span>Год</span><strong>{film.year}</strong></div>
          <div><span>Режиссёр</span><strong>{film.director}</strong></div>
          <div><span>Жанр</span><strong>{film.genre.join(" / ")}</strong></div>
          <div><span>Вопрос</span><strong>{film.thesisQuestion}</strong></div>
        </div>
        {filmPackage.article ? (
          <Link
            className="articleEntryLink"
            href={withSpoilerQuery(`/films/${film.slug}/article`, spoilerLevel)}
          >
            <span>Читать разбор целиком</span>
            <strong>{filmPackage.article.title}</strong>
            <small>{filmPackage.article.standfirst}</small>
          </Link>
        ) : null}
        {getProductionDossier(film.slug) ? (
          <Link
            className="articleEntryLink"
            href={`/films/${film.slug}/making`}
          >
            <span>История создания</span>
            <strong>{getProductionDossier(film.slug)!.title}</strong>
            <small>{getProductionDossier(film.slug)!.standfirst}</small>
          </Link>
        ) : null}
        {researchDraft ? (
          <aside className="researchDraftNotice" aria-label="Статус исследовательского черновика">
            <strong>Исследовательский черновик · вторичные источники · мастер не заблокирован</strong>
            <p>Сцены и таймкоды предварительные. Ни одна из этих опор не считается канонической до воспроизведения по точному просмотренному мастеру, перевода сцен в VERIFIED и повторной привязки доказательств.</p>
          </aside>
        ) : film.status === "fixture" ? (
          <p className="fixtureNotice">Этот маршрут лишь проверяет переиспользуемый рендерер фильмов. Язык фикстуры не несёт опубликованной моральной, психологической или библейской позиции.</p>
        ) : null}
      </section>

      <section className="sectionShell sectionRule filmOutlineSection" aria-labelledby="film-outline-title">
        <div>
          <div className="sectionIndex">Фильм / План</div>
          <h2 id="film-outline-title">Как читать разбор</h2>
          {filmPackage.article || characters || decision || hasVisibleScenes || hasVisibleEvidence ? (
            <nav className="filmReadingPaths" aria-label="Быстрые маршруты чтения">
              <p>Начать с интересующего</p>
              {filmPackage.article ? <Link href={withSpoilerQuery(`/films/${film.slug}/article`, spoilerLevel)}>Текст целиком</Link> : null}
              {characters ? <Link href={`${outlineBase}#${characters.id}`}>По героям</Link> : null}
              {decision ? <Link href={`${outlineBase}#${decision.id}`}>По решениям</Link> : null}
              {hasVisibleScenes ? <Link href={`${outlineBase}#film-scene-table-title`}>По сценам</Link> : null}
              {hasVisibleEvidence ? <Link href={`${outlineBase}#evidence-register-title`}>По опорам</Link> : null}
            </nav>
          ) : null}
        </div>
        <nav className="filmOutline" aria-label={`${film.title}: разделы разбора`}>
          {comparison ? <Link href={`${outlineBase}#${comparison.id}`}><span>↗</span><strong>Battle / Сравнение</strong><small>{comparison.heading}</small></Link> : null}
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

      {comparison ? (
        <FilmComparisonView comparison={comparison} evidence={comparisonEvidence} />
      ) : filmPackage.comparison ? (
        <section className="sectionShell sectionRule" aria-labelledby="comparison-locked-title">
          <div className="sectionIndex">Battle / Сравнение решений</div>
          <h2 id="comparison-locked-title">Сопоставить выборы после просмотра</h2>
          <p className="sectionIntro">Матрица раскрывает финал фильма. Она появится при выборе уровня «Финал» или «Всё».</p>
          <Link href={withSpoilerQuery(pathname, filmPackage.comparison.spoilerLevel)}>Открыть сравнение со спойлерами к финалу →</Link>
        </section>
      ) : null}

      <FilmSceneTable
        evidence={filmPackage.evidence ?? []}
        researchDraft={researchDraft}
        scenes={filmPackage.scenes ?? []}
        spoilerLevel={spoilerLevel}
      />

      <FilmEvidenceMap
        evidence={filmPackage.evidence ?? []}
        modules={visibleModules}
        researchDraft={researchDraft}
        scenes={filmPackage.scenes ?? []}
        sources={sourceRecords}
        spoilerLevel={spoilerLevel}
      />

      <FilmModuleList context={moduleContext} modules={visibleModules} />
    </>
  );
}
