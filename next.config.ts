import type { NextConfig } from "next";

const indexable = process.env.SITE_INDEXING === "true";
const https = (process.env.SITE_URL ?? "").startsWith("https://");

// Inline scripts are required by the framework's hydration payload, so
// script-src allows 'unsafe-inline'; everything else is locked to this origin.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(https ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const security = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    if (https) security.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" });
    // Belt and braces for previews: keep every response out of search indexes.
    if (!indexable) security.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    return [
      { source: "/:path*", headers: security },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
