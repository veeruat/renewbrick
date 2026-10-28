#!/usr/bin/env bash
# Builds the site and publishes it to the S3 bucket + CloudFront distribution
# created by infra/aws/renewbrick-site.yaml. See docs/DEPLOY_AWS.md.
#
# Usage: scripts/deploy-aws.sh [--dry-run] [--skip-build] [--index]
#   --dry-run     show what would be uploaded; change nothing
#   --skip-build  publish the existing out/ (must have been built for this site)
#   --index       production launch: build with SITE_INDEXING=true
#                 (default builds with indexing OFF — visible but not in search)
#
# Environment: STACK_NAME (default renewbrick-site), AWS_PROFILE (optional).
# Requires AWS CLI v2 signed in with the stack's DeployPolicy (or broader).
set -euo pipefail

cd "$(dirname "$0")/.."
STACK_NAME="${STACK_NAME:-renewbrick-site}"
REGION="us-east-1"
DRY_RUN=false
SKIP_BUILD=false
INDEXING=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --skip-build) SKIP_BUILD=true ;;
    --index) INDEXING=true ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 64 ;;
  esac
done

command -v aws >/dev/null || { echo "AWS CLI v2 is required." >&2; exit 1; }
aws sts get-caller-identity --query Arn --output text >/dev/null || { echo "Not signed in to AWS (run: aws login)." >&2; exit 1; }

output() {
  aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}
BUCKET="$(output BucketName)"
DISTRIBUTION_ID="$(output DistributionId)"
SITE_URL="$(output SiteUrl)"
[[ -n "$BUCKET" && "$BUCKET" != "None" ]] || { echo "Stack $STACK_NAME has no BucketName output." >&2; exit 1; }
echo "Stack $STACK_NAME → s3://$BUCKET, distribution $DISTRIBUTION_ID, $SITE_URL (indexing: $INDEXING)"

if ! $SKIP_BUILD; then
  SITE_URL="$SITE_URL" SITE_INDEXING="$INDEXING" npm run build
fi
[[ -f out/index.html ]] || { echo "out/ is missing — build first." >&2; exit 1; }
# Guard against publishing a build made for another URL (e.g. localhost).
grep -q "rel=\"canonical\" href=\"$SITE_URL\"" out/index.html || {
  echo "out/index.html was not built for $SITE_URL. Rebuild without --skip-build." >&2; exit 1; }

DRY=(); $DRY_RUN && DRY=(--dryrun)
IMMUTABLE="public, max-age=31536000, immutable"
REVALIDATE="public, max-age=0, must-revalidate"

# 1. Hashed assets first (never change once published; kept from older deploys
#    so visitors mid-session never hit a missing file).
aws s3 sync out/_next/static "s3://$BUCKET/_next/static" "${DRY[@]}" \
  --exclude "*.woff2" --cache-control "$IMMUTABLE"
aws s3 cp out/_next/static "s3://$BUCKET/_next/static" --recursive "${DRY[@]}" \
  --exclude "*" --include "*.woff2" --content-type font/woff2 --cache-control "$IMMUTABLE"

# 2. Pages and everything else; remove pages that no longer exist.
aws s3 sync out "s3://$BUCKET" "${DRY[@]}" --delete \
  --exclude "_next/static/*" --exclude "_headers" --exclude "opengraph-image" \
  --cache-control "$REVALIDATE"

# 3. The generated social image has no file extension, so set its type explicitly.
aws s3 cp out/opengraph-image "s3://$BUCKET/opengraph-image" "${DRY[@]}" \
  --content-type image/png --cache-control "public, max-age=86400"

if $DRY_RUN; then
  echo "Dry run complete — nothing was uploaded or invalidated."
  exit 0
fi

# 4. Refresh CloudFront's cached copies ("/*" counts as one invalidation path).
INVALIDATION_ID="$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" --query Invalidation.Id --output text)"
echo "Invalidation $INVALIDATION_ID started; usually live within a few minutes."
echo "Published: $SITE_URL"
