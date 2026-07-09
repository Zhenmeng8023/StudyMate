// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("keeps the frontend-user compatibility export working", () => {
    render(<Input placeholder="输入标题" value="图谱草稿" onChange={() => undefined} />);

    const input = screen.getByPlaceholderText("输入标题");
    expect(input).toHaveAttribute("type", "text");
    expect(input.className).toContain("ds-input");
  });
});
