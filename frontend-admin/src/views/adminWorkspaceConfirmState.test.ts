import { describe, expect, it, vi } from "vitest";
import {
  buildAdminWorkspaceConfirmResetHandlers,
  buildAdminWorkspaceConfirmSubmitHandlers
} from "./adminWorkspaceConfirmState";
import { resetAdminConfirmDialogState, runAdminConfirmDialogHandler } from "./adminConfirmDialogState";

describe("adminWorkspaceConfirmState", () => {
  it("builds reset handlers that clear every pending confirm state and error", () => {
    let moderationPending: { action: "approve"; item: { id: string } } | null = {
      action: "approve",
      item: { id: "post-1" }
    };
    let reportPending: { action: "resolve"; record: { id: string } } | null = {
      action: "resolve",
      record: { id: "report-1" }
    };
    let userPending: { action: "disable"; record: { id: string } } | null = {
      action: "disable",
      record: { id: "user-1" }
    };
    let aiTaskPending: { action: "retry"; record: { id: string } } | null = {
      action: "retry",
      record: { id: "task-1" }
    };
    let templatePending: { action: "publish"; record: { id: string } } | null = {
      action: "publish",
      record: { id: "template-1" }
    };
    let moderationError = "moderation error";
    let reportError = "report error";
    let userError = "user error";
    let aiTaskError = "ai error";
    let templateError = "template error";

    const handlers = buildAdminWorkspaceConfirmResetHandlers({
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

    resetAdminConfirmDialogState(handlers);

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

  it("builds submit handlers that dispatch the keyed pending action through the matching apply function", async () => {
    const applyModerationAction = vi.fn(async () => {});
    const applyReportAction = vi.fn(async () => {});
    const applyUserAction = vi.fn(async () => {});
    const applyAITaskAction = vi.fn(async () => {});
    const applyTemplateAction = vi.fn(async () => {});

    const handlers = buildAdminWorkspaceConfirmSubmitHandlers({
      applyAITaskAction,
      applyModerationAction,
      applyReportAction,
      applyTemplateAction,
      applyUserAction,
      readAITaskAction: () => ({
        action: "retry" as const,
        record: { id: "task-1" }
      }),
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
      readReportAction: () => ({
        action: "dismiss" as const,
        record: { id: "report-1" }
      }),
      readTemplateAction: () => ({
        action: "unpublish" as const,
        record: { id: "template-1" }
      }),
      readUserAction: () => ({
        action: "activate" as const,
        record: { id: "user-1" }
      })
    });

    await runAdminConfirmDialogHandler("moderation", handlers);
    await runAdminConfirmDialogHandler("report", handlers);
    await runAdminConfirmDialogHandler("user", handlers);
    await runAdminConfirmDialogHandler("aiTask", handlers);
    await runAdminConfirmDialogHandler("template", handlers);

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
    expect(applyUserAction).toHaveBeenCalledWith({ id: "user-1" }, "activate");
    expect(applyAITaskAction).toHaveBeenCalledWith({ id: "task-1" }, "retry");
    expect(applyTemplateAction).toHaveBeenCalledWith({ id: "template-1" }, "unpublish");
  });

  it("skips submit dispatch when the keyed pending action is absent", async () => {
    const applyModerationAction = vi.fn(async () => {});

    const handlers = buildAdminWorkspaceConfirmSubmitHandlers({
      applyAITaskAction: vi.fn(async () => {}),
      applyModerationAction,
      applyReportAction: vi.fn(async () => {}),
      applyTemplateAction: vi.fn(async () => {}),
      applyUserAction: vi.fn(async () => {}),
      readAITaskAction: () => null,
      readModerationAction: () => null,
      readReportAction: () => null,
      readTemplateAction: () => null,
      readUserAction: () => null
    });

    await runAdminConfirmDialogHandler("moderation", handlers);

    expect(applyModerationAction).not.toHaveBeenCalled();
  });
});
