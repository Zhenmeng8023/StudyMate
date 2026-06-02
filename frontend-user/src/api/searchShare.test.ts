import { afterEach, describe, expect, it, vi } from "vitest";
import { createShareLink, resolveShareLink, searchAll } from "./client";
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
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("search and share API clients", () => {
  it("builds grouped search requests with optional auth and filters", async () => {
    const fetchMock = mockApiResponse({
      query: "知识 图谱",
      total: 1,
      groups: [
        {
          type: "note",
          count: 1,
          results: [
            {
              type: "note",
              id: "note-1",
              title: "图谱笔记",
              summary: "来自笔记",
              url: "/notes/note-1",
              source: "mysql"
            }
          ]
        }
      ]
    });

    await searchAll(session, { query: "知识 图谱", types: ["note", "graph"], limit: 10 });

    const [path, init] = fetchMock.mock.calls[0];
    const url = new URL(String(path), "http://localhost");
    expect(url.pathname).toBe("/api/v1/search");
    expect(url.searchParams.get("q")).toBe("知识 图谱");
    expect(url.searchParams.get("types")).toBe("note,graph");
    expect(url.searchParams.get("limit")).toBe("10");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });
  });

  it("creates owner share links with target and mode payloads", async () => {
    const fetchMock = mockApiResponse({
      id: "share-1",
      ownerUserId: "user-1",
      targetType: "note",
      targetId: "note-1",
      mode: "token",
      token: "tok-1",
      status: "active",
      url: "/share/tok-1",
      createdAt: "2026-06-02T12:00:00Z"
    });

    await createShareLink(session, {
      targetType: "note",
      targetId: "note-1",
      mode: "token",
      expiresAt: "2026-06-09T12:00:00Z"
    });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/share-links");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      targetType: "note",
      targetId: "note-1",
      mode: "token",
      expiresAt: "2026-06-09T12:00:00Z"
    });
  });

  it("resolves public share tokens without requiring auth headers", async () => {
    const fetchMock = mockApiResponse({
      token: "token/with space",
      mode: "token",
      targetType: "graph",
      targetId: "graph-1",
      title: "知识图谱",
      summary: "只读分享",
      url: "/graphs/graph-1",
      readOnly: true,
      metadata: {}
    });

    await resolveShareLink("token/with space");

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/share/token%2Fwith%20space");
    expect(init?.headers).not.toMatchObject({
      Authorization: expect.any(String)
    });
  });
});
