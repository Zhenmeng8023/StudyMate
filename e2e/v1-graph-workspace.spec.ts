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

function buildLayoutExportSmokeDocument() {
  return {
    graphId: "graph-1",
    version: 4,
    schemaVersion: 1,
    viewport: { x: 140, y: 120, zoom: 1 },
    nodes: [
      {
        id: "layout-node-1",
        type: "material",
        title: "布局节点 1",
        x: 120,
        y: 140,
        width: 220,
        height: 132,
        source: { type: "material", id: "material-1", label: "资料 A" },
        metadata: {}
      },
      {
        id: "layout-node-2",
        type: "rich-note",
        title: "布局节点 2",
        x: 420,
        y: 180,
        width: 220,
        height: 132,
        source: { type: "note", id: "note-1", label: "笔记 A" },
        metadata: {}
      },
      {
        id: "layout-node-3",
        type: "text",
        title: "布局节点 3",
        x: 720,
        y: 260,
        width: 220,
        height: 132,
        source: { type: "ai", id: "draft-1", label: "AI 草稿" },
        metadata: {}
      }
    ],
    edges: [
      {
        id: "layout-edge-1",
        kind: "straight",
        sourceNodeId: "layout-node-1",
        targetNodeId: "layout-node-2",
        label: "关联"
      }
    ],
    groups: [],
    theme: {},
    metadata: {}
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

test("graph workspace previews source swimlanes and reports export statuses", async ({ page }) => {
  const document = buildLayoutExportSmokeDocument();
  const detail = buildGraphDetail({
    currentVersion: 4,
    description: "布局预览与导出状态 smoke",
    document,
    edgeCount: 1,
    nodeCount: 3,
    title: "布局导出图谱",
    updatedAt: "2026-07-09T08:08:00Z"
  });
  const previewDocument = {
    ...document,
    groups: [
      {
        id: "layout-group-1",
        title: "资料来源泳道",
        nodeIds: ["layout-node-1"],
        x: 60,
        y: 80,
        width: 320,
        height: 240,
        collapsed: false,
        metadata: { layoutKind: "source-swimlane", sourceType: "material" }
      },
      {
        id: "layout-group-2",
        title: "笔记来源泳道",
        nodeIds: ["layout-node-2"],
        x: 400,
        y: 80,
        width: 320,
        height: 240,
        collapsed: false,
        metadata: { layoutKind: "source-swimlane", sourceType: "note" }
      },
      {
        id: "layout-group-3",
        title: "AI 来源泳道",
        nodeIds: ["layout-node-3"],
        x: 740,
        y: 80,
        width: 320,
        height: 240,
        collapsed: false,
        metadata: { layoutKind: "source-swimlane", sourceType: "ai" }
      }
    ],
    nodes: document.nodes.map((node) => {
      if (node.id === "layout-node-1") {
        return { ...node, x: 100, y: 140 };
      }
      if (node.id === "layout-node-2") {
        return { ...node, x: 440, y: 140 };
      }
      if (node.id === "layout-node-3") {
        return { ...node, x: 780, y: 140 };
      }
      return node;
    })
  };
  let layoutPreviewRequest: Record<string, unknown> | null = null;

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.session", JSON.stringify(storedSession));
  }, session);

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/graphs/graph-1") {
      await route.fulfill({ contentType: "application/json", body: success(detail) });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/layouts/preview") {
      layoutPreviewRequest = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        contentType: "application/json",
        body: success({
          mode: "source-swimlane",
          statusMessage: "已生成 3 条来源泳道",
          laneCount: 3,
          selectedNodeIds: ["layout-node-1", "layout-node-2", "layout-node-3"],
          document: previewDocument
        })
      });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-1/snapshots") {
      await route.fulfill({ contentType: "application/json", body: success([]) });
      return;
    }
    if (url.pathname === "/api/v1/graphs") {
      await route.fulfill({ contentType: "application/json", body: success([detail]) });
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

  await expect(page.getByText("布局导出图谱")).toBeVisible();
  await expect(page.getByText("版本 4 · 3 节点 · 1 连线")).toBeVisible();

  await page.getByRole("region", { name: "图谱画布" }).click();
  await page.keyboard.press("Control+A");
  await page.getByRole("button", { name: "属性" }).click();
  await expect(page.getByText("已选中 3 个节点")).toBeVisible();
  await page.getByRole("button", { name: "生成来源泳道" }).click();

  expect(layoutPreviewRequest).toEqual({
    mode: "source-swimlane",
    nodeIds: ["layout-node-1", "layout-node-2", "layout-node-3"],
    document
  });
  await expect(page.getByText("已生成 3 条来源泳道")).toBeVisible();
  await expect(page.locator(".graph-group")).toHaveCount(3);
  await expect(page.getByText("资料来源泳道")).toBeVisible();
  await expect(page.getByText("笔记来源泳道")).toBeVisible();
  await expect(page.getByText("AI 来源泳道")).toBeVisible();

  await page.getByTitle("导出 StudyMate JSON").click();
  await expect(page.getByText("已导出 StudyMate 图谱 JSON")).toBeVisible();
  await page.getByTitle("导出 SVG").click();
  await expect(page.getByText("已导出 SVG 图谱")).toBeVisible();
  await page.getByTitle("导出 PNG").click();
  await expect(page.getByText("已导出 PNG 图谱")).toBeVisible();
});

