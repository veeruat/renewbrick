/**
 * Contact form definition and browser-side checks. The contact form Lambda in
 * infra/aws/renewbrick-site.yaml applies the same rules again before emailing
 * an enquiry; keep the two in step.
 *
 * Option values are the readable labels, so the email shows "Bangalore" and
 * "Rental-Ready Services" rather than internal slugs.
 */

import { locations } from "@/content/locations";
import { services, type ServiceSlug } from "@/content/services";

export const ENQUIRY_ENDPOINT = "/api/contact";

type Option = { value: string; label: string };

export const cityOptions: Option[] = [
  ...locations.map((l) => ({ value: l.city, label: l.city })),
  { value: "Somewhere else", label: "Somewhere else" },
];

export const propertyTypeOptions: Option[] = [
  "Apartment / flat",
  "Independent house / villa",
  "Several units or a whole building",
  "Commercial space",
  "Other",
].map((label) => ({ value: label, label }));

const serviceLabel = (s: (typeof services)[number]) =>
  s.availability === "planned" ? `${s.name} (planned, register interest)` : s.name;

export const serviceOptions: Option[] = [
  ...services.map((s) => ({ value: serviceLabel(s), label: serviceLabel(s) })),
  { value: "Not sure yet", label: "Not sure yet" },
];

/** Option value for a service slug, used to preselect it from ?service=. */
export function serviceOptionFor(slug: string): string | null {
  const s = services.find((x) => x.slug === (slug as ServiceSlug));
  return s ? serviceLabel(s) : null;
}

export const contactMethodOptions: Option[] = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

export type EnquiryField =
  | "name"
  | "phone"
  | "email"
  | "contactMethod"
  | "city"
  | "locality"
  | "propertyType"
  | "service"
  | "description"
  | "consent";

export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export const limits = { name: 80, email: 120, locality: 80, descriptionMin: 10, descriptionMax: 1500 };

/** Indian mobiles (with or without +91/0) or international numbers with "+". */
export function normalisePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  let m = cleaned.match(/^(?:\+91|0091|91|0)?([6-9]\d{9})$/);
  if (m) return `+91${m[1]}`;
  m = cleaned.match(/^(?:\+|00)([1-9]\d{7,14})$/);
  return m ? `+${m[1]}` : null;
}

const EMAIL = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}$/i;
const allowed = (options: Option[], v: string) => options.some((o) => o.value === v);
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateEnquiry(raw: Record<string, unknown>): EnquiryErrors {
  const v = {
    name: text(raw.name).replace(/\s+/g, " "),
    phone: text(raw.phone),
    email: text(raw.email),
    contactMethod: text(raw.contactMethod),
    city: text(raw.city),
    locality: text(raw.locality),
    propertyType: text(raw.propertyType),
    service: text(raw.service),
    description: text(raw.description),
  };
  const errors: EnquiryErrors = {};

  if (v.name.length < 2) errors.name = "Please enter your name.";
  else if (v.name.length > limits.name) errors.name = `Please keep your name under ${limits.name} characters.`;

  if (!v.phone) errors.phone = "Please enter a phone number so we can reach you.";
  else if (!normalisePhone(v.phone))
    errors.phone = "Please enter a valid mobile number, e.g. 98765 43210, or an international number starting with +.";

  if (v.email) {
    if (v.email.length > limits.email || !EMAIL.test(v.email)) errors.email = "Please enter a valid email address, or leave this blank.";
  } else if (v.contactMethod === "email") {
    errors.email = "Please enter your email address, or choose another contact method.";
  }

  if (!allowed(contactMethodOptions, v.contactMethod)) errors.contactMethod = "Please choose how you would like us to contact you.";
  if (!allowed(cityOptions, v.city)) errors.city = "Please choose the city where the property is.";

  if (v.locality.length < 2) errors.locality = "Please enter the locality or area.";
  else if (v.locality.length > limits.locality) errors.locality = `Please keep this under ${limits.locality} characters.`;

  if (!allowed(propertyTypeOptions, v.propertyType)) errors.propertyType = "Please choose the type of property.";
  if (!allowed(serviceOptions, v.service)) errors.service = "Please choose the service you need, or “Not sure yet”.";

  if (v.description.length < limits.descriptionMin) errors.description = "Please describe the work briefly — a sentence or two is enough.";
  else if (v.description.length > limits.descriptionMax)
    errors.description = `Please keep the description under ${limits.descriptionMax} characters.`;

  if (!(raw.consent === true || raw.consent === "on")) errors.consent = "Please confirm that we may contact you about this enquiry.";

  return errors;
}
