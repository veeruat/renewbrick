/**
 * Frequently asked questions.
 *
 * `needsConfirmation: true` means the answer touches a business policy that
 * has not been confirmed. Those answers are written to promise nothing beyond
 * the enquiry process itself; replace them once the owner confirms the policy,
 * then set the flag to false. The launch check lists every flagged answer.
 */

import type { ServiceSlug } from "./services";

export type FaqTopic =
  | "inspections"
  | "estimates"
  | "work"
  | "maintenance"
  | "rental"
  | "locations"
  | "quality";

export type Faq = {
  id: string;
  topic: FaqTopic;
  question: string;
  answer: string;
  services?: ServiceSlug[];
  cities?: string[];
  needsConfirmation?: boolean;
};

export const faqTopics: Record<FaqTopic, string> = {
  inspections: "Inspections",
  estimates: "Estimates & approvals",
  work: "Labour, materials & timelines",
  maintenance: "Maintenance",
  rental: "Rental preparation",
  locations: "Locations",
  quality: "Quality & handover",
};

export const faqs: Faq[] = [
  {
    id: "inspection-booking",
    topic: "inspections",
    question: "Does messaging you book an inspection?",
    answer:
      "No. Your WhatsApp message or call starts a conversation. We ask a few questions to understand the requirement, and if a site visit makes sense we agree a date and time with you directly. Nothing is booked until you have confirmed it.",
  },
  {
    id: "inspection-fee",
    topic: "inspections",
    question: "Is there a charge for the site inspection?",
    answer:
      "We confirm whether any charge applies for your inspection when we call you back, before a visit is arranged. You will not be charged for a visit you have not agreed to.",
    needsConfirmation: true,
  },
  {
    id: "inspection-attendance",
    topic: "inspections",
    question: "Do I need to be present for the inspection?",
    answer:
      "It helps, but it is not always necessary. If you live elsewhere, someone you nominate — a family member, tenant or building manager — can give access, and we will share photographs and notes with you afterwards.",
  },
  {
    id: "estimate-basis",
    topic: "estimates",
    question: "Can you give me a price without visiting?",
    answer:
      "We can discuss a rough range for simple work, but a reliable estimate depends on what we find on site — the condition of walls, floors, plumbing and wiring often changes the scope. Your written estimate follows the inspection.",
  },
  {
    id: "estimate-contents",
    topic: "estimates",
    question: "What does the estimate include?",
    answer:
      "The estimate is based on a written scope of work describing what will be done. We will explain how labour, materials and any specialist work are accounted for, so you can see what you are approving.",
    needsConfirmation: true,
  },
  {
    id: "additional-work",
    topic: "estimates",
    question: "What happens if more work is needed once the job starts?",
    answer:
      "Opening up walls or floors sometimes reveals problems that were not visible at inspection. When that happens we stop that part of the work, explain what we found, and send a revised scope and estimate. Additional work proceeds only after you approve it in writing.",
  },
  {
    id: "written-approval",
    topic: "estimates",
    question: "Why do you ask for written approval?",
    answer:
      "So that you and we have the same record of what was agreed — the scope, the estimate and any changes. A message or email confirming approval is enough; we will tell you what we need.",
  },
  {
    id: "materials",
    topic: "work",
    question: "Who supplies the materials?",
    answer:
      "We help you choose materials and can coordinate procurement through suppliers. If you would rather buy certain items yourself, tell us during the inspection and we will reflect it in the scope.",
    needsConfirmation: true,
  },
  {
    id: "who-does-work",
    topic: "work",
    question: "Who carries out the work?",
    answer:
      "RenewBrick plans and coordinates the work. Execution is carried out by execution partners and specialist vendors we engage for the specific trades involved — they are independent businesses, not RenewBrick employees.",
  },
  {
    id: "timelines",
    topic: "work",
    question: "How long will the work take?",
    answer:
      "It depends on the scope, site conditions, material lead times and any approvals your building or association requires. Your estimate includes an indicative schedule, and we update you if anything changes it.",
  },
  {
    id: "structural",
    topic: "work",
    question: "Can you remove a wall or change the structure?",
    answer:
      "Any change that affects structure needs assessment by a qualified structural engineer and the approvals that apply to your building before work can proceed. We will tell you at the inspection if your plans fall into this category.",
    services: ["renovation-civil-works"],
  },
  {
    id: "maintenance-arrangements",
    topic: "maintenance",
    question: "How do maintenance arrangements work?",
    answer:
      "We agree an inspection schedule with you, report the property's condition with photographs after each visit, and recommend repairs. Repairs are estimated and go ahead only once you approve them.",
    services: ["property-maintenance", "property-management"],
  },
  {
    id: "maintenance-plan-fees",
    topic: "maintenance",
    question: "Do you offer annual maintenance plans?",
    answer:
      "We are finalising the details of annual arrangements. If a plan includes a fee, it covers the agreed inspections and coordination only — labour, materials and specialist charges for repairs are always estimated and approved separately. Ask us about your property when you enquire.",
    services: ["property-maintenance"],
    needsConfirmation: true,
  },
  {
    id: "vacant-property",
    topic: "maintenance",
    question: "Can you check on a property that is empty?",
    answer:
      "Yes. Vacant property checks look for leaks, damp, pests, electrical issues and signs of damage or unauthorised entry, and you receive a photo report after each visit.",
    services: ["property-maintenance", "property-management"],
  },
  {
    id: "rental-reports",
    topic: "rental",
    question: "What is included in a move-out inspection?",
    answer:
      "We record the condition of each room, fixtures, fittings and services with photographs, and list anything that needs repair, repainting or cleaning before the next occupant.",
    services: ["rental-ready"],
  },
  {
    id: "rental-tenants",
    topic: "rental",
    question: "Do you find tenants or handle rental agreements?",
    answer:
      "No. Rental-ready services cover inspection and preparation of the property. Finding tenants, brokerage and rental agreements are not part of the service.",
    services: ["rental-ready", "property-management"],
  },
  {
    id: "locations-covered",
    topic: "locations",
    question: "Which areas do you cover?",
    answer:
      "We currently work in Hyderabad and Warangal (Telangana) and Bangalore (Karnataka). Coverage within each city is confirmed when you enquire — include your locality in your message.",
  },
  {
    id: "locations-remote-owner",
    topic: "locations",
    question: "I live in another city or abroad. Can you still help?",
    answer:
      "Yes — that is a common situation. We can inspect, share photographs and written scopes, take your approval by message or email, and keep you updated throughout. You will need to arrange access to the property.",
  },
  {
    id: "quality-check",
    topic: "quality",
    question: "How do you check the work?",
    answer:
      "Before handover, completed work is checked against the approved scope. Anything that does not meet it goes on a snag list and is corrected before the work is handed over.",
  },
  {
    id: "warranty",
    topic: "quality",
    question: "Is the work covered by a warranty?",
    answer:
      "Warranty terms depend on the type of work and on the products used. Any warranty that applies will be stated in writing in your estimate — please do not rely on any warranty that is not written there.",
    needsConfirmation: true,
  },
];

export function faqsFor(filter: { service?: ServiceSlug; city?: string; ids?: string[] }) {
  if (filter.ids) {
    return filter.ids
      .map((id) => faqs.find((f) => f.id === id))
      .filter((f): f is Faq => Boolean(f));
  }
  return faqs.filter(
    (f) =>
      (filter.service && f.services?.includes(filter.service)) ||
      (filter.city && f.cities?.includes(filter.city)),
  );
}
