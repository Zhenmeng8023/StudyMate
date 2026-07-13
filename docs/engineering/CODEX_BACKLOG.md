# StudyMate Codex 可执行任务队列

**状态约定：** `TODO` / `IN_PROGRESS` / `BLOCKED` / `DONE` / `VERIFY`

## P0：当前优先级

| ID | 状态 | 任务 | 依赖 | 主要影响范围 | 验收标准 |
|---|---|---|---|---|---|
| WB-001 | DONE | 项目基线核验与环境收口规划（已核验） | 无 | `docs/engineering/`、`.env.example`、根脚本、CI、config | 输出真实构建/测试矩阵、配置风险、文档漂移；不改业务行为。 |
| WB-002 | DONE | 环境变量与安全默认值收口 | WB-001 | `backend/internal/config`、部署文档、`.env.example` | 无危险默认 JWT/DSN；开发/测试/生产配置可区分；启动失败信息明确。 |
| WB-003 | DONE | 在现有 CI 基础上补强最小质量门禁 | WB-001 | `.github/workflows/*`、`package.json`、后端格式化与文档脚本 | 基于现有 workflow 增加 gofmt、失败定位和最小质量门禁，不破坏当前流水线。 |
| WB-004 | DONE | 版本与里程碑文档对齐 | WB-001 | README、CHANGELOG、PROJECT_LOG、路线与执行文档 | 文档体现当前“图谱产品化持续收口”的实际状态和下一步优先级。 |
| WB-010 | DONE | 核验并固定统一搜索契约 | WB-001 | `backend/internal/modules/search`、`frontend-user/src/api`、搜索文档 | 以现有 search module 为基线，固定 SearchResult、过滤参数、分页与来源字段。 |
| WB-011 | DONE | 聚合搜索结果质量补强 | WB-010 | `backend/internal/modules/search/service`、搜索文档 | 资料、笔记、图谱、帖子四类结果稳定可用，排序与摘要规则清晰。 |
| WB-012 | DONE | 搜索权限/可见性过滤与测试 | WB-011 | `backend/internal/modules/search/service`、搜索文档 | 不泄露私有笔记、私有图谱、未发布内容；覆盖核心权限情形。 |
| WB-013 | DONE | 用户端搜索页体验与回归补强 | WB-011 | `frontend-user` 搜索页与 API 调用点 | 关键词、类型筛选、分页、空态、错误态、来源跳转均可验证。 |
| WB-014 | DONE | 搜索文档与回归记录 | WB-012, WB-013 | tests/docs | 有可执行验证记录和当前 API 契约说明。 |
| WB-020 | DONE | 图谱文档模型与版本策略 | WB-001 | `packages/graph-core`、graph DTO | 明确 GraphDocument/schemaVersion，已有数据可兼容读取。 |
| WB-021 | DONE | 图谱 viewport/selection/history 抽离 | WB-020 | graph-core、GraphWorkspacePage | 撤销/重做、选择、视口状态可单测，页面层减少逻辑。 |
| WB-022 | DONE | 图谱 import/export/validation 统一接口 | WB-020 | graph-core、graph module | Mermaid/Markdown/SVG 迁入统一接口并保留兼容性。 |
| WB-023 | DONE | 图谱内核测试与迁移回归 | WB-021, WB-022 | graph-core tests | 序列化、撤销、导入错误、旧数据兼容有测试。 |
| FE-000 | DONE | 前端现状审计与布局规格冻结 | WB-001 | `docs/engineering/`、`docs/design/` | 已固化前后端能力矩阵、页面状态矩阵、四类布局模式与图谱重构边界。 |
| FE-010 | DONE | 多布局壳层与基础组件 | FE-000 | `frontend-user/src/app/`、`frontend-user/src/design-system/`、样式 | Standard / Studio / Canvas / Focus 路由布局可解析；Canvas 不挂全局 ContextPanel；基础组件与单测已添加，并已在 2026-07-08 跑通用户端 / 管理端类型检查、相关 Vitest、前后台构建与 Playwright 回归。 |
| FE-020 | DONE | 图谱 CanvasLayout 与资源 / Inspector 重构 | FE-010 | `frontend-user/src/modules/graph/` | 已实现资源区 Tab 化与覆盖式 Dock；Inspector 承接节点、历史、冲突和 AI；2026-07-08 已完成类型检查、Vitest、构建和图谱工作区 Playwright smoke。 |
| FE-030 | DONE | 阅读、笔记、复习工作区体验对齐 | FE-010 | `frontend-user/src/pages/ReaderPage.tsx`、`NotesPage.tsx`、`modules/review/`、`styles/studio-workspaces.css` | 阅读/笔记采用可收起资源区与检查器；复习采用单任务舞台和按需管理面板；既有 API 与数据契约不变，2026-07-08 已完成类型检查、Vitest、构建和阅读/复习/后台治理 Playwright 回归。 |
| FE-040 | IN_PROGRESS | 设计 token 单一来源与页面状态协议 | FE-010 | `packages/design-tokens` 或等价包、`packages/ui`、`frontend-user/src/styles/`、`frontend-admin/src/` | `app.css` 与 `ui-redesign.css` 的同名 token 漂移被收口；所有数据页统一声明 Loading / Empty / Error / Unauthorized / Stale / Conflict 状态语义。当前管理端模块页已接入 `loading / error / empty / stale / unauthorized / conflict` 的真实状态入口，用户端 `SearchWorkspacePage`、`DashboardPage`、`CommunityPage`、`MaterialsPage`、`ReviewWorkspacePage`、`NotesPage`、`ReaderPage`、`AiPage`、`SettingsPage`、`GraphWorkspacePage` 与 `SharePage` 已接入首批共享页面状态，其中首页已补上真实 `unauthorized / error` 入口，社区页、资料库、复习工作区、笔记工作区、阅读工作区、AI 工作台、设置页、图谱工作台和分享页也都已补上真实 `error / stale / loading` 落点；后续继续补更多用户端页面与跨端状态落点。 |
| FE-041 | IN_PROGRESS | `@studymate/ui` 基础组件契约出壳 | FE-040 | `packages/ui`、用户端 design-system、管理端 shared UI | `DataState`、`Drawer`、`Inspector`、`IconButton`、`Button`、`Tag`、`Input`、`Select`、`PageHeader`、`CommandBar`、`ConfirmDialog` 已收口到共享包并保留用户端兼容出口，且 `IconButton`、`Button`、`Tag`、`Input`、`Select`、`PageHeader`、`CommandBar`、`ConfirmDialog` 都已接到真实页面或图谱骨架；其中共享 `Select` 已覆盖笔记页、阅读页、复习工作区、图谱工作区与 AI 草稿中心里的高频下拉，共享 `PageHeader` 已覆盖主工作区页面、搜索工作区与图谱工作区，共享 `ConfirmDialog` 已覆盖笔记删除、图谱工作区的重载/删除确认，以及管理端审核队列里的通过/驳回/隐藏确认层；管理端也已新增 `AdminButton` / `AdminInput` / `AdminSelect` / `AdminPageHeader` / `AdminSearchToolbar` / `AdminCommandBar` / `AdminMetricCard` / `AdminDataCardHeader` / `AdminRecordInspector` / `AdminNavItem` / `AdminNavGroup` / `AdminActionBar` / `AdminTag` / `AdminFeatureCard` Vue 适配层，并接入登录、壳层、dashboard、审核与治理模块，其中审核/治理页已通过共享 `AdminSelect` 承载状态筛选，后台壳层顶部条已通过共享 `AdminCommandBar` 暴露统一 breadcrumb / 同步状态 / actions 契约，dashboard 与治理摘要区已通过共享 `AdminMetricCard` 收口重复卡片骨架，审核与治理模块的数据卡片标题区已通过共享 `AdminDataCardHeader` 暴露统一标题/说明骨架，治理记录详情区已通过共享 `AdminRecordInspector` 收口字段展示与动作区骨架，后台侧边导航项已通过共享 `AdminNavItem` 收口 active / badge / icon / press 契约，后台侧边导航分组也已通过共享 `AdminNavGroup` 收口标题与槽位骨架，审核行操作与治理详情动作则已通过共享 `AdminActionBar` 收口按钮组骨架，审核类型/状态标签与治理记录状态标签也已通过共享 `AdminTag` 收口 badge 语义，dashboard 的 priority/status 复合运营卡片也已通过共享 `AdminFeatureCard` 收口骨架，`AdminWorkspaceView.vue` 里的审核/治理数据区状态判定已收口到共享 `adminViewDataState` helper，加载请求失败状态和 403 清理已收口到共享 `adminViewLoadRequest` helper，dashboard 概览卡片已收口到共享 `adminOverviewCards` helper，治理模块描述/空态/加载配置也已收口到共享 `getGovernanceModuleConfig(...)` 出口，后续继续推进更多后台治理动作与跨端状态语义。 |
| API-010 | IN_PROGRESS | 前后台共享 API client core | WB-014, FE-040 | `packages/api-client`、`frontend-user/src/api`、`frontend-admin/src/` | request/error/pagination/upload 基础能力沉入共享包；新代码不再在页面组件里手写 fetch、错误解析和分页解析。 |
| API-011 | IN_PROGRESS | Token refresh 与统一会话生命周期 | API-010 | `packages/api-client`、auth 模块、前后台会话入口 | Access Token 过期后只刷新一次并重放原请求；刷新失败统一退出、清理本地状态并记录会话失效原因；请求阶段直接收到 `403 user_disabled` 时也会统一清 session 并给出禁用提示；补 HttpOnly Refresh Token 迁移说明。 |
| DEV-010 | DONE | 工程可复现性二次核验与工具链收口 | WB-003 | 根 workspace、lockfile、CI、graph-core 测试脚本、开发文档 | 在真实仓库基础上固定 Node/Go 版本、bootstrap 命令、依赖审计入口；`@studymate/graph-core` 改为显式 `--experimental-strip-types` 运行 `.ts` 测试，并新增运行时基线校验。 |
| SEC-010 | DONE | 依赖安全基线收口 | DEV-010 | `package-lock.json`、前台/后台 package manifest、`backend/go.mod`、CI、开发文档 | 锁定 `vite` / `esbuild` / `undici` / `glob` 与 Go toolchain / `golang.org/x/net` / `quic-go` 安全下限；`npm run verify:deps` 通过并纳入默认 CI。 |
| SEC-011 | DONE | 默认 secret scan 门禁收口 | SEC-010 | 根 `package.json`、`.github/workflows/ci.yml`、`scripts/`、发布/开发文档 | 新增 `npm run verify:secrets`、仓库级扫描脚本与基线测试；默认 CI 执行 secret scan，并对 placeholder 示例值保持低误报。 |
| QA-010 | DONE | 默认覆盖率基线门禁收口 | DEV-010, SEC-011 | 根 `package.json`、`.github/workflows/ci.yml`、`scripts/`、发布/开发文档 | 新增 `npm run verify:coverage`、覆盖率基线测试与统一解析脚本；默认 CI 阻断前后台、graph-core 与后端覆盖率回退，同时保留 `npm run test:coverage` 作为发布前详细汇总。 |

## P1：在 P0 稳定后推进

| ID | 状态 | 任务 | 依赖 | 主要影响范围 | 验收标准 |
|---|---|---|---|---|---|
| WB-030 | DONE | 图谱 API 契约与生命周期整理 | WB-020 | graph routers/handlers/services/docs | graph/document/node/edge/group/snapshot 关系和版本策略清晰。 |
| WB-031 | DONE | 图谱导出、缩略图与布局能力 | WB-030 | graph backend + frontend | 至少 JSON/SVG 导出；缩略图和布局有明确 API/任务模型。 |
| WB-032 | DONE | 自动保存/快照/冲突处理可靠性 | WB-030, WB-021 | graph persistence | 保存可追溯、冲突可见、恢复安全；无静默覆盖，冲突导出物可携带人工合并清单、对象级明细与取舍草稿，并支持把已标记取舍显式应用为可保存合并草稿；预检阻断摘要优先展示可读对象原因。 |
| ANKI-000 | TODO | Anki 式闪卡产品契约 | FE-030 | docs/engineering、docs/architecture、card/review domain | 明确 Deck、CardNote、NoteType、CardTemplate、GeneratedCard、Schedule、ReviewLog、Tag、SourceLink 的职责边界；确认哪些 Anki 能力进入 P1，哪些仅预研。 |
| ANKI-010 | TODO | Note / Card 分离与模板生成 | ANKI-000 | backend card models/dto/service、frontend review types | 支持一条 CardNote 通过模板生成一张或多张 Card；首批模板覆盖 Basic、Basic Reverse、Cloze；旧 `front/back` 卡片有兼容读取或迁移策略。 |
| ANKI-020 | TODO | Anki 式调度与队列模型 | ANKI-000 | card schedule service/repository/review API | 支持 new / learning / review / relearning / suspended / buried 状态、学习步进、每日新卡/复习上限、重新学习路径；继续保留 `again / hard / good / easy` 评分语义。 |
| ANKI-030 | TODO | Anki 式复习会话体验 | ANKI-010, ANKI-020 | `frontend-user/src/modules/review/`、review API | 复习会话支持翻面、1-4 评分、撤销上一次评分、跳过/埋藏、暂停卡片、来源查看、下一次间隔预估和键盘路径；失败状态不丢当前会话上下文。 |
| ANKI-040 | TODO | 卡片浏览器与批量管理 | ANKI-010, ANKI-020 | review/card browser UI + backend list/filter APIs | 支持按牌组、标签、状态、来源、到期时间筛选；支持批量暂停、恢复、移动牌组、加标签、删除；操作可确认并可审计/追溯。 |
| ANKI-050 | TODO | 来源驱动制卡闭环 | ANKI-010, WB-030 | reader/note/graph/ai/card | 批注、笔记块、图谱节点、AI 草稿可生成 CardNote，再由模板生成 Cards；所有卡片保留 SourceLink 并能回跳原文、笔记或图谱节点。 |
| ANKI-060 | TODO | 复习反馈回写学习图谱 | ANKI-020, ANKI-050 | graph/card/review/dashboard | 复习结果可回写图谱节点熟练度、笔记学习状态和工作台反馈；薄弱知识点可在图谱和学习工作台中解释。 |
| ANKI-070 | TODO | 闪卡导入导出与 Anki 兼容预研 | ANKI-010 | card import/export docs/tools | 近期支持 CSV / JSON 导入导出；`.apkg` 兼容只输出技术预研和采用/不采用结论，不阻塞 P1 主线。 |
| WB-033 | TODO | 图谱-复习学习反馈闭环 | ANKI-020, ANKI-050, WB-030 | graph/card/review | 基于 Anki 式 CardNote / Card / Schedule 模型串起图谱节点、卡片复习和学习反馈；卡片与来源节点可追溯，复习结果能回写节点熟练度。 |
| WB-034 | TODO | 图谱 API 与工作区回归验证矩阵 | WB-032 | graph backend + frontend + e2e | 覆盖 create/save/restore/export/layout/conflict/权限路径；图谱工作区在桌面与窄屏至少有 smoke 回归，不再只依赖零散组件测试。 |
| GPH-040 | TODO | 图谱工作区 store / commands / features 拆分 | WB-032, FE-020 | `frontend-user/src/modules/graph/`、`packages/graph-core` | `useGraphWorkspaceController` 不再继续承接新增业务；选中、相机、面板、保存、冲突等浏览器状态进入 store，新增节点/连线/分组/模板/恢复等用户意图进入 commands。 |
| LC-010 | TODO | 主学习闭环演示路径收口 | WB-033, ANKI-030, FE-030 | material/reader/note/graph/card/review/AI | “资料上传 -> PDF 阅读 -> 高亮批注 -> 摘录池 -> 笔记块 -> CardNote -> 模板生成闪卡 -> Anki 式复习 -> 图谱熟练度回写”可端到端验收，来源回跳、草稿确认、失败状态和复习反馈清晰。 |
| WB-040 | TODO | 管理端真实只读数据页第一批 | WB-001 | admin backend + frontend-admin | 用户、内容、AI 任务/用量、审计至少展示真实数据。 |
| WB-041 | TODO | 后台内容治理与审批状态流转 | WB-040 | admin/community/material/graph | 受控审核、筛选分页、角色校验、状态记录齐全。 |
| WB-042 | TODO | 审计事件模型 | WB-040 | backend migrations/admin services | 管理关键操作、审核、AI 重试等可查询追溯。 |
| ADM-010 | IN_PROGRESS | 管理端 Vue Router 模块化与 URL 状态 | WB-040, FE-040 | `frontend-admin/src/app/`、`frontend-admin/src/features/`、`frontend-admin/src/pages/` | 当前已具备 `/admin/dashboard`、`/admin/moderation`、`/admin/users`、`/admin/graph`、`/admin/ai`、`/admin/system`、`/admin/audit` 等可刷新、可回退、可直达 URL，并已拆出登录视图、已登录壳层以及 dashboard / moderation / governance 首批模块视图；后续继续推进真正 page / feature 边界与更完整的治理路由。 |
| ADM-011 | IN_PROGRESS | 后台治理动作化第一批 | ADM-010, WB-042 | admin modules + audit | 当前已落地五段真实治理切片并开始补强会话边界：举报支持 `resolve / dismiss`、写回 `handled_by / handled_at` 并进入审计链路；资料治理已切到真实 `/admin/materials` 列表，并可对资料执行 `approve / reject / hide`，其中已隐藏资料可直接恢复；AI 任务已支持 `retry / cancel` 状态动作与审计留痕；用户治理已支持 `disable / activate`，禁用时会撤销该用户仍有效的 refresh token，认证中间件会在请求时按数据库中的当前用户状态与角色做校验，且前端对运行中收到的 `403 user_disabled` 已能统一清 session 并回退登录页；图谱模板治理已切到真实 `/admin/diagram-templates` 列表，并可对模板执行 `publish / unpublish`，且会同步影响用户端 `/api/v1/diagram/templates` 可见性。后续继续补举报处理备注与更细粒度的资源权限边界。 |
| SE-020 | IN_PROGRESS | MySQL fallback 搜索服务端分页与真实统计 | WB-014 | search service/handler/frontend search | `GET /search` 支持 cursor/limit/sort 或等价分页；每类结果有真实命中数、搜索耗时、排序语义、空结果建议和来源跳转契约。 |
| WB-043 | TODO | SearchIndexer 升级与 Meilisearch 评估 | SE-020 | search module/config/deploy | 前端 API 不变；索引实现可替换，具备配置开关；明确是否进入 Meilisearch 的采用/不采用结论。 |
| WB-044 | TODO | 搜索同步与失败恢复任务 | WB-043 | jobs/queue/search | 具备重建索引、失败重试、幂等与可观测字段。 |

## P2/P3：在上述稳定后推进

| ID | 状态 | 任务 | 依赖 | 主要影响范围 | 验收标准 |
|---|---|---|---|---|---|
| WB-050 | TODO | 笔记双链、反链与块级引用 | WB-014 | note/search/graph | 双向链接、反链查询、来源跳转、索引同步可用。 |
| WB-051 | TODO | 工程图谱导入 MVP（择一首发） | WB-022, WB-030 | graph-import-export | OpenAPI/SQL DDL/PlantUML 之一稳定导入为草稿。 |
| WB-052 | TODO | UML/ERD/C4 模板中心第一版 | WB-051, WB-041 | graph/admin | 模板版本、审核/发布、用户创建与复用可用。 |
| WB-053 | TODO | Go 代码分析图 MVP | WB-051 | analysis jobs/graph | 路由图、ERD、模块依赖图至少一项可生成。 |
| WB-054 | TODO | Tauri 离线图谱技术预研 | WB-021, WB-031 | desktop prototype | 明确数据同步、文件模型、打包与采用/不采用结论。 |

## 执行记录

### 执行记录：PLAN-2026-07-13（Anki 式闪卡目标修正）

