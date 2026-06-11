import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GraphWorkspaceImportPanel } from "./GraphWorkspaceImportPanel";

describe("GraphWorkspaceImportPanel", () => {
  afterEach(() => cleanup());

  it("switches import modes and delegates source edits", async () => {
    const user = userEvent.setup();
    const onImportModeChange = vi.fn();
    const onImportSourceChange = vi.fn();

    render(
      <GraphWorkspaceImportPanel
        canImport
        canValidate
        importMode="markdown"
        importSource="# Topic"
        onImport={() => undefined}
        onImportModeChange={onImportModeChange}
        onImportSourceChange={onImportSourceChange}
        onValidate={() => undefined}
        saving={false}
        validationIssues={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mermaid" }));
    expect(onImportModeChange).toHaveBeenCalledWith("mermaid");

    fireEvent.change(screen.getByLabelText("图谱导入内容"), { target: { value: "flowchart TD\nA-->B" } });
    expect(onImportSourceChange).toHaveBeenCalledWith("flowchart TD\nA-->B");
  });

  it("delegates import and validation actions with accessible buttons", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    const onValidate = vi.fn();

    render(
      <GraphWorkspaceImportPanel
        canImport
        canValidate
        importMode="json"
        importSource="{}"
        onImport={onImport}
        onImportModeChange={() => undefined}
        onImportSourceChange={() => undefined}
        onValidate={onValidate}
        saving={false}
        validationIssues={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: "导入草稿" }));
    await user.click(screen.getByRole("button", { name: "校验图谱" }));

    expect(onImport).toHaveBeenCalledTimes(1);
    expect(onValidate).toHaveBeenCalledTimes(1);
  });

  it("disables import while saving and renders validation issues", () => {
    render(
      <GraphWorkspaceImportPanel
        canImport
        canValidate
        importMode="json"
        importSource="{}"
        onImport={() => undefined}
        onImportModeChange={() => undefined}
        onImportSourceChange={() => undefined}
        onValidate={() => undefined}
        saving
        validationIssues={[
          {
            ruleType: "dangling_edge",
            message: "连线终点不存在",
            targetId: "edge-1",
            severity: "error"
          }
        ]}
      />
    );

    expect(screen.getByRole("button", { name: "导入草稿" })).toBeDisabled();
    expect(screen.getByText("悬挂连线 · 1")).toBeInTheDocument();
    expect(screen.getByText("定位：edge-1")).toBeInTheDocument();
    expect(screen.getByText("修复建议：删除这条连线，或重新连接到仍存在的节点。")).toBeInTheDocument();
    expect(screen.getByText("连线终点不存在")).toBeInTheDocument();
  });
});
