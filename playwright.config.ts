import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4317",
    channel: process.env.PLAYWRIGHT_CHANNEL,
    headless: true,
  },
  webServer: {
    command: "node tests/serve.mjs",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: false,
  },
  reporter: "list",
});
