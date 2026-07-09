# StudyMate 后续执行路线图（基于 2026-07-01 实际仓库）

**原则：先收口安全默认值、质量门禁、设计系统与 API 契约，再补强已有搜索与图谱闭环，最后再扩展工程图谱与桌面端。**

## 2026-07-08 PDF 计划评审导入

### 2026-07-09 API-010 共享请求基础层起步

- `packages/api-client` 已不再是只有健康检查的占位包；当前已开始承接共享 `requestApi(...)`、`readApiResponse(...)`、`createAuthHeaders(...)` 与 success/error envelope 类型。
- 用户端 `frontend-user/src/api/core.ts` 已切到复用这层共享请求入口，管理端 `AdminWorkspaceView.vue` 也已改为通过共享 client 发起后台请求，前后台开始进入同一套 request / error / auth-header 语义。
- 管理端当前已新增 `frontend-admin/src/api/client.ts`，把 `get/post` 请求边界从页面层抽离出来；后续继续模块化时可以沿这层边界扩展，而不是再把 fetch helper 放回视图组件。
- `packages/api-client` 现已开始承接共享 `buildApiPath(...)`，用户端搜索与管理端治理列表的 `types` / `limit` 查询参数开始走同一套 query/pagination 拼接语义。
- `packages/api-client` 现也开始承接共享 JSON 请求体编码：前后台 API 调用点可直接传 plain object / array，由共享层统一序列化并补齐 JSON `Content-Type`，而 `FormData` 上传路径继续保持原生行为。
- `FormData` 上传不强制写入 JSON `Content-Type`、API envelope 错误抛出与 Bearer header 拼装都已由 `packages/api-client/src/index.test.ts` 锁定。
- Iteration 4 的下一步不应回到页面内继续散落 fetch helper；应继续沿 `API-010 / API-011` 把分页、401 refresh/replay、fail-logout 与更完整的会话生命周期沉到共享层。

### 2026-07-09 API-011 用户端共享会话刷新起步

- `packages/api-client` 已新增共享 `ApiRequestError` 与 `createSessionRequest(...)`，开始承接 401 单次 refresh/replay、并发 refresh 去重与 refresh 失败时的本地 session 清理。
- 用户端新增 `frontend-user/src/app/sessionStore.ts` 并让 `routes.tsx` 改为通过 `useSyncExternalStore(...)` 订阅 session，refresh 成功或失败后，受保护路由能跟随同一份持久化状态更新，而不是停留在一次性的 `useState(...)` 快照。
- `frontend-user/src/api/core.ts` 已统一通过 `/api/v1/auth/refresh` 刷新 Access Token，`withAuth(...)` 也会优先消费最新持久化 session，避免旧页面 props 把 stale token 覆盖回请求头。
- `frontend-user/src/api/sessionRefresh.test.ts` 已锁定图谱列表在 401 后刷新并重放请求、同时更新本地 session 的闭环；共享层并发 refresh 行为也已由 `packages/api-client/src/index.test.ts` 锁定。
- 这一步已经让用户端先进入共享会话生命周期；管理端接线与会话失效原因记录仍需继续沿 `API-011` 收口。

### 2026-07-09 API-011 管理端共享会话刷新起步

- `packages/api-client` 的 `createSessionRequest(...)` 已支持显式 `sessionOverride`，管理端在沿用页面内 session 入参时，也能复用共享 401 refresh/replay/fail-logout 生命周期。
- 新增 `frontend-admin/src/api/sessionStore.ts` 后，后台会话读取、持久化与订阅不再散落在视图层；`frontend-admin/src/api/client.ts` 现已统一通过 `/api/v1/auth/refresh` 刷新后台 Access Token。
- `frontend-admin/src/views/AdminWorkspaceView.vue` 登录、自举与退出流程已接到共享 session store；refresh 失败时会清空后台会话、重置治理工作台状态并回退到登录界面。
- `frontend-admin/src/api/client.test.ts` 与 `frontend-admin/src/views/AdminWorkspaceView.test.ts` 已锁定“后台令牌过期后自动刷新并重放请求”以及“后台启动 refresh 失败后返回登录页”的回归。
- `API-011` 现在已完成前后台第一段共享刷新骨架；后续重点转向会话失效原因记录、更多后台模块接线与 HttpOnly Refresh Token 迁移说明。

