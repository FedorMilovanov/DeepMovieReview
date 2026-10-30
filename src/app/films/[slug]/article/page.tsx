import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/film-article/article-view";
import { SpoilerDeepLinkGuard } from "@/components/spoiler-deep-link-guard";
import { SpoilerLevelControl } from "@/components/spoiler-level-control";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { getArticleMeasurementBundle } from "@/data/article-measurements";
import { filmStillsServable, isPreviewContentEnabled } from "@/data/site-config";
import { getFilmShareAsset } from "@/data/film-share-assets";
import { projectFilmModule } from "@/lib/film-module-projection";
import { projectArticleSections } from "@/lib/film-article";
import { articlePageMetadata, shareImageFromAsset } from "@/lib/page-metadata";
import { siteIndexingEnabled } from "@/lib/site-indexing";
import { parseSpoilerLevel } from "@/lib/spoilers";

/**
 * The readable layer of a locked edition.
 *
 * This route exists only when the package carries an article, and the article
 * itself cannot be validated without a LOCKED edition (see
 * `src/lib/film-article-integrity.ts`). A published film is reachable without a
 * preview flag and gets a canonical link; a draft is preview-only and noindex —
 * the same gate as the film page, not a second one. Frames are a third decision,
 * and they follow `filmStillsServable()`, not publication.
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
    // A published page is indexable only when the build itself is: on a preview
    // deployment the layout's noindex must not be dropped by this route.
    robots:
      film.status === "published" && siteIndexingEnabled()
        ? undefined
        : { index: false, follow: false },
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
  // Stills follow the rights switch, not the publication status: publishing the
  // analysis did not clear the right to reproduce frames of the film.
  const projection = projectArticleSections(filmPackage.article, spoilerLevel, {
    stills: filmStillsServable(),
  });
  const finalModule = filmPackage.modules.find(module => module.kind === "final-synthesis");
  const finalProjection = finalModule ? projectFilmModule(finalModule, spoilerLevel) : null;
  const decisions = filmPackage.modules
    .filter(module => module.kind === "decision")
    .map(module => projectFilmModule(module, spoilerLevel))
    .filter(module => module?.kind === "decision");
  const pathname = `/films/${filmPackage.film.slug}/article`;

  // Structured data for the trail the page already shows. It is derived from the
  // same values the breadcrumbs render, so the two can never disagree; a draft
  // edition stays out of the index and therefore out of search results, where
  // this markup would otherwise be the first thing a crawler reads.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Фильмы", item: "/films" },
      {
        "@type": "ListItem",
        position: 2,
        name: filmPackage.film.title,
        item: `/films/${filmPackage.film.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Разбор",
        item: `/films/${filmPackage.film.slug}/article`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // The object is built from the film package, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SpoilerDeepLinkGuard spoilerLevel={spoilerLevel} />
      <ArticleView
        controls={<SpoilerLevelControl pathname={pathname} current={spoilerLevel} />}
        article={filmPackage.article}
        filmSlug={filmPackage.film.slug}
        filmTitle={filmPackage.film.title}
        projection={projection}
        decisions={decisions}
        synthesis={finalProjection?.kind === "final-synthesis" ? finalProjection : undefined}
        spoilerLevel={spoilerLevel}
        describeMeasurement={measurements.describe}
        evidenceById={new Map((filmPackage.evidence ?? []).map((record) => [record.id, record]))}
        formatTimecode={measurements.formatTimecode}
        moduleHeadings={Object.fromEntries(
          filmPackage.modules.map((filmModule) => [filmModule.id, filmModule.heading]),
        )}
      />
    </>
  );
}