- 执行日期：2026-07-13
- 输入目标：用户明确希望复习卡片相关功能类似 Anki 闪卡，而不是简单复习。
- 本轮结论：
  - 当前 `card` 模块已有 `Deck / Card / Schedule / Review`、今日队列和 `again / hard / good / easy` 的 SM-2 调度，可作为迁移基础。
  - 当前模型仍偏 `front/back` 简单卡片，缺少 Anki 核心的 Note / Card 分离、模板生成、Cloze、学习队列、重新学习、暂停/埋藏、标签、浏览器、来源回跳和导入导出边界。
  - 新增 `ANKI-000` 至 `ANKI-070` 工作包，并将 `WB-033` 与 `LC-010` 调整为基于 Anki 式 CardNote / Card / Schedule 的学习反馈闭环。
- 约束：
  - P1 首轮只追求 Anki mental model 与 StudyMate 来源闭环，不把插件体系、完整 `.apkg` 兼容或复杂媒体同步作为当前阻塞项。
  - 所有新卡片能力必须保留资料、PDF 批注、笔记块、图谱节点或 AI 草稿的来源回跳。

### 执行记录：FE-041（管理端共享 Tag 状态标签接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminTag.vue` 与 `AdminTag.test.ts`，以 Vue 适配层收口后台标签的 `label / tone` 契约，避免审核与治理模块继续各自手写 `type/status badge` 结构。
  - 更新 `frontend-admin/src/views/modules/AdminModerationModule.vue` 与 `AdminModerationModule.test.ts`，把审核表里的内容类型和状态标签切到共享 `AdminTag`，同时保留搜索、筛选和动作区行为。
  - 更新 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 与 `AdminGovernanceModule.test.ts`，把治理表里的状态列切到共享 `AdminTag`，同时保留记录选择、详情展示和动作触发行为。
  - 更新 `frontend-admin/src/views/AdminWorkspaceView.test.ts`，把工作区级导航切换断言对齐到当前壳层真实使用的 `data-admin-nav-item-view` 钩子，避免回归测试继续依赖旧导航标记。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminTag.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台标签最小契约，状态颜色分级、角色/来源等更多标签语义和批量筛选 chip 还未进入统一适配层。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补列表内容摘要单元或批量治理工具条，而不是把标签结构再写回各模块页面。

### 执行记录：FE-041（管理端共享 ActionBar 动作区接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminActionBar.vue` 与 `AdminActionBar.test.ts`，以 Vue 适配层收口后台动作区的 `actions / variant / tone / press` 契约，并保留模块级 `data-*` 钩子，避免审核与治理模块继续各自内联按钮组结构。
  - 更新 `frontend-admin/src/views/modules/AdminModerationModule.vue` 与 `AdminModerationModule.test.ts`，把审核行操作切到共享 `AdminActionBar`，同时保留通过、驳回、隐藏三类治理动作及其事件回传。
  - 更新 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 与 `AdminGovernanceModule.test.ts`，把治理详情区动作切到共享 `AdminActionBar`，同时保留详情区字段展示、动作触发和筛选/选择行为。
  - 这一步也顺手把审核与治理模块及其测试收口到可读 UTF-8，减少后续继续推进共享骨架时被旧编码噪声反复拖慢。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminActionBar.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台动作区最小契约，批量操作条、权限驱动禁用态和更复杂的异步状态反馈还未进入统一适配层语义。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补列表内容摘要单元或后台批量治理工具条，而不是把动作按钮组结构再写回各模块页面。

### 执行记录：FE-041（管理端壳层共享 NavGroup 适配层接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminNavGroup.vue` 与 `AdminNavGroup.test.ts`，以 Vue 适配层收口后台侧边导航分组的 `title + slot` 骨架，避免壳层继续内联分组标题结构。
  - 更新 `frontend-admin/src/components/admin/AdminShellFrame.vue` 与 `AdminShellFrame.test.ts`，把后台侧边导航分组切到共享 `AdminNavGroup`，同时保留分组内导航项切换、刷新和退出行为。
  - 这一步也补强了壳层级回归，锁定 `AdminShellFrame` 已经同时通过共享 `AdminCommandBar`、`AdminPageHeader`、`AdminNavGroup` 与 `AdminNavItem` 暴露统一骨架，而不是只停留在局部组件新增。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminNavGroup.test.ts src/components/admin/AdminNavItem.test.ts src/components/admin/AdminShellFrame.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台导航分组最小契约，分组折叠、权限裁剪和移动端导航态仍未进入统一适配层语义。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补列表内容摘要单元或后台治理动作条，而不是把导航分组结构再写回壳层页面。

### 执行记录：FE-041（管理端共享 FeatureCard 复合卡片接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminFeatureCard.vue` 与 `AdminFeatureCard.test.ts`，以 Vue 适配层收口后台复合卡片的 eyebrow / title / description / actions / body 契约，避免 dashboard 继续内联 priority/status 两类运营卡片结构。
  - 更新 `frontend-admin/src/views/modules/AdminDashboardModule.vue` 与 `AdminDashboardModule.test.ts`，把优先队列卡和审核概览卡切到共享 `AdminFeatureCard`，同时保留概览统计、入口按钮和计数语义。
  - 这一步也把 dashboard 模块与测试收口到可读 UTF-8，减少后续继续推进共享骨架时被旧编码噪声拖慢。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminFeatureCard.test.ts src/views/modules/AdminDashboardModule.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是 dashboard 复合卡片最小契约，导航分组标题和更多后台运营卡片还没有一起纳入共享层。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补导航分组骨架或后台资料/审核列表里的内容摘要单元，而不是把 priority/status 卡片结构再写回模块页面。

### 执行记录：FE-041（管理端壳层共享 NavItem 适配层接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminNavItem.vue` 与 `AdminNavItem.test.ts`，以 Vue 适配层收口后台侧边导航项的 active / badge / icon / press 契约，避免壳层继续内联导航按钮结构。
  - 更新 `frontend-admin/src/components/admin/AdminShellFrame.vue` 与 `AdminShellFrame.test.ts`，把后台侧边导航按钮切到共享 `AdminNavItem`，同时保留现有分组、切换、刷新和退出行为。
  - 这一步也顺手把 `AdminShellFrame` 的文案与测试收口到可读 UTF-8，减少后续继续推进共享骨架时被旧编码噪声反复拖慢。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminNavItem.test.ts src/components/admin/AdminShellFrame.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台导航项最小契约，导航分组标题和 dashboard 复合卡片还没有一起纳入共享层。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补 dashboard priority/status 复合卡片或导航分组骨架，而不是把导航按钮结构再写回壳层。

### 执行记录：FE-041（管理端共享 RecordInspector 详情区接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminRecordInspector.vue` 与 `AdminRecordInspector.test.ts`，以 Vue 适配层收口后台记录详情区的 eyebrow / title / fields / empty / actions 契约，避免治理模块继续内联详情展示与动作区骨架。
  - 更新 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 与 `AdminGovernanceModule.test.ts`，把治理详情区切到共享 `AdminRecordInspector`，同时保留摘要卡片、搜索筛选、记录选择和治理动作行为。
  - `frontend-admin/src/views/AdminWorkspaceView.test.ts` 继续通过工作区级回归覆盖真实接线，确认这轮共享 inspector 抽离没有影响后台治理主路径。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminRecordInspector.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台记录详情区最小契约，尚未把 sidebar 导航、dashboard 复合卡片或更多治理模块详情页一起纳入共享层。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补后台导航项或 dashboard priority/status 复合卡片，而不是回到治理模块里继续内联 inspector 结构。

### 执行记录：FE-041（管理端共享 DataCardHeader 标题区接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminDataCardHeader.vue` 与 `AdminDataCardHeader.test.ts`，以 Vue 适配层收口后台数据卡片标题区的 title / description / actions 插槽契约，避免审核与治理模块继续各自手写同类头部结构。
  - 更新 `frontend-admin/src/views/modules/AdminModerationModule.vue` 与 `AdminModerationModule.test.ts`，把审核队列数据卡片标题区切到共享 `AdminDataCardHeader`，同时保留搜索、筛选、状态展示与动作流。
  - 更新 `frontend-admin/src/views/modules/AdminGovernanceModule.vue`、`AdminGovernanceModule.test.ts` 与 `AdminWorkspaceView.test.ts` 覆盖范围，确认治理记录列表也通过共享标题区骨架渲染，且不影响摘要卡片、搜索筛选、记录选择与治理动作。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminDataCardHeader.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台数据卡片标题区最小契约，记录详情 inspector、自定义 actions 布局和更多复合表头还没有一起纳入共享层。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补后台 inspector、priority/status 复合卡片或导航项适配层，而不是重新回到模块里内联这些标题区结构。

### 执行记录：FE-041（管理端共享 MetricCard 摘要卡片接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminMetricCard.vue` 与 `AdminMetricCard.test.ts`，以 Vue 适配层收口后台摘要卡片的 label / value / helper 契约，避免 dashboard 与治理摘要继续散落相同的 `metric-card` 结构。
  - 更新 `frontend-admin/src/views/modules/AdminDashboardModule.vue` 与 `AdminDashboardModule.test.ts`，把概览统计卡片切到共享 `AdminMetricCard`，同时保留优先队列与当前数据卡的现有行为。
  - 更新 `frontend-admin/src/views/modules/AdminGovernanceModule.vue`、`AdminGovernanceModule.test.ts` 与 `AdminWorkspaceView.test.ts` 相关回归覆盖范围，确认治理摘要区会通过共享卡片渲染，同时不影响列表筛选、选择与动作流。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminMetricCard.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台摘要卡片最小契约，`priority-card`、`status-card` 和更复杂的复合运营卡片还没有一起纳入共享层。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合优先补后台导航项、状态卡或更完整的 dashboard 卡片骨架，而不是回到单页面里重复内联这些结构。

### 执行记录：FE-041（管理端壳层共享 CommandBar 适配层接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminCommandBar.vue` 与 `AdminCommandBar.test.ts`，以 Vue 适配层收口后台顶部条的 breadcrumb、同步状态与 actions 插槽契约，避免壳层继续直接内联这组骨架结构。
  - 更新 `frontend-admin/src/components/admin/AdminShellFrame.vue`，把后台全局顶部条切到共享 `AdminCommandBar`，保留现有“运营中心 / 当前模块 / 同步状态 / 刷新数据”语义与 `AdminButton` 动作。
  - 更新 `frontend-admin/src/components/admin/AdminShellFrame.test.ts`，锁定后台壳层已经通过共享 `AdminCommandBar` 暴露统一顶部骨架出口，而不是只新增了一个未接线的适配组件。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminCommandBar.test.ts src/components/admin/AdminShellFrame.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前这轮先收口的是后台壳层顶部条最小契约，尚未把导航分组、通知提示或更复杂的顶部搜索/快捷动作一起纳入统一骨架。
  - 后续继续沿 `FE-041 / ADM-010` 推进时，更适合把后台 metric card、导航 item 或更完整的治理 command bar 继续沉成稳定适配层，而不是重新把顶部结构写回壳层页面。

### 执行记录：FE-041（管理端共享 Select 状态筛选接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminSelect.vue` 与 `AdminSelect.test.ts`，以 Vue 适配层收口管理端 `Select` 的 `ds-select`、双向绑定和错误态最小契约，避免后台筛选器继续停留在局部裸 `select`。
  - 更新 `frontend-admin/src/components/admin/AdminSearchToolbar.vue` 与 `admin.css`，为共享搜索工具栏补上 `filters` 插槽和筛选位样式，让搜索框、计数区和状态筛选可以作为同一组后台工具栏骨架复用。
  - 更新 `frontend-admin/src/views/modules/AdminModerationModule.vue`、`AdminGovernanceModule.vue` 与对应测试，把审核队列和治理记录列表统一切到共享 `AdminSelect` 状态筛选，并锁定 `update:statusFilter` 事件与共享 class 契约。
  - 更新 `frontend-admin/src/views/AdminWorkspaceView.vue` 与 `AdminWorkspaceView.test.ts`，新增审核/治理本地 `statusFilter`、派生选项和视图切换重置逻辑，并补两条工作区级回归，确认共享筛选器会真实驱动列表结果，而不是只停留在子组件展示层。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminSelect.test.ts src/components/admin/AdminSearchToolbar.test.ts src/components/admin/AdminPageHeader.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
- 风险与后续：
  - 当前这轮先收口的是后台状态筛选最小骨架，筛选条件仍是前端本地派生，尚未进入后端分页、组合筛选或 URL 查询参数同步。
  - 后续继续沿 `FE-041 / ADM-010 / WB-041` 推进时，更适合把批量动作、更多筛选项和后台 URL 状态一起收回统一的治理工具栏出口。

### 执行记录：FE-041（管理端共享 Input/Button 适配层接线）
- 执行日期：2026-07-10
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminInput.vue`、`AdminButton.vue`，以 Vue 适配层复用共享 `Input` / `Button` 的最小契约，而不是让管理端继续散落裸 `input` / `button`。
  - 新增 `frontend-admin/src/components/admin/AdminInput.test.ts`、`AdminButton.test.ts`，先用 RED 锁定“管理端共享输入/按钮适配层必须存在且遵循 `ds-input` / `primary|secondary|ghost + danger + 默认 type=button` 语义”的缺口，再在 GREEN 阶段锁定事件与 class 合同。
  - 更新 `frontend-admin/src/components/admin/AdminLoginPanel.vue`、`AdminShellFrame.vue`、`AdminConfirmDialog.vue` 与 `src/views/modules/AdminDashboardModule.vue`、`AdminModerationModule.vue`、`AdminGovernanceModule.vue`，把登录表单、后台刷新/退出、dashboard CTA、审核搜索/动作、治理搜索/动作都接到新的 Vue 适配层。
  - 更新 `frontend-admin/src/components/admin/admin.css`，补齐 `ghost-button` 与 `danger` class 语义，避免管理端继续停留在局部 `is-danger` 变体。
  - 补强 `AdminLoginPanel.test.ts`、`AdminShellFrame.test.ts`、`AdminDashboardModule.test.ts`、`AdminModerationModule.test.ts`、`AdminGovernanceModule.test.ts`，锁定这些真实页面入口已经开始消费共享 `ds-input` / `ghost-button` / `danger` 契约，而不是只保留视觉上相似的裸 DOM。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/components/admin/AdminInput.test.ts src/components/admin/AdminButton.test.ts src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/components/admin/AdminInput.test.ts src/components/admin/AdminButton.test.ts src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
- 风险与后续：
  - 当前这轮只把管理端高频 `Input/Button` 原语接线到壳层和首批模块页，导航按钮、表格行按钮以及更复杂的筛选/下拉仍未统一收口到共享层。
  - 后续继续沿 `FE-041` 推进时，更适合补管理端 `Select`、页头/筛选骨架，以及把治理动作里的更多危险操作全部收回同一套共享交互语义。

### 执行记录：SE-020（真实命中数与首批返回数分离）
- 执行日期：2026-07-09
- 本轮完成：
  - `backend/internal/modules/search/service/service_test.go`、`indexer_test.go`、`handler_test.go` 先补 RED/GREEN 回归，锁定 `/api/v1/search` 现在需要把“真实命中总数”和“当前首批返回数”分开表达，而不是继续把 `count` 当成 `results.length`。
  - `backend/internal/modules/search/dto/search.go`、`service/service.go` 与 `service/indexer.go` 已把 grouped payload 扩到 `count + returnedCount + results[]` 语义，其中 `count` 为真实命中总数，`returnedCount` 为当前返回批次大小，`total` 也同步回到真实总命中数。
  - fallback indexer 现已把 `url/source` 组装下沉到 Go 层，不再依赖 SQL 内联 `CONCAT(...)`；这让测试环境与后续索引实现更容易复用同一套结果构造逻辑。
  - `frontend-user/src/modules/search/SearchWorkspacePage.tsx` 与 `SearchWorkspacePage.test.tsx` 已补页面级提示：当分组真实命中数大于首批返回数时，界面会明确显示“当前仅展示首批 X / Y 条结果。”，避免把当前批次分页误解成后端真分页。
  - `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`、`README.md` 与本执行记录已同步更新为当前语义。
- 已执行验证：
  - `go test ./internal/modules/search/...`
  - `npm --workspace frontend-user run test -- src/api/searchShare.test.ts src/modules/search/SearchWorkspacePage.test.tsx`
- 风险与后续：
  - 本轮只完成了 `SE-020` 的第一小步，后端仍未提供 cursor / offset / next token 等跨批次分页契约。
  - 搜索耗时、排序元数据、空结果建议和可替换索引的产品化收口，仍需继续沿 `SE-020 / WB-043 / WB-044` 推进。

### 执行记录：ADM-011（用户会话即时失效与权限边界补强）
- 执行日期：2026-07-09
- 本轮完成：
  - `backend/internal/modules/admin/service/user_actions_test.go` 新增 RED/GREEN 服务层回归，锁定禁用用户时必须撤销仍有效的 `refresh_tokens`，避免后台治理只改用户状态、不影响既有会话。
  - 新增 `backend/internal/middleware/auth_test.go`，先以 RED 复现两个缺口：被禁用用户仍可拿旧 access token 继续访问受保护接口，以及数据库角色已降级时旧 JWT claim 仍可能携带过期管理员权限。
  - `backend/internal/modules/admin/service/service.go` 现已在 `disable` 动作事务内一并撤销该用户所有未撤销的 refresh token，让后台禁用动作对后续 refresh 立即生效。
  - `backend/internal/middleware/auth.go` 改为在每次受保护请求中按 `claims.UserID` 回查当前用户，并以数据库中的 `status / role / username` 为准写入上下文；被禁用用户会在中间件层收到 `user_disabled`，角色变更后的旧 token 也不再保留旧权限。
  - `backend/internal/app/server.go` 与 `backend/internal/modules/admin/router/router.go` 统一复用新的 `authGuard`，让普通受保护路由与后台治理路由都共享同一层即时状态校验。
- 已执行验证：
  - RED：`go test ./internal/modules/admin/service -run 'TestHandleUserDisableRevokesActiveRefreshTokens|TestHandleUserDisablesActiveUserAndWritesAuditLog|TestHandleUserActivatesDisabledUser|TestHandleUserRejectsProtectedAdminAccount'`
  - RED：`go test ./internal/middleware -run 'TestAuthenticateRejectsDisabledUser|TestAuthenticateUsesCurrentRoleFromDatabase'`
  - GREEN：`go test ./internal/modules/admin/service -run 'TestHandleUserDisableRevokesActiveRefreshTokens|TestHandleUserDisablesActiveUserAndWritesAuditLog|TestHandleUserActivatesDisabledUser|TestHandleUserRejectsProtectedAdminAccount'`
  - GREEN：`go test ./internal/middleware -run 'TestAuthenticateRejectsDisabledUser|TestAuthenticateUsesCurrentRoleFromDatabase'`
  - `go test ./internal/modules/auth/service -run 'TestLoginRejectsDisabledUser|TestRefreshRejectsDisabledUser'`
  - `go test ./...`
- 风险与后续：
  - 当前前后台共享会话层仍主要围绕 `401 refresh/replay/fail-logout`；对于请求阶段直接返回的 `403 user_disabled`，前端还没有统一把这类被动失效转成清 session 与统一提示。
  - 这一步先补的是“用户状态/角色即时生效”这条最小权限边界；更细粒度的资源归属校验、举报处理备注和后台模块 page / feature 下沉仍需沿 `ADM-010 / ADM-011` 继续收口。

### 执行记录：API-011 / ADM-011（403 user_disabled 前端会话联动）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.test.ts` 新增 RED/GREEN 回归，锁定受保护请求直接收到 `403 user_disabled` 时不会触发 refresh，而是立即记录 `session_rejected`、清空本地 session，并把结构化原因保留给登录页消费。
  - `packages/api-client/src/index.ts` 现已把 `SessionInvalidationState.kind` 扩到 `refresh_failed | session_rejected`，并在 `createSessionRequest(...)` 里识别请求阶段直接返回的 `403 user_disabled`，统一走 `persistSession(null)` 与 `onSessionInvalidated(...)`。
  - `frontend-user/src/api/sessionRefresh.test.ts` 与 `frontend-user/src/pages/AuthPages.test.tsx` 新增 RED/GREEN 回归，锁定用户端图谱请求在 `user_disabled` 时会直接清 session，登录页则显示“当前账号已被禁用，请联系管理员后重新登录。”
  - `frontend-user/src/pages/AuthPages.tsx` 已改为直接消费共享 `getSessionInvalidationPrompt(...)`，不再在登录页本地硬编码单一的“会话失效”提示。
  - `frontend-admin/src/views/AdminWorkspaceView.test.ts` 新增 RED/GREEN 回归，锁定后台自举请求直接收到 `403 user_disabled` 时不会触发 refresh，而是立即清空后台会话并回退到带禁用提示的登录页。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已改为让登录页提示和被动失效后的 notice 都直接消费共享 `getSessionInvalidationPrompt(...)`，不再只显示统一的后台会话失效文案。
