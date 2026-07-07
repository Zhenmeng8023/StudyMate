# 图谱 API 生命周期契约（WB-030）

## 目标

把 StudyMate 图谱后端已经存在的路由、持久化层和前端调用点收口成一份清晰的生命周期契约，明确以下问题：

- 哪些 endpoint 只读，哪些 endpoint 会推进图谱版本
- `graph` 摘要、`document` 当前文档、`snapshot` 历史快照和 `relation` 来源关系之间如何联动
- `graph.currentVersion`、`document.version` 和 `graph_versions.version_number` 的权威关系
- 导入、恢复、AI 变更确认等“整份文档替换”场景下，版本与 mode 如何更新

## 资源关系

### 1. Graph（MySQL 主记录）

`graphs` 表中的一行是图谱摘要与当前 head：

- 身份字段：`id`、`owner_user_id`
- 展示字段：`title`、`description`、`visibility`、`status`
- 语义字段：`graph_type`、`mode`
- head 字段：`current_version`
- 统计字段：`node_count`、`edge_count`

`current_version` 是“当前可写 head 版本号”的权威来源，而不是客户端上传的 `document.version`。

### 2. Current Document（Mongo 当前文档）

`graph_documents` 保存当前整份图谱文档：

- `graph_id`
- `version`
- `schema_version`
- `viewport`
- `nodes`
- `edges`
- `groups`
- `theme`
- `metadata`

这个集合只保存当前 head，不保存全部历史。

### 3. Snapshot（Mongo 历史快照 + MySQL 版本索引）

历史版本拆成两层：

- Mongo `graph_snapshots`：保存每个版本号对应的整份文档快照
- MySQL `graph_versions`：保存版本号、编辑者、摘要和 Mongo snapshot 引用

`graph_versions.version_number` 与快照文档里的 `version` 必须指向同一个逻辑版本。

### 4. Source Relations（MySQL 来源关系）

`graph_relations` 用于把节点来源关系抽出来，供搜索、回溯和后续学习闭环使用。

当前只同步 `relation_type = source`：

- `graph_id`
- `target_type`
- `target_id`
- `relation_type`

它来源于当前文档的节点 `source` 字段，不单独维护自己的版本号。

## Endpoint 矩阵

### 只读/不推进版本

- `GET /api/v1/graphs`
  返回 owner 的图谱摘要列表。
- `GET /api/v1/graphs/:id`
  返回图谱摘要 + 当前 `document`。
- `PUT /api/v1/graphs/:id`
  只更新 title / description / visibility，不推进 `currentVersion`。
- `GET /api/v1/graphs/:id/snapshots`
  返回历史版本索引列表。
- `POST /api/v1/graphs/:id/validate`
  对当前文档做结构校验，不写入任何持久化状态。
- `GET /api/v1/diagram/templates`
  返回模板元数据，不绑定某个 graph head。

### 推进版本 / 写入生命周期

- `POST /api/v1/graphs`
  创建 graph 主记录，并生成 version `1` 的 current document、snapshot 和 version 索引。
- `POST /api/v1/graphs/:id/batch-save`
  将客户端提交的整份 `document` 写成新的 head，推进 `currentVersion + 1`。
  如果请求里的 `document.version` 已落后于当前 `graphs.current_version`，则返回 `409 graph_version_conflict`，并且不得写入新的 current document、snapshot、version 索引或 relation。
- `POST /api/v1/graphs/:id/restore`
  从某个历史 snapshot 读取旧文档，但恢复结果会写成新的 head 版本，而不是回退 `currentVersion`。
- `POST /api/v1/graphs/:id/import/markdown`
  解析 Markdown 后写成新的 head 版本。
- `POST /api/v1/graphs/:id/import/mermaid`
  解析 Mermaid 后写成新的 head 版本。
- `POST /api/v1/graphs/:id/ai/commit-changes`
  应用 AI 图谱变更草稿后写成新的 head 版本。

### 生命周期外但共享当前文档

- `POST /api/v1/graphs/:id/ai/generate-cards`
  读取当前文档并生成卡片草稿，不推进版本。
- `POST /api/v1/graphs/:id/ai/commit-cards`
  把草稿写入 deck/card 域，不修改 graph head。

## 版本策略

### 权威规则

1. `graphs.current_version` 是当前 head 版本号的唯一权威。
2. 所有写入型生命周期操作都必须基于服务端权威版本推进，而不是相信客户端带来的 `document.version`。
3. 返回给前端的 `GraphDetailPayload.currentVersion` 与 `document.version` 必须一致，指向新的 head。

### 当前实现约束

