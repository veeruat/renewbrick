import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { routes } from "./support/routes";

test.describe("accessibility (axe, WCAG 2.2 A/AA rules)", () => {
  for (const route of routes) {
    test(`${route} has no serious or critical violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        serious.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")})`),
      ).toEqual([]);
    });
  }

  test("contact form with errors shown has no violations", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    const results = await new AxeBuilder({ page }).include("form").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
