# Changelog

所有重要变更都会记录在此文件中。格式遵循 Keep a Changelog 的基本结构，版本号按 StudyMate 发布节奏维护。

## Unreleased

### Added

- v1.1 图谱冲突辅助新增联动取舍建议：当已标记取舍会留下 dangling edge / invalid group node 时，冲突卡片会直接给出“联动保留本地依赖节点”或“改为保留服务端”的快捷动作，帮助用户当场解除阻断。
- v1.1 图谱冲突辅助新增未标记对象提示：冲突卡片会统计尚未标记的对象数量，明确说明直接应用时这些对象会默认沿用最新图谱版本，并把同样的默认行为写入人工合并清单。
- v1.1 图谱冲突辅助新增对象级取舍依赖校验：当已标记取舍会留下 dangling edge / invalid group node 时，冲突卡片会直接列出问题并阻断“应用已标记取舍到当前草稿”。
- 前端 FE-03 新增阅读、笔记、复习三类工作区：阅读与笔记采用可收起资源区 / Inspector，复习采用单任务舞台与按需卡组管理；新增对应页面回归测试和 `studio-workspaces.css` 响应式样式。
- 前端 FE-00 / FE-01 新增能力矩阵、布局规格、`AppShell` 路由布局策略、紧凑导航、命令栏、Drawer、Inspector、DataState 与最小回归测试；图谱 Canvas 工作区现不再继承全局 `ContextPanel`。
- Added `verify:backend:format` and `verify:config-safety` root scripts, plus CI workflow steps that explicitly gate Go formatting and configuration safety regressions.
- v1.1 搜索契约补强新增后端 search handler/service 回归测试，覆盖空 `types` 默认五组搜索、非法类型 `400 invalid_search_type`，以及 `limit` 上限钳制到 `50`。
- v1.1 搜索契约补强新增用户端 search API 回归测试，锁定“不传 `types` 时不发送空 `types=` 参数”的请求形状。
- v1.1 搜索结果质量补强新增纯逻辑回归测试，覆盖“标题命中优先”排序和长摘要折叠/截断规则。
- v1.1 搜索权限矩阵补强新增纯 `spec` 测试，覆盖匿名短路 `note/graph/card`、公开资料/社区过滤，以及 graph 的 `active + owner/public` 约束。
- v1.1 搜索页体验补强新增 `SearchWorkspacePage` 页面级回归测试，覆盖无关键词空态、后端错误态、URL 类型筛选、来源链接和当前批次分页切换。
- v1.1 搜索文档收口新增 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`，并补 `npm run verify:search` 作为搜索专项回归入口。
- v1.1 图谱文档契约收口新增 `docs/architecture/GRAPH_DOCUMENT_CONTRACT.md`、前端 `graphDocumentPayload` 兼容适配测试，以及后端 graph DTO 共享默认化测试，锁定 `GraphDocument` / `schemaVersion` / 空文档兼容读取规则。
- v1.1 图谱 API 生命周期收口新增 `docs/architecture/GRAPH_API_LIFECYCLE.md`、后端 graph service 生命周期测试和前端 `graphs` API 契约测试，并修复 snapshot restore 时 `document.version` 可能回落为旧值、以及 `graph.mode` 可能与恢复后文档不一致的问题。
- v1.1 图谱导出/缩略图/布局契约收口新增 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`、graph 摘要 `thumbnailFileId` 字段，以及 `POST /graphs/:id/layouts/preview` 来源泳道预览接口；前端工作区现优先走后端布局预览，失败时回退本地 helper。
- v1.1 质量硬化新增用户端 search/share API 合约测试，覆盖 grouped search 查询参数、owner share link 创建载荷和 public share token 解析路径。
- v1.1 质量硬化新增用户端 review/AI API 合约测试，覆盖 Deck/Card、今日队列、复习回写、AI drafts/tasks/usage 和图谱变更草稿确认请求形状。
- v1.1 质量硬化新增 ReviewWorkspace 页面级测试，覆盖今日队列展示、翻面和评分回写。
- v1.1 质量硬化新增 AiPage 页面级测试，覆盖待确认 AI 卡片草稿写入复习 deck、图谱变更草稿写入目标图谱。
- v1.1 质量硬化新增管理端治理页回归测试，覆盖已有 admin session 下 `/api/v1/admin/users?limit=20` 的真实模块加载和鉴权头。
- v1.1 质量硬化新增后端 search/share/admin handler 测试，并将 search/share handler 依赖改为最小 service interface，便于 fake 注入。
- v1.1 质量硬化新增后端 card handler 测试，并将 card handler 依赖改为最小 service interface，覆盖卡组创建、今日队列和复习回写入口。
- v1.1 质量硬化新增后端 graph handler 测试，并将 graph handler 依赖改为最小 service interface，覆盖图谱变更草稿确认入口的鉴权用户、graph id、`draftIds` 与 `nodeSelections` 传递。
- v1.1 质量硬化新增后端 AI handler 测试，并将 AI handler 依赖改为最小 service interface，覆盖 tasks、usage 和 drafts 读取入口的鉴权用户与 success envelope。
- v1.1 质量硬化新增 Playwright 搜索页和分享只读页 smoke，前端 E2E 由 1 条扩展为 3 条。
- v1.1 质量硬化新增 Playwright 复习队列 smoke，通过测试 session 和 API 拦截覆盖 `/review` 到期卡片翻面、Good 评分与回写请求。
- v1.1 质量硬化新增 Playwright 后台治理 smoke，并让 E2E 同时启动用户端与管理端 preview，覆盖管理端 users 模块加载和 admin token 传递。
- v1.1 质量硬化为公共首页 Playwright smoke 增加 API 拦截，移除无本地后端时的 Vite proxy 噪声。
- v1.1 质量硬化为后端 search service 增加 `SearchIndexer` 抽象与分组查询测试，默认实现仍保持 MySQL fallback，不改变现有 `/api/v1/search` 契约。
- v1.1 图谱工作区新增 `graphHistory.ts` 及回归测试，把 history/autosave/undo-redo 状态转移从 `useGraphWorkspaceController.tsx` 继续下沉为可复用纯逻辑。
- v1.1 阅读器链路新增 Reader API 合约测试、`ReaderPage` 书签/批注来源回归测试，以及后端 `reader/handler`、`reader/service` 边界测试；`reader/handler` 与 `reader/service` 同步收窄为最小依赖接口以支持 fake 注入，不改变现有 `/api/v1/materials/:id/reader*` 契约。
- 新增 `test:coverage` 发布门禁脚本，覆盖用户端、管理端、图谱核心和 Go 后端覆盖率汇总。
- 新增用户端与管理端 `zh-CN` 源字典和 `en-US` 占位字典框架，并通过测试校验字典键一致。
- 新增用户端 API 域文件、分层 CSS 文件和图谱工作区 helper 文件，降低后续 v1 收口时的单文件维护压力。
- 新增 `backfill-note-documents` 命令、PDF 批注 `rects` 坐标字段、Reader 来源展示和图谱 200 节点性能回归测试。
- 新增 `docs/design/UPGRADE_DESIGN.md` 作为升级设计主入口，并保留根目录设计说明兼容入口。
- 新增 v1.0 路线图、版本计划、图谱产品化说明、PR 模板、CI 骨架和文档同步脚本。
- 新增根脚本 `lint`、`test:user`、`test:admin`、`test:e2e`、`verify:docs`、`ci`。
- 前台用户端接入 Vitest + React Testing Library，后台管理端接入 Vitest + Vue Test Utils，端到端接入 Playwright。
- 用户端主应用拆分为 routes、shell、pages、features；图谱和管理端入口文件改为薄壳并建立 components/hooks/state/lib/exporters/importers/router/views 目录边界。
- 新增 `NOTE_READ_MODEL` 后端读取开关，支持 `mysql_primary` 与 `mongo_primary` 两套笔记正文读取策略。

