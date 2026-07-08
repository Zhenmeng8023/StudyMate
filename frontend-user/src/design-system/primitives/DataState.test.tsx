import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataState } from "./DataState";

describe("DataState", () => {
  it("renders an accessible loading state", () => {
    render(<DataState description="正在加载图谱数据。" kind="loading" title="正在准备画布" />);

    expect(screen.getByText("加载中")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "正在准备画布" })).toBeInTheDocument();
    expect(screen.getByText("正在加载图谱数据。")).toBeInTheDocument();
  });
  it("labels stale data as requiring refresh", () => {
    render(<DataState description="请刷新后继续编辑。" kind="stale" title="数据已过期" />);

    expect(screen.getByText("需要刷新")).toBeInTheDocument();
  });

});
