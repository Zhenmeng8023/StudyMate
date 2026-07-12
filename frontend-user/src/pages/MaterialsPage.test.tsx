import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listMaterials, toggleMaterialFavorite } from "../api/client";
import type { AuthSession, MaterialPayload } from "../api/client";
import { MaterialsPage } from "./MaterialsPage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    listMaterials: vi.fn(),
    toggleMaterialFavorite: vi.fn()
  };
});

const listMaterialsMock = vi.mocked(listMaterials);
const toggleMaterialFavoriteMock = vi.mocked(toggleMaterialFavorite);

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

function buildMaterial(input: Partial<MaterialPayload> & Pick<MaterialPayload, "id" | "title" | "description" | "category">): MaterialPayload {
  return {
    id: input.id,
    ownerUserId: input.ownerUserId ?? "user-1",
    ownerName: input.ownerName ?? "Alice",
    title: input.title,
    description: input.description,
    category: input.category,
    tags: input.tags ?? [],
    coverFileId: input.coverFileId ?? "",
    attachmentFileId: input.attachmentFileId ?? "",
    attachmentName: input.attachmentName ?? "",
    attachmentMime: input.attachmentMime ?? "",
    status: input.status ?? "approved",
    favoritesCount: input.favoritesCount ?? 0,
    averageRating: input.averageRating ?? 0,
    createdAt: input.createdAt ?? "2026-06-02T12:00:00Z",
    updatedAt: input.updatedAt ?? "2026-06-02T12:00:00Z"
  };
}

describe("MaterialsPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listMaterialsMock.mockReset();
    toggleMaterialFavoriteMock.mockReset();
    toggleMaterialFavoriteMock.mockResolvedValue({ active: true, count: 2 });
    listMaterialsMock.mockResolvedValue([
      buildMaterial({
        id: "material-1",
        title: "\u7b97\u6cd5\u5bfc\u8bba",
        description: "\u4e8c\u5206\u67e5\u627e",
        category: "book",
        tags: ["algo"],
        favoritesCount: 1,
        averageRating: 4.2
      }),
      buildMaterial({
        id: "material-2",
        ownerUserId: "user-2",
        ownerName: "Bob",
        title: "\u7ebf\u6027\u4ee3\u6570",
        description: "\u77e9\u9635\u8fd0\u7b97",
        category: "course",
        tags: ["math"],
        favoritesCount: 0,
        averageRating: 3.9,
        createdAt: "2026-06-03T12:00:00Z",
        updatedAt: "2026-06-03T12:00:00Z"
      })
    ]);
  });

  it("renders the shared loading state while the first material sync is still pending", () => {
    listMaterialsMock.mockImplementationOnce(() => new Promise(() => undefined));

    render(
      <MemoryRouter>
        <MaterialsPage session={null} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 2, name: "\u6b63\u5728\u540c\u6b65\u8d44\u6599\u5e93" })).toBeInTheDocument();
    expect(screen.getByText("\u8bf7\u7a0d\u5019\uff0c\u6b63\u5728\u52a0\u8f7d\u6700\u65b0\u53ef\u6d4f\u89c8\u8d44\u6599\u4e0e\u5f53\u524d\u7b5b\u9009\u4e0a\u4e0b\u6587\u3002")).toBeInTheDocument();
  });

  it("filters the material list through the shared search input", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MaterialsPage session={null} />
      </MemoryRouter>
    );

    await expect(screen.findAllByText("\u7b97\u6cd5\u5bfc\u8bba")).resolves.toSatisfy((items) => items.length >= 1);
    expect(screen.getByText("\u7ebf\u6027\u4ee3\u6570")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("\u6309\u6807\u9898\u3001\u5206\u7c7b\u6216\u63cf\u8ff0\u641c\u7d22"), "\u7ebf\u6027");

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /\u7b97\u6cd5\u5bfc\u8bba/ })).toBeNull();
    });
    expect(screen.getByRole("button", { name: /\u7ebf\u6027\u4ee3\u6570/ })).toBeInTheDocument();
  });

  it("keeps rendering the current materials while surfacing a shared stale state after a refresh failure", async () => {
    const user = userEvent.setup();
    listMaterialsMock
      .mockResolvedValueOnce([
        buildMaterial({
          id: "material-1",
          title: "\u7b97\u6cd5\u5bfc\u8bba",
          description: "\u4e8c\u5206\u67e5\u627e",
          category: "book",
          tags: ["algo"],
          favoritesCount: 1,
          averageRating: 4.2
        })
      ])
      .mockRejectedValueOnce(new Error("\u8d44\u6599\u5217\u8868\u5237\u65b0\u5931\u8d25"));

    const { container } = render(
      <MemoryRouter>
        <MaterialsPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findAllByText("\u7b97\u6cd5\u5bfc\u8bba")).resolves.toSatisfy((items) => items.length >= 1);

    const favoriteButton = container.querySelector('[data-material-action="favorite"]');
    expect(favoriteButton).not.toBeNull();

    await user.click(favoriteButton as HTMLButtonElement);

    await waitFor(() => {
      expect(toggleMaterialFavoriteMock).toHaveBeenCalledWith(session, "material-1");
    });
    expect(await screen.findByRole("heading", { level: 2, name: "\u8d44\u6599\u5217\u8868\u9700\u8981\u5237\u65b0" })).toBeInTheDocument();
    expect(screen.getByText("\u8d44\u6599\u5217\u8868\u5237\u65b0\u5931\u8d25")).toBeInTheDocument();
    expect(screen.getAllByText("\u7b97\u6cd5\u5bfc\u8bba").length).toBeGreaterThanOrEqual(1);
  });
});
