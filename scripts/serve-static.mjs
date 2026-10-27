// Minimal static file server for the exported site (no dependencies).
// Serves out/, resolves /about → about.html, returns 404.html with a real 404,
// redirects trailing slashes, and applies the headers in out/_headers.
//
// Usage: node scripts/serve-static.mjs [dir]   (env: PORT=3000, HOST=127.0.0.1)
// For production, a static host (Cloudflare Pages, Netlify) or nginx is preferred.
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "out");
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";

if (!existsSync(path.join(root, "index.html"))) {
  console.error(`No exported site in ${root}. Run \`npm run build\` first.`);
  process.exit(1);
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".rsc": "text/x-component",
};

// Parse out/_headers: "/pattern" lines followed by indented "Name: value" lines.
const rules = [];
const headersFile = path.join(root, "_headers");
if (existsSync(headersFile)) {
  let current;
  for (const line of readFileSync(headersFile, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) rules.push((current = { pattern: line.trim(), headers: [] }));
    else if (current) {
      const i = line.indexOf(":");
      current.headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
    }
  }
}
const headersFor = (url) =>
  rules
    .filter((r) => (r.pattern.endsWith("*") ? url.startsWith(r.pattern.slice(0, -1)) : url === r.pattern))
    .flatMap((r) => r.headers);

function resolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const base = path.join(root, clean);
  if (!base.startsWith(root)) return null; // path traversal
  for (const candidate of [base, `${base}.html`, path.join(base, "index.html")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    res.writeHead(308, { Location: url.pathname.replace(/\/+$/, "") + url.search }).end();
    return;
  }
  let file;
  try {
    file = resolve(url.pathname);
  } catch {
    file = null; // malformed URI
  }
  if (file && path.basename(file) === "_headers") file = null;
  const status = file ? 200 : 404;
  file ??= path.join(root, "404.html");
  res.setHeader("Content-Type", types[path.extname(file)] ?? "application/octet-stream");
  for (const [k, v] of headersFor(url.pathname)) res.setHeader(k, v);
  res.writeHead(status);
  if (req.method === "HEAD") res.end();
  else createReadStream(file).pipe(res);
}).listen(port, host, () => console.log(`Serving ${root} on http://${host}:${port}`));
