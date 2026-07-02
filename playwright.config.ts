import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";

const localEdgePath =
  process.platform === "win32"
    ? [
        path.join(process.env.ProgramFiles ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(process.env["ProgramFiles(x86)"] ?? "", "Microsoft", "Edge", "Application", "msedge.exe")
      ].find((candidate) => candidate && existsSync(candidate))
    : undefined;

const chromiumUse = {
  ...devices["Desktop Chrome"],
  ...(!process.env.CI && localEdgePath ? { launchOptions: { executablePath: localEdgePath } } : {})
};

const userPreviewPort = process.env.PLAYWRIGHT_USER_PORT ?? "44173";
const adminPreviewPort = process.env.PLAYWRIGHT_ADMIN_PORT ?? "44174";
const userBaseUrl = `http://127.0.0.1:${userPreviewPort}`;
const adminBaseUrl = `http://127.0.0.1:${adminPreviewPort}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: userBaseUrl,
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: `npm --workspace frontend-user run preview -- --host 127.0.0.1 --port ${userPreviewPort}`,
      url: userBaseUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000
    },
    {
      command: `npm --workspace frontend-admin run preview -- --host 127.0.0.1 --port ${adminPreviewPort}`,
      url: adminBaseUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: chromiumUse
    }
  ]
});
