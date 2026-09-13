import type { MetadataRoute } from "next";
import { requireFilmPackageBySlug } from "@/data/film-registry";
import { homepageFeaturedFilmSlug, isPreviewContentEnabled } from "@/data/site-config";
import { canIndexSite } from "@/lib/site-publication-policy";

function siteOrigin() {
  return (process.env.DMR_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const homepageFilmPackage = requireFilmPackageBySlug(homepageFeaturedFilmSlug);
  const previewContentEnabled = isPreviewContentEnabled();
  const indexingEnabled = canIndexSite({
    siteIndexingRequested: process.env.DMR_SITE_INDEXING_ENABLED === "true",
    previewContentEnabled,
    homepageStatus: homepageFilmPackage.film.status,
  });

  if (!indexingEnabled) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/labs/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
