import { describe, expect, it, vi } from "vitest";
import type { GovernanceActionDispatch } from "./adminGovernanceConfig";
import { runAdminGovernanceActionRequest } from "./adminGovernanceActionRequest";

describe("adminGovernanceActionRequest", () => {
  it("clears the report error and opens the report confirm dialog", () => {
    const steps: string[] = [];

    runAdminGovernanceActionRequest(
      {
        kind: "report",
        action: "resolve",
        record: { id: "report-1", status: "pending" }
      },
      {
        clearAITaskError: vi.fn(() => {
          steps.push("clear-ai");
        }),
        clearReportError: vi.fn(() => {
          steps.push("clear-report");
        }),
        clearTemplateError: vi.fn(() => {
          steps.push("clear-template");
        }),
        clearUserError: vi.fn(() => {
          steps.push("clear-user");
        }),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction: vi.fn(() => {
          steps.push("moderation");
        }),
        setAITaskAction: vi.fn(() => {
          steps.push("ai");
        }),
        setError: vi.fn((message: string) => {
          steps.push(`error:${message}`);
        }),
        setReportAction: vi.fn((value) => {
          steps.push(`report:${value.action}:${String(value.record.id)}`);
        }),
        setTemplateAction: vi.fn(() => {
          steps.push("template");
        }),
        setUserAction: vi.fn(() => {
          steps.push("user");
        })
      }
    );

    expect(steps).toEqual(["clear-report", "report:resolve:report-1"]);
  });

  it("delegates moderation requests to the moderation action opener", () => {
    const requestModerationAction = vi.fn();

    runAdminGovernanceActionRequest(
      {
        kind: "moderation",
        action: "approve",
        item: {
          id: "material-1",
          type: "material",
          title: "Material",
          summary: "",
          authorName: "Alice",
          status: "pending",
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
  });

  it("clears the user error and opens the user confirm dialog", () => {
    const steps: string[] = [];

    runAdminGovernanceActionRequest(
      {
        kind: "user",
        action: "disable",
        record: { id: "user-1", status: "active" }
      },
      {
        clearAITaskError: vi.fn(() => {
          steps.push("clear-ai");
        }),
        clearReportError: vi.fn(() => {
          steps.push("clear-report");
        }),
        clearTemplateError: vi.fn(() => {
          steps.push("clear-template");
        }),
        clearUserError: vi.fn(() => {
          steps.push("clear-user");
        }),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction: vi.fn(),
        setAITaskAction: vi.fn(() => {
          steps.push("ai");
        }),
        setError: vi.fn((message: string) => {
          steps.push(`error:${message}`);
        }),
        setReportAction: vi.fn(() => {
          steps.push("report");
        }),
        setTemplateAction: vi.fn(() => {
          steps.push("template");
        }),
        setUserAction: vi.fn((value) => {
          steps.push(`user:${value.action}:${String(value.record.id)}`);
        })
      }
    );

    expect(steps).toEqual(["clear-user", "user:disable:user-1"]);
  });

  it("clears the ai task error and opens the ai task confirm dialog", () => {
    const steps: string[] = [];

    runAdminGovernanceActionRequest(
      {
        kind: "aiTask",
        action: "retry",
        record: { id: "task-1", status: "failed" }
      },
      {
        clearAITaskError: vi.fn(() => {
          steps.push("clear-ai");
        }),
        clearReportError: vi.fn(() => {
          steps.push("clear-report");
        }),
        clearTemplateError: vi.fn(() => {
          steps.push("clear-template");
        }),
        clearUserError: vi.fn(() => {
          steps.push("clear-user");
        }),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction: vi.fn(),
        setAITaskAction: vi.fn((value) => {
          steps.push(`ai:${value.action}:${String(value.record.id)}`);
        }),
        setError: vi.fn((message: string) => {
          steps.push(`error:${message}`);
        }),
        setReportAction: vi.fn(() => {
          steps.push("report");
        }),
        setTemplateAction: vi.fn(() => {
          steps.push("template");
        }),
        setUserAction: vi.fn(() => {
          steps.push("user");
        })
      }
    );

    expect(steps).toEqual(["clear-ai", "ai:retry:task-1"]);
  });

  it("clears the template error and opens the template confirm dialog", () => {
    const steps: string[] = [];

    runAdminGovernanceActionRequest(
      {
        kind: "template",
        action: "publish",
        record: { id: "template-1", status: "unpublished" }
      },
      {
        clearAITaskError: vi.fn(() => {
          steps.push("clear-ai");
        }),
        clearReportError: vi.fn(() => {
          steps.push("clear-report");
        }),
        clearTemplateError: vi.fn(() => {
          steps.push("clear-template");
        }),
        clearUserError: vi.fn(() => {
          steps.push("clear-user");
        }),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction: vi.fn(),
        setAITaskAction: vi.fn(() => {
          steps.push("ai");
        }),
        setError: vi.fn((message: string) => {
          steps.push(`error:${message}`);
        }),
        setReportAction: vi.fn(() => {
          steps.push("report");
        }),
        setTemplateAction: vi.fn((value) => {
          steps.push(`template:${value.action}:${String(value.record.id)}`);
        }),
        setUserAction: vi.fn(() => {
          steps.push("user");
        })
      }
    );

    expect(steps).toEqual(["clear-template", "template:publish:template-1"]);
  });

  it("surfaces the invalid message and falls back when dispatch does not provide one", () => {
    const setError = vi.fn();

    runAdminGovernanceActionRequest(
      {
        kind: "invalid"
      } satisfies GovernanceActionDispatch,
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

    expect(setError).toHaveBeenCalledWith("无法提交治理动作。");
  });

  it("does nothing for noop dispatches", () => {
    const requestModerationAction = vi.fn();
    const setReportAction = vi.fn();
    const setUserAction = vi.fn();
    const setAITaskAction = vi.fn();
    const setTemplateAction = vi.fn();
    const setError = vi.fn();

    runAdminGovernanceActionRequest(
      { kind: "noop" },
      {
        clearAITaskError: vi.fn(),
        clearReportError: vi.fn(),
        clearTemplateError: vi.fn(),
        clearUserError: vi.fn(),
        invalidFallbackMessage: "无法提交治理动作。",
        requestModerationAction,
        setAITaskAction,
        setError,
        setReportAction,
        setTemplateAction,
        setUserAction
      }
    );

    expect(requestModerationAction).not.toHaveBeenCalled();
    expect(setReportAction).not.toHaveBeenCalled();
    expect(setUserAction).not.toHaveBeenCalled();
    expect(setAITaskAction).not.toHaveBeenCalled();
    expect(setTemplateAction).not.toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
  });
});
