// Server-side only. Enquiry submission: validate → spam checks → rate limit →
// durable insert → (afterwards) notify. Success is returned only after the
// row is committed.

import { createHmac, randomInt } from "node:crypto";
import type { Db } from "@/lib/db";
import { escapeHtml, notificationRecipients, type EmailSender } from "@/lib/email";
import {
  CONSENT_VERSION,
  cityOptions,
  contactMethodOptions,
  optionLabel,
  propertyTypeOptions,
  serviceOptions,
  validateEnquiry,
  type EnquiryField,
} from "./schema";

export const RATE_LIMITS = { windowMinutes: 15, perWindow: 5, perDay: 20 };
/** Submissions faster than this after the form rendered are treated as automated. */
export const MIN_FILL_MS = 3_000;
const DUPLICATE_WINDOW_MINUTES = 10;
const MAX_NOTIFICATION_ATTEMPTS = 8;

export type SubmitContext = {
  db: Db;
  ip: string | null;
  now?: Date;
};

export type SubmitResult =
  | { status: "created" | "duplicate"; reference: string; id: number }
  | { status: "invalid"; errors: Partial<Record<EnquiryField, string>> }
  | { status: "rejected"; message: string }
  | { status: "rate-limited"; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function hashIp(ip: string | null) {
  if (!ip) return null;
  const salt = process.env.LEAD_HASH_SALT;
  if (!salt && process.env.NODE_ENV === "production") throw new Error("LEAD_HASH_SALT is not set");
  return createHmac("sha256", salt ?? "dev-only-salt").update(ip).digest("hex").slice(0, 32);
}

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function makeReference(now: Date) {
  const d = now.toISOString().slice(2, 10).replace(/-/g, "");
  let tail = "";
  for (let i = 0; i < 4; i++) tail += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `RB-${d}-${tail}`;
}

export async function submitEnquiry(raw: Record<string, unknown>, ctx: SubmitContext): Promise<SubmitResult> {
  const now = ctx.now ?? new Date();

  // Honeypot: a field hidden from people; bots tend to fill it.
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return { status: "rejected", message: "Your enquiry could not be accepted." };
  }
  const startedAt = Number(raw.startedAt);
  if (!Number.isFinite(startedAt) || now.getTime() - startedAt < MIN_FILL_MS) {
    return { status: "rejected", message: "Please take a moment to check your details, then submit again." };
  }

  const key = typeof raw.idempotencyKey === "string" ? raw.idempotencyKey : "";
  if (!UUID.test(key)) return { status: "rejected", message: "Please reload the page and try again." };

  const result = validateEnquiry(raw);
  if (!result.ok) return { status: "invalid", errors: result.errors };
  const lead = result.value;

  // A retried request with the same key returns the original enquiry.
  const existing = await ctx.db.query<{ id: number; reference: string }>(
    "SELECT id, reference FROM enquiries WHERE idempotency_key = $1",
    [key],
  );
  if (existing.rows[0]) return { status: "duplicate", ...existing.rows[0] };

  const ipHash = hashIp(ctx.ip);
  if (ipHash) {
    const counts = await ctx.db.query<{ recent: string; daily: string }>(
      `SELECT
         count(*) FILTER (WHERE created_at > $2::timestamptz - make_interval(mins => $3)) AS recent,
         count(*) AS daily
       FROM enquiry_attempts
       WHERE ip_hash = $1 AND created_at > $2::timestamptz - interval '1 day'`,
      [ipHash, now.toISOString(), RATE_LIMITS.windowMinutes],
    );
    const { recent, daily } = counts.rows[0] ?? { recent: "0", daily: "0" };
    if (Number(recent) >= RATE_LIMITS.perWindow || Number(daily) >= RATE_LIMITS.perDay) {
      return {
        status: "rate-limited",
        message: "We have received several enquiries from your connection. Please try again later, or contact us by phone or WhatsApp.",
      };
    }
    await ctx.db.query("INSERT INTO enquiry_attempts (ip_hash, created_at) VALUES ($1, $2)", [ipHash, now.toISOString()]);
  }

  // The same person re-sending the same request within minutes is a duplicate.
  const dup = await ctx.db.query<{ id: number; reference: string }>(
    `SELECT id, reference FROM enquiries
     WHERE phone = $1 AND service = $2 AND description = $3
       AND created_at > $4::timestamptz - make_interval(mins => $5)
     ORDER BY created_at DESC LIMIT 1`,
    [lead.phone, lead.service, lead.description, now.toISOString(), DUPLICATE_WINDOW_MINUTES],
  );
  if (dup.rows[0]) return { status: "duplicate", ...dup.rows[0] };

  const sourcePath = typeof raw.sourcePath === "string" && raw.sourcePath.startsWith("/") ? raw.sourcePath.slice(0, 200) : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = makeReference(now);
    const inserted = await ctx.db.query<{ id: number; reference: string }>(
      `INSERT INTO enquiries
         (reference, idempotency_key, created_at, name, phone, email, city, locality, property_type,
          service, description, contact_method, consent_at, consent_version, source_path, ip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$3,$13,$14,$15)
       ON CONFLICT DO NOTHING
       RETURNING id, reference`,
      [
        reference, key, now.toISOString(), lead.name, lead.phone, lead.email, lead.city, lead.locality,
        lead.propertyType, lead.service, lead.description, lead.contactMethod, CONSENT_VERSION, sourcePath, ipHash,
      ],
    );
    if (inserted.rows[0]) return { status: "created", ...inserted.rows[0] };

    // Conflict: either a concurrent request with the same key, or a reference collision.
    const raced = await ctx.db.query<{ id: number; reference: string }>(
      "SELECT id, reference FROM enquiries WHERE idempotency_key = $1",
      [key],
    );
    if (raced.rows[0]) return { status: "duplicate", ...raced.rows[0] };
  }
  throw new Error("Could not allocate a unique enquiry reference");
}