test("graph workspace keeps the current graph when opening a forbidden graph fails", async ({ page }) => {
  const currentDetail = buildGraphDetail({
    currentVersion: 4,
    description: "权限路径 smoke",
    document: {
      graphId: "graph-1",
      version: 4,
      schemaVersion: 1,
      viewport: { x: 140, y: 120, zoom: 1 },
      nodes: [
        {
          id: "node-1",
          type: "concept",
          title: "当前节点",
          x: 140,
          y: 160,
          width: 220,
          height: 132,
          source: null,
          metadata: {}
        }
      ],
      edges: [],
      groups: [],
      theme: {},
      metadata: {}
    },
    edgeCount: 0,
    nodeCount: 1,
    title: "当前图谱",
    updatedAt: "2026-07-09T08:20:00Z"
  });
  const forbiddenGraph = {
    ...currentDetail,
    id: "graph-2",
    ownerUserId: "user-2",
    title: "他人图谱",
    currentVersion: 2,
    nodeCount: 2,
    updatedAt: "2026-07-09T08:18:00Z"
  };

  await page.addInitScript((storedSession) => {
    window.localStorage.setItem("studymate.session", JSON.stringify(storedSession));
  }, session);

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/graphs/graph-1") {
      await route.fulfill({ contentType: "application/json", body: success(currentDetail) });
      return;
    }
    if (url.pathname === "/api/v1/graphs/graph-2") {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "forbidden",
            message: "只能访问自己的图谱"
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
      await route.fulfill({ contentType: "application/json", body: success([currentDetail, forbiddenGraph]) });
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

  await expect(page.getByText("当前图谱")).toBeVisible();
  await expect(page.getByText("版本 4 · 1 节点 · 0 连线")).toBeVisible();

  await page.getByLabel("打开资源面板").click();
  await page.getByRole("button", { name: "图谱", exact: true }).click();
  await page.getByRole("button", { name: /他人图谱/ }).click();

  await expect(page.getByText("只能访问自己的图谱")).toBeVisible();
  await expect(page.locator(".graph-list-item.active")).toContainText("当前图谱");
  await expect(page.getByRole("button", { name: /当前节点/ })).toBeVisible();
  await expect(page.getByText("版本 4 · 1 节点 · 0 连线")).toBeVisible();
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
  await expect(page.getByRole("dialog", { name: "确认重载最新图谱" })).toBeVisible();
  await page.getByRole("button", { name: "确认重载" }).click();

  await expect(page.getByText("已重新加载最新图谱，未保存更改已放弃")).toBeVisible();
  await expect(page.getByLabel("图谱保存状态：空闲")).toBeVisible();
  await expect(page.getByText("版本 5 · 0 节点 · 0 连线")).toBeVisible();
  await expect(page.getByText("服务器图谱")).toBeVisible();
  await expect(page.locator('[aria-label="图谱冲突辅助"]')).toHaveCount(0);
});

