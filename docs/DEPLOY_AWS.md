# Deployment plan: AWS S3 + CloudFront via GitHub Actions

**Status:** prepared and checked locally, **not executed**. Running it creates billable AWS resources (roughly USD 0.50–1 a month) and changes DNS for renewbrick.com, so it needs the owner's go-ahead. GraceBill and its server are not touched.

## 1. What gets built

```
Visitor ──► DNS (Route 53) ──► CloudFront ──────────────────────────► S3 bucket (private)
            renewbrick.com      • HTTPS certificate (ACM, free)        only CloudFront can read it
            www.renewbrick.com  • URL function: /about → about.html,   (Origin Access Control)
                                  www → renewbrick.com, no trailing /
                                • security headers policy
                                • cache at edges incl. India
```

| File | Role |
| --- | --- |
| [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) | Tests every push/PR. On **main only**: creates/updates the AWS infrastructure and publishes the site |
| [`infra/aws/renewbrick-site.yaml`](../infra/aws/renewbrick-site.yaml) | The website stack: S3 bucket, CloudFront (+ function, security headers, 404 page), HTTPS certificate, DNS records, deploy policy |
| [`infra/aws/github-bootstrap.yaml`](../infra/aws/github-bootstrap.yaml) | **One-time** stack: GitHub OIDC trust, the workflow's deploy role, the CloudFormation execution role, the Route 53 hosted zone |
| [`scripts/deploy-aws.sh`](../scripts/deploy-aws.sh) | Build → upload hashed assets (cached 1 year) → upload pages (always revalidated) → refresh the CloudFront cache |

### Website stack resources
| Resource | Purpose |
| --- | --- |
| S3 bucket | Holds `out/`. Private, encrypted, HTTPS-only, versioned (old versions kept 30 days). Kept even if the stack is deleted |
| Origin Access Control + bucket policy | Only this CloudFront distribution can read the bucket |
| ACM certificate | Free HTTPS for `renewbrick.com` and `www.renewbrick.com` |
| CloudFront Function | Clean URLs, canonical host, trailing-slash redirects (tested in `tests/unit/cloudfront-function.test.ts`) |
| Response headers policy | CSP, HSTS, nosniff, frame-deny, referrer and permissions policies |
| CloudFront distribution | HTTPS-only, HTTP/2+3, compression, `PriceClass_200` (includes India), real 404 page |
| Route 53 records | `renewbrick.com` and `www` → CloudFront (when DNS is in Route 53) |

## 2. How the workflow runs

| Event | Test job | Deploy job |
| --- | --- | --- |
| Pull request to `main` | ✔ typecheck, lint, unit, build, end-to-end | ✘ never |
| Push to `main` | ✔ | ✔ after tests pass |
| Manual "Run workflow" on `main` (optional *index* tick box) | ✔ | ✔ after tests pass |
| Push or manual run on any other branch | ✔ (manual) / – | ✘ never |

Only `main` can deploy, enforced in three places:
1. The job condition `github.ref == 'refs/heads/main'`.
2. The GitHub **production** environment, restricted to the `main` branch.
3. The AWS role, which trusts only jobs running in that environment of this repository.

**Sign-in without keys:** the deploy job gets short-lived AWS credentials through GitHub OIDC. No AWS access keys are stored in GitHub.

**Least privilege:**
- The workflow's role can only manage the `renewbrick-site` stack, upload to its bucket and refresh its cache.
- The role that builds the CloudFront, S3 and certificate resources is held by CloudFormation itself. The workflow can hand it over but can't use it directly.

**Indexing:** deploys build with search indexing **off** (`noindex`). Launch by ticking *index* on a manual run, or permanently by setting the variable `SITE_INDEXING=true`. Do that only once `npm run check:launch` passes.

## 3. Decisions

