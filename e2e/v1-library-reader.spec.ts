import { expect, test, type Page, type Route } from "@playwright/test";
import type { MaterialPayload, NotePayload, ReaderAnnotationPayload, ReaderStatePayload } from "../frontend-user/src/api/types";

const session = {
  accessToken: "library-access-token", refreshToken: "library-refresh-token", accessTokenExpiresAt: "2099-11-16T12:00:00Z",
  user: { id: "user-1", username: "alice", email: "alice@example.test", displayName: "Alice", role: "student" }
};

// Build a valid single-page PDF with a text layer and exact xref offsets.
function buildSamplePdf() {
  const content = "BT /F1 24 Tf 50 120 Td (StudyMate PDF) Tj ET\n";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}
const samplePdf = buildSamplePdf();

function material(overrides: Partial<MaterialPayload> = {}): MaterialPayload {
  return {
    id: "private-1", ownerUserId: session.user.id, ownerName: "Alice", title: "个人课程讲义", description: "用于验证个人知识库阅读与批注的课程讲义",
    category: "讲义", tags: ["学习"], coverFileId: "", attachmentFileId: "file-1", attachmentName: "lecture.pdf", attachmentMime: "application/pdf",
    status: "private", favoritesCount: 0, averageRating: 0, createdAt: "2026-11-16T12:00:00Z", updatedAt: "2026-11-16T12:00:00Z",
    libraryScope: "personal", folderName: "课程学习", ...overrides
  };
}

async function signedIn(page: Page, admin = false) {
  await page.addInitScript((stored) => window.localStorage.setItem("studymate.session", JSON.stringify(stored)), {
    ...session, user: { ...session.user, role: admin ? "admin" : "student" }
  });
}

async function success(route: Route, data: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
}

