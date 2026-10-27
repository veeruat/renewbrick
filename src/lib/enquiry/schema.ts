/**
 * Enquiry form definition and validation, shared by the browser form and the
 * server route so both apply exactly the same rules.
 */

import { locations } from "@/content/locations";
import { services } from "@/content/services";

export const CONSENT_VERSION = "2026-10-draft-1";

export const cityOptions = [
  ...locations.map((l) => ({ value: l.slug, label: l.city })),
  { value: "other", label: "Somewhere else" },
];

export const propertyTypeOptions = [
  { value: "apartment", label: "Apartment / flat" },
  { value: "independent-house", label: "Independent house / villa" },
  { value: "multi-unit", label: "Several units or a whole building" },
  { value: "commercial", label: "Commercial space" },
  { value: "other", label: "Other" },
];

export const serviceOptions = [
  ...services.map((s) => ({
    value: s.slug,
    label: s.availability === "planned" ? `${s.name} (planned — register interest)` : s.name,
  })),
  { value: "not-sure", label: "Not sure yet" },
];

export const contactMethodOptions = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

export type EnquiryInput = {
  name: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  propertyType: string;
  service: string;
  description: string;
  contactMethod: string;
  consent: boolean;
};

export type EnquiryField = keyof EnquiryInput;

export type ValidEnquiry = Omit<EnquiryInput, "email" | "consent"> & {
  email: string | null;
  /** Phone normalised to E.164. */
  phone: string;
  consent: true;
};

export type ValidationResult =
  | { ok: true; value: ValidEnquiry }
  | { ok: false; errors: Partial<Record<EnquiryField, string>> };

export const limits = {
  name: 80,
  email: 120,
  locality: 80,
  descriptionMin: 10,
  descriptionMax: 1500,
};

const allowed = (options: { value: string }[], v: string) => options.some((o) => o.value === v);

/**
 * Indian numbers: 10-digit mobiles starting 6–9, with or without +91 / 0.
 * International: "+" followed by 8–15 digits (owners living abroad).
 */
export function normalisePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  let m = cleaned.match(/^(?:\+91|0091|91|0)?([6-9]\d{9})$/);
  if (m) return `+91${m[1]}`;
  m = cleaned.match(/^(?:\+|00)([1-9]\d{7,14})$/);
  if (m) return `+${m[1]}`;
  return null;
}

const EMAIL = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}$/i;

function clean(v: unknown): string {
  return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "";
}

export function validateEnquiry(raw: Record<string, unknown>): ValidationResult {
  const input: EnquiryInput = {
    name: clean(raw.name).replace(/\s+/g, " "),
    phone: clean(raw.phone),
    email: clean(raw.email).toLowerCase(),
    city: clean(raw.city),
    locality: clean(raw.locality).replace(/\s+/g, " "),
    propertyType: clean(raw.propertyType),
    service: clean(raw.service),
    description: clean(raw.description),
    contactMethod: clean(raw.contactMethod),
    consent: raw.consent === true || raw.consent === "on" || raw.consent === "true",
  };

  const errors: Partial<Record<EnquiryField, string>> = {};

  if (input.name.length < 2) errors.name = "Please enter your name.";
  else if (input.name.length > limits.name) errors.name = `Please keep your name under ${limits.name} characters.`;

  const phone = normalisePhone(input.phone);
  if (!input.phone) errors.phone = "Please enter a phone number so we can reach you.";
  else if (!phone) errors.phone = "Please enter a valid mobile number, e.g. 98765 43210, or an international number starting with +.";

  if (input.email) {
    if (input.email.length > limits.email || !EMAIL.test(input.email)) errors.email = "Please enter a valid email address, or leave this blank.";
  } else if (input.contactMethod === "email") {
    errors.email = "Please enter your email address, or choose another contact method.";
  }

  if (!allowed(cityOptions, input.city)) errors.city = "Please choose the city where the property is.";

  if (input.locality.length < 2) errors.locality = "Please enter the locality or area.";
  else if (input.locality.length > limits.locality) errors.locality = `Please keep this under ${limits.locality} characters.`;

  if (!allowed(propertyTypeOptions, input.propertyType)) errors.propertyType = "Please choose the type of property.";
  if (!allowed(serviceOptions, input.service)) errors.service = "Please choose the service you need, or “Not sure yet”.";

  if (input.description.length < limits.descriptionMin)
    errors.description = "Please describe the work briefly — a sentence or two is enough.";
  else if (input.description.length > limits.descriptionMax)
    errors.description = `Please keep the description under ${limits.descriptionMax} characters.`;

  if (!allowed(contactMethodOptions, input.contactMethod)) errors.contactMethod = "Please choose how you would like us to contact you.";

  if (!input.consent) errors.consent = "Please confirm that we may contact you about this enquiry.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { ...input, phone: phone!, email: input.email || null, consent: true },
  };
}

export function optionLabel(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}
