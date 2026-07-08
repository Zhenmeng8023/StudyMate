import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("@studymate/ui shared token stylesheet", () => {
  it("ships a shared token stylesheet for workspace consumers", () => {
    expect(existsSync(new URL("./tokens.css", import.meta.url))).toBe(true);
  });

  it("defines the core UI-04 token variables", () => {
    const stylesheet = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

    expect(stylesheet).toContain("--bg-0:");
    expect(stylesheet).toContain("--accent:");
    expect(stylesheet).toContain("--sidebar-width:");
    expect(stylesheet).toContain("--panel-blur:");
  });
});
