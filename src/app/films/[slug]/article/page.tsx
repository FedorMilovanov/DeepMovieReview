import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/film-article/article-view";
import { SpoilerDeepLinkGuard } from "@/components/spoiler-deep-link-guard";
import { SpoilerLevelControl } from "@/components/spoiler-level-control";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { getArticleMeasurementBundle } from "@/data/article-measurements";
import { isPreviewContentEnabled } from "@/data/site-config";
import { getFilmShareAsset } from "@/data/film-share-assets";
import { projectArticleSections } from "@/lib/film-article";
import { articlePageMetadata, shareImageFromAsset } from "@/lib/page-metadata";
import { parseSpoilerLevel } from "@/lib/spoilers";

/**
 * The readable layer of a locked edition.
 *
 * This route exists only when the package carries an article, and the article
 * itself cannot be validated without a LOCKED edition (see
 * `src/lib/film-article-integrity.ts`). While the film is a draft the route is
 * preview-only and noindex — the same gate as the film page, not a second one.
 */

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spoilers?: string | string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const previewContentEnabled = isPreviewContentEnabled();
  return filmPackages
    .filter((filmPackage) => filmPackage.article)
    .filter((filmPackage) => getArticleMeasurementBundle(filmPackage.film.slug))
    .filter((filmPackage) => previewContentEnabled || filmPackage.film.status === "published")
    .map((filmPackage) => ({ slug: filmPackage.film.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage?.article) return {};
  if (filmPackage.film.status !== "published" && !isPreviewContentEnabled()) return {};
  const { film } = filmPackage;
  const shareAsset = getFilmShareAsset(film.slug);
  const page = articlePageMetadata(
    filmPackage,
    shareAsset ? shareImageFromAsset(shareAsset) : undefined,
  );
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    openGraph: page.openGraph,
    twitter: page.twitter,
    alternates: film.status === "published" ? { canonical: `/films/${film.slug}/article` } : undefined,
    robots: film.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function FilmArticlePage({ params, searchParams }: ArticlePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage?.article) notFound();
  if (filmPackage.film.status !== "published" && !isPreviewContentEnabled()) notFound();
  const measurements = getArticleMeasurementBundle(filmPackage.film.slug);
  if (!measurements) notFound();

  const spoilerLevel = parseSpoilerLevel(query.spoilers);
  const projection = projectArticleSections(filmPackage.article, spoilerLevel);
  const pathname = `/films/${filmPackage.film.slug}/article`;

  return (
    <>
      <SpoilerDeepLinkGuard spoilerLevel={spoilerLevel} />
      <div className="sectionShell articleSpoilerBar">
        <SpoilerLevelControl pathname={pathname} current={spoilerLevel} />
      </div>
      <ArticleView
        article={filmPackage.article}
        filmSlug={filmPackage.film.slug}
        projection={projection}
        spoilerLevel={spoilerLevel}
        describeMeasurement={measurements.describe}
        formatTimecode={measurements.formatTimecode}
        moduleHeadings={Object.fromEntries(
          filmPackage.modules.map((filmModule) => [filmModule.id, filmModule.heading]),
        )}
      />
    </>
  );
}
