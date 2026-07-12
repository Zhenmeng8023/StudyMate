import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listPosts } from "../api/client";
import { CommunityPage } from "./CommunityPage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    listPosts: vi.fn()
  };
});

const listPostsMock = vi.mocked(listPosts);

describe("CommunityPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listPostsMock.mockReset();
    listPostsMock.mockResolvedValue([]);
  });

  it("renders the shared loading state while community posts are bootstrapping", async () => {
    listPostsMock.mockReturnValue(new Promise(() => {}) as Promise<never>);

    render(
      <MemoryRouter>
        <CommunityPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "正在加载社区动态" })).toBeInTheDocument();
  });

  it("renders the shared error state when community posts fail to load", async () => {
    listPostsMock.mockRejectedValueOnce(new Error("社区动态加载失败"));

    render(
      <MemoryRouter>
        <CommunityPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "社区动态暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("社区动态加载失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新加载" })).toBeInTheDocument();
  });

  it("keeps rendering the current feed while surfacing a shared stale state after refresh fails", async () => {
    listPostsMock
      .mockResolvedValueOnce([
        {
          id: "post-1",
          title: "图谱学习记录",
          body: "记录一次图谱整理回顾",
          kind: "article",
          status: "published",
          authorUserId: "user-1",
          authorName: "Alice",
          likesCount: 3,
          favoritesCount: 2,
          commentsCount: 1,
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ])
      .mockRejectedValueOnce(new Error("社区动态刷新失败"));

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CommunityPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("图谱学习记录")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "刷新社区动态" }));

    expect(await screen.findByRole("heading", { level: 2, name: "社区动态需要刷新" })).toBeInTheDocument();
    expect(screen.getByText("社区动态刷新失败")).toBeInTheDocument();
    expect(screen.getByText("图谱学习记录")).toBeInTheDocument();
  });
});
