import { describe, expect, it } from "vitest";
import { resolveGovernanceMutationMeta } from "./adminGovernanceMutationMeta";

describe("adminGovernanceMutationMeta", () => {
  it("builds shared governance mutation metadata for each keyed governance action", () => {
    expect(
      resolveGovernanceMutationMeta("report", { id: "report-1" }, "resolve")
    ).toEqual({
      kind: "ready",
      path: "/api/v1/admin/reports/report-1/resolve",
      successNotice: "举报 report-1 已更新为 {status}。",
      errorFallbackMessage: "更新举报状态失败",
      reloadView: "community"
    });

    expect(
      resolveGovernanceMutationMeta("user", { id: "user-1" }, "disable")
    ).toEqual({
      kind: "ready",
      path: "/api/v1/admin/users/user-1/disable",
      successNotice: "用户 user-1 已更新为 {status}。",
      errorFallbackMessage: "更新用户状态失败",
      reloadView: "users"
    });

    expect(
      resolveGovernanceMutationMeta("aiTask", { id: "task-1" }, "retry")
    ).toEqual({
      kind: "ready",
      path: "/api/v1/admin/ai/tasks/task-1/retry",
      successNotice: "AI 任务 task-1 已更新为 {status}。",
      errorFallbackMessage: "更新 AI 任务状态失败",
      reloadView: "ai"
    });

    expect(
      resolveGovernanceMutationMeta("template", { id: "uml-class" }, "unpublish")
    ).toEqual({
      kind: "ready",
      path: "/api/v1/admin/diagram-templates/uml-class/unpublish",
      successNotice: "图谱模板 uml-class 已更新为 {status}。",
      errorFallbackMessage: "更新图谱模板状态失败",
      reloadView: "graph"
    });
  });

  it("surfaces the shared missing-id error copy when the governance record id is absent", () => {
    expect(resolveGovernanceMutationMeta("report", { id: "" }, "resolve")).toEqual({
      kind: "invalid",
      message: "举报标识缺失，无法提交处理结果。"
    });

    expect(resolveGovernanceMutationMeta("user", {}, "disable")).toEqual({
      kind: "invalid",
      message: "用户标识缺失，无法提交治理动作。"
    });

    expect(resolveGovernanceMutationMeta("aiTask", { id: null }, "retry")).toEqual({
      kind: "invalid",
      message: "AI 任务标识缺失，无法提交治理动作。"
    });

    expect(resolveGovernanceMutationMeta("template", { id: undefined }, "publish")).toEqual({
      kind: "invalid",
      message: "图谱模板标识缺失，无法提交治理动作。"
    });
  });
});