- 已执行验证：
  - RED：`npx vitest run packages/api-client/src/index.test.ts`
  - RED：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npx vitest run packages/api-client/src/index.test.ts`
  - GREEN：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前共享会话层已经覆盖 `401 refresh/replay/fail-logout` 与 `403 user_disabled` 两条主被动失效路径，但还没有进入 HttpOnly Refresh Token 迁移、更多后台模块 API client 拆分与更细粒度的失效分类。
  - 管理端治理动作、会话提示与确认层状态仍较多集中在 `AdminWorkspaceView.vue`；后续继续推进 `ADM-010 / ADM-011` 时，更适合把模块动作状态与会话提示消费边界继续往 page / feature 层下沉。

### 执行记录：ADM-011（图谱模板治理起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `backend/internal/modules/admin/service/diagram_templates_test.go` 与 `backend/internal/modules/graph/service/diagram_templates_test.go` 新增 RED/GREEN 回归，先锁定后台缺少模板治理服务、用户端模板列表未按发布状态过滤这两处缺口。
  - `backend/internal/modules/admin/service/service.go`、`handler/handler.go` 与 `router/router.go` 已补齐 `/api/v1/admin/diagram-templates`、`/api/v1/admin/diagram-templates/:id/publish`、`/api/v1/admin/diagram-templates/:id/unpublish`；后台现在会把系统模板目录与 `diagram_templates` 表里的状态覆盖合并成真实治理列表，并为 `publish / unpublish` 写入 `admin.handle.diagram_template` 审计事件。
  - `backend/internal/modules/graph/dto/template_catalog.go`、`backend/internal/modules/graph/repository/diagram_templates.go` 与 `backend/internal/modules/graph/service/service.go` 已把图谱模板目录收口成共享 catalog，并让用户端 `/api/v1/diagram/templates` 只返回已发布模板；被后台下架的模板会直接从用户端模板列表隐藏。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 与 `frontend-admin/src/views/AdminWorkspaceView.test.ts` 已把后台 `graph` 模块从 `/api/v1/admin/tags` 切到真实 `/api/v1/admin/diagram-templates`，并加入模板 `publish / unpublish` 的确认流。
- 已执行验证：
  - RED：`go test ./internal/modules/admin/service ./internal/modules/graph/service`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`go test ./internal/modules/admin/service ./internal/modules/graph/service`
  - `go test ./internal/modules/admin/... ./internal/modules/graph/...`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前模板治理先收口在系统模板目录的 `publish / unpublish` 与用户端可见性同步，还没有把用户自定义模板、模板版本、模板审核备注和 preview 文件治理一起纳入。
  - 后台图谱模板动作状态仍在 `AdminWorkspaceView.vue` 协调；后续更适合沿 `ADM-010 / ADM-011` 继续把模板、资料、用户、AI 的动作状态一起沉到 page / feature 边界。

### 执行记录：ADM-011（用户治理动作起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `backend/internal/modules/admin/service/user_actions_test.go` 新增 RED/GREEN 服务层回归，锁定后台用户治理只允许 `disable / activate` 两种动作，且必须写入后台审计日志。
  - `backend/internal/modules/admin/service/service.go`、`handler/handler.go` 与 `router/router.go` 已补齐 `HandleUser(...)`、`/api/v1/admin/users/:id/disable` 与 `/api/v1/admin/users/:id/activate`；当前以 `active <-> disabled` 作为最小治理状态流，并保护后台管理员账号不在这条首切片里被直接禁用。
  - `backend/internal/modules/user/model/user.go` 与 `backend/internal/modules/auth/service/service.go` 已开始真实消费用户 `status` 字段；被禁用账号会在 `Login(...)` 与 `Refresh(...)` 阶段收到 `user_disabled` 拒绝，而不是只在后台列表里显示状态。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已把用户治理从只读列表推进到可确认执行的 `disable / activate` 动作；`frontend-admin/src/views/AdminWorkspaceView.test.ts` 锁定了动作按钮展示、确认层与提交请求路径。
- 已执行验证：
  - RED：`go test ./internal/modules/admin/service ./internal/modules/auth/service`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`go test ./internal/modules/admin/service ./internal/modules/auth/service`
  - `go test ./internal/modules/admin/... ./internal/modules/auth/...`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前用户治理首切片已从“账号禁用 / 恢复 + login/refresh 拒绝”推进到“禁用时撤销 refresh token + 请求时即时拦截 disabled / 过期角色”；但前端仍未把运行中收到的 `403 user_disabled` 统一转成被动登出提示。
  - 用户治理确认状态仍在 `AdminWorkspaceView.vue` 协调；后续更适合沿 `ADM-010 / ADM-011` 继续把资料、用户、AI、审计的动作状态下沉到 page / feature 边界。

### 执行记录：ADM-011（AI 任务治理动作起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `backend/internal/modules/admin/service/ai_task_actions_test.go` 新增 RED/GREEN 服务层回归，锁定 `failed` 任务可 `retry`、`pending` 任务可 `cancel`，且必须写入后台审计日志。
  - `backend/internal/modules/admin/service/service.go`、`handler/handler.go` 与 `router/router.go` 已补齐 `HandleAITask(...)`、`/admin/ai/tasks/:id/retry` 与 `/admin/ai/tasks/:id/cancel`；任务状态会在服务层受控迁移，重试时清空错误信息，取消时写回 `cancelled` 状态。
  - `backend/internal/modules/admin/dto/governance.go` 已扩展 AI 任务治理字段，补回 `errorMessage` 与 `updatedAt`，让后台不仅能看到状态，还能看到失败原因与最近更新时间。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 与 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 已把 AI 任务从只读列表推进到可确认执行的 `retry / cancel` 动作；`frontend-admin/src/views/AdminWorkspaceView.test.ts` 锁定了动作按钮展示、确认层与提交请求路径。
- 已执行验证：
  - RED：`go test ./internal/modules/admin/service`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`go test ./internal/modules/admin/service`
  - `go test ./internal/modules/admin/...`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前 AI 任务治理还是“状态迁移级”原型：`retry` 先回到 `pending`，`cancel` 先写成 `cancelled`，还没有接到真正的异步执行器重排或中断机制。
  - AI 任务确认状态仍在 `AdminWorkspaceView.vue` 协调；后续更适合沿 `ADM-010 / ADM-011` 继续把资料、AI、用户、审计的动作状态下沉到 page / feature 边界。

### 执行记录：ADM-011（资料治理脱离文件占位）
- 执行日期：2026-07-09
- 本轮完成：
  - `backend/internal/modules/admin/service/materials_list_test.go` 新增 RED/GREEN 服务层回归，锁定后台必须提供真实材料治理列表，而不是继续让资料治理页复用文件记录占位。
  - `backend/internal/modules/admin/service/service.go`、`handler/handler.go` 与 `router/router.go` 已补齐 `ListMaterials(...)` 与 `/api/v1/admin/materials`，返回资料标题、作者、分类、附件名、状态和时间字段，供后台治理页直接消费。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已把 `materials` 模块从 `/api/v1/admin/files` 切到真实 `/api/v1/admin/materials`；资料记录会按状态暴露 `approve / reject / hide` 动作，其中已隐藏资料可直接恢复，且复用现有资料审核动作路由与确认流。
  - `frontend-admin/src/views/AdminWorkspaceView.test.ts` 已锁定资料治理页加载真实材料记录、显示治理动作，并在确认后提交 `/api/v1/admin/moderation/materials/:id/:action`。
- 已执行验证：
  - RED：`go test ./internal/modules/admin/service`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`go test ./internal/modules/admin/service`
  - `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前资料治理动作仍复用审核流的 `approve / reject / hide` 语义，后续若继续产品化，最好把“下架 / 恢复”这类运营术语与独立审计动作进一步显式化。
  - 后台治理动作仍集中在 `AdminWorkspaceView.vue` 协调；后续更适合沿 `ADM-010 / ADM-011` 把资料、用户、AI、审计等模块的动作状态继续下沉到 page / feature 边界。

### 执行记录：ADM-011（举报治理动作与审计链路起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `backend/internal/modules/admin/service/report_actions_test.go` 新增 RED/GREEN 服务层回归，锁定举报处理只允许 `resolved / dismissed` 两种状态，且必须同步写入 `handled_by`、`handled_at` 与审计日志。
  - `backend/internal/modules/admin/service/service.go` 新增 `HandleReport(...)`，以事务方式更新举报状态、处理人、处理时间，并追加 `admin.handle.report` 审计事件；`ListReports(...)` 也补回 `handledBy`、`handledAt` 字段，供后台真实展示治理结果。
  - `backend/internal/modules/admin/handler/handler.go` 与 `router/router.go` 已补齐 `/admin/reports/:id/resolve`、`/admin/reports/:id/dismiss` 两条受控动作路由，保持管理员身份校验与统一响应 envelope。
  - `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 与 `AdminWorkspaceView.vue` 已把举报治理从只读记录推进到可确认执行的 `resolve / dismiss` 动作；`frontend-admin/src/views/modules/AdminGovernanceModule.test.ts` 与 `AdminWorkspaceView.test.ts` 也锁定了按钮展示、确认层与提交后的状态回写。
- 已执行验证：
  - RED：`go test ./internal/modules/admin/service`
  - RED：`npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - GREEN：`go test ./internal/modules/admin/service`
  - `go test ./internal/modules/admin/...`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
- 风险与后续：
  - 当前 `ADM-011` 只完成了举报治理首个动作切片，还没有把封禁/解封、下架/恢复、AI 任务重试/取消等其他高风险治理动作一并接入。
  - 举报处理确认状态仍由 `AdminWorkspaceView.vue` 协调；后续更适合沿 `ADM-010` 继续把 users / materials / ai / audit 的动作状态和确认流下沉到模块页或 feature 边界。

### 执行记录：ADM-010（管理端 URL 路由起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `frontend-admin/src/App.test.ts` 新增 RED/GREEN 回归，锁定管理端根路径会归一化到 `/admin/dashboard`，不再停留在无状态的 `/`。
  - `frontend-admin/src/views/AdminWorkspaceView.test.ts` 新增 RED/GREEN 回归，锁定切换后台模块时浏览器 URL 会同步更新到 `/admin/...`，并补了路径状态在测试之间的隔离。
  - `frontend-admin/src/router/index.ts` 已从 route key 列表升级为后台模块路径映射层，提供规范路径的解析、生成与默认归一化。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已改为按浏览器路径决定初始模块，并在导航切换、浏览器前进/后退、会话失效与手动退出时同步 URL 与工作台状态。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts src/api/client.test.ts`
  - `npm run verify:docs`
- 风险与后续：
  - 目前后台仍是单个 `AdminWorkspaceView.vue` 在内部切换模块，URL 已真实存在，但还没有拆成真正的模块页与更细的 Router 边界。
  - 下一步更适合继续沿 `ADM-010 / ADM-011` 把 users / moderation / ai / audit 等高频模块拆页，并逐段补模块动作与审计流。

### 执行记录：ADM-010（管理端首批模块视图拆分）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `frontend-admin/src/views/modules/AdminDashboardModule.vue`、`AdminModerationModule.vue` 与 `AdminGovernanceModule.vue`，先把概览指标、审核列表与治理记录展示从 `AdminWorkspaceView.vue` 中抽离为首批独立模块视图。
  - 新增 `frontend-admin/src/views/modules/AdminDashboardModule.test.ts`、`AdminModerationModule.test.ts` 与 `AdminGovernanceModule.test.ts`，先以 RED 锁定“模块文件尚不存在”的缺口，再在 GREEN 锁定模块级渲染、查询输入与事件发射契约。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已改为以 session、URL、审核确认层和模块选择为主的壳组件，不再内联 dashboard / moderation / governance 的完整页面结构。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - `npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts src/api/client.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run verify:docs`
- 风险与后续：
  - 当前拆出的还是“模块视图组件”而不是真正独立 page；路由入口、数据边界和治理动作仍由 `AdminWorkspaceView.vue` 统一调度。
  - 下一步更适合继续沿 `ADM-010 / ADM-011` 把 users / materials / ai / audit 等模块拆到更清晰的 page / feature 边界，并把封禁、下架、重试等动作沉到对应模块。

### 执行记录：ADM-010（管理端登录视图与已登录壳层抽离）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminLoginPanel.vue` 与 `AdminShellFrame.vue`，把后台登录卡片、侧栏、顶部状态、标题区和通知区从 `AdminWorkspaceView.vue` 中抽离出来。
  - 新增 `frontend-admin/src/components/admin/AdminLoginPanel.test.ts` 与 `AdminShellFrame.test.ts`，先以 RED 锁定“组件文件不存在”的缺口，再在 GREEN 锁定登录输入更新/提交，以及壳层的导航、刷新、退出事件契约。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已进一步收口为 session、URL、审核确认层与数据加载协调器，并改为通过两个壳层组件组合登录态与已登录态界面。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts`
  - `npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts src/api/client.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run verify:docs`
- 风险与后续：
  - 当前只是把“登录态框架”从工作台里抽离，还没有把 users / materials / ai / audit 的数据加载与动作状态真正下沉到各自模块。
  - 下一步更适合继续沿 `ADM-010 / ADM-011` 把模块内数据边界、动作状态与审计语义一起拆到更清晰的 page / feature 层，而不是继续在协调器里累积治理逻辑。

### 执行记录：FE-041（管理端审核动作接入确认层）
- 执行日期：2026-07-09
- 本轮完成：
  - `frontend-admin/src/views/AdminWorkspaceView.test.ts` 新增 RED/GREEN 页面级回归，锁定后台审核队列里的驳回动作不再直接提交，而是先弹确认层；取消不会发请求，确认后才真正调用 `/api/v1/admin/moderation/posts/:id/reject`。
  - 新增 `frontend-admin/src/components/admin/AdminConfirmDialog.vue`，沿共享 `ConfirmDialog` 的标题、说明、取消/确认、危险动作、确认中禁用和错误提示语义，实现 Vue 侧后台确认骨架。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已把审核队列里的“通过 / 驳回 / 隐藏”从直接执行改为先进入确认层，再发起原有审核 POST 请求；登录页重复提示文案也一并收口为单条。
  - `frontend-admin/src/components/admin/admin.css` 已补齐后台确认层的遮罩、面板、危险确认按钮和错误提示样式，使管理端在共享 token 之上拥有与用户端一致的 destructive action 视觉节奏。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts src/api/client.test.ts`
  - `npm run verify:docs`
- 风险与后续：
  - 当前后台确认层仍先挂在 `AdminWorkspaceView.vue` 单工作台组件内，后续推进 `ADM-010 / ADM-011` 时，更适合把这类治理动作和确认状态一起沉到模块页或 feature 边界，而不是继续堆在单文件里。
  - 这一步先覆盖了审核队列的高频动作；后续更值得继续推进资料下架/恢复、AI 任务重试/取消、模板审核/发布/下架等后台高风险动作，把管理端 destructive action 语义继续补齐。

### 执行记录：FE-041（共享 ConfirmDialog 扩展到图谱工作区主路径）
- 执行日期：2026-07-09
- 本轮完成：
  - `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 新增 RED/GREEN 回归，锁定图谱工作区里的两条高频确认路径不再直接依赖原生 `window.confirm(...)`：一条是冲突处理后的“放弃本地并重载最新图谱”，另一条是概览面板里的“删除当前图谱”。
  - `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx` 已接入共享 `ConfirmDialog`，统一承接 `reload-latest` 与 `delete-graph` 两类 destructive action；确认框会保留 `danger` 动作、确认中禁用和失败提示。
  - `GraphConflictAssistCard` 的“放弃本地并重载最新图谱”与 `GraphWorkspaceOverviewPanel` 的“删除当前图谱”现在都会先弹共享确认框，再进入原有重载/删除业务流。
  - 这一轮完成后，`frontend-user` / `frontend-admin` / `packages` 范围内的 `window.confirm` 已清零，说明用户端主路径里的原生确认框已完成第一阶段收口。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `rg -n "window\\.confirm" frontend-user frontend-admin packages`
- 风险与后续：
  - 当前图谱工作区仍然由控制器直接维护确认框状态，后续如果继续推进 `GPH-040`，更适合把这类 destructive intent 和对话框状态一起沉到 commands / store 边界，而不是继续把更多 UI 事件压进控制器。
  - 管理端还没有复用这层确认骨架；后续更值得把后台治理里的删除、下架、重试动作一起迁入共享 `ConfirmDialog`，形成真正跨端一致的 destructive action 语义。

### 执行记录：FE-041（共享 ConfirmDialog 接入笔记删除确认）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/ConfirmDialog.tsx` 新增共享 `ConfirmDialog` primitive，先统一确认标题、说明文案、取消/确认动作、`danger` 变体，以及确认中禁用和错误提示这组最小确认交互契约。
  - `packages/ui/src/index.ts`、`frontend-user/src/design-system/primitives/ConfirmDialog.tsx` 与 `frontend-user/src/design-system/primitives/index.ts` 已补齐共享导出和用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/pages/NotesPage.tsx` 已把笔记删除从浏览器原生 `window.confirm(...)` 改为共享 `ConfirmDialog`，并保留删除中的禁用态、失败提示与当前工作区消息回写。
  - `packages/ui/src/reactPrimitives.test.tsx`、`frontend-user/src/design-system/primitives/ConfirmDialog.test.tsx` 与 `frontend-user/src/pages/NotesPage.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、兼容出口、确认中禁用态，以及笔记删除流程不再直接依赖原生确认框。
