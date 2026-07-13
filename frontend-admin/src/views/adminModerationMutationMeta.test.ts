import { describe, expect, it } from "vitest";
import { resolveAdminModerationMutationMeta } from "./adminModerationMutationMeta";

describe("adminModerationMutationMeta", () => {
  it("builds the default moderation mutation path and success notice for post actions", () => {
    expect(
      resolveAdminModerationMutationMeta(
        "moderation",
        {
          id: "post-1",
          type: "post",
          title: "Pending Post",
          summary: "Needs moderation review",
          authorName: "Alice",
          status: "pending",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        },
        "reject"
      )
    ).toEqual({
      clearGovernanceConflictBeforeSubmit: false,
      errorFallbackMessage: "更新审核状态失败",
      markGovernanceConflictOnStatus: [409],
      path: "/api/v1/admin/moderation/posts/post-1/reject",
      reloadGovernanceView: null,
      successNotice: "“Pending Post” 已更新为 {status}。"
    });
  });

  it("builds the materials governance refresh plan for material moderation actions", () => {
    expect(
      resolveAdminModerationMutationMeta(
        "materials",
        {
          id: "material-1",
          type: "material",
          title: "Linear Algebra",
          summary: "Needs moderation review",
          authorName: "Alice",
          status: "approved",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        },
        "hide"
      )
    ).toEqual({
      clearGovernanceConflictBeforeSubmit: true,
      errorFallbackMessage: "更新审核状态失败",
      markGovernanceConflictOnStatus: [409],
      path: "/api/v1/admin/moderation/materials/material-1/hide",
      reloadGovernanceView: "materials",
      successNotice: "“Linear Algebra” 已更新为 {status}。"
    });
  });
});
