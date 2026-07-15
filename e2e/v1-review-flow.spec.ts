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

test("review page can jump back to a graph focus preview for graph-sourced cards", async ({ page }) => {
  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.session", JSON.stringify(storedSession));
  }, session);

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/api/v1/auth/me") {
      await route.fulfill({
        contentType: "application/json",
        body: success(session.user)
      });
      return;
    }

    if (url.pathname === "/api/v1/decks/deck-1/cards") {
      await route.fulfill({
        contentType: "application/json",
        body: success([
          {
            id: "card-graph-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Binary tree traversal",
            back: "Visit left subtree before right subtree.",
            sourceType: "graph",
            sourceId: "node-1",
            sourceMetadata: {
              graphId: "graph-1",
              focusX: 420,
              focusY: 320,
              focusWidth: 220,
              focusHeight: 120,
              focusLabel: "Binary Tree"
            },
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        ])
      });
      return;
    }

    if (url.pathname === "/api/v1/decks") {
      await route.fulfill({
        contentType: "application/json",
        body: success([
          {
            id: "deck-1",
            ownerUserId: "user-1",
            title: "Graph Deck",
            description: "graph sourced review cards",
            visibility: "private",
            cardCount: 1,
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        ])
      });
      return;
    }

    if (url.pathname === "/api/v1/review/today") {
      await route.fulfill({
        contentType: "application/json",
        body: success({
          dueCount: 1,
          items: [
            {
              deckTitle: "Graph Deck",
              card: {
                id: "card-graph-1",
                deckId: "deck-1",
                ownerUserId: "user-1",
                cardType: "basic",
                front: "Binary tree traversal",
                back: "Visit left subtree before right subtree.",
                sourceType: "graph",
                sourceId: "node-1",
                sourceMetadata: {
                  graphId: "graph-1",
                  focusX: 420,
                  focusY: 320,
                  focusWidth: 220,
                  focusHeight: 120,
                  focusLabel: "Binary Tree"
                },
                status: "active",
                createdAt: "2026-06-02T12:00:00Z",
                updatedAt: "2026-06-02T12:00:00Z"
              },
              schedule: {
                cardId: "card-graph-1",
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
      return;
    }

    if (url.pathname === "/api/v1/graphs/graph-1") {
      await route.fulfill({
        contentType: "application/json",
        body: success({
          id: "graph-1",
          ownerUserId: "user-1",
          title: "Graph backlink demo",
          description: "focus preview from review workspace",
          visibility: "private",
          status: "active",
          graphType: "knowledge",
          mode: "free",
          currentVersion: 3,
          nodeCount: 1,
          edgeCount: 0,
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z",
          document: {
            graphId: "graph-1",
            version: 3,
            schemaVersion: 1,
            viewport: { x: 140, y: 120, zoom: 1 },
            nodes: [
              {
                id: "node-1",
                type: "concept",
                title: "Binary Tree",
                x: 420,
                y: 320,
                width: 220,
                height: 120,
                source: null,
                metadata: {}
              }
            ],
            edges: [],
            groups: [],
            theme: {},
            metadata: {}
          }
        })
      });
      return;
    }

    if (url.pathname === "/api/v1/graphs/graph-1/snapshots") {
      await route.fulfill({
        contentType: "application/json",
        body: success([])
      });
      return;
    }

    if (url.pathname === "/api/v1/graphs") {
      await route.fulfill({
        contentType: "application/json",
        body: success([
          {
            id: "graph-1",
            ownerUserId: "user-1",
            title: "Graph backlink demo",
            description: "focus preview from review workspace",
            visibility: "private",
            status: "active",
            graphType: "knowledge",
            mode: "free",
            currentVersion: 3,
            nodeCount: 1,
            edgeCount: 0,
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z",
            document: {
              graphId: "graph-1",
              version: 3,
              schemaVersion: 1,
              viewport: { x: 140, y: 120, zoom: 1 },
              nodes: [],
              edges: [],
              groups: [],
              theme: {},
              metadata: {}
            }
          }
        ])
      });
      return;
    }

    if (url.pathname === "/api/v1/review/feedback") {
      await route.fulfill({
        contentType: "application/json",
        body: success({
          dueCount: 0,
          learningCount: 0,
          weakCardCount: 0,
          weakCards: [],
          sourceSummaries: [],
          weakSources: []
        })
      });
      return;
    }

    if (url.pathname === "/api/v1/diagram/templates") {
      await route.fulfill({
        contentType: "application/json",
        body: success([])
      });
      return;
    }

    if (["/api/v1/materials", "/api/v1/notes"].includes(url.pathname)) {
      await route.fulfill({
        contentType: "application/json",
        body: success([])
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: success({})
    });
  });

  await page.goto("/review?card=card-graph-1");

  const backlink = page.locator(
    'a[href="/graph?graphId=graph-1&focusX=420&focusY=320&focusWidth=220&focusHeight=120&focusLabel=Binary+Tree"]'
  );
  await expect(backlink.first()).toBeVisible();

  await backlink.first().click();

  await expect(page).toHaveURL(/\/graph$/);
  await expect(page.getByText("Graph backlink demo")).toBeVisible();
  await expect(page.locator(".graph-focus-preview")).toContainText("Binary Tree");
});

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
  await page.getByRole("button", { name: "开始复习" }).click();

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
