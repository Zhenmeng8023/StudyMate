import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceRefresh } from "./adminWorkspaceRefresh";

describe("adminWorkspaceRefresh", () => {
  it("reloads the current active view when the refresh plan allows it", () => {
    const loadActiveView = vi.fn();

    runAdminWorkspaceRefresh(
      {
        nextView: "users",
        shouldLoadView: true
      },
      {
        loadActiveView
      }
    );

    expect(loadActiveView).toHaveBeenCalledWith("users");
  });

  it("skips reloading when the refresh plan disables the load step", () => {
    const loadActiveView = vi.fn();

    runAdminWorkspaceRefresh(
      {
        nextView: "dashboard",
        shouldLoadView: false
      },
      {
        loadActiveView
      }
    );

    expect(loadActiveView).not.toHaveBeenCalled();
  });
});
