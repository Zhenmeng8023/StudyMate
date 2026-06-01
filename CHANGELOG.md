# Changelog

所有重要变更都会记录在此文件中。格式遵循 Keep a Changelog 的基本结构，版本号按 StudyMate 发布节奏维护。

## Unreleased

### Added

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
