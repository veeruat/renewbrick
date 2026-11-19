import type { MetadataRoute } from "next";
import { legalStatus } from "@/content/legal";
import { jobPath, jobs } from "@/content/jobs";
import { locations } from "@/content/locations";
import { servicePath, services } from "@/content/services";
import { absoluteUrl } from "@/content/site";

export const dynamic = "force-static";

/** Canonical, indexable URLs only. Draft legal pages are excluded until approved. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...services.map((s) => servicePath(s.slug)),
    ...jobs.map((j) => jobPath(j.slug)),
    ...locations.map((l) => `/locations/${l.slug}`),
    "/about",
    "/contact",
    "/faq",
    ...(legalStatus.privacy.approved ? ["/privacy-policy"] : []),
    ...(legalStatus.terms.approved ? ["/terms"] : []),
  ];
  const lastModified = new Date();
  return paths.map((path) => ({ url: absoluteUrl(path), lastModified }));
}
