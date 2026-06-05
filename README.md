# 学伴图谱

学伴图谱是一个以知识图谱画布为中心的学习平台。它把资料收集、PDF 阅读、批注摘录、富文本笔记、图谱组织、卡片复习、AI 学伴和社区分享串成一条可治理的学习闭环。

```text
资料库 -> 阅读器 -> 批注摘录 -> 笔记沉淀 -> 图谱组织 -> AI 辅助 -> 卡片复习 -> 社区分享
```

## 当前阶段

`v1.0.0` 已完成本地发布标签，当前进入 `v1.1` 产品质量与测试硬化阶段。真实状态如下：

- 阅读/笔记主链路已闭环：资料、PDF 阅读、批注、书签、富文本笔记、版本历史和 MongoDB 内容快照已经具备可用基础。
- 图谱工作区已是强 MVP：支持创建保存、搜索定位、来源泳道、来源摘要、AI 落点预览、Markdown/Mermaid 导入、PNG/SVG 导出和快照恢复基础；`v1.1` 已开始把 history/autosave/undo-redo 状态迁出大控制器并补图谱状态回归测试。
- 复习和 AI 已具备 SM-2 调度边界、Deck/Card 与 AI draft 基础闭环；`v1.1` 已开始补 Deck/Card、今日队列、复习回写、AI 草稿/用量/任务 API 合约测试、图谱变更草稿确认 API 合约测试、后端 card/AI handler 边界测试、ReviewWorkspace 页面回归测试、复习队列 Playwright smoke，以及 AI 卡片/图谱草稿确认页面测试。
- 搜索、分享和后台治理已接入真实 API；`v1.1` 正在补充用户端 search/share API 合约测试、后台治理页回归测试、后端 handler/service 边界测试，以及覆盖用户端和管理端 preview 的 Playwright smoke，并先通过内部 `SearchIndexer` 抽象保留 MySQL fallback 默认实现。
- 阅读器/笔记收口继续按 TDD 推进：已补用户端 Reader API 合约测试、`ReaderPage` 书签与批注来源回归测试，以及后端 `reader/handler`、`reader/service` 的鉴权、请求体和来源选择边界测试。
- `v1.x` 范围仍只包含 Web 主站、Web 后台和后端 API；课程/LMS、Tauri 桌面端、多人实时协作、PWA 离线和向量搜索不作为当前阻塞项。

## 技术栈

- 后端：Go + Gin + GORM
- 前台用户端：React + Vite + TypeScript
- 后台管理端：Vue 3 + Vite
- 数据层：MySQL、MongoDB、Redis
- 阅读：PDF.js / react-pdf
- 编辑：Tiptap
- 图谱核心：`@studymate/graph-core`

## 文档导航