async function mockLibrary(page: Page, initial: MaterialPayload[] = []) {
  const state = {
    personal: [...initial], official: [material({ id: "official-1", ownerUserId: "admin-1", title: "官方学习指南", libraryScope: "official", status: "approved", folderName: "" })],
    collected: new Set<string>(), annotations: new Map<string, ReaderAnnotationPayload[]>(), notes: [] as NotePayload[],
    uploadAuthorization: "", createRequest: null as Record<string, unknown> | null,
    annotationRequest: null as Record<string, unknown> | null, noteRequest: null as Record<string, unknown> | null,
    attachmentAuthorizations: [] as string[], deletedOfficialIds: [] as string[],
    storage: { usedBytes: initial.length * samplePdf.length, quotaBytes: 1024 ** 3, remainingBytes: 1024 ** 3 - initial.length * samplePdf.length, fileCount: initial.length, unlinkedFileCount: 0, unlinkedBytes: 0, unlinkedFiles: [] as Array<{ id: string; originalName: string; size: number; createdAt: string }> }
  };
  const reading = (id: string): ReaderStatePayload => ({
    materialId: id, currentPage: 1, totalPages: 1, progressPercent: 100, bookmarks: [], lastReadAt: "2026-11-16T12:00:00Z", annotations: state.annotations.get(id) || []
  });

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");
    const method = request.method();
    if (path === "/auth/me") return success(route, session.user);
    if (path === "/files/storage") {
      expect(request.headers().authorization).toBe(`Bearer ${session.accessToken}`);
      return success(route, state.storage);
    }
    if (path === "/files" && method === "POST") {
      state.uploadAuthorization = request.headers().authorization || "";
      if (state.storage.remainingBytes < samplePdf.length) return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "storage_quota_exceeded", message: "个人存储空间不足，请检查已上传文件或联系管理员调整配额" } }) });
      state.storage.usedBytes += samplePdf.length;
      state.storage.remainingBytes -= samplePdf.length;
      state.storage.fileCount++;
      return success(route, { id: "uploaded-file", ownerUserId: session.user.id, originalName: "lecture.pdf", mimeType: "application/pdf", size: samplePdf.length, path: "", createdAt: "2026-11-16T12:00:00Z" }, 201);
    }
    if (path === "/library/materials") {
      if (method === "POST") {
        state.createRequest = request.postDataJSON();
        const created = material({ ...(state.createRequest as Partial<MaterialPayload>), id: "private-1" });
        state.personal = [...state.personal, created];
        return success(route, created, 201);
      }
      return success(route, [...state.personal, ...state.official.filter((item) => item.status === "approved" && state.collected.has(item.id)).map((item) => ({ ...item, isCollected: true }))]);
    }
    if (path === "/official-materials") {
      if (method === "POST") {
        const created = material({ ...request.postDataJSON(), id: "official-new", libraryScope: "official", status: "approved" });
        state.official = [...state.official, created];
        return success(route, created, 201);
      }
      const items = state.official.filter((item) => item.status === "approved");
      return success(route, url.searchParams.has("page") ? { items, total: items.length, page: Number(url.searchParams.get("page") || 1), pageSize: Number(url.searchParams.get("pageSize") || 20), categories: [...new Set(items.map((item) => item.category))] } : items);
    }
    if (path === "/official-materials/manage") {
      const status = url.searchParams.get("status") || "all";
      const items = state.official.filter((item) => status === "all" || item.status === status);
      return success(route, { items, total: items.length, page: 1, pageSize: 20, categories: [...new Set(items.map((item) => item.category))] });
    }
    const versions = path.match(/^\/official-materials\/(?:manage\/)?([^/]+)\/versions$/);
    if (versions) {
      const item = state.official.find((candidate) => candidate.id === versions[1]);
      return success(route, { items: item ? [{ id: item.id, title: item.title, edition: item.edition || "", status: item.status, changeSummary: "", createdAt: item.createdAt }] : [], currentMaterialId: versions[1], latestPublishedId: item?.status === "approved" ? item.id : "" });
    }
    const transition = path.match(/^\/official-materials\/([^/]+)\/status$/);
    if (transition && method === "PUT") {
      const change = request.postDataJSON() as { status: string; reason?: string };
      if (change.status === "archived") state.deletedOfficialIds.push(transition[1]);
      state.official = state.official.map((item) => item.id === transition[1] ? { ...item, status: change.status, archiveReason: change.reason || "" } : item);
      return success(route, state.official.find((item) => item.id === transition[1]));
    }
    const collection = path.match(/^\/library\/collections\/([^/]+)$/);
    if (collection) {
      if (method === "PUT") state.collected.add(collection[1]);
      if (method === "DELETE") state.collected.delete(collection[1]);
      return success(route, { message: "ok" });
    }
    const official = path.match(/^\/official-materials\/([^/]+)$/);
    if (official && method === "DELETE") {
      state.deletedOfficialIds.push(official[1]);
      state.official = state.official.filter((item) => item.id !== official[1]);
      return success(route, { message: "已下架" });
    }
    const attachment = path.match(/^\/(?:library\/)?materials\/([^/]+)\/attachment$/);
    if (attachment) {
      state.attachmentAuthorizations.push(request.headers().authorization || "");
      const item = [...state.personal, ...state.official].find((candidate) => candidate.id === attachment[1]);
      return route.fulfill({
        contentType: item?.attachmentMime || "application/pdf",
        headers: { "Content-Disposition": `${url.searchParams.has("download") ? "attachment" : "inline"}; filename="${item?.attachmentName || "lecture.pdf"}"` },
        body: item?.attachmentName.endsWith(".docx") ? Buffer.from("word-original-content") : samplePdf
      });
    }
    const reader = path.match(/^\/materials\/([^/]+)\/reader(?:\/(annotations|progress))?$/);
    if (reader) {
      if (reader[2] === "annotations" && method === "POST") {
        state.annotationRequest = request.postDataJSON();
        const annotation = { ...state.annotationRequest, id: "annotation-1", materialId: reader[1], createdAt: "2026-11-16T12:00:00Z", updatedAt: "2026-11-16T12:00:00Z" } as ReaderAnnotationPayload;
        state.annotations.set(reader[1], [annotation]);
        return success(route, annotation, 201);
      }
      return success(route, reader[2] === "progress" ? { ...reading(reader[1]), ...request.postDataJSON() } : reading(reader[1]));
    }
    const detail = path.match(/^\/library\/materials\/([^/]+)$/);
    if (detail) return success(route, [...state.personal, ...state.official].find((item) => item.id === detail[1]));
    if (path === "/notes" && method === "POST") {
      state.noteRequest = request.postDataJSON();
      const note = { ...state.noteRequest, id: "note-1", ownerUserId: session.user.id, versionNumber: 1, createdAt: "2026-11-16T12:00:00Z", updatedAt: "2026-11-16T12:00:00Z" } as NotePayload;
      state.notes = [note];
      return success(route, note, 201);
    }
    if (path === "/notes") return success(route, state.notes);
    if (path === "/materials" || path === "/decks" || /^\/notes\/[^/]+\/versions$/.test(path)) return success(route, []);
    return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "unexpected_test_route", message: path } }) });
  });
  return state;
}

