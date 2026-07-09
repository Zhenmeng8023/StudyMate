// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("keeps the frontend-user compatibility export working", () => {
    render(
      <PageHeader
        actions={<button type="button">刷新</button>}
        description="集中展示当前工作区的主标题和动作。"
        eyebrow="学习空间"
        title="今日概览"
      />,
    );

    const header = screen.getByRole("banner");
    expect(header.className).toContain("workspace-header");
    expect(screen.getByRole("heading", { name: "今日概览" })).toBeTruthy();
    expect(screen.getByText("集中展示当前工作区的主标题和动作。")).toBeTruthy();
    expect(screen.getByRole("button", { name: "刷新" })).toBeTruthy();
  });
});
