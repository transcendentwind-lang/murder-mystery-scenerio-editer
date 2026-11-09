import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 45_000,
  use: { baseURL: "http://localhost:3107", viewport: { width: 1600, height: 1000 }, trace: "retain-on-failure" },
  webServer: { command: "npm run dev -- --port 3107", url: "http://localhost:3107", reuseExistingServer: false, timeout: 120_000 },
});
