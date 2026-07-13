import { describe, expect, it, vi } from "vitest";
import {
  runAdminWorkspaceGovernanceAction,
  runAdminWorkspaceModerationAction
} from "./adminWorkspaceMutationState";

describe("adminWorkspaceMutationState", () => {
  it("runs the moderation success flow, resets the dialog, and reloads the dependent views", async () => {
    const steps: string[] = [];

    await runAdminWorkspaceModerationAction(
      "materials",
      {
        id: "material-1",
        type: "material",
        title: "资料 A",
        summary: "summary",
        authorName: "alice",
        status: "pending",
        createdAt: "2026-07-14T00:00:00Z",
        updatedAt: "2026-07-14T00:00:00Z"
      },
      "approve",
      {
        loadGovernance: async (view) => {
          steps.push(`governance:${view}`);
        },
        loadModeration: async () => {
          steps.push("moderation");
        },
        loadOverview: async () => {
          steps.push("overview");
        },
        post: async (path) => {
          steps.push(`post:${path}`);
          return { status: "approved" };
        },
        readStatus: () => null,
        resetDialog: () => {
          steps.push("reset");
        },
        resolveErrorMessage: (error, fallbackMessage) =>
          error instanceof Error ? error.message : fallbackMessage,
        setConfirmError: vi.fn(),
        setError: vi.fn(),
        setGovernanceStatus: vi.fn((status) => {
          steps.push(`status:${String(status)}`);
        }),
        setLoading: vi.fn((loading) => {
          steps.push(`loading:${String(loading)}`);
        }),
        setNotice: vi.fn((notice) => {
          steps.push(`notice:${notice}`);
        })
      }
    );

    expect(steps).toEqual([
      "loading:true",
      "status:null",
      "post:/api/v1/admin/moderation/materials/material-1/approve",
      "reset",
      "notice:「资料 A」已更新为 approved。",
      "moderation",
      "overview",
      "governance:materials",
      "loading:false"
    ]);
  });

  it("marks governance conflict on moderation failure when the material action returns 409", async () => {
    const setError = vi.fn();
    const setConfirmError = vi.fn();
    const setGovernanceStatus = vi.fn();

    await runAdminWorkspaceModerationAction(
      "materials",
      {
        id: "material-1",
        type: "material",
        title: "资料 A",
        summary: "summary",
        authorName: "alice",
        status: "pending",
        createdAt: "2026-07-14T00:00:00Z",
        updatedAt: "2026-07-14T00:00:00Z"
      },
      "reject",
      {
        loadGovernance: async () => {},
        loadModeration: async () => {},
        loadOverview: async () => {},
        post: async () => {
          const error = new Error("moderation conflict");
          Object.assign(error, { status: 409 });
          throw error;
        },
        readStatus: () => 409,
        resetDialog: vi.fn(),
        resolveErrorMessage: (error, fallbackMessage) =>
          error instanceof Error ? error.message : fallbackMessage,
        setConfirmError,
        setError,
        setGovernanceStatus,
        setLoading: vi.fn(),
        setNotice: vi.fn()
      }
    );

    expect(setGovernanceStatus).toHaveBeenNthCalledWith(1, null);
    expect(setGovernanceStatus).toHaveBeenLastCalledWith(409);
    expect(setError).toHaveBeenLastCalledWith("moderation conflict");
    expect(setConfirmError).toHaveBeenLastCalledWith("moderation conflict");
  });

  it("short-circuits invalid governance actions through the shared state adapter", async () => {
    const runMutation = vi.fn(async () => ({
      kind: "invalid" as const,
      message: "invalid governance action"
    }));
    const setConfirmError = vi.fn();

    await runAdminWorkspaceGovernanceAction("user", {}, "disable", {
      readStatus: () => null,
      request: async () => ({ status: "disabled" }),
      resetDialog: vi.fn(),
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage,
      runMutation,
      setConfirmError,
      setError: vi.fn(),
      setGovernanceStatus: vi.fn(),
      setLoading: vi.fn(),
      setNotice: vi.fn()
    });

    expect(runMutation).toHaveBeenCalled();
    expect(setConfirmError).toHaveBeenLastCalledWith("invalid governance action");
  });

  it("publishes the shared notice on governance success", async () => {
    const steps: string[] = [];

    await runAdminWorkspaceGovernanceAction("report", { id: "report-1" }, "resolve", {
      readStatus: () => null,
      request: async () => ({ status: "resolved" }),
      resetDialog: vi.fn(),
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage,
      runMutation: async () => ({
        kind: "success" as const,
        notice: "举报 report-1 已处理。"
      }),
      setConfirmError: vi.fn(),
      setError: vi.fn(),
      setGovernanceStatus: vi.fn((status) => {
        steps.push(`status:${String(status)}`);
      }),
      setLoading: vi.fn((loading) => {
        steps.push(`loading:${String(loading)}`);
      }),
      setNotice: vi.fn((notice) => {
        steps.push(`notice:${notice}`);
      })
    });

    expect(steps).toEqual([
      "loading:true",
      "status:null",
      "notice:举报 report-1 已处理。",
      "loading:false"
    ]);
  });

  it("propagates governance 409 errors back into top-level and confirm state", async () => {
    const setError = vi.fn();
    const setConfirmError = vi.fn();
    const setGovernanceStatus = vi.fn();

    await runAdminWorkspaceGovernanceAction("aiTask", { id: "task-1" }, "retry", {
      readStatus: () => 409,
      request: async () => ({ status: "retrying" }),
      resetDialog: vi.fn(),
      resolveErrorMessage: (error, fallbackMessage) =>
        error instanceof Error ? error.message : fallbackMessage,
      runMutation: async () => ({
        kind: "error" as const,
        message: "governance conflict",
        shouldMarkConflict: true,
        status: 409
      }),
      setConfirmError,
      setError,
      setGovernanceStatus,
      setLoading: vi.fn(),
      setNotice: vi.fn()
    });

    expect(setGovernanceStatus).toHaveBeenNthCalledWith(1, null);
    expect(setGovernanceStatus).toHaveBeenLastCalledWith(409);
    expect(setError).toHaveBeenLastCalledWith("governance conflict");
    expect(setConfirmError).toHaveBeenLastCalledWith("governance conflict");
  });
});
