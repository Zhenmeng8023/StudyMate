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
});
