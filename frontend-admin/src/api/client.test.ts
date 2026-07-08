import { afterEach, describe, expect, it, vi } from "vitest";
import { adminGet, adminPost } from "./client";

function apiPayload<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("frontend-admin shared api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds bearer auth headers for admin get requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(apiPayload([{ id: "user-1" }]));

    await expect(
      adminGet<{ id: string }[]>("/api/v1/admin/users", { accessToken: "admin-token" }, { limit: 20 })
    ).resolves.toEqual([{ id: "user-1" }]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/users?limit=20",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
  });

  it("serializes admin post request bodies through the shared api client", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(apiPayload({ status: "approved" }));

    await expect(
      adminPost<{ status: string }>(
        "/api/v1/admin/moderation/posts/post-1/approve",
        { reason: "" },
        { accessToken: "admin-token" }
      )
    ).resolves.toEqual({ status: "approved" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/moderation/posts/post-1/approve",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ reason: "" })
      })
    );
  });

  it("refreshes an expired admin session and retries the request with the new access token", async () => {
    const session = {
      accessToken: "stale-admin-token",
      refreshToken: "refresh-token"
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path === "/api/v1/admin/users?limit=20") {
        if (authorization === "Bearer stale-admin-token") {
          return new Response(
            JSON.stringify({ success: false, error: { code: "token_expired", message: "访问令牌已过期" } }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }

        if (authorization === "Bearer fresh-admin-token") {
          return apiPayload([{ id: "user-1" }]);
        }
      }

      if (path === "/api/v1/auth/refresh") {
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toEqual({
          refreshToken: "refresh-token"
        });

        return apiPayload({
          accessToken: "fresh-admin-token",
          refreshToken: "fresh-refresh-token"
        });
      }

      throw new Error(`Unexpected request: ${path} ${authorization}`);
    });

    await expect(adminGet<{ id: string }[]>("/api/v1/admin/users", session, { limit: 20 })).resolves.toEqual([{ id: "user-1" }]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
