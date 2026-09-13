import type { MetadataRoute } from "next";
import { filmPackages, requireFilmPackageBySlug } from "@/data/film-registry";
import { homepageFeaturedFilmSlug, isPreviewContentEnabled } from "@/data/site-config";
import { canIndexSite, resolveSiteOrigin } from "@/lib/site-publication-policy";

export default function sitemap(): MetadataRoute.Sitemap {
  const homepageFilmPackage = requireFilmPackageBySlug(homepageFeaturedFilmSlug);
  const previewContentEnabled = isPreviewContentEnabled();
  const indexingEnabled = canIndexSite({
    siteIndexingRequested: process.env.DMR_SITE_INDEXING_ENABLED === "true",
    previewContentEnabled,
    homepageStatus: homepageFilmPackage.film.status,
  });

  if (!indexingEnabled) return [];

  const origin = resolveSiteOrigin();
  return [
    { url: `${origin}/` },
    { url: `${origin}/films` },
    { url: `${origin}/methodology` },
    ...filmPackages
      .filter((filmPackage) => filmPackage.film.status === "published")
      .map((filmPackage) => ({ url: `${origin}/films/${filmPackage.film.slug}` })),
  ];
}
