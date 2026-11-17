import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/types";
import { listOfficialCatalog, listManagedOfficialCatalog, transitionOfficialMaterial } from "../../api/library";
afterEach(() => vi.restoreAllMocks());
describe("official catalog contract", () => {
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
