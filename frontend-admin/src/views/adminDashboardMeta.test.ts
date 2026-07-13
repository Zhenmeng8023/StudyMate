import { describe, expect, it } from "vitest";
import {
  adminDashboardModerationFeature,
  adminDashboardSummaryFeature,
  buildAdminDashboardSummaryItems
} from "./adminDashboardMeta";

describe("adminDashboardMeta", () => {
  it("exposes the shared dashboard feature copy", () => {
    expect(adminDashboardModerationFeature).toEqual({
      actionLabel: "进入审核队列",
      description: "审核队列中的资料和帖子会直接影响社区与资料库的公开可见性。",
      eyebrow: "优先队列",
      title: "先处理内容审核"
    });

    expect(adminDashboardSummaryFeature).toEqual({
      eyebrow: "当前数据",
      title: "审核概览"
    });
  });

  it("builds the shared moderation summary items and derives pressure text", () => {
    expect(
      buildAdminDashboardSummaryItems({
        moderationItemsCount: 3,
        pendingMaterialsCount: 1,
        pendingPostsCount: 2
      })
    ).toEqual([
      { label: "待审帖子", value: "2" },
      { label: "待审资料", value: "1" },
      { label: "审核压力", value: "需要关注" }
    ]);

    expect(
      buildAdminDashboardSummaryItems({
        moderationItemsCount: 0,
        pendingMaterialsCount: 0,
        pendingPostsCount: 0
      })
    ).toEqual([
      { label: "待审帖子", value: "0" },
      { label: "待审资料", value: "0" },
      { label: "审核压力", value: "平稳" }
    ]);
  });
});
