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

/**
 * The cover of Film 001's production dossier: a 16:9 hero.
 *
 * Three separate battle rounds were run for this one page — a dome under
 * construction, a stack of screenplays turning into a town, and the town seen
 * from above at dusk. The second was chosen, and the choice is recorded here
 * rather than in a commit message, because the picture is now part of the
 * document's provenance.
 *
 * It is a hero, not a social card, but it carries its own `share-card` variant:
 * the dossier shares as itself, not as the film, and a reader who clicks a link
 * about the making of the film should land on a picture about the making.
 */
export const trumanMakingCoverAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "truman-making-cover-01",
  filmSlug: "the-truman-show",
  role: "hero",
  title: "«Шоу Трумана» — обложка производственного досье",
  alt: "Стопка сценариев на тёмном столе под лампой; страницы стекают вниз и превращаются в макет идеального пригорода, перед которым выстроился ряд режиссёрских кресел; на верхней странице — камера-пресс-папье и пустая латунная табличка.",
  aspectRatio: 16 / 9,
  focalPoint: { x: 0.5, y: 0.52 },
  mobileFocalPoint: { x: 0.55, y: 0.5 },
  textSafeZones: [{ x: 0.03, y: 0.04, width: 0.4, height: 0.22 }],
  subjectSafeZone: { x: 0.1, y: 0.1, width: 0.72, height: 0.8 },
  palette: {
    background: "#14110f",
    foreground: "#efe7d6",
    fractureAccent: "#8f2027",
    restorationAccent: "#b9925b",
  },
  variants: [
    {
      id: "truman-making-share-1200",
      purpose: "share-card",
      src: "/og/truman-making-share.jpg",
      format: "jpg",
      width: 1200,
      height: 675,
      byteSize: 140181,
    },
    {
      id: "truman-making-display-1280",
      purpose: "display",
      src: "/og/truman-making-wide.jpg",
      format: "jpg",
      width: 1280,
      height: 720,
      byteSize: 156301,
    },
    {
      id: "truman-making-master-1600",
      purpose: "editorial-master",
      src: "/og/truman-making-master.jpg",
      format: "jpg",
      width: 1600,
      height: 900,
      byteSize: 336581,
    },
  ],
  provenance: {
    sourceKind: "generated",
    generator: "Arena.ai image generation, battle mode: three rounds, the editor picked round two (option 2 of 2)",
    promptVersion: "truman-making-cover-v1",
    createdAt: "2026-10-28",
    editorialNotes:
      "Original illustration, 16:9: a stack of screenplays under a work lamp; the pages spill downward and become a maquette of an ideal suburb, with a row of director's chairs lined up in front of it; a lens sits on the top page and the brass nameplate is deliberately blank. Not a still; no performer's likeness is reproduced.",
  },
};

/** Stable order: the registry validator treats this list as the declaration. */
export const filmShareAssets: VisualAssetManifest[] = [
  trumanShowShareAsset,
  trumanMakingCoverAsset,
];

/** Share art for a film's analysis page, when its edition has one. */
export function getFilmShareAsset(filmSlug: string): VisualAssetManifest | undefined {
  return filmShareAssets.find(
    (manifest) => manifest.filmSlug === filmSlug && manifest.role === "social",
  );
}

/**
 * Cover for a film's production dossier.
 *
 * A second picture for the same film, not a copy of the first: the two documents
 * argue different things and the cards should not look interchangeable.
 */
export function getProductionCoverAsset(filmSlug: string): VisualAssetManifest | undefined {
  return filmShareAssets.find(
    (manifest) => manifest.filmSlug === filmSlug && manifest.role === "hero",
  );
}
