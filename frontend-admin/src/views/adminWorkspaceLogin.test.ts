import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceLogin } from "./adminWorkspaceLogin";

describe("adminWorkspaceLogin", () => {
  it("clears transient login state, runs bootstrap, and publishes the success notice in order", async () => {
    const steps: string[] = [];

    await runAdminWorkspaceLogin("users", {
      bootstrap: vi.fn(async (view: string) => {
        steps.push(`bootstrap:${view}`);
      }),
      clearError: vi.fn(() => {
        steps.push("clear-error");
      }),
      clearSessionInvalidation: vi.fn(() => {
        steps.push("clear-invalidation");
      }),
      fallbackMessage: "管理员登录失败",
      getSuccessNotice: vi.fn(() => {
        steps.push("success-notice");
        return "已进入管理后台。";
      }),
      resolveErrorMessage: vi.fn(() => {
        steps.push("resolve-error");
        return "unexpected";
      }),
      setError: vi.fn((message: string) => {
        steps.push(`error:${message}`);
      }),
      setLoading: vi.fn((nextLoading: boolean) => {
        steps.push(`loading:${nextLoading}`);
      }),
      setNotice: vi.fn((notice: string) => {
        steps.push(`notice:${notice}`);
      })
    });

    expect(steps).toEqual([
      "loading:true",
      "clear-error",
      "clear-invalidation",
      "bootstrap:users",
      "success-notice",
      "notice:已进入管理后台。",
      "loading:false"
    ]);
  });

  it("resolves the fallback error message and skips the success notice when bootstrap fails", async () => {
    const steps: string[] = [];
    const failure = new Error("network");

    await runAdminWorkspaceLogin("dashboard", {
      bootstrap: vi.fn(async () => {
        steps.push("bootstrap");
        throw failure;
      }),
      clearError: vi.fn(() => {
        steps.push("clear-error");
      }),
      clearSessionInvalidation: vi.fn(() => {
        steps.push("clear-invalidation");
      }),
      fallbackMessage: "管理员登录失败",
      getSuccessNotice: vi.fn(() => {
        steps.push("success-notice");
        return "unexpected";
      }),
      resolveErrorMessage: vi.fn((error: unknown, fallbackMessage: string) => {
        steps.push(`resolve-error:${fallbackMessage}`);
        expect(error).toBe(failure);
        return "管理员登录失败";
      }),
      setError: vi.fn((message: string) => {
        steps.push(`error:${message}`);
      }),
      setLoading: vi.fn((nextLoading: boolean) => {
        steps.push(`loading:${nextLoading}`);
      }),
      setNotice: vi.fn((notice: string) => {
        steps.push(`notice:${notice}`);
      })
    });

    expect(steps).toEqual([
      "loading:true",
      "clear-error",
      "clear-invalidation",
      "bootstrap",
      "resolve-error:管理员登录失败",
      "error:管理员登录失败",
      "loading:false"
    ]);
  });
});
