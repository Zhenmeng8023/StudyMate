# Changelog

所有重要变更都会记录在此文件中。格式遵循 Keep a Changelog 的基本结构，版本号按 StudyMate 发布节奏维护。

## Unreleased

### Added

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
