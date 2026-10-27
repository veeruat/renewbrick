# Launch checklist

The site is launch-ready only when every box is ticked **and** `npm run check:launch` exits 0.

## Business information (owner)
- [ ] Approved logo file saved at `public/brand/renewbrick-logo.png`
- [ ] Legal business name confirmed (`business.legalName`)
- [ ] WhatsApp and phone numbers verified (`src/content/site.ts`); WhatsApp prefill and call links tested from a phone
- [x] Public email: renewbrick@gmail.com (supplied by the owner)
- [ ] Scope of each service confirmed (`confirmed: true` in `services.ts`)
- [ ] Property management availability confirmed (stays "planned" unless operating)
- [ ] Pending policies answered and FAQ answers updated: inspection fee, estimate format, materials, warranty, annual plans, message retention
- [ ] "Progress updates with photographs" principle confirmed as standard practice
- [ ] No unfinished placeholders remain (search for `[` in the legal pages)

## Legal
- [ ] Privacy policy reviewed; brackets replaced (hosting provider, retention, DPDP Act items); approved in `legal.ts`
- [ ] Website terms reviewed; brackets replaced; approved in `legal.ts`

## Hosting (requires the owner's go-ahead)
- [ ] Domain in the owner's account
- [ ] Static host (or VM) account in the owner's name
- [ ] Production build with `SITE_URL=https://…` and `SITE_INDEXING=true`
- [ ] HTTPS active; non-preferred host and http 301 to the canonical https host

## Verification on the production URL
- [ ] Every route works at 360, 390, 768, 1024 and 1440px
- [ ] "Request a Site Inspection" opens WhatsApp with the prefilled message on Android and iPhone; Call buttons dial correctly
- [ ] `curl -I` shows security headers and **no** `X-Robots-Tag`; meta robots is `index, follow`; robots.txt allows; sitemap correct
- [ ] A missing URL returns a 404 status
- [ ] Search Console domain verified and sitemap submitted
- [ ] PageSpeed Insights (mobile) run on home, one service page and contact; results recorded

## Known limitations to disclose at launch
- No enquiry form: WhatsApp/phone/email only, so conversations are not captured by the website
- No project portfolio (until authentic, approved photographs exist)
- No analytics (add only after deciding configuration and consent)
