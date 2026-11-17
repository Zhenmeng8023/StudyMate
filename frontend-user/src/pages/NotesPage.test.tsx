// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDeckCardNote,
  createNote,
  deleteNote,
  generateNoteCardDrafts,
  listDecks,
  listMaterials,
  listNotes,
  listNoteVersions,
  updateNote
} from "../api/client";
import type { AuthSession } from "../api/client";
import { NotesPage } from "./NotesPage";
import { listLibraryMaterials } from "../api/library";

vi.mock("../api/library", () => ({ listLibraryMaterials: vi.fn().mockResolvedValue([]) }));

vi.mock("../modules/notes/RichTextEditor", () => ({
  RichTextEditor: (props: { onChange: (value: string) => void; value: string }) => (
    <textarea aria-label="富文本正文" onChange={(event) => props.onChange(event.target.value)} value={props.value} />
  )
}));

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    createDeckCardNote: vi.fn(),
    createNote: vi.fn(),
    deleteNote: vi.fn(),
    generateNoteCardDrafts: vi.fn(),
    listDecks: vi.fn(),
    listMaterials: vi.fn(),
    listNotes: vi.fn(),
    listNoteVersions: vi.fn(),
    updateNote: vi.fn()
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

const listNotesMock = vi.mocked(listNotes);
const listMaterialsMock = vi.mocked(listMaterials);
const listDecksMock = vi.mocked(listDecks);
const listNoteVersionsMock = vi.mocked(listNoteVersions);
const createDeckCardNoteMock = vi.mocked(createDeckCardNote);
const deleteNoteMock = vi.mocked(deleteNote);
const generateNoteCardDraftsMock = vi.mocked(generateNoteCardDrafts);
const updateNoteMock = vi.mocked(updateNote);

const noteFixture = {
  id: "note-1",
  ownerUserId: "user-1",
  title: "Binary Search Notes",
  summary: "Boundary conditions",
  content: "<p>Initial content</p>",
  materialId: "material-1",
  folderName: "Algorithms",
  tags: ["algo"],
  versionNumber: 2,
  createdAt: "2026-06-02T12:00:00Z",
  updatedAt: "2026-06-02T12:00:00Z"
};

