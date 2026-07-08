import { expect, test } from "@playwright/test";

const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-02T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

function success(data: unknown) {
  return JSON.stringify({ success: true, data });
}

test("review page completes a due-card writeback with an authenticated session", async ({ page }) => {
  const reviewRequests: Array<{ authorization: string | undefined; body: unknown }> = [];

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.session", JSON.stringify(storedSession));
  }, session);

  await page.route("**/api/v1/decks/deck-1/cards", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: success([
        {
          id: "card-1",
          deckId: "deck-1",
          ownerUserId: "user-1",
          cardType: "basic",
          front: "Graph concept?",
          back: "Nodes and relationships.",
          status: "active",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ])
    });
  });
  await page.route("**/api/v1/decks", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: success([
        {
          id: "deck-1",
          ownerUserId: "user-1",
          title: "Release Deck",
          description: "v1 review cards",
          visibility: "private",
          cardCount: 1,
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ])
    });
  });
  await page.route("**/api/v1/review/today", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: success({
        dueCount: 1,
        items: [
          {
            deckTitle: "Release Deck",
            card: {
              id: "card-1",
              deckId: "deck-1",
              ownerUserId: "user-1",
              cardType: "basic",
              front: "Graph concept?",
              back: "Nodes and relationships.",
              status: "active",
              createdAt: "2026-06-02T12:00:00Z",
              updatedAt: "2026-06-02T12:00:00Z"
            },
            schedule: {
              cardId: "card-1",
              userId: "user-1",
              dueAt: "2026-06-02T12:00:00Z",
              intervalDays: 0,
              easeFactor: 2.5,
              repetitionCount: 0,
              lapseCount: 0,
              state: "new",
              updatedAt: "2026-06-02T12:00:00Z"
            }
          }
        ]
      })
    });
  });
  await page.route("**/api/v1/cards/card-1/review", async (route) => {
    reviewRequests.push({
      authorization: route.request().headers().authorization,
      body: route.request().postDataJSON()
    });
    await route.fulfill({
      contentType: "application/json",
      body: success({
        reviewId: "review-1",
        schedule: {
          cardId: "card-1",
          userId: "user-1",
          dueAt: "2026-06-03T12:00:00Z",
          intervalDays: 1,
          easeFactor: 2.5,
          repetitionCount: 1,
          lapseCount: 0,
          state: "review",
          updatedAt: "2026-06-02T12:10:00Z"
        }
      })
    });
  });

  await page.goto("/review");

  await expect(page.getByLabel("复习卡片")).toContainText("Graph concept?");
  await expect(page.locator(".review-focus-card-meta")).toContainText("Release Deck");

  await page.getByRole("button", { name: "显示答案" }).click();
  await expect(page.getByText("Nodes and relationships.").first()).toBeVisible();

  await page.getByRole("button", { name: "Good 记得" }).click();

  await expect.poll(() => reviewRequests.length).toBe(1);
  expect(reviewRequests[0]).toMatchObject({
    authorization: "Bearer access-token",
    body: {
      rating: "good"
    }
  });
  await expect(page.getByLabel("复习卡片")).not.toContainText("Graph concept?");
});
