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

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm --workspace frontend-user run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  },
  projects: [
    {
      name: "chromium",
      use: chromiumUse
    }
  ]
});
