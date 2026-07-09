// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, CommandBar, ConfirmDialog, DataState, Drawer, IconButton, Input, Inspector, PageHeader, Select, Tag } from "./index";

describe("@studymate/ui react primitive contract", () => {
  it("renders the shared data state copy", () => {
    render(<DataState description="Loading graph data." kind="loading" title="Preparing canvas" />);

    expect(screen.getByRole("heading", { name: "Preparing canvas" })).toBeTruthy();
    expect(screen.getByText("Loading graph data.")).toBeTruthy();
  });

  it("renders a drawer with a working close action", () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen onClose={onClose} title="Sources">
        <p>Drawer content</p>
      </Drawer>,
    );

    expect(screen.getByLabelText("Sources")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("provides an accessible inspector region", () => {
    render(
      <Inspector description="Properties for the current selection." title="Node details">
        <p>Inspector content</p>
      </Inspector>,
    );

    expect(screen.getByLabelText("Node details")).toBeTruthy();
    expect(screen.getByText("Properties for the current selection.")).toBeTruthy();
    expect(screen.getByText("Inspector content")).toBeTruthy();
  });

  it("renders an icon button with active state and click behavior", () => {
    const onClick = vi.fn();

    render(
      <IconButton active aria-label="Open panel" onClick={onClick} title="Open panel">
        <span aria-hidden="true">+</span>
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Open panel" });
    expect(button.className).toContain("icon-button");
    expect(button.className).toContain("active");
    expect(button.getAttribute("type")).toBe("button");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a shared button with variant, danger, and active classes", () => {
    const onClick = vi.fn();

    render(
      <Button active danger onClick={onClick} title="Reload" variant="ghost">
        Reload
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Reload" });
    expect(button.className).toContain("ghost-button");
    expect(button.className).toContain("danger");
    expect(button.className).toContain("active");
    expect(button.getAttribute("type")).toBe("button");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a shared tag with muted styling", () => {
    render(<Tag tone="muted">Archived</Tag>);

    const tag = screen.getByText("Archived");
    expect(tag.tagName).toBe("SPAN");
    expect(tag.className).toContain("chip");
    expect(tag.className).toContain("muted");
  });

  it("renders a shared input with default type and invalid state", () => {
    render(<Input invalid placeholder="Search materials" />);

    const input = screen.getByPlaceholderText("Search materials");
    expect(input.getAttribute("type")).toBe("text");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("ds-input");
    expect(input.className).toContain("is-invalid");
  });

  it("renders a shared select with invalid state", () => {
    render(
      <Select aria-label="Material source" invalid value="material-2" onChange={() => undefined}>
        <option value="">No source</option>
        <option value="material-2">Linear algebra</option>
      </Select>,
    );

    const select = screen.getByLabelText("Material source");
    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.className).toContain("ds-select");
    expect(select.className).toContain("is-invalid");
  });

  it("renders a shared page header with actions", () => {
    render(
      <PageHeader
        actions={<button type="button">Create material</button>}
        description="Show the page title and its primary actions in one place."
        eyebrow="Study space"
        title="Materials overview"
      />,
    );

    const heading = screen.getByRole("heading", { name: "Materials overview" });
    const header = heading.closest("header");
    expect(header?.className).toContain("workspace-header");
    expect(screen.getByText("Study space")).toBeTruthy();
    expect(screen.getByText("Show the page title and its primary actions in one place.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create material" })).toBeTruthy();
  });

  it("renders a shared command bar with search and actions", () => {
    render(
      <CommandBar
        actions={<button type="button">Sign out</button>}
        crumb="Study space"
        search={<form role="search"><input aria-label="Search materials, notes, or graphs" /></form>}
        subtitle="Continue a study task that is already in progress"
        title="Study overview"
      />,
    );

    const heading = screen.getByRole("heading", { name: "Study overview" });
    const header = heading.closest("header");
    expect(header?.className).toContain("topbar");
    expect(header?.textContent).toContain("Study space");
    expect(header?.textContent).toContain("Continue a study task that is already in progress");
    expect(screen.getByRole("search")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
  });

  it("renders a shared confirm dialog with danger and busy states", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        cancelLabel="Cancel"
        confirmTone="danger"
        confirming
        confirmingLabel="Deleting..."
        description="Deleting this note removes it from the current workspace."
        errorMessage="Delete failed. Please try again."
        isOpen
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Confirm delete note"
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Confirm delete note" });
    expect(dialog).toBeTruthy();
    expect(dialog.className).toContain("confirm-dialog");
    expect(screen.getByText("Deleting this note removes it from the current workspace.")).toBeTruthy();
    expect(screen.getByText("Delete failed. Please try again.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);

    const confirmButton = screen.getByRole("button", { name: "Deleting..." });
    expect(confirmButton.className).toContain("danger");
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);
  });
});
