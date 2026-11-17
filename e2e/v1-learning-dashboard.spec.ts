import { expect, test } from "@playwright/test";

const session = {
  accessToken: "access-token", refreshToken: "refresh-token", accessTokenExpiresAt: "2099-01-01T00:00:00Z",
  user: { id: "user-1", username: "alice", email: "alice@example.test", displayName: "Alice", role: "student" }
};

test("dashboard stays usable when the AI draft API returns null without Mongo", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((value) => localStorage.setItem("studymate.session", JSON.stringify(value)), session);
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const reply = (data: unknown) => route.fulfill({ json: { success: true, data } });
    if (path === "/api/v1/auth/me") return reply(session.user);
    if (path === "/api/v1/ai/drafts") return reply(null);
    if (path === "/api/v1/review/today") return reply({ dueCount: 0, items: [] });
    if (path === "/api/v1/review/feedback") return reply({ dueCount: 0, learningCount: 0, weakCardCount: 0, weakCards: [], sourceSummaries: [], weakSources: [] });
    if (path === "/api/v1/review/insights") return reply({ days: [], sourceTrends: [] });
    return reply([]);
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "今日学习状态", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "还没有 AI 草稿", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "打开 AI 工作台", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

for (const viewport of [{ name: "narrow", width: 390, height: 844 }, { name: "desktop", width: 1440, height: 1000 }]) {
  test(`daily learning history remains readable on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript((value) => localStorage.setItem("studymate.session", JSON.stringify(value)), session);
    await page.route("**/api/v1/**", async (route) => {
      const url = new URL(route.request().url());
      const reply = (data: unknown) => route.fulfill({ json: { success: true, data } });
      if (url.pathname === "/api/v1/auth/me") return reply(session.user);
      if (url.pathname === "/api/v1/review/today") return reply({ dueCount: 3, reviewedCount: 5, items: [] });
      if (url.pathname === "/api/v1/review/feedback") return reply({ dueCount: 3, learningCount: 2, weakCardCount: 0,
        weakCards: [], weakSources: [], sourceSummaries: [] });
      if (url.pathname === "/api/v1/review/insights") return reply({
        days: Array.from({ length: 7 }, (_, index) => ({ date: `2026-11-${10 + index}`, reviewCount: index + 1,
          ratingCounts: { again: 1, hard: 0, good: index, easy: 0 }, weakNewCount: index === 0 ? 1 : 0, weakCarryCount: index > 0 ? 1 : 0 })),
        sourceTrends: []
      });
      return reply([]);
    });
    await page.goto("/");
    const table = page.getByRole("table", { name: "最近七天每日学习记录" });
    await expect(table).toBeVisible();
    await expect(table.getByRole("row")).toHaveCount(8);
    await expect(page.getByText("今日待复习 3", { exact: true })).toBeVisible();
    const status = page.getByRole("region", { name: "今日学习状态", exact: true });
    const statusBox = await status.boundingBox();
    const headingBox = await status.getByRole("heading", { name: "今日学习状态", exact: true }).boundingBox();
    expect(statusBox).not.toBeNull();
    expect(headingBox).not.toBeNull();
    expect(headingBox!.width).toBeGreaterThan(200);
    expect(headingBox!.height).toBeLessThan(70);
    for (const label of ["今日待复习 3", "学习中 2", "薄弱来源 0", "已掌握来源 0"]) {
      const metricBox = await status.getByText(label, { exact: true }).boundingBox();
      expect(metricBox).not.toBeNull();
      expect(metricBox!.width).toBeGreaterThan(90);
      expect(metricBox!.x).toBeGreaterThanOrEqual(statusBox!.x);
      expect(metricBox!.x + metricBox!.width).toBeLessThanOrEqual(statusBox!.x + statusBox!.width);
      expect(metricBox!.height).toBeLessThan(70);
    }
    const region = page.getByRole("region", { name: "每日学习记录，可横向滚动" });
    await region.scrollIntoViewIfNeeded();
    await region.focus();
    await expect(region).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (viewport.name === "narrow") {
      expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
      await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
      expect(await region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    }
    await page.screenshot({ path: `test-results/learning-dashboard-${viewport.name}.png`, fullPage: true });
  });
}