test("graph workspace applies marked conflict resolutions onto the latest head and saves the rebased draft", async ({ page }) => {
  const initialDetail = buildGraphDetail({
    currentVersion: 4,
    description: "对象级冲突取舍烟测",
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
    title: "冲突图谱",
    updatedAt: "2026-07-09T08:20:00Z"
  });
  const latestDetail = buildGraphDetail({
    currentVersion: 5,
    description: "服务端已保存更新后的图谱标题",
    document: {
      ...initialDetail.document,
      version: 5
    },
    edgeCount: 0,
    nodeCount: 0,
    title: "Graph on server",
    updatedAt: "2026-07-09T08:25:00Z"
  });
  let graphRequestCount = 0;
  let batchSaveCount = 0;
  const batchSavePayloads: Array<Record<string, unknown>> = [];

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
      batchSaveCount += 1;
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      batchSavePayloads.push(payload);
      if (batchSaveCount === 1) {
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

      const requestDocument = payload.document as {
        edges: unknown[];
        graphId: string;
        groups: unknown[];
        metadata: Record<string, unknown>;
        nodes: Array<Record<string, unknown>>;
        schemaVersion: number;
        theme: Record<string, unknown>;
        version: number;
        viewport: Record<string, unknown>;
      };

      await route.fulfill({
        contentType: "application/json",
        body: success({
          ...latestDetail,
          currentVersion: 6,
          edgeCount: requestDocument.edges.length,
          nodeCount: requestDocument.nodes.length,
          updatedAt: "2026-07-09T08:28:00Z",
          document: {
            ...requestDocument,
            version: 6
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

  await expect(page.getByText("冲突图谱")).toBeVisible();
  await page.getByTitle("新建概念节点").click();
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByLabel("图谱冲突辅助")).toBeVisible();
  await page.getByRole("button", { name: "保留本地（当前未保存修改）：节点｜新增｜新概念" }).click();
  await page.getByRole("button", { name: "应用已标记取舍到当前草稿" }).click();

  await expect(page.getByText("已基于最新图谱生成合并草稿：保留本地 1 项，请确认后保存")).toBeVisible();
  await expect(page.getByLabel("图谱保存状态：有未保存修改")).toBeVisible();
  await expect(page.getByText("版本 5 · 1 节点 · 0 连线")).toBeVisible();
  await expect(page.locator('[aria-label="图谱冲突辅助"]')).toHaveCount(0);

  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("图谱已保存")).toBeVisible();
  await expect(page.getByLabel("图谱保存状态：已保存")).toBeVisible();
  await expect(page.getByText("版本 6 · 1 节点 · 0 连线")).toBeVisible();
  await expect
    .poll(() => batchSavePayloads.length, { message: "expected rebased save payload to be captured" })
    .toBe(2);
  expect(batchSavePayloads[1]?.document).toMatchObject({
    version: 5,
    nodes: [expect.objectContaining({ title: "新概念" })]
  });
});

test("graph workspace keeps version conflict handling reachable in a narrow viewport", async ({ page }) => {
  const initialDetail = buildGraphDetail({
    currentVersion: 4,
    description: "窄屏冲突处理烟测",
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
    title: "窄屏图谱",
    updatedAt: "2026-07-09T08:10:00Z"
  });
  const latestDetail = buildGraphDetail({
    currentVersion: 5,
    description: "窄屏已切回最新版本",
    document: {
      ...initialDetail.document,
      version: 5
    },
    edgeCount: 0,
    nodeCount: 0,
    title: "窄屏服务器图谱",
    updatedAt: "2026-07-09T08:12:00Z"
  });
  let graphRequestCount = 0;

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.setViewportSize({ width: 390, height: 844 });
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

  await expect(page.getByLabel("打开资源面板")).toBeVisible();
  await expect(page.getByLabel("打开检查器")).toBeVisible();
  await expect(page.getByText("窄屏图谱")).toBeVisible();

  await page.getByTitle("新建概念节点").click();
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByLabel("图谱冲突辅助")).toContainText("先留存当前草稿，再决定是否重载");
  await expect(page.getByRole("button", { name: "先保留本地，稍后人工合并" })).toBeVisible();
  await expect(page.getByRole("button", { name: "放弃本地并重载最新图谱" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "图谱检查器" })).toBeVisible();

  await page.getByRole("button", { name: "放弃本地并重载最新图谱" }).click();
  await expect(page.getByRole("dialog", { name: "确认重载最新图谱" })).toBeVisible();
  await page.getByRole("button", { name: "确认重载" }).click();

  await expect(page.getByText("已重新加载最新图谱，未保存更改已放弃")).toBeVisible();
  await expect(page.getByText("窄屏服务器图谱")).toBeVisible();
  await expect(page.getByText("版本 5 · 0 节点 · 0 连线")).toBeVisible();
});
