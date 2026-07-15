import { describe, expect, it, vi } from "vitest";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import { createAdminWorkspaceMutationAdapter } from "./adminWorkspaceMutationAdapter";

describe("adminWorkspaceMutationAdapter", () => {
  it("skips moderation mutations when there is no active admin session", async () => {
    const runModerationAction = vi.fn();

    const adapter = createAdminWorkspaceMutationAdapter({
      hasSession: () => false,
      loadGovernance: vi.fn(),
      loadModeration: vi.fn(),
      loadOverview: vi.fn(),
      post: vi.fn(),
      readActiveView: () => "materials",
      readStatus: () => null,
      resolveErrorMessage: vi.fn(),
      runners: {
        requestGovernanceAction: vi.fn(),
        requestModerationAction: vi.fn(),
        runGovernanceAction: vi.fn(),
        runModerationAction
      },
      setAITaskAction: vi.fn(),
      setAITaskError: vi.fn(),
      setError: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setLoading: vi.fn(),
      setModerationAction: vi.fn(),
      setModerationConfirmError: vi.fn(),
      setNotice: vi.fn(),
      setReportAction: vi.fn(),
      setReportConfirmError: vi.fn(),
      setTemplateAction: vi.fn(),
      setTemplateConfirmError: vi.fn(),
      setUserAction: vi.fn(),
      setUserConfirmError: vi.fn()
    });

    await adapter.applyModerationAction(
      {
        id: "material-1",
        type: "material",
        title: "Material",
        summary: "",
        authorName: "Alice",
        status: "pending",
        createdAt: "",
        updatedAt: ""
      },
      "approve"
    );

    expect(runModerationAction).not.toHaveBeenCalled();
  });

  it("routes moderation mutations through the shared runner with the current active view", async () => {
    const runModerationAction = vi.fn(async () => {});
    const loadGovernance = vi.fn();
    const loadModeration = vi.fn();
    const loadOverview = vi.fn();
    const post = vi.fn(async () => ({ status: "approved" })) as <T>(
      path: string,
      body: unknown
    ) => Promise<T>;

    const adapter = createAdminWorkspaceMutationAdapter({
      hasSession: () => true,
      loadGovernance,
      loadModeration,
      loadOverview,
      post,
      readActiveView: () => "materials",
      readStatus: () => null,
      resolveErrorMessage: vi.fn(),
      runners: {
        requestGovernanceAction: vi.fn(),
        requestModerationAction: vi.fn(),
        runGovernanceAction: vi.fn(),
        runModerationAction
      },
      setAITaskAction: vi.fn(),
      setAITaskError: vi.fn(),
      setError: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setLoading: vi.fn(),
      setModerationAction: vi.fn(),
      setModerationConfirmError: vi.fn(),
      setNotice: vi.fn(),
      setReportAction: vi.fn(),
      setReportConfirmError: vi.fn(),
      setTemplateAction: vi.fn(),
      setTemplateConfirmError: vi.fn(),
      setUserAction: vi.fn(),
      setUserConfirmError: vi.fn()
    });

    const item = {
      id: "material-1",
      type: "material" as const,
      title: "Material",
      summary: "",
      authorName: "Alice",
      status: "pending",
      createdAt: "",
      updatedAt: ""
    };

    await adapter.applyModerationAction(item, "approve");

    expect(runModerationAction).toHaveBeenCalledWith(
      "materials",
      item,
      "approve",
      expect.objectContaining({
        loadGovernance,
        loadModeration,
        loadOverview,
        post: expect.any(Function)
      })
    );
  });

  it("routes governance requests through the shared request helper with the current view", () => {
    const requestGovernanceAction = vi.fn();

    const adapter = createAdminWorkspaceMutationAdapter({
      hasSession: () => true,
      loadGovernance: vi.fn(),
      loadModeration: vi.fn(),
      loadOverview: vi.fn(),
      post: vi.fn(),
      readActiveView: () => "users",
      readStatus: () => null,
      resolveErrorMessage: vi.fn(),
      runners: {
        requestGovernanceAction,
        requestModerationAction: vi.fn(),
        runGovernanceAction: vi.fn(),
        runModerationAction: vi.fn()
      },
      setAITaskAction: vi.fn(),
      setAITaskError: vi.fn(),
      setError: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setLoading: vi.fn(),
      setModerationAction: vi.fn(),
      setModerationConfirmError: vi.fn(),
      setNotice: vi.fn(),
      setReportAction: vi.fn(),
      setReportConfirmError: vi.fn(),
      setTemplateAction: vi.fn(),
      setTemplateConfirmError: vi.fn(),
      setUserAction: vi.fn(),
      setUserConfirmError: vi.fn()
    });

    const payload: { action: string; record: GovernanceRecord } = {
      action: "disable",
      record: { id: "user-1" }
    };

    adapter.requestGovernanceAction(payload);

    expect(requestGovernanceAction).toHaveBeenCalledWith(
      "users",
      payload,
      expect.objectContaining({
        requestModerationAction: expect.any(Function),
        setUserAction: expect.any(Function)
      })
    );
  });

  it("routes governance mutations through the shared runner with the matching domain key", async () => {
    const runGovernanceAction = vi.fn(async () => {});
    const post = vi.fn(async () => ({ status: "disabled" })) as <T>(
      path: string,
      body: unknown
    ) => Promise<T>;
    const record: GovernanceRecord = { id: "user-1" };

    const adapter = createAdminWorkspaceMutationAdapter({
      hasSession: () => true,
      loadGovernance: vi.fn(),
      loadModeration: vi.fn(),
      loadOverview: vi.fn(),
      post,
      readActiveView: () => "users",
      readStatus: () => null,
      resolveErrorMessage: vi.fn(),
      runners: {
        requestGovernanceAction: vi.fn(),
        requestModerationAction: vi.fn(),
        runGovernanceAction,
        runModerationAction: vi.fn()
      },
      setAITaskAction: vi.fn(),
      setAITaskError: vi.fn(),
      setError: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setLoading: vi.fn(),
      setModerationAction: vi.fn(),
      setModerationConfirmError: vi.fn(),
      setNotice: vi.fn(),
      setReportAction: vi.fn(),
      setReportConfirmError: vi.fn(),
      setTemplateAction: vi.fn(),
      setTemplateConfirmError: vi.fn(),
      setUserAction: vi.fn(),
      setUserConfirmError: vi.fn()
    });

    await adapter.applyUserAction(record, "disable");

    expect(runGovernanceAction).toHaveBeenCalledWith(
      "user",
      record,
      "disable",
      expect.objectContaining({
        reloadView: expect.any(Function),
        request: expect.any(Function),
        resetDialog: expect.any(Function)
      })
    );
  });
});