### Changed

- 用户端阅读、笔记与复习页面已从通用内容页改为 Studio / Focus 工作区体验；既有 Reader、Note、Deck/Card、SM-2、草稿和来源 API 契约保持不变。
- Search contract now treats omitted/blank `types` as the default `material/post/note/graph/card` groups, rejects unknown types before hitting the indexer, and documents `source` as a domain field rather than a storage-engine marker.
- Search `limit` now defaults to `20` when missing/invalid and clamps to `50` when callers ask for a larger page size.
- MySQL fallback search now fetches a slightly larger candidate set, keeps title matches ahead of summary-only matches within each group, and normalizes long summaries into single-line previews.
- Search fallback now encodes its visibility rules explicitly: anonymous requests short-circuit `note/graph/card`, and logged-in graph queries only return `active` records that are either owned by the caller or public.
- Search workspace UI now syncs `types` filters into the URL and paginates each fetched result batch locally, while explicitly documenting that backend offset/page pagination is not available yet.
- Search regressions now have a dedicated `verify:search` command that runs frontend API/page tests, backend search tests, search smoke coverage, and document sync together.
- Graph document normalization is now explicit on both sides of the wire: frontend workspace payloads reuse `@studymate/graph-core` normalization with UI viewport defaults, while backend graph DTO helpers normalize current documents, snapshots, imports, and restores through one shared contract.
- Graph workspace state extraction now continues through shared graph-core helpers: explicit multi-select replacement, viewport zoom/reset transitions, and frontend history undo/redo wrappers all delegate to reusable `selection` / `viewport` / `history` primitives.
- Graph workspace import/export/validation now routes through one frontend facade: JSON/SVG export descriptors, JSON import blocking rules, Markdown/Mermaid remote import normalization, and validate status messages all flow through `graphFileImportExport.ts`.
- Graph batch-save now rejects stale document versions with `409 graph_version_conflict` instead of silently overwriting newer heads, and frontend persistence regressions now lock that dirty local edits remain visible after a conflict.
- Graph snapshot restore now refuses to run while the workspace is still dirty, preserving unsaved local edits and showing an explicit “save before restore” message instead of silently replacing the canvas.
- Graph workspace persistence now stores dirty drafts per graph in browser `sessionStorage`, restores them only when the reopened graph is still on the same head version, and drops stale local drafts instead of replaying them over a newer server document.
- Graph workspace now also emits per-window concurrency signals through `localStorage`, warns when another window is still editing or has already saved a newer version, and explains when a stale local draft is intentionally discarded.
- Graph workspace status now offers an explicit `重新加载最新图谱` action after cross-window version-ahead warnings or `409 graph_version_conflict`, confirms before discarding dirty edits, and clears failed-save UI after reloading the latest server head.
- Graph workspace now also shows conflict-assist actions for dirty conflict states, letting users copy or export the current draft JSON before they choose to reload the latest graph head.
- Graph conflict assist now summarizes the current unsaved local changes against the last synced graph baseline, so users can see what they are about to keep or discard before reloading.
- Graph conflict assist now also compares the dirty local draft against the latest server head and shows a second summary for “与最新图谱相比”, instead of limiting the user to purely local unsaved-change hints.
- Graph conflict summaries now include key object names alongside counts, so conflict hints can say which node/group/title changed instead of only reporting coarse totals.
- Graph conflict assist now also lets users copy or export a portable Markdown conflict summary, so they can carry human-readable local-vs-latest context away before deciding whether to reload the latest head.
- Graph conflict assist now also lets users copy or export the latest server-head StudyMate JSON during a dirty conflict, so local draft JSON, latest-head JSON, and the readable conflict summary can all be carried away for later manual comparison.
- Graph conflict assist now also exports a single conflict bundle JSON, packaging the local draft artifact, latest-head artifact, and readable conflict summary together for later manual comparison or merge prep.
- Graph conflict assist now also surfaces explicit disposal guidance and an in-card `放弃本地并重载最新图谱` action, so conflict handling is no longer split between material export and a separate status-bar-only reload entry.
- Graph conflict assist now also marks when conflict materials have already been captured successfully, surfacing an explicit `已留存冲突材料，可安全重载最新图谱` cue before the user discards local edits.
- Graph conflict assist now also lets users explicitly mark `先保留本地，稍后人工合并`, keeping the local draft in place while surfacing a matching status cue instead of forcing an immediate reload decision.
- Graph conflict summary exports now append a concrete manual-merge checklist, and the conflict bundle JSON carries the same `manualMergeChecklist` field so users can reopen the local-vs-latest comparison with explicit next steps.
- Graph conflict assist, summary exports, and conflict bundles now all carry object-level node/edge/group diffs using a shared `节点｜新增｜...` style, giving manual merge work a concrete review list instead of only summary counts.
- Graph conflict assist now also lets users mark object-level merge intentions as `保留本地` / `保留服务端` / `稍后处理`, and both the Markdown summary and conflict bundle carry the same `resolutionDraft` trail for later manual merge work.
- Graph conflict assist now also lets users explicitly apply those marked object-level decisions onto the latest server head, generating a rebased dirty draft that keeps the latest version number while remaining directly saveable.
- Graph `.smtg` parsing now accepts legacy payloads that omit `schemaVersion` as v1-compatible imports, while still rejecting array roots and invalid wrapped `document` payloads; graph-core regressions now also cover history fallback labels and past/future stack limits.
- Backend config no longer falls back to dangerous default `JWT_SECRET` and `MYSQL_DSN` values; startup and migration-related commands now fail fast with explicit configuration errors.
- Playwright preview defaults moved from ports `4173/4174` to `44173/44174`, with environment-variable overrides for local or CI environments.
- Ran `gofmt` across the backend so the new Go formatting gate can pass consistently.
- README 当前阶段更新为真实项目状态：阅读/笔记已闭环，图谱工作区为强 MVP，复习和 AI 部分实现，后台审核主链存在但治理能力不完整。
- `.gitignore` 重新允许 `PROJECT_LOG.md`、`docs/planning/` 和 `docs/design/` 进入版本治理。
- GitHub CI 扩展为覆盖 Node 24、Go 1.26、前后台构建、前后台测试、Playwright、图谱核心测试、后端测试和文档同步。
- 管理端样式从 `App.vue` 内联块迁出到 `components/admin/admin.css`，降低 Vue 视图单文件体积。

