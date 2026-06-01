# 开发说明

## v1.0.0 覆盖率与本地化门禁

- 完整回归仍以 `npm run ci` 为每个里程碑的硬门禁。
- 发布前追加运行 `npm run test:coverage`，该命令覆盖用户端 Vitest、管理端 Vitest、`@studymate/graph-core` Node test coverage 和后端 `go test ./... -cover`。
- 变更包要求 80% 聚焦覆盖率；如果某个模块暂时无法达到，需要在 `PROJECT_LOG.md` 写明原因、风险和补测计划。
- `zh-CN` 是源语言。用户端字典位于 `frontend-user/src/i18n/dictionary.ts`，管理端字典位于 `frontend-admin/src/i18n/dictionary.ts`。
- `en-US` 目前只保留占位文案，测试会校验占位字典与 `zh-CN` 字典键保持一致。
- 用户端 API client 以 `frontend-user/src/api/client.ts` 作为稳定 barrel，新增接口按 auth、materials、notes、reader、graphs、review、ai 等域拆分到同目录文件。
- 用户端全局样式由 `frontend-user/src/styles.css` 统一导入 `frontend-user/src/styles/` 下的分层 CSS 文件，新增样式应优先落到对应分层文件。
- 图谱工作区的通用几何、导出、来源分组和焦点导航 helper 位于 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`；后续继续拆更细的交互 hooks。

## Reader/Notes 回填与批注坐标

- 历史笔记正文回填命令：`cd backend; go run ./cmd/backfill-note-documents`。
- 可使用 `-limit 100` 做分批回填；命令是幂等 upsert，会按当前 MySQL `notes` 内容覆盖 Mongo `note_documents` 当前文档。
- PDF 批注 API 新增 `rects` 字段，坐标使用 0-1 归一化比例；旧客户端只传 `page`、`quote`、`comment` 仍然有效。
- `pdf_annotations.rects` 已写入新装库 schema、历史库对齐迁移和 003 回滚脚本。

## 环境要求

- Go 1.26+
- Node.js 24+
- npm 11+
- MySQL 8+
- MongoDB 8+
- Redis

## 安装依赖

```powershell
npm install
```

Go 依赖建议在 `backend` 目录执行：

```powershell
$env:GOPROXY='https://goproxy.cn,direct'
go mod tidy
```

## Go 依赖拉取报错排查

如果你在 GoLand 或命令行里看到下面这类错误：

- `reading https://goproxy.io/... 404 Not Found`
- `git ls-remote ... unknown option 'end-of-options'`

通常不是本机 Git 版本问题，而是 `goproxy.io` 对部分依赖回源失败。建议切换到：

```powershell
go env -w GOPROXY=https://goproxy.cn,direct
[Environment]::SetEnvironmentVariable('GOPROXY', 'https://goproxy.cn,direct', 'User')
```

然后重启 GoLand，再执行：

```powershell
cd backend
go list -m -json all
```

如果仍显示旧的 `https://goproxy.io`，说明 Windows 机器级环境变量还在覆盖用户级配置，需要手动修改或删除系统级 `GOPROXY`。

## 启动后端

本地开发默认使用 MySQL，和项目最初规划保持一致。请先确认本机已经创建 `studymate` 数据库，并且 `root` 用户密码为 `123456`：

服务启动时会自动执行内置的 MySQL 迁移脚本，迁移目录位于 `backend/internal/migrations/mysql/`。
当前默认包括：

- `001_init_schema.sql`：基础表结构
- `002_seed_baseline.sql`：基础角色、权限、系统配置种子数据
- `003_align_current_tables.sql`：补齐历史本地库缺失字段和查询索引

对应回滚文件使用 `.down.sql` 命名，例如：

- `001_init_schema.down.sql`
- `002_seed_baseline.down.sql`
- `003_align_current_tables.down.sql`

如果只想先执行数据库迁移，可以单独运行：

```powershell
cd backend
go run ./cmd/migrate
```

MongoDB 当前采用脚本初始化集合与索引，脚本目录位于 `backend/internal/migrations/mongo/`。
初始化：

```powershell
mongosh "mongodb://127.0.0.1:27017/studymate_content" --file "backend/internal/migrations/mongo/001_init_content_collections.js"
```

回滚：

```powershell
mongosh "mongodb://127.0.0.1:27017/studymate_content" --file "backend/internal/migrations/mongo/001_init_content_collections.down.js"
```

当前 Mongo 脚本覆盖：

- `note_documents`
- `note_snapshots`
- `graph_documents`
- `graph_snapshots`
- `pdf_annotation_documents`
- `material_text_documents`
- `ai_conversations`
- `ai_drafts`
- `diagram_source_documents`
- `user_workspace_states`

```powershell
cd backend
$env:APP_PORT='8023'
$env:DB_DRIVER='mysql'
$env:MYSQL_DSN='root:123456@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local'
$env:ADMIN_BOOTSTRAP_USERNAME='admin'
$env:ADMIN_BOOTSTRAP_EMAIL='admin@studymate.local'
$env:ADMIN_BOOTSTRAP_PASSWORD='StudyMate123!'
go run ./cmd/server
```

健康检查：

```text
http://localhost:8023/health
```

## 启动用户端

