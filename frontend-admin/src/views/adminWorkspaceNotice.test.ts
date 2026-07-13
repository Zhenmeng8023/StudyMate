import { describe, expect, it } from "vitest";
import {
  getAdminGovernanceLoadedNotice,
  getAdminLoginSuccessNotice,
  getAdminLogoutNotice,
  getAdminModerationLoadedNotice,
  getAdminSessionEndedNotice
} from "./adminWorkspaceNotice";

describe("adminWorkspaceNotice", () => {
  it("exposes the shared login, logout, and load success notices", () => {
    expect(getAdminLoginSuccessNotice()).toBe("已进入治理工作台，正在同步当前数据。");
    expect(getAdminLogoutNotice()).toBe("后台会话已清空。");
    expect(getAdminModerationLoadedNotice(3)).toBe("当前共有 3 条待处理内容。");
    expect(getAdminGovernanceLoadedNotice(5)).toBe("已加载 5 条治理记录。");
  });

  it("falls back to the default session-ended notice when no prompt is available", () => {
    expect(getAdminSessionEndedNotice("后台会话已失效，请重新登录后继续治理工作。")).toBe(
      "后台会话已失效，请重新登录后继续治理工作。"
    );
    expect(getAdminSessionEndedNotice("")).toBe("后台会话已失效，请重新登录。");
    expect(getAdminSessionEndedNotice(null)).toBe("后台会话已失效，请重新登录。");
  });
});
