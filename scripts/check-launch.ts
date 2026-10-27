// Launch readiness check: fails while unverified business facts, unapproved
// legal drafts or unconfirmed content remain.
// Usage: npm run check:launch
import { existsSync } from "node:fs";
import path from "node:path";
import { faqs } from "@/content/faqs";
import { principles } from "@/content/home";
import { legalStatus } from "@/content/legal";
import { business, pendingPolicies } from "@/content/site";
import { services } from "@/content/services";

const blockers: string[] = [];
const warnings: string[] = [];

for (const key of ["legalName", "phone", "whatsapp", "email"] as const) {
  if (!business[key]) blockers.push(`business.${key} is not set (src/content/site.ts)`);
}
if (!business.logoFile || !existsSync(path.join(process.cwd(), "public", business.logoFile))) {
  blockers.push(`Approved logo file missing: public${business.logoFile ?? "/brand/…"}`);
}
for (const s of services) if (!s.confirmed) blockers.push(`Service scope not confirmed: ${s.name}`);
for (const f of faqs) if (f.needsConfirmation) blockers.push(`FAQ answer needs policy confirmation: "${f.question}"`);
for (const p of principles) if (p.confirm) blockers.push(`Operating principle needs confirmation: "${p.title}"`);
if (!legalStatus.privacy.approved) blockers.push("Privacy policy is an unapproved draft");
if (!legalStatus.terms.approved) blockers.push("Website terms are an unapproved draft");
for (const p of pendingPolicies) warnings.push(`Pending policy: ${p}`);

const env = ["SITE_URL", "SITE_INDEXING", "DATABASE_URL", "LEAD_HASH_SALT", "RESEND_API_KEY", "LEAD_NOTIFY_FROM", "LEAD_NOTIFY_TO"];
for (const e of env) if (!process.env[e]) warnings.push(`Environment variable not set in this shell: ${e}`);
if (process.env.SITE_URL && !process.env.SITE_URL.startsWith("https://")) blockers.push("SITE_URL must use https:// in production");

console.log(`\nLaunch check — ${blockers.length} blocker(s), ${warnings.length} note(s)\n`);
for (const b of blockers) console.log(`  ✗ ${b}`);
for (const w of warnings) console.log(`  · ${w}`);
console.log();
process.exit(blockers.length ? 1 : 0);
