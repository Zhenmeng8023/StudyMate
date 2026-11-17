import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDeckCardNote,
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
import { downloadLibraryMaterial, getLibraryMaterial, listLibraryMaterials } from "../api/library";

vi.mock("../api/library", () => ({
  listLibraryMaterials: vi.fn(), getLibraryMaterial: vi.fn(), downloadLibraryMaterial: vi.fn(),
  getMaterialAttachmentUrl: (id: string) => `/api/v1/library/materials/${id}/attachment`
}));

vi.mock("../modules/reader/PdfReaderPane", () => ({
  PdfReaderPane: (props: {
    initialPage: number;
    onSelectionChange: (selection: { text: string; page: number; rects: Array<{ page: number; x: number; y: number; width: number; height: number }> }) => void;
    onPageChange: (page: number) => void;
    fileUrl: string;
    accessToken: string;
    focusedAnnotationId: string;
  }) => (
    <div data-testid="pdf-reader-pane" data-url={props.fileUrl} data-token={props.accessToken} data-focused={props.focusedAnnotationId}>
      <span>initial-page-{props.initialPage}</span>
      <button onClick={() => props.onSelectionChange({ text: "Highlighted quote", page: 3, rects: [{ page: 3, x: 0.1, y: 0.2, width: 0.4, height: 0.03 }] })} type="button">
        mock-select-quote
      </button>
      <button onClick={() => props.onPageChange(4)} type="button">mock-next-page</button>
    </div>
  )
}));

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    createDeckCardNote: vi.fn(),
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
const createDeckCardNoteMock = vi.mocked(createDeckCardNote);
const createReaderAnnotationMock = vi.mocked(createReaderAnnotation);
const generateAnnotationCardDraftsMock = vi.mocked(generateAnnotationCardDrafts);
const generateAnnotationGraphDraftsMock = vi.mocked(generateAnnotationGraphDrafts);
const deleteReaderAnnotationMock = vi.mocked(deleteReaderAnnotation);

