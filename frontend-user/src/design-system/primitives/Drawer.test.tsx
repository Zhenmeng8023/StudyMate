import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("does not render while closed", () => {
    render(<Drawer isOpen={false} title="来源"><p>内容</p></Drawer>);

    expect(screen.queryByLabelText("来源")).not.toBeInTheDocument();
  });

  it("renders content and exposes a close action", () => {
    const onClose = vi.fn();
    render(<Drawer isOpen onClose={onClose} title="来源"><p>内容</p></Drawer>);

    expect(screen.getByLabelText("来源")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("关闭来源"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
