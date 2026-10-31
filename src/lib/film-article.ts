import type { ArticleBlock, ArticleSection, FilmArticle } from "@/lib/film-package";
import { canRevealSpoiler, type SpoilerLevel } from "./spoilers";

/**
 * Reading projection for the article layer.
 *
 * Section levels are validated to be monotone (see `film-article-integrity.ts`),
 * so spoiler gating always hides a *suffix* of the article. A reader who asked
 * for no spoilers gets the opening argument and a count of what is withheld —
 * never a text with holes in the middle.
 */

/**
 * Presentation-neutral shape of one measured row. The data layer formats it
 * (thousand separators, plurals, timecodes); the view only draws it.
 */
export type ArticleMeasurementView = {
  /** What the measurement is about, e.g. "Возвращение отца". */
  title: string;
  /** The headline figure, already formatted. */
  primary: string;
  /** The supporting figure, already formatted. */
  secondary: string;
  /** Where in the master, and how long. */
  detail: string;
};

export type ArticleProjection = {
  visibleSections: ArticleSection[];
  hiddenSections: number;
  /** Level the reader would need to see the next hidden section. */
  nextHiddenLevel?: SpoilerLevel;
};

export function projectArticleSections(
  article: FilmArticle,
  current: SpoilerLevel,
  options: { stills?: boolean } = {},
): ArticleProjection {
  const visibleSections = article.sections
    .filter((section) => canRevealSpoiler(current, section.spoilerLevel))
    .map((section) =>
      options.stills === false
        ? {
            ...section,
            blocks: section.blocks.map((block) =>
              block.kind === "timeline"
                ? {
                    ...block,
                    // The anchor stays, the picture goes: a timecode is a claim the
                    // edition can support, a frame is a right it may not hold.
                    items: block.items.map((item) => ({
                      id: item.id,
                      timestampSeconds: item.timestampSeconds,
                      label: item.label,
                      evidenceId: item.evidenceId,
                    })),
                  }
                : block,
            ),
          }
        : section,
    );
  const hidden = article.sections.slice(visibleSections.length);
  return {
    visibleSections,
    hiddenSections: hidden.length,
    nextHiddenLevel: hidden[0]?.spoilerLevel,
  };
}

function blockProse(block: ArticleBlock): string {
  switch (block.kind) {
    case "illustration":
      // The current view renders an image and alt text, not the stored caption.
      return "";
    case "paragraph":
    case "aside":
    case "subhead":
    case "pullquote":
    case "measurement":
      return block.text;
    case "timeline":
      return block.items.map((item) => item.label).join(" ");
    case "measurement-table":
      return block.caption;
    case "corrections":
      return [block.caption, ...block.rows.flatMap((row) => [row.commonClaim, row.onScreen])].join(" ");
    case "duel":
      return [block.question, ...block.sides.map((side) => side.reading), block.open].join(" ");
  }
}

export function countArticleWords(article: FilmArticle, projection?: ArticleProjection): number {
  const sections = projection?.visibleSections ?? article.sections;
  const complete = !projection || projection.hiddenSections === 0;
  const text = [
    article.title,
    article.standfirst,
    ...sections.flatMap((section) => [
      section.heading,
      section.standfirst ?? "",
      ...section.blocks.map(blockProse),
    ]),
    complete ? article.closing?.text ?? "" : "",
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Approximate main-prose reading time at 150 words per minute, after projection. */
export function articleReadingMinutes(article: FilmArticle, projection?: ArticleProjection): number {
  return Math.max(1, Math.round(countArticleWords(article, projection) / 150));
}