describe("ReaderPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(listLibraryMaterials).mockReset().mockResolvedValue([]);
    vi.mocked(getLibraryMaterial).mockReset();
    vi.mocked(downloadLibraryMaterial).mockReset().mockResolvedValue(undefined);
    listMaterialsMock.mockReset();
    listDecksMock.mockReset();
    getReaderStateMock.mockReset();
    updateReaderProgressMock.mockReset();
    createDeckCardNoteMock.mockReset();
    createReaderAnnotationMock.mockReset();
    generateAnnotationCardDraftsMock.mockReset();
    generateAnnotationGraphDraftsMock.mockReset();
    deleteReaderAnnotationMock.mockReset();

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
    createDeckCardNoteMock.mockResolvedValue({
      cardNote: {
        id: "note-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        noteTypeId: "basic",
        noteTypeCode: "basic",
        generatedCardCount: 1,
        status: "active"
      },
      generatedCards: [
        {
          id: "card-1",
          deckId: "deck-1",
          ownerUserId: "user-1",
          cardType: "basic",
          front: "Question",
          back: "Answer",
          status: "active",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ]
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
  });

  it("opens a document deep link without covering the PDF with the resource drawer", async () => {
    render(<MemoryRouter initialEntries={["/reader/material-1"]}><Routes><Route path="/reader/:materialId" element={<ReaderPage session={session} />} /></Routes></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("button", { name: "打开资料面板" })).toHaveAttribute("aria-expanded", "false"));
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
        rects: [{ page: 3, x: 0.1, y: 0.2, width: 0.4, height: 0.03 }]
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

  it("creates a card note from annotation drafts with the selected template", async () => {
    const user = userEvent.setup();
    getReaderStateMock.mockResolvedValueOnce({
      materialId: "material-1",
      currentPage: 3,
      totalPages: 10,
      progressPercent: 30,
      bookmarks: [1],
      lastReadAt: "2026-06-02T12:00:00Z",
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
    generateAnnotationCardDraftsMock.mockResolvedValueOnce([
      {
        id: "draft-1",
        sourceType: "annotation",
        sourceId: "annotation-1",
        sourceLabel: "算法导论",
        sourceMetadata: {
          materialId: "material-1",
          annotationId: "annotation-1",
          page: 3
        },
        front: "Question",
        back: "Answer"
      }
    ]);

    render(
      <MemoryRouter>
        <ReaderPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByTestId("pdf-reader-pane")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "生成复习草稿" }));
    await user.selectOptions(screen.getByLabelText("卡片模板"), "basic_reverse");
    await user.click(screen.getByRole("button", { name: "写入复习系统" }));

    await waitFor(() => {
      expect(createDeckCardNoteMock).toHaveBeenCalledWith(session, "deck-1", {
        noteTypeCode: "basic_reverse",
        fields: {
          front: "Question",
          back: "Answer"
        },
        sourceLinks: [
          {
            sourceType: "annotation",
            sourceId: "annotation-1",
            locator: {
              materialId: "material-1",
              annotationId: "annotation-1",
              page: 3
            }
          }
        ]
      });
    });
  });

  it("opens private library files with authenticated PDF requests and offers original download", async () => {
    const [material] = await listMaterialsMock();
    listMaterialsMock.mockResolvedValue([]);
    vi.mocked(listLibraryMaterials).mockResolvedValue([{ ...material, libraryScope: "personal", status: "private" }]);
    const user = userEvent.setup();
    render(<MemoryRouter><ReaderPage session={session} /></MemoryRouter>);
    expect(await screen.findByTestId("pdf-reader-pane")).toHaveAttribute("data-url", "/api/v1/library/materials/material-1/attachment");
    expect(screen.getByTestId("pdf-reader-pane")).toHaveAttribute("data-token", "access-token");
    await user.click(screen.getByRole("button", { name: "下载原文件" }));
    expect(downloadLibraryMaterial).toHaveBeenCalledWith(session, expect.objectContaining({ id: "material-1" }));
  });

  it("shows Word preview limitations and preserves the original file download", async () => {
    const [material] = await listMaterialsMock();
    listMaterialsMock.mockResolvedValue([{ ...material, attachmentMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", attachmentName: "notes.docx" }]);
    render(<MemoryRouter><ReaderPage session={session} /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "此文件暂不支持在线预览" })).toBeInTheDocument();
    expect(screen.queryByTestId("pdf-reader-pane")).not.toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("button", { name: "下载原文件" })).toBeEnabled();
  });

  it("surfaces progress persistence errors and retries without losing the current page", async () => {
    updateReaderProgressMock.mockRejectedValueOnce(new Error("网络暂不可用"));
    const user = userEvent.setup();
    render(<MemoryRouter><ReaderPage session={session} /></MemoryRouter>);
    await screen.findByTestId("pdf-reader-pane");
    await user.click(screen.getByRole("button", { name: "mock-next-page" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("网络暂不可用");
    expect(screen.getByText("initial-page-4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "重试保存进度" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(updateReaderProgressMock).toHaveBeenCalledTimes(2);
  });

  it("saves comment-only annotations without inventing a highlight rectangle", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ReaderPage session={session} /></MemoryRouter>);
    await screen.findByTestId("pdf-reader-pane");
    await user.type(screen.getByLabelText("批注内容"), "My comment");
    await user.click(screen.getByRole("button", { name: "保存批注" }));
    await waitFor(() => expect(createReaderAnnotationMock).toHaveBeenCalledWith(session, "material-1", expect.objectContaining({ quote: "", comment: "My comment", rects: [] })));
  });

  it("resolves direct official links and locates the referenced annotation with an excerpt-to-note action", async () => {
    const [material] = await listMaterialsMock();
    listMaterialsMock.mockResolvedValue([]);
    vi.mocked(getLibraryMaterial).mockResolvedValue({ ...material, libraryScope: "official" });
    getReaderStateMock.mockResolvedValueOnce({ materialId: "material-1", currentPage: 1, totalPages: 10, progressPercent: 10, bookmarks: [], lastReadAt: "", annotations: [{ id: "ann-1", materialId: "material-1", page: 6, quote: "A useful sentence", comment: "My reading note", color: "blue", rects: [{ page: 6, x: 0.1, y: 0.2, width: 0.3, height: 0.02 }], createdAt: "", updatedAt: "" }] });
    render(<MemoryRouter initialEntries={["/reader/material-1?annotation=ann-1"]}><Routes><Route path="/reader/:materialId" element={<ReaderPage session={session} />} /></Routes></MemoryRouter>);
    expect(await screen.findByTestId("pdf-reader-pane")).toHaveAttribute("data-focused", "ann-1");
    expect(screen.getByText("initial-page-6")).toBeInTheDocument();
    expect(getLibraryMaterial).toHaveBeenCalledWith(session, "material-1");
    const href = screen.getByRole("link", { name: "摘录到笔记" }).getAttribute("href") || "";
    const query = new URL(href, "https://example.test").searchParams;
    expect(query.get("annotation")).toBe("ann-1");
    expect(query.get("quote")).toBe("A useful sentence");
    expect(query.get("page")).toBe("6");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "定位第 6 页批注" }));
    expect(screen.getByText("initial-page-6")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "删除批注" }));
    await waitFor(() => expect(deleteReaderAnnotationMock).toHaveBeenCalledWith(session, "material-1", "ann-1"));
  });

  it("removes a bookmark independently of other saved pages", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ReaderPage session={session} /></MemoryRouter>);
    await screen.findByTestId("pdf-reader-pane");
    await user.click(screen.getByRole("button", { name: "书签" }));
    await user.click(screen.getByRole("button", { name: "移除第 1 页书签" }));
    await waitFor(() => expect(updateReaderProgressMock).toHaveBeenCalledWith(session, "material-1", expect.objectContaining({ bookmarks: [] })));
  });

  it("keeps the selected excerpt and unsaved annotation when tokens refresh for the same user", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MemoryRouter><ReaderPage session={session} /></MemoryRouter>);
    await screen.findByTestId("pdf-reader-pane");
    await user.click(screen.getByRole("button", { name: "mock-select-quote" }));
    await user.type(screen.getByLabelText("批注内容"), "Unfinished reading thought");
    const initialCalls = getReaderStateMock.mock.calls.length;
    rerender(<MemoryRouter><ReaderPage session={{ ...session, accessToken: "refreshed-token" }} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId("pdf-reader-pane")).toHaveAttribute("data-token", "refreshed-token"));
    expect(screen.getByLabelText("批注内容")).toHaveValue("Unfinished reading thought");
    expect(screen.getByText("Highlighted quote")).toBeInTheDocument();
    expect(getReaderStateMock).toHaveBeenCalledTimes(initialCalls);
  });
});
