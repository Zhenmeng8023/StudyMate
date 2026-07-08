# 开发说明

## v1.0.0 覆盖率与本地化门禁

- 完整回归仍以 `npm run ci` 为每个里程碑的硬门禁。
- `npm run verify:coverage` 现已进入默认 CI，按当前仓库已验证基线阻断覆盖率回退：`frontend-user`、`frontend-admin` 读取 Vitest JSON summary，`@studymate/graph-core` 读取 Node coverage report，后端读取 `go tool cover -func` 总体 statements。
- 发布前仍追加运行 `npm run test:coverage`，该命令保留用户端 Vitest、管理端 Vitest、`@studymate/graph-core` Node test coverage 和后端 `go test ./... -cover` 的详细汇总。
- 变更包要求 80% 聚焦覆盖率；如果某个模块暂时无法达到，需要在 `PROJECT_LOG.md` 写明原因、风险和补测计划。
- `v1.1` 质量硬化从 v1 新增接口开始补测：用户端已新增 search/share API 合约测试，管理端已新增治理页真实 API 加载回归测试。后续同类改动应先补最小 RED/GREEN 测试，再进入实现或重构。
- 用户端 review/AI API 合约测试已覆盖 deck 创建、AI draft 批量确认成卡片、今日复习队列、复习回写、AI tasks/usage/drafts 请求形状，以及图谱变更草稿按 `draftIds` / `nodeSelections` 确认写入目标图谱的请求形状。
- `ReviewWorkspacePage` 已有页面级 Vitest，覆盖今日队列显示、翻面、评分和复习回写；后续 UI 改动应保留这条核心复习流。
- `AiPage` 已有页面级 Vitest，覆盖待确认卡片草稿写入所选复习 deck，以及图谱变更草稿写入目标图谱；后续 AI 草稿确认 UI 改动应保留 draftId、sourceType、sourceId、draftIds 和 nodeSelections 的传递。
- 后端 handler 测试优先通过最小 service interface 注入 fake，不直接拉真实数据库；search/share/card/graph/AI handler 已按该模式解耦，admin handler 已补 limit 解析测试。
- Playwright smoke 已覆盖公共壳层、后端分组搜索页、分享只读页、受保护的复习队列回写页和管理端用户治理模块；这些测试均用 `page.route` 固定 API 响应，受保护页面通过 `localStorage` 注入测试 session，避免本地后端成为前端 smoke 的前置条件。
- `npm run test:e2e` 会同时构建用户端和管理端，并由 Playwright 默认启动 `frontend-user` 44173 与 `frontend-admin` 44174 两个 preview 服务；如需覆盖，可设置 `PLAYWRIGHT_USER_PORT` 与 `PLAYWRIGHT_ADMIN_PORT`。
- `zh-CN` 是源语言。用户端字典位于 `frontend-user/src/i18n/dictionary.ts`，管理端字典位于 `frontend-admin/src/i18n/dictionary.ts`。
- `en-US` 目前只保留占位文案，测试会校验占位字典与 `zh-CN` 字典键保持一致。
- 用户端 API client 以 `frontend-user/src/api/client.ts` 作为稳定 barrel，新增接口按 auth、materials、notes、reader、graphs、review、ai 等域拆分到同目录文件。
- 用户端全局样式由 `frontend-user/src/styles.css` 统一导入 `frontend-user/src/styles/` 下的分层 CSS 文件，新增样式应优先落到对应分层文件。
- 图谱工作区的通用几何、导出、来源分组和焦点导航 helper 位于 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`；后续继续拆更细的交互 hooks。
- 图谱文档 payload 兼容适配位于 `frontend-user/src/modules/graph/lib/graphDocumentPayload.ts`，后端共享默认化位于 `backend/internal/modules/graph/dto/document_contract.go`；新增图谱读写入口应复用这两层，而不是再次硬编码 `schemaVersion = 1` 或空文档默认值。
- 图谱生命周期契约位于 `docs/architecture/GRAPH_API_LIFECYCLE.md`；所有写入型 graph 流程都必须由服务端权威覆盖 `graphId` / `version`，并在 restore/import 这类整份文档替换场景下同步维护 `currentVersion`、snapshot 索引和 `graph.mode`。
- 图谱导出/缩略图/布局契约位于 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`；当前 graph head 已显式暴露 `thumbnailFileId`，来源泳道布局通过 `POST /api/v1/graphs/:id/layouts/preview` 进入统一 API 契约，工作区仅在接口不可用时回退本地 helper。

