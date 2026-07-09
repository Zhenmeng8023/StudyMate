// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommandBar } from "./CommandBar";

describe("CommandBar", () => {
  it("keeps the frontend-user compatibility export working", () => {
    render(
      <CommandBar
        actions={<button type="button">退出登录</button>}
        crumb="学习空间"
        search={<form role="search"><input aria-label="搜索资料、笔记或图谱" /></form>}
        subtitle="继续一项已开始的学习任务"
        title="学习概览"
      />,
    );

    const heading = screen.getByRole("heading", { name: "学习概览" });
    const header = heading.closest("header");
    expect(header).toBeTruthy();
    expect(header?.className).toContain("topbar");
    expect(screen.getByText("学习空间")).toBeTruthy();
    expect(screen.getByText("继续一项已开始的学习任务")).toBeTruthy();
    expect(screen.getByRole("search")).toBeTruthy();
    expect(screen.getByRole("button", { name: "退出登录" })).toBeTruthy();
  });
});