- 已执行验证：
  - RED：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - RED：`npm --workspace frontend-user run test -- src/design-system/primitives/ConfirmDialog.test.tsx src/pages/NotesPage.test.tsx`
  - GREEN：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/design-system/primitives/ConfirmDialog.test.tsx src/pages/NotesPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run verify:docs`
- 风险与后续：
  - 当前共享 `ConfirmDialog` 先接到笔记删除确认，还没有覆盖图谱工作区里的“重载最新图谱 / 删除图谱”这两处确认路径；后续更适合继续沿真实高频删除/放弃动作逐段替换，而不是一次性改动整个图谱控制器。
  - 管理端暂未直接消费这层确认骨架；后续如需更深共享，应优先沿后台治理里的删除/下架/重试动作，把筛选条与确认框一起按同一套状态语义收口。

### 执行记录：FE-041（共享 CommandBar 接入主站顶部骨架）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/CommandBar.tsx` 新增共享 `CommandBar` primitive，先统一 `topbar`、`topbar-page-meta`、`topbar-breadcrumb`、`topbar-subtitle` 与 `topbar-actions` 这组顶部骨架语义，并通过 `search` / `actions` 槽位承接具体交互。
  - `packages/ui/src/index.ts`、`frontend-user/src/design-system/primitives/CommandBar.tsx` 与 `frontend-user/src/design-system/primitives/index.ts` 已补齐共享导出和用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/app/chrome/CommandBar.tsx` 已改为直接复用共享 `CommandBar` 骨架，保留现有页面元信息、全局搜索、AI 草稿入口、用户菜单与退出登录逻辑不变。
  - `packages/ui/src/reactPrimitives.test.tsx`、`frontend-user/src/design-system/primitives/CommandBar.test.tsx` 与 `frontend-user/src/app/chrome/CommandBar.test.tsx` 新增 RED/GREEN 回归，并联动复用现有 `frontend-user/src/app/layouts/AppShell.test.tsx`，锁定共享导出、包装接线与主站壳层搜索入口不回退。
- 已执行验证：
  - RED：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - RED：`npm --workspace frontend-user run test -- src/design-system/primitives/CommandBar.test.tsx src/app/chrome/CommandBar.test.tsx src/app/layouts/AppShell.test.tsx`
  - GREEN：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/design-system/primitives/CommandBar.test.tsx src/app/chrome/CommandBar.test.tsx src/app/layouts/AppShell.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 风险与后续：
  - 当前共享 `CommandBar` 先覆盖的是主站壳层顶部骨架；图谱工作区里的 `GraphWorkspaceCanvasCommandBar` 仍是另一套专用操作条，后续是否继续合并要看那套工具栏语义是否值得单独保留。
  - 管理端暂未直接消费这层顶部骨架；后续如需更深共享，更适合把后台页头与筛选条一起按同一套骨架收口，而不是先硬塞进当前用户端 props 形状。

### 执行记录：FE-041（共享 PageHeader 接入工作区头部）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/PageHeader.tsx` 新增共享 `PageHeader` primitive，先统一 `workspace-header`、`eyebrow`、`header-copy` 与 `header-actions` 这组页面头部骨架语义，避免多个工作区继续各自手写同一套头部结构。
  - `packages/ui/src/index.ts`、`frontend-user/src/design-system/primitives/PageHeader.tsx` 与 `frontend-user/src/design-system/primitives/index.ts` 已补齐共享导出和用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/app/appShared.tsx` 的 `WorkspaceHeader` 已改为直接复用共享 `PageHeader`，因此当前所有走 `WorkspaceHeader` 的真实页面都会一起进入同一套共享头部契约。
  - `packages/ui/src/reactPrimitives.test.tsx`、`frontend-user/src/design-system/primitives/PageHeader.test.tsx` 与 `frontend-user/src/app/appShared.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、头部文案/动作区渲染、用户端兼容出口与 `WorkspaceHeader` 的共享接线。
- 已执行验证：
  - RED：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - RED：`npm --workspace frontend-user run test -- src/design-system/primitives/PageHeader.test.tsx src/app/appShared.test.tsx`
  - GREEN：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/design-system/primitives/PageHeader.test.tsx src/app/appShared.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 风险与后续：
  - 当前共享 `PageHeader` 先只通过 `WorkspaceHeader` 覆盖主工作区页面；搜索工作区和图谱工作区仍有各自直接写的 `workspace-header` 结构，后续更适合继续沿 `FE-041` 把这些分支也收回同一出口。
  - 管理端暂未直接消费这层头部契约；后续如需更深共享，应优先沿后台治理页头部与筛选条一起复用，而不是再从样式层重拼页面头骨架。

### 执行记录：FE-041（共享 PageHeader 接入搜索工作区）
- 执行日期：2026-07-13
- 本轮完成：
  - 更新 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`，把搜索工作区自写的 `workspace-header` 结构替换为共享 `WorkspaceHeader`，从而让它正式走 `PageHeader` 契约出口。
  - 补强 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx`，在保留空态、加载态、错误态、筛选与分页回归的同时，新增头部骨架断言，锁定搜索工作区确实渲染了共享 `workspace-header`。
  - 这一步让共享 `PageHeader` 不再只覆盖主工作区页面，也开始承接搜索工作区这条真实用户入口。
- 已执行验证：
  - `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
  - `npm run verify:docs`
  - `git diff --check`
- 风险与后续：
  - 图谱工作区头部仍然保留自己的复杂头部实现，后续继续沿 `FE-041` 推进时，更适合评估如何把保存状态与动作区一起收回共享页头出口。
  - 管理端仍未直接消费这层页头契约；后续如需更深共享，应优先补后台治理页头部与筛选条的一致骨架。

### 执行记录：FE-041（共享 PageHeader 接入图谱工作区）
- 执行日期：2026-07-13
- 本轮完成：
  - 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceShell.tsx`，把图谱工作区头部从本地 `workspace-header` 结构切到共享 `PageHeader`，并保留“新建图谱 / 保存 / 保存状态”这一组现有动作与禁用语义。
  - 补强 `frontend-user/src/modules/graph/components/GraphWorkspaceShell.test.tsx`，用共享 `PageHeader` mock 锁定图谱工作区头部已经通过统一页头契约暴露 `eyebrow / title / description / actions`，而不是继续停留在页面层自写骨架。
  - 这一步让共享 `PageHeader` 不再只覆盖主工作区页面与搜索工作区，也开始承接图谱工作区这条高频主路径，同时保留图谱特有的保存态展示。
- 已执行验证：
  - `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceShell.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
  - `npm run verify:docs`
  - `git diff --check`
- 风险与后续：
  - 当前图谱工作区头部虽然已经走共享 `PageHeader`，但保存状态与动作区仍是图谱页面自带组合；后续如果继续推进 `FE-041`，更适合评估是否把这类“状态徽标 + 危险动作 + 次级筛选”再抽成更高层骨架，而不是把所有差异都塞回 primitive。
  - 管理端页头和筛选条仍未直接消费这层契约；后续如需更深共享，应优先补后台治理页面的真实头部骨架。

### 执行记录：FE-041（管理端壳层共享 PageHeader 适配层接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminPageHeader.vue` 与 `AdminPageHeader.test.ts`，以 Vue 适配层收口管理端 `eyebrow / title / description / actions` 这组页头骨架语义，避免后台继续在壳层里手写同类结构。
  - 更新 `frontend-admin/src/components/admin/AdminShellFrame.vue`，把后台主工作区页头替换为 `AdminPageHeader`，保留计数 chip 作为 actions 插槽输出，从而让 dashboard、审核、治理等视图一起进入统一页头出口。
  - 补强 `frontend-admin/src/components/admin/AdminShellFrame.test.ts`，锁定后台壳层已经通过 `AdminPageHeader` 暴露统一页头契约，而不是只新增了一个未接线的适配组件。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminPageHeader.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/modules/AdminModerationModule.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
  - `git diff --check`
- 风险与后续：
  - 当前管理端只先把壳层主页头收口到共享适配层，dashboard 卡片头部、治理列表筛选条和更多表格工具栏仍未统一。
  - 后续继续沿 `FE-041` 推进时，更适合优先补管理端 `Select` / filter bar 一类真实高频骨架，而不是重新扩展新的治理域能力。

### 执行记录：FE-041（管理端审核/治理共享搜索工具栏接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminSearchToolbar.vue` 与 `AdminSearchToolbar.test.ts`，以 Vue 适配层收口后台搜索输入 + 结果计数这组工具栏骨架语义，避免审核和治理模块继续各自手写同类搜索条。
  - 更新 `frontend-admin/src/views/modules/AdminModerationModule.vue` 与 `AdminGovernanceModule.vue`，让审核队列和治理记录列表统一通过 `AdminSearchToolbar` 输出搜索框与计数区。
  - 重写 `frontend-admin/src/views/modules/AdminModerationModule.test.ts` 与 `AdminGovernanceModule.test.ts`，锁定这两条真实治理路径已经通过共享搜索工具栏渲染 `ds-input` 与计数元信息，而不是继续停留在局部 DOM 拼装。
- 已执行验证：
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminSearchToolbar.test.ts src/components/admin/AdminPageHeader.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
  - `git diff --check`
- 风险与后续：
  - 当前管理端只先收口了搜索输入和计数区，筛选下拉、批量动作和更复杂的 filter bar 还没有进入统一契约。
  - 后续继续沿 `FE-041` 推进时，更适合优先补管理端 `Select` 适配层和更多筛选条组合，而不是扩展新的后台功能域。

### 执行记录：FE-041（共享 Select 接入笔记与阅读表单）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/Select.tsx` 新增共享 `Select` primitive，先统一 `ds-select` class 与 `invalid -> aria-invalid / is-invalid` 的最小契约，避免列表筛选和 deck/material 选择器继续散落在页面层裸写。
  - `packages/ui/src/index.ts`、`frontend-user/src/design-system/primitives/Select.tsx` 与 `frontend-user/src/design-system/primitives/index.ts` 已补齐共享导出和用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/pages/NotesPage.tsx` 与 `frontend-user/src/pages/ReaderPage.tsx` 已将资料来源、写入 deck 等选择器切到共享 `Select`，说明 `FE-041` 已继续从输入框扩展到真实学习路径里的表单下拉选择。
  - `packages/ui/src/reactPrimitives.test.tsx`、`frontend-user/src/design-system/primitives/Select.test.tsx` 与 `frontend-user/src/pages/NotesPage.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、错误态语义、用户端兼容出口与笔记页资料来源选择器接线。
- 已执行验证：
  - RED：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - RED：`npm --workspace frontend-user run test -- src/design-system/primitives/Select.test.tsx src/pages/NotesPage.test.tsx`
  - GREEN：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/design-system/primitives/Select.test.tsx src/pages/NotesPage.test.tsx src/pages/ReaderPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 风险与后续：
  - 当前共享 `Select` 仍只收口了最小 class 与错误态语义，尚未统一 AI 页面与图谱工作区里的 `select-field` 视觉变体，也还没覆盖 loading / disabled helper 文案等更高层模式。
  - 管理端暂未直接消费这层 `Select`，后续如需更深共享，应优先沿后台治理筛选器与状态下拉继续复用同一套交互语义，而不是再新增局部选择器基础构件。

### 执行记录：FE-041（共享 Select 接入图谱工作区）
- 执行日期：2026-07-13
- 本轮完成：
  - 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceShell.tsx`，把图谱工具栏里的“新建节点类型”下拉切到共享 `Select`，继续保留现有 `graph-node-type-select` class、可访问名称和节点类型回调。
  - 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceSelectionPanel.tsx`，把单节点 metadata 选项字段和边形态选择器切到共享 `Select`，让工程图类型、来源结构化字段与边形态编辑不再裸写原生 `select`。
  - 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceRecoveryPanel.tsx`，把卡片草稿写入 deck 的选择器切到共享 `Select`，让图谱-复习闭环里的高频下拉也开始消费统一 primitive。
  - 补强 `GraphWorkspaceShell.test.tsx`、`GraphWorkspaceSelectionPanel.test.tsx` 与 `GraphWorkspaceRecoveryPanel.test.tsx`，锁定图谱工作区这些高频下拉已经走共享 `ds-select` 契约，而不只是行为上“还能选中”。
- 已执行验证：
  - `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceShell.test.tsx src/modules/graph/components/GraphWorkspaceSelectionPanel.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
  - `npm run verify:docs`
  - `git diff --check`
- 风险与后续：
  - 图谱工作区当前只先收口了高频 `select`，`workspace-header` 骨架和更多 `input / textarea` 仍然是本地页面实现；后续更适合继续沿 `FE-041` 把页头与更多表单 primitive 收回统一出口。
  - 管理端仍未直接消费共享 `Select`；后续如需扩大覆盖面，优先补后台治理筛选器和状态下拉，比继续深挖单一图谱局部样式更有全局收益。

### 执行记录：FE-041（共享 Select 接入 AI 草稿中心）
- 执行日期：2026-07-13
- 本轮完成：
  - 更新 `frontend-user/src/pages/AiPage.tsx`，把来源筛选、状态筛选、写入目标 deck 与写入目标图谱四个原生下拉切到共享 `Select`，并继续保留既有 `select-field` class 与筛选/写入回调。
  - 重写并补强 `frontend-user/src/pages/AiPage.test.tsx`，把卡片草稿确认、图谱变更确认、首屏错误态、刷新 stale 态回归重新收口到稳定页面测试里，并新增共享 `ds-select + select-field` 契约断言。
  - 这一步让共享 `Select` 不再只停留在阅读、笔记和图谱工作区，也开始覆盖 AI 草稿中心这条真实学习闭环主路径。
- 已执行验证：
  - `npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
  - `git diff --check`
- 风险与后续：
  - AI 页当前仍只收口了下拉，消息提示、更多内联表单与卡片操作按钮还没有继续下沉到更完整的共享 primitive 语义。
  - 管理端的筛选器和状态下拉仍未直接消费这层 `Select`；后续继续沿 `FE-041` 推进时，更适合优先补后台治理页里的实际筛选场景。

### 执行记录：FE-041（共享 Select 接入复习工作区）
- 执行日期：2026-07-13
- 本轮完成：
  - 更新 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`，把新建卡组表单里的“卡组可见性”下拉切到共享 `Select`，保留原有可见性状态与创建卡组提交流程。
  - 补强 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`，新增“打开管理面板 -> 新建卡组 -> 选择公开可见 -> 提交”的页面回归，并锁定该下拉已经走 `ds-select` 契约。
  - 这一步让共享 `Select` 不再只覆盖阅读、笔记、图谱和 AI 草稿，也补到了复习工作区管理入口这条真实学习闭环主路径。
- 已执行验证：
  - `npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
  - `npm run verify:docs`
  - `git diff --check`
- 风险与后续：
  - 复习工作区当前只先收口了卡组可见性下拉，卡组/卡片管理表单里的更多输入 primitive 仍然是本地页面实现。
  - 管理端筛选器和搜索页/图谱页头骨架仍未统一到共享层；后续继续沿 `FE-041` 推进时，更适合优先处理这些重复模式。

### 执行记录：FE-041（共享 Input 接入资料页表单）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/Input.tsx` 新增共享 `Input` primitive，先统一默认 `type="text"`、`ds-input` class 与 `invalid -> aria-invalid / is-invalid` 的最小契约，避免表单输入继续停留在页面层裸写。
  - `packages/ui/src/index.ts`、`frontend-user/src/design-system/primitives/Input.tsx` 与 `frontend-user/src/design-system/primitives/index.ts` 已补齐共享导出和用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/pages/MaterialsPage.tsx` 已将资料页搜索框与资料详情编辑表单切到共享 `Input`，说明 `FE-041` 已开始从按钮与标签扩展到真实学习路径里的高频表单输入。
  - `packages/ui/src/reactPrimitives.test.tsx`、`frontend-user/src/design-system/primitives/Input.test.tsx` 与 `frontend-user/src/pages/MaterialsPage.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、默认输入类型、错误态语义、用户端兼容出口与资料页搜索接线。
- 已执行验证：
  - RED：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - RED：`npm --workspace frontend-user run test -- src/design-system/primitives/Input.test.tsx src/pages/MaterialsPage.test.tsx`
  - GREEN：`npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/design-system/primitives/Input.test.tsx src/pages/MaterialsPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 风险与后续：
  - 当前共享 `Input` 仍只收口了最小 class 与错误态语义，尚未进一步统一 loading、prefix/suffix、textarea/select 等更高层表单模式；后续更适合继续沿 `FE-041` 推进 `Select` 与 `CommandBar` 一类高频输入骨架。
  - 管理端暂未直接消费这层 `Input`，后续如需更深共享，应优先复用同一套输入语义与 token，而不是再新增一套局部表单基础构件。

### 执行记录：QA-010（默认覆盖率基线门禁收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/coverage-baseline.test.mjs`，先用 RED 锁定四类缺口：仓库缺少 `verify:coverage` 命令、默认 `ci` 未显式执行覆盖率门禁、GitHub Actions 未接入覆盖率基线步骤，以及 README / 开发说明 / 版本计划 / release checklist 仍只记录 `test:coverage` 而没有默认硬门禁入口。
  - 新增 `scripts/verify-coverage-gates.mjs`，把覆盖率门禁收口为单一入口：`frontend-user` 与 `frontend-admin` 运行 Vitest coverage 并读取 JSON summary，`@studymate/graph-core` 解析 Node test coverage 的 `all files` 汇总，后端运行 `go test ./... -coverprofile` 并用 `go tool cover -func` 读取总体 statements。
  - 将当前仓库已验证覆盖率固化为默认“不回退”基线：`frontend-user` `statements/branches/functions/lines >= 68/63/67/68`，`frontend-admin >= 70/67/64/75`，`graph-core lines/branches/functions >= 96/79/100`，后端总体 `statements >= 25`。
  - 更新根 `package.json`、`.github/workflows/ci.yml`、`README.md`、`docs/DEVELOPMENT.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`docs/planning/versions/v1.0.0-release.md`，统一把默认覆盖率门禁入口收口为 `npm run verify:coverage`，并明确 `npm run test:coverage` 继续承担发布前详细汇总职责。
- 已执行验证：
  - RED：`node --test scripts/coverage-baseline.test.mjs`
  - GREEN：`node --test scripts/coverage-baseline.test.mjs`
  - `npm run verify:coverage`
  - `npm run verify:docs`
- 风险与后续：
  - 当前 `verify:coverage` 是第一阶段“基线不回退”硬门禁，而不是全仓整体 80% 总线；后续仍应在 `FE-040`、`API-010`、`WB-032` 等里程碑中持续补测试并逐步抬高阈值。
  - 发布前仍应保留 `npm run test:coverage` 作为详细汇总证据，重点变更代码继续以 80% 聚焦覆盖率为目标。

### 执行记录：SEC-011（默认 secret scan 门禁收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/secret-scan-baseline.test.mjs`，先用 RED 锁定 `verify:secrets` 缺失、默认 `ci` 未显式执行 secret scan、GitHub Actions 未接线，以及 README / 开发说明 / release checklist 仍把 secret scan 记成手工动作的缺口。
  - 新增 `scripts/verify-secret-scan.mjs`，把仓库级 secret scan 收口为单一入口：默认递归检查文本文件，跳过 `node_modules`、`dist`、`coverage`、锁文件与二进制资源，并识别私钥块、常见 Token 格式、DSN 内联凭据，以及 `apiKey` / `secret` / `token` / `password` 一类硬编码赋值。
  - 为 `change-me-in-local-env`、`<secret-manager-value>`、`<local-password>`、`user:pass` 等 placeholder 示例值补内置忽略规则，同时支持通过 `secret-scan: allow` 对个别测试样例做最小范围豁免，避免开发说明与 `.env.example` 误报。
  - 更新根 `package.json`、`.github/workflows/ci.yml`、`README.md`、`docs/DEVELOPMENT.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`docs/planning/versions/v1.0.0-release.md`、`docs/engineering/CODEX_PROJECT_CONTEXT.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，统一把 secret scan 入口收口为 `npm run verify:secrets`。
- 已执行验证：
  - RED：`node --test scripts/secret-scan-baseline.test.mjs`
  - GREEN：`node --test scripts/secret-scan-baseline.test.mjs`
  - `npm run verify:secrets`
  - `npm run verify:docs`
- 风险与后续：
  - 当前扫描器以“高置信度硬编码密钥”优先，已覆盖私钥、常见 Token 格式、DSN 凭据和 secret-like literal 赋值；如后续仓库引入新的供应商密钥格式，应继续在 `scripts/verify-secret-scan.mjs` 中补 detector，而不是回退到一次性 `rg` 命令。
  - 默认 CI 现已补上依赖审计与 secret scan，剩余主要 P0 工程门禁收口项收敛为覆盖率硬门槛。

### 执行记录：DEV-010（工程可复现性二次核验与工具链收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/verify-runtime-baseline.mjs` 与 `scripts/workspace-repro.test.mjs`，把 Node 24 / npm 11 / Go 1.26、`packageManager`、`bootstrap`、`verify:runtimes`、`verify:deps`、`ci` 前置运行时检查，以及 `@studymate/graph-core` 显式 TypeScript 测试命令锁成可执行契约。
  - 新增 `scripts/run-dependency-audits.mjs`，统一收口 `npm audit --registry=https://registry.npmjs.org/ --audit-level=high` 与 `go run golang.org/x/vuln/cmd/govulncheck@latest ./...` 两条依赖审计入口，避免 `npmmirror` 缺失 audit API 时直接卡在 `[NOT_IMPLEMENTED]`。
  - 更新根 `package.json`：补 `packageManager`、`engines`、`bootstrap`、`verify:runtimes`、`verify:deps`，并让 `ci` 在更大验证链路前先执行运行时基线校验。
  - 更新 `packages/graph-core/package.json`，将测试与覆盖率命令改为显式 `node --experimental-strip-types --test ...` 与 `node --experimental-strip-types --experimental-test-coverage --test ...`，不再依赖 Node 对 `.ts` 测试的隐式执行差异。
  - 更新 `docs/DEVELOPMENT.md`、`README.md` 与 `.github/workflows/ci.yml`，把 bootstrap / runtime baseline / dependency audit 入口同步进开发文档、命令清单和 CI 步骤。
