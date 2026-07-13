import { describe, expect, it, vi } from "vitest";
import {
  requestAdminWorkspaceGovernanceAction,
  requestAdminWorkspaceModerationAction
} from "./adminWorkspacePendingAction";

describe("adminWorkspacePendingAction", () => {
  it("opens the moderation confirm state and clears the moderation error", () => {
    let moderationError = "old error";
    let pendingModeration:
      | {
          action: "approve" | "reject" | "hide";
          item: {
            id: string;
            type: "post" | "material";
          };
        }
      | null = null;

    requestAdminWorkspaceModerationAction(
      {
        id: "post-1",
        type: "post",
        title: "Pending Post",
        summary: "",
        authorName: "Alice",
        status: "pending",
        createdAt: "",
        updatedAt: ""
      },
      "reject",
      {
        setModerationAction: (value) => {
          pendingModeration = value as typeof pendingModeration;
        },
        setModerationError: (value) => {
          moderationError = value;
        }
      }
    );

    expect(moderationError).toBe("");
    expect(pendingModeration).toEqual(
      expect.objectContaining({
        action: "reject",
        item: expect.objectContaining({
          id: "post-1",
          type: "post"
        })
      })
    );
  });

  it("routes report governance requests into the report confirm state", () => {
    const steps: string[] = [];

    requestAdminWorkspaceGovernanceAction(
      "community",
      {
        action: "resolve",
        record: { id: "report-1", status: "pending" }
      },
      {
        clearAITaskError: vi.fn(() => steps.push("clear-ai")),
        clearReportError: vi.fn(() => steps.push("clear-report")),
        clearTemplateError: vi.fn(() => steps.push("clear-template")),
        clearUserError: vi.fn(() => steps.push("clear-user")),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction: vi.fn(() => steps.push("moderation")),
        setAITaskAction: vi.fn(() => steps.push("ai")),
        setError: vi.fn((message: string) => steps.push(`error:${message}`)),
        setReportAction: vi.fn((value) => steps.push(`report:${value.action}:${String(value.record.id)}`)),
        setTemplateAction: vi.fn(() => steps.push("template")),
        setUserAction: vi.fn(() => steps.push("user"))
      }
    );

    expect(steps).toEqual(["clear-report", "report:resolve:report-1"]);
  });

  it("routes material governance requests into the moderation confirm opener", () => {
    const requestModerationAction = vi.fn();

    requestAdminWorkspaceGovernanceAction(
      "materials",
      {
        action: "hide",
        record: {
          id: "material-1",
          title: "Material A",
          ownerName: "Alice",
          status: "approved",
          createdAt: "",
          updatedAt: ""
        }
      },
      {
        clearAITaskError: vi.fn(),
        clearReportError: vi.fn(),
        clearTemplateError: vi.fn(),
        clearUserError: vi.fn(),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction,
        setAITaskAction: vi.fn(),
        setError: vi.fn(),
        setReportAction: vi.fn(),
        setTemplateAction: vi.fn(),
        setUserAction: vi.fn()
      }
    );

    expect(requestModerationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "material-1",
        type: "material",
        title: "Material A"
      }),
      "hide"
    );
  });

  it("surfaces invalid governance dispatches through the shared top-level error setter", () => {
    const setError = vi.fn();

    requestAdminWorkspaceGovernanceAction(
      "materials",
      {
        action: "hide",
        record: { id: "material-1", status: "active" }
      },
      {
        clearAITaskError: vi.fn(),
        clearReportError: vi.fn(),
        clearTemplateError: vi.fn(),
        clearUserError: vi.fn(),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction: vi.fn(),
        setAITaskAction: vi.fn(),
        setError,
        setReportAction: vi.fn(),
        setTemplateAction: vi.fn(),
        setUserAction: vi.fn()
      }
    );

    expect(setError).toHaveBeenCalledWith("资料记录字段不完整，无法提交治理动作。");
  });
});
