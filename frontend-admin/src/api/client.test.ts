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
      adminGet<{ id: string }[]>("/api/v1/admin/users?limit=20", { accessToken: "admin-token" })
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
});
