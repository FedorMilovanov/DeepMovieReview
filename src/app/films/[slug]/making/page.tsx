import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductionDossierView } from "@/components/film-article/production-view";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { getProductionDossier } from "@/data/films/production-dossiers";
import { getProductionCoverAsset } from "@/data/film-share-assets";
import { isPreviewContentEnabled } from "@/data/site-config";
import { siteIndexingEnabled } from "@/lib/site-indexing";
import {
  heroImageFromAsset,
  productionPageMetadata,
  shareImageFromAsset,
} from "@/lib/page-metadata";

/**
 * The production history of a film — the second readable layer.
 *
 * It is gated exactly like the article: it exists only when the film's edition
 * carries a dossier, and while the film is a draft the route is preview-only and
 * noindex. The dossier has one level rather than a spoiler control; it can discuss
 * the ending and explicitly warns readers before the content.
 */

type MakingPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  const previewContentEnabled = isPreviewContentEnabled();
  return filmPackages
    .filter((filmPackage) => getProductionDossier(filmPackage.film.slug))
    .filter((filmPackage) => previewContentEnabled || filmPackage.film.status === "published")
    .map((filmPackage) => ({ slug: filmPackage.film.slug }));
}

export async function generateMetadata({ params }: MakingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage) return {};
  if (filmPackage.film.status !== "published" && !isPreviewContentEnabled()) return {};
  const dossier = getProductionDossier(filmPackage.film.slug);
  if (!dossier) return {};
  const { film } = filmPackage;
  const cover = getProductionCoverAsset(film.slug);
  const page = productionPageMetadata(
    filmPackage,
    dossier,
    cover ? shareImageFromAsset(cover) : undefined,
  );
  return {
    title: page.title,
    description: page.description,
    openGraph: page.openGraph,
    twitter: page.twitter,
    alternates: film.status === "published" ? { canonical: `/films/${film.slug}/making` } : undefined,
    // A published dossier is still noindex when this build is a preview.
    robots:
      film.status === "published" && siteIndexingEnabled()
        ? undefined
        : { index: false, follow: false },
  };
}

export default async function FilmMakingPage({ params }: MakingPageProps) {
  const { slug } = await params;
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage) notFound();
  if (filmPackage.film.status !== "published" && !isPreviewContentEnabled()) notFound();
  const dossier = getProductionDossier(filmPackage.film.slug);
  if (!dossier) notFound();

  const coverAsset = getProductionCoverAsset(filmPackage.film.slug);
  return (
    <ProductionDossierView
      dossier={dossier}
      filmSlug={filmPackage.film.slug}
      filmTitle={filmPackage.film.title}
      cover={coverAsset ? heroImageFromAsset(coverAsset) : undefined}
    />
  );
}
