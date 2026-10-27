// Re-sends notification emails for enquiries whose notification is pending or
// failed. Safe to run repeatedly (e.g. from cron every 10 minutes).
// Usage: npm run leads:retry
import { getDb } from "@/lib/db";
import { getEmailSender } from "@/lib/email";
import { retryPendingNotifications } from "@/lib/enquiry/service";

retryPendingNotifications(getDb(), getEmailSender())
  .then((summary) => {
    console.log(`Notifications — sent: ${summary.sent}, failed: ${summary.failed}, skipped: ${summary.skipped}`);
    process.exit(summary.failed > 0 ? 2 : 0);
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
