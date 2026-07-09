import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, buildApiPath, createAuthHeaders, createSessionRequest, requestApi } from "./index";

function apiPayload<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("@studymate/api-client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates bearer auth headers only when a token exists", () => {
    expect(createAuthHeaders("access-token")).toEqual({ Authorization: "Bearer access-token" });
    expect(createAuthHeaders("")).toEqual({});
    expect(createAuthHeaders(null)).toEqual({});
  });

  it("builds query strings for shared api paths and skips empty values", () => {
    expect(
      buildApiPath("/api/v1/search", {
        q: "knowledge graph",
        types: ["note", "graph"],
        limit: 10,
        cursor: undefined,
        archived: null
      })
    ).toBe("/api/v1/search?q=knowledge+graph&types=note%2Cgraph&limit=10");

    expect(
      buildApiPath("/api/v1/admin/users?sort=recent", {
        limit: 20,
        filters: []
      })
    ).toBe("/api/v1/admin/users?sort=recent&limit=20");
  });

  it("serializes plain object bodies with json content type and unwraps the API success envelope", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(apiPayload({ ok: true }));

    await expect(
      requestApi<{ ok: boolean }>("/api/v1/test", {
        method: "POST",
        body: { hello: "world" }
      })
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ hello: "world" })
      })
    );
  });

  it("preserves form uploads without forcing json content type and surfaces api errors", async () => {
    const formData = new FormData();
    formData.set("file", new Blob(["study"]));

    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(apiPayload({ uploaded: true }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, error: { code: "bad_request", message: "璇锋眰澶辫触" } }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
      );

    await requestApi<{ uploaded: boolean }>("/api/v1/upload", {
      method: "POST",
      body: formData
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/v1/upload",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          "Content-Type": expect.anything()
        })
      })
    );

    await expect(requestApi("/api/v1/fail")).rejects.toThrow("璇锋眰澶辫触");
  });
  it("refreshes an expired session only once and retries concurrent requests with the new access token", async () => {
    const refreshedSession = {
      accessToken: "fresh-token",
      refreshToken: "fresh-refresh-token"
    };
    let currentSession = {
      accessToken: "stale-token",
      refreshToken: "refresh-token"
    };
    const persistSession = vi.fn((nextSession: typeof currentSession | null) => {
      currentSession = nextSession ?? currentSession;
    });
    const refreshSession = vi.fn(async () => refreshedSession);
    const requestWithSession = createSessionRequest({
      getSession: () => currentSession,
      persistSession,
      refreshSession
    });

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path !== "/api/v1/protected") {
        throw new Error(`Unexpected path: ${path}`);
      }

      if (authorization === "Bearer stale-token") {
        return new Response(JSON.stringify({ success: false, error: { code: "token_expired", message: "会话已过期" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (authorization === "Bearer fresh-token") {
        return apiPayload({ ok: true });
      }

      throw new Error(`Unexpected auth header: ${authorization}`);
    });

    await expect(
      Promise.all([
        requestWithSession<{ ok: boolean }>("/api/v1/protected"),
        requestWithSession<{ ok: boolean }>("/api/v1/protected")
      ])
    ).resolves.toEqual([{ ok: true }, { ok: true }]);

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(persistSession).toHaveBeenCalledWith(refreshedSession);
  });

  it("records refresh failure details before clearing the persisted session", async () => {
    const currentSession = {
      accessToken: "stale-token",
      refreshToken: "refresh-token"
    };
    const persistSession = vi.fn();
    const onSessionInvalidated = vi.fn();
    const refreshSession = vi.fn(async () => {
      throw new ApiRequestError("刷新令牌已失效", 401, "refresh_expired");
    });
    const requestWithSession = createSessionRequest({
      getSession: () => currentSession,
      persistSession,
      refreshSession,
      onSessionInvalidated
    });

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path !== "/api/v1/protected") {
        throw new Error(`Unexpected path: ${path}`);
      }

      if (authorization === "Bearer stale-token") {
        return new Response(JSON.stringify({ success: false, error: { code: "token_expired", message: "访问令牌已过期" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      throw new Error(`Unexpected auth header: ${authorization}`);
    });

    await expect(requestWithSession("/api/v1/protected")).rejects.toThrow("刷新令牌已失效");

    expect(onSessionInvalidated).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "refresh_failed",
        code: "refresh_expired",
        message: "刷新令牌已失效",
        status: 401
      })
    );
    expect(persistSession).toHaveBeenCalledWith(null);
  });
  it("clears the persisted session immediately when the backend rejects the current account", async () => {
    const currentSession = {
      accessToken: "disabled-token",
      refreshToken: "refresh-token"
    };
    const persistSession = vi.fn();
    const onSessionInvalidated = vi.fn();
    const refreshSession = vi.fn(async () => {
      throw new Error("refresh should not run");
    });
    const requestWithSession = createSessionRequest({
      getSession: () => currentSession,
      persistSession,
      refreshSession,
      onSessionInvalidated
    });

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path !== "/api/v1/protected") {
        throw new Error(`Unexpected path: ${path}`);
      }

      if (authorization === "Bearer disabled-token") {
        return new Response(JSON.stringify({ success: false, error: { code: "user_disabled", message: "褰撳墠璐﹀彿宸茶绂佺敤" } }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }

      throw new Error(`Unexpected auth header: ${authorization}`);
    });

    await expect(requestWithSession("/api/v1/protected")).rejects.toThrow("褰撳墠璐﹀彿宸茶绂佺敤");

    expect(refreshSession).not.toHaveBeenCalled();
    expect(onSessionInvalidated).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "session_rejected",
        code: "user_disabled",
        message: "褰撳墠璐﹀彿宸茶绂佺敤",
        status: 403
      })
    );
    expect(persistSession).toHaveBeenCalledWith(null);
  });
});
