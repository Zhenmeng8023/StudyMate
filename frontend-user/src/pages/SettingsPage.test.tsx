import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getProfile, updateProfile } from "../api/client";
import type { AuthSession } from "../api/client";
import { SettingsPage } from "./SettingsPage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    getProfile: vi.fn(),
    updateProfile: vi.fn()
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

const getProfileMock = vi.mocked(getProfile);
const updateProfileMock = vi.mocked(updateProfile);

describe("SettingsPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getProfileMock.mockReset();
    updateProfileMock.mockReset();

    getProfileMock.mockResolvedValue({
      id: "user-1",
      username: "alice",
      email: "alice@example.test",
      displayName: "Alice",
      role: "student",
      createdAt: "2026-06-02T12:00:00Z"
    } as never);
  });

  it("renders the shared loading state while the profile is bootstrapping", async () => {
    getProfileMock.mockReturnValue(new Promise(() => {}) as Promise<never>);

    render(
      <MemoryRouter>
        <SettingsPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "正在加载个人资料" })).toBeInTheDocument();
  });

  it("renders the shared error state when loading the profile fails", async () => {
    getProfileMock.mockRejectedValueOnce(new Error("个人资料加载失败"));

    render(
      <MemoryRouter>
        <SettingsPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "个人资料暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("个人资料加载失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新加载" })).toBeInTheDocument();
  });

  it("retries loading the profile from the shared error state", async () => {
    getProfileMock
      .mockRejectedValueOnce(new Error("第一次加载失败"))
      .mockResolvedValueOnce({
        id: "user-1",
        username: "alice",
        email: "alice@example.test",
        displayName: "Alice",
        role: "student",
        createdAt: "2026-06-02T12:00:00Z"
      } as never);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "个人资料暂时不可用" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重新加载" }));

    expect(await screen.findByDisplayValue("Alice")).toBeInTheDocument();
  });
});
