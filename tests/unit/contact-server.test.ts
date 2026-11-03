// The server's enquiry form (deploy/server/contact) runs the template's Lambda unchanged and sends
// its SES request over SMTP. These check that the hand-over keeps every part of the email.
import { describe, expect, it } from "vitest";
import { loadContactHandler } from "../../scripts/lib/contact-function.mjs";
import { toMail } from "../../deploy/server/contact/mail.mjs";

const env = { RECIPIENT: "owner@example.com", SENDER: "RenewBrick website <noreply@renewbrick.com>", SITE_ORIGIN: "https://renewbrick.com" };
const enquiry = {
  name: "Asha Rao",
  phone: "98765 43210",
  email: "asha@example.com",
  contactMethod: "email",
  city: "Hyderabad",
  locality: "Kondapur",
  propertyType: "Independent house",
  service: "Painting & Waterproofing",
  description: "Terrace waterproofing before the monsoon.",
  consent: true,
  startedAt: Date.now() - 60_000,
  sourcePath: "/contact",
};

async function send(body: Record<string, unknown>) {
  const mails: ReturnType<typeof toMail>[] = [];
  const handler = loadContactHandler({ env, send: (input: Record<string, unknown>) => void mails.push(toMail(input)) }) as (
    e: Record<string, unknown>,
  ) => Promise<{ statusCode: number }>;
  const res = await handler({
    headers: { "content-type": "application/json", origin: env.SITE_ORIGIN },
    body: Buffer.from(JSON.stringify(body)).toString("base64"),
    isBase64Encoded: true,
  });
  return { res, mails };
}

describe("contact form on the server (SMTP)", () => {
  it("turns the Lambda's SES request into one SMTP email with sender, recipient, reply-to, subject and text", async () => {
    const { res, mails } = await send(enquiry);
    expect(res.statusCode).toBe(200);
    expect(mails).toHaveLength(1);
    const [mail] = mails;
    expect(mail.from).toBe(env.SENDER);
    expect(mail.to).toEqual([env.RECIPIENT]);
    expect(mail.replyTo).toBe("asha@example.com");
    expect(mail.subject).toMatch(/^Website enquiry RB-\d{6}-[0-9A-F]{6}: Painting & Waterproofing, Hyderabad \(Asha Rao\)$/);
    expect(mail.text).toContain("Locality: Kondapur");
    expect(mail.text).toContain("Phone: +919876543210");
  });

  it("leaves Reply-To out when the customer gave no email", async () => {
    const { mails } = await send({ ...enquiry, email: "", contactMethod: "whatsapp" });
    expect(mails[0].replyTo).toBeUndefined();
  });

  it("sends nothing for a bot (hidden field filled)", async () => {
    const { res, mails } = await send({ ...enquiry, website: "spam" });
    expect(res.statusCode).toBe(200);
    expect(mails).toHaveLength(0);
  });
});
