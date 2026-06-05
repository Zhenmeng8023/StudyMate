import { describe, expect, it } from "vitest";
import { buildGraphSettingsSections } from "./graphSettingsPanel";

describe("buildGraphSettingsSections", () => {
  it("groups graph workspace settings into the five product sections", () => {
    const sections = buildGraphSettingsSections({
      autosaveDelayMs: 8000,
      edgeCount: 12,
      groupCount: 2,
      nodeCount: 10,
      saveState: "dirty"
    });

    expect(sections.map((section) => section.key)).toEqual([
      "display",
      "import-export",
      "autosave",
      "performance",
      "shortcuts"
    ]);
    expect(sections.find((section) => section.key === "autosave")?.items.join(" ")).toContain("8 秒");
    expect(sections.find((section) => section.key === "import-export")?.items.join(" ")).toContain(".smtg");
  });

  it("surfaces a performance warning at the 200 node benchmark scale", () => {
    const sections = buildGraphSettingsSections({
      autosaveDelayMs: 8000,
      edgeCount: 300,
      groupCount: 20,
      nodeCount: 200,
      saveState: "saved"
    });

    expect(sections.find((section) => section.key === "performance")?.tone).toBe("warning");
    expect(sections.find((section) => section.key === "performance")?.items.join(" ")).toContain("200 节点 / 300 边 / 20 分组");
  });
});
