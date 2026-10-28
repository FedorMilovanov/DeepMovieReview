import {
  describeTrumanMeasurement,
  formatMasterTimecode,
  resolveTrumanMeasurement,
} from "@/data/films/the-truman-show-master-windows";
import type { ArticleMeasurementView } from "@/lib/film-article";
import type { ArticleMeasurementRef } from "@/lib/film-package";

/**
 * Measured-dataset registry for film articles.
 *
 * An article never prints a measured number from its own prose: it points at a
 * row of a committed measurement dataset, and this registry resolves that
 * pointer for the matching film. A film with an article but without a registered
 * dataset fails closed at the route instead of rendering blank figures.
 */
export type ArticleMeasurementBundle = {
  describe: (ref: ArticleMeasurementRef) => ArticleMeasurementView | undefined;
  formatTimecode: (seconds: number) => string;
  resolve: (ref: ArticleMeasurementRef) => boolean;
};

const bundles: Record<string, ArticleMeasurementBundle> = {
  "the-truman-show": {
    describe: describeTrumanMeasurement,
    formatTimecode: formatMasterTimecode,
    resolve: (ref) => Boolean(resolveTrumanMeasurement(ref)),
  },
};

export function getArticleMeasurementBundle(slug: string): ArticleMeasurementBundle | undefined {
  return bundles[slug];
}