test("private PDF upload opens the real reader, saves geometric highlights and excerpts into notes", async ({ page }, testInfo) => {
  const pdfErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error" || /PDF|worker/.test(message.text())) pdfErrors.push(message.text()); });
  await signedIn(page);
  const state = await mockLibrary(page);
  await page.goto("/library");
  await page.getByRole("button", { name: "上传资料", exact: true }).click();
  await page.getByLabel("选择文件", { exact: true }).setInputFiles({ name: "lecture.pdf", mimeType: "application/pdf", buffer: samplePdf });
  await page.getByRole("button", { name: "上传并保存" }).click();
  await expect.poll(() => state.createRequest).toMatchObject({ title: "lecture", attachmentFileId: "uploaded-file" });
  expect(state.uploadAuthorization).toBe(`Bearer ${session.accessToken}`);
  await expect(page.getByRole("link", { name: "开始阅读" })).toHaveAttribute("href", "/reader/private-1");
  const headerBox = await page.locator(".library-workspace-header").boundingBox();
  const listBox = await page.getByRole("region", { name: "个人资料列表" }).boundingBox();
  expect(listBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
  await page.screenshot({ path: testInfo.outputPath("personal-library.png"), fullPage: true });
  await page.getByRole("link", { name: "开始阅读" }).click();

  const text = page.locator(".react-pdf__Page__textContent span").filter({ hasText: "StudyMate PDF" }).first();
  try { await expect(text).toBeVisible(); }
  catch (error) {
    await testInfo.attach("pdf-browser-errors", { body: pdfErrors.join("\n"), contentType: "text/plain" });
    throw error;
  }
  await text.evaluate((span) => {
    const textNode = span.firstChild;
    if (!textNode) throw new Error("PDF text layer has no selectable text");
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 9);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    span.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });
  await page.getByLabel("批注内容", { exact: true }).fill("这段内容需要记住");
  await page.getByLabel("高亮颜色").selectOption("green");
  await page.getByRole("button", { name: "保存批注", exact: true }).click();
  await expect.poll(() => state.annotationRequest).toMatchObject({ page: 1, quote: "StudyMate", color: "green", comment: "这段内容需要记住" });
  const rects = state.annotationRequest!.rects as Array<{ page: number; x: number; y: number; width: number; height: number }>;
  expect(rects.length).toBeGreaterThan(0);
  for (const rect of rects) {
    expect(rect.page).toBe(1);
    expect(rect.x).toBeGreaterThan(0);
    expect(rect.y).toBeGreaterThan(0);
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
    expect(rect.width).toBeLessThan(1);
    expect(rect.x + rect.width).toBeLessThanOrEqual(1);
    expect(rect.y + rect.height).toBeLessThanOrEqual(1);
  }
  await expect(page.getByTestId("pdf-highlight-annotation-1-0")).toBeVisible();
  await page.goto("/reader/private-1?page=1&annotation=annotation-1");
  const highlight = page.getByTestId("pdf-highlight-annotation-1-0");
  await expect(highlight).toBeVisible();
  await expect(highlight).toHaveClass(/pdf-highlight--focused/);
  const beforeZoom = await highlight.boundingBox();
  await page.getByRole("button", { name: "放大", exact: true }).click();
  await expect.poll(async () => (await highlight.boundingBox())?.width || 0).toBeGreaterThan(beforeZoom!.width);
  const normalizedLeft = await highlight.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const parent = element.parentElement!.getBoundingClientRect();
    return (box.left - parent.left) / parent.width;
  });
  expect(normalizedLeft).toBeCloseTo(rects[0].x, 2);
  const selectedTextBox = await page.locator(".react-pdf__Page__textContent span").filter({ hasText: "StudyMate PDF" }).first().evaluate((span) => {
    const range = document.createRange();
    range.setStart(span.firstChild!, 0);
    range.setEnd(span.firstChild!, 9);
    const box = range.getBoundingClientRect();
    return { left: box.left, top: box.top, width: box.width, height: box.height };
  });
  const restoredBox = (await highlight.boundingBox())!;
  expect(Math.abs(restoredBox.x - selectedTextBox.left)).toBeLessThan(2);
  expect(Math.abs(restoredBox.y - selectedTextBox.top)).toBeLessThan(2);
  expect(Math.abs(restoredBox.width - selectedTextBox.width)).toBeLessThan(2);
  await page.screenshot({ path: testInfo.outputPath("reader-highlight.png"), fullPage: true });

  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载原文件", exact: true }).click();
  expect((await downloaded).suggestedFilename()).toBe("lecture.pdf");
  expect(state.attachmentAuthorizations.every((header) => header === `Bearer ${session.accessToken}`)).toBe(true);
  await page.getByRole("link", { name: "摘录到笔记" }).click();
  await expect(page.getByLabel("笔记标题", { exact: true })).toHaveValue("第 1 页阅读摘录");
  await expect(page.locator(".tiptap-editor")).toContainText("StudyMate");
  await expect(page.locator(".tiptap-editor")).toContainText("这段内容需要记住");
  await page.locator(".notes-commandbar").getByRole("button", { name: "创建笔记", exact: true }).click();
  await expect.poll(() => state.noteRequest).toMatchObject({ materialId: "private-1", title: "第 1 页阅读摘录" });
  expect(state.noteRequest!.content).toContain("annotation=annotation-1");
});

