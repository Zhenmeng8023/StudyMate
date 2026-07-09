import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNote,
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
const updateNoteMock = vi.mocked(updateNote);

describe("NotesPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.mocked(createNote).mockReset();
    listNotesMock.mockReset();
    listMaterialsMock.mockReset();
    listDecksMock.mockReset();
    listNoteVersionsMock.mockReset();
    updateNoteMock.mockReset();

    listNotesMock.mockResolvedValue([
      {
        id: "note-1",
        ownerUserId: "user-1",
        title: "二分查找笔记",
        summary: "边界条件",
        content: "<p>初始内容</p>",
        materialId: "material-1",
        folderName: "算法",
        tags: ["算法"],
        versionNumber: 2,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
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
      },
      {
        id: "material-2",
        ownerUserId: "user-1",
        ownerName: "Alice",
        title: "线性代数",
        description: "矩阵基础",
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
        title: "二分查找笔记",
        summary: "旧摘要",
        content: "<p>旧内容</p>",
        createdAt: "2026-06-01T12:00:00Z"
      }
    ]);
    updateNoteMock.mockResolvedValue({} as never);
  });

  it("keeps editor, source and version history in separate studio areas", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotesPage session={session} />
      </MemoryRouter>
    );

    expect((await screen.findAllByText("二分查找笔记")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("算法导论").length).toBeGreaterThan(0);

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
});
