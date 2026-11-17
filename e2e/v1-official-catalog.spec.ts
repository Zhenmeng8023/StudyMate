import { expect, test, type Page } from "@playwright/test";
import type { MaterialPayload } from "../frontend-user/src/api/types";

async function officialCatalog(page: Page, role = "student") {
  const session = { accessToken: "official-catalog-access", refreshToken: "refresh", accessTokenExpiresAt: "2099-01-01", user: { id: "catalog-user", username: "catalog", email: "catalog@example.test", displayName: "Catalog", role } };
  await page.addInitScript((value) => localStorage.setItem("studymate.session", JSON.stringify(value)), session);
  const items = Array.from({ length: 43 }, (_, index) => ({
    id: `official-${index + 1}`, ownerUserId: "admin", ownerName: "Admin", title: `资料 ${String(index + 1).padStart(3, "0")}`, description: "官方提供的学习资料，包含配套知识与阅读说明。",
    category: index % 2 ? "数学" : "计算机", tags: ["入门"], attachmentFileId: `file-${index}`, attachmentName: `book-${index}.pdf`, attachmentMime: "application/pdf",
    coverFileId: "", libraryScope: "official", folderName: "", status: "approved", favoritesCount: 0, averageRating: 0,
    author: index === 0 ? "StudyMate 教研组" : "官方作者", sourceUrl: "https://example.test/learning", publicationYear: 2026, edition: "第一版", materialType: "lecture", licenseStatus: "authorized", archiveReason: "",
    createdAt: "2026-11-17T00:00:00Z", updatedAt: "2026-11-17T00:00:00Z"
  } as MaterialPayload));
  const state = { items, queries: [] as string[], changes: [] as Array<{ id: string; status: string; reason?: string }>, created: null as Record<string, unknown> | null };
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request(); const url = new URL(request.url()); const path = url.pathname.replace("/api/v1", "");
    const ok = (data: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
    if (path === "/auth/me") return ok(session.user);
    if (path === "/files/storage") return ok({ usedBytes: 1000, quotaBytes: 1024 ** 3, remainingBytes: 1024 ** 3 - 1000, fileCount: 1, unlinkedFileCount: 0, unlinkedBytes: 0, unlinkedFiles: [] });
    if (path === "/library/materials") return ok([]);
    if (path === "/files" && request.method() === "POST") return ok({ id: "new-file", ownerUserId: session.user.id, originalName: "new.pdf", mimeType: "application/pdf", size: 100, path: "", createdAt: "2026-11-17" }, 201);
    if (path === "/official-materials" && request.method() === "POST") {
      state.created = request.postDataJSON();
      const item = { ...state.items[0], ...state.created, id: "official-new", ownerUserId: session.user.id } as MaterialPayload;
      state.items = [item, ...state.items]; return ok(item, 201);
    }
    if (path === "/official-materials" || path === "/official-materials/manage") {
      const managed = path.endsWith("/manage");
      if (managed) expect(request.headers().authorization).toBe(`Bearer ${session.accessToken}`);
      state.queries.push(url.pathname + url.search);
      const status = managed ? url.searchParams.get("status") || "all" : "approved";
      const base = state.items.filter((item) => status === "all" || item.status === status);
      const q = (url.searchParams.get("q") || "").toLowerCase();
      let filtered = base.filter((item) => !q || [item.title, item.author, item.description, item.attachmentName, ...(item.tags || [])].join(" ").toLowerCase().includes(q));
      const category = url.searchParams.get("category"); const kind = url.searchParams.get("materialType");
      if (category) filtered = filtered.filter((item) => item.category === category);
      if (kind) filtered = filtered.filter((item) => item.materialType === kind);
      if (url.searchParams.get("sort") === "title") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      const current = Number(url.searchParams.get("page") || 1); const size = Number(url.searchParams.get("pageSize") || 20);
      return ok({ items: filtered.slice((current - 1) * size, current * size), total: filtered.length, page: current, pageSize: size, categories: [...new Set(base.map((item) => item.category))].sort() });
    }
    const status = path.match(/^\/official-materials\/([^/]+)\/status$/);
    if (status) {
      const change = request.postDataJSON() as { status: string; reason?: string };
      state.changes.push({ id: status[1], ...change });
      state.items = state.items.map((item) => item.id === status[1] ? { ...item, status: change.status, archiveReason: change.status === "archived" ? change.reason || "" : "" } : item);
      return ok(state.items.find((item) => item.id === status[1]));
    }
    const detail = path.match(/^\/(?:library\/)?materials\/([^/]+)$/);
    if (detail) return ok(state.items.find((item) => item.id === detail[1]));
    return ok([]);
  });
  return state;
}

