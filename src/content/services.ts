/**
 * Service catalogue. Each service page imports its own entry; the homepage,
 * navigation, enquiry form, sitemap and structured data all read from here.
 *
 * `availability`
 *   "available" — presented as an active service with an inspection CTA.
 *   "planned"   — shown with a "Planned" label and a register-interest CTA;
 *                 never presented as bookable.
 * `confirmed` — set to true once the business owner has approved the scope
 *               text below. The launch check fails while any is false.
 */

export type ServiceSlug =
  | "renovation-civil-works"
  | "property-maintenance"
  | "rental-ready"
  | "property-management";

export type Availability = "available" | "planned";

export type Service = {
  slug: ServiceSlug;
  number: string;
  name: string;
  shortName: string;
  availability: Availability;
  confirmed: boolean;
  /** Homepage: the situation the customer is in. */
  need: string;
  /** Homepage: what the service includes, briefly. */
  includes: string[];
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  /** WhatsApp prefill. */
  whatsappMessage: string;
};

export const services: Service[] = [
  {
    slug: "renovation-civil-works",
    number: "01",
    name: "Renovation & Civil Works",
    shortName: "Renovation",
    availability: "available",
    confirmed: false,
    need: "Your home or apartment needs more than a touch-up — worn bathrooms, damp walls, tired floors, or a layout that no longer works.",
    includes: [
      "Home and apartment renovation",
      "Civil repairs and approved modifications",
      "Painting, flooring, tiling and waterproofing",
      "Kitchen and bathroom renovation",
      "Plumbing and electrical coordination",
    ],
    metaTitle: "Home & Apartment Renovation in Hyderabad and Warangal",
    metaDescription:
      "Renovation and civil works for homes and apartments in Hyderabad and Warangal: written scope, estimate and approval before work, coordinated execution, quality checks and handover.",
    headline: "Renovation and civil works, defined in writing and managed to handover.",
    intro:
      "From a single bathroom to a full apartment, RenewBrick inspects the property, writes down exactly what will be done, coordinates suitable execution partners and specialists, and keeps you updated until the work is checked and handed back.",
    whatsappMessage:
      "Hello RenewBrick, I'd like to discuss renovation / civil work for my property.",
  },
  {
    slug: "property-maintenance",
    number: "02",
    name: "Property Maintenance",
    shortName: "Maintenance",
    availability: "available",
    confirmed: false,
    need: "You want your property looked after properly — problems found early, repairs handled, and a clear record of its condition.",
    includes: [
      "Scheduled inspections with photo reports",
      "Preventive maintenance coordination",
      "Plumbing, electrical and minor repairs",
      "Vacant property checks",
      "Support across multiple properties",
    ],
    metaTitle: "Property Maintenance in Hyderabad and Warangal",
    metaDescription:
      "Scheduled inspections, photo-based condition reports and coordinated repairs for homes, apartments and vacant properties in Hyderabad and Warangal.",
    headline: "Regular care for your property, so small problems are caught while they are still small.",
    intro:
      "RenewBrick inspects your property on an agreed schedule, reports its condition with photographs, and coordinates repairs once you have approved them — useful whether you live there, rent it out, or are managing it from another city.",
    whatsappMessage:
      "Hello RenewBrick, I'd like to discuss maintenance for my property.",
  },
  {
    slug: "rental-ready",
    number: "03",
    name: "Rental-Ready Services",
    shortName: "Rental-ready",
    availability: "available",
    confirmed: false,
    need: "A tenant has moved out — or is about to move in — and the property needs to be checked, repaired and prepared.",
    includes: [
      "Move-in and move-out inspections",
      "Condition reports and snag lists",
      "Repair, painting and cleaning coordination",
      "Preparation for the next occupant",
    ],
    metaTitle: "Rental-Ready Property Services in Hyderabad and Warangal",
    metaDescription:
      "Move-in and move-out inspections, condition reports, snag lists and coordinated repairs, painting and cleaning to prepare rental properties in Hyderabad and Warangal.",
    headline: "Between one occupant and the next: inspected, repaired and ready.",
    intro:
      "When a property changes hands, RenewBrick records its condition, lists what needs attention, coordinates the repairs, painting and cleaning you approve, and checks the property before the next occupant arrives.",
    whatsappMessage:
      "Hello RenewBrick, I'd like to discuss getting my property rental-ready.",
  },
  {
    slug: "property-management",
    number: "04",
    name: "Property Management",
    shortName: "Management",
    availability: "planned",
    confirmed: false,
    need: "You own a property — or several — and want one accountable point of contact for its upkeep, especially if you live elsewhere.",
    includes: [
      "Inspections and condition reporting",
      "Maintenance and vendor coordination",
      "Repair approvals through you",
      "Owner communication",
      "Vacant property care and multi-unit support",
    ],
    metaTitle: "Property Management (Planned) — Hyderabad and Warangal",
    metaDescription:
      "RenewBrick is preparing an ongoing property management service for owners in Hyderabad and Warangal: inspections, maintenance coordination, repair approvals and owner reporting. Register your interest.",
    headline: "One accountable point of contact for the ongoing care of your property.",
    intro:
      "RenewBrick is preparing an ongoing management service that brings inspections, maintenance coordination, repair approvals and owner reporting together. It is not yet open for new arrangements — register your interest and we will contact you when it is.",
    whatsappMessage:
      "Hello RenewBrick, I'd like to register interest in property management for my property.",
  },
];

export function getService(slug: ServiceSlug): Service {
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  return service;
}

export function servicePath(slug: ServiceSlug) {
  return `/services/${slug}`;
}
