import { filmPackages } from "@/data/film-registry";
import { assertValidVisualAssetRegistry } from "@/lib/visual-asset-integrity";
import type { VisualAssetManifest } from "@/lib/visual-assets";

export const fixtureHeroAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "pilot-film-hero-fixture",
  filmSlug: "pilot-film",
  role: "hero",
  title: "Pilot Film hero fixture",
  alt: "Abstract cinematic fixture used to test the DeepMovieReview visual asset pipeline.",
  aspectRatio: 2.39,
  focalPoint: { x: 0.58, y: 0.46 },
  mobileFocalPoint: { x: 0.54, y: 0.43 },
  textSafeZones: [
    { x: 0.03, y: 0.08, width: 0.34, height: 0.82 },
  ],
  subjectSafeZone: { x: 0.42, y: 0.12, width: 0.48, height: 0.76 },
  palette: {
    background: "#050505",
    foreground: "#f2eee6",
    fractureAccent: "#8f2027",
    restorationAccent: "#b9925b",
  },
  variants: [
    {
      id: "hero-display-960",
      purpose: "display",
      src: "/fixtures/pilot-film/hero/display-960.avif",
      format: "avif",
      width: 960,
      height: 402,
    },
    {
      id: "hero-display-1600",
      purpose: "display",
      src: "/fixtures/pilot-film/hero/display-1600.avif",
      format: "avif",
      width: 1600,
      height: 669,
    },
    {
      id: "hero-gpu-1280",
      purpose: "gpu-texture",
      src: "/fixtures/pilot-film/hero/gpu-1280.webp",
      format: "webp",
      width: 1280,
      height: 536,
      minTier: "MEDIUM",
    },
    {
      id: "hero-gpu-2048",
      purpose: "gpu-texture",
      src: "/fixtures/pilot-film/hero/gpu-2048.webp",
      format: "webp",
      width: 2048,
      height: 857,
      minTier: "HIGH",
    },
  ],
  depthMap: {
    id: "hero-depth-1280",
    purpose: "depth-map",
    src: "/fixtures/pilot-film/hero/depth-1280.webp",
    format: "webp",
    width: 1280,
    height: 536,
    minTier: "MEDIUM",
  },
  masks: [
    {
      id: "hero-subject-mask",
      label: "Primary subject",
      src: "/fixtures/pilot-film/hero/mask-subject.webp",
      format: "webp",
      semanticRole: "subject",
    },
    {
      id: "hero-foreground-mask",
      label: "Foreground",
      src: "/fixtures/pilot-film/hero/mask-foreground.webp",
      format: "webp",
      semanticRole: "foreground",
    },
  ],
  anchors: [
    {
      id: "hero-primary-subject",
      label: "Primary subject",
      point: { x: 0.64, y: 0.44 },
      safeLabelPositions: ["left", "bottom"],
    },
  ],
  provenance: {
    sourceKind: "fixture",
    generator: "DeepMovieReview shell fixture",
    promptVersion: "fixture-v1",
    editorialNotes: "Placeholder manifest only; referenced files do not represent final art.",
  },
};

const rawVisualAssetManifests: VisualAssetManifest[] = [fixtureHeroAsset];
const knownFilmSlugs = filmPackages.map((filmPackage) => filmPackage.film.slug);

assertValidVisualAssetRegistry(rawVisualAssetManifests, knownFilmSlugs);

/** Canonical validated read surface for visual assets. */
export const visualAssetManifests = rawVisualAssetManifests;

export function getVisualAssetManifest(id: string) {
  return visualAssetManifests.find((manifest) => manifest.id === id);
}