### 2026-07-09 API-011 会话失效原因与统一提示语义

- `packages/api-client` 的 `createSessionRequest(...)` 现在会在 refresh 失败时产出结构化 `SessionInvalidationState`，而不是只清空 session；前后台都能读取统一的失效原因。
- `frontend-user/src/app/sessionStore.ts` 与 `frontend-admin/src/api/sessionStore.ts` 已分别为 session 和 invalidation 元数据提供读写/订阅入口；refresh 成功会清掉旧 invalidation，refresh 失败则保留原因给登录页消费。
- 用户端登录页与管理端登录页现在都会在被动登出后显示统一的重新登录提示；手动退出会主动清掉旧 invalidation，避免下次进入时误报“会话已失效”。
- `API-011` 当前仍未结束，但“会话失效原因记录 / 统一 fail-logout 提示语义”这段骨架已收口，下一步更适合转向 HttpOnly Refresh Token 迁移说明与后台更多模块 API 接线。

### 2026-07-09 FE-040 / FE-041 共享状态契约起步

- `packages/ui` 已从纯占位包升级为最小共享状态契约层，先导出 `DataStateKind`、`dataStateKinds` 与 `getDataStateLabel(...)`。
- 用户端 `DataState` 已改为直接消费这层共享契约，并补齐 `conflict` 页面状态语义，作为阅读、笔记、复习等工作台后续统一状态协议的第一步。
- `packages/ui` 已新增共享 `tokens.css`，并通过 `@studymate/ui/tokens.css` 接入用户端样式入口；`app.css` 与 `ui-redesign.css` 内重复的根 token 块已经移除，FE-040 从“要做”推进到“已开始落地”。
- 管理端 `frontend-admin/src/main.ts` 现也已接入 `@studymate/ui/tokens.css`，`admin.css` 的基础背景 / 文本 / 描边 / accent 变量已映射到共享 token，前后台开始进入同一套视觉源头。

### 2026-07-09 FE-041 共享基础组件契约第一批落地

- `@studymate/ui` 现在已开始直接导出共享 `DataState`、`Drawer`、`Inspector` 三个基础 primitive，而不再只提供 token 与状态文案 helper。
- 用户端 `frontend-user/src/design-system/primitives/` 中对应文件已收口为兼容转发层，现有 import 路径不变，但真实实现与最小测试已经集中回到 `packages/ui`。
- 这一步仍然只覆盖第一批最稳定 primitives；`FE-041` 后续重点应继续推进 Button、Input、Select、Tag、ConfirmDialog、CommandBar、PageHeader 等组件级契约，而不是停留在“共享变量但不共享构件”的状态。

### 2026-07-09 FE-041 共享 IconButton 与骨架接线

- `@studymate/ui` 已新增共享 `IconButton`，统一 `icon-button` / `active` class 语义，并开始收口顶栏、图谱 command bar、图谱工具栏这类骨架层图标动作。
- 用户端 `CommandBar`、`GraphWorkspaceCanvasChrome`、`GraphWorkspaceShell` 与共享 `Drawer` 已接入这层共享 primitive，说明 `FE-041` 正在从“共享单个组件”推进到“共享组件被多个主路径真实消费”。
- Iteration 4 的下一步应继续把更多现有 primitives 和管理端细节样式收敛到这层共享 token 和状态契约，而不是继续散落在各端页面里维护。

### 2026-07-08 FE / UI 验证收口更新

- FE-010、FE-020、FE-030 与 UI-04 已在真实依赖环境完成类型检查、相关 Vitest、前后台构建与 4 条 Playwright smoke。
- 这意味着当前 Iteration 4 不再需要为 FE / UI 保留“等待完整 npm 依赖后再验证”的前置说明，后续优先级回到 `WB-032`、`WB-034` 与设计系统 / API client 收口。
- 仍未补齐的是多分辨率截图留档与更完整的图谱工作区回归矩阵，它们继续作为后续质量工作包而非当前 FE/UI 实现阻塞项。

