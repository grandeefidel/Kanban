import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Tests run against the real container, so they exercise the static export
  // as FastAPI actually serves it. start.sh is idempotent and leaves the
  // container running; stop it with scripts/stop.sh.
  webServer: {
    command: "bash ../scripts/start.sh",
    url: "http://localhost:8000/api/health",
    reuseExistingServer: true,
    timeout: 600_000,
  },
});
