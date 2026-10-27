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

if (!business.legalName) blockers.push("business.legalName is not set (src/content/site.ts)");
// With no form, WhatsApp or phone is the only way to request an inspection.
if (!business.whatsapp && !business.phone) {
  blockers.push("No WhatsApp or phone number set (src/content/site.ts) — inspection buttons have no channel");
} else {
  if (!business.whatsapp) warnings.push("business.whatsapp is not set — inspection buttons will open a phone call");
  if (!business.phone) warnings.push("business.phone is not set — no call buttons");
}
if (!business.email) warnings.push("business.email is not set");
if (!business.logoFile || !existsSync(path.join(process.cwd(), "public", business.logoFile))) {
  blockers.push(`Approved logo file missing: public${business.logoFile ?? "/brand/…"}`);
}
for (const s of services) if (!s.confirmed) blockers.push(`Service scope not confirmed: ${s.name}`);
for (const f of faqs) if (f.needsConfirmation) blockers.push(`FAQ answer needs policy confirmation: "${f.question}"`);
for (const p of principles) if (p.confirm) blockers.push(`Operating principle needs confirmation: "${p.title}"`);
if (!legalStatus.privacy.approved) blockers.push("Privacy policy is an unapproved draft");
if (!legalStatus.terms.approved) blockers.push("Website terms are an unapproved draft");
for (const p of pendingPolicies) warnings.push(`Pending policy: ${p}`);

// These are read at build time.
if (!process.env.SITE_URL) warnings.push("SITE_URL is not set in this shell — set it for the production build");
else if (!process.env.SITE_URL.startsWith("https://")) blockers.push("SITE_URL must use https:// in production");
if (process.env.SITE_INDEXING !== "true") warnings.push("SITE_INDEXING is not true in this shell — the production build must set it");

console.log(`\nLaunch check — ${blockers.length} blocker(s), ${warnings.length} note(s)\n`);
for (const b of blockers) console.log(`  ✗ ${b}`);
for (const w of warnings) console.log(`  · ${w}`);
console.log();
process.exit(blockers.length ? 1 : 0);
