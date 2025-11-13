import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "dot" : "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // pnpm이 있으면 pnpm 사용, 없으면 npm 사용
    command:
      process.env.npm_config_user_agent?.includes("pnpm") || process.env.PNPM_EXEC ? "pnpm run dev" : "npm run dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
