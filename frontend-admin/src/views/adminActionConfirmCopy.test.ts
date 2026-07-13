import { describe, expect, it } from "vitest";
import {
  getAITaskConfirmCopy,
  getModerationConfirmCopy,
  getReportConfirmCopy,
  getTemplateConfirmCopy,
  getUserConfirmCopy
} from "./adminActionConfirmCopy";

describe("adminActionConfirmCopy", () => {
  it("builds moderation confirmation copy from the shared action metadata", () => {
    expect(
      getModerationConfirmCopy({
        action: "approve",
        item: { title: "Linear Algebra", status: "hidden" }
      })
    ).toEqual({
      title: "确认恢复这条资料",
      description: "恢复后，“Linear Algebra”会重新回到可见资料状态。",
      confirmLabel: "确认恢复",
      confirmingLabel: "恢复中...",
      confirmTone: "default"
    });

    expect(
      getModerationConfirmCopy({
        action: "reject",
        item: { title: "Risky Post", status: "pending" }
      })
    ).toEqual({
      title: "确认驳回这条内容",
      description: "驳回后，“Risky Post”会退出当前待处理队列。",
      confirmLabel: "确认驳回",
      confirmingLabel: "驳回中...",
      confirmTone: "danger"
    });
  });

  it("builds report, user, ai task, and template confirmation copy through shared helpers", () => {
    expect(getReportConfirmCopy({ action: "dismiss", record: { id: "report-1" } })).toEqual({
      title: "确认忽略这条举报",
      description: "忽略后，这条举报会标记为已忽略，并保留完整审计记录。",
      confirmLabel: "确认忽略",
      confirmingLabel: "忽略中...",
      confirmTone: "danger"
    });

    expect(getUserConfirmCopy({ action: "disable", record: { username: "alice" } })).toEqual({
      title: "确认禁用这个用户",
      description: "禁用后，alice 将不能继续登录，后续 refresh 也会被拒绝。",
      confirmLabel: "确认禁用",
      confirmingLabel: "禁用中...",
      confirmTone: "danger"
    });

    expect(getAITaskConfirmCopy({ action: "retry", record: { id: "task-1" } })).toEqual({
      title: "确认重试这个 AI 任务",
      description: "重试后，任务 task-1 会重新回到待处理状态，并清空当前失败信息。",
      confirmLabel: "确认重试",
      confirmingLabel: "重试中...",
      confirmTone: "default"
    });

    expect(getTemplateConfirmCopy({ action: "unpublish", record: { name: "UML Class Diagram" } })).toEqual({
      title: "确认下架这个图谱模板",
      description: "UML Class Diagram 下架后会从用户端图谱模板列表中隐藏，但保留后台治理记录。",
      confirmLabel: "确认下架",
      confirmingLabel: "下架中...",
      confirmTone: "danger"
    });
  });
});
