import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import appStyles from "./app.css?raw";
import redesignStyles from "./ui-redesign.css?raw";

function resolveUserSourcePath(...parts: string[]) {
  const workspaceRoot = process.cwd().endsWith("frontend-user") ? process.cwd() : join(process.cwd(), "frontend-user");

  return join(workspaceRoot, "src", ...parts);
}

describe("frontend-user shared token source", () => {
  it("imports the shared workspace token stylesheet", () => {
    const stylesEntry = readFileSync(resolveUserSourcePath("styles.css"), "utf8");

    expect(stylesEntry).toContain('@import "@studymate/ui/tokens.css";');
  });

  it("keeps app.css free of duplicated root token declarations", () => {
    expect(appStyles).not.toContain("--bg-0:");
    expect(appStyles).not.toContain("--accent:");
  });

  it("keeps ui-redesign.css free of duplicated root token declarations", () => {
    expect(redesignStyles).not.toContain("--bg-0:");
    expect(redesignStyles).not.toContain("--accent:");
  });
});
