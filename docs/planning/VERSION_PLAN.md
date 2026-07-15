# 学伴图谱版本计划

## A 阶段当前收口

- `NOTE_READ_MODEL` 已完成后端配置、读取策略解析、Mongo 当前文档读取和 MySQL 回退路径。
- 覆盖率脚本已纳入根命令：`npm run verify:coverage` 作为默认 CI 的基线硬门禁，`npm run test:coverage` 继续汇总用户端、管理端、图谱核心和 Go 后端覆盖率。
- 本地化框架以 `zh-CN` 为源语言，先建立 `en-US` 占位字典和键一致性测试，不把完整英文翻译列为 v1.0.0 阻塞项。
- 后续 B 阶段继续拆分 `useGraphWorkspaceController.tsx`、`frontend-user/src/api/client.ts` 和全局样式文件。
- B 阶段第一批拆分完成：API client 已按域拆分并保留 barrel，CSS 已按 app/workspace/graph/reader-notes/search-review/responsive 分层，图谱通用 helper 已抽到 `workspaceControllerHelpers.ts`。
- C 阶段第一批收口完成：新增笔记内容回填命令、PDF 批注 `rects` 兼容字段、Reader 来源展示和 200 节点图谱性能回归测试。

## v1.1 产品质量与测试硬化

`v1.0.0` 已完成本地发布标签。下一阶段不扩大产品范围，先把 v1 新增的搜索、分享、后台治理、复习和 AI 草稿链路补成可持续演进的测试面。

2026-07-15 按根目录《学伴项目-设计说明书.md》复核后，v1.1 的后续切片以快速原型为优先：先形成一条可演示的学习闭环，再补齐各赛道标杆深度。近期默认顺序为 `LC-010 + ANKI-060` 主闭环反馈、`ANKI-000/010/020` 正式模型兼容层、`WB-033` 图谱反馈回写、`SE-020 / ADM-011` 搜索与后台主路径可信度。课程/LMS、桌面端、完整工程图谱、向量/RAG 和 `.apkg` 深兼容继续后置。

优先交付：

- 用户端 search/share API 合约测试，锁定 grouped search、owner share link 和 public read-only resolve 的请求形状。
- 用户端 review/AI API 合约测试，锁定 Deck/Card、今日队列、复习回写、AI tasks/usage/drafts 和图谱变更草稿确认请求形状。
- 用户端 ReviewWorkspace 页面级测试，锁定今日队列、翻面和评分回写核心 UI 流。
- 用户端 AiPage 页面级测试，锁定 AI 卡片草稿确认写入复习 deck、图谱变更草稿确认写入目标图谱的核心 UI 流。
- 管理端治理页回归测试，锁定已有 session 下概览、审核队列和 `/api/v1/admin/*` 治理模块加载路径。
- 后端继续补 search/share/admin/review/graph/AI 的 handler/service 边界测试；search/share/card/graph/AI handler 已切到最小 service interface，admin handler 已补 limit 解析测试。涉及数据库的用例优先用 repository interface 或轻量 fixture，不把真实 MySQL/Mongo 作为单元测试前置条件。
- 后端 search service 已新增 `SearchIndexer` 抽象，默认仍走 MySQL fallback；这一层只提供可替换边界，不引入新的搜索引擎依赖。
- 图谱工作区已新增 `graphHistory.ts`，并把 `@studymate/graph-core` 扩展为覆盖文档规范化、验证规则、`.smtg` JSON 导入导出、学习模板、history label 和 200 节点性能 fixture 的纯逻辑边界；大型控制器后续继续拆数据加载、画布交互、validation/draft 与设置面板逻辑。
- 图谱导出、缩略图与布局契约已完成一轮收口：graph 摘要显式暴露 `thumbnailFileId`，来源泳道布局新增 `POST /graphs/:id/layouts/preview`，并通过独立架构文档固定 JSON/SVG/PNG 导出和缩略图任务模型。
- Reader 当前已补 `frontend-user/src/api/reader.test.ts`、`frontend-user/src/pages/ReaderPage.test.tsx`、`backend/internal/modules/reader/handler/handler_test.go` 和 `backend/internal/modules/reader/service/service_test.go`，锁定进度回写、书签、批注 `rects`、来源展示，以及鉴权、请求体、资料可见性与批注选择边界。
- Playwright 已补公共壳层、搜索、分享只读页、复习队列、后台治理和图谱 200 节点工作区 smoke，且 API 请求已改为测试内拦截；后续继续按同样方式补高风险受保护工作流。
- `WB-002` 已完成：`JWT_SECRET` 与 `MYSQL_DSN` 不再使用危险 fallback，`server` / `migrate` / `backfill-note-documents` 会显式校验关键环境变量。
- `WB-003` 已完成：新增 Go 格式化检查、配置安全回归检查，并把它们接入默认 `lint` / `ci`；Playwright preview 默认端口改为 `44173` / `44174`。

