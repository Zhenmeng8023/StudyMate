import { describe, expect, it } from "vitest";
import {
  getGovernanceActions,
  governanceModuleConfig,
  isGovernanceModuleView,
  mapGovernanceRecordToModerationItem
} from "./adminGovernanceConfig";

describe("adminGovernanceConfig", () => {
  it("exposes the shared governance module endpoints and graph template override", () => {
    expect(isGovernanceModuleView("materials")).toBe(true);
    expect(isGovernanceModuleView("dashboard")).toBe(false);
    expect(governanceModuleConfig.graph.endpoint).toBe("/api/v1/admin/diagram-templates");
    expect(governanceModuleConfig.audit.query.limit).toBe(20);
  });

  it("derives governance actions from the shared view and record metadata", () => {
    expect(getGovernanceActions("community", { status: "pending" })).toEqual([
      { key: "resolve", label: "标记已处理" },
      { key: "dismiss", label: "忽略举报", tone: "danger" }
    ]);

    expect(getGovernanceActions("users", { role: "admin", status: "active" })).toEqual([]);
    expect(getGovernanceActions("users", { role: "student", status: "disabled" })).toEqual([
      { key: "activate", label: "恢复用户" }
    ]);
    expect(getGovernanceActions("dashboard", { status: "pending" })).toEqual([]);
  });

  it("maps a material governance row into the shared moderation bridge item", () => {
    expect(
      mapGovernanceRecordToModerationItem({
        id: "material-1",
        title: "Linear Algebra",
        description: "course note",
        ownerName: "Alice",
        status: "approved",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:10:00Z"
      })
    ).toEqual({
      id: "material-1",
      type: "material",
      title: "Linear Algebra",
      summary: "course note",
      authorName: "Alice",
      status: "approved",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:10:00Z"
    });

    expect(mapGovernanceRecordToModerationItem({ id: "", title: "missing id" })).toBeNull();
  });
});
