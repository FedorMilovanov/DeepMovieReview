import type { FilmPackage } from "./film-package";
import type { VisualAssetManifest } from "./visual-assets";

/**
 * Machine-readable page identity.
 *
 * Two rules decide what may appear here, and both come from `docs/20` §5:
 *
 *   1. metadata is **spoiler-safe**: a description may only carry a premise or a
 *      standfirst, never the ending and never a module conclusion;
 *   2. metadata describes **this page**, not the site. Without a page-level
 *      `openGraph`, Next inherits the layout's card and every shared link turns
 *      into the same generic «Глубокие воды» block.
 *
 * The builders are pure so the rule can be tested: `generateMetadata` only
 * adds routing concerns (canonical URL, robots) on top of these objects.
 */

export type ShareImage = { url: string; width: number; height: number; alt: string };

/**
 * Share art is declared once. A page-level `openGraph` object replaces the
 * layout's object wholesale — Next does not deep-merge it — so a page that sets
 * its own title must repeat `images` or the card silently loses its artwork.
 * Per-film share art is a production task; until it exists every page uses the
 * site card rather than shipping a broken one.
 */
export const SITE_SHARE_IMAGE: ShareImage = {
  url: "/og-home.png",
  width: 1200,
  height: 630,
  alt: "Deep Waters / Глубокие воды — исследование кино через библейскую картину мира",
};

/**
 * A film's own card, taken from its visual-asset manifest rather than typed in
 * twice. Only a declared `share-card` variant can become `og:image`; an asset
 * without one leaves the page on the site card instead of shipping a guess.
 */
export function shareImageFromAsset(manifest: VisualAssetManifest): ShareImage | undefined {
  const variant = manifest.variants.find((candidate) => candidate.purpose === "share-card");
  if (!variant || !manifest.alt.trim()) return undefined;
  return { url: variant.src, width: variant.width, height: variant.height, alt: manifest.alt };
}

/**
 * The image a page shows at the top of itself: a hero, not a card.
 *
 * Prefers the widest `display` variant so the browser has room to choose, and
 * refuses an asset without a declared display variant rather than guessing at
 * one — the same rule the share card follows.
 */
export type PageHeroImage = {
  /** The fallback the `<img>` always points at. */
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Format-negotiated sources for `<picture>`, best first. */
  sources: Array<{ src: string; type: string; width: number; height: number }>;
};

const MIME: Record<string, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
};

/**
 * Hero from the largest display variants.
 *
 * Preference order is by weight, not by novelty: AVIF is ~50 % smaller than JPEG
 * for the same pixels, but the `<img>` fallback is always a format every browser
 * can decode. The share card deliberately does **not** do this — social scrapers
 * still do not reliably read AVIF, so `og:image` stays JPEG. A picture that looks
 * good and cannot be embedded is not a share card.
 */
export function heroImageFromAsset(manifest: VisualAssetManifest): PageHeroImage | undefined {
  const display = manifest.variants
    .filter((variant) => variant.purpose === "display")
    .sort((a, b) => b.width - a.width);
  const widest = display[0]?.width ?? 0;
  const atBestWidth = display.filter((variant) => variant.width === widest);
  const fallback =
    atBestWidth.find((variant) => variant.format === "jpg" || variant.format === "png") ??
    atBestWidth[0];
  if (!fallback || !manifest.alt.trim()) return undefined;
  return {
    src: fallback.src,
    width: fallback.width,
    height: fallback.height,
    alt: manifest.alt,
    sources: atBestWidth
      .filter((variant) => variant.format === "avif" || variant.format === "webp")
      .map((variant) => ({
        src: variant.src,
        type: MIME[variant.format],
        width: variant.width,
        height: variant.height,
      })),
  };
}

