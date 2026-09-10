/**
 * Editorial site configuration. Change this slug deliberately when a real Film 001
 * package is ready to replace the structural pilot fixture on the homepage.
 */
export const homepageFeaturedFilmSlug = "pilot-film";


/**
 * Drafts and structural fixtures are preview content, not merely noindex pages.
 * They are available in local development and only in production builds that
 * explicitly opt into preview content.
 */
export function isPreviewContentEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DMR_PREVIEW_CONTENT_ENABLED === "true";
}
