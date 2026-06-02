import { expect, test } from "@playwright/test";

test("search page renders grouped backend results", async ({ page }) => {
  await page.route("**/api/v1/search**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          query: "图谱",
          total: 1,
          groups: [
            {
              type: "note",
              count: 1,
              results: [
                {
                  type: "note",
                  id: "note-1",
                  title: "图谱笔记",
                  summary: "从阅读批注沉淀出的知识图谱说明。",
                  url: "/notes?selected=note-1",
                  source: "note"
                }
              ]
            }
          ]
        }
      })
    });
  });

  await page.goto("/search?q=%E5%9B%BE%E8%B0%B1");

  await expect(page.getByRole("heading", { name: '"图谱"' })).toBeVisible();
  await expect(page.getByText("搜索完成，共 1 条结果。")).toBeVisible();
  await expect(page.getByRole("link", { name: /图谱笔记/ })).toBeVisible();
});

test("share page renders a read-only public token", async ({ page }) => {
  await page.route("**/api/v1/share/token-1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          token: "token-1",
          mode: "token",
          targetType: "graph",
          targetId: "graph-1",
          title: "共享知识图谱",
          summary: "公开只读预览。",
          url: "/graph?graphId=graph-1",
          readOnly: true,
          metadata: {
            status: "active",
            source: "graph"
          }
        }
      })
    });
  });

  await page.goto("/share/token-1");

  await expect(page.getByRole("heading", { name: "共享知识图谱" })).toBeVisible();
  await expect(page.getByText("这是只读分享预览。")).toBeVisible();
  await expect(page.getByText("graph / token / 只读")).toBeVisible();
  await expect(page.getByRole("link", { name: "打开原始页面" })).toHaveAttribute("href", "/graph?graphId=graph-1");
});
