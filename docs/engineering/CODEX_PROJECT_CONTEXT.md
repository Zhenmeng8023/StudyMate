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
共享包：`@studymate/graph-core` 已存在并有独立测试命令；`@studymate/ui` 已开始承接共享页面状态契约（`DataStateKind` / `getDataStateLabel`），但整体仍处于起步阶段；`@studymate/api-client` 已开始承接共享 request/error/auth-header、query/pagination 与 JSON 请求体编码基础层，`@studymate/editor-core` 仍接近占位状态，跨前后台的稳定契约层仍需继续收口。

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
- 管理后台真实数据路由已存在，包含 `users`、`reports`、`tags`、`ai/tasks`、`ai/usage`、`audit-logs`、`files`。

### 3.5 前端壳层拆分状态

- `frontend-user/src/app/App.tsx` 目前仅作导出，主路由在 `routes.tsx`，不是高风险大文件。
- `frontend-admin/src/App.vue` 目前仅挂载 `AdminWorkspaceView`，主逻辑已不堆在根组件。
- 因此“继续拆分 App 根文件”已不再是最高优先级，后续应转向模块内聚与测试补强。

### 3.6 2026-07-08 PDF 评审后新增核验结论

- `frontend-user/src/styles.css` 与 `frontend-admin/src/main.ts` 现已都接入 `@studymate/ui/tokens.css`；用户端重复的根 token 定义已经移除，管理端基础背景 / 文本 / 描边 / accent 变量也已映射到共享 token，前后台至少完成了共享设计 token 的共同起步。
- `packages/ui` 已同时承接共享 `DataStateKind` / `dataStateKinds` / `getDataStateLabel(...)` 与共享 `tokens.css`；但更多 primitives、管理端更深层的视觉契约与跨端共享层仍未收口。`packages/api-client/src/index.ts` 已开始承接共享 `requestApi(...)`、`readApiResponse(...)`、`createAuthHeaders(...)`、`buildApiPath(...)`、JSON 请求体归一化、`ApiRequestError` 与 `createSessionRequest(...)`；其中用户端 `frontend-user/src/api/core.ts` 与 `frontend-user/src/app/sessionStore.ts` 已接入共享 401 refresh/replay 起步能力，但管理端与更完整的 pagination、会话失效原因记录、fail-logout 生命周期仍未收口。`packages/editor-core/src/index.ts` 仍只有最小类型定义；这些包仍需要继续进入真实共享能力建设，而不是继续作为占位目录存在。
- `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx` 约 79KB，仍包含大量 `useState` 与跨领域函数；`WB-032` 的冲突处理已经很深，下一步必须把状态边界、commands 与 features 从控制器中拆出，避免继续集中膨胀。
- `frontend-admin/src/views/AdminWorkspaceView.vue` 约 22KB，后台仍主要是单工作台组件内切换模块；不过最基础的请求边界已开始抽到 `frontend-admin/src/api/client.ts`。`frontend-admin/src/router/index.ts` 目前只是 route key 列表，尚未形成可刷新、可分享、可回退的 Vue Router 模块 URL。
- 根 `package.json`、`package-lock.json` 与 `.github/workflows/ci.yml` 在真实仓库中存在，因此 PDF 中“压缩包缺少根工程入口/CI”的判断不作为当前事实；但 `@studymate/graph-core` 仍直接使用 `node --test test/*.test.ts` 执行 TypeScript 测试，工程可复现性仍需二次收口。

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
5. “工程压缩包不可复现”不能直接套用于当前 Git 工作区：真实仓库已有根 workspace、lockfile 与 CI；后续只保留工具链版本、graph-core TS 测试运行方式、bootstrap 与依赖审计等仍成立的复现性缺口。

## 6. 当前真正需要优先收口的问题

### P0

1. **配置安全默认值已完成第一轮收口，但仍需继续分层**  
   `JWT_SECRET` 与 `MYSQL_DSN` 的危险 fallback 已移除，启动阶段会显式校验缺失项；下一步仍需把开发 / 测试 / 生产配置策略、CORS 与 secret scan 门禁继续固化。
2. **CI 第一轮质量门禁已补齐，但仍未到发布级**  
   当前 workflow 已显式运行 `gofmt` 检查、配置安全回归检查、typecheck、build、Vitest、Playwright、Go test 与文档校验；剩余缺口主要是依赖审计、覆盖率门槛和更完整的 secret scan。
3. **工程执行文档落后于代码**  
   `docs/engineering/*` 仍把“搜索缺失、CI 缺失、App 根文件过大”写成现状，容易误导后续代理。
4. **搜索进入了“补强期”而非“从零建设期”**  
   后续重点应转向权限过滤、结果质量、测试矩阵、文档契约和可替换索引，而不是重新创建 search module。
5. **设计系统与 API 契约仍未完全成为共享底座**
   设计 token、基础 UI 组件与页面状态协议虽已起步，前后台 API 的 request/error/auth-header、query/pagination、JSON 请求体编码与用户端 401 refresh/replay 骨架也已开始沉到共享层，但 pagination 响应契约、管理端 auth-session、会话失效原因记录与更多后台模块请求边界仍分散在各端实现；任何新页面和后台模块继续扩展前，应先收口这些共享边界。
6. **图谱控制器与后台工作台进入拆分临界点**
   图谱冲突能力已经深入到对象级取舍，后台治理也接入真实 API；下一步应优先拆 store/commands/features 与后台模块路由，而不是继续往单文件叠加业务。

### P1

1. 图谱内核继续下沉到 `packages/graph-core`，并把浏览器状态进入 store、用户意图进入 commands，减少工作区控制器逻辑。
2. 图谱-复习反馈仍需从“局部连接”升级为“稳定回写闭环”，并服务于“资料上传 -> 阅读批注 -> 笔记 -> 图谱草稿 -> 卡片 -> 今日复习”的主演示路径。
3. 后台治理仍需更强的真实路由、审计模型、审批动作和测试回归。
4. 搜索需要在现有 MySQL fallback 上补服务端分页、真实 count/total、耗时、空结果建议和排序语义，再评估 Meilisearch。

## 7. 执行约束提醒

- 继续把后端能力放入明确 module，不把业务堆回 `server.go`。
- 继续把图谱纯逻辑下沉到 `packages/graph-core`。
- 任何破坏性接口或迁移都必须带兼容说明。
- 未完成 P0/P1 前，不主动扩张课程、协作、桌面端、PWA 等新域。
