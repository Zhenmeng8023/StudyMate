import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphDetailPayload } from "../../../api/client";
import { graphNodeTypeOptions } from "../lib/graphNodeTypes";
import { GraphWorkspaceHeader, GraphWorkspaceSourceRail, GraphWorkspaceToolbar } from "./GraphWorkspaceShell";

const { pageHeaderMock } = vi.hoisted(() => ({
  pageHeaderMock: vi.fn(
    (props: { actions?: ReactNode; description: string; eyebrow: string; title: string }) => (
      <section data-testid="shared-page-header">
        <span>{props.eyebrow}</span>
        <h1>{props.title}</h1>
        <p>{props.description}</p>
        {props.actions ? <div data-testid="shared-page-header-actions">{props.actions}</div> : null}
      </section>
    )
  )
}));

vi.mock("../../../design-system/primitives", async () => {
  const actual = await vi.importActual<typeof import("../../../design-system/primitives")>("../../../design-system/primitives");
  return {
    ...actual,
    PageHeader: pageHeaderMock
  };
});

const graphDetail: GraphDetailPayload = {
  id: "graph-1",
  ownerUserId: "user-1",
  title: "Graph",
  description: "desc",
  visibility: "private",
  status: "active",
  graphType: "knowledge",
  mode: "free",
  currentVersion: 1,
  nodeCount: 1,
  edgeCount: 0,
  createdAt: "2026-06-05T00:00:00Z",
  updatedAt: "2026-06-05T00:00:00Z",
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

describe("GraphWorkspaceShell components", () => {
  afterEach(() => {
    cleanup();
    pageHeaderMock.mockClear();
  });

  it("renders save state through the shared page header contract", () => {
    render(
      <GraphWorkspaceHeader
        graphDetail={graphDetail}
        onCreateGraph={vi.fn()}
        onSave={vi.fn()}
        saveState="dirty"
        saveStateLabel="Dirty"
        saving={false}
      />
    );

    expect(screen.getByTestId("shared-page-header")).toBeInTheDocument();
    expect(pageHeaderMock).toHaveBeenCalledTimes(1);
    expect(pageHeaderMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        eyebrow: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        actions: expect.anything()
      })
    );
    expect(screen.getByLabelText(/Dirty/)).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("exposes toolbar actions and node type changes", () => {
    const onQuickNodeTypeChange = vi.fn();
    const onLocateNode = vi.fn();
    const onSearchChange = vi.fn();
    const { container } = render(
      <GraphWorkspaceToolbar
        graphDetail={graphDetail}
        graphSearch="heap"
        hasSelectedEdge={false}
        historyFutureCount={0}
        historyPastCount={1}
        isLinking={false}
        nodeTypeOptions={graphNodeTypeOptions}
        onCreateGroup={vi.fn()}
        onCreateNode={vi.fn()}
        onDeleteSelection={vi.fn()}
        onExportJson={vi.fn()}
        onExportPng={vi.fn()}
        onExportSvg={vi.fn()}
        onLocateNode={onLocateNode}
        onQuickNodeTypeChange={onQuickNodeTypeChange}
        onRedo={vi.fn()}
        onSearchChange={onSearchChange}
        onToggleKeyboardGuide={vi.fn()}
        onToggleLinkMode={vi.fn()}
        onUndo={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        quickNodeType="text"
        quickNodeTypeLabel="Concept"
        selectedNodeCount={1}
        showKeyboardGuide={false}
      />
    );

    const nodeTypeSelect = container.querySelector<HTMLSelectElement>(".graph-node-type-select");
    const searchInput = container.querySelector<HTMLInputElement>(".graph-search-field input");
    expect(nodeTypeSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    fireEvent.change(nodeTypeSelect!, { target: { value: "pdf-anchor" } });
    expect(onQuickNodeTypeChange).toHaveBeenCalledWith("pdf-anchor");
    expect(nodeTypeSelect).toHaveClass("ds-select");

    fireEvent.change(nodeTypeSelect!, { target: { value: "diagram" } });
    expect(onQuickNodeTypeChange).toHaveBeenCalledWith("diagram");

    fireEvent.keyDown(searchInput!, { key: "Enter" });
    expect(onLocateNode).toHaveBeenCalled();
    expect(container.querySelector(".graph-toolbar")).not.toBeNull();
  });

  it("renders diagram template preview in the source rail", () => {
    const onApplyTemplate = vi.fn();

    const { container } = render(
      <GraphWorkspaceSourceRail
        diagramTemplates={[
          {
            id: "uml-class-diagram",
            name: "UML Class Diagram",
            category: "uml",
            description: "Map classes, fields, and relations.",
            mode: "diagram",
            sampleLines: ["Domain model", "Core class", "Interface contract", "Dependencies"]
          }
        ]}
        graphDetail={graphDetail}
        graphs={[graphDetail]}
        materials={[]}
        notes={[]}
        onAddMaterialNode={vi.fn()}
        onAddNoteNode={vi.fn()}
        onApplyTemplate={onApplyTemplate}
        onOpenGraph={vi.fn()}
      />
    );

    expect(screen.getByText("UML Class Diagram")).toBeInTheDocument();
    expect(screen.getByText(/uml/)).toBeInTheDocument();
    expect(screen.getByText(/Domain model/)).toBeInTheDocument();

    const templateButton = container.querySelector<HTMLButtonElement>(".graph-template-card");
    expect(templateButton).not.toBeNull();
    fireEvent.click(templateButton!);
    expect(onApplyTemplate).toHaveBeenCalledWith(expect.objectContaining({ id: "uml-class-diagram" }));
  });
});
