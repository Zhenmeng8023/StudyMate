import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphSourceReferenceSummary } from "@studymate/graph-core";
import { GraphWorkspaceSourceSummary } from "./GraphWorkspaceSourceSummary";

function buildSummary(overrides: Partial<GraphSourceReferenceSummary> = {}): GraphSourceReferenceSummary {
  return {
    totalReferences: 1,
    totalLinkedNodes: 2,
    isolatedNodeCount: 1,
    isolatedNodeIds: ["free-1"],
    missingSourceNodeCount: 0,
    missingSourceNodeIds: [],
    references: [
      {
        key: "material:mat-1",
        type: "material",
        id: "mat-1",
        label: "操作系统导论",
        excerpt: "进程调度章节",
        nodeCount: 2,
        nodeIds: ["n1", "n2"]
      }
    ],
    typeBuckets: [
      {
        type: "material",
        label: "资料",
        referenceCount: 1,
        nodeCount: 2
      }
    ],
    ...overrides
  };
}

describe("GraphWorkspaceSourceSummary", () => {
  afterEach(() => cleanup());

  it("renders source buckets, isolated count, and backlink action", () => {
    const onOpenSource = vi.fn();

    render(<GraphWorkspaceSourceSummary onOpenSource={onOpenSource} summary={buildSummary()} />);

    expect(screen.getByLabelText("图谱来源摘要")).toBeInTheDocument();
    expect(screen.getByLabelText("来源类型统计")).toHaveTextContent("资料 · 1 来源 / 2 节点");
    expect(screen.getByText("孤立/无来源 · 1 节点")).toBeInTheDocument();
    expect(screen.getByText("进程调度章节")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /回到阅读器/ }));
    expect(onOpenSource).toHaveBeenCalledWith("/reader/mat-1");
  });

  it("renders an empty state when the graph has no source relations", () => {
    render(
      <GraphWorkspaceSourceSummary
        onOpenSource={vi.fn()}
        summary={buildSummary({
          totalReferences: 0,
          totalLinkedNodes: 0,
          isolatedNodeCount: 0,
          isolatedNodeIds: [],
          references: [],
          typeBuckets: []
        })}
      />
    );

    expect(screen.getByText("暂无来源引用")).toBeInTheDocument();
  });

  it("caps visible references and shows a remaining count", () => {
    const references = Array.from({ length: 7 }, (_, index) => ({
      key: `note:note-${index}`,
      type: "note",
      id: `note-${index}`,
      label: `笔记 ${index}`,
      nodeCount: 1,
      nodeIds: [`node-${index}`]
    }));

    render(
      <GraphWorkspaceSourceSummary
        onOpenSource={vi.fn()}
        summary={buildSummary({
          totalReferences: references.length,
          references
        })}
      />
    );

    expect(screen.getByText("笔记 0")).toBeInTheDocument();
    expect(screen.queryByText("笔记 6")).not.toBeInTheDocument();
    expect(screen.getByText("还有 2 个来源")).toBeInTheDocument();
  });
});
