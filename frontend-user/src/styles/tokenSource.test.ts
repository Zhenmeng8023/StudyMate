import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import appStyles from "./app.css?raw";
import redesignStyles from "./ui-redesign.css?raw";

describe("frontend-user shared token source", () => {
  it("imports the shared workspace token stylesheet", () => {
    const stylesEntry = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

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