退出标准：

- 每个 v1 新增公共接口至少有一层 API 或 UI 合约测试。
- `npm run ci` 持续通过。
- 覆盖率缺口在 `PROJECT_LOG.md` 记录；默认 CI 先用 `npm run verify:coverage` 阻断回退，发布前再用 `npm run test:coverage` 留存详细汇总。

本文档以 [docs/design/UPGRADE_DESIGN.md](../design/UPGRADE_DESIGN.md) 为设计主入口，根目录《学伴项目-设计说明书》保留为兼容入口。当前主线是在 `v1.0.0` 可发布基线上推进 v1.1 质量硬化。

## 1. 当前真实状态

| 模块 | 当前状态 | 1.0 收口方向 |
| --- | --- | --- |
| 资料/阅读/笔记 | 已闭环 | 稳定 `NOTE_READ_MODEL`，补块文档回填、批注坐标、跨页高亮和来源显示 |
| 图谱工作区 | 强 MVP | 补治理能力、模板、规则面板、autosave/dirty、Undo/Redo 边界、无障碍和性能回归 |
| 复习 | 部分实现 | 用可替换调度接口接入 SM-2，完成 deck/card CRUD、到期队列和记录回写 |
| AI | 部分实现 | 完成草稿确认流、用量、队列、失败任务和配额治理 |
| 后台 | 审核主链存在 | 用户、举报、标签、AI、审计、文件治理变为可操作模块 |
| 搜索/分享 | 未收口 | 先做 MySQL fallback 和基础分享，再保留 Meilisearch adapter 边界 |

## 2. 1.0 范围

包含：

- Web 主站
- Web 后台
- 后端 API
- MySQL、MongoDB、Redis 的当前数据职责
- `zh-CN` 源语言和 `en-US` 占位字典框架

不作为 1.0 阻塞：

- 课程/LMS
- Tauri 桌面端
- 多人实时协作
- PWA 离线
- 向量搜索
- 复杂间隔重复算法
- 完整英文翻译

## 3. 执行优先级

### A. 工程基线与文档治理

交付：

- README 当前阶段、文档导航、设计入口更新。
- `docs/planning/ROADMAP.md`、`docs/planning/VERSION_PLAN.md`、`CHANGELOG.md`、`PROJECT_LOG.md` 同步。
- `.github/PULL_REQUEST_TEMPLATE.md`、`.github/workflows/ci.yml`、`scripts/verify-doc-sync.mjs` 补齐。
- 新增 `scripts/check-go-format.mjs` 与 `scripts/check-config-safety.mjs`，用于显式阻断 Go 未格式化文件与危险默认值回退。

退出标准：

- 文档同步脚本通过。
- 当前阶段描述不再夸大或滞后。
- 根 `package.json` 提供 `lint`、`test:user`、`test:admin`、`test:e2e`、`verify:docs`、`ci`。
- CI 覆盖 Node 24、Go 1.26、Go 格式检查、配置安全检查、前后台构建、Vitest、Playwright、图谱核心测试、后端测试和文档同步。

