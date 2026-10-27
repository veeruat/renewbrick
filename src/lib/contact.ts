import { business } from "@/content/site";

/** wa.me link with an optional prefilled message. Null when no verified number exists. */
export function whatsappHref(message?: string) {
  if (!business.whatsapp) return null;
  const number = business.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telHref() {
  return business.phone ? `tel:${business.phone}` : null;
}

export function mailHref() {
  return business.email ? `mailto:${business.email}` : null;
}

/** "+919876543210" → "+91 98765 43210" */
export function formatPhone(e164: string) {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

export function inspectionHref(service?: string) {
  return service ? `/contact?service=${service}#enquiry` : "/contact#enquiry";
}
