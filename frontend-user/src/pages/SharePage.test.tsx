import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveShareLink } from "../api/client";
import { SharePage } from "./SharePage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    resolveShareLink: vi.fn()
  };
});

const resolveShareLinkMock = vi.mocked(resolveShareLink);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/share/share-token"]}>
      <Routes>
        <Route element={<SharePage />} path="/share/:token" />
      </Routes>
    </MemoryRouter>
  );
}

describe("SharePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resolveShareLinkMock.mockReset();
    resolveShareLinkMock.mockResolvedValue({
      title: "图谱分享",
      summary: "一份只读图谱分享。",
      mode: "public",
      targetType: "graph",
      url: "/graph?selected=graph-1"
    } as never);
  });

  it("renders the shared loading state while resolving the share link", async () => {
    resolveShareLinkMock.mockReturnValue(new Promise(() => {}) as Promise<never>);

    renderPage();

    expect(await screen.findByRole("heading", { level: 2, name: "正在读取分享内容" })).toBeInTheDocument();
  });

  it("renders the shared error state when resolving the share link fails", async () => {
    resolveShareLinkMock.mockRejectedValueOnce(new Error("分享链接不可用"));

    renderPage();

    expect(await screen.findByRole("heading", { level: 2, name: "分享内容暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("分享链接不可用")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新加载" })).toBeInTheDocument();
  });

  it("retries resolving the share link from the shared error state", async () => {
    resolveShareLinkMock
      .mockRejectedValueOnce(new Error("第一次读取分享失败"))
      .mockResolvedValueOnce({
        title: "图谱分享",
        summary: "一份只读图谱分享。",
        mode: "public",
        targetType: "graph",
        url: "/graph?selected=graph-1"
      } as never);

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole("heading", { level: 2, name: "分享内容暂时不可用" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重新加载" }));

    expect(await screen.findByRole("link", { name: "打开原始页面" })).toBeInTheDocument();
  });
});
