import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: [
    {
      command: "npm run dev -- --port 5173",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "cd ../backend && ../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 18000",
      url: "http://127.0.0.1:18000/api/health",
      reuseExistingServer: false,
      env: {
        TOM_DEMO: "true",
        TOM_PROVIDER: "mock",
        TOM_API_TOKEN: "",
        TOM_ORGANIZATION: "tom-demo",
        TOM_DATABASE_URL: `sqlite:///${resolve("../.data/e2e.db")}`,
      },
    },
  ],
  reporter: "list",
  timeout: 30000,
});
