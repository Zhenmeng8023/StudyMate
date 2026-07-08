import { expect, test } from "@playwright/test";

const adminBaseUrl = process.env.PLAYWRIGHT_ADMIN_BASE_URL ?? `http://127.0.0.1:${process.env.PLAYWRIGHT_ADMIN_PORT ?? "44174"}`;

const adminSession = {
  accessToken: "admin-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-02T12:00:00Z",
  user: {
    id: "admin-1",
    username: "operator",
    email: "operator@example.test",
    displayName: "Operator",
    role: "admin"
  }
};

function success(data: unknown) {
  return JSON.stringify({ success: true, data });
}

test("admin governance page loads the users module with an admin session", async ({ page }) => {
  const usersRequests: Array<string | undefined> = [];

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.admin.session", JSON.stringify(storedSession));
  }, adminSession);

  await page.route("**/api/v1/admin/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: success(adminSession.user)
    });
  });
  await page.route("**/api/v1/admin/overview", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: success({
        userCount: 12,
        postCount: 4,
        materialCount: 5,
        graphCount: 6,
        pendingModerationCount: 1
      })
    });
  });
  await page.route("**/api/v1/admin/moderation", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: success([])
    });
  });
  await page.route("**/api/v1/admin/users**", async (route) => {
    usersRequests.push(route.request().headers().authorization);
    await route.fulfill({
      contentType: "application/json",
      body: success([
        {
          id: "user-1",
          username: "alice",
          email: "alice@example.test",
          role: "student",
          status: "active"
        }
      ])
    });
  });

  await page.goto(`${adminBaseUrl}/`);

  await expect(page.getByText("Operator")).toBeVisible();
  await page.locator('[data-admin-view="users"]').click();

  await expect(page.locator(".admin-table--records")).toContainText("alice");
  await expect.poll(() => usersRequests.length).toBe(1);
  expect(usersRequests[0]).toBe("Bearer admin-token");
});
