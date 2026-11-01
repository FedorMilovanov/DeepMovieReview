import type { VisualAssetManifest } from "../lib/visual-assets";

/** Film-specific homepage art is conceptual illustration, never film evidence. */
export const trumanHomeAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "truman-home-illustration",
  filmSlug: "the-truman-show",
  role: "hero",
  title: "Улица под студийным светом",
  alt: "Редакционная иллюстрация: человек с портфелем идёт по тихой улице, над домами виден студийный осветительный прибор.",
  aspectRatio: 1376 / 768,
  focalPoint: { x: 0.65, y: 0.5 },
  mobileFocalPoint: { x: 0.65, y: 0.5 },
  variants: [{
    id: "truman-home-display",
    purpose: "display",
    src: "/art/truman-home-hero.jpg",
    format: "jpg",
    width: 1376,
    height: 768,
    byteSize: 182387,
  }],
  provenance: {
    sourceKind: "generated",
    generator: "Arena.ai image generation; the agent commissioned and corrected the image",
    promptVersion: "truman-home-street-v1",
    createdAt: "2026-10-31",
    editorialNotes: "An anonymous figure in an invented suburb beneath studio lighting. The generated sign lettering was removed, then the image was compressed to JPEG. Not a film frame, actor portrait, set reconstruction or evidence.",
  },
};

export const filmHomeAssets: VisualAssetManifest[] = [trumanHomeAsset];

export function getFilmHomeAsset(slug: string): VisualAssetManifest | undefined {
  return filmHomeAssets.find((asset) => asset.filmSlug === slug);
}
