# Editing content

All business facts and page copy live in `src/content/`. After editing, run `npm run build` (and `npm run check:launch` before launch). There's no CMS in Phase 1.

| File | What it controls |
| --- | --- |
| `site.ts` | Legal name, phone, WhatsApp, email, address, logo file, service areas, pending policies |
| `services.ts` | The four services: names, availability (`available` / `planned`), homepage summaries, page headlines, SEO titles, WhatsApp prefill, `confirmed` flag |
| `service-pages.ts` | Detailed content for each service page (scope packages, cycles, checklists, deliverables, dependencies, FAQ selection) |
| `locations.ts` | Cities: situations, planning notes, FAQs, coverage note. **Adding an entry creates a new city page**, plus sitemap, menu and form option |
| `faqs.ts` | All FAQs. `needsConfirmation: true` marks answers that depend on an unconfirmed policy |
| `process.ts` | The seven-stage process and its caveat |
| `home.ts` | Hero copy, scenarios, operating principles (`confirm: true` = needs owner confirmation) |
| `legal.ts` | Approval status of the privacy policy and terms |

## Rules

- **Only verified facts.** Leave unknown values `null`, and components hide them. Never add years in business, project counts, testimonials, certifications, prices, warranties or addresses unless the owner has verified them.
- **Contact details** use E.164 format: `"+919876543210"`. Setting `whatsapp` makes the WhatsApp buttons appear site-wide, and `phone` the call buttons.
- **Logo:** save the approved file as `public/brand/renewbrick-logo.png` (or SVG, and update `logoFile`). Its real dimensions are read automatically, so it's never stretched.
- **Availability:** a `planned` service shows a "Planned — not yet bookable" label and "Register interest" calls to action. Change it to `available` only when the service is genuinely operating.
- **Confirming content:** when the owner approves a service's scope, set `confirmed: true`. When a policy is decided, rewrite the FAQ answer and set `needsConfirmation: false`.
- **Legal pages:** after professional review, replace every `[bracketed]` item in `src/app/privacy-policy/page.tsx` and `src/app/terms/page.tsx`, then set `approved: true` and `approvedOn` in `legal.ts`. That removes the draft notice, allows indexing and adds the pages to the sitemap.
- **Project photographs:** add a projects section or page only with authentic, approved photographs and written publication permission. Record each image in `docs/ASSETS.md`.
- **SEO titles** should stay under about 60 characters (the " | RenewBrick" suffix is added automatically). Tests fail above 75 characters including the suffix.