### Planned

- 建立 CI 与前端测试基线。
- 拆分用户端、图谱工作区和管理端超大文件。
- 收口阅读/笔记、图谱、复习/AI、搜索/后台治理与分享。

## D milestone update

### Added

- Added v1 search/admin/share closure: `GET /api/v1/search` grouped MySQL fallback, `share_links` migration with owner APIs and public token resolve, and admin governance APIs for users, reports, tags, AI tasks/usage, audit logs, and files.
- Added user-facing `/share/:token` read-only page and moved search UI to backend grouped results.
- Added SM-2 scheduler interface boundary so v1 keeps SM-2 while later schedulers can be swapped without changing route contracts.

## v1.0.0 - 2026-06-01

### Added

- Release-ready web user site, web admin, and backend API scope for v1.0.0.
- `NOTE_READ_MODEL=mysql_primary|mongo_primary`, note document backfill, PDF annotation `rects`, graph performance regression fixture, grouped MySQL fallback search, share links, and admin governance APIs.
- Coverage scripts, zh-CN source dictionaries, en-US placeholder dictionaries, release checklist, environment matrix, migration order, demo steps, rollback steps, and known non-blockers.

### Verification

- Final gate requires `npm run ci`, `npm run test:coverage`, secret scan, diff review, release smoke flow, and local annotated tag `v1.0.0`.

