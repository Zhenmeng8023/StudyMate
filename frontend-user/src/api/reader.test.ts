import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createReaderAnnotation,
  deleteReaderAnnotation,
  generateAnnotationCardDrafts,
  generateAnnotationGraphDrafts,
  getReaderState,
  updateReaderProgress
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
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
    new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("reader API clients", () => {
  it("loads and updates reader progress with auth headers", async () => {
    const fetchMock = mockApiResponse({
      materialId: "material-1",
      currentPage: 3,
      totalPages: 10,
      progressPercent: 30,
      bookmarks: [1, 3],
      lastReadAt: "2026-06-02T12:00:00Z",
      annotations: []
    });

    await getReaderState(session, "material-1");
    await updateReaderProgress(session, "material-1", {
      currentPage: 3,
      totalPages: 10,
      progressPercent: 30,
      bookmarks: [1, 3]
    });

    const [getPath, getInit] = fetchMock.mock.calls[0];
    expect(getPath).toBe("/api/v1/materials/material-1/reader");
    expect(getInit?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });

    const [putPath, putInit] = fetchMock.mock.calls[1];
    expect(putPath).toBe("/api/v1/materials/material-1/reader/progress");
    expect(putInit?.method).toBe("PUT");
    expect(putInit?.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(putInit?.body))).toEqual({
      currentPage: 3,
      totalPages: 10,
      progressPercent: 30,
      bookmarks: [1, 3]
    });
  });

  it("creates and deletes reader annotations with rect payloads", async () => {
    const fetchMock = mockApiResponse({
      id: "annotation-1",
      materialId: "material-1",
      page: 3,
      quote: "Highlighted quote",
      comment: "Useful note",
      color: "#f0d080",
      rects: [{ page: 3, x: 0, y: 0.1, width: 1, height: 0.08 }],
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });

    await createReaderAnnotation(session, "material-1", {
      page: 3,
      quote: "Highlighted quote",
      comment: "Useful note",
      color: "#f0d080",
      rects: [{ page: 3, x: 0, y: 0.1, width: 1, height: 0.08 }]
    });
    await deleteReaderAnnotation(session, "material-1", "annotation-1");

    const [postPath, postInit] = fetchMock.mock.calls[0];
    expect(postPath).toBe("/api/v1/materials/material-1/reader/annotations");
    expect(postInit?.method).toBe("POST");
    expect(JSON.parse(String(postInit?.body))).toEqual({
      page: 3,
      quote: "Highlighted quote",
      comment: "Useful note",
      color: "#f0d080",
      rects: [{ page: 3, x: 0, y: 0.1, width: 1, height: 0.08 }]
    });

    const [deletePath, deleteInit] = fetchMock.mock.calls[1];
    expect(deletePath).toBe("/api/v1/materials/material-1/reader/annotations/annotation-1");
    expect(deleteInit?.method).toBe("DELETE");
    expect(deleteInit?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });
  });

  it("requests annotation card and graph drafts through the protected reader endpoints", async () => {
    const fetchMock = mockApiResponse([]);

    await generateAnnotationCardDrafts(session, "material-1", ["annotation-1", "annotation-2"]);
    await generateAnnotationGraphDrafts(session, "material-1", ["annotation-1", "annotation-2"]);

    const [cardPath, cardInit] = fetchMock.mock.calls[0];
    expect(cardPath).toBe("/api/v1/materials/material-1/reader/annotations/generate-cards");
    expect(cardInit?.method).toBe("POST");
    expect(JSON.parse(String(cardInit?.body))).toEqual({
      annotationIds: ["annotation-1", "annotation-2"]
    });

    const [graphPath, graphInit] = fetchMock.mock.calls[1];
    expect(graphPath).toBe("/api/v1/materials/material-1/reader/annotations/generate-graph-drafts");
    expect(graphInit?.method).toBe("POST");
    expect(graphInit?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });
    expect(JSON.parse(String(graphInit?.body))).toEqual({
      annotationIds: ["annotation-1", "annotation-2"]
    });
  });
});
