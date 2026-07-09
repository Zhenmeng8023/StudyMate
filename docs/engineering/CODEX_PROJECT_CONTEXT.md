# StudyMate 项目上下文与技术基线

**基线日期：2026-07-01；PDF 评审补充日期：2026-07-08**
**核验分支：`master`**  
**用途：供 Codex 进入仓库时快速判断“哪些能力已经真实存在、哪些判断已经过期、下一步该收口什么”。**

> 本文是运行时核验后的执行基线，不是一次性规划稿。若代码与本文不一致，以当前代码为准，并同步更新对应文档。

## 1. 产品主线

StudyMate 的核心闭环仍然是：

```text
资料 / 阅读
  -> 批注
  -> 笔记
  -> 图谱
  -> 卡片复习
  -> AI 辅助理解
  -> 学习反馈
```

图谱是学习语义中心，不是孤立白板。工程图能力、桌面端和课程协作只能建立在这条主线稳定之后推进。

## 2. 2026-07-01 已核验的真实工程结构

```text
StudyMate/
├── backend/
│   ├── cmd/migrate/
│   └── internal/
│       ├── app/
│       ├── config/
│       ├── migrations/
│       └── modules/
│           ├── admin/ ai/ auth/ card/ community/
│           ├── file/ graph/ material/ note/ reader/
│           ├── search/ share/ user/
├── frontend-user/
│   └── src/app/
│       ├── App.tsx
│       ├── routes.tsx
│       └── shell/
├── frontend-admin/
│   └── src/
│       ├── App.vue
│       ├── router/
│       └── views/
├── packages/
│   └── graph-core/
├── e2e/
├── .github/workflows/ci.yml
└── docs/
```

后端技术线：Go、Gin、GORM、MySQL、MongoDB Driver、Redis、JWT。  
用户端技术线：React 19、Vite 7、TypeScript、Zustand、react-pdf、Tiptap。  
管理端技术线：Vue 3、Vite 7、Element Plus。  
共享包：`@studymate/graph-core` 已存在并有独立测试命令；`@studymate/ui` 已开始承接共享页面状态契约，并进一步收口了 `DataState`、`Drawer`、`Inspector`、`IconButton`、`Button`、`Tag`、`Input`、`Select`、`PageHeader`、`CommandBar`、`ConfirmDialog` 十一个基础 primitive，但整体仍处于起步阶段；`@studymate/api-client` 已开始承接共享 request/error/auth-header、query/pagination 与 JSON 请求体编码基础层，`@studymate/editor-core` 仍接近占位状态，跨前后台的稳定契约层仍需继续收口。

## 3. 真实已实现能力

### 3.1 基础平台

- 用户注册、登录、刷新令牌、退出、个人资料读写。
- 管理员登录与后台治理路由。
- 文件上传与下载入口。
- MySQL + MongoDB + Redis 的多存储运行框架。

### 3.2 社区、资料、阅读、笔记

- 帖子、评论、点赞、收藏和资料 CRUD 已存在。
- 阅读进度、书签、PDF 批注、笔记 CRUD、版本恢复已存在。
- `note_documents` / `note_snapshots` 等 Mongo 内容落点已进入文档与实现约束。

### 3.3 图谱与复习

- 图谱 CRUD、批量保存、快照恢复、Markdown/Mermaid 导入、校验、SVG 导出已存在。
- 图谱工作区已有来源泳道、分组折叠、自动保存、AI 草稿确认等产品化能力。
- Deck/Card、SM-2 调度、复习提交与图谱/笔记/AI 的局部闭环已存在。

### 3.4 搜索、分享与后台治理

- `backend/internal/modules/search` 已存在，且包含 `SearchIndexer` 抽象与 MySQL fallback 实现。
- `backend/internal/modules/share` 已存在，含 `/share-links` 相关路由。
- 管理后台真实数据路由已存在，包含 `users`、`reports`、`materials`、`tags`、`diagram-templates`、`ai/tasks`、`ai/usage`、`audit-logs`、`files`；其中举报治理已起步支持 `resolve / dismiss` 动作，并会写回 `handled_by / handled_at` 与审计日志，资料治理也已切到真实材料列表与可执行动作，AI 任务治理已支持 `retry / cancel` 状态动作与审计留痕，用户治理已支持 `disable / activate`，禁用时会撤销仍有效的 refresh token，且认证中间件会在请求时按数据库中的当前用户状态与角色做校验，图谱模板治理则已支持 `publish / unpublish`，并会同步影响用户端 `/api/v1/diagram/templates` 可见性。

### 3.5 前端壳层拆分状态

- `frontend-user/src/app/App.tsx` 目前仅作导出，主路由在 `routes.tsx`，不是高风险大文件。
- `frontend-admin/src/App.vue` 目前仅挂载 `AdminWorkspaceView`，主逻辑已不堆在根组件。
- 因此“继续拆分 App 根文件”已不再是最高优先级，后续应转向模块内聚与测试补强。

