import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("keeps the frontend-user compatibility export working", () => {
    render(<Tag>学习中</Tag>);

    const tag = screen.getByText("学习中");
    expect(tag.tagName).toBe("SPAN");
    expect(tag.className).toContain("chip");
  });
});
