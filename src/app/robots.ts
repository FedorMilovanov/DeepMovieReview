import type { MetadataRoute } from "next";
import { resolveSiteOrigin } from "@/lib/site-publication-policy";
import { siteIndexingEnabled } from "@/lib/site-indexing";

export default function robots(): MetadataRoute.Robots {
  const indexingEnabled = siteIndexingEnabled();

  if (!indexingEnabled) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const origin = resolveSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/labs/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
