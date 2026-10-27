// Runs after `next build`: writes out/_headers (Cloudflare Pages / Netlify
// format) with security headers, long-lived caching for hashed assets, and a
// noindex header unless this is the production build (SITE_INDEXING=true).
import { existsSync, writeFileSync } from "node:fs";

const out = new URL("../out/", import.meta.url);
if (!existsSync(new URL("index.html", out))) {
  console.error("out/index.html not found — did `next build` run with output: \"export\"?");
  process.exit(1);
}

const indexable = process.env.SITE_INDEXING === "true";
const https = (process.env.SITE_URL ?? "").startsWith("https://");

// Inline scripts carry the framework's hydration payload, so script-src needs 'unsafe-inline'.
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

const all = [
  ["Content-Security-Policy", csp],
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()"],
  ...(https ? [["Strict-Transport-Security", "max-age=63072000; includeSubDomains"]] : []),
  ...(indexable ? [] : [["X-Robots-Tag", "noindex, nofollow"]]),
];

const block = (path, headers) => [path, ...headers.map(([k, v]) => `  ${k}: ${v}`)].join("\n");
const file = [
  block("/*", all),
  block("/_next/static/*", [["Cache-Control", "public, max-age=31536000, immutable"]]),
  // Generated social image has no file extension.
  block("/opengraph-image", [["Content-Type", "image/png"]]),
].join("\n\n") + "\n";

writeFileSync(new URL("_headers", out), file);
console.log(`out/_headers written (${indexable ? "indexable" : "noindex"}${https ? ", https" : ""}). Static site ready in out/`);
