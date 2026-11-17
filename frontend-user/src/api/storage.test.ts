import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "./types";
import { getStorageUsage } from "./storage";
afterEach(() => vi.restoreAllMocks());
describe("storage API", () => {
  it("reads only the current account with authentication and no user ID parameter", async () => {
    const data = { usedBytes: 10, quotaBytes: 100, remainingBytes: 90, fileCount: 1, unlinkedFileCount: 1, unlinkedBytes: 10, unlinkedFiles: [{ id: "f", originalName: "paper.pdf", size: 10, createdAt: "2026-11-17" }] };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data })));
    await expect(getStorageUsage({ accessToken: "storage-token", user: { id: "owner" } } as AuthSession)).resolves.toEqual(data);
    expect(fetch).toHaveBeenCalledWith("/api/v1/files/storage", expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer storage-token" }) }));
  });
  it("rejects malformed statistics instead of displaying zero usage", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] })));
    await expect(getStorageUsage({ accessToken: "token" } as AuthSession)).rejects.toThrow("容量数据");
  });
});
