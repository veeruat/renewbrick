import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db";
import { getEmailSender } from "@/lib/email";
import { MIN_FILL_MS, RATE_LIMITS, notifyEnquiry, retryPendingNotifications, submitEnquiry } from "@/lib/enquiry/service";
import { validInput } from "./fixtures";

const schema = readFileSync(path.join(__dirname, "../../db/schema.sql"), "utf8");
let pg: PGlite;
let db: Db;
const now = new Date("2026-10-26T10:00:00Z");

const submission = (over: Record<string, unknown> = {}) => ({
  ...validInput,
  idempotencyKey: crypto.randomUUID(),
  startedAt: now.getTime() - MIN_FILL_MS - 1000,
  sourcePath: "/contact",
  ...over,
});

beforeAll(async () => {
  pg = await PGlite.create();
  db = pg as unknown as Db;
});
afterAll(() => pg.close());
beforeEach(async () => {
  await pg.exec("DROP TABLE IF EXISTS enquiries; DROP TABLE IF EXISTS enquiry_attempts;");
  await pg.exec(schema);
});

describe("submitEnquiry", () => {
  it("stores a valid enquiry durably and returns a reference", async () => {
    const r = await submitEnquiry(submission(), { db, ip: "203.0.113.5", now });
    expect(r.status).toBe("created");
    const { rows } = await db.query<{ reference: string; phone: string; ip_hash: string; notification_status: string }>(
      "SELECT reference, phone, ip_hash, notification_status FROM enquiries",
    );
    expect(rows).toHaveLength(1);
    expect(r.status === "created" && rows[0].reference).toBe(r.status === "created" && r.reference);
    expect(rows[0].reference).toMatch(/^RB-261026-[A-Z2-9]{4}$/);
    expect(rows[0].phone).toBe("+919876543210");
    expect(rows[0].ip_hash).not.toContain("203.0.113.5");
    expect(rows[0].notification_status).toBe("pending");
  });

  it("returns the original reference when the same submission is retried", async () => {
    const body = submission();
    const first = await submitEnquiry(body, { db, ip: "203.0.113.5", now });
    const second = await submitEnquiry(body, { db, ip: "203.0.113.5", now });
    expect(second.status).toBe("duplicate");
    expect(second.status !== "invalid" && "reference" in second && second.reference).toBe(
      "reference" in first && first.reference,
    );
    expect((await db.query("SELECT 1 FROM enquiries")).rows).toHaveLength(1);
  });

  it("treats an identical enquiry re-sent within minutes as a duplicate", async () => {
    await submitEnquiry(submission(), { db, ip: "203.0.113.5", now });
    const again = await submitEnquiry(submission(), { db, ip: "203.0.113.5", now });
    expect(again.status).toBe("duplicate");
    expect((await db.query("SELECT 1 FROM enquiries")).rows).toHaveLength(1);
  });

  it("rejects the honeypot and implausibly fast submissions without storing", async () => {
    expect((await submitEnquiry(submission({ website: "http://spam" }), { db, ip: "1.1.1.1", now })).status).toBe("rejected");
    expect((await submitEnquiry(submission({ startedAt: now.getTime() - 500 }), { db, ip: "1.1.1.1", now })).status).toBe("rejected");
    expect((await submitEnquiry(submission({ idempotencyKey: "nope" }), { db, ip: "1.1.1.1", now })).status).toBe("rejected");
    expect((await db.query("SELECT 1 FROM enquiries")).rows).toHaveLength(0);
  });

  it("returns field errors for invalid input without storing", async () => {
    const r = await submitEnquiry(submission({ phone: "123" }), { db, ip: "1.1.1.1", now });
    expect(r.status).toBe("invalid");
    expect((await db.query("SELECT 1 FROM enquiries")).rows).toHaveLength(0);
  });

  it("rate-limits repeated submissions from one address", async () => {
    for (let i = 0; i < RATE_LIMITS.perWindow; i++) {
      const r = await submitEnquiry(submission({ description: `Enquiry number ${i} about the bathroom.` }), { db, ip: "198.51.100.9", now });
      expect(r.status).toBe("created");
    }
    const limited = await submitEnquiry(submission({ description: "One more enquiry about the kitchen." }), { db, ip: "198.51.100.9", now });
    expect(limited.status).toBe("rate-limited");
    const other = await submitEnquiry(submission({ description: "A different person entirely." }), { db, ip: "198.51.100.10", now });
    expect(other.status).toBe("created");
  });

  it("propagates storage failures instead of reporting success", async () => {
    const broken: Db = { query: async () => { throw new Error("connection refused"); } };
    await expect(submitEnquiry(submission(), { db: broken, ip: "1.1.1.1", now })).rejects.toThrow("connection refused");
  });
});

