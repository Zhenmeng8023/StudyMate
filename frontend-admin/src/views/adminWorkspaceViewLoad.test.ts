import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceViewLoad } from "./adminWorkspaceViewLoad";

describe("adminWorkspaceViewLoad", () => {
  it("loads overview and moderation together for dashboard", async () => {
    const loadOverview = vi.fn(async () => {});
    const loadModeration = vi.fn(async () => {});
    const loadGovernance = vi.fn(async () => {});

    await runAdminWorkspaceViewLoad("dashboard", {
      loadGovernance,
      loadModeration,
      loadOverview
    });

    expect(loadOverview).toHaveBeenCalledTimes(1);
    expect(loadModeration).toHaveBeenCalledTimes(1);
    expect(loadGovernance).not.toHaveBeenCalled();
  });

  it("only loads moderation for moderation view", async () => {
    const loadOverview = vi.fn(async () => {});
    const loadModeration = vi.fn(async () => {});
    const loadGovernance = vi.fn(async () => {});

    await runAdminWorkspaceViewLoad("moderation", {
      loadGovernance,
      loadModeration,
      loadOverview
    });

    expect(loadOverview).not.toHaveBeenCalled();
    expect(loadModeration).toHaveBeenCalledTimes(1);
    expect(loadGovernance).not.toHaveBeenCalled();
  });

  it("loads governance with the resolved governance view for governance modules", async () => {
    const loadOverview = vi.fn(async () => {});
    const loadModeration = vi.fn(async () => {});
    const loadGovernance = vi.fn(async () => {});

    await runAdminWorkspaceViewLoad("users", {
      loadGovernance,
      loadModeration,
      loadOverview
    });

    expect(loadOverview).not.toHaveBeenCalled();
    expect(loadModeration).not.toHaveBeenCalled();
    expect(loadGovernance).toHaveBeenCalledWith("users");
  });
});
