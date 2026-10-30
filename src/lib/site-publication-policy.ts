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
 * Whether this build should ask search engines in.
 *
 * The flag is a switch, not a requirement: a real deployment on a real host is
 * treated as public, and a Vercel preview deployment is not, because a preview URL
 * must never compete with the production one in an index. `DMR_SITE_INDEXING_ENABLED`
 * still wins in both directions when someone wants to override that.
 */
export function resolveIndexingRequest(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const explicit = env.DMR_SITE_INDEXING_ENABLED?.trim().toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;

  // Zero-config default: a host is known, and it is not a preview deployment.
  const onRealHost = Boolean(env.DMR_SITE_URL?.trim() || env.VERCEL_PROJECT_PRODUCTION_URL?.trim());
  const previewDeployment = env.VERCEL_ENV?.trim().toLowerCase() === "preview";
  return onRealHost && !previewDeployment;
}

/**
 * Canonical public origin used by metadata, robots and sitemap.
 *
 * `DMR_SITE_URL` is the explicit answer; on a Vercel deployment the platform
 * already knows the production host, so the site does not depend on anyone
 * remembering to set a variable. Paths, query and hash are discarded so every
 * route composes from one origin.
 */
export function resolveSiteOrigin(
  rawValue: string | undefined = process.env.DMR_SITE_URL,
  deploymentHost: string | undefined =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL,
): string {
  const candidate = rawValue?.trim() || (deploymentHost?.trim() ? `https://${deploymentHost.trim()}` : "http://localhost:3000");
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`DMR_SITE_URL must be an absolute http(s) URL, got "${candidate}".`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("DMR_SITE_URL must use http(s).");
  }
  return url.origin;
}