### 3.6 2026-07-08 PDF 评审后新增核验结论

- `frontend-user/src/styles.css` 与 `frontend-admin/src/main.ts` 现已都接入 `@studymate/ui/tokens.css`；用户端重复的根 token 定义已经移除，管理端基础背景 / 文本 / 描边 / accent 变量也已映射到共享 token，前后台至少完成了共享设计 token 的共同起步。
- `packages/ui` 已同时承接共享 `DataStateKind` / `dataStateKinds` / `getDataStateLabel(...)`、共享 `tokens.css`，以及第一批共享 primitive：`DataState`、`Drawer`、`Inspector`、`IconButton`、`Button`、`Tag`、`Input`、`Select`、`PageHeader`、`CommandBar`、`ConfirmDialog`；其中 `IconButton` 与 `Button` 已被图谱工作区骨架真实消费，`Tag` 已被阅读和资料页面消费，`Input` 已接入资料页搜索与详情编辑表单，`Select` 已接入笔记与阅读页的资料/Deck 选择器，`PageHeader` 已通过 `WorkspaceHeader` 接入多条工作区页面头部，`CommandBar` 已接入主站壳层顶部骨架，`ConfirmDialog` 已同时接入 `NotesPage` 删除确认、图谱工作区的“重载最新图谱 / 删除图谱”确认，以及管理端审核队列里的“通过 / 驳回 / 隐藏”确认层；用户端对应 primitive 文件也已改为兼容转发层，管理端则新增了沿同一确认语义实现的 `AdminConfirmDialog`，但更多 primitives、管理端更深层的视觉契约与跨端共享层仍未收口。`packages/api-client/src/index.ts` 已开始承接共享 `requestApi(...)`、`readApiResponse(...)`、`createAuthHeaders(...)`、`buildApiPath(...)`、JSON 请求体归一化、`ApiRequestError`、`createSessionRequest(...)` 与 `SessionInvalidationState`；其中用户端 `frontend-user/src/api/core.ts` 与 `frontend-user/src/app/sessionStore.ts`、管理端 `frontend-admin/src/api/client.ts` 与 `frontend-admin/src/api/sessionStore.ts` 都已接入共享 401 refresh/replay、会话失效原因记录、统一 fail-logout 提示，以及请求阶段直接收到 `403 user_disabled` 时的清 session / 被动登出提示联动，但更完整的 pagination、更多后台模块请求边界与 HttpOnly Refresh Token 迁移说明仍未收口。`packages/editor-core/src/index.ts` 仍只有最小类型定义；这些包仍需要继续进入真实共享能力建设，而不是继续作为占位目录存在。
- `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx` 约 79KB，仍包含大量 `useState` 与跨领域函数；`WB-032` 的冲突处理已经很深，下一步必须把状态边界、commands 与 features 从控制器中拆出，避免继续集中膨胀。
- `frontend-admin/src/views/AdminWorkspaceView.vue` 已开始从单体工作台向模块壳层收口：最基础的请求边界与后台 session store 已抽到 `frontend-admin/src/api/client.ts` 和 `frontend-admin/src/api/sessionStore.ts`，启动时 refresh 失败会显式清空本地会话并回退登录页；`frontend-admin/src/router/index.ts` 已提供规范化的 `/admin/dashboard`、`/admin/moderation`、`/admin/users` 等路径映射；当前已先后拆出 `frontend-admin/src/views/modules/AdminDashboardModule.vue`、`AdminModerationModule.vue` 与 `AdminGovernanceModule.vue` 三个首批模块视图，以及 `frontend-admin/src/components/admin/AdminLoginPanel.vue`、`AdminShellFrame.vue` 两个工作台壳层组件，让登录视图、已登录框架、概览、审核与治理列表都先脱离单文件模板。`AdminGovernanceModule` 也已开始承接真实治理动作切片：举报可在前端直接 `resolve / dismiss`，资料治理已切到真实材料列表并支持 `approve / reject / hide` 与隐藏后的恢复，AI 任务可在治理视图里直接 `retry / cancel`，用户治理则已支持 `disable / activate` 与对应确认流。后台目前仍未进入真正的 Vue Router page 级拆分，但 `AdminWorkspaceView.vue` 已进一步回到“session / URL / 确认层 / 数据协调器”的角色。
- 根 `package.json`、`package-lock.json` 与 `.github/workflows/ci.yml` 在真实仓库中存在，因此 PDF 中“压缩包缺少根工程入口/CI”的判断不作为当前事实；当前仓库已进一步补上 `packageManager` / `engines`、`npm run bootstrap`、`npm run verify:runtimes`、`npm run verify:deps`、`npm run verify:secrets`、`@studymate/graph-core` 显式 `--experimental-strip-types` 测试命令，以及 `toolchain go1.26.5`、前端安全锁文件与默认 CI 里的依赖审计/secret scan 门禁，工程可复现性与依赖安全基线都已进入可执行状态。

## 4. 当前阶段判断

