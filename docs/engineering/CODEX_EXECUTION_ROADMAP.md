# StudyMate 后续执行路线图（基于 2026-07-01 实际仓库）

**原则：先收口安全默认值、质量门禁、设计系统与 API 契约，再补强已有搜索与图谱闭环，最后再扩展工程图谱与桌面端。**

## 2026-07-08 PDF 计划评审导入

### 评审结论

本次读取《StudyMate 代码审查与后续开发建议》后，与当前真实仓库进度对齐：

- 仍成立：设计 token 重复、`packages/ui` / `packages/api-client` / `packages/editor-core` 仍接近占位、页面状态协议未全站统一、图谱工作区控制器过大、管理端仍是单工作台组件、共享 API/会话层不足、搜索仍缺服务端真分页与真实命中统计。
- 需修正：真实仓库已有根 `package.json`、`package-lock.json`、`.github/workflows/ci.yml` 与默认 CI；因此不再把“缺少根工程入口/CI”作为事实，只保留 graph-core TypeScript 测试运行方式、工具链版本与 bootstrap 可复现性的二次收口任务。
- 执行策略：不新开课程、协作、桌面端或向量搜索；先把现有 Web 主站、后台、图谱和学习闭环收成统一的产品工作台。

### 新增任务流

- **FE-040 / FE-041：设计系统收口**
  建立 `packages/design-tokens` 或等价共享 token 来源，消除 `app.css` 与 `ui-redesign.css` 的同名 token 漂移；让 `@studymate/ui` 至少沉淀 Button、IconButton、Input、Select、Tag、DataState、Drawer、Inspector、ConfirmDialog、CommandBar、PageHeader 的跨端视觉契约。
- **API-010 / API-011：共享 API 与会话层**
  把 request、error、pagination、upload、auth-session、401 refresh/replay/fail-logout 从前后台页面中抽到 `packages/api-client`，前后台不再各自手写 fetch/错误处理。
- **DEV-010：工程可复现性二次核验**
  在真实仓库基础上补 Node/Go 版本约束、bootstrap 入口、依赖审计和 graph-core TypeScript 测试运行器，避免依赖不同 Node 版本对 `.ts` 测试的隐式支持。
- **GPH-040：图谱控制器拆分**
  在 `WB-032` 稳定后，把 `useGraphWorkspaceController` 中的浏览器状态迁入 store，把用户意图迁入 commands，把业务能力拆入 features；页面只拼装 Canvas、ResourceDrawer、Inspector、CommandBar、StatusOverlay。
- **ADM-010 / ADM-011：后台治理路由化与动作化**
  管理端从单组件工作台迁到 Vue Router 模块 URL，并逐步补用户治理、资料治理、举报处理、AI 任务、图谱模板、审计日志的动作、备注、失败重试与权限边界。
- **SE-020 / WB-044：搜索产品化**
  先在 MySQL fallback 上补服务端 cursor/分页、真实 count/total、排序、耗时、空结果建议和来源跳转契约；再评估 Meilisearch adapter 和异步索引任务。
- **LC-010：主演示学习闭环**
  把“资料上传 -> PDF 阅读 -> 高亮批注 -> 摘录池 -> 笔记 -> 图谱节点草稿 -> 图谱关系整理 -> 卡片草稿 -> 今日复习”做成可验收主路径，避免平均扩展功能。

## Iteration 0：WB-001 基线核验已完成

### 已核验结论

- 搜索模块、分享模块、后台治理 API、CI workflow 都已真实存在。
- 前后端根入口已瘦身，`App.tsx` / `App.vue` 不再是主矛盾。
- 当前最大的 P0 风险是配置默认值、CI 质量闸门和工程执行文档漂移。

### Iteration 0 当前状态

- WB-001 已完成：基线核验与执行文档收口。
- WB-002 已完成：环境变量与安全默认值第一轮收口。
- WB-003 已完成：在现有 `.github/workflows/ci.yml` 基础上补齐 `gofmt` 与配置安全最小门禁，并验证 `npm run ci` 全绿。
- WB-004 已完成：README / ROADMAP / VERSION_PLAN / CHANGELOG / release checklist / PROJECT_LOG / 执行文档已与 `WB-002`、`WB-003` 的工程基线同步。
- 当前建议从 `WB-010` 开始，优先收口统一搜索契约与权限测试。

## Iteration 1：最小统一搜索补强（P0）

### 目标

不再从零建设搜索，而是在现有 `search` 模块基础上完成契约、权限、测试和文档收口。

### 当前状态

