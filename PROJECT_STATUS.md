# PROJECT_STATUS — RenewBrick website

_Last updated: 2026-10-26 (session 1)_

## How to resume (new session)
1. Read this file, then `git log --oneline` and `git status`.
2. Run `npm ci && npm run check` to verify the previous state.
3. Continue from **Next actions** below. Don't rebuild working features or change the stack without a clear reason.

## Confirmed business facts
- Brand **RenewBrick**, tagline **Restore & Elevate**, descriptor **Property Transformation & Care**
- Colours: navy #092B4D, gold #D9A23A, white #FFFFFF, light grey #F5F7FA
- Service areas: Hyderabad and Warangal, Telangana
- Logo supplied in conversation (navy "renew" + gold "brick", "RESTORE & ELEVATE", "Property Transformation") — **file still needed in the repo** at `public/brand/renewbrick-logo.png`

## Missing information (blocks launch)
- Logo file in the repository (the pasted image could not be saved from chat)
- Legal contracting and invoicing entity name
- Verified phone, WhatsApp and email
- Domain / existing website; repository host; hosting choice
- Confirmation of each service's scope; whether property management is operating (currently **planned**)
- Policies: inspection fee, estimate format, payment terms, warranty, annual maintenance plans, own-materials, cancellation, data retention
- Approved project photographs and publication permission (none, so the portfolio is omitted)
- Professional review of the privacy policy and terms

## Agreed scope (Phase 1)
All 12 routes in the brief; enquiry form with durable storage and email notification; SEO; accessibility; no accounts, payments, booking, CMS, CRM or analytics.

## Stack and dependencies (exact, from the lockfile)
Next.js 16.4.3 (App Router, Cache Components, Partial Prefetching, Turbopack, `output: standalone`) · React 19.3.0 · TypeScript 5.9.3 · Tailwind CSS 4.3.3 · pg 8.23.1 · Node ≥ 20.9 (developed on 24.18).
Dev: Vitest 5.0.5, Playwright 1.64.1, @axe-core/playwright 4.14.0, @electric-sql/pglite 0.5.12 + pglite-socket 0.2.15 (local/test DB only), tsx, ESLint 9 + eslint-config-next 16.4.3.
Email: Resend via plain `fetch`, no SDK. Fonts: Cormorant Garamond + Nunito Sans (OFL) via `next/font`. These replaced Instrument Serif + Archivo at the owner's request for a more peaceful style.

