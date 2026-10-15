import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Nothing loads .env.test for us: Next.js never reads it, so the values are
// loaded here and handed to the server through webServer.env below. The end to
// end run therefore only ever touches the disposable test database.
try {
  process.loadEnvFile(path.resolve(rootDir, ".env.test"));
} catch {
  // .env.test is committed, so a missing file means a broken checkout. The
  // server is then started without a database rather than with the dev one.
}

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.mjs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.js/ },
    {
      name: "chromium",
      testMatch: /.*\.spec\.js/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        // Saved once by the setup project, reused by every test here.
        storageState: "e2e/.auth/student.json",
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      // schema.prisma declares directUrl, so the server needs it too or Prisma
      // fails to start with P1012.
      DIRECT_URL: process.env.DIRECT_URL,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  },
});
