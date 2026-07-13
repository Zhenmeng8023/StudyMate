import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspacePopstate } from "./adminWorkspacePopstate";

describe("adminWorkspacePopstate", () => {
  it("resets query state, applies the next view, and reloads it in order", () => {
    const steps: string[] = [];
    const clearWorkspaceState = vi.fn((keys?: string[]) => {
      steps.push(`reset:${keys?.join(",") ?? "all"}`);
    });
    const setActiveView = vi.fn((view: string) => {
      steps.push(`view:${view}`);
    });
    const loadActiveView = vi.fn((view: string) => {
      steps.push(`load:${view}`);
    });

    runAdminWorkspacePopstate(
      {
        nextView: "audit",
        resetKeys: ["queries"],
        shouldLoadView: true
      },
      {
        clearWorkspaceState,
        loadActiveView,
        setActiveView
      }
    );

    expect(steps).toEqual(["reset:queries", "view:audit", "load:audit"]);
  });

  it("skips reloading when the popstate plan disables the load step", () => {
    const clearWorkspaceState = vi.fn();
    const setActiveView = vi.fn();
    const loadActiveView = vi.fn();

    runAdminWorkspacePopstate(
      {
        nextView: "users",
        resetKeys: ["queries"],
        shouldLoadView: false
      },
      {
        clearWorkspaceState,
        loadActiveView,
        setActiveView
      }
    );

    expect(clearWorkspaceState).toHaveBeenCalledWith(["queries"]);
    expect(setActiveView).toHaveBeenCalledWith("users");
    expect(loadActiveView).not.toHaveBeenCalled();
  });
});
