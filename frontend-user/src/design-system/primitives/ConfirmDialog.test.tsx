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
});
