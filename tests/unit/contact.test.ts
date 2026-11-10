import { describe, expect, it } from "vitest";
import { formatPhone, inspectionLink, inspectionMessage, mailHref, telHref, whatsappHref } from "@/lib/contact";

const none = { phone: null, whatsapp: null, email: null };
const all = { phone: "+919876543210", whatsapp: "+919876543210", email: "renewbrick@gmail.com" };

describe("inspectionLink", () => {
  it("always opens the enquiry form, preselecting the service and city", () => {
    expect(inspectionLink()).toEqual({ href: "/contact#enquiry", external: false, channel: "page" });
    expect(inspectionLink("rental-ready").href).toBe("/contact?service=rental-ready#enquiry");
    expect(inspectionLink("rental-ready", "Warangal").href).toBe("/contact?service=rental-ready&city=Warangal#enquiry");
    expect(inspectionLink(undefined, "Bangalore").href).toBe("/contact?city=Bangalore#enquiry");
  });

  it("prefills WhatsApp messages with the service and city", () => {
    const href = whatsappHref(inspectionMessage("rental-ready", "Warangal"), all)!;
    expect(href.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    const text = decodeURIComponent(href.split("text=")[1]);
    expect(text).toContain("rental-ready services");
    expect(text).toContain("City: Warangal");
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