test("official documents collect into the personal library and removal preserves the official original", async ({ page }, testInfo) => {
  await signedIn(page);
  const state = await mockLibrary(page);
  await page.goto("/official-materials");
  await expect(page.locator(".library-document-detail").getByRole("heading", { name: "官方学习指南" })).toBeVisible();
  await expect(page.getByRole("button", { name: "发布官方资料", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "加入个人知识库" }).click();
  await expect.poll(() => state.collected.has("official-1")).toBe(true);
  await page.getByRole("link", { name: "我的知识库", exact: true }).click();
  await expect(page.locator(".library-document-detail").getByRole("heading", { name: "官方学习指南" })).toBeVisible();
  await expect(page.getByRole("button", { name: "删除资料", exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("official-collection.png"), fullPage: true });
  await page.getByRole("button", { name: "移出个人知识库", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "确认移出" }).click();
  await expect.poll(() => state.collected.has("official-1")).toBe(false);
  expect(state.official).toHaveLength(1);
  await page.getByRole("link", { name: "浏览官方资料" }).click();
  await expect(page.getByRole("heading", { name: "官方学习指南" })).toBeVisible();
  await expect(page.getByRole("button", { name: "加入个人知识库" })).toBeVisible();
});

test("official documents are publicly browsable with an original download and a login gate for collecting", async ({ page }) => {
  const state = await mockLibrary(page);
  await page.goto("/official-materials");
  await expect(page.getByRole("heading", { name: "官方学习指南" })).toBeVisible();
  await expect(page.getByRole("link", { name: "登录后加入知识库" })).toHaveAttribute("href", "/login");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("link", { name: "下载原文件", exact: true }).click();
  expect((await downloaded).suggestedFilename()).toBe("lecture.pdf");
  expect(state.attachmentAuthorizations).toEqual([""]);
  expect(state.collected.size).toBe(0);
});

test("Word documents download as originals without attempting an unsupported inline preview", async ({ page }) => {
  await signedIn(page);
  await mockLibrary(page, [material({ attachmentName: "lecture.docx", attachmentMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })]);
  await page.goto("/library");
  await expect(page.getByText("Word 文件暂不支持在线预览，请下载原文件查看。", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "开始阅读", exact: true })).toHaveCount(0);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载原文件", exact: true }).click();
  expect((await downloaded).suggestedFilename()).toBe("lecture.docx");
  await page.goto("/reader/private-1");
  await expect(page.getByText("此文件暂不支持在线预览", { exact: true })).toBeVisible();
  await expect(page.locator("iframe, .react-pdf__Document")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "保存批注", exact: true })).toBeDisabled();
});

