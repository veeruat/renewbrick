import type { Metadata } from "next";
import { absoluteUrl, business, siteConfig } from "@/content/site";
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

/** Organisation data built only from verified fields. */
export function organizationJsonLd() {
  const logo = getLogo("raster") ?? getLogo();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: business.name,
    ...(business.legalName ? { legalName: business.legalName } : {}),
    slogan: business.tagline,
    description: `${business.descriptor} in ${business.serviceAreas.join(" and ")}, ${business.region}.`,
    url: absoluteUrl("/"),
    ...(logo ? { logo: absoluteUrl(logo.src) } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.email ? { email: business.email } : {}),
    areaServed: business.serviceAreas.map((city) => ({
      "@type": "City",
      name: city,
      containedInPlace: { "@type": "State", name: business.region },
    })),
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
