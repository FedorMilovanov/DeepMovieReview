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
 * Rights switch for frames of the film.
 *
 * The edition is published, but publishing an analysis is not the same as clearing
 * the right to reproduce frames of the film. Until that clearance exists, stills are
 * served only where the preview gate is open; the article drops the pictures, not the
 * timecodes, so the page stays whole and honest. Clearing rights means setting this
 * to true — one line, no edit to any article.
 */
export const publishedFilmStillsEnabled = false;

export function filmStillsServable(): boolean {
  return publishedFilmStillsEnabled || isPreviewContentEnabled();
}

export function isPreviewContentEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DMR_PREVIEW_CONTENT_ENABLED === "true";
}
