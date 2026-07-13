import { describe, expect, it } from "vitest";
import { buildAdminWorkspaceLoginPanelProps } from "./adminWorkspaceLoginPanelProps";

describe("adminWorkspaceLoginPanelProps", () => {
  it("builds the shared AdminLoginPanel props from login state", () => {
    const props = buildAdminWorkspaceLoginPanelProps({
      errorMessage: "登录失败",
      loading: true,
      loginPrompt: "后台会话已失效，请重新登录。",
      loginValue: "operator@example.test",
      notice: "后台会话已清空。",
      passwordValue: "secret"
    });

    expect(props).toEqual({
      errorMessage: "登录失败",
      loading: true,
      loginPrompt: "后台会话已失效，请重新登录。",
      loginValue: "operator@example.test",
      notice: "后台会话已清空。",
      passwordValue: "secret"
    });
  });
});
