# SEO

## Implemented

- Unique title (≤ 75 chars with suffix) and meta description per page, one `h1`, logical heading order, clean URLs. Enforced by `tests/e2e/seo.spec.ts`.
- **Search phrases where Google weighs them:** each title leads with the plain phrase people type ("Home Renovation in Hyderabad, Bangalore & Warangal", "Bathroom Renovation in …", "Home Renovation & Repair Services in Bangalore"). Each `h1` starts with a visible keyword line (the home hero eyebrow, `seoHeading` on service pages, the job name and cities on job pages) above the display headline. No hidden text.
- **Job pages** (`src/content/jobs.ts`, route `src/app/services/[job]`): bathroom renovation, kitchen renovation, waterproofing & leak repair, house painting, flooring & tiling. Each expands a work package from the renovation page (R2–R5) with signs, scope, approach, notes and FAQs, so the content is specific rather than a city-swapped template. No prices, durations or warranties.
- **Internal links with descriptive anchors:** city pages link to every job ("Bathroom Renovation in Bangalore"), job pages link to every city and to related jobs, the renovation page links each package to its job page, the home page lists "Popular work", and the footer lists all jobs on every page.
- Canonical URL on every page from `SITE_URL`. Trailing slashes redirect to the canonical form.
- Open Graph and Twitter metadata, plus a generated 1200×630 sharing image (`src/app/opengraph-image.tsx`).
- `sitemap.xml` lists the 15 canonical indexable pages with a `lastmod` (the build date). Legal pages join it automatically once approved.
- `robots.txt`: in production, allow all and point to the sitemap. In any other build, disallow everything.
- Structured data, built only from verified fields: `HomeAndConstructionBusiness` sitewide (a local-business type: telephone, contact point, logo, image, service areas, and an offer catalogue of services and jobs), `Service` on service and job pages, `BreadcrumbList`. No ratings, reviews or address: those must be real before they're marked up.
- Real 404 status for unknown URLs: only known pages are exported, and the host serves `404.html` with status 404.
- All page content and metadata are in the initial HTML (static prerender). Fast by construction: no client-side data fetching, self-hosted fonts, no third-party scripts.
- Not done on purpose: neighbourhood or city × job "doorway" pages (Google treats near-duplicate location pages as spam), keyword stuffing, hidden text, and fake reviews or ratings.

## Indexing switch

`SITE_INDEXING=true` at build time is the **only** way to make the site indexable. The GitHub deploy reads the repository variable `SITE_INDEXING` (set to `true` on 2026-11-17 at the owner's request). Without it, pages carry `<meta name="robots" content="noindex, nofollow">`, the server adds `X-Robots-Tag: noindex, nofollow`, and robots.txt disallows everything. Draft legal pages and `/contact/sent` stay `noindex` regardless.

## Ranking plan (owner actions, in order of impact)

The website is now technically ready. For local searches ("renovation near me", "bathroom renovation Bangalore"), Google ranks mostly on **relevance, distance and prominence**, and much of that is decided off the website.

1. **Google Search Console** (day 1): add a *Domain property* for renewbrick.com (DNS TXT record at GoDaddy), submit `https://renewbrick.com/sitemap.xml`, and use URL Inspection → *Request indexing* on the home page, the three city pages and the five job pages. Without this, discovery can take weeks.
2. **Google Business Profile** (the biggest single factor for local results and the map pack): create it as a *service-area business* (no public address needed), primary category **Home improvement / Renovation contractor**, secondary categories such as *Bathroom remodeler*, *Kitchen remodeler*, *Waterproofing service*, *Painter*, *Flooring contractor*. Service areas: Hyderabad, Bangalore, Warangal. Phone +91 95150 53064, website https://renewbrick.com. Add real photos, the services list and opening hours. Google verifies by video or postcard.
3. **Reviews:** after every completed job, send the customer the Google review link. Reviews are a major local ranking factor and the strongest trust signal. Reply to every review. Never buy or script reviews.
4. **Consistent listings (citations)**: list the same name, phone and website on Justdial, Sulekha, IndiaMART, Houzz, Bing Places and Apple Business Connect. Keep the details identical everywhere.
5. **Social profiles:** create Instagram/Facebook/LinkedIn pages and add their URLs to `business.socialProfiles` in `src/content/site.ts` (they're emitted as `sameAs`).
6. **Real project photos:** before/after photos of completed work (with the owner's permission) are the best content to add next, on the job pages and the Business Profile. Send them and they'll be added as a project gallery.
7. **Bing Webmaster Tools:** import from Search Console.
8. **Measure:** after 2–4 weeks, check Search Console → Performance for the queries the site appears for, and Pages for indexing problems. Expand the job pages that get impressions.

Realistic expectations: a new domain usually takes **2–6 months** to rank for competitive city searches. Specific searches ("terrace waterproofing Warangal", "bathroom renovation Bangalore apartment") come first; broad ones ("renovation Hyderabad") come later, and the map pack depends mostly on the Business Profile and reviews. No ranking position can be guaranteed by anyone.

## Launch checklist

1. Build production with `SITE_URL=https://renewbrick.com` and `SITE_INDEXING=true` (the GitHub deploy does this once the repository variable is set).
2. Verify: `curl -sI https://renewbrick.com/` shows no `X-Robots-Tag`. View source for `index, follow` and the correct canonical. `/robots.txt` should show `Allow: /` and the sitemap URL.
3. Confirm that `www` and `http://` redirect to `https://renewbrick.com`.
4. Validate structured data with the Rich Results Test and validator.schema.org. Eligibility for rich results isn't guaranteed.
5. Then follow the ranking plan above, starting with Search Console.
