import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceMountBootstrap } from "./adminWorkspaceMountBootstrap";

describe("adminWorkspaceMountBootstrap", () => {
  it("applies the resolved view before kicking off profile refresh and view loading", () => {
    const steps: string[] = [];
    const setActiveView = vi.fn((view: string) => {
      steps.push(`view:${view}`);
    });
    const refreshProfile = vi.fn(async () => {
      steps.push("refresh");
    });
    const loadActiveView = vi.fn((view: string) => {
      steps.push(`load:${view}`);
    });

    runAdminWorkspaceMountBootstrap(
      {
        nextView: "users",
        shouldLoadView: true,
        shouldRefreshProfile: true
      },
      {
        loadActiveView,
        refreshProfile,
        setActiveView
      }
    );

    expect(steps).toEqual(["view:users", "refresh", "load:users"]);
  });

  it("only applies the view when the mount plan says no refresh and no load", () => {
    const setActiveView = vi.fn();
    const refreshProfile = vi.fn(async () => {});
    const loadActiveView = vi.fn();

    runAdminWorkspaceMountBootstrap(
      {
        nextView: "dashboard",
        shouldLoadView: false,
        shouldRefreshProfile: false
      },
      {
        loadActiveView,
        refreshProfile,
        setActiveView
      }
    );

    expect(setActiveView).toHaveBeenCalledWith("dashboard");
    expect(refreshProfile).not.toHaveBeenCalled();
    expect(loadActiveView).not.toHaveBeenCalled();
  });
});
