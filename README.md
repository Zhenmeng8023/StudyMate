# 学伴图谱

学伴图谱是一个以知识图谱画布为中心的学习平台。它把资料收集、PDF 阅读、批注摘录、富文本笔记、图谱组织、卡片复习、AI 学伴和社区分享串成一条可治理的学习闭环。

```text
资料库 -> 阅读器 -> 批注摘录 -> 笔记沉淀 -> 图谱组织 -> AI 辅助 -> 卡片复习 -> 社区分享
```

## 当前阶段

`v1.0.0` 已完成本地发布标签，当前进入 `v1.1` 产品质量与测试硬化阶段。真实状态如下：

- 阅读/笔记主链路已闭环：资料、PDF 阅读、批注、书签、富文本笔记、版本历史和 MongoDB 内容快照已经具备可用基础。
- 图谱工作区已是强 MVP：支持创建保存、搜索定位、来源泳道、来源摘要、AI 落点预览、Markdown/Mermaid 导入、PNG/SVG 导出和快照恢复基础；`v1.1` 已把 selection / viewport / history 状态继续迁出大控制器，并在 `@studymate/graph-core` 与前端 hooks 上补齐回归测试。
- `WB-022` 已完成图谱 import/export/validation 统一接口收口：`graphFileImportExport.ts` 现在统一承接 StudyMate JSON/SVG 导出、JSON 导入校验、Markdown/Mermaid 远端导入结果归一化，以及远端 validate 状态摘要。
- `WB-023` 已完成图谱内核测试与迁移回归：`@studymate/graph-core` 现已覆盖旧 `.smtg` 缺失 `schemaVersion` 的兼容导入、数组 root / 非法 `document` 包装拒绝，以及 history label、fallback label 与 past/future 上限回归。
- `WB-030` 已完成图谱 API 生命周期契约收口：新增 `docs/architecture/GRAPH_API_LIFECYCLE.md`，明确 graph head / current document / snapshot / version / relation 的职责边界，并修复 snapshot restore 后 `document.version` 可能落回旧值、以及 `graph.mode` 可能与恢复后文档语义漂移的问题。
- `WB-031` 已完成图谱导出、缩略图与布局契约收口：新增 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`，把 JSON/SVG/PNG 导出边界、`thumbnailFileId` head 模型和 `POST /graphs/:id/layouts/preview` 来源泳道布局预览接口统一记录下来。
- `WB-020` 已完成图谱文档契约收口：`GraphDocument` / `schemaVersion` / 兼容读取默认化现在分别在 `@studymate/graph-core` 与后端 graph DTO 中有显式单一来源，旧图谱 payload、空文档与快照恢复不再依赖分散硬编码。
- 复习和 AI 已具备 SM-2 调度边界、Deck/Card 与 AI draft 基础闭环；`v1.1` 已开始补 Deck/Card、今日队列、复习回写、AI 草稿/用量/任务 API 合约测试、图谱变更草稿确认 API 合约测试、后端 card/AI handler 边界测试、ReviewWorkspace 页面回归测试、复习队列 Playwright smoke，以及 AI 卡片/图谱草稿确认页面测试。
- 搜索、分享和后台治理已接入真实 API；`v1.1` 已补齐搜索契约、结果质量、权限矩阵和搜索页页面级回归，用户端搜索页现支持 URL 类型筛选、来源跳转，以及当前批次内的分组分页；后续继续通过内部 `SearchIndexer` 抽象保留 MySQL fallback 默认实现并补搜索文档记录。
- 阅读器/笔记收口继续按 TDD 推进：已补用户端 Reader API 合约测试、`ReaderPage` 书签与批注来源回归测试，以及后端 `reader/handler`、`reader/service` 的鉴权、请求体和来源选择边界测试。
- `WB-002` 已完成第一轮配置安全收口：`JWT_SECRET` 与 `MYSQL_DSN` 不再回退到危险默认值，启动阶段会显式校验缺失项。
- `WB-003` 已完成最小 CI 质量门禁补强：`gofmt` 检查、配置安全回归检查、Vitest、Playwright、Go test 与文档同步都已进入默认 `npm run ci`。
- 前端布局重构已完成 FE-00 审计、FE-01 多布局壳层、FE-02 图谱 CanvasLayout 与 FE-03 学习工作台对齐：阅读和笔记现采用可收起的资源区 / 主内容区 / 检查器结构，复习改为单任务 FocusLayout；后续将在图谱新 Inspector 内继续 WB-032 的节点级人工冲突合并。
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
- 搜索契约与回归矩阵：[docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md](docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md)
- 架构说明：[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
- 图谱文档契约：[docs/architecture/GRAPH_DOCUMENT_CONTRACT.md](docs/architecture/GRAPH_DOCUMENT_CONTRACT.md)
- 图谱 API 生命周期契约：[docs/architecture/GRAPH_API_LIFECYCLE.md](docs/architecture/GRAPH_API_LIFECYCLE.md)
- 图谱导出/缩略图/布局契约：[docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md](docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md)
- 前端能力矩阵：[docs/engineering/FRONTEND_CAPABILITY_MATRIX.md](docs/engineering/FRONTEND_CAPABILITY_MATRIX.md)
- 前端布局重构规格：[docs/design/FRONTEND_LAYOUT_REFACTOR_SPEC.md](docs/design/FRONTEND_LAYOUT_REFACTOR_SPEC.md)
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
npm run bootstrap
npm run verify:runtimes
npm run verify:deps
npm run verify:secrets
npm install
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

## v1.0.0 发布门禁补充

- `NOTE_READ_MODEL=mysql_primary` 是默认笔记读取策略，读取以 MySQL `notes.content` 为主，MongoDB 继续作为双写内容落点。
- `NOTE_READ_MODEL=mongo_primary` 会优先读取 MongoDB `note_documents.html`，当内容文档缺失或读取失败时回退 MySQL。
- 后端启动、迁移和回填命令现在要求显式提供 `MYSQL_DSN`；服务启动还要求显式提供 `JWT_SECRET`，不再静默回退到仓库内置弱默认值。
- 本地化先以 `zh-CN` 为源语言，用户端和管理端已建立 `en-US` 占位字典框架；v1.0.0 不要求完整英文翻译。
- 覆盖率门禁：每个里程碑继续运行 `npm run ci`；默认基线由 `npm run verify:coverage` 收口为“不低于当前仓库基线”的硬门禁，发布前仍追加运行 `npm run test:coverage` 留存详细汇总，变更包的重点代码继续以 80% 聚焦覆盖率为目标，暂时达不到时需在 `PROJECT_LOG.md` 说明缺口。
- `npm run lint` 现在默认包含 `npm run verify:backend:format` 与 `npm run verify:config-safety`，用于阻断未格式化 Go 文件和已禁用的危险默认值回退。
- 拆分边界：用户端 API client 已按域拆入 `frontend-user/src/api/*.ts`，全局样式已拆入 `frontend-user/src/styles/`，图谱控制器通用 helper 已移入 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`，selection 状态位于 `frontend-user/src/modules/graph/hooks/useGraphSelectionState.ts`，viewport 相机位于 `frontend-user/src/modules/graph/hooks/useGraphViewportCamera.ts`，history/autosave/undo-redo 状态位于 `frontend-user/src/modules/graph/lib/graphHistory.ts`。
- 图谱导入导出边界：`frontend-user/src/modules/graph/lib/graphFileImportExport.ts` 作为统一 facade，负责 JSON/SVG 导出描述、JSON 导入阻断规则、Markdown/Mermaid 远端导入归一化，以及 validate 结果状态消息；`useGraphImportExport.ts` 只保留下载、渲染和保存态副作用。
- 图谱文档契约：前端兼容适配位于 `frontend-user/src/modules/graph/lib/graphDocumentPayload.ts`，后端共享默认化位于 `backend/internal/modules/graph/dto/document_contract.go`；二者共同锁定 `schemaVersion = 1`、空切片/map 默认化与旧文档兼容读取。
- 图谱 API 生命周期：`docs/architecture/GRAPH_API_LIFECYCLE.md` 说明了 graph head、current document、snapshot、version 索引与 relation 的职责边界；后端写入路径现在统一以服务端权威覆盖 `graphId` / `version`，restore 也会同步重算 `graph.mode`。
- 图谱导出/缩略图/布局：`docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md` 说明 JSON/SVG/PNG 导出边界、`thumbnailFileId` head 字段，以及 `POST /api/v1/graphs/:id/layouts/preview` 的来源泳道预览契约；前端工作区优先调用该接口，失败时回退本地泳道 helper。
- Reader/Notes 收口：`go run ./cmd/backfill-note-documents` 可将历史 MySQL 笔记正文回填到 Mongo `note_documents`；PDF 批注新增兼容字段 `rects`，前端会展示资料、PDF 页与坐标片段来源。当前已补 Reader 进度回写、书签、批注 `rects` 载荷与来源展示的 API/Page/handler 回归测试，并为 `reader/service` 增加空批注拒绝、默认颜色、来源选择缺口和资料可见性边界测试。

## v1.0.0 D 阶段补充

- 复习调度保留 SM-2 默认算法，但通过后端 `Scheduler` 接口隔离，后续替换算法不需要改变公开 route contract。
- 搜索入口为 `GET /api/v1/search?q=&types=&limit=`，返回 `type/id/title/summary/url/source` 分组结果；省略 `types` 时默认搜索 `material/post/note/graph/card` 五组，未知类型返回 `400 invalid_search_type`，`limit` 缺省为 `20` 且最大为 `50`。
- 用户端搜索页会把 `types` 同步到 URL，并在每组当前批次最多 `12` 条结果中按每页 `4` 条切换；这层分页只覆盖当前批次结果，不代表后端已提供 offset/page 契约。
- 搜索专项回归可直接执行 `npm run verify:search`；更完整的契约、权限矩阵和测试映射见 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`。
- 图谱冲突专项回归可直接执行 `npm run verify:graph-conflicts`；当前冲突生命周期、工作区测试映射、图谱工作区桌面/窄屏 smoke、布局预览/导出状态、权限路径、真实 `graph_version_conflict` 路径和固定入口见 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`。
- 未登录只搜公开资料和社区，登录后扩展到私有笔记、图谱和卡片；note / graph / card 在匿名请求下会直接短路为空结果，graph 仅返回 `active` 且“owner 或 public”的结果。`source` 字段当前表示来源域而不是底层存储引擎。fallback 组内结果按标题命中优先排序，长摘要会压缩为单行 160 字符内预览。后端 `search/service` 当前通过内部 `SearchIndexer` 抽象封装 MySQL fallback，为后续 Meilisearch adapter 预留边界但不改变 v1 路由契约。
- 分享链路新增 `share_links` 迁移和 `/api/v1/share-links` 创建/列表/撤销接口，公开 `/api/v1/share/:token` 返回只读解析结果；用户端提供 `/share/:token` 只读页。
- 管理后台 `/api/v1/admin/*` 已接真实治理模块：users、reports、tags、ai/tasks、ai/usage、audit-logs、files，前端后台按模块读取 API 数据。
- Playwright preview 默认端口已改为 `44173` / `44174`，并支持通过 `PLAYWRIGHT_USER_PORT`、`PLAYWRIGHT_ADMIN_PORT` 覆盖，避免当前 Windows 环境下的 `4173/4174` 绑定失败。

## v1.0.0 发布与回滚

- 发布清单位于 `docs/planning/versions/v1.0.0-release.md`，包含环境变量矩阵、MySQL/Mongo 迁移顺序、演示数据步骤、回滚步骤和已知非阻塞项。
- 最终发布闸门：`npm run ci`、`npm run verify:coverage`、`npm run test:coverage`、`npm run verify:secrets`、diff review、release smoke flow，以及本地 annotated tag `v1.0.0`。
- 本地可以创建 tag；除非明确授权，不推送 commit 或 tag 到远端。
