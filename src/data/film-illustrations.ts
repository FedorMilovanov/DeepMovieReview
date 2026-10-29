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
export const articleIllustrations: VisualAssetManifest[] = [
  {
    schemaVersion: 1,
    id: "illu-truman-shadows",
    filmSlug: "the-truman-show",
    role: "illustration",
    title: "«Гости»: тени, которые больше людей",
    alt: "Тёмная гостиная: женщина с продуктами, мужчина с поднятой в приветствии рукой и ребёнок у дивана стоят спиной к зрителю; их тени на стене огромны и изображают ценник, марионетку на крестовине и клетку с птицей; в окне — ночное небо со швом.",
    aspectRatio: 3 / 2,
    focalPoint: { x: 0.5, y: 0.45 },
    mobileFocalPoint: { x: 0.45, y: 0.4 },
    palette: {
      background: "#14110f",
      foreground: "#efe7d6",
      fractureAccent: "#8f2027",
      restorationAccent: "#b9925b",
    },
    variants: [
      {
        id: "illu-truman-shadows-800",
        purpose: "display",
        src: "/art/truman-illu-shadows-800.jpg",
        format: "jpg",
        width: 800,
        height: 533,
        byteSize: 62464,
      },
      {
        id: "illu-truman-shadows-800-avif",
        purpose: "display",
        src: "/art/truman-illu-shadows-800.avif",
        format: "avif",
        width: 800,
        height: 533,
        byteSize: 27648,
      },
      {
        id: "illu-truman-shadows-1200",
        purpose: "display",
        src: "/art/truman-illu-shadows-1200.jpg",
        format: "jpg",
        width: 1200,
        height: 800,
        byteSize: 149504,
      },
      {
        id: "illu-truman-shadows-1200-avif",
        purpose: "display",
        src: "/art/truman-illu-shadows-1200.avif",
        format: "avif",
        width: 1200,
        height: 800,
        byteSize: 74752,
      },
      {
        id: "illu-truman-shadows-master",
        purpose: "editorial-master",
        src: "/art/truman-illu-shadows-master.jpg",
        format: "jpg",
        width: 1600,
        height: 1067,
        byteSize: 342016,
      },
    ],
    provenance: {
      sourceKind: "generated",
      generator: "Arena.ai image generation; the editor chose this option in a three-round battle",
      promptVersion: "truman-illu-shadows-v1",
      createdAt: "2026-10-28",
      editorialNotes:
        "Original etching-style drawing: three ordinary people in a warm room, and shadows that are larger than the people and say what their politeness hides — a price tag, a marionette cross, a cage. Not a still; the painted night sky in the window carries the seam from the film's own set.",
    },
  },
  {
    schemaVersion: 1,
    id: "illu-truman-watching",
    filmSlug: "the-truman-show",
    role: "illustration",
    title: "«Все смотрят»: дом, в котором никто не поможет",
    alt: "Дом в разрезе ночью: в каждой комнате свой телевизор с одной и той же картинкой — рука человека, уходящего под воду; старуха за кухонным столом, пара в постели с попкорном, мужчина в ванне, дети на лестнице, двое подростков фотографируют экран телефонами; во дворе чемодан и человек, уходящий прочь.",
    aspectRatio: 3 / 2,
    focalPoint: { x: 0.5, y: 0.5 },
    mobileFocalPoint: { x: 0.4, y: 0.45 },
    palette: {
      background: "#14110f",
      foreground: "#efe7d6",
      fractureAccent: "#8f2027",
      restorationAccent: "#b9925b",
    },
    variants: [
      {
        id: "illu-truman-watching-800",
        purpose: "display",
        src: "/art/truman-illu-watching-800.jpg",
        format: "jpg",
        width: 800,
        height: 533,
        byteSize: 61440,
      },
      {
        id: "illu-truman-watching-800-avif",
        purpose: "display",
        src: "/art/truman-illu-watching-800.avif",
        format: "avif",
        width: 800,
        height: 533,
        byteSize: 29696,
      },
      {
        id: "illu-truman-watching-1200",
        purpose: "display",
        src: "/art/truman-illu-watching-1200.jpg",
        format: "jpg",
        width: 1200,
        height: 800,
        byteSize: 163840,
      },
      {
        id: "illu-truman-watching-1200-avif",
        purpose: "display",
        src: "/art/truman-illu-watching-1200.avif",
        format: "avif",
        width: 1200,
        height: 800,
        byteSize: 87040,
      },
      {
        id: "illu-truman-watching-master",
        purpose: "editorial-master",
        src: "/art/truman-illu-watching-master.jpg",
        format: "jpg",
        width: 1600,
        height: 1067,
        byteSize: 376832,
      },
    ],
    provenance: {
      sourceKind: "generated",
      generator: "Arena.ai image generation, style-matched to the editor's reference; the editor chose this option in a battle",
      promptVersion: "truman-illu-watching-v1",
      createdAt: "2026-10-29",
      editorialNotes:
        "Original etching-style drawing of a cutaway house at night: a television in every room, the same drowning on every screen, and ordinary family life around it — popcorn, a bath, children on the stairs, two teenagers photographing the screen. Outside, a suitcase and a man walking away, ignored. Not a still; no performer's likeness.",
    },
  },
];

export function getArticleIllustration(assetId: string): VisualAssetManifest | undefined {
  return articleIllustrations.find((asset) => asset.id === assetId);
}

/** What the article renderer and the validator both need to know about a picture. */
export type IllustrationView = {
  src: string;
  /** Width descriptors, so a wide screen gets the 1200 file instead of the 800 one. */
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
  sources: Array<{ srcSet: string; type: string }>;
};

/** The article column tops out near 760px; below that the picture is full-bleed. */
const SIZES = "(max-width: 820px) 100vw, 760px";

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
  const raster = display.filter((variant) => variant.format === "jpg" || variant.format === "png");
  const fallback = raster[0] ?? display[0];
  if (!fallback) return undefined;
  const srcSetOf = (variants: typeof display) =>
    variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");
  // One <source> per format, each carrying every width: two separate AVIF
  // entries would make the browser take the first and ignore the large file.
  const sources = ["avif", "webp"].map((format) => {
    const variants = display.filter((variant) => variant.format === format);
    return variants.length ? { srcSet: srcSetOf(variants), type: MIME[format] } : undefined;
  });
  return {
    src: fallback.src,
    srcSet: srcSetOf(raster.length ? raster : display),
    sizes: SIZES,
    width: fallback.width,
    height: fallback.height,
    alt: asset.alt,
    sources: sources.filter((source) => source !== undefined),
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
