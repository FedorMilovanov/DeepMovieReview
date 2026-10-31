/**
 * Editorial site configuration. Change this slug deliberately when a real Film 001
 * package is ready to replace the structural pilot fixture on the homepage.
 */
export const homepageFeaturedFilmSlug = "the-truman-show";


/**
 * Drafts and structural fixtures are preview content, not merely noindex pages.
 * They are available in local development and only in production builds that
 * explicitly opt into preview content.
 */
/**
 * The editor has chosen to show selected low-resolution frames in the analysis.
 * Their supplied grid/clip metadata and credits do not establish rights clearance
 * or independently prove their origin from the absent master. The switch is
 * reversible; a build with it off must also disable the preview-content bypass.
 */
export const publishedFilmStillsEnabled = true;

export function filmStillsServable(): boolean {
  return publishedFilmStillsEnabled || isPreviewContentEnabled();
}

export function isPreviewContentEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DMR_PREVIEW_CONTENT_ENABLED === "true";
}
