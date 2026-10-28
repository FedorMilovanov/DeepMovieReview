import type { ProductionDossier } from "../../lib/production-dossier";
import { theTrumanShowProductionDossier } from "./the-truman-show-production";

/**
 * Production dossiers, keyed by film slug.
 *
 * Relative imports on purpose: the regression suite compiles this file outside
 * of Next's path aliases, and a dossier that cannot be validated by the tests is
 * just a very confident blog post.
 */
export const productionDossiers: Array<{ slug: string; dossier: ProductionDossier }> = [
  { slug: "the-truman-show", dossier: theTrumanShowProductionDossier },
];

export function getProductionDossier(slug: string): ProductionDossier | undefined {
  return productionDossiers.find((entry) => entry.slug === slug)?.dossier;
}
