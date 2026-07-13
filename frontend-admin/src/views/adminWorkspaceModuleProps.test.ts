import { describe, expect, it } from "vitest";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import { buildAdminWorkspaceModuleProps } from "./adminWorkspaceModuleProps";

describe("adminWorkspaceModuleProps", () => {
  it("builds dashboard, moderation, and governance props from shared workspace state", () => {
    const selectedRecord: GovernanceRecord = {
      id: "user-1",
      username: "alice",
      status: "active"
    };

    const props = buildAdminWorkspaceModuleProps({
      activeView: "users",
      governance: {
        dataState: {
          kind: "stale",
          title: "治理记录需要刷新",
          description: "当前显示的是上一轮同步结果。"
        },
        query: "alice",
        rows: [selectedRecord],
        selectedRecord,
        statusFilter: "active",
        statusOptions: [
          { label: "全部状态", value: "all" },
          { label: "活跃", value: "active" }
        ],
        summary: {
          total: 1
        },
        totalCount: 3
      },
      governanceColumns: ["id", "username", "status"],
      moderation: {
        dataState: {
          kind: "empty",
          title: "没有待审内容",
          description: "当前审核队列为空。"
        },
        items: [
          {
            id: "post-1",
            type: "post",
            title: "Pending Post",
            summary: "",
            authorName: "Alice",
            status: "pending",
            createdAt: "",
            updatedAt: ""
          }
        ],
        query: "post",
        statusFilter: "pending",
        statusOptions: [
          { label: "全部状态", value: "all" },
          { label: "待审核", value: "pending" }
        ],
        totalCount: 2
      },
      overviewCards: [
        {
          helper: "overview",
          label: "用户规模",
          value: "12"
        }
      ],
      pendingMaterialsCount: 2,
      pendingPostsCount: 1,
      totalModerationCount: 2
    });

    expect(props.dashboard).toEqual({
      moderationItemsCount: 2,
      overviewCards: [
        {
          helper: "overview",
          label: "用户规模",
          value: "12"
        }
      ],
      pendingMaterialsCount: 2,
      pendingPostsCount: 1
    });

    expect(props.moderation).toEqual({
      dataState: {
        kind: "empty",
        title: "没有待审内容",
        description: "当前审核队列为空。"
      },
      items: [
        expect.objectContaining({
          id: "post-1",
          status: "pending"
        })
      ],
      query: "post",
      statusFilter: "pending",
      statusOptions: [
        { label: "全部状态", value: "all" },
        { label: "待审核", value: "pending" }
      ],
      totalCount: 2
    });

    expect(props.governance).toEqual({
      actions: [{ key: "disable", label: "禁用用户", tone: "danger" }],
      columns: ["id", "username", "status"],
      dataState: {
        kind: "stale",
        title: "治理记录需要刷新",
        description: "当前显示的是上一轮同步结果。"
      },
      emptyText: "暂无用户记录。",
      query: "alice",
      rows: [selectedRecord],
      selectedRecord,
      statusFilter: "active",
      statusOptions: [
        { label: "全部状态", value: "all" },
        { label: "活跃", value: "active" }
      ],
      summary: {
        total: 1
      },
      totalCount: 3
    });
  });

  it("falls back to an empty governance copy when the active view has no governance module config", () => {
    const props = buildAdminWorkspaceModuleProps({
      activeView: "dashboard",
      governance: {
        dataState: null,
        query: "",
        rows: [],
        selectedRecord: null,
        statusFilter: "all",
        statusOptions: [],
        summary: null,
        totalCount: 0
      },
      governanceColumns: [],
      moderation: {
        dataState: null,
        items: [],
        query: "",
        statusFilter: "all",
        statusOptions: [],
        totalCount: 0
      },
      overviewCards: [],
      pendingMaterialsCount: 0,
      pendingPostsCount: 0,
      totalModerationCount: 0
    });

    expect(props.governance.emptyText).toBe("");
    expect(props.governance.actions).toEqual([]);
  });
});
