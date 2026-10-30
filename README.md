# RenewBrick website

Marketing website for **RenewBrick — Restore & Elevate**, a property transformation and care company serving Hyderabad, Bangalore and Warangal.

- **Stack:** Next.js 16.4 (App Router, static export) · React 19.3 · TypeScript 5.9 · Tailwind CSS 4.3
- **Output:** a static site in `out/`, plus one small AWS Lambda function for the enquiry form. No database or secrets. Host it on Cloudflare Pages, Netlify, nginx or any static host.
- **Contact:** an enquiry form on `/contact` emails each enquiry to RenewBrick's inbox (AWS Lambda + SES behind `/api/contact`; nothing is stored). "Request a Site Inspection" opens WhatsApp or a call once a number is set, otherwise the form.
- **Deploys:** GitHub Actions tests every push; pushes to `main` create/update AWS S3 + CloudFront and publish the site ([docs/DEPLOY_AWS.md](docs/DEPLOY_AWS.md)).
- **Status:** see [PROJECT_STATUS.md](PROJECT_STATUS.md). The site is **not launch-ready** until `npm run check:launch` passes.

## Quick start

Requires Node.js ≥ 20.9.

```bash
npm ci
npm run dev            # http://localhost:3000 (development)
```

## Start / stop (serve the built site)

```bash
./start.sh                 # builds if out/ is missing, serves in the background, waits until healthy
./start.sh --port 8080     # choose the port (or set PORT)
./start.sh --build         # rebuild first
./stop.sh                  # stop
```

`HOST` defaults to 127.0.0.1 (use 0.0.0.0 to expose it). The PID and log live in `.run/`. Works on Linux and in Git Bash on Windows. For public hosting see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static export to `out/`, plus `out/_headers` |
| `npm start` | Serve `out/` in the foreground |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright, against `out/`) |
| `npm run check` | All of the above in order |
| `npm run screenshots -- <url>` | Full-page screenshots of every route |
| `npm run check:launch` | Launch readiness check; fails while unverified facts remain |

## Project layout

```
src/content/      ← all business facts and page copy (edit here — see docs/CONTENT.md)
src/app/          ← routes (one folder per page), sitemap, robots, icons, OG image
src/components/   ← design-system components and the SVG drawings
src/lib/          ← contact links (WhatsApp/phone/email), SEO helpers, logo loader
.github/workflows ← CI/CD: test, then deploy to AWS from main
infra/aws/        ← CloudFormation: website stack + one-time GitHub/AWS bootstrap
scripts/          ← postbuild headers, static server, AWS deploy, launch check, screenshots
tests/            ← unit (Vitest) and e2e (Playwright) tests
docs/             ← deployment, content, design, SEO, assets, routes, launch checklist
```

## Documentation

- [docs/DEPLOY_AWS.md](docs/DEPLOY_AWS.md): **chosen hosting**, AWS S3 + CloudFront via GitHub Actions: one-time setup, day-to-day, rollback
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): alternative hosting options, nginx, domain/DNS
- [docs/CONTENT.md](docs/CONTENT.md): editing business details, services, locations, FAQs
- [docs/DESIGN.md](docs/DESIGN.md): design concept, tokens, typography, components
- [docs/SEO.md](docs/SEO.md): SEO implementation and the Search Console checklist
- [docs/ASSETS.md](docs/ASSETS.md): logo, icon, fonts, illustrations and usage rights
- [docs/ROUTES.md](docs/ROUTES.md): route inventory
- [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md): launch acceptance checklist