describe("NotesPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.mocked(createNote).mockReset();
    createDeckCardNoteMock.mockReset();
    deleteNoteMock.mockReset();
    generateNoteCardDraftsMock.mockReset();
    listNotesMock.mockReset();
    listMaterialsMock.mockReset();
    listDecksMock.mockReset();
    listNoteVersionsMock.mockReset();
    updateNoteMock.mockReset();

    listNotesMock.mockResolvedValue([noteFixture]);
    listMaterialsMock.mockResolvedValue([
      {
        id: "material-1",
        ownerUserId: "user-1",
        ownerName: "Alice",
        title: "Algorithms Guide",
        description: "Binary search",
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
      },
      {
        id: "material-2",
        ownerUserId: "user-1",
        ownerName: "Alice",
        title: "Linear Algebra",
        description: "Matrix basics",
        category: "course",
        tags: ["math"],
        coverFileId: "",
        attachmentFileId: "file-2",
        attachmentName: "linear.pdf",
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
        title: "Notes deck",
        description: "review deck",
        visibility: "private",
        cardCount: 0,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    listNoteVersionsMock.mockResolvedValue([
      {
        id: "version-1",
        noteId: "note-1",
        versionNumber: 1,
        title: "Binary Search Notes",
        summary: "Old summary",
        content: "<p>Old content</p>",
        createdAt: "2026-06-01T12:00:00Z"
      }
    ]);
    generateNoteCardDraftsMock.mockResolvedValue([]);
    createDeckCardNoteMock.mockResolvedValue({
      cardNote: {
        id: "card-note-1",
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
    deleteNoteMock.mockResolvedValue(undefined as never);
    updateNoteMock.mockResolvedValue({} as never);
  });

  it("starts a private reader excerpt without overwriting an existing note", async () => {
    vi.mocked(listLibraryMaterials).mockResolvedValueOnce([{
      id: "private-1", title: "Private PDF", libraryScope: "personal", ownerUserId: "user-1",
      ownerName: "Alice", description: "Private reading", category: "book", tags: [], coverFileId: "",
      attachmentFileId: "file-1", attachmentName: "private.pdf", attachmentMime: "application/pdf",
      status: "private", favoritesCount: 0, averageRating: 0, createdAt: "2026-11-16", updatedAt: "2026-11-16"
    }]);
    render(<MemoryRouter initialEntries={["/notes?material=private-1&annotation=anno-1&page=4&quote=Selected%20quote&comment=My%20thought"]}><NotesPage session={session} /></MemoryRouter>);
    await waitFor(() => expect((screen.getByLabelText("富文本正文") as HTMLTextAreaElement).value).toContain("Selected quote"));
    expect((screen.getByLabelText("富文本正文") as HTMLTextAreaElement).value).toContain("annotation=anno-1");
    expect((screen.getByLabelText("富文本正文") as HTMLTextAreaElement).value).toContain("My thought");
    expect(updateNoteMock).not.toHaveBeenCalled();
  });

  it("keeps editor, source and version history in separate studio areas", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    expect((await screen.findAllByText("Binary Search Notes")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Algorithms Guide").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "历史" }));
    expect(await screen.findByText("v1")).toBeInTheDocument();
  });

  it("creates a blank draft through the command bar without overwriting the selected note", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByLabelText("笔记标题")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "新建" }));
    expect(screen.getByText("新建草稿")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "创建笔记" }).length).toBeGreaterThan(0);
  });

  it("uses the shared select for note material source", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    const select = await screen.findByLabelText("资料来源");
    expect(select.tagName).toBe("SELECT");
    expect(select.className).toContain("ds-select");

    await user.selectOptions(select, "material-2");
    expect(screen.getByLabelText("资料来源")).toHaveValue("material-2");
  });

  it("uses the shared confirm dialog before deleting a note", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    listNotesMock.mockResolvedValueOnce([noteFixture]).mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByRole("button", { name: "删除" })).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "删除" }));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "确认删除笔记" })).toBeInTheDocument();
    expect(deleteNoteMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(screen.queryByRole("dialog", { name: "确认删除笔记" })).not.toBeInTheDocument();
    expect(deleteNoteMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "删除" }));
    await user.click(screen.getByRole("button", { name: "确认" }));

    expect(deleteNoteMock).toHaveBeenCalledWith(session, "note-1");
    await expect(screen.findByText("笔记已删除")).resolves.toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it("renders the shared error state when the initial notes workspace bootstrap fails", async () => {
    listNotesMock.mockRejectedValueOnce(new Error("笔记工作台加载失败"));
    listMaterialsMock.mockRejectedValueOnce(new Error("笔记工作台加载失败"));
    listDecksMock.mockRejectedValueOnce(new Error("笔记工作台加载失败"));

    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "笔记暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("笔记工作台加载失败")).toBeInTheDocument();
  });

  it("keeps rendering the current note while surfacing a shared stale state after a save refresh fails", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("笔记标题")).toHaveValue("Binary Search Notes");
    });

    listNotesMock.mockRejectedValueOnce(new Error("笔记列表刷新失败"));

    await user.click(screen.getByRole("button", { name: "保存版本" }));

    expect(await screen.findByRole("heading", { level: 2, name: "笔记列表需要刷新" })).toBeInTheDocument();
    expect(screen.getByText("笔记列表刷新失败")).toBeInTheDocument();
    expect(screen.getByLabelText("笔记标题")).toHaveValue("Binary Search Notes");
    expect(screen.getAllByText("Binary Search Notes").length).toBeGreaterThan(0);
  });

  it("confirms note drafts into card notes with the shared template composer", async () => {
    generateNoteCardDraftsMock.mockResolvedValueOnce([
      {
        id: "draft-1",
        sourceType: "note",
        sourceId: "note-1",
        sourceLabel: "Binary Search Notes",
        sourceMetadata: {
          noteId: "note-1"
        },
        front: "What is the invariant?",
        back: "The target range always stays bounded."
      }
    ]);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    await user.click(await screen.findByRole("button", { name: "复习" }));
    await user.click(screen.getByRole("button", { name: "生成复习草稿" }));
    await user.selectOptions(screen.getByLabelText("卡片模板"), "basic_reverse");
    await user.click(screen.getByRole("button", { name: "写入复习系统" }));

    await waitFor(() => {
      expect(createDeckCardNoteMock).toHaveBeenCalledWith(session, "deck-1", {
        noteTypeCode: "basic_reverse",
        fields: {
          front: "What is the invariant?",
          back: "The target range always stays bounded."
        },
        sourceLinks: [
          {
            sourceType: "note",
            sourceId: "note-1",
            locator: {
              noteId: "note-1"
            }
          }
        ]
      });
    });
    expect(await screen.findByRole("link", { name: "去复习" })).toHaveAttribute("href", "/review?card=card-1");
    expect(screen.getByRole("link", { name: "回到来源" })).toHaveAttribute("href", "/notes?selected=note-1");
  });
  it("keeps failed drafts and retries only unfinished cards after a partial batch", async () => {
    generateNoteCardDraftsMock.mockResolvedValueOnce([
      { id: "draft-a", sourceType: "note", sourceId: "note-1", front: "Question A", back: "Answer A" },
      { id: "draft-b", sourceType: "note", sourceId: "note-1", front: "Question B", back: "Answer B" }
    ]);
    createDeckCardNoteMock.mockRejectedValueOnce(new Error("网络中断"));
    const user = userEvent.setup();
    render(<MemoryRouter><NotesPage session={session} /></MemoryRouter>);
    await user.click(await screen.findByRole("button", { name: "复习" }));
    await user.click(screen.getByRole("button", { name: "生成复习草稿" }));
    await user.click(await screen.findByRole("button", { name: "写入复习系统" }));
    expect(await screen.findByText(/已保留 1 条未写入草稿/)).toBeInTheDocument();
    expect(screen.getByLabelText("问题")).toHaveValue("Question A");
    expect(screen.getByLabelText("写入 Deck")).toHaveValue("deck-1");
    await user.click(screen.getByRole("button", { name: "写入复习系统" }));
    await waitFor(() => expect(createDeckCardNoteMock).toHaveBeenCalledTimes(3));
    expect(createDeckCardNoteMock.mock.calls.map((call) => call[2].fields.front)).toEqual(["Question A", "Question B", "Question A"]);
  });
});
