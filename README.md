# 学伴图谱

学伴图谱是一个以知识图谱画布为中心的学习平台。它把资料收集、PDF 阅读、批注摘录、富文本笔记、图谱组织、卡片复习、AI 学伴和社区分享串成一条可治理的学习闭环。

```text
资料库 -> 阅读器 -> 批注摘录 -> 笔记沉淀 -> 图谱组织 -> AI 辅助 -> 卡片复习 -> 社区分享
```

## 当前阶段

当前目标是把 `master` 推进到可发布的 `v1.0.0`。真实状态如下：

- 阅读/笔记主链路已闭环：资料、PDF 阅读、批注、书签、富文本笔记、版本历史和 MongoDB 内容快照已经具备可用基础。
- 图谱工作区已是强 MVP：支持创建保存、搜索定位、来源泳道、来源摘要、AI 落点预览、Markdown/Mermaid 导入、PNG/SVG 导出和快照恢复基础。
- 复习和 AI 处于部分实现：已有 Deck/Card、AI task/draft 等基础设施，但调度、确认流、用量治理和失败任务界面仍需收口。
- 后台审核主链存在：帖子/资料审核可以操作，但用户、举报、标签、AI、审计、文件治理还不是完整可发布治理面。
- `v1.0.0` 范围只包含 Web 主站、Web 后台和后端 API；课程/LMS、Tauri 桌面端、多人实时协作、PWA 离线和向量搜索不作为 1.0 阻塞项。

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
