import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listMaterials, listNotes, listPosts } from "../api/client";
import type { AuthSession } from "../api/client";
import { DashboardPage } from "./DashboardPage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    listMaterials: vi.fn(),
    listNotes: vi.fn(),
    listPosts: vi.fn()
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
const listNotesMock = vi.mocked(listNotes);
const listPostsMock = vi.mocked(listPosts);

describe("DashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listMaterialsMock.mockReset();
    listNotesMock.mockReset();
    listPostsMock.mockReset();

    listMaterialsMock.mockResolvedValue([]);
    listNotesMock.mockResolvedValue([]);
    listPostsMock.mockResolvedValue([]);
  });

  it("renders a shared loading state while recent materials are bootstrapping", async () => {
    listMaterialsMock.mockReturnValue(new Promise(() => {}) as Promise<never>);

    render(
      <MemoryRouter>
        <DashboardPage session={null} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "正在加载最近资料" })).toBeInTheDocument();
  });

  it("renders a shared error state when recent materials fail to load", async () => {
    listMaterialsMock.mockRejectedValueOnce(new Error("资料首页加载失败"));

    render(
      <MemoryRouter>
        <DashboardPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "最近资料暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("资料首页加载失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新加载" })).toBeInTheDocument();
  });

  it("renders a shared unauthorized state for personal notes when signed out", async () => {
    render(
      <MemoryRouter>
        <DashboardPage session={null} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "登录后查看个人笔记" })).toBeInTheDocument();
    expect(screen.getByText("登录后继续回到你最近的阅读笔记与整理上下文。")).toBeInTheDocument();
    expect(listNotesMock).not.toHaveBeenCalled();
  });
});
