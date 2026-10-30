/** Homepage narrative content that is not shared with other pages. */

import type { ServiceSlug } from "./services";

export const hero = {
  eyebrow: "Property Transformation & Care",
  headline: ["Restore.", "Renovate.", "Elevate your property."],
  body: "From renovation and civil works to ongoing property care, RenewBrick helps owners in Hyderabad, Bangalore and Warangal plan improvements, coordinate execution, and keep their properties ready for what comes next.",
};

export const scenarios: {
  title: string;
  situation: string;
  approach: string;
  services: ServiceSlug[];
}[] = [
  {
    title: "Updating an ageing apartment",
    situation:
      "The bathrooms leak, the tiles are lifting, and the paint has seen better years. You want it done properly, once.",
    approach:
      "An inspection that records the real condition, a scope that separates what is urgent from what is optional, and one point of contact while the work is carried out.",
    services: ["renovation-civil-works"],
  },
  {
    title: "Preparing a property for new tenants",
    situation:
      "The previous tenant has left and you want the property let again without weeks of back-and-forth with different tradespeople.",
    approach:
      "A move-out condition report and snag list, followed by the repairs, painting and cleaning you approve, and a final check before the next occupant.",
    services: ["rental-ready"],
  },
  {
    title: "Managing repairs from another city",
    situation:
      "You live in Bengaluru, Dubai or Hyderabad — and the property that needs attention is somewhere else.",
    approach:
      "Photographs and written scopes instead of guesswork, approvals by message or email, and progress updates until the work is handed over.",
    services: ["renovation-civil-works", "property-maintenance"],
  },
  {
    title: "Coordinating ongoing upkeep",
    situation:
      "Nothing is broken today, but you would rather know about the slow leak or the failing switchboard before it becomes an emergency.",
    approach:
      "Scheduled inspections with photo-based condition reports, and repairs coordinated only when you have approved them.",
    services: ["property-maintenance", "property-management"],
  },
];

/**
 * Operating principles. `confirm: true` marks statements describing practices
 * the business must confirm before launch (listed by the launch check).
 */
export const principles: { title: string; text: string; confirm?: boolean }[] = [
  {
    title: "The scope is written down",
    text: "Every job starts with a written description of what will be done, based on what was found on site.",
  },
  {
    title: "Estimates and approval come before work",
    text: "You see the estimate and approve it in writing before work is scheduled. Changes are handled the same way.",
  },
  {
    title: "The right people for each trade",
    text: "We coordinate suitable execution partners and specialist vendors — independent businesses — for the specific work involved.",
  },
  {
    title: "You hear how it is going",
    text: "Progress updates with photographs while work is under way, and an explanation whenever something changes.",
    confirm: true,
  },
  {
    title: "Checked before it is handed over",
    text: "Completed work is checked against the approved scope, and snags are closed before handover.",
  },
];
