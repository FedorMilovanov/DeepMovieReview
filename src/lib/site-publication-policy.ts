export type HomepagePublicationStatus = "fixture" | "draft" | "published";

export type SiteIndexingPolicyInput = {
  siteIndexingRequested: boolean;
  previewContentEnabled: boolean;
  homepageStatus: HomepagePublicationStatus;
};

/**
 * Search indexing is a public-production capability, never a preview capability.
 * A published homepage feature is necessary but not sufficient: preview content
 * must also be disabled so draft/fixture surfaces can never share an indexable build.
 */
export function canIndexSite({
  siteIndexingRequested,
  previewContentEnabled,
  homepageStatus,
}: SiteIndexingPolicyInput): boolean {
  return siteIndexingRequested && !previewContentEnabled && homepageStatus === "published";
}


/**
 * Canonical public origin used by metadata, robots and sitemap.
 * Build-time configuration must be an absolute http(s) URL; paths/query/hash
 * are intentionally discarded so every route composes from one origin.
 */
export function resolveSiteOrigin(rawValue: string | undefined = process.env.DMR_SITE_URL): string {
  const candidate = rawValue?.trim() || "http://localhost:3000";
  const url = new URL(candidate);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("DMR_SITE_URL must use http(s).");
  }
  return url.origin;
}
