import { describe, expect, it } from "vitest";
import { formatPhone, inspectionLink, inspectionMessage, mailHref, telHref, whatsappHref } from "@/lib/contact";

const none = { phone: null, whatsapp: null, email: null };
const all = { phone: "+919876543210", whatsapp: "+919876543210", email: "renewbrick@gmail.com" };

describe("inspectionLink", () => {
  it("prefers WhatsApp, opening outside the site", () => {
    const link = inspectionLink("rental-ready", "Warangal", all);
    expect(link.channel).toBe("whatsapp");
    expect(link.external).toBe(true);
    expect(link.href.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    const text = decodeURIComponent(link.href.split("text=")[1]);
    expect(text).toContain("rental-ready services");
    expect(text).toContain("City: Warangal");
  });

  it("falls back to a phone call when there is no WhatsApp number", () => {
    expect(inspectionLink(undefined, undefined, { ...all, whatsapp: null })).toEqual({
      href: "tel:+919876543210",
      external: false,
      channel: "phone",
    });
  });

  it("falls back to the contact page when no number is verified", () => {
    expect(inspectionLink(undefined, undefined, none)).toEqual({ href: "/contact#enquiry", external: false, channel: "page" });
    expect(inspectionLink("rental-ready", "Warangal", none).href).toBe("/contact?service=rental-ready#enquiry");
    expect(inspectionLink(undefined, undefined, { ...none, email: "renewbrick@gmail.com" }).channel).toBe("page");
  });
});

describe("inspectionMessage", () => {
  it("asks for the details the team needs", () => {
    const msg = inspectionMessage();
    expect(msg).toMatch(/^Hello RenewBrick, I'd like to request a site inspection\./);
    for (const prompt of ["City:", "Locality:", "Property type:", "Work needed:"]) expect(msg).toContain(prompt);
  });

  it("registers interest for a planned service instead of requesting an inspection", () => {
    const msg = inspectionMessage("property-management");
    expect(msg).toContain("register interest in property management");
    expect(msg).not.toContain("site inspection");
  });
});

describe("contact helpers", () => {
  it("return null when details are missing", () => {
    expect(whatsappHref("hi", none)).toBeNull();
    expect(telHref(none)).toBeNull();
    expect(mailHref(undefined, none)).toBeNull();
  });

  it("build an encoded mailto draft", () => {
    expect(mailHref({ subject: "Site inspection request", body: "City: Hyderabad" }, all)).toBe(
      "mailto:renewbrick@gmail.com?subject=Site%20inspection%20request&body=City%3A%20Hyderabad",
    );
  });

  it("format Indian numbers for display", () => {
    expect(formatPhone("+919876543210")).toBe("+91 98765 43210");
    expect(formatPhone("+971501234567")).toBe("+971501234567");
  });
});