- 已执行验证：
  - RED：`node --test scripts/workspace-repro.test.mjs`
  - GREEN：`node --test scripts/workspace-repro.test.mjs`
  - `npm run verify:runtimes`
  - `npm --workspace @studymate/graph-core run test`
  - `npm --workspace @studymate/graph-core run test:coverage`
  - `npm run bootstrap`
  - `npm run verify:docs`
  - `npm run verify:deps`
- 风险与后续：
  - `npm run bootstrap` 现已能在当前 Windows 工作区完成依赖补齐，但仍可能因为占用中的 `esbuild` / `rollup` 二进制在清理旧目录时输出 `EPERM cleanup` 警告；它不影响本轮 bootstrap 成功，但说明本地活跃工具进程仍会干扰包管理器清理。
  - `npm run verify:deps` 已经能稳定产出真实审计结果；后续若再次命中 npm 或 Go 漏洞，应优先沿依赖基线而不是业务代码做独立安全收口。

### 执行记录：SEC-010（依赖安全基线收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/dependency-security-baseline.test.mjs`，先用 RED 锁定 `frontend-user` / `frontend-admin` 的 `vite` 安全下限、根 `vitest` / `@vitest/coverage-v8` / `@vue/test-utils` 版本下限、`package-lock.json` 中 `vite` / `esbuild` / `undici` / `glob` 的最低安全版本，以及 `backend/go.mod` 的 `toolchain go1.26.5`、`golang.org/x/net v0.55.0`、`github.com/quic-go/quic-go v0.59.1` 与 CI 的 Go patch 版本。
  - 更新根 `package.json`、`frontend-user/package.json`、`frontend-admin/package.json` 与 `package-lock.json`，把前端安全基线收口到 `vite ^7.3.6`、`vitest ^4.1.10`、`@vitest/coverage-v8 ^4.1.10`、`@vue/test-utils ^2.4.11`，并同步清理锁文件里的 `esbuild` / `undici` / `glob` 旧漏洞版本。
  - 更新 `backend/go.mod` 与 `backend/go.sum`，锁定 `toolchain go1.26.5`，并将 `golang.org/x/net` 升级到 `v0.55.0`、`github.com/quic-go/quic-go` 升级到 `v0.59.1`，同步带上 `qpack` 与相关 `x/*` 模块的新安全版本。
  - 更新 `.github/workflows/ci.yml` 与 `docs/DEVELOPMENT.md`，让默认 CI 显式使用 Go `1.26.5` 并执行 `npm run verify:deps`，同时把本地 toolchain 自动下载与依赖审计行为写回开发基线。
- 已执行验证：
  - RED：`node --test scripts/dependency-security-baseline.test.mjs`
  - GREEN：`node --test scripts/dependency-security-baseline.test.mjs`
  - `npm run verify:deps`
  - `npm run verify:runtimes`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-admin run typecheck`
  - `npm --workspace frontend-user run test -- src/styles/tokenSource.test.ts`
  - `npm --workspace frontend-admin run test -- src/tokenSource.test.ts`
  - `cd backend && go test ./...`
  - `npm run verify:docs`
- 风险与后续：
  - Windows 下如果本地仍有 `esbuild.exe` 被占用，`npm install` 可能继续出现 `EBUSY` / `EPERM cleanup` 一类文件锁问题；当前已通过停止仓库内残留构建进程完成升级，但这仍是本地开发环境的已知噪音。
  - 默认 CI 现已补上依赖审计与 secret scan；下一步主要工程级门禁缺口收敛为覆盖率硬门槛。

### 执行记录：FE-040（管理端接入共享 token 起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `frontend-admin/src/main.ts` 新增 `@studymate/ui/tokens.css` 导入，管理端主入口开始与用户端共用同一份根 token 来源。
  - `frontend-admin/src/components/admin/admin.css` 移除本地 `:root` bootstrapping，并把 `--admin-bg`、`--admin-surface`、`--admin-line`、`--admin-text`、`--admin-accent` 等基础变量映射到共享 token，先统一前后台的背景、文本、描边与 accent 骨架。
  - 新增 `frontend-admin/src/tokenSource.test.ts`，锁定管理端主入口接线存在、基础 admin token 已引用共享变量，以及本地根 token 引导块已移除。
- 已执行验证：
  - RED：`npx vitest run frontend-admin/src/tokenSource.test.ts`
  - GREEN：`npx vitest run frontend-admin/src/tokenSource.test.ts`
  - `npm --workspace frontend-admin run test`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
- 后续建议：
  - 继续沿 `FE-040` 把管理端更多局部硬编码颜色、圆角与输入/按钮态映射到共享 token，而不是只停留在基础壳层变量。
  - 继续沿 `FE-041` 把 `Drawer`、`Inspector`、`DataState` 之外的更多视觉契约沉到 `@studymate/ui`，让共享层开始承接“组件级”而不只是“变量级”一致性。

### 执行记录：FE-040（管理端页面状态协议接线起步）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `frontend-admin/src/components/admin/AdminDataState.vue` 与 `dataState.ts`，让管理端开始直接消费 `@studymate/ui` 的 `DataStateKind` / `getDataStateLabel(...)` 语义，不再只共享 token、却继续各自手写页面状态文案。
  - `frontend-admin/src/views/modules/AdminModerationModule.vue` 与 `AdminGovernanceModule.vue` 已接入新的 `dataState` 协议；当前至少 `loading / error / empty` 三类列表态会通过同一套管理端状态骨架呈现，而不是继续混用局部空态块。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已补齐最小透传：当审核队列或治理列表还没有数据时，会按当前工作台 `loading/error` 状态生成共享状态载荷，再交给模块页统一显示。
  - 新增 `frontend-admin/src/components/admin/AdminDataState.test.ts`，并补强 `AdminModerationModule.test.ts`、`AdminGovernanceModule.test.ts`，先用 RED 锁定“缺少共享状态组件与模块接线”的缺口，再在 GREEN 锁定管理端对共享状态标签的真实消费。
  - `frontend-admin/tsconfig.json` 已补 `jsx: "preserve"`，确保管理端在直接消费 `@studymate/ui` 的 `.tsx` 导出时仍能稳定通过 `vue-tsc`。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
- 后续建议：
  - 这一步先覆盖了管理端模块页的 `loading / error / empty` 首层状态；后续继续沿 `FE-040` 扩 `unauthorized / stale / conflict` 的真实页面入口，避免这些状态只存在于共享枚举里。
  - 当前后台顶部 `notice/error` 仍是另一层壳组件提示；后续如继续推进 page / feature 拆分，更适合把壳层提示与模块级 `DataState` 的边界一起显式化。

### 执行记录：FE-040（管理端 stale 页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-admin/src/views/modules/AdminModerationModule.test.ts`、`AdminGovernanceModule.test.ts` 与 `AdminWorkspaceView.test.ts` 补 RED，用页面级和模块级回归锁定“已有旧数据时刷新失败，模块页必须显式进入 shared stale state，且不能吞掉现有表格”的缺口。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 现已在两类真实入口生成 `stale` 状态载荷：审核队列在保留既有列表时刷新失败，会落成“审核队列需要刷新”；治理模块在同一路由下保留既有记录时刷新失败，会落成“治理记录需要刷新”。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 还补了 `governanceRowsView` 追踪，避免跨治理模块切换时误把上一个模块的旧记录当成当前模块的 stale 数据继续展示；只有“同一治理视图刷新失败”才保留旧表格。
  - `frontend-admin/src/views/modules/AdminModerationModule.vue` 与 `AdminGovernanceModule.vue` 现在会在 `stale` 时同时渲染 `AdminDataState` 和旧表格，不再像 `loading / error` 一样直接替换内容区。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
- 后续建议：
  - 这一步把 `stale` 从共享枚举推进到了管理端真实页面入口，但 `unauthorized / conflict` 仍主要停留在共享文案层，后续继续沿 `FE-040` 找更真实的工作台入口接线。
  - 管理端当前仍保留壳层 `notice/error` 与模块级 `DataState` 双通道提示；后续更适合在 `ADM-010` 拆 page / feature 边界时一起明确“顶部通知”与“内容态状态骨架”的职责边界。

### 执行记录：FE-040（用户端搜索 / 资料库页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx` 与 `frontend-user/src/pages/MaterialsPage.test.tsx` 补 RED，锁定“用户端搜索页和资料库页仍停留在自拼 message / placeholder，尚未真正进入共享 `DataState` 协议”的缺口。
  - `frontend-user/src/modules/search/SearchWorkspacePage.tsx` 现已按真实搜索流程接入共享页面状态：无关键词时显示引导型 `empty`，请求进行中显示 `loading`，首次失败进入 `error`，筛选后无命中结果进入 `empty`，不再继续渲染一整页零结果分组卡片。
  - `frontend-user/src/pages/MaterialsPage.tsx` 现已把资料列表加载过程接到共享状态协议：首次同步时显示 `loading`，首次失败进入 `error`，资料库为空或筛选无命中时进入 `empty`，而在收藏 / 评分 / 更新 / 新建后的重新同步失败时会保留旧列表并显式进入 `stale`。
  - 同一轮里还把资料页的“页面加载状态”和“操作结果提示”拆成两条信道，避免刷新已经 stale 时仍残留成功提示，减少用户对当前数据可靠性的误判。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
  - `git diff --check`
- 后续建议：
  - 这一步把共享页面状态从管理端继续推进到了用户端真实列表页，但当前用户端还没有大面积覆盖 `unauthorized / conflict`；后续更适合沿 `ReviewWorkspacePage`、阅读页、笔记页和更多跨端列表继续补真实入口。
  - `MaterialsPage` 目前已经有最小 `stale` 语义，但搜索页还主要覆盖 `loading / error / empty`；如果后续补显式刷新或服务端分页，再继续评估搜索页是否也需要真实 `stale` 状态。

### 执行记录：FE-040（用户端复习工作区页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx` 补 RED，锁定“复习工作区首屏失败时仍只显示局部 message + 空队列空态、刷新失败时也不会进入共享 stale 状态”的真实缺口。
  - 同一测试文件补了 `cleanup()` 收口，避免前一条复习工作区用例残留 DOM 干扰后续状态断言，让这一组页面状态回归在当前 Vitest 环境下稳定可复现。
  - `frontend-user/src/modules/review/ReviewWorkspacePage.tsx` 新增 `ReviewWorkspaceState` 与 `workspaceErrorMessage` 判定，把复习工作区主舞台接到共享 `DataState` 协议：首屏失败进入 `error`，无卡片时进入 `empty`，已有当前卡片时刷新失败则进入 `stale`。
  - 现在复习工作区在“已有卡片但刷新失败”的场景下，会显式渲染“复习队列需要刷新”的共享状态，同时保留当前卡片继续可见，避免用户在短暂刷新失败时直接丢失正在复习的上下文。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 后续建议：
  - 当前这一步只把共享页面状态推进到了复习工作区主舞台；复习管理面板内部的卡组/卡片列表仍主要覆盖 `empty`，还没有独立的 `error / stale / unauthorized / conflict` 分支。
  - 用户端更完整的跨页状态协议仍未闭合，后续更适合沿阅读页、笔记页和更多共享列表继续补 `unauthorized / conflict` 的真实页面入口。

### 执行记录：FE-040（用户端笔记工作区 stale 页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/pages/NotesPage.test.tsx` 补 RED，锁定两处真实缺口：笔记工作区首屏自举失败虽然有局部 error，但没有回归保护；保存后重新同步失败时会直接清空列表并把当前笔记退回“新建草稿”，缺少共享 `stale` 语义。
  - `frontend-user/src/pages/NotesPage.tsx` 新增 `NotesWorkspaceState` 与 `loadAll({ preserveExisting })` 模式，把笔记列表工作区主入口接到共享页面状态协议：首屏失败走 `error`，已有列表时刷新失败走 `stale`，列表为空走 `empty`。
  - 笔记创建、保存版本和恢复版本现在都会在成功提交后以 `preserveExisting: true` 重新同步；如果刷新失败，页面会保留旧的笔记列表和当前编辑上下文，而不是把用户直接打回空白工作区。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/pages/NotesPage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/pages/NotesPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 这一步把共享 `stale` 从资料库、复习工作区继续推进到了笔记工作区，但当前阅读页主舞台对 `getReaderState(...)` 失败仍偏向降级为空白阅读状态，尚未显式进入共享 `error / stale`。
  - 后续更适合继续沿 `ReaderPage` 或笔记检查器内部的版本/草稿刷新链路，把用户端主学习闭环里的剩余真实状态入口补齐。

### 执行记录：FE-040（用户端阅读工作区页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/pages/ReaderPage.test.tsx` 补 RED，锁定两处真实缺口：阅读工作区首屏 `getReaderState(...)` 自举失败时没有共享 `error` 页面状态保护；批注保存成功后如果重新刷新阅读上下文失败，也没有共享 `stale` 提示且容易回退到不完整状态。
  - `frontend-user/src/pages/ReaderPage.tsx` 新增 `ReaderWorkspaceState` 与 `refreshReaderState(material, { preserveExisting })`，把阅读工作区主舞台与检查器统一接到共享页面状态协议：首屏失败走 `error`，已有阅读上下文时刷新失败走 `stale`，且主舞台与右侧检查器会同步说明当前状态。
  - 批注创建成功后现在会以 `preserveExisting: true` 尝试刷新阅读上下文；如果刷新失败，页面会保留当前 PDF、页码和批注上下文，同时显式提示“阅读上下文需要刷新”，而不是把用户直接打回空白阅读区。
  - 删除批注仍保持严格刷新路径，不会把“删除已提交但刷新失败”的场景误渲染成可继续编辑的旧批注上下文，避免状态语义混淆。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/pages/ReaderPage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 这一步把共享页面状态继续推进到了阅读工作区，用户端搜索、资料、阅读、笔记、复习五条主学习路径都已经具备首批真实 `error / stale` 入口。
  - 当前阅读工作区更细粒度的资源切换、批注列表局部刷新和跨页 `unauthorized / conflict` 入口仍未闭合；后续更适合继续沿 `ReaderPage` 检查器链路或跨端共享列表补这些剩余状态落点。

### 执行记录：FE-040（用户端首页页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/pages/DashboardPage.test.tsx` 补 RED，锁定三个真实缺口：资料区首屏没有共享 `loading`；资料读取失败时会静默退化成空态；未登录时个人笔记区仍伪装成“还没有笔记”的空态，而不是显式进入共享 `unauthorized`。
  - `frontend-user/src/pages/DashboardPage.tsx` 现已按资料、社区、笔记三块数据源分别补上 section-level `DataState` 接线：资料区和社区区补齐真实 `loading / error / empty`，个人笔记区补齐真实 `unauthorized / loading / error / empty`。
  - 首页的未登录笔记区现在会明确提示“登录后查看个人笔记”，而不是继续把权限边界伪装成空态；资料区与社区区在失败时也会保留独立的重试入口，不再吞掉真实错误原因。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/pages/DashboardPage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 这一步把用户端首页也接进了共享页面状态协议，并补上了用户端更通用的 `unauthorized` 真实入口，有助于把首页从“静默空态拼装页”收口成更可解释的工作台。
  - 当前社区页、设置页和 AI 工作台仍有本地空态/错误态直出路径；后续更适合继续沿这些剩余页面补共享 `error / unauthorized / stale`，把用户端状态协议进一步闭合。

### 执行记录：FE-040（用户端 AI 工作台页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/pages/AiPage.test.tsx` 补 RED，锁定两处真实缺口：AI 工作台首屏自举失败时只有局部 message，没有共享 `error` 页面状态；确认卡片草稿后如果刷新工作台失败，也没有共享 `stale` 提示且不会显式保留旧草稿上下文。
  - `frontend-user/src/pages/AiPage.tsx` 新增 `AiWorkspaceState` 与 `loadAiWorkspace({ preserveExisting })`，把 AI 工作台主入口接到共享页面状态协议：首屏失败走 `error`，已有草稿/任务上下文时刷新失败走 `stale`，并为两种状态都补上统一的“重新加载”动作。
  - 卡片草稿和图谱变更草稿在确认成功后现在都会以 `preserveExisting: true` 刷新工作台；如果刷新失败，页面会保留原有草稿、任务历史和目标卡组 / 图谱上下文，同时显式提示“AI 工作台需要刷新”，而不是把用户打回空白工作台。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 这一步把 AI 辅助理解这条主路径也接进了共享页面状态协议，用户端主学习闭环里的关键工作台又闭合了一段。
  - 当前社区页和设置页仍保留本地空态 / 错误态直出路径；后续更适合继续沿这些剩余页面补共享 `error / unauthorized`，把用户端页面状态协议继续铺平。

### 执行记录：FE-040（用户端社区页页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/pages/CommunityPage.test.tsx` 补 RED，锁定三个真实缺口：社区页首屏没有共享 `loading`；首屏读取失败会静默退化成空态；已有动态列表时刷新失败也没有共享 `stale`，不会显式保留旧内容。
  - `frontend-user/src/pages/CommunityPage.tsx` 新增 `CommunityFeedState` 与 `loadPosts({ preserveExisting })`，把社区动态主入口接到共享页面状态协议：首屏失败走 `error`，无内容时走 `empty`，已有动态列表时刷新失败走 `stale`。
  - 社区动态区现在补了真实的“刷新社区动态 / 重新加载”入口；在 `stale` 场景下会同时保留旧动态列表和共享状态提示，不再让一次刷新失败把用户打回“社区还没有公开分享”的误导性空态。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/pages/CommunityPage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/pages/CommunityPage.test.tsx src/pages/AiPage.test.tsx src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 这一步把社区浏览这条公共入口也接进了共享页面状态协议，用户端剩余“失败静默回空态”的页面又少了一块。
  - 当前设置页仍保留 profile 读取失败时静默无反馈的路径；后续更适合继续沿 `SettingsPage` 补共享 `loading / error`，把用户端剩余页面状态进一步收口。

### 执行记录：FE-040（用户端设置页页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/pages/SettingsPage.test.tsx` 补 RED，锁定三个真实缺口：设置页首屏没有共享 `loading`；profile 读取失败时静默无反馈；从共享错误态重试后也没有回到正常表单上下文。
  - `frontend-user/src/pages/SettingsPage.tsx` 新增 `SettingsProfileState` 与 `loadProfile()`，把设置页资料区接到共享页面状态协议：首屏读取中走 `loading`，profile 读取失败走 `error`，无资料时走兜底 `empty`。
  - 设置页现在会在共享 `error / empty` 状态里提供统一的“重新加载”动作；只有 profile 成功返回后才渲染资料表单，避免空白输入框继续伪装成正常态。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/pages/SettingsPage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/pages/SettingsPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-user run test -- src/pages/SettingsPage.test.tsx src/pages/CommunityPage.test.tsx src/pages/AiPage.test.tsx src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm run build:user`
  - `npm run verify:docs`
  - `git diff --check`
- 后续建议：
  - 这一步把设置页也接进了共享页面状态协议，用户端主学习闭环外层的基础页面语义又闭合了一段。
  - 后续更适合继续沿 `FE-040` 去补图谱页或更细粒度的 `unauthorized / conflict` 真入口，而不是在这一轮再扩散到新的产品域。

### 执行记录：FE-040（用户端图谱工作台页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 补 RED，锁定三个真实缺口：图谱工作台首屏没有共享 `loading`；首屏自举失败时没有共享 `error`；从共享错误态重试后也没有回到正常工作台上下文。
  - `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx` 新增 `GraphWorkspaceState` 与 `workspaceLoadError`，把图谱工作台主入口接到共享页面状态协议：首屏读取中走 `loading`，首屏失败走 `error`，已有图谱内容时重新自举失败走 `stale`。
  - 图谱工作台现在会在共享 `error / stale` 状态里提供统一的“重新加载”动作；首屏失败时不再继续渲染误导性的空画布，而是直接暴露共享 `DataState`。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 这一步把图谱主工作台也接进了共享页面状态协议，用户端核心学习舞台的状态语义又闭合了一段。
  - 图谱工作台更细粒度的资源切换、局部刷新以及 `unauthorized / conflict` 真页面入口仍未完全闭合；后续更适合继续沿图谱工作台或阅读检查器链路补这些剩余状态落点。

### 执行记录：FE-040（用户端分享页页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-user/src/pages/SharePage.test.tsx` 补 RED，锁定三个真实缺口：分享页首屏没有共享 `loading`；分享链接解析失败时没有共享 `error`；从共享错误态重试后也没有回到正常只读预览上下文。
  - `frontend-user/src/pages/SharePage.tsx` 新增 `SharePreviewState` 与 `loadShare()`，把公开分享页主入口接到共享页面状态协议：首屏读取中走 `loading`，解析失败走 `error`，无内容时走兜底 `empty`。
  - 分享页现在会在共享 `error / empty` 状态里提供统一的“重新加载”动作；只有分享内容成功返回后，页面才展示只读预览卡片和“打开原始页面”入口。
