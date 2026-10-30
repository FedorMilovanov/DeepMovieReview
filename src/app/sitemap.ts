import type { MetadataRoute } from "next";
import { filmPackages } from "@/data/film-registry";
import { getProductionDossier } from "@/data/films/production-dossiers";
import { resolveSiteOrigin } from "@/lib/site-publication-policy";
import { siteIndexingEnabled } from "@/lib/site-indexing";

export default function sitemap(): MetadataRoute.Sitemap {
  const indexingEnabled = siteIndexingEnabled();

  if (!indexingEnabled) return [];

  const origin = resolveSiteOrigin();
  return [
    { url: `${origin}/` },
    { url: `${origin}/films` },
    { url: `${origin}/methodology` },
    ...filmPackages
      .filter((filmPackage) => filmPackage.film.status === "published")
      .flatMap((filmPackage) => [
        { url: `${origin}/films/${filmPackage.film.slug}` },
        ...(filmPackage.article
          ? [{ url: `${origin}/films/${filmPackage.film.slug}/article` }]
          : []),
        ...(getProductionDossier(filmPackage.film.slug)
          ? [{ url: `${origin}/films/${filmPackage.film.slug}/making` }]
          : []),
      ]),
  ];
}
