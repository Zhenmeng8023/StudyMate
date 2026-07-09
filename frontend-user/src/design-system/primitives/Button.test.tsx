import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("keeps the frontend-user compatibility export working", () => {
    const onClick = vi.fn();

    render(
      <Button onClick={onClick} variant="primary">
        保存
      </Button>,
    );

    const button = screen.getByRole("button", { name: "保存" });
    expect(button.className).toContain("primary-button");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