### B. 拆分超大文件

交付：

- 用户端 App 拆分为路由、壳层、页面和特性模块。
- 图谱工作区拆分为 state、components、hooks、lib、exporters、importers。
- 管理端 App 拆分为 router、views 和 admin components。

退出标准：

- 业务组件单文件不超过 500 行，复杂画布组件不超过 800 行。
- 行为保持一致，完整测试通过。
- 当前入口拆分已完成：用户端 App、图谱入口、管理端 App 都改为薄壳；后续图谱 v1 收口继续把大型 hook 内部拆到更细的 state/lib/components。
- 当前已先把图谱 history/autosave/undo-redo 状态从大型 hook 中抽出一层；后续继续沿这条边界拆数据加载、画布交互、draft/import/export/validation 与键盘/设置面板。

### C1. 阅读器与笔记收口

交付：

- `NOTE_READ_MODEL=mysql_primary|mongo_primary`。
- 历史 `notes.content` 到块文档的回填脚本或后台任务。
- `pdf_annotation_documents` 坐标、跨页高亮、书签回写。
- UI 展示批注、资料和 PDF 页来源。
- API 集成测试与前端回归测试。

退出标准：

- `note_documents`、`note_snapshots`、`pdf_annotation_documents` 成为真实读写结构。
- 用户能追溯一条笔记来自哪份资料、哪条批注、哪个 PDF 页。

当前进展：

- `NOTE_READ_MODEL` 已接入后端配置和笔记读取路径，支持 `mysql_primary` 默认策略和 `mongo_primary` 优先读取 `note_documents.html` 后回退 MySQL。
- 历史内容回填、PDF 批注坐标、跨页高亮和 UI 来源显式展示仍在本阶段后续任务中。

### C2. 图谱工作区 v1 基线

保留已有能力：

- 搜索定位
- 来源泳道
- 来源摘要
- AI 落点预览
- Markdown/Mermaid 导入
- PNG/SVG 导出
- StudyMate `.smtg` / `application/vnd.studymate.graph+json` 导入导出

新增能力：

- 图谱模板
- 验证规则面板
- 稳定 autosave/dirty 状态策略
- 持久化 Undo/Redo 边界
- 图谱来源反链
- 键盘可达菜单
- 无障碍标签
- 更清晰的设置面板

