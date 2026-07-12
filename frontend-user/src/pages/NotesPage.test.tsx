// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNote,
  deleteNote,
  listDecks,
  listMaterials,
  listNotes,
  listNoteVersions,
  updateNote
} from "../api/client";
import type { AuthSession } from "../api/client";
import { NotesPage } from "./NotesPage";

vi.mock("../modules/notes/RichTextEditor", () => ({
  RichTextEditor: (props: { onChange: (value: string) => void; value: string }) => (
    <textarea aria-label="富文本正文" onChange={(event) => props.onChange(event.target.value)} value={props.value} />
  )
}));

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    createNote: vi.fn(),
    deleteNote: vi.fn(),
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
const deleteNoteMock = vi.mocked(deleteNote);
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
    deleteNoteMock.mockReset();
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
    listDecksMock.mockResolvedValue([]);
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
    deleteNoteMock.mockResolvedValue(undefined as never);
    updateNoteMock.mockResolvedValue({} as never);
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
});