## Reader/Notes 回填与批注坐标

- 历史笔记正文回填命令：`cd backend; go run ./cmd/backfill-note-documents`。
- 可使用 `-limit 100` 做分批回填；命令是幂等 upsert，会按当前 MySQL `notes` 内容覆盖 Mongo `note_documents` 当前文档。
- PDF 批注 API 新增 `rects` 字段，坐标使用 0-1 归一化比例；旧客户端只传 `page`、`quote`、`comment` 仍然有效。
- `pdf_annotations.rects` 已写入新装库 schema、历史库对齐迁移和 003 回滚脚本。

## 环境要求

- Go 1.26.5+（`backend/go.mod` 已通过 `toolchain go1.26.5` 锁定安全 patch 基线）
- Node.js 24+
- npm 11+
- MySQL 8+
- MongoDB 8+
- Redis

## 安装依赖

```powershell
npm install
```

首次拉起整仓或切换到新的机器时，优先使用统一 bootstrap 入口：

```powershell
npm run bootstrap
```

它会执行：

- `npm install`
- `npm run verify:runtimes`
- `cd backend && go mod download`

如果只想先确认当前机器的 Node / npm / Go 版本与仓库约束一致，可以单独运行：

```powershell
npm run verify:runtimes
```

如果要执行依赖审计入口，可以运行：

```powershell
npm run verify:deps
```

- 如果要执行仓库级 secret scan，可以运行：

```powershell
npm run verify:secrets
```

- `backend/go.mod` 已锁定 `toolchain go1.26.5`；首次执行 `go test`、`go mod tidy` 或 `npm run verify:deps` 时，如果本机只有更低 patch 版本，Go 会自动下载并切换到该安全 toolchain。

说明：

- `npm run bootstrap` 面向本地开发机，优先保证 Windows 下已有工具进程占用 `esbuild.exe` 时也能顺利补齐依赖；CI 仍继续使用更严格的 `npm ci`。
- `npm audit` 会强制走 `https://registry.npmjs.org/`，避免当前 `npmmirror` 镜像缺失 audit API 时直接报 `[NOT_IMPLEMENTED]`。
- `govulncheck` 会扫描 `backend` 当前依赖与调用路径；如果命中现有漏洞，会按预期返回非零状态，作为后续安全收口的输入，而不是被静默忽略。

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

本地开发默认使用 MySQL，和项目最初规划保持一致。请先确认本机已经创建 `studymate` 数据库，并为 StudyMate 准备专用数据库账号；不要再依赖仓库内置的 root 弱口令默认值。

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
$env:APP_ENV='development'
$env:APP_PORT='8023'
$env:DB_DRIVER='mysql'
$env:MYSQL_DSN='studymate:<local-password>@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local'
$env:JWT_SECRET='<long-random-local-secret>'

# 仅在需要自动创建首个管理员时填写；不需要时保持为空。
$env:ADMIN_BOOTSTRAP_USERNAME=''
$env:ADMIN_BOOTSTRAP_EMAIL=''
$env:ADMIN_BOOTSTRAP_PASSWORD=''

