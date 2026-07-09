import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listMaterials } from "../api/client";
import { MaterialsPage } from "./MaterialsPage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    listMaterials: vi.fn()
  };
});

const listMaterialsMock = vi.mocked(listMaterials);

describe("MaterialsPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listMaterialsMock.mockReset();
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
        attachmentFileId: "",
        attachmentName: "",
        attachmentMime: "",
        status: "approved",
        favoritesCount: 1,
        averageRating: 4.2,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "material-2",
        ownerUserId: "user-2",
        ownerName: "Bob",
        title: "线性代数",
        description: "矩阵运算",
        category: "course",
        tags: ["math"],
        coverFileId: "",
        attachmentFileId: "",
        attachmentName: "",
        attachmentMime: "",
        status: "approved",
        favoritesCount: 0,
        averageRating: 3.9,
        createdAt: "2026-06-03T12:00:00Z",
        updatedAt: "2026-06-03T12:00:00Z"
      }
    ]);
  });

  it("filters the material list through the shared search input", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MaterialsPage session={null} />
      </MemoryRouter>
    );

    await expect(screen.findAllByText("算法导论")).resolves.toSatisfy((items) => items.length >= 1);
    expect(screen.getByText("线性代数")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("按标题、分类或描述搜索"), "线性");

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /算法导论/ })).toBeNull();
    });
    expect(screen.getByRole("button", { name: /线性代数/ })).toBeInTheDocument();
  });
});
