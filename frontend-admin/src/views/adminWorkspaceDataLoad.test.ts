import { describe, expect, it, vi } from "vitest";
import {
  runAdminWorkspaceGovernanceLoad,
  runAdminWorkspaceModerationLoad,
  runAdminWorkspaceOverviewLoad,
  runAdminWorkspaceProfileRefresh
} from "./adminWorkspaceDataLoad";

describe("adminWorkspaceDataLoad", () => {
  it("applies the refreshed profile on a successful profile read", async () => {
    const setError = vi.fn();
    const setProfile = vi.fn();

    await runAdminWorkspaceProfileRefresh({
      fallbackMessage: "profile fallback",
      readStatus: () => null,
      request: async () => ({
        id: "admin-1",
        displayName: "Operator"
      }),
      setError,
      setProfile
    });

    expect(setProfile).toHaveBeenCalledWith({
      id: "admin-1",
      displayName: "Operator"
    });
    expect(setError).not.toHaveBeenCalled();
  });

  it("stores the overview payload when the dashboard overview read succeeds", async () => {
    const setError = vi.fn();
    const setOverview = vi.fn();

    await runAdminWorkspaceOverviewLoad({
      fallbackMessage: "overview fallback",
      readStatus: () => null,
      request: async () => ({
        userCount: 12,
        postCount: 4
      }),
      setError,
      setOverview
    });

    expect(setOverview).toHaveBeenCalledWith({
      userCount: 12,
      postCount: 4
    });
    expect(setError).not.toHaveBeenCalled();
  });

  it("clears moderation rows on forbidden and surfaces the returned status", async () => {
    const setLoading = vi.fn();
    const setError = vi.fn();
    const setStatus = vi.fn();
    const setItems = vi.fn();
    const setNotice = vi.fn();

    await runAdminWorkspaceModerationLoad({
      fallbackMessage: "moderation fallback",
      getLoadedNotice: (count) => `loaded:${count}`,
      readStatus: () => 403,
      request: async () => {
        const error = new Error("forbidden moderation");
        Object.assign(error, { status: 403 });
        throw error;
      },
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage,
      setError,
      setItems,
      setLoading,
      setNotice,
      setStatus
    });

    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setError).toHaveBeenNthCalledWith(1, "");
    expect(setStatus).toHaveBeenNthCalledWith(1, null);
    expect(setItems).toHaveBeenCalledWith([]);
    expect(setStatus).toHaveBeenLastCalledWith(403);
    expect(setError).toHaveBeenLastCalledWith("forbidden moderation");
    expect(setNotice).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("preserves existing governance rows during a same-view refresh failure", async () => {
    const setLoading = vi.fn();
    const setError = vi.fn();
    const setStatus = vi.fn();
    const setRows = vi.fn();
    const setSummary = vi.fn();
    const setRowsView = vi.fn();
    const setSelectedRecord = vi.fn();
    const setNotice = vi.fn();

    await runAdminWorkspaceGovernanceLoad("users", {
      currentRows: [
        {
          id: "user-1",
          username: "alice",
          status: "active"
        }
      ],
      currentRowsView: "users",
      fallbackMessage: "governance fallback",
      getLoadedNotice: (count) => `loaded:${count}`,
      readStatus: () => 500,
      request: async () => {
        const error = new Error("governance failed");
        Object.assign(error, { status: 500 });
        throw error;
      },
      requestSummary: async () => ({ id: "summary-1" }),
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage,
      setError,
      setLoading,
      setNotice,
      setRows,
      setRowsView,
      setSelectedRecord,
      setStatus,
      setSummary
    });

    expect(setRows).not.toHaveBeenCalledWith([]);
    expect(setSummary).not.toHaveBeenCalledWith(null);
    expect(setRowsView).not.toHaveBeenCalled();
    expect(setSelectedRecord).not.toHaveBeenCalled();
    expect(setStatus).toHaveBeenLastCalledWith(500);
    expect(setError).toHaveBeenLastCalledWith("governance failed");
    expect(setNotice).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });
});
