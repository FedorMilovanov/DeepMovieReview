import type { FilmPackage } from "./film-package";

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

function card(title: string, description: string, url: string, type: PageMetadataView["openGraph"]["type"]): PageMetadataView {
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
      images: [SITE_SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [SITE_SHARE_IMAGE.url] },
  };
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

export function filmPageMetadata(filmPackage: FilmPackage): PageMetadataView {
  const { film } = filmPackage;
  return card(film.title, describeFilmPackage(filmPackage), `/films/${film.slug}`, "article");
}

/**
 * Description for the article page.
 *
 * Only the standfirst is allowed here: it is written to be read before the
 * first section, so it cannot spoil the film. Section text never reaches
 * metadata — a summary of section 9 under a share card would be a spoiler with
 * no spoiler control next to it.
 */
export function articlePageMetadata(filmPackage: FilmPackage): PageMetadataView | undefined {
  const { article, film } = filmPackage;
  if (!article) return undefined;
  return card(
    `${article.title} — разбор фильма «${film.title}»`,
    article.standfirst,
    `/films/${film.slug}/article`,
    "article",
  );
}
