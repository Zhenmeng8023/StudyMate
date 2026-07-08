import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GraphDetailPayload } from "../../../api/client";
import {
  GraphWorkspaceCanvasCommandBar,
  GraphWorkspaceInspectorTabs,
  GraphWorkspaceResourceTabs
} from "./GraphWorkspaceCanvasChrome";

const graphDetail: GraphDetailPayload = {
  id: "graph-1",
  ownerUserId: "user-1",
  title: "操作系统复习图谱",
  description: "desc",
  visibility: "private",
  status: "active",
  graphType: "knowledge",
  mode: "free",
  currentVersion: 1,
  nodeCount: 1,
  edgeCount: 0,
  createdAt: "2026-07-02T00:00:00Z",
  updatedAt: "2026-07-02T00:00:00Z",
  document: {
    graphId: "graph-1",
    version: 1,
    schemaVersion: 1,
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
    groups: [],
    theme: {},
    metadata: {}
  }
};

describe("GraphWorkspaceCanvasChrome", () => {
  it("keeps the graph title, save state, and dock controls available", () => {
    const onToggleResources = vi.fn();
    const onToggleInspector = vi.fn();

    render(
      <GraphWorkspaceCanvasCommandBar
        graphDetail={graphDetail}
        inspectorOpen={false}
        onCreateGraph={vi.fn()}
        onSave={vi.fn()}
        onToggleInspector={onToggleInspector}
        onToggleResources={onToggleResources}
        resourcesOpen={false}
        saveState="dirty"
        saveStateLabel="有未保存修改"
        saving={false}
      />
    );

    expect(screen.getByText("操作系统复习图谱")).toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("打开资源面板"));
    fireEvent.click(screen.getByLabelText("打开检查器"));
    expect(onToggleResources).toHaveBeenCalledOnce();
    expect(onToggleInspector).toHaveBeenCalledOnce();
  });

  it("switches resource and inspector tabs without changing graph state", () => {
    const onResourceChange = vi.fn();
    const onInspectorChange = vi.fn();

    render(
      <>
        <GraphWorkspaceResourceTabs activeTab="graphs" onChange={onResourceChange} />
        <GraphWorkspaceInspectorTabs activeTab="overview" hasConflict hasSelection onChange={onInspectorChange} />
      </>
    );

    const resourceTabs = within(screen.getByLabelText("图谱资源分类"));
    const inspectorTabs = within(screen.getByLabelText("图谱检查器分类"));

    fireEvent.click(resourceTabs.getByRole("button", { name: "来源" }));
    fireEvent.click(inspectorTabs.getByRole("button", { name: /冲突/ }));
    expect(onResourceChange).toHaveBeenCalledWith("sources");
    expect(onInspectorChange).toHaveBeenCalledWith("conflict");
  });
});
