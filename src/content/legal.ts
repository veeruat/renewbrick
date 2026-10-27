/**
 * Legal page approval status. Drafts are rendered with a visible "Draft —
 * under professional review" notice, marked noindex and left out of the
 * sitemap. Set `approved: true` (and the date) only after professional review.
 */
export const legalStatus = {
  privacy: { approved: false, approvedOn: null as string | null, reviewer: null as string | null },
  terms: { approved: false, approvedOn: null as string | null, reviewer: null as string | null },
};
