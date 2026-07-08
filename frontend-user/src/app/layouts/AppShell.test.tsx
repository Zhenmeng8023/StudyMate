import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/client";
import { AppShell } from "./AppShell";

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-07-03T00:00:00Z",
  user: {
    id: "user-1",
    username: "student",
    email: "student@example.com",
    displayName: "学习者",
    role: "user"
  }
};

function renderShell(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppShell onLogout={vi.fn()} session={session}>
        <div>页面内容</div>
      </AppShell>
    </MemoryRouter>
  );
}

afterEach(cleanup);

describe("AppShell", () => {
  it("uses focused navigation and a page command bar on standard pages", () => {
    const { container } = renderShell("/");

    expect(container.querySelector('[data-layout-mode="standard"]')).toBeInTheDocument();
    expect(screen.getByLabelText("主导航")).toBeInTheDocument();
    expect(screen.getByText("学习概览")).toBeInTheDocument();
    expect(screen.getByLabelText("搜索资料、笔记或图谱")).toBeInTheDocument();
  });

  it("uses a compact shell for graph canvas routes and removes the global context panel", () => {
    const { container } = renderShell("/graph");

    expect(container.querySelector('[data-layout-mode="canvas"]')).toBeInTheDocument();
    expect(screen.getByLabelText("紧凑主导航")).toBeInTheDocument();
    expect(screen.queryByText("学习工作台")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("搜索资料、笔记或图谱")).not.toBeInTheDocument();
  });

  it("uses a compact shell for reading and notes", () => {
    const { container } = renderShell("/reader/material-1");

    expect(container.querySelector('[data-layout-mode="studio"]')).toBeInTheDocument();
    expect(screen.getByLabelText("紧凑主导航")).toBeInTheDocument();
    expect(screen.getByLabelText("搜索资料、笔记或图谱")).toBeInTheDocument();
  });

  it("removes persistent side navigation in focus mode", () => {
    const { container } = renderShell("/review");

    expect(container.querySelector('[data-layout-mode="focus"]')).toBeInTheDocument();
    expect(screen.queryByLabelText("主导航")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("紧凑主导航")).not.toBeInTheDocument();
    expect(screen.getByText("结束复习")).toBeInTheDocument();
  });
});
