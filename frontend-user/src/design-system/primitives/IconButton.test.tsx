import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("keeps the frontend-user compatibility export working", () => {
    const onClick = vi.fn();

    render(
      <IconButton aria-label="关闭侧栏" onClick={onClick} title="关闭侧栏">
        <span aria-hidden="true">×</span>
      </IconButton>,
    );

    fireEvent.click(screen.getByRole("button", { name: "关闭侧栏" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
