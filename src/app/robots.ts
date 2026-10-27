import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/content/site";

/**
 * Production (SITE_INDEXING=true): allow crawling, point to the sitemap.
 * Anything else (local, preview, staging): disallow everything.
 */
export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/contact/received"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