- 版本路线：[docs/planning/ROADMAP.md](docs/planning/ROADMAP.md)
- 版本计划：[docs/planning/VERSION_PLAN.md](docs/planning/VERSION_PLAN.md)
- 图谱产品化说明：[docs/planning/versions/v0.6.0-graph-product.md](docs/planning/versions/v0.6.0-graph-product.md)
- 升级设计主文档：[docs/design/UPGRADE_DESIGN.md](docs/design/UPGRADE_DESIGN.md)
- 旧根目录设计说明兼容入口：[学伴项目-设计说明书.md](学伴项目-设计说明书.md)
- 开发说明：[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 架构说明：[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
- 数据库设计：[docs/architecture/DATABASE_DESIGN.md](docs/architecture/DATABASE_DESIGN.md)
- 变更记录：[CHANGELOG.md](CHANGELOG.md)
- 项目推进日志：[PROJECT_LOG.md](PROJECT_LOG.md)

## 数据库迁移

- MySQL 迁移目录：`backend/internal/migrations/mysql/`
- Mongo 迁移目录：`backend/internal/migrations/mongo/`
- 后端启动时会自动执行内置 MySQL 迁移脚本。
- 也可以单独执行迁移命令：

```powershell
cd backend
go run ./cmd/migrate
```

Mongo 内容集合初始化：

```powershell
mongosh "mongodb://127.0.0.1:27017/studymate_content" --file "backend/internal/migrations/mongo/001_init_content_collections.js"
```

## 目录结构

```text
StudyMate
├── backend
├── frontend-user
├── frontend-admin
├── packages
├── docs
│   ├── architecture
│   ├── design
│   └── planning
├── storage
└── PROJECT_LOG.md
```

前台用户端主入口已拆分为 `src/app/routes.tsx`、`src/app/shell/`、`src/pages/` 和 `src/features/`。图谱工作区按 `components/`、`hooks/`、`state/`、`lib/`、`exporters/`、`importers/` 建立边界；后台按 `router/`、`views/`、`components/admin/` 建立边界。

## 本地地址

- 用户端：`http://localhost:8001/`
- 管理端：`http://localhost:8002/`
- 后端健康检查：`http://localhost:8023/health`

## 常用命令

```powershell
npm install
npm run lint
npm run typecheck
npm run build:user
npm run build:admin
npm run test:user
npm run test:admin
npm run test:e2e
npm --workspace @studymate/graph-core run test
npm run verify:docs
cd backend
go test ./...
```

## v1.0.0 发布门禁补充

- `NOTE_READ_MODEL=mysql_primary` 是默认笔记读取策略，读取以 MySQL `notes.content` 为主，MongoDB 继续作为双写内容落点。
- `NOTE_READ_MODEL=mongo_primary` 会优先读取 MongoDB `note_documents.html`，当内容文档缺失或读取失败时回退 MySQL。
- 本地化先以 `zh-CN` 为源语言，用户端和管理端已建立 `en-US` 占位字典框架；v1.0.0 不要求完整英文翻译。
- 覆盖率门禁：每个里程碑继续运行 `npm run ci`；发布前追加运行 `npm run test:coverage`，变更包的重点代码需要达到 80% 聚焦覆盖率或在 `PROJECT_LOG.md` 说明缺口。
- 拆分边界：用户端 API client 已按域拆入 `frontend-user/src/api/*.ts`，全局样式已拆入 `frontend-user/src/styles/`，图谱控制器通用 helper 已移入 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`，history/autosave/undo-redo 状态转移已继续下沉到 `frontend-user/src/modules/graph/lib/graphHistory.ts`。
- Reader/Notes 收口：`go run ./cmd/backfill-note-documents` 可将历史 MySQL 笔记正文回填到 Mongo `note_documents`；PDF 批注新增兼容字段 `rects`，前端会展示资料、PDF 页与坐标片段来源。当前已补 Reader 进度回写、书签、批注 `rects` 载荷与来源展示的 API/Page/handler 回归测试，并为 `reader/service` 增加空批注拒绝、默认颜色、来源选择缺口和资料可见性边界测试。

## v1.0.0 D 阶段补充

- 复习调度保留 SM-2 默认算法，但通过后端 `Scheduler` 接口隔离，后续替换算法不需要改变公开 route contract。
- 搜索入口为 `GET /api/v1/search?q=&types=&limit=`，返回 `type/id/title/summary/url/source` 分组结果；未登录只搜公开资料和社区，登录后扩展到私有笔记、图谱和卡片。后端 `search/service` 当前通过内部 `SearchIndexer` 抽象封装 MySQL fallback，为后续 Meilisearch adapter 预留边界但不改变 v1 路由契约。
- 分享链路新增 `share_links` 迁移和 `/api/v1/share-links` 创建/列表/撤销接口，公开 `/api/v1/share/:token` 返回只读解析结果；用户端提供 `/share/:token` 只读页。
- 管理后台 `/api/v1/admin/*` 已接真实治理模块：users、reports、tags、ai/tasks、ai/usage、audit-logs、files，前端后台按模块读取 API 数据。

## v1.0.0 发布与回滚

- 发布清单位于 `docs/planning/versions/v1.0.0-release.md`，包含环境变量矩阵、MySQL/Mongo 迁移顺序、演示数据步骤、回滚步骤和已知非阻塞项。
- 最终发布闸门：`npm run ci`、`npm run test:coverage`、secret scan、diff review、release smoke flow，以及本地 annotated tag `v1.0.0`。
- 本地可以创建 tag；除非明确授权，不推送 commit 或 tag 到远端。
