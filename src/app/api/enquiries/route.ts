import { randomUUID } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { DatabaseNotConfiguredError, getDb } from "@/lib/db";
import { getEmailSender } from "@/lib/email";
import { notifyEnquiry, submitEnquiry } from "@/lib/enquiry/service";

const MAX_BODY_BYTES = 16_384;

function clientIp(req: NextRequest) {
  // Behind a reverse proxy (nginx, Vercel), the first X-Forwarded-For entry is the client.
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
}

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const isForm = (req.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
  const respond = (status: number, body: Record<string, unknown>) => {
    if (!isForm) return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
    // No-JavaScript fallback: redirect to a confirmation or back to the form.
    const target = body.reference
      ? `/contact/received?ref=${encodeURIComponent(String(body.reference))}`
      : `/contact?error=${status === 422 ? "invalid" : status === 429 ? "rate" : "server"}#enquiry`;
    // Relative Location: req.url may carry the server's internal host (e.g.
    // localhost behind a proxy), which would send the visitor elsewhere.
    return new Response(null, { status: 303, headers: { Location: target, "Cache-Control": "no-store" } });
  };

  if (!sameOrigin(req)) return respond(403, { ok: false, message: "Forbidden." });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return respond(413, { ok: false, message: "Your enquiry is too long." });
  }

  let raw: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return respond(413, { ok: false, message: "Your enquiry is too long." });
    if (isForm) {
      raw = Object.fromEntries(new URLSearchParams(text));
      raw.idempotencyKey ||= randomUUID();
      raw.startedAt ||= "0";
    } else {
      const parsed: unknown = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
      raw = parsed as Record<string, unknown>;
    }
  } catch {
    return respond(400, { ok: false, message: "We could not read your enquiry. Please try again." });
  }

  try {
    const db = getDb();
    const result = await submitEnquiry(raw, { db, ip: clientIp(req) });

    switch (result.status) {
      case "invalid":
        return respond(422, { ok: false, errors: result.errors, message: "Please check the highlighted fields." });
      case "rejected":
        return respond(422, { ok: false, message: result.message });
      case "rate-limited":
        return respond(429, { ok: false, message: result.message });
      case "created":
        // The lead is committed; send the notification after the response.
        after(() => notifyEnquiry(db, result.id, getEmailSender()));
        return respond(201, { ok: true, reference: result.reference });
      case "duplicate":
        return respond(200, { ok: true, reference: result.reference, duplicate: true });
    }
  } catch (err) {
    console.error(
      "[enquiry] storage failed:",
      err instanceof DatabaseNotConfiguredError ? err.message : err instanceof Error ? err.message : "unknown error",
    );
    return respond(503, {
      ok: false,
      message: "We could not save your enquiry just now. Please try again in a few minutes, or contact us directly.",
    });
  }
}
