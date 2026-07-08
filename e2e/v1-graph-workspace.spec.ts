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

function buildGraphDetail(input?: {
  currentVersion?: number;
  description?: string;
  document?: ReturnType<typeof buildGraphDocument>;
  edgeCount?: number;
  nodeCount?: number;
  title?: string;
  updatedAt?: string;
}) {
  const document = input?.document ?? buildGraphDocument();
  return {
    id: "graph-1",
    ownerUserId: "user-1",
    title: input?.title ?? "性能图谱",
    description: input?.description ?? "200 节点性能烟测",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "free",
    currentVersion: input?.currentVersion ?? document.version,
    nodeCount: input?.nodeCount ?? document.nodes.length,
    edgeCount: input?.edgeCount ?? document.edges.length,
    createdAt: "2026-06-04T12:00:00Z",
    updatedAt: input?.updatedAt ?? "2026-06-04T12:00:00Z",
    document
  };
}

test("graph workspace opens a 200 node graph and exposes canvas save, import, and history flows", async ({ page }) => {
  const document = buildGraphDocument();
  const detail = buildGraphDetail({ document });

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
      await route.fulfill({
        contentType: "application/json",
        body: success({
          ...detail,
          currentVersion: 4,
          document: {
            ...detail.document,
            version: 4
          }
        })
      });
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

  await expect(page.getByLabel("打开资源面板")).toBeVisible();
  await expect(page.getByText("性能图谱")).toBeVisible();
  await expect(page.getByText("版本 3 · 200 节点 · 300 连线")).toBeVisible();
  await expect(page.locator(".graph-stage")).toBeVisible();

  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByLabel("图谱保存状态：已保存")).toBeVisible();

  await page.getByTitle("快捷键说明").click();
  await expect(page.getByRole("dialog", { name: "图谱快捷键" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "图谱快捷键" })).toBeHidden();

  await page.getByLabel("打开检查器").click();
  await page.getByRole("button", { name: "导入" }).click();
  await page.getByLabel("图谱导入格式").getByRole("button", { name: "JSON" }).click();
  await page.locator(".graph-import-input").fill(JSON.stringify({
    schemaVersion: 1,
    nodes: [
      {
        id: "node-1",
        type: "concept",
        title: "Broken import",
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        source: { type: "note", id: "note-1" }
      }
    ],
    edges: [{ id: "edge-1", sourceNodeId: "node-1", targetNodeId: "missing" }],
    groups: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    theme: {},
    metadata: {}
  }));
  await page.getByRole("button", { name: "导入草稿" }).click();
  await expect(page.getByText("导入 JSON 失败：发现 2 条结构错误")).toBeVisible();
  await expect(page.getByLabel("图谱保存状态：保存失败")).toBeVisible();

  await page.getByRole("button", { name: "历史" }).click();
  await page.getByRole("button", { name: "恢复" }).click();
  await expect(page.getByText("快照恢复失败")).toBeVisible();
});

test("graph workspace surfaces version conflict actions and reloads the latest head", async ({ page }) => {
  const initialDetail = buildGraphDetail({
    currentVersion: 4,
    description: "版本冲突处理烟测",
    document: {
      graphId: "graph-1",
      version: 4,
      schemaVersion: 1,
      viewport: { x: 140, y: 120, zoom: 1 },
      nodes: [],
      edges: [],
      groups: [],
      theme: {},
      metadata: {}
    },
    edgeCount: 0,
    nodeCount: 0,
    title: "冲突前图谱",
    updatedAt: "2026-07-09T08:00:00Z"
  });
  const latestDetail = buildGraphDetail({
    currentVersion: 5,
    description: "服务端已保存新版本",
    document: {
      ...initialDetail.document,
      version: 5
    },
    edgeCount: 0,
    nodeCount: 0,
    title: "服务器图谱",
    updatedAt: "2026-07-09T08:05:00Z"
  });
  let graphRequestCount = 0;

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.session", JSON.stringify(storedSession));
  }, session);

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/graphs/graph-1") {
      graphRequestCount += 1;
      await route.fulfill({
        contentType: "application/json",
        body: success(graphRequestCount === 1 ? initialDetail : latestDetail)
      });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/batch-save") {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "graph_version_conflict",
            message: "图谱已被其他窗口更新，请刷新当前图谱后再保存。"
          }
        })
      });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/snapshots") {
      await route.fulfill({ contentType: "application/json", body: success([]) });
      return;
    }
    if (url.pathname === "/api/v1/graphs") {
      await route.fulfill({ contentType: "application/json", body: success([initialDetail]) });
      return;
    }
    if (url.pathname === "/api/v1/diagram/templates") {
      await route.fulfill({ contentType: "application/json", body: success([]) });
      return;
    }
    if (["/api/v1/decks", "/api/v1/materials", "/api/v1/notes"].includes(url.pathname)) {
      await route.fulfill({ contentType: "application/json", body: success([]) });
      return;
    }

    await route.fulfill({ contentType: "application/json", body: success({}) });
  });

  await page.goto("/graph?graphId=graph-1");

  await expect(page.getByText("冲突前图谱")).toBeVisible();
  await expect(page.getByText("版本 4 · 0 节点 · 0 连线")).toBeVisible();

  await page.getByTitle("新建概念节点").click();
  await expect(page.getByLabel("图谱保存状态：有未保存修改")).toBeVisible();

  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("图谱已被其他窗口更新，请刷新当前图谱后再保存。")).toBeVisible();
  await expect(page.getByRole("button", { name: "查看冲突处理" })).toBeVisible();
  await expect(page.getByLabel("图谱冲突辅助")).toContainText("先留存当前草稿，再决定是否重载");
  await expect(page.getByRole("button", { name: "先保留本地，稍后人工合并" })).toBeVisible();

  await page.getByRole("button", { name: "先保留本地，稍后人工合并" }).click();
  await expect(page.getByText("已标记为稍后人工合并，当前继续保留本地草稿。")).toBeVisible();

  await page.getByRole("button", { name: "放弃本地并重载最新图谱" }).click();

  await expect(page.getByText("已重新加载最新图谱，未保存更改已放弃")).toBeVisible();
  await expect(page.getByLabel("图谱保存状态：空闲")).toBeVisible();
  await expect(page.getByText("版本 5 · 0 节点 · 0 连线")).toBeVisible();
  await expect(page.getByText("服务器图谱")).toBeVisible();
  await expect(page.locator('[aria-label="图谱冲突辅助"]')).toHaveCount(0);
});