- WB-010 已完成：默认搜索分组、非法 `types` 校验、`limit` 边界与 `source` 字段语义已在后端测试、前端 API 测试和开发文档中固定。
- WB-011 已完成：搜索 fallback 现已按“标题命中优先、同级保留最新顺序”的规则稳定排序，并统一把长摘要压缩为单行 160 字符内预览。
- WB-012 已完成：搜索 fallback 的可见性/归属约束已由纯 `spec` 测试锁定，匿名请求不会落到 note/graph/card，graph 搜索补上 `active` 状态过滤。
- WB-013 已完成：搜索页现已补上 URL 驱动的类型筛选、空态/错误态、来源跳转和“当前批次内”分页切换，并有页面级回归测试锁定。
- WB-014 已完成：搜索 API / 权限 / 页面行为与自动化映射已集中沉淀到单一文档，并提供 `npm run verify:search` 固定入口。
- 当前已进入 `WB-032`，已补上 batch-save 版本冲突可见性、dirty 状态下禁止恢复快照、“同图谱 + 同版本”本地草稿恢复、跨窗口编辑/更高版本保存的前置提醒、冲突后的显式“重新加载最新图谱”决策流、dirty 冲突态下的本地草稿复制/导出辅助、可直接带走的 Markdown 冲突摘要、服务端最新图谱 JSON 留存辅助、单文件冲突处理包导出、基于最后同步基线的“当前未保存修改摘要”、面向服务端最新 head 的差异摘要，以及“计数 + 关键对象名”的更细粒度冲突提示；当前进一步补上了显式处置引导、卡片内重载入口、“已留存，可安全重载”的状态提示、“先保留本地，稍后人工合并”的显式状态流、写入冲突摘要/处理包的人工合并清单、冲突卡片 / 摘要 / 处理包共享的对象级节点-连线-分组差异明细、对象级 `保留本地 / 保留服务端 / 稍后处理` 取舍草稿、把这些取舍显式应用到最新 head 上生成可保存合并草稿的动作、应用前的最小跨对象依赖校验，以及未标记对象会默认沿用最新图谱版本的显式提示，下一步继续补更完整的多端冲突取舍能力。

### 工作包

