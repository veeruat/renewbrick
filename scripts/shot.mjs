// Viewport screenshot: node scripts/shot.mjs <url> <out.png> <width> <height> [scrollY]
import { chromium } from "@playwright/test";
const [,, url, out, w, h, y] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "networkidle" });
if (y) await p.evaluate((y) => window.scrollTo(0, +y), y);
await p.waitForTimeout(300);
await p.screenshot({ path: out });
await b.close();
