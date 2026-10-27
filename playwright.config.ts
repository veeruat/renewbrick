import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the standalone production build (`npm run build` first).
 *   :54329  dev-db (PGlite over the Postgres protocol, in-memory)
 *   :54330  mock email provider
 *   :3200   app wired to the database and mock email
 *   :3201   app with an unreachable database, for storage-failure tests
 */
const DB_URL = "postgres://postgres@127.0.0.1:54329/postgres";

const appEnv = {
  DATABASE_SSL: "false",
  DATABASE_POOL_MAX: "1",
  EMAIL_PROVIDER: "resend",
  RESEND_API_URL: "http://127.0.0.1:54330/emails",
  RESEND_API_KEY: "e2e-test-key",
  LEAD_NOTIFY_FROM: "RenewBrick <leads@example.test>",
  LEAD_NOTIFY_TO: "owner@example.test",
  LEAD_HASH_SALT: "e2e-salt",
};

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
  webServer: [
    { command: "node scripts/dev-db.mjs --port 54329", port: 54329, reuseExistingServer: false },
    { command: "node tests/e2e/support/mock-email.mjs 54330", port: 54330, reuseExistingServer: false },
    {
      command: "node .next/standalone/server.js",
      url: "http://127.0.0.1:3200",
      env: { ...appEnv, PORT: "3200", HOSTNAME: "127.0.0.1", DATABASE_URL: DB_URL },
      reuseExistingServer: false,
    },
    {
      command: "node .next/standalone/server.js",
      url: "http://127.0.0.1:3201",
      env: { ...appEnv, PORT: "3201", HOSTNAME: "127.0.0.1", DATABASE_URL: "postgres://postgres@127.0.0.1:1/postgres" },
      reuseExistingServer: false,
    },
  ],
});
