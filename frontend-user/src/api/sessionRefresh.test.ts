import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSessionInvalidation, persistSession, readSession, readSessionInvalidation } from "../app/sessionStore";
import { listGraphs } from "./graphs";
import type { AuthSession, GraphSummaryPayload } from "./types";

const staleSession: AuthSession = {
  accessToken: "stale-access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-07-09T04:30:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const refreshedSession: AuthSession = {
  ...staleSession,
  accessToken: "fresh-access-token",
  refreshToken: "fresh-refresh-token",
  accessTokenExpiresAt: "2026-07-09T05:30:00Z"
};

function apiPayload<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

function apiError(status: number, code: string, message: string) {
  return new Response(JSON.stringify({ success: false, error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

describe("frontend-user session refresh flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearSessionInvalidation();
    persistSession(null);
  });

  it("refreshes the persisted session and retries graph requests after a 401 response", async () => {
    const graphs: GraphSummaryPayload[] = [
      {
        id: "graph-1",
        ownerUserId: "user-1",
        title: "知识图谱",
        description: "图谱摘要",
        visibility: "private",
        status: "active",
        graphType: "knowledge",
        mode: "workspace",
        currentVersion: 3,
        nodeCount: 5,
        edgeCount: 4,
        createdAt: "2026-07-09T04:00:00Z",
        updatedAt: "2026-07-09T04:10:00Z"
      }
    ];

    persistSession(staleSession);

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path === "/api/v1/graphs") {
        if (authorization === "Bearer stale-access-token") {
          return apiError(401, "token_expired", "访问令牌已过期");
        }

        if (authorization === "Bearer fresh-access-token") {
          return apiPayload(graphs);
        }
      }

      if (path === "/api/v1/auth/refresh") {
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toEqual({
          refreshToken: "refresh-token"
        });
        return apiPayload(refreshedSession);
      }

      throw new Error(`Unexpected request: ${path} ${authorization}`);
    });

    await expect(listGraphs(staleSession)).resolves.toEqual(graphs);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(readSession()).toEqual(refreshedSession);
  });

  it("records a forced logout reason when refresh fails and clears the persisted session", async () => {
    persistSession(staleSession);

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path === "/api/v1/graphs") {
        if (authorization === "Bearer stale-access-token") {
          return apiError(401, "token_expired", "访问令牌已过期");
        }
      }

      if (path === "/api/v1/auth/refresh") {
        expect(init?.method).toBe("POST");
        return apiError(401, "refresh_expired", "刷新令牌已失效");
      }

      throw new Error(`Unexpected request: ${path} ${authorization}`);
    });

    await expect(listGraphs(staleSession)).rejects.toThrow("刷新令牌已失效");

    expect(readSession()).toBeNull();
    expect(readSessionInvalidation()).toEqual(
      expect.objectContaining({
        kind: "refresh_failed",
        code: "refresh_expired",
        message: "刷新令牌已失效",
        status: 401
      })
    );
  });
  it("clears the persisted session immediately when a protected request returns user_disabled", async () => {
    persistSession(staleSession);

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path === "/api/v1/graphs") {
        expect(authorization).toBe("Bearer stale-access-token");
        return apiError(403, "user_disabled", "褰撳墠璐﹀彿宸茶绂佺敤");
      }

      if (path === "/api/v1/auth/refresh") {
        throw new Error("refresh should not run");
      }

      throw new Error(`Unexpected request: ${path} ${authorization}`);
    });

    await expect(listGraphs(staleSession)).rejects.toThrow("褰撳墠璐﹀彿宸茶绂佺敤");

    expect(readSession()).toBeNull();
    expect(readSessionInvalidation()).toEqual(
      expect.objectContaining({
        kind: "session_rejected",
        code: "user_disabled",
        message: "褰撳墠璐﹀彿宸茶绂佺敤",
        status: 403
      })
    );
  });
});
