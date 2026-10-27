# SEO

## Implemented

- Unique title (≤ 75 chars with suffix) and meta description per page, one `h1`, logical heading order, clean URLs. Enforced by `tests/e2e/seo.spec.ts`.
- Canonical URL on every page from `SITE_URL`. Trailing slashes 308-redirect to the canonical form.
- Open Graph and Twitter metadata, plus a generated 1200×630 sharing image (`src/app/opengraph-image.tsx`).
- `sitemap.xml` lists the 10 canonical indexable pages. Legal pages join it automatically once approved.
- `robots.txt`: in production, allow all and point to the sitemap. In any other build, disallow everything.
- Structured data, built only from verified fields: `Organization` (sitewide; telephone, email, logo and legal name appear only once set), `Service` on service pages, `BreadcrumbList`. No ratings, reviews or address.
- Real 404 status for unknown URLs: only known pages are exported, and hosts serve `404.html` with status 404.
- All page content and metadata are in the initial HTML (static prerender).
- Local themes used naturally in titles and copy: home and apartment renovation in Hyderabad, property maintenance in Hyderabad, renovation and civil works in Warangal, rental-ready property services. No keyword stuffing or neighbourhood pages.

## Indexing switch

`SITE_INDEXING=true` at build time is the **only** way to make the site indexable. Without it, pages carry `<meta name="robots" content="noindex, nofollow">`, `out/_headers` adds `X-Robots-Tag: noindex, nofollow`, and robots.txt disallows everything. Use this for previews and staging. nginx doesn't read `_headers`, but the meta tag and robots.txt still apply there.

## Launch checklist

1. Build production with `SITE_URL=https://<preferred host>` and `SITE_INDEXING=true`.
2. Verify: `curl -sI https://<host>/` shows no `X-Robots-Tag`. View source for `index, follow` and the correct canonical. `/robots.txt` should show `Allow: /` and the sitemap URL.
3. Confirm that the non-preferred host (www/apex) and `http://` 301-redirect to the canonical HTTPS host.
4. Validate structured data with the Rich Results Test and validator.schema.org. Eligibility for rich results isn't guaranteed.
5. **Google Search Console:** add a *Domain property* (DNS TXT verification, done by the owner at their DNS provider), then submit `https://<host>/sitemap.xml` under Sitemaps. Use URL Inspection on the homepage and one service page, and request indexing.
6. **Bing Webmaster Tools:** import from Search Console, or verify separately and submit the sitemap.
7. After 2–4 weeks, review Coverage/Pages and Core Web Vitals in Search Console. Field data needs real traffic.
8. Redirects: no previous site is known. If an old site exists, add 301s at the host (a `_redirects` file on Cloudflare Pages/Netlify, or `return 301` in nginx) before switching DNS.

No rankings or traffic are promised.