go run ./cmd/server
```

### 环境变量分层建议

- 开发环境：`APP_ENV=development`，使用本机专用 MySQL 账号、独立 JWT secret，可选本地 MongoDB/Redis。
- 测试或 CI：`APP_ENV=test`，所有敏感值通过 CI secret 或临时环境变量注入，不依赖仓库内 fallback。
- 生产环境：`APP_ENV=production`，必须使用强随机 `JWT_SECRET`、专用数据库账号、真实 CORS 域名和受控的管理员引导策略；首个管理员创建完成后应清空 `ADMIN_BOOTSTRAP_*`。

### 启动前最小必填项

- `DB_DRIVER=mysql`
- `MYSQL_DSN`
- `JWT_SECRET`

如果缺失上述值，`go run ./cmd/server` 会在启动阶段直接失败，并明确指出缺失的环境变量，而不是静默回退到危险默认值。

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
- 治理后台壳层与真实数据模块已接入，仍需继续补审批动作、审计模型与更完整回归测试

## 推荐验证命令

```powershell
npm run bootstrap
npm run verify:runtimes
npm run verify:deps
npm run verify:secrets
npm run lint
npm run verify:backend:format
npm run verify:config-safety
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
- CI 基线使用 Node 24、Go 1.26.5、`npm run verify:deps`、`npm run verify:secrets`、Vitest、React Testing Library、Vue Test Utils、Playwright、`@studymate/graph-core` 测试和后端 `go test ./...`。
- `npm run verify:backend:format` 会检查 `backend/` 下全部 Go 文件是否通过 `gofmt`。
- `npm run verify:config-safety` 会检查 `backend/internal/config/config.go`、`.env.example` 和 `docs/DEVELOPMENT.md` 中是否回退到已禁用的危险默认值示例。

## 内容读取开关

- `NOTE_READ_MODEL=mysql_primary`：默认策略，笔记读取以 MySQL `notes.content` 为主，MongoDB 继续作为双写内容落点。
- `NOTE_READ_MODEL=mongo_primary`：笔记读取优先使用 MongoDB `note_documents.html`，当 MongoDB 文档缺失或读取失败时回退 MySQL。
- 当前开关先覆盖笔记列表和笔记详情的正文读取路径，后续继续接历史回填、PDF 批注坐标和跨页高亮。

## 前端拆分边界

- 用户端路由入口位于 `frontend-user/src/app/routes.tsx`，`frontend-user/src/app/App.tsx` 只保留兼容导出。
- 用户端工作区壳层位于 `frontend-user/src/app/shell/`，业务页面位于 `frontend-user/src/pages/`，跨页面特性 helper 位于 `frontend-user/src/features/`。
- 图谱工作区入口 `frontend-user/src/modules/graph/GraphWorkspacePage.tsx` 只做薄壳导出；图谱实现边界按 `components/`、`hooks/`、`state/`、`lib/`、`exporters/`、`importers/` 继续收口。
- 图谱状态边界继续下沉：节点选择复用 `useGraphSelectionState.ts` + `@studymate/graph-core/selection`，viewport 相机复用 `useGraphViewportCamera.ts` + `@studymate/graph-core/viewport`，历史栈与保存边界复用 `graphHistory.ts` + `@studymate/graph-core/history`。
- 图谱文件与校验边界继续下沉：`graphFileImportExport.ts` 统一封装 StudyMate JSON / SVG 导出、JSON 导入阻断规则、Markdown / Mermaid 导入归一化和 validate 状态摘要；页面与 hook 层不再重复拼装这些标签与状态文案。
- `packages/graph-core/src/file-format.ts` 现将缺失 `schemaVersion` 的旧图谱视为 v1 兼容输入，但仍拒绝数组 root 和非法 `document` 包装；相关序列化、导入错误和历史栈回归统一补到 `packages/graph-core/test/graphProductization.test.ts`。
- `backend/internal/modules/graph/dto/document_contract.go` 现在会对 batch-save、import、restore 等写入路径强制覆盖服务端权威 `graphId` / `version`；`backend/internal/modules/graph/service/service.go` 在 restore snapshot 后也会基于恢复文档重算 `graph.mode`，避免 summary/head 与 current document 漂移。
- `backend/internal/modules/graph/service/layout.go` 现集中承接来源泳道布局预览算法；后端 `PreviewLayout(...)` 只返回布局后的草稿 document，不推进 graph version，不创建 snapshot，也不修改 source relation。
- 管理端入口 `frontend-admin/src/App.vue` 只挂载 `views/AdminWorkspaceView.vue`；治理模块路由元数据位于 `frontend-admin/src/router/index.ts`，后台通用组件和样式位于 `frontend-admin/src/components/admin/`。

