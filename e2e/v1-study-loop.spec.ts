import { expect, test } from "@playwright/test";

const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-07-17T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const samplePdf = Buffer.from(
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgMyAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDIwMCAyMDAgXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4+PiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDQ0ID4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgMTIwIFRkIChTdHVkeU1hdGUgUERGKSBUaiBFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE3IDAwMDAwIG4gCjAwMDAwMDAyNDMgMDAwMDAgbiAKMDAwMDAwMDMzNiAwMDAwMCBuIAp0cmFpbGVyCjw8IC9Sb290IDEgMCBSIC9TaXplIDYgPj4Kc3RhcnR4cmVmCjQyOQolJUVPRgo=",
  "base64"
);

function success(data: unknown) {
  return JSON.stringify({ success: true, data });
}

test("reader annotation drafts flow into review and dashboard feedback", async ({ page }) => {
  let createdCardNoteRequest: unknown = null;
  let reviewedCardRequest: unknown = null;
  let cardNoteCommitted = false;
  let reviewSubmitted = false;

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.session", JSON.stringify(storedSession));
  }, session);

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/api/v1/auth/me") {
      await route.fulfill({
        contentType: "application/json",
        body: success(session.user)
      });
      return;
    }

    if (url.pathname === "/api/v1/library/materials/material-1/attachment") {
      await route.fulfill({
        contentType: "application/pdf",
        body: samplePdf
      });
      return;
    }

    if (["/api/v1/materials", "/api/v1/library/materials"].includes(url.pathname)) {
      await route.fulfill({
        contentType: "application/json",
        body: success([
          {
            id: "material-1",
            ownerUserId: "user-1",
            ownerName: "Alice",
            title: "算法导论",
            description: "二叉树遍历",
            category: "book",
            tags: ["tree"],
            coverFileId: "",
            attachmentFileId: "file-1",
            attachmentName: "algo.pdf",
            attachmentMime: "application/pdf",
            status: "approved",
            favoritesCount: 0,
            averageRating: 0,
            createdAt: "2026-07-17T08:00:00Z",
            updatedAt: "2026-07-17T08:00:00Z"
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
            title: "阅读卡片",
            description: "reader deck",
            visibility: "private",
            cardCount: cardNoteCommitted ? 1 : 0,
            createdAt: "2026-07-17T08:00:00Z",
            updatedAt: "2026-07-17T08:05:00Z"
          }
        ])
      });
      return;
    }

    if (url.pathname === "/api/v1/materials/material-1/reader") {
      await route.fulfill({
        contentType: "application/json",
        body: success({
          materialId: "material-1",
          currentPage: 3,
          totalPages: 10,
          progressPercent: 30,
          bookmarks: [1],
          lastReadAt: "2026-07-17T08:10:00Z",
          annotations: [
            {
              id: "annotation-1",
              materialId: "material-1",
              page: 3,
              quote: "Highlighted quote",
              comment: "Useful note",
              color: "#f0d080",
              rects: [{ page: 3, x: 0, y: 0, width: 1, height: 0.08 }],
              createdAt: "2026-07-17T08:12:00Z",
              updatedAt: "2026-07-17T08:12:00Z"
            }
          ]
        })
      });
      return;
    }

    if (url.pathname === "/api/v1/materials/material-1/reader/progress" && request.method() === "PUT") {
      await route.fulfill({
        contentType: "application/json",
        body: success({
          materialId: "material-1",
          currentPage: 3,
          totalPages: 10,
          progressPercent: 30,
          bookmarks: [1],
          lastReadAt: "2026-07-17T08:10:00Z",
          annotations: [
            {
              id: "annotation-1",
              materialId: "material-1",
              page: 3,
              quote: "Highlighted quote",
              comment: "Useful note",
              color: "#f0d080",
              rects: [{ page: 3, x: 0, y: 0, width: 1, height: 0.08 }],
              createdAt: "2026-07-17T08:12:00Z",
              updatedAt: "2026-07-17T08:12:00Z"
            }
          ]
        })
      });
      return;
    }

    if (url.pathname === "/api/v1/materials/material-1/reader/annotations/generate-cards") {
      await route.fulfill({
        contentType: "application/json",
        body: success([
          {
            id: "draft-1",
            sourceType: "annotation",
            sourceId: "annotation-1",
            sourceLabel: "算法导论",
            sourceMetadata: {
              materialId: "material-1",
              annotationId: "annotation-1",
              page: 3
            },
            front: "什么是二叉树的前序遍历？",
            back: "先访问根节点，再访问左子树和右子树。",
            explanation: "来自 PDF 第 3 页批注"
          }
        ])
      });
      return;
    }

    if (url.pathname === "/api/v1/decks/deck-1/card-notes" && request.method() === "POST") {
      createdCardNoteRequest = request.postDataJSON();
      cardNoteCommitted = true;
      await route.fulfill({
        contentType: "application/json",
        body: success({
          cardNote: {
            id: "note-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            noteTypeId: "basic",
            noteTypeCode: "basic",
            generatedCardCount: 1,
            status: "active"
          },
          generatedCards: [
            {
              id: "card-1",
              deckId: "deck-1",
              ownerUserId: "user-1",
              cardNoteId: "note-1",
              cardType: "basic",
              front: "什么是二叉树的前序遍历？",
              back: "先访问根节点，再访问左子树和右子树。",
              sourceType: "annotation",
              sourceId: "annotation-1",
              sourceMetadata: {
                materialId: "material-1",
                annotationId: "annotation-1",
                page: 3
              },
              status: "active",
              createdAt: "2026-07-17T08:15:00Z",
              updatedAt: "2026-07-17T08:15:00Z"
            }
          ]
        })
      });
      return;
    }

    if (url.pathname === "/api/v1/review/today") {
      const queue = cardNoteCommitted && !reviewSubmitted
        ? {
            dueCount: 1,
            newCount: 1,
            learningCount: 0,
            reviewCount: 0,
            relearningCount: 0,
            newLimit: 20,
            reviewLimit: 200,
            items: [
              {
                deckTitle: "阅读卡片",
                card: {
                  id: "card-1",
                  deckId: "deck-1",
                  ownerUserId: "user-1",
                  cardNoteId: "note-1",
                  cardType: "basic",
                  front: "什么是二叉树的前序遍历？",
                  back: "先访问根节点，再访问左子树和右子树。",
                  sourceType: "annotation",
                  sourceId: "annotation-1",
                  sourceMetadata: {
                    materialId: "material-1",
                    annotationId: "annotation-1",
                    page: 3
                  },
                  status: "active",
                  createdAt: "2026-07-17T08:15:00Z",
                  updatedAt: "2026-07-17T08:15:00Z"
                },
                schedule: {
                  cardId: "card-1",
                  userId: "user-1",
                  dueAt: "2026-07-17T08:15:00Z",
                  learningStep: 0,
                  intervalDays: 0,
                  easeFactor: 2.5,
                  repetitionCount: 0,
                  lapseCount: 0,
                  state: "new",
                  updatedAt: "2026-07-17T08:15:00Z"
                }
              }
            ]
          }
        : {
            dueCount: 0,
            newCount: 0,
            learningCount: 0,
            reviewCount: 0,
            relearningCount: 0,
            newLimit: 20,
            reviewLimit: 200,
            items: []
          };
      await route.fulfill({
        contentType: "application/json",
        body: success(queue)
      });
      return;
    }

    if (url.pathname === "/api/v1/decks/deck-1/cards") {
      const cards = cardNoteCommitted
        ? [
            {
              id: "card-1",
              deckId: "deck-1",
              ownerUserId: "user-1",
              cardNoteId: "note-1",
              cardType: "basic",
              front: "什么是二叉树的前序遍历？",
              back: "先访问根节点，再访问左子树和右子树。",
              sourceType: "annotation",
              sourceId: "annotation-1",
              sourceMetadata: {
                materialId: "material-1",
                annotationId: "annotation-1",
                page: 3
              },
              primarySourceLink: {
                sourceType: "annotation",
                sourceId: "annotation-1",
                locator: {
                  materialId: "material-1",
                  annotationId: "annotation-1",
                  page: 3
                }
              },
              sourceLinks: [
                {
                  sourceType: "annotation",
                  sourceId: "annotation-1",
                  locator: {
                    materialId: "material-1",
                    annotationId: "annotation-1",
                    page: 3
                  }
                }
              ],
              status: "active",
              schedule: {
                cardId: "card-1",
                userId: "user-1",
                dueAt: reviewSubmitted ? "2026-07-17T08:20:00Z" : "2026-07-17T08:15:00Z",
                learningStep: reviewSubmitted ? 0 : 0,
                intervalDays: 0,
                easeFactor: 2.5,
                repetitionCount: 0,
                lapseCount: reviewSubmitted ? 1 : 0,
                state: reviewSubmitted ? "learning" : "new",
                updatedAt: "2026-07-17T08:20:00Z"
              },
              createdAt: "2026-07-17T08:15:00Z",
              updatedAt: "2026-07-17T08:20:00Z"
            }
          ]
        : [];
      await route.fulfill({
        contentType: "application/json",
        body: success(cards)
      });
      return;
    }

    if (url.pathname === "/api/v1/cards/card-1/review" && request.method() === "POST") {
      reviewedCardRequest = request.postDataJSON();
      reviewSubmitted = true;
      await route.fulfill({
        contentType: "application/json",
        body: success({
          reviewId: "review-1",
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-07-17T08:20:00Z",
            learningStep: 0,
            intervalDays: 0,
            easeFactor: 2.3,
            repetitionCount: 0,
            lapseCount: 1,
            state: "learning",
            updatedAt: "2026-07-17T08:16:00Z"
          }
        })
      });
      return;
    }

    if (url.pathname === "/api/v1/review/feedback") {
      await route.fulfill({
        contentType: "application/json",
        body: success(
          reviewSubmitted
            ? {
                dueCount: 0,
                learningCount: 1,
                weakCardCount: 1,
                weakCards: [
                  {
                    cardId: "card-1",
                    deckId: "deck-1",
                    deckTitle: "阅读卡片",
                    front: "什么是二叉树的前序遍历？",
                    sourceType: "annotation",
                    sourceId: "annotation-1",
                    sourceMetadata: {
                      materialId: "material-1",
                      annotationId: "annotation-1",
                      page: 3
                    },
                    dueAt: "2026-07-17T08:20:00Z",
                    lapseCount: 1,
                    repetitionCount: 0,
                    state: "learning"
                  }
                ],
                sourceSummaries: [
                  {
                    sourceType: "annotation",
                    sourceId: "annotation-1",
                    totalCardCount: 1,
                    reviewCardCount: 0,
                    masteredCardCount: 0,
                    masteryLevel: "building",
                    masteryScore: 20,
                    weakCardCount: 1,
                    dueCount: 0,
                    learningCount: 1,
                    maxLapseCount: 1,
                    sampleCardFronts: ["什么是二叉树的前序遍历？"]
                  }
                ],
                weakSources: []
              }
            : {
                dueCount: 0,
                learningCount: 0,
                weakCardCount: 0,
                weakCards: [],
                sourceSummaries: [],
                weakSources: []
              }
        )
      });
      return;
    }

    if (
      url.pathname === "/api/v1/card-notes" ||
      url.pathname === "/api/v1/notes" ||
      url.pathname === "/api/v1/posts" ||
      url.pathname === "/api/v1/ai/drafts" ||
      url.pathname === "/api/v1/ai/tasks"
    ) {
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

  await page.goto("/reader/material-1");
  await expect(page.getByRole("status", { name: /正在打开学习空间/ })).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "生成复习草稿" })).toBeEnabled({ timeout: 15_000 });
  await page.getByRole("button", { name: "生成复习草稿" }).click();
  await expect(page.getByText("已生成批注复习草稿。")).toBeVisible();
  await page.getByLabel("卡片模板").selectOption("basic");
  await page.getByRole("button", { name: "写入复习系统" }).click();

  await expect.poll(() => createdCardNoteRequest).not.toBeNull();
  expect(createdCardNoteRequest).toEqual({
    noteTypeCode: "basic",
    sourceLinks: [
      {
        sourceType: "annotation",
        sourceId: "annotation-1",
        locator: {
          materialId: "material-1",
          annotationId: "annotation-1",
          page: 3
        }
      }
    ],
    fields: {
      front: "什么是二叉树的前序遍历？",
      back: "先访问根节点，再访问左子树和右子树。"
    }
  });

  await page.goto("/review");
  await page.getByRole("button", { name: "开始复习" }).click();
  await expect(page.getByLabel("复习卡片")).toContainText("什么是二叉树的前序遍历？");
  await expect(page.getByText("来源：批注 / annotation-1")).toBeVisible();
  await page.getByRole("button", { name: "显示答案" }).click();
  await page.getByRole("button", { name: "Again 重来" }).click();

  await expect.poll(() => reviewedCardRequest).toMatchObject({ rating: "again" });
  expect(reviewedCardRequest).toEqual({
    rating: "again",
    elapsedMs: expect.any(Number)
  });
  const backlink = page.getByRole("link", { name: "回到批注" });
  await expect(backlink).toHaveAttribute("href", "/reader/material-1?page=3&annotation=annotation-1");

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: "今天的复习队列已经清空" })).toBeVisible();
  await expect(page.getByText("1 张卡片需要回补")).toBeVisible();
  const weakReviewCard = page.locator("article").filter({ hasText: "阅读卡片 · 学习中 · 遗忘 1 次" });
  await expect(weakReviewCard.getByText("什么是二叉树的前序遍历？")).toBeVisible();
  await expect(weakReviewCard.getByText(/遗忘 1 次/)).toBeVisible();
});