for (const width of [1280, 390]) {
  test(`official catalog filters, paginates and shows provenance at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const state = await officialCatalog(page);
    await page.goto("/official-materials");
    await expect(page.locator(".library-file-row")).toHaveCount(20);
    await expect(page.getByText("共 43 份资料 · 第 1 / 3 页")).toBeVisible();
    const detail = page.getByRole("region", { name: "资料详情" });
    await expect(detail).toContainText("StudyMate 教研组");
    await expect(detail.getByRole("link", { name: /来源|example/ })).toHaveAttribute("href", "https://example.test/learning");
    await expect(page.getByRole("button", { name: "管理官方资料" })).toHaveCount(0);
    await page.getByRole("button", { name: "下一页资料" }).click();
    await expect(page.getByText("共 43 份资料 · 第 2 / 3 页")).toBeVisible();
    await expect(page.locator(".library-file-row").first()).toContainText("资料 021");
    await page.getByLabel("分类筛选").selectOption("数学");
    await expect(page.getByText("共 21 份资料 · 第 1 / 2 页")).toBeVisible();
    await page.getByLabel("分类筛选").selectOption("");
    await page.getByLabel("类型筛选").selectOption("lecture");
    await page.getByLabel("资料排序").selectOption("title");
    await page.getByLabel("搜索官方资料").fill("StudyMate 教研组");
    await expect(page.locator(".library-file-row")).toHaveCount(1);
    await expect(detail).toContainText("资料 001");
    expect(state.queries.some((query) => query.includes("page=2"))).toBe(true);
    expect(state.queries.some((query) => query.includes("sort=title"))).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`official-catalog-${width}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto("/official-materials?selected=official-42");
    await expect(page.getByRole("region", { name: "资料详情" }).getByRole("heading", { name: "资料 042", exact: true })).toBeVisible();
  });
}

for (const width of [1280, 390]) {
test(`official managers record metadata, take a resource down and restore its identity at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const state = await officialCatalog(page, "admin");
  await page.goto("/official-materials");
  await page.getByRole("button", { name: "发布官方资料", exact: true }).click();
  await page.getByLabel("选择文件", { exact: true }).setInputFiles({ name: "new-guide.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n") });
  await page.getByLabel("资料类型", { exact: true }).selectOption("book");
  await page.getByLabel("作者／机构", { exact: true }).fill("学习中心");
  await page.getByLabel("来源链接", { exact: true }).fill("https://example.test/guide");
  await page.getByLabel("出版年份", { exact: true }).fill("2026");
  await page.getByLabel("版本说明", { exact: true }).fill("2026 修订版");
  await page.getByLabel("授权状态", { exact: true }).selectOption("authorized");
  await page.getByRole("button", { name: "确认发布", exact: true }).click();
  await expect(page.getByRole("heading", { name: "new-guide", exact: true })).toBeVisible();
  expect(state.created).toMatchObject({ author: "学习中心", sourceUrl: "https://example.test/guide", publicationYear: 2026, edition: "2026 修订版", materialType: "book", licenseStatus: "authorized" });
  await page.getByRole("button", { name: "下架官方资料", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("下架原因", { exact: true }).fill("勘误核查，暂时下架");
  await dialog.getByRole("button", { name: "确认下架", exact: true }).click();
  await expect.poll(() => state.changes).toEqual([{ id: "official-new", status: "archived", reason: "勘误核查，暂时下架" }]);
  await page.getByRole("button", { name: "管理官方资料", exact: true }).click();
  await page.getByLabel("发布状态筛选").selectOption("archived");
  await expect(page.getByRole("region", { name: "资料详情" })).toContainText("勘误核查，暂时下架");
  await page.screenshot({ path: testInfo.outputPath("official-manage-archived.png"), fullPage: true });
  await page.getByRole("button", { name: "重新上架", exact: true }).click();
  await dialog.getByRole("button", { name: "确认重新上架", exact: true }).click();
  await expect.poll(() => state.items.find((item) => item.id === "official-new")?.status).toBe("approved");
  await page.getByRole("button", { name: "返回公开目录", exact: true }).click();
  await expect(page.getByRole("heading", { name: "new-guide", exact: true })).toBeVisible();
});
}
