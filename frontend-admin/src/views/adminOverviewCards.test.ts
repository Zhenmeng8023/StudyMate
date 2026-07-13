import { describe, expect, it } from "vitest";
import { buildAdminOverviewCards } from "./adminOverviewCards";

describe("adminOverviewCards", () => {
  it("builds the canonical dashboard overview cards from overview data", () => {
    expect(
      buildAdminOverviewCards({
        moderationItemsCount: 3,
        overview: {
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 8
        }
      })
    ).toEqual([
      { label: "待处理", value: "8", helper: "需要审核或复核的公开内容" },
      { label: "用户规模", value: "12", helper: "当前已注册的学习者与管理员" },
      { label: "资料沉淀", value: "5", helper: "可被阅读、引用和治理的资料" },
      { label: "知识图谱", value: "6", helper: "用户持续维护的知识结构" }
    ]);
  });

  it("falls back to the loaded moderation count when overview is unavailable", () => {
    expect(
      buildAdminOverviewCards({
        moderationItemsCount: 3,
        overview: null
      })
    ).toEqual([
      { label: "待处理", value: "3", helper: "需要审核或复核的公开内容" },
      { label: "用户规模", value: "0", helper: "当前已注册的学习者与管理员" },
      { label: "资料沉淀", value: "0", helper: "可被阅读、引用和治理的资料" },
      { label: "知识图谱", value: "0", helper: "用户持续维护的知识结构" }
    ]);
  });
});
