// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, DataState, Drawer, IconButton, Input, Inspector, Select, Tag } from "./index";

describe("@studymate/ui react primitive contract", () => {
  it("renders the shared data state copy", () => {
    render(<DataState description="正在加载图谱数据。" kind="loading" title="正在准备画布" />);

    expect(screen.getByText("加载中")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "正在准备画布" })).toBeTruthy();
    expect(screen.getByText("正在加载图谱数据。")).toBeTruthy();
  });

  it("renders a drawer with a working close action", () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen onClose={onClose} title="来源">
        <p>内容</p>
      </Drawer>,
    );

    expect(screen.getByLabelText("来源")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("关闭来源"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("provides an accessible inspector region", () => {
    render(
      <Inspector description="当前选中节点的属性。" title="节点详情">
        <p>节点内容</p>
      </Inspector>,
    );

    expect(screen.getByLabelText("节点详情")).toBeTruthy();
    expect(screen.getByText("当前选中节点的属性。")).toBeTruthy();
    expect(screen.getByText("节点内容")).toBeTruthy();
  });

  it("renders an icon button with active state and click behavior", () => {
    const onClick = vi.fn();

    render(
      <IconButton active aria-label="打开面板" onClick={onClick} title="打开面板">
        <span aria-hidden="true">+</span>
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "打开面板" });
    expect(button).toBeTruthy();
    expect(button.className).toContain("icon-button");
    expect(button.className).toContain("active");
    expect(button.getAttribute("type")).toBe("button");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a shared button with variant, danger, and active classes", () => {
    const onClick = vi.fn();

    render(
      <Button active danger onClick={onClick} title="重新加载" variant="ghost">
        重新加载
      </Button>,
    );

    const button = screen.getByRole("button", { name: "重新加载" });
    expect(button).toBeTruthy();
    expect(button.className).toContain("ghost-button");
    expect(button.className).toContain("danger");
    expect(button.className).toContain("active");
    expect(button.getAttribute("type")).toBe("button");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a shared tag with muted styling", () => {
    render(<Tag tone="muted">已归档</Tag>);

    const tag = screen.getByText("已归档");
    expect(tag.tagName).toBe("SPAN");
    expect(tag.className).toContain("chip");
    expect(tag.className).toContain("muted");
  });

  it("renders a shared input with default type and invalid state", () => {
    render(<Input invalid placeholder="搜索资料" />);

    const input = screen.getByPlaceholderText("搜索资料");
    expect(input.getAttribute("type")).toBe("text");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("ds-input");
    expect(input.className).toContain("is-invalid");
  });

  it("renders a shared select with invalid state", () => {
    render(
      <Select aria-label="资料来源" invalid value="material-2" onChange={() => undefined}>
        <option value="">暂不关联资料</option>
        <option value="material-2">线性代数</option>
      </Select>,
    );

    const select = screen.getByLabelText("资料来源");
    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.className).toContain("ds-select");
    expect(select.className).toContain("is-invalid");
  });
});
