import type { MetadataRoute } from "next";
import { legalStatus } from "@/content/legal";
import { locations } from "@/content/locations";
import { servicePath, services } from "@/content/services";
import { absoluteUrl } from "@/content/site";

/** Canonical, indexable URLs only. Draft legal pages are excluded until approved. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...services.map((s) => servicePath(s.slug)),
    ...locations.map((l) => `/locations/${l.slug}`),
    "/about",
    "/contact",
    "/faq",
    ...(legalStatus.privacy.approved ? ["/privacy-policy"] : []),
    ...(legalStatus.terms.approved ? ["/terms"] : []),
  ];
  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
