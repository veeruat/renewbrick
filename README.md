# RenewBrick website

Marketing website and enquiry system for **RenewBrick — Restore & Elevate**, a property transformation and care company serving Hyderabad and Warangal.

- **Stack:** Next.js 16.4 (App Router, Cache Components, Turbopack) · React 19.3 · TypeScript 5.9 · Tailwind CSS 4.3 · PostgreSQL (`pg` 8.23) · Resend HTTP API for notifications
- **Rendering:** every public page is prerendered to static HTML; only `POST /api/enquiries` runs per request
- **Status:** see [PROJECT_STATUS.md](PROJECT_STATUS.md) — the site is **not launch-ready** until the launch check passes

## Quick start (local)

Requires Node.js ≥ 20.9.

```bash
npm ci
npm run dev:db          # terminal 1 — local Postgres-compatible DB (PGlite) on :54329, data in .pglite/
cp .env.example .env.local
# in .env.local set:
#   DATABASE_URL=postgres://postgres@127.0.0.1:54329/postgres
#   DATABASE_SSL=false
#   EMAIL_PROVIDER=console
npm run dev             # terminal 2 — http://localhost:3000
```

`dev:db` is for local development and tests only. Production needs a real PostgreSQL database.

## Start / stop (production server)

```bash
./start.sh                 # builds if needed, starts in the background, waits until healthy
./start.sh --port 8080     # choose the port (or set PORT)
./start.sh --build         # force a rebuild first
./start.sh --migrate       # apply db/schema.sql before starting
./stop.sh                  # graceful stop (SIGTERM, then SIGKILL after 15s)
```

Settings come from the environment or `.env.production` / `.env` beside the scripts (`PORT`, default 3000; `HOST`, default 127.0.0.1). The PID and log live in `.run/`. The scripts work on Linux and in Git Bash on Windows. For an always-on server, prefer the systemd unit in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), which restarts on failure and on reboot.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build + standalone bundle (`.next/standalone`) |
| `npm start` | Run the standalone server in the foreground |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |
| `npm test` | Unit tests (Vitest + PGlite) |
| `npm run test:e2e` | End-to-end tests (Playwright, against the production build) |
| `npm run check` | All of the above in order |
| `npm run screenshots -- <url>` | Full-page screenshots of every route at 390px and 1440px |
| `npm run db:migrate` | Apply `db/schema.sql` to `DATABASE_URL` |
| `npm run leads:retry` | Re-send failed/pending enquiry notifications |
| `npm run leads:export` | Export enquiries to CSV (contains personal data) |
| `npm run check:launch` | Launch readiness check — fails while unverified facts remain |

## Project layout

```
src/content/      ← all business facts and page copy (edit here — see docs/CONTENT.md)
src/app/          ← routes (one folder per page), sitemap, robots, OG image, API route
src/components/   ← design-system components and the SVG drawings
src/lib/          ← enquiry validation/service, database, email, SEO helpers
db/schema.sql     ← lead database schema
scripts/          ← migrate, retry, export, launch check, dev DB, screenshots
tests/            ← unit (Vitest) and e2e (Playwright) tests
docs/             ← deployment, leads, content, design, SEO, assets, launch checklist
```

## Documentation

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): hosting recommendation, costs, server setup, domain/DNS, HTTPS
- [docs/LEADS.md](docs/LEADS.md): enquiry storage, notifications, failure recovery, lead register, backups
- [docs/CONTENT.md](docs/CONTENT.md): editing business details, services, locations, FAQs, legal status
- [docs/DESIGN.md](docs/DESIGN.md): design concept, tokens, typography, components
- [docs/SEO.md](docs/SEO.md): SEO implementation and the Search Console checklist
- [docs/ASSETS.md](docs/ASSETS.md): logo, fonts, illustrations and usage rights
- [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md): the launch acceptance checklist
- [docs/ROUTES.md](docs/ROUTES.md): route and page inventory
