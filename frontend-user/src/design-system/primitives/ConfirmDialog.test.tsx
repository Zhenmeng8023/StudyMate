// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("keeps the frontend-user compatibility export working", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        description="Deleting this note removes it from the current workspace."
        isOpen
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Confirm delete note"
      />,
    );

    expect(screen.getByRole("dialog", { name: "Confirm delete note" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders rich description content when the caller passes structured details", () => {
    render(
      <ConfirmDialog
        description={
          <div>
            <p>预检完成：可导入 1 张卡片。</p>
            <ul>
              <li>第 1 行 · Existing front</li>
            </ul>
          </div>
        }
        isOpen
        onCancel={() => {}}
        onConfirm={() => {}}
        title="确认导入 1 张卡片？"
      />,
    );

    expect(screen.getByText("预检完成：可导入 1 张卡片。")).toBeInTheDocument();
    expect(screen.getByText("第 1 行 · Existing front")).toBeInTheDocument();
  });
});
