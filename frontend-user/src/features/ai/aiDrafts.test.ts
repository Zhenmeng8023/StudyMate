import { describe, expect, it } from "vitest";
import { buildCardInputsFromAiDrafts } from "./aiDrafts";

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
