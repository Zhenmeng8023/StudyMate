import { afterEach, describe, expect, it, vi } from "vitest";
import { createAuthHeaders, requestApi } from "./index";

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

  it("adds json content type and unwraps the API success envelope", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(apiPayload({ ok: true }));

    await expect(
      requestApi<{ ok: boolean }>("/api/v1/test", {
        method: "POST",
        body: JSON.stringify({ hello: "world" })
      })
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        })
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
});
