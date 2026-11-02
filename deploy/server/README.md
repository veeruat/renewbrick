# RenewBrick on the shared server

Since 2 November 2026, renewbrick.com is served from the GraceBill Lightsail server (13.201.211.121),
behind the shared **edge nginx** (repo `grace-edge`). The edge owns ports 80/443 and routes
`renewbrick.com` and `www` to this stack. DNS is at GoDaddy (`A @` → 13.201.211.121, `www` → `@`).
The AWS hosting in [docs/DEPLOY_AWS.md](../../docs/DEPLOY_AWS.md) (S3, CloudFront, Route 53, API
Gateway, Lambda) has been removed. Only Amazon SES is still used, to send the enquiry emails.

```
 :443 renewbrick.com ──► edge (TLS passthrough) ──► renewbrick-proxy:8443 ──► releases/current (static out/)
                                                                         └─► /api/* ─► contact:8080 ─► Amazon SES (SMTP) ─► inbox
 :80  renewbrick.com ──► edge ──► renewbrick-proxy:8081 ──► Let's Encrypt challenges; everything else → https
```

nginx copies the old CloudFront rules: `www` redirects to `renewbrick.com`, trailing slashes are
removed, `/about` serves `about.html`, and missing pages get the real 404 page. Security headers come
from each build's `out/_headers`.

**Enquiry form:** the `contact` container runs the contact-form Lambda code **exactly as written in
`infra/aws/renewbrick-site.yaml`**, loaded by `scripts/lib/contact-function.mjs`. That template is still
the single source of truth for validation, the honeypot/timing/origin checks and the email text, and
`tests/unit/contact-function.test.ts` tests it. Only the sending differs: SMTP to SES instead of the
SES API ([contact/mail.mjs](contact/mail.mjs), tested in `tests/unit/contact-server.test.ts`).
nginx adds a per-IP rate limit (6/min, burst 5) and a 64 KB body cap.

## Files

| File | What it is |
|---|---|
| `ship.sh` | Runs on your PC: builds a commit in a clean checkout, runs the unit tests, uploads the site and the form's source, makes it live |
| `renewbrick.sh` | Server control: `start`, `activate`, `rollback`, `releases`, `cert`, `status`, `logs`, `reload-proxy` |
| `docker-compose.yml` | nginx (32 MB), the form service (96 MB), acme.sh (certificate renewals). No host ports |
| `nginx/default.conf.template` | Routing, headers, `/api` to the form service |
| `contact/` | The form service: `server.mjs`, `mail.mjs`, `Dockerfile`, `nodemailer` pinned |
| `env.example` | Recipient, sender, SES SMTP settings, `CERT_EMAIL`, `SERVER_IP` |

Releases live in `~/renewbrick/releases/<date>-<commit>`. `current` points at the live one, and
swapping it is atomic. The last five releases are kept for rollback.

## Ship a change

```bash
RB_SERVER=ubuntu@13.201.211.121 deploy/server/ship.sh                    # HEAD, indexing off
RB_SERVER=ubuntu@13.201.211.121 deploy/server/ship.sh --ref <branch>     # another commit
SITE_INDEXING=true RB_SERVER=ubuntu@13.201.211.121 deploy/server/ship.sh  # launch build
~/renewbrick/renewbrick.sh rollback                                       # on the server: previous site release
```

Commit first: `ship.sh` builds what Git has, not your working folder.

## Email (Amazon SES, us-east-1, account 867344436558)

- Identity: `renewbrick.com`, with Easy DKIM. Its three `_domainkey` CNAMEs must exist in GoDaddy DNS.
- SMTP login: IAM user `ses-smtp-renewbrick`, allowed only to send as `noreply@renewbrick.com`. Its
  SMTP credentials are only in `~/renewbrick/.env` on the server.
- While the account is in the SES sandbox, the recipient (`renewbrick@gmail.com`) must be a verified
  SES identity: click the link in the "Amazon Web Services – Email Address Verification Request" email.
- **Don't delete the `renewbrick-site` CloudFormation stack.** It still owns the SES identities, and
  deleting it removes them. Its other resources are already gone.

To check the form without sending email, post with the hidden field filled. It answers `ok` and sends nothing:

```bash
curl -s -X POST https://renewbrick.com/api/contact -H 'Content-Type: application/json' \
  -H 'Origin: https://renewbrick.com' -d '{"website":"test"}'
```

## Certificate

`renewbrick.sh cert` gets the Let's Encrypt certificate through the edge's port 80 (it checks that both
names point at `SERVER_IP` first). acme.sh renews it by itself. This cron line makes nginx load the
renewed certificate:

```
10 3 * * 0  $HOME/renewbrick/renewbrick.sh reload-proxy >> $HOME/renewbrick-proxy-reload.log 2>&1
```
