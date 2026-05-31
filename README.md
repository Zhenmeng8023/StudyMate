# 学伴图谱

学伴图谱是一个以知识图谱画布为中心的学习平台。  
它把资料收集、PDF 阅读、批注摘录、富文本笔记、图谱组织、卡片复习、AI 学伴和社区分享串成一条完整学习闭环。

```text
资料库 -> 阅读器 -> 批注摘录 -> 笔记沉淀 -> 图谱组织 -> AI 辅助 -> 卡片复习 -> 社区分享
```

## 当前阶段

当前正在推进 `v0.4.0` 的前台体验加厚和前端重构：

- 资料库已经接回搜索、上传、创建、编辑、收藏、评分和阅读入口。
- 阅读器已经接回阅读进度、书签和批注。
- 笔记页已经接回富文本编辑、版本历史和恢复。
- 后端笔记内容已经开始双写到 MongoDB `note_documents / note_snapshots`。
- 图谱、复习、AI 学伴和部分后台能力先用高质量占位承接。
- 管理端已经重建为统一治理后台，并保留真实审核链路。

## 技术栈

- 后端：Go + Gin + GORM
- 前台用户端：React + Vite + TypeScript
- 后台管理端：Vue 3 + Vite
- 数据层：MySQL、MongoDB、Redis
- 阅读：PDF.js / react-pdf
- 编辑：Tiptap

## 数据库迁移

- MySQL 迁移目录：`backend/internal/migrations/mysql/`
- 当前已包含：
  - `001_init_schema.sql`：基础表结构
  - `002_seed_baseline.sql`：基础角色、权限、系统配置种子数据
  - `003_align_current_tables.sql`：补齐历史本地库缺失字段和查询索引
- 对应回滚文件使用 `.down.sql` 命名，例如：
  - `001_init_schema.down.sql`
  - `002_seed_baseline.down.sql`
  - `003_align_current_tables.down.sql`
- 后端启动时会自动执行内置 MySQL 迁移脚本。
- 也可以单独执行迁移命令：

```powershell
cd backend
go run ./cmd/migrate
```

- Mongo 迁移目录：`backend/internal/migrations/mongo/`
- 当前已包含：
  - `001_init_content_collections.js`：内容集合与索引初始化
  - `001_init_content_collections.down.js`：对应回滚脚本
- Mongo 迁移当前通过 `mongosh` 手动执行：

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
├── storage
└── PROJECT_LOG.md
```

## 本地地址

- 用户端：`http://localhost:8001/`
- 管理端：`http://localhost:8002/`
- 后端健康检查：`http://localhost:8023/health`

## 关键文档

- 开发说明：[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 架构说明：[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
- 开发路线：[docs/planning/ROADMAP.md](docs/planning/ROADMAP.md)
- 版本规划：[docs/planning/VERSION_PLAN.md](docs/planning/VERSION_PLAN.md)
- 项目级设计方案：[docs/design/FRONTEND_REBUILD_PLAN.md](docs/design/FRONTEND_REBUILD_PLAN.md)
- 项目记录：[PROJECT_LOG.md](PROJECT_LOG.md)

## 当前重点

1. 继续加厚 `v0.4.0` 的阅读与笔记体验。
2. 把管理端和用户端收敛到统一设计系统。
3. 接通“批注/笔记/资料 -> 图谱节点草稿”的最小闭环。
4. 为 `v0.5.0` 图谱画布 MVP 预留稳定前端和数据模型骨架。