describe("notifications", () => {
  let mock: Server;
  let mockStatus = 200;
  const received: { auth?: string; body: Record<string, unknown> }[] = [];

  beforeAll(async () => {
    mock = createServer((req, res) => {
      let data = "";
      req.on("data", (c) => (data += c));
      req.on("end", () => {
        received.push({ auth: req.headers.authorization, body: JSON.parse(data) });
        res.writeHead(mockStatus, { "Content-Type": "application/json" }).end(mockStatus === 200 ? '{"id":"x"}' : '{"message":"boom"}');
      });
    });
    await new Promise<void>((r) => mock.listen(0, "127.0.0.1", r));
    const port = (mock.address() as { port: number }).port;
    Object.assign(process.env, {
      EMAIL_PROVIDER: "resend",
      RESEND_API_URL: `http://127.0.0.1:${port}/emails`,
      RESEND_API_KEY: "test-key",
      LEAD_NOTIFY_FROM: "RenewBrick <leads@example.test>",
      LEAD_NOTIFY_TO: "owner@example.test",
    });
  });
  afterAll(() => new Promise<void>((r) => mock.close(() => r())));
  beforeEach(() => {
    received.length = 0;
    mockStatus = 200;
  });

  async function createLead(over: Record<string, unknown> = {}) {
    const r = await submitEnquiry(submission(over), { db, ip: null, now });
    if (r.status !== "created") throw new Error(r.status);
    return r.id;
  }

  it("sends through the provider and marks the enquiry sent", async () => {
    const id = await createLead({ name: "<b>Asha</b>", email: "asha@example.test" });
    expect(await notifyEnquiry(db, id, getEmailSender())).toBe("sent");
    expect(received[0].auth).toBe("Bearer test-key");
    expect(received[0].body.to).toEqual(["owner@example.test"]);
    expect(received[0].body.reply_to).toBe("asha@example.test");
    expect(String(received[0].body.html)).toContain("&lt;b&gt;Asha&lt;/b&gt;");
    const { rows } = await db.query<{ notification_status: string; notification_sent_at: unknown }>(
      "SELECT notification_status, notification_sent_at FROM enquiries WHERE id = $1",
      [id],
    );
    expect(rows[0].notification_status).toBe("sent");
    expect(rows[0].notification_sent_at).not.toBeNull();
  });

  it("records a provider failure, keeps the lead, and succeeds on retry", async () => {
    const id = await createLead();
    mockStatus = 500;
    expect(await notifyEnquiry(db, id, getEmailSender())).toBe("failed");
    let row = (await db.query<{ notification_status: string; notification_attempts: number; notification_last_error: string }>(
      "SELECT * FROM enquiries WHERE id = $1",
      [id],
    )).rows[0];
    expect(row.notification_status).toBe("failed");
    expect(row.notification_attempts).toBe(1);
    expect(row.notification_last_error).toContain("500");

    mockStatus = 200;
    const summary = await retryPendingNotifications(db, getEmailSender(), 0);
    expect(summary).toEqual({ sent: 1, failed: 0, skipped: 0 });
    row = (await db.query<{ notification_status: string; notification_attempts: number; notification_last_error: string }>(
      "SELECT * FROM enquiries WHERE id = $1",
      [id],
    )).rows[0];
    expect(row.notification_status).toBe("sent");
    expect(row.notification_attempts).toBe(2);
  });

  it("records a configuration error when the provider is not configured", async () => {
    const id = await createLead();
    const saved = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    try {
      expect(await notifyEnquiry(db, id, getEmailSender())).toBe("failed");
    } finally {
      process.env.RESEND_API_KEY = saved;
    }
    const { rows } = await db.query<{ notification_last_error: string }>("SELECT notification_last_error FROM enquiries WHERE id = $1", [id]);
    expect(rows[0].notification_last_error).toContain("RESEND_API_KEY");
  });

  it("does not send twice for an enquiry already notified", async () => {
    const id = await createLead();
    await notifyEnquiry(db, id, getEmailSender());
    expect(await notifyEnquiry(db, id, getEmailSender())).toBe("skipped");
    expect(received).toHaveLength(1);
  });
});
