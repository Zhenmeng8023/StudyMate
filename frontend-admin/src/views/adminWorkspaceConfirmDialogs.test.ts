import { describe, expect, it } from "vitest";
import {
  getAITaskConfirmCopy,
  getModerationConfirmCopy,
  getReportConfirmCopy,
  getTemplateConfirmCopy,
  getUserConfirmCopy
} from "./adminActionConfirmCopy";
import { buildAdminWorkspaceConfirmDialogs } from "./adminWorkspaceConfirmDialogs";

describe("adminWorkspaceConfirmDialogs", () => {
  it("resolves pending confirm state into the shared dialog stack", () => {
    const moderationPending = {
      action: "approve" as const,
      item: {
        title: "Linear Algebra Notes",
        status: "hidden"
      }
    };
    const reportPending = {
      action: "resolve" as const,
      record: {
        id: "report-1"
      }
    };
    const aiTaskPending = {
      action: "retry" as const,
      record: {
        id: "ai-task-7"
      }
    };
    const templatePending = {
      action: "unpublish" as const,
      record: {
        id: "template-4",
        title: "Knowledge Graph Starter"
      }
    };
    const userPending = {
      action: "disable" as const,
      record: {
        id: "user-8",
        username: "alice"
      }
    };

    const dialogs = buildAdminWorkspaceConfirmDialogs({
      loading: true,
      moderation: {
        pending: moderationPending,
        errorMessage: "moderation failed"
      },
      report: {
        pending: reportPending,
        errorMessage: ""
      },
      aiTask: {
        pending: aiTaskPending,
        errorMessage: "retry failed"
      },
      template: {
        pending: templatePending,
        errorMessage: ""
      },
      user: {
        pending: userPending,
        errorMessage: "user failed"
      }
    });

    expect(dialogs.map((dialog) => dialog.key)).toEqual(["moderation", "report", "aiTask", "template", "user"]);
    expect(dialogs[0]).toMatchObject({
      ...getModerationConfirmCopy(moderationPending),
      confirming: true,
      errorMessage: "moderation failed",
      isOpen: true
    });
    expect(dialogs[1]).toMatchObject({
      ...getReportConfirmCopy(reportPending),
      confirming: true,
      isOpen: true
    });
    expect(dialogs[2]).toMatchObject({
      ...getAITaskConfirmCopy(aiTaskPending),
      errorMessage: "retry failed",
      isOpen: true
    });
    expect(dialogs[3]).toMatchObject({
      ...getTemplateConfirmCopy(templatePending),
      isOpen: true
    });
    expect(dialogs[4]).toMatchObject({
      ...getUserConfirmCopy(userPending),
      errorMessage: "user failed",
      isOpen: true
    });
  });

  it("keeps closed dialogs in the shared stack when no pending actions exist", () => {
    const dialogs = buildAdminWorkspaceConfirmDialogs({
      loading: false,
      moderation: {
        pending: null,
        errorMessage: ""
      },
      report: {
        pending: null,
        errorMessage: ""
      },
      aiTask: {
        pending: null,
        errorMessage: ""
      },
      template: {
        pending: null,
        errorMessage: ""
      },
      user: {
        pending: null,
        errorMessage: ""
      }
    });

    expect(dialogs).toHaveLength(5);
    expect(dialogs.every((dialog) => dialog.isOpen === false)).toBe(true);
    expect(dialogs.every((dialog) => dialog.confirming === false)).toBe(true);
  });
});
