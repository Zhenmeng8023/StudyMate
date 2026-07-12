import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bulkCreateDeckCards,
  createReaderAnnotation,
  deleteReaderAnnotation,
  generateAnnotationCardDrafts,
  generateAnnotationGraphDrafts,
  getReaderState,
  listDecks,
  listMaterials,
  updateReaderProgress
} from "../api/client";
import type { AuthSession } from "../api/client";
import { ReaderPage } from "./ReaderPage";

vi.mock("../modules/reader/PdfReaderPane", () => ({
  PdfReaderPane: (props: {
    initialPage: number;
    onSelectionChange: (text: string) => void;
  }) => (
    <div data-testid="pdf-reader-pane">
      <span>initial-page-{props.initialPage}</span>
      <button onClick={() => props.onSelectionChange("Highlighted quote")} type="button">
        mock-select-quote
      </button>
    </div>
  )
}));

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    bulkCreateDeckCards: vi.fn(),
    createReaderAnnotation: vi.fn(),
    deleteReaderAnnotation: vi.fn(),
    generateAnnotationCardDrafts: vi.fn(),
    generateAnnotationGraphDrafts: vi.fn(),
    getReaderState: vi.fn(),
    listDecks: vi.fn(),
    listMaterials: vi.fn(),
    updateReaderProgress: vi.fn()
  };
});

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

const listMaterialsMock = vi.mocked(listMaterials);
const listDecksMock = vi.mocked(listDecks);
const getReaderStateMock = vi.mocked(getReaderState);
const updateReaderProgressMock = vi.mocked(updateReaderProgress);
const createReaderAnnotationMock = vi.mocked(createReaderAnnotation);
const generateAnnotationCardDraftsMock = vi.mocked(generateAnnotationCardDrafts);
const generateAnnotationGraphDraftsMock = vi.mocked(generateAnnotationGraphDrafts);
const deleteReaderAnnotationMock = vi.mocked(deleteReaderAnnotation);
const bulkCreateDeckCardsMock = vi.mocked(bulkCreateDeckCards);

