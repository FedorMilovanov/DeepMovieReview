import { homepageFeaturedFilmSlug, isPreviewContentEnabled } from "@/data/site-config";
import { requireFilmPackageBySlug } from "@/data/film-registry";
import { canIndexSite, resolveIndexingRequest } from "./site-publication-policy";

/**
 * One answer to «may search engines index this build?», composed once.
 *
 * Layout, robots, sitemap and both film pages used to re-derive it from three
 * inputs each, and the film pages got the last word wrong: a published page on a
 * preview deployment returned `robots: undefined`, which dropped the layout's
 * `noindex` and left the page indexable at the page level while `robots.txt` said
 * otherwise. A single function cannot disagree with itself.
 */
export function siteIndexingEnabled(): boolean {
  return canIndexSite({
    siteIndexingRequested: resolveIndexingRequest(),
    previewContentEnabled: isPreviewContentEnabled(),
    homepageStatus: requireFilmPackageBySlug(homepageFeaturedFilmSlug).film.status,
  });
}