test("administrators publish official files and explicitly confirm taking them down", async ({ page }) => {
  await signedIn(page, true);
  const state = await mockLibrary(page);
  await page.goto("/official-materials");
  await page.getByRole("button", { name: "发布官方资料", exact: true }).click();
  await page.getByLabel("选择文件", { exact: true }).setInputFiles({ name: "official-guide.pdf", mimeType: "application/pdf", buffer: samplePdf });
  await page.getByRole("button", { name: "确认发布", exact: true }).click();
  await expect(page.getByRole("heading", { name: "official-guide", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "下架官方资料", exact: true }).click();
  expect(state.deletedOfficialIds).toHaveLength(0);
  await page.getByRole("dialog").getByLabel("下架原因", { exact: true }).fill("官方资料内容修订");
  await page.getByRole("dialog").getByRole("button", { name: "确认下架", exact: true }).click();
  await expect.poll(() => state.deletedOfficialIds).toEqual(["official-new"]);
  await expect(page.getByRole("heading", { name: "official-guide", exact: true })).toHaveCount(0);
});

test("new uploads reject Word and renamed files without sending them to the server", async ({ page }) => {
  await signedIn(page);
  const state = await mockLibrary(page);
  await page.goto("/library");
  await page.getByRole("button", { name: "上传资料", exact: true }).click();
  await expect(page.getByLabel("选择文件")).toHaveAttribute("accept", ".pdf,application/pdf");
  for (const name of ["lecture.docx", "fake.pdf"]) {
    await page.getByLabel("选择文件").setInputFiles({ name, mimeType: "application/pdf", buffer: Buffer.from("not a PDF") });
    await page.getByRole("button", { name: "上传并保存" }).click();
    await expect(page.getByRole("alert")).toContainText("PDF");
    expect(state.uploadAuthorization).toBe("");
    expect(state.createRequest).toBeNull();
  }
});

for (const width of [1280, 390]) {
  test(`storage usage, unlinked review and exhausted upload remain clear at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await signedIn(page);
    const state = await mockLibrary(page, [material()]);
    state.storage = { usedBytes: 1024 ** 3, quotaBytes: 1024 ** 3, remainingBytes: 0, fileCount: 23, unlinkedFileCount: 21, unlinkedBytes: 1024, unlinkedFiles: [{ id: "pending", originalName: "尚未关联的讲义.pdf", size: 1024, createdAt: "2026-11-17T00:00:00Z" }] };
    await page.goto("/library");
    await expect(page.getByRole("progressbar", { name: "存储空间使用率" })).toHaveAttribute("value", "100");
    await expect(page.getByText(/容量已用尽/)).toBeVisible();
    const storage = page.getByRole("region", { name: "存储空间" });
    await storage.locator("summary").click();
    await expect(storage.getByText("尚未关联的讲义.pdf")).toBeVisible();
    await expect(storage.getByText(/旧链接/)).toBeVisible();
    await expect(storage.getByRole("button", { name: /删除|清理/ })).toHaveCount(0);
    await page.getByRole("button", { name: "上传资料", exact: true }).click();
    await page.getByLabel("选择文件").setInputFiles({ name: "new-book.pdf", mimeType: "application/pdf", buffer: samplePdf });
    await page.getByRole("button", { name: "上传并保存" }).click();
    await expect(page.getByRole("alert")).toHaveText(/个人存储空间不足/);
    await expect(page.getByLabel("资料标题")).toHaveValue("new-book");
    expect(state.createRequest).toBeNull();
    await page.screenshot({ path: testInfo.outputPath(`storage-quota-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "取消", exact: true }).click();
    state.storage = { ...state.storage, usedBytes: 512 * 1024 ** 2, remainingBytes: 512 * 1024 ** 2 };
    await page.getByRole("button", { name: "刷新容量" }).click();
    await expect(page.getByRole("progressbar", { name: "存储空间使用率" })).toHaveAttribute("value", "50");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

for (const width of [1440, 1024, 768, 390]) {
  test(`bookshelf previews stay readable at ${width}px with keyboard and hover`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await signedIn(page);
    await mockLibrary(page, Array.from({ length: 8 }, (_, index) => material({
      id: `book-${index}`, title: ["算法与数据结构", "线性代数学习笔记", "深入理解计算机系统", "概率论与数理统计"][index % 4],
      description: `第 ${index + 1} 本资料的阅读内容与学习要点。`, attachmentName: `book-${index}.pdf`, folderName: "我的阅读书单", tags: ["学习", "收藏"]
    })));
    await page.goto("/library");
    const covers = page.locator(".library-book-cover");
    await expect(covers).toHaveCount(8);
    await expect(page.getByRole("progressbar", { name: "存储空间使用率" })).toBeVisible();
    await page.mouse.move(0, 0);
    await covers.first().scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await covers.first().hover();
    const preview = page.getByRole("tooltip");
    await expect(preview).toContainText("book-0.pdf");
    await expect(preview).toContainText("我的阅读书单");
    await expect(preview).toHaveCSS("opacity", "1");
    const box = (await preview.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`bookshelf-${width}.png`) });
    await page.keyboard.press("Escape");
    await expect(preview).toHaveCount(0);
    await covers.nth(1).focus();
    await expect(preview).toContainText("book-1.pdf");
    await covers.nth(1).press("Enter");
    await expect(page.getByRole("link", { name: "开始阅读" })).toHaveAttribute("href", "/reader/book-1");
  });
}
