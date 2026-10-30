import { expect, test } from "@playwright/test";
import { routes } from "./support/routes";

test.describe("metadata", () => {
  test("titles and descriptions are present and unique", async ({ page }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    for (const route of routes) {
      await page.goto(route);
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(title.length, route).toBeGreaterThan(10);
      expect(title.length, `${route} title length`).toBeLessThanOrEqual(75);
      expect(description?.length ?? 0, route).toBeGreaterThan(50);
      expect(titles.has(title), `duplicate title ${title}`).toBe(false);
      expect(descriptions.has(description!), `duplicate description on ${route}`).toBe(false);
      titles.set(title, route);
      descriptions.set(description!, route);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonical!).pathname.replace(/\/$/, "") || "/", route).toBe(route);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    }
  });

  test("structured data is valid JSON and contains no unverified contact fields", async ({ page }) => {
    for (const route of ["/", "/services/renovation-civil-works", "/locations/hyderabad"]) {
      await page.goto(route);
      const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent ?? ""));
      expect(blocks.length).toBeGreaterThan(0);
      for (const b of blocks) {
        const data = JSON.parse(b);
        expect(data["@context"]).toBe("https://schema.org");
        expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review|address/i);
      }
    }
  });
});

test.describe("indexing controls (non-production build)", () => {
  test("pages are noindex and robots.txt disallows all", async ({ page, request }) => {
    const res = await page.goto("/");
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \//);
  });

  test("sitemap lists canonical pages and excludes draft legal pages", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(urls).toHaveLength(11);
    expect(urls).not.toContain("/privacy-policy");
    expect(urls).not.toContain("/terms");
    expect(urls).toContain("/services/rental-ready");
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-powered-by"]).toBeUndefined();
    expect((await request.get("/opengraph-image")).headers()["content-type"]).toBe("image/png");
  });
});
