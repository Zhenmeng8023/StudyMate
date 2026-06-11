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
    expect(sections.find((section) => section.key === "display")?.summary).toBe("保留阅读性偏好，优先服务大图谱导航。");
    expect(sections.find((section) => section.key === "display")?.actions).toEqual([
      { label: "小地图", state: "已启用" },
      { label: "来源泳道", state: "可生成" },
      { label: "快捷键", state: "可查看" }
    ]);
    expect(sections.find((section) => section.key === "import-export")?.items.join(" ")).toContain(
      "导入失败会保留当前画布"
    );
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
    expect(sections.find((section) => section.key === "performance")?.actions).toEqual([
      { label: "大图导航", state: "建议使用搜索/小地图" },
      { label: "整理策略", state: "建议使用来源泳道" },
      { label: "导出", state: "大图导出保持进度提示" }
    ]);
  });

  it("turns failed and pending save states into explicit governance guidance", () => {
    const failed = buildGraphSettingsSections({
      autosaveDelayMs: 8000,
      edgeCount: 1,
      groupCount: 0,
      nodeCount: 2,
      saveState: "failed"
    });
    const pending = buildGraphSettingsSections({
      autosaveDelayMs: 8000,
      edgeCount: 1,
      groupCount: 0,
      nodeCount: 2,
      saveState: "pending"
    });

    expect(failed.find((section) => section.key === "autosave")?.tone).toBe("warning");
    expect(failed.find((section) => section.key === "autosave")?.summary).toBe("保存失败需要用户可解释地恢复。");
    expect(failed.find((section) => section.key === "autosave")?.items.join(" ")).toContain(
      "优先手动保存或恢复快照"
    );
    expect(failed.find((section) => section.key === "autosave")?.actions).toEqual([
      { label: "dirty", state: "离页保护" },
      { label: "pending", state: "显示正在保存" },
      { label: "failed", state: "显示失败原因" }
    ]);
    expect(pending.find((section) => section.key === "autosave")?.summary).toBe("保存请求进行中，保持 pending 可见。");
  });
});
