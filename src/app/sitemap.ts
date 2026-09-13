import type { MetadataRoute } from "next";
import { filmPackages, requireFilmPackageBySlug } from "@/data/film-registry";
import { homepageFeaturedFilmSlug, isPreviewContentEnabled } from "@/data/site-config";
import { canIndexSite } from "@/lib/site-publication-policy";

function siteOrigin() {
  return (process.env.DMR_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homepageFilmPackage = requireFilmPackageBySlug(homepageFeaturedFilmSlug);
  const previewContentEnabled = isPreviewContentEnabled();
  const indexingEnabled = canIndexSite({
    siteIndexingRequested: process.env.DMR_SITE_INDEXING_ENABLED === "true",
    previewContentEnabled,
    homepageStatus: homepageFilmPackage.film.status,
  });

  if (!indexingEnabled) return [];

  const origin = siteOrigin();
  const staticRoutes = ["/", "/films", "/methodology"];
  const publishedFilmRoutes = filmPackages
    .filter((filmPackage) => filmPackage.film.status === "published")
    .map((filmPackage) => `/films/${filmPackage.film.slug}`);

  return [...staticRoutes, ...publishedFilmRoutes].map((pathname) => ({
    url: `${origin}${pathname}`,
  }));
}
