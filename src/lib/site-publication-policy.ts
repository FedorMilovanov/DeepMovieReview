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
 * treated as public, because nobody should have to set a variable to be found.
 *
 * A Vercel preview deployment is a hard floor, not a default: even a stray
 * `DMR_SITE_INDEXING_ENABLED=true` in its environment cannot open one. A build
 * that enables preview content is also closed by `canIndexSite`. Other preview
 * hosts must explicitly set `DMR_SITE_INDEXING_ENABLED=false`; a configured
 * `DMR_SITE_URL` otherwise opts in by default. The flag wins on other hosts.
 */
export function resolveIndexingRequest(
  env: Record<string, string | undefined> = process.env,
): boolean {
  // A Vercel preview deployment never indexes, whatever the flag says.
  if (env.VERCEL_ENV?.trim().toLowerCase() === "preview") return false;

  const explicit = env.DMR_SITE_INDEXING_ENABLED?.trim().toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;

  // Zero-config default: a real host is known, so the site is public.
  return Boolean(env.DMR_SITE_URL?.trim() || env.VERCEL_PROJECT_PRODUCTION_URL?.trim());
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
  rawValue?: string,
  deploymentHost?: string,
  // Injected rather than captured in a default parameter: a test that passes
  // `undefined` must test the fallback, not inherit whatever the CI job exports.
  env: Record<string, string | undefined> = process.env,
): string {
  const explicit = rawValue ?? env.DMR_SITE_URL;
  const host = deploymentHost ?? env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL;
  const candidate = explicit?.trim() || (host?.trim() ? `https://${host.trim()}` : "http://localhost:3000");
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