当前补强：
- graph-core 已沉淀文档规范化、验证规则、学习模板、history label、JSON 文件格式和 200/300/20 基准夹具。
- 后端 `ValidateGraph` 已扩展孤立节点、缺来源、重复标题、悬挂边、跨折叠分组边、空分组、非法尺寸和来源 target 规则。
- 用户端工作区已接入 JSON 导入导出、明确保存状态、离页保护、学习模板展示和图谱 E2E smoke；`.prg` 兼容仍作为后续转换器计划，不进入当前范围。
- 当前进一步补强：扩展节点的 URL/图片/公式/PDF 锚点 metadata 编辑已接入右侧节点面板；用户端 JSON 导入会校验 schemaVersion、重复 ID、非法尺寸、悬挂边和无效来源 target；后端保存/导入会拒绝 error 级结构问题但允许 warning/info 级学习治理提示。
- 大型工作区 hook 已继续拆出 autosave/beforeunload、右键菜单关闭、stage 测量生命周期 hook、header/source rail/toolbar 纯视图组件、stage status/world/minimap 空态视图组件，以及右侧 rail 中的来源摘要、快照恢复和卡片草稿面板；后续仍需把数据加载、画布交互状态机和节点/连线详情编辑完整拆到独立容器与纯视图。
- Playwright 图谱 200 节点 smoke 已扩展保存状态验证，覆盖大图打开后手动保存进入 `saved` 状态。
- 当前继续补强：`@studymate/graph-core` 已从单一 `index.ts` 拆成 model、source、mutations、validation、file-format、history、templates、fixtures、selection 和 viewport 等聚焦模块，并保留 barrel 导出；用户端页面级测试已覆盖节点标题/URL metadata 编辑、边标签和直线/曲线切换保存 payload；后端 graph handler 的无效请求统一返回 400，服务端校验已兼容 `metadata.targetNodeIds` 的 `[]any` 与 `[]string`；Playwright 200 节点 smoke 已补 JSON 导入失败、快照恢复失败、快捷键面板和来源反链跳转。
- 右侧 rail 的“节点与连线”详情编辑区已拆成 `GraphWorkspaceSelectionPanel` 纯视图组件，覆盖单节点 metadata、边详情、多选批量整理、分组标题/折叠和空态提示；`useGraphWorkspaceController.tsx` 继续下降到约 2049 行，后续重点转向画布 pointer drag、marquee、多选状态机和 import/export hook。
- 右侧 rail 的“导入与校验”区已拆成 `GraphWorkspaceImportPanel` 纯视图组件，覆盖 Markdown/Mermaid/JSON 模式、导入文本区、导入/校验按钮和验证问题展示；`useGraphWorkspaceController.tsx` 继续下降到约 2012 行，后续可把导入执行分支下沉为 `useGraphImportExport`。
- 保存、自动保存、离页保护、快照列表和快照恢复已拆成 `useGraphWorkspacePersistence`，新增 hook 级测试覆盖保存成功、快照恢复成功和快照 API 失败；`useGraphWorkspaceController.tsx` 继续下降到约 1938 行，后续继续拆 keyboard/context menu/selection 与 import/export 执行分支。
- Markdown/Mermaid 远端导入、StudyMate JSON 本地导入和 PNG/SVG/JSON 导出已拆成 `useGraphImportExport`，新增 hook 测试覆盖 JSON 阻断错误、远端导入刷新快照、安全文件名和导出失败状态；`useGraphWorkspaceController.tsx` 继续下降到约 1857 行，后续重点转向 keyboard/context menu/selection 状态机。
- 全局键盘快捷键监听与 action 分发已拆成 `useGraphKeyboardActions`，新增 hook 测试覆盖输入框内保存/撤销/重做、忽略画布编辑快捷键，以及全选、删除、分组、聚焦、链路、重置视野和 Escape；`useGraphWorkspaceController.tsx` 继续下降到约 1822 行，后续重点转向 context menu 与 selection/marquee 状态机。
- 右键菜单打开、定位、节点/边选择联动和外部点击/滚动关闭已拆成 `useGraphContextMenu`，新增 hook 测试覆盖节点/边/画布菜单与 dismiss 生命周期；`useGraphWorkspaceController.tsx` 继续下降到约 1804 行，后续重点转向菜单动作分发、selection/marquee 与 camera/viewport。
- 小地图 viewport、节点聚焦、滚轮/工具栏缩放、重置视野和导航 focus preview 已拆成 `useGraphViewportCamera`，新增 hook 测试覆盖聚焦、缩放、重置和预览过期；`useGraphWorkspaceController.tsx` 继续下降到约 1736 行，后续重点转向 selection/marquee/multi-select 与 node/edge/group mutations。
- 节点单选、多选 toggle、显式多选、框选矩形命中和节点选择时清理边选择已拆成 `useGraphSelectionState`，新增 hook 测试覆盖隐藏节点过滤与选择行为；`useGraphWorkspaceController.tsx` 继续下降到约 1719 行，后续重点转向 pointer drag 状态机和 node/edge/group mutations。
- 画布拖拽状态、框选框和对齐辅助线已拆成 `useGraphDragState`，新增 hook 测试覆盖框选更新、画布平移、单/多节点拖拽、辅助线和清理；`useGraphWorkspaceController.tsx` 继续下降到约 1689 行，后续重点转向拖拽文档变更和 node/edge/group mutations。
- 单节点/多节点拖动的 viewport zoom delta、对齐吸附、边界 clamp 和下一版节点列表生成已拆成 `graphDragMove.ts` 纯逻辑，新增测试覆盖 immutability、单节点移动和多节点 origins；`useGraphWorkspaceController.tsx` 继续下降到约 1643 行，后续重点转向 pan/marquee pointer effect 和 node/edge/group mutations。
- 选中节点左/顶/中心/中线对齐与水平/垂直均分已拆成 `graphSelectionLayout.ts` 纯逻辑，新增测试覆盖未选中节点不变、边界 clamp、稳定排序和数量不足不变；`useGraphWorkspaceController.tsx` 继续下降到约 1576 行，后续重点转向按来源整理、来源分组和 node/edge/group mutations。
- 按来源类型分列/分行整理和来源分组生成已拆成 `graphSourceLayout.ts` 纯逻辑，新增测试覆盖来源排序、未选中节点引用不变、来源分组边界和 `makeGroupId`；`useGraphWorkspaceController.tsx` 继续下降到约 1505 行，后续重点转向来源泳道、批量样式和 node/edge/group mutations。
- 来源泳道生成后的节点位置、旧生成泳道替换、手动分组保留和选择态回写已拆成 `graphSourceSwimlanes.ts` 纯逻辑，新增测试覆盖 generated metadata、未选中节点引用不变和选中不足返回原文档；`useGraphWorkspaceController.tsx` 继续下降到约 1488 行，后续重点转向批量样式和 node/edge/group mutations。
- 选中节点批量 tone、emphasis 和 size preset 已拆成 `graphBatchAppearance.ts` 纯逻辑，新增测试覆盖未选中节点引用不变、保留已有 tone 和尺寸 preset；`useGraphWorkspaceController.tsx` 继续下降到约 1486 行，后续重点转向新增、删除、复制、分组、折叠和连线 mutations。