| 阶段 | 结论 | 说明 |
|---|---|---|
| Phase 1-4 | 已跨过 | 基础平台、社区/资料、阅读-笔记、图谱 MVP 已成形。 |
| Phase 5 | 持续进行中 | 图谱产品化、编辑器状态治理、工程图模板与来源语义正在推进。 |
| Phase 6 | 局部预埋 | 复习反馈、AI 草稿、图谱出卡已有接口与局部实现，但反馈闭环仍需强化。 |
| Phase 7 | 暂不进入主线 | PlantUML/SQL/OpenAPI 深度导入、代码分析、Tauri 不应抢占 P0/P1。 |

## 5. 本轮核验后的关键差异

以下判断已被当前代码推翻，不应再作为执行前提：

1. “统一搜索后端缺失”不成立：搜索模块与 DTO/索引抽象已存在。
2. “CI 尚未建立”不成立：`.github/workflows/ci.yml` 已覆盖 typecheck、build、Vitest、graph-core test、Playwright、Go test 与文档校验。
3. “管理端大量占位”只部分成立：后台治理入口已接入多组真实 API，但仍需更强的测试、审计与可操作性。
4. “前端根文件过大”不成立：根文件已基本瘦身，后续问题更多在模块内部边界和回归测试。
5. “工程压缩包不可复现”不能直接套用于当前 Git 工作区：真实仓库已有根 workspace、lockfile 与 CI；当前已补齐工具链版本约束、graph-core 显式 TS 测试运行方式、bootstrap、依赖审计入口，以及 `verify:deps` 对前端锁文件与 Go 依赖的安全下限收口、`verify:secrets` 对仓库级硬编码密钥的默认扫描、`verify:coverage` 对前后台 / graph-core / 后端覆盖率基线的默认门禁，主要缺口已回到共享底座和产品化能力本身。

## 6. 当前真正需要优先收口的问题

### P0

1. **配置安全默认值已完成第一轮收口，但仍需继续分层**  
   `JWT_SECRET` 与 `MYSQL_DSN` 的危险 fallback 已移除，启动阶段会显式校验缺失项；当前已补上仓库级 secret scan 门禁，下一步仍需继续把开发 / 测试 / 生产配置策略与 CORS 策略固化。
2. **CI 第一轮质量门禁已补齐，并开始进入“逐步抬线”阶段**
   当前 workflow 已显式运行 `verify:deps`、`verify:secrets`、`verify:coverage`、`gofmt` 检查、配置安全回归检查、typecheck、build、Vitest、Playwright、Go test 与文档校验；下一步重点不再是“有没有门禁”，而是逐步提高基线，并把重点变更代码持续推向 80% 聚焦覆盖率。
3. **工程执行文档需要持续跟随代码演进**
   当前主文档已补齐搜索、CI、secret scan 与 coverage gate 的最新事实；后续每个里程碑仍需同步更新 `docs/engineering/*`、README 与 `PROJECT_LOG.md`，避免新的状态漂移。
4. **搜索进入了“补强期”而非“从零建设期”**  
   后续重点应转向权限过滤、结果质量、测试矩阵、文档契约和可替换索引，而不是重新创建 search module。
5. **设计系统与 API 契约仍未完全成为共享底座**
   设计 token、基础 UI 组件与页面状态协议虽已起步，前后台 API 的 request/error/auth-header、query/pagination、JSON 请求体编码与前后台 401 refresh/replay 第一段骨架也已开始沉到共享层；其中会话失效原因记录与统一 fail-logout 提示语义已收口，但 pagination 响应契约、更多后台模块请求边界与 HttpOnly Refresh Token 迁移说明仍分散在各端实现；任何新页面和后台模块继续扩展前，应先继续收口这些共享边界。
6. **图谱控制器与后台工作台进入拆分临界点**
   图谱冲突能力已经深入到对象级取舍，后台治理也接入真实 API；下一步应优先拆 store/commands/features 与后台模块路由，而不是继续往单文件叠加业务。

### P1

1. 图谱内核继续下沉到 `packages/graph-core`，并把浏览器状态进入 store、用户意图进入 commands，减少工作区控制器逻辑。
2. 图谱-复习反馈仍需从“局部连接”升级为“稳定回写闭环”，并服务于“资料上传 -> 阅读批注 -> 笔记 -> 图谱草稿 -> 卡片 -> 今日复习”的主演示路径。
3. 后台治理虽已起步落地举报处理、资料治理、AI 任务和用户治理动作，但仍需继续补更强的真实路由、审计模型、审批动作和测试回归。
4. 搜索需要在现有 MySQL fallback 上补服务端分页、真实 count/total、耗时、空结果建议和排序语义，再评估 Meilisearch。

## 7. 执行约束提醒

- 继续把后端能力放入明确 module，不把业务堆回 `server.go`。
- 继续把图谱纯逻辑下沉到 `packages/graph-core`。
- 任何破坏性接口或迁移都必须带兼容说明。
- 未完成 P0/P1 前，不主动扩张课程、协作、桌面端、PWA 等新域。