- `graphdto.NormalizeDocumentPayload(graphID, version, document)` 现在会强制把 `graphId` 和 `version` 对齐为服务端传入值。
- `batch-save` 现在会先校验 `request.document.version == graphs.current_version`；如果客户端基于旧标签页或旧草稿保存，则返回 `409 graph_version_conflict`，而不是静默覆盖更新过的 head。
- 这条规则同时用于：
  - batch-save
  - import markdown / mermaid
  - snapshot restore
  - Mongo current document / snapshot 读写归一化

这样可以避免客户端或旧 snapshot 把过期版本号继续写回 head。

### Snapshot Restore 语义

恢复不是“把 head 版本号回退到旧值”，而是：

1. 按请求读取旧 snapshot，例如版本 `2`
2. 计算新的 head 版本，例如当前 `4 -> 5`
3. 把旧 snapshot 内容写成新的 current document，版本号改写为 `5`
4. 新建 Mongo snapshot `5` 和 MySQL `graph_versions.version_number = 5`

因此恢复操作是“以旧内容生成新 head”，不是“复活旧 head”。

## 前端本地草稿恢复边界

图谱工作区当前补上的不是“离线分支合并”，而是一个更保守的同图谱恢复边界：

- dirty 工作区会把当前 `graphId`、`currentVersion`、`title`、`description` 和 `document` 写入浏览器 `sessionStorage`
- 同一图谱重新打开时，只有在服务端 `currentVersion` 仍与本地草稿记录一致时，才恢复这份本地草稿
- 一旦服务端 head 已推进到更新版本，本地 stale draft 会被清理，而不是静默重新套回当前画布
- stale draft 被放弃时，前端会显式提示“本地草稿基于旧版本，已放弃恢复并加载最新图谱”，避免用户误以为草稿无故丢失

这意味着本地草稿恢复只负责“同版本未保存编辑找回”，并不替代服务端版本推进、冲突解决或多端合并策略。

## 前端跨窗口冲突提示边界

为避免用户只在点击保存后才第一次知道冲突，图谱工作区新增了一层更轻量的跨窗口信号：

- 每个窗口都会按 `graphId + sessionId` 把自己的 `dirty/currentVersion` 状态写入浏览器 `localStorage`
- 其他窗口收到同图谱的 `storage` 事件后，会在以下场景给出前置提示：
  - 另一窗口仍在 dirty 编辑：提醒当前用户保存前先确认最新版本
  - 另一窗口已保存更高版本：提醒当前用户先刷新图谱后再继续编辑
- 当前前端还补了一层显式用户动作：
  - 当另一窗口已保存更高版本，或当前窗口 batch-save 命中 `409 graph_version_conflict` 时，状态栏会提供 `重新加载最新图谱`
  - 如果当前工作区仍是 dirty，点击重载前必须先确认放弃未保存修改
  - 如果当前工作区仍有未保存修改，页面还会额外提供两类留存辅助：
    - `复制冲突摘要` / `导出冲突摘要`：先带走一份人类可读的 Markdown 冲突报告，便于同步当前取舍信息
    - `复制当前草稿 JSON` / `导出当前草稿 JSON`：继续保留完整草稿数据，便于后续人工恢复或再导入
    - `复制最新图谱 JSON` / `导出最新图谱 JSON`：在已拿到服务端最新 head 时，把最新版本原文也一并带走，方便和本地草稿做外部 diff 或后续人工合并
    - `导出冲突处理包`：把本地草稿 JSON、最新图谱 JSON 和可读冲突摘要打包到单一 JSON 文件里，减少后续人工比对时重新拼材料的步骤
  - 冲突辅助卡片会基于“最后一次已同步成功的图谱基线”展示当前未保存修改摘要，例如标题/说明变化、节点/连线/分组的新增或修改数量
  - 冲突辅助卡片还会静默拉取一次服务端最新 head，并额外展示“与最新图谱相比”的差异摘要，帮助用户理解自己当前草稿和最新版本之间的主要差异
  - 当前摘要已进一步细化到“计数 + 关键对象名”的粒度，例如直接提示“节点：新增 1 个（新概念）”或“标题已修改（当前：Graph；基线：Graph on server）”
