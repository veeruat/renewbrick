// Server-side only. Lead notification email via Resend's HTTP API (no SDK).

export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type EmailSender = (message: EmailMessage) => Promise<void>;

export class EmailNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(`Email notification is not configured (missing ${missing.join(", ")})`);
  }
}

export function notificationRecipients(): string[] {
  return (process.env.LEAD_NOTIFY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Chooses the sender from EMAIL_PROVIDER:
 *   "resend"  — sends through Resend (requires RESEND_API_KEY, LEAD_NOTIFY_FROM, LEAD_NOTIFY_TO)
 *   "console" — development only; logs that a notification would be sent, without lead contents
 */
export function getEmailSender(): EmailSender {
  const provider = process.env.EMAIL_PROVIDER ?? (process.env.NODE_ENV === "production" ? "resend" : "console");

  if (provider === "console") {
    if (process.env.NODE_ENV === "production") {
      return async () => {
        throw new EmailNotConfiguredError(["EMAIL_PROVIDER=resend"]);
      };
    }
    return async (m) => {
      console.info(`[email:console] would send "${m.subject}" to ${m.to.length} recipient(s)`);
    };
  }

  return async (message) => {
    const missing = [
      !process.env.RESEND_API_KEY && "RESEND_API_KEY",
      !process.env.LEAD_NOTIFY_FROM && "LEAD_NOTIFY_FROM",
      message.to.length === 0 && "LEAD_NOTIFY_TO",
    ].filter(Boolean) as string[];
    if (missing.length) throw new EmailNotConfiguredError(missing);

    // RESEND_API_URL exists only so tests can point at a local mock server.
    const res = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend responded ${res.status}: ${body.slice(0, 300)}`);
    }
  };
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
