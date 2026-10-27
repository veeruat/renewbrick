/**
 * Service locations. To add a city, append an entry here: the route
 * /locations/[slug], navigation, sitemap, enquiry form options and structured
 * data pick it up automatically.
 *
 * Do not list neighbourhoods unless coverage there has been confirmed.
 */

import type { ServiceSlug } from "./services";

export type Location = {
  slug: string;
  city: string;
  state: string;
  /** Short line used in the hero and listings. */
  summary: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  /** What owners in this city typically come to us for — framed as situations, not claims. */
  situations: { title: string; text: string; service: ServiceSlug }[];
  /** Practical, locally relevant considerations. */
  considerations: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  coverageNote: string;
};

export const locations: Location[] = [
  {
    slug: "hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    summary: "Renovation, civil works, maintenance and rental preparation for homes and apartments.",
    metaTitle: "Home & Apartment Renovation and Maintenance in Hyderabad",
    metaDescription:
      "RenewBrick plans and coordinates home and apartment renovation, civil repairs, property maintenance and rental-ready work in Hyderabad. Request a site inspection.",
    headline: "Renovation and property care in Hyderabad.",
    intro:
      "RenewBrick works with owners of apartments, independent houses and rental properties in Hyderabad — inspecting the property, writing down the scope, coordinating execution partners and specialists, and checking the work before handover.",
    situations: [
      {
        title: "Renovating an apartment in a gated community",
        text: "Bathrooms, kitchens, flooring and repainting for apartments where association rules shape how and when work can happen.",
        service: "renovation-civil-works",
      },
      {
        title: "Fixing damp, seepage and terrace leaks",
        text: "Leak investigation and waterproofing for terraces, bathrooms, balconies and external walls.",
        service: "renovation-civil-works",
      },
      {
        title: "Turning a flat around between tenants",
        text: "Move-out inspection, snag list, repairs, painting and cleaning before the next occupant.",
        service: "rental-ready",
      },
      {
        title: "Keeping an investment property in order",
        text: "Scheduled inspections and photo reports, with repairs coordinated once you approve them.",
        service: "property-maintenance",
      },
    ],
    considerations: [
      {
        title: "Association and society rules",
        text: "Many apartment associations set working hours and rules for moving materials, using lifts and removing debris. We ask about these at the inspection so the schedule allows for them.",
      },
      {
        title: "Planning around the monsoon",
        text: "Waterproofing, terrace work and exterior painting are best completed before the monsoon. If leaks are already visible, we investigate the source before proposing a fix.",
      },
      {
        title: "Owners who are not in the city",
        text: "If you are managing a Hyderabad property from elsewhere, we work from photographs, written scopes and message-based approvals, with access arranged through someone you nominate.",
      },
    ],
    faqs: [
      {
        question: "Which parts of Hyderabad do you cover?",
        answer:
          "Include your locality when you enquire and we will confirm whether we can take on the work. We do not publish a neighbourhood list because coverage depends on the type and size of the job.",
      },
      {
        question: "Can you work with my apartment association's rules?",
        answer:
          "Yes. Tell us about any rules on working hours, material movement or debris removal, and we will plan the work around them. Any permissions the association requires are identified at the inspection.",
      },
    ],
    coverageNote:
      "Coverage within Hyderabad is confirmed for each enquiry, based on your locality and the work involved.",
  },
  {
    slug: "warangal",
    city: "Warangal",
    state: "Telangana",
    summary: "Renovation, repairs and property care — including for owners who live elsewhere.",
    metaTitle: "Renovation, Civil Works and Property Care in Warangal",
    metaDescription:
      "RenewBrick plans and coordinates renovation, civil works, repairs, maintenance and rental preparation for property owners in Warangal, including owners living in other cities.",
    headline: "Renovation and property care in Warangal.",
    intro:
      "RenewBrick plans and coordinates renovation, civil repairs and ongoing care for homes and properties in Warangal — whether you live in the city or are looking after a property from Hyderabad, another state or abroad.",
    situations: [
      {
        title: "Restoring a family home",
        text: "Civil repairs, waterproofing, repainting, flooring and updated bathrooms and kitchens for houses that have aged.",
        service: "renovation-civil-works",
      },
      {
        title: "Looking after a property from another city",
        text: "Inspections and photo reports, with repairs scoped, approved by you and coordinated on site.",
        service: "property-maintenance",
      },
      {
        title: "Preparing a property to rent out",
        text: "A condition report and snag list, followed by the repairs, painting and cleaning you approve.",
        service: "rental-ready",
      },
      {
        title: "Checking on a house that stands empty",
        text: "Vacant property checks for leaks, damp, pests and damage, reported with photographs.",
        service: "property-maintenance",
      },
    ],
    considerations: [
      {
        title: "Remote owners, local coordination",
        text: "If you are not nearby, we share inspection photographs and written scopes, take approval by message or email, and send progress updates while work is under way.",
      },
      {
        title: "Ageing structures",
        text: "Older houses often need repairs that are not visible at first. We note existing conditions at inspection and, if anything affects the structure, recommend assessment by a qualified engineer before work proceeds.",
      },
      {
        title: "Seasonal planning",
        text: "Terrace waterproofing and exterior painting are best scheduled in dry months; we will suggest timing when we prepare your scope.",
      },
    ],
    faqs: [
      {
        question: "Do you cover the whole Warangal area?",
        answer:
          "Include your locality when you enquire and we will confirm whether we can take on the work.",
      },
      {
        question: "I live in Hyderabad. Do I need to travel to Warangal?",
        answer:
          "Not necessarily. Someone you nominate can provide access for the inspection and the work, and we keep you informed with photographs and written updates.",
      },
    ],
    coverageNote:
      "Coverage within Warangal is confirmed for each enquiry, based on your locality and the work involved.",
  },
];

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug);
}
