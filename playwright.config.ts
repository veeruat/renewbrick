import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the exported static site (`npm run build` first),
 * served by scripts/serve-static.mjs with the generated out/_headers applied.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3200", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /(navigation|a11y)\.spec\.ts/ },
  ],
  webServer: {
    command: "node scripts/serve-static.mjs out",
    url: "http://127.0.0.1:3200",
    env: { PORT: "3200", HOST: "127.0.0.1" },
    reuseExistingServer: false,
  },
});
