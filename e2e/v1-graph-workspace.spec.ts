import { expect, test } from "@playwright/test";

const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-04T12:00:00Z",
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

function buildGraphDocument() {
  const nodes = Array.from({ length: 200 }, (_, index) => ({
    id: `node-${index + 1}`,
    type: index % 4 === 0 ? "material" : index % 4 === 1 ? "rich-note" : index % 4 === 2 ? "card" : "text",
    title: `Benchmark ${index + 1}`,
    x: (index % 20) * 120,
    y: Math.floor(index / 20) * 110,
    width: 180,
    height: 96,
    source: {
      type: index % 4 === 0 ? "material" : index % 4 === 1 ? "note" : index % 4 === 2 ? "card" : "ai",
      id: `source-${index + 1}`,
      label: `Source ${index + 1}`
    },
    metadata: {}
  }));
  const edges = Array.from({ length: 300 }, (_, index) => ({
    id: `edge-${index + 1}`,
    kind: index % 3 === 0 ? "curve" : "straight",
    sourceNodeId: nodes[index % nodes.length].id,
    targetNodeId: nodes[(index + 1) % nodes.length].id,
    label: index % 7 === 0 ? "关联" : ""
  }));
  const groups = Array.from({ length: 20 }, (_, index) => ({
    id: `group-${index + 1}`,
    title: `Group ${index + 1}`,
    nodeIds: nodes.slice(index * 10, index * 10 + 10).map((node) => node.id),
    x: (index % 5) * 420,
    y: Math.floor(index / 5) * 280,
    width: 360,
    height: 240,
    collapsed: false,
    metadata: {}
  }));

  return {
    graphId: "graph-1",
    version: 3,
    schemaVersion: 1,
    viewport: { x: 120, y: 90, zoom: 1 },
    nodes,
    edges,
    groups,
    theme: {},
    metadata: {}
  };
}

test("graph workspace opens a 200 node graph and exposes JSON export", async ({ page }) => {
  const document = buildGraphDocument();
  const detail = {
    id: "graph-1",
    ownerUserId: "user-1",
    title: "性能图谱",
    description: "200 节点性能烟测",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "free",
    currentVersion: 3,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    createdAt: "2026-06-04T12:00:00Z",
    updatedAt: "2026-06-04T12:00:00Z",
    document
  };

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.session", JSON.stringify(storedSession));
  }, session);
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/graphs/graph-1") {
      await route.fulfill({ contentType: "application/json", body: success(detail) });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/batch-save") {
      await route.fulfill({ contentType: "application/json", body: success({
        ...detail,
        currentVersion: 4,
        document: {
          ...detail.document,
          version: 4
        }
      }) });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/validate") {
      await route.fulfill({ contentType: "application/json", body: success({ issues: [] }) });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/snapshots") {
      await route.fulfill({
        contentType: "application/json",
        body: success([
          {
            id: "snapshot-1",
            graphId: "graph-1",
            versionNumber: 2,
            summary: "恢复前版本",
            createdAt: "2026-06-04T12:05:00Z"
          }
        ])
      });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/restore") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: { code: "snapshot_restore_failed", message: "快照恢复失败" } })
      });
      return;
    }
    if (url.pathname === "/api/v1/graphs") {
      await route.fulfill({ contentType: "application/json", body: success([detail]) });
      return;
    }
    if (["/api/v1/decks", "/api/v1/materials", "/api/v1/notes"].includes(url.pathname)) {
      await route.fulfill({ contentType: "application/json", body: success([]) });
      return;
    }
    if (url.pathname === "/api/v1/diagram/templates") {
      await route.fulfill({
        contentType: "application/json",
        body: success([
          {
            id: "learning-material-map",
            name: "学习资料梳理",
            category: "learning-material",
            description: "整理资料和批注。",
            mode: "learning",
            sampleLines: ["资料主线", "关键批注", "沉淀笔记"]
          }
        ])
      });
      return;
    }

    await route.fulfill({ contentType: "application/json", body: success({}) });
  });

  await page.goto("/graph?graphId=graph-1");

  await expect(page.getByRole("heading", { name: "把资料、笔记和复习线索组织到同一张学习地图里" })).toBeVisible();
  await expect(page.getByText("版本 3 · 200 节点 · 300 连线")).toBeVisible();
  await expect(page.locator('button[title="导出 StudyMate JSON"]')).toBeVisible();
  await expect(page.locator(".graph-stage")).toBeVisible();

  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByLabel("图谱保存状态：已保存")).toBeVisible();

  await page.getByTitle("快捷键说明").click();
  await expect(page.getByRole("dialog", { name: "图谱快捷键" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "图谱快捷键" })).toBeHidden();

  await page.getByRole("button", { name: "JSON" }).nth(1).click();
  await page.locator(".graph-import-input").fill(JSON.stringify({
    schemaVersion: 1,
    nodes: [
      {
        id: "node-1",
        type: "concept",
        title: "Broken",
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        source: { type: "material", id: "source-1", label: "Source 1" }
      }
    ],
    edges: [{ id: "edge-broken", sourceNodeId: "node-1", targetNodeId: "missing" }],
    groups: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    theme: {},
    metadata: {}
  }));
  await page.getByRole("button", { name: "导入草稿" }).click();
  await expect(page.getByText("导入 JSON 失败：发现 1 条结构错误")).toBeVisible();

  await page.getByRole("button", { name: "恢复" }).click();
  await expect(page.getByText("快照恢复失败")).toBeVisible();

  await page.getByRole("button", { name: "回到阅读器" }).first().click();
  await expect(page).toHaveURL(/\/reader\/source-1/);
});