```powershell
npm --workspace frontend-user run dev
```

默认地址：

```text
http://localhost:8001/
```

如果 `8001` 被占用，可临时改到备用端口：

```powershell
npm --workspace frontend-user run dev -- --port 8003
```

## 启动管理端

```powershell
npm --workspace frontend-admin run dev
```

默认地址：

```text
http://localhost:8002/
```

如果 `8002` 被占用，可临时改到备用端口：

```powershell
npm --workspace frontend-admin run dev -- --port 8004
```

## 当前本地能力说明

### 用户端

- 登录、注册、退出
- 资料列表、资料详情、上传附件、创建资料、编辑资料
- 阅读器进度、书签、批注
- 富文本笔记、版本历史、版本恢复
- 笔记正文双写到 MongoDB `note_documents / note_snapshots`
- 图谱工作区创建、保存、搜索定位、分组折叠、快照恢复、Markdown/Mermaid 导入、PNG/SVG 导出
- 图谱多选整理支持对齐、均分、批量样式、按来源分行/分列、生成来源分组和来源泳道
- 图谱右侧栏展示来源关系摘要，可看到资料、批注、笔记、卡片等来源对象和关联节点数
- 社区公开内容浏览

### 管理端

- 管理员登录
- 审核队列读取
- 帖子与资料通过 / 驳回 / 下架
- 治理后台壳层和模块占位

## 推荐验证命令

```powershell
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

## 文档与版本治理

- `docs/design/UPGRADE_DESIGN.md` 是当前升级设计主入口。
- 根目录 `学伴项目-设计说明书.md` 保留为兼容入口，README 主导航指向 `docs/design/`。
- `docs/planning/ROADMAP.md` 记录 v1.0 路线图。
- `docs/planning/VERSION_PLAN.md` 记录当前真实状态、范围取舍、性能预算和里程碑流程。
- 每个功能里程碑必须同步更新 `README.md`、本文件、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`CHANGELOG.md`、`PROJECT_LOG.md`。
- 提交前运行 `npm run verify:docs`，避免关键文档入口漂移。
- CI 基线使用 Node 24、Go 1.26、Vitest、React Testing Library、Vue Test Utils、Playwright、`@studymate/graph-core` 测试和后端 `go test ./...`。

## 内容读取开关

- `NOTE_READ_MODEL=mysql_primary`：默认策略，笔记读取以 MySQL `notes.content` 为主，MongoDB 继续作为双写内容落点。
- `NOTE_READ_MODEL=mongo_primary`：笔记读取优先使用 MongoDB `note_documents.html`，当 MongoDB 文档缺失或读取失败时回退 MySQL。
- 当前开关先覆盖笔记列表和笔记详情的正文读取路径，后续继续接历史回填、PDF 批注坐标和跨页高亮。

## 前端拆分边界

- 用户端路由入口位于 `frontend-user/src/app/routes.tsx`，`frontend-user/src/app/App.tsx` 只保留兼容导出。
- 用户端工作区壳层位于 `frontend-user/src/app/shell/`，业务页面位于 `frontend-user/src/pages/`，跨页面特性 helper 位于 `frontend-user/src/features/`。
- 图谱工作区入口 `frontend-user/src/modules/graph/GraphWorkspacePage.tsx` 只做薄壳导出；图谱实现边界按 `components/`、`hooks/`、`state/`、`lib/`、`exporters/`、`importers/` 继续收口。
- 管理端入口 `frontend-admin/src/App.vue` 只挂载 `views/AdminWorkspaceView.vue`；治理模块路由元数据位于 `frontend-admin/src/router/index.ts`，后台通用组件和样式位于 `frontend-admin/src/components/admin/`。

## 编码说明

- 项目主语言使用汉语。
- 文档、UI 文案、日志默认使用中文。
- 代码标识符、包名、命令、API 路径、第三方工具名保留英文。
- 如果终端里出现一串明显不属于正常中文的乱码，要先区分是终端显示编码问题，还是文件本身真的被错误转码。

## Search/Admin/Share v1 接口

- 搜索入口为 `GET /api/v1/search?q=&types=&limit=`。`types` 支持 `material,post,note,graph,card`；未登录请求只返回公开资料和社区内容，带 Bearer token 后会返回当前用户可访问的私有笔记、图谱和卡片。
- 用户端搜索页只消费后端 grouped payload，不再在浏览器中拉全量资料、帖子、笔记和图谱做本地过滤。
- 分享入口为受保护的 `GET/POST /api/v1/share-links` 与 `DELETE /api/v1/share-links/:id`，公开解析为 `GET /api/v1/share/:token`；`share_links` 表由 `004_share_links.sql` 创建，`.down.sql` 可回滚。
- 分享目标白名单为 `material,note,graph,deck`，模式为 `private,public,token`。创建时会校验 owner，公开解析只返回只读摘要和目标 URL，不暴露可写接口。
- 管理后台治理 API 位于 `/api/v1/admin/users`、`/reports`、`/tags`、`/ai/tasks`、`/ai/usage`、`/audit-logs`、`/files`，全部要求 admin token。
- 复习调度在 `backend/internal/modules/card/service` 中通过 `Scheduler` 接口隔离；v1 默认实现仍是 SM-2。