- 已执行验证：
  - RED：`npm --workspace frontend-user run test -- src/pages/SharePage.test.tsx`
  - GREEN：`npm --workspace frontend-user run test -- src/pages/SharePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
  - `npm run verify:docs`
- 后续建议：
  - 这一步把公开只读分享入口也接进了共享页面状态协议，用户端剩余“只靠局部 message 直出”的页面又少了一块。
  - 后续更适合继续沿图谱工作台、阅读检查器或受保护边界补更细粒度的 `unauthorized / conflict / stale` 真入口，而不是回到零散页面消息提示。

### 执行记录：FE-040（管理端 conflict 页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-admin/src/views/modules/AdminGovernanceModule.test.ts` 与 `AdminWorkspaceView.test.ts` 补 RED，锁定“治理动作命中后端 `409` 时仍只会退化成 stale，且不会明确进入共享 conflict 语义”的缺口。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 现已为资料治理、举报治理、用户治理、AI 任务治理与图谱模板治理动作补上真实 `409 -> conflict` 状态映射；当动作请求因为状态迁移冲突失败时，会直接落成共享 `DataState` 的 `conflict` 语义。
  - `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 现在会在 `conflict` 时同时保留现有治理表格与冲突提示，确保操作者既能看到“当前记录已变化”的说明，也不会丢掉冲突发生前正在查看的上下文。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
  - `npm run verify:docs`
  - `git diff --check`
- 后续建议：
  - 这一步把 `conflict` 推进到了管理端真实治理动作入口，管理端六态已经闭合；后续继续沿 `FE-040` 把同样的状态协议接到更多用户端列表、工作区和跨端共享页面。
  - 当前 `conflict` 主要覆盖的是动作型 `409` 冲突；后续如果后端补更多读取型或批量治理型冲突入口，也应继续沿同一协议接线，而不是回退成泛化 error/stale。

### 执行记录：FE-040（管理端 unauthorized 页面状态接线）
- 执行日期：2026-07-13
- 本轮完成：
  - 先在 `frontend-admin/src/views/modules/AdminModerationModule.test.ts`、`AdminGovernanceModule.test.ts` 与 `AdminWorkspaceView.test.ts` 补 RED，锁定“403 权限失败时模块页仍只显示 error / stale，且会继续暴露旧表格”的缺口。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 现已为审核队列与治理模块补充真实 `unauthorized` 状态入口：当工作台请求返回 `403` 时，会落成共享 `DataState` 的 `unauthorized` 语义，而不是继续退化成泛化错误态。
  - 同一轮里还补了最小的数据清理策略：审核队列与治理模块在 `403` 时会清空旧列表、清理治理详情引用，避免已经失去权限的操作者继续看到旧数据。
  - `frontend-admin/src/views/modules/AdminModerationModule.vue` 与 `AdminGovernanceModule.vue` 现在只在“无状态 / stale”时保留旧表格；`loading / error / unauthorized / conflict` 都不会继续渲染原有记录区。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
- 后续建议：
  - 这一步把 `unauthorized` 推进到了管理端真实页面入口，但 `conflict` 仍主要停留在共享语义与图谱专用路径，后续继续沿 `FE-040` 找跨端更通用的冲突态接线。
  - 目前 `refreshProfile()` / `loadOverview()` 这类更靠近壳层的请求失败仍主要通过顶部 `notice/error` 暴露；后续更适合在 `ADM-010` 拆 page / feature 边界时进一步收口“壳层权限失败”和“内容区权限失败”的分工。

### 执行记录：FE-040（共享设计 token 单一来源起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/tokens.css` 新增共享根 token 定义，并通过 `packages/ui/package.json` 暴露 `@studymate/ui/tokens.css` 入口，让共享设计 token 不再停留在规划态。
  - `frontend-user/src/styles.css` 现已先导入共享 token 样式，`frontend-user/src/styles/app.css` 与 `frontend-user/src/styles/ui-redesign.css` 内重复的 `:root` token 块已经移除，用户端完成 FE-040 的最小单一来源接线。
  - 新增 `packages/ui/src/tokens.test.ts` 与 `frontend-user/src/styles/tokenSource.test.ts`，锁定共享 token 文件存在、样式入口接线存在，以及用户端本地样式文件不再重复声明核心 token。
- 已执行验证：
  - RED：`npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
  - GREEN：`npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 继续沿 `FE-040` 让前后台更多局部样式细节消费共享 token，避免只在入口层统一、在组件层继续分叉。
  - 继续沿 `FE-041` 把更多 primitives 的视觉变量与状态契约收敛到 `@studymate/ui`，而不是继续在页面层维护局部副本。

### 执行记录：FE-041（共享基础组件契约第一批落地）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/index.ts` 开始直接导出共享 `DataState`、`Drawer`、`Inspector` 及其 props 类型，让 `@studymate/ui` 不再只承接 token 和状态文案，也开始承接真实组件契约。
  - `packages/ui/src/DataStateView.tsx`、`Drawer.tsx`、`Inspector.tsx` 新增最小 React primitive 实现，并保持既有 `ds-*` class 语义，避免用户端样式与调用面被迫重写。
  - `frontend-user/src/design-system/primitives/DataState.tsx`、`Drawer.tsx`、`Inspector.tsx` 改为兼容转发层，用户端既有 import 路径不变，但实现来源已收口到共享包。
  - `packages/ui/src/reactPrimitives.test.tsx` 新增共享组件契约回归，先用 RED 锁定缺失导出，再用 GREEN 验证共享包和用户端兼容面都能稳定通过。
- 验证：
  - `npx vitest run packages/ui/src/index.test.ts packages/ui/src/reactPrimitives.test.tsx`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx`
- 后续建议：
  - 继续沿 `FE-041` 把 Button、IconButton、Input、Select、Tag、ConfirmDialog、CommandBar、PageHeader 等更多 primitives 收口到 `@studymate/ui`，而不是继续在页面层保留平行实现。
  - 管理端后续如需共享更深的视觉/交互契约，应优先消费这层组件出口，而不是再从 `tokens.css` 重新拼装一套局部基础构件。

### 执行记录：FE-041（共享 IconButton 与骨架接线）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/IconButton.tsx` 新增共享 `IconButton`，统一 `icon-button` / `active` class 语义，并默认把字符串 `title` 映射为 `aria-label`，减少骨架层图标按钮的可访问性分叉。
  - `frontend-user/src/design-system/primitives/IconButton.tsx` 与 `index.ts` 新增用户端兼容出口，让页面层可以沿用本地 design-system 路径消费共享实现。
  - `packages/ui/src/Drawer.tsx` 改为直接复用共享 `IconButton`，共享层开始出现 primitive 之间的组合，而不再全部停留在“各自孤立”状态。
  - `frontend-user/src/app/chrome/CommandBar.tsx`、`modules/graph/components/GraphWorkspaceCanvasChrome.tsx`、`GraphWorkspaceShell.tsx` 已接入共享 `IconButton`，覆盖顶栏、图谱 command bar、图谱工具栏与若干抽屉/检查器关闭动作。
  - `packages/ui/src/reactPrimitives.test.tsx` 与 `frontend-user/src/design-system/primitives/IconButton.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、active 状态、点击行为与用户端兼容出口。
- 验证：
  - `npx vitest run packages/ui/src/index.test.ts packages/ui/src/reactPrimitives.test.tsx`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/IconButton.test.tsx src/design-system/primitives/Drawer.test.tsx src/app/layouts/AppShell.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/modules/graph/components/GraphWorkspaceShell.test.tsx`
- 后续建议：
  - 继续沿 `FE-041` 把 `primary-button` / `secondary-button` 背后的 Button 契约一起收口，避免共享层只有图标按钮而普通动作按钮仍留在页面层散落。
  - 阅读、笔记、复习页面仍有若干直接写死的 `icon-button`，后续可继续沿同一共享出口逐步替换。

### 执行记录：FE-041（共享 Button 图谱接线）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/Button.tsx` 新增共享 `Button`，统一 `primary`、`secondary`、`ghost` 三种变体，并收口 `active`、`danger`、默认 `type="button"` 等基础行为。
  - `packages/ui/src/index.ts` 与 `frontend-user/src/design-system/primitives/Button.tsx`、`index.ts` 已补齐共享导出与用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/modules/graph/components/GraphWorkspaceCanvasChrome.tsx`、`GraphWorkspaceShell.tsx`、`GraphWorkspaceImportPanel.tsx`、`GraphWorkspaceStageChrome.tsx` 已开始接入共享 `Button`，覆盖新建、保存、导入、校验与冲突处理等普通动作按钮。
  - `packages/ui/src/reactPrimitives.test.tsx` 与 `frontend-user/src/design-system/primitives/Button.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、按钮变体、`active` / `danger` 状态、默认按钮类型与用户端兼容出口。
- 验证：
  - RED：`npm --workspace frontend-user run test -- src/design-system/primitives/Button.test.tsx`
  - `npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/Button.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/modules/graph/components/GraphWorkspaceShell.test.tsx src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
  - `npm run typecheck`
  - `npm run build:user`
  - `npm run verify:docs`
- 后续建议：
  - 继续沿 `FE-041` 把阅读、笔记、复习与管理端里散落的普通动作按钮逐段迁入共享 `Button`，而不是只停留在图谱工作区。
  - 在共享 `Button` 语义稳定后，再继续推进 Input、Select、Tag、ConfirmDialog、CommandBar、PageHeader 等更高层 primitives 的统一出口。

### 执行记录：FE-041（共享 Tag 接入阅读与资料页）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/Tag.tsx` 新增共享 `Tag` primitive，先统一 `chip` / `muted` 两种基础语义，避免阅读、资料等页面继续各自写裸 `span` 与局部 class 组合。
  - `packages/ui/src/index.ts`、`frontend-user/src/design-system/primitives/Tag.tsx` 与 `index.ts` 已补齐共享导出和用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/pages/ReaderPage.tsx` 与 `frontend-user/src/pages/MaterialsPage.tsx` 已接入共享 `Tag`，覆盖阅读工作区元信息 chips 与资料详情标签，说明 `FE-041` 已开始从图谱骨架扩展到学习主路径页面。
  - `packages/ui/src/reactPrimitives.test.tsx` 与 `frontend-user/src/design-system/primitives/Tag.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、`muted` 变体和用户端兼容出口。
- 验证：
  - RED：`npx vitest run packages/ui/src/reactPrimitives.test.tsx frontend-user/src/design-system/primitives/Tag.test.tsx`
  - GREEN：`npx vitest run packages/ui/src/reactPrimitives.test.tsx frontend-user/src/design-system/primitives/Tag.test.tsx`
  - `npm --workspace frontend-user run test -- src/pages/ReaderPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 后续建议：
  - 继续沿 `FE-041` 把 Input、Select、ConfirmDialog、CommandBar、PageHeader 等仍未共享的 primitives 收口到 `@studymate/ui`，优先挑选已经出现在阅读、笔记、资料和后台治理页中的重复模式。
  - 管理端暂未直接消费这层 `Tag` 组件；后续如需更深共享，应优先复用同一套 class 语义和 token，而不是再扩写新的 badge/chip 分叉。

### 执行记录：FE-040 / FE-041（共享页面状态契约起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui` 新增共享 `dataStateKinds`、`DataStateKind` 与 `getDataStateLabel(...)`，先收口 Loading / Empty / Error / Unauthorized / Stale / Conflict 六类页面状态语义。
  - `frontend-user/src/design-system/primitives/DataState.tsx` 改为直接消费 `@studymate/ui` 的共享状态文案，避免阅读、笔记、复习页面继续各自维护一套页面状态标签。
  - `frontend-user/package.json` 显式声明 `@studymate/ui` workspace 依赖，补齐共享 UI 契约的工程边界。
- 已执行验证：
  - `npx vitest run packages/ui/src/index.test.ts`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/DataState.test.tsx`
- 后续建议：
  - 继续沿 `FE-040` 收口设计 token 单一来源，优先处理 `app.css` 与 `ui-redesign.css` 的重复 token。
  - 继续沿 `FE-041` 把 `Drawer`、`Inspector` 等已有 primitives 逐步迁入 `@studymate/ui`，而不是继续散落在各端页面里各自演化。

### 执行记录：PLAN-2026-07-08（PDF 评审导入）

- 执行日期：2026-07-08
- 输入材料：`StudyMate 代码审查与后续开发建议.pdf`
- 本轮结论：
  - PDF 中关于设计系统、共享 API、图谱控制器、后台单页工作台、搜索产品化和主学习闭环的建议仍成立，已拆为 `FE-040`、`FE-041`、`API-010`、`API-011`、`DEV-010`、`GPH-040`、`LC-010`、`ADM-010`、`ADM-011`、`SE-020` 等工作包。
  - PDF 中关于“根目录工程入口、lockfile、CI 缺失”的判断不直接套用于当前 Git 仓库；真实仓库已有 `package.json`、`package-lock.json` 与 `.github/workflows/ci.yml`，因此只保留 `DEV-010` 做工具链和可复现命令二次收口。
  - 新增任务不改变当前“先收口 P0/P1，再扩展工程图谱、桌面端、课程/协作”的项目边界。
- 验证：
  - 已抽取 PDF 全 16 页文本。
  - 已核验 `packages/ui`、`packages/api-client`、`packages/editor-core`、重复 CSS token、图谱控制器大小、管理端工作台大小、根 lockfile 与 CI 文件存在性。

### 执行记录：API-010（共享请求基础层起步）

- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 不再只暴露健康检查；新增共享 `ApiSuccessPayload` / `ApiErrorPayload`、`readApiResponse(...)`、`requestApi(...)` 与 `createAuthHeaders(...)`，并让 `getHealth(...)` 复用这层共享请求入口。
- `packages/api-client` 现已新增共享 `buildApiPath(...)`，开始承接数组 filters、`limit` 等 query/pagination 参数拼接，避免搜索与后台治理列表继续各自手写 `URLSearchParams` 或 `?limit=20`。
- `packages/api-client` 现也开始承接 JSON 请求体归一化：`requestApi(...)` 可直接接收 plain object / array 并统一序列化为 JSON，同时继续保持 `FormData` 等上传路径不被强塞 `Content-Type`。
  - `packages/api-client/src/index.test.ts` 先以 RED 锁定鉴权 header、JSON envelope 解析、`FormData` 上传不强塞 `Content-Type` 与 API 错误抛出，再转 GREEN。
  - `frontend-user/src/api/core.ts` 已改为复用 `@studymate/api-client` 的共享 request/auth-header 层；`frontend-user/src/api/types.ts` 不再重复维护本地 success/error envelope 类型。
- `frontend-user/src/api/search.ts` 已改为通过 `buildApiPath(...)` 构造 `q`、`types`、`limit` 查询参数，不再本地拼接 `URLSearchParams`。
- 用户端 `auth/community/graphs/materials/notes/reader/review/share` 等 API 模块现已改为直接把对象请求体交给共享层，不再各自手写 `JSON.stringify(...)`。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已改为通过共享 client 访问后台 API，并移除不再使用的本地响应解析分支。
- 新增 `frontend-admin/src/api/client.ts` 与 `frontend-admin/src/api/client.test.ts`，把管理端 `get/post` 请求边界从页面中抽出，并让治理列表的 `limit=20` 改为通过共享 query helper 生成、JSON POST body 改为由共享层统一编码。
  - `frontend-user/package.json`、`frontend-admin/package.json` 与 `package-lock.json` 已显式接入 `@studymate/api-client` workspace 依赖。
- 已执行验证：
  - RED：`npx vitest run packages/api-client/src/index.test.ts`
  - GREEN：`npx vitest run packages/api-client/src/index.test.ts`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/reader.test.ts src/api/reviewAi.test.ts src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run test -- src/api/searchShare.test.ts`
  - RED：`npm --workspace frontend-admin run test -- src/api/client.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:user`
  - `npm run build:admin`
- 后续建议：
  - 继续沿 `API-010` 补齐分页、更多上传路径与更稳定的 header 合并边界，而不是让新页面继续回到本地手写 fetch。
  - 在共享 request / error / query / JSON body 基线稳定后，继续沿 `API-011` 收口 refresh/replay/fail-logout 与更完整的会话生命周期。

### 执行记录：API-011（用户端共享会话刷新起步）

- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 新增共享 `ApiRequestError` 与 `createSessionRequest(...)`，开始承接 401 单次 refresh/replay、并发 refresh 去重与 refresh 失败时的本地 session 清理。
  - `packages/api-client/src/index.test.ts` 新增并发请求共享同一轮 refresh 的 RED/GREEN 用例，锁定“Access Token 过期后只刷新一次，再用新 token 重放请求”的共享层行为。
  - `frontend-user/src/app/sessionStore.ts` 新增可订阅的会话存储；`frontend-user/src/app/routes.tsx` 改为通过 `useSyncExternalStore(...)` 订阅 session，保证 refresh 成功或失败后，受保护路由能跟随同一份持久化状态更新。
  - `frontend-user/src/api/core.ts` 已接入共享 `createSessionRequest(...)`，统一通过 `/api/v1/auth/refresh` 刷新 Access Token；`withAuth(...)` 也会优先消费最新持久化 session，避免旧页面 props 把 stale token 再次写回请求头。
  - `frontend-user/src/api/sessionRefresh.test.ts` 先以 RED 复现图谱列表在 401 后不会自动恢复的问题，再转 GREEN，锁定“refresh 成功后更新本地 session 并重放原请求”的用户端闭环。
- 已执行验证：
  - RED：`npx vitest run packages/api-client/src/index.test.ts`
  - RED：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
  - GREEN：`npx vitest run packages/api-client/src/index.test.ts`
  - GREEN：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/sessionRefresh.test.ts src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 继续沿 `API-011` 把同一套 refresh/replay/fail-logout 扩到更多后台模块请求边界，避免前后台继续各自维护会话生命周期。
  - 在共享层补齐会话失效原因记录与 HttpOnly Refresh Token 迁移说明，再考虑把 `API-011` 从“已起步”推进到更完整的收口状态。

### 执行记录：API-011（会话失效原因与统一提示语义）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 为共享 `createSessionRequest(...)` 补上 `SessionInvalidationState` 与 `onSessionInvalidated(...)` 回调，让 refresh 失败不再只会清 session，也会把失效原因结构化写回前后台会话入口。
  - `frontend-user/src/app/sessionStore.ts` 与 `frontend-admin/src/api/sessionStore.ts` 现在都会分开持久化 session 和 invalidation 元数据；refresh 成功会清理旧失效记录，refresh 失败则保留原因，供 UI 在被动登出后读取。
  - `frontend-user/src/api/core.ts` 与 `frontend-admin/src/api/client.ts` 已接上新的 invalidation 回调；`frontend-user/src/pages/AuthPages.tsx`、`frontend-user/src/app/routes.tsx` 与 `frontend-admin/src/views/AdminWorkspaceView.vue` 则补齐了统一 fail-logout 提示语义，并在手动退出时显式清空旧失效提示。
  - 新增/更新 `packages/api-client/src/index.test.ts`、`frontend-user/src/api/sessionRefresh.test.ts`、`frontend-user/src/pages/AuthPages.test.tsx`、`frontend-admin/src/views/AdminWorkspaceView.test.ts`，先用 RED 复现“只清 session、不记录原因”和“登录页拿不到统一提示”的缺口，再转 GREEN。
