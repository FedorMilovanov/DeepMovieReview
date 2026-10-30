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
 * Publication of frames of the film.
 *
 * Four stills, 800×450, at a 30-second grid, each carrying its second, the master
 * digest and a SHA-256 of the file: a quotation for a critical reading, not a
 * redistribution of the film. The edition is published and the owner asked for the
 * frames, so they are served. The switch stays here, not in a comment, because the
 * decision is reversible in one line and because a build that cannot serve them must
 * drop the pictures rather than ship broken images.
 *
 * The credit line travels with each still and says whose rights these are.
 */
export const publishedFilmStillsEnabled = true;

export function filmStillsServable(): boolean {
  return publishedFilmStillsEnabled || isPreviewContentEnabled();
}

export function isPreviewContentEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DMR_PREVIEW_CONTENT_ENABLED === "true";
}
