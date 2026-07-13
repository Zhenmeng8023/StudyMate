import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceSessionCleared } from "./adminWorkspaceSessionCleared";

describe("adminWorkspaceSessionCleared", () => {
  it("resets workspace state, syncs the default view, clears the error, and sets the notice in order", () => {
    const steps: string[] = [];
    const clearWorkspaceState = vi.fn((keys?: string[]) => {
      steps.push(`reset:${keys ? keys.join(",") : "all"}`);
    });
    const setActiveView = vi.fn((view: string) => {
      steps.push(`view:${view}`);
    });
    const syncLocation = vi.fn((view: string, syncMode: string) => {
      steps.push(`sync:${view}:${syncMode}`);
    });
    const clearError = vi.fn(() => {
      steps.push("error");
    });
    const setNotice = vi.fn((notice: string) => {
      steps.push(`notice:${notice}`);
    });

    runAdminWorkspaceSessionCleared(
      {
        clearError: true,
        nextView: "dashboard",
        notice: "后台会话已失效，请重新登录后继续治理工作。",
        resetKeys: ["queries", "confirmState"],
        syncMode: "replace"
      },
      {
        clearError,
        clearWorkspaceState,
        setActiveView,
        setNotice,
        syncLocation
      }
    );

    expect(steps).toEqual([
      "reset:queries,confirmState",
      "view:dashboard",
      "sync:dashboard:replace",
      "error",
      "notice:后台会话已失效，请重新登录后继续治理工作。"
    ]);
  });

  it("keeps the current error state when the plan says not to clear it", () => {
    const clearWorkspaceState = vi.fn();
    const setActiveView = vi.fn();
    const syncLocation = vi.fn();
    const clearError = vi.fn();
    const setNotice = vi.fn();

    runAdminWorkspaceSessionCleared(
      {
        clearError: false,
        nextView: "dashboard",
        notice: "当前账号已被禁用，请联系其他管理员后重新登录。",
        resetKeys: undefined,
        syncMode: "replace"
      },
      {
        clearError,
        clearWorkspaceState,
        setActiveView,
        setNotice,
        syncLocation
      }
    );

    expect(clearWorkspaceState).toHaveBeenCalledWith(undefined);
    expect(setActiveView).toHaveBeenCalledWith("dashboard");
    expect(syncLocation).toHaveBeenCalledWith("dashboard", "replace");
    expect(clearError).not.toHaveBeenCalled();
    expect(setNotice).toHaveBeenCalledWith("当前账号已被禁用，请联系其他管理员后重新登录。");
  });
});
