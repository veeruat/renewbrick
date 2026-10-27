# Enquiries: storage, notifications and recovery

## Flow

1. The visitor submits the form at `/contact`. It's enhanced with JavaScript, and a plain HTML POST works without it.
2. `POST /api/enquiries` checks: same origin, body ≤ 16 KB, honeypot field, a minimum fill time of 3 s, idempotency key, field validation (shared with the browser), and rate limits (5 per 15 minutes and 20 per day per hashed IP).
3. The enquiry is **inserted into PostgreSQL**. Only after the insert commits does the visitor see success, with a reference such as `RB-261026-K7QM`. If storage fails, the visitor sees an error and is asked to retry or contact the team directly. Success is never shown for an unsaved enquiry.
4. After the response is sent, a notification email goes to `LEAD_NOTIFY_TO` via Resend. The result is recorded on the row: `notification_status` (`pending` / `sent` / `failed`), `notification_attempts` and `notification_last_error`.

Duplicate protection: the browser sends a UUID per form instance, so retries and double-clicks return the original reference. An identical enquiry (same phone, service and description) within 10 minutes is also treated as a duplicate.

No endpoint exposes stored enquiries. `GET /api/enquiries` returns 405.

Phone and WhatsApp buttons only open a call or chat. They do not record anything, so log those conversations in the register yourself.

## If notification email fails

The enquiry is already saved. To recover:

```bash
npm run leads:retry      # re-sends every pending/failed notification (max 8 attempts each)
```

Schedule it to catch failures automatically (cron, every 10 minutes):

```
*/10 * * * * cd /srv/renewbrick/app && set -a && . ./.env.production && npx tsx scripts/retry-notifications.ts >> .run/retry.log 2>&1
```

The command exits with code 2 if any notification still fails, so cron mail or monitoring can alert on it. To see what failed:

```sql
SELECT reference, created_at, notification_attempts, notification_last_error
FROM enquiries WHERE notification_status <> 'sent' ORDER BY created_at;
```

Common causes: missing or expired `RESEND_API_KEY`, an unverified sending domain, or a wrong `LEAD_NOTIFY_FROM`.

## Lead register (Phase 1: owner-managed, no CRM)

Each enquiry has `outcome` (`new`, `contacted`, `inspection`, `estimate-sent`, `won`, `lost`, `spam`) and `outcome_notes`. Update them with any Postgres client (for example the hosting provider's SQL console):

```sql
UPDATE enquiries SET outcome = 'won', outcome_notes = 'Bathroom renovation, approved 12 Nov', outcome_updated_at = now()
WHERE reference = 'RB-261026-K7QM';
```

Or export to a spreadsheet: `npm run leads:export -- --since 2026-11-01 > leads.csv`. The file contains personal data, so keep it private and out of the repository (`*.csv` is gitignored).

## Backups and restoration

- **Managed Postgres:** enable automated daily backups and point-in-time recovery. Note the retention period.
- **Self-hosted Postgres:** nightly logical dump, copied off the server and encrypted:

  ```bash
  pg_dump --format=custom --no-owner "$DATABASE_URL" > renewbrick-$(date +%F).dump
  ```

- **Restore** into an empty database:

  ```bash
  createdb renewbrick_restore
  pg_restore --no-owner --dbname=postgres://…/renewbrick_restore renewbrick-2026-11-01.dump
  ```

  Then point `DATABASE_URL` at it, or rename databases during a maintenance window.
- **Test a restore** at least once before launch and then quarterly. A backup that has never been restored is unverified.

## Data retention

Not yet decided (it's a pending policy). Once the owner sets a period, delete or anonymise older rows, for example:

```sql
DELETE FROM enquiries WHERE created_at < now() - interval '<period>';
```

Rate-limit attempts are pruned automatically after 2 days by `leads:retry`.