describe("ReaderPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listMaterialsMock.mockReset();
    listDecksMock.mockReset();
    getReaderStateMock.mockReset();
    updateReaderProgressMock.mockReset();
    createReaderAnnotationMock.mockReset();
    generateAnnotationCardDraftsMock.mockReset();
    generateAnnotationGraphDraftsMock.mockReset();
    deleteReaderAnnotationMock.mockReset();
    bulkCreateDeckCardsMock.mockReset();

    listMaterialsMock.mockResolvedValue([
      {
        id: "material-1",
        ownerUserId: "user-1",
        ownerName: "Alice",
        title: "算法导论",
        description: "二分查找",
        category: "book",
        tags: ["algo"],
        coverFileId: "",
        attachmentFileId: "file-1",
        attachmentName: "algo.pdf",
        attachmentMime: "application/pdf",
        status: "approved",
        favoritesCount: 0,
        averageRating: 0,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    listDecksMock.mockResolvedValue([
      {
        id: "deck-1",
        ownerUserId: "user-1",
        title: "阅读卡片",
        description: "reader deck",
        visibility: "private",
        cardCount: 0,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getReaderStateMock.mockResolvedValue({
      materialId: "material-1",
      currentPage: 3,
      totalPages: 10,
      progressPercent: 30,
      bookmarks: [1],
      lastReadAt: "2026-06-02T12:00:00Z",
      annotations: []
    });
    updateReaderProgressMock.mockResolvedValue({
      materialId: "material-1",
      currentPage: 3,
      totalPages: 10,
      progressPercent: 30,
      bookmarks: [1, 3],
      lastReadAt: "2026-06-02T12:01:00Z",
      annotations: []
    });
    createReaderAnnotationMock.mockResolvedValue({
      id: "annotation-1",
      materialId: "material-1",
      page: 3,
      quote: "Highlighted quote",
      comment: "Useful note",
      color: "#f0d080",
      rects: [{ page: 3, x: 0, y: 0, width: 1, height: 0.08 }],
      createdAt: "2026-06-02T12:02:00Z",
      updatedAt: "2026-06-02T12:02:00Z"
    });
    generateAnnotationCardDraftsMock.mockResolvedValue([]);
    generateAnnotationGraphDraftsMock.mockResolvedValue([]);
    deleteReaderAnnotationMock.mockResolvedValue({ message: "deleted" } as never);
    bulkCreateDeckCardsMock.mockResolvedValue([]);
  });

  it("adds a bookmark and writes back the current reading progress", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ReaderPage session={session} />
      </MemoryRouter>
    );

    expect((await screen.findAllByText("算法导论")).length).toBeGreaterThanOrEqual(2);

    await user.click(screen.getByRole("button", { name: "添加书签" }));

    await waitFor(() => {
      expect(updateReaderProgressMock).toHaveBeenCalledWith(session, "material-1", {
        currentPage: 3,
        totalPages: 10,
        progressPercent: 30,
        bookmarks: [1, 3]
      });
    });
    await waitFor(() => {
      expect(screen.getAllByText("第 3 页").length).toBeGreaterThan(0);
    });
  });

  it("creates an annotation from the selected quote and shows source trace details", async () => {
    const user = userEvent.setup();
    getReaderStateMock
      .mockResolvedValueOnce({
        materialId: "material-1",
        currentPage: 3,
        totalPages: 10,
        progressPercent: 30,
        bookmarks: [1],
        lastReadAt: "2026-06-02T12:00:00Z",
        annotations: []
      })
      .mockResolvedValueOnce({
        materialId: "material-1",
        currentPage: 3,
        totalPages: 10,
        progressPercent: 30,
        bookmarks: [1],
        lastReadAt: "2026-06-02T12:03:00Z",
        annotations: [
          {
            id: "annotation-1",
            materialId: "material-1",
            page: 3,
            quote: "Highlighted quote",
            comment: "Useful note",
            color: "#f0d080",
            rects: [{ page: 3, x: 0, y: 0, width: 1, height: 0.08 }],
            createdAt: "2026-06-02T12:02:00Z",
            updatedAt: "2026-06-02T12:02:00Z"
          }
        ]
      });

    render(
      <MemoryRouter>
        <ReaderPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByTestId("pdf-reader-pane")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "mock-select-quote" }));
    await user.type(screen.getByLabelText("批注内容"), "Useful note");
    await user.click(screen.getByRole("button", { name: "保存批注" }));

    await waitFor(() => {
      expect(createReaderAnnotationMock).toHaveBeenCalledWith(session, "material-1", {
        page: 3,
        quote: "Highlighted quote",
        comment: "Useful note",
        color: "amber",
        rects: [{ page: 3, x: 0, y: 0, width: 1, height: 0.08 }]
      });
    });
    expect(await screen.findByText(/PDF 第 3 页/)).toBeInTheDocument();
    expect(screen.getByText(/1 个坐标片段/)).toBeInTheDocument();
    expect(screen.getByText("Highlighted quote")).toBeInTheDocument();
  });

  it("uses the page query from graph source backlinks as the initial PDF page", async () => {
    render(
      <MemoryRouter initialEntries={["/reader/material-1?page=8&annotation=annotation-1"]}>
        <ReaderPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByText("initial-page-8")).resolves.toBeInTheDocument();
  });

  it("renders the shared error state when the initial reader state bootstrap fails", async () => {
    getReaderStateMock.mockRejectedValueOnce(new Error("阅读状态加载失败"));

    render(
      <MemoryRouter>
        <ReaderPage session={session} />
      </MemoryRouter>
    );

    expect((await screen.findAllByRole("heading", { level: 2, name: "阅读内容暂时不可用" })).length).toBeGreaterThan(0);
    expect(screen.getAllByText("阅读状态加载失败").length).toBeGreaterThan(0);
  });

  it("keeps rendering the current document while surfacing a shared stale state after annotation refresh fails", async () => {
    const user = userEvent.setup();
    getReaderStateMock
      .mockResolvedValueOnce({
        materialId: "material-1",
        currentPage: 3,
        totalPages: 10,
        progressPercent: 30,
        bookmarks: [1],
        lastReadAt: "2026-06-02T12:00:00Z",
        annotations: []
      })
      .mockRejectedValueOnce(new Error("阅读上下文刷新失败"));

    render(
      <MemoryRouter>
        <ReaderPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByTestId("pdf-reader-pane")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "mock-select-quote" }));
    await user.type(screen.getByLabelText("批注内容"), "Useful note");
    await user.click(screen.getByRole("button", { name: "保存批注" }));

    expect(await screen.findByRole("heading", { level: 2, name: "阅读上下文需要刷新" })).toBeInTheDocument();
    expect(screen.getByText("阅读上下文刷新失败")).toBeInTheDocument();
    expect(screen.getByTestId("pdf-reader-pane")).toBeInTheDocument();
    expect(screen.getByText("initial-page-3")).toBeInTheDocument();
  });
});