- 已执行验证：
  - RED：`npx vitest run packages/api-client/src/index.test.ts`
  - RED：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npx vitest run packages/api-client/src/index.test.ts`
  - GREEN：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
  - GREEN：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx src/api/graphs.test.ts src/api/searchShare.test.ts`
  - `npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:user`
  - `npm run build:admin`
- 后续待续：
  - `API-011` 现在已不再缺“会话失效原因记录 / 统一 fail-logout 提示语义”，后续重点转向 HttpOnly Refresh Token 迁移说明与更多后台模块请求边界接线。
  - `ADM-010` 仍应继续把后台工作台从单页组件拆到可刷新 URL 和模块路由，而不是继续把更多会话衍生逻辑堆回视图层。

### 执行记录：API-011（管理端共享会话刷新起步）

- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 的 `createSessionRequest(...)` 已支持显式 `sessionOverride`，让管理端在继续传入当前页面 session 的同时，也能复用共享 refresh/replay/fail-logout 生命周期。
  - 新增 `frontend-admin/src/api/sessionStore.ts`，把后台会话持久化收口为可订阅 store，统一负责 `studymate.admin.session` 的读取、写入与清理。
  - `frontend-admin/src/api/client.ts` 已接入共享 `createSessionRequest(...)`，统一通过 `/api/v1/auth/refresh` 刷新后台 Access Token，并在刷新成功后持久化最新 session。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 登录、启动自举与退出流程已接到共享 session store；refresh 失败时会清空后台本地会话、重置治理工作台状态并回退到登录视图。
  - `frontend-admin/src/api/client.test.ts` 先以 RED 复现“后台令牌过期后不会自动 refresh/replay”的问题，再转 GREEN；`frontend-admin/src/views/AdminWorkspaceView.test.ts` 也锁定了“后台启动时 refresh 失败会回到登录页并清空会话”的回归。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/api/client.test.ts`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
  - `npx vitest run packages/api-client/src/index.test.ts`
  - `npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/api/graphs.test.ts src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续待续：
  - 继续沿 `API-011` 补齐会话失效原因记录与统一提示语义，避免当前只在各端以局部 notice/error message 体现失效结果。
  - 为更多后台 API 模块接出独立请求文件与共享 session 生命周期，减少 `AdminWorkspaceView.vue` 内仍然保留的单页工作台耦合。
  - 预留并补齐 HttpOnly Refresh Token 迁移说明，再考虑把 `API-011` 从“前后台均已起步”推进到更完整的收口状态。

### 执行记录：FE-010 / FE-020 / FE-030 / UI-04（验证收口）
- 执行日期：2026-07-08
- 执行基线：`master@10243e6`
- 本轮完成：
  - 收口 FE-010、FE-020、FE-030 与 UI-04 的真实依赖环境验证，不再保留“待完整依赖安装后复核”的状态。
  - 更新用户端 Playwright smoke，使壳层、图谱工作区和复习流断言与当前产品界面一致。
  - 为管理端工作台导航补充稳定语义：`aria-label`、`aria-pressed` 与 `data-admin-view`，降低管理端 Vitest 与 Playwright 对脆弱文案/位置选择器的耦合。
  - 重写 `frontend-admin/src/views/AdminWorkspaceView.test.ts`，锁定 users 模块的真实加载、`Bearer admin-token` 传递以及 `alice` 渲染结果。
- 已执行验证：
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-admin run typecheck`
  - `npm --workspace frontend-user run test -- src/app/layouts/layoutPolicy.test.ts src/app/layouts/AppShell.test.tsx src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm run build:user`
  - `npm run build:admin`
  - `npx playwright test e2e/user-shell.spec.ts e2e/v1-graph-workspace.spec.ts e2e/v1-review-flow.spec.ts e2e/v1-admin-governance.spec.ts`
- 验证结论：
  - 上述命令已在 2026-07-08 全部通过，FE-010 / FE-020 / FE-030 / UI-04 从“实现完成待验证”收口为“实现与回归均完成”。
  - 仍未包含多分辨率截图采集与更大范围全量 E2E 扫描；这部分保留给后续更系统的视觉验收和 `WB-034` 图谱回归矩阵。
### 执行记录：FE-010（验证中）

- 执行日期：2026-07-02
- 执行基线：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 本轮完成：
  - 新增 `layoutPolicy`，按路由解析 `standard` / `studio` / `canvas` / `focus` 四类工作模式。
  - 将原 `ShellFrame` 缩为兼容层，新的 `AppShell` 统一编排布局、搜索、导航和上下文策略。
  - 新增完整主导航、72px 紧凑导航和 `CommandBar`；图谱、阅读和笔记不再继承固定的 284px 主侧栏。
  - Canvas 与 Focus 工作区不再渲染通用 `ContextPanel`；图谱第一步已回收全局右栏空间，未触碰图谱 document、保存、快照、导入导出或冲突协议。
  - 新增 `Drawer`、`Inspector`、`DataState` 基础构件与布局 / 壳层 / 基础构件回归测试。
  - 新增 FE-00 前端能力矩阵、布局重构规格和验收清单，作为 FE-020 的实现约束。
- 验证状态：
  - 已完成静态 diff 检查与 TypeScript 语法转译检查。
  - 当前沙箱解析 npm 镜像时出现 `EAI_AGAIN`，因此 `npm --workspace frontend-user run typecheck`、Vitest、构建与 Playwright 仍待在具备依赖缓存或网络的开发环境中执行。
- 后续推进：
  - FE-020 图谱 CanvasLayout 与 FE-030 阅读、笔记、复习工作区体验对齐均已完成实现，待在具备完整 npm 依赖的环境复核运行测试。
- 下一项界面工作将继续把 WB-032 的更系统多端合并策略接入新的图谱 Inspector；当前已落地对象级冲突明细、取舍草稿展示、未标记对象默认行为提示、阻断问题旁的联动取舍建议，以及显式应用到最新 head 的合并草稿动作。

### 执行记录：FE-020 / FE-030（验证中）

- 执行日期：2026-07-02
- 执行基线：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 本轮完成：
  - 图谱页面升级为 CanvasLayout：资源区、画布与 Inspector 按屏幕宽度自动切换为并列或覆盖式 Dock。
  - 阅读与笔记升级为 StudioLayout：资料 / 笔记资源区与来源、版本、草稿检查器均可按需收起。
  - 复习页升级为 FocusLayout：单任务卡片舞台、键盘翻面和评分、按需卡组管理面板。
  - 保持 GraphDocument、版本、快照、来源关系、导入导出、阅读、笔记和复习 API 契约不变。
- 验证状态：
  - 已完成 TypeScript 源码语法转译、文档同步、空白字符和交付压缩包完整性检查。
  - 当前环境缺少完整 npm 依赖，类型检查、Vitest、构建与 Playwright 待在本机或 CI 执行。


### 执行记录：WB-032（2026-07-10 验证收口）

- 执行日期：2026-07-10
- 执行分支/提交：`master` / 未提交
- 本轮完成：
  - 复核 `FE-010`、`FE-020`、`FE-030`、`UI-04` 已有验证记录，当前不再存在更高优先级的 `VERIFY` 阻塞项。
  - 运行 `npm run verify:graph-conflicts`，串行复核图谱冲突处理的前端、后端、E2E 与文档同步入口。
  - 将 `WB-032` 从 `IN_PROGRESS` 收口为 `DONE`，并明确把更完整的 create/save/restore/export/layout/conflict/权限矩阵继续留给 `WB-034`。
- 当前结论：
  - `WB-032` 的验收边界已满足：旧版本保存会返回 `409 graph_version_conflict`，冲突态支持对象级取舍、联动建议、未标记对象默认沿用最新版本、显式应用到 rebased 草稿，以及冲突摘要 / JSON / 处理包导出。
  - 固定入口 `npm run verify:graph-conflicts` 已覆盖真实 `graph_version_conflict` 处理路径、对象级取舍后再保存、联动建议清阻断后再保存、未标记对象默认回退后再保存、多目标本地连线联动建议后再保存、latest-head 分组依赖清阻断后再保存，以及桌面 / 窄屏 smoke、布局预览、导出状态与权限路径。
  - 剩余“更完整的全矩阵扩展”属于 `WB-034` 的工作范围，而不是继续阻塞 `WB-032` 的收口。
- 验证：
  - `npm run verify:graph-conflicts`
- 后续衔接：
  - `WB-034` 应继续复用 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md` 与 `npm run verify:graph-conflicts` 作为固定入口，在此基础上扩更多权限分支、桌面 / 窄屏组合和 create/save/restore/export/layout/conflict 全矩阵。

### 执行记录：WB-032（进行中）

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 本轮完成：
  - 更新 `backend/internal/modules/graph/service/service.go`
  - 更新 `backend/internal/modules/graph/service/service_test.go`
  - 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`
  - 更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`
  - 更新 `PROJECT_LOG.md`
  - 更新 `CHANGELOG.md`
- 当前进展：
  - `BatchSave(...)` 现在会在持久化前校验 `request.document.version == graph.current_version`；旧标签页或旧草稿触发的保存会返回 `409 graph_version_conflict`，不再静默覆盖较新的 graph head。
  - 新增后端回归测试锁定“旧版本保存必须失败且不得写入 graph/version/current document”。
  - 前端持久化 hook 回归测试锁定“冲突失败后仍保留 dirty 编辑状态和冲突提示”，确保本地未保存修改不会被失败态吞掉。
  - 前端 `restoreSnapshot(...)` 现在会在存在 `dirty` 编辑时直接阻断快照恢复，并提示“请先保存后再恢复快照”，避免本地未保存修改被历史版本静默覆盖。
  - 页面级与 persistence helper 回归测试已锁定“dirty 时禁止恢复快照、且恢复请求不会发出”的行为。
  - 前端新增 `graphWorkspaceDraftRecovery` helper，并把 dirty 工作区按 graph 维度写入 `sessionStorage`，保存 `title` / `description` / `document` 与 `currentVersion`。
  - 同一图谱重新打开时，如果服务端 `currentVersion` 仍与本地草稿一致，则直接恢复本地未保存草稿并保持 `dirty` 状态；如果版本已变化，则清理 stale draft，避免把旧草稿静默盖回新 head。
  - 页面级与 helper 回归测试已锁定“同图谱 + 同版本可恢复、本地版本落后不可恢复”的行为。
  - 前端新增 `graphWorkspaceConcurrencySignal` helper，并按 `graphId + sessionId` 把当前窗口的 `dirty/currentVersion` 信号写入 `localStorage`，用于跨窗口冲突前置提醒。
  - 同图谱工作区现在会在检测到“另一窗口仍在编辑”时给出保存前提醒；若收到另一窗口已保存更高版本的信号，也会在当前页提示先刷新后继续编辑。
  - stale local draft 被放弃时，工作区不再静默回退到最新 head，而会明确告知“本地草稿基于旧版本，已放弃恢复并加载最新图谱”。
  - 图谱状态栏现在会在“另一窗口已保存更高版本”或“当前 batch-save 命中 `409 graph_version_conflict`”时提供 `重新加载最新图谱` 动作；dirty 状态下点击会先确认放弃未保存修改，再拉取服务端最新 head 并清理失败保存态。
  - `e2e/v1-graph-workspace.spec.ts` 现已同步锁定这条共享确认弹窗合同：冲突态点击 `放弃本地并重载最新图谱` 后，必须先看到 `确认重载最新图谱`，再经 `确认重载` 才进入“已重新加载最新图谱，未保存更改已放弃”的成功路径；常规视口与窄屏视口都已覆盖。
  - `e2e/v1-graph-workspace.spec.ts` 现在还会覆盖“对象级冲突取舍 -> 应用已标记取舍到当前草稿 -> 以 rebased document 再次保存”的真实浏览器主路径，并额外断言第二次 `batch-save` 请求会携带 `document.version = 5` 与保留后的本地节点，避免这条路径只停留在页面级回归里。
  - `e2e/v1-graph-workspace.spec.ts` 现在还会覆盖“本地草稿恢复 -> `dangling_edge` 阻断 -> 一键应用联动取舍建议 -> 应用已标记取舍 -> 以 rebased document 再次保存”的真实浏览器主路径，并断言最终提交的是“保留本地节点、回退本地连线”的 `2 节点 / 0 连线` 合并结果。
  - `e2e/v1-graph-workspace.spec.ts` 现在还会覆盖“latest-head 已删除旧连线 + 本地仅标记新节点 -> 未标记对象默认沿用最新版本 -> 以 rebased document 再次保存”的真实浏览器主路径，并断言最终提交的是“保留本地新节点、回退服务端已删除旧连线”的 `2 节点 / 0 连线` 合并结果。
  - `e2e/v1-graph-workspace.spec.ts` 现在还会覆盖“本地多目标连线 -> 一键应用 3 项联动取舍建议 -> 应用已标记取舍 -> 以 rebased document 再次保存”的真实浏览器主路径，并断言最终提交的是“保留两个本地目标节点、回退本地多目标连线”的 `3 节点 / 0 连线` 合并结果。
  - `e2e/v1-graph-workspace.spec.ts` 现在还会覆盖“latest-head 分组依赖阻断 -> 一键应用 2 项联动取舍建议 -> 应用已标记取舍 -> 以 rebased document 再次保存”的真实浏览器主路径，并断言最终提交的是“保留服务端节点、按本地删除服务端分组”的 `2 节点 / 0 分组 / 0 连线` 合并结果。
  - dirty 冲突态下，页面会额外提供 `复制当前草稿 JSON` / `导出当前草稿 JSON`，把“先留存本地修改，再决定是否放弃并重载”变成显式路径，而不是让用户自己去工具栏里猜测下一步。
  - 在完整草稿 JSON 之外，冲突辅助卡片现在还支持 `复制冲突摘要` / `导出冲突摘要`，可直接带走一份人类可读的 Markdown 取舍报告，便于后续同步或人工合并。
  - 在已拿到最新 head 的前提下，冲突辅助卡片现在还支持 `复制最新图谱 JSON` / `导出最新图谱 JSON`，让本地草稿、服务端最新版本和可读摘要都能一起带走。
  - 在上述三类材料之外，冲突辅助卡片现在还支持 `导出冲突处理包`，把本地草稿 JSON、最新图谱 JSON 和可读摘要收口到单一文件里，便于稍后人工比对。
  - 冲突辅助卡片现在还会显式提示“确认放弃本地修改”与“稍后人工合并”两条典型路径，并在卡片内直接提供 `放弃本地并重载最新图谱`，减少用户来回寻找动作入口。
  - 一旦任意冲突材料已成功复制或导出，冲突辅助卡片现在会额外提示“已留存冲突材料，可安全重载最新图谱”，把“已经留好证据”这件事显式化。
  - 在已经留存材料后，冲突辅助卡片现在还支持显式标记 `先保留本地，稍后人工合并`，并提示“已标记为稍后人工合并，当前继续保留本地草稿”，让“这次先不重载”的取舍也有可见状态。
  - 图谱冲突辅助卡片现在还会基于“最后一次已同步成功的图谱基线”展示当前未保存修改摘要，先告诉用户自己到底改了什么，再决定是否留存或放弃。
  - 图谱冲突辅助卡片现在还会静默拉取服务端最新 head，并并列展示“与最新图谱相比”的差异摘要，让用户不只知道自己本地改了什么，还知道这些改动与最新版本之间的主要差异。
  - 差异摘要已从“只有数量”进一步细化到“数量 + 关键对象名”，例如直接提示新增/修改的是哪些节点、哪些标题不一致，降低用户看到摘要后还要自己回画布猜测的成本。
  - 新导出的冲突摘要和冲突处理包现在都会附带“建议的人工合并步骤”清单，把留存草稿、核对本地摘要、核对最新 head 差异和最终是否重载的顺序直接写进导出物。
- 冲突辅助卡片、冲突摘要和冲突处理包现在还会共享对象级 `node / edge / group` 差异明细，统一使用 `节点｜新增｜新概念` 这类文本格式，为后续对象级保留 / 舍弃操作打底。
- 冲突辅助卡片现在还允许对每条对象级明细标记 `保留本地 / 保留服务端 / 稍后处理`，这些取舍草稿会同步进入 Markdown 冲突摘要和冲突处理包的 `resolutionDraft` 字段。
- 冲突辅助卡片现在还支持 `应用已标记取舍到当前草稿`，会基于最新 head 生成一份继续保持 dirty、但已经对齐最新版本号的合并草稿，供用户直接继续保存。
- 在真正应用这些取舍前，前端现在还会执行最小跨对象依赖校验：若合并草稿会留下 dangling edge / invalid group node，会直接列出阻断问题并要求用户先补齐相关节点或改为保留服务端。
- 当只标记了部分对象级取舍时，冲突辅助卡片现在还会显式统计剩余未标记对象，并说明“如果现在直接应用，这些对象会默认沿用最新图谱版本”；同样的默认行为也会写入人工合并清单，减少误操作。
- 当依赖校验真的触发阻断时，冲突辅助卡片现在还会直接给出联动取舍建议，例如一键补齐本地依赖节点，或一键把问题对象改为保留服务端，避免用户回到对象列表逐项搜索。
- 当同一组阻断会生成多条联动取舍建议时，冲突辅助卡片现在还支持 `一键应用 N 项联动取舍建议`：先把当前建议整组落成对象级取舍标记，再由用户决定是否继续应用到最新 head，减少逐条点击的重复操作。
- 在批量标记这些联动建议后，工作区状态栏现在还会同步返回带预检结论的反馈：既解释这次标记里有多少“保留本地 / 保留服务端 / 稍后处理”，也明确告知当前是否已经解除依赖阻断、能否继续应用已标记取舍。
- 当阻断尚未完全解除时，这条批量反馈现在还会补一段精简的剩余阻断对象摘要，例如“连线“Local edge”会引用未保留的节点”，帮助用户更快判断下一步还需要继续调整哪些对象。
- 在真正应用已标记取舍前，冲突卡片里的“取舍依赖校验问题”区块现在也会直接显示同一套阻断摘要，让最终预检卡片与状态提示使用一致的阻断解释。
- 同一组“取舍依赖校验问题”的逐条明细标题现在也会优先显示可读对象名，而不是裸 `targetId`，减少用户在摘要与明细之间来回对照时的认知跳转。
- 冲突卡片现在还会额外展示“应用前预检”摘要：直接告诉用户如果现在应用，会保留哪些取舍，或会被哪些依赖问题阻断，把结果预览前移到最终点击之前。
- 这条“应用前预检”摘要现在还会进一步并入未标记对象的默认回退结果，直接说明还有哪些对象会沿用最新图谱版本，减少“点应用后才意识到未标记对象被回退”的落差。
- 这条“应用前预检”摘要现在还会再补一层代表对象示例，例如“保留本地：本地节点 / 保留服务端：旧关系”，让用户在最终点击前不只知道数量，也知道这轮取舍主要覆盖了哪些对象。
- 这些阻断摘要现在会优先展示校验器生成的对象级短原因；当 message 只是泛化短码时，才回退到 `targetId` 或 `ruleType`，避免预检只暴露内部 ID。
- 冲突辅助现在还会为 `invalid_source_target` / `invalid_node_size` 这类节点级阻断生成可执行建议：如果本地节点来源信息不完整或尺寸非法，可直接改为保留服务端，而不是只停留在错误说明；对应阻断 message 与建议文案也已统一为中文。
- `GraphWorkspaceConflictResolutionDependencies` 页面级回归现在还锁定了 `invalid_source_target` / `invalid_node_size` 两条真实操作路径：先标记保留本地，再通过联动“保留服务端”解除阻断，并重新允许应用已标记取舍。
- 联动取舍建议现在还会按对象差异的 `action` 判定真正的“保留 / 放弃”方向；当阻断来自 latest head 里仍存在的边或分组、而当前取舍试图沿用本地删除结果时，建议会正确改成“保留服务端节点”或“按本地删除结果处理该服务端对象”，不再把 `removed` 语义反向解释成继续 `keep-local`。
- 当用户应用已标记取舍后，工作区状态栏现在还会返回可解释的结果摘要，例如“保留本地 2 项 / 保留服务端 1 项 / 稍后处理 1 项（已沿用最新版本）”，降低多端合并后的不确定感。
- 验证：
  - `go test ./internal/modules/graph/service`
  - `go test ./internal/modules/graph/...`
  - `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
  - `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
  - `npm run test:graph:conflicts:e2e`
  - `npm run verify:graph-conflicts`
  - `npm run verify:docs`
