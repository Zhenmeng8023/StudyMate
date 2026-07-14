import { describe, expect, it, vi } from "vitest";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import { runAdminConfirmDialogHandler } from "./adminConfirmDialogState";
import { createAdminWorkspaceConfirmController } from "./adminWorkspaceConfirmController";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

describe("adminWorkspaceConfirmController", () => {
  it("builds dialogs from the latest pending state and clears all confirm state through resetAll", () => {
    let loading = true;
    let moderationPending:
      | {
          action: "approve" | "reject" | "hide";
          item: AdminWorkspaceModerationItem;
        }
      | null = {
      action: "approve",
      item: {
        id: "post-1",
        type: "material",
        status: "hidden",
        title: "Linear Algebra Notes",
        summary: "",
        authorName: "Alice",
        createdAt: "",
        updatedAt: ""
      }
    };
    let moderationError = "moderation failed";
    let reportPending: { action: "resolve" | "dismiss"; record: GovernanceRecord } | null = {
      action: "resolve",
      record: { id: "report-1" }
    };
    let reportError = "";
    let userPending: { action: "disable" | "activate"; record: GovernanceRecord } | null = {
      action: "disable",
      record: { id: "user-1" }
    };
    let userError = "user failed";
    let aiTaskPending: { action: "retry" | "cancel"; record: GovernanceRecord } | null = {
      action: "retry",
      record: { id: "task-1" }
    };
    let aiTaskError = "";
    let templatePending:
      | {
          action: "publish" | "unpublish";
          record: GovernanceRecord;
        }
      | null = {
      action: "publish",
      record: { id: "template-1", title: "Starter" }
    };
    let templateError = "";

    const controller = createAdminWorkspaceConfirmController({
      applyAITaskAction: vi.fn(async () => {}),
      applyModerationAction: vi.fn(async () => {}),
      applyReportAction: vi.fn(async () => {}),
      applyTemplateAction: vi.fn(async () => {}),
      applyUserAction: vi.fn(async () => {}),
      readAITaskAction: () => aiTaskPending,
      readAITaskError: () => aiTaskError,
      readLoading: () => loading,
      readModerationAction: () => moderationPending,
      readModerationError: () => moderationError,
      readReportAction: () => reportPending,
      readReportError: () => reportError,
      readTemplateAction: () => templatePending,
      readTemplateError: () => templateError,
      readUserAction: () => userPending,
      readUserError: () => userError,
      setAITaskAction: (value) => {
        aiTaskPending = value;
      },
      setAITaskError: (value) => {
        aiTaskError = value;
      },
      setModerationAction: (value) => {
        moderationPending = value;
      },
      setModerationError: (value) => {
        moderationError = value;
      },
      setReportAction: (value) => {
        reportPending = value;
      },
      setReportError: (value) => {
        reportError = value;
      },
      setTemplateAction: (value) => {
        templatePending = value;
      },
      setTemplateError: (value) => {
        templateError = value;
      },
      setUserAction: (value) => {
        userPending = value;
      },
      setUserError: (value) => {
        userError = value;
      }
    });

    const dialogs = controller.buildDialogs();

    expect(dialogs.map((dialog) => dialog.key)).toEqual(["moderation", "report", "aiTask", "template", "user"]);
    expect(dialogs[0]).toMatchObject({
      isOpen: true,
      errorMessage: "moderation failed",
      confirming: true
    });
    expect(dialogs[4]).toMatchObject({
      isOpen: true,
      errorMessage: "user failed"
    });

    controller.resetAll();

    expect(moderationPending).toBeNull();
    expect(reportPending).toBeNull();
    expect(userPending).toBeNull();
    expect(aiTaskPending).toBeNull();
    expect(templatePending).toBeNull();
    expect(moderationError).toBe("");
    expect(reportError).toBe("");
    expect(userError).toBe("");
    expect(aiTaskError).toBe("");
    expect(templateError).toBe("");
  });

  it("routes confirm submits through the keyed action handlers", async () => {
    const applyModerationAction = vi.fn(async () => {});
    const applyReportAction = vi.fn(async () => {});

    const controller = createAdminWorkspaceConfirmController({
      applyAITaskAction: vi.fn(async () => {}),
      applyModerationAction,
      applyReportAction,
      applyTemplateAction: vi.fn(async () => {}),
      applyUserAction: vi.fn(async () => {}),
      readAITaskAction: () => null,
      readAITaskError: () => "",
      readLoading: () => false,
      readModerationAction: () => ({
        action: "reject" as const,
        item: {
          id: "post-1",
          type: "post" as const,
          title: "Post",
          summary: "",
          authorName: "Alice",
          status: "pending",
          createdAt: "",
          updatedAt: ""
        }
      }),
      readModerationError: () => "",
      readReportAction: () => ({
        action: "dismiss" as const,
        record: { id: "report-1" }
      }),
      readReportError: () => "",
      readTemplateAction: () => null,
      readTemplateError: () => "",
      readUserAction: () => null,
      readUserError: () => "",
      setAITaskAction: vi.fn(),
      setAITaskError: vi.fn(),
      setModerationAction: vi.fn(),
      setModerationError: vi.fn(),
      setReportAction: vi.fn(),
      setReportError: vi.fn(),
      setTemplateAction: vi.fn(),
      setTemplateError: vi.fn(),
      setUserAction: vi.fn(),
      setUserError: vi.fn()
    });

    await runAdminConfirmDialogHandler("moderation", controller.submitHandlers);
    await runAdminConfirmDialogHandler("report", controller.submitHandlers);

    expect(applyModerationAction).toHaveBeenCalledWith(
      {
        id: "post-1",
        type: "post",
        title: "Post",
        summary: "",
        authorName: "Alice",
        status: "pending",
        createdAt: "",
        updatedAt: ""
      },
      "reject"
    );
    expect(applyReportAction).toHaveBeenCalledWith({ id: "report-1" }, "dismiss");
  });
});
