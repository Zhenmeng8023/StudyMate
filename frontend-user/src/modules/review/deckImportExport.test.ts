import { describe, expect, it } from "vitest";
import type { CardPayload } from "../../api/client";
import { buildDeckExportArtifact, parseDeckImportFile } from "./deckImportExport";

const cards: CardPayload[] = [
  {
    id: "card-1",
    deckId: "deck-1",
    ownerUserId: "user-1",
    cardType: "basic",
    front: "什么是图谱？",
    back: "节点和关系。",
    tags: ["graph", "core"],
    sourceType: "note",
    sourceId: "note-1",
    sourceMetadata: {
      noteId: "note-1"
    },
    status: "active",
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z"
  }
];

describe("deckImportExport", () => {
  it("builds a deck json export artifact", () => {
    const artifact = buildDeckExportArtifact({
      kind: "json",
      deckTitle: "期末复习",
      cards
    }, "2026-07-15T01:00:00.000Z");

    expect(artifact.filename).toBe("期末复习-cards.json");
    expect(artifact.mimeType).toBe("application/json;charset=utf-8");

    expect(JSON.parse(artifact.content)).toEqual({
      app: "StudyMate",
      exportedAt: "2026-07-15T01:00:00.000Z",
      kind: "deck-cards",
      version: 1,
      deck: {
        title: "期末复习",
        cardCount: 1
      },
      cards: [
        {
          front: "什么是图谱？",
          back: "节点和关系。",
          cardType: "basic",
          tags: ["graph", "core"],
          sourceType: "note",
          sourceId: "note-1",
          sourceMetadata: {
            noteId: "note-1"
          }
        }
      ]
    });
  });

  it("builds a deck csv export artifact", () => {
    const artifact = buildDeckExportArtifact({
      kind: "csv",
      deckTitle: "期末复习",
      cards
    });

    expect(artifact.filename).toBe("期末复习-cards.csv");
    expect(artifact.mimeType).toBe("text/csv;charset=utf-8");
    expect(artifact.content).toContain("front,back,cardType,tags,sourceType,sourceId");
    expect(artifact.content).toContain("\"什么是图谱？\",\"节点和关系。\",basic,graph|core,note,note-1");
  });

  it("parses a StudyMate deck json import file", () => {
    const result = parseDeckImportFile(
      JSON.stringify({
        app: "StudyMate",
        kind: "deck-cards",
        cards: [
          {
            front: "图谱节点",
            back: "图结构中的实体",
            cardType: "basic",
            tags: ["graph", "entity"],
            sourceType: "graph",
            sourceId: "node-1"
          }
        ]
      }),
      "graph-cards.json"
    );

    expect(result.appliedLabel).toBe("导入卡片 JSON");
    expect(result.cards).toEqual([
      {
        front: "图谱节点",
        back: "图结构中的实体",
        cardType: "basic",
        tags: ["graph", "entity"],
        sourceType: "graph",
        sourceId: "node-1"
      }
    ]);
  });

  it("parses a csv import file", () => {
    const result = parseDeckImportFile(
      [
        "front,back,cardType,tags,sourceType,sourceId",
        "\"概念, 一\",\"回答里也有, 逗号\",basic,graph|core,note,note-1"
      ].join("\n"),
      "graph-cards.csv"
    );

    expect(result.appliedLabel).toBe("导入卡片 CSV");
    expect(result.cards).toEqual([
      {
        front: "概念, 一",
        back: "回答里也有, 逗号",
        cardType: "basic",
        tags: ["graph", "core"],
        sourceType: "note",
        sourceId: "note-1"
      }
    ]);
  });
});
