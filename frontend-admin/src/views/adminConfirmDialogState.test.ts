import { describe, expect, it, vi } from "vitest";
import {
  adminConfirmDialogKeys,
  resetAdminConfirmDialogState,
  runAdminConfirmDialogHandler,
  type ConfirmDialogKey
} from "./adminConfirmDialogState";

describe("adminConfirmDialogState", () => {
  it("dispatches the keyed confirm dialog handler through the shared router", async () => {
    const calls: ConfirmDialogKey[] = [];

    const result = await runAdminConfirmDialogHandler("aiTask", {
      moderation: () => {
        calls.push("moderation");
        return "moderation";
      },
      report: () => {
        calls.push("report");
        return "report";
      },
      user: () => {
        calls.push("user");
        return "user";
      },
      aiTask: async () => {
        calls.push("aiTask");
        return "aiTask";
      },
      template: () => {
        calls.push("template");
        return "template";
      }
    });

    expect(result).toBe("aiTask");
    expect(calls).toEqual(["aiTask"]);
  });

  it("resets every confirm dialog state through the shared key list", () => {
    const calls: ConfirmDialogKey[] = [];
    const resetters = {
      moderation: vi.fn(() => calls.push("moderation")),
      report: vi.fn(() => calls.push("report")),
      user: vi.fn(() => calls.push("user")),
      aiTask: vi.fn(() => calls.push("aiTask")),
      template: vi.fn(() => calls.push("template"))
    };

    resetAdminConfirmDialogState(resetters);

    expect(adminConfirmDialogKeys).toEqual(["moderation", "report", "user", "aiTask", "template"]);
    expect(calls).toEqual(adminConfirmDialogKeys);
    expect(resetters.moderation).toHaveBeenCalledOnce();
    expect(resetters.report).toHaveBeenCalledOnce();
    expect(resetters.user).toHaveBeenCalledOnce();
    expect(resetters.aiTask).toHaveBeenCalledOnce();
    expect(resetters.template).toHaveBeenCalledOnce();
  });
});
