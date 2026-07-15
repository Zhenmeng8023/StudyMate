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
    displayName: "Student",
    role: "user"
  }
};

function renderShell(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppShell onLogout={vi.fn()} session={session}>
        <div>workspace child</div>
      </AppShell>
    </MemoryRouter>
  );
}

afterEach(cleanup);

describe("AppShell", () => {
  it("uses primary navigation and the global command bar on standard pages", () => {
    const { container } = renderShell("/");

    expect(container.querySelector('[data-layout-mode="standard"]')).toBeInTheDocument();
    expect(container.querySelector(".primary-sidebar")).toBeInTheDocument();
    expect(container.querySelector(".compact-navigation")).toBeNull();
    expect(container.querySelector(".topbar")).toBeInTheDocument();
  });

  it("uses a compact shell for graph canvas routes without the global command bar", () => {
    const { container } = renderShell("/graph");

    expect(container.querySelector('[data-layout-mode="canvas"]')).toBeInTheDocument();
    expect(container.querySelector(".compact-navigation")).toBeInTheDocument();
    expect(container.querySelector(".primary-sidebar")).toBeNull();
    expect(container.querySelector(".topbar")).toBeNull();
  });

  it("uses a compact shell for reading and notes", () => {
    const { container } = renderShell("/reader/material-1");

    expect(container.querySelector('[data-layout-mode="studio"]')).toBeInTheDocument();
    expect(container.querySelector(".compact-navigation")).toBeInTheDocument();
    expect(container.querySelector(".topbar")).toBeInTheDocument();
  });

  it("removes persistent side navigation and the global command bar in focus mode", () => {
    const { container } = renderShell("/review");

    expect(container.querySelector('[data-layout-mode="focus"]')).toBeInTheDocument();
    expect(container.querySelector(".primary-sidebar")).toBeNull();
    expect(container.querySelector(".compact-navigation")).toBeNull();
    expect(container.querySelector(".topbar")).toBeNull();
    expect(screen.getByText("workspace child")).toBeInTheDocument();
  });
});
