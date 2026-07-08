import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Inspector } from "./Inspector";

describe("Inspector", () => {
  it("provides a named context region", () => {
    render(<Inspector description="当前选中节点的属性。" title="节点详情"><p>节点内容</p></Inspector>);

    expect(screen.getByLabelText("节点详情")).toBeInTheDocument();
    expect(screen.getByText("当前选中节点的属性。")).toBeInTheDocument();
    expect(screen.getByText("节点内容")).toBeInTheDocument();
  });
});