type LeadRow = {
  id: number;
  reference: string;
  created_at: string | Date;
  name: string;
  phone: string;
  email: string | null;
  city: string;
  locality: string;
  property_type: string;
  service: string;
  description: string;
  contact_method: string;
  source_path: string | null;
};

export function buildNotification(lead: LeadRow) {
  const rows: [string, string][] = [
    ["Reference", lead.reference],
    ["Received", new Date(lead.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST"],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email ?? "—"],
    ["Preferred contact", optionLabel(contactMethodOptions, lead.contact_method)],
    ["City", optionLabel(cityOptions, lead.city)],
    ["Locality", lead.locality],
    ["Property type", optionLabel(propertyTypeOptions, lead.property_type)],
    ["Service", optionLabel(serviceOptions, lead.service)],
    ["Submitted from", lead.source_path ?? "—"],
  ];
  const subject = `New enquiry ${lead.reference} — ${optionLabel(serviceOptions, lead.service)}, ${optionLabel(cityOptions, lead.city)}`;
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Description:", lead.description].join("\n");
  const html = `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><th align="left" style="color:#4B5B6E">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join("")}</table><p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(lead.description)}</p>`;
  return { subject, text, html, replyTo: lead.email ?? undefined };
}

/** Sends the notification for one enquiry and records the outcome. Never throws. */
export async function notifyEnquiry(db: Db, id: number, send: EmailSender): Promise<"sent" | "failed" | "skipped"> {
  const { rows } = await db.query<LeadRow & { notification_status: string }>(
    "SELECT * FROM enquiries WHERE id = $1",
    [id],
  );
  const lead = rows[0];
  if (!lead || lead.notification_status === "sent") return "skipped";

  try {
    await send({ to: notificationRecipients(), ...buildNotification(lead) });
    await db.query(
      `UPDATE enquiries SET notification_status = 'sent', notification_sent_at = now(),
         notification_attempts = notification_attempts + 1, notification_last_error = NULL
       WHERE id = $1`,
      [id],
    );
    return "sent";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .query(
        `UPDATE enquiries SET notification_status = 'failed',
           notification_attempts = notification_attempts + 1, notification_last_error = $2
         WHERE id = $1`,
        [id, message.slice(0, 500)],
      )
      .catch(() => {});
    console.error(`[enquiry] notification failed for id=${id}: ${message}`);
    return "failed";
  }
}

/** Retries every unsent notification. Used by `npm run leads:retry`. */
export async function retryPendingNotifications(db: Db, send: EmailSender, olderThanSeconds = 60) {
  const { rows } = await db.query<{ id: number }>(
    `SELECT id FROM enquiries
     WHERE notification_status <> 'sent' AND notification_attempts < $1
       AND created_at < now() - make_interval(secs => $2)
     ORDER BY created_at`,
    [MAX_NOTIFICATION_ATTEMPTS, olderThanSeconds],
  );
  const summary = { sent: 0, failed: 0, skipped: 0 };
  for (const { id } of rows) summary[await notifyEnquiry(db, Number(id), send)]++;
  await db.query("DELETE FROM enquiry_attempts WHERE created_at < now() - interval '2 days'");
  return summary;
}
