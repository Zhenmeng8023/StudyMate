import { expect, test } from "@playwright/test";

test("user app shell loads the public workspace", async ({ page }) => {
  await page.route("**/api/v1/materials**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [] })
    });
  });
  await page.route("**/api/v1/posts**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [] })
    });
  });

  await page.goto("/");

  await expect(page.getByLabel("继续学习")).toBeVisible();
  await expect(page.getByRole("link", { name: "打开资料库" })).toBeVisible();
});
