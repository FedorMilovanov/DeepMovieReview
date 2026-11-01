/**
 * Editorial site configuration. Change this slug deliberately when a real Film 001
 * package is ready to replace the structural pilot fixture on the homepage.
 */
export const homepageFeaturedFilmSlug = "the-truman-show";


/**
 * The editor has chosen to show selected low-resolution frames in the analysis.
 * Metadata and credits do not establish rights clearance or independently prove
 * origin from the absent master. The global off switch wins over preview content:
 * set DMR_FILM_STILLS_ENABLED=false for both the build and its running server.
 * This does not make historical files in the public Git repository private.
 */
export const publishedFilmStillsEnabled = true;

export function filmStillsServable(): boolean {
  return publishedFilmStillsEnabled && process.env.DMR_FILM_STILLS_ENABLED !== "false";
}

/**
 * Drafts and structural fixtures are preview content, not merely noindex pages.
 * They are available in local development and only in production builds that
 * explicitly opt into preview content. This never overrides the stills switch.
 */
export function isPreviewContentEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DMR_PREVIEW_CONTENT_ENABLED === "true";
}
