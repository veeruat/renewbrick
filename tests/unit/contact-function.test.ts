// Exercises the contact form Lambda exactly as written in the CloudFormation
// template, with SES replaced by a recorder.
import { describe, expect, it } from "vitest";
import { loadContactHandler } from "../../scripts/lib/contact-function.mjs";

type Email = {
  FromEmailAddress: string;
  Destination: { ToAddresses: string[] };
  ReplyToAddresses?: string[];
  Content: { Simple: { Subject: { Data: string }; Body: { Text: { Data: string } } } };
};
type Res = { statusCode: number; headers: Record<string, string>; body?: string };

const env = { RECIPIENT: "owner@example.com", SENDER: "RenewBrick website <noreply@renewbrick.com>", SITE_ORIGIN: "https://renewbrick.com" };

function setup(send: (e: Email) => void = () => {}) {
  const sent: Email[] = [];
  const logs: string[] = [];
  const handler = loadContactHandler({
    env,
    send: (input: Record<string, unknown>) => {
      const email = input as unknown as Email;
      send(email);
      sent.push(email);
    },
    log: (line: string) => logs.push(line),
  }) as (event: Record<string, unknown>) => Promise<Res>;
  return { handler, sent, logs };
}

const valid = {
  name: "Asha Rao",
  phone: "98765 43210",
  email: "Asha@Example.com",
  contactMethod: "whatsapp",
  city: "Bangalore",
  locality: "Indiranagar",
  propertyType: "Apartment / flat",
  service: "Renovation & Civil Works",
  description: "Bathroom leak and repainting of two bedrooms.",
  consent: true,
  startedAt: Date.now() - 60_000,
  sourcePath: "/contact",
};

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  headers: { "content-type": "application/json", origin: env.SITE_ORIGIN, ...headers },
  body: JSON.stringify(body),
  isBase64Encoded: false,
});

describe("contact form Lambda", () => {
  it("emails a valid enquiry to the owner with the customer as Reply-To", async () => {
    const { handler, sent, logs } = setup();
    const res = await handler(json(valid));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body!);
    expect(body.ok).toBe(true);
    expect(body.reference).toMatch(/^RB-\d{6}-[0-9A-F]{6}$/);

    expect(sent).toHaveLength(1);
    const email = sent[0];
    expect(email.Destination.ToAddresses).toEqual(["owner@example.com"]);
    expect(email.FromEmailAddress).toBe(env.SENDER);
    expect(email.ReplyToAddresses).toEqual(["asha@example.com"]);
    expect(email.Content.Simple.Subject.Data).toBe(
      `Website enquiry ${body.reference}: Renovation & Civil Works, Bangalore (Asha Rao)`,
    );
    const text = email.Content.Simple.Body.Text.Data;
    for (const part of ["Phone: +919876543210", "Preferred contact: WhatsApp", "Locality: Indiranagar", "Bathroom leak"]) {
      expect(text).toContain(part);
    }
    // Logs hold the reference and outcome only, never the enquiry.
    expect(logs.join("\n")).not.toMatch(/Asha|9876|Indiranagar/);
    expect(JSON.parse(logs[0])).toEqual({ reference: body.reference, outcome: "sent" });
  });

  it("accepts international numbers and a missing email", async () => {
    const { handler, sent } = setup();
    const res = await handler(json({ ...valid, phone: "+44 7700 900123", email: "", contactMethod: "phone" }));
    expect(res.statusCode).toBe(200);
    expect(sent[0].ReplyToAddresses).toBeUndefined();
    expect(sent[0].Content.Simple.Body.Text.Data).toContain("Phone: +447700900123");
  });

  it("rejects invalid input with field errors and sends nothing", async () => {
    const { handler, sent } = setup();
    const res = await handler(
      json({ ...valid, name: "A", phone: "12345", email: "", contactMethod: "email", description: "short", consent: false }),
    );
    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body!);
    expect(Object.keys(body.errors).sort()).toEqual(["consent", "description", "email", "name", "phone"]);
    expect(sent).toHaveLength(0);
  });

  it("strips line breaks from single-line fields so headers can't be injected", async () => {
    const { handler, sent } = setup();
    await handler(json({ ...valid, name: "Asha\r\nBcc: x@example.com" }));
    expect(sent[0].Content.Simple.Subject.Data).not.toMatch(/[\r\n]/);
  });

  it("silently drops bot submissions (honeypot or too fast)", async () => {
    const { handler, sent, logs } = setup();
    for (const extra of [{ website: "http://spam.example" }, { startedAt: Date.now() - 500 }]) {
      const res = await handler(json({ ...valid, ...extra }));
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body!).ok).toBe(true);
    }
    expect(sent).toHaveLength(0);
    expect(logs.map((l) => JSON.parse(l).outcome)).toEqual(["dropped", "dropped"]);
  });

  it("refuses posts from other websites and unreadable bodies", async () => {
    const { handler, sent } = setup();
    expect((await handler(json(valid, { origin: "https://evil.example" }))).statusCode).toBe(400);
    expect((await handler({ headers: { "content-type": "text/plain" }, body: "hi" })).statusCode).toBe(400);
    expect((await handler(json("x".repeat(30_000)))).statusCode).toBe(400);
    expect(sent).toHaveLength(0);
  });

  it("redirects plain HTML form posts (no JavaScript)", async () => {
    const { handler, sent } = setup();
    const form = (data: Record<string, string>) => ({
      headers: { "content-type": "application/x-www-form-urlencoded", origin: env.SITE_ORIGIN },
      body: Buffer.from(new URLSearchParams(data).toString()).toString("base64"),
      isBase64Encoded: true,
    });
    const ok = await handler(form({ ...valid, consent: "on", startedAt: "" } as unknown as Record<string, string>));
    expect(ok).toMatchObject({ statusCode: 303, headers: { location: "/contact/sent" } });
    expect(sent).toHaveLength(1);

    const bad = await handler(form({ name: "Asha" }));
    expect(bad).toMatchObject({ statusCode: 303, headers: { location: "/contact?error=invalid#enquiry" } });
  });

  it("reports a sending failure without losing the error to the logs", async () => {
    const { handler, logs } = setup(() => {
      throw Object.assign(new Error("not verified"), { name: "MessageRejected" });
    });
    const res = await handler(json(valid));
    expect(res.statusCode).toBe(502);
    expect(JSON.parse(logs[0])).toMatchObject({ outcome: "error", error: "MessageRejected" });
  });
});