## 编码说明

- 项目主语言使用汉语。
- 文档、UI 文案、日志默认使用中文。
- 代码标识符、包名、命令、API 路径、第三方工具名保留英文。
- 如果终端里出现一串明显不属于正常中文的乱码，要先区分是终端显示编码问题，还是文件本身真的被错误转码。

## Search/Admin/Share v1 接口

- 搜索入口为 `GET /api/v1/search?q=&types=&limit=`。`types` 支持 `material,post,note,graph,card`；省略 `types` 或传空值时会按这五组默认搜索；传入未知类型会返回 `400 invalid_search_type`。
- `limit` 缺省或非法时回退到 `20`，最大钳制为 `50`，当前返回仍为 grouped payload 而非 offset/page 分页结构。
- 搜索结果项固定包含 `type/id/title/summary/url/source`；其中 `source` 当前表示来源域：`material`、`community`、`note`、`graph`、`card`，不表示底层存储引擎。
- fallback 组内结果按“标题命中优先、摘要命中次之”稳定排序；长摘要会折叠空白并裁剪到 160 个字符以内，避免直接返回整段正文。
- 匿名请求只会实际搜索 `material` 与 `post`；`note`、`graph`、`card` 会直接短路为空结果。登录请求中，`note` 仅返回 owner 自己的笔记，`card` 仅返回 owner 自己的 `active` 卡片，`graph` 仅返回 `active` 且“owner 或 public”的图谱。
- 用户端搜索页只消费后端 grouped payload，不再在浏览器中拉全量资料、帖子、笔记和图谱做本地过滤。
- 用户端搜索页现支持 URL `types` 类型筛选，并有页面级 Vitest 回归覆盖无关键词空态、后端错误态、筛选请求形状与来源链接渲染。
- 搜索页分页目前明确限定在“当前批次结果”内：前端每次最多请求每组 `12` 条结果，并按每页 `4` 条切换；若后续需要跨批次真分页，应先扩展后端 offset/cursor 契约。
- 搜索专项回归入口为 `npm run verify:search`；契约、权限矩阵和自动化映射集中记录在 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`。
- 图谱冲突专项回归入口为 `npm run verify:graph-conflicts`；当前冲突生命周期、工作区测试映射、图谱工作区 smoke、真实 `graph_version_conflict` 路径和固定入口集中记录在 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`。
- 分享入口为受保护的 `GET/POST /api/v1/share-links` 与 `DELETE /api/v1/share-links/:id`，公开解析为 `GET /api/v1/share/:token`；`share_links` 表由 `004_share_links.sql` 创建，`.down.sql` 可回滚。
- 分享目标白名单为 `material,note,graph,deck`，模式为 `private,public,token`。创建时会校验 owner，公开解析只返回只读摘要和目标 URL，不暴露可写接口。
- 管理后台治理 API 位于 `/api/v1/admin/users`、`/reports`、`/tags`、`/ai/tasks`、`/ai/usage`、`/audit-logs`、`/files`，全部要求 admin token。
- 复习调度在 `backend/internal/modules/card/service` 中通过 `Scheduler` 接口隔离；v1 默认实现仍是 SM-2。

## v1.0.0 Release Gate

- 发布操作说明位于 `docs/planning/versions/v1.0.0-release.md`。
- 最终验证顺序：`npm run ci`、`npm run verify:coverage`、`npm run test:coverage`、`npm run verify:secrets`、`git diff --check`、release smoke flow、本地 `git tag -a v1.0.0`。
- 回滚优先恢复上一版应用工件；`004_share_links.sql` 是 additive migration，只有确认需要清理分享链表时才执行 `.down.sql`。
