# Deployment plan: AWS S3 + CloudFront

**Status:** prepared and tested locally, **not executed**. Running it creates billable AWS resources (roughly USD 0.50–1 a month) and changes DNS for renewbrick.com, so it needs the owner's go-ahead. GraceBill and its server are not touched.

## 1. What gets built

```
Visitor ──► DNS (Route 53) ──► CloudFront ──────────────────────────► S3 bucket (private)
            renewbrick.com      • HTTPS certificate (ACM, free)        only CloudFront can read it
            www.renewbrick.com  • URL function: /about → about.html,   (Origin Access Control)
                                  www → renewbrick.com, no trailing /
                                • security headers policy
                                • cache at edges incl. India
```

Everything is defined in one CloudFormation template, [`infra/aws/renewbrick-site.yaml`](../infra/aws/renewbrick-site.yaml):

| Resource | Purpose |
| --- | --- |
| S3 bucket | Holds `out/`. Private, encrypted, HTTPS-only, versioned (old versions kept 30 days for rollback). Kept even if the stack is deleted |
| Origin Access Control + bucket policy | Only this CloudFront distribution can read the bucket |
| ACM certificate | Free HTTPS for `renewbrick.com` and `www.renewbrick.com` |
| CloudFront Function | Clean URLs, canonical host, trailing-slash redirects (tested in `tests/unit/cloudfront-function.test.ts`) |
| Response headers policy | CSP, HSTS, nosniff, frame-deny, referrer and permissions policies (same as `out/_headers`) |
| CloudFront distribution | HTTPS-only, HTTP/2+3, compression, `PriceClass_200` (includes Indian edge locations), real 404 page |
| Route 53 records | `renewbrick.com` and `www` → CloudFront (only when DNS is in Route 53) |
| Deploy policy | Least-privilege IAM policy for routine deploys (upload + cache refresh only) |

Routine publishing is [`scripts/deploy-aws.sh`](../scripts/deploy-aws.sh): build → upload hashed assets (cached for 1 year) → upload pages (always revalidated) → refresh the CloudFront cache.

## 2. Decisions

| Decision | Recommendation | Why |
| --- | --- | --- |
| Region | **us-east-1** for the stack | CloudFront only accepts certificates from us-east-1. Visitors are served from Indian edge locations regardless |
| DNS | **Option A: move DNS hosting to Route 53**; the domain stays registered at GoDaddy | GoDaddy DNS can't point the bare `renewbrick.com` at CloudFront (it has no ALIAS record type). Route 53 can, and validates the certificate automatically |
| Main address | **renewbrick.com**; `www` redirects to it | Short, matches the brand |
| First go-live | **Indexing off** (`noindex`) | Launch blockers remain (WhatsApp/phone number, logo file, legal approval). The site is reachable but kept out of Google until `scripts/deploy-aws.sh --index` |

*Option B (keep DNS at GoDaddy)* is described in section 6. It works, but only with `www.renewbrick.com` as the main address, and relies on GoDaddy forwarding for the bare domain.

## 3. Cost (indicative; check current AWS pricing)

| Item | Expected monthly cost |
| --- | --- |
| S3 storage (~4 MB) and requests | ≈ $0.00 |
| CloudFront: always-free tier covers 1 TB transfer and 10 M requests/month, plus 2 M function invocations | $0 at this site's traffic |
| Route 53 hosted zone (Option A) | $0.50, plus $0.40 per million DNS queries |
| ACM certificate | Free |
| **Total** | **≈ $0.50–1 (about ₹45–90)** |

## 4. Prerequisites

1. **AWS access with admin rights for the one-time setup.** Sign in on this machine with `aws login` (AWS CLI 2.35 is installed) or `aws configure sso`. Never paste access keys into chat or commit them.
2. **GoDaddy login** for renewbrick.com (to change nameservers in Option A, or add records in Option B).
3. The repository with dependencies installed (`npm ci`).

## 5. One-time setup: Option A (Route 53, recommended)

**Step 1. Sign in and confirm the account.**
```bash
aws login
aws sts get-caller-identity          # check this is the intended AWS account
```

**Step 2. Create the Route 53 hosted zone.**
```bash
aws route53 create-hosted-zone --name renewbrick.com --caller-reference "renewbrick-$(date +%s)"
```
Note the zone ID (`/hostedzone/Z…`, use the part after the slash) and the four `NameServers`.

**Step 3. Point the domain at Route 53 (in GoDaddy).**
GoDaddy → My Products → renewbrick.com → DNS → Nameservers → *Change* → *I'll use my own nameservers* → enter the four AWS nameservers → Save.
- Effect: GoDaddy's parking page stops. The domain has no email (MX) or other records today, so nothing else breaks. If you add Google Workspace email later, its records go in Route 53.
- Wait for propagation (usually under an hour, up to 48 hours) and check:
  ```bash
  nslookup -type=NS renewbrick.com 8.8.8.8      # should list the awsdns nameservers
  ```