| Decision | Recommendation | Why |
| --- | --- | --- |
| Region | **us-east-1** | CloudFront only accepts certificates from us-east-1; visitors are still served from Indian edge locations |
| DNS | **Option A: Route 53** (domain stays registered at GoDaddy) | GoDaddy DNS can't point the bare `renewbrick.com` at CloudFront; Route 53 can, and validates the certificate automatically |
| Main address | **renewbrick.com**; `www` redirects | Short, matches the brand |
| First go-live | **Indexing off** | Launch blockers remain (WhatsApp/phone, logo file, legal approval) |

*Option B (keep DNS at GoDaddy)*: see section 7.

## 4. Cost (indicative; check current AWS pricing)

| Item | Monthly |
| --- | --- |
| S3 storage (~4 MB) and requests | ≈ $0.00 |
| CloudFront: always-free tier covers 1 TB transfer, 10 M requests and 2 M function runs | $0 at this traffic |
| Route 53 hosted zone (Option A) | $0.50, plus $0.40 per million queries |
| ACM certificate, IAM, CloudFormation | Free |
| GitHub Actions | Free for public repos; private repos get 2,000 free minutes/month (each run uses about 5–8) |
| **Total** | **≈ $0.50–1 (about ₹45–90)** |

## 5. One-time setup (owner, about 30 minutes plus DNS propagation)

**Step 1. Put the code on GitHub.** Create a repository (private is fine) under your account, then:
```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```
The first push runs the tests. The deploy job fails with "Missing GitHub variables" until step 5, which is expected.

**Step 2. Create the bootstrap stack in AWS** (as an account admin; AWS console → CloudFormation → *Create stack* → upload `infra/aws/github-bootstrap.yaml`, region **us-east-1**, or via CLI):
```bash
aws login
aws cloudformation deploy --region us-east-1 --stack-name renewbrick-github-bootstrap \
  --template-file infra/aws/github-bootstrap.yaml \
  --parameter-overrides GitHubRepository=<owner>/<repo> \
  --capabilities CAPABILITY_IAM
aws cloudformation describe-stacks --region us-east-1 --stack-name renewbrick-github-bootstrap \
  --query "Stacks[0].Outputs" --output table
```
- If the account already has a GitHub identity provider (IAM → Identity providers → `token.actions.githubusercontent.com`), add `CreateOidcProvider=false`.
- For Option B add `CreateHostedZone=false`.

**Step 3. Point the domain at Route 53 (in GoDaddy).** GoDaddy → My Products → renewbrick.com → DNS → Nameservers → *Change* → *I'll use my own nameservers* → enter the four `NameServers` from the outputs.
- This replaces GoDaddy's parking page. The domain has no email or other records today, so nothing else breaks. Future email records (e.g. Google Workspace) go in Route 53.
- Check propagation (usually under an hour, up to 48 hours): `nslookup -type=NS renewbrick.com 8.8.8.8` should list `awsdns` nameservers. **Wait for this before step 6**, or the first deploy will sit waiting for certificate validation.

**Step 4. Create the GitHub environment.** Repository → Settings → Environments → *New environment* → `production`:
- *Deployment branches and tags* → **Selected branches** → add `main`.
- Optional: *Required reviewers*, so each deploy waits for your approval.

**Step 5. Add repository variables.** Settings → Secrets and variables → Actions → **Variables** tab (these are not secret):

