import { filmPackages } from "@/data/film-registry";
import { assertValidVisualAssetRegistry } from "@/lib/visual-asset-integrity";
import type { VisualAssetManifest } from "@/lib/visual-assets";

export const fixtureHeroAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "pilot-film-hero-fixture",
  filmSlug: "pilot-film",
  role: "hero",
  title: "Pilot Film hero fixture",
  alt: "Abstract cinematic fixture used to test the Deep Waters visual asset pipeline.",
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
    generator: "Deep Waters shell fixture",
    promptVersion: "fixture-v1",
    editorialNotes: "Placeholder manifest only; referenced files do not represent final art.",
  },
};


/**
 * Phase-A platform art: original cinematic masters for the prelaunch
 * homepage. Anonymous editorial compositions (no film stills, no posters).
 * All masters are 1600x672 (2.39:1 letterbox).
 */
export const heroMasterAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "platform-hero-master",
  role: "hero",
  title: "Platform hero master",
  alt: "Пустой кинозал: луч проектора режет темноту, две фигуры в проходе",
  aspectRatio: 2.381,
  focalPoint: { x: 0.55, y: 0.5 },
  mobileFocalPoint: { x: 0.5, y: 0.6 },
  textSafeZones: [{ x: 0.03, y: 0.08, width: 0.34, height: 0.82 }],
  subjectSafeZone: { x: 0.4, y: 0.3, width: 0.4, height: 0.6 },
  palette: { background: "#050505", foreground: "#f2eee6", fractureAccent: "#8f2027", restorationAccent: "#b9925b" },
  variants: [
    { id: "hero-display-1600", purpose: "display", src: "/art/hero-master.jpg", format: "jpg", width: 1600, height: 672 },
  ],
  provenance: { sourceKind: "generated", generator: "Arena image generation", promptVersion: "phase-a-v1", createdAt: "2026-09-14", editorialNotes: "Original platform art generated for the Phase A homepage; the source session did not record an exact model identifier; not a film still." },
};

export const lensMasterAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "platform-lens-master",
  role: "background",
  title: "Platform six-lenses master",
  alt: "Фигура спиной перед светящимся дверным проёмом в тёмном коридоре",
  decorative: false,
  aspectRatio: 2.381,
  focalPoint: { x: 0.5, y: 0.5 },
  mobileFocalPoint: { x: 0.5, y: 0.55 },
  subjectSafeZone: { x: 0.35, y: 0.15, width: 0.3, height: 0.7 },
  variants: [
    { id: "lens-display-1600", purpose: "display", src: "/art/lens-master.jpg", format: "jpg", width: 1600, height: 672 },
  ],
  provenance: { sourceKind: "generated", generator: "Arena image generation", promptVersion: "phase-a-v1", createdAt: "2026-09-14", editorialNotes: "Original platform art generated for the Phase A homepage; the source session did not record an exact model identifier; not a film still." },
};

export const relationshipMasterAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "platform-relationship-master",
  role: "relationship",
  title: "Platform relationship master",
  alt: "Две фигуры друг против друга, узкая полоса света из приоткрытой двери между ними",
  aspectRatio: 2.381,
  focalPoint: { x: 0.5, y: 0.5 },
  subjectSafeZone: { x: 0.15, y: 0.2, width: 0.7, height: 0.7 },
  variants: [
    { id: "relationship-display-1600", purpose: "display", src: "/art/relationship-master.jpg", format: "jpg", width: 1600, height: 672 },
  ],
  provenance: { sourceKind: "generated", generator: "Arena image generation", promptVersion: "phase-a-v1", createdAt: "2026-09-14", editorialNotes: "Original platform art generated for the Phase A homepage; the source session did not record an exact model identifier; not a film still." },
};

