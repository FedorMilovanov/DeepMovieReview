import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductionDossierView } from "@/components/film-article/production-view";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { getProductionDossier } from "@/data/films/production-dossiers";
import { getFilmShareAsset } from "@/data/film-share-assets";
import { isPreviewContentEnabled } from "@/data/site-config";
import { productionPageMetadata, shareImageFromAsset } from "@/lib/page-metadata";

/**
 * The production history of a film — the second readable layer.
 *
 * It is gated exactly like the article: it exists only when the film's edition
 * carries a dossier, and while the film is a draft the route is preview-only and
 * noindex. No spoiler control is rendered because the dossier is written to a
 * single, spoiler-free level; that is a property of the data, not a UI promise.
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
  const shareAsset = getFilmShareAsset(film.slug);
  const page = productionPageMetadata(
    filmPackage,
    dossier,
    shareAsset ? shareImageFromAsset(shareAsset) : undefined,
  );
  return {
    title: page.title,
    description: page.description,
    openGraph: page.openGraph,
    twitter: page.twitter,
    alternates: film.status === "published" ? { canonical: `/films/${film.slug}/making` } : undefined,
    robots: film.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function FilmMakingPage({ params }: MakingPageProps) {
  const { slug } = await params;
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage) notFound();
  if (filmPackage.film.status !== "published" && !isPreviewContentEnabled()) notFound();
  const dossier = getProductionDossier(filmPackage.film.slug);
  if (!dossier) notFound();

  return <ProductionDossierView dossier={dossier} filmSlug={filmPackage.film.slug} />;
}
