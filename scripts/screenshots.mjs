// Captures full-page screenshots of every route at representative widths.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir] [widths]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "test-results/screenshots";
const widths = (process.argv[4] ?? "390,1440").split(",").map(Number);
const routes = [
  "/", "/about", "/services/renovation-civil-works", "/services/property-maintenance",
  "/services/rental-ready", "/services/property-management", "/locations/hyderabad",
  "/locations/warangal", "/contact", "/faq", "/privacy-policy", "/terms", "/missing-page",
];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const name = route === "/" ? "home" : route.slice(1).replace(/\//g, "_");
    await page.screenshot({ path: `${out}/${width}-${name}.png`, fullPage: true });
    console.log(`${width}px ${route}${overflow > 0 ? `  ⚠ horizontal overflow ${overflow}px` : ""}`);
  }
  await page.close();
}
await browser.close();
