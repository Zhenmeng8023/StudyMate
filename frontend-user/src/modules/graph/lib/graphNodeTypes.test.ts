import { describe, expect, it } from "vitest";
import { buildGraphNodeDraft, graphNodeTypeOptions } from "./graphNodeTypes";

describe("graph node types", () => {
  it("exposes all productized StudyMate node creation types", () => {
    expect(graphNodeTypeOptions.map((option) => option.type)).toEqual([
      "text",
      "rich-note",
      "material",
      "card",
      "ai",
      "image",
      "url",
      "formula",
      "pdf-anchor"
    ]);
    expect(graphNodeTypeOptions.map((option) => option.label)).toContain("PDF 锚点");
  });

  it("builds a default node draft from type configuration", () => {
    expect(
      buildGraphNodeDraft({
        id: "node-1",
        position: { x: 80, y: 120 },
        type: "url"
      })
    ).toMatchObject({
      id: "node-1",
      type: "url",
      title: "URL 节点",
      width: 250,
      height: 132,
      source: null
    });
  });

  it("uses source labels and card sizing when available", () => {
    expect(
      buildGraphNodeDraft({
        id: "node-card",
        position: { x: 0, y: 0 },
        source: { type: "card", id: "card-1", label: "间隔重复卡片" },
        type: "card"
      })
    ).toMatchObject({
      title: "间隔重复卡片",
      width: 250,
      height: 110,
      source: { type: "card", id: "card-1", label: "间隔重复卡片" }
    });
  });
});
