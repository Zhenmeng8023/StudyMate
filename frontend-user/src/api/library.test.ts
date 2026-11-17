import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSession, MaterialPayload } from "./types";
import { collectOfficialMaterial, createLibraryMaterial, getMaterialAttachmentUrl, listLibraryMaterials, listOfficialMaterials, uncollectOfficialMaterial, downloadLibraryMaterial } from "./library";

const session = { accessToken: "library-token", refreshToken: "refresh-token", user: { id: "owner" } } as AuthSession;
afterEach(() => vi.restoreAllMocks());

describe("library API boundaries", () => {
  it("keeps private uploads, public official browsing and idempotent collection separate", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] }), { headers: { "Content-Type": "application/json" } }));
    // Each request must receive an unconsumed response.
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ success: true, data: [] })));
    await listLibraryMaterials(session);
    await listOfficialMaterials();
    await createLibraryMaterial(session, { title: "My PDF", description: "Private reading material", category: "book", tags: ["math"], attachmentFileId: "file-1", folderName: "数学" });
    await collectOfficialMaterial(session, "official/1");
    await uncollectOfficialMaterial(session, "official/1");
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["/api/v1/library/materials", "/api/v1/official-materials", "/api/v1/library/materials", "/api/v1/library/collections/official%2F1", "/api/v1/library/collections/official%2F1"]);
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: "Bearer library-token" });
    expect(fetchMock.mock.calls[1][1]?.headers).not.toHaveProperty("Authorization");
    expect(fetchMock.mock.calls[3][1]?.method).toBe("PUT");
    expect(fetchMock.mock.calls[4][1]?.method).toBe("DELETE");
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body))).toMatchObject({ attachmentFileId: "file-1", folderName: "数学" });
  });

  it("never puts access tokens in attachment URLs", () => {
    expect(getMaterialAttachmentUrl("private/1")).toBe("/api/v1/library/materials/private%2F1/attachment");
    expect(getMaterialAttachmentUrl("private/1", true)).toBe("/api/v1/library/materials/private%2F1/attachment?download=1");
  });

  it("surfaces denied file downloads instead of saving an error as a document", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "不能读取其他用户的资料" } }), { status: 403 }));
    await expect(downloadLibraryMaterial(session, { id: "private-1" } as MaterialPayload)).rejects.toThrow("不能读取其他用户的资料");
  });
});
