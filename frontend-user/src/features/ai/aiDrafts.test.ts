import { describe, expect, it } from "vitest";
import { buildAiDraftWorkspacePath, buildCardInputsFromAiDrafts } from "./aiDrafts";

describe("buildCardInputsFromAiDrafts", () => {
  it("maps AI draft metadata into card source metadata for later review backlinks", () => {
    const result = buildCardInputsFromAiDrafts([
      {
        id: "draft-1",
        taskId: "task-1",
        draftType: "card_draft",
        targetType: "material",
        targetId: "material-1",
        status: "pending",
        sourceType: "annotation",
        sourceId: "annotation-1",
        sourceLabel: "Algorithm notes",
        front: "What does this annotation highlight?",
        back: "The key invariant in the proof.",
        metadata: {
          materialId: "material-1",
          annotationId: "annotation-1",
          page: 12
        },
        createdAt: "2026-07-14T09:30:00Z",
        updatedAt: "2026-07-14T09:30:00Z"
      }
    ]);

    expect(result).toEqual([
      {
        cardType: "basic",
        draftId: "draft-1",
        front: "What does this annotation highlight?",
        back: "The key invariant in the proof.",
        sourceType: "annotation",
        sourceId: "annotation-1",
        sourceMetadata: {
          materialId: "material-1",
          annotationId: "annotation-1",
          page: 12
        }
      }
    ]);
  });
});

describe("buildAiDraftWorkspacePath", () => {
  it("preserves annotation reader context when jumping back from an AI draft", () => {
    expect(
      buildAiDraftWorkspacePath({
        id: "draft-annotation-1",
        taskId: "task-1",
        draftType: "card_draft",
        targetType: "deck",
        targetId: "deck-1",
        status: "pending",
        sourceType: "annotation",
        sourceId: "annotation-1",
        sourceLabel: "Annotated proof",
        front: "Q",
        back: "A",
        metadata: {
          materialId: "material-1",
          annotationId: "annotation-1",
          page: 12
        },
        createdAt: "2026-07-15T06:00:00Z",
        updatedAt: "2026-07-15T06:00:00Z"
      })
    ).toBe("/reader/material-1?page=12&annotation=annotation-1");
  });

  it("preserves pdf anchor reader context when jumping back from an AI draft", () => {
    expect(
      buildAiDraftWorkspacePath({
        id: "draft-pdf-anchor-1",
        taskId: "task-2",
        draftType: "graph_change",
        targetType: "graph",
        targetId: "graph-1",
        status: "pending",
        sourceType: "pdf-anchor",
        sourceId: "anchor-1",
        sourceLabel: "Anchor source",
        front: "Q",
        back: "A",
        metadata: {
          materialId: "material-2",
          anchorId: "anchor-1",
          page: 7
        },
        createdAt: "2026-07-15T06:00:00Z",
        updatedAt: "2026-07-15T06:00:00Z"
      })
    ).toBe("/reader/material-2?page=7&anchor=anchor-1");
  });
});
