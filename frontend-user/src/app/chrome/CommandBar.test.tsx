// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/client";
import { CommandBar } from "./CommandBar";

vi.mock("../../design-system/primitives", () => ({
  CommandBar: (props: {
    actions?: React.ReactNode;
    crumb: string;
    modeLabel?: string;
    search?: React.ReactNode;
    subtitle?: string;
    title: string;
  }) => (
    <div data-testid="shared-command-bar">
      <span>{props.modeLabel}</span>
      <span>{props.crumb}</span>
      <h1>{props.title}</h1>
      {props.subtitle ? <p>{props.subtitle}</p> : null}
      {props.search}
      {props.actions}
    </div>
  ),
  IconButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />
}));

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

describe("CommandBar wrapper", () => {
  it("renders through the shared command bar contract", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <CommandBar
          mode="standard"
          onLogout={() => undefined}
          onSearchSubmit={(event) => event.preventDefault()}
          onSearchTextChange={() => undefined}
          searchText="图谱"
          session={session}
          showSearch
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("shared-command-bar")).toBeTruthy();
    expect(screen.getByText("学习空间")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "学习概览" })).toBeTruthy();
    expect(screen.getByRole("search")).toBeTruthy();
    expect(screen.getByText("AI 草稿")).toBeTruthy();
  });
});
