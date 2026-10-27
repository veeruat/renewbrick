// Exports enquiries to CSV for the owner-managed lead register.
// Usage: npm run leads:export -- [--since 2026-01-01] > leads.csv
// The output contains personal data: store it privately, never in the repository.
import { getDb } from "@/lib/db";

const sinceIdx = process.argv.indexOf("--since");
const since = sinceIdx > -1 ? process.argv[sinceIdx + 1] : "1970-01-01";

const columns = [
  "reference", "created_at", "name", "phone", "email", "city", "locality", "property_type", "service",
  "contact_method", "description", "notification_status", "outcome", "outcome_notes",
];

const csv = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : v == null ? "" : String(v);
  // Neutralise spreadsheet formula injection and quote every field.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

getDb()
  .query<Record<string, unknown>>(
    `SELECT ${columns.join(", ")} FROM enquiries WHERE created_at >= $1::timestamptz ORDER BY created_at`,
    [since],
  )
  .then(({ rows }) => {
    process.stdout.write(columns.join(",") + "\n");
    for (const row of rows) process.stdout.write(columns.map((c) => csv(row[c])).join(",") + "\n");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
