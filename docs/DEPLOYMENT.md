# Deployment

The site is **fully static**. `npm run build` writes plain HTML, CSS and JS to `out/`, with no server code, database or secrets. Nothing has been deployed yet. Purchases, DNS changes and going live need the owner's explicit go-ahead.

> **Chosen hosting: AWS S3 + CloudFront.** The full plan, template and deploy script are in [DEPLOY_AWS.md](DEPLOY_AWS.md). The options below remain as alternatives.

## Build

```bash
SITE_URL=https://www.example.com SITE_INDEXING=true npm run build
```

- `SITE_URL`: the canonical origin (no trailing slash). It's baked into canonical URLs, the sitemap and social tags.
- `SITE_INDEXING=true`: **production only**. Without it, every page is `noindex`, robots.txt blocks crawlers, and `out/_headers` adds `X-Robots-Tag: noindex`. Use that for previews.

The build also writes `out/_headers` (security headers, asset caching, social image type).

## Option A: static host (recommended, free tier available)

**Cloudflare Pages** or **Netlify**. Both read `out/_headers` natively, serve `404.html` for missing pages, and provide free HTTPS. Their free tiers comfortably cover a site like this; check current plan limits before signing up.

- Build command: `npm run build`
- Output directory: `out`
- Environment variables: `SITE_URL`, `SITE_INDEXING=true` (production); leave `SITE_INDEXING` unset for preview branches
- Node version: 20 or newer

Connect the owner's Git repository so each push rebuilds, or upload `out/` directly.

## Option B: nginx on a VM

Copy `out/` to the server (e.g. `/var/www/renewbrick`) and use:

```nginx
server {
  listen 443 ssl http2;
  server_name www.example.com;
  root /var/www/renewbrick;
  # ssl_certificate / ssl_certificate_key managed by certbot

  location / {
    try_files $uri $uri.html $uri/index.html =404;
  }
  error_page 404 /404.html;
  location = /opengraph-image { default_type image/png; }
  location /_next/static/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location = /_headers { return 404; }

  # Mirror out/_headers:
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
}
server {                      # http (both hosts) → https www
  listen 80;
  server_name example.com www.example.com;
  return 301 https://www.example.com$request_uri;
}
server {                      # https apex → https www
  listen 443 ssl http2;
  server_name example.com;
  # ssl_certificate / ssl_certificate_key managed by certbot
  return 301 https://www.example.com$request_uri;
}
```

Then run `sudo certbot --nginx -d example.com -d www.example.com`. Pick one preferred host and make it match `SITE_URL`.

## Option C: `start.sh` / `stop.sh`

For local review or a simple VM without nginx:

```bash
./start.sh --port 3000          # builds if out/ is missing, serves in the background
./start.sh --build              # rebuild first
./stop.sh
```

This uses `scripts/serve-static.mjs`, a small dependency-free server that applies `out/_headers`. It binds to 127.0.0.1 by default (`HOST=0.0.0.0` to expose it). For public traffic, put it behind nginx or use Option A/B for HTTPS.

## Domain and DNS (requires the owner's go-ahead)

1. Register or confirm the domain in an account the business owner controls.
2. Static host: add the custom domain in its dashboard and create the DNS records it shows. VM: `A` records for the apex and `www` pointing to the server IP.
3. Wait for HTTPS to become active, confirm the non-preferred host redirects to the preferred one, then rebuild with the final `SITE_URL`.

## Updating content

Edit `src/content/*` → `npm run build` → redeploy `out/` (automatic on a Git-connected static host). Check dependencies monthly with `npm audit` and `npm outdated`.

## Enquiry form

The enquiry form posts to `/api/contact`, which on AWS is an API Gateway + Lambda + SES function defined in `infra/aws/renewbrick-site.yaml` (see `docs/DEPLOY_AWS.md`, section 6a). On any other static host, `/api/contact` doesn't exist: the form would show "We could not send your enquiry", so either route `/api/contact` to an equivalent function or remove the form.
