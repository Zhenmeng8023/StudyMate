# 搜索契约与回归矩阵

> 适用范围：`WB-010` ~ `WB-014` 已收口的统一搜索能力。
> 目标：把当前 `/api/v1/search` 的后端契约、权限边界、页面行为和可执行回归入口集中到一处，供后续 `SearchIndexer` 升级、搜索页改版和知识链接能力复用。

## 1. 当前后端契约

### 1.1 Endpoint

- `GET /api/v1/search?q=&types=&limit=`

### 1.2 查询参数

| 参数 | 当前规则 |
| --- | --- |
| `q` | 去空白后为空时，后端返回空查询结果，不报错。 |
| `types` | 支持 `material,post,note,graph,card`；省略或传空值时回退到默认五组。 |
| `limit` | 缺省或非法时回退到 `20`；最大钳制为 `50`。 |

### 1.3 响应结构

- 当前固定返回 grouped payload，而不是 offset/page/cursor 分页结构。
- `SearchResponsePayload`
  - `query`
  - `total`
  - `groups[]`
- `SearchGroupPayload`
  - `type`
  - `count`
  - `results[]`
- `SearchResultPayload`
  - `type`
  - `id`
  - `title`
  - `summary`
  - `url`
  - `source`

### 1.4 权限与可见性

| 类型 | 匿名请求 | 登录请求 |
| --- | --- | --- |
| `material` | 只返回公开资料 | 只返回公开资料 |
| `post` | 只返回公开社区内容 | 只返回公开社区内容 |
| `note` | 直接短路为空结果 | 只返回 owner 自己的笔记 |
| `graph` | 直接短路为空结果 | 只返回 `active` 且“owner 或 public”的图谱 |
| `card` | 直接短路为空结果 | 只返回 owner 自己的 `active` 卡片 |

### 1.5 排序与摘要

- MySQL fallback 先抓取一小批候选，再按“标题命中优先、摘要命中次之、同级保留原始更新时间顺序”稳定排序。
- 长摘要会折叠空白并压成单行，裁剪到 160 个字符以内。

## 2. 当前用户端行为

### 2.1 URL 与筛选

- 搜索页入口：`/search`
- 关键字来自 URL `q`
- 类型筛选来自 URL `types`
- 搜索页会把筛选状态、地址栏和 `searchAll(...)` 请求保持同步

### 2.2 页面状态

| 场景 | 当前行为 |
| --- | --- |
| 无 `q` | 展示搜索空态提示，不发起 API 请求 |
| 请求中 | 展示“正在搜索”说明 |
| 请求失败 | 展示后端或客户端错误消息 |
| 某组无结果 | 组内显示“暂无匹配结果” |
| 有结果 | 渲染来源链接卡片，并保留 `item.url` 跳转 |

### 2.3 分页边界

- 搜索页当前不是后端真分页。
- 前端每次会按每组最多 `12` 条请求当前批次结果。
- 每组当前批次结果按每页 `4` 条切换。
- 如果后续需要跨批次翻页，必须先扩展后端 offset/cursor 契约，再调整页面表现。

## 3. 可执行回归矩阵

| 覆盖层 | 关注点 | 主要文件 | 命令 |
| --- | --- | --- | --- |
| 前端 API | URL 查询参数、默认不发送空 `types=`、鉴权头 | `frontend-user/src/api/searchShare.test.ts` | `npm run test:search:frontend` |
| 前端页面 | 空态、错误态、`types` 同步、来源链接、当前批次分页 | `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx` | `npm run test:search:frontend` |
| 后端 service | 默认类型、非法类型、`limit` 边界、权限 spec、排序/摘要 | `backend/internal/modules/search/service/*.go` | `npm run test:search:backend` |
| 后端 handler | 查询参数解析、错误映射、success envelope | `backend/internal/modules/search/handler/*.go` | `npm run test:search:backend` |
| E2E smoke | 搜索页消费 grouped payload 并显示结果卡片 | `e2e/v1-public-flows.spec.ts` | `npm run test:search:e2e` |
| 文档同步 | 搜索说明与项目主文档保持一致 | `README.md` / `docs/DEVELOPMENT.md` / `PROJECT_LOG.md` 等 | `npm run verify:docs` |

## 4. 推荐执行入口

### 4.1 搜索专项验证

```powershell
npm run verify:search
```

该命令当前会执行：

1. `npm run test:search:frontend`
2. `npm run test:search:backend`
3. `npm run test:search:e2e`
4. `npm run verify:docs`

### 4.2 全量项目验证

```powershell
npm run ci
```

## 5. 后续迭代提醒

- `WB-043` 若升级 `SearchIndexer` 或引入 Meilisearch，必须继续保持当前 `/api/v1/search` route contract 不变，除非明确引入兼容策略。
- `WB-050` 若补笔记双链/反链，应复用这里记录的来源跳转与权限边界，而不是另起一套搜索结果语义。
- 任何把当前批次分页误写成“后端分页”的文档更新，都应视为契约漂移并回归修正。