| Variable | Value |
| --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` output |
| `AWS_CFN_EXECUTION_ROLE_ARN` | `CloudFormationExecutionRoleArn` output |
| `ROUTE53_HOSTED_ZONE_ID` | `HostedZoneId` output (leave unset for Option B) |
| `SITE_PRIMARY_HOST` | only for Option B: `www` |
| `SITE_INDEXING` | leave unset until launch, then `true` |

**Step 6. First deploy.** Actions → *Test and deploy* → *Run workflow* on `main` (or push a commit). The first run takes about 10–20 minutes (certificate + CloudFront rollout). Later runs take a few minutes.

**Step 7. Verify** (section 9).

## 6. Day-to-day

- **Change content:** edit `src/content/*`, commit and push to `main`. It's tested, then live within minutes. Open a pull request first if you want the tests to run before merging.
- **Launch (allow Google):** once `npm run check:launch` passes, run the workflow manually with *index* ticked, or set `SITE_INDEXING=true`.
- **Infrastructure changes:** edit `infra/aws/renewbrick-site.yaml`; the next deploy applies them through CloudFormation.
- **Manual fallback** (no GitHub): with admin credentials, run `aws cloudformation deploy …` with the same parameters as the workflow, then `scripts/deploy-aws.sh`.

## 7. Option B: keep DNS at GoDaddy

1. Bootstrap with `CreateHostedZone=false`. Set the variable `SITE_PRIMARY_HOST=www` and leave `ROUTE53_HOSTED_ZONE_ID` unset.
2. Run the workflow. While it waits on the certificate, find the two validation CNAMEs in AWS console → Certificate Manager (us-east-1) → the pending certificate, and add them in GoDaddy DNS. The run then continues. It has up to 90 minutes; if it times out, add the records and re-run.
3. After the first successful run, in GoDaddy DNS: delete the parking `A` records, add CNAME `www` → the distribution's `d…cloudfront.net` name (CloudFormation → `renewbrick-site` → Outputs → `DistributionDomainName`).
4. GoDaddy → Forwarding: `renewbrick.com` → `https://www.renewbrick.com` (permanent 301).

Limitation: the bare `https://renewbrick.com` depends on GoDaddy's forwarding service.

## 8. Security notes

- No long-lived AWS keys anywhere: OIDC tokens are scoped to this repository's `production` environment and expire within an hour.
- The bucket is private and HTTPS-only. Only CloudFront can read it. TLS 1.2+ with HSTS. Versioning allows rollback.
- The workflow's default token is read-only (`contents: read`). Only the deploy job can request an AWS sign-in token.
- Pull requests, including from forks, never reach the deploy job or AWS credentials.

## 9. Verification after the first deploy

```bash
curl -sI https://renewbrick.com/                       # 200, plus content-security-policy and strict-transport-security
curl -sI https://www.renewbrick.com/about              # 301 → https://renewbrick.com/about
curl -sI http://renewbrick.com/                        # 301 → https
curl -sI https://renewbrick.com/about/                 # 301 → /about
curl -s -o /dev/null -w "%{http_code}\n" https://renewbrick.com/no-such-page   # 404
curl -sI https://renewbrick.com/opengraph-image        # content-type: image/png
```
Then in a browser on a phone and a desktop: every page, the menu, the contact buttons. After the launch, confirm robots.txt allows crawling and follow `docs/SEO.md` (Search Console).

## 10. Rollback

- **Bad content:** revert the commit on `main` and push (the workflow redeploys), or restore object versions in S3 (kept 30 days).
- **Remove the site:** `aws cloudformation delete-stack --region us-east-1 --stack-name renewbrick-site` (as admin). The bucket is retained by design; empty and delete it manually if wanted. Delete `renewbrick-github-bootstrap` afterwards if GitHub deploys are no longer needed (the hosted zone is retained). To return DNS to GoDaddy, set the nameservers back to `ns65.domaincontrol.com` and `ns66.domaincontrol.com`.

## 11. Checked before handover

| Check | Result |
| --- | --- |
| `cfn-lint` 1.58: both templates (us-east-1) | Pass, no findings |
| `actionlint` 1.7.12: workflow | Pass, no findings |
| CloudFront Function unit tests (code taken from the template) | Pass: clean URLs, canonical host and trailing-slash redirects with query strings, OG image passthrough, and every exported page maps to a file in `out/` |
| Site test suite (the same commands the workflow's test job runs) | Pass locally |
| Not yet possible | Real GitHub run, stack creation, DNS and live checks: these need the GitHub repository, AWS sign-in and the owner's go-ahead |

## 12. Needed from the owner

1. Go-ahead to create the AWS resources (≈ $0.50–1/month), and which AWS account.
2. The GitHub repository (`owner/name`) to host the code.
3. DNS choice: **Option A** (recommended) or B, and making the GoDaddy change in step 3.
4. Confirmation that deploys stay unindexed until the launch blockers are cleared.