**Step 4. Create the infrastructure** (about 5–15 minutes; the certificate validates itself through Route 53).
```bash
aws cloudformation deploy --region us-east-1 --stack-name renewbrick-site \
  --template-file infra/aws/renewbrick-site.yaml \
  --parameter-overrides DomainName=renewbrick.com PrimaryHost=apex HostedZoneId=Z0123456789ABC \
  --capabilities CAPABILITY_IAM
```

**Step 5. Publish the site** (indexing off).
```bash
scripts/deploy-aws.sh --dry-run      # preview the upload
scripts/deploy-aws.sh                # build for https://renewbrick.com, upload, refresh cache
```

**Step 6. Verify** (section 8).

## 6. One-time setup: Option B (keep DNS at GoDaddy)

1. Sign in as in step 1.
2. Create the stack with `www` as the main address and no hosted zone:
   ```bash
   aws cloudformation deploy --region us-east-1 --stack-name renewbrick-site \
     --template-file infra/aws/renewbrick-site.yaml \
     --parameter-overrides DomainName=renewbrick.com PrimaryHost=www \
     --capabilities CAPABILITY_IAM
   ```
3. While the stack waits on the certificate, get the two validation records:
   ```bash
   aws acm list-certificates --region us-east-1
   aws acm describe-certificate --region us-east-1 --certificate-arn <arn> \
     --query "Certificate.DomainValidationOptions[].ResourceRecord"
   ```
   Add both as **CNAME** records in GoDaddy DNS. The stack then continues on its own.
4. When the stack finishes, in GoDaddy DNS: delete the parking `A` records and add a CNAME `www` → the `DistributionDomainName` output (`d…cloudfront.net`).
5. GoDaddy → Forwarding: forward `renewbrick.com` → `https://www.renewbrick.com` (permanent 301).
6. Publish: `scripts/deploy-aws.sh`.

Limitation: `https://renewbrick.com` (bare, with https) depends on GoDaddy's forwarding service, which AWS doesn't control.

## 7. Every update after that

```bash
scripts/deploy-aws.sh               # rebuild, upload changes, refresh cache (live within minutes)
scripts/deploy-aws.sh --index       # LAUNCH: same, but allow search indexing
```

`--index` should only be used once `npm run check:launch` passes. For routine deploys, use an IAM user or role with just the stack's `DeployPolicyArn` attached rather than admin rights.

## 8. Verification

```bash
curl -sI https://renewbrick.com/                       # 200, plus content-security-policy and strict-transport-security
curl -sI https://www.renewbrick.com/about              # 301 → https://renewbrick.com/about
curl -sI http://renewbrick.com/                        # 301 → https
curl -sI https://renewbrick.com/about/                 # 301 → /about
curl -s -o /dev/null -w "%{http_code}\n" https://renewbrick.com/no-such-page   # 404
curl -sI https://renewbrick.com/opengraph-image        # content-type: image/png
curl -sI https://<bucket>.s3.amazonaws.com/index.html  # 403 (bucket is private)
```

Then in a browser, on a phone and a desktop: every page, the menu, and the contact buttons. After the `--index` launch, also confirm robots.txt allows crawling, pages have no `noindex`, then follow `docs/SEO.md` (Search Console).

## 9. Rollback

- **Bad content:** check out the previous commit and run `scripts/deploy-aws.sh`, or restore earlier object versions in S3 (kept 30 days).
- **Remove everything:** `aws cloudformation delete-stack --region us-east-1 --stack-name renewbrick-site`. The bucket is retained by design; empty and delete it manually if wanted. To return DNS to GoDaddy, set the nameservers back to `ns65.domaincontrol.com` and `ns66.domaincontrol.com`.

## 10. Security

The bucket is private and only CloudFront can read it. Connections are HTTPS-only (TLS 1.2+) with HSTS, and the bucket policy rejects plain HTTP. Versioning protects against bad uploads. Deploys can run with a least-privilege policy. The site holds no secrets or personal data.

## 11. Tested before handover

| Check | Result |
| --- | --- |
| `cfn-lint` 1.58 on the template (us-east-1) | Pass, no findings |
| CloudFront Function unit tests (code extracted from the template) | Pass: clean URLs, canonical-host and trailing-slash redirects with query strings, OG image passthrough, and **every exported page maps to an existing file in `out/`** |
| `scripts/deploy-aws.sh` | Syntax check passes; stops cleanly when not signed in |
| Not yet possible | Stack creation, upload, DNS and live checks: these need AWS sign-in and your go-ahead |

## 12. Needed from the owner to run this

1. Go-ahead to create the AWS resources (≈ $0.50–1/month), and which AWS account to use.
2. DNS choice: **Option A** (Route 53, recommended) or Option B, and permission to change renewbrick.com's nameservers/records at GoDaddy.
3. Sign in to the AWS CLI on this machine (`aws login`).
4. Confirm the first go-live keeps indexing off until the launch blockers are cleared.
