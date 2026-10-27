# Launch checklist

The site is launch-ready only when every box is ticked **and** `npm run check:launch` exits 0.

## Business information (owner)
- [ ] Approved logo file saved at `public/brand/renewbrick-logo.png`
- [ ] Legal contracting and invoicing entity confirmed (`business.legalName`)
- [ ] Phone, WhatsApp and email verified (`src/content/site.ts`), and each link tested from a phone
- [ ] Scope of each service confirmed (`confirmed: true` in `services.ts`)
- [ ] Property management availability confirmed (stays "planned" unless operating)
- [ ] Pending policies answered and FAQ answers updated: inspection fee, estimate format, materials, warranty, annual plans, retention
- [ ] "Progress updates with photographs" principle confirmed as standard practice
- [ ] No invented claims or unfinished placeholders remain (search for `[` in legal pages, and `null` in `site.ts`)

## Legal
- [ ] Privacy policy reviewed by a professional; brackets replaced; `legal.ts` approved with date
- [ ] Website terms reviewed; brackets replaced; `legal.ts` approved with date
- [ ] Privacy policy names the actual database host/region and email provider

## Infrastructure (requires owner authorisation)
- [ ] Domain in the owner's account; DNS records created
- [ ] Hosting, database and email accounts in the owner's name, with costs accepted
- [ ] Production database created; `npm run db:migrate` run; least-privilege app role in use
- [ ] Database backups enabled **and a test restore completed**
- [ ] Resend domain verified (SPF/DKIM); `LEAD_NOTIFY_FROM` / `LEAD_NOTIFY_TO` set
- [ ] HTTPS active; non-preferred host and http 301 to the canonical https host
- [ ] `LEAD_HASH_SALT` set to a random secret; `.env.production` mode 600
- [ ] `leads:retry` cron installed

## Verification on the production URL
- [ ] Real test enquiry submitted → row stored → notification email received
- [ ] Notification failure drill: break the API key, submit, confirm `failed` status, restore the key, run `npm run leads:retry`, confirm `sent`
- [ ] All routes and navigation work at 360, 390, 768, 1024 and 1440px
- [ ] `curl -I` shows no `X-Robots-Tag`; meta robots is `index, follow`; robots.txt allows; sitemap correct
- [ ] Search Console domain verified and sitemap submitted
- [ ] PageSpeed Insights (mobile) run on home, one service page and contact; results recorded
- [ ] Test enquiries removed or marked `outcome = 'spam'`

## Known limitations to disclose at launch
- No project portfolio (intentionally omitted until authentic, approved photographs exist)
- No analytics (add only after deciding configuration and consent)
- Phone/WhatsApp conversations are not captured by the website
