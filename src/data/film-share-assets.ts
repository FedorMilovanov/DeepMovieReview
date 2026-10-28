import type { VisualAssetManifest } from "../lib/visual-assets";

/**
 * Share art declared per film.
 *
 * Kept in its own module with relative imports so the regression suite can load
 * it: the app-side registry pulls `@/data/film-registry`, which the test build
 * (plain `tsc` without path aliases) cannot resolve. One declaration, two
 * readers — the visual-asset registry for validation, the pages for metadata.
 */

/**
 * Share art for Film 001.
 *
 * An original illustration, not a still: no frame of the film is reproduced and
 * no actor's likeness is used, so it can be published under the site's own
 * rights. Every variant shares the manifest aspect ratio (40:21) because the
 * registry rejects a card that does not match its own declared shape, and a
 * `display` variant available to LITE is required for the static fallback.
 */
export const trumanShowShareAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "truman-show-share-01",
  filmSlug: "the-truman-show",
  role: "social",
  title: "«Шоу Трумана» — карточка разбора",
  alt: "Человек с чемоданом стоит спиной к зрителю на пустой улице под огромным искусственным небом; в конце улицы — проём яркого света, в сумерках вокруг мерцают объективы камер.",
  aspectRatio: 40 / 21,
  focalPoint: { x: 0.42, y: 0.55 },
  mobileFocalPoint: { x: 0.45, y: 0.5 },
  textSafeZones: [{ x: 0.02, y: 0.6, width: 0.28, height: 0.36 }],
  subjectSafeZone: { x: 0.3, y: 0.32, width: 0.24, height: 0.66 },
  palette: {
    background: "#14110f",
    foreground: "#efe7d6",
    fractureAccent: "#8f2027",
    restorationAccent: "#b9925b",
  },
  variants: [
    {
      id: "truman-share-card-1200",
      purpose: "share-card",
      src: "/og/truman-show-share.jpg",
      format: "jpg",
      width: 1200,
      height: 630,
      byteSize: 124314,
    },
    {
      id: "truman-share-display-1280",
      purpose: "display",
      src: "/og/truman-show-wide.jpg",
      format: "jpg",
      width: 1280,
      height: 672,
      byteSize: 141020,
    },
    {
      id: "truman-share-master-2048",
      purpose: "editorial-master",
      src: "/og/truman-show-master.jpg",
      format: "jpg",
      width: 2048,
      height: 1075,
      byteSize: 498059,
    },
  ],
  provenance: {
    sourceKind: "generated",
    generator: "Arena.ai image generation, battle mode: two candidates, the editor picked the first",
    promptVersion: "truman-share-v1",
    createdAt: "2026-10-28",
    editorialNotes:
      "Original illustration: an artificial dome-sky over an impeccable suburb, a man seen from behind with a suitcase, a staircase of light at the end of the street, camera lenses glinting in the architecture. Not a still; the figure is anonymous and no performer's likeness is reproduced.",
  },
};

/** Stable order: the registry validator treats this list as the declaration. */
export const filmShareAssets: VisualAssetManifest[] = [trumanShowShareAsset];

/** Share art for a film, when its edition has one. */
export function getFilmShareAsset(filmSlug: string): VisualAssetManifest | undefined {
  return filmShareAssets.find(
    (manifest) => manifest.filmSlug === filmSlug && manifest.role === "social",
  );
}