### 评审结论

本次读取《StudyMate 代码审查与后续开发建议》后，与当前真实仓库进度对齐：

- 仍成立：共享设计 token 虽已覆盖前后台入口，但更多基础组件与管理端细节视觉契约仍未接入；`packages/ui` 与 `packages/api-client` 都已开始脱离占位态，但页面状态协议未全站统一、共享 API 会话生命周期仍不足、`packages/editor-core` 仍偏薄、图谱工作区控制器过大、管理端仍是单工作台组件、搜索仍缺服务端真分页与真实命中统计。
- 需修正：真实仓库已有根 `package.json`、`package-lock.json`、`.github/workflows/ci.yml` 与默认 CI；因此不再把“缺少根工程入口/CI”作为事实，只保留 graph-core TypeScript 测试运行方式、工具链版本与 bootstrap 可复现性的二次收口任务。
- 执行策略：不新开课程、协作、桌面端或向量搜索；先把现有 Web 主站、后台、图谱和学习闭环收成统一的产品工作台。

### 新增任务流

- **FE-040 / FE-041：设计系统收口**
  建立 `packages/design-tokens` 或等价共享 token 来源，消除 `app.css` 与 `ui-redesign.css` 的同名 token 漂移；让 `@studymate/ui` 至少沉淀 Button、IconButton、Input、Select、Tag、DataState、Drawer、Inspector、ConfirmDialog、CommandBar、PageHeader 的跨端视觉契约。
- **API-010 / API-011：共享 API 与会话层**
  把 request、error、pagination、upload、auth-session、401 refresh/replay/fail-logout 从前后台页面中抽到 `packages/api-client`，前后台不再各自手写 fetch/错误处理；当前已完成最小 request/error/auth-header 起步，并开始统一 query/pagination 参数拼接与 JSON 请求体编码，后续继续补齐更完整的分页与会话生命周期。
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
- 当前已进入 `WB-032`，已补上 batch-save 版本冲突可见性、dirty 状态下禁止恢复快照、“同图谱 + 同版本”本地草稿恢复、跨窗口编辑/更高版本保存的前置提醒、冲突后的显式“重新加载最新图谱”决策流、dirty 冲突态下的本地草稿复制/导出辅助、可直接带走的 Markdown 冲突摘要、服务端最新图谱 JSON 留存辅助、单文件冲突处理包导出、基于最后同步基线的“当前未保存修改摘要”、面向服务端最新 head 的差异摘要，以及“计数 + 关键对象名”的更细粒度冲突提示；当前进一步补上了显式处置引导、卡片内重载入口、“已留存，可安全重载”的状态提示、“先保留本地，稍后人工合并”的显式状态流、写入冲突摘要/处理包的人工合并清单、冲突卡片 / 摘要 / 处理包共享的对象级节点-连线-分组差异明细、对象级 `保留本地 / 保留服务端 / 稍后处理` 取舍草稿、把这些取舍显式应用到最新 head 上生成可保存合并草稿的动作、应用前的最小跨对象依赖校验、未标记对象会默认沿用最新图谱版本的显式提示、阻断问题旁可直接触发的联动取舍建议、优先展示对象级短原因的预检阻断摘要、中文化的节点级阻断建议，以及优先展示可读对象名的阻断明细标题，下一步继续补更完整的多端冲突取舍能力。

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
- WB-032：进行中，batch-save 已拒绝旧版本 document 的静默覆盖，前端失败态测试已锁定冲突时 dirty 编辑不丢失，快照恢复已补“dirty 先保存再恢复”保护，同图谱重开可恢复同版本草稿，跨窗口会提示“另一窗口正在编辑/已保存更高版本”，并可在冲突后显式重载最新图谱、在放弃前复制或导出当前草稿 JSON、复制或导出可读冲突摘要、复制或导出服务端最新图谱 JSON、导出单文件冲突处理包，还能同时看到“当前未保存修改摘要”和“与最新图谱相比”的差异摘要，且摘要已细化到关键对象名；当前还新增了卡片内的显式处置引导、“放弃本地并重载最新图谱”入口、“已留存冲突材料，可安全重载最新图谱”的状态提示、“先保留本地，稍后人工合并”的显式标记与提示、随导出物一并带走的人工合并清单、Inspector / Markdown / bundle 共享的对象级差异明细、对象级取舍草稿、基于这些草稿生成 rebased merged draft 的显式应用动作、应用前的最小跨对象依赖校验、未标记对象默认沿用最新图谱版本的显式提醒、阻断问题旁的联动取舍建议、优先展示对象级短原因的预检阻断摘要、中文化的节点级阻断建议，以及优先展示可读对象名的阻断明细标题。

