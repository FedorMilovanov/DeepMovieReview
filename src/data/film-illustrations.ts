import type { VisualAssetManifest } from "../lib/visual-assets";

/**
 * Illustrations that sit inside the readable layer.
 *
 * Separate from `film-share-assets.ts` on purpose. A share card is artwork for a
 * metadata tag; an illustration is part of the argument and carries a caption in
 * the text. The two are validated differently: a card only has to have the right
 * shape, while an illustration must be *generated* — the site does not publish
 * frames of a film, so an asset that started life as a still cannot become one of
 * these no matter how it is cropped.
 *
 * Every entry is an original drawing commissioned for the article. Where an image
 * quotes a scene, it quotes it the way a caricature quotes a face: recognisably,
 * and without reproducing a frame.
 */
export const articleIllustrations: VisualAssetManifest[] = [];

export function getArticleIllustration(assetId: string): VisualAssetManifest | undefined {
  return articleIllustrations.find((asset) => asset.id === assetId);
}

/** What the article renderer and the validator both need to know about a picture. */
export type IllustrationView = {
  src: string;
  width: number;
  height: number;
  alt: string;
  sources: Array<{ src: string; type: string; width: number; height: number }>;
};

const MIME: Record<string, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
};

/**
 * Display variants for an in-article image.
 *
 * Same shape as the page hero (AVIF first, JPEG as the guaranteed fallback), but
 * the sizes are the article column, not the full viewport, so the largest display
 * variant is used rather than the master.
 */
export function illustrationView(assetId: string): IllustrationView | undefined {
  const asset = getArticleIllustration(assetId);
  if (!asset || !asset.alt.trim()) return undefined;
  const display = asset.variants
    .filter((variant) => variant.purpose === "display")
    .sort((a, b) => a.width - b.width);
  const fallback =
    display.find((variant) => variant.format === "jpg" || variant.format === "png") ?? display[0];
  if (!fallback) return undefined;
  return {
    src: fallback.src,
    width: fallback.width,
    height: fallback.height,
    alt: asset.alt,
    sources: display
      .filter((variant) => variant.format === "avif" || variant.format === "webp")
      .map((variant) => ({
        src: variant.src,
        type: MIME[variant.format],
        width: variant.width,
        height: variant.height,
      })),
  };
}

/** What the integrity validator checks: existence, provenance, alternative text. */
export function illustrationFacts(assetId: string):
  | { alt: string; sourceKind: string; role: string }
  | undefined {
  const asset = getArticleIllustration(assetId);
  if (!asset) return undefined;
  return { alt: asset.alt, sourceKind: asset.provenance.sourceKind, role: asset.role };
}
