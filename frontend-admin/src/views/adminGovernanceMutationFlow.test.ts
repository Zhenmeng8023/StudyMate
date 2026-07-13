import { describe, expect, it, vi } from "vitest";
import { runAdminGovernanceMutation } from "./adminGovernanceMutationFlow";

describe("adminGovernanceMutationFlow", () => {
  it("short-circuits invalid governance mutations before requesting or reloading", async () => {
    const request = vi.fn(async () => ({ status: "ok" }));
    const reloadView = vi.fn(async () => {});
    const resetDialog = vi.fn();

    const result = await runAdminGovernanceMutation("user", {}, "disable", {
      readStatus: () => null,
      reloadView,
      request,
      resetDialog,
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage
    });

    expect(result).toEqual({
      kind: "invalid",
      message: "用户标识缺失，无法提交治理动作。"
    });
    expect(request).not.toHaveBeenCalled();
    expect(resetDialog).not.toHaveBeenCalled();
    expect(reloadView).not.toHaveBeenCalled();
  });

  it("executes the governance mutation request, resets the dialog, and reloads the target view in order", async () => {
    const steps: string[] = [];
    const request = vi.fn(async (path: string) => {
      steps.push(`request:${path}`);
      return { status: "disabled" };
    });
    const resetDialog = vi.fn((key: string) => {
      steps.push(`reset:${key}`);
    });
    const reloadView = vi.fn(async (view: string) => {
      steps.push(`reload:${view}`);
    });

    const result = await runAdminGovernanceMutation("user", { id: "user-1" }, "disable", {
      readStatus: () => null,
      reloadView,
      request,
      resetDialog,
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage
    });

    expect(result).toEqual({
      kind: "success",
      notice: "用户 user-1 已更新为 disabled。"
    });
    expect(steps).toEqual([
      "request:/api/v1/admin/users/user-1/disable",
      "reset:user",
      "reload:users"
    ]);
  });

  it("returns a conflict-aware error result when the governance mutation fails with 409", async () => {
    const request = vi.fn(async () => {
      throw new Error("该任务已经不再处于可重试状态");
    });

    const result = await runAdminGovernanceMutation("aiTask", { id: "task-1" }, "retry", {
      readStatus: () => 409,
      reloadView: async () => {},
      request,
      resetDialog: () => {},
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage
    });

    expect(result).toEqual({
      kind: "error",
      message: "该任务已经不再处于可重试状态",
      shouldMarkConflict: true,
      status: 409
    });
  });
});