- 新增的冲突摘要报告会把图谱标题、版本、当前未保存修改摘要和“与最新图谱相比”的差异摘要组织成一份可复制/可导出的 Markdown 文本，避免用户只能带走原始 JSON
- 新增的冲突处理包会进一步把“本地草稿 JSON + 最新图谱 JSON + 可读冲突摘要”收口到单一导出文件，便于稍后做人工比对或外部 diff
- 冲突摘要导出与冲突处理包现在都会附带“建议的人工合并步骤”清单，至少覆盖本地草稿留存、本地摘要核对、最新 head 差异核对，以及最后再决定是否重载
- 冲突辅助卡片、冲突摘要报告和冲突处理包现在还会统一附带对象级差异明细，至少覆盖 `node / edge / group` 的新增、修改、删除，并采用 `节点｜新增｜新概念` 这类统一文本格式，方便人工逐项核对
- 冲突处理包中的 `localDraft.details` / `latestHead.details` 与 Inspector 冲突卡片共享同一份对象级差异来源，避免页面展示、Markdown 摘要和导出 JSON 三处的冲突对象判断不一致
- 冲突辅助卡片现在还允许用户直接在对象级明细旁标记 `保留本地` / `保留服务端` / `稍后处理` 三类取舍草稿；这些标记会同步进入 Markdown 冲突摘要的“当前人工取舍草稿”段落，以及冲突处理包中的 `resolutionDraft` 字段
- 当前这层取舍草稿只负责记录对象级决策意图，不会直接改写 graph document，也不会替代真正的自动合并；它的职责是把人工合并前的判断显式化、可导出化
- 冲突辅助卡片现在还会直接给出处置引导：如果确认放弃本地修改，可在卡片内直接触发 `放弃本地并重载最新图谱`；如果打算稍后人工合并，则优先导出冲突处理包后再重载
  - 一旦任意冲突材料成功复制或导出，卡片还会显式提示“已留存冲突材料，可安全重载最新图谱”，避免用户在重载前还要自行回忆材料是否已经留好
  - 当用户决定这次先不重载时，卡片现在还支持显式标记 `先保留本地，稍后人工合并`，并提示“已标记为稍后人工合并，当前继续保留本地草稿”，把“这次先继续保留本地版本”的取舍也状态化
  - 重载会重新拉取最新 `getGraph(...)` head、重置本地 history/save-state，并给出“已重新加载最新图谱，未保存更改已放弃”之类的显式反馈
- 这层机制不做自动刷新、不做文档级合并，也不替代服务端 `409 graph_version_conflict`

因此，当前多窗口策略仍然是：

1. 先用本地提醒降低静默冲突概率
2. 真正写入时仍由服务端 `current_version` 校验兜底
3. 当确认当前窗口已落后时，由用户主动触发“重新加载最新图谱”并决定是否放弃本地未保存修改
4. 后续若要进入完整冲突解决流，仍需要在这些对象级明细和取舍草稿之上继续补显式应用动作、合并策略或更强的自动辅助能力

## Document / Node / Edge / Group 边界

### Document

`document` 是整份图谱的持久化边界，当前接口不提供单独的 node/edge/group CRUD endpoint。

所有节点、连线、分组的修改，当前都通过整份 `document` 的保存、导入、恢复或 AI 变更确认进入后端。

### Node / Edge / Group

- node / edge / group 在 API 层是 `document` 的组成部分
- 当前服务端不会单独给某个 node 或 edge 分配版本号
- 结构合法性由 `ValidateDocument(...)` 统一判断

这意味着：

- 版本推进的原子单位是整份 `document`
- node / edge / group 的生命周期依附于 `document.version`

## Mode 策略

`graphs.mode` 是 graph 摘要层面对当前文档语义的投影：

- `mermaid` 导入或恢复出 `metadata.importType = mermaid` 的文档时，`mode = diagram`
- 其他文档默认 `mode = free`

`restore` 现在也会基于恢复后的文档重新计算 mode，避免 graph 摘要和当前文档语义不一致。

## 回归锚点

### 后端

- `backend/internal/modules/graph/dto/document_contract_test.go`
  锁定 graphId/version 的服务端权威覆盖规则。
- `backend/internal/modules/graph/service/service_test.go`
  锁定 create / batch-save / restore 的版本推进、snapshot 写入和 mode 恢复。
- `go test ./internal/modules/graph/dto ./internal/modules/graph/service ./internal/modules/graph/handler ./internal/modules/graph/repository`

### 前端

- `frontend-user/src/api/graphs.test.ts`
  锁定 batch-save / snapshots / restore / import / validate / templates 的 endpoint path、method 和 body 形状。
- `frontend-user/src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts`
  锁定本地草稿按 graph 维度落盘、读取、清理，以及仅在 `currentVersion` 一致时恢复。
- `frontend-user/src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts`
  锁定跨窗口编辑 signal 的 key、落盘与清理。
- `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`
  锁定同图谱重开后的本地草稿恢复提示、stale draft 弃用提示、dirty 状态保持与恢复后画布可见性。
- `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`
  锁定跨窗口 dirty 编辑提醒和“另一窗口已保存更高版本”提醒。

## 后续边界

`WB-030` 只收口现有生命周期契约，不在本包内新增：

- graph export 后端产物接口
- thumbnail 渲染/上传生命周期
- 自动保存后的多窗口冲突解决
- optimistic locking / 多端并发策略
- node / edge / group 单资源级 API

其中导出 / 缩略图 / 布局边界已在 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md` 收口；自动保存冲突、多端并发和单资源级 API 继续属于后续 `WB-032` 与 `WB-034`。
