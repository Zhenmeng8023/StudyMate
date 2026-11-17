import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/types";
import { listOfficialCatalog, listManagedOfficialCatalog, transitionOfficialMaterial, getOfficialVersions, getManagedOfficialVersions, createOfficialVersion, getManagedOfficialMaterial } from "../../api/library";
afterEach(() => vi.restoreAllMocks());
describe("official catalog contract", () => {
  it("keeps public history and administrator version publication on distinct authenticated routes", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ success: true, data: {} })));
    const session = { accessToken: "official-token", user: { id: "admin" } } as AuthSession;
    await getOfficialVersions("book/1");
    await getManagedOfficialVersions(session, "book/1");
    await createOfficialVersion(session, "book/1", { title: "新版官方资料", description: "更新后的官方学习资料说明", category: "讲义", tags: [], attachmentFileId: "new-file", changeSummary: "补充示例" });
    await getManagedOfficialMaterial(session, "book/1");
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(["/api/v1/official-materials/book%2F1/versions", "/api/v1/official-materials/manage/book%2F1/versions", "/api/v1/official-materials/book%2F1/versions", "/api/v1/official-materials/manage/book%2F1"]);
    expect(fetch.mock.calls[0][1]?.headers).not.toHaveProperty("Authorization");
    expect(fetch.mock.calls[1][1]?.headers).toMatchObject({ Authorization: "Bearer official-token" });
    expect(fetch.mock.calls[2][1]?.method).toBe("POST");
    expect(JSON.parse(String(fetch.mock.calls[2][1]?.body))).toMatchObject({ attachmentFileId: "new-file", changeSummary: "补充示例" });
  });
  it("encodes server filters and authenticates administration and state transitions", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ success: true, data: {} })));
    const session = { accessToken: "official-token", user: { id: "admin" } } as AuthSession;
    await listOfficialCatalog({ page: 2, pageSize: 20, q: "作者 A&B", category: "数学", sort: "title" });
    await listManagedOfficialCatalog(session, { page: 1, pageSize: 20, status: "archived" });
    await transitionOfficialMaterial(session, "book/1", { status: "archived", reason: "更新版本" });
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/official-materials?page=2&pageSize=20&q=%E4%BD%9C%E8%80%85+A%26B&category=%E6%95%B0%E5%AD%A6&sort=title");
    expect(fetch.mock.calls[1][0]).toBe("/api/v1/official-materials/manage?page=1&pageSize=20&status=archived");
    expect(fetch.mock.calls[1][1]?.headers).toMatchObject({ Authorization: "Bearer official-token" });
    expect(fetch.mock.calls[2][0]).toBe("/api/v1/official-materials/book%2F1/status");
    expect(JSON.parse(String(fetch.mock.calls[2][1]?.body))).toEqual({ status: "archived", reason: "更新版本" });
  });
});
