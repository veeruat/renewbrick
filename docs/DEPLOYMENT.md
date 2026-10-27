# Deployment

Nothing has been deployed. Every step below needs the business owner's accounts and explicit authorisation, especially purchases, DNS changes and production deployment.

## Recommended setup

| Concern | Recommendation | Why |
| --- | --- | --- |
| Hosting | A small Linux VM (Ubuntu 24.04 LTS, 1 vCPU / 1–2 GB RAM) running the standalone Node server behind nginx | Fits the "single Node process" architecture, with no platform lock-in; `start.sh`/systemd included |
| Database | Managed PostgreSQL (e.g. Neon, Supabase, AWS RDS) in an Indian region, or PostgreSQL on the same VM with nightly off-site backups | Durable storage with point-in-time recovery on managed tiers |
| Email | Resend (HTTP API, no SDK dependency) with a verified sending domain | Simple, server-side only; failures are tracked and retryable |
| TLS | Let's Encrypt via certbot (free, auto-renewing) | HTTPS everywhere; HSTS is sent automatically when `SITE_URL` is https |

**Alternative:** Vercel (Pro plan — the free Hobby plan is for non-commercial use) plus managed Postgres. Rate limiting is stored in the database, so it works on serverless too.

### Recurring costs: verify current pricing before purchase

Costs below are indicative only; providers change pricing.

- **VM:** roughly USD 5–15/month for a small instance (or an existing server the owner already runs).
- **Managed Postgres:** free tiers exist (Neon, Supabase) but have limits and may pause idle databases; paid tiers start around USD 10–25/month. Self-hosted Postgres on the VM costs nothing extra but requires you to own backups.
- **Resend:** free tier (at the time of writing, about 3,000 emails/month with a daily cap), which is ample for enquiry notifications.
- **Domain:** about INR 800–1,500/year for a .com or .in.

No paid service has been signed up for or configured.

## Server setup (Ubuntu VM)

```bash
# 1. Node.js 20+ (e.g. via NodeSource or nvm) and nginx
sudo apt update && sudo apt install -y nginx git
# 2. App user and code (owner-controlled repository)
sudo adduser --system --group --home /srv/renewbrick renewbrick
sudo -u renewbrick git clone <owner's repo URL> /srv/renewbrick/app
cd /srv/renewbrick/app
# 3. Configuration — create .env.production from .env.example (chmod 600)
sudo -u renewbrick cp .env.example .env.production && sudo chmod 600 .env.production
# 4. Install, build, migrate, start
sudo -u renewbrick ./start.sh --build --migrate
```

`SITE_URL` and `SITE_INDEXING` are read at **build** time. Rebuild (`./start.sh --build` after `./stop.sh`) whenever they change.

### systemd (recommended for always-on)

`/etc/systemd/system/renewbrick.service`:

```ini
[Unit]
Description=RenewBrick website
After=network.target

[Service]
User=renewbrick
WorkingDirectory=/srv/renewbrick/app
EnvironmentFile=/srv/renewbrick/app/.env.production
Environment=NODE_ENV=production HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=on-failure
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now renewbrick
```

Use either systemd or `start.sh`/`stop.sh`, not both at once.

### nginx

```nginx
server {
  listen 80;
  server_name example.com www.example.com;
  location / { return 301 https://www.example.com$request_uri; }
}
server {
  listen 443 ssl http2;
  server_name example.com;
  # certificates from certbot
  return 301 https://www.example.com$request_uri;
}
server {
  listen 443 ssl http2;
  server_name www.example.com;
  # ssl_certificate / ssl_certificate_key managed by certbot
  client_max_body_size 32k;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then `sudo certbot --nginx -d example.com -d www.example.com`. Pick **one** preferred host (www or apex) and make it match `SITE_URL`; redirect the other with a 301 as above.

The rate limiter trusts the first `X-Forwarded-For` entry. Expose the Node port only on 127.0.0.1 so clients cannot spoof that header by connecting directly.

## Domain and DNS (requires owner authorisation)

1. Register or confirm the domain in an account the business owner controls.
2. Create `A` records for the apex and `www` pointing to the VM's public IP (or the records your host specifies).
3. For Resend: add the SPF, DKIM (and optionally DMARC) records it shows for the sending domain, then verify in the Resend dashboard.
4. Wait for propagation, run certbot, then rebuild with the final `SITE_URL`.

## Least-privilege credentials

- Database: create an application role that can only `SELECT, INSERT, UPDATE` on `enquiries` and `SELECT, INSERT, DELETE` on `enquiry_attempts` (plus sequence usage). Run migrations with a separate owner role.
- Resend: an API key restricted to "sending access" for the one domain.
- Never put secrets in `NEXT_PUBLIC_*` variables or commit `.env*` files (gitignored).

## Previews and staging

Build without `SITE_INDEXING=true`. Every page then carries `noindex`, responses send `X-Robots-Tag: noindex, nofollow`, and robots.txt disallows all. Before launch, confirm the production build has `SITE_INDEXING=true` and that `curl -I https://www.example.com` shows **no** `X-Robots-Tag`.

## Updating

```bash
./stop.sh && git pull && ./start.sh --build --migrate    # or: systemctl restart after building
```

Dependency checks: run `npm audit` and `npm outdated` monthly and before each release.
