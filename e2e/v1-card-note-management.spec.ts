import { expect, test } from "@playwright/test";

const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2099-01-01T00:00:00Z",
  user: { id: "user-1", username: "alice", email: "alice@example.test", displayName: "Alice", role: "student" }
};

const timestamp = "2026-11-16T08:00:00Z";

function managedNote(id: string, materialId: string, title: string) {
  const source = { sourceType: "annotation", sourceId: `annotation-${id}`, title, excerpt: "原始批注", locator: { materialId, page: 3 } };
  return {
    cardNote: {
      id, deckId: "deck-1", ownerUserId: "user-1", noteTypeId: "note-type-basic", noteTypeCode: "basic",
      fields: { front: `${title}的问题`, back: "原始答案" }, primarySourceLink: source, sourceLinks: [source],
      generatedCardCount: 1, status: "active", createdAt: timestamp, updatedAt: timestamp
    },
    generatedCards: [{
      id: `card-${id}`, deckId: "deck-1", ownerUserId: "user-1", cardNoteId: id, cardType: "basic",
      front: `${title}的问题`, back: "原始答案", templateOrdinal: 0, status: "active", tags: ["旧标签"],
      primarySourceLink: source, sourceLinks: [source], createdAt: timestamp, updatedAt: timestamp,
      schedule: { cardId: `card-${id}`, userId: "user-1", dueAt: timestamp, state: "review", learningStep: 0,
        intervalDays: 3, easeFactor: 2.5, repetitionCount: 1, lapseCount: 0, updatedAt: timestamp }
    }],
    queueStates: { review: 1 }, tags: ["旧标签"]
  };
}

for (const viewport of [{ name: "narrow", width: 390, height: 844 }, { name: "desktop", width: 1440, height: 1000 }]) {
test(`CardNote management preserves edits and deletion context on ${viewport.name}`, async ({ page }) => {
  await page.setViewportSize(viewport);
  await page.addInitScript((value) => localStorage.setItem("studymate.session", JSON.stringify(value)), session);
  let notes = [managedNote("cn-a", "material-a", "算法教材"), managedNote("cn-b", "material-b", "数据库教材")];
  let patchBody: Record<string, unknown> | null = null;
  let deleteBody: Record<string, unknown> | null = null;
  let deleteAttempts = 0;
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const reply = (data: unknown) => route.fulfill({ json: { success: true, data } });
    if (url.pathname === "/api/v1/auth/me") return reply(session.user);
    if (url.pathname === "/api/v1/decks") return reply([{
      id: "deck-1", ownerUserId: "user-1", title: "学习牌组", description: "", visibility: "private",
      cardCount: notes.reduce((count, note) => count + note.generatedCards.length, 0), createdAt: timestamp, updatedAt: timestamp
    }]);
    if (url.pathname === "/api/v1/review/today") return reply({ dueCount: 0, reviewedCount: 0, items: [], newCount: 0,
      learningCount: 0, reviewCount: 0, relearningCount: 0, newLimit: 20, reviewLimit: 200 });
    if (url.pathname === "/api/v1/review/feedback") return reply({ dueCount: 0, learningCount: 0, weakCards: [], weakSources: [], sourceSummaries: [] });
    if (url.pathname === "/api/v1/decks/deck-1/cards") return reply(notes.flatMap((note) => note.generatedCards));
    if (url.pathname === "/api/v1/card-notes") return reply(notes);
    if (url.pathname === "/api/v1/card-notes/cn-a" && request.method() === "GET") return reply(notes[0]);
    if (url.pathname === "/api/v1/card-notes/cn-a" && request.method() === "PATCH") {
      patchBody = request.postDataJSON();
      const input = request.postDataJSON();
      notes = notes.map((note) => note.cardNote.id === "cn-a" ? {
        ...note, tags: input.tags, cardNote: { ...note.cardNote, fields: input.fields,
          primarySourceLink: input.primarySourceLink, sourceLinks: input.sourceLinks }
      } : note);
      return reply({ ...notes[0], regeneration: { createdCount: 0, updatedCount: 0, removedCount: 0, preservedCount: 1 } });
    }
    if (url.pathname === "/api/v1/cards/card-cn-a" && request.method() === "DELETE") {
      deleteAttempts += 1;
      deleteBody = request.postDataJSON();
      if (deleteAttempts === 1) return route.fulfill({ status: 500, json: { success: false,
        error: { code: "temporary_failure", message: "暂时无法删除，请重试" } } });
      notes = notes.map((note) => note.cardNote.id === "cn-a" ? { ...note, generatedCards: [], queueStates: {},
        cardNote: { ...note.cardNote, generatedCardCount: 0 } } : note);
      return reply({ cardId: "card-cn-a", deleted: true });
    }
    return reply([]);
  });

  await page.goto("/review");
  await page.getByRole("button", { name: "Note 视图", exact: true }).click();
  await expect(page.getByLabel("编辑 CardNote cn-a Front")).toBeVisible();
  await page.getByLabel("筛选笔记来源类型").selectOption("pdf");
  await page.getByLabel("筛选具体来源").selectOption("material:material-a");
  await expect(page.getByLabel("编辑 CardNote cn-b Front")).toHaveCount(0);
  await page.getByLabel("编辑 CardNote cn-a 标签").fill("");
  await page.getByLabel("编辑 CardNote cn-a 来源标题").fill("算法教材 · 第三页");
  await page.getByLabel("编辑 CardNote cn-a 来源说明").fill("复习前回看批注");
  await page.getByRole("button", { name: "保存并更新未学习卡片" }).click();
  await expect.poll(() => patchBody?.tags).toEqual([]);
  await expect.poll(() => patchBody?.primarySourceLink).toMatchObject({ title: "算法教材 · 第三页", excerpt: "复习前回看批注" });

  await page.getByRole("button", { name: "删除卡片 card-cn-a", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "删除这张卡片？" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("复习记录");
  await dialog.getByRole("button", { name: "确认删除", exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("暂时无法删除");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/card-note-delete-retry-${viewport.name}.png`, fullPage: true });
  await dialog.getByRole("button", { name: "确认删除", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => deleteBody).toMatchObject({ confirmDeleteHistory: true });
  await expect(page.getByRole("button", { name: "删除卡片 card-cn-a", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(pageErrors).toEqual([]);
  await page.screenshot({ path: `test-results/card-note-management-${viewport.name}.png`, fullPage: true });
});
}
