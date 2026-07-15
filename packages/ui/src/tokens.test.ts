import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const tokenPath = [
  resolve(process.cwd(), "src/tokens.css"),
  resolve(process.cwd(), "packages/ui/src/tokens.css")
].find((candidate) => existsSync(candidate)) ?? resolve(process.cwd(), "src/tokens.css");

describe("@studymate/ui shared token stylesheet", () => {
  it("ships a shared token stylesheet for workspace consumers", () => {
    expect(existsSync(tokenPath)).toBe(true);
  });

  it("defines the core UI token variables", () => {
    const stylesheet = readFileSync(tokenPath, "utf8");
    for (const token of ["--bg-0:", "--surface-strong:", "--line:", "--text-0:", "--accent:", "--radius-md:", "--space-4:"]) {
      expect(stylesheet).toContain(token);
    }
  });
});
