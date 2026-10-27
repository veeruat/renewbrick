import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";

const DB_URL = "postgres://postgres@127.0.0.1:54329/postgres";

async function query<T>(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  try {
    return (await client.query(sql, params)).rows as T[];
  } finally {
    await client.end();
  }
}

async function fill(page: Page, description: string) {
  await page.getByLabel("Your name").fill("Asha Rao");
  await page.getByLabel("Phone number").fill("98765 43210");
  await page.getByLabel("How should we contact you?").selectOption("whatsapp");
  await page.getByLabel("City").selectOption("hyderabad");
  await page.getByLabel("Locality or area").fill("Kondapur");
  await page.getByLabel("Property type").selectOption("apartment");
  await page.getByLabel("Service required").selectOption("renovation-civil-works");
  await page.getByLabel("What would you like done?").fill(description);
  await page.getByLabel(/I agree that RenewBrick may contact me/).check();
  // The server rejects submissions completed faster than a person could.
  await page.waitForTimeout(3200);
}

test.describe("enquiry form", () => {
  test("shows accessible errors and focuses the first invalid field", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByLabel("Your name")).toBeFocused();
    await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Please enter your name.").first()).toBeVisible();
    const describedBy = await page.getByLabel("Phone number").getAttribute("aria-describedby");
    expect(describedBy).toContain("f-phone-error");
    await page.getByLabel("Phone number").fill("12345");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText(/Please enter a valid mobile number/).first()).toBeVisible();
    expect(await query("SELECT 1 FROM enquiries")).toHaveLength(0);
  });

  test("stores a valid enquiry, shows the reference, and sends the notification", async ({ page }) => {
    await page.goto("/contact");
    const description = `Bathroom seepage and lifting tiles ${Date.now()}`;
    await fill(page, description);
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("heading", { name: "Thank you. We have your details." })).toBeFocused();
    const reference = await page.locator("strong", { hasText: /^RB-/ }).textContent();
    expect(reference).toMatch(/^RB-\d{6}-[A-Z2-9]{4}$/);

    const rows = await query<{ reference: string; phone: string }>("SELECT reference, phone FROM enquiries WHERE description = $1", [description]);
    expect(rows).toEqual([{ reference, phone: "+919876543210" }]);

    await expect
      .poll(async () => (await query<{ s: string }>("SELECT notification_status AS s FROM enquiries WHERE reference = $1", [reference]))[0]?.s, {
        timeout: 10_000,
      })
      .toBe("sent");
  });

  test("double-clicking submit stores only one enquiry", async ({ page }) => {
    await page.goto("/contact");
    const description = `Repainting the whole flat ${Date.now()}`;
    await fill(page, description);
    await page.getByRole("button", { name: "Send enquiry" }).dblclick();
    await expect(page.getByRole("heading", { name: "Thank you. We have your details." })).toBeVisible();
    expect(await query("SELECT 1 FROM enquiries WHERE description = $1", [description])).toHaveLength(1);
  });

  test("works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/contact");
    const description = `No-JS enquiry about terrace waterproofing ${Date.now()}`;
    await page.getByLabel("Your name").fill("Ravi Kumar");
    await page.getByLabel("Phone number").fill("+91 91234 56789");
    await page.getByLabel("How should we contact you?").selectOption("phone");
    await page.getByLabel("City").selectOption("warangal");
    await page.getByLabel("Locality or area").fill("Hanamkonda");
    await page.getByLabel("Property type").selectOption("independent-house");
    await page.getByLabel("Service required").selectOption("renovation-civil-works");
    await page.getByLabel("What would you like done?").fill(description);
    await page.getByLabel(/I agree that RenewBrick may contact me/).check();
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page).toHaveURL(/\/contact\/received\?ref=RB-/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thank you. We have your details.");
    expect(await query("SELECT 1 FROM enquiries WHERE description = $1", [description])).toHaveLength(1);
    await context.close();
  });

  test("never reports success when storage fails", async ({ page }) => {
    await page.goto("http://127.0.0.1:3201/contact");
    await fill(page, "This enquiry cannot be stored because the database is down.");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText(/We could not save your enquiry just now/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Thank you. We have your details." })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Send enquiry" })).toBeEnabled();
  });

  test("the API rejects cross-origin and malformed requests", async ({ request }) => {
    const cross = await request.post("/api/enquiries", { data: {}, headers: { Origin: "https://evil.example" } });
    expect(cross.status()).toBe(403);
    const bad = await request.post("/api/enquiries", { data: "not json", headers: { "Content-Type": "application/json" } });
    expect(bad.status()).toBe(400);
    const get = await request.get("/api/enquiries");
    expect(get.status()).toBe(405);
  });
});
