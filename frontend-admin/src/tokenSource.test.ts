/// <reference types="node" />

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function resolveAdminSourcePath(...parts: string[]) {
  const workspaceRoot = process.cwd().endsWith("frontend-admin") ? process.cwd() : join(process.cwd(), "frontend-admin");

  return join(workspaceRoot, "src", ...parts);
}

describe("frontend-admin shared token source", () => {
  it("imports the shared workspace token stylesheet", () => {
    const mainSource = readFileSync(resolveAdminSourcePath("main.ts"), "utf8");

    expect(mainSource).toContain('import "@studymate/ui/tokens.css";');
  });

  it("maps the admin shell baseline tokens to shared workspace tokens", () => {
    const adminStyles = readFileSync(resolveAdminSourcePath("components", "admin", "admin.css"), "utf8");

    expect(adminStyles).toContain("--admin-bg: var(--bg-0);");
    expect(adminStyles).toContain("--admin-surface: var(--surface-strong);");
    expect(adminStyles).toContain("--admin-line: var(--line);");
    expect(adminStyles).toContain("--admin-text: var(--text-0);");
    expect(adminStyles).toContain("--admin-accent: var(--accent);");
  });

  it("drops duplicated root-level admin token bootstrapping", () => {
    const adminStyles = readFileSync(resolveAdminSourcePath("components", "admin", "admin.css"), "utf8");

    expect(adminStyles).not.toContain(":root { color-scheme: light; }");
    expect(adminStyles).toContain("background: var(--bg-0);");
  });
});
