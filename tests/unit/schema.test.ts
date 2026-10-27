import { describe, expect, it } from "vitest";
import { normalisePhone, validateEnquiry } from "@/lib/enquiry/schema";
import { validInput } from "./fixtures";

describe("normalisePhone", () => {
  it.each([
    ["9876543210", "+919876543210"],
    ["98765 43210", "+919876543210"],
    ["+91 98765-43210", "+919876543210"],
    ["09876543210", "+919876543210"],
    ["919876543210", "+919876543210"],
    ["+971 50 123 4567", "+971501234567"],
    ["0044 20 7946 0958", "+442079460958"],
  ])("accepts %s", (raw, expected) => expect(normalisePhone(raw)).toBe(expected));

  it.each(["12345", "5876543210", "abcdefghij", "+0123", ""])("rejects %s", (raw) => expect(normalisePhone(raw)).toBeNull());
});

describe("validateEnquiry", () => {
  it("accepts a complete enquiry and normalises it", () => {
    const r = validateEnquiry(validInput);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.phone).toBe("+919876543210");
      expect(r.value.email).toBeNull();
    }
  });

  it("reports every missing required field", () => {
    const r = validateEnquiry({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(
        ["city", "consent", "contactMethod", "description", "locality", "name", "phone", "propertyType", "service"].sort(),
      );
    }
  });

  it("requires an email when email is the preferred contact method", () => {
    const r = validateEnquiry({ ...validInput, contactMethod: "email" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toBeDefined();
  });

  it("rejects values outside the allowed options", () => {
    const r = validateEnquiry({ ...validInput, city: "mumbai", service: "plumbing" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.city).toBeDefined();
      expect(r.errors.service).toBeDefined();
    }
  });

  it("rejects an invalid email and over-long description", () => {
    const r = validateEnquiry({ ...validInput, email: "not-an-email", description: "x".repeat(1501) });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.email).toBeDefined();
      expect(r.errors.description).toBeDefined();
    }
  });

  it("requires explicit consent", () => {
    const r = validateEnquiry({ ...validInput, consent: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.consent).toBeDefined();
  });

  it("strips control characters and collapses whitespace in names", () => {
    const r = validateEnquiry({ ...validInput, name: "  Asha\u0000   Rao " });
    expect(r.ok && r.value.name).toBe("Asha Rao");
  });
});