## Iteration 3：图谱 API 生命周期与学习反馈（P1）

### 目标

让图谱从“强 MVP 页面”升级为“可靠领域对象”。

### 工作包

- WB-030：已完成 graph/document/node/edge/group/snapshot API 契约整理与版本推进测试。
- WB-031：已完成 export / thumbnail / layout 契约收口，布局预览现进入统一 API。
- WB-032：进行中，已补 batch-save `409 graph_version_conflict` 可见性、dirty 快照恢复前保护、同图谱本地草稿恢复、跨窗口编辑/更高版本保存提示、带放弃确认的显式重载最新图谱动作、dirty 冲突态下的本地草稿复制/导出辅助、可带走的冲突摘要复制/导出、服务端最新图谱 JSON 复制/导出、单文件冲突处理包导出、当前未保存修改摘要、面向最新 head 的差异摘要、更细粒度的关键对象名提示、卡片内的处置引导、材料已留存后的状态提示、“先保留本地，稍后人工合并”的显式状态提示、导出物里的人工合并清单、对象级 `node / edge / group` 冲突明细、对象级取舍草稿、把这些草稿显式应用成可保存合并草稿的动作、应用前的最小跨对象依赖校验、未标记对象默认沿用最新图谱版本的显式提醒、阻断问题旁的联动取舍建议、优先展示对象级短原因的预检阻断摘要、中文化的节点级阻断建议、优先展示可读对象名的阻断明细标题、latest-head `removed` 对象的联动建议方向修正，以及多目标连线 `metadata.targetNodeIds` 里的附加依赖节点联动建议；当前这条多目标依赖路径、latest-head 删除语义下的分组依赖路径，以及 latest-head 删除语义下的多目标连线路径也已被 `GraphWorkspaceConflictResolutionDependencies` 页面级回归锁定，并开始覆盖更贴近真实操作的未标记回退路径，同时仓库已提供固定入口 `npm run verify:graph-conflicts`、带真实 `graph_version_conflict` 处理路径、窄屏 smoke、布局预览与导出状态、权限路径的图谱工作区回归 `e2e/v1-graph-workspace.spec.ts`，以及 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md` 作为后续 `WB-034` 的回归基座，后续继续补更完整的 conflict handling。
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
- API-011：继续补自动 refresh、401 单次重放、刷新失败统一退出与会话失效原因记录，并预留 HttpOnly Refresh Token 迁移说明；当前已完成前后台第一段共享刷新骨架。
- DEV-010：补工具链版本、bootstrap、依赖审计、graph-core TS 测试运行方式和可复现命令矩阵。
- SEC-010：在 `DEV-010` 的审计入口之上清空前端锁文件与 Go 依赖的高危命中，并把 `verify:deps` 纳入默认 CI。
- SEC-011：补仓库级 `verify:secrets` 扫描器，把默认 secret scan 门禁从 release checklist 落到可执行脚本与 CI。
- QA-010：补默认覆盖率基线门禁，把 `verify:coverage` 纳入 CI，同时保留 `test:coverage` 作为发布前详细汇总。

### 2026-07-09 DEV-010 工程可复现性二次核验与工具链收口
- 根 `package.json` 现已固定 `packageManager = npm@11.6.2` 与 `engines.node >=24 <25`、`engines.npm >=11 <12`，并新增 `bootstrap`、`verify:runtimes`、`verify:deps` 三个仓库级入口。
- `scripts/verify-runtime-baseline.mjs` + `scripts/workspace-repro.test.mjs` 现会校验运行时版本、manifest 约束、CI 预检链路，以及 `@studymate/graph-core` 是否使用显式 TypeScript 测试命令。
- `packages/graph-core/package.json` 不再直接依赖 `node --test test/*.test.ts`，而是改为显式 `--experimental-strip-types` 的测试与覆盖率命令，降低不同 Node 小版本对 `.ts` 测试执行差异带来的漂移。
- `scripts/run-dependency-audits.mjs` 把 npm 与 Go 的依赖审计统一收口到单一入口，并强制让 `npm audit` 使用 `registry.npmjs.org`，绕过 `npmmirror` 缺失 audit API 的历史阻塞。

### 2026-07-09 SEC-010 依赖安全基线收口
- 根 `package-lock.json` 现已同步到安全基线：`vite >= 7.3.6`、`esbuild >= 0.28.1`、`undici >= 7.28.0`、`glob >= 10.5.0`，并由 `scripts/dependency-security-baseline.test.mjs` 锁定这些最低版本不再回退。
- `frontend-user/package.json` 与 `frontend-admin/package.json` 现已把 `vite` 依赖下限提升到 `^7.3.6`；根 `package.json` 也同步将 `vitest`、`@vitest/coverage-v8` 与 `@vue/test-utils` 提升到能拉起安全锁文件的版本下限。
- `backend/go.mod` 现已显式锁定 `toolchain go1.26.5`，并将 `golang.org/x/net` 升级到 `v0.55.0`、`github.com/quic-go/quic-go` 升级到 `v0.59.1`，把 `govulncheck` 命中的标准库 patch 漏洞与 Go 侧依赖漏洞一起收口。
- `.github/workflows/ci.yml` 现已显式使用 Go `1.26.5` 并执行 `npm run verify:deps`，因此默认流水线不再只“提供审计入口”，而是开始把依赖安全基线本身作为门禁。

### 2026-07-09 SEC-011 默认 secret scan 门禁收口
- 新增 `scripts/verify-secret-scan.mjs` 与 `scripts/secret-scan-baseline.test.mjs`，把仓库级密钥扫描从 release checklist 里的临时 `rg` 命令收口为可执行脚本与可回归基线测试。
- 扫描器当前会递归检查仓库中的文本文件，默认跳过 `node_modules`、`dist`、`coverage`、锁文件与二进制资源，并识别私钥块、常见 API Token 格式、DSN 内联凭据，以及 `apiKey` / `secret` / `token` / `password` 一类硬编码赋值。
- placeholder 示例值（如 `change-me-in-local-env`、`<secret-manager-value>`、`<local-password>`）会被显式忽略，同时支持通过 `secret-scan: allow` 为个别测试样例做最小范围豁免，避免把开发说明和示例 env 误判成生产泄漏。
- 根 `package.json`、`.github/workflows/ci.yml`、README、开发说明与 release checklist 现已统一改为 `npm run verify:secrets`，默认 CI 也开始把 secret scan 本身作为门禁。

### 2026-07-09 QA-010 默认覆盖率基线门禁收口
- 新增 `scripts/coverage-baseline.test.mjs` 与 `scripts/verify-coverage-gates.mjs`，把覆盖率门禁从“发布前手工查看汇总”推进到“默认 CI 显式阻断回退”的第一阶段。
- `verify:coverage` 当前会统一执行并解析四套结果：用户端与管理端读取 Vitest JSON summary，`@studymate/graph-core` 读取 Node test coverage 的 `all files` 汇总，后端读取 `go tool cover -func` 的总体 statements。
- 现阶段门禁策略是“不低于已验证仓库基线”，默认阈值收口为：`frontend-user 68/63/67/68`、`frontend-admin 70/67/64/75`、`graph-core 96/79/100`、`backend statements 25`。
- 根 `package.json`、`.github/workflows/ci.yml`、README、开发说明、版本计划、路线图与 release checklist 现已统一改为 `npm run verify:coverage` 作为默认入口，同时保留 `npm run test:coverage` 作为发布前详细汇总证据。

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
