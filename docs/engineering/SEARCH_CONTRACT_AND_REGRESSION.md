# 搜索契约与回归矩阵

> 适用范围：`WB-010` ~ `WB-014` 已收口的统一搜索能力，以及 `SE-020` 当前已落地的“真实命中数 / 首批返回数分离”切片。
> 目标：把当前 `/api/v1/search` 的后端契约、权限边界、页面行为和可执行回归入口集中到一处，供后续 `SearchIndexer` 升级、服务端分页、搜索页改版和知识链接能力复用。

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

- 当前固定返回 grouped payload，而不是 offset / page / cursor 分页结构。
- `SearchResponsePayload`
  - `query`
  - `limit`
  - `elapsedMs`
  - `total`
  - `groups[]`
- `SearchGroupPayload`
  - `type`
  - `count`
  - `returnedCount`
  - `results[]`
- `SearchResultPayload`
  - `type`
  - `id`
  - `title`
  - `summary`
  - `url`
  - `source`

### 1.4 统计语义

| 字段 | 当前含义 |
| --- | --- |
| `total` | 本次搜索所有分组的真实命中总数之和。 |
| `limit` | 本次请求归一化后的首批返回上限，当前前后端都把它当作“每组当前批次最多返回多少条”的契约。 |
| `elapsedMs` | 后端本次聚合搜索耗时，供搜索页展示真实统计信息。 |
| `groups[].count` | 该分组的真实命中总数，不再等同于当前返回数组长度。 |
| `groups[].returnedCount` | 当前这次请求为该分组实际返回的首批结果数量。 |
| `groups[].results.length` | 与 `returnedCount` 一致，代表前端当前拿到的批次数组长度。 |

- `SE-020` 当前只完成“真实命中数 / 首批返回数分离”。
- 当前仍未提供 `cursor`、`nextCursor`、`page`、`offset` 或服务端翻页令牌。
- 任何跨批次翻页需求，仍必须继续扩展后端契约，不能只靠前端现有分页控件实现。

### 1.5 权限与可见性

| 类型 | 匿名请求 | 登录请求 |
| --- | --- | --- |
| `material` | 只返回公开资料 | 只返回公开资料 |
| `post` | 只返回公开社区内容 | 只返回公开社区内容 |
| `note` | 直接短路为空结果 | 只返回 owner 自己的笔记 |
| `graph` | 直接短路为空结果 | 只返回 `active` 且满足 `owner or public` 的图谱 |
| `card` | 直接短路为空结果 | 只返回 owner 自己的 `active` 卡片 |

### 1.6 排序、摘要与来源

- MySQL fallback 会先抓取一小批候选，再按“标题命中优先、摘要命中次之、同级保留原始更新时间顺序”稳定排序。
- 长摘要会折叠空白并压成单行，裁剪到 160 个字符以内。
- 搜索结果的 `url` 与 `source` 现在统一在 Go 层组装，不再依赖数据库方言内联字符串拼接。

## 2. 当前用户端行为

### 2.1 URL 与筛选

- 搜索页入口：`/search`
- 关键词来自 URL `q`
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
| 命中数大于首批返回数 | 组内明确显示“当前仅展示首批 X / Y 条结果。” |
| 有结果且请求成功 | 顶部概览文案显示真实总数、`elapsedMs` 与当前 `limit` 对应的首批边界。 |

### 2.3 分页边界

- 搜索页当前不是后端真分页。
- 前端每次会按每组最多 `12` 条请求当前首批结果。
- 每组当前批次结果再按每页 `4` 条切换。
- 因此页面中的“第 N / M 页”只表示当前批次内分页，不表示服务端已支持跨批次翻页。

## 3. 可执行回归矩阵

| 覆盖层 | 关注点 | 主要文件 | 命令 |
| --- | --- | --- | --- |
| 前端 API | URL 查询参数、默认不发送空 `types=`、鉴权头 | `frontend-user/src/api/searchShare.test.ts` | `npm run test:search:frontend` |
| 前端页面 | 空态、错误态、`types` 同步、来源链接、当前批次分页、`returnedCount` 提示 | `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx` | `npm run test:search:frontend` |
| 后端 service | 默认类型、非法类型、`limit` 边界、真实命中数、权限 spec、排序、摘要 | `backend/internal/modules/search/service/*.go` | `npm run test:search:backend` |
| 后端 handler | 查询参数解析、错误映射、success envelope | `backend/internal/modules/search/handler/*.go` | `npm run test:search:backend` |
| E2E smoke | 搜索页消费 grouped payload 并展示结果卡片 | `e2e/v1-public-flows.spec.ts` | `npm run test:search:e2e` |
| 文档同步 | 搜索说明与主文档保持一致 | `README.md` / `PROJECT_LOG.md` / `docs/engineering/*` | `npm run verify:docs` |

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

### 4.2 本轮最小验证

```powershell
cd backend
go test ./internal/modules/search/...

cd ..
npm --workspace frontend-user run test -- src/api/searchShare.test.ts src/modules/search/SearchWorkspacePage.test.tsx
```

## 5. 后续迭代提醒

- `SE-020` 仍未完成：后续还需要补服务端 cursor / offset / 等价分页令牌、排序语义暴露、搜索耗时和空结果建议。
- `WB-043` 若升级 `SearchIndexer` 或引入 Meilisearch，必须继续保持当前 `/api/v1/search` 的 grouped contract 兼容，除非明确引入迁移策略。
- `WB-050` 若补笔记双链 / 反链，应复用这里记录的来源跳转与权限边界，而不是另起一套搜索结果语义。
- 任何把“当前批次分页”误写成“后端已分页”的文档更新，都应视为契约漂移并立即修正。
