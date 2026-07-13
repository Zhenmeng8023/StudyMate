import { describe, expect, it } from "vitest";
import type { ActionConfirmCopy } from "./adminActionConfirmCopy";
import { buildAdminConfirmDialogs } from "./adminConfirmDialogs";

function createCopy(title: string, confirmTone: ActionConfirmCopy["confirmTone"] = "default"): ActionConfirmCopy {
  return {
    title,
    description: `${title}说明`,
    confirmLabel: `${title}确认`,
    confirmingLabel: `${title}处理中`,
    confirmTone
  };
}

describe("adminConfirmDialogs", () => {
  it("builds the canonical confirm dialog stack in shared key order", () => {
    const dialogs = buildAdminConfirmDialogs({
      loading: true,
      moderation: { copy: createCopy("审核", "danger"), errorMessage: "审核失败", isOpen: true },
      report: { copy: createCopy("举报"), errorMessage: "", isOpen: false },
      aiTask: { copy: createCopy("AI"), errorMessage: "任务失败", isOpen: true },
      template: { copy: createCopy("模板"), errorMessage: "", isOpen: false },
      user: { copy: createCopy("用户", "danger"), errorMessage: "用户失败", isOpen: true }
    });

    expect(dialogs.map((dialog) => dialog.key)).toEqual(["moderation", "report", "aiTask", "template", "user"]);
    expect(dialogs[0]).toEqual({
      key: "moderation",
      cancelLabel: "取消",
      confirmLabel: "审核确认",
      confirmTone: "danger",
      confirming: true,
      confirmingLabel: "审核处理中",
      description: "审核说明",
      errorMessage: "审核失败",
      isOpen: true,
      title: "审核"
    });
    expect(dialogs[2].errorMessage).toBe("任务失败");
    expect(dialogs[4].confirmTone).toBe("danger");
  });
});
