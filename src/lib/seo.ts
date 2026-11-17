import type { Metadata } from "next";
import { absoluteUrl, business, serviceAreaList, siteConfig } from "@/content/site";
import { jobPath, jobs } from "@/content/jobs";
import { servicePath, services } from "@/content/services";
import { getLogo } from "@/lib/logo";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** Force noindex regardless of environment (drafts, confirmation pages). */
  noindex?: boolean;
  /** Use the title as-is, without the "| RenewBrick" suffix. */
  absoluteTitle?: boolean;
};

export function pageMetadata({ title, description, path, noindex, absoluteTitle }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: business.name,
      locale: siteConfig.locale,
    },
    twitter: { card: "summary_large_image", title, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Serialises JSON-LD safely for inline <script> tags. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * The business as a local home-improvement company (HomeAndConstructionBusiness,
 * a LocalBusiness type), built only from verified fields. It has no published
 * address, so it is described as serving the cities in `areaServed`.
 */
export function organizationJsonLd() {
  const logo = getLogo("raster") ?? getLogo();
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${absoluteUrl("/")}#organization`,
    name: business.name,
    ...(business.legalName ? { legalName: business.legalName } : {}),
    slogan: business.tagline,
    description: `${business.descriptor} in ${serviceAreaList()}.`,
    url: absoluteUrl("/"),
    ...(logo ? { logo: absoluteUrl(logo.src) } : {}),
    image: absoluteUrl("/opengraph-image"),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.email ? { email: business.email } : {}),
    areaServed: business.serviceAreas.map((city) => ({
      "@type": "City",
      name: city,
      containedInPlace: { "@type": "State", name: business.serviceAreaStates[city] },
    })),
    knowsAbout: [...services.filter((s) => s.availability === "available").map((s) => s.name), ...jobs.map((j) => j.name)],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Renovation and property care services",
      itemListElement: [
        ...services
          .filter((s) => s.availability === "available")
          .map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: absoluteUrl(servicePath(s.slug)) } })),
        ...jobs.map((j) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: j.name, url: absoluteUrl(jobPath(j.slug)) } })),
      ],
    },
    ...(business.phone
      ? { contactPoint: { "@type": "ContactPoint", telephone: business.phone, contactType: "customer service", areaServed: "IN" } }
      : {}),
    ...(business.socialProfiles.length ? { sameAs: business.socialProfiles } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
