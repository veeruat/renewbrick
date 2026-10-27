import type { NextConfig } from "next";

/**
 * Fully static site: `next build` exports plain HTML/CSS/JS to `out/`.
 * Static export cannot set response headers, so security and indexing headers
 * are written to `out/_headers` by scripts/postbuild.mjs (read natively by
 * Cloudflare Pages and Netlify, applied by scripts/serve-static.mjs, and
 * documented for nginx in docs/DEPLOYMENT.md).
 */
const nextConfig: NextConfig = {
  output: "export",
  // Cache Components is off: every page is prerendered, and static export needs
  // `dynamic = "force-static"` on metadata routes, which Cache Components forbids.

  // The default image optimiser needs a server; the only raster image is the logo.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
