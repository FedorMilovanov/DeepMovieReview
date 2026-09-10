import type { ExperienceTier } from "@/lib/experience-quality";

export type VisualAssetRole =
  | "hero"
  | "character"
  | "relationship"
  | "scene-autopsy"
  | "decision"
  | "topic"
  | "background"
  | "social";

export type VisualAssetPurpose =
  | "editorial-master"
  | "display"
  | "gpu-texture"
  | "depth-map"
  | "mask"
  | "poster"
  | "share-card";

export type ImageFormat = "avif" | "webp" | "png" | "jpg";

export type NormalizedPoint = {
  x: number;
  y: number;
};

export type NormalizedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VisualAssetVariant = {
  id: string;
  purpose: VisualAssetPurpose;
  src: string;
  format: ImageFormat;
  width: number;
  height: number;
  byteSize?: number;
  media?: string;
  minTier?: ExperienceTier;
};

export type SegmentationMask = {
  id: string;
  label: string;
  src: string;
  format: "png" | "webp";
  semanticRole: "foreground" | "subject" | "background" | "object" | "custom";
};

export type EvidenceAnchor = {
  id: string;
  label: string;
  point: NormalizedPoint;
  safeLabelPositions?: Array<"top" | "right" | "bottom" | "left">;
};

export type VisualArtProvenance = {
  sourceKind: "generated" | "licensed" | "editorial-original" | "fixture";
  generator?: string;
  model?: string;
  promptVersion?: string;
  createdAt?: string;
  sourceReference?: string;
  editorialNotes?: string;
};

export type VisualAssetManifest = {
  schemaVersion: 1;
  id: string;
  filmSlug?: string;
  role: VisualAssetRole;
  title: string;
  alt: string;
  aspectRatio: number;
  focalPoint: NormalizedPoint;
  mobileFocalPoint?: NormalizedPoint;
  textSafeZones?: NormalizedRect[];
  subjectSafeZone?: NormalizedRect;
  palette?: {
    background?: string;
    foreground?: string;
    fractureAccent?: string;
    restorationAccent?: string;
  };
  variants: VisualAssetVariant[];
  depthMap?: VisualAssetVariant;
  masks?: SegmentationMask[];
  anchors?: EvidenceAnchor[];
  provenance: VisualArtProvenance;
};

const TIER_RANK: Record<ExperienceTier, number> = {
  LITE: 0,
  MEDIUM: 1,
  HIGH: 2,
  ULTRA: 3,
};

export function isNormalizedPoint(point: NormalizedPoint): boolean {
  return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

export function isNormalizedRect(rect: NormalizedRect): boolean {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.width >= 0 &&
    rect.height >= 0 &&
    rect.x + rect.width <= 1 &&
    rect.y + rect.height <= 1
  );
}

export function variantAllowedForTier(variant: VisualAssetVariant, tier: ExperienceTier): boolean {
  if (!variant.minTier) return true;
  return TIER_RANK[tier] >= TIER_RANK[variant.minTier];
}

export function chooseDisplayVariant(
  manifest: VisualAssetManifest,
  options: {
    tier: ExperienceTier;
    viewportWidth: number;
    preferredPurpose?: "display" | "gpu-texture";
  },
): VisualAssetVariant | undefined {
  const purpose = options.preferredPurpose ?? (options.tier === "LITE" ? "display" : "gpu-texture");
  const candidates = manifest.variants
    .filter((variant) => variant.purpose === purpose)
    .filter((variant) => variantAllowedForTier(variant, options.tier))
    .sort((a, b) => a.width - b.width);

  if (candidates.length === 0 && purpose === "gpu-texture") {
    return chooseDisplayVariant(manifest, { ...options, preferredPurpose: "display" });
  }

  return candidates.find((variant) => variant.width >= options.viewportWidth) ?? candidates.at(-1);
}

function hasValidDimensions(variant: VisualAssetVariant): boolean {
  return (
    Number.isFinite(variant.width) &&
    Number.isFinite(variant.height) &&
    variant.width > 0 &&
    variant.height > 0
  );
}

