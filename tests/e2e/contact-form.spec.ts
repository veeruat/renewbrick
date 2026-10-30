import { expect, test, type Page } from "@playwright/test";
import { routes } from "./support/routes";

// The local server runs the real contact form Lambda from the CloudFormation
// template (scripts/serve-static.mjs) and prints the email instead of sending it.
const origin = "http://127.0.0.1:3200";

async function fillValid(page: Page) {
  await page.getByLabel("Your name").fill("Asha Rao");
  await page.getByLabel("Phone number").fill("98765 43210");
  await page.locator("#f-email").fill("asha@example.com");
  await page.getByLabel("How should we contact you?").selectOption("whatsapp");
  await page.getByLabel("City").selectOption("Bangalore");
  await page.getByLabel("Locality or area").fill("Indiranagar");
  await page.getByLabel("Property type").selectOption("Apartment / flat");
  await page.getByLabel("Service required").selectOption("Renovation & Civil Works");
  await page.getByLabel("What would you like done?").fill("Bathroom leak and repainting of two bedrooms.");
  await page.getByLabel(/I agree that RenewBrick may contact me/).check();
}

test.describe("contact form", () => {
  test("the only form on the site is the enquiry form on /contact", async ({ page }) => {
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("form"), route).toHaveCount(route === "/contact" ? 1 : 0);
    }
  });

  test("checks the fields before sending and points to each problem", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText("Please check 9 fields below.")).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeFocused();
    await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
    // Email is optional unless email is the chosen contact method.
    await expect(page.locator("#f-email")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("sends a valid enquiry and shows a reference", async ({ page }) => {
    await page.goto("/contact");
    await fillValid(page);
    // Submissions within 3 seconds of loading are treated as bots, so backdate the form.
    await page.locator('input[name="startedAt"]').evaluate((el: HTMLInputElement) => (el.value = String(Date.now() - 60_000)));
    const response = page.waitForResponse("**/api/contact");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    expect((await response).status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Thank you. We have your details." })).toBeFocused();
    await expect(page.getByText(/^Your reference is RB-\d{6}-[0-9A-F]{6}\. We will contact you by whatsapp/)).toBeVisible();
  });

  test("shows the server's field errors", async ({ page }) => {
    await page.goto("/contact");
    await fillValid(page);
    // Bypass the browser check to exercise the server-side validation.
    await page.route("**/api/contact", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}");
      await route.continue({ postData: JSON.stringify({ ...body, phone: "123" }) });
    });
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText("Some details were missing or invalid. Please check the form.")).toBeVisible();
    await expect(page.getByRole("link", { name: /valid mobile number/ })).toBeVisible();
  });

  test("works without JavaScript: posts, then redirects to a confirmation page", async ({ request, page }) => {
    const res = await request.post("/api/contact", {
      headers: { origin },
      form: {
        name: "Asha Rao", phone: "9876543210", email: "", contactMethod: "phone", city: "Hyderabad", locality: "Kondapur",
        propertyType: "Apartment / flat", service: "Not sure yet", description: "Kitchen and bathroom renovation.", consent: "on",
      },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    expect(res.headers().location).toBe("/contact/sent");

    const bad = await request.post("/api/contact", { headers: { origin }, form: { name: "A" }, maxRedirects: 0 });
    expect(bad.headers().location).toBe("/contact?error=invalid#enquiry");

    await page.goto("/contact/sent");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thank you. We have your details.");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.goto("/contact?error=invalid");
    await expect(page.getByText("Some details were missing or invalid. Please check the form and send it again.")).toBeVisible();
  });

  test("refuses posts from other websites", async ({ request }) => {
    const res = await request.post("/api/contact", { headers: { origin: "https://evil.example" }, data: { name: "x" } });
    expect(res.status()).toBe(400);
  });
});
