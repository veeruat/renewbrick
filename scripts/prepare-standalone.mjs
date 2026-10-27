// Completes the standalone build: Next.js leaves static assets and /public out
// of .next/standalone, so copy them in. Runs automatically after `npm run build`.
import { cpSync, existsSync, rmSync } from "node:fs";

const root = new URL("..", import.meta.url);
const standalone = new URL(".next/standalone/", root);
if (!existsSync(standalone)) {
  console.error("No .next/standalone directory — is `output: \"standalone\"` set in next.config.ts?");
  process.exit(1);
}
for (const [from, to] of [
  [".next/static", ".next/standalone/.next/static"],
  ["public", ".next/standalone/public"],
]) {
  const src = new URL(from, root);
  const dest = new URL(to, root);
  rmSync(dest, { recursive: true, force: true });
  if (existsSync(src)) cpSync(src, dest, { recursive: true });
}
console.log("Standalone bundle ready: node .next/standalone/server.js");
