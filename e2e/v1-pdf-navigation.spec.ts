import { expect, test } from "@playwright/test";

function navigationPdf() {
  const page = (content: number) => `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 500 300] /Contents ${content} 0 R /Resources << /Font << /F1 9 0 R >> >> >>`;
  const stream = (text: string) => {
    const body = `BT /F1 20 Tf 45 190 Td (${text}) Tj ET\n`;
    return `<< /Length ${Buffer.byteLength(body)} >>\nstream\n${body}endstream`;
  };
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R /Outlines 10 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>",
    page(4), stream("Binary search basics"), page(6), stream("Memory model and references"), page(8), stream("Binary search review"),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Outlines /First 11 0 R /Last 13 0 R /Count 3 >>",
    "<< /Title (Chapter One) /Parent 10 0 R /Next 12 0 R /Dest [3 0 R /Fit] >>",
    "<< /Title (Chapter Two) /Parent 10 0 R /Prev 11 0 R /Next 13 0 R /Dest [5 0 R /Fit] >>",
    "<< /Title (Chapter Three) /Parent 10 0 R /Prev 12 0 R /Dest [7 0 R /Fit] >>"
  ];
  let output = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(output));
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(output);
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(output);
}

for (const width of [1280, 390]) {
test(`resumes a saved book, navigates its outline and finds text across pages at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const session = { accessToken: "navigation-access", refreshToken: "navigation-refresh", accessTokenExpiresAt: "2099-01-01", user: { id: "owner", username: "reader", displayName: "Reader", email: "reader@example.test", role: "student" } };
  await page.addInitScript((value) => localStorage.setItem("studymate.session", JSON.stringify(value)), session);
  let progress = { currentPage: 2, totalPages: 3, progressPercent: 67, lastReadAt: "2026-11-17T02:00:00Z" };
  const material = { id: "navigation-book", ownerUserId: "owner", ownerName: "Reader", title: "PDF 导航学习资料", description: "验证目录和文内检索的多页资料", category: "计算机", tags: ["导航"], folderName: "我的书单", libraryScope: "personal", status: "private", attachmentFileId: "pdf-file", attachmentName: "navigation.pdf", attachmentMime: "application/pdf", coverFileId: "", favoritesCount: 0, averageRating: 0, createdAt: "2026-11-17", updatedAt: "2026-11-17" };
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/api/v1", "");
    let data: unknown = [];
    if (path === "/auth/me") data = session.user;
    else if (path === "/files/storage") data = { usedBytes: 1000, quotaBytes: 1024 ** 3, remainingBytes: 1024 ** 3 - 1000, fileCount: 1, unlinkedFileCount: 0, unlinkedBytes: 0, unlinkedFiles: [] };
    else if (path === "/library/materials") data = [{ ...material, readingProgress: progress }];
    else if (path === "/library/materials/navigation-book") data = { ...material, readingProgress: progress };
    else if (path === "/library/materials/navigation-book/attachment") {
      expect(route.request().headers().authorization).toBe("Bearer navigation-access");
      return route.fulfill({ contentType: "application/pdf", body: navigationPdf() });
    } else if (path.startsWith("/materials/navigation-book/reader")) {
      if (path.endsWith("/progress")) progress = { ...progress, ...route.request().postDataJSON(), lastReadAt: "2026-11-17T03:00:00Z" };
      data = { materialId: material.id, ...progress, bookmarks: [], annotations: [] };
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data }) });
  });
  await page.goto("/library");
  await expect(page.getByRole("link", { name: "继续阅读" })).toHaveAttribute("href", "/reader/navigation-book?page=2");
  await expect(page.getByRole("progressbar", { name: "PDF 导航学习资料阅读进度" })).toHaveAttribute("value", "67");
  const cover = page.getByRole("img", { name: "PDF 首页封面" });
  await expect(cover).toBeVisible();
  expect(await cover.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
  await page.screenshot({ path: testInfo.outputPath(`pdf-cover-${width}.png`), fullPage: true });
  await page.getByRole("link", { name: "继续阅读" }).click();
  await expect(page.locator(".react-pdf__Page__textContent")).toContainText("Memory model");
  await page.getByRole("button", { name: "页面缩略图", exact: true }).click();
  const thumbnails = page.getByRole("region", { name: "页面缩略图" });
  await expect(thumbnails.locator("canvas")).toHaveCount(3);
  await expect(thumbnails.getByRole("button", { name: "预览第 2 页", exact: true })).toHaveAttribute("aria-current", "page");
  await thumbnails.getByRole("button", { name: "预览第 3 页", exact: true }).click();
  await expect(page.getByLabel("跳转页码")).toHaveValue("3");
  await expect(page.locator(".react-pdf__Page__textContent")).toContainText("Binary search review");
  await page.screenshot({ path: testInfo.outputPath(`pdf-thumbnails-${width}.png`), fullPage: true });
  await page.getByRole("button", { name: "关闭页面缩略图" }).click();
  await expect(thumbnails).toHaveCount(0);
  // Remaining assertions use the reader's visible outline and search controls.
  await page.getByRole("button", { name: "PDF 目录", exact: true }).click();
  await page.getByRole("button", { name: /Chapter One/ }).click();
  await expect(page.getByLabel("跳转页码")).toHaveValue("1");
  await page.getByRole("button", { name: "文内查找", exact: true }).click();
  await page.getByLabel("查找内容").fill("binary search");
  await page.getByRole("button", { name: "开始查找", exact: true }).click();
  await expect(page.getByText(/已检索 3 \/ 3 页 · 2 处匹配/)).toBeVisible();
  await page.getByRole("button", { name: "第 3 页，第 2 处匹配" }).click();
  await expect(page.getByLabel("跳转页码")).toHaveValue("3");
  await expect(page.locator(".react-pdf__Page__textContent mark").first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath(`pdf-search-${width}.png`), fullPage: true });
  await expect.poll(() => progress.currentPage).toBe(3);
  await page.goto("/library");
  await expect(page.getByRole("progressbar", { name: "PDF 导航学习资料阅读进度" })).toHaveAttribute("value", "100");
  await expect(page.getByRole("link", { name: "继续阅读" })).toHaveAttribute("href", "/reader/navigation-book?page=3");
  await page.screenshot({ path: testInfo.outputPath(`shelf-progress-${width}.png`), fullPage: true });
});
}
