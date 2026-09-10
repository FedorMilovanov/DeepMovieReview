export type HomepagePublicationStatus = "fixture" | "draft" | "published";

export type SiteIndexingPolicyInput = {
  siteIndexingRequested: boolean;
  previewContentEnabled: boolean;
  homepageStatus: HomepagePublicationStatus;
};

/**
 * Search indexing is a public-production capability, never a preview capability.
 * A published homepage feature is necessary but not sufficient: preview content
 * must also be disabled so draft/fixture surfaces can never share an indexable build.
 */
export function canIndexSite({
  siteIndexingRequested,
  previewContentEnabled,
  homepageStatus,
}: SiteIndexingPolicyInput): boolean {
  return siteIndexingRequested && !previewContentEnabled && homepageStatus === "published";
}