## Design decisions
- Concept **"The Drawing Set"**: numbered sheets, hairline rules, title blocks, original SVG architectural drawings captioned as illustrations (see `docs/DESIGN.md`).
- Gold text only on navy; `gold-ink` #8A5A0B for gold text on light (brand gold is 2.29:1 on white).
- Logo enlarged twice at the owner's request: header 96px tall, logo 64px (mobile) / 72px (≥640px); footer logo 80px.
- Tab icon is the owner's short form **"rnb"** with a gold "b" (`src/app/icon.svg` + `apple-icon.png`).
- Letter spacing tightened at the owner's request (headlines −0.018em, body −0.006em, labels 0.06em).
- Header is **white** so the supplied logo (navy/gold on white) is used without alteration.
- Every unverified fact is `null` in `src/content/site.ts`, and the UI hides it (e.g. WhatsApp buttons appear only once a number is set).
- Property management is shown as **Planned — not yet bookable**, with register-interest CTAs.
- Unknown city slugs return a true 404 via `src/proxy.ts` (Cache Components otherwise serves a soft 404).
- No-JS form fallback redirects with a relative `Location` header (the absolute one pointed at the server's internal host).

## Completed
- All Phase 1 pages, responsive layouts, mobile menu, sticky header, mobile action bar
- Distinct compositions for each service page; location pages driven by content
- Enquiry pipeline: shared validation, honeypot, minimum fill time, same-origin check, body limit, DB-backed rate limiting, idempotency and duplicate detection, durable insert before success, post-response notification with tracked status, retry script, CSV export, owner-managed outcome register
- SEO: metadata, canonicals, OG image, sitemap, robots, JSON-LD (Organization/Service/BreadcrumbList), environment-gated indexing, security headers
- Draft privacy policy and terms (noindex, out of the sitemap, visible draft notice)
- `start.sh` / `stop.sh` (Linux + Git Bash on Windows), systemd and nginx docs
- Docs: README, DEPLOYMENT, LEADS, CONTENT, DESIGN, SEO, ASSETS, ROUTES, LAUNCH_CHECKLIST; `.env.example`; launch check script

## Tests and results (session 1, run locally on Windows 11)
See the "Test evidence" section at the end of this file.

## Blockers
Missing business information and accounts listed above; no deployment target or credentials. No paid services have been used.

## Next actions
1. Owner: save the logo to `public/brand/renewbrick-logo.png`; rebuild; re-run screenshots to check header and footer fit.
2. Owner: supply the facts under "Missing information"; update `src/content/*`; set `confirmed` flags.
3. Choose hosting/database/email (recommendation in `docs/DEPLOYMENT.md`); create accounts in the owner's name.
4. Professional review of the legal drafts, then approve in `src/content/legal.ts`.
5. Deploy to a preview (indexing off) → run the launch checklist → production with `SITE_INDEXING=true`.
6. Re-measure performance with PageSpeed Insights on the deployed URL. If homepage/contact mobile scores stay below 90, investigate reducing hydration cost.

## Test evidence (2026-10-27, Windows 11, Node 24.18, local production build)
| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass, 0 errors |
| `npm run lint` | Pass, 0 problems |
| `npm test` (Vitest, PGlite) | **30/30 pass**: validation, phone normalisation, durable insert, idempotency, duplicates, honeypot/timing/key rejection, rate limiting, storage failure propagates, email sent / provider 500 / not configured / retry / no double send |
| `npm run build` | Pass. All 12 Phase 1 routes static (○/SSG); only `/api/enquiries` dynamic |
| `npm run test:e2e` (Playwright, standalone server, desktop + Pixel 7) | **73 pass, 2 skipped by design** (device-specific menu tests). Covers: all routes 200 with one h1 and no overflow; real 404s; internal links; skip link; desktop dropdown and mobile menu (Escape); service preselect; planned label; unique titles/descriptions/canonicals; JSON-LD; noindex/robots/sitemap; security headers; form errors and focus; stored lead + notification `sent`; double-click → one row; no-JS submission; **DB down → error, never success**; cross-origin/malformed/GET rejected; axe WCAG 2.2 AA (no serious/critical) on every route, both devices |
| Screenshot sweep | 13 routes × 360/390/768/1024/1440 px: no horizontal overflow; visually reviewed home, services, contact, header |
| `start.sh` / `stop.sh` | Build → start → duplicate-start guard → routes 200 → stop verified (Git Bash on Windows) |
| Lighthouse 13.5 (mobile, default 4× CPU) | Accessibility 100, Best Practices 100 on all 4 pages tested; SEO 66 **only because the test build is intentionally noindex**; Performance 56–60 (TBT 1.4–2.1 s), but the machine's benchmark index was 275–641 (contended; Lighthouse considers < 1000 unreliable) |
| Lighthouse, CPU throttle calibrated to this machine (1.4×) | Performance: renovation 93, home 73, contact 75; CLS ≈ 0; FCP 0.9–1.1 s; LCP 3.0–3.4 s (simulated slow 4G). **Lab estimates, not field data**: re-measure with PageSpeed Insights after deployment |
| `npm run check:launch` | **Fails, as expected**: 15 blockers (contact details, legal name, logo file, service confirmations, 5 policy-dependent FAQs, 1 principle, 2 legal drafts) |

Not run: tests against a real managed PostgreSQL or the real Resend API (no credentials); deployed-site checks; Search Console.
Observed once, not reproducible since: `start.sh` started on port 3000 despite `PORT=3400`. Hardened with `--port` and automatic cleanup when the health check fails.
