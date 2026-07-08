## 2026-07-09 06:53:00 +08:00 | v1.1.0-alpha.126 | 推进 WB-032 多目标连线联动取舍子步骤
### 任务内容

- 按 `CODEX_MASTER_PROMPT.md` 当前优先级继续沿 `WB-032` 做一个最小、可测试的冲突处理收口，不跳去新的共享层或控制器拆分。
- 本轮目标是补齐一个真实但较隐蔽的依赖缺口：当 `dangling_edge` 来自多目标连线 `metadata.targetNodeIds` 中的缺失节点时，联动取舍建议不应只盯住主 `sourceNodeId / targetNodeId`，还应提示保留这些额外依赖节点。
### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，先用 RED 锁定“多目标连线引用的附加目标节点被遗漏”这一缺口：当前只会建议回退连线，不会联动补齐 `targetNodeIds` 里的依赖节点。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，让 `buildGraphConflictResolutionSuggestions(...)` 在处理 `dangling_edge` 时统一收集 `sourceNodeId`、`targetNodeId` 和 `metadata.targetNodeIds`，并对去重后的节点集合生成同一套“保留依赖节点 / 放弃问题连线”建议。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，把 `WB-032` 当前边界推进到“多目标连线的附加依赖节点也能进入联动取舍建议”。
### 验证结果

- RED：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 后续影响

- `WB-032` 的联动取舍建议现在不再只覆盖普通单目标连线；当冲突来自多目标连线附带的额外目标节点时，冲突卡片也能给出真正可执行的补齐建议。
- 这一轮仍然没有完成更系统的 conflict handling；下一步更适合继续补更多组合型依赖场景，或开始整理 `WB-034` 所需的图谱冲突回归矩阵。

## 2026-07-09 06:46:00 +08:00 | v1.1.0-alpha.125 | 推进 WB-032 latest-head 删除语义联动建议修正
### 任务内容

- 按当前优先级继续沿 `WB-032` 做一个最小、可测试的冲突处理收口，而不是跳去新的共享层或更大的重构。
- 本轮目标是修正一个真实的 latest-head 语义缺口：当阻断来自“当前取舍想沿用本地删除结果，导致服务端边/分组失去依赖对象”时，联动取舍建议不应继续机械地推荐 `keep-local` / `keep-latest`，而应给出真正能解除阻断的方向。
### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，先用 RED 锁定一个 latest-head 删除场景：当前草稿缺少服务端节点与连线，若用户继续沿用本地删除结果，冲突建议必须能正确提示“保留服务端节点”或“按本地删除结果处理该服务端连线”。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，让 `buildGraphConflictResolutionSuggestions(...)` 不再把“保留对象”固定写死成 `keep-local`、把“放弃对象”固定写死成 `keep-latest`，而是按对象差异的 `action` 判断真正的建议方向；同时在生成 `dangling_edge` / `invalid_group_node` 建议时补上对 `latestHead` 文档边和分组的读取，避免服务端对象只存在于最新版本时直接失去联动建议。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，把 `latestConflictDetail` 继续下传到建议生成逻辑，确保页面级冲突卡片也能消费这次 latest-head 删除语义修正。
- 同步更新 `docs/engineering/CODEX_BACKLOG.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，把 `WB-032` 当前边界推进到“latest-head removed 对象的联动建议方向已纠正”的最新状态。
### 验证结果

- RED：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
### 后续影响

- `WB-032` 的联动取舍建议现在不再只对“本地新增/修改对象”方向正确；当问题对象只存在于最新服务端版本时，冲突卡片也能给出真正可执行的解除阻断建议。
- 这一轮仍然没有完成更系统的 conflict handling；下一步更适合继续补更多 latest-head / 跨对象组合场景的页面级回归，或开始梳理 `WB-034` 所需的图谱冲突矩阵。

## 2026-07-09 07:18:00 +08:00 | v1.1.0-alpha.124 | 收口 QA-010 默认覆盖率基线门禁
### 任务内容

- 在 `SEC-011` 已把仓库级 secret scan 纳入默认 CI 之后，继续按“先收口全局骨架”的优先级，补上剩余的 P0 工程门禁缺口，把覆盖率从 release 前的人工汇总推进为默认流水线的显式硬门禁。
- 本轮目标不是强行把全仓立刻拉到 80%，而是先把当前已验证覆盖率固化为“不回退”基线，并把这条约束沉到可执行测试、统一脚本和默认 CI 里。
### 实际变更

- 新增 `scripts/coverage-baseline.test.mjs`，先以 RED 锁定四类缺口：仓库缺少 `verify:coverage` 命令、`ci` 未显式执行覆盖率门禁、GitHub Actions 没有 coverage gate 步骤，以及 README / 开发说明 / 版本计划 / release checklist 仍只记录 `test:coverage` 而没有默认硬门禁入口。
- 新增 `scripts/verify-coverage-gates.mjs`，统一收口四套覆盖率来源：`frontend-user` 与 `frontend-admin` 运行 Vitest coverage 并读取 JSON summary，`@studymate/graph-core` 解析 Node test coverage 的 `all files` 汇总，后端运行 `go test ./... -coverprofile` 并用 `go tool cover -func` 读取总体 statements。
- 将当前仓库已验证覆盖率固化为默认“不回退”基线：`frontend-user` `statements/branches/functions/lines >= 68/63/67/68`，`frontend-admin >= 70/67/64/75`，`graph-core lines/branches/functions >= 96/79/100`，后端总体 `statements >= 25`。
- 更新 `package.json`、`.github/workflows/ci.yml`、`README.md`、`docs/DEVELOPMENT.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`docs/planning/versions/v1.0.0-release.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_PROJECT_CONTEXT.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，统一把默认覆盖率门禁入口收口为 `npm run verify:coverage`，并明确 `npm run test:coverage` 继续承担发布前详细汇总职责。
### 验证结果

- RED：`node --test scripts/coverage-baseline.test.mjs`
- GREEN：`node --test scripts/coverage-baseline.test.mjs`
- `npm run verify:coverage`
- `npm run verify:docs`
### 后续影响

- 默认 CI 现在不再只在 release checklist 里“提醒要看覆盖率汇总”，而是会直接执行 `npm run verify:coverage`，先把前后台、graph-core 和后端覆盖率回退挡在本地与流水线入口。
- 这一轮收口的是“基线不回退”硬门禁，而不是“全仓 80% 一步到位”；后续仍应沿 `FE-040`、`API-010`、`WB-032` 等里程碑继续补测试、提升真实覆盖率，并逐步抬高默认阈值。

## 2026-07-09 06:28:00 +08:00 | v1.1.0-alpha.122 | 收口 SEC-010 依赖安全基线与 CI 审计门禁
### 任务内容

- 在 `DEV-010` 已提供 `verify:deps` 审计入口的基础上，继续选择一个覆盖面广但不深入产品功能的新工作包，把“审计已经能报出来”推进到“当前基线已经被收口并默认受 CI 保护”。
- 本轮目标不是继续扩展业务模块，而是锁定前端锁文件中的安全版本、后端 Go toolchain 与关键依赖的 patch 下限，并把这组约束沉到可执行测试和默认流水线里。
### 实际变更

- 新增 `scripts/dependency-security-baseline.test.mjs`，先用 RED 锁定 `vite` / `esbuild` / `undici` / `glob` 的最低安全版本、`frontend-user` / `frontend-admin` 的 `vite` 版本下限、根 `vitest` / `@vitest/coverage-v8` / `@vue/test-utils` 版本下限，以及 `backend/go.mod` 中 `toolchain go1.26.5`、`golang.org/x/net v0.55.0`、`github.com/quic-go/quic-go v0.59.1` 与 CI 的 Go patch 版本。
- 更新根 `package.json`、`frontend-user/package.json`、`frontend-admin/package.json` 与 `package-lock.json`，把前端依赖声明和锁文件一起拉回 `vite ^7.3.6`、`vitest ^4.1.10`、`@vitest/coverage-v8 ^4.1.10`、`@vue/test-utils ^2.4.11` 的安全基线，并清掉锁文件里残留的 `esbuild` / `undici` / `glob` 旧版本。
- 更新 `backend/go.mod` 与 `backend/go.sum`，显式加入 `toolchain go1.26.5`，并升级 `golang.org/x/net` 到 `v0.55.0`、`github.com/quic-go/quic-go` 到 `v0.59.1`，同步带上 `qpack` 与 `x/*` 依赖的新安全版本。
- 更新 [.github/workflows/ci.yml](/E:/Code/1108026_rust_go/StudyMate/.github/workflows/ci.yml)、[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)、[docs/engineering/CODEX_BACKLOG.md](/E:/Code/1108026_rust_go/StudyMate/docs/engineering/CODEX_BACKLOG.md)、[docs/engineering/CODEX_EXECUTION_ROADMAP.md](/E:/Code/1108026_rust_go/StudyMate/docs/engineering/CODEX_EXECUTION_ROADMAP.md) 与 [docs/engineering/CODEX_PROJECT_CONTEXT.md](/E:/Code/1108026_rust_go/StudyMate/docs/engineering/CODEX_PROJECT_CONTEXT.md)，把 Go `1.26.5`、`verify:deps` 门禁和本轮依赖安全收口状态同步回工程文档。
### 验证结果

- RED：`node --test scripts/dependency-security-baseline.test.mjs`
- GREEN：`node --test scripts/dependency-security-baseline.test.mjs`
- `npm run verify:deps`
- `npm run verify:runtimes`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm --workspace frontend-user run test -- src/styles/tokenSource.test.ts`
- `npm --workspace frontend-admin run test -- src/tokenSource.test.ts`
- `cd backend && go test ./...`
- `npm run verify:docs`
### 后续影响

- `verify:deps` 现在不再只是“能把漏洞打出来”的辅助入口，而是当前基线本身已经转绿，并被纳入默认 CI 门禁；后续如果锁文件或 Go 依赖回退到已知漏洞版本，会先在本地基线测试和 CI 中暴露出来。
- 剩余的工程级 P0 缺口不再是“依赖审计结果尚未处理”，而是覆盖率硬门槛与更完整的 secret scan；后续应继续优先收口这些全局质量门禁，而不是扩新功能域。

## 2026-07-09 05:26:00 +08:00 | v1.1.0-alpha.120 | 收口 API-011 会话失效原因与统一提示语义
### 任务内容

- 在 `API-011` 已完成前后台共享 refresh/replay 第一段骨架的基础上，继续选择一个覆盖面广但仍然安全可控的最小工作包，把“refresh 失败后为什么被登出”从局部副作用提升为共享生命周期的一部分。
- 本轮目标不是继续扩后台新模块，而是先收口两个明确缺口：会话失效原因记录，以及前后台登录页一致可读的 fail-logout 提示语义。
### 实际变更

- 更新 `packages/api-client/src/index.ts`，新增 `SessionInvalidationState` 与 `onSessionInvalidated(...)` 回调；共享 `createSessionRequest(...)` 在 refresh 失败时不再只会清 session，也会把结构化失效原因回写到前后台会话入口。
- 更新 `frontend-user/src/app/sessionStore.ts` 与 `frontend-admin/src/api/sessionStore.ts`，把 session 与 invalidation 元数据分开持久化并开放读写/订阅入口；refresh 成功会清掉旧 invalidation，refresh 失败会保留原因，供登录页和路由层消费。
- 更新 `frontend-user/src/api/core.ts` 与 `frontend-admin/src/api/client.ts`，把新的 invalidation 回调接到共享 refresh 生命周期；`frontend-user/src/pages/AuthPages.tsx`、`frontend-user/src/app/routes.tsx` 与 `frontend-admin/src/views/AdminWorkspaceView.vue` 则补齐统一 fail-logout 提示，并在手动退出时主动清理旧提示。
- 更新 `packages/api-client/src/index.test.ts`、`frontend-user/src/api/sessionRefresh.test.ts`、新增 `frontend-user/src/pages/AuthPages.test.tsx`，并更新 `frontend-admin/src/views/AdminWorkspaceView.test.ts`；先用 RED 复现“refresh 失败只清 session、不记录原因”和“登录页没有统一提示”的缺口，再转 GREEN 锁定回归。
- 同步更新 `docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，把 `API-011` 推进到“前后台共享刷新骨架 + 失效原因提示语义已收口”的最新状态。
### 验证结果

- RED：`npx vitest run packages/api-client/src/index.test.ts`
- RED：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
- RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN：`npx vitest run packages/api-client/src/index.test.ts`
- GREEN：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
- GREEN：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx src/api/graphs.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响

- `API-011` 现在不再只会在 refresh 失败时“把人踢回登录页”，而是会显式保留失效原因并在前后台登录页给出统一提示；后续新请求边界不需要再各自补一套局部 fail-logout 文案。
- 这一轮仍然没有解决 HttpOnly Refresh Token 迁移说明、更多后台模块 API 接线与后台 Router 模块化；后续应继续沿 `API-011 / ADM-010` 收口，而不是回到页面里散落新的会话 helper。

## 2026-07-09 04:56:33 +08:00 | v1.1.0-alpha.119 | 推进 API-011 管理端共享会话刷新起步
### 任务内容

- 在 `API-011` 已完成用户端共享 refresh/replay/fail-logout 起步的基础上，继续选择一个覆盖面广但仍然安全可控的最小工作包，把同一套会话生命周期接到 `frontend-admin`。
- 本轮目标不是扩新后台治理模块，而是先让管理端登录后自举、令牌过期重试与刷新失败退回登录页这条基础路径进入共享层，避免前后台继续各自散落本地会话逻辑。

### 实际变更

- 更新 `packages/api-client/src/index.ts`，让共享 `createSessionRequest(...)` 支持显式 `sessionOverride`，管理端在仍然传入当前页面 session 的场景下，也能参与共享 401 refresh/replay 生命周期。
- 新增 `frontend-admin/src/api/sessionStore.ts`，把后台 `studymate.admin.session` 的读取、持久化、清理与订阅统一收口成可复用 store。
- 更新 `frontend-admin/src/api/client.ts`，统一通过共享 `createSessionRequest(...)` 与 `/api/v1/auth/refresh` 刷新后台 Access Token，并在刷新成功后持久化最新 session。
- 更新 `frontend-admin/src/views/AdminWorkspaceView.vue`，登录、自举与退出流程改为消费共享 session store；当启动阶段或请求阶段 refresh 失败时，会清空后台本地会话、重置治理工作台状态并回退到登录界面。
- 更新 `frontend-admin/src/api/client.test.ts` 与 `frontend-admin/src/views/AdminWorkspaceView.test.ts`，先用 RED 复现“后台令牌过期后不会自动刷新重放”和“后台启动时 refresh 失败不会退回登录”的问题，再转 GREEN 锁定回归。
- 同步更新 `docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，把 `API-011` 推进到“前后台共享会话刷新骨架均已起步”的最新状态。

### 验证结果

- RED：`npm --workspace frontend-admin run test -- src/api/client.test.ts`
- RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN：`npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/api/graphs.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`

### 后续影响

- `API-011` 现在不再只停留在用户端；前后台都已开始复用同一套 refresh/replay 基线，后续新后台请求边界不需要再从头散落会话刷新逻辑。
- 这一轮仍然只是管理端第一段接线：会话失效原因记录、统一 fail-logout 提示语义、更多后台模块 API 拆分与 HttpOnly Refresh Token 迁移说明仍未完成，后续应继续沿 `API-011 / ADM-010` 收口，而不是回到单页工作台里叠加局部 helper。

## 2026-07-09 04:40:56 +08:00 | v1.1.0-alpha.118 | 推进 API-011 用户端共享会话刷新起步
### 任务内容

- 在 `API-010` 已完成共享 request/error/auth-header、query/pagination 参数拼接与 JSON 请求体归一化起步的基础上，继续沿 `API-011` 选择一个覆盖面广但风险可控的最小工作包。
- 本轮目标是把 Access Token 过期后的 refresh/replay/fail-logout 骨架先沉到共享层，并至少接通用户端一条真实受保护请求路径，而不是继续在业务 API 文件里散落本地 401 处理。

### 实际变更

- 更新 `packages/api-client/src/index.ts`，新增 `ApiRequestError` 与 `createSessionRequest(...)`，让共享请求层开始承接 401 单次 refresh/replay、并发 refresh 去重，以及 refresh 失败时清理本地 session 的最小生命周期。
- 更新 `packages/api-client/src/index.test.ts`，先以 RED 锁定“两个并发受保护请求在 Access Token 过期后只触发一次 refresh，并在新 token 下共同重放”的行为，再转 GREEN。
- 新增 `frontend-user/src/app/sessionStore.ts`，把用户端 session 持久化收口为可订阅存储；`frontend-user/src/app/routes.tsx` 改为通过 `useSyncExternalStore(...)` 订阅 session，保证 refresh 成功或失败后，路由态能跟随最新持久化状态更新。
- 更新 `frontend-user/src/api/core.ts`，统一通过共享 `createSessionRequest(...)` 与 `/api/v1/auth/refresh` 刷新 Access Token；`withAuth(...)` 也会优先消费最新持久化 session，避免旧页面 props 把 stale token 再次写回请求头。
- 新增 `frontend-user/src/api/sessionRefresh.test.ts` 的 RED/GREEN 闭环，复现图谱列表在 401 后不会自动恢复的问题，并锁定 refresh 成功后更新本地 session、再重放原请求的用户端路径。
- 同步更新 `docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，把 `API-011` 从纯待办推进到“用户端共享刷新骨架已起步”的最新状态。

### 验证结果

- RED：`npx vitest run packages/api-client/src/index.test.ts`
- RED：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
- GREEN：`npx vitest run packages/api-client/src/index.test.ts`
- GREEN：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/sessionRefresh.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`

### 后续影响

- `packages/api-client` 现在不只统一 request/error/query/JSON body，也开始统一用户端的 401 refresh/replay 语义；后续新的受保护请求路径不需要再在业务 API 模块里重复补本地刷新逻辑。
- 这一轮仍只完成了 API-011 的用户端第一段骨架，`frontend-admin` 还没有接入同一套 refresh/replay/fail-logout，会话失效原因记录与 HttpOnly Refresh Token 迁移说明也尚未补齐；后续仍应继续沿 `API-011` 收口，而不是回到各端局部拼装会话生命周期。

## 2026-07-09 04:24:00 +08:00 | v1.1.0-alpha.117 | 推进 API-010 共享 JSON 请求体编码起步
### 任务内容

- 在 `API-010` 已完成共享 request/error/auth-header、管理端请求边界抽离与 query/pagination 参数拼接起步的基础上，继续选择一个范围小但覆盖面广的共享层收口点。
- 本轮目标是把 plain object / array 的 JSON 请求体编码从前后台各个 API 调用点收回到 `packages/api-client`，避免继续在业务 API 文件里散落 `JSON.stringify(...)`。
### 实际变更

- 更新 `packages/api-client/src/index.ts`，新增 `ApiRequestInit`、JSON/body 归一化逻辑与类型守卫，让 `requestApi(...)` 可直接接收 plain object / array，并统一序列化为 JSON；同时继续保留 `FormData`、`Blob`、`URLSearchParams`、`ArrayBuffer` 等原生 body 的直通能力。
- 更新 `packages/api-client/src/index.test.ts`，把共享请求层测试改为直接传对象请求体，锁定“共享层负责 JSON 序列化并补齐 `Content-Type`”的新边界。
- 更新 `frontend-user/src/api/core.ts`，把用户端基础 request 入参类型切到共享 `ApiRequestInit`，让业务域 API 可以直接把对象请求体交给共享层。
- 更新 `frontend-user/src/api/auth.ts`、`community.ts`、`graphs.ts`、`materials.ts`、`notes.ts`、`reader.ts`、`review.ts` 与 `share.ts`，移除各自手写的 `JSON.stringify(...)`，统一改为直接传对象或数组。
- 更新 `frontend-admin/src/api/client.ts` 与 `frontend-admin/src/views/AdminWorkspaceView.vue`，让管理端 `adminPost(...)` 与页面内 `post(...)` 包装函数直接复用共享层的 JSON 请求体约定。
- 同步更新 `docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，把 `API-010` 推进到“共享层已开始承接 JSON 请求体编码”的最新状态。
### 验证结果

- `npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/reader.test.ts src/api/reviewAi.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 后续影响

- `API-010` 现在不仅统一了 request/error/auth-header 与 query/pagination 参数拼接，也开始统一 JSON 请求体编码；后续新增前后台 API 时，不需要再从各端业务文件里重复写序列化细节。
- 这一轮仍然只是“JSON 请求体编码起步”，还没有形成完整的分页响应 DTO、上传语义矩阵、401 refresh/replay/fail-logout 与统一会话失效处理，后续仍应继续沿 `API-010 / API-011` 推进。

## 2026-07-09 04:15:00 +08:00 | v1.1.0-alpha.116 | 推进 API-010 共享 query 与分页参数拼接起步
### 任务内容

- 在 `API-010` 已完成共享 request/error/auth-header 起步和管理端请求边界抽离的基础上，继续选择最小但能扩大共享层覆盖面的下一步。
- 本轮目标是把查询参数与分页参数拼接从页面和单个 API 文件中抽到 `packages/api-client`，让用户端搜索和管理端治理列表开始共享同一套 query 语义。
### 实际变更

- 更新 `packages/api-client/src/index.ts`，新增 `buildApiPath(...)`，统一处理已有 query、数组 filters、`limit` 等参数拼接，并跳过 `null` / `undefined` / 空数组。
- 更新 `packages/api-client/src/index.test.ts`，补齐共享 query helper 的 RED/GREEN 覆盖，锁定“数组按逗号拼接、已有 query 被保留、空值被忽略”的行为。
- 更新 `frontend-user/src/api/search.ts`，让搜索请求的 `q`、`types`、`limit` 改为通过 `buildApiPath(...)` 生成，不再本地维护 `URLSearchParams`。
- 更新 `frontend-admin/src/api/client.ts` 与 `frontend-admin/src/views/AdminWorkspaceView.vue`，让管理端治理列表的 `limit=20` 改为通过共享 helper 生成，而不是把 `?limit=20` 写死在页面配置里。
- 同步更新 `docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，把“query/pagination 参数拼接已开始统一”写回执行基线。
### 验证结果

- `npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-user run test -- src/api/searchShare.test.ts`
- `npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`

### 后续影响

- `API-010` 现在不只统一了 request/error/auth-header，也开始统一 query/pagination 的参数拼接；后续补真正的分页 DTO 或 cursor 语义时，不需要再回到各端从头手写 query 组装。
- 这一轮仍然只是“参数拼接起步”，还没有形成完整的分页响应契约、分页元数据类型或 401 会话重放能力，后续仍应继续沿 `API-010 / API-011` 推进。

## 2026-07-09 04:11:00 +08:00 | v1.1.0-alpha.115 | 推进 API-010 管理端共享请求边界出壳
### 任务内容

- 在 `API-010` 已完成共享 request/error/auth-header 起步的基础上，继续按最小工作包收口管理端页面分层，避免 `AdminWorkspaceView.vue` 继续持有本地请求 helper。
- 本轮目标不是扩展新后台模块，而是把已存在的后台 `get/post` 请求边界抽到独立 API 文件，并用测试把这层共享接线锁住。
### 实际变更

- 新增 `frontend-admin/src/api/client.ts`，导出 `adminGet(...)` 与 `adminPost(...)`，统一通过 `@studymate/api-client` 的 `requestApi(...)` / `createAuthHeaders(...)` 发起后台请求。
- 新增 `frontend-admin/src/api/client.test.ts`，先以 RED 锁定“管理端共享 API 模块必须存在”，再在 GREEN 阶段锁定 Bearer header 与 JSON POST body 都由共享 client 负责。
- 更新 `frontend-admin/src/views/AdminWorkspaceView.vue`，移除页面内本地 `get/post` 请求拼装逻辑，改为消费 `../api/client`，让视图层回到更纯粹的工作台组合角色。
- 同步更新 `docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，把“管理端请求边界已开始抽离”写回执行基线。
### 验证结果

- RED：`npm --workspace frontend-admin run test -- src/api/client.test.ts`
- GREEN：`npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 后续影响

- 管理端后续继续拆 `ADM-010 / API-010` 时，已经有了可复用的共享请求入口，不需要再把最基础的 header、body 和 request helper 散落回页面。
- 这一轮仍只完成了最小 request 边界出壳；后台更多模块 DTO、分页语义和会话生命周期还没有真正独立出来，后续仍应继续沿 `API-010 / API-011 / ADM-010` 收口。

## 2026-07-09 04:06:00 +08:00 | v1.1.0-alpha.114 | 推进 API-010 共享请求基础层起步
### 任务内容

- 按 `CODEX_MASTER_PROMPT.md` 与当前 `CODEX_BACKLOG.md` 的优先级，继续选择依赖已满足且范围最小的 `API-010` 工作包，而不是切去新增业务域。
- 本轮目标是在不重写前后台会话逻辑的前提下，让 `packages/api-client` 先承接最小共享请求层：统一 success/error envelope 解析、Bearer header 拼装与基础 request helper，并接线到用户端和管理端。
### 实际变更

- 更新 `packages/api-client/src/index.ts`，新增 `ApiSuccessPayload` / `ApiErrorPayload`、`readApiResponse(...)`、`requestApi(...)` 与 `createAuthHeaders(...)`，并让 `getHealth(...)` 复用同一套共享请求入口。
- 新增 `packages/api-client/src/index.test.ts`，先以 RED 锁定“鉴权 header 只在有 token 时注入、JSON envelope 会被正确解包、`FormData` 上传不会被强塞 `Content-Type`、API 错误会抛出 message”，再转 GREEN。
- 更新 `frontend-user/src/api/core.ts`，把用户端基础 request 与 auth header 拼装切到 `@studymate/api-client`；更新 `frontend-user/src/api/types.ts`，移除本地重复的 success/error envelope 类型。
- 更新 `frontend-admin/src/views/AdminWorkspaceView.vue`，让后台工作台的 `get(...)` / `post(...)` 改为通过共享 `requestApi(...)` 与 `createAuthHeaders(...)` 请求后台，并移除不再使用的本地响应解析 helper。
- 更新 `frontend-user/package.json`、`frontend-admin/package.json` 与 `package-lock.json`，显式声明 `@studymate/api-client` workspace 依赖，避免共享接线只依赖根环境偶然解析成功。
- 同步更新 `docs/engineering/CODEX_PROJECT_CONTEXT.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `API-010` 从纯待办推进到“共享请求基础层已起步”。
### 验证结果

- RED：`npx vitest run packages/api-client/src/index.test.ts`
- GREEN：`npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`

### 后续影响

- `@studymate/api-client` 不再只是健康检查占位包，后续新页面至少可以沿着共享 request/error/auth-header 层继续扩展，而不用再从页面里重写最基础的 fetch 分支。
- 这一轮仍只完成了共享请求基础层起步；分页、更多上传路径、401 refresh/replay/fail-logout 与统一会话失效处理仍未收口，下一步应继续沿 `API-010 / API-011` 推进，而不是重新在各端散落新的本地 helper。

## 2026-07-09 03:53:30 +08:00 | v1.1.0-alpha.113 | 推进 FE-040 管理端接入共享设计 token 起步
### 任务内容

- 延续快速原型阶段“先把全局骨架收起来”的方向，继续沿 `FE-040` 收口前后台的共享视觉源头，而不是回到单点功能深挖。
- 本轮目标是在不重写后台工作台结构的前提下，让 `frontend-admin` 也接入 `@studymate/ui/tokens.css`，把管理端最基础的背景、文本、描边和 accent 语义先对齐到共享 token。
### 实际变更

- 更新 `frontend-admin/src/main.ts`，新增 `@studymate/ui/tokens.css` 导入，让管理端主入口与用户端共用同一份根 token 样式来源。
- 更新 `frontend-admin/src/components/admin/admin.css`，移除本地 `:root` token bootstrapping，并把 `--admin-bg`、`--admin-surface`、`--admin-surface-soft`、`--admin-line`、`--admin-text`、`--admin-text-soft`、`--admin-text-muted`、`--admin-accent`、`--admin-accent-strong`、`--admin-accent-soft`、`--admin-danger` 映射到共享 token。
- 更新 `frontend-admin/package.json` 与 `package-lock.json`，显式声明 `@studymate/ui` workspace 依赖和 `@types/node` 测试类型依赖，避免这条接线只依赖根环境偶然可用。
- 新增 `frontend-admin/src/tokenSource.test.ts`，先以 RED 锁定“管理端主入口必须导入共享 token、admin 基础变量必须引用共享 token、本地根 token 引导块必须移除”，再转 GREEN。
- 同步更新 `docs/engineering/CODEX_PROJECT_CONTEXT.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 FE-040 从“只有用户端接线”推进到“前后台入口都已接入共享 token”。
### 验证结果

- RED：`npx vitest run frontend-admin/src/tokenSource.test.ts`
- GREEN：`npx vitest run frontend-admin/src/tokenSource.test.ts`
- `npm --workspace frontend-admin run test`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 后续影响

- 前后台现在至少已经开始共享同一份设计 token 源头，后续继续统一按钮、输入框、状态卡片和抽屉/检查器的视觉契约时，不需要再各自从头定义背景、边线和文字层级。
- 这一轮仍只完成了管理端基础壳层变量的共享接入，后台局部硬编码颜色、更多 primitives 以及共享 API/client 契约都还没有进一步收口；这些仍然是 `FE-040 / FE-041 / API-010` 接下来最值得继续推进的方向。

## 2026-07-09 03:46:30 +08:00 | v1.1.0-alpha.112 | 推进 FE-040 共享设计 token 单一来源起步
### 任务内容

- 延续新的快速原型方向，继续围绕 `FE-040` 做“先把全局骨架收起来”的小步推进，而不是回到单一冲突子场景深挖。
- 本轮目标是在不大改现有页面结构的前提下，把用户端当前生效的 UI-04 根 token 从页面样式里抽出到共享包，建立最小可复用的单一来源。
### 实际变更

- 新增 `packages/ui/src/tokens.css`，沉淀用户端当前生效的 `--bg-*`、`--surface*`、`--accent*`、`--radius-*`、`--sidebar-width`、`--panel-blur` 等根 token，并在 `packages/ui/package.json` 暴露 `./tokens.css` 导出入口。
- 更新 `frontend-user/src/styles.css`，先导入 `@studymate/ui/tokens.css`，让用户端样式入口显式接入共享 token 层。
- 更新 `frontend-user/src/styles/app.css` 与 `frontend-user/src/styles/ui-redesign.css`，移除重复的 `:root` token 定义，避免同名变量继续依赖样式加载顺序覆盖。
- 新增 `packages/ui/src/tokens.test.ts` 与 `frontend-user/src/styles/tokenSource.test.ts`，锁定共享 token 文件存在、用户端入口已接线，以及本地样式文件不再重复声明核心 token。
- 为了让前端测试在类型检查与构建链上可编译，补充 `frontend-user/src/vite-env.d.ts` 与 `frontend-user` 的 `@types/node` 开发依赖，把 Node 文件读取能力显式限定到前端测试环境。
- 同步更新 `docs/engineering/CODEX_PROJECT_CONTEXT.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 FE-040 从“重复 token 待收口”推进到“共享 token 已起步落地”。
### 验证结果

- RED：`npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
- GREEN：`npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`

### 后续影响

- `packages/ui` 现在不只承接共享页面状态语义，也开始承接共享视觉 token，后续继续让管理端和更多 primitives 接这层共享来源的成本明显更低。
- 这一轮仍只完成了用户端的共享 token 接线，管理端尚未接入，`@studymate/ui` 也还没有形成更完整的基础组件契约；这些仍然是 `FE-040 / FE-041` 下一步最值得继续推进的方向。

## 2026-07-09 03:34:30 +08:00 | v1.1.0-alpha.111 | 推进 FE-040 FE-041 共享页面状态契约起步
### 任务内容

- 按新的快速原型方向，从继续深挖 `WB-032` 切到更偏全局骨架补齐的工作包，优先启动 `FE-040 / FE-041`。
- 本轮目标是在不重写现有页面的前提下，先让 `@studymate/ui` 真正承接一层最小可复用的页面状态语义契约，并让用户端现有 `DataState` 直接消费它。
### 实际变更

- 新增 `packages/ui/src/dataState.ts`，导出共享 `dataStateKinds`、`DataStateKind` 与 `getDataStateLabel(...)`，先统一 Loading / Empty / Error / Unauthorized / Stale / Conflict 六类页面状态语义。
- 更新 `packages/ui/src/index.ts` 与 `packages/ui/src/index.test.ts`，让 `@studymate/ui` 从“只导出包名”的占位包升级为带最小测试的共享契约入口。
- 更新 `frontend-user/src/design-system/primitives/DataState.tsx`，移除本地状态文案分支，改为直接调用 `@studymate/ui` 的共享 label helper。
- 更新 `frontend-user/src/design-system/primitives/index.ts` 与 `frontend-user/package.json`，显式透出共享 `DataStateKind` 并声明 `@studymate/ui` workspace 依赖。
- 更新 `frontend-user/src/design-system/primitives/DataState.test.tsx`，补齐 `conflict` 状态回归，确认用户端组件已经消费共享语义而不是继续本地分叉。
- 同步更新 `docs/engineering/CODEX_PROJECT_CONTEXT.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `FE-040 / FE-041` 从规划态推进到已启动的共享状态契约骨架。
### 验证结果

- RED：`npx vitest run packages/ui/src/index.test.ts frontend-user/src/design-system/primitives/DataState.test.tsx`
- GREEN：`npx vitest run packages/ui/src/index.test.ts`
- GREEN：`npm --workspace frontend-user run test -- src/design-system/primitives/DataState.test.tsx`

### 后续影响

- `@studymate/ui` 现在至少已经承接了一层真实共享契约，后续可以沿着同一路径继续吸收 token、`Drawer`、`Inspector` 等基础 primitives，而不必再从页面里零散复制状态语义。
- 这一轮还没有处理 `app.css` 与 `ui-redesign.css` 的 token 漂移，也没有让管理端开始消费这层共享契约；这些仍然是 `FE-040 / FE-041` 后续更有价值的下一步。

## 2026-07-09 03:25:42 +08:00 | v1.1.0-alpha.110 | 推进 WB-032 阻断明细标题可读化子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“阻断摘要可读化”再补齐到阻断明细列表层。
- 本轮目标是在图谱 Inspector 的“取舍依赖校验问题”区块里，不再让每条问题标题停留在 `edge-local` 这类内部 ID，而是直接显示类似“连线“Local edge””的可读对象名。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictResolutionBlockingIssueTitle(...)`，优先从阻断 message 中提取 `节点 / 连线 / 分组` 的可读对象名；提取不到时才回退到 `targetId` 或 `ruleType`。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，让“取舍依赖校验问题”明细列表复用这层标题 helper，而不是直接渲染 `targetId`。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，先用 RED 锁定“明细标题应展示可读对象名”，再验证组件级与页面级路径均已转绿。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，把 `WB-032` 当前边界推进到“阻断摘要与阻断明细标题都展示可读对象名”。

### 验证结果

- RED：`npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- RED：`npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- GREEN：`npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- GREEN：`npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`

### 后续影响

- 冲突卡片现在从摘要到明细标题都尽量避免暴露内部对象 ID，用户在预检和逐条处理之间切换时更容易对上同一个对象。
- 按新的快速原型方向，后续更适合把精力转向全局骨架补齐，而不是继续在单一冲突子场景里深挖。

## 2026-07-09 03:19:49 +08:00 | v1.1.0-alpha.109 | 推进 WB-032 节点级阻断中文化子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“预检阻断可读线索”补齐到节点级阻断类型。
- 本轮目标是让 `invalid_source_target` / `invalid_node_size` 这类节点级冲突的联动取舍建议和阻断 message 都使用中文说明，避免冲突卡片里同一组预检一半中文、一半英文。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，将节点来源不完整、节点尺寸非法两类阻断的 `keep-latest` 建议文案改为中文。
- 同步将 `validateGraphConflictResolutionDrafts(...)` 产出的节点级阻断 message 改为中文，例如“节点“Broken source node”的来源信息不完整，请补齐 source.type/source.id 或改为保留服务端。”
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，先用 RED 锁定英文文案问题，再验证建议文案与阻断 message 均已中文化。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，把 `WB-032` 当前边界推进到“节点级阻断也纳入中文预检语言”。

### 验证结果

- RED：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`

### 后续影响

- 图谱冲突辅助的节点级阻断现在和边/分组依赖阻断使用同一套中文表达，批量建议、预检摘要和明细 message 更一致。
- `WB-032` 仍处于进行中；下一步更值得继续补的是把更多 error 级冲突纳入可执行建议，或开始梳理 `WB-034` 所需的图谱冲突回归矩阵。

## 2026-07-09 03:14:25 +08:00 | v1.1.0-alpha.108 | 推进 WB-032 预检阻断可读线索子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“预检代表对象示例”再补一层阻断可读性。
- 本轮目标是在图谱 Inspector 的阻断摘要、应用前预检和批量联动取舍反馈里，不再只显示 `edge-local` 这类内部对象 ID，而是优先展示“哪个对象因什么原因阻断”的短线索。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，让 `buildGraphConflictResolutionBlockingIssueSummary(...)` 优先使用校验器生成的可读 message，并压缩成首个原因短句；当 message 只是泛化短码时仍回退到 `targetId` 或 `ruleType`。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，用 RED -> GREEN 锁定批量联动反馈、应用前预检和阻断摘要都会展示类似“连线“Local edge”会引用未保留的节点”的对象级短原因。
- 更新 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，锁定真实工作区里“取舍依赖校验问题”会展示可读阻断线索，而不是裸对象 ID。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，把 `WB-032` 当前边界推进到“应用前预检和阻断摘要优先展示可读对象原因”。

### 验证结果

- RED：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN：`npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`

### 后续影响

- 图谱冲突辅助现在能在最终点击前直接指出阻断对象和阻断原因，用户不需要从内部 ID 再反推画布对象。
- `WB-032` 仍处于进行中；下一步更值得继续补的是把更多冲突类型纳入同一套对象级联动取舍策略，并继续准备 `WB-034` 的工作区回归矩阵。

## 2026-07-09 02:05:19 +08:00 | v1.1.0-alpha.107 | 推进 WB-032 预检代表对象示例子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“预检并入未标记默认回退结果”再补充成更完整的合并前预检反馈。
- 本轮目标是在图谱 Inspector 的“应用前预检”里，让用户不只看到取舍数量和未标记对象的默认回退结果，还能直接看到这轮已标记取舍的代表对象示例。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，为 `buildGraphConflictResolutionPreflightMessage(...)` 增加代表对象示例摘要：会按 `保留本地 / 保留服务端 / 稍后处理` 各自抽取代表对象，生成类似“例如保留本地：本地节点，保留服务端：旧关系”的补充说明。
- 保持这层示例摘要继续停留在 helper 内部组装，不把预检格式规则散落到控制器或冲突卡片组件中。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 与 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，补齐 helper 级与页面级回归，锁定“应用前预检会带代表对象示例”的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“应用前预检同时解释数量、代表对象与未标记默认回退结果”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`

### 后续影响

- 图谱冲突辅助现在能在最终点击前，把“数量级结果”和“这轮取舍主要覆盖哪些对象”一起说清楚，进一步降低对象级人工取舍时的预检不确定感。
- `WB-032` 仍处于进行中；下一步更值得继续补的是把这层摘要继续扩展成更完整的对象级合并预检反馈，并覆盖更多冲突类型的联动取舍策略。

## 2026-07-09 02:00:43 +08:00 | v1.1.0-alpha.106 | 推进 WB-032 预检并入未标记默认回退子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“应用前预检摘要”再补完整一层。
- 本轮目标是在图谱 Inspector 的冲突卡片里，让“如果现在应用”不只说明已标记取舍会怎么处理，也直接说明还有哪些未标记对象会默认沿用最新图谱版本。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictResolutionUnmarkedSummary(...)`，把未标记对象的默认回退结果统一压成可复用摘要，并让 `buildGraphConflictResolutionPreflightMessage(...)` 支持把这段结果并入最终预检提示。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，基于当前 `unsavedChangeDetails`、`latestHeadConflictDetails` 与 `conflictResolutionSelections` 计算未标记对象摘要，再把它一并传给现有的 `resolutionPreflightMessage`。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 与 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，补齐 helper 级与页面级回归，锁定“应用前预检会把未标记对象默认沿用最新版本的结果一起说清楚”的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“应用前预检同时解释已标记取舍与未标记默认回退结果”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`

### 后续影响

- 图谱冲突辅助现在能在最终点击前，把“已标记对象会如何合并”和“未标记对象会如何默认回退”同时说清楚，减少用户在对象级取舍场景里的合并不确定感。
- `WB-032` 仍处于进行中；下一步更值得继续补的是把这套预检从摘要扩展到更完整的对象级合并预检反馈，并覆盖更多冲突类型的联动取舍策略。

## 2026-07-09 01:41:18 +08:00 | v1.1.0-alpha.105 | 推进 WB-032 应用前预检摘要子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“最终预检阻断摘要”再往前补成更完整的“如果现在应用会发生什么”预检提示。
- 本轮目标是在图谱 Inspector 的冲突卡片中，让用户在真正点击“应用已标记取舍到当前草稿”前，就能直接看到一条合并前预检摘要：既说明当前计划保留哪些取舍，也说明是否会被依赖问题阻断。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictResolutionPreflightMessage(...)`，统一生成合并前预检摘要：当存在阻断时，会说明“已标记取舍会被 N 个依赖问题阻断（摘要）”；当无阻断时，会说明“如果现在应用：保留本地 X 项 / 保留服务端 Y 项 / 稍后处理 Z 项”。
- 顺手把取舍数量汇总逻辑抽成内部复用的 decision summary，避免结果反馈与预检摘要各自维护一套计数规则。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，基于当前 `conflictResolutionDrafts` 与 `conflictResolutionBlockingIssues` 计算 `resolutionPreflightMessage`，并传给冲突卡片。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，新增“应用前预检”区块，在冲突卡片中直接展示这条预检摘要。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 与 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`，补齐 helper 与组件级回归，锁定“应用前预检”会在卡片中显示的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“冲突卡片会直接展示合并前预检摘要”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不只会给出阻断摘要和批量取舍反馈，还会在真正应用前直接把“如果现在应用会发生什么”提前讲清楚，用户不需要点到最后一步才理解当前取舍的合并结果。
- `WB-032` 仍处于进行中；下一步更值得继续补的是把这层预检继续扩展成更完整的合并预检反馈，并覆盖更多冲突类型的对象联动策略。

## 2026-07-09 01:37:00 +08:00 | v1.1.0-alpha.104 | 推进 WB-032 最终预检阻断摘要子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“阻断差异解释”基础上，把这层摘要继续前移到真正应用取舍前的最终预检卡片里。
- 本轮目标是在图谱 Inspector 的“取舍依赖校验问题”区块中，不只列出明细列表，还先给出一条精简的阻断摘要；同时让最终预检兜底文案也复用同一套摘要，保证冲突卡片和状态提示对用户说的是同一件事。

### 实际变更

- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，在“取舍依赖校验问题”区块顶部新增摘要文案：会先显示 `当前仍阻断：...。请先调整标记后再应用。`
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，让 `applyMarkedConflictResolutions()` 在兜底阻断提示里也复用同一套 `buildGraphConflictResolutionBlockingIssueSummary(...)`，避免最终预检的提示继续停留在只有泛化文案的状态。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，补齐组件级和页面级回归，锁定“阻断摘要会直接显示在最终预检卡片里”的行为。
- 复用并回归 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts` / `.test.ts` 里的阻断摘要 helper，确保摘要格式与上一轮保持一致。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“最终预检卡片与状态兜底共用阻断摘要”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不只会在批量取舍反馈里给出剩余阻断对象摘要，也会在真正应用取舍前的最终预检卡片里先把阻断摘要讲清楚，减少用户在“列表很多但不知道先看哪项”时的判断成本。
- `WB-032` 仍处于进行中；下一步更值得继续补的是把这套摘要继续扩展到最终应用前更完整的合并预检反馈，以及覆盖更多冲突类型的对象联动策略。

## 2026-07-09 01:30:30 +08:00 | v1.1.0-alpha.103 | 推进 WB-032 阻断差异解释子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“批量取舍反馈解释”基础上，把“仍有阻断”这件事继续从只有数量提示推进到“知道还卡在哪些对象上”的更细粒度解释。
- 本轮目标是在图谱 Inspector 的批量联动取舍反馈中，当阻断尚未完全解除时，不只告诉用户“还剩几个依赖问题”，还要给出一段精简的剩余阻断对象摘要，帮助用户快速判断下一步该继续调哪些对象。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictResolutionBlockingIssueSummary(...)`，把剩余阻断对象压缩成可复用的短摘要，默认展示前 2 个 target，并在超出时附带总数。
- 更新 `buildGraphConflictResolutionSuggestionOutcomeMessage(...)`，从只接收阻断数量改为接收完整阻断列表；当阻断仍存在时，反馈文案现在会显式附带类似 `edge-local、group-local 等 3 项` 的对象摘要。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，让批量取舍反馈改为传入“批量标记后的真实剩余阻断列表”，而不是只传数字。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，补齐 helper 级回归，锁定“阻断未解除时会返回对象摘要”的行为；并回归 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx` 与 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`，确保已解除阻断路径不回退。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“批量取舍反馈会指出剩余阻断对象摘要”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不只会告诉用户“还剩几个阻断”，也会在批量联动取舍后给出精简的剩余阻断对象摘要，让下一步调整目标更明确。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更完整的对象联动策略、覆盖更多冲突类型的批量取舍辅助，以及把这种阻断摘要进一步扩展到真正应用取舍前的最终预检反馈。

## 2026-07-09 01:26:28 +08:00 | v1.1.0-alpha.102 | 推进 WB-032 批量取舍反馈解释子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“联动取舍批量应用”基础上，把批量标记后的用户反馈从固定提示继续推进到“带结果摘要和预检结论”的可解释状态。
- 本轮目标是在图谱 Inspector 的冲突卡片中，用户点击 `一键应用 N 项联动取舍建议` 后，不只知道“已经批量标记”，还要立刻知道本次标记包含多少本地/服务端取舍，以及当前是否已经解除依赖阻断、能否继续应用到最新 `head`。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictResolutionSuggestionOutcomeMessage(...)`，统一生成批量联动取舍后的反馈文案：会汇总本次标记中的 `keep-local / keep-latest / review-later` 数量，并根据剩余阻断数量返回“已解除依赖阻断，可继续应用”或“仍有 N 个依赖问题待处理”的预检解释。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，在 `applyConflictResolutionSuggestions()` 中改为基于“批量标记后的下一组 selections”重新计算对象级取舍草稿与依赖校验结果，再使用新 helper 生成反馈，而不是继续使用固定文案。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 与 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，补齐 helper 与页面级回归，锁定“批量标记后会返回带计数摘要的反馈，并在阻断解除时直接提示可以继续应用”的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“批量标记联动建议后会返回带预检结论的结果解释”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不只支持“整组建议批量标记”，还会在批量标记后立即告诉用户这次到底标记了哪些取舍方向，以及当前是否已经解除阻断、可以继续应用，减少用户在冲突态里反复试点按钮的试探成本。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更完整的对象联动策略、覆盖更多冲突类型的批量取舍辅助，以及更细粒度的阻断差异解释。

## 2026-07-08 19:07:41 +08:00 | v1.1.0-alpha.101 | 推进 WB-032 联动取舍批量应用子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“合并结果反馈”和更早的“联动取舍建议”基础上，把冲突处理继续从“单条建议可点击”推进到“整组建议可批量落成取舍标记”。
- 本轮目标是在图谱 Inspector 的冲突卡片中，当同一轮依赖阻断生成多条联动建议时，用户不必逐条点击，而是可以先一键把这组建议批量写入当前对象级取舍，再决定是否继续应用到最新 head。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `applyGraphConflictResolutionSuggestions(...)`，把联动建议批量合并进当前 `resolutionSelections`，复用既有对象级 decision key，避免页面层重复拼装取舍键。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `applyConflictResolutionSuggestions()`：当存在联动建议时，统一批量写入对象级取舍标记、保持 dirty/人工合并态，并返回“已批量标记 N 条联动取舍建议，请继续确认后再应用”的状态反馈。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，在“联动取舍建议”区块新增 `一键应用 N 项联动取舍建议` 按钮，让批量标记动作和逐条建议动作共存。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，补齐 helper、组件与页面级回归，锁定“批量标记建议后可清除依赖阻断并继续应用已标记取舍”的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“联动建议既可逐条点选，也可整组批量标记”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`

### 后续影响

- 图谱冲突辅助现在不只会在阻断发生时给出“该怎么修”的联动建议，也支持先把整组建议批量落成对象级取舍标记，明显减少多条依赖建议场景下的重复点击。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更完整的对象联动策略、覆盖更多冲突类型的批量取舍辅助，以及“批量标记之后再应用”的更清晰结果反馈与预检解释。

## 2026-07-08 18:50:34 +08:00 | v1.1.0-alpha.100 | 推进 WB-032 合并结果反馈子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“节点级冲突建议”基础上，把“应用已标记取舍”后的结果反馈从固定提示继续推进到可解释的合并结果摘要。
- 本轮目标是在图谱 Inspector 的冲突卡片中，用户把对象级取舍应用到最新 head 后，立即知道这次合并草稿里到底保留了多少本地对象、沿用了多少服务端对象，以及多少对象被标记为稍后处理。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictResolutionOutcomeMessage(...)`，把对象级取舍草稿转换为可读的合并结果反馈，覆盖 `keep-local`、`keep-latest` 与 `review-later` 三类决策。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，在 `applyMarkedConflictResolutions()` 成功后改为使用结果摘要文案，而不是固定的“已生成合并草稿”提示。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 与 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，补齐 helper 与页面级回归，锁定“应用取舍后显示带计数的合并结果反馈”。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“对象级取舍应用后会返回可解释的结果摘要”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不只会告诉用户“已经生成合并草稿”，还会直接说明本次合并里保留了多少本地对象、沿用了多少服务端对象，以及是否存在“稍后处理但已沿用最新版本”的对象，降低用户在多端合并后的不确定感。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更完整的对象联动策略，以及覆盖更多冲突类型的批量取舍辅助，让这套多端冲突处理从“单条建议可点击”继续推进到“整组取舍更高效”。

## 2026-07-08 18:45:24 +08:00 | v1.1.0-alpha.99 | 推进 WB-032 节点级冲突建议子步骤
### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“联动取舍建议”基础上，把“只知道哪里错了”继续推进到“节点级错误也知道下一步怎么点”。
- 本轮目标是在图谱 Inspector 的冲突卡片中，当对象级取舍触发 `invalid_source_target` / `invalid_node_size` 阻断时，也直接给出可执行的“保留服务端”建议，避免用户停留在错误说明里自行猜测下一步。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，扩展 `buildGraphConflictResolutionSuggestions(...)`：当本地节点因来源信息不完整或尺寸非法而阻断对象级取舍时，直接生成 `keep-latest` 建议；同时补上更明确的阻断说明文案。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，补齐 `invalid_source_target` / `invalid_node_size` 两类节点级阻断的 helper 回归，锁定“会生成可执行建议”的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“依赖类阻断之外，节点级结构错误也能给出可执行取舍建议”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`

### 后续影响

- 图谱冲突辅助现在不只会为 dangling edge / invalid group node 生成联动建议，也能在节点来源不完整或节点尺寸非法时直接建议“改为保留服务端”，把更多阻断类型转成可执行动作。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更完整的对象联动策略、更清晰的多端合并结果反馈，以及覆盖更多冲突类型的批量取舍辅助。

## 2026-07-08 13:41:12 +08:00 | v1.1.0-alpha.98 | 收口 FE-010 FE-020 FE-030 UI-04 验证
### 任务内容

- 按 `CODEX_MASTER_PROMPT.md` 当前优先级，先不继续扩展新功能，而是把 FE-010、FE-020、FE-030 与 UI-04 从“实现完成待验证”收口到“已在真实依赖环境完成回归”。
- 补齐这批前端验证里最后的脆弱点，确保用户端与管理端 smoke 不再依赖过时页面文案或易碎选择器。

### 实际变更

- 更新 `frontend-admin/src/views/AdminWorkspaceView.vue`，为后台工作台导航按钮补 `aria-label`、`aria-pressed` 和 `data-admin-view`，让用户治理等模块具备稳定的可访问性与自动化定位语义。
- 重写 `frontend-admin/src/views/AdminWorkspaceView.test.ts`，改为通过 `[data-admin-view="users"]` 验证 users 模块加载、`/api/v1/admin/users?limit=20` 请求与 `Authorization: Bearer admin-token` 头部，以及 `alice` 渲染结果。
- 重写 `e2e/user-shell.spec.ts`、`e2e/v1-review-flow.spec.ts`、`e2e/v1-admin-governance.spec.ts`、`e2e/v1-graph-workspace.spec.ts`，让断言与当前壳层、复习工作区、后台治理和图谱 CanvasLayout 交互保持一致，并显式覆盖图谱导入失败、保存状态、历史恢复失败等现状。
- 更新 `docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/FE-00_ACCEPTANCE_CHECKLIST.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md`、`docs/design/UI_04_PRODUCT_REDESIGN.md` 与 `CHANGELOG.md`，把 FE/UI 真实验证收口写回长期文档。

### 验证结果

- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-admin run typecheck` 通过。
- `npm --workspace frontend-user run test -- src/app/layouts/layoutPolicy.test.ts src/app/layouts/AppShell.test.tsx src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx` 通过，9 个文件共 28 条测试通过。
- `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts` 先因旧选择器失效进入 RED，补稳定语义与测试后 GREEN 通过。
- `npm run build:user` 通过。
- `npm run build:admin` 通过。
- `npx playwright test e2e/user-shell.spec.ts e2e/v1-graph-workspace.spec.ts e2e/v1-review-flow.spec.ts e2e/v1-admin-governance.spec.ts` 通过，4 条 smoke 全部通过。

### 后续影响

- FE-010、FE-020、FE-030 与 UI-04 现在不再依赖“之后有完整 npm 依赖时再验证”的口头前提，后续可以把注意力集中回 `WB-032` 的冲突处理深化与 `WB-034` 的图谱回归矩阵。
- 这轮主要收口的是真实验证债务，不代表多分辨率截图、视觉对照归档或更大范围全量 E2E 已全部完成；这些仍适合作为后续独立质量工作包推进。
## 2026-07-08 12:54:17 +08:00 | v1.1.0-alpha.97 | 推进 WB-032 联动取舍建议子步骤

### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“未标记对象提示”基础上，把依赖阻断从“只告诉用户哪里错了”继续推进到“告诉用户下一步可以怎么点”。
- 本轮目标是在图谱 Inspector 的冲突卡片中，当对象级取舍触发 `dangling_edge` / `invalid_group_node` 阻断时，直接给出可点击的联动取舍建议，帮助用户补齐依赖或改回保留服务端。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictResolutionSuggestions(...)`：会根据阻断问题、当前图谱文档、对象级差异明细和已选取舍，自动生成“联动保留本地依赖节点”或“改为保留服务端”的建议。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `conflictResolutionSuggestions` 计算并传入冲突卡片；查找面同时覆盖本地差异和 latest-head 差异，避免恢复草稿场景下的联动建议漏掉对象。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，在“取舍依赖校验问题”后追加“联动取舍建议”区块，允许用户直接点击快捷动作，把建议转成正式的对象级取舍标记。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`，补齐 helper、组件与页面级回归，锁定“阻断出现时有建议、点击建议后阻断可解除”的行为。
- 同步更新 `CHANGELOG.md`、`docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“对象级依赖阻断旁可直接补齐联动取舍”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不只会在对象级取舍无效时阻断应用，还能直接把“该补哪些节点”或“该把哪个对象改回服务端”转成可点击动作，减少用户在冲突列表和依赖关系之间来回切换。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更系统的多端 conflict handling，例如更完整的对象联动策略、更多冲突类型的可执行建议，以及更清晰的多端合并结果反馈。

## 2026-07-08 12:33:39 +08:00 | v1.1.0-alpha.96 | 推进 WB-032 未标记对象提示子步骤

### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“对象级取舍依赖校验”基础上，把“部分对象已标记、部分对象尚未标记”这一真实高频场景解释清楚。
- 本轮目标是在图谱 Inspector 的冲突卡片中，明确提示还有多少对象尚未标记取舍，并告诉用户如果现在直接应用，这些对象会默认沿用最新图谱版本，而不是静默保留本地草稿。

### 实际变更

- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，新增未标记对象统计与提示区块：冲突卡片会汇总当前仍未标记的本地/最新 head 对象，展示数量、列出代表项，并明确说明直接应用时的默认行为。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，把人工合并清单中的对象级取舍说明改为显式声明“未标记项如果直接应用，会默认沿用最新图谱版本”，让页面提示、Markdown 摘要和冲突处理包保持一致。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`、`frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 与 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，补齐组件级、页面级与导出物级回归，锁定未标记对象数量提示和默认行为文案。
- 同步更新 `CHANGELOG.md`、`docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“对象级取舍默认行为可见”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不仅能阻断明显错误的对象级合并，还能把“未标记对象会怎么处理”提前讲清楚，减少用户误以为未标记项会保留本地的风险。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更完整的跨对象联动取舍辅助，以及更系统的多端 conflict handling。

## 2026-07-08 02:50:42 +08:00 | v1.1.0-alpha.95 | 推进 WB-032 对象级取舍依赖校验子步骤

### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在上一轮“对象级取舍可显式应用”为基础上，补上真正能防止错误合并草稿落地的最小依赖校验。
- 本轮目标是在图谱 Inspector 的冲突卡片中，当用户只保留了依赖缺失的本地连线或分组时，能够在应用前直接阻断，并明确告诉用户还缺哪些跨对象依赖。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `validateGraphConflictResolutionDrafts(...)`：在把对象级取舍草稿 rebased 到最新 head 后，复用 `@studymate/graph-core` 校验 dangling edge / invalid group node 等结构错误，并过滤掉最新 head 本身已存在的问题。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，在 `applyMarkedConflictResolutions()` 前接入依赖校验；若当前取舍会留下跨对象依赖问题，则保持冲突态、阻断应用并给出明确状态提示。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，在冲突辅助卡片中新增“取舍依赖校验问题”区块，列出阻断问题，并在存在问题时禁用 `应用已标记取舍到当前草稿`。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`、`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，补齐 helper、组件与页面级回归，锁定“依赖缺失时阻断应用、显示问题说明、既有冲突路径仍可继续工作”的行为。
- 同步更新 `CHANGELOG.md`、`docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“对象级取舍可显式应用，且带最小跨对象依赖校验”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在不会再把明显不完整的对象级取舍直接落成可保存草稿；用户如果只保留了依赖缺失的本地连线或分组，会在应用前就被拦下并得到具体说明。
- `WB-032` 仍处于进行中；下一步更值得继续补的是未标记对象的更强提示、更完整的跨对象联动取舍辅助，以及更系统的多端 conflict handling。

## 2026-07-07 21:27:40 +08:00 | v1.1.0-alpha.94 | 推进 WB-032 对象级取舍显式应用子步骤

### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“对象级冲突取舍草稿”继续推进为真正可执行的本地合并动作。
- 本轮目标是在图谱 Inspector 的冲突卡片中允许用户将已标记的 `保留本地 / 保留服务端 / 稍后处理` 草稿显式应用到最新 head 之上，生成一份仍保持 dirty、但已经对齐最新版本号的可保存合并草稿。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `applyGraphConflictResolutionDrafts(...)` 纯函数：以最新图谱 head 为版本基线，保留当前本地标题/说明/视口，并把已标记为 `保留本地` 的节点、连线、分组对象覆盖回合并草稿。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `applyMarkedConflictResolutions()`：显式应用对象级取舍后，会把工作区切到 rebased draft、将基线推进到最新 head、清理冲突态并保持草稿可继续保存。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，在冲突辅助卡片中新增 `应用已标记取舍到当前草稿` 动作按钮，仅在已拿到最新 head 且至少存在一条取舍草稿时可用。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，补齐纯函数、卡片动作与“冲突后应用取舍再保存”的页面级回归。
- 同步更新 `CHANGELOG.md`、`docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“对象级取舍草稿可显式应用生成合并草稿”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在已经不只会记录对象级取舍意图，还能把这些取舍显式应用到最新 head 上，生成一份可继续保存的合并草稿，避免用户只能导出材料后回到外部手工整理。
- `WB-032` 仍处于进行中；下一步更值得继续补的是未标记对象的更强提示、跨对象依赖的冲突校验，以及更完整的多端自动/半自动合并策略。

## 2026-07-07 21:13:40 +08:00 | v1.1.0-alpha.93 | 推进 WB-032 对象级冲突取舍草稿子步骤

### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把上一轮“对象级冲突明细”继续推进为可操作的人工合并前置草稿。
- 本轮目标是在图谱 Inspector 的冲突卡片中允许用户对节点 / 连线 / 分组级对象先标记“保留本地 / 保留服务端 / 稍后处理”，并把这些取舍草稿带入冲突摘要与冲突处理包。

### 实际变更

- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增对象级取舍草稿模型、决策 key、`resolutionDraft` 导出字段，以及冲突摘要中的“当前人工取舍草稿”段落。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `conflictResolutionSelections` 状态和 `handleConflictResolutionChoice(...)` 交互；对象级取舍一旦标记，会给出显式状态提示并进入冲突摘要 / 处理包导出链路。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，为每条对象级冲突明细补上 `保留本地 / 保留服务端 / 稍后处理` 按钮，并显示当前选择状态。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，补齐对象级取舍草稿在 helper、组件和页面级冲突流中的回归。
- 同步更新 `CHANGELOG.md`、`docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“对象级明细 + 对象级取舍草稿”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在已经不只会列出对象，还能提前记录对象级保留 / 舍弃意图，为真正的节点级 / 边级人工合并流程提供了第一层状态模型。
- `WB-032` 仍处于进行中；下一步更值得继续补的是基于这些对象级取舍草稿的显式应用流程，以及更强的多端 conflict handling。

## 2026-07-07 21:02:14 +08:00 | v1.1.0-alpha.92 | 推进 WB-032 对象级冲突明细子步骤

### 任务内容

- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把已有的“摘要级冲突提示 + 人工合并清单”继续下沉一层。
- 本轮目标是在新图谱 Inspector 的冲突卡片、Markdown 冲突摘要和冲突处理包里，统一补上节点 / 连线 / 分组级的对象明细，让后续人工合并不再只依赖总量和对象名摘要。

### 实际变更

- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `unsavedChangeDetails` 与 `latestHeadConflictDetails` 计算，并把对象级差异同时接入冲突卡片、冲突摘要导出和冲突处理包导出链路。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，让冲突辅助卡片新增“建议优先核对的对象”区块，按统一格式展示 `节点｜新增｜...`、`连线｜删除｜...`、`分组｜修改｜...` 等对象级明细。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，补齐对象级差异明细在摘要、处理包、组件和页面级冲突路径中的回归断言。
- 同步更新 `CHANGELOG.md`、`docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，把 `WB-032` 当前边界推进到“摘要 + 清单 + 对象级冲突明细”。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 后续影响

- 图谱冲突辅助现在已经不只会告诉用户“改了多少、该怎么合并”，还会把真正需要优先核对的节点 / 连线 / 分组对象直接列出来，为下一步对象级保留 / 放弃取舍动作打底。
- `WB-032` 仍处于进行中；下一步更值得继续补的是对象级冲突明细上的显式保留 / 舍弃操作，以及更强的多端 conflict handling。

## 2026-07-07 20:45:47 +08:00 | v1.1.0-alpha.91 | 推进 WB-032 人工合并清单子步骤

### 任务内容

- 继续收口图谱冲突辅助导出物，让“冲突摘要”和“冲突处理包”都能直接给出可执行的人工合并清单，而不只停留在差异罗列。

### 实际变更

- 重写 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，恢复干净的冲突摘要实现，并为 Markdown 冲突摘要新增“建议的人工合并步骤”段落。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，补齐人工合并清单在摘要与处理包中的导出断言。
- 顺手把 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 中已漂移的按钮文案断言改为更稳的语义匹配，避免“保存修改 / 重载最新图谱”文案变化导致图谱回归误报。

### 验证结果

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm run verify:docs`

## 2026-07-02 10:00 | v1.1.0-alpha.90 | 前端 FE-03：阅读、笔记、复习工作区体验对齐

### 任务内容

- 在 FE-01 多布局壳层和 FE-02 图谱 CanvasLayout 的基础上，重构阅读、笔记与复习页面的空间结构与信息分层。
- 保持现有资料、批注、笔记、版本、卡片、复习和 AI 草稿接口及数据契约不变。

### 实际变更

- 阅读器升级为 Studio 工作区：资料资源区、阅读主舞台和批注 / 书签 / 草稿 Inspector 支持按需展开。
- 笔记页升级为 Studio 工作区：笔记资源区、富文本编辑器和来源 / 历史 / 复习 Inspector 分离。
- 复习页升级为 Focus 工作区：单任务卡片舞台、键盘翻面与评分、复习进度、按需卡组管理。
- 新增 `frontend-user/src/styles/studio-workspaces.css` 与阅读、笔记、复习页面回归测试。
- 补充 FE-03 交付说明、前端布局设计文档、待办状态与变更记录。

### 验证结果

- 已完成修改 TS/TSX 文件的 TypeScript 语法转译、文档同步、空白字符与交付包完整性检查。
- 当前执行环境缺少完整 npm 依赖缓存，类型检查、Vitest、Vite 构建和 Playwright 待在本机或 CI 执行。

### 后续影响

- 后续 WB-032 的节点级 / 边级人工冲突合并界面将接入新的图谱 Inspector，不再向旧三栏工作区堆叠卡片。

---

﻿
# StudyMate 项目记录

## 2026-07-02 16:41:18 +08:00 | v1.1.0-alpha.89 | 启动前端布局重构 FE-00 / FE-01
### 任务内容
- 基于 `master@7b1e8f3a1e77dded69538d075758dc9529b31564`，先处理实际运行中“图谱画布被通用三栏壳层挤压、前端内容承载落后后端能力”的问题。
- 不触碰图谱 document、版本、快照、来源 relation、导入导出和 `409 graph_version_conflict` 契约，先建立可承接后续图谱重构的前端布局基础。
### 完成结果
- 新增 FE-00 前端能力矩阵、布局重构规格和验收清单，明确 Standard / Studio / Canvas / Focus 四类工作模式及图谱重构断点。
- 新增 `frontend-user/src/app/layouts/AppShell.tsx` 与 `layoutPolicy.ts`；`ShellFrame` 已降为路由兼容层。
- 图谱改用 Canvas 模式、阅读/笔记改用 Studio 模式、复习改用 Focus 模式；Canvas / Focus 不再渲染通用 `ContextPanel`，图谱先收回全局右侧栏空间。
- 新增 `PrimaryNavigation`、`CompactNavigation`、`CommandBar`、`Drawer`、`Inspector`、`DataState` 及相应的布局 / 组件最小回归测试。
- 新增 `styles/layouts.css`，将新的布局变体与基础构件样式从既有全局样式中隔离，为 FE-020 图谱 Drawer / Inspector 重构预留边界。
### 验证结果
- 已运行 `git diff --check`，未发现空白错误；并使用全局 TypeScript 编译器进行新增 TS / TSX 文件语法转译检查。
- 当前沙箱中 `npm ci` 因 npm 镜像 DNS `EAI_AGAIN` 未完成，尚未能运行用户端 `typecheck`、Vitest、构建和 Playwright；需要在正常开发机或具备依赖缓存的 CI 环境复核。
### 后续影响
- 图谱页面不再受全局 336px ContextPanel 的固定挤压，但内部 SourceRail / Inspector 仍是下一步 FE-020 的改造目标。
- 接下来优先将图谱左侧资源区拆为可切换 Drawer，再把节点详情、历史、冲突和 AI 草稿收口进可折叠 Inspector。

> 记录规则：项目主要语言为汉语。每完成一个独立任务，就把完整结果追加到本文档开头。每条记录必须包含时间、项目版本编号、任务内容、完成结果、验证结果和后续影响。

## 2026-07-02 15:10:20 +08:00 | v1.1.0-alpha.88 | 推进 WB-032 延后人工合并状态提示子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把当前冲突辅助从“材料已留存、可以安全重载”再推进一步。
- 本轮目标是在用户决定这次先不重载时，提供显式的“先保留本地，稍后人工合并”入口和状态提示，让“继续保留本地草稿”也成为可见决策，而不是停留在隐含操作。
### 完成结果
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，冲突辅助卡片新增 `先保留本地，稍后人工合并` 动作，并支持 `manualMergeDeferred` 状态展示 `已标记为稍后人工合并，当前继续保留本地草稿`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `manualMergeDeferred` 状态和 `deferManualMergeUntilLater()` 交互；用户显式选择稍后人工合并后，会保留当前 dirty 草稿和冲突辅助卡片，同时给出匹配的状态提示。
- 重写并补强 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`，顺手清理该文件的乱码文案，锁定冲突卡片在“稍后人工合并”路径下的按钮、提示和回调。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，锁定页面级“导出冲突处理包 -> 先保留本地，稍后人工合并 -> 仍可稍后再重载”的完整路径。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 当前边界推进到“安全重载提示 + 延后人工合并提示”并存。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱冲突辅助现在不只是在“放弃本地并重载”这条路径上更明确，也能显式表达“这次先保留本地、稍后人工合并”的决策状态，让冲突处理从单一出口推进到双路径状态化。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更完整的多端 conflict handling、冲突取舍材料组织，以及更强的人工合并辅助。

## 2026-07-02 01:08:10 +08:00 | v1.1.0-alpha.87 | 推进 WB-032 冲突材料留存状态标记子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把冲突处置从“路径更明确”再推进到“状态更明确”。
- 本轮目标是在用户成功复制或导出冲突材料后，显式提示“已留存冲突材料，可安全重载最新图谱”，让用户不用再凭记忆判断自己是否已经留好证据。
### 完成结果
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `conflictArtifactsCaptured` 状态；当复制/导出当前草稿 JSON、冲突摘要、最新图谱 JSON 或冲突处理包成功后，会统一点亮该状态；当冲突态消失时会自动清零。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，冲突辅助卡片现支持 `materialsCaptured`，并在材料已成功留存时显示 `已留存冲突材料，可安全重载最新图谱`。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `GraphWorkspacePage.test.tsx`，锁定材料已留存时的显式提示与页面级行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 当前边界推进到“材料留存 + 留存状态可见 + 处置引导”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱冲突辅助现在不仅告诉用户“怎么处理”，还会在材料已经留存后显式告诉用户“可以安全重载”，让冲突决策从静态说明变成带状态感的流程。
- `WB-032` 仍处于进行中；下一步更值得继续补的是“仅保留本地但暂不重载”的专门引导，或更完整的多端 conflict handling。

## 2026-07-02 01:03:10 +08:00 | v1.1.0-alpha.86 | 推进 WB-032 冲突处置引导子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把当前冲突辅助从“材料准备充分”继续推进到“处置路径更明确”。
- 本轮目标是在冲突卡片里直接告诉用户三类典型决策路径，并把“放弃本地并重载最新图谱”的动作下沉到卡片本身，减少来回寻找入口的成本。
### 完成结果
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，在冲突辅助卡片中新增两条显式引导：
  - `如果确认放弃本地修改：可直接重载最新图谱`
  - `如果打算稍后人工合并：先导出冲突处理包，再重载最新图谱`
- 同文件新增卡片内动作 `放弃本地并重载最新图谱`，让用户在冲突现场就能完成最后一步，而不必再回到状态栏找入口。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，把卡片内动作接到既有 `reloadLatestGraph()` 决策流，保持确认放弃、拉取最新 head、重置历史和状态提示的原有行为一致。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `GraphWorkspacePage.test.tsx`，锁定显式处置文案、卡片内重载按钮和页面级确认流程。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 当前边界推进到“材料留存 + 显式处置引导 + 卡片内重载入口”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱冲突辅助现在已经不只是在同一张卡片里堆动作按钮，而是开始显式表达“放弃本地”和“稍后人工合并”这两条最常见的处置路径，离完整冲突解决流更近一步。
- `WB-032` 仍处于进行中；下一步更值得继续补的是“保留本地后暂不重载”的处置说明、导出后状态标记，或更完整的多端 conflict handling。

## 2026-07-02 00:57:10 +08:00 | v1.1.0-alpha.85 | 推进 WB-032 冲突处理包导出子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把“留存材料”从分散的多个按钮再推进成更接近人工合并的单一导出入口。
- 本轮目标是在 dirty 冲突态下提供 `导出冲突处理包`，把本地草稿 JSON、服务端最新图谱 JSON 和可读冲突摘要一起打包，减少后续人工比对时重新拼材料的成本。
### 完成结果
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictBundleArtifact(...)`，把当前图谱元信息、本地草稿摘要、本地草稿 JSON、最新图谱 JSON 和冲突摘要报告收口为单个 JSON 包。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，当冲突辅助卡片已拿到服务端最新 head 时，额外展示 `导出冲突处理包`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `exportConflictBundle()`，直接基于当前工作区、最新 head 和冲突摘要 artifact 导出单一处理包，并保持冲突建议状态不被清掉。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`GraphWorkspaceStageChrome.test.tsx` 和 `GraphWorkspacePage.test.tsx`，锁定处理包格式、按钮出现条件和页面级状态反馈。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 当前边界推进到“本地草稿 JSON + 最新图谱 JSON + 可读摘要 + 单文件冲突处理包”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱冲突辅助现在不只是在冲突现场给出若干“复制/导出”按钮，而是已经能把后续人工比对最常需要的三类材料收口成一个处理包，明显缩短“先留证据、后做决策”的路径。
- `WB-032` 仍处于进行中；下一步更值得继续补的是明确的“保留本地 / 放弃本地 / 稍后人工合并”处置引导，以及更完整的多端 conflict handling。

## 2026-07-02 00:51:30 +08:00 | v1.1.0-alpha.84 | 推进 WB-032 服务端最新图谱 JSON 留存子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把冲突辅助从“留存本地草稿”和“带走可读摘要”再往前推一步。
- 本轮目标是在 dirty 冲突态下也能一键带走“服务端最新图谱 JSON”，让用户后续做人工比对、外部 diff 或半手工合并时，不必自己重新去抓最新 head。
### 完成结果
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，让冲突辅助卡片在拿到最新 head 后额外提供 `复制最新图谱 JSON` / `导出最新图谱 JSON`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `copyLatestConflictJson()` 与 `exportLatestConflictJson()`，直接基于已拉取的 `latestConflictDetail` 构建 StudyMate JSON，并保持冲突建议状态不被辅助动作清掉。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 与 `GraphWorkspacePage.test.tsx`，锁定最新图谱 JSON 留存按钮的出现条件、交互和状态反馈。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 当前边界推进到“本地草稿 JSON + 可读冲突摘要 + 最新图谱 JSON”三轨留存辅助。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱冲突辅助现在已经可以同时带走“本地草稿 JSON”“服务端最新图谱 JSON”和“人类可读摘要”，这为后续人工比对、外部 diff 和合并取舍提供了更完整的原始材料。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更明确的“保留本地 / 放弃本地 / 稍后人工合并”处置引导，以及更完整的多端 conflict handling。

## 2026-07-02 00:45:30 +08:00 | v1.1.0-alpha.83 | 推进 WB-032 可带走的图谱冲突摘要子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在“关键对象名级冲突摘要”基础上，再补一层真正可带走的冲突取舍信息。
- 本轮目标是不让用户在冲突现场只能复制原始草稿 JSON，而是还能一键复制或导出一份人类可读的“图谱冲突摘要”，方便在重载前同步给自己、同事或后续人工合并流程。
### 完成结果
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，新增 `buildGraphConflictReportArtifact(...)`，把当前图谱标题、版本、当前未保存修改摘要和“与最新图谱相比”的差异摘要组装成可复制/导出的 Markdown 报告。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `copyConflictSummaryReport()` 与 `exportConflictSummaryReport()`，让 dirty 冲突态下可以直接复制或导出人类可读摘要，并保持“建议重载最新图谱”的冲突状态不被辅助动作清掉。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，在冲突辅助卡片里新增 `复制冲突摘要` / `导出冲突摘要` 按钮，把“留存可读取舍信息”和“留存完整 JSON 草稿”拆成两条显式路径。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`、`GraphWorkspaceStageChrome.test.tsx`、`GraphWorkspacePage.test.tsx`，锁定摘要报告格式、按钮交互和页面级状态反馈。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 的当前边界推进到“可读冲突摘要 + 原始草稿 JSON 双轨留存辅助”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱冲突辅助现在不再只提供“完整 JSON 草稿留存”这一条偏工程化的路径，也能直接带走一份摘要化、可沟通的冲突报告，降低用户在重载前做判断和同步上下文的门槛。
- `WB-032` 仍处于进行中；下一步更值得继续补的是围绕“保留本地 / 放弃本地 / 后续人工合并”的更强取舍辅助，以及更完整的多端 conflict handling。

## 2026-07-02 00:38:10 +08:00 | v1.1.0-alpha.82 | 推进 WB-032 关键对象名级冲突摘要子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在“面向最新 head 的冲突差异摘要”基础上，再把摘要粒度从“只有数量”推进到“数量 + 关键对象名”。
- 本轮目标是让用户在冲突卡片里不只看到“新增 1 个节点”，而是能更快知道“新增的是新概念节点”“标题和最新图谱不一致”等更具体的提示。
### 完成结果
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`，让摘要在保持高层概览的前提下，补充关键对象名：标题/说明差异会显示当前值与基线值，节点/连线/分组差异会展示前两个关键名称并在需要时追加“等”。
- 更新 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`，补齐“关键对象名摘要”和“超过两个对象时的样本截断”回归，锁定摘要口径。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 和 `GraphWorkspaceStageChrome.test.tsx`，让页面与组件回归直接验证“新概念”“Graph on server”这类更具体的冲突提示，而不是只盯数量。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 的当前边界明确为“本地草稿留存辅助 + 本地摘要 + 最新 head 摘要 + 关键对象名级提示”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱冲突辅助卡片现在已经不只是“有差异、差异有几条”，而是能在保留摘要简洁度的前提下，把最关键的对象名直接带出来，显著降低用户理解冲突上下文的成本。
- `WB-032` 仍处于进行中；下一步更值得继续补的是保留/放弃/后续人工合并的取舍辅助，以及更完整的多端 conflict handling，让冲突卡片不只解释问题，还能更积极地帮助用户做决策。

## 2026-07-02 00:33:20 +08:00 | v1.1.0-alpha.81 | 推进 WB-032 面向最新 head 的冲突差异摘要子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在“当前未保存修改摘要”之后，再补一层真正面向服务端最新图谱的冲突差异提示。
- 本轮目标是不让冲突辅助卡片只停留在“你本地改了什么”，而是进一步告诉用户“这些本地修改与服务端最新 head 相比主要差在哪里”。
### 完成结果
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`：当工作区进入 dirty 冲突态且建议重载最新图谱时，会静默拉取一次服务端最新 graph head，并把结果保存在冲突辅助状态里，而不打断用户当前决策流。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`：冲突辅助卡片现在除了“当前未保存修改”外，还会展示“与最新图谱相比”的第二组差异摘要；如果最新 head 尚在拉取中或暂时不可用，也会给出对应说明。
- 继续复用 `graphConflictSummary` helper，让本地 vs 最新 head 的差异摘要保持和“当前未保存修改摘要”一致的口径，避免两套不同的差异规则在 UI 上互相打架。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 和 `GraphWorkspaceStageChrome.test.tsx`，锁定“冲突现场同时展示本地未保存修改摘要与面向最新 head 的差异摘要”的页面与组件行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 当前边界推进到“本地草稿留存辅助 + 当前未保存修改摘要 + 最新 head 差异摘要”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱工作区现在在 dirty 冲突态下不再只会说“你本地有未保存修改”，而是会并列展示“本地改了什么”和“与最新图谱相比差了什么”，让用户在决定留存、放弃或重载前有更完整的上下文。
- `WB-032` 仍处于进行中；下一步更值得继续补的是更细粒度的冲突差异、合并/保留取舍辅助，以及更完整的多端 conflict handling，让用户不只看到摘要，还能更主动地处理冲突。

## 2026-07-02 00:27:40 +08:00 | v1.1.0-alpha.80 | 推进 WB-032 当前未保存修改摘要子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在“冲突态本地草稿留存辅助”之后，再补一层更可理解的冲突摘要。
- 本轮目标是让用户在 dirty 冲突态下不仅知道“可以复制/导出本地草稿”，还知道“当前这份本地草稿相对最后一次已同步成功的图谱到底改了什么”。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts` 及对应测试，基于“当前工作区图谱”与“最后一次已同步成功的图谱基线”生成当前未保存修改摘要，覆盖标题/说明变化、节点/连线/分组的新增、修改、删除，以及仅视口变化时的兜底提示。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，显式维护 `lastSyncedDetailRef` 作为最后同步基线，并在 dirty 冲突态下把摘要传给冲突辅助卡片。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，让冲突辅助卡片显示“当前未保存修改摘要”，把“你将放弃什么”直接放到冲突现场，而不是只给动作按钮。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 与 `GraphWorkspaceStageChrome.test.tsx`，锁定“冲突现场显示修改摘要、同时保留复制/导出/重载动作”的页面与组件行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 的边界明确为“先看本地未保存修改摘要，再决定是否留存或放弃”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱工作区现在在 dirty 冲突态下不再只是“能不能留存当前草稿”的问题，而是会先把当前未保存修改摘要展示出来，帮助用户更清楚地判断自己是不是要先留存、是否可以接受放弃。
- `WB-032` 仍处于进行中；下一步更值得继续补的是面向“服务端最新 head”的更完整冲突差异展示与更强的多端 conflict handling，让用户不只知道自己本地改了什么，还能知道这些改动与最新版本的关系。

## 2026-07-01 20:21:30 +08:00 | v1.1.0-alpha.79 | 推进 WB-032 冲突态本地草稿留存辅助子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在“显式重载最新图谱”之后，再补一层更稳妥的冲突取舍辅助。
- 本轮目标是避免用户在版本冲突时只能二选一地“立刻放弃并重载”或“自己摸索怎么留存本地修改”，而是把留存本地草稿的动作显式放到冲突现场。
### 完成结果
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，新增图谱冲突辅助卡片；当当前工作区处于 dirty 冲突态时，会明确展示 `复制当前草稿 JSON` 和 `导出当前草稿 JSON`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `copyConflictDraftJson()` 与 `exportConflictDraftJson()`：直接基于当前工作区的实时图谱构建 StudyMate JSON，在放弃重载前为本地修改提供留存路径，并保持“重新加载最新图谱”的冲突决策状态不被辅助动作清掉。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 和 `GraphWorkspaceStageChrome.test.tsx`，补齐页面级与组件级回归，锁定“冲突现场显示留存辅助动作、点击辅助动作后仍保留重载决策流”的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 的当前边界从“显式重载”推进到“先留存本地修改，再决定是否重载”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱工作区现在在 dirty 冲突态下不再只有“要不要放弃并重载”这一条单线决策，而是把“先复制/导出当前草稿，再决定是否放弃”变成显式、就地、可测试的辅助流程。
- `WB-032` 仍处于进行中；下一步更值得继续补的是冲突差异摘要和更完整的多端 conflict handling，让用户不仅能留存本地修改，还能更清楚地理解自己即将放弃的内容与服务端最新 head 的差异。

## 2026-07-01 20:08:30 +08:00 | v1.1.0-alpha.78 | 推进 WB-032 显式重载最新图谱决策流子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，把此前“另一窗口正在编辑 / 已保存更高版本”的提醒，进一步升级为用户可执行的最小决策流。
- 本轮目标是先收口安全的显式重载边界：当当前标签页已经落后时，允许用户主动拉取最新图谱；如果本地仍有未保存修改，必须明确确认放弃后才能继续。
### 完成结果
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，让图谱状态栏支持可选动作按钮，并在需要时展示 `重新加载最新图谱`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新增 `reloadLatestGraph()` 流程：dirty 状态下先弹确认，随后重新拉取最新 `getGraph(...)` head、重置 history/save-state、刷新 snapshot 列表，并在成功后明确提示“已重新加载最新图谱，未保存更改已放弃”。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`，让“另一窗口已保存更高版本”与 `batch-save` 命中 `graph_version_conflict` 时都能稳定保留“建议重载最新图谱”的页面状态，不再被后续失败文案意外清掉。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`、`GraphWorkspaceStageChrome.test.tsx` 和 `useGraphWorkspacePersistence.test.tsx`，补齐页面级、状态栏级与 hook 级回归，锁定“出现冲突后展示重载动作、dirty 时确认放弃、重载后清理失败状态”的行为。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 的冲突处理边界从“前置提醒”推进到“用户可控的显式重载动作”。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 先因版本冲突路径没有保留重载动作而 RED，修正状态流转顺序后通过。
- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx` 先因测试支架未补 `onReloadLatestSuggestionChange` 而 RED，补齐 harness 与回归断言后通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱工作区现在不只会告诉用户“你已经落后于最新版本”，还会把“放弃当前未保存修改并重载最新图谱”变成一个明确、可预期、可测试的动作，减少用户停在失败态却不知道下一步该怎么做的情况。
- `WB-032` 仍处于进行中；下一步更值得继续补的是冲突差异展示、本地修改导出/复制辅助，以及更完整的多端 conflict handling，而不是再停留在只有提醒或只有失败文案的状态。

## 2026-07-01 19:57:20 +08:00 | v1.1.0-alpha.77 | 推进 WB-032 跨窗口冲突提示与 stale 草稿解释子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在“同图谱本地草稿恢复”之后，再补上一层更主动的冲突提示：用户不应只在保存时报 `409` 时才第一次知道另一个窗口已经编辑或保存了同一图谱。
- 本轮同时补 stale local draft 的可解释反馈，避免工作区静默丢弃旧草稿时，用户误以为系统把内容吞掉了。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphWorkspaceConcurrencySignal.ts` 与对应测试，按 `graphId + sessionId` 把当前窗口的 `dirty/currentVersion` 状态写入 `localStorage`，作为跨窗口轻量 signal。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`：工作区现在会监听同图谱的 `storage` 事件；检测到另一窗口仍在编辑时，提示“请保存前确认最新版本”；检测到另一窗口已保存更高版本时，提示“请刷新图谱后再继续编辑”。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`：当本地草稿因为服务端 head 已推进而被放弃时，页面会明确提示“本地草稿基于旧版本，已放弃恢复并加载最新图谱”，不再静默回退到最新画布。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`、`useGraphWorkspacePersistence.test.tsx` 和 `graphPersistenceState.test.ts`，把 stale 草稿解释文案与跨窗口冲突提示固定为页面级/Hook 级回归。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 先因缺少并发 signal helper 与 stale draft 解释文案而 RED，补实现后通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱工作区现在已经不只是在“保存失败后不丢本地编辑”，而是能更早告诉用户“另一个窗口也在动这张图”，从而降低静默冲突和误操作概率。
- `WB-032` 仍处于进行中；下一步最值得继续补的是显式刷新/重载确认和更完整的冲突决策流，让“提醒”升级成“用户可控的恢复/取舍动作”。

## 2026-07-01 19:49:30 +08:00 | v1.1.0-alpha.76 | 推进 WB-032 同图谱本地草稿恢复子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，在“保存冲突可见”和“dirty 时禁止恢复快照”之后，补上同一图谱重新打开时的本地未保存草稿恢复能力。
- 本轮目标是先收口最小安全恢复边界：只有服务端 head 版本未变化时才恢复本地草稿；如果 head 已推进，则宁可放弃旧草稿，也不能静默覆盖当前图谱。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphWorkspaceDraftRecovery.ts` 与 `graphWorkspaceDraftRecovery.test.ts`，把图谱本地草稿恢复规则收口为独立 helper：按 `graphId` 落盘 `title` / `description` / `document` / `currentVersion`，支持读取、清理和基于版本一致性的恢复判定。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`：当前工作区一旦进入 `dirty` 状态，就把草稿写入 `sessionStorage`；保存成功或重新回到非 dirty 状态时，自动清理对应图谱草稿。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`：工作区首次加载或切换图谱时，会优先检查同图谱本地草稿；若 `currentVersion` 与服务端一致，则恢复本地草稿并维持 dirty 状态；若版本不一致，则清理 stale draft，继续以服务端 head 为准。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，新增页面级回归锁定“同图谱 + 同版本”重开后会看到恢复提示、继续处于 dirty 状态，且本地节点仍能在画布中找到。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/GraphWorkspacePage.test.tsx` 先因缺少恢复模块而 RED，补实现后通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱工作区现在已经具备“同图谱未保存编辑找回”的最小恢复能力，用户刷新或重新进入同一图谱时，不再只能依赖远端 autosave 或手动保存才能保住刚做的修改。
- `WB-032` 仍处于进行中；下一步应继续补多窗口/多端冲突提示、stale draft 的可解释反馈，以及更完整的恢复决策流，避免用户在并发编辑场景下只看到“草稿消失”而不知道原因。

## 2026-07-01 19:33:56 +08:00 | v1.1.0-alpha.75 | 推进 WB-032 图谱快照恢复前保护子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，补上保存冲突可见性之后的下一条恢复安全边界：当前画布仍有本地未保存修改时，不允许直接恢复历史快照。
- 本轮目标不是完成完整的 autosave 恢复链路，而是先阻断“dirty 画布一键恢复快照导致本地编辑被静默覆盖”的高风险路径。
### 完成结果
- 更新 `frontend-user/src/modules/graph/lib/graphPersistenceState.ts`，新增快照恢复前保护状态，明确输出“当前图谱仍有未保存修改，请先保存后再恢复快照”提示，并保持保存态为 `dirty`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`：`restoreSnapshot(...)` 现在会先检查 `options.dirty`；存在未保存编辑时直接阻断恢复请求，不进入远端 restore API，也不重置历史状态。
- 更新 `frontend-user/src/modules/graph/lib/graphPersistenceState.test.ts`，锁定恢复前保护状态对象。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，新增页面级回归：先制造 dirty 编辑，再点击恢复快照时，应继续显示“有未保存修改”状态并给出保护提示，同时不得发出 `restoreGraphSnapshot(...)` 请求。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/GraphWorkspacePage.test.tsx` 先因缺少恢复前保护 helper 和 dirty guard 而 RED，补实现后通过。
- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱工作区现在已经不仅能防止旧版本保存静默覆盖，也能防止 dirty 状态下的快照恢复静默替换当前画布，`WB-032` 的“恢复安全”边界因此更完整了一层。
- `WB-032` 仍处于进行中；下一步仍应优先补 autosave 草稿恢复与更完整的多窗口冲突提示，让保存、恢复与离页三条链路真正闭环。

## 2026-07-01 14:55:51 +08:00 | v1.1.0-alpha.74 | 推进 WB-032 图谱保存版本冲突可见性子步骤
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-032`，先从风险最直接的一刀切入：避免旧标签页、旧草稿或落后版本的 batch-save 静默覆盖已经更新过的 graph head。
- 本轮不把 `WB-032` 误报成整体完成，而是先收口“保存冲突必须可见、失败后本地脏编辑不能丢”的最小可靠性边界，为后续 autosave 恢复和 snapshot 安全恢复继续打底。
### 完成结果
- 更新 `backend/internal/modules/graph/service/service.go`：`BatchSave(...)` 现在会在任何持久化前校验 `request.document.version == graph.current_version`；如果客户端版本落后，则返回 `409 graph_version_conflict`，并直接阻断写入。
- 更新 `backend/internal/modules/graph/service/service_test.go`：新增回归测试锁定旧版本保存必须失败，且不得写入 `graphs.current_version`、`graph_versions` 或 Mongo current document。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`：新增冲突失败态回归，锁定保存失败后仍保持 `dirty:true` 和冲突文案，确保本地未保存编辑不会被失败流程吞掉。
- 同步更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`、`docs/engineering/CODEX_BACKLOG.md`、`docs/engineering/CODEX_EXECUTION_ROADMAP.md` 和 `CHANGELOG.md`，把 `WB-032` 标记为进行中，并把 `batch-save` 的 `409 graph_version_conflict` 契约写入文档。
### 验证结果
- `go test ./internal/modules/graph/service` 先因新测试命中“旧版本保存被静默覆盖”而 RED，补上版本前置校验后转绿。
- `go test ./internal/modules/graph/...` 通过。
- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱保存链路现在至少已经具备“旧版本不能静默覆盖新 head”的最小安全边界，后续 autosave 与多窗口编辑可以在明确冲突信号上继续建设，而不需要先回头补底层版本保护。
- `WB-032` 仍处于进行中；接下来最值得继续推进的是 autosave 草稿恢复、snapshot 恢复前保护，以及更明确的多端冲突提示与用户决策流。

## 2026-07-01 15:05:00 +08:00 | v1.1.0-alpha.73 | 完成 WB-031 图谱导出、缩略图与布局契约收口
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-031`，把图谱现有的 JSON/SVG/PNG 导出、缩略图主记录字段和来源泳道布局能力整理成统一契约，避免这些能力长期分散在前端局部 helper、数据库字段和隐含实现里。
- 本轮重点不是继续扩张新的图谱功能，而是先把“导出产物怎么定义”“graph head 如何挂缩略图”“布局能力如何进入统一 API 生命周期”这三件事收口清楚，为后续 autosave、冲突处理和工程图谱导入提供稳定边界。
### 完成结果
- 新增 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`，集中说明 JSON/SVG/PNG 导出边界、`thumbnailFileId` head 字段、以及 `POST /api/v1/graphs/:id/layouts/preview` 的请求/响应与不推进版本语义。
- 更新后端 graph DTO、summary builder 和前端 API types，让 `thumbnailFileId` 从数据库字段提升为前后端共享的 graph 摘要契约。
- 新增后端来源泳道布局预览入口：`POST /graphs/:id/layouts/preview`。该接口会用服务端权威 `graphId` / `version` 归一化客户端文档草稿，返回布局后的 document、laneCount 和 selectedNodeIds，但不会写入 current document、snapshot 或 graph version。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，图谱工作区生成来源泳道时优先调用后端 preview API；接口不可用时仍回退到本地 `buildGraphSourceSwimlaneDocument(...)`，保持本地容错与统一契约并存。
### 验证结果
- `go test ./internal/modules/graph/service ./internal/modules/graph/handler` 先因缺失 `PreviewLayout` DTO/handler/service 而 RED，补实现后转绿。
- `go test ./internal/modules/graph/...` 通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts` 先因缺失 `previewGraphLayout(...)` 而 RED，补实现后通过。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace @studymate/graph-core run test` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱布局现在已经不再只是工作区内部行为，而是进入了统一 graph API 契约；后续无论接更多布局算法、工程图模板还是后台治理入口，都有了稳定的 request/response 形状。
- `thumbnailFileId` 现在成为 graph head 的显式一部分，后续 `WB-032` 和更远的分享/搜索卡片展示可以直接围绕这个字段建立异步缩略图链路，而不需要再次回头改 summary contract。

## 2026-07-01 14:40:00 +08:00 | v1.1.0-alpha.72 | 完成 WB-030 图谱 API 生命周期契约收口
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-030`，把图谱后端已存在的 graph/document/snapshot/version/relation 读写路径整理成单一生命周期契约，并补上能锁定版本推进语义的后端与前端测试。
- 本轮重点不是扩张新的图谱功能，而是先修掉“restore 后 current document 版本号可能回写旧值”和“graph summary mode 可能与恢复后文档语义漂移”这两个生命周期风险，为后续自动保存、冲突处理和导出能力打地基。
### 完成结果
- 新增 `docs/architecture/GRAPH_API_LIFECYCLE.md`，集中说明 graph head、Mongo current document、Mongo snapshot、MySQL version 索引和 source relation 的职责边界、endpoint 矩阵、版本推进规则，以及 restore 以旧内容生成新 head 的语义。
- 重构 `backend/internal/modules/graph/service/service.go` 的依赖为最小接口，并新增 `backend/internal/modules/graph/service/service_test.go`，锁定 create graph 初始化 version 1、batch-save 推进 head 版本并落地 lifecycle artifact、restore snapshot 生成新 head 且重算 `graph.mode` 的行为。
- 更新 `backend/internal/modules/graph/dto/document_contract.go` 与 `backend/internal/modules/graph/dto/document_contract_test.go`，让所有写入型 graph 路径都以服务端权威覆盖 `graphId` / `version`，不再信任客户端或旧 snapshot 自带的过期版本号。
- 新增 `frontend-user/src/api/graphs.test.ts`，把 batch-save、snapshots、restore、Markdown/Mermaid import、validate 和 diagram templates 的 path / method / body 契约固定下来，避免前端调用点后续漂移。
### 验证结果
- `go test ./internal/modules/graph/service` 初始以 RED 方式暴露 service 依赖无法注入 fake、以及 restore 后 `document.version` 与 `currentVersion` 不一致的问题；完成重构和修复后转绿。
- `go test ./internal/modules/graph/dto ./internal/modules/graph/service` 通过。
- `go test ./internal/modules/graph/...` 通过，graph dto / handler / repository / service 回归全绿。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，32 条 graph-core 用例全绿。
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过，22 条图谱前端用例全绿。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
### 后续影响
- 图谱生命周期现在已经明确由服务端掌控 head version，restore/import/batch-save 这类整份文档替换流程不再静默带回旧版本号；后续 `WB-032` 做 autosave / conflict handling 时可以直接建立在这条边界上。
- `WB-030` 完成后，下一工作包应进入 `WB-031`，优先补图谱导出产物、缩略图和布局任务模型，让当前已经稳定的 lifecycle 契约真正承载更完整的图谱产品化能力。

## 2026-07-01 14:12:29 +08:00 | v1.1.0-alpha.71 | 完成 WB-023 图谱内核测试与迁移回归
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-023`，把图谱内核的“序列化、导入错误、旧数据兼容、历史栈边界”回归测试补齐到 `@studymate/graph-core`。
- 本轮重点不扩张新的图谱功能，而是锁定 `.smtg` 旧数据迁移兼容和 history 状态机边界，避免后续 `WB-030` 进入 API 生命周期整理时再次引入导入回归。
### 完成结果
- 扩展 `packages/graph-core/test/graphProductization.test.ts`，新增旧 root-level `.smtg` 缺失 `schemaVersion` 的兼容导入、非法 JSON / 数组 root / 非法 `document` 包装拒绝、history readable label / fallback label，以及 past/future 栈上限回归测试。
- 更新 `packages/graph-core/src/file-format.ts`，将缺失 `schemaVersion` 的旧 StudyMate 图谱按 v1 兼容导入处理，同时继续拒绝数组 root 和非对象 `document` 包装，避免宽松兼容误放过坏 payload。
- 复核 graph-core history 行为，确认 undo / redo / fallback label 与栈裁剪逻辑已由回归测试锁定，无需再在前端包装层重复维护额外兼容分支。
### 验证结果
- `npm --workspace @studymate/graph-core run test -- --testNamePattern="legacy root documents|graph history respects|graph history stores readable|round trips and rejects invalid schema"` 先因缺失 `schemaVersion` 旧图谱被拒绝、以及数组 root 被误放行而失败，补实现后通过。
- `npm --workspace @studymate/graph-core run test` 通过，32 条 graph-core 用例全绿。
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- graph-core 现在已经明确区分“旧版缺省 schema 的兼容导入”和“结构非法 payload 的拒绝导入”，后续图谱 API 契约整理可以直接复用这层边界，而不必再在 hook 或 handler 中补兜底。
- `WB-023` 完成后，下一工作包应回到 `WB-030`，优先收口图谱 document/node/edge/group/snapshot 生命周期契约，并把前后端现在已经稳定下沉的 core 能力接回统一 API 边界。

## 2026-07-01 14:03:06 +08:00 | v1.1.0-alpha.70 | 完成 WB-022 图谱 import / export / validation 统一接口
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-022`，把图谱工作区里分散在 `useGraphImportExport.ts`、controller 和 JSON helper 中的 import/export/validation 分支收口成统一接口。
- 本轮重点不新增新的导入格式，而是把现有 Markdown / Mermaid / StudyMate JSON / SVG / validate 行为统一到单一 facade，并保留已有兼容性与回归覆盖。
### 完成结果
- 重写 `frontend-user/src/modules/graph/lib/graphFileImportExport.ts`，新增统一 facade：`buildGraphExportArtifact(...)` 统一 JSON/SVG 导出描述，`parseGraphJsonImport(...)` 统一 JSON 导入阻断计数与状态消息，`buildRemoteGraphImportOutcome(...)` 统一 Markdown/Mermaid 远端导入归一化，`buildGraphValidationOutcome(...)` 统一 validate 状态摘要。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphImportExport.ts`，让 hook 只保留下载、PNG 渲染、远端 API 调用和保存态副作用，不再重复维护导入模式分支文案和错误计数逻辑。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，把远端 `validateGraph(...)` 的状态消息拼装也切到统一 facade，避免 controller 再次复制规则。
- 扩展 `frontend-user/src/modules/graph/lib/graphFileImportExport.test.ts`，补齐统一 facade 的 JSON/SVG 导出、JSON 阻断导入、Markdown/Mermaid 归一化和 validate 状态摘要测试。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphFileImportExport.test.ts` 先因统一接口缺失失败，补实现后通过。
- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphImportExport.test.tsx src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/hooks/useGraphViewportCamera.test.tsx src/modules/graph/hooks/useGraphSelectionState.test.tsx src/modules/graph/lib/graphHistory.test.ts` 通过。
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace @studymate/graph-core run test` 通过。
### 后续影响
- 图谱导入/导出/校验现在已经具备单一的前端纯逻辑入口，后续 `WB-023` 可以更专注在 graph-core 序列化、导入错误、旧数据兼容和历史栈回归测试，而不是继续在 hook/controller 中追踪分支漂移。
- 这次收口主要聚焦接口统一，没有继续扩张新的导入协议；PlantUML / OpenAPI / SQL DDL 之类工程图谱导入仍属于后续 `WB-051` 及其前置工作。

## 2026-07-01 09:50:06 +08:00 | v1.1.0-alpha.69 | 完成 WB-021 图谱 viewport / selection / history 状态抽离
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-021`，把图谱工作区里剩余的 selection / viewport / history 状态转移从“前端 hook 各自维护”继续收口到 `@studymate/graph-core` 纯逻辑边界。
- 本轮重点不扩张 import/export 或持久化能力，只让选择、多选、缩放/重置视野、撤销/重做转换具备稳定的共享状态模型与回归测试。
### 完成结果
- 更新 `packages/graph-core/src/selection.ts`、`viewport.ts` 与 `history.ts`，新增 `replaceGraphNodeSelection(...)`、`zoomGraphViewport(...)`、`resetGraphViewport(...)`，并把 core history label/undo/redo 转换清理为可复用实现。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphSelectionState.ts`，将显式多选替换、单选、toggle、框选统一委托给 `@studymate/graph-core` selection helper，不再分别维护散落的 `selectedNodeId` / `selectedNodeIds` 写法。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphViewportCamera.ts`，让工具栏缩放、滚轮缩放和重置视野全部复用 graph-core viewport transition helper。
- 重写 `frontend-user/src/modules/graph/lib/graphHistory.ts`，让前端 undo/redo/history 捕获包装层委托给 graph-core history state，同时保留 StudyMate 自己的 `GraphDocumentPayload` 规范化与保存边界摘要。
- 更新 graph-core 与前端图谱测试，补齐显式多选替换、viewport zoom/reset、history label 和 undo/redo 包装层回归。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 通过，30 条 graph-core 用例全绿。
- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphSelectionState.test.tsx src/modules/graph/hooks/useGraphViewportCamera.test.tsx src/modules/graph/lib/graphHistory.test.ts` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱工作区的选择、视野和历史状态现在已经具备更明确的“core 状态机 + 前端包装层”边界，后续 `WB-022` 可以专注统一 import / export / validation，而不是继续在 controller 里复制状态转移逻辑。
- 本轮顺手清理了 `graphHistory.ts` 的历史乱码标签，但没有扩散到更大范围 UI 文案；其他图谱旧文案编码问题仍应在独立工作包里有计划收口。

## 2026-07-01 09:27:42 +08:00 | v1.1.0-alpha.68 | 完成 WB-020 图谱文档模型与版本策略收口
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-020`，把图谱 `GraphDocument` / `schemaVersion` / 兼容读写默认化从“分散在前后端多处硬编码”收口成显式契约。
- 本轮重点不扩张 viewport/history/import-export 新能力，只稳定旧图谱 payload、空文档、Mongo current document 与 snapshot 的兼容读取路径。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphDocumentPayload.ts` 与 `graphDocumentPayload.test.ts`，把用户端图谱 payload 兼容适配集中起来，并复用 `@studymate/graph-core` 的 `normalizeGraphDocument(...)` 与 `supportedGraphSchemaVersion`。
- 更新 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`，让工作区 `normalizeDocument(...)` / `createEmptyDocument(...)` 统一委托给新的 payload 适配层，而不是继续在页面侧散落 `schemaVersion: 1` 和空对象/空数组默认值。
- 新增 `backend/internal/modules/graph/dto/document_contract.go` 与 `document_contract_test.go`，提供 `SupportedGraphSchemaVersion`、`NormalizeDocumentPayload(...)` 与 `NewEmptyDocumentPayload(...)` 三个共享契约入口。
- 更新后端 graph repository/service/helpers：Mongo current document 与 snapshot 读出后会再次经过共享默认化；批量保存、导入、快照恢复和空文档创建也都复用同一层 helper，不再各自补 `SchemaVersion = 1`。
- 新增 `docs/architecture/GRAPH_DOCUMENT_CONTRACT.md`，并同步更新 `README.md`、`docs/DEVELOPMENT.md`、`docs/engineering/CODEX_BACKLOG.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，把 `WB-020` 标记为完成并切换下一优先级到 `WB-021`。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphDocumentPayload.test.ts src/modules/graph/lib/graphWorkspaceLoadState.test.ts` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 条用例全绿。
- `cd backend && go test ./internal/modules/graph/dto ./internal/modules/graph/repository ./internal/modules/graph/service` 通过。
### 后续影响
- 图谱文档契约现在已经具备清晰的单一来源和显式兼容层，后续 `WB-021` 可以更专注在 viewport / selection / history 状态抽离，而不是继续在读写默认值上来回修补。
- 当前仍保留前端工作区默认 viewport `{ x: 140, y: 120, zoom: 1 }` 与后端空文档 `{ x: 0, y: 0, zoom: 1 }` 的语义差异，这是有意保留的 UI/持久化边界，不属于本轮要合并的范围。

## 2026-07-01 09:11:18 +08:00 | v1.1.0-alpha.67 | 完成 WB-014 搜索文档与回归记录收口
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-014`，把 `/api/v1/search` 的当前契约、权限矩阵、页面边界和自动化验证入口集中沉淀下来。
- 本轮重点不是继续加搜索功能，而是把已经收口的搜索能力变成后续可复用、可追踪、可执行的工程资产。
### 完成结果
- 新增 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`，集中记录搜索 endpoint、查询参数、grouped payload、权限/可见性、排序/摘要规则，以及用户端 URL 筛选和当前批次分页边界。
- 更新 `package.json`，新增 `test:search:frontend`、`test:search:backend`、`test:search:e2e` 和 `verify:search`，把搜索专项回归从零散命令收口成固定入口。
- 更新 `README.md`、`docs/DEVELOPMENT.md`、路线/版本文档和变更记录，让主文档明确知道搜索契约总表和 `npm run verify:search` 的存在。
- 更新 `docs/engineering/CODEX_BACKLOG.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，将 `WB-014` 标记为完成，并把下一优先级切回 `WB-020` 图谱文档模型与版本策略。
### 验证结果
- `npm run verify:search` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过（仅存在既有 CRLF 提示，无 diff 错误）。
- `npm run ci` 通过。
### 后续影响
- 搜索链路现在已经不只是“代码和测试存在”，而是具备了单点文档和固定验证命令；后续改 `SearchIndexer`、搜索页或知识链接时，更容易判断有没有发生契约漂移。
- 下一优先级应切换到 `WB-020`，开始收口图谱 `GraphDocument` / schema version / 版本策略这条主线，而不是继续在搜索层做重复整理。

## 2026-07-01 09:05:12 +08:00 | v1.1.0-alpha.66 | 完成 WB-013 搜索页体验与页面级回归补强
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-013`，在不修改 `/api/v1/search` grouped payload 契约的前提下，补用户端搜索页的空态、错误态、类型筛选、来源跳转和分页回归。
- 本轮重点收口“真实可验证的页面交互”，不假装后端已经支持 offset/page 分页。
### 完成结果
- 更新 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`，新增 URL 驱动的 `types` 类型筛选，让页面状态、地址栏和 `searchAll(...)` 请求保持同步。
- 新增 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx`，按页面级 TDD 回归覆盖无关键词空态、后端错误态、筛选请求形状，以及来源链接与分页切换。
- 更新搜索页结果展示：每组当前批次最多请求 `12` 条结果，并按每页 `4` 条切换；界面会明确说明这只是当前批次内分页，不代表后端已有 offset/page 契约。
- 更新 `frontend-user/src/styles/search-review.css`、`README.md`、`docs/DEVELOPMENT.md`、路线/版本文档和变更记录，把搜索页最新交互边界写回文档。
### 验证结果
- `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test` 通过，42 个测试文件、147 条用例全绿。
- `npm run verify:docs` 通过。
- `git diff --check` 通过（仅存在既有 CRLF 提示，无 diff 错误）。
- `npm run ci` 通过。
### 后续影响
- 搜索页现在已经具备最小可用的页面交互护栏，后续代理不需要再靠手工点点点判断筛选、空态和来源跳转是否退化。
- 下一优先级应切换到 `WB-014`，把搜索 API / 页面交互的当前契约与验证记录继续沉淀到文档与回归清单里。

## 2026-07-01 02:09:34 +08:00 | v1.1.0-alpha.65 | 完成 WB-012 搜索权限与可见性过滤补强
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-012`，把 fallback 搜索的权限/可见性约束从“读代码推断”收口成可回归测试。
- 本轮重点覆盖匿名短路、owner 归属和未发布内容过滤，不改变搜索路由与 grouped payload 结构。
### 完成结果
- 更新 `backend/internal/modules/search/service/indexer.go`，把查询拼装抽成纯 `searchQuerySpec`，便于在不连接真实数据库的前提下回归各类型结果的可见性条件。
- 更新 `backend/internal/modules/search/service/indexer_test.go`，新增权限矩阵测试：匿名请求会直接短路 `note/graph/card`；`material/post` 继续显式限定公开内容；`card` 仅返回 owner 自己的 `active` 卡片；`graph` 仅返回 `active` 且“owner 或 public”的图谱。
- 顺手补上 graph 搜索缺失的 `status = active` 过滤，避免把非活跃图谱带进搜索候选集。
- 更新 `README.md`、`docs/DEVELOPMENT.md`、路线/版本文档和执行记录，把搜索权限矩阵写回文档，减少后续代理误判。
### 验证结果
- `go test ./internal/modules/search/service` 通过。
- `go test ./internal/modules/search/...` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过。
- `npm run ci` 通过。
### 后续影响
- 搜索现在不仅契约稳定、结果质量可回归，连核心权限矩阵也已经被显式锁住；后续可以更放心地继续做用户端搜索体验和交互回归。
- 下一优先级应切换到 `WB-013`，补搜索页的空态、错误态、筛选与来源跳转回归。

## 2026-07-01 02:00:32 +08:00 | v1.1.0-alpha.64 | 完成 WB-011 聚合搜索结果质量补强
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-011`，在不改搜索路由与 grouped payload 结构的前提下，补强 fallback 搜索的组内排序和摘要展示质量。
- 本轮重点只收口“标题命中优先”和“摘要可读预览”两条最小规则，不引入新索引引擎，也不扩展到权限矩阵。
### 完成结果
- 更新 `backend/internal/modules/search/service/indexer.go`，让 MySQL fallback 先抓取一小批候选，再按“标题命中优先、摘要命中次之”的规则稳定排序，同级继续保留数据库返回的最新顺序。
- 新增 `backend/internal/modules/search/service/indexer_test.go`，通过纯逻辑测试锁定标题命中优先规则，以及长摘要折叠空白并裁剪到 160 个字符以内的行为。
- 搜索结果摘要现在会统一压成单行预览，避免把整段帖子正文或长文本原样灌进搜索结果卡片。
- 更新 `docs/DEVELOPMENT.md`、`README.md`、路线/版本文档和执行记录，把搜索结果质量规则写回文档，避免后续继续依赖“更新倒序但相关性不清楚”的隐含行为。
### 验证结果
- `go test ./internal/modules/search/service` 通过。
- `go test ./internal/modules/search/...` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过。
- `npm run ci` 通过。
### 后续影响
- 搜索 fallback 现在已经具备更稳定的组内排序和更可读的摘要预览，后续继续补强时可以把重点放在权限/可见性矩阵和更强的索引抽象，而不是继续修基础展示质量。
- 下一优先级应切换到 `WB-012`，系统补齐私有笔记、私有图谱和未发布内容的权限过滤测试。

## 2026-07-01 01:55:11 +08:00 | v1.1.0-alpha.63 | 完成 WB-010 统一搜索契约收口
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-010`，在现有 search module 基础上固定搜索契约，而不是重做搜索模块。
- 本轮重点收口默认分组、非法 `types` 校验、`limit` 边界，以及前端 DTO / 开发文档中的返回字段语义。
### 完成结果
- 更新 `backend/internal/modules/search/service/service.go` 与 `handler.go`，让省略 `types` 或传空值时稳定回退到 `material/post/note/graph/card` 五组默认搜索；未知类型会在 service 层直接返回 `400 invalid_search_type`，不再继续落到 indexer。
- 调整 `limit` 规则：缺省或非法时回退到 `20`，超上限时钳制为 `50`，避免大页参数又被静默收回到默认值。
- 补充后端 `search/service`、`search/handler` 测试，覆盖空 `types` 默认行为、非法类型短路失败和分页上限边界。
- 更新 `frontend-user/src/api/types.ts`，显式固定 `SearchResult.type` 与 `source` 的联合类型；补充 `searchShare.test.ts`，锁定用户端在无类型筛选时不会发送空 `types=` 参数。
- 更新 `docs/DEVELOPMENT.md`、`README.md`、路线/版本文档和执行记录，明确 `source` 表示来源域而不是底层存储引擎。
### 验证结果
- `go test ./internal/modules/search/service` 通过。
- `go test ./internal/modules/search/handler` 通过。
- `go test ./internal/modules/search/...` 通过。
- `npm --workspace frontend-user run test -- src/api/searchShare.test.ts` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过。
- `npm run ci` 通过。
### 后续影响
- 统一搜索现在已经从“有接口”进入“契约稳定”阶段，后续工作可以更聚焦在结果质量、排序规则、权限过滤和用户端交互回归，而不是继续修请求边界漂移。
- 下一优先级应切换到 `WB-011`，继续补资料、笔记、图谱、帖子四类结果的聚合质量与摘要/排序规则。

## 2026-07-01 01:45:11 +08:00 | v1.1.0-alpha.62 | 完成 WB-004 版本与里程碑文档对齐
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-004`，把外层版本文档、发布清单和执行文档与已经完成的 `WB-002`、`WB-003` 工程基线重新对齐。
- 不扩散到新功能开发，只收口 README、ROADMAP、VERSION_PLAN、CHANGELOG、release checklist 与执行记录。
### 完成结果
- 更新 `README.md`，补记 `WB-002` 的配置安全收口、`WB-003` 的最小 CI 质量门禁、显式 `MYSQL_DSN` / `JWT_SECRET` 要求，以及 Playwright 默认 preview 端口 `44173` / `44174`。
- 更新 `docs/planning/ROADMAP.md` 与 `docs/planning/VERSION_PLAN.md`，把配置安全、Go 格式门禁、配置安全回归检查和当前完整验证基线写回里程碑文档。
- 更新 `CHANGELOG.md` 与 `docs/planning/versions/v1.0.0-release.md`，同步 release gate、环境变量要求和 Playwright 端口约定，避免发布文档继续滞后于代码。
- 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，将 `WB-004` 标记为完成，并把下一优先级重新收口到 `WB-010` 统一搜索契约。
### 验证结果
- `npm run verify:docs` 通过。
- `git diff --check` 通过。
- `npm run ci` 通过，确认文档收口后当前默认验证链路仍保持全绿。
### 后续影响
- 现在外层说明、发布清单和执行面都已经与真实工程基线同步，后续推进不会再被“配置安全未收口”“CI 门禁未补齐”这类过期文档误导。
- 下一优先级应切换到 `WB-010`，先固定统一搜索契约，再继续做权限与用户端回归补强。

## 2026-07-01 01:37:48 +08:00 | v1.1.0-alpha.61 | 完成 WB-003 最小 CI 质量门禁补强
### 任务内容
- 继续沿着 `CODEX_MASTER_PROMPT.md` 推进 `WB-003`，在已有 GitHub Actions 的基础上补最小质量门禁，而不是重写整条流水线。
- 优先锁住最容易回退的两类问题：Go 未格式化文件和已禁用的危险配置默认值。
### 完成结果
- 新增 `scripts/check-go-format.mjs`，显式检查 `backend/` 下全部 Go 文件是否通过 `gofmt`。
- 新增 `scripts/check-config-safety.mjs`，检查 `backend/internal/config/config.go`、`.env.example` 和 `docs/DEVELOPMENT.md` 中是否回退到已禁用的危险默认值。
- 更新根 `package.json`，新增 `verify:backend:format`、`verify:config-safety`，并把它们纳入 `npm run lint`。
- 更新 `.github/workflows/ci.yml`，在 typecheck 前显式增加 Go 格式和配置安全检查步骤。
- 对 `backend/` 全量 Go 文件执行 `gofmt -w`，修复仓库中原本就存在的大批未格式化文件，使新门禁可实际通过。
- 更新 `playwright.config.ts` 与 `e2e/v1-admin-governance.spec.ts`，把 E2E preview 默认端口从 4173/4174 收口为更稳的 44173/44174，并支持环境变量覆盖，解决当前 Windows 环境下的 preview 绑定失败。
- 更新 `docs/DEVELOPMENT.md`，同步新的门禁脚本和 Playwright 默认端口。
### 验证结果
- `npm run verify:backend:format` 通过，确认 138 个 Go 文件均已满足 `gofmt`。
- `npm run verify:config-safety` 通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例通过。
- `npm run ci` 通过，完整覆盖 lint、build、Vitest、graph-core、Playwright、后端测试与文档校验。
### 后续影响
- 现在 `gofmt` 与配置安全已经从“约定”变成了会阻断 CI 的显式门禁。
- 下一优先级应转到 `WB-004`，把 README 和里程碑文档与本轮已经落地的工程基线继续对齐。

## 2026-07-01 01:30:47 +08:00 | v1.1.0-alpha.60 | 完成 WB-002 环境变量与安全默认值收口
### 任务内容
- 沿着 `CODEX_MASTER_PROMPT.md` 继续执行 `WB-002`，收口环境变量和危险默认值，不扩散到业务功能开发。
- 目标是移除可直接运行的敏感 fallback，明确开发/测试/生产的最小配置边界，并让启动失败信息可读。
### 完成结果
- 更新 `backend/internal/config/config.go`，移除 `JWT_SECRET` 与 `MYSQL_DSN` 的危险 fallback，并新增 `ValidateMySQLConfig` 与 `ValidateServerConfig`。
- 新增 `backend/internal/config/config_test.go`，覆盖安全空 fallback、MySQL 必填校验、占位 JWT secret 拒绝、管理员引导配置完整性等场景。
- 更新 `backend/internal/app/server.go`，在服务启动前显式校验 `MYSQL_DSN`、`JWT_SECRET` 和管理员引导配置。
- 更新 `backend/cmd/migrate/main.go` 与 `backend/cmd/backfill-note-documents/main.go`，让数据库相关命令在缺失关键环境变量时直接失败，并输出明确错误。
- 更新 `.env.example`，保留占位型 `JWT_SECRET` 提示，移除 root 弱口令 DSN 和默认启用的管理员引导账号。
- 更新 `docs/DEVELOPMENT.md`，把后端启动示例改为专用数据库账号与显式环境变量方式，并补充开发、测试、生产环境分层建议。
### 验证结果
- `gofmt -w backend/internal/config/config.go backend/internal/config/config_test.go backend/internal/app/server.go backend/cmd/migrate/main.go backend/cmd/backfill-note-documents/main.go` 通过。
- `cd backend && go test ./internal/config` 通过。
- `cd backend && go test ./...` 通过。
- `npm run verify:docs` 通过。
- `npm run typecheck` 通过。
- `cd backend && $env:JWT_SECRET=''; $env:MYSQL_DSN=''; go run ./cmd/server` 按预期失败，报错 `MYSQL_DSN is required; JWT_SECRET is required`。
- `cd backend && $env:MYSQL_DSN=''; go run ./cmd/migrate` 按预期失败，报错 `MYSQL_DSN is required`。
### 后续影响
- 本地环境如果此前依赖 `config.Load()` 的隐式 fallback，将需要显式设置 `MYSQL_DSN` 和 `JWT_SECRET` 后再启动。
- 当前下一优先级应转向 `WB-003`，在现有 CI 基础上显式补 `gofmt`、secret scan 和更清晰的质量门禁。

## 2026-07-01 01:24:51 +08:00 | v1.1.0-alpha.59 | 完成 WB-001 基线核验与执行文档收口
### 任务内容
- 按 `CODEX_MASTER_PROMPT.md` 执行 `WB-001`，先核验当前分支真实基线，再决定后续工作包，不直接进入大范围功能开发。
- 只允许修改执行文档和 `.env.example` 草案，不改变运行时业务逻辑。
### 完成结果
- 核验出当前仓库已经真实具备 `search`、`share`、后台治理 API、GitHub Actions CI、`@studymate/graph-core` 测试包，以及已拆薄的 `frontend-user/src/app/App.tsx` 和 `frontend-admin/src/App.vue`。
- 更新 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，纠正“搜索后端缺失”“CI 缺失”“前端根文件过大”等过期判断。
- 新增 `docs/engineering/WB-001_BASELINE_AUDIT.md`，固定 2026-07-01 的真实构建/测试矩阵、配置风险、文档漂移和后续文件级计划。
- 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md` 与 `docs/engineering/CODEX_BACKLOG.md`，将后续重点调整为“补强现有能力”而不是“从零创建能力”，并把 `WB-001` 标记为已核验完成。
- 更新 `.env.example`，移除可直接使用的 root 弱口令示例，补全 `MONGO_TIMEOUT`、`REDIS_TIMEOUT`、`NOTE_READ_MODEL` 等当前代码已读取的环境变量。
### 验证结果
- `npm run verify:docs` 通过。
- `npm run typecheck` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个用例通过。
- `cd backend && go test ./...` 通过。
- `npm run test:user` 通过，41 个文件、142 个用例通过。
- `npm run test:admin` 通过，3 个文件、3 个用例通过。
- `npm run build:user` 通过。
- `npm run build:admin` 通过。
### 后续影响
- 后续 Codex 进入仓库时，将不再被“搜索未实现”“CI 未建立”“App 根文件过大”等过期判断误导。
- 当前最应优先推进的是 `WB-002` 环境变量与安全默认值收口，以及 `WB-003` 在现有 CI 基础上的质量门禁补强。
- `backend/internal/config/config.go` 中的危险 fallback 仍未移除，下一工作包需要优先处理。

## 2026-07-01 01:12:37 +08:00 | v1.1.0-alpha.58 | 工程图节点支持结构化模式选择
### 任务内容
- 继续推进自由/UML/ERD/C4/流程图模式能力，把工程图节点的 `diagramKind` 从自由文本输入升级为结构化选择。
- 保持 `metadata.content.diagramKind` 仍为字符串，不改 Graph API、`.smtg` 合约或后端模型。
### 完成结果
- 新增 `GraphNodeMetadataEditorField` descriptor 类型和 `graphDiagramModeOptions`，固定支持 `free/uml/erd/c4/flowchart` 五种模式。
- 更新 `getGraphNodeMetadataEditorFields`，为 `diagramKind` 返回可选项，其他 URL、图片、PDF、学习节点字段保持原输入框行为。
- 更新 `GraphWorkspaceSelectionPanel`，带 `options` 的 metadata 字段渲染为键盘可达的 `<select>`，并继续通过现有回调写回不可变文档。
### 验证结果
- `npm --workspace frontend-user run test -- graphNodeMetadata` 先红，失败原因为 `diagramKind` descriptor 缺少五种模式选项。
- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 先红，失败原因为工程图类型仍渲染为普通 input。
- `npm --workspace frontend-user run test -- graphNodeMetadata` 通过，1 个文件、6 个用例通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 通过，1 个文件、6 个用例通过。
- `npm --workspace frontend-user run test -- graphNodeMetadata GraphWorkspaceSelectionPanel GraphWorkspacePage graphTemplateApplication graphNodeTypes` 通过，5 个文件、26 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 工程图节点的模式 metadata 现在可稳定用于模板、导入草稿和后续模式专属校验，避免大小写或任意文本导致规则漂移。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-07-01 01:06:53 +08:00 | v1.1.0-alpha.57 | 工程图模板转换为 Mermaid 导入草稿
### 任务内容
- 继续推进 v0.8 模板中心与导入草稿能力，让 `diagram` 模式模板套用后进入 Mermaid 草稿，而不是和学习模板一样固定生成 Markdown 大纲。
- 不改变 `DiagramTemplatePayload`、导入 API 或 `.smtg` 合约，只拆出前端纯函数并调整 controller 编排。
### 完成结果
- 新增 `buildGraphTemplateImportDraft`，学习模板继续输出 Markdown 标题大纲，工程图模板按 `sampleLines` 稳定生成 `flowchart TD` Mermaid 连线草稿。
- 更新 `useGraphWorkspaceController.tsx` 的 `applyTemplate`，只消费纯函数返回的 `importMode/importSource/status`，减少 controller 内联格式组装。
- 补充纯函数和 `GraphWorkspacePage` 测试，覆盖学习模板 Markdown 回归、UML 模板 Mermaid 草稿、导入模式切换和可读状态提示。
### 验证结果
- `npm --workspace frontend-user run test -- graphTemplateApplication` 先红，失败原因为纯函数模块尚不存在。
- `npm --workspace frontend-user run test -- GraphWorkspacePage` 先红，失败原因为工程图模板仍走 Markdown 并显示旧状态。
- `npm --workspace frontend-user run test -- graphTemplateApplication` 通过，1 个文件、2 个用例通过。
- `npm --workspace frontend-user run test -- GraphWorkspacePage` 通过，1 个文件、8 个用例通过。
- `npm --workspace frontend-user run test -- graphTemplateApplication GraphWorkspacePage GraphWorkspaceShell GraphWorkspaceImportPanel useGraphImportExport` 通过，5 个文件、21 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 工程图模板现在已从“展示卡”进入现有 Mermaid 导入草稿链路，后续可继续补 SQL/OpenAPI 草稿解析和模式专属校验。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-30 20:33:01 +08:00 | v1.1.0-alpha.56 | 增强工程图模板中心信息
### 任务内容
- 继续推进 v0.8 工程图能力，在不新增端点、不引入新库、不实现 SQL/OpenAPI 导入的前提下，让已有模板中心具备专业工程图模板和更可读的预览信息。
- 保持 `DiagramTemplatePayload` 合约不变，继续通过 `/diagram/templates` 返回模板列表。
### 完成结果
- 在 `ListDiagramTemplates` 中新增 UML 类图、ERD 数据模型、C4 上下文图和流程图 4 个工程图模板，`mode` 使用 `diagram`，`category` 分别为 `uml/erd/c4/flowchart`。
- 更新 `GraphWorkspaceSourceRail` 模板卡片，展示“学习闭环/工程图 + category”的模式标签，并显示前三条 `sampleLines` 骨架预览。
- 补充后端 service 测试和前端 SourceRail 测试，覆盖专业模板存在、分类正确、样例线不少于 4 条，以及前端模式/预览展示和点击套用回调。
### 验证结果
- `go test ./internal/modules/graph/service` 先红，失败原因为工程图模板列表为空。
- `npm --workspace frontend-user run test -- GraphWorkspaceShell` 先红，失败原因为模板卡未显示“工程图 / uml”和样例骨架预览。
- `go test ./internal/modules/graph/service` 通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceShell` 通过，1 个文件、3 个用例通过。
- `go test ./internal/modules/graph/...` 通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceShell GraphWorkspacePage graphNodeTypes graphNodeMetadata` 通过，4 个文件、20 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 模板中心现在能同时服务学习闭环和工程图草稿，为后续模板应用生成工程图节点、图形库面板和 SQL/OpenAPI 导入草稿打基础。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-30 20:28:31 +08:00 | v1.1.0-alpha.55 | 支持工程图节点基础创建类型
### 任务内容
- 继续推进 P1/P2 交界的对象模型成熟度，让工程图节点不只存在于导入态 metadata 编辑中，也能通过现有图谱工具栏创建。
- 不引入模板中心、图形库面板、SQL/OpenAPI 导入或新后端端点，只扩展当前前端节点创建类型和 draft 配置。
### 完成结果
- 扩展 `GraphNodeCreationType`，新增 `diagram`。
- 更新 `graphNodeTypeOptions`，在新建节点下拉框中加入“工程图”，默认标题为“工程图节点”，尺寸为 280 × 160。
- 补充 `graphNodeTypes.test.ts` 和 `GraphWorkspaceShell.test.tsx`，覆盖工程图类型暴露、draft 构建和工具栏下拉回调。
### 验证结果
- `npm --workspace frontend-user run test -- graphNodeTypes GraphWorkspaceShell` 先红，失败原因为工程图选项缺失，`diagram` draft 回退为概念节点。
- `npm --workspace frontend-user run test -- graphNodeTypes GraphWorkspaceShell` 通过，2 个文件、6 个用例通过。
- `npm --workspace frontend-user run test -- graphNodeTypes graphNodeMetadata GraphWorkspaceShell GraphWorkspaceSelectionPanel GraphWorkspacePage graphWorkspaceMutations` 通过，6 个文件、31 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 工程图节点已进入现有画布创建入口，并可复用前一阶段的 `diagramKind/diagramShape/diagramSourceId` metadata 编辑；后续可以继续推进模板中心、图形库面板和导入草稿校验。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-30 20:25:23 +08:00 | v1.1.0-alpha.54 | 保留图谱卡片写入的结构化来源
### 任务内容
- 继续完善图谱节点生成卡片并参与复习的学习闭环，让确认写入复习卡片时，即使图谱节点没有显式 `source`，也能从结构化 metadata 保留来源。
- 不改变 `CommitGraphCardDraftsRequest`、card API 或 `.smtg` 合约，只增强后端 create card request 的来源推断。
### 完成结果
- 新增 `inferCardSourceFromMetadata`，在 `BuildCardCreateRequests` 中保留显式 `node.Source` 优先级；当显式来源缺失时，按 `noteId`、`cardId`、`materialId`、`aiDraftId`、`aiTaskId`、`diagramSourceId` 推断 `SourceType/SourceID`。
- 补充 service helper 测试，覆盖自由整理的 `rich-note` 节点只有 `metadata.content.noteId` 时，确认写入卡片仍生成 `note/note-1` 来源。
- 保持已有缺失节点、空白草稿和显式来源保留行为不变。
### 验证结果
- `go test ./internal/modules/graph/service` 先红，失败原因为 metadata fallback 未实现，create request 的 `SourceType/SourceID` 为空。
- `go test ./internal/modules/graph/service` 通过。
- `go test ./internal/modules/graph/...` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 图谱节点现在从“生成卡片草稿”到“确认写入复习卡片”都能携带来源线索，后续可以继续做 UI 层复习写入成功后的图谱反链提示或导入草稿校验展示。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-30 20:22:18 +08:00 | v1.1.0-alpha.53 | 让图谱卡片草稿携带结构化来源线索
### 任务内容
- 继续打通来源反链、结构化 metadata 与卡片生成/复习确认流，让图谱节点生成卡片草稿时能带出资料、笔记、卡片、AI 草稿和工程图导入等上下文。
- 不改变 `/graphs/:id/ai/generate-cards` 请求合约、Graph API 或 `.smtg` 文件格式，只增强后端草稿解释文案。
### 完成结果
- 新增 `BuildCardDraftExplanation`，在保留原有固定说明的基础上，从 `metadata.content` 按稳定顺序提取 `materialId`、`materialUrl`、`noteId`、`cardId`、`deckId`、`aiDraftId`、`aiTaskId`、`diagramKind`、`diagramShape` 和 `diagramSourceId`。
- 更新 `BuildCardDrafts`，生成 `GraphCardDraftPayload.explanation` 时追加“来源线索”，帮助用户在确认写入卡组前理解卡片草稿来自哪段学习闭环上下文。
- 补充后端 service helper 测试，锁定卡片节点的 `cardId/deckId/aiDraftId` 会进入草稿解释，避免结构化 metadata 只停留在前端编辑面板。
### 验证结果
- `go test ./internal/modules/graph/service` 先红，失败原因为草稿 explanation 仍是固定文案，未包含“卡片 ID card-1”等结构化线索。
- `go test ./internal/modules/graph/service` 通过。
- `go test ./internal/modules/graph/...` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 图谱节点的结构化 metadata 已进入卡片草稿确认流，后续可以继续把复习写入结果反链回图谱，或为导入草稿校验面板展示这些来源线索。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-30 20:16:44 +08:00 | v1.1.0-alpha.52 | 扩展图谱学习节点结构化 metadata 编辑
### 任务内容
- 继续推进节点对象模型和编辑面板成熟度，在不改变 Graph API 和 `.smtg` 合约的前提下，让资料、笔记、卡片、AI 草稿/任务和导入态工程图节点具备结构化 metadata 编辑入口。
- 保持现有 URL、图片、公式、PDF 锚点字段行为不变，并继续通过不可变更新写入 `metadata.content`。
### 完成结果
- 扩展 `GraphNodeMetadataField`，新增 `materialId`、`materialUrl`、`noteId`、`cardId`、`deckId`、`aiDraftId`、`aiTaskId`、`diagramKind`、`diagramShape` 和 `diagramSourceId`。
- 更新 `getGraphNodeMetadataEditorFields`，为 `material`、`rich-note`、`card`、`ai` 和导入态 `diagram` 节点返回类型化编辑字段；工程图字段只支持草稿/导入态编辑，不新增创建流程或后端端点。
- 补强 `GraphWorkspaceSelectionPanel` 组件测试，确认卡片节点会展示“卡片 ID / 卡组 ID”编辑框，并把变更委托给现有 `onNodeMetadataFieldChange`。
### 验证结果
- `npm --workspace frontend-user run test -- graphNodeMetadata` 先红，失败原因为学习节点和 `diagram` 节点仍返回空编辑字段。
- `npm --workspace frontend-user run test -- graphNodeMetadata` 通过，1 个文件、6 个用例通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 通过，1 个文件、5 个用例通过。
- `npm --workspace frontend-user run test -- graphNodeMetadata GraphWorkspaceSelectionPanel GraphWorkspacePage graphSourceBacklinks` 通过，4 个文件、22 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 学习闭环节点现在可以在选中面板中维护来源/卡组/AI 草稿等结构化字段，后续可继续把这些 metadata 与卡片生成、复习确认和导入草稿校验面板打通。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-30 20:12:21 +08:00 | v1.1.0-alpha.51 | 强化图谱来源反链学习闭环提示
### 任务内容
- 继续推进 P0 稳定治理，完善来源反链和学习闭环，让资料、PDF 批注、笔记、卡片、AI 草稿/任务节点不仅能跳回来源，也能解释当前处于学习闭环的哪一步。
- 不改变 Graph API、`.smtg` 合约或卡片生成接口，只增强前端来源反链模型和选中节点面板展示。
### 完成结果
- 扩展 `buildGraphSourceBacklink`，为资料、笔记、卡片、批注、PDF 锚点、AI 草稿和 AI 任务返回 `learningStepLabel` 与 `description`，补充“资料阅读 / 笔记沉淀 / 卡片复习 / 资料批注 / PDF 锚点 / AI 草稿确认 / AI 任务追踪”等学习阶段。
- 兼容 `ai-draft`、`ai_draft`、`ai-task`、`ai_task` 等来源类型别名，避免导入或 AI payload 使用不同命名时丢失反链。
- 更新 `GraphWorkspaceSelectionPanel` 的单节点来源卡片，展示来源类型、来源 ID、学习阶段和下一步说明，并保留原有跳转按钮；现有“生成卡片草稿 / 确认写入卡组”仍由快照与草稿面板承接。
### 验证结果
- `npm --workspace frontend-user run test -- graphSourceBacklinks GraphWorkspaceSelectionPanel` 先红，失败原因为缺少学习阶段/说明字段，且 `ai-draft` 别名未识别。
- `npm --workspace frontend-user run test -- graphSourceBacklinks GraphWorkspaceSelectionPanel` 通过，2 个文件、8 个用例通过。
- `npm --workspace frontend-user run test -- GraphWorkspacePage GraphWorkspaceSourceSummary GraphWorkspaceRecoveryPanel graphSourceBacklinks GraphWorkspaceSelectionPanel` 通过，5 个文件、20 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 选中节点面板现在能把来源跳转和学习闭环串起来，后续可以继续扩展节点对象模型和编辑面板，让 URL、图片、公式、PDF 锚点、卡片、资料、笔记、AI 草稿和工程图节点保持更统一的结构化 metadata。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-12 01:22:43 +08:00 | v1.1.0-alpha.50 | 增强图谱历史与保存边界摘要
### 任务内容
- 继续推进 P0 稳定治理，强化 autosave/dirty/pending/saved/failed 与 Undo/Redo 边界的可解释性。
- 不改变 Graph API、`.smtg` 合约或后端保存逻辑，只为前端工作区提供稳定的历史边界摘要，让保存、导入、恢复、模板应用等历史点能在治理面板中被解释。
### 完成结果
- 新增 `buildGraphHistoryBoundarySummary`，将 `history.lastLabel`、undo/redo 数量和当前 saveState 转换为可读的最近历史点、保存边界和风险提示。
- 扩展 `buildGraphSettingsSections` 的 autosave 区域，展示最近历史点、历史边界和 Undo/Redo 状态。
- 更新 `useGraphWorkspaceController.tsx`，把当前 `historyState` 和 `saveState` 传入设置面板，保持现有保存、导入、恢复和撤销/重做行为不变。
### 验证结果
- `npm --workspace frontend-user run test -- graphHistory graphSettingsPanel` 先红，失败原因为缺少 `buildGraphHistoryBoundarySummary`，且 autosave 设置区未展示最近历史点。
- `npm --workspace frontend-user run test -- graphHistory graphSettingsPanel` 通过，2 个文件、9 个用例通过。
- `npm --workspace frontend-user run test -- graphHistory graphSettingsPanel GraphWorkspacePanels GraphWorkspacePage useGraphWorkspacePersistence` 通过，5 个文件、23 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 设置面板现在能同时解释保存状态和历史边界，后续可以继续完善来源反链与学习闭环，把图谱节点到卡片生成/复习确认流做成更强的端到端体验。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-12 01:16:12 +08:00 | v1.1.0-alpha.49 | 强化图谱校验面板解释信息
### 任务内容
- 继续推进 P0 稳定治理，强化 GraphWorkspace validation panel，让孤立节点、缺来源、重复标题、悬挂边、跨折叠分组边、空分组、非法尺寸、无效来源 target 和多目标边异常等问题具备可读解释。
- 不改变后端校验、Graph API 或 `.smtg` 合约，只增强用户端规则解释、严重级说明、定位提示和修复建议。
### 完成结果
- 扩展 `frontend-user/src/modules/graph/lib/graphValidationPanel.ts`，为现有校验 ruleType 增加中文规则名、severity 文案、影响说明、target 摘要和修复建议，并保留未知规则 fallback。
- 更新 `GraphValidationIssueList`，规则汇总显示中文名称，单条问题显示“定位 / 影响 / 修复建议”，让导入失败和校验失败更可解释。
- 更新 `GraphWorkspacePanels.test.tsx`、`GraphWorkspaceImportPanel.test.tsx` 和 `graphValidationPanel.test.ts`，覆盖规则解释、产品化规则清单、导入面板校验展示和空态回归。
### 验证结果
- `npm --workspace frontend-user run test -- graphValidationPanel GraphWorkspacePanels` 先红，失败原因为面板仍显示原始 `ruleType`，缺少中文规则名、影响和修复建议。
- `npm --workspace frontend-user run test -- graphValidationPanel GraphWorkspacePanels` 通过，2 个文件、7 个用例通过。
- `npm --workspace frontend-user run test -- graphValidationPanel GraphWorkspacePanels GraphWorkspacePage graphFileImportExport GraphWorkspaceImportPanel` 通过，5 个文件、23 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 校验面板已从原始规则列表升级为可解释治理面板，后续可以继续推进 autosave/dirty/pending/saved/failed 与 Undo/Redo 边界硬化。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-12 01:08:52 +08:00 | v1.1.0-alpha.48 | 强化图谱设置面板治理信息
### 任务内容
- 继续推进 P0 稳定治理，在不改变 Graph API 和 `.smtg` 合约的前提下，把 GraphWorkspace 设置面板从说明清单增强为更清晰的工作区治理区域。
- 聚焦显示偏好、导入导出、autosave 状态和大图性能提示，让失败导入/导出、pending/failed 保存和 200/300/20 基准规模具备可解释文案。
### 完成结果
- 扩展 `frontend-user/src/modules/graph/lib/graphSettingsPanel.ts`，为每个设置分区增加 `summary` 和 `actions`，覆盖小地图、来源泳道、快捷键、JSON 校验、导入失败保留当前画布、导出失败状态回写、dirty/pending/failed 保存治理和大图整理建议。
- 更新 `GraphSettingsPanel` 渲染摘要和状态标签，让设置面板更清楚地区分显示、导入导出、自动保存、性能和快捷键区域。
- 补强 `graphSettingsPanel.test.ts` 和 `GraphWorkspacePanels.test.tsx`，锁定 failed/pending 保存状态、大图性能建议、导入导出失败解释和设置标签渲染。
### 验证结果
- `npm --workspace frontend-user run test -- graphSettingsPanel` 先红，失败原因为设置分区缺少 `summary/actions` 和 failed/pending 保存治理语义。
- `npm --workspace frontend-user run test -- graphSettingsPanel GraphWorkspacePanels` 通过，2 个文件、7 个用例通过。
- `npm --workspace frontend-user run test -- graphSettingsPanel GraphWorkspacePanels GraphWorkspacePage GraphWorkspaceShell` 通过，4 个文件、16 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run verify:docs` 通过。
- `git diff --check` 通过，仅有既有 CRLF 提示。
### 后续影响
- 设置面板已更接近 Project Graph 级工作区治理入口，后续可以继续强化 validation panel 的规则中文名、严重级说明、定位动作和修复建议。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-12 01:02:24 +08:00 | v1.1.0-alpha.47 | 拆出图谱节点连线分组 mutation
### 任务内容
- 从 P0 稳定治理开始，继续拆 `useGraphWorkspaceController.tsx` 中的 node/edge/group 新增、删除、复制、连线、分组和折叠 mutation。
- 保持现有 React + Vite + TypeScript、`@studymate/graph-core`、Graph API 和 `.smtg` 合约不变，只把工作区选择态、history label、status 文案和不可变更新封装到前端纯函数。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphWorkspaceMutations.ts`，提供创建节点、创建连线、删除选中节点/连线、删除右键节点、复制节点、创建分组和切换分组折叠的工作区 mutation 结果。
- 新增 `graphWorkspaceMutations.test.ts`，覆盖新增节点、连线去重失败解释、删除节点清理边和分组、删除连线、复制节点 metadata 深拷贝、单/多节点分组和折叠 no-op。
- 更新 `useGraphWorkspaceController.tsx`，相关动作改为调用纯函数，并通过统一 `applyWorkspaceMutation` 同步文档、选择态、连线模式、选中边和状态文案；本轮统计从约 1603 行下降到 1596 行。
### 验证结果
- `npm --workspace frontend-user run test -- graphWorkspaceMutations` 先红，失败原因为 `graphWorkspaceMutations` 模块尚不存在。
- `npm --workspace frontend-user run test -- graphWorkspaceMutations` 绿，1 个文件、7 个用例通过。
- `npm --workspace frontend-user run test -- graphWorkspaceMutations GraphWorkspacePage useGraphKeyboardActions useGraphContextMenu` 通过，4 个文件、19 个用例通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run build:user` 通过。
### 后续影响
- 图谱节点/连线/分组的核心工作区变更已有独立纯函数和 immutability 回归，后续可以继续把 settings panel、validation panel、autosave/history 边界按同样 TDD 小切片推进。
- 当前仍不进入多人协作、CRDT、WebGL/Pixi、Tauri 桌面端、Project Graph `.prg` 兼容或插件市场。

## 2026-06-06 18:32:23 +08:00 | v1.1.0-alpha.46 | 拆出图谱批量样式变更逻辑
### 任务内容
- 继续推进图谱工作区 Phase 1 和 Project Graph 级批量编辑体验，把选中节点颜色、强调和尺寸 preset 的批量 mutation 从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有 tone、emphasis、size preset 语义、未选中节点引用不变和不可变更新行为，不改 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphBatchAppearance.ts`，提供 `applyGraphBatchTone`、`applyGraphBatchEmphasis` 和 `applyGraphBatchSizePreset` 纯函数。
- 新增 `graphBatchAppearance.test.ts`，覆盖批量 tone、批量 emphasis 保留已有 tone、批量尺寸 preset，以及未选中节点引用不变。
- 更新 `useGraphWorkspaceController.tsx`，移除内联批量样式 map 逻辑；controller 从 1488 行继续下降到 1486 行。
### 验证结果
- `npm --workspace frontend-user run test -- graphBatchAppearance` 先红后绿，最终 1 个文件、3 个用例通过。
- `npm --workspace frontend-user run test -- graphBatchAppearance GraphWorkspaceSelectionPanel GraphWorkspacePage` 通过，3 个文件、14 个用例全部通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，39 个用户端测试文件、121 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- 批量外观编辑已成为可测试纯逻辑，后续可以继续拆 node/edge/group mutations，包括新增、删除、复制、分组、折叠和连线。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 13:30:59 +08:00 | v1.1.0-alpha.45 | 拆出图谱来源泳道文档变更逻辑
### 任务内容
- 继续推进图谱工作区 Phase 1 和学习闭环来源组织能力，把来源泳道生成后的节点位置、生成分组替换和选择态回写从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有来源泳道布局、旧生成泳道替换、手动分组保留、生成分组 metadata、节点引用保留和不可变更新行为，不改 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphSourceSwimlanes.ts`，提供 `buildGraphSourceSwimlaneDocument` 纯函数，封装 graph-core 泳道布局到前端文档变更的映射。
- 新增 `graphSourceSwimlanes.test.ts`，覆盖生成来源泳道、替换重叠旧生成泳道、保留手动分组、保留未选中节点引用，以及选中节点不足时返回原文档。
- 更新 `useGraphWorkspaceController.tsx`，移除内联来源泳道 layoutNodes、旧泳道过滤和 group payload 复制逻辑；controller 从 1505 行继续下降到 1488 行。
### 验证结果
- `npm --workspace frontend-user run test -- graphSourceSwimlanes` 先红后绿，最终 1 个文件、2 个用例通过。
- `npm --workspace frontend-user run test -- graphSourceSwimlanes graphSourceLayout GraphWorkspaceSelectionPanel GraphWorkspacePage` 通过，4 个文件、16 个用例全部通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，38 个用户端测试文件、118 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- 来源整理、来源分组和来源泳道已形成连续的可测试来源组织逻辑，后续可以继续拆批量样式和 node/edge/group mutations。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 13:21:03 +08:00 | v1.1.0-alpha.44 | 拆出图谱来源布局与分组逻辑
### 任务内容
- 继续推进图谱工作区 Phase 1 和学习闭环整理能力，把按来源类型分列/分行整理、来源分组生成的坐标和分组计算从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有来源 bucket 顺序、来源标签排序、未选中节点不变、来源分组标题、画布边界 clamp 和不可变更新行为，不改 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphSourceLayout.ts`，提供 `organizeGraphNodesBySource` 和 `buildGraphSourceGroups` 纯函数。
- 新增 `graphSourceLayout.test.ts`，覆盖按来源类型分列、按来源类型分行、未选中节点引用不变、原节点不变，以及来源分组边界和 `makeGroupId`。
- 更新 `useGraphWorkspaceController.tsx`，移除内联来源整理 placement、来源分组 bounds 和 group payload 生成逻辑；controller 从 1576 行继续下降到 1505 行。
### 验证结果
- `npm --workspace frontend-user run test -- graphSourceLayout` 先红后绿，最终 1 个文件、3 个用例通过。
- `npm --workspace frontend-user run test -- graphSourceLayout GraphWorkspaceSelectionPanel GraphWorkspacePage` 通过，3 个文件、14 个用例全部通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，37 个用户端测试文件、116 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- 来源整理与来源分组已成为可测试纯逻辑，后续可以继续拆来源泳道生成、批量样式和 node/edge/group mutations。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 13:11:46 +08:00 | v1.1.0-alpha.43 | 拆出图谱选中节点布局逻辑
### 任务内容
- 继续推进图谱工作区 Phase 1 和 Project Graph 级批量编辑体验，把选中节点对齐与均分的坐标计算从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有左对齐、顶部对齐、水平居中、垂直居中、水平/垂直均分、画布边界 clamp 和不可变更新行为，不改 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphSelectionLayout.ts`，提供 `alignSelectedGraphNodes` 和 `distributeSelectedGraphNodes` 纯函数。
- 新增 `graphSelectionLayout.test.ts`，覆盖对齐不修改未选中节点、居中对齐边界 clamp、水平均分稳定顺序，以及选中数量不足时返回原节点数组。
- 更新 `useGraphWorkspaceController.tsx`，移除内联对齐/均分坐标计算和节点 map 变更逻辑；controller 从 1643 行继续下降到 1576 行。
### 验证结果
- `npm --workspace frontend-user run test -- graphSelectionLayout` 先红后绿，最终 1 个文件、4 个用例通过。
- `npm --workspace frontend-user run test -- graphSelectionLayout GraphWorkspaceSelectionPanel GraphWorkspacePage` 通过，3 个文件、15 个用例全部通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，36 个用户端测试文件、113 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- 选中节点布局编辑已成为可测试纯逻辑，后续可以继续拆按来源整理、来源分组、批量样式和 node/edge/group mutations。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 13:03:53 +08:00 | v1.1.0-alpha.42 | 拆出图谱拖动文档变更逻辑
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把单节点/多节点拖动时的坐标计算、吸附辅助线、边界 clamp 和下一版节点列表生成从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有拖动时不记录 history、状态提示、viewport zoom delta、对齐吸附、隐藏节点过滤和不可变更新行为，不改 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphDragMove.ts`，提供 `buildGraphDragMove` 纯函数，统一返回 `nodes`、`alignmentGuides` 和拖动状态文案。
- 新增 `graphDragMove.test.ts`，覆盖单节点按 viewport zoom 移动且不修改原文档、多节点按 origins 移动并 clamp 到画布边界。
- 更新 `useGraphWorkspaceController.tsx`，移除内联单节点/多节点拖动坐标计算、吸附计算和节点 map 变更逻辑；controller 从 1689 行继续下降到 1643 行。
### 验证结果
- `npm --workspace frontend-user run test -- graphDragMove` 先红后绿，最终 1 个文件、2 个用例通过。
- `npm --workspace frontend-user run test -- graphDragMove useGraphDragState GraphWorkspacePage GraphWorkspaceStageChrome graphKeyboardShortcuts` 通过，5 个文件、19 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，35 个用户端测试文件、109 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- 节点拖动的文档变更已经成为可测试纯逻辑，后续可以继续拆 pan/marquee pointer effect、节点/边/分组 mutations 和拖动性能节流。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 12:55:35 +08:00 | v1.1.0-alpha.41 | 拆出图谱拖拽状态 Hook
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把画布拖拽状态、框选框和对齐辅助线状态从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有画布平移、Shift 框选、单节点拖动、多节点拖动、对齐辅助线、Escape 清理和拖拽取消行为，不改 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/hooks/useGraphDragState.ts`，统一管理 `dragState`、`selectionBox`、`alignmentGuides`、`beginMarquee`、`updateMarquee`、`beginPan`、`beginNodeDrag`、`beginMultiNodeDrag` 和 `clearActiveDrag`。
- 新增 `useGraphDragState.test.tsx`，覆盖框选开始/更新、画布平移、单节点拖拽、多节点拖拽、辅助线设置和清理。
- 更新 `useGraphWorkspaceController.tsx`，移除本地 drag/selectionBox/alignmentGuides state 和直接构造 DragState 的代码；controller 从 1719 行继续下降到 1689 行。
### 验证结果
- `npm --workspace frontend-user run test -- useGraphDragState` 先红后绿，最终 1 个文件、2 个用例通过。
- `npm --workspace frontend-user run test -- useGraphDragState GraphWorkspacePage GraphWorkspaceStageChrome graphKeyboardShortcuts` 通过，4 个文件、17 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，34 个用户端测试文件、107 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- pointer drag 的状态边界已经独立，后续可以继续拆移动时的文档变更、对齐吸附计算和 node/edge/group mutations，把大型 controller 继续压缩到编排层。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 12:45:34 +08:00 | v1.1.0-alpha.40 | 拆出图谱节点选择状态 Hook
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把节点单选、多选 toggle、显式多选、框选命中和节点选择时清理边选择的行为从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有键盘全选、来源泳道整理后选择、框选、多选拖动、复制节点、右键删除节点和边选择清理行为，不改 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/hooks/useGraphSelectionState.ts`，统一管理 `selectedNodeId`、`selectedNodeIds`、`selectSingleNode`、`toggleNodeSelection`、`selectNodeIds`、`selectNodesInWorldRect`、`clearNodeSelection` 和 `resetNodeSelection`。
- 新增 `useGraphSelectionState.test.tsx`，覆盖单选、toggle 多选、清空、重置、显式多选、隐藏节点过滤和框选矩形命中。
- 更新 `useGraphWorkspaceController.tsx`，移除本地节点选择 state 和直接调用 graph-core selection helper 的代码；键盘全选、来源泳道、框选、节点拖动、复制节点和右键删除节点改为通过 `useGraphSelectionState` 分发；controller 从 1736 行继续下降到 1719 行。
### 验证结果
- `npm --workspace frontend-user run test -- useGraphSelectionState` 先红后绿，最终 1 个文件、2 个用例通过。
- `npm --workspace frontend-user run test -- useGraphSelectionState GraphWorkspacePage GraphWorkspaceSelectionPanel GraphWorkspaceStageChrome graphKeyboardShortcuts` 通过，5 个文件、21 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，33 个用户端测试文件、105 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- selection/marquee/multi-select 已有独立状态 hook，后续可以继续拆画布 pointer drag 状态机和 node/edge/group mutations，把大型 controller 继续压缩到编排层。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 08:25:31 +08:00 | v1.1.0-alpha.39 | 拆出图谱 Camera 与视口 Hook
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把小地图 viewport、节点聚焦、滚轮缩放、工具栏缩放、重置视野和导航 focus preview 从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有聚焦节点、搜索定位、键盘重置视野、工具栏缩放、小地图显示和来源跳转落点预览行为。
### 完成结果
- 新增 `frontend-user/src/modules/graph/hooks/useGraphViewportCamera.ts`，统一管理 `minimapViewport`、`focusPreview`、`focusNode`、`zoomGraph`、`resetViewport` 和 `handleWheel`。
- 新增 `useGraphViewportCamera.test.tsx`，覆盖小地图 ready 状态、节点聚焦选择与视口变更、按钮/滚轮缩放、重置视野、导航 focus preview 消费和 2600ms 后过期。
- 更新 `useGraphWorkspaceController.tsx`，移除本地 minimap 计算、focus preview effect、`focusNode`、`zoomGraph` 和 `handleWheel`，改用 `useGraphViewportCamera`；controller 从 1804 行继续下降到 1736 行。
- 修正 focus preview 计时器边界：预览触发导致 `graphDetail` 更新时不再清掉过期定时器，预览状态会按预期自动消失。
### 验证结果
- `npm --workspace frontend-user run test -- useGraphViewportCamera` 先红后绿，最终 3 个 hook 用例通过。
- `npm --workspace frontend-user run test -- useGraphViewportCamera GraphWorkspacePage GraphWorkspaceStageChrome graphKeyboardShortcuts` 通过，4 个文件、18 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，32 个用户端测试文件、103 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- camera/viewport 已成为独立 hook，后续可以继续拆 selection/marquee/multi-select 和 node/edge/group mutations 状态机，把大型 controller 进一步压到更接近编排层。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 08:06:34 +08:00 | v1.1.0-alpha.38 | 拆出图谱右键菜单状态 Hook
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把右键菜单打开、定位、节点/边选择联动、显式关闭和外部点击/滚动关闭从 `useGraphWorkspaceController.tsx` 中下沉。
- 保留现有右键菜单 UI、节点/边/画布右键入口和菜单动作回调，不改变 Graph API 或图谱文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/hooks/useGraphContextMenu.ts`，统一管理 context menu 状态、`openContextMenu`、`closeContextMenu` 和 dismiss 生命周期。
- 新增 `useGraphContextMenu.test.tsx`，覆盖节点/边/画布右键菜单坐标、节点/边选择回调、显式关闭、外部点击关闭和滚动关闭。
- 更新 `useGraphWorkspaceController.tsx`，移除本地 `contextMenu` state、旧 `openContextMenu` 函数和内联 dismiss effect，改用 `useGraphContextMenu`；controller 从 1822 行继续下降到 1804 行。
- 清理 `useGraphWorkspaceEffects.ts` 中不再使用的 `useGraphContextMenuDismiss`。
### 验证结果
- `npm --workspace frontend-user run test -- useGraphContextMenu` 先红后绿，最终 2 个 hook 用例通过。
- `npm --workspace frontend-user run test -- useGraphContextMenu GraphWorkspacePage GraphWorkspacePanels GraphWorkspaceStageChrome` 通过，4 个文件、17 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，31 个用户端测试文件、100 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- 右键菜单输入生命周期已成为独立 hook，后续可以继续把菜单动作分发、selection/marquee/multi-select 和 camera/viewport 状态机从大型 controller 中移出。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 07:56:20 +08:00 | v1.1.0-alpha.37 | 拆出图谱键盘快捷键 Hook
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把全局 `keydown` 监听、快捷键上下文判断和 action 分发从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有保存、Undo/Redo、全选、删除、聚焦、分组、链路模式、重置视野、键盘帮助和 Escape 清理行为。
### 完成结果
- 新增 `frontend-user/src/modules/graph/hooks/useGraphKeyboardActions.ts`，统一承接 `resolveGraphKeyboardShortcut` 的 action 分发和 keydown 生命周期。
- 新增 `useGraphKeyboardActions.test.tsx`，覆盖输入框内仍可保存/撤销/重做、输入框内忽略画布编辑快捷键、选择/聚焦/分组/链路/重置/Escape 等常用操作。
- 更新 `useGraphWorkspaceController.tsx`，移除内联 keydown effect，改为向 `useGraphKeyboardActions` 传递当前选择态、可见节点和动作回调；controller 从 1857 行继续下降到 1822 行。
### 验证结果
- `npm --workspace frontend-user run test -- useGraphKeyboardActions` 先红后绿，最终 3 个 hook 用例通过。
- `npm --workspace frontend-user run test -- useGraphKeyboardActions graphKeyboardShortcuts GraphWorkspacePage GraphWorkspaceShell GraphWorkspacePanels` 通过，5 个文件、20 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，30 个用户端测试文件、98 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- 快捷键行为已经成为独立 hook，后续可以继续拆 context menu 和 selection/marquee 状态机，逐步把成熟编辑器的输入与选择操作从 controller 中移出。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 07:41:41 +08:00 | v1.1.0-alpha.36 | 拆出图谱导入导出执行 Hook
### 任务内容
- 继续推进图谱工作区 Phase 1 和 Phase 5 拆分，把 Markdown/Mermaid 远端导入、StudyMate JSON 本地导入、PNG/SVG/JSON 导出和导出失败状态从 `useGraphWorkspaceController.tsx` 下沉。
- 保留现有 Graph API、`.smtg` / `application/vnd.studymate.graph+json` 文件合约、JSON 导入校验和 Markdown/Mermaid 导入后快照刷新行为。
### 完成结果
- 新增 `frontend-user/src/modules/graph/hooks/useGraphImportExport.ts`，统一管理 JSON/Markdown/Mermaid 导入、PNG/SVG/JSON 导出、安全文件名和导入导出状态提示。
- 新增 `useGraphImportExport.test.tsx`，覆盖 JSON 导入成功、JSON 阻断错误、Markdown 远端导入并刷新快照、PNG/SVG/JSON 安全文件名导出，以及空内容/下载/PNG 渲染失败状态。
- 更新 `useGraphWorkspaceController.tsx`，移除本地导入导出函数体，改为转发 `useGraphImportExport` 操作；controller 从 1938 行继续下降到 1857 行。
### 验证结果
- `npm --workspace frontend-user run test -- useGraphImportExport` 先红后绿，最终 5 个 hook 用例通过。
- `npm --workspace frontend-user run test -- useGraphImportExport GraphWorkspacePage GraphWorkspaceImportPanel graphFileImportExport graphCanvasExport` 通过，5 个文件、23 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，29 个用户端测试文件、95 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- 导入导出执行逻辑已经形成独立边界，后续可以继续拆 keyboard/context menu/selection 状态机，并把文件成熟度测试扩展到更大图导出耗时与失败场景。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 07:25:40 +08:00 | v1.1.0-alpha.35 | 拆出图谱保存与快照持久化 Hook
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把保存、保存状态、自动保存生命周期、离页保护、快照列表加载和快照恢复从 `useGraphWorkspaceController.tsx` 中拆到独立 hook。
- 保留现有 Graph API、`.smtg` 文件格式、保存/恢复 UI 和状态提示行为，不改变导入、切图、创建图谱等调用方契约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`，统一管理 `idle/dirty/pending/saved/failed` 保存态中的 `pending/saved/failed` 转换、`saving`、快照列表、手动/自动保存和快照恢复。
- 新增 `useGraphWorkspacePersistence.test.tsx`，覆盖保存后标记 history saved 并刷新快照、快照恢复走统一 reset history 路径、快照列表/恢复 API 失败时保留可编辑状态并显示失败。
- 更新 `useGraphWorkspaceController.tsx`，移除本地保存/快照状态和 `saveCurrentGraph` / `handleRestoreSnapshot` 实现，改用 `useGraphWorkspacePersistence` 返回的操作；controller 从 2012 行继续下降到 1938 行。
### 验证结果
- `npm --workspace frontend-user run test -- useGraphWorkspacePersistence` 先红后绿，最终 3 个 hook 用例通过。
- `npm --workspace frontend-user run test -- useGraphWorkspacePersistence GraphWorkspacePage GraphWorkspaceRecoveryPanel GraphWorkspaceShell` 通过，4 个文件、14 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，28 个用户端测试文件、90 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- 保存、自动保存、离页保护和快照恢复已经从大型 controller 中形成独立边界，后续可以继续把导入执行分支下沉为 `useGraphImportExport`，并进一步拆分 keyboard/context menu/selection 状态机。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 00:42:51 +08:00 | v1.1.0-alpha.34 | 拆出图谱导入与校验面板
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，把右侧 rail 中的 Markdown/Mermaid/JSON 导入、导入文本区、导入按钮、校验按钮和验证结果列表从 `useGraphWorkspaceController.tsx` 中拆出。
- 保留现有导入模式、导入源文本、保存中禁用、校验图谱和验证面板展示行为，不改变 Graph API 或 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/components/GraphWorkspaceImportPanel.tsx`，承接导入格式 segmented control、可访问 textarea、导入/校验操作和 `GraphValidationIssueList`。
- 新增 `GraphWorkspaceImportPanel.test.tsx`，覆盖导入模式切换、导入内容变更、导入/校验回调、保存中禁用和验证问题展示。
- 更新 `useGraphWorkspaceController.tsx`，把导入与校验 JSX 替换为 `GraphWorkspaceImportPanel` 调用，controller 继续下降到 2012 行。
### 验证结果
- `npm --workspace frontend-user run test -- GraphWorkspaceImportPanel` 先红后绿，最终 3 个组件用例通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceImportPanel GraphWorkspacePage GraphWorkspacePanels` 通过，3 个文件、14 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，workspace typecheck 和文档校验均通过。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，27 个用户端测试文件、87 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- 导入与校验 UI 已成为独立组件，后续可以继续把 `handleImport` / JSON-Mermaid-Markdown 分支下沉到 `useGraphImportExport`，进一步减少 controller 中的副作用逻辑。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证拆分。

## 2026-06-06 00:34:54 +08:00 | v1.1.0-alpha.33 | 拆出图谱节点与连线详情面板
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，优先把右侧 rail 中的“选中内容 / 节点与连线”详情编辑区从 `useGraphWorkspaceController.tsx` 中下沉为纯视图组件。
- 保留现有节点标题、笔记、URL/图片/公式/PDF metadata、颜色、强调、尺寸、边标签、边形态、分组标题、分组折叠、多选整理和来源反链行为。
### 完成结果
- 新增 `frontend-user/src/modules/graph/components/GraphWorkspaceSelectionPanel.tsx`，承接单节点详情、多选批量操作、边详情编辑、分组列表和空态操作提示。
- 新增 `GraphWorkspaceSelectionPanel.test.tsx`，覆盖节点标题/URL metadata 编辑、来源反链回调、边标签/直线曲线回调、多选来源整理、分组标题编辑和空态提示。
- 更新 `useGraphWorkspaceController.tsx`，把详情 rail JSX 替换为 `GraphWorkspaceSelectionPanel` 调用，controller 只保留不可变 document mutation、history 和保存状态回调。
- 清理 controller 中随详情面板拆出后不再需要的图标、节点样式和 metadata 展示 imports。
- 文件规模继续下降：`useGraphWorkspaceController.tsx` 从 2321 行降到 2049 行，新增详情组件 497 行，符合普通业务组件 500 行内的阶段目标。
### 验证结果
- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 先红后绿，最终 4 个组件用例通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel GraphWorkspacePage GraphWorkspaceRecoveryPanel GraphWorkspaceSourceSummary` 通过，4 个文件、16 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run lint` 通过，包含全工作区 typecheck 和文档同步验证。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm run test:user` 通过，26 个用户端测试文件、84 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- 节点/连线详情编辑已经有独立组件和测试保护，后续可以继续把 controller 内的画布 pointer drag、marquee、多选状态机和导入导出 hook 拆出。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证的局部演进。

## 2026-06-06 00:17:47 +08:00 | v1.1.0-alpha.32 | 拆分图谱核心模块并补编辑器成熟度回归
### 任务内容
- 继续执行 StudyMate 图谱工作区 Project Graph 对标计划，优先处理 `@studymate/graph-core` 单文件过大的结构风险，并补前端节点/连线编辑、后端请求边界和 E2E 失败状态覆盖。
- 保持现有 Graph API、`.smtg` schemaVersion 1 和前端 `GraphWorkspacePage` 入口兼容，不引入 WebGL/Pixi、CRDT、Tauri 或 `.prg` 兼容。
### 完成结果
- 新增 `packages/graph-core/src/model.ts`、`source.ts`、`mutations.ts`、`validation.ts`、`file-format.ts`、`history.ts`、`templates.ts`、`fixtures.ts`、`selection.ts`、`viewport.ts` 和 `utils.ts`，把原 `index.ts` 拆成聚焦模块并保留 barrel 导出。
- 新增 `packages/graph-core/test/graphCoreModules.test.ts`，锁定模块化入口仍能暴露文档规范化、验证、`.smtg` 导入导出、history、模板、fixture、selection 和 viewport 能力。
- 更新用户端图谱页面测试，覆盖选中 URL 节点后编辑标题和类型 metadata、选中边后编辑关系标签和直线/曲线形态，并验证保存 payload。
- 扩展 `e2e/v1-graph-workspace.spec.ts`，在 200 节点、300 边、20 分组 smoke 中补快捷键面板、JSON 导入失败、快照恢复失败和来源反链跳转。
- 更新后端 graph handler，无效 JSON/binding 请求统一返回 400 `invalid_graph_request`，避免图谱保存、恢复、导入和 AI 草稿入口把客户端错误误报为 500。
- 更新后端图谱校验 helper，`metadata.targetNodeIds` 同时兼容 JSON 解码得到的 `[]any` 和服务内部构造的 `[]string`，避免多目标边漏检悬挂目标。
- 更新 `frontend-user/tsconfig.json`，允许前端 noEmit typecheck 消费 graph-core 内部 `.ts` 模块 import。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 通过，27 个 graph-core 用例全部通过。
- `npm --workspace frontend-user run test -- GraphWorkspacePage` 通过，7 个页面级图谱用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `cd backend && go test ./internal/modules/graph/...` 通过。
- `npm run lint` 通过，包含全工作区 typecheck 和文档同步验证。
- `npm run build:user` 通过。
- `npm run test:user` 通过，25 个用户端测试文件、80 个用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含扩展后的 200 节点图谱 smoke。
### 后续影响
- `graph-core` 最大实现文件已降到约 220 行，后续可以按模块继续补文件格式、验证和性能 fixture 测试，而不再把逻辑压回单一入口。
- 图谱前端的节点/连线详情编辑已有页面级回归保护，下一步适合继续把详情 rail 从 controller 中拆成容器和纯视图组件。
- 后端图谱请求边界更稳定，后续补 service 级持久化测试时仍建议先抽 repository/document interface，避免单元测试依赖真实 MySQL/Mongo。

## 2026-06-05 20:37:23 +08:00 | v1.1.0-alpha.31 | 拆出图谱右侧来源与恢复面板
### 任务内容
- 继续推进图谱工作区 Phase 1 拆分，优先把右侧 rail 中和学习闭环/恢复链路相关的纯展示区从 `useGraphWorkspaceController.tsx` 中拿出来。
- 保留当前来源反链、来源摘要、卡片草稿编辑、写入卡组和快照恢复行为，不改变现有 Graph API 与 `.smtg` 文件合约。
### 完成结果
- 新增 `frontend-user/src/modules/graph/components/GraphWorkspaceSourceSummary.tsx`，承接来源类型统计、孤立/无来源节点提示、前 5 个来源列表、来源反链按钮和空态。
- 新增 `frontend-user/src/modules/graph/components/GraphWorkspaceRecoveryPanel.tsx`，承接生成卡片草稿按钮、deck 选择、草稿问题/答案编辑、确认写入卡组和快照恢复列表。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，把来源摘要与快照/卡片草稿 UI 替换为组件调用，controller 从 2609 行继续降到 2487 行。
- 新增 `GraphWorkspaceSourceSummary.test.tsx` 与 `GraphWorkspaceRecoveryPanel.test.tsx`，覆盖来源统计、反链跳转回调、空态、来源折叠提示、卡片草稿编辑、确认写入和快照恢复回调。
- 更新 `docs/planning/VERSION_PLAN.md` 与 `docs/planning/versions/v0.6.0-graph-product.md`，同步记录右侧 rail 的来源摘要、快照恢复和卡片草稿面板已拆出。
### 验证结果
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceRecoveryPanel GraphWorkspaceSourceSummary GraphWorkspaceStageChrome GraphWorkspaceShell` 通过，4 个文件、11 个用例全部通过。
- `npm run lint` 通过，包含全工作区 typecheck 和文档同步验证。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，26 个 graph-core 用例全部通过。
- `npm run test:user` 通过，25 个文件、78 个用户端用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- 图谱来源摘要和恢复/卡片草稿链路现在有独立组件测试保护，后续可以继续拆节点/连线详情编辑区，而不需要同时触碰来源与恢复 UI。
- 当前仍不进入多人协作、WebGL/Pixi、Tauri 或 `.prg` 兼容，继续沿现有 Web 图谱架构做可验证的局部产品化。

## 2026-06-05 20:24:42 +08:00 | v1.1.0-alpha.30 | 拆出图谱画布 Stage 纯视图组件
### 任务内容
- 继续推进 StudyMate 图谱工作区 Project Graph 对标计划，优先拆分 `useGraphWorkspaceController.tsx` 的画布 JSX，避免继续把 stage status、world、minimap 和空态渲染堆在大型 controller 中。
- 保留现有节点、边、分组、框选、小地图、右键菜单、键盘指南和选择态行为，只把视图表面下沉到可测试组件。
### 完成结果
- 新增 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`，拆出 `GraphStageStatus`、`GraphStageCanvas`、`GraphStageMinimap` 和 `GraphStageEmptyState`。
- `GraphStageCanvas` 只接收文档、选中态、画布测量引用和事件回调；节点/边/分组 mutation、历史、保存和导入导出仍留在 controller，避免拆分时改变业务状态机。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，把 stage status/world/minimap/empty state 渲染替换为纯视图组件调用，controller 从 2785 行降到 2609 行。
- 新增 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`，覆盖状态条 aria-live、对齐提示、小地图选中态、空态提示，以及节点点击、边选择和分组折叠回调委托。
- 更新 `docs/planning/VERSION_PLAN.md` 与 `docs/planning/versions/v0.6.0-graph-product.md`，同步记录 stage 纯视图组件已拆出，右侧详情 rail 和画布交互状态机仍是后续拆分重点。
### 验证结果
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceStageChrome GraphWorkspaceShell` 通过，2 个文件、6 个用例全部通过。
- `npm run lint` 通过，包含全工作区 typecheck 和文档同步验证。
- `npm run build:user` 通过。
- `npm --workspace @studymate/graph-core run test` 通过，26 个 graph-core 用例全部通过。
- `npm run test:user` 通过，23 个文件、73 个用户端用例全部通过。
- `cd backend && go test ./...` 通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱 smoke。
### 后续影响
- 画布渲染表面现在具备独立组件测试保护，后续可以继续把 pointer drag、marquee、多选、context menu 和 detail rail 分别拆成更小 hook/component。
- 当前没有引入 WebGL/Pixi、CRDT、Tauri 或 `.prg` 兼容，仍沿现有 Web 图谱架构做局部演进。

## 2026-06-05 10:28:51 +08:00 | v1.1.0-alpha.29 | 补齐图谱工具栏扩展节点类型入口
### 任务内容
- 对齐 Project Graph 级节点编辑体验要求，把概念、笔记、资料、卡片、AI、图片、URL、公式、PDF 锚点九类 StudyMate 节点从散落在 controller 里的默认值收敛为统一配置。
- 避免继续增加主界面按钮堆，改用“节点类型下拉 + 新建按钮”的紧凑入口暴露扩展节点类型。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphNodeTypes.test.ts`，先以缺失 helper 形成 RED，再覆盖九类节点选项、默认标题/尺寸和来源 label 继承。
- 新增 `frontend-user/src/modules/graph/lib/graphNodeTypes.ts`，导出节点类型 union、配置列表、类型查询和 `buildGraphNodeDraft`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，新建节点流程复用节点类型配置，工具栏新增可访问的“选择新建节点类型”下拉和动态“新建X节点”按钮。
- 更新 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，覆盖从工具栏选择 URL 类型并创建 URL 节点后进入 dirty 保存状态。
- 更新 `frontend-user/src/styles/graph.css`，为节点类型下拉补充紧凑样式。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphNodeTypes.test.ts` 先红后绿，最终 3 个用例通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphKeyboardShortcuts.test.ts` 通过，2 个文件、9 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm run build:user` 通过。
### 后续影响
- 用户现在可以从主工具栏创建全部 StudyMate 产品化节点类型；后续可继续补节点详情面板中 URL/公式/PDF 锚点的专属字段编辑和键盘菜单入口。
- 节点类型配置已脱离大型 controller，后续导入、AI 草稿和模板也可复用同一套默认值。

## 2026-06-05 10:23:12 +08:00 | v1.1.0-alpha.28 | 下沉图谱 PNG 导出渲染边界
### 任务内容
- 继续拆分 `useGraphWorkspaceController.tsx`，把 PNG 导出中的 SVG Blob、Image 加载、canvas 绘制和 object URL 生命周期从 controller 中下沉为可测试 helper。
- 保留现有 PNG/SVG/JSON 导出入口和用户可见文案，重点降低导出失败时资源释放与浏览器 API 细节的回归风险。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphCanvasExport.test.ts`，先以缺失 helper 形成 RED，再覆盖 SVG 渲染成 PNG blob、canvas 尺寸、背景填充、图片绘制和失败时回收 object URL。
- 新增 `frontend-user/src/modules/graph/lib/graphCanvasExport.ts`，导出 `renderGraphPngBlobFromSvg`，并在 `finally` 中统一回收 object URL。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，PNG 导出按钮复用新 helper，controller 不再直接管理 Image/canvas/toBlob 细节。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphCanvasExport.test.ts` 先红后绿，最终 2 个用例通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/GraphWorkspacePage.test.tsx` 通过，2 个文件、8 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- PNG 导出能力具备浏览器资源生命周期单元测试保护；下一步适合继续把 SVG/JSON 下载包装、Markdown/Mermaid/JSON 导入状态和保存恢复流程拆成更小 hook。
- 大规模 Pixi/WebGL 迁移仍不进入当前阶段，继续按 DOM/SVG 局部优化路线推进。

## 2026-06-05 10:19:20 +08:00 | v1.1.0-alpha.27 | 抽出图谱工作区加载状态边界并完成全链验证
### 任务内容
- 延续图谱工作区 controller 拆分，把数据加载、初始图谱选择、详情规范化和快照失败 ready 文案从大型 hook 中下沉为可测试 helper。
- 在继续拆分前补跑图谱产品化最终验证链，确认上一阶段累计能力在当前仓库真实状态下仍可构建、测试和 E2E 打开。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphWorkspaceLoadState.test.ts`，先以缺失 helper 形成 RED，再覆盖请求图谱优先级、草稿牌组默认值、缺失 document 规范化和快照失败文案保留。
- 新增 `frontend-user/src/modules/graph/lib/graphWorkspaceLoadState.ts`，导出 `buildGraphWorkspaceResourceState`、`normalizeGraphWorkspaceDetail` 和 `buildGraphWorkspaceLoadedStatus`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，加载、创建首张图谱和切换图谱路径复用新 helper；保留保存、导入、恢复等既有逻辑不扩散本次改动范围。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 通过，26 个 graph-core 用例全部通过。
- `cd backend; go test ./...` 通过。
- `npm run lint` 通过，包含全工作区 typecheck 和文档同步验证。
- `npm run build:user` 通过。
- `npm run test:user` 通过，17 个文件、51 个用户端用例全部通过。
- `npm run test:e2e` 通过，6 个 Playwright 用例全部通过，包含 200 节点图谱打开与 JSON 导出 smoke。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphWorkspaceLoadState.test.ts` 先红后绿，最终 4 个用例通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts` 通过，2 个文件、8 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱加载状态边界已经从 controller 中继续下沉；`useGraphWorkspaceController.tsx` 仍约 114KB / 2971 行，下一步适合继续拆数据保存/导入导出 hook 或画布 pointer drag 状态。
- `.prg` 兼容、多目标边 UI、复杂自动布局、多人协作、Tauri 和 WebGL/Pixi 重写仍按计划延后。

## 2026-06-05 10:09:20 +08:00 | v1.1.0-alpha.26 | 补图谱工作区保存、快照与 JSON 导入失败页面回归
### 任务内容
- 延续 autosave/dirty/snapshot 产品化切片，把上一轮纯逻辑状态 helper 推进到真实工作区 UI 回归测试。
- 覆盖保存失败、快照恢复失败、快照列表失败和 StudyMate JSON 导入校验失败，确保用户可见状态明确且不误触远程保存。
### 完成结果
- 新增 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`，通过 mock graph API 渲染真实 `GraphWorkspacePage`。
- 覆盖批量保存失败时展示错误消息和 `保存失败` 状态。
- 覆盖快照恢复失败时展示错误消息和 `保存失败` 状态。
- 覆盖快照列表加载失败时仍可继续编辑，并保留“暂时无法恢复历史版本”的提示。
- 覆盖 JSON 导入结构错误时展示失败状态，不调用 `batchSaveGraph` 远程保存。
- 修复 `loadGraphWorkspace` / `openGraph` 在快照列表加载失败后又用“工作台已就绪/已切换”覆盖失败提示的问题。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx` 先暴露快照列表失败提示被覆盖的问题，修复后通过，4 个页面级用例全部通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 通过，4 个文件、16 个用例全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
### 后续影响
- 图谱工作区保存/快照/导入失败路径现在具备真实 UI 回归保护；下一步适合补键盘/来源反链/卡片草稿流程的页面级用例，或继续拆 controller 的加载/store 边界。

## 2026-06-05 10:01:08 +08:00 | v1.1.0-alpha.25 | 抽出图谱保存、离页保护与快照恢复状态边界
### 任务内容
- 继续拆分 `useGraphWorkspaceController.tsx`，把 autosave/dirty/snapshot 相关状态文案从大型 controller 中下沉为可测试 helper。
- 强化保存状态的可读性，确保保存成功/失败、快照恢复成功/失败、快照列表加载失败和离页保护都有明确状态表达。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphPersistenceState.ts` 与测试，覆盖离页保护文案、保存成功/失败状态、快照恢复成功/失败状态、快照列表失败提示和保存状态中文标签。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，保存和快照恢复路径复用 persistence helper；快照恢复成功进入 `saved`，失败进入 `failed`。
- `loadSnapshots` 现在返回加载是否成功；保存或恢复后如果快照列表加载失败，会保留“可继续编辑但暂时无法恢复历史版本”的清晰提示。
- 顶部保存状态从英文枚举 `idle/dirty/pending/saved/failed` 改为中文可读标签，并同步更新 `aria-label`。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphPersistenceState.test.ts` 先因 helper 缺失失败，补实现后通过；新增保存状态 label 测试也先失败后转绿。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/lib/graphSettingsPanel.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 通过，4 个文件、14 个用例全部通过。
### 后续影响
- autosave/dirty/snapshot 状态边界已经具备纯逻辑测试保护；下一步适合继续补图谱工作区页面级测试，覆盖保存失败、快照恢复失败和离页保护的真实 UI 行为。

## 2026-06-05 09:55:04 +08:00 | v1.1.0-alpha.24 | 加强图谱验证面板与来源孤立节点摘要
### 任务内容
- 继续完善知识图谱工作区的 validation panel 与 source summary，让验证结果不再只是平铺 issue，来源摘要也能显示孤立/无来源节点情况。
- 按 TDD 先补 graph-core 来源摘要测试和前端 validation panel helper 测试，再实现并回接工作区面板。
### 完成结果
- 扩展 `packages/graph-core/src/index.ts` 的 `summarizeGraphSourceReferences`，新增 `isolatedNodeCount`、`isolatedNodeIds`、`missingSourceNodeCount` 和 `missingSourceNodeIds`，并在 `sourceSwimlaneLayout.test.ts` 覆盖自由节点统计。
- 新增 `frontend-user/src/modules/graph/lib/graphValidationPanel.ts` 与测试，按 severity 和 ruleType 汇总验证结果，生成错误/警告/提示计数和规则分组。
- 更新 `frontend-user/src/modules/graph/components/GraphWorkspacePanels.tsx`，`GraphValidationIssueList` 先显示验证摘要与规则分组，再保留原有 issue 明细和空状态。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，来源摘要面板显示“孤立/无来源”节点数量，即使当前图谱没有任何来源引用也能展示这一状态。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 先因来源摘要缺少孤立节点字段失败，补实现后通过，26 个 graph-core 测试全部通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphValidationPanel.test.ts` 先因 helper 缺失失败，补实现后通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/components/GraphWorkspacePanels.test.tsx src/modules/graph/lib/graphValidationPanel.test.ts` 先因验证面板未显示摘要失败，补实现后通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphValidationPanel.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx src/modules/graph/lib/graphSettingsPanel.test.ts src/modules/graph/lib/graphSourceBacklinks.test.ts` 通过，4 个文件、11 个用例全部通过。
### 后续影响
- 验证面板与来源摘要现在都具备更明确的产品状态表达；下一步适合继续拆 autosave/dirty/snapshot 流程，补保存失败和快照恢复失败的前端测试。

## 2026-06-05 09:48:40 +08:00 | v1.1.0-alpha.23 | 收敛图谱设置面板配置与渲染边界
### 任务内容
- 继续拆分 `useGraphWorkspaceController.tsx`，把设置面板中的显示偏好、导入导出、自动保存、性能提示和快捷键说明收敛为结构化配置与可复用组件。
- 按 TDD 先补设置配置和面板组件测试，再实现并接入工作区右侧栏。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphSettingsPanel.ts` 与测试，固定设置面板五类 product section，并根据节点/边/分组数量和保存状态生成自动保存与性能提示。
- 扩展 `frontend-user/src/modules/graph/components/GraphWorkspacePanels.tsx`，新增 `GraphSettingsPanel` 组件，避免继续在大型 controller 中硬编码设置说明 JSX。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，根据当前图谱规模、保存状态和 autosave delay 生成 settings sections，并在右侧栏展示“设置 / 偏好与说明”区块。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSettingsPanel.test.ts` 先因 helper 缺失失败，补实现后通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/components/GraphWorkspacePanels.test.tsx` 先因 `GraphSettingsPanel` 未导出失败，补实现后通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSettingsPanel.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx src/modules/graph/lib/graphSourceBacklinks.test.ts src/modules/graph/lib/graphKeyboardShortcuts.test.ts` 通过，4 个文件、13 个用例全部通过。
### 后续影响
- 设置说明已经从 controller 中下沉为可测试边界；下一步适合继续把 validation panel 和 autosave/snapshot 流程拆为独立模块，并补更完整的工作区交互测试。

## 2026-06-05 09:42:46 +08:00 | v1.1.0-alpha.22 | 补齐图谱来源反链到批注、PDF 页和 AI 草稿
### 任务内容
- 继续完善知识图谱学习闭环，让图谱节点和来源摘要面板可以更稳定地回到资料、笔记、PDF 批注、卡片和 AI 上下文。
- 按 TDD 先补前端来源反链 helper 测试和后端 reader graph draft metadata 测试，再实现并回接图谱工作区与 ReaderPage。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphSourceBacklinks.ts` 与测试，统一解析 material、note、card、annotation、pdf-anchor、ai_draft、ai_task 等来源类型的跳转目标与按钮文案。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，右键菜单、节点详情和来源摘要列表都复用同一来源反链 helper；可解析来源会直接显示“回到阅读器/回到批注/查看 AI 草稿”等入口。
- 更新 `backend/internal/modules/reader/service/graph_drafts.go` 与测试，让从 PDF 批注生成的图谱草稿节点带上 `materialId`、`annotationId` 和 `page` metadata，避免批注节点只有 annotation id 而无法回到原资料页。
- 更新 `frontend-user/src/pages/ReaderPage.tsx` 与测试，支持 `/reader/:materialId?page=...&annotation=...` 这类从图谱反链进入的初始 PDF 页落点。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSourceBacklinks.test.ts` 先因 helper 缺失失败，补实现后通过。
- `cd backend; go test ./internal/modules/reader/service` 先因批注节点 metadata 缺少 `materialId/page/annotationId` 失败，补实现后通过。
- `npm --workspace frontend-user run test -- --run src/pages/ReaderPage.test.tsx` 先因 page query 未生效失败，补实现后通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSourceBacklinks.test.ts src/modules/graph/lib/graphKeyboardShortcuts.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx src/pages/ReaderPage.test.tsx` 通过，5 个文件、17 个用例全部通过。
### 后续影响
- 图谱来源反链已经覆盖学习闭环里的关键对象；后续可继续把 settings panel、validation panel 和 autosave/snapshot 边界从 controller 中拆出，并补 UI smoke 覆盖来源按钮实际点击。

## 2026-06-05 01:00:00 +08:00 | v1.1.0-alpha.21 | 抽出图谱工作区键盘快捷键意图解析
### 任务内容
- 继续拆分 `useGraphWorkspaceController.tsx`，把 keydown 事件中的快捷键规则抽成可测试的意图解析 helper。
- 保留原有保存、撤销/重做、全选、删除、聚焦、分组、连线、重置视野和 Escape 行为，只把按键判断从 React effect 中移出。
### 完成结果
- 新增 `frontend-user/src/modules/graph/lib/graphKeyboardShortcuts.test.ts`，覆盖输入框内外的保存/history/全选/删除/焦点/分组/连线/视野重置/Escape 规则。
- 新增 `frontend-user/src/modules/graph/lib/graphKeyboardShortcuts.ts`，导出 `resolveGraphKeyboardShortcut` 和明确的 shortcut action union。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，让 keydown effect 先解析 action 再执行 UI 副作用，减少大型 hook 内部条件分支。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphKeyboardShortcuts.test.ts` 先因 helper 文件缺失失败，补实现后通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphKeyboardShortcuts.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 通过，4 个文件、15 个用例全部通过。
### 后续影响
- 快捷键规则已具备单元测试保护；后续可继续把 source backlinks、settings panel、导入/保存边界从 controller 中拆成更小模块。

## 2026-06-05 00:56:07 +08:00 | v1.1.0-alpha.20 | 下沉图谱节点、边与分组 mutation 纯逻辑
### 任务内容
- 继续拆分 `useGraphWorkspaceController.tsx`，把删除节点、创建连线、复制节点、创建分组和折叠分组的文档 mutation 下沉到 `@studymate/graph-core`。
- 按 TDD 先补 graph-core mutation 测试，再实现不可变 helper 并回接用户端 controller。
### 完成结果
- 新增 `packages/graph-core/test/graphMutations.test.ts`，覆盖删除节点时清理边和分组、连线去重、复制节点 metadata/source 拷贝与舞台边界钳制、按选中节点 bounds 创建分组、分组折叠切换。
- 扩展 `packages/graph-core/src/index.ts`，新增 `removeGraphNodesFromDocument`、`appendGraphNodeToDocument`、`appendGraphEdgeToDocument`、`duplicateGraphNodeInDocument`、`createGraphGroupForNodes` 和 `toggleGraphGroupCollapse`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，让删除、连线、复制、分组和折叠操作复用 graph-core mutation helper，继续减少 controller 内部手写文档改写分支。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 先因 mutation helper 未导出失败，补实现后通过，26 个 graph-core 测试全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 通过。
### 后续影响
- 节点/边/分组的核心文档 mutation 已具备 UI 无关测试保护；下一步适合继续拆 keyboard shortcut 规则、settings/source panel 逻辑和剩余导入/保存边界。

## 2026-06-05 00:47:28 +08:00 | v1.1.0-alpha.19 | 下沉图谱 viewport 与 minimap 相机逻辑
### 任务内容
- 继续拆分 `useGraphWorkspaceController.tsx`，把 viewport/camera/minimap 的坐标投影与视野计算下沉到 `@studymate/graph-core`。
- 按 TDD 先补 graph-core viewport 测试，再实现纯逻辑 helper 并回接用户端 controller 与 workspace helper。
### 完成结果
- 新增 `packages/graph-core/test/graphViewport.test.ts`，覆盖 zoom clamp、矩形居中、client point 到图谱坐标投影、minimap viewport 映射和不可测舞台尺寸兜底。
- 扩展 `packages/graph-core/src/index.ts`，新增 `GraphViewport`、`GraphRect`、`GraphStageSize`、`clampGraphZoom`、`centerGraphViewportOnRect`、`projectClientPointToGraph` 和 `buildGraphMinimapViewport`。
- 更新 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts` 与 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，让缩放限制、聚焦节点、拖拽投影和 minimap 视口复用 graph-core helper。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 通过，21 个 graph-core 测试全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 通过。
### 后续影响
- viewport/camera 已成为可复用纯逻辑边界；下一步适合继续拆 node/edge/group mutations、keyboard shortcut 规则和 settings/source panel 逻辑。

## 2026-06-05 00:40:55 +08:00 | v1.1.0-alpha.18 | 下沉图谱 selection 与 marquee 纯逻辑
### 任务内容
- 继续拆分 `useGraphWorkspaceController.tsx`，把 selection / marquee 命中逻辑从大型 hook 中下沉到 `@studymate/graph-core`。
- 按 TDD 先补 graph-core 选择态测试，再实现并回接用户端 controller。
### 完成结果
- 新增 `packages/graph-core/test/graphSelection.test.ts`，覆盖单选、清空、多选 toggle、空 ID 忽略、框选矩形反向归一和隐藏节点过滤。
- 扩展 `packages/graph-core/src/index.ts`，新增 `GraphSelectionState`、`createGraphSelectionState`、`setGraphNodeSelection`、`clearGraphNodeSelection`、`toggleGraphNodeSelection` 和 `selectGraphNodesInRect`。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，让单选、清空、增减选择和框选命中复用 graph-core helper，减少 hook 内部手写状态分支。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 先因 selection helper 未导出失败，补实现后通过，16 个 graph-core 测试全部通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 通过。
### 后续影响
- selection / marquee 已成为可复用纯逻辑边界；下一步可继续按同样方式拆 camera/viewport、node/edge/group mutations 和 keyboard shortcut 规则。

## 2026-06-05 00:29:33 +08:00 | v1.1.0-alpha.17 | 图谱工作区 JSON 文件、验证规则与 200 节点 smoke
### 任务内容
- 延续图谱产品化收口，按 TDD 先补 `@studymate/graph-core` 纯逻辑测试，再实现文档规范化、验证规则、`.smtg` 导入导出、学习模板、history label 和基准夹具。
- 在不破坏现有 Graph API 合约的前提下，扩展后端 `ValidateGraph` 规则和学习模板内容。
- 用户端接入 StudyMate JSON 导入导出、明确 `idle/dirty/pending/saved/failed` 保存状态、离页保护和图谱 200 节点 E2E smoke。
### 完成结果
- 新增 `packages/graph-core/test/graphProductization.test.ts`，覆盖 normalize、validate、SMTG JSON 往返、history label、四类学习模板和 200/300/20 基准夹具。
- 扩展 `packages/graph-core/src/index.ts`，新增 graph document clone/normalize、`validateGraphDocument`、`serializeStudymateGraphJson`、`parseStudymateGraphJson`、history state、学习模板、基准数据和安全文件名能力。
- 扩展 `backend/internal/modules/graph/service/helpers.go` 与测试，验证孤立节点、缺来源、重复标题、悬挂边、跨折叠分组边、空分组、非法尺寸和无效来源 target；模板从 UML/ERD/C4 替换为学习资料梳理、读书笔记、概念网络、复习卡片准备。
- 新增 `frontend-user/src/modules/graph/lib/graphFileImportExport.ts` 与测试，接入 `.smtg` / `application/vnd.studymate.graph+json` 导入导出；工作区新增 JSON 导入模式、JSON 导出按钮、保存状态、离页前保护和更清晰的学习模板文案。
- 新增 `e2e/v1-graph-workspace.spec.ts`，通过拦截 API 加载 200 节点、300 边、20 分组图谱，验证图谱工作区可打开并展示 JSON 导出入口。
### 验证结果
- `npm --workspace @studymate/graph-core run test` 先因新增 API 未导出失败，补实现后通过，12 个测试全部通过。
- `go test ./internal/modules/graph/service` 先因验证规则和模板仍为旧实现失败，补实现后通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts` 先因 helper 缺失失败，补实现后通过。
- `npm run test:user` 通过，用户端 11 个测试文件、30 个用例全部通过。
- `npm run build:user` 与 `npm run build:admin` 通过。
- `npx playwright test e2e/v1-graph-workspace.spec.ts` 通过，确认 200 节点图谱 smoke 可用。
- `npm run test:e2e` 通过，6 条 Playwright smoke 全部通过。
### 后续影响
- 图谱核心能力已经从大 hook 中继续外移到可测试纯逻辑边界；后续适合继续拆 `useGraphWorkspaceController.tsx` 的数据加载、画布交互、validation/draft 和 settings 面板。
- `.prg` 兼容、多目标边 UI、复杂自动布局、插件市场、CRDT、Tauri 和 WebGL/Pixi 重写仍按计划延后；如需要 Project Graph 文件兼容，应以后续转换器版本实现。

## 2026-06-02 23:08:40 +08:00 | v1.1.0-alpha.16 | 补 Reader API、页面、handler 与 service 测试硬化
### 任务内容
- 延续 v1.1 产品质量与测试硬化，围绕阅读器链路补齐用户端 API 合约测试、页面回归测试和后端 handler / service 边界测试。
- 继续遵循 TDD：先让后端 `reader/handler`、`reader/service` 的 fake 依赖测试因注入边界不足而编译失败，再收窄依赖接口并重跑目标测试。
- 同步更新 README、路线图、版本计划、变更记录和项目日志，并在切片完成后补跑完整 CI 与覆盖率汇总。
### 完成结果
- 新增 `frontend-user/src/api/reader.test.ts`，覆盖 `getReaderState`、`updateReaderProgress`、`createReaderAnnotation`、`deleteReaderAnnotation`、`generateAnnotationCardDrafts` 和 `generateAnnotationGraphDrafts` 的鉴权头、路径与请求体。
- 新增 `frontend-user/src/pages/ReaderPage.test.tsx`，覆盖阅读进度回写、添加书签、保存批注后刷新状态，以及资料标题、PDF 页码和 `rects` 坐标片段来源展示。
- 新增 `backend/internal/modules/reader/handler/handler_test.go`，覆盖 `UpdateProgress`、`CreateAnnotation` 和 `GenerateGraphDrafts` 的鉴权用户、material id、请求体与 success envelope。
- 新增 `backend/internal/modules/reader/service/service_test.go`，覆盖空批注拒绝、默认颜色与审计记录、批注选择缺口和资料可见性边界。
- 更新 `backend/internal/modules/reader/handler/handler.go` 与 `backend/internal/modules/reader/service/service.go`，将对具体 `Service` / repository / material / audit / AI service 的依赖收窄为最小接口，并保留编译期断言，便于后续继续补 fake 或 fixture 测试。
### 验证结果
- `cd backend; go test ./internal/modules/reader/handler` 先因 `NewHandler` 只接收具体 service 而无法注入 fake service，形成编译期 RED；收窄为 `readerService` interface 后通过。
- `cd backend; go test ./internal/modules/reader/service` 先因 `NewService` 只接收具体 repository / material / audit 依赖而无法注入 fake，形成编译期 RED；收窄为最小接口后通过。
- `npm --workspace frontend-user run test -- --run src/api/reader.test.ts src/pages/ReaderPage.test.tsx` 通过，覆盖 Reader API 合约与页面回归 5 个用例。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、5 条 Playwright E2E、后端 `go test ./...` 和最终文档同步。
- `npm run test:coverage` 通过；当前覆盖率缺口更新为：`frontend-user` 汇总 `46.18%`、`frontend-admin` 汇总 `60.27%`，后端 `reader/service` 提升到 `40.6%`，但仍与 `note/service`、`card/service`、`graph/service`、`share/service` 等 service/repository 包一起构成主要缺口。
### 后续影响
- Reader 链路现在具备 API client、页面层、handler 层和 service 层的自动化保护，后续可继续向 `note/service` 及来源追踪闭环补 fake / repository fixture 测试。
- 前端与后端整体覆盖率仍明显低于 80%，后续优先继续补 `ReaderPage.tsx`、`appShared.tsx`、`workspaceControllerHelpers.ts` 以及 reader/note/card/graph service 层的细粒度回归。

## 2026-06-02 22:42:39 +08:00 | v1.1.0-alpha.15 | 抽出 SearchIndexer 与图谱 history 状态机
### 任务内容
- 继续 v1.1 产品质量与测试硬化，在不改变现有公开 API 契约的前提下，为后端搜索链路补可替换索引边界。
- 继续拆分 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，优先把 history/autosave/undo-redo 状态转移抽成可测试纯逻辑。
- 同步更新 README、路线图、版本计划、变更记录和项目日志，并重新跑 CI 与覆盖率汇总。
### 完成结果
- 新增 `backend/internal/modules/search/service/indexer.go`，引入内部 `SearchIndexer` 抽象，默认实现仍为 MySQL fallback，不改变 `GET /api/v1/search` 路由契约。
- 扩展 `backend/internal/modules/search/service/service_test.go`，补 grouped search 通过 fake indexer 聚合结果、limit 默认值与错误透传测试。
- 新增 `frontend-user/src/modules/graph/lib/graphHistory.ts` 与 `frontend-user/src/modules/graph/lib/graphHistory.test.ts`，锁定 history 捕获、reset、undo/redo 与 saved 状态转移。
- 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`，把 history/autosave/undo-redo 状态切到 `graphHistory.ts` 与 `shouldAutosaveGraph` 边界上，继续缩小大控制器内部职责。
### 验证结果
- `go test ./internal/modules/search/service` 先因缺少 `NewServiceWithIndexer` 编译失败，完成 RED；补实现后通过。
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphHistory.test.ts` 先因缺少 `graphHistory.ts` 失败，补实现后通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、5 条 Playwright E2E、后端 `go test ./...` 和最终文档同步。
- `npm run test:coverage` 通过；当时覆盖率缺口记录为：`frontend-user` 汇总 `44.49%`、`frontend-admin` 汇总 `60.27%`，后端 `search/service` 提升到 `56.4%`，但 `share/service`、`reader/service`、`note/service`、`card/service`、`graph/service` 等 service/repository 仍需继续补 fixture 测试。
### 后续影响
- 搜索链路现在已经具备保持 MySQL fallback 不变的同时切换后续 adapter 的边界，下一步适合继续补 `search/share` service 层 fake 或 repository fixture。
- 图谱工作区已经先把 history/autosave/undo-redo 这一组状态从大控制器中拎出来，后续可沿同一方式继续下沉数据加载、画布交互、validation/draft 与设置面板逻辑。
## 2026-06-02 14:01:58 +08:00 | v1.1.0-alpha.14 | 补后台治理 Playwright smoke
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为管理端后台治理补 Playwright smoke。
- 让 E2E 同时启动用户端和管理端 preview，覆盖管理端已有 admin session 下的 users 治理模块加载。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `e2e/v1-admin-governance.spec.ts`。
- 更新 `package.json` 的 `test:e2e`，同时构建用户端和管理端。
- 新增 `frontend-admin` 的 `preview` 脚本，并把 `playwright.config.ts` 改为同时启动 4173 用户端和 4174 管理端 preview。
- 后台 smoke 通过 `localStorage` 写入 `studymate.admin.session`，拦截 `/api/v1/admin/me`、`/overview`、`/moderation` 和 `/users?limit=20`，验证 users 模块加载 `alice` 且请求携带 `Bearer admin-token`。
### 验证结果
- `npm run test:e2e` 通过，Playwright smoke 从 4 条扩展为 5 条。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、5 条 Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- v1.1 已覆盖公共页、复习队列和后台治理的关键 smoke，后续可继续补 AI 任务治理、资料文件治理或图谱受保护工作流。

## 2026-06-02 13:55:57 +08:00 | v1.1.0-alpha.13 | 补复习队列 Playwright smoke
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为受保护的用户端 `/review` 复习队列补 Playwright smoke。
- 用测试内 session 和 API 拦截覆盖到期卡片展示、翻面、Good 评分和复习回写请求。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `e2e/v1-review-flow.spec.ts`。
- 通过 `localStorage` 写入 `studymate.session`，验证受保护路由不依赖真实登录即可进入复习页。
- 拦截 `/api/v1/decks`、`/api/v1/decks/:id/cards`、`/api/v1/review/today` 和 `/api/v1/cards/:id/review`。
- 验证回写请求携带 `Bearer access-token`，并提交 `{ rating: "good" }`。
### 验证结果
- `npm run test:e2e` 通过，Playwright smoke 从 3 条扩展为 4 条。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、4 条 Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 复习闭环现在同时具备用户端 API 合约、页面级 Vitest、后端 handler 测试和 Playwright smoke；后续可继续补后台治理 smoke。

## 2026-06-02 13:47:00 +08:00 | v1.1.0-alpha.12 | 补后端 AI handler 边界测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为后端 AI handler 补 tasks、usage 和 drafts 读取入口测试。
- 先添加 fake service handler 测试形成编译期 RED，再把 AI handler 从具体 service 依赖收窄为最小接口。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `backend/internal/modules/ai/handler/handler_test.go`。
- 测试 `/ai/tasks`、`/ai/usage`、`/ai/drafts` 均使用认证用户调用 service，并返回 success envelope。
- 更新 `backend/internal/modules/ai/handler/handler.go`，允许通过最小 `aiService` interface 注入 fake，同时保留真实 AI service 的路由兼容。
### 验证结果
- `cd backend; go test ./internal/modules/ai/handler` 先因 `NewHandler` 只接受具体 service 编译失败，完成 RED。
- `cd backend; go test ./internal/modules/ai/handler` 在接口收窄后通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- AI tasks/usage/drafts 读取入口具备后端 handler 层保护，后续可继续补 AI service repository fixture 或后台 AI 任务治理 smoke。

## 2026-06-02 13:42:00 +08:00 | v1.1.0-alpha.11 | 补后端 graph commit handler 边界测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为后端 graph handler 补图谱变更草稿确认入口测试。
- 先添加 fake service handler 测试形成编译期 RED，再把 graph handler 从具体 service 依赖收窄为最小接口。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `backend/internal/modules/graph/handler/handler_test.go`。
- 测试 `POST /graphs/:id/ai/commit-changes` 会传递认证用户、目标 graph id、`draftIds` 和逐草稿 `nodeSelections`。
- 更新 `backend/internal/modules/graph/handler/handler.go`，允许通过最小 `graphService` interface 注入 fake，同时保留真实 `graphservice.Service` 的路由兼容。
### 验证结果
- `cd backend; go test ./internal/modules/graph/handler` 先因 `NewHandler` 只接受具体 service 编译失败，完成 RED。
- `cd backend; go test ./internal/modules/graph/handler` 在接口收窄后通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 图谱变更草稿确认的前端页面、前端 API 合约和后端 handler 边界均有自动化保护，后续可继续补 graph service/repository fixture。

## 2026-06-02 13:37:49 +08:00 | v1.1.0-alpha.10 | 补图谱变更草稿确认 API 合约测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为用户端 AI/graph 草稿确认链路补 API client 合约测试。
- 锁定 `commitGraphChangeDraftSelection` 的 endpoint、HTTP method、鉴权头和请求体。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 扩展 `frontend-user/src/api/reviewAi.test.ts`。
- 新增图谱变更草稿确认用例，调用 `/api/v1/graphs/graph-1/ai/commit-changes`。
- 验证请求体保留 `draftIds` 和逐草稿 `nodeSelections`，确保页面选择的候选节点不会在 API 层被丢失。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/api/reviewAi.test.ts` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- AI 图谱草稿确认流现在同时具备 API 合约测试和页面级测试保护，后续可继续补后端 graph commit handler/service 的细粒度 fixture。

## 2026-06-02 13:33:00 +08:00 | v1.1.0-alpha.9 | 补 AiPage 图谱变更草稿确认测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为用户端 AiPage 补图谱变更草稿确认页面测试。
- 覆盖待确认 `graph_change` 草稿写入所选目标图谱的 UI 流。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 扩展 `frontend-user/src/pages/AiPage.test.tsx`。
- 通过 mock API 初始化图谱变更草稿、目标图谱列表和目标图谱详情。
- 测试候选节点在页面中展示，并点击“把 1 条图谱变更写入所选图谱”。
- 验证 `commitGraphChangeDraftSelection` 收到 `draftIds` 和 `nodeSelections`，保留 `node-a` 与 `node-b` 的节点选择。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/pages/AiPage.test.tsx` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- AI 草稿到复习系统、到目标图谱的两个确认流都有页面级测试保护，后续可继续补后端 AI/graph commit handler/service 测试。

## 2026-06-02 12:47:00 +08:00 | v1.1.0-alpha.8 | 补 AiPage 草稿确认页面测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为用户端 AiPage 补页面级 AI 卡片草稿确认测试。
- 覆盖待确认 `card_draft` 写入所选复习 deck 的 UI 流。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `frontend-user/src/pages/AiPage.test.tsx`。
- 通过 mock API 初始化 AI 草稿、用量摘要、deck 列表和空图谱列表。
- 测试用户点击“把 1 张待确认卡片草稿写入复习系统”后，`bulkCreateDeckCards` 收到 draftId、front、back、sourceType 和 sourceId。
- 验证确认完成后显示“已把 1 张 AI 草稿写入复习系统。”。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/pages/AiPage.test.tsx` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- AI 草稿到复习系统的确认流已有 API 合约和页面级测试保护，后续可继续补图谱变更草稿确认流。

## 2026-06-02 12:43:00 +08:00 | v1.1.0-alpha.7 | 补 ReviewWorkspace 页面级复习回写测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为用户端 ReviewWorkspace 补页面级回归测试。
- 覆盖今日队列展示、显示答案、评分按钮和复习回写调用。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`。
- 通过 mock API 初始化卡组、卡片列表和今日队列。
- 测试用户点击“显示答案”后可以看到答案，并点击 `Good` 触发 `reviewCard`。
- 验证评分后显示“已记录复习”消息并清空今日队列。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/modules/review/ReviewWorkspacePage.test.tsx` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 复习闭环已有 API 合约、后端 handler 和页面级测试保护，后续可以继续补 AI 草稿确认 UI 或后端 service fixture。

## 2026-06-02 12:39:00 +08:00 | v1.1.0-alpha.6 | 补后端 card handler 边界测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为复习 Card/Deck handler 补边界测试。
- 让 card handler 可以通过 fake service 做单元测试，不直接依赖真实数据库。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `backend/internal/modules/card/handler/handler_test.go`。
- 覆盖创建卡组时的认证用户、请求体绑定和 201 响应。
- 覆盖今日复习队列的 success envelope 与 due item。
- 覆盖复习回写的 card id、rating 和 elapsedMs 传递。
- `card/handler` 的 service 依赖改为最小接口，并保留具体 service 的编译期接口断言。
### 验证结果
- `cd backend; go test ./internal/modules/card/handler` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 复习闭环已有用户端 API 合约测试和后端 handler 边界测试，后续可继续补 ReviewWorkspace UI smoke 或 service 层数据库 fixture。

## 2026-06-02 12:36:00 +08:00 | v1.1.0-alpha.5 | 补 review/AI 用户端 API 合约测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，为复习与 AI 草稿闭环补用户端 API client 合约测试。
- 覆盖 Deck/Card、今日复习队列、复习回写和 AI tasks/usage/drafts 请求边界。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `frontend-user/src/api/reviewAi.test.ts`。
- 覆盖 `createDeck` 的认证头、可见性与请求载荷。
- 覆盖 `bulkCreateDeckCards` 从 AI draft 批量确认成卡片的请求载荷。
- 覆盖 `getTodayReviewQueue`、`reviewCard`、`listAiTasks`、`getAiUsageSummary`、`listAiDrafts` 的路径与鉴权头。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/api/reviewAi.test.ts` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 后续可继续补 review workspace UI smoke 和后端 card handler/service 测试，逐步把复习闭环从 API 合约推进到端到端用户流。

## 2026-06-02 12:32:00 +08:00 | v1.1.0-alpha.4 | 收敛公共首页 E2E 代理噪声
### 任务内容
- 继续 v1.1 产品质量与测试硬化，减少公共首页 Playwright smoke 对本地后端的隐式依赖。
- 保持当前公共壳层、搜索页和分享页 smoke 仍在同一前端预览服务下运行。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 更新 `e2e/user-shell.spec.ts`，对 `/api/v1/materials` 和 `/api/v1/posts` 增加空成功响应拦截。
- Playwright 运行时不再输出无本地后端导致的 Vite proxy `ECONNREFUSED` 噪声。
### 验证结果
- `npm run test:e2e` 通过，3 条 Playwright smoke 均通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 后续新增公共页 smoke 时应优先显式 mock API 边界，让 E2E 输出只暴露真实失败。

## 2026-06-02 12:29:00 +08:00 | v1.1.0-alpha.3 | 增加搜索与分享只读页 Playwright smoke
### 任务内容
- 继续 v1.1 产品质量与测试硬化，补用户端公共搜索和分享只读页的端到端 smoke。
- 避免依赖本地后端，使用 Playwright route 拦截固定 API 响应。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `e2e/v1-public-flows.spec.ts`。
- 搜索页 smoke 覆盖 `/search?q=图谱` 调用 grouped backend result 并显示结果卡片。
- 分享页 smoke 覆盖 `/share/token-1` 调用 public resolve 并显示只读目标、摘要和原始页面链接。
### 验证结果
- `npm run test:e2e` 通过，Playwright 从 1 条公共壳层 smoke 扩展为 3 条。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 后续可继续补后台治理和复习队列 Playwright smoke，并把后端代理拒绝日志从公共壳层测试里收敛掉。

## 2026-06-02 12:26:00 +08:00 | v1.1.0-alpha.2 | 补后端 search/share/admin handler 边界测试
### 任务内容
- 继续 v1.1 产品质量与测试硬化，补后端 search/share/admin 的 handler 层回归测试。
- 让 search/share handler 可以通过 fake service 做单元测试，不直接依赖真实数据库。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `backend/internal/modules/search/handler/handler_test.go`，覆盖查询参数、类型过滤、limit 传递和错误 envelope。
- 新增 `backend/internal/modules/share/handler/handler_test.go`，覆盖创建分享链接时的认证用户、请求体绑定和成功响应 envelope。
- 新增 `backend/internal/modules/admin/handler/handler_test.go`，覆盖后台 limit 查询参数解析。
- `search/handler` 与 `share/handler` 的 service 依赖改为最小接口，并保留具体 service 的编译期接口断言。
### 验证结果
- `cd backend; go test ./internal/modules/search/handler ./internal/modules/share/handler ./internal/modules/admin/handler` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 后续可继续按同一方式补 review/AI/admin service 细粒度测试，并在需要数据库行为时再引入轻量 fixture 或 repository interface。

## 2026-06-02 12:20:00 +08:00 | v1.1.0-alpha.1 | 加厚 search/share/admin 测试基线
### 任务内容
- 在 `v1.0.0` 本地发布标签之后，按后续里程碑设计进入 v1.1 产品质量与测试硬化。
- 优先为 v1 新增的搜索、分享和后台治理入口补自动化回归测试。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 完成结果
- 新增 `frontend-user/src/api/searchShare.test.ts`，覆盖 grouped search 查询参数、鉴权头、owner share link 创建载荷和 public token resolve 编码路径。
- 新增 `frontend-admin/src/views/AdminWorkspaceView.test.ts`，覆盖已有 admin session 下治理页加载 `/api/v1/admin/users?limit=20` 并携带 Bearer token。
- README 当前阶段从 v1.0.0 发布推进更新为 v1.1 质量硬化；版本计划和路线图新增 v1.1 测试硬化退出标准。
### 验证结果
- `npm --workspace frontend-user run test -- --run src/api/searchShare.test.ts` 通过。
- `npm --workspace frontend-admin run test -- --run src/views/AdminWorkspaceView.test.ts` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 后续可继续补后端 search/share/admin/review handler/service 测试，并追加 Playwright 搜索、分享只读页、后台治理和复习队列 smoke flow。

## 2026-06-01 22:03:47 +08:00 | v0.0.73 | 收口 NOTE_READ_MODEL、覆盖率门禁与本地化框架
### 任务内容
- 按 v1.0.0 A 阶段要求，完成当前未提交的 `NOTE_READ_MODEL` 读取开关收口。
- 补齐发布前覆盖率命令，明确每个里程碑仍以完整 CI 为硬门禁。
- 先建立 `zh-CN` 源语言与 `en-US` 占位字典框架，不把完整英文翻译作为 v1.0.0 阻塞项。
### 完成结果
- 后端笔记服务支持 `NOTE_READ_MODEL=mysql_primary|mongo_primary`，`mongo_primary` 优先读取 MongoDB `note_documents.html` 并在缺失或失败时回退 MySQL。
- 新增根脚本 `test:coverage` 及用户端、管理端、图谱核心、后端覆盖率子命令。
- 新增 `frontend-user/src/i18n/dictionary.ts` 和 `frontend-admin/src/i18n/dictionary.ts`，并添加字典键一致性测试。
- 同步更新 README、开发说明、版本计划、路线图、变更记录和项目日志。
### 验证结果
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- B 阶段可以在已有覆盖率和字典框架保护下继续拆分超大文件。
- 发布前需要额外运行 `npm run test:coverage` 并记录覆盖率缺口。
## 2026-06-01 22:18:00 +08:00 | v0.0.74 | 拆分 API client、全局样式和图谱工作区 helper
### 任务内容
- 按 B 阶段要求继续降低超大文件维护风险。
- 优先处理用户端 API client、全局样式和图谱控制器中可安全抽离的纯 helper。
### 完成结果
- `frontend-user/src/api/client.ts` 改为稳定 barrel，接口实现按 auth、files、community、materials、notes、reader、graphs、review、ai 域拆分。
- `frontend-user/src/styles.css` 改为导入入口，样式按 app、workspace、graph、reader-notes、search-review、responsive 分层。
- `useGraphWorkspaceController.tsx` 抽出图谱文档、几何、来源分组、导出和焦点导航 helper 到 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`。
- 保留现有页面导入路径和路由行为。
### 验证结果
- `npm run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- 图谱 hook 仍承载大量交互与 UI 组合，C 阶段继续把 autosave、selection、AI draft 和面板渲染下沉到更细模块。
## 2026-06-01 22:32:00 +08:00 | v0.0.75 | 收口 Reader/Notes 数据来源与图谱性能回归
### 任务内容
- 按 C 阶段要求补齐历史笔记到 Mongo 内容文档的回填路径。
- 为 PDF 批注增加兼容的归一化坐标字段，并在阅读器 UI 中显示资料、PDF 页和坐标片段来源。
- 增加图谱大数据量回归用例。
### 完成结果
- 新增 `backend/cmd/backfill-note-documents`，支持幂等 upsert 历史 `notes.content` 到 `note_documents`，并支持 `-limit` 分批执行。
- `pdf_annotations` 新增 `rects` 字段，DTO、模型、仓储编码/解码、新装库迁移、历史库对齐迁移和回滚脚本同步更新。
- Reader 批注创建时写入基础归一化坐标，批注列表展示资料标题、PDF 页和坐标片段数量。
- `@studymate/graph-core` 增加 200 节点性能夹具，覆盖 v1 图谱来源泳道布局预算。
### 验证结果
- `cd backend; go test ./internal/modules/reader/... ./internal/modules/note/... ./cmd/backfill-note-documents` 通过。
- `npm run typecheck` 通过。
- `npm --workspace @studymate/graph-core run test` 通过。
- `npm run ci` 通过，覆盖类型检查、文档同步、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。
### 后续影响
- C 阶段后续可继续加厚图谱治理面板与 Undo/Redo/dirty 状态的 UI 表达。
- D 阶段可以复用批注来源与 AI draft 链路继续推进复习、搜索、后台和分享。

## 2026-06-01 21:36:28 +08:00 | v0.0.72 | 拆分用户端主应用、图谱入口和管理端入口
### 任务内容
- 按 v1.0 发布推进顺序，执行超大文件拆分。
- 目标是先解除 `frontend-user/src/app/App.tsx`、`frontend-user/src/modules/graph/GraphWorkspacePage.tsx`、`frontend-admin/src/App.vue` 三个入口文件的巨石职责，并建立后续继续细拆的目录边界。
### 完成结果
- 将用户端主应用拆成：
  - [frontend-user/src/app/routes.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/routes.tsx)
  - [frontend-user/src/app/shell/ShellFrame.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/shell/ShellFrame.tsx)
  - [frontend-user/src/pages/](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/pages/)
  - [frontend-user/src/features/ai/aiDrafts.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/features/ai/aiDrafts.ts)
- `frontend-user/src/app/App.tsx` 改为 1 行兼容导出，原有路由和页面行为保持不变。
- `frontend-user/src/modules/graph/GraphWorkspacePage.tsx` 改为薄壳导出，图谱实现移入 `components/GraphWorkspaceView.tsx` 和 `hooks/useGraphWorkspaceController.tsx`，并建立 `state/`、`lib/`、`exporters/`、`importers/` 边界。
- `frontend-admin/src/App.vue` 改为薄壳挂载 `views/AdminWorkspaceView.vue`，新增 `router/index.ts`、`components/admin/AdminModuleBadge.vue` 和 `components/admin/admin.css`。
- 管理端样式从单文件 Vue 内联样式迁出，`AdminWorkspaceView.vue` 降到 500 行以内。
- 同步更新 README、开发说明、路线图、版本计划、变更记录和项目日志。
### 验证结果
- `npm run ci`
- CI 脚本内部已覆盖类型检查、文档校验、前后台构建、用户端 Vitest、管理端 Vitest、图谱核心测试、Playwright E2E、后端 `go test ./...`。
### 后续影响
- 后续 reader/notes 与 graph 收口时，应继续把 `useGraphWorkspaceController` 内部的大型状态与操作拆到更细 hooks/lib，而不是再把逻辑塞回入口文件。

## 2026-06-01 21:09:44 +08:00 | v0.0.71 | 建立 CI 与前端测试基线
### 任务内容
- 按 v1.0 发布推进顺序，完成工程基线第二步：根脚本、前后台单元测试、E2E 测试和 GitHub CI 覆盖。
- 要求保留现有 `go test ./...` 与 `@studymate/graph-core` 测试，并新增用户端 Vitest + React Testing Library、管理端 Vitest + Vue Test Utils、Playwright 端到端测试。
### 完成结果
- 更新 [package.json](/E:/Code/1108026_rust_go/StudyMate/package.json)，新增 `lint`、`test:user`、`test:admin`、`test:e2e`、`verify:docs`、`ci`。
- 更新前后台 package 脚本，分别接入 Vitest 测试入口；用户端新增 `preview` 供 Playwright 使用。
- 新增 [frontend-user/vitest.config.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/vitest.config.ts)、[frontend-user/src/test/setup.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/test/setup.ts) 和图谱节点外观测试。
- 新增 [frontend-admin/vitest.config.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/vitest.config.ts)、[frontend-admin/src/test/setup.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/test/setup.ts) 和管理端登录页 smoke 测试。
- 新增 [playwright.config.ts](/E:/Code/1108026_rust_go/StudyMate/playwright.config.ts) 与 [e2e/user-shell.spec.ts](/E:/Code/1108026_rust_go/StudyMate/e2e/user-shell.spec.ts)，覆盖用户端公共工作区加载。
- 更新 [.github/workflows/ci.yml](/E:/Code/1108026_rust_go/StudyMate/.github/workflows/ci.yml)，CI 覆盖 Node 24、Go 1.26、`npm ci`、类型检查、前后台构建、前后台测试、Playwright、图谱核心测试、后端测试和文档同步。
- 同步更新 README、开发说明、路线图、版本计划、变更记录和文档同步脚本。
### 验证结果
- `npm run ci`
- CI 脚本内部已覆盖：
  - `npm run lint`
  - `npm run build:user`
  - `npm run build:admin`
  - `npm run test:user`
  - `npm run test:admin`
  - `npm --workspace @studymate/graph-core run test`
  - `npm run test:e2e`
  - `cd backend && go test ./...`
  - `npm run verify:docs`
### 后续影响
- 后续拆分超大文件和图谱功能收口时，有前后台最小回归测试与 E2E 壳层保护。
- CI 已具备发布前质量门禁雏形。

## 2026-06-01 21:00:51 +08:00 | v0.0.70 | 对齐文档树与 v1.0 发布治理基线
### 任务内容
- 按用户要求先修工程基线与文档漂移，把当前 `master` 推进到可发布 `v1.0.0` 的治理轨道。
- 创建或纳入 `docs/planning/ROADMAP.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/versions/v0.6.0-graph-product.md`、`docs/design/UPGRADE_DESIGN.md`、`CHANGELOG.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/workflows/ci.yml`、`scripts/verify-doc-sync.mjs`。
- README 当前阶段必须反映真实状态：阅读/笔记已闭环，图谱为强 MVP，复习和 AI 部分实现，后台审核主链存在但治理能力不完整。
### 完成结果
- 更新 [.gitignore](/E:/Code/1108026_rust_go/StudyMate/.gitignore)，重新允许 `PROJECT_LOG.md`、`docs/planning/` 和 `docs/design/` 进入版本治理。
- 重建 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)，把主导航指向 `docs/design/UPGRADE_DESIGN.md`，并保留根目录设计说明兼容链接。
- 重建 [docs/planning/ROADMAP.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/ROADMAP.md) 和 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md)，明确 A-E 执行顺序、1.0 范围取舍、zh-CN 源语言/en-US 占位策略和建议性能预算。
- 更新 [docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md)，把图谱定位从规划改为强 MVP 后的产品化收口。
- 复制根目录 [学伴项目-设计说明书.md](/E:/Code/1108026_rust_go/StudyMate/学伴项目-设计说明书.md) 到 [docs/design/UPGRADE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/design/UPGRADE_DESIGN.md)。
- 新增 [CHANGELOG.md](/E:/Code/1108026_rust_go/StudyMate/CHANGELOG.md)、PR 模板、CI 骨架和文档同步校验脚本。
- 更新 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)，补充文档与版本治理流程。
### 验证结果
- `node scripts/verify-doc-sync.mjs`
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
- `cd backend; go test ./...`
### 后续影响
- 后续每个里程碑都有统一文档同步清单、CI 入口和项目日志记录。
- 下一步进入 CI 与前端测试基线建设。

## 2026-06-01 20:05:00 +08:00 | v0.0.69 | 移除图谱离页整页刷新兜底以恢复侧边栏流畅切换
### 任务内容
- 用户反馈其他页面之间切换流畅，但从图谱切到别的页面像刷新了一次。
- 在 `v0.0.67` 已经修复空查询参数触发假 AI 落点循环后，收回此前为兜底加在图谱离页上的 `reloadDocument`。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 移除 `shouldHardLeaveGraph`
  - 移除侧边栏主导航和快速动作上仅针对 `/graph` 离页的 `reloadDocument`
  - 图谱离开时重新走 React Router SPA 切换，不再表现为浏览器级刷新
- 保留图谱页内已经补好的根因修复：
  - 空查询参数不会被解析成假 AI 预计落点
  - AI 预计落点消费后会清理 React Router state
  - 图谱拖拽异常中断时会释放全局 pointer 状态
### 验证结果
- `npm run typecheck`
- `npm run build:user`
- `npm --workspace @studymate/graph-core run test`
### 后续影响
- 图谱页离开体验回到和其他模块一致的单页应用切换。
- 如果后续仍出现图谱切页问题，应继续修具体运行态泄漏，而不是恢复整页刷新兜底。

## 2026-06-01 18:06:00 +08:00 | v0.0.68 | 增加图谱来源关系摘要以补齐内容到图谱的可见链路
### 任务内容
- 继续按照 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 推进下一步功能实现。
- 当前阶段重点仍是收束 `v0.4.0` 到 `v0.5.0` 的交界：让资料、批注、笔记到图谱节点的来源关系清晰可见。
### 完成结果
- 更新 [packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)：
  - 新增 `summarizeGraphSourceReferences`
  - 对图谱节点中的 `source` 做去重汇总，输出总来源数、带来源节点数、按来源类型聚合和来源明细
  - 来源类型按资料、批注、笔记、卡片、AI 草稿等稳定顺序输出
- 更新 [packages/graph-core/test/sourceSwimlaneLayout.test.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/test/sourceSwimlaneLayout.test.ts)：
  - 新增来源关系摘要测试，覆盖同一来源被多个节点引用时的去重和节点计数
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 图谱右侧栏新增“来源关系 / 图谱引用”区块
  - 展示来源对象数、带来源节点数、来源类型摘要和前 5 个来源明细
  - 没有来源时显示空态，提示用户从资料、笔记或批注生成节点后会看到关系
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css) 和 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)，补齐来源关系列表样式和当前能力说明。
### 验证结果
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `cd backend; go test ./...`
### 后续影响
- 图谱不再只是“节点画布”，用户可以直接看见这张图谱和资料、批注、笔记、卡片之间的来源关系。
- 后续如果要把 `graph_relations` 暴露为后端 API 或接入搜索/运营后台，可以复用当前摘要结构作为前端展示模型。

## 2026-06-01 18:00:00 +08:00 | v0.0.67 | 修复空查询参数触发假 AI 落点循环并为图谱离页加浏览器级兜底
### 任务内容
- 用户反馈前两轮清理后依然无法点击侧边栏切换，要求自行查找、测试并解决，必要时回退或重做图谱功能，最终必须得到可正常切换的版本。
- 继续追查 AI 预计落点逻辑本身是否在没有任何 focus 查询参数时仍被触发。
### 完成结果
- 找到关键根因：旧逻辑直接执行 `Number(focusSearch.get("focusX"))` 等解析。由于 `Number(null) === 0`，没有任何 `focusX / focusY / focusWidth / focusHeight` 参数时也会生成一个 `{ x: 0, y: 0, width: 0, height: 0 }` 的假 AI 预计落点，导致图谱页在普通 `/graph` 路由上也反复进入预计落点状态更新链。
- 更新 [packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)：
  - 新增 `parseGraphFocusPreviewSearch`
  - 只有完整存在 `focusX / focusY / focusWidth / focusHeight`，且宽高大于 0 时才返回有效预计落点
  - 空参数、缺参数、零尺寸参数全部返回 `null`
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)，改为使用安全解析函数，不再让普通图谱页误触发预计落点。
- 更新 [packages/graph-core/test/sourceSwimlaneLayout.test.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/test/sourceSwimlaneLayout.test.ts)，新增空查询、缺字段、零尺寸和有效查询的回归测试。
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)，增加图谱离页兜底：
  - 当前路径在 `/graph` 时，侧边栏主导航和快速动作离开图谱会使用 `reloadDocument`
  - 这相当于只在离开复杂画布页时启用浏览器级切换保险，确保最终一定能从图谱切到其他模块
### 验证结果
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `cd backend; go test ./...`
### 后续影响
- 预计落点不再因为空查询参数形成假状态循环，这是这次无法切换问题的实质修复。
- 即使后续图谱页又引入新的复杂运行态，离开图谱也有浏览器级兜底，不再把用户锁在图谱页里。

## 2026-06-01 17:52:00 +08:00 | v0.0.66 | 彻底清理 React Router 中的 AI 预计落点状态并加固图谱拖拽释放
### 任务内容
- 用户反馈清理浏览器 history 后仍无法点击侧边栏切换，说明只改 `window.history.replaceState` 没有同步清掉 React Router 内存中的 `location.state`。
- 继续排查图谱运行态是否还有全局 pointer 拖拽状态残留，导致侧边栏点击被页面运行态持续干扰。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 将 AI 预计落点消费后的清理方式从直接写 `window.history.replaceState` 改为 React Router `navigate(..., { replace: true, state: null })`
  - 这样浏览器地址和 React Router 内存里的 `location.state` 会一起清掉，不再只清一半
  - 保留对旧版 `focus*` 查询参数的同步删除
  - 为图谱拖拽全局监听补充 `pointercancel`、`blur` 和 `event.buttons` 防漏保护，避免窗口外松手后拖拽态一直挂着
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，提高侧边栏层级，避免图谱工作区任何溢出层抢侧边栏点击。
### 验证结果
- `npm run typecheck`
- `npm run build:user`
- `npm --workspace @studymate/graph-core run test`
### 后续影响
- AI 预计落点现在会被 React Router 真正消费并移除，不会继续留在当前路由对象里。
- 即使图谱拖拽过程异常中断，页面也会自动释放全局拖拽监听，侧边栏切换不应再被图谱运行态拖住。

## 2026-06-01 17:41:00 +08:00 | v0.0.65 | 清理 AI 预计落点的浏览器历史状态以解除侧边栏切换占用
### 任务内容
- 根据用户反馈继续追查“AI 预计落点一直占用浏览器运行状态，导致无法切换侧边栏”的问题。
- 重点检查图谱页消费 `location.state` 和旧查询参数后，是否仍把预计落点上下文留在当前浏览器历史记录里。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 新增 `clearFocusNavigationFromBrowserHistory`
  - 图谱页在消费 AI 预计落点后，会立即清理当前 history entry 中 React Router 保存的 `usr` state
  - 同时清理旧版 URL 深链里的 `graphId / focusX / focusY / focusWidth / focusHeight / focusLabel` 查询参数
  - 清理过程使用 `window.history.replaceState`，不再触发一次额外的 React Router 导航，避免重新引入切页竞争
### 验证结果
- `npm run typecheck`
- `npm run build:user`
- `npm --workspace @studymate/graph-core run test`
### 后续影响
- AI 预计落点现在真正变成一次性输入：进入图谱后只负责临时定位和高亮，不再长期挂在浏览器历史状态上。
- 侧边栏切换不再被上一条预计落点 state 牵住；如果后续还有残留，应继续查页面卸载边界或全局 pointer/keydown 监听，而不是预计落点路由状态。

## 2026-06-01 17:25:00 +08:00 | v0.0.64 | 补齐图谱多选来源泳道布局并修复批量整理文案乱码
### 任务内容
- 继续按照 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 推进图谱相关能力，优先补强 `v0.6.0` 图谱产品化里的长期整理体验。
- 在已有“按来源分行 / 分列 / 生成来源分组”的基础上，补一个更适合 20+ 节点图谱整理的来源泳道布局。
### 完成结果
- 更新 [packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)，新增 `buildSourceSwimlaneLayout`：
  - 按资料、批注、笔记、卡片、AI、自由节点的稳定顺序生成来源泳道
  - 返回新的节点位置和带 `metadata.layoutKind = source-swimlane` 的分组，不修改原始节点数组
  - 对节点位置做画布边界约束，避免生成后跑出可用工作区
- 新增 [packages/graph-core/test/sourceSwimlaneLayout.test.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/test/sourceSwimlaneLayout.test.ts)，覆盖来源泳道顺序、分组元数据、不可变性和边界约束。
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 多选节点的“按来源整理”面板新增“生成来源泳道”
  - 生成泳道时会替换同一批节点上旧的自动来源泳道，避免重复堆叠
  - 修复批量对齐、居中和均分按钮的乱码中文文案
- 更新 [backend/internal/modules/graph/dto/graph.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/dto/graph.go) 和 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)，为图谱分组补充可选 `metadata` 字段，用于标记自动生成的来源泳道。
- 更新 [docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md) 与 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)，同步图谱分组元数据和当前本地能力说明。
### 验证结果
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `cd backend; go test ./...`
### 后续影响
- 图谱多选整理现在可以从“散点整理”直接提升到“按来源泳道归档”，更贴近长期学习知识库的整理场景。
- 后续可以继续把来源泳道扩展为可折叠模板、泳道重排，或把 AI 草稿确认后的落图流程直接接入这套布局算法。

## 2026-06-01 18:05:00 +08:00 | v0.0.63 | 将图谱 AI 预计落点从图谱文档写入改为纯预览视口更新
### 任务内容
- 根据复现线索继续缩小问题范围：只有在“定位到 AI 预计落点”之后才会出现路由 URL 已变化但页面仍停在图谱的现象。
- 重点排查 AI 预计落点是否错误地走进了图谱文档的正式变更链路，导致 dirty、自动保存或历史状态干扰后续切页。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 新增 `GraphFocusNavigationState`，继续支持从 `location.state` 读取 AI 预计落点和目标图谱
  - 引入 `consumedFocusRef` 和 `requestedFocusKey`，保证同一份 AI 预计落点只消费一次
  - 将原来的 `focusPreviewArea` 改为 `buildFocusPreviewViewport`，只计算预览视口
  - 新增 `previewViewport`，仅更新当前图谱页面的视口展示，不再通过 `mutateDocument` 把 AI 预计落点写成图谱文档更改
  - 删除 AI 预计落点结束后的路由回写逻辑，预览结束只关闭高亮，不再触发 `navigate`
- 这意味着 AI 预计落点现在是“临时视口预览”，不会再把图谱拖进 dirty、自动保存和历史堆栈链路。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 图谱页在 AI 预计落点后不再产生无意义的文档修改，后续如果仍有切页问题，就可以更明确地继续追向页面运行态或 React Router 渲染链，而不是图谱数据写入链。
- 这也让 AI 预计落点的语义更干净：它只是帮助用户看见“会落在哪里”，不是偷偷改动图谱本身。

## 2026-06-01 17:32:00 +08:00 | v0.0.62 | 将工作区嵌套路由改为相对路径并对 Outlet 做路径级重挂载
### 任务内容
- 在 `v0.0.61` 的嵌套路由重构后，继续收紧路由边界，排除 React Router 中绝对子路由配置和子页面复用边界不清导致图谱页残留的可能性。
- 在不退回整页重载的前提下，让主工作区在路径切换时更明确地卸载旧页面、挂载新页面。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 将公共工作区与受保护工作区的子路由从绝对路径改为相对路径
  - 将首页改为 `index` 路由，其他模块页统一收为标准的嵌套路由写法
  - 在 `PublicShellRoute` 和 `ProtectedShellRoute` 中，为 `Outlet` 增加 `key={location.pathname}`，把路径变化时的页面重建边界收敛到真正的子页面层
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 现在即使外层壳层保持稳定，真正的页面内容也会按路径显式重挂载，图谱页如果还有残留副作用，会更容易被限定在页面子树而不是扩散到整个工作区。
- 如果这一轮后依然复现，就应继续把排查重点转向 `GraphWorkspacePage` 自身的运行态观测，例如加载流程、自动保存、全局事件监听与 AI 预计落点高亮的生命周期边界。

## 2026-06-01 17:18:00 +08:00 | v0.0.61 | 将前端主工作区路由重构为嵌套路由并撤回图谱切页的整页重载兜底
### 任务内容
- 继续追查“从 AI 预计落点进入图谱后，切换到笔记等模块时 URL 已变化但页面仍停在图谱”的根因，不满足于长期依赖 `reloadDocument` 的整页刷新绕过。
- 重点检查 `App.tsx` 中重复包裹 `ShellFrame` 的路由结构是否导致图谱页残留运行态更难被正常卸载，同时保留已经修过的 AI 落点一次性导航状态逻辑。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 新增 `PublicShellRoute` 和 `ProtectedShellRoute`，用 `Outlet` 统一承载工作区页面
  - 将首页、资料库、社区、搜索页收进公共壳层路由
  - 将阅读器、笔记、图谱、复习、AI、设置页收进受保护壳层路由
  - 移除左侧主导航和快速动作上的 `reloadDocument`，恢复为正常 SPA 切换
  - 移除之前为强制刷新页面而加上的路径级主工作区重挂载兜底，让路由生命周期重新回到更自然的结构边界上
- 保留此前 AI 工作台到图谱页的 `Link state` 传递方式，以及图谱页只消费一次预计落点的实现，避免把问题重新带回查询参数和路由回写链路里。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 主工作区现在回到标准的单页应用路由切换形态，图谱页离开时的卸载边界更清晰，后续继续排查运行态残留时也更容易缩小到单个页面副作用，而不是整套外壳结构。
- 如果这次结构收口后仍能复现图谱卡住切页，下一步就应继续对 `GraphWorkspacePage` 做运行态级排查，例如为关键副作用和全局监听增加更细的消费/清理观测，而不是再回到整页重载方案。

## 2026-06-01 16:48:00 +08:00 | v0.0.60 | 将 AI 到图谱的预计落点传递从 URL 查询参数切换为一次性导航状态
### 任务内容
- 继续沿着“图谱页 AI 相关实现是否本身有问题”的方向收束，把预计落点这条链从地址栏参数驱动改成更适合一次性预览的导航状态。
- 目标是不再让 AI 预览把主路由语义和图谱内部临时状态绑在一起。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 调整 AI 工作台里的“去目标图谱查看落点”入口
  - 不再构造 `/graph?graphId=...&focusX=...` 这类查询参数链接
  - 改为通过 `Link state` 传递 `graphId` 和 `focusPreview`
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 新增图谱预览导航状态类型
  - 优先从 `location.state` 读取 `graphId` 和 `focusPreview`
  - 为 state 驱动的预览请求生成独立消费 key，避免重复触发
  - 保留对旧查询参数形式的兼容读取，避免现有链接失效
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- AI 预计落点现在更像一次性的“跳转上下文”，不会再长期挂在地址栏上，也更不容易和图谱页自己的路由处理相互干扰。
- 后续如果要继续补 AI 合并建议、图谱冲突审查或落点确认流，可以直接沿着这套 `location.state` 输入模型扩展，而不必继续扩张 URL 语义。

## 2026-06-01 16:32:00 +08:00 | v0.0.59 | 将主导航切换为文档级跳转以彻底规避图谱页残留运行态卡住切页
### 任务内容
- 在图谱页 AI 落点预览相关副作用收缩后，用户仍反馈“点击其他页面 URL 会变化，但页面仍卡在图谱，只有刷新才会跳转过去”。
- 先提供一层稳定可用的交互兜底，让主模块切换不再依赖当前单页运行态是否完全健康。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 为左侧主导航的 `NavLink` 增加 `reloadDocument`
  - 为未登录态锁定导航的 `Link` 增加 `reloadDocument`
  - 为侧栏快速动作入口增加 `reloadDocument`
  - 让从图谱切到笔记、资料库、社区、AI 等主模块时直接按目标 URL 重新进入页面，不再被旧的前端运行态卡住
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 现在主导航切换会表现得更像“工作台模块跳转”而不是完全依赖单页内切换，对当前这类图谱运行态残留问题有直接兜底效果。
- 这一步先保证可用性；后续仍值得继续追根因，把图谱页运行态清理做回真正稳定的 SPA 切换。

## 2026-06-01 16:18:00 +08:00 | v0.0.58 | 去掉图谱 AI 落点预览对路由的全部写操作
### 任务内容
- 在上一轮仍未完全解除“AI 落点预览后切到笔记仍卡在图谱”的情况下，继续把问题收缩到图谱页自身的路由副作用上。
- 目标是让图谱页把 AI 预计落点只当作一次性输入消费，不再在预览期间主动修改任何路由状态。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 新增 `consumedFocusRef`，按当前 `location.search` 记录已消费过的落点预览请求
  - AI 落点预览只在同一份查询参数首次进入时触发一次，避免重复定位
  - 完全移除图谱页在预览期间对路由的 `navigate` 写操作
  - 计时器只负责关闭本地高亮，不再清 URL，也不再替换当前路径
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 现在图谱页即使从 `/ai` 带着落点参数进入，也不会再在预览结束时回写路由，因此不会和用户主动切换到 `/notes`、`/materials` 等路径产生竞争。
- 这会让 AI 落点预览更像普通的“初始定位输入”，后续如果要做更复杂的图谱深链，也能在不干扰主路由切换的前提下继续扩展。

## 2026-06-01 16:05:00 +08:00 | v0.0.57 | 移除 AI 落点预览的延迟路由回写以修复图谱预览后切页卡住
### 任务内容
- 根据复现线索继续排查“只有触发 AI 预计落点后，切换到笔记等其他路由时页面才卡在图谱”的问题。
- 收束图谱页 AI 落点预览的查询参数清理方式，避免预览结束后的延迟导航干扰后续正常切页。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 保留 AI 落点预览高亮与视野定位逻辑
  - 将“清理落点预览查询参数”的动作从 2.6 秒后的延迟 `navigate` 改成预览触发后立即执行
  - 计时器现在只负责关闭本地 `focusPreview` 高亮，不再承担任何路由回写职责
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 触发过 AI 预计落点后，图谱页不再保留一个悬而未决的延迟导航，切去 `/notes`、`/materials` 等页面时不会再被图谱页的后置替换动作拖回去。
- 这也把“高亮预览”和“地址栏清理”彻底解耦，后面如果继续强化图谱预览交互，路由层面的副作用会更可控。

## 2026-06-01 15:42:00 +08:00 | v0.0.56 | 加强路由子树重挂载以修复图谱切到笔记仍停留原页面的问题
### 任务内容
- 继续排查用户反馈的“从图谱切到笔记时 URL 已变成 `/notes`，但界面仍停留在图谱”的问题。
- 在已为主工作区增加路径 key 的基础上，再补一层更稳定的路由级重挂载保护，避免旧页面实例残留。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 在 `App` 顶层读取当前 `location.pathname`
  - 为 `<Routes>` 增加 `key={location.pathname}`，让每次主路径切换时整棵当前路由子树重新挂载
  - 配合此前 `ShellFrame` 内部 `main-grid` 的路径 key，一起消除图谱页离开后的残留渲染状态
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 现在从 `/graph` 切到 `/notes`、`/materials`、`/community` 这类主模块时，页面会按路由重新建立，不再依赖单个页面自己是否清理完整。
- 如果后面继续把更多复杂交互堆进图谱页，这层路由级重挂载也能继续兜住切页稳定性。

## 2026-06-01 15:20:00 +08:00 | v0.0.55 | 修复图谱页切换后页面不刷新的卡死问题并重建项目日志编码
### 任务内容
- 检查 `PROJECT_LOG.md` 中后续新增记录的乱码、重复段和混合编码问题，恢复成可持续维护的正常中文文档。
- 修复前端在进入 `/graph` 后再切换到其他模块时“地址栏已变化，但页面内容仍停留在图谱”的切页卡死问题。
### 完成结果
- 重建 `PROJECT_LOG.md`：
  - 以 `28bff0b` 提交中的干净历史记录为基底
  - 重新整理并补回 `v0.0.50` 到 `v0.0.54` 的版本记录
  - 删除后半段重复追加的损坏内容，并统一保存为 UTF-8 编码
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 为 `ShellFrame` 内部的 `main-grid` 增加 `key={location.pathname}`
  - 让从图谱页切换到其他路由时，主工作区子树按路径重新挂载，避免图谱页残留状态阻止页面刷新
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- `PROJECT_LOG.md` 重新回到稳定可读状态，后续继续追加记录时不会再被当前这段混合编码历史拖坏。
- 图谱工作区离开后会干净卸载；如果后面还要继续增强画布交互，建议把图谱页里与全局监听器、定时器相关的副作用继续保持“进入即挂载、离开即清理”的边界。

## 2026-06-01 14:10:00 +08:00 | v0.0.54 | 扩宽学习工作台壳层并重排首页工作区以充分利用大屏页面
### 任务内容
- 响应浏览器批注中“需要充分使用整个页面”的反馈，收紧 StudyMate 首页与壳层中过多的留白。
- 在不牺牲知识工作台气质的前提下，把大屏空间转成真实可用的工作面，而不是单纯放大空白区域。
### 完成结果
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)：
  - 将 shell 最大宽度、侧栏与上下文栏宽度重新校准，让用户端在 2K/超宽屏下使用更多横向空间
  - 放宽搜索栏与主工作区内边距，并让右侧 context panel 改为 sticky，提升长页浏览时的信息伴随感
  - 重做 dashboard 首页网格，改成主工作列 + 侧边工作列的布局，让上半屏不再空着
  - 为首页新增 story-card grid、action grid、empty card 等样式，保证扩宽后不是“更宽的空白”，而是“更大的工作面”
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 给 SectionFrame 增加 className 扩展能力，方便首页不同工作区采用差异化布局
  - 把首页的“最近资料 / 最近笔记 / 高频入口 / 社区动态”重新编排进双列工作台结构
  - 把快速动作改成真实可点击入口，并根据登录状态自动跳转到目标页或登录页
  - 扩大首页最近资料、笔记、社区内容的展示数量，让首页承担更多继续工作入口
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 这一轮把首页从“居中展示面”继续往“真正的学习台面”推了一步，后面再补图谱、阅读器和笔记页的大屏优化时可以直接沿用这套宽壳层规则。
- 下一步最值得继续的是针对 `/reader`、`/notes`、`/graph` 做同级别的大屏密度优化，把当前更宽的壳层转换成更深的多面板协作体验。

## 2026-06-01 13:42:00 +08:00 | v0.0.53 | 重做 StudyMate 前后台产品 UI 风格并回退对外部项目的照搬布局
### 任务内容
- 回退此前对 `Zhenmeng8023/IT` 风格的过度借用，不再沿用那套偏冷色玻璃卡片的布局壳层。
- 重新按 StudyMate 作为知识工作台的产品定位，统一用户端、图谱工作区、AI/搜索/复习卡片和后台治理界面的 UI 语言。
### 完成结果
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)：
  - 重建用户端 shell token，改成更克制的中性色 + 深绿强调色，收回过重的玻璃卡片与蓝青渐变
  - 重新设计侧栏、顶部工具条、上下文面板与主工作区层级，让页面更接近知识工作台而不是参考项目的外壳
  - 统一图谱工作区的 stage、节点、右键菜单、缩略图、快捷键面板与多类工作卡片的圆角、底色和状态语义
  - 顺手修正激活态按钮误用危险红色的问题，并把搜索、AI、复习、登录页等常用面板一起收回同一套视觉语言
- 更新 [frontend-admin/src/App.vue](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/App.vue)：
  - 将后台重构为深色左导航 + 浅色内容区的治理控制台风格
  - 去掉照搬而来的蓝灰玻璃感，统一按钮、卡片、输入框和顶栏节奏
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 修正顶栏搜索框占位文案，恢复正常中文提示
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 后续影响
- 这一轮把 StudyMate 的前端风格从“参考项目影子”拉回到更适合知识整理与学习流的产品基调，后面继续扩展图谱、AI 和复习页时可以直接沿用这套壳层和卡片语法。
- 下一步适合继续做页面级细化，例如图谱详情侧栏的密度优化、阅读器工具条的信息组织，以及移动端壳层的进一步收束。

## 2026-06-01 12:08:00 +08:00 | v0.0.52 | 继续打磨图谱工作区的吸附提示、快捷键说明与批量来源整理
### 任务内容
- 按 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 继续收束 `v0.5.0 / v0.6.0` 图谱工作区，优先补齐多选场景下的吸附反馈、快捷键入口和按来源整理能力。
- 目标不是再加零散按钮，而是让 20+ 节点图谱的整理过程更顺手、更可预期。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 扩展对齐参考线逻辑，为吸附结果补上左边 / 右边 / 中线 / 顶边 / 底边级别的语义提示
  - 在 stage 状态区新增吸附提示 pill，让拖动时不只看到线，还知道当前吸附到什么
  - 新增快捷键面板入口，并支持 `?` 打开或关闭
  - 补上图谱工作区热键：`Ctrl/Cmd+A` 全选可见节点、`F` 聚焦节点、`G` 建组、`L` 连线模式、`0` 重置视野
  - 为多选节点新增“按来源分列 / 按来源分行 / 生成来源分组”三种整理动作
  - 增加来源统计摘要，让批量整理前先看到当前选中节点的来源构成
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)：
  - 补充吸附提示 pill、快捷键面板、来源摘要胶囊等样式
  - 让新加的工作台提示层延续现有 graph workspace 的产品化视觉语气
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 这一步把图谱工作区从“多选已可用”往“多选整理真的顺手”推进了一截，特别适合后面继续扩图谱产品化功能时复用。
- 下一步最值得继续的是做更细的吸附体验，比如节点与分组边界的吸附、拖动时的间距提示，以及把批量来源整理进一步扩到“按来源自动生成泳道布局”。

## 2026-06-01 00:20:41 +08:00 | v0.0.51 | 继续加厚图谱工作区的批量样式与拖动参考能力
### 任务内容
- 继续在 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 和 [docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md) 范围内推进 `v0.6` 图谱产品化，不停留在“能多选”，而是继续补“多选之后怎么更高效地整理”。
- 结合本地 ECC 的 `product-capability / tdd-workflow / verification-loop` 思路和 CodeGraph 上下文，优先实现“拖动对齐参考线”与“批量样式编辑”这两块整理效率能力。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 新增对齐参考线计算逻辑，单节点和多节点拖动时都会和未选中节点做边缘 / 中心吸附判断
  - 拖动过程中会实时显示垂直 / 水平参考线，结束拖动、切换画布或按 `Esc` 时会自动清空
  - 多选面板新增批量颜色、批量强调、批量尺寸控制，直接复用现有节点样式模型批量写回 metadata
  - 批量编辑会识别当前是否“样式一致”，从而正确点亮当前选项，而不是盲目显示单值
  - 顺手修正边选逻辑里的节点选择清理，避免节点多选残留干扰连线编辑
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充对齐参考线的可视化样式。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 到这一步，图谱工作区已经从“能框选和批量移动”继续推进到“批量移动时更有参照、批量整理时更少重复劳动”，离 `v0.6.0` 里“适合长期整理知识”的目标又近了一步。
- 下一步最顺的是继续补“吸附提示文案 / 快捷键说明 / 批量来源标记”，或者把这套多选整理能力继续接到 AI 草稿确认后的落图流程里。

## 2026-06-01 11:36:00 +08:00 | v0.0.50 | 对标 Zhenmeng8023/IT 收束 StudyMate 前后台产品化 UI 风格
### 任务内容
- 按用户要求学习参考项目 `Zhenmeng8023/IT` 的前端界面风格，并结合本地 `design-taste-frontend` skill，把它翻译成适合 StudyMate 的产品 UI 语言，而不是直接照搬 Element UI 视觉。
- 基于 CodeGraph 和源码阅读，优先收束前台学习工作区与后台治理控制台的壳层、导航、面板、卡片、工具条和按钮系统，让整体界面从“单页各自成立”升级成“同一家产品的统一工作台”。
### 完成结果
- 参考仓库本地分析：
  - 读取并拆解 `E:/Code/reference-ui/IT/it-ui/ui/layouts/manage.vue`
  - 读取并拆解 `E:/Code/reference-ui/IT/it-ui/ui/components/front/FrontNavShell.vue`
  - 读取并拆解 `E:/Code/reference-ui/IT/it-ui/ui/components/admin/AdminTableCard.vue`
  - 提炼出适合 StudyMate 的三条设计主线：主题 token 化、前后台稳定壳层、复用型页面原语
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)：
  - 重建用户端设计 token，改为更偏产品化的冷静中性色基底，保留 StudyMate 自己的学习感但减轻原先偏暖偏杂志化的观感
  - 新增 shell / sidebar / context rail / topbar 级别的结构变量，统一宽度、圆角、阴影、表面层级与吸顶行为
  - 让 `workspace-surface / context-panel / section-frame / metric-tile / sidebar-card` 进入同一面板系统
  - 把主要标题、图谱卡片、复习卡片等从大面积衬线切回更稳的产品字体权重，减少 UI 的“编辑器海报感”
  - 统一按钮、筛选 chip、搜索框和导航项的交互形态，让工具操作更像工作台而不是营销页组件
- 更新 [frontend-admin/src/App.vue](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/App.vue)：
  - 重构后台 scoped 样式 token，使后台与用户端进入同一套产品家族
  - 把后台调整为更接近 IT 参考项目的治理控制台结构：稳定左侧导航、吸顶 topbar、状态条、数据卡和内容卡层级
  - 收束登录卡、导航项、审核卡、占位模块卡和按钮样式，使后台不再只是“能用”，而是更接近真实运营台
  - 新增 `status-stack`，把 notice 与 error 信息收纳到一致的状态区，而不是散落在内容流里
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 后续影响
- 这轮不是补单个功能，而是补了一层会持续影响后续开发的前端设计基础设施。后面继续做图谱、复习、AI、搜索和后台治理页时，可以直接沿着这套壳层和面板体系扩展，而不用每页重新找视觉语气。
- 下一步最值得继续的是把用户端页面内部再进一步组件化，补出更明确的 `page header / table card / filter bar / side rail` 原语，并逐步把超大的 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 和 [frontend-admin/src/App.vue](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/App.vue) 拆成更清晰的 UI 结构件。

## 2026-05-31 23:46:27 +08:00 | v0.0.49 | 补齐图谱产品化里的 PNG 导出与节点右键菜单
### 任务内容
- 继续在 [docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md) 范围内推进图谱工作区，把“导入导出入口”和“更顺手的画布交互”做得更像完整产品。
- 基于 CodeGraph 梳理当前图谱页的导出链路和节点交互入口后，优先补 `PNG 导出` 与 `右键菜单` 这两个明显还欠一截的能力。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 新增 PNG 导出逻辑，复用现有 SVG 渲染结果生成 PNG 文件
  - 工具栏现在同时提供 PNG 和 SVG 两种导出入口
  - 画布、节点和连线都接入右键菜单
  - 节点右键菜单支持聚焦、复制、建立分组、设置连线起点、打开来源、删除
  - 连线右键菜单支持直线/曲线切换和删除
  - 画布空白处右键菜单支持快速新建节点和直接导出 PNG
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充右键菜单与菜单项样式。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 到这一步，图谱页已经更接近 `v0.6.0` 文档里说的“适合长期整理知识”的工作区了：导出不再只剩 SVG，常用节点操作也不必反复跑到侧边栏。
- 下一步最顺的是继续补 `v0.5.0` 里还偏弱的交互项，比如框选；或者继续把右键菜单和来源上下文联动得更深，例如从材料节点右键直接回阅读器并尽量保留上下文。

## 2026-05-31 23:32:28 +08:00 | v0.0.48 | 继续补齐图谱节点来源回看与跳转链路
### 任务内容
- 继续沿着 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 的图谱收束方向，补强节点详情里的“来源上下文回看”能力。
- 让图谱中的来源节点不只是显示来源标签，而是可以直接回到笔记、阅读器或复习页查看原始上下文。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 新增节点来源类型到目标页面的跳转映射
  - 节点详情面板里新增“回到阅读器 / 回到笔记 / 去复习页”快捷入口
  - 来源标识现在会显示更友好的来源类型名称，而不是只显示原始 type
  - 对没有摘录内容但存在来源引用的节点，补充了“来源上下文”提示文案，提醒用户回原页面查看
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 现在图谱节点已经不只是“承载来源信息”，而是开始真正进入“图谱整理 -> 回原始上下文 -> 再回来继续整理”的往返工作流。
- 下一步最顺的是把跳转做得再精一点，例如从图谱回到笔记时自动定位到目标 note，或者回到阅读器时带上更具体的批注/页码上下文。

## 2026-05-31 22:47:40 +08:00 | v0.0.47 | 继续补齐图谱节点详情结构的来源预览与尺寸预设
### 任务内容
- 继续沿着 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 和 [docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md) 的方向收束图谱工作区，把“节点详情”从基础编辑再往前推进一步。
- 优先补长期整理知识时最常用的两个细节：来源摘录预览，以及节点尺寸预设。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 节点详情面板新增“紧凑 / 标准 / 展开”三档尺寸预设
  - 节点详情面板新增节点规格展示，便于理解当前节点尺寸
  - 当节点带有来源信息时，会展示来源类型/ID 和来源摘录预览
- 更新 [frontend-user/src/modules/graph/nodeAppearance.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/nodeAppearance.ts)，补充节点尺寸预设定义、当前尺寸判断和尺寸应用逻辑。
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充节点详情区的双列元信息布局样式。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 现在图谱节点已经更接近“可长期维护的知识单元”：不仅能写标题和样式，还能承载来源上下文，并快速切换展示密度。
- 下一步最顺的是继续补节点详情里的“来源跳转 / 上下文回看”能力，或者把尺寸预设和 AI 落点预览联动起来，让导入后的节点更容易就地整理。

## 2026-05-31 22:36:02 +08:00 | v0.0.46 | 按版本计划补齐图谱节点详情与基础样式编辑
### 任务内容
- 依据 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 当前应优先收束 `v0.5.0 / v0.6.0` 图谱工作区的要求，继续补齐“节点详情结构”和“节点颜色/基础样式编辑”这两个仍然偏弱的验收点。
- 保证图谱节点的样式和详情 metadata 不只停留在前端临时状态里，而是能跟随保存、快照和导出链路一起稳定存在。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 节点详情面板新增“节点笔记”编辑，写入节点 `metadata.detail`
  - 节点详情面板新增颜色切换和“默认 / 重点 / 弱化”强调态切换
  - 分组列表支持直接改分组标题
  - 画布上的节点渲染和 SVG 导出会一起反映节点样式
- 新增 [frontend-user/src/modules/graph/nodeAppearance.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/nodeAppearance.ts)，集中封装图谱节点样式读取、默认值、渲染 token 和 metadata 回写逻辑，避免样式规则散落在页面组件里。
- 更新 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts) 和 [packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)，把节点 `appearance/detail` 相关类型补成明确结构，而不再只是松散的 `Record<string, unknown>`。
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充节点样式切换、紧凑分段控制和分组标题输入的界面样式。
- 更新 [backend/internal/modules/graph/repository/document_repository_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/repository/document_repository_test.go)，补充图谱节点 metadata、theme 和文档 metadata 在持久化构建阶段不会丢失的测试。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `go test ./...`
### 后续影响
- 这一步让图谱页更贴近 `v0.6.0 图谱产品化版` 的验收口径：现在节点不只是“能拖、能连”，也开始具备长期整理知识时需要的基础表达能力。
- 下一步最顺的是把节点笔记和图谱侧边面板继续往“节点详情结构”推进，例如补来源摘录预览、节点尺寸/布局预设，或者把 AI 落点预览直接接到节点详情编辑流里。

## 2026-05-31 22:24:41 +08:00 | v0.0.45 | 按版本计划收束图谱工作区定位预览并修正部分接受语义
### 任务内容
- 依据 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 当前“优先稳住图谱工作区”的方向，继续把 `/ai -> graph` 的定位预览补到可用状态。
- 修正图谱变更草稿“部分接受”时的后端语义，避免未选节点被整条草稿确认后直接丢失。
### 完成结果
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 支持通过查询参数直接打开目标 graph
  - 支持自动平移到预计落点区域并显示短暂高亮框
  - 预览结束后自动清理查询参数
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)，让 AI 草稿中的候选节点可以一键跳转到目标图谱查看落点。
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充图谱落点高亮框样式。
- 更新后端图谱草稿应用逻辑：
  - [backend/internal/modules/graph/service/helpers.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers.go)
  - [backend/internal/modules/graph/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/service.go)
  - [backend/internal/modules/ai/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/document_repository.go)
  - [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)
  现在图谱草稿按节点筛选部分接受后，会把未选节点保留在草稿里，而不是把整条草稿直接标为已确认。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 这一步更贴合版本计划里 `v0.5.0 / v0.6.0` 的图谱工作区收束目标：不是继续横向扩功能，而是把图谱编辑和预览链路做扎实。
- 下一步最顺的是把高亮预览区域和图谱侧边属性面板连起来，让用户到了 graph 页后可以直接围绕该区域继续编辑，而不只是看一眼。

## 2026-05-31 21:27:18 +08:00 | v0.0.44 | 打通 /ai 到图谱页的落点跳转与高亮预览
### 任务内容
- 让 `/ai` 里的图谱变更候选节点不止能看到预计落点，还能一键跳去目标图谱查看该区域。
- 让图谱页收到定位参数后自动切换到目标 graph、平移到预计区域并给出短暂高亮。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 新增图谱落点跳转链接生成逻辑
  - 在候选节点元信息里补上“去目标图谱查看落点”入口
- 更新 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)：
  - 读取 `graphId / focusX / focusY / focusWidth / focusHeight / focusLabel` 查询参数
  - 初始加载时优先打开目标 graph
  - 自动平移视野到指定区域，并渲染短暂高亮框
  - 高亮结束后自动清理查询参数
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充图谱落点高亮样式与动效。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 现在 `/ai -> graph` 已经不是抽象的“去看看”，而是能直接把人送到预计区域，确认与后续编辑的链路顺了很多。
- 下一步可以继续补“从高亮区域反向接受 / 拒绝节点”或者“在图谱页直接完成合并建议”，把两边工作台真正连成一体。

## 2026-05-31 21:11:29 +08:00 | v0.0.43 | 为图谱变更确认补预计落点与相似节点提示
### 任务内容
- 继续提升 `/ai` 图谱变更确认时的空间感，让候选节点不只是“有名字”，而是能提前看到大致会落到图谱哪一块。
- 补充与目标图谱中已有节点的相似提示，减少确认时的纯文本判断负担。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 为图谱变更候选节点补充预计写入位置推算
  - 为每个候选节点补充“左侧 / 中部 / 右侧”落点区域提示
  - 基于目标图谱当前节点标题，给出最多 3 个相似已有节点提示
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充候选节点元信息样式。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- `/ai` 里的图谱变更预览已经从“看候选节点”升级成“看候选节点会落到哪里、和谁撞车”，确认体验更接近真实编辑前审阅。
- 下一步可以继续补“从预览直接跳去目标图谱定位区域”和“相似节点的合并建议”，把确认动作和后续编辑连起来。

## 2026-05-31 20:13:09 +08:00 | v0.0.42 | 为图谱变更确认补节点级勾选与目标图谱冲突提示
### 任务内容
- 把 `/ai` 中图谱变更草稿的确认粒度继续下探到节点级，而不是只按整条草稿确认。
- 在确认前补目标图谱的同名节点冲突提示，帮助用户判断哪些候选节点可能会重复。
### 完成结果
- 扩展后端图谱确认请求：
  - [backend/internal/modules/graph/dto/graph.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/dto/graph.go)
  - [backend/internal/modules/graph/service/helpers.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers.go)
  - [backend/internal/modules/graph/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/service.go)
  现在 `POST /api/v1/graphs/:id/ai/commit-changes` 支持按 `draftId -> nodeIds` 传入节点选择，后端会自动过滤未选节点及其失效连线。
- 更新 [backend/internal/modules/graph/service/helpers_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers_test.go)，补上节点过滤后的应用测试。
- 更新前端：
  - [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts) 新增带 `nodeSelections` 的图谱确认请求
  - [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 为每条图谱变更草稿补节点级复选框、目标图谱同名冲突提示，并在确认时只提交保留的节点
  - [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css) 补充节点级勾选样式
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- 图谱变更确认流现在已经能做到“先看冲突，再按节点裁剪后写入”，明显更接近真正可用的 AI 审核台。
- 下一步可以继续补“节点写入前的定位预览”和“相似而非同名的概念提醒”，把确认质量再往前推一步。

## 2026-05-31 20:07:20 +08:00 | v0.0.41 | 为 /ai 图谱变更草稿补差异预览与单条勾选确认
### 任务内容
- 继续提升 `/ai` 的确认体验，不再只支持“整批写入图谱”，而是允许按条勾选待确认的图谱变更草稿。
- 为 `graph_change` 草稿补节点 / 连线的差异预览，降低确认前的信息不透明感。
### 完成结果
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)：
  - 为图谱变更草稿新增单条勾选状态
  - 支持“全选当前筛选结果 / 清空选择”
  - 图谱确认动作只提交当前选中的草稿
  - 为每条 `graph_change` 草稿展示候选节点列表与候选连线列表
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充图谱变更预览、勾选行和双列差异列表的样式。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- `/ai` 里的图谱确认流已经从“能批量确认”提升到“能逐条审阅后确认”，更接近真实生产环境下的 AI 审核工作台。
- 下一步可以继续补“图谱变更预览中的节点级勾选”和“确认前目标图谱冲突提示”，让确认粒度再细一层。

## 2026-05-31 19:28:14 +08:00 | v0.0.40 | 把 /ai 补成草稿筛选与图谱变更确认工作台
### 任务内容
- 继续强化 `/ai` 工作台，补上按来源 / 状态筛选草稿的能力，让待确认结果不再只能整批查看。
- 把 `note -> graph` 与 `pdf annotations -> graph` 的待确认变更接入同一套 `ai_drafts` 机制，并允许在 `/ai` 里直接确认写入目标图谱。
### 完成结果
- 扩展后端 AI 草稿模型与仓储：
  - [backend/internal/modules/ai/dto/ai.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/dto/ai.go)
  - [backend/internal/modules/ai/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/document_repository.go)
  - [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)
  现在支持 `metadata` 持久化、按 `draftIds` 读取草稿、记录 `graph_change` 类型草稿。
- 新增笔记 / 阅读器生成图谱变更草稿能力：
  - [backend/internal/modules/note/service/graph_drafts.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/graph_drafts.go)
  - [backend/internal/modules/reader/service/graph_drafts.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/reader/service/graph_drafts.go)
  - 新接口：
    - `POST /api/v1/notes/:id/ai/generate-graph-drafts`
    - `POST /api/v1/materials/:id/reader/annotations/generate-graph-drafts`
- 新增图谱变更确认接口 `POST /api/v1/graphs/:id/ai/commit-changes`，并在 [backend/internal/modules/graph/service/helpers.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers.go) 实现草稿应用、节点/连线 ID 重映射与追加写入。
- 更新前端：
  - [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts) 增加图谱变更相关接口与 `AiDraftPayload.metadata`
  - [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 中的 `/ai` 页面支持来源 / 状态筛选、卡片草稿写 deck、图谱变更写 graph；笔记页和阅读器页也补了“生成图谱变更”入口
  - [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css) 补了 AI 筛选面板样式
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- `/ai` 现在已经能统一承接两类确认流：`card_draft -> deck/card` 和 `graph_change -> graph`，更接近 1.0 里“可审阅、可确认、可追踪”的 AI 工作台。
- 下一步可以继续补两块高价值能力：一是为图谱变更增加预览差异和单条勾选确认；二是把 graph -> note / review 的反向建议也接进同一套草稿池。

## 2026-05-31 19:10:23 +08:00 | v0.0.39 | 让 AI 工作台支持直接确认草稿并写入 deck
### 任务内容
- 把 `/ai` 从只读历史页推进成可执行工作台，让待确认草稿可以直接选择目标 deck 并写入复习系统。
- 补齐草稿来源跳转和客户端 `draftId` 透传，避免确认动作丢失草稿关联。
### 完成结果
- 扩展 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)，让 `bulkCreateDeckCards` 明确支持 `draftId`，与后端草稿确认链路对齐。
- 更新 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 中的 `AiPage`：
  - 新增 deck 列表加载与默认目标选择
  - 支持把 `pending` 草稿一键写入复习系统
  - 写入后自动刷新 AI 任务、草稿和用量摘要
  - 为图谱 / 笔记 / 阅读器草稿补充“打开来源工作台”跳转
- 更新 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)，补充 AI 工作台确认面板的布局样式。
### 验证结果
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 后续影响
- `/ai` 现在已经从“看结果”进入“处理结果”阶段，待确认草稿可以直接落到 deck，`Phase 7 -> Phase 6` 的协同更顺了。
- 下一步可以继续做两件高价值事情：一是支持在 `/ai` 里按来源、状态筛选草稿；二是把 `note/pdf -> graph` 的待确认变更也并入同一套 AI 工作台。

## 2026-05-31 16:48:56 +08:00 | v0.0.38 | 持久化 AI 待确认草稿并打通确认后状态回写
### 任务内容
- 把上一轮的 AI 任务记录继续推进到 `ai_drafts` 持久化，让草稿结果真正可回看，而不是只留下任务壳。
- 让草稿在写入 deck 后回写为已确认状态，避免 AI 工作台永远堆积旧草稿。
### 完成结果
- 新增 Mongo 草稿仓储 [backend/internal/modules/ai/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/document_repository.go)，将 AI 卡片草稿按单条文档写入 `ai_drafts`。
- 扩展 [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)，新增：
  - `ListDrafts`
  - `RecordNoteCardDrafts`
  - `RecordReaderCardDrafts`
  - `RecordGraphCardDrafts`
  - `ConfirmDrafts`
- 新增接口：
  - `GET /api/v1/ai/drafts`
- 扩展图谱、笔记、PDF 批注草稿生成链路，返回可追踪的 `draftId`；对应确认写卡时，通过 [backend/internal/modules/card/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/card/service/service.go) 将草稿标记为 `confirmed`。
- 前台 AI 工作台补上“最近 AI 草稿”面板，并展示待确认数量、草稿状态与内容预览；相关改动在 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)、[frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)、[frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 后续影响
- AI 工作台现在已经不只是“任务日志”，而是开始具备真正的待确认结果池，符合设计说明书里 `ai_drafts` 的落地方向。
- 下一步可以继续做两件高价值事情：一是把 `/ai` 上的草稿结果直接跳转回来源页面或确认目标，二是把 `note/pdf -> graph` 的待确认变更流做成同一套持久化机制。

## 2026-05-31 14:04:55 +08:00 | v0.0.37 | 接入 AI 任务与用量追踪并落地 AI 历史页
### 任务内容
- 补齐 `Phase 7` 中当前最缺的 `ai_tasks / ai_usage_logs` 追踪能力，让图谱、笔记、PDF 批注生成草稿时留下任务记录与状态。
- 把前台 `/ai` 从占位页升级为真实的 AI 历史与用量工作台。
### 完成结果
- 新增后端 AI 模块：
  - [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)
  - [backend/internal/modules/ai/repository/repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/repository.go)
  - [backend/internal/modules/ai/handler/handler.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/handler/handler.go)
  - [backend/internal/modules/ai/router/router.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/router/router.go)
- 新增接口：
  - `GET /api/v1/ai/tasks`
  - `GET /api/v1/ai/usage`
- 在 [backend/internal/modules/graph/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/service.go)、[backend/internal/modules/note/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/service.go)、[backend/internal/modules/reader/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/reader/service/service.go) 接入草稿生成任务记录，成功/失败都会留下可追踪状态。
- 前端 AI 页升级为真实页面，位于 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)；客户端接口补在 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)，样式补在 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)。
- 已重启本地前后端服务，使 `http://localhost:8001/ai` 和 `http://localhost:8023/api/v1/ai/tasks` 指向最新代码。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 后续影响
- AI 草稿生成已经开始具备“任务历史、状态、来源、用量”的可回看能力，后续补 `ai_quota_logs`、失败重试和后台 AI 任务监控会顺得多。
- 下一步可以继续把 `AI 待确认结果` 从仅记录任务推进到真正持久化草稿内容，例如 `ai_drafts` 与 `note/pdf -> graph` 的待确认变更流。

## 2026-05-31 13:38:23 +08:00 | v0.0.36 | 接入笔记 / PDF 批注到复习草稿链路并规范 PROJECT_LOG 维护
### 任务内容
- 补齐 `note -> card drafts -> deck` 和 `reader annotations -> card drafts -> deck` 的后端接口与前端交互。
- 把 `PROJECT_LOG.md` 纳入每次迭代的常规更新清单，并补录近几轮版本进展。
### 完成结果
- 新增后端接口：
  - `POST /api/v1/notes/:id/ai/generate-cards`
  - `POST /api/v1/materials/:id/reader/annotations/generate-cards`
  - `POST /api/v1/decks/:id/cards/bulk`
- 扩展 [backend/internal/modules/note/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/service.go) 和 [backend/internal/modules/reader/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/reader/service/service.go)，把笔记正文、批注引用正式转成可编辑卡片草稿。
- 扩展 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 和 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)，在笔记页、阅读器页接入 deck 选择、草稿编辑、确认写入交互。
- 在本文档补录 v0.0.34 / v0.0.35 / v0.0.36 的主要变更，后续继续按同样方式维护。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 后续影响
- `Phase 5 -> 6/7` 的图谱、笔记、阅读器、复习系统已经开始共用同一套卡片草稿确认流程。
- 后续可以继续把 `ai_tasks / ai_usage_logs` 和 `note/pdf -> graph` 的双向链路补全到 1.0 范围。

## 2026-05-31 12:55:00 +08:00 | v0.0.35 | 打通图谱卡片草稿确认写入 deck
### 任务内容
- 把图谱提取到的复习草稿变成可以直接确认写入 deck 的真实流程。
### 完成结果
- 新增 `POST /api/v1/graphs/:id/ai/commit-cards`。
- 前端图谱页支持 deck 选择、草稿编辑、一键写入复习系统。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 后续影响
- 为后续笔记、PDF 批注、AI 草稿复用同一条卡片落地链路打好基础。

## 2026-05-31 12:10:00 +08:00 | v0.0.34 | 完成 deck / card / SM-2 复习闭环
### 任务内容
- 把 `Phase 6` 的 `deck`、`card`、`today queue`、`review submit` 和 `SM-2` 调度接到真实后端与前端。
### 完成结果
- 新增后端 `card` 模块，支持卡组、卡片创建、今日到期队列、评分提交和 SM-2 调度。
- 新增前端 [frontend-user/src/modules/review/ReviewWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/review/ReviewWorkspacePage.tsx)，支持创建 deck、添加卡片、翻面、按 `Again / Hard / Good / Easy` 复习。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 后续影响
- 复习系统已经可以承载图谱、笔记和 AI 草稿生成的卡片内容，成为 1.0 中的真实主干。

## 2026-05-27 14:27:30 +08:00 | v0.0.33 | 接入笔记内容 Mongo 双写并修复删除清理链路
### 任务内容
- 按当前项目进展，把笔记正文开始接入 MongoDB。
- 让 `notes` 和 `note_versions` 在写入 MySQL 的同时，双写到 `note_documents` 和 `note_snapshots`。
- 验证创建、更新、删除三条核心链路，并修复过程中发现的数据残留问题。
### 完成结果
- 新增 [backend/internal/modules/note/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/repository/document_repository.go)，实现：
  - `note_documents` 当前文档 upsert
  - `note_snapshots` 版本快照 upsert
  - 删除笔记时的 Mongo 文档清理
  - HTML 到 `plain_text` 的提取与单块结构封装
- 新增 [backend/internal/modules/note/repository/document_repository_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/repository/document_repository_test.go)，覆盖纯文本提取和文档构建。
- 更新 [backend/internal/modules/note/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/service.go)，在创建、更新、恢复版本、删除笔记时接入 Mongo 双写和清理。
- 更新 [backend/internal/app/server.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/app/server.go)，为 `note` 模块注入 Mongo 文档仓储。
- 更新 [backend/internal/modules/note/repository/repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/repository/repository.go)，补充删除 `note_versions / note_relations` 的能力。
- 更新 Mongo 初始化脚本 [backend/internal/migrations/mongo/001_init_content_collections.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.js)，修复快照唯一索引字段名错误，并支持自动重建同名旧索引。
- 更新 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)、[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)、[docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)，同步当前实现状态。
### 验证结果
- `go test ./...` 通过。
- 真实接口联调通过：
  - 注册临时用户
  - 创建笔记后 `note_documents = 1`，`note_snapshots = 1`
  - 更新笔记后 `note_documents.version = 2`，`note_snapshots = 2`
  - 删除笔记后 Mongo 中 `note_documents = 0`、`note_snapshots = 0`
  - 删除笔记后 MySQL 中 `notes = 0`、`note_versions = 0`、`note_relations = 0`
- 已修复 `note_snapshots` 索引字段名从 `version_number` 到 `version` 的不一致问题，并在现有 `studymate_content` 上重建成功。
- 已清理本轮调试生成的临时残留笔记和 Mongo 文档。
### 后续影响
- 笔记模块已经进入“主记录在 MySQL、内容文档在 Mongo 双写”的状态。
- 下一步可以继续把读取链路逐步切换到 Mongo，或者开始把阅读批注也接入 `pdf_annotation_documents`。

## 2026-05-27 13:34:10 +08:00 | v0.0.32 | 清理 Mongo 临时 test 库
### 任务内容
- 删除 MongoDB 中不再需要的临时 `test` 数据库。
- 保留 MongoDB 系统库和项目业务库。
### 完成结果
- 已删除 Mongo `test` 库。
- 当前 Mongo 数据库列表为：
  - `admin`
  - `config`
  - `local`
  - `studymate_content`
### 验证结果
- `dropDatabase()` 返回成功。
- 重新读取数据库列表后，`test` 已不存在。
### 后续影响
- 当前 Mongo 环境更接近项目正式使用状态。
- `admin`、`config`、`local` 为系统库，后续无需处理。

## 2026-05-27 13:28:20 +08:00 | v0.0.31 | 初始化本机 Mongo 业务库 studymate_content
### 任务内容
- 将本机 MongoDB 中的 `studymate_content` 业务库按项目脚本初始化完成。
- 验证集合与关键索引是否真实落库，而不是仅脚本打印成功。
### 完成结果
- 执行 [backend/internal/migrations/mongo/001_init_content_collections.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.js) 成功。
- `studymate_content` 当前已创建集合：
  - `ai_conversations`
  - `ai_drafts`
  - `diagram_source_documents`
  - `graph_documents`
  - `graph_snapshots`
  - `material_text_documents`
  - `note_documents`
  - `note_snapshots`
  - `pdf_annotation_documents`
  - `user_workspace_states`
- 已确认关键索引存在：
  - `note_documents.uk_note_documents_note_id`
  - `note_documents.idx_note_documents_owner_updated_at`
  - `note_documents.idx_note_documents_material_updated_at`
  - `user_workspace_states.uk_user_workspace_states_user_workspace`
  - `user_workspace_states.idx_user_workspace_states_updated_at`
### 验证结果
- `studymate_content` 已出现在 Mongo 数据库列表中。
- 集合列表与索引查询均返回成功。
### 后续影响
- 后续可以开始把笔记正文、快照、图谱文档等内容逐步迁移到 MongoDB。

## 2026-05-27 13:22:40 +08:00 | v0.0.30 | 验证手动执行的 MySQL 迁移并补齐 Mongo 初始化脚本
### 任务内容
- 检查 `studymate` 中手动执行的 `001/002/003` MySQL 脚本是否成功落库。
- 确认当前后端可继续正常使用该数据库。
- 在下一步工作中补齐 MongoDB 内容库初始化与回滚脚本，并做实跑验证。
### 完成结果
- 已验证 `studymate` 中存在迁移记录：
  - `001_init_schema.sql`
  - `002_seed_baseline.sql`
  - `003_align_current_tables.sql`
- 已确认关键字段和索引存在，包括：
  - `users.status`
  - `file_records.storage_provider`
  - `posts.summary`
  - `comments.parent_comment_id`
  - `idx_notes_owner_updated_at`
  - `idx_posts_status_created_at`
  - `idx_comments_post_status_created_at`
  - `idx_pdf_annotations_user_material_updated_at`
- 已确认基础种子数据存在：
  - `roles = 3`
  - `permissions = 12`
  - `role_permissions = 25`
  - `system_configs = 5`
- 新增 Mongo 初始化脚本：
  - [backend/internal/migrations/mongo/001_init_content_collections.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.js)
  - [backend/internal/migrations/mongo/001_init_content_collections.down.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.down.js)
- 更新 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)、[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)、[docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)，补充 Mongo 迁移使用方式。
### 验证结果
- `go run ./cmd/migrate` 在主库 `studymate` 上执行成功。
- 后端使用 `studymate` 启动后，`http://localhost:8126/health` 返回成功，依赖状态正常。
- Mongo 临时库 `studymate_content_check` 已完成：
  - `001_init_content_collections.js` 执行成功
  - 集合与索引检查成功
  - `001_init_content_collections.down.js` 执行成功
  - 回滚后集合清空，临时库已删除
### 后续影响
- 当前 MySQL 手动迁移结果没有发现阻塞性问题，可以继续在这套库上开发。
- 项目已经具备 Mongo 内容库的初始化和回滚脚本，为后续把笔记/图谱内容逐步迁移到 Mongo 奠定了基础。

## 2026-05-27 13:10:20 +08:00 | v0.0.29 | 补齐 MySQL 迁移 down SQL 并验证回滚链路
### 任务内容
- 在现有 MySQL 迁移体系上补齐对应的 down SQL 文件。
- 避免 `.down.sql` 被后端自动迁移逻辑误执行。
- 验证 `up -> down` 回滚链路在临时数据库中可运行。
### 完成结果
- 更新 [backend/internal/migrations/mysql/migrator.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator.go)，自动迁移现在会忽略 `.down.sql` 文件。
- 更新 [backend/internal/migrations/mysql/migrator_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator_test.go)，新增忽略回滚文件测试。
- 新增回滚文件：
  - [001_init_schema.down.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/001_init_schema.down.sql)
  - [002_seed_baseline.down.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/002_seed_baseline.down.sql)
  - [003_align_current_tables.down.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/003_align_current_tables.down.sql)
- 更新 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)、[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)、[docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)，补充 up/down 说明。
- 将主库 `studymate` 迁移到 `003`，确认当前本地数据库已经与仓库迁移版本对齐。
### 验证结果
- `go test ./...` 通过。
- 在临时库 `studymate_rollback_check` 中执行完整验证：
  - `go run ./cmd/migrate` 成功应用 `001`、`002`、`003`
  - 手动执行 `003_align_current_tables.down.sql` 成功
  - 手动执行 `002_seed_baseline.down.sql` 成功
  - 手动执行 `001_init_schema.down.sql` 成功
  - 回滚后临时库表结构已清空
- 主库 `studymate` 已确认存在 `003` 迁移记录，且 `users.status`、`idx_notes_owner_updated_at` 等 `003` 对齐结果已生效。
### 后续影响
- 项目现在同时具备 up/down SQL 文件，可支持更规范的数据库变更交付。
- 后续新增迁移建议继续成对补齐 `004_xxx.sql` 和 `004_xxx.down.sql`。

## 2026-05-27 12:36:30 +08:00 | v0.0.28 | 新增 002 增量迁移并验证空库迁移兼容性
### 任务内容
- 在已接入的 MySQL 迁移体系上继续补充增量迁移。
- 为最终设计预留的 RBAC 和系统配置体系加入基础种子数据。
- 验证“空库只靠迁移脚本建起来后，后端可直接启动”。
### 完成结果
- 新增 [backend/internal/migrations/mysql/002_seed_baseline.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/002_seed_baseline.sql)。
- 该迁移脚本包含：
  - 3 个基础角色：`admin`、`moderator`、`user`
  - 12 个基础权限
  - 25 条角色权限映射
  - 5 条系统配置种子数据
- 更新 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)、[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)、[docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)，补充多文件迁移和种子数据说明。
- 新建临时空库 `studymate_migration_check` 做从零迁移验收，验证结束后已删除，保持本地环境整洁。
### 验证结果
- `go test ./...` 通过。
- 当前主库 `studymate` 执行 `go run ./cmd/migrate` 成功。
- 临时空库执行 `go run ./cmd/migrate` 成功。
- 已确认 `schema_migrations` 中存在版本 `001`、`002`。
- 已确认基础种子数据数量正确：
  - `roles = 3`
  - `permissions = 12`
  - `role_permissions = 25`
  - `system_configs = 5`
- 使用临时空库启动后端服务，健康检查返回成功。
### 后续影响
- 后续权限体系、管理后台治理能力和功能开关配置已经有统一数据落点。
- 后续新增表结构或种子数据时，可继续按 `003_xxx.sql`、`004_xxx.sql` 的方式增量扩展。

## 2026-05-27 12:26:40 +08:00 | v0.0.27 | 接入 MySQL 迁移执行器并替换后端 AutoMigrate
### 任务内容
- 把已完成的 MySQL 初始化 SQL 脚本接入后端运行链路。
- 让项目既支持服务启动自动迁移，也支持单独执行迁移命令。
- 移除与统一 SQL 迁移体系冲突的 GORM `AutoMigrate` 启动逻辑。
### 完成结果
- 新增 [backend/internal/migrations/mysql/migrator.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator.go)，实现：
  - 内嵌 `*.sql` 迁移文件。
  - 迁移文件按名称排序执行。
  - SQL 语句拆分、注释跳过、`USE` 语句忽略。
- 新增 [backend/internal/migrations/mysql/migrator_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator_test.go)，覆盖 SQL 语句拆分和内嵌迁移发现逻辑。
- 更新 [backend/internal/app/server.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/app/server.go)，服务启动改为执行 MySQL 迁移，不再调用 GORM `AutoMigrate`。
- 更新 [backend/internal/pkg/database/database.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/pkg/database/database.go)，导出主数据库连接方法供迁移命令复用。
- 新增 [backend/cmd/migrate/main.go](/E:/Code/1108026_rust_go/StudyMate/backend/cmd/migrate/main.go)，支持单独执行：
  - `cd backend`
  - `go run ./cmd/migrate`
- 更新 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md) 和 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)，补充迁移说明。
### 验证结果
- `go test ./...` 通过。
- `go run ./cmd/migrate` 执行成功。
- 使用临时端口 `8123` 启动后端，健康检查返回成功，依赖状态为 `sql=up`、`redis=up`、`mongo=up`、`mode=mysql`。
### 后续影响
- 后端数据库初始化已经统一切换到 SQL 迁移体系。
- 后续表结构升级建议新增 `002_xxx.sql`、`003_xxx.sql` 等增量脚本，不再依赖 GORM 自动建表。

## 2026-05-27 00:29:30 +08:00 | v0.0.26 | 生成并验证 MySQL 初始幂等 SQL 脚本
### 任务内容
- 根据最终导向数据库设计，输出可直接执行的 MySQL 初始化 SQL 文件。
- 兼顾当前已开发模块与后续图谱、卡片、AI、工程图等扩展模块。
- 在本机已创建的 `studymate` 数据库上实际执行，验证脚本完整性与幂等性。
### 完成结果
- 新增 [backend/internal/migrations/mysql/001_init_schema.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/001_init_schema.sql)。
- 脚本包含：
  - `schema_migrations` 迁移记录表。
  - 当前已实现模块对应表：用户、认证、文件、资料、社区、阅读、笔记、审计。
  - 最终设计预留扩展表：团队、话题、举报、合集、图谱、工程图、卡片、AI、课程、搜索、运营配置等。
  - 统一字符集 `utf8mb4`、毫秒级时间字段、唯一约束、组合索引、必要检查约束。
- 更新 [docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)，补充 SQL 落地文件入口和脚本定位说明。
### 验证结果
- 已检查 SQL 文件完整性，文件共 `978` 行，尾部迁移记录插入语句闭合正常。
- 使用本机 MySQL 8.0 对 `studymate` 执行脚本两次，均成功，无重复建表错误。
- 执行后数据库表数量为 `65` 张。
- 已确认关键扩展表创建成功：`graphs`、`cards`、`ai_tasks`、`diagram_sources`、`document_chunks`。
- 已确认 `schema_migrations` 中仅存在版本 `001` 记录。
### 后续影响
- 当前初始化脚本已可作为项目 MySQL 的统一起点。
- 后续若出现结构差异调整，应追加 `002_xxx.sql` 之类增量迁移，而不是直接覆写初始化脚本承担所有升级逻辑。

## 2026-05-27 00:00:39 +08:00 | v0.0.25 | 设计 MySQL 与 MongoDB 数据库结构
### 任务内容
- 根据《学伴项目：对标 Project Graph 的升级设计》整理最终导向的数据库结构。
- 结合当前已实现的用户、资料、社区、阅读、笔记模块，设计可逐步落地的 MySQL 与 MongoDB 分工。
- 将数据库设计放入可提交的项目架构文档目录。
### 完成结果
- 新增 [docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)。
- 文档覆盖：
  - MySQL 与 MongoDB 的职责边界。
  - 当前阶段 MySQL 表结构。
  - 最终目标扩展表结构。
  - MongoDB 内容集合结构。
  - 笔记、图谱、PDF 批注、AI 草稿的跨库写入流程。
  - 分阶段落地路线。
- 更新 [docs/architecture/ARCHITECTURE.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/ARCHITECTURE.md)，增加数据库设计文档入口。
### 验证结果
- 已确认新文档位于 `docs/architecture/`，不受 `docs/planning/` 和 `docs/design/` 忽略规则影响。
- 本次仅新增架构文档，未改动业务代码，未运行编译测试。
### 后续影响
- 后续实现 MongoDB 接入、图谱模块、卡片模块、AI 模块时，可按该文档逐步扩展。
- 下一步建议优先实现 `note_documents` 与 `note_snapshots`，让笔记内容从 HTML 过渡到块文档。

## 2026-05-26 23:52:45 +08:00 | v0.0.24 | 提交当前可交付改动并整理忽略规则
### 任务内容
- 按要求提交当前未提交的可交付内容。
- 日志记录和开发计划相关文档不进入提交，并加入忽略名单。
- `.docx` 文件只允许项目文档目录下的文件进入版本库。
### 完成结果
- 新增并提交忽略规则：
  - 忽略 `PROJECT_LOG.md`、`docs/planning/`、`docs/design/`。
  - 忽略本地缓存、构建产物、`tsbuildinfo`、运行期数据库文件和本地视觉产物。
  - 默认忽略 `.docx`，但允许 `docs/**/*.docx` 作为项目文档提交。
- 从版本索引移除已追踪的本地缓存、构建信息和运行期数据库文件。
- 保留本地 `PROJECT_LOG.md`，但未将日志内容纳入提交。
- 创建提交 `060c109 feat: 实现阅读笔记闭环并统一 MySQL 配置`。
### 验证结果
- `go test ./...` 通过。
- `npm run typecheck` 通过。
- `npm run build:user` 通过。
- `npm run build:admin` 通过。
- 提交前检查确认 `PROJECT_LOG.md`、`docs/planning/`、`docs/design/`、`.env` 和 `.docx` 未进入提交内容。
### 后续影响
- 后续提交默认不会再混入日志、计划草稿、本地缓存和运行期文件。
- 当前工作区除忽略项外已经干净。

## 2026-05-26 23:41:56 +08:00 | v0.0.23 | 完全移除旧本地单文件数据库方案，数据库层统一为 MySQL
### 任务内容
- 按设计说明执行数据库方案，不再保留旧本地单文件数据库配置、驱动分支或依赖。
- 后端统一使用 MySQL，账号 `root`，密码 `123456`，数据库 `studymate`。
- 同步环境文件、开发说明、README 和项目记录。
### 完成结果
- 更新 [backend/internal/config/config.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/config/config.go)，移除旧路径配置，仅保留 MySQL 数据源配置。
- 更新 [backend/internal/pkg/database/database.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/pkg/database/database.go)，删除旧驱动导入和连接分支，后端只接受 `DB_DRIVER=mysql`。
- 更新 [.env](/E:/Code/1108026_rust_go/StudyMate/.env) 和 [.env.example](/E:/Code/1108026_rust_go/StudyMate/.env.example)，删除旧路径变量，默认 `MYSQL_DSN` 指向本地 MySQL。
- 更新 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md) 和 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)，移除旧数据库回退说明。
- 执行 `go mod tidy`，清理旧本地单文件数据库相关依赖。
- 停止仍占用旧数据库文件的历史后端进程，删除 [storage/studymate.db](/E:/Code/1108026_rust_go/StudyMate/storage/studymate.db)。
- 使用 MySQL 配置重新启动 `8023` 后端服务。
### 验证结果
- 全局检索旧数据库关键字无匹配结果。
- `go test ./...` 通过。
- 访问 `http://localhost:8023/health` 成功，返回 `deps.mode = mysql`。
### 后续影响
- 项目数据库层现在完全按设计说明走 MySQL。
- 后续本地启动前需要确保 MySQL 服务可用，并已创建 `studymate` 数据库。
- 既有旧本地数据库文件已删除；如果未来需要历史数据，应从外部备份另做一次性导入脚本。

## 2026-05-27 00:18:42 +08:00 | v0.0.22 | 修复关键文档并统一管理端主题
### 任务内容
- 检查当前前端主题是否真正统一，并定位未完成统一渲染的后台部分。
- 修复 README、开发文档、前端设计方案和项目日志中的真实乱码与损坏内容。
- 继续收敛管理端，使其回到与用户端一致的设计语言。
### 完成结果
- 重建 `README.md`，恢复项目概述、技术栈、当前阶段和文档入口。
- 重建 `docs/DEVELOPMENT.md`，恢复环境说明、启动方式、端口说明和 Go 代理排查。
- 重建 `docs/design/FRONTEND_REBUILD_PLAN.md`，恢复前端目标、设计原则、结构规划和实施顺序。
- 重写 `PROJECT_LOG.md`，清理历史乱码，并按版本重新整理项目推进记录。
- 收敛管理端主题，使其与用户端继续围绕同一套暖灰背景、松柏绿主色、琥珀强调色和圆角卡片体系展开。
- 修正前后台 HTML 标题为正常中文。
### 验证结果
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- 当前关键文档已经恢复为可读中文，不再影响后续开发和交接。
- 管理端和用户端的主题一致性明显提高，后续可以继续基于统一设计系统做模块深化。

## 2026-05-26 23:13:49 +08:00 | v0.0.21 | 重构前端主应用并修正前端可见乱码
### 任务内容
- 继续按新的前端重构方案推进阶段 B，优先把资料库、阅读器、笔记页重新接回统一工作区壳层。
- 修正当前前端可见的乱码问题，包括源码中文文案损坏和接口返回历史脏数据中的一串问号显示。
### 完成结果
- 重写用户端主应用壳层和路由。
- 资料库接回搜索、附件上传、资料创建、编辑、收藏、评分和阅读入口。
- 阅读器接回真实阅读状态、页码进度、书签和批注。
- 笔记页接回富文本编辑、关联资料、版本历史、恢复版本和删除动作。
- 重写富文本编辑器与 PDF 阅读器组件。
- 重写管理端壳层，保留管理员登录和审核链路。
- 对接口历史脏数据中的 `????` 做前端展示兜底。
### 验证结果
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- 前端主界面从“壳层占位”推进到“壳层 + 真实资料/阅读/笔记链路并存”的阶段。

## 2026-05-26 21:02:26 +08:00 | v0.0.20 | 创建前台测试账号 use123
### 任务内容
- 为前台用户端创建一个可直接登录的普通用户账号。
### 完成结果
- 通过 `POST /api/v1/auth/register` 成功创建本地测试账号：
  - 用户名：`use123`
  - 密码：`123123123`
  - 邮箱：`11111@qq.com`
  - 显示名：`use123`
- 通过登录接口验证该账号可用。
### 验证结果
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
### 后续影响
- 该账号可直接用于本地前台联调和体验验证。

## 2026-05-26 20:25:26 +08:00 | v0.0.19 | 启动前端阶段 A，重做用户端与管理端全局壳层
### 任务内容
- 开始按照前端重建设计方案实际重做前端。
- 用高质量占位承接未实现模块。
### 完成结果
- 重写用户端壳层：顶部搜索、左侧导航、中部工作区、右侧上下文面板。
- 重写管理端壳层：概览、审核、资料、社区、用户、图谱模板、AI、系统配置、审计日志。
- 生成新壳层页面快照用于对照。
### 验证结果
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- 前端从“说明页 + 临时表单页”进入统一工作区壳层阶段。

## 2026-05-26 19:53:45 +08:00 | v0.0.18 | 补充前端对标产品参考与统一风格约束
### 任务内容
- 将“参考头部产品信息架构，但保持 StudyMate 自己的统一风格”写入设计方案。
### 完成结果
- 更新 `docs/design/FRONTEND_REBUILD_PLAN.md`。
- 增加对标原则、模块对标矩阵、统一主题要求和落地规则。
### 验证结果
- 文档检查完成。
### 后续影响
- 后续前端实现将以“模块借鉴 + 全局统一”的方式推进。

## 2026-05-26 19:41:48 +08:00 | v0.0.17 | 浏览当前前端并输出整体重建设计方案
### 任务内容
- 浏览用户端和管理端当前页面。
- 根据最终项目目标重新规划整个前端结构与实施顺序。
### 完成结果
- 生成 `docs/design/FRONTEND_REBUILD_PLAN.md`。
- 确认当前前端需要整体重做，而不是继续补丁式迭代。
### 验证结果
- 本地用户端与管理端页面快照已生成。
### 后续影响
- 为后续前端重构提供统一路线图。

## 2026-05-26 19:07:33 +08:00 | v0.0.16 | 继续加厚 v0.4.0，补齐阅读批注回跳和笔记摘录衔接
### 任务内容
- 加厚阅读与笔记之间的前台体验。
### 完成结果
- 批注支持回跳到对应 PDF 页。
- 笔记页新增资料引用卡片。
- 新增阅读摘录池，可将批注内容插入富文本正文。
### 验证结果
- `npm run typecheck`
- `npm run build:user`
### 后续影响
- 阅读到笔记的链路更完整、更顺手。

## 2026-05-26 18:50:09 +08:00 | v0.0.15 | 加厚 v0.4.0 富文本编辑与 PDF 交互，并优化后台构建体积
### 任务内容
- 引入更像样的富文本编辑器和 PDF 阅读交互。
- 处理管理端构建包体偏大的警告。
### 完成结果
- 接入 Tiptap 富文本编辑器。
- 接入 react-pdf 阅读器，支持翻页、缩放、跳页和选中文本摘录。
- 用户端做分包优化。
- 管理端移除运行时 Element Plus 依赖，降低主包体积。
### 验证结果
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- 阅读与笔记体验从“能用”推进到更像真实产品。

## 2026-05-26 13:48:29 +08:00 | v0.0.14 | 实现 v0.4.0 阅读笔记版第一条业务闭环
### 任务内容
- 打通资料阅读、阅读进度、批注与资料关联笔记的第一条主链路。
### 完成结果
- 后端新增 `note` 和 `reader` 相关能力。
- 前台用户端接回阅读页与笔记页。
- 支持阅读进度、书签、批注、笔记版本历史和版本恢复。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- `v0.4.0` 开始具备真实可用的阅读沉淀路径。

## 2026-05-26 13:29:58 +08:00 | v0.0.13 | 管理端端口调整到 8002
### 任务内容
- 将后台管理端默认端口从旧值调整到 `8002`。
### 完成结果
- 管理端默认端口改为 `8002`，并补齐文档说明。
### 验证结果
- `npm run typecheck`
### 后续影响
- 当前本地默认端口为：用户端 `8001`、管理端 `8002`、后端 `8023`。

## 2026-05-26 13:18:47 +08:00 | v0.0.12 | 调整用户端与后端默认端口
### 任务内容
- 将用户端改为 `8001`，后端改为 `8023`。
### 完成结果
- 用户端启动端口调整为 `8001`。
- 后端默认启动端口调整为 `8023`。
- 同步更新代理、CORS 和开发说明。
### 验证结果
- `go test ./...`
- `npm run typecheck`
### 后续影响
- 前后端本地联调端口统一稳定下来。

## 2026-05-26 12:55:21 +08:00 | v0.0.11 | 修复 Go 模块代理报错
### 任务内容
- 处理 GoLand 和命令行中 `goproxy.io` 导致的依赖拉取失败问题。
### 完成结果
- 确认根因是 `GOPROXY=https://goproxy.io` 回源失败。
- 验证 `https://goproxy.cn,direct` 与 `https://proxy.golang.org,direct` 可用。
- 更新用户级 `GOPROXY` 并补充文档说明。
### 验证结果
- `go list -m -json all`
### 后续影响
- 后续 Go 依赖拉取和 IDE 索引恢复正常。

## 2026-05-26 11:36:40 +08:00 | v0.0.10 | 实现 v0.3.0 社区资料版第一条闭环
### 任务内容
- 打通资料库、社区发帖和后台审核的第一条主链路。
### 完成结果
- 社区支持发帖、详情、一级评论、点赞、收藏。
- 资料库支持资料创建、详情、收藏、评分。
- 后台支持待审核帖子和资料的通过、驳回、下架。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- 项目从“基础平台”推进到“内容平台”。

## 2026-05-26 09:18:12 +08:00 | v0.0.9 | 按版本规划继续推进平台基础能力
### 任务内容
- 按 `v0.2.0` 规划实现账号、文件、资料与后台基础能力。
### 完成结果
- 完成用户注册、登录、刷新、退出、个人资料读取与更新。
- 完成文件上传。
- 完成管理员登录与管理员资料读取。
- 默认本地开发数据库能力已在后续版本统一收敛为 MySQL。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- 平台基础层完成，后续可继续接资料库与社区闭环。

## 2026-05-26 00:58:30 +08:00 | v0.0.8 | 生成未来版本规划文档
### 任务内容
- 根据最终项目目标规划未来开发阶段，并为各阶段生成版本说明。
### 完成结果
- 生成 `docs/planning/VERSION_PLAN.md`。
- 生成 `v0.1.0` 到 `v1.0.0` 的阶段版本说明文档。
### 验证结果
- 文档检查完成。
### 后续影响
- 后续开发和拆任务有了稳定版本主线。

## 2026-05-26 00:53:17 +08:00 | v0.0.7 | 验证项目主语言切换到中文
### 任务内容
- 确认项目文档、标题和说明默认使用中文。
### 完成结果
- 验证 README、开发说明、规划文档和前后台标题已切到中文主语言。
### 验证结果
- `npm run typecheck`
- `go test ./...`
### 后续影响
- 项目后续文档、日志和 UI 文案默认用汉语。

## 2026-05-26 00:51:42 +08:00 | v0.0.6 | 确立项目主要语言为汉语
### 任务内容
- 将项目主语言正式确立为汉语。
### 完成结果
- 文档、日志、说明和前后台标题默认改为中文。
- 保留代码标识符、包名、命令、API 路径等工程约定的英文写法。
### 验证结果
- 文档检查完成。
### 后续影响
- 后续所有说明类内容统一改用中文。

## 2026-05-26 00:46:30 +08:00 | v0.0.5 | 启动本地开发服务并补充开发说明
### 任务内容
- 启动本地开发服务并完成最小开发说明。
### 完成结果
- 启动后端与前后台本地开发服务。
- 记录端口占用情况并调整临时端口。
- 补充 `docs/DEVELOPMENT.md`。
### 验证结果
- 后端 `/health`
- 用户端 HTTP 200
- 管理端 HTTP 200
### 后续影响
- 本地开发链路完整跑通。

## 2026-05-26 00:43:41 +08:00 | v0.0.4 | 验证基础工程可编译可运行
### 任务内容
- 验证 Go 与前端基础工程可编译。
### 完成结果
- 完成 `go mod tidy`。
- 完成前后台依赖安装。
- 完成前后台类型检查和构建验证。
### 验证结果
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 后续影响
- Phase 0 的基础工程底座已经可运行。

## 2026-05-26 00:34:12 +08:00 | v0.0.3 | 补齐配置、入口、共享包和项目文档
### 任务内容
- 为 monorepo 补齐基础配置、应用入口、共享包和项目文档。
### 完成结果
- 完善 `.gitignore`、`.env.example`、`package.json`、`README.md`。
- 初始化 Go 模块和后端健康检查入口。
- 初始化 React/Vite 用户端和 Vue/Vite 管理端骨架。
- 初始化共享包占位与 `docs` 目录。
### 验证结果
- 代码结构检查完成。
### 后续影响
- 项目具备继续扩展后端 API 和双前端 UI 的基础。

## 2026-05-26 00:31:33 +08:00 | v0.0.2 | 初始化 monorepo 工程骨架
### 任务内容
- 根据规划初始化 StudyMate monorepo 目录结构。
### 完成结果
- 创建 `backend`、`frontend-user`、`frontend-admin`、`packages`、`docs`、`storage` 等目录。
- 预留模块分层与共享包结构。
### 验证结果
- 目录检查完成。
### 后续影响
- 项目进入 Phase 0 工程初始化阶段。

## 2026-05-26 00:30:33 +08:00 | v0.0.1 | 创建全局项目记录文件
### 任务内容
- 根据需求创建全局 log 文件，并约定按版本和时间倒序写入。
### 完成结果
- 新建 `PROJECT_LOG.md`。
- 确立项目记录格式。
### 验证结果
- 文件创建完成。
### 后续影响
- 后续每一步重要工作都可以追溯到对应版本记录。

## 2026-06-01 22:50:00 +08:00 | v0.0.76 | 收口 Review/AI、Search/Admin/Share

### 任务内容
- 按 D 阶段要求补齐复习调度边界、后端搜索、分享链接和后台治理模块。
- 保持 SM-2 作为 v1 默认调度算法，但让调度器具备可替换接口。
- 将搜索和后台占位页接到真实 API，避免 v1 发布时仍依赖浏览器端全量过滤或静态占位。

### 完成结果
- `backend/internal/modules/card/service` 新增 `Scheduler` 接口与 `SM2Scheduler` 默认实现，`ReviewCard` 通过接口计算下一次到期时间。
- 新增 `backend/internal/modules/search`，注册 `GET /api/v1/search?q=&types=&limit=`，支持公开资料/社区与登录后的私有 note/graph/card 分组结果。
- 新增 `backend/internal/modules/share` 与 `004_share_links.sql`，支持 share link 创建、列表、撤销和公开 token 只读解析；用户端新增 `/share/:token` 页面。
- 后台新增 `/api/v1/admin/users`、`/reports`、`/tags`、`/ai/tasks`、`/ai/usage`、`/audit-logs`、`/files`，管理端按模块读取真实治理数据。
- 用户端搜索页改为消费后端 grouped payload；API barrel 增加 search/share 域模块。

### 验证结果
- `cd backend; go test ./...` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `npm --workspace frontend-admin run typecheck` 通过。
- `npm run ci` 通过：覆盖 lint/docs/typecheck、用户端和后台构建、前后台 Vitest、graph-core 测试、Playwright E2E、后端 `go test ./...` 和最终文档同步。

### 后续影响
- E 阶段可以在已有搜索、分享和后台治理接口上补发布清单、回滚步骤、覆盖率汇总、secret scan 和本地 `v1.0.0` 标签。

## 2026-06-01 23:20:00 +08:00 | v1.0.0-rc | 发布与回滚收口

### 任务内容
- 按 E 阶段要求补齐 release checklist、env var matrix、migration order、demo data steps、rollback steps 和 known non-blockers。
- 将 `CHANGELOG.md` 标记为 `v1.0.0 - 2026-06-01`。
- 准备最终验证：完整 CI、覆盖率汇总、secret scan、diff review、release smoke flow 和本地 tag。

### 完成结果
- `docs/planning/versions/v1.0.0-release.md` 已成为 v1 发布/回滚主文档。
- README、开发说明、版本计划、路线图、变更记录和项目日志已同步发布门禁。

### 验证结果
- `npm run ci` 通过：lint/docs/typecheck、前后台构建、前后台 Vitest、graph-core 测试、Playwright public shell、后端 `go test ./...` 和最终文档同步均通过。
- `npm run test:coverage` 通过：frontend-user statements 52.3%，frontend-admin statements 30.13%，graph-core line 97.55%，backend `go test ./... -cover` 完成。前后台总体覆盖率尚未达到 80%，作为 v1 已知覆盖率缺口记录，后续以重点变更包逐步补齐。
- Secret scan 完成：命中项为发布文档中的扫描示例/env 名称、测试用 `"secret"` 字符串、token 变量名和 CSS 类名，没有发现真实生产密钥。
- `git diff --check` 通过；release smoke flow 由本轮 CI 中的构建、Playwright public shell 和后端测试覆盖。

### 后续影响
- 本阶段完成后 `master` 可进入本地 `v1.0.0` 标签；除非用户明确批准，不推送 commit 或 tag 到远端。

## 2026-06-05 20:05:00 +08:00 | v1.1-graph-productization | 图谱工作区产品化补强

### 任务内容
- 根据 Project Graph 对标计划继续推进 StudyMate 图谱工作区，不重写现有强 MVP。
- 优先补齐扩展节点 metadata 编辑、可解释 history label、JSON 导入来源校验、后端 error 级结构护栏和 200 节点 smoke 保存路径。

### 完成结果
- 用户端图谱扩展节点已支持 URL、图片、公式和 PDF 锚点的结构化 `metadata.content` 编辑，同时保留通用标题、描述、来源、颜色、强调和尺寸编辑。
- 用户端 history 状态新增 `lastLabel` 和带 label 的 past/future 记录，导入、撤销、重做和保存状态具备可解释历史语义。
- 用户端 `.smtg` JSON 导入会校验 schemaVersion、重复 ID、非法尺寸、悬挂边和无效来源 target；无效来源 target 根据当前图谱已有来源及已加载资料/笔记判断。
- 后端 `BatchSave` 和导入/AI 草稿落库前会拒绝 error 级图谱结构问题，warning/info 级治理提示仍允许保存。
- 图谱 controller 继续拆出 autosave/beforeunload、右键菜单关闭和 stage 测量生命周期 hook，降低大型 controller 的职责密度。
- `e2e/v1-graph-workspace.spec.ts` 的 200 节点 smoke 增加手动保存并断言保存状态。
- 继续把图谱工作区 header、来源 rail 和 toolbar 拆到 `GraphWorkspaceShell` 纯视图组件，toolbar 不再通过派发键盘事件触发撤销/重做，而是复用命名 controller 动作。
- 新增 `GraphWorkspaceShell.test.tsx`，覆盖保存状态 aria-label、toolbar aria-label、节点类型切换和搜索定位触发。

### 验证结果
- `npm --workspace frontend-user run test -- GraphWorkspacePage graphHistory graphNodeMetadata graphFileImportExport` 通过。
- `npm --workspace frontend-user run test -- GraphWorkspaceShell GraphWorkspacePage` 通过。
- `npm --workspace frontend-user run typecheck` 通过。
- `cd backend && go test ./internal/modules/graph/...` 通过。

### 后续影响
- 后续最值得继续推进的是把图谱数据加载、画布交互和 JSX view 完整拆成容器 hook + 纯 view；补齐 PNG/SVG/JSON 大图导出失败路径；再做事件节流和边路径缓存等有证据的性能优化。

### 执行记录：FE-02 图谱 CanvasLayout

- 执行日期：2026-07-02
- 代码基线：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 实际变更：
  - 新增 `GraphWorkspaceCanvasChrome.tsx` 与 `GraphWorkspaceOverviewPanel.tsx`。
  - 新增 `graph-canvas.css`，实现宽屏三列、中小屏覆盖式 Dock、手机近似全屏抽屉。
  - 资源区改为图谱 / 来源 / 模板 Tab；检查器改为概览 / 属性 / 来源 / 历史 / 导入 / 冲突 Tab。
  - 删除画布顶部产品说明，保留图谱标题、保存状态和高频操作。
  - 既有 GraphDocument、保存、版本、快照、导入导出、来源 relation、409 冲突语义保持不变。
- 已执行验证：
  - 改动 TS / TSX 的 TypeScript transpile 语法检查。
  - 完整 npm 依赖安装无法在当前环境离线完成：缺少 `zustand@5.0.13` 缓存，完整 typecheck / Vitest / build / Playwright 待本机或 CI 复核。
- 下一建议任务：
  - FE-03：阅读、笔记与复习工作区体验对齐；或在新 Inspector 中继续 WB-032 的节点级人工冲突合并。

## UI-04 产品级 UI 收口

- 根据实际运行截图完成图谱和管理端布局审计。
- 图谱调整为画布优先：初始不展开资源/检查器，选中节点和冲突发生时按需打开。
- 用户端 Standard / Studio / Canvas / Focus 统一为同一视觉系统，并清理开发期占位文案。
- 管理端升级为治理工作台：可扫描表格、搜索、审核行操作与记录 Inspector。

### 执行记录：UI-04 全站产品界面重构

- 执行日期：2026-07-03
- 代码基线：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 触发原因：根据实际运行截图复核，图谱页面默认资源栏与检查器同时展开，画布空间不足；管理端用户治理按记录纵向堆叠，信息密度与可扫描性不足。
- 本轮范围：
  - 用户端全路由统一为任务优先的 Standard / Studio / Canvas / Focus 布局体系；
  - 图谱改为默认全画布，资源 Drawer 与 Inspector 按需打开，节点选中或版本冲突时自动定位相应 Inspector；
  - 工作台、资料库、社区、搜索、AI、设置、登录、分享、阅读、笔记、复习重新收口内容密度、操作层级与响应式布局；
  - 管理端重构为运营治理工作台，提供概览指标、审核表格、治理记录表格、搜索与详情 Inspector。
- 保护边界：不改变 API、权限、GraphDocument、图谱版本、快照、来源关联、导入导出和 `409 graph_version_conflict` 契约。
- 验证结果：
  - 前台全量 TS/TSX 与后台 Vue script 通过 TypeScript transpile 语法检查；
  - 文档同步与前端文件格式检查通过；
  - `npm ci` 在交付环境未完成依赖树最终链接，导致完整 tsc/Vitest/Vite/Playwright 留待本机或 CI 执行。

### 执行记录：UI-04 全站产品界面重构

- 执行日期：2026-07-03
- 代码基线：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 触发原因：根据实际运行截图复核，图谱页面默认资源栏与检查器同时展开，画布空间不足；管理端用户治理按记录纵向堆叠，信息密度与可扫描性不足。
- 本轮范围：
  - 用户端全路由统一为任务优先的 Standard / Studio / Canvas / Focus 布局体系；
  - 图谱改为默认全画布，资源 Drawer 与 Inspector 按需打开，节点选中或版本冲突时自动定位相应 Inspector；
  - 工作台、资料库、社区、搜索、AI、设置、登录、分享、阅读、笔记、复习重新收口内容密度、操作层级与响应式布局；
  - 管理端重构为运营治理工作台，提供概览指标、审核表格、治理记录表格、搜索与详情 Inspector。
- 保护边界：不改变 API、权限、GraphDocument、图谱版本、快照、来源关联、导入导出和 `409 graph_version_conflict` 契约。
- 验证结果：
  - 前台全量 TS/TSX 与后台 Vue script 通过 TypeScript transpile 语法检查；
  - 文档同步与前端文件格式检查通过；
  - `npm ci` 在交付环境未完成依赖树最终链接，导致完整 tsc/Vitest/Vite/Playwright 留待本机或 CI 执行。
## 2026-07-09 06:02:00 +08:00 | v1.1.0-alpha.121 | 收口 DEV-010 工程可复现性基线与审计入口
### 任务内容

- 按“先把全局骨架补齐”的节奏，继续从 `CODEX_BACKLOG.md` 选择覆盖面更广、但不深挖单一产品功能的 `DEV-010`，优先收口工程可复现性而不是再扩新业务模块。
- 本轮目标是把工具链版本约束、bootstrap 入口、依赖审计入口和 `@studymate/graph-core` 的 TypeScript 测试运行方式真正沉到仓库根约束里，而不是继续只停留在文档描述层。
### 实际变更

- 新增 `scripts/workspace-repro.test.mjs`，先用 RED 方式锁定四类缺口：根 `package.json` 缺少 `packageManager` / `engines` / `bootstrap` / `verify:runtimes` / `verify:deps`、`ci` 未前置运行时校验、`backend/go.mod` 与文档未收口、以及 `@studymate/graph-core` 仍隐式依赖 `node --test` 直接跑 `.ts`。
- 新增 `scripts/verify-runtime-baseline.mjs`，统一校验根 workspace manifest、`backend/go.mod`、开发文档、当前 Node/npm/Go 版本与 `graph-core` 测试命令，作为 `npm run verify:runtimes` 的实现。
- 新增 `scripts/run-dependency-audits.mjs`，把 `npm audit --registry=https://registry.npmjs.org/ --audit-level=high` 与 `go run golang.org/x/vuln/cmd/govulncheck@latest ./...` 收口成单一 `npm run verify:deps` 入口，绕开 `npmmirror` 缺失 audit API 的老问题。
- 更新根 `package.json`：新增 `packageManager: npm@11.6.2`、`engines.node >=24 <25`、`engines.npm >=11 <12`，补上 `bootstrap`、`verify:runtimes`、`verify:deps`，并让 `ci` 在全链路前先跑运行时基线校验。
- 更新 `packages/graph-core/package.json`，将测试命令改为显式 `node --experimental-strip-types --test test/*.test.ts` 与覆盖率命令 `node --experimental-strip-types --experimental-test-coverage --test test/*.test.ts`，避免不同 Node 版本对 `.ts` 测试执行能力的隐式差异。
- 更新 `docs/DEVELOPMENT.md`、`README.md` 与 `.github/workflows/ci.yml`，把 bootstrap / runtime baseline / dependency audit 入口同步进开发文档、命令清单和 CI 流程。
### 验证结果

- RED：`node --test scripts/workspace-repro.test.mjs`
- GREEN：`node --test scripts/workspace-repro.test.mjs`
- `npm run verify:runtimes`
- `npm --workspace @studymate/graph-core run test`
- `npm --workspace @studymate/graph-core run test:coverage`
- `npm run bootstrap`
- `npm run verify:docs`
- `npm run verify:deps`
### 后续影响

- 当前仓库已经有明确、可执行、可复核的运行时基线，不再依赖“README 里写了 Node 24 / Go 1.26”这种纯文档约束；后续新机器接手时可以先跑 `npm run bootstrap` 和 `npm run verify:runtimes`，而不是靠人工比对环境。
- `npm run verify:deps` 现在已经能稳定给出真实审计结果，但它也暴露了下一批需要处理的安全债：npm 侧 `esbuild`、`glob`、`undici`、`vite` 高危告警，以及 Go 侧 `govulncheck` 命中的标准库、`golang.org/x/net` 和 `quic-go` 漏洞；这更适合作为后续单独的安全收口工作包，而不是继续混在工具链入口收口里。
## 2026-07-09 06:55:00 +08:00 | v1.1.0-alpha.123 | 收口 SEC-011 默认 secret scan 门禁
### 任务内容

- 在 `SEC-010` 已把依赖安全基线纳入默认 CI 之后，继续选择一个覆盖面广、但不深入单个产品模块的 P0 收口点，把 release checklist 里口头约定的 secret scan 变成仓库内可执行、可回归的默认门禁。
- 本轮目标不是扩展业务能力，而是补齐默认 `verify:secrets` 脚本、误报可控的扫描规则、CI 接线，以及与之配套的工程文档同步。

### 实际变更

- 新增 `scripts/secret-scan-baseline.test.mjs`，先以 RED 锁定四类缺口：仓库缺少 `verify:secrets` 命令、`ci` 未显式执行 secret scan、GitHub Actions 没有 secret scan 步骤，以及 README / 开发说明 / release checklist 仍把 secret scan 记成手工动作。
- 新增 `scripts/verify-secret-scan.mjs`，把仓库级 secret scan 收口为单一入口；当前会扫描文本文件并识别私钥块、常见 Token 格式、DSN 内联凭据，以及 `apiKey` / `secret` / `token` / `password` 一类硬编码赋值，同时跳过 `node_modules`、`dist`、`coverage`、锁文件和常见二进制资源。
- 扫描器为 `.env.example`、开发文档和 release checklist 里的 placeholder 示例值建立了内置忽略规则，并支持通过 `secret-scan: allow` 对个别测试样例做最小范围豁免，避免把 `change-me-in-local-env`、`<secret-manager-value>`、`<local-password>` 等演示值误判成真实泄漏。
- 更新根 `package.json`、`.github/workflows/ci.yml`、`README.md`、`docs/DEVELOPMENT.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`docs/planning/versions/v1.0.0-release.md`、`docs/engineering/CODEX_PROJECT_CONTEXT.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，统一把 release 说明中的 secret scan 收口为 `npm run verify:secrets`，并清理“CI 仍缺依赖审计”这类过期表述。

### 验证结果

- RED：`node --test scripts/secret-scan-baseline.test.mjs`
- GREEN：`node --test scripts/secret-scan-baseline.test.mjs`
- `npm run verify:secrets`
- `npm run verify:docs`

### 后续影响

- 默认 CI 现在不再只在 release checklist 里“提醒要做 secret scan”，而是会直接执行 `npm run verify:secrets`；后续若有人把私钥、已知 Token 格式或明显的硬编码密钥赋值提交进仓库，会先在本地和 CI 被拦下。
- 当前剩余的工程级 P0 质量门禁主要收敛为覆盖率硬门槛与覆盖率汇总治理；secret scan 这条线已经从“手工约定”转成“默认可执行基线”。