退出标准：

- 200 节点、300 边、20 分组时，首次打开、拖动、保存、导出都可用。
- 图谱不再表现为“堆按钮”，而是具备治理、可恢复和可解释的工作区。

### D1. 复习与 AI 闭环

交付：

- 可替换调度接口。
- 1.0 使用稳定可解释的 SM-2 基线。
- Deck/Card CRUD、到期队列、复习记录、结果回写。
- 笔记/批注/图谱/资料到 AI 草稿，再到卡片或图谱的确认流。
- 后台 AI 用量、队列、失败任务与配额界面。

退出标准：

- 用户能从学习材料生成草稿，经确认进入卡片或图谱。
- 复习结果能回写并影响下一次到期时间。

### D2. 搜索、后台治理与分享

交付：

- `/search` 跨实体聚合搜索，先 MySQL fallback。
- 抽象 Meilisearch adapter，不把搜索引擎切换做成 1.0 阻塞。
- 后台用户、举报、标签、AI、审计、文件治理可操作。
- 私有、公开、分享链接三种基础分享模式和只读页。

退出标准：

- 用户能跨资料、笔记、图谱、卡片和公开内容搜索。
- 管理员能完成基础治理操作。

### E. 发布与回滚

交付：

- 发布清单、迁移顺序、环境变量清单。
- 回滚说明和演示数据。
- 安全、性能、权限、文件访问、AI 用量基础检查。
- `CHANGELOG.md` 标记 `v1.0.0`。

退出标准：

- CI 全绿。
- 完整测试通过。
- 新环境能按文档启动、演示和回滚。

## 4. 建议性能预算

性能目标此前未指定，`v1.0.0` 先采用以下建议预算。后续如果实测设备或部署环境变化，再调整为正式 SLO。

