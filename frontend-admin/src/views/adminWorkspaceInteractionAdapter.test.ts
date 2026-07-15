import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceInteractionAdapter } from "./adminWorkspaceInteractionAdapter";
import type { AdminWorkspaceViewSwitchPlan } from "./adminWorkspaceLifecycle";

describe("adminWorkspaceInteractionAdapter", () => {
  it("routes view switching through the shared plan runner and updates selected records", () => {
    const clearWorkspaceState = vi.fn();
    const loadActiveView = vi.fn();
    const setActiveView = vi.fn();
    const setSelectedRecord = vi.fn();
    const syncLocation = vi.fn();
    const buildViewSwitchPlan = vi.fn(
      (): AdminWorkspaceViewSwitchPlan => ({
        nextView: "users",
        resetKeys: ["queries"],
        shouldLoadView: true,
        syncMode: "push"
      })
    );
    const runViewSwitch = vi.fn();

    const adapter = createAdminWorkspaceInteractionAdapter({
      clearWorkspaceState,
      loadActiveView,
      runners: {
        buildViewSwitchPlan,
        runViewSwitch
      },
      setActiveView,
      setSelectedRecord,
      syncLocation
    });

    adapter.switchView("users");
    adapter.selectRecord({ id: "record-1", title: "Alice" });

    expect(buildViewSwitchPlan).toHaveBeenCalledWith("users");
    expect(runViewSwitch).toHaveBeenCalledWith(
      {
        nextView: "users",
        resetKeys: ["queries"],
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
    expect(setSelectedRecord).toHaveBeenCalledWith({ id: "record-1", title: "Alice" });
  });

  it("navigates without preloading the current page again in route-level mode", () => {
    const clearWorkspaceState = vi.fn();
    const loadActiveView = vi.fn();
    const setActiveView = vi.fn();
    const setSelectedRecord = vi.fn();
    const syncLocation = vi.fn();
    const buildViewSwitchPlan = vi.fn(
      (): AdminWorkspaceViewSwitchPlan => ({
        nextView: "users",
        resetKeys: ["queries"],
        shouldLoadView: true,
        syncMode: "push"
      })
    );
    const runViewSwitch = vi.fn();

    const adapter = createAdminWorkspaceInteractionAdapter({
      clearWorkspaceState,
      loadActiveView,
      routeNavigationOnly: true,
      runners: {
        buildViewSwitchPlan,
        runViewSwitch
      },
      setActiveView,
      setSelectedRecord,
      syncLocation
    });

    adapter.switchView("users");

    expect(buildViewSwitchPlan).toHaveBeenCalledWith("users");
    expect(syncLocation).toHaveBeenCalledWith("users", "push");
    expect(runViewSwitch).not.toHaveBeenCalled();
    expect(clearWorkspaceState).not.toHaveBeenCalled();
    expect(setActiveView).not.toHaveBeenCalled();
    expect(loadActiveView).not.toHaveBeenCalled();
    expect(setSelectedRecord).not.toHaveBeenCalled();
  });
});