export function validateVisualAssetManifest(manifest: VisualAssetManifest): string[] {
  const errors: string[] = [];
  const assetIds = new Set<string>();
  const maskIds = new Set<string>();
  const anchorIds = new Set<string>();

  if (!manifest.id.trim()) errors.push("Manifest id is required.");
  if (!manifest.title.trim()) errors.push("Manifest title is required.");
  if (!manifest.alt.trim()) errors.push("Accessible alt text is required.");
  if (!Number.isFinite(manifest.aspectRatio) || manifest.aspectRatio <= 0) {
    errors.push("aspectRatio must be a positive number.");
  }
  if (!isNormalizedPoint(manifest.focalPoint)) errors.push("focalPoint must use normalized 0..1 coordinates.");
  if (manifest.mobileFocalPoint && !isNormalizedPoint(manifest.mobileFocalPoint)) {
    errors.push("mobileFocalPoint must use normalized 0..1 coordinates.");
  }
  for (const [index, zone] of (manifest.textSafeZones ?? []).entries()) {
    if (!isNormalizedRect(zone)) errors.push(`textSafeZones[${index}] is outside normalized bounds.`);
  }
  if (manifest.subjectSafeZone && !isNormalizedRect(manifest.subjectSafeZone)) {
    errors.push("subjectSafeZone is outside normalized bounds.");
  }

  const hasLiteDisplayFallback = manifest.variants.some(
    (variant) => variant.purpose === "display" && variantAllowedForTier(variant, "LITE"),
  );
  if (!hasLiteDisplayFallback) {
    errors.push("At least one display variant available to LITE is required for static and GPU fallback.");
  }

  for (const variant of manifest.variants) {
    if (!variant.id.trim()) errors.push("Variant id is required.");
    if (assetIds.has(variant.id)) errors.push(`Duplicate asset id: ${variant.id}`);
    assetIds.add(variant.id);
    if (!variant.src.startsWith("/")) errors.push(`Variant ${variant.id} must use an app-root asset path.`);
    if (!hasValidDimensions(variant)) errors.push(`Variant ${variant.id} has invalid dimensions.`);
    if (variant.byteSize !== undefined && (!Number.isFinite(variant.byteSize) || variant.byteSize < 0)) {
      errors.push(`Variant ${variant.id} has invalid byteSize.`);
    }
  }

  if (manifest.depthMap) {
    const depthMap = manifest.depthMap;
    if (!depthMap.id.trim()) errors.push("Depth-map id is required.");
    if (assetIds.has(depthMap.id)) errors.push(`Duplicate asset id: ${depthMap.id}`);
    assetIds.add(depthMap.id);
    if (depthMap.purpose !== "depth-map") errors.push("depthMap must use purpose depth-map.");
    if (!depthMap.src.startsWith("/")) errors.push(`Depth-map ${depthMap.id} must use an app-root asset path.`);
    if (!hasValidDimensions(depthMap)) errors.push(`Depth-map ${depthMap.id} has invalid dimensions.`);
    if (depthMap.byteSize !== undefined && (!Number.isFinite(depthMap.byteSize) || depthMap.byteSize < 0)) {
      errors.push(`Depth-map ${depthMap.id} has invalid byteSize.`);
    }
  }

  for (const mask of manifest.masks ?? []) {
    if (!mask.id.trim()) errors.push("Mask id is required.");
    if (maskIds.has(mask.id)) errors.push(`Duplicate mask id: ${mask.id}`);
    maskIds.add(mask.id);
    if (!mask.label.trim()) errors.push(`Mask ${mask.id} label is required.`);
    if (!mask.src.startsWith("/")) errors.push(`Mask ${mask.id} must use an app-root asset path.`);
  }

  for (const anchor of manifest.anchors ?? []) {
    if (!anchor.id.trim()) errors.push("Anchor id is required.");
    if (anchorIds.has(anchor.id)) errors.push(`Duplicate anchor id: ${anchor.id}`);
    anchorIds.add(anchor.id);
    if (!anchor.label.trim()) errors.push(`Anchor ${anchor.id} label is required.`);
    if (!isNormalizedPoint(anchor.point)) errors.push(`Anchor ${anchor.id} is outside normalized bounds.`);
  }

  return errors;
}