- 后续待续：
- 继续补更系统的多端 conflict handling，再将 `WB-032` 标记为完成；优先考虑更完整的对象联动策略、更多冲突类型的批量取舍辅助，以及把这类已能解释“已标记数量 + 代表对象 + 未标记默认回退 + 可读阻断原因 + 可读明细标题 + 中文节点级建议 + 节点级来源/尺寸阻断页面路径 + 多目标连线附加依赖节点 + latest-head 删除语义下的分组依赖 + latest-head 删除语义下的多目标连线路径”，且已被页面级冲突回归锁定并开始覆盖真实未标记回退、latest-head 分组依赖联动清阻断操作路径的应用前预检继续扩展成更完整的合并预检反馈；当前固定入口为 `npm run verify:graph-conflicts`，并已纳入带真实 `graph_version_conflict` 处理路径、对象级取舍应用后再保存主路径、联动取舍建议清阻断后再保存主路径、未标记对象默认沿用最新版本后再保存主路径、多目标本地连线联动建议后再保存主路径、latest-head 分组依赖联动建议后再保存主路径、窄屏 smoke、布局预览与导出状态、权限路径的 `e2e/v1-graph-workspace.spec.ts`，测试映射集中在 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`。

### 执行记录：WB-031

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/graph/dto/graph.go`
  - 更新 `backend/internal/modules/graph/repository/repository.go`
  - 更新 `backend/internal/modules/graph/router/router.go`
  - 更新 `backend/internal/modules/graph/handler/handler.go`
  - 更新 `backend/internal/modules/graph/handler/handler_test.go`
  - 更新 `backend/internal/modules/graph/service/service.go`
  - 新增 `backend/internal/modules/graph/service/layout.go`
  - 更新 `backend/internal/modules/graph/service/service_test.go`
  - 更新 `frontend-user/src/api/types.ts`
  - 更新 `frontend-user/src/api/graphs.ts`
  - 更新 `frontend-user/src/api/graphs.test.ts`
  - 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`
  - 新增 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/architecture/ARCHITECTURE.md`
  - 更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 图谱 head 现已显式暴露 `thumbnailFileId`，把 MySQL `graphs.thumbnail_file_id` 从数据库字段提升为前后端共享摘要契约。
  - 后端新增 `POST /graphs/:id/layouts/preview`，将来源泳道布局从前端局部 helper 提升为统一 graph API 契约，并明确该接口只返回草稿 document、不推进版本。
  - 前端图谱工作区现优先调用 layout preview API 生成来源泳道，接口不可用时回退本地 helper，兼顾统一契约与本地容错。
  - 新增 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`，把 JSON/SVG/PNG 导出边界、缩略图 head 模型和布局预览任务模型集中收口。
- 已执行验证：
  - `go test ./internal/modules/graph/service ./internal/modules/graph/handler`
  - `go test ./internal/modules/graph/...`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace @studymate/graph-core run test`
  - `npm run verify:docs`
- 未执行验证及原因：
  - `npm run ci`：本轮聚焦 graph 导出/缩略图/布局契约收口，先执行与图谱后端、前端 API 和 graph-core 直接相关的验证集合。
- 兼容性 / 迁移说明：
  - 新增 layout preview endpoint 不改变现有 batch-save / restore / import 路由与返回结构。
  - 来源泳道布局现在优先走后端预览接口；若本地开发或异常环境下接口不可用，工作区仍会回退到前端本地 helper。
  - `thumbnailFileId` 作为新增只读字段暴露到图谱摘要层，不会破坏旧客户端读取已有 graph payload。
- 下一建议任务：
  - `WB-032` 自动保存/快照/冲突处理可靠性
  - 原因：布局与产物模型已经收口，下一步最需要处理的是 autosave、snapshot 恢复与多端/旧草稿冲突的可见性和恢复安全。

### 执行记录：WB-030

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 新增 `backend/internal/modules/graph/service/service_test.go`
  - 更新 `backend/internal/modules/graph/service/service.go`
  - 新增 `backend/internal/modules/graph/dto/document_contract.go`
  - 新增 `backend/internal/modules/graph/dto/document_contract_test.go`
  - 新增 `frontend-user/src/api/graphs.test.ts`
  - 新增 `docs/architecture/GRAPH_API_LIFECYCLE.md`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/architecture/ARCHITECTURE.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `CHANGELOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 新增图谱生命周期文档，统一说明 graph head、Mongo current document、snapshot、version 索引和 source relation 的职责边界与版本推进语义。
  - 后端 graph service 新增 create / batch-save / restore 生命周期测试，锁定创建即落 version 1、batch-save 推进 head 版本，以及 restore 以旧内容生成新 head 的行为。
  - `NormalizeDocumentPayload(...)` 现改为始终以服务端权威覆盖 `graphId` / `version`，避免 snapshot restore 或客户端旧 payload 把过期版本号写回 current document。
  - restore snapshot 现会基于恢复后的 document 重新计算 `graph.mode`，避免 MySQL graph summary 与 Mongo current document 语义漂移。
  - 前端新增 `graphs.test.ts`，锁定 batch-save、snapshots、restore、markdown/mermaid import、validate 和 template endpoint 的 path / method / payload 契约。
- 已执行验证：
  - `go test ./internal/modules/graph/dto ./internal/modules/graph/service`
  - `go test ./internal/modules/graph/...`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts`
  - `npm --workspace @studymate/graph-core run test`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run verify:docs`
- 未执行验证及原因：
  - `npm run ci`：本轮聚焦图谱 lifecycle 契约、后端 graph 模块与前端 graph API/工作区回归，先执行了与工作包直接相关的验证集合。
- 兼容性 / 迁移说明：
  - 本轮不新增破坏性 endpoint，不调整 graph API path，只收口版本推进和 restore 语义。
  - 现有客户端即使传入旧 `document.version`，服务端也会统一改写为当前权威 head 版本，避免静默写回过期快照版本号。
- 下一建议任务：
  - `WB-031` 图谱导出、缩略图与布局能力
  - 原因：图谱现有 document/snapshot/version 生命周期边界已经收口，下一步可以在稳定契约上补 export artifact、thumbnail 和 layout 任务模型，而不是继续修补 head 语义。

### 执行记录：WB-023

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `packages/graph-core/src/file-format.ts`
  - 更新 `packages/graph-core/test/graphProductization.test.ts`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `CHANGELOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - graph-core 已补齐旧 `.smtg` 缺失 `schemaVersion` 的兼容导入回归测试
  - graph-core 已补齐数组 root / 非法 `document` 包装拒绝测试
  - history readable label / fallback label / past-future limit 已由 graph-core 用例锁定
- 已执行验证：
  - `npm --workspace @studymate/graph-core run test -- --testNamePattern="legacy root documents|graph history respects|graph history stores readable|round trips and rejects invalid schema"`
  - `npm --workspace @studymate/graph-core run test`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 未执行验证及原因：
  - `npm run ci`：本工作包只触及 graph-core 解析与相关文档，先执行了图谱相关最小回归集合；完整流水线留给后续更大工作包统一跑
- 兼容性/迁移说明：
  - 旧版缺失 `schemaVersion` 的 StudyMate 图谱 JSON 现在按 v1 兼容导入
  - 显式未知 schema、数组 root 和非法 `document` 包装仍会被拒绝，不放宽坏 payload 边界
- 下一建议任务：
  - `WB-031` 图谱导出、缩略图与布局能力
  - 原因：graph/document/snapshot/version 生命周期已经收口，下一步适合继续补导出产物与布局任务能力，而不是继续在契约层反复兜底

### 执行记录：WB-001

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `CODEX_PROJECT_CONTEXT.md`
  - 更新 `CODEX_EXECUTION_ROADMAP.md`
  - 更新 `CODEX_BACKLOG.md`
  - 新增 `WB-001_BASELINE_AUDIT.md`
  - 更新 `.env.example` 草案
- 完成证据：
  - 已核验 `search`、`share`、CI workflow、前后端壳层拆分均真实存在
  - 已记录配置默认值风险和文档漂移
  - 已给出 CI 与搜索的文件级后续计划
- 已执行验证：
  - `git status --short`
  - 关键配置、脚本、CI 与执行文档内容核对
- 未执行验证及原因：
  - 无
- 已补执行验证：
  - `npm run verify:docs`
  - `npm run typecheck`
  - `npm --workspace @studymate/graph-core run test`
  - `cd backend && go test ./...`
  - `npm run test:user`
  - `npm run test:admin`
  - `npm run build:user`
  - `npm run build:admin`
- 兼容性/迁移说明：
  - 本工作包仅修改执行文档与 `.env.example`
  - 不改后端默认行为，不改 API，不改数据库结构
- 已知风险：
  - `backend/internal/config/config.go` 的危险 fallback 仍存在，需在 WB-002 处理
- 下一建议任务：
  - `WB-002` 环境变量与安全默认值收口

### 执行记录：WB-002

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/config/config.go`
  - 新增 `backend/internal/config/config_test.go`
  - 更新 `backend/internal/app/server.go`
  - 更新 `backend/cmd/migrate/main.go`
  - 更新 `backend/cmd/backfill-note-documents/main.go`
  - 更新 `.env.example`
  - 更新 `docs/DEVELOPMENT.md`
- 完成证据：
  - `JWT_SECRET` 与 `MYSQL_DSN` 不再有可直接运行的 fallback
  - `server` 启动阶段会显式校验 `MYSQL_DSN` 与 `JWT_SECRET`
  - `migrate` / `backfill-note-documents` 会显式校验 MySQL 配置
  - `.env.example` 默认不再启用管理员引导账号
  - 开发文档已改为专用数据库账号与显式环境变量示例
- 已执行验证：
  - `gofmt -w backend/internal/config/config.go backend/internal/config/config_test.go backend/internal/app/server.go backend/cmd/migrate/main.go backend/cmd/backfill-note-documents/main.go`
  - `cd backend && go test ./internal/config`
  - `cd backend && go test ./...`
  - `npm run verify:docs`
  - `npm run typecheck`
  - `cd backend && $env:JWT_SECRET=''; $env:MYSQL_DSN=''; go run ./cmd/server`
  - `cd backend && $env:MYSQL_DSN=''; go run ./cmd/migrate`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 运行时不再接受缺失的 `MYSQL_DSN` 或 `JWT_SECRET`
  - 依赖旧 fallback 的本地环境需要显式设置环境变量后再启动
- 已知风险：
  - 现有 CI 仍未显式校验 `gofmt`、secret scan 与更强质量门禁，需在 `WB-003` 处理
- 下一建议任务：
  - `WB-003` 在现有 CI 基础上补强最小质量门禁

### 执行记录：WB-003

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 新增 `scripts/check-go-format.mjs`
  - 新增 `scripts/check-config-safety.mjs`
  - 更新 `package.json`
  - 更新 `.github/workflows/ci.yml`
  - 更新 `playwright.config.ts`
  - 更新 `e2e/v1-admin-governance.spec.ts`
  - 更新 `docs/DEVELOPMENT.md`
  - 对 `backend/` 全量 Go 文件执行 `gofmt -w`
- 完成证据：
  - CI 新增显式 `gofmt` 检查与配置安全检查
  - 本地 `npm run verify:backend:format` 与 `npm run verify:config-safety` 通过
  - `npm run ci` 在当前工作区完整通过
  - Playwright 预览端口已收口为更稳的高位默认值，并支持环境变量覆盖
- 已执行验证：
  - `npm run verify:backend:format`
  - `npm run verify:config-safety`
  - `go test ./...`
  - `npm run test:e2e`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - `npm run lint` 现在会额外执行 Go 格式化检查与配置安全检查
  - Playwright 默认 preview 端口改为 `44173` / `44174`，如有自定义环境可通过 `PLAYWRIGHT_USER_PORT` 与 `PLAYWRIGHT_ADMIN_PORT` 覆盖
- 已知风险：
  - 依赖审计、覆盖率闸门和更完整 secret scan 仍未纳入默认 CI
- 下一建议任务：
  - `WB-004` 版本与里程碑文档对齐

### 执行记录：WB-004

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/planning/versions/v1.0.0-release.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 外层版本文档已同步记录 `WB-002` 的配置安全收口：`JWT_SECRET` 与 `MYSQL_DSN` 不再允许危险 fallback，启动与迁移命令要求显式配置。
  - 外层版本文档已同步记录 `WB-003` 的最小 CI 门禁：`verify:backend:format`、`verify:config-safety`、`npm run ci` 与 Playwright 默认端口 `44173` / `44174`。
  - README、路线图、版本计划、变更记录和 release checklist 对当前基线的描述已一致，不再把已完成的工程收口项写成待做事项。
  - 执行面已把下一优先级重新收口到 `WB-010` 统一搜索契约。
- 已执行验证：
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包仅修改文档与执行记录，不改后端逻辑、不改前端行为、不改 API 契约、不改数据库结构。
- 已知风险：
  - 默认 CI 现已纳入依赖审计与 secret scan，但覆盖率硬门槛仍未落到默认流水线。
- 下一建议任务：
  - `WB-010` 核验并固定统一搜索契约

### 执行记录：WB-010

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/search/service/service.go`
  - 更新 `backend/internal/modules/search/service/service_test.go`
  - 更新 `backend/internal/modules/search/handler/handler.go`
  - 更新 `backend/internal/modules/search/handler/handler_test.go`
  - 更新 `frontend-user/src/api/searchShare.test.ts`
  - 更新 `frontend-user/src/api/types.ts`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 省略 `types` 或传空值时，搜索会稳定回退到 `material/post/note/graph/card` 五组默认搜索，而不再错误返回空分组。
  - 非法 `types` 会在 service 层先返回 `400 invalid_search_type`，不会继续落到 indexer。
  - `limit` 缺省/非法时回退为 `20`，超上限时稳定钳制为 `50`。
  - 前端搜索 API DTO 已显式固定 `SearchResult.type` 与 `source` 的联合类型，开发文档和 README 已同步 `source` 表示来源域而不是底层存储。
- 已执行验证：
  - `go test ./internal/modules/search/service`
  - `go test ./internal/modules/search/handler`
  - `go test ./internal/modules/search/...`
  - `npm --workspace frontend-user run test -- src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未改路由路径与 grouped payload 结构，仅收紧 query 参数和返回字段约束。
  - 若外部调用方此前显式传 `types=` 空值，现在会按默认五组搜索；若传未知类型，将稳定得到 `400 invalid_search_type`。
- 已知风险：
  - 当前仍未处理各结果分组内部的排序质量、摘要裁剪一致性与更多可见性边界，这些属于 `WB-011` 与 `WB-012`。
- 下一建议任务：
  - `WB-011` 聚合搜索结果质量补强

### 执行记录：WB-011

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/search/service/indexer.go`
  - 新增 `backend/internal/modules/search/service/indexer_test.go`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - fallback 搜索现在会先抓取一小批候选，再按“标题命中优先、摘要命中次之、同级保留原始更新时间顺序”稳定排序。
  - 搜索摘要已统一为单行预览，并在超长时裁剪到 160 个字符以内，避免把整段正文直接暴露给搜索结果卡片。
  - 结果质量规则已由纯逻辑测试锁定，不依赖真实数据库即可回归排序和摘要裁剪行为。
- 已执行验证：
  - `go test ./internal/modules/search/service`
  - `go test ./internal/modules/search/...`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未修改搜索路由与 grouped payload 结构，只改善组内排序与摘要展示质量。
  - 同一组内仍以数据库返回的最新顺序作为同级 tie-breaker；更复杂的相关性模型仍留在后续索引升级阶段。
- 已知风险：
  - 当前尚未系统补齐私有笔记、私有图谱、未发布内容的权限矩阵测试，这属于 `WB-012`。
- 下一建议任务：
  - `WB-012` 搜索权限/可见性过滤与测试

### 执行记录：WB-012

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/search/service/indexer.go`
  - 更新 `backend/internal/modules/search/service/indexer_test.go`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - note / graph / card 三类搜索在匿名请求下会直接短路为空结果，不再依赖隐含查询条件。
  - material / post 搜索继续显式限定公开内容；graph 搜索补上 `status = active`，并仅允许“owner 或 public”结果进入候选集。
  - 权限过滤已由纯 `searchQuerySpec` 测试锁定，不依赖真实数据库即可回归核心可见性矩阵。
- 已执行验证：
  - `go test ./internal/modules/search/service`
  - `go test ./internal/modules/search/...`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未修改搜索路由与 grouped payload 结构，重点是收紧 fallback 搜索的可见性条件。
  - graph 搜索现在明确只返回 `active` 状态的 owner/public 图谱；如果历史数据依赖其他状态被搜到，需要显式迁移到 `active`。
- 已知风险：
  - 当前 `/api/v1/search` 仍然只有 grouped payload 与 `limit`，没有 offset/cursor；搜索页分页目前明确限定在“当前批次结果”内。
- 下一建议任务：
  - `WB-013` 用户端搜索页体验与回归补强

### 执行记录：WB-013

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`
  - 新增 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx`
  - 更新 `frontend-user/src/styles/search-review.css`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 搜索页新增 URL 驱动的类型筛选，`types` 会与页面状态和 API 请求保持同步。
  - 搜索页补齐页面级回归测试，覆盖无关键词空态、后端错误态、类型筛选请求形状，以及结果来源链接与当前批次分页切换。
  - 每组结果当前批次最多拉取 `12` 条、每页展示 `4` 条，并在 UI 中明确说明这不是后端 offset/page 分页。
- 已执行验证：
  - `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-user run test`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未修改 `/api/v1/search` 路由或 grouped payload 结构，只补用户端交互、状态同步和页面级回归。
  - 若后续需要跨批次真分页，应先扩展后端 offset/cursor 契约，再调整前端表现。
- 已知风险：
  - 当前分页仍受 `limit` 上限约束，更适合做“当前批次浏览”；当结果规模进一步增大时，仍需要后端分页或 cursor 方案。
- 下一建议任务：
  - `WB-014` 搜索文档与回归记录

### 执行记录：WB-014

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 新增 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`
  - 更新 `package.json`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 搜索 API 契约、权限矩阵、用户端 URL/分页边界和自动化映射已集中沉淀到单一文档，不再分散依赖 README、开发文档和历史日志拼接理解。
  - 根脚本新增 `npm run verify:search`，把前端 API 测试、搜索页页面测试、后端 search 模块测试、搜索 smoke 和文档同步串成一个固定入口。
  - 该文档显式写明“当前分页只覆盖当前批次结果”，为后续 `SearchIndexer` 升级或后端真分页扩展保留清晰边界。
- 已执行验证：
  - `npm run verify:search`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包不修改 `/api/v1/search` 路由、grouped payload 结构或现有权限逻辑，只补集中化文档与脚本入口。
  - `test:search:e2e` 当前依赖用户端 build 与 Playwright public flow smoke；若后续拆分专门的搜索 smoke 文件，可保持 `verify:search` 入口不变。
- 已知风险：
  - 搜索专项验证已集中化，但后端仍未提供 offset/cursor 真分页；任何需要跨批次翻页的产品需求都不能只靠当前文档或前端分页实现。
- 下一建议任务：
  - `WB-020` 图谱文档模型与版本策略
