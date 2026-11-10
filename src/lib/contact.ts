import { business } from "@/content/site";
import { getService, type ServiceSlug } from "@/content/services";

/**
 * Contact links. "Request a Site Inspection" always opens the enquiry form;
 * the phone number and WhatsApp are offered alongside it (header contact bar,
 * contact page, footer, mobile action bar).
 */

type ContactDetails = Pick<typeof business, "phone" | "whatsapp" | "email">;

export type ContactLink = {
  href: string;
  /** Opens outside the site (WhatsApp); render with target="_blank". */
  external: boolean;
  channel: "whatsapp" | "phone" | "page";
};

/** Short prefilled opener for general WhatsApp links (header bar, footer, mobile bar). */
export const whatsappGreeting = "Hello RenewBrick, I'd like to talk about my property.";

/** wa.me link with an optional prefilled message. Null when no verified number exists. */
export function whatsappHref(message?: string, details: ContactDetails = business) {
  if (!details.whatsapp) return null;
  const number = details.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telHref(details: ContactDetails = business) {
  return details.phone ? `tel:${details.phone}` : null;
}

export function mailHref(draft?: { subject: string; body: string }, details: ContactDetails = business) {
  if (!details.email) return null;
  const query = draft ? `?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}` : "";
  return `mailto:${details.email}${query}`;
}

/** "+919876543210" → "+91 98765 43210" */
export function formatPhone(e164: string) {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

/**
 * Prefilled WhatsApp message: names the service and leaves short prompts so
 * the first message already carries what the team needs to call back.
 */
export function inspectionMessage(service?: ServiceSlug, city?: string) {
  const svc = service ? getService(service) : undefined;
  const opening =
    svc?.availability === "planned"
      ? `Hello RenewBrick, I'd like to register interest in ${svc.name.toLowerCase()}.`
      : `Hello RenewBrick, I'd like to request a site inspection${svc ? ` for ${svc.name.toLowerCase()}` : ""}.`;
  return [opening, "", `City: ${city ?? ""}`, "Locality: ", "Property type: ", "Work needed: "].join("\n");
}

/** Where a "Request a Site Inspection" button goes: the enquiry form, with the service and city preselected. */
export function inspectionLink(service?: ServiceSlug, city?: string): ContactLink {
  const query = new URLSearchParams({ ...(service ? { service } : {}), ...(city ? { city } : {}) }).toString();
  return { href: `/contact${query ? `?${query}` : ""}#enquiry`, external: false, channel: "page" };
}
