/**
 * Central business configuration — the single source of truth for every
 * business fact the website publishes.
 *
 * RULES
 * - Only enter details the business owner has verified.
 * - Leave unknown values as `null`. Components hide anything that is null;
 *   nothing is ever invented to fill a gap.
 * - `npm run check:launch` fails while any launch-critical value is missing.
 */

export type Verified<T> = T | null;

export const business = {
  name: "RenewBrick",
  tagline: "Restore & Elevate",
  descriptor: "Property Transformation & Care",

  /**
   * Legal contracting and invoicing entity, exactly as registered
   * (e.g. "Example Ventures Private Limited"). Shown in the footer and terms.
   */
  legalName: null as Verified<string>,

  /** Phone in E.164 format, e.g. "+919876543210". */
  phone: null as Verified<string>,
  /** WhatsApp number in E.164 format. May equal `phone`. */
  whatsapp: null as Verified<string>,
  /** Public enquiry email, e.g. "hello@example.com". */
  email: "renewbrick@gmail.com" as Verified<string>,

  /** Office/registered address — only if the business wants it published. */
  address: null as Verified<string>,

  /**
   * Approved logo supplied by the owner (PNG or SVG) in /public. Its real
   * dimensions are read from the file; if the file is missing, a temporary
   * text wordmark is shown and the launch check fails.
   */
  logoFile: "/brand/renewbrick-logo.png" as Verified<string>,

  serviceAreas: ["Hyderabad", "Warangal"] as const,
  region: "Telangana",
  country: "IN",

  /** Approved social profile URLs, used for structured data `sameAs`. */
  socialProfiles: [] as string[],
} as const;

/**
 * Policy answers the business has not yet confirmed. Copy that depends on
 * them is written neutrally ("we'll confirm before…") and listed here so the
 * launch check can surface it.
 */
export const pendingPolicies = [
  "Inspection fee policy: free or charged, and whether a fee is adjusted against work.",
  "Estimate format: itemised labour / materials / specialist charges as standard practice.",
  "Payment schedule and accepted payment methods.",
  "Workmanship warranty or defect-liability period, if any.",
  "Annual maintenance plans: whether offered, what they include, and how they are priced.",
  "Property management: launch status and scope.",
  "Whether customers may supply their own materials.",
  "Cancellation and rescheduling terms for inspections and work.",
  "How long enquiry messages and photos are kept (retention period).",
] as const;

export const siteConfig = {
  /** Canonical origin without trailing slash. Set SITE_URL in each environment. */
  url: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /**
   * Search indexing is OFF unless SITE_INDEXING=true at build time.
   * Keep it off for previews and staging; turn it on only for production.
   */
  indexable: process.env.SITE_INDEXING === "true",
  locale: "en_IN",
} as const;

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path === "/" ? "" : path}`;
}
