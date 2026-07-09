import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { clearSessionInvalidation, persistSession, recordSessionInvalidation } from "../app/sessionStore";
import { LoginPage } from "./AuthPages";

describe("LoginPage session invalidation prompt", () => {
  afterEach(() => {
    cleanup();
    clearSessionInvalidation();
    persistSession(null);
    vi.restoreAllMocks();
  });

  it("shows a relogin prompt after the shared session store records a forced logout", () => {
    recordSessionInvalidation({
      kind: "refresh_failed",
      code: "refresh_expired",
      message: "刷新令牌已失效",
      status: 401,
      occurredAt: "2026-07-09T05:20:00.000Z"
    });

    render(
      <MemoryRouter>
        <LoginPage onLogin={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("当前登录状态已失效，请重新登录后继续学习。")).toBeInTheDocument();
  });
  it("shows a disabled-account prompt when the shared session store records user_disabled", () => {
    recordSessionInvalidation({
      kind: "session_rejected",
      code: "user_disabled",
      message: "褰撳墠璐﹀彿宸茶绂佺敤",
      status: 403,
      occurredAt: "2026-07-09T12:48:00.000Z"
    });

    render(
      <MemoryRouter>
        <LoginPage onLogin={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("当前账号已被禁用，请联系管理员后重新登录。")).toBeInTheDocument();
  });
});
