import type { VisualAssetManifest } from "@/lib/visual-assets";
import { validateVisualAssetManifest } from "@/lib/visual-assets";

function duplicateIds(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function validateVisualAssetRegistry(
  manifests: VisualAssetManifest[],
  knownFilmSlugs?: Iterable<string>,
): string[] {
  const errors: string[] = [];
  const filmSlugs = knownFilmSlugs ? new Set(knownFilmSlugs) : undefined;

  for (const id of duplicateIds(manifests.map((manifest) => manifest.id))) {
    errors.push(`registry: duplicate visual manifest id "${id}".`);
  }

  for (const manifest of manifests) {
    if (filmSlugs && manifest.filmSlug && !filmSlugs.has(manifest.filmSlug)) {
      errors.push(`${manifest.id}: unknown film slug "${manifest.filmSlug}".`);
    }

    errors.push(
      ...validateVisualAssetManifest(manifest).map((error) => `${manifest.id}: ${error}`),
    );
  }

  return errors;
}

export function assertValidVisualAssetRegistry(
  manifests: VisualAssetManifest[],
  knownFilmSlugs?: Iterable<string>,
): void {
  const errors = validateVisualAssetRegistry(manifests, knownFilmSlugs);
  if (errors.length > 0) {
    throw new Error(
      `Invalid visual asset registry:\n${errors.map((error) => `- ${error}`).join("\n")}`,
    );
  }
}
