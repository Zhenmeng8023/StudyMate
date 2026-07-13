import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceViewSwitch } from "./adminWorkspaceViewSwitch";

describe("adminWorkspaceViewSwitch", () => {
  it("resets workspace state, syncs the next view, and loads it in order", () => {
    const steps: string[] = [];
    const clearWorkspaceState = vi.fn((keys?: string[]) => {
      steps.push(`reset:${keys?.join(",") ?? "all"}`);
    });
    const setActiveView = vi.fn((view: string) => {
      steps.push(`view:${view}`);
    });
    const syncLocation = vi.fn((view: string, syncMode: string) => {
      steps.push(`sync:${view}:${syncMode}`);
    });
    const loadActiveView = vi.fn((view: string) => {
      steps.push(`load:${view}`);
    });

    runAdminWorkspaceViewSwitch(
      {
        nextView: "users",
        resetKeys: ["queries", "filters", "confirmState"],
        shouldLoadView: true,
        syncMode: "push"
      },
      {
        clearWorkspaceState,
        loadActiveView,
        setActiveView,
        syncLocation
      }
    );

    expect(steps).toEqual([
      "reset:queries,filters,confirmState",
      "view:users",
      "sync:users:push",
      "load:users"
    ]);
  });

  it("skips reloading when the switch plan says not to load the next view", () => {
    const clearWorkspaceState = vi.fn();
    const setActiveView = vi.fn();
    const syncLocation = vi.fn();
    const loadActiveView = vi.fn();

    runAdminWorkspaceViewSwitch(
      {
        nextView: "audit",
        resetKeys: ["queries"],
        shouldLoadView: false,
        syncMode: "replace"
      },
      {
        clearWorkspaceState,
        loadActiveView,
        setActiveView,
        syncLocation
      }
    );

    expect(clearWorkspaceState).toHaveBeenCalledWith(["queries"]);
    expect(setActiveView).toHaveBeenCalledWith("audit");
    expect(syncLocation).toHaveBeenCalledWith("audit", "replace");
    expect(loadActiveView).not.toHaveBeenCalled();
  });
});
