import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bulkCreateDeckCards,
  commitGraphChangeDraftSelection,
  createDeck,
  getAiUsageSummary,
  getTodayReviewQueue,
  listAiDrafts,
  listAiTasks,
  reviewCard,
  updateCardStatus
} from "./client";
import type { AuthSession } from "./types";

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-02T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

function mockApiResponse<T>(data: T) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("review API clients", () => {
  it("creates decks with visibility and auth headers", async () => {
    const fetchMock = mockApiResponse({
      id: "deck-1",
      ownerUserId: "user-1",
      title: "期末复习",
      description: "高频概念",
      visibility: "private",
      cardCount: 0,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });

    await createDeck(session, {
      title: "期末复习",
      description: "高频概念",
      visibility: "private"
    });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/decks");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      title: "期末复习",
      description: "高频概念",
      visibility: "private"
    });
  });

  it("bulk creates cards from confirmed AI drafts", async () => {
    const fetchMock = mockApiResponse([
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "什么是知识图谱？",
        back: "一种以节点和关系组织知识的结构。",
        sourceType: "ai_draft",
        sourceId: "draft-1",
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);

    await bulkCreateDeckCards(session, "deck-1", [
      {
        cardType: "basic",
        draftId: "draft-1",
        front: "什么是知识图谱？",
        back: "一种以节点和关系组织知识的结构。",
        sourceType: "ai_draft",
        sourceId: "draft-1"
      }
    ]);

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/decks/deck-1/cards/bulk");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      cards: [
        {
          cardType: "basic",
          draftId: "draft-1",
          front: "什么是知识图谱？",
          back: "一种以节点和关系组织知识的结构。",
          sourceType: "ai_draft",
          sourceId: "draft-1"
        }
      ]
    });
  });

  it("reads the due queue and posts review writeback ratings", async () => {
    const fetchMock = mockApiResponse({
      dueCount: 1,
      items: []
    });

    await getTodayReviewQueue(session);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/review/today");
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });

    fetchMock.mockClear();
    await reviewCard(session, "card-1", { rating: "good", elapsedMs: 1200 });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/cards/card-1/review");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      rating: "good",
      elapsedMs: 1200
    });
  });

  it("updates card status for suspend and resume actions", async () => {
    const fetchMock = mockApiResponse({
      id: "card-1",
      deckId: "deck-1",
      ownerUserId: "user-1",
      cardType: "basic",
      front: "什么是知识图谱？",
      back: "一种以节点和关系组织知识的结构。",
      status: "suspended",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });

    await updateCardStatus(session, "card-1", { status: "suspended" });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/cards/card-1/status");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({
      status: "suspended"
    });
  });

  it("updates card status for bury actions", async () => {
    const fetchMock = mockApiResponse({
      id: "card-1",
      deckId: "deck-1",
      ownerUserId: "user-1",
      cardType: "basic",
      front: "什么是知识图谱？",
      back: "一种以节点和关系组织知识的结构。",
      status: "buried",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });

    await updateCardStatus(session, "card-1", { status: "buried" });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/cards/card-1/status");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({
      status: "buried"
    });
  });
});

describe("AI API clients", () => {
  it("loads tasks, usage and drafts with auth headers", async () => {
    const fetchMock = mockApiResponse([]);

    await listAiTasks(session);
    await getAiUsageSummary(session);
    await listAiDrafts(session);

    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/api/v1/ai/tasks",
      "/api/v1/ai/usage",
      "/api/v1/ai/drafts"
    ]);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.headers).toMatchObject({
        Authorization: "Bearer access-token"
      });
    }
  });

  it("commits selected graph change drafts with node selections", async () => {
    const fetchMock = mockApiResponse({
      id: "graph-1",
      ownerUserId: "user-1",
      title: "Knowledge Graph",
      description: "Course concepts",
      visibility: "private",
      status: "active",
      graphType: "knowledge",
      mode: "freeform",
      currentVersion: 2,
      nodeCount: 3,
      edgeCount: 1,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:10:00Z",
      document: {
        graphId: "graph-1",
        version: 2,
        schemaVersion: 1,
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [],
        edges: [],
        groups: []
      }
    });

    await commitGraphChangeDraftSelection(session, "graph-1", {
      draftIds: ["draft-1"],
      nodeSelections: [
        {
          draftId: "draft-1",
          nodeIds: ["node-a", "node-b"]
        }
      ]
    });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/graphs/graph-1/ai/commit-changes");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      draftIds: ["draft-1"],
      nodeSelections: [
        {
          draftId: "draft-1",
          nodeIds: ["node-a", "node-b"]
        }
      ]
    });
  });
});
