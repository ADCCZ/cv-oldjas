import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);

/**
 * Smoke tests run against the production build (`next start`), exactly like on Vercel.
 * Locally: `npm run build && npm run test` (an already running `npm run start` is reused).
 */
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  // Every page runs rAF animations against one `next start` – more local workers only fight for the CPU.
  workers: process.env.CI ? undefined : 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