- WB-010：核验并固定 `search` DTO、过滤参数、结果分组和来源字段。
- WB-011：补资料、笔记、图谱、帖子四类结果的聚合查询边界与排序规则。
- WB-012：补可见性/归属权限测试，确保不会泄露私有内容。
- WB-013：已完成，用户端搜索页现支持 URL `types` 筛选、来源链接跳转，以及每组 12 条结果批次内的 4 条分页展示。
- WB-014：已完成，搜索契约与回归矩阵集中记录在 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`，并通过 `npm run verify:search` 固定执行。

### 非目标

- 本轮不直接引入新的搜索引擎。
- 本轮不把搜索扩展为 AI 推荐、向量检索或 RAG。

## Iteration 2：图谱内核继续下沉（P0/P1）

### 目标

继续把图谱编辑器的纯逻辑从页面容器移入 `packages/graph-core`，减少工作区耦合。

### 工作包

- WB-020：已完成 `GraphDocument` / schemaVersion / 兼容读写模型收口，前后端默认化路径已显式统一。
- WB-021：已完成 viewport / selection / history / undo-redo 状态抽离与回归。
- WB-022：已完成 import / export / validation 统一接口收口。
- WB-023：已完成 graph-core 序列化、导入错误、旧数据兼容与历史栈回归测试，覆盖缺失 `schemaVersion` 的旧 `.smtg` 兼容导入，以及数组 root / 非法 `document` 包装拒绝。
- WB-030：已完成图谱 API 生命周期契约收口，新增 `GRAPH_API_LIFECYCLE.md`，并锁定服务端权威 version 覆盖与 restore-mode 同步规则。
- WB-031：已完成图谱导出、缩略图与布局契约收口，新增 `GRAPH_EXPORT_LAYOUT_CONTRACT.md`、`thumbnailFileId` head 字段和 `POST /graphs/:id/layouts/preview` 来源泳道预览接口。
- WB-032：进行中，batch-save 已拒绝旧版本 document 的静默覆盖，前端失败态测试已锁定冲突时 dirty 编辑不丢失，快照恢复已补“dirty 先保存再恢复”保护，同图谱重开可恢复同版本草稿，跨窗口会提示“另一窗口正在编辑/已保存更高版本”，并可在冲突后显式重载最新图谱、在放弃前复制或导出当前草稿 JSON、复制或导出可读冲突摘要、复制或导出服务端最新图谱 JSON、导出单文件冲突处理包，还能同时看到“当前未保存修改摘要”和“与最新图谱相比”的差异摘要，且摘要已细化到关键对象名；当前还新增了卡片内的显式处置引导、“放弃本地并重载最新图谱”入口、“已留存冲突材料，可安全重载最新图谱”的状态提示、“先保留本地，稍后人工合并”的显式标记与提示、随导出物一并带走的人工合并清单、Inspector / Markdown / bundle 共享的对象级差异明细、对象级取舍草稿、基于这些草稿生成 rebased merged draft 的显式应用动作、应用前的最小跨对象依赖校验，以及未标记对象默认沿用最新图谱版本的显式提醒。

## Iteration 3：图谱 API 生命周期与学习反馈（P1）

### 目标

让图谱从“强 MVP 页面”升级为“可靠领域对象”。

### 工作包

- WB-030：已完成 graph/document/node/edge/group/snapshot API 契约整理与版本推进测试。
- WB-031：已完成 export / thumbnail / layout 契约收口，布局预览现进入统一 API。
- WB-032：进行中，已补 batch-save `409 graph_version_conflict` 可见性、dirty 快照恢复前保护、同图谱本地草稿恢复、跨窗口编辑/更高版本保存提示、带放弃确认的显式重载最新图谱动作、dirty 冲突态下的本地草稿复制/导出辅助、可带走的冲突摘要复制/导出、服务端最新图谱 JSON 复制/导出、单文件冲突处理包导出、当前未保存修改摘要、面向最新 head 的差异摘要、更细粒度的关键对象名提示、卡片内的处置引导、材料已留存后的状态提示、“先保留本地，稍后人工合并”的显式状态提示、导出物里的人工合并清单、对象级 `node / edge / group` 冲突明细、对象级取舍草稿、把这些草稿显式应用成可保存合并草稿的动作、应用前的最小跨对象依赖校验，以及未标记对象默认沿用最新图谱版本的显式提醒；后续继续补更完整的 conflict handling。
- WB-033：把图谱节点、卡片复习和学习反馈真正串起来。
- WB-034：补图谱 API 与工作区回归验证。
- GPH-040：在 `WB-032` 完成后拆分图谱工作区 store / commands / features / views，禁止继续把新增冲突、AI、模板和来源逻辑堆入单一控制器。
- LC-010：以学习闭环主演示路径约束图谱-复习-笔记联动，所有新增入口必须能回到来源、草稿确认、卡片生成或复习反馈之一。

## Iteration 4：设计系统、API 契约与工程复现性（P0/P1）

### 目标

把“已有能力很多”收口为“新功能可以按同一套产品语言交付”：统一 token、统一基础状态、统一 API 错误与会话生命周期、统一可复现测试入口。

### 工作包

- FE-040：建立设计 token 单一来源与页面状态协议，先覆盖 Loading / Empty / Error / Unauthorized / Stale / Conflict。
- FE-041：让 `@studymate/ui` 从占位包升级为基础组件契约包，前后台共享视觉 token 和交互状态，不强行共用 React/Vue 组件。
- API-010：把前后台 request/error/pagination/upload 基础能力沉入 `packages/api-client`。
- API-011：补自动 refresh、401 单次重放、刷新失败统一退出与会话失效原因记录，并预留 HttpOnly Refresh Token 迁移说明。
- DEV-010：补工具链版本、bootstrap、依赖审计、graph-core TS 测试运行方式和可复现命令矩阵。

## Iteration 5：后台治理与搜索索引升级（P1）

### 目标

在已有后台治理与搜索模块之上，补强审计、操作能力和可替换索引。

### 工作包

- WB-040：继续完善真实只读治理页的数据质量与测试。
- WB-041：补审批动作、角色校验、分页筛选和状态流转。
- WB-042：完善审计事件模型。
- ADM-010：将管理端拆为 Vue Router 模块页面，提供 `/admin/dashboard`、`/admin/moderation`、`/admin/users`、`/admin/materials`、`/admin/reports`、`/admin/ai`、`/admin/files`、`/admin/audit-logs` 等可刷新 URL。
- ADM-011：把治理模块从只读列表推进到可执行任务，补封禁/解封、下架/恢复、举报处理备注、AI 任务重试/取消、模板审核/发布/下架等受控动作。
- SE-020：在现有 MySQL fallback 上补搜索服务端分页、真实命中数、排序语义、耗时和空结果建议。
- WB-043：在现有 `SearchIndexer` 边界上评估 / 接入 Meilisearch。
- WB-044：补搜索同步任务、失败重试、重建索引能力。

## Iteration 6：工程图谱 Alpha 与知识库深化（P2/P3）

### 工作包

- WB-050：笔记双链、反链、块级引用。
- WB-051：工程图导入 MVP，优先 OpenAPI 或 SQL DDL。
- WB-052：UML / ERD / C4 模板中心第一版。
- WB-053：代码分析图 MVP。
- WB-054：Tauri / 离线图谱技术预研。

## 统一研发节奏

```mermaid
flowchart LR
  A[核验当前代码] --> B[固定契约与边界]
  B --> C[先补测试或验证步骤]
  C --> D[最小实现]
  D --> E[运行自动化检查]
  E --> F[同步文档与任务状态]
  F --> G[交付当前工作包]
```