export const autopsyMasterAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "platform-autopsy-master",
  role: "scene-autopsy",
  title: "Platform scene-autopsy master",
  alt: "Тёмный кабинет: стол с лампой и конвертом, сидящая фигура спиной, приоткрытая дверь",
  aspectRatio: 2.381,
  focalPoint: { x: 0.55, y: 0.55 },
  mobileFocalPoint: { x: 0.6, y: 0.55 },
  subjectSafeZone: { x: 0.35, y: 0.3, width: 0.55, height: 0.55 },
  variants: [
    { id: "autopsy-display-1600", purpose: "display", src: "/art/autopsy-master.jpg", format: "jpg", width: 1600, height: 672 },
  ],
  anchors: [
    { id: "autopsy-envelope", label: "Конверт на столе", point: { x: 0.62, y: 0.67 }, safeLabelPositions: ["top", "left"] },
    { id: "autopsy-lamp", label: "Лампа", point: { x: 0.42, y: 0.52 }, safeLabelPositions: ["top", "right"] },
    { id: "autopsy-door", label: "Приоткрытая дверь", point: { x: 0.9, y: 0.42 }, safeLabelPositions: ["left", "bottom"] },
  ],
  provenance: { sourceKind: "generated", generator: "Arena image generation", promptVersion: "phase-a-v1", createdAt: "2026-09-14", editorialNotes: "Original platform art generated for the Phase A homepage; the source session did not record an exact model identifier; not a film still." },
};

export const decisionMasterAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "platform-decision-master",
  role: "decision",
  title: "Platform decision master",
  alt: "Тёмный коридор с развилкой: холодная дверь слева, тёплая справа, фигура на распутье",
  aspectRatio: 2.381,
  focalPoint: { x: 0.55, y: 0.55 },
  subjectSafeZone: { x: 0.3, y: 0.25, width: 0.45, height: 0.65 },
  variants: [
    { id: "decision-display-1600", purpose: "display", src: "/art/decision-master.jpg", format: "jpg", width: 1600, height: 672 },
  ],
  provenance: { sourceKind: "generated", generator: "Arena image generation", promptVersion: "phase-a-v1", createdAt: "2026-09-14", editorialNotes: "Original platform art generated for the Phase A homepage; the source session did not record an exact model identifier; not a film still." },
};

export const craftMasterAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "platform-craft-master",
  role: "character",
  title: "Platform craft master",
  alt: "Крупный план лица в тёплом контровом свете на чёрном фоне",
  aspectRatio: 2.381,
  focalPoint: { x: 0.35, y: 0.5 },
  mobileFocalPoint: { x: 0.35, y: 0.5 },
  subjectSafeZone: { x: 0.05, y: 0.1, width: 0.55, height: 0.8 },
  variants: [
    { id: "craft-display-1600", purpose: "display", src: "/art/craft-master.jpg", format: "jpg", width: 1600, height: 672 },
  ],
  provenance: { sourceKind: "generated", generator: "Arena image generation", promptVersion: "phase-a-v1", createdAt: "2026-09-14", editorialNotes: "Original platform art generated for the Phase A homepage; the source session did not record an exact model identifier; not a film still." },
};

export const discoveryMasterAsset: VisualAssetManifest = {
  schemaVersion: 1,
  id: "platform-discovery-master",
  role: "topic",
  title: "Platform discovery master",
  alt: "Светящаяся стена контакт-листов с кинокадрами, рука с лупой",
  aspectRatio: 2.381,
  focalPoint: { x: 0.35, y: 0.45 },
  mobileFocalPoint: { x: 0.35, y: 0.45 },
  subjectSafeZone: { x: 0.02, y: 0.05, width: 0.65, height: 0.9 },
  variants: [
    { id: "discovery-display-1600", purpose: "display", src: "/art/discovery-master.jpg", format: "jpg", width: 1600, height: 672, byteSize: 226967 },
  ],
  provenance: { sourceKind: "generated", generator: "Arena image generation", promptVersion: "phase-a-v1", createdAt: "2026-09-14", editorialNotes: "Original platform art generated for the Phase A homepage; the source session did not record an exact model identifier; not a film still." },
};

const rawVisualAssetManifests: VisualAssetManifest[] = [fixtureHeroAsset, heroMasterAsset, lensMasterAsset, relationshipMasterAsset, autopsyMasterAsset, decisionMasterAsset, craftMasterAsset, discoveryMasterAsset];
const knownFilmSlugs = filmPackages.map((filmPackage) => filmPackage.film.slug);

assertValidVisualAssetRegistry(rawVisualAssetManifests, knownFilmSlugs);

/** Canonical validated read surface for visual assets. */
export const visualAssetManifests = rawVisualAssetManifests;

export function getVisualAssetManifest(id: string) {
  return visualAssetManifests.find((manifest) => manifest.id === id);
}
