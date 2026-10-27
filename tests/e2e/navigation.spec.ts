import { expect, test } from "@playwright/test";
import { routes } from "./support/routes";

test.describe("routes", () => {
  for (const route of routes) {
    test(`${route} renders with one h1 and no horizontal overflow`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("unknown pages return 404", async ({ request }) => {
    expect((await request.get("/no-such-page")).status()).toBe(404);
    expect((await request.get("/locations/mumbai")).status()).toBe(404);
    expect((await request.get("/services/plumbing")).status()).toBe(404);
  });

  test("every internal link resolves", async ({ page, request }) => {
    const seen = new Set<string>();
    for (const route of routes) {
      await page.goto(route);
      const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")!.split("#")[0].split("?")[0]));
      hrefs.forEach((h) => seen.add(h || "/"));
    }
    for (const href of seen) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  });
});

test.describe("navigation", () => {
  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("desktop services menu opens, navigates and closes with Escape", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const trigger = nav.getByRole("button", { name: "Services" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await nav.getByRole("link", { name: /Property Maintenance/ }).click();
    await expect(page).toHaveURL(/\/services\/property-maintenance$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Regular care");
  });

  test("mobile menu opens, navigates and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /menu/i });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(mobileNav).toBeHidden();
    await toggle.click();
    await mobileNav.getByRole("link", { name: "Warangal" }).click();
    await expect(page).toHaveURL(/\/locations\/warangal$/);
    await expect(mobileNav).toBeHidden();
  });

  test("service CTA preselects the service on the contact form", async ({ page }) => {
    await page.goto("/services/rental-ready");
    await page.getByRole("main").getByRole("link", { name: "Request a Site Inspection" }).first().click();
    await expect(page).toHaveURL(/\/contact\?service=rental-ready/);
    await expect(page.getByLabel("Service required")).toHaveValue("rental-ready");
  });

  test("planned service is labelled and offers register interest, not booking", async ({ page }) => {
    await page.goto("/services/property-management");
    await expect(page.getByText("Planned — not yet bookable").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Register Interest" }).first()).toBeVisible();
  });
});