## FE-02 - 2026-07-02

### Changed

- 用户端图谱工作区从固定 `252px + 画布 + 296px` 三栏改为 CanvasLayout：宽屏可并列资源/画布/检查器，中小屏两侧改为覆盖式 Dock，不再持续挤压画布。
- 图谱顶部移除开发阶段长说明，改为图谱标题、保存状态、新建、保存和左右面板开关组成的紧凑命令栏。
- 资源区改为图谱、来源、模板三类 Tab；检查器改为概览、属性、来源、历史、导入、冲突六类 Tab。
- 版本冲突辅助从画布上方迁入检查器“冲突”Tab；检测到冲突时自动打开，仍保留草稿、最新 head、摘要和冲突处理包导出能力。
- 快照、卡片草稿、导入与校验的开发阶段 `Phase` 文案替换为正式任务文案。

### Added

- `GraphWorkspaceCanvasChrome`、`GraphWorkspaceOverviewPanel` 与 `graph-canvas.css`。
- 图谱 Canvas 命令栏和 Tab 切换的最小组件回归测试。

## UI-04 - Product-wide interface redesign

- Reworked the user shell into a task-first navigation and command-bar system.
- Made graph canvas the default primary surface; docks now open on demand and use explicit grid columns.
- Unified visual density across dashboard, library, community, AI, settings, reader, notes and review.
- Rebuilt the admin workspace around operational metrics, searchable tables and record inspection.

### UI-04 verification note

- Added product-wide layout and information-density refresh for the user application and admin governance workspace; code-contract behavior remains unchanged.
- Validated frontend source syntax, docs synchronization and archive integrity in the delivery environment. Full package typecheck/test/build remains pending a clean `npm ci` in local or CI.

### UI-04 verification note

- Added product-wide layout and information-density refresh for the user application and admin governance workspace; code-contract behavior remains unchanged.
- Validated frontend source syntax, docs synchronization and archive integrity in the delivery environment. Full package typecheck/test/build remains pending a clean `npm ci` in local or CI.