export type PageMetadataView = {
  title: string;
  description: string;
  openGraph: {
    type: "website" | "article";
    siteName: string;
    locale: string;
    url: string;
    title: string;
    description: string;
    images: ShareImage[];
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
};

function card(
  title: string,
  description: string,
  url: string,
  type: PageMetadataView["openGraph"]["type"],
  shareImage: ShareImage = SITE_SHARE_IMAGE,
): PageMetadataView {
  return {
    title,
    description,
    openGraph: {
      type,
      siteName: "Глубокие воды",
      locale: "ru_RU",
      url,
      title,
      description,
      images: [shareImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [shareImage.url] },
  };
}

/**
 * Two budgets this file has to respect, and neither of them is ours.
 *
 * A tab and a search result give a page about 55–60 characters of headline; the
 * layout then appends « · Глубокие воды» (16 more). A snippet gets about 160
 * characters. Both are truncation points, not suggestions: a title that runs to
 * 127 characters is not a longer title, it is a title whose second half nobody
 * reads.
 */
export const TITLE_BUDGET = 49;
export const DESCRIPTION_BUDGET = 160;
const MIN_USEFUL_SNIPPET = 60;

/** Trim a headline at a word boundary, never in the middle of a word. */
export function fitTitle(headline: string, budget = TITLE_BUDGET): string {
  if (headline.length <= budget) return headline;
  const cut = headline.slice(0, budget - 1);
  const atWord = cut.replace(/[\s,:;—–-]+[^\s,:;—–-]*$/, "").trimEnd();
  return `${atWord || cut.trimEnd()}…`;
}

/**
 * Trim a description at a sentence boundary when one falls inside the budget,
 * and at a word boundary otherwise.
 *
 * Sentences are kept whole when they fit, because a snippet cut mid-clause reads
 * like a broken sentence, while a snippet that ends with a full stop reads like
 * it said what it meant.
 */
export function fitDescription(text: string, budget = DESCRIPTION_BUDGET): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= budget) return clean;

  // Pack whole sentences while they fit. A snippet that ends on a full stop
  // reads as if it said what it meant; one cut mid-clause reads as broken.
  let packed = "";
  for (const sentence of clean.match(/[^.!?]+[.!?]+/g) ?? []) {
    const candidate = `${packed} ${sentence.trim()}`.trim();
    if (candidate.length > budget) break;
    packed = candidate;
  }
  if (packed.length >= MIN_USEFUL_SNIPPET) return packed;

  // Otherwise fall back to the longest phrase that fits, and mark the cut.
  const atWord = clean.slice(0, budget - 1).replace(/\s+\S*$/, "").trimEnd();
  return `${atWord}…`;
}

/** Description for the film page. Draft states are described, never quoted. */
export function describeFilmPackage(filmPackage: FilmPackage): string {
  const { film } = filmPackage;
  if (film.status === "published") return `${film.title} (${film.year}) — ${film.premise}`;
  if (filmPackage.ingest?.edition.state === "LOCKED") {
    return `${film.title} — канонический разбор, привязанный к точному просмотренному мастеру (${film.year}); публикация ещё не открыта.`;
  }
  if (filmPackage.research?.state === "SECONDARY_SOURCES") {
    return `${film.title} — исследовательский черновик по вторичным источникам; точный просмотренный мастер ещё не заблокирован.`;
  }
  return `${film.title} — структурная фикстура платформы «Глубокие воды».`;
}

export function filmPageMetadata(
  filmPackage: FilmPackage,
  shareImage?: ShareImage,
): PageMetadataView {
  const { film } = filmPackage;
  return card(film.title, describeFilmPackage(filmPackage), `/films/${film.slug}`, "article", shareImage);
}

/**
 * Description for the article page.
 *
 * Only the standfirst is allowed here: it is written to be read before the
 * first section, so it cannot spoil the film. Section text never reaches
 * metadata — a summary of section 9 under a share card would be a spoiler with
 * no spoiler control next to it.
 */
/**
 * Description for the production dossier.
 *
 * Safe by construction: the dossier's standfirst is written to be read before
 * the film, and unlike the article there is no section above `NONE` to leak —
 * production history does not describe what happens on screen.
 */
export function productionPageMetadata(
  filmPackage: FilmPackage,
  dossier: { title: string; standfirst: string; seoTitle?: string; seoDescription?: string },
  shareImage?: ShareImage,
): PageMetadataView {
  return card(
    // The dossier's own headline is an editorial sentence, not a label: at 127
    // characters it is far past the point where a tab stops showing it. An
    // explicit `seoTitle` wins; without one the headline is fitted to budget.
    fitTitle(dossier.seoTitle ?? `${dossier.title} — «${filmPackage.film.title}»`),
    fitDescription(dossier.seoDescription ?? dossier.standfirst),
    `/films/${filmPackage.film.slug}/making`,
    "article",
    shareImage,
  );
}

export function articlePageMetadata(
  filmPackage: FilmPackage,
  shareImage?: ShareImage,
): PageMetadataView | undefined {
  const { article, film } = filmPackage;
  if (!article) return undefined;
  // The article headline already names the film ("Шоу Трумана: человек,
  // который заметил камеру"). Appending the film again produced a 90-character
  // title whose second half repeated its first — so the film name is only added
  // when the headline does not carry it.
  const headline =
    article.seoTitle ??
    (article.title.includes(film.title)
      ? `${article.title} — разбор`
      : `${article.title} — разбор фильма «${film.title}»`);
  return card(
    fitTitle(headline),
    fitDescription(article.seoDescription ?? article.standfirst),
    `/films/${film.slug}/article`,
    "article",
    shareImage,
  );
}