| 场景 | 建议预算 | 说明 |
| --- | --- | --- |
| 用户端首屏可交互 | 本地构建预览 2.5 秒内 | 不含首次 PDF worker 下载的极端慢网情况 |
| 管理端首屏可交互 | 本地构建预览 2 秒内 | 运营后台优先密集、稳定、可读 |
| 图谱首次打开 | 200 节点、300 边、20 分组在 2 秒内进入可操作 | 允许数据加载中展示骨架态 |
| 图谱拖动 | 200 节点场景主观流畅，无持续卡死；目标 30 FPS 以上 | Canvas 交互优先避免阻塞主线程 |
| 图谱保存 | 200 节点场景 1 秒内完成本地状态确认 | 服务端慢时必须保留 pending/dirty 状态 |
| 图谱导出 | 200 节点 PNG/SVG 在 5 秒内完成 | 导出期间必须可取消或有明确进度 |
| 后端核心 API | 本地 p95 300ms 内 | 文件上传、导出、AI 任务不纳入普通 API 预算 |
| 搜索 fallback | 常见查询 500ms 内返回首批结果 | MySQL fallback 先保证可用，Meilisearch 后续优化 |

## 5. 每个里程碑的固定流程

1. 更新实现。
2. 同步 `README.md`、`docs/DEVELOPMENT.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`CHANGELOG.md`、`PROJECT_LOG.md`。
3. 运行完整测试。
4. 测试通过后提交对应 git commit。

当前完整测试基线：

```powershell
npm run lint
npm run verify:backend:format
npm run verify:config-safety
npm run build:user
npm run build:admin
npm run test:user
npm run test:admin
npm run test:e2e
npm --workspace @studymate/graph-core run test
cd backend
go test ./...
cd ..
npm run verify:docs
```

## 6. 版本治理规则

- 未完成能力必须标为“部分实现”“占位”或“后续”，不能写成已完成。
- 新能力必须能说明它在学习闭环中的位置。
- 数据结构变化必须同步迁移、回滚或兼容策略。
- AI 生成内容必须进入用户确认流。
- 安全边界覆盖鉴权、权限、文件访问、AI 用量和后台操作。

## D 阶段当前完成

- SM-2 已通过 `Scheduler` 接口包裹，保持 v1 可解释默认算法，同时给后续替换调度器留下稳定边界。
- `GET /api/v1/search?q=&types=&limit=` 已接入 MySQL fallback，响应按 `material/post/note/graph/card` 分组，每条结果包含 `type/id/title/summary/url/source`；省略 `types` 时默认搜索五组，未知类型返回 `400 invalid_search_type`，`limit` 缺省为 `20` 且最大为 `50`。
- 用户端搜索页已改为消费后端 grouped payload；公开请求只返回公开内容，登录请求包含当前用户私有学习数据；fallback 组内结果按标题命中优先稳定排序，长摘要统一压缩为单行 160 字符内预览；页面层现支持 URL 类型筛选、来源跳转与当前批次内分页回归，并新增 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md` 与 `npm run verify:search` 作为集中化验收入口。
- 搜索权限矩阵已由纯 `spec` 测试锁定：匿名请求直接短路 `note/graph/card`，登录后 `graph` 仅允许 `active` 且 owner/public 的记录进入候选集。
- `share_links` 表和分享 API 已接入，支持 owner 创建/列表/撤销，以及公开 token 只读解析页 `/share/:token`。
- 后台治理 API 已覆盖 users、reports、tags、AI tasks/usage、audit logs、files；管理端视图按模块读取真实 API 数据。

## E 阶段发布收口

- `docs/planning/versions/v1.0.0-release.md` 已补齐 release checklist、env var matrix、migration order、demo data steps、rollback steps 和 known non-blockers。
- `CHANGELOG.md` 已新增 `v1.0.0 - 2026-06-01`。
- 最终验证必须记录 `npm run ci`、`npm run verify:coverage`、覆盖率汇总、`npm run verify:secrets`、diff review、release smoke flow 和本地 annotated tag。
