import { describe, expect, it, vi } from "vitest";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import { createAdminWorkspaceReadAdapter } from "./adminWorkspaceReadAdapter";

describe("adminWorkspaceReadAdapter", () => {
  it("skips profile refresh when there is no active admin session", async () => {
    const runProfileRefresh = vi.fn();

    const adapter = createAdminWorkspaceReadAdapter({
      get: vi.fn(),
      getGovernanceLoadedNotice: vi.fn(),
      getModerationLoadedNotice: vi.fn(),
      hasSession: () => false,
      readGovernanceRows: () => [],
      readGovernanceRowsView: () => null,
      readStatus: () => null,
      resolveErrorMessage: vi.fn(),
      runners: {
        runGovernanceLoad: vi.fn(),
        runModerationLoad: vi.fn(),
        runOverviewLoad: vi.fn(),
        runProfileRefresh,
        runViewLoad: vi.fn()
      },
      setError: vi.fn(),
      setGovernanceRows: vi.fn(),
      setGovernanceRowsView: vi.fn(),
      setGovernanceSelectedRecord: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setGovernanceSummary: vi.fn(),
      setLoading: vi.fn(),
      setModerationItems: vi.fn(),
      setModerationStatus: vi.fn(),
      setNotice: vi.fn(),
      setOverview: vi.fn(),
      setProfile: vi.fn()
    });

    await adapter.refreshProfile();

    expect(runProfileRefresh).not.toHaveBeenCalled();
  });

  it("runs dashboard loads through the shared view-load runner", async () => {
    const runViewLoad = vi.fn(async (_view, handlers) => {
      await handlers.loadOverview();
      await handlers.loadModeration();
    });
    const runOverviewLoad = vi.fn(async (options) => {
      options.setOverview({ userCount: 12 });
    });
    const runModerationLoad = vi.fn(async (options) => {
      options.setItems([{ id: "post-1" }]);
      options.setNotice("loaded:1");
    });

    const adapter = createAdminWorkspaceReadAdapter({
      get: vi.fn(),
      getGovernanceLoadedNotice: vi.fn(),
      getModerationLoadedNotice: (count) => `loaded:${count}`,
      hasSession: () => true,
      readGovernanceRows: () => [],
      readGovernanceRowsView: () => null,
      readStatus: () => null,
      resolveErrorMessage: vi.fn(),
      runners: {
        runGovernanceLoad: vi.fn(),
        runModerationLoad,
        runOverviewLoad,
        runProfileRefresh: vi.fn(),
        runViewLoad
      },
      setError: vi.fn(),
      setGovernanceRows: vi.fn(),
      setGovernanceRowsView: vi.fn(),
      setGovernanceSelectedRecord: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setGovernanceSummary: vi.fn(),
      setLoading: vi.fn(),
      setModerationItems: vi.fn(),
      setModerationStatus: vi.fn(),
      setNotice: vi.fn(),
      setOverview: vi.fn(),
      setProfile: vi.fn()
    });

    await adapter.loadActiveView("dashboard");

    expect(runViewLoad).toHaveBeenCalledWith(
      "dashboard",
      expect.objectContaining({
        loadGovernance: expect.any(Function),
        loadModeration: expect.any(Function),
        loadOverview: expect.any(Function)
      })
    );
    expect(runOverviewLoad).toHaveBeenCalledTimes(1);
    expect(runModerationLoad).toHaveBeenCalledTimes(1);
  });

  it("passes the cached governance context into the shared governance loader", async () => {
    const currentRows: GovernanceRecord[] = [
      {
        id: "user-1",
        username: "alice",
        status: "active"
      }
    ];
    const runGovernanceLoad = vi.fn(async () => {});

    const adapter = createAdminWorkspaceReadAdapter({
      get: vi.fn(),
      getGovernanceLoadedNotice: (count) => `loaded:${count}`,
      getModerationLoadedNotice: vi.fn(),
      hasSession: () => true,
      readGovernanceRows: () => currentRows,
      readGovernanceRowsView: () => "users",
      readStatus: () => null,
      resolveErrorMessage: vi.fn(),
      runners: {
        runGovernanceLoad,
        runModerationLoad: vi.fn(),
        runOverviewLoad: vi.fn(),
        runProfileRefresh: vi.fn(),
        runViewLoad: vi.fn()
      },
      setError: vi.fn(),
      setGovernanceRows: vi.fn(),
      setGovernanceRowsView: vi.fn(),
      setGovernanceSelectedRecord: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setGovernanceSummary: vi.fn(),
      setLoading: vi.fn(),
      setModerationItems: vi.fn(),
      setModerationStatus: vi.fn(),
      setNotice: vi.fn(),
      setOverview: vi.fn(),
      setProfile: vi.fn()
    });

    await adapter.loadGovernance("users");

    expect(runGovernanceLoad).toHaveBeenCalledWith(
      "users",
      expect.objectContaining({
        currentRows,
        currentRowsView: "users"
      })
    );
  });
});
