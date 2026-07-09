# StudyMate Codex 可执行任务队列

**状态约定：** `TODO` / `IN_PROGRESS` / `BLOCKED` / `DONE` / `VERIFY`

## P0：当前优先级

| ID | 状态 | 任务 | 依赖 | 主要影响范围 | 验收标准 |
|---|---|---|---|---|---|
| WB-001 | DONE | 项目基线核验与环境收口规划（已核验） | 无 | `docs/engineering/`、`.env.example`、根脚本、CI、config | 输出真实构建/测试矩阵、配置风险、文档漂移；不改业务行为。 |
| WB-002 | DONE | 环境变量与安全默认值收口 | WB-001 | `backend/internal/config`、部署文档、`.env.example` | 无危险默认 JWT/DSN；开发/测试/生产配置可区分；启动失败信息明确。 |
| WB-003 | DONE | 在现有 CI 基础上补强最小质量门禁 | WB-001 | `.github/workflows/*`、`package.json`、后端格式化与文档脚本 | 基于现有 workflow 增加 gofmt、失败定位和最小质量门禁，不破坏当前流水线。 |
| WB-004 | DONE | 版本与里程碑文档对齐 | WB-001 | README、CHANGELOG、PROJECT_LOG、路线与执行文档 | 文档体现当前“图谱产品化持续收口”的实际状态和下一步优先级。 |
| WB-010 | DONE | 核验并固定统一搜索契约 | WB-001 | `backend/internal/modules/search`、`frontend-user/src/api`、搜索文档 | 以现有 search module 为基线，固定 SearchResult、过滤参数、分页与来源字段。 |
| WB-011 | DONE | 聚合搜索结果质量补强 | WB-010 | `backend/internal/modules/search/service`、搜索文档 | 资料、笔记、图谱、帖子四类结果稳定可用，排序与摘要规则清晰。 |
| WB-012 | DONE | 搜索权限/可见性过滤与测试 | WB-011 | `backend/internal/modules/search/service`、搜索文档 | 不泄露私有笔记、私有图谱、未发布内容；覆盖核心权限情形。 |
| WB-013 | DONE | 用户端搜索页体验与回归补强 | WB-011 | `frontend-user` 搜索页与 API 调用点 | 关键词、类型筛选、分页、空态、错误态、来源跳转均可验证。 |
| WB-014 | DONE | 搜索文档与回归记录 | WB-012, WB-013 | tests/docs | 有可执行验证记录和当前 API 契约说明。 |
| WB-020 | DONE | 图谱文档模型与版本策略 | WB-001 | `packages/graph-core`、graph DTO | 明确 GraphDocument/schemaVersion，已有数据可兼容读取。 |
| WB-021 | DONE | 图谱 viewport/selection/history 抽离 | WB-020 | graph-core、GraphWorkspacePage | 撤销/重做、选择、视口状态可单测，页面层减少逻辑。 |
| WB-022 | DONE | 图谱 import/export/validation 统一接口 | WB-020 | graph-core、graph module | Mermaid/Markdown/SVG 迁入统一接口并保留兼容性。 |
| WB-023 | DONE | 图谱内核测试与迁移回归 | WB-021, WB-022 | graph-core tests | 序列化、撤销、导入错误、旧数据兼容有测试。 |
| FE-000 | DONE | 前端现状审计与布局规格冻结 | WB-001 | `docs/engineering/`、`docs/design/` | 已固化前后端能力矩阵、页面状态矩阵、四类布局模式与图谱重构边界。 |
| FE-010 | DONE | 多布局壳层与基础组件 | FE-000 | `frontend-user/src/app/`、`frontend-user/src/design-system/`、样式 | Standard / Studio / Canvas / Focus 路由布局可解析；Canvas 不挂全局 ContextPanel；基础组件与单测已添加，并已在 2026-07-08 跑通用户端 / 管理端类型检查、相关 Vitest、前后台构建与 Playwright 回归。 |
| FE-020 | DONE | 图谱 CanvasLayout 与资源 / Inspector 重构 | FE-010 | `frontend-user/src/modules/graph/` | 已实现资源区 Tab 化与覆盖式 Dock；Inspector 承接节点、历史、冲突和 AI；2026-07-08 已完成类型检查、Vitest、构建和图谱工作区 Playwright smoke。 |
| FE-030 | DONE | 阅读、笔记、复习工作区体验对齐 | FE-010 | `frontend-user/src/pages/ReaderPage.tsx`、`NotesPage.tsx`、`modules/review/`、`styles/studio-workspaces.css` | 阅读/笔记采用可收起资源区与检查器；复习采用单任务舞台和按需管理面板；既有 API 与数据契约不变，2026-07-08 已完成类型检查、Vitest、构建和阅读/复习/后台治理 Playwright 回归。 |
| FE-040 | IN_PROGRESS | 设计 token 单一来源与页面状态协议 | FE-010 | `packages/design-tokens` 或等价包、`packages/ui`、`frontend-user/src/styles/`、`frontend-admin/src/` | `app.css` 与 `ui-redesign.css` 的同名 token 漂移被收口；所有数据页统一声明 Loading / Empty / Error / Unauthorized / Stale / Conflict 状态语义。 |
| FE-041 | IN_PROGRESS | `@studymate/ui` 基础组件契约出壳 | FE-040 | `packages/ui`、用户端 design-system、管理端 shared UI | `DataState`、`Drawer`、`Inspector`、`IconButton`、`Button`、`Tag` 已收口到共享包并保留用户端兼容出口，且 `IconButton`、`Button`、`Tag` 都已接到真实页面或图谱骨架；后续继续推进 Input、Select、ConfirmDialog、CommandBar、PageHeader 的共享 token、变体、禁用/加载/错误状态与最小测试或文档示例。 |
| API-010 | IN_PROGRESS | 前后台共享 API client core | WB-014, FE-040 | `packages/api-client`、`frontend-user/src/api`、`frontend-admin/src/` | request/error/pagination/upload 基础能力沉入共享包；新代码不再在页面组件里手写 fetch、错误解析和分页解析。 |
| API-011 | IN_PROGRESS | Token refresh 与统一 401 会话生命周期 | API-010 | `packages/api-client`、auth 模块、前后台会话入口 | Access Token 过期后只刷新一次并重放原请求；刷新失败统一退出、清理本地状态并记录会话失效原因；补 HttpOnly Refresh Token 迁移说明。 |
| DEV-010 | DONE | 工程可复现性二次核验与工具链收口 | WB-003 | 根 workspace、lockfile、CI、graph-core 测试脚本、开发文档 | 在真实仓库基础上固定 Node/Go 版本、bootstrap 命令、依赖审计入口；`@studymate/graph-core` 改为显式 `--experimental-strip-types` 运行 `.ts` 测试，并新增运行时基线校验。 |
| SEC-010 | DONE | 依赖安全基线收口 | DEV-010 | `package-lock.json`、前台/后台 package manifest、`backend/go.mod`、CI、开发文档 | 锁定 `vite` / `esbuild` / `undici` / `glob` 与 Go toolchain / `golang.org/x/net` / `quic-go` 安全下限；`npm run verify:deps` 通过并纳入默认 CI。 |
| SEC-011 | DONE | 默认 secret scan 门禁收口 | SEC-010 | 根 `package.json`、`.github/workflows/ci.yml`、`scripts/`、发布/开发文档 | 新增 `npm run verify:secrets`、仓库级扫描脚本与基线测试；默认 CI 执行 secret scan，并对 placeholder 示例值保持低误报。 |
| QA-010 | DONE | 默认覆盖率基线门禁收口 | DEV-010, SEC-011 | 根 `package.json`、`.github/workflows/ci.yml`、`scripts/`、发布/开发文档 | 新增 `npm run verify:coverage`、覆盖率基线测试与统一解析脚本；默认 CI 阻断前后台、graph-core 与后端覆盖率回退，同时保留 `npm run test:coverage` 作为发布前详细汇总。 |

## P1：在 P0 稳定后推进

| ID | 状态 | 任务 | 依赖 | 主要影响范围 | 验收标准 |
|---|---|---|---|---|---|
| WB-030 | DONE | 图谱 API 契约与生命周期整理 | WB-020 | graph routers/handlers/services/docs | graph/document/node/edge/group/snapshot 关系和版本策略清晰。 |
| WB-031 | DONE | 图谱导出、缩略图与布局能力 | WB-030 | graph backend + frontend | 至少 JSON/SVG 导出；缩略图和布局有明确 API/任务模型。 |
| WB-032 | IN_PROGRESS | 自动保存/快照/冲突处理可靠性 | WB-030, WB-021 | graph persistence | 保存可追溯、冲突可见、恢复安全；无静默覆盖，冲突导出物可携带人工合并清单、对象级明细与取舍草稿，并支持把已标记取舍显式应用为可保存合并草稿；预检阻断摘要优先展示可读对象原因。 |
| WB-033 | TODO | 图谱-复习学习反馈闭环 | WB-030, FE-030 | graph/card/review | 复习结果可回写节点熟练度；卡片与来源节点可追溯；学习工作台能解释复习反馈如何影响图谱与后续学习。 |
| WB-034 | TODO | 图谱 API 与工作区回归验证矩阵 | WB-032 | graph backend + frontend + e2e | 覆盖 create/save/restore/export/layout/conflict/权限路径；图谱工作区在桌面与窄屏至少有 smoke 回归，不再只依赖零散组件测试。 |
| GPH-040 | TODO | 图谱工作区 store / commands / features 拆分 | WB-032, FE-020 | `frontend-user/src/modules/graph/`、`packages/graph-core` | `useGraphWorkspaceController` 不再继续承接新增业务；选中、相机、面板、保存、冲突等浏览器状态进入 store，新增节点/连线/分组/模板/恢复等用户意图进入 commands。 |
| LC-010 | TODO | 主学习闭环演示路径收口 | WB-033, FE-030 | material/reader/note/graph/card/review/AI | “资料上传 -> PDF 阅读 -> 高亮批注 -> 摘录池 -> 笔记 -> 图谱节点草稿 -> 图谱关系整理 -> 卡片草稿 -> 今日复习”可端到端验收，来源回跳、草稿确认和失败状态清晰。 |
| WB-040 | TODO | 管理端真实只读数据页第一批 | WB-001 | admin backend + frontend-admin | 用户、内容、AI 任务/用量、审计至少展示真实数据。 |
| WB-041 | TODO | 后台内容治理与审批状态流转 | WB-040 | admin/community/material/graph | 受控审核、筛选分页、角色校验、状态记录齐全。 |
| WB-042 | TODO | 审计事件模型 | WB-040 | backend migrations/admin services | 管理关键操作、审核、AI 重试等可查询追溯。 |
| ADM-010 | TODO | 管理端 Vue Router 模块化与 URL 状态 | WB-040, FE-040 | `frontend-admin/src/app/`、`frontend-admin/src/features/`、`frontend-admin/src/pages/` | `/admin/dashboard`、`/admin/moderation`、`/admin/users`、`/admin/materials`、`/admin/reports`、`/admin/ai`、`/admin/files`、`/admin/audit-logs` 可刷新、可回退、可分享。 |
| ADM-011 | TODO | 后台治理动作化第一批 | ADM-010, WB-042 | admin modules + audit | 用户封禁/解封、资料下架/恢复、举报处理备注、AI 任务重试/取消、图谱模板审核/发布/下架至少落地一批，并进入权限与审计链路。 |
| SE-020 | TODO | MySQL fallback 搜索服务端分页与真实统计 | WB-014 | search service/handler/frontend search | `GET /search` 支持 cursor/limit/sort 或等价分页；每类结果有真实命中数、搜索耗时、排序语义、空结果建议和来源跳转契约。 |
| WB-043 | TODO | SearchIndexer 升级与 Meilisearch 评估 | SE-020 | search module/config/deploy | 前端 API 不变；索引实现可替换，具备配置开关；明确是否进入 Meilisearch 的采用/不采用结论。 |
| WB-044 | TODO | 搜索同步与失败恢复任务 | WB-043 | jobs/queue/search | 具备重建索引、失败重试、幂等与可观测字段。 |

## P2/P3：在上述稳定后推进

| ID | 状态 | 任务 | 依赖 | 主要影响范围 | 验收标准 |
|---|---|---|---|---|---|
| WB-050 | TODO | 笔记双链、反链与块级引用 | WB-014 | note/search/graph | 双向链接、反链查询、来源跳转、索引同步可用。 |
| WB-051 | TODO | 工程图谱导入 MVP（择一首发） | WB-022, WB-030 | graph-import-export | OpenAPI/SQL DDL/PlantUML 之一稳定导入为草稿。 |
| WB-052 | TODO | UML/ERD/C4 模板中心第一版 | WB-051, WB-041 | graph/admin | 模板版本、审核/发布、用户创建与复用可用。 |
| WB-053 | TODO | Go 代码分析图 MVP | WB-051 | analysis jobs/graph | 路由图、ERD、模块依赖图至少一项可生成。 |
| WB-054 | TODO | Tauri 离线图谱技术预研 | WB-021, WB-031 | desktop prototype | 明确数据同步、文件模型、打包与采用/不采用结论。 |

## 执行记录

### 执行记录：QA-010（默认覆盖率基线门禁收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/coverage-baseline.test.mjs`，先用 RED 锁定四类缺口：仓库缺少 `verify:coverage` 命令、默认 `ci` 未显式执行覆盖率门禁、GitHub Actions 未接入覆盖率基线步骤，以及 README / 开发说明 / 版本计划 / release checklist 仍只记录 `test:coverage` 而没有默认硬门禁入口。
  - 新增 `scripts/verify-coverage-gates.mjs`，把覆盖率门禁收口为单一入口：`frontend-user` 与 `frontend-admin` 运行 Vitest coverage 并读取 JSON summary，`@studymate/graph-core` 解析 Node test coverage 的 `all files` 汇总，后端运行 `go test ./... -coverprofile` 并用 `go tool cover -func` 读取总体 statements。
  - 将当前仓库已验证覆盖率固化为默认“不回退”基线：`frontend-user` `statements/branches/functions/lines >= 68/63/67/68`，`frontend-admin >= 70/67/64/75`，`graph-core lines/branches/functions >= 96/79/100`，后端总体 `statements >= 25`。
  - 更新根 `package.json`、`.github/workflows/ci.yml`、`README.md`、`docs/DEVELOPMENT.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`docs/planning/versions/v1.0.0-release.md`，统一把默认覆盖率门禁入口收口为 `npm run verify:coverage`，并明确 `npm run test:coverage` 继续承担发布前详细汇总职责。
- 已执行验证：
  - RED：`node --test scripts/coverage-baseline.test.mjs`
  - GREEN：`node --test scripts/coverage-baseline.test.mjs`
  - `npm run verify:coverage`
  - `npm run verify:docs`
- 风险与后续：
  - 当前 `verify:coverage` 是第一阶段“基线不回退”硬门禁，而不是全仓整体 80% 总线；后续仍应在 `FE-040`、`API-010`、`WB-032` 等里程碑中持续补测试并逐步抬高阈值。
  - 发布前仍应保留 `npm run test:coverage` 作为详细汇总证据，重点变更代码继续以 80% 聚焦覆盖率为目标。

### 执行记录：SEC-011（默认 secret scan 门禁收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/secret-scan-baseline.test.mjs`，先用 RED 锁定 `verify:secrets` 缺失、默认 `ci` 未显式执行 secret scan、GitHub Actions 未接线，以及 README / 开发说明 / release checklist 仍把 secret scan 记成手工动作的缺口。
  - 新增 `scripts/verify-secret-scan.mjs`，把仓库级 secret scan 收口为单一入口：默认递归检查文本文件，跳过 `node_modules`、`dist`、`coverage`、锁文件与二进制资源，并识别私钥块、常见 Token 格式、DSN 内联凭据，以及 `apiKey` / `secret` / `token` / `password` 一类硬编码赋值。
  - 为 `change-me-in-local-env`、`<secret-manager-value>`、`<local-password>`、`user:pass` 等 placeholder 示例值补内置忽略规则，同时支持通过 `secret-scan: allow` 对个别测试样例做最小范围豁免，避免开发说明与 `.env.example` 误报。
  - 更新根 `package.json`、`.github/workflows/ci.yml`、`README.md`、`docs/DEVELOPMENT.md`、`docs/planning/VERSION_PLAN.md`、`docs/planning/ROADMAP.md`、`docs/planning/versions/v1.0.0-release.md`、`docs/engineering/CODEX_PROJECT_CONTEXT.md` 与 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，统一把 secret scan 入口收口为 `npm run verify:secrets`。
- 已执行验证：
  - RED：`node --test scripts/secret-scan-baseline.test.mjs`
  - GREEN：`node --test scripts/secret-scan-baseline.test.mjs`
  - `npm run verify:secrets`
  - `npm run verify:docs`
- 风险与后续：
  - 当前扫描器以“高置信度硬编码密钥”优先，已覆盖私钥、常见 Token 格式、DSN 凭据和 secret-like literal 赋值；如后续仓库引入新的供应商密钥格式，应继续在 `scripts/verify-secret-scan.mjs` 中补 detector，而不是回退到一次性 `rg` 命令。
  - 默认 CI 现已补上依赖审计与 secret scan，剩余主要 P0 工程门禁收口项收敛为覆盖率硬门槛。

### 执行记录：DEV-010（工程可复现性二次核验与工具链收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/verify-runtime-baseline.mjs` 与 `scripts/workspace-repro.test.mjs`，把 Node 24 / npm 11 / Go 1.26、`packageManager`、`bootstrap`、`verify:runtimes`、`verify:deps`、`ci` 前置运行时检查，以及 `@studymate/graph-core` 显式 TypeScript 测试命令锁成可执行契约。
  - 新增 `scripts/run-dependency-audits.mjs`，统一收口 `npm audit --registry=https://registry.npmjs.org/ --audit-level=high` 与 `go run golang.org/x/vuln/cmd/govulncheck@latest ./...` 两条依赖审计入口，避免 `npmmirror` 缺失 audit API 时直接卡在 `[NOT_IMPLEMENTED]`。
  - 更新根 `package.json`：补 `packageManager`、`engines`、`bootstrap`、`verify:runtimes`、`verify:deps`，并让 `ci` 在更大验证链路前先执行运行时基线校验。
  - 更新 `packages/graph-core/package.json`，将测试与覆盖率命令改为显式 `node --experimental-strip-types --test ...` 与 `node --experimental-strip-types --experimental-test-coverage --test ...`，不再依赖 Node 对 `.ts` 测试的隐式执行差异。
  - 更新 `docs/DEVELOPMENT.md`、`README.md` 与 `.github/workflows/ci.yml`，把 bootstrap / runtime baseline / dependency audit 入口同步进开发文档、命令清单和 CI 步骤。
- 已执行验证：
  - RED：`node --test scripts/workspace-repro.test.mjs`
  - GREEN：`node --test scripts/workspace-repro.test.mjs`
  - `npm run verify:runtimes`
  - `npm --workspace @studymate/graph-core run test`
  - `npm --workspace @studymate/graph-core run test:coverage`
  - `npm run bootstrap`
  - `npm run verify:docs`
  - `npm run verify:deps`
- 风险与后续：
  - `npm run bootstrap` 现已能在当前 Windows 工作区完成依赖补齐，但仍可能因为占用中的 `esbuild` / `rollup` 二进制在清理旧目录时输出 `EPERM cleanup` 警告；它不影响本轮 bootstrap 成功，但说明本地活跃工具进程仍会干扰包管理器清理。
  - `npm run verify:deps` 已经能稳定产出真实审计结果；后续若再次命中 npm 或 Go 漏洞，应优先沿依赖基线而不是业务代码做独立安全收口。

### 执行记录：SEC-010（依赖安全基线收口）
- 执行日期：2026-07-09
- 本轮完成：
  - 新增 `scripts/dependency-security-baseline.test.mjs`，先用 RED 锁定 `frontend-user` / `frontend-admin` 的 `vite` 安全下限、根 `vitest` / `@vitest/coverage-v8` / `@vue/test-utils` 版本下限、`package-lock.json` 中 `vite` / `esbuild` / `undici` / `glob` 的最低安全版本，以及 `backend/go.mod` 的 `toolchain go1.26.5`、`golang.org/x/net v0.55.0`、`github.com/quic-go/quic-go v0.59.1` 与 CI 的 Go patch 版本。
  - 更新根 `package.json`、`frontend-user/package.json`、`frontend-admin/package.json` 与 `package-lock.json`，把前端安全基线收口到 `vite ^7.3.6`、`vitest ^4.1.10`、`@vitest/coverage-v8 ^4.1.10`、`@vue/test-utils ^2.4.11`，并同步清理锁文件里的 `esbuild` / `undici` / `glob` 旧漏洞版本。
  - 更新 `backend/go.mod` 与 `backend/go.sum`，锁定 `toolchain go1.26.5`，并将 `golang.org/x/net` 升级到 `v0.55.0`、`github.com/quic-go/quic-go` 升级到 `v0.59.1`，同步带上 `qpack` 与相关 `x/*` 模块的新安全版本。
  - 更新 `.github/workflows/ci.yml` 与 `docs/DEVELOPMENT.md`，让默认 CI 显式使用 Go `1.26.5` 并执行 `npm run verify:deps`，同时把本地 toolchain 自动下载与依赖审计行为写回开发基线。
- 已执行验证：
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
- 风险与后续：
  - Windows 下如果本地仍有 `esbuild.exe` 被占用，`npm install` 可能继续出现 `EBUSY` / `EPERM cleanup` 一类文件锁问题；当前已通过停止仓库内残留构建进程完成升级，但这仍是本地开发环境的已知噪音。
  - 默认 CI 现已补上依赖审计与 secret scan；下一步主要工程级门禁缺口收敛为覆盖率硬门槛。

### 执行记录：FE-040（管理端接入共享 token 起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `frontend-admin/src/main.ts` 新增 `@studymate/ui/tokens.css` 导入，管理端主入口开始与用户端共用同一份根 token 来源。
  - `frontend-admin/src/components/admin/admin.css` 移除本地 `:root` bootstrapping，并把 `--admin-bg`、`--admin-surface`、`--admin-line`、`--admin-text`、`--admin-accent` 等基础变量映射到共享 token，先统一前后台的背景、文本、描边与 accent 骨架。
  - 新增 `frontend-admin/src/tokenSource.test.ts`，锁定管理端主入口接线存在、基础 admin token 已引用共享变量，以及本地根 token 引导块已移除。
- 已执行验证：
  - RED：`npx vitest run frontend-admin/src/tokenSource.test.ts`
  - GREEN：`npx vitest run frontend-admin/src/tokenSource.test.ts`
  - `npm --workspace frontend-admin run test`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
- 后续建议：
  - 继续沿 `FE-040` 把管理端更多局部硬编码颜色、圆角与输入/按钮态映射到共享 token，而不是只停留在基础壳层变量。
  - 继续沿 `FE-041` 把 `Drawer`、`Inspector`、`DataState` 之外的更多视觉契约沉到 `@studymate/ui`，让共享层开始承接“组件级”而不只是“变量级”一致性。

### 执行记录：FE-040（共享设计 token 单一来源起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/tokens.css` 新增共享根 token 定义，并通过 `packages/ui/package.json` 暴露 `@studymate/ui/tokens.css` 入口，让共享设计 token 不再停留在规划态。
  - `frontend-user/src/styles.css` 现已先导入共享 token 样式，`frontend-user/src/styles/app.css` 与 `frontend-user/src/styles/ui-redesign.css` 内重复的 `:root` token 块已经移除，用户端完成 FE-040 的最小单一来源接线。
  - 新增 `packages/ui/src/tokens.test.ts` 与 `frontend-user/src/styles/tokenSource.test.ts`，锁定共享 token 文件存在、样式入口接线存在，以及用户端本地样式文件不再重复声明核心 token。
- 已执行验证：
  - RED：`npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
  - GREEN：`npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 继续沿 `FE-040` 让前后台更多局部样式细节消费共享 token，避免只在入口层统一、在组件层继续分叉。
  - 继续沿 `FE-041` 把更多 primitives 的视觉变量与状态契约收敛到 `@studymate/ui`，而不是继续在页面层维护局部副本。

### 执行记录：FE-041（共享基础组件契约第一批落地）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/index.ts` 开始直接导出共享 `DataState`、`Drawer`、`Inspector` 及其 props 类型，让 `@studymate/ui` 不再只承接 token 和状态文案，也开始承接真实组件契约。
  - `packages/ui/src/DataStateView.tsx`、`Drawer.tsx`、`Inspector.tsx` 新增最小 React primitive 实现，并保持既有 `ds-*` class 语义，避免用户端样式与调用面被迫重写。
  - `frontend-user/src/design-system/primitives/DataState.tsx`、`Drawer.tsx`、`Inspector.tsx` 改为兼容转发层，用户端既有 import 路径不变，但实现来源已收口到共享包。
  - `packages/ui/src/reactPrimitives.test.tsx` 新增共享组件契约回归，先用 RED 锁定缺失导出，再用 GREEN 验证共享包和用户端兼容面都能稳定通过。
- 验证：
  - `npx vitest run packages/ui/src/index.test.ts packages/ui/src/reactPrimitives.test.tsx`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx`
- 后续建议：
  - 继续沿 `FE-041` 把 Button、IconButton、Input、Select、Tag、ConfirmDialog、CommandBar、PageHeader 等更多 primitives 收口到 `@studymate/ui`，而不是继续在页面层保留平行实现。
  - 管理端后续如需共享更深的视觉/交互契约，应优先消费这层组件出口，而不是再从 `tokens.css` 重新拼装一套局部基础构件。

### 执行记录：FE-041（共享 IconButton 与骨架接线）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/IconButton.tsx` 新增共享 `IconButton`，统一 `icon-button` / `active` class 语义，并默认把字符串 `title` 映射为 `aria-label`，减少骨架层图标按钮的可访问性分叉。
  - `frontend-user/src/design-system/primitives/IconButton.tsx` 与 `index.ts` 新增用户端兼容出口，让页面层可以沿用本地 design-system 路径消费共享实现。
  - `packages/ui/src/Drawer.tsx` 改为直接复用共享 `IconButton`，共享层开始出现 primitive 之间的组合，而不再全部停留在“各自孤立”状态。
  - `frontend-user/src/app/chrome/CommandBar.tsx`、`modules/graph/components/GraphWorkspaceCanvasChrome.tsx`、`GraphWorkspaceShell.tsx` 已接入共享 `IconButton`，覆盖顶栏、图谱 command bar、图谱工具栏与若干抽屉/检查器关闭动作。
  - `packages/ui/src/reactPrimitives.test.tsx` 与 `frontend-user/src/design-system/primitives/IconButton.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、active 状态、点击行为与用户端兼容出口。
- 验证：
  - `npx vitest run packages/ui/src/index.test.ts packages/ui/src/reactPrimitives.test.tsx`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/IconButton.test.tsx src/design-system/primitives/Drawer.test.tsx src/app/layouts/AppShell.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/modules/graph/components/GraphWorkspaceShell.test.tsx`
- 后续建议：
  - 继续沿 `FE-041` 把 `primary-button` / `secondary-button` 背后的 Button 契约一起收口，避免共享层只有图标按钮而普通动作按钮仍留在页面层散落。
  - 阅读、笔记、复习页面仍有若干直接写死的 `icon-button`，后续可继续沿同一共享出口逐步替换。

### 执行记录：FE-041（共享 Button 图谱接线）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/Button.tsx` 新增共享 `Button`，统一 `primary`、`secondary`、`ghost` 三种变体，并收口 `active`、`danger`、默认 `type="button"` 等基础行为。
  - `packages/ui/src/index.ts` 与 `frontend-user/src/design-system/primitives/Button.tsx`、`index.ts` 已补齐共享导出与用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/modules/graph/components/GraphWorkspaceCanvasChrome.tsx`、`GraphWorkspaceShell.tsx`、`GraphWorkspaceImportPanel.tsx`、`GraphWorkspaceStageChrome.tsx` 已开始接入共享 `Button`，覆盖新建、保存、导入、校验与冲突处理等普通动作按钮。
  - `packages/ui/src/reactPrimitives.test.tsx` 与 `frontend-user/src/design-system/primitives/Button.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、按钮变体、`active` / `danger` 状态、默认按钮类型与用户端兼容出口。
- 验证：
  - RED：`npm --workspace frontend-user run test -- src/design-system/primitives/Button.test.tsx`
  - `npx vitest run packages/ui/src/reactPrimitives.test.tsx`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/Button.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/modules/graph/components/GraphWorkspaceShell.test.tsx src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
  - `npm run typecheck`
  - `npm run build:user`
  - `npm run verify:docs`
- 后续建议：
  - 继续沿 `FE-041` 把阅读、笔记、复习与管理端里散落的普通动作按钮逐段迁入共享 `Button`，而不是只停留在图谱工作区。
  - 在共享 `Button` 语义稳定后，再继续推进 Input、Select、Tag、ConfirmDialog、CommandBar、PageHeader 等更高层 primitives 的统一出口。

### 执行记录：FE-041（共享 Tag 接入阅读与资料页）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui/src/Tag.tsx` 新增共享 `Tag` primitive，先统一 `chip` / `muted` 两种基础语义，避免阅读、资料等页面继续各自写裸 `span` 与局部 class 组合。
  - `packages/ui/src/index.ts`、`frontend-user/src/design-system/primitives/Tag.tsx` 与 `index.ts` 已补齐共享导出和用户端兼容出口，让页面层继续沿本地 design-system 路径消费共享实现。
  - `frontend-user/src/pages/ReaderPage.tsx` 与 `frontend-user/src/pages/MaterialsPage.tsx` 已接入共享 `Tag`，覆盖阅读工作区元信息 chips 与资料详情标签，说明 `FE-041` 已开始从图谱骨架扩展到学习主路径页面。
  - `packages/ui/src/reactPrimitives.test.tsx` 与 `frontend-user/src/design-system/primitives/Tag.test.tsx` 新增 RED/GREEN 回归，锁定共享导出、`muted` 变体和用户端兼容出口。
- 验证：
  - RED：`npx vitest run packages/ui/src/reactPrimitives.test.tsx frontend-user/src/design-system/primitives/Tag.test.tsx`
  - GREEN：`npx vitest run packages/ui/src/reactPrimitives.test.tsx frontend-user/src/design-system/primitives/Tag.test.tsx`
  - `npm --workspace frontend-user run test -- src/pages/ReaderPage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 后续建议：
  - 继续沿 `FE-041` 把 Input、Select、ConfirmDialog、CommandBar、PageHeader 等仍未共享的 primitives 收口到 `@studymate/ui`，优先挑选已经出现在阅读、笔记、资料和后台治理页中的重复模式。
  - 管理端暂未直接消费这层 `Tag` 组件；后续如需更深共享，应优先复用同一套 class 语义和 token，而不是再扩写新的 badge/chip 分叉。

### 执行记录：FE-040 / FE-041（共享页面状态契约起步）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/ui` 新增共享 `dataStateKinds`、`DataStateKind` 与 `getDataStateLabel(...)`，先收口 Loading / Empty / Error / Unauthorized / Stale / Conflict 六类页面状态语义。
  - `frontend-user/src/design-system/primitives/DataState.tsx` 改为直接消费 `@studymate/ui` 的共享状态文案，避免阅读、笔记、复习页面继续各自维护一套页面状态标签。
  - `frontend-user/package.json` 显式声明 `@studymate/ui` workspace 依赖，补齐共享 UI 契约的工程边界。
- 已执行验证：
  - `npx vitest run packages/ui/src/index.test.ts`
  - `npm --workspace frontend-user run test -- src/design-system/primitives/DataState.test.tsx`
- 后续建议：
  - 继续沿 `FE-040` 收口设计 token 单一来源，优先处理 `app.css` 与 `ui-redesign.css` 的重复 token。
  - 继续沿 `FE-041` 把 `Drawer`、`Inspector` 等已有 primitives 逐步迁入 `@studymate/ui`，而不是继续散落在各端页面里各自演化。

### 执行记录：PLAN-2026-07-08（PDF 评审导入）

- 执行日期：2026-07-08
- 输入材料：`StudyMate 代码审查与后续开发建议.pdf`
- 本轮结论：
  - PDF 中关于设计系统、共享 API、图谱控制器、后台单页工作台、搜索产品化和主学习闭环的建议仍成立，已拆为 `FE-040`、`FE-041`、`API-010`、`API-011`、`DEV-010`、`GPH-040`、`LC-010`、`ADM-010`、`ADM-011`、`SE-020` 等工作包。
  - PDF 中关于“根目录工程入口、lockfile、CI 缺失”的判断不直接套用于当前 Git 仓库；真实仓库已有 `package.json`、`package-lock.json` 与 `.github/workflows/ci.yml`，因此只保留 `DEV-010` 做工具链和可复现命令二次收口。
  - 新增任务不改变当前“先收口 P0/P1，再扩展工程图谱、桌面端、课程/协作”的项目边界。
- 验证：
  - 已抽取 PDF 全 16 页文本。
  - 已核验 `packages/ui`、`packages/api-client`、`packages/editor-core`、重复 CSS token、图谱控制器大小、管理端工作台大小、根 lockfile 与 CI 文件存在性。

### 执行记录：API-010（共享请求基础层起步）

- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 不再只暴露健康检查；新增共享 `ApiSuccessPayload` / `ApiErrorPayload`、`readApiResponse(...)`、`requestApi(...)` 与 `createAuthHeaders(...)`，并让 `getHealth(...)` 复用这层共享请求入口。
- `packages/api-client` 现已新增共享 `buildApiPath(...)`，开始承接数组 filters、`limit` 等 query/pagination 参数拼接，避免搜索与后台治理列表继续各自手写 `URLSearchParams` 或 `?limit=20`。
- `packages/api-client` 现也开始承接 JSON 请求体归一化：`requestApi(...)` 可直接接收 plain object / array 并统一序列化为 JSON，同时继续保持 `FormData` 等上传路径不被强塞 `Content-Type`。
  - `packages/api-client/src/index.test.ts` 先以 RED 锁定鉴权 header、JSON envelope 解析、`FormData` 上传不强塞 `Content-Type` 与 API 错误抛出，再转 GREEN。
  - `frontend-user/src/api/core.ts` 已改为复用 `@studymate/api-client` 的共享 request/auth-header 层；`frontend-user/src/api/types.ts` 不再重复维护本地 success/error envelope 类型。
- `frontend-user/src/api/search.ts` 已改为通过 `buildApiPath(...)` 构造 `q`、`types`、`limit` 查询参数，不再本地拼接 `URLSearchParams`。
- 用户端 `auth/community/graphs/materials/notes/reader/review/share` 等 API 模块现已改为直接把对象请求体交给共享层，不再各自手写 `JSON.stringify(...)`。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 已改为通过共享 client 访问后台 API，并移除不再使用的本地响应解析分支。
- 新增 `frontend-admin/src/api/client.ts` 与 `frontend-admin/src/api/client.test.ts`，把管理端 `get/post` 请求边界从页面中抽出，并让治理列表的 `limit=20` 改为通过共享 query helper 生成、JSON POST body 改为由共享层统一编码。
  - `frontend-user/package.json`、`frontend-admin/package.json` 与 `package-lock.json` 已显式接入 `@studymate/api-client` workspace 依赖。
- 已执行验证：
  - RED：`npx vitest run packages/api-client/src/index.test.ts`
  - GREEN：`npx vitest run packages/api-client/src/index.test.ts`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/reader.test.ts src/api/reviewAi.test.ts src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run test -- src/api/searchShare.test.ts`
  - RED：`npm --workspace frontend-admin run test -- src/api/client.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:user`
  - `npm run build:admin`
- 后续建议：
  - 继续沿 `API-010` 补齐分页、更多上传路径与更稳定的 header 合并边界，而不是让新页面继续回到本地手写 fetch。
  - 在共享 request / error / query / JSON body 基线稳定后，继续沿 `API-011` 收口 refresh/replay/fail-logout 与更完整的会话生命周期。

### 执行记录：API-011（用户端共享会话刷新起步）

- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 新增共享 `ApiRequestError` 与 `createSessionRequest(...)`，开始承接 401 单次 refresh/replay、并发 refresh 去重与 refresh 失败时的本地 session 清理。
  - `packages/api-client/src/index.test.ts` 新增并发请求共享同一轮 refresh 的 RED/GREEN 用例，锁定“Access Token 过期后只刷新一次，再用新 token 重放请求”的共享层行为。
  - `frontend-user/src/app/sessionStore.ts` 新增可订阅的会话存储；`frontend-user/src/app/routes.tsx` 改为通过 `useSyncExternalStore(...)` 订阅 session，保证 refresh 成功或失败后，受保护路由能跟随同一份持久化状态更新。
  - `frontend-user/src/api/core.ts` 已接入共享 `createSessionRequest(...)`，统一通过 `/api/v1/auth/refresh` 刷新 Access Token；`withAuth(...)` 也会优先消费最新持久化 session，避免旧页面 props 把 stale token 再次写回请求头。
  - `frontend-user/src/api/sessionRefresh.test.ts` 先以 RED 复现图谱列表在 401 后不会自动恢复的问题，再转 GREEN，锁定“refresh 成功后更新本地 session 并重放原请求”的用户端闭环。
- 已执行验证：
  - RED：`npx vitest run packages/api-client/src/index.test.ts`
  - RED：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
  - GREEN：`npx vitest run packages/api-client/src/index.test.ts`
  - GREEN：`npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/sessionRefresh.test.ts src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续建议：
  - 继续沿 `API-011` 把同一套 refresh/replay/fail-logout 扩到更多后台模块请求边界，避免前后台继续各自维护会话生命周期。
  - 在共享层补齐会话失效原因记录与 HttpOnly Refresh Token 迁移说明，再考虑把 `API-011` 从“已起步”推进到更完整的收口状态。

### 执行记录：API-011（会话失效原因与统一提示语义）
- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 为共享 `createSessionRequest(...)` 补上 `SessionInvalidationState` 与 `onSessionInvalidated(...)` 回调，让 refresh 失败不再只会清 session，也会把失效原因结构化写回前后台会话入口。
  - `frontend-user/src/app/sessionStore.ts` 与 `frontend-admin/src/api/sessionStore.ts` 现在都会分开持久化 session 和 invalidation 元数据；refresh 成功会清理旧失效记录，refresh 失败则保留原因，供 UI 在被动登出后读取。
  - `frontend-user/src/api/core.ts` 与 `frontend-admin/src/api/client.ts` 已接上新的 invalidation 回调；`frontend-user/src/pages/AuthPages.tsx`、`frontend-user/src/app/routes.tsx` 与 `frontend-admin/src/views/AdminWorkspaceView.vue` 则补齐了统一 fail-logout 提示语义，并在手动退出时显式清空旧失效提示。
  - 新增/更新 `packages/api-client/src/index.test.ts`、`frontend-user/src/api/sessionRefresh.test.ts`、`frontend-user/src/pages/AuthPages.test.tsx`、`frontend-admin/src/views/AdminWorkspaceView.test.ts`，先用 RED 复现“只清 session、不记录原因”和“登录页拿不到统一提示”的缺口，再转 GREEN。
- 已执行验证：
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
- 后续待续：
  - `API-011` 现在已不再缺“会话失效原因记录 / 统一 fail-logout 提示语义”，后续重点转向 HttpOnly Refresh Token 迁移说明与更多后台模块请求边界接线。
  - `ADM-010` 仍应继续把后台工作台从单页组件拆到可刷新 URL 和模块路由，而不是继续把更多会话衍生逻辑堆回视图层。

### 执行记录：API-011（管理端共享会话刷新起步）

- 执行日期：2026-07-09
- 本轮完成：
  - `packages/api-client/src/index.ts` 的 `createSessionRequest(...)` 已支持显式 `sessionOverride`，让管理端在继续传入当前页面 session 的同时，也能复用共享 refresh/replay/fail-logout 生命周期。
  - 新增 `frontend-admin/src/api/sessionStore.ts`，把后台会话持久化收口为可订阅 store，统一负责 `studymate.admin.session` 的读取、写入与清理。
  - `frontend-admin/src/api/client.ts` 已接入共享 `createSessionRequest(...)`，统一通过 `/api/v1/auth/refresh` 刷新后台 Access Token，并在刷新成功后持久化最新 session。
  - `frontend-admin/src/views/AdminWorkspaceView.vue` 登录、启动自举与退出流程已接到共享 session store；refresh 失败时会清空后台本地会话、重置治理工作台状态并回退到登录视图。
  - `frontend-admin/src/api/client.test.ts` 先以 RED 复现“后台令牌过期后不会自动 refresh/replay”的问题，再转 GREEN；`frontend-admin/src/views/AdminWorkspaceView.test.ts` 也锁定了“后台启动时 refresh 失败会回到登录页并清空会话”的回归。
- 已执行验证：
  - RED：`npm --workspace frontend-admin run test -- src/api/client.test.ts`
  - RED：`npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - GREEN：`npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
  - `npm --workspace frontend-admin run typecheck`
  - `npm run build:admin`
  - `npx vitest run packages/api-client/src/index.test.ts`
  - `npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/api/graphs.test.ts src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run build:user`
- 后续待续：
  - 继续沿 `API-011` 补齐会话失效原因记录与统一提示语义，避免当前只在各端以局部 notice/error message 体现失效结果。
  - 为更多后台 API 模块接出独立请求文件与共享 session 生命周期，减少 `AdminWorkspaceView.vue` 内仍然保留的单页工作台耦合。
  - 预留并补齐 HttpOnly Refresh Token 迁移说明，再考虑把 `API-011` 从“前后台均已起步”推进到更完整的收口状态。

### 执行记录：FE-010 / FE-020 / FE-030 / UI-04（验证收口）
- 执行日期：2026-07-08
- 执行基线：`master@10243e6`
- 本轮完成：
  - 收口 FE-010、FE-020、FE-030 与 UI-04 的真实依赖环境验证，不再保留“待完整依赖安装后复核”的状态。
  - 更新用户端 Playwright smoke，使壳层、图谱工作区和复习流断言与当前产品界面一致。
  - 为管理端工作台导航补充稳定语义：`aria-label`、`aria-pressed` 与 `data-admin-view`，降低管理端 Vitest 与 Playwright 对脆弱文案/位置选择器的耦合。
  - 重写 `frontend-admin/src/views/AdminWorkspaceView.test.ts`，锁定 users 模块的真实加载、`Bearer admin-token` 传递以及 `alice` 渲染结果。
- 已执行验证：
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-admin run typecheck`
  - `npm --workspace frontend-user run test -- src/app/layouts/layoutPolicy.test.ts src/app/layouts/AppShell.test.tsx src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
  - `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
  - `npm run build:user`
  - `npm run build:admin`
  - `npx playwright test e2e/user-shell.spec.ts e2e/v1-graph-workspace.spec.ts e2e/v1-review-flow.spec.ts e2e/v1-admin-governance.spec.ts`
- 验证结论：
  - 上述命令已在 2026-07-08 全部通过，FE-010 / FE-020 / FE-030 / UI-04 从“实现完成待验证”收口为“实现与回归均完成”。
  - 仍未包含多分辨率截图采集与更大范围全量 E2E 扫描；这部分保留给后续更系统的视觉验收和 `WB-034` 图谱回归矩阵。
### 执行记录：FE-010（验证中）

- 执行日期：2026-07-02
- 执行基线：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 本轮完成：
  - 新增 `layoutPolicy`，按路由解析 `standard` / `studio` / `canvas` / `focus` 四类工作模式。
  - 将原 `ShellFrame` 缩为兼容层，新的 `AppShell` 统一编排布局、搜索、导航和上下文策略。
  - 新增完整主导航、72px 紧凑导航和 `CommandBar`；图谱、阅读和笔记不再继承固定的 284px 主侧栏。
  - Canvas 与 Focus 工作区不再渲染通用 `ContextPanel`；图谱第一步已回收全局右栏空间，未触碰图谱 document、保存、快照、导入导出或冲突协议。
  - 新增 `Drawer`、`Inspector`、`DataState` 基础构件与布局 / 壳层 / 基础构件回归测试。
  - 新增 FE-00 前端能力矩阵、布局重构规格和验收清单，作为 FE-020 的实现约束。
- 验证状态：
  - 已完成静态 diff 检查与 TypeScript 语法转译检查。
  - 当前沙箱解析 npm 镜像时出现 `EAI_AGAIN`，因此 `npm --workspace frontend-user run typecheck`、Vitest、构建与 Playwright 仍待在具备依赖缓存或网络的开发环境中执行。
- 后续推进：
  - FE-020 图谱 CanvasLayout 与 FE-030 阅读、笔记、复习工作区体验对齐均已完成实现，待在具备完整 npm 依赖的环境复核运行测试。
- 下一项界面工作将继续把 WB-032 的更系统多端合并策略接入新的图谱 Inspector；当前已落地对象级冲突明细、取舍草稿展示、未标记对象默认行为提示、阻断问题旁的联动取舍建议，以及显式应用到最新 head 的合并草稿动作。

### 执行记录：FE-020 / FE-030（验证中）

- 执行日期：2026-07-02
- 执行基线：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 本轮完成：
  - 图谱页面升级为 CanvasLayout：资源区、画布与 Inspector 按屏幕宽度自动切换为并列或覆盖式 Dock。
  - 阅读与笔记升级为 StudioLayout：资料 / 笔记资源区与来源、版本、草稿检查器均可按需收起。
  - 复习页升级为 FocusLayout：单任务卡片舞台、键盘翻面和评分、按需卡组管理面板。
  - 保持 GraphDocument、版本、快照、来源关系、导入导出、阅读、笔记和复习 API 契约不变。
- 验证状态：
  - 已完成 TypeScript 源码语法转译、文档同步、空白字符和交付压缩包完整性检查。
  - 当前环境缺少完整 npm 依赖，类型检查、Vitest、构建与 Playwright 待在本机或 CI 执行。


### 执行记录：WB-032（进行中）

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 本轮完成：
  - 更新 `backend/internal/modules/graph/service/service.go`
  - 更新 `backend/internal/modules/graph/service/service_test.go`
  - 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`
  - 更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`
  - 更新 `PROJECT_LOG.md`
  - 更新 `CHANGELOG.md`
- 当前进展：
  - `BatchSave(...)` 现在会在持久化前校验 `request.document.version == graph.current_version`；旧标签页或旧草稿触发的保存会返回 `409 graph_version_conflict`，不再静默覆盖较新的 graph head。
  - 新增后端回归测试锁定“旧版本保存必须失败且不得写入 graph/version/current document”。
  - 前端持久化 hook 回归测试锁定“冲突失败后仍保留 dirty 编辑状态和冲突提示”，确保本地未保存修改不会被失败态吞掉。
  - 前端 `restoreSnapshot(...)` 现在会在存在 `dirty` 编辑时直接阻断快照恢复，并提示“请先保存后再恢复快照”，避免本地未保存修改被历史版本静默覆盖。
  - 页面级与 persistence helper 回归测试已锁定“dirty 时禁止恢复快照、且恢复请求不会发出”的行为。
  - 前端新增 `graphWorkspaceDraftRecovery` helper，并把 dirty 工作区按 graph 维度写入 `sessionStorage`，保存 `title` / `description` / `document` 与 `currentVersion`。
  - 同一图谱重新打开时，如果服务端 `currentVersion` 仍与本地草稿一致，则直接恢复本地未保存草稿并保持 `dirty` 状态；如果版本已变化，则清理 stale draft，避免把旧草稿静默盖回新 head。
  - 页面级与 helper 回归测试已锁定“同图谱 + 同版本可恢复、本地版本落后不可恢复”的行为。
  - 前端新增 `graphWorkspaceConcurrencySignal` helper，并按 `graphId + sessionId` 把当前窗口的 `dirty/currentVersion` 信号写入 `localStorage`，用于跨窗口冲突前置提醒。
  - 同图谱工作区现在会在检测到“另一窗口仍在编辑”时给出保存前提醒；若收到另一窗口已保存更高版本的信号，也会在当前页提示先刷新后继续编辑。
  - stale local draft 被放弃时，工作区不再静默回退到最新 head，而会明确告知“本地草稿基于旧版本，已放弃恢复并加载最新图谱”。
  - 图谱状态栏现在会在“另一窗口已保存更高版本”或“当前 batch-save 命中 `409 graph_version_conflict`”时提供 `重新加载最新图谱` 动作；dirty 状态下点击会先确认放弃未保存修改，再拉取服务端最新 head 并清理失败保存态。
  - dirty 冲突态下，页面会额外提供 `复制当前草稿 JSON` / `导出当前草稿 JSON`，把“先留存本地修改，再决定是否放弃并重载”变成显式路径，而不是让用户自己去工具栏里猜测下一步。
  - 在完整草稿 JSON 之外，冲突辅助卡片现在还支持 `复制冲突摘要` / `导出冲突摘要`，可直接带走一份人类可读的 Markdown 取舍报告，便于后续同步或人工合并。
  - 在已拿到最新 head 的前提下，冲突辅助卡片现在还支持 `复制最新图谱 JSON` / `导出最新图谱 JSON`，让本地草稿、服务端最新版本和可读摘要都能一起带走。
  - 在上述三类材料之外，冲突辅助卡片现在还支持 `导出冲突处理包`，把本地草稿 JSON、最新图谱 JSON 和可读摘要收口到单一文件里，便于稍后人工比对。
  - 冲突辅助卡片现在还会显式提示“确认放弃本地修改”与“稍后人工合并”两条典型路径，并在卡片内直接提供 `放弃本地并重载最新图谱`，减少用户来回寻找动作入口。
  - 一旦任意冲突材料已成功复制或导出，冲突辅助卡片现在会额外提示“已留存冲突材料，可安全重载最新图谱”，把“已经留好证据”这件事显式化。
  - 在已经留存材料后，冲突辅助卡片现在还支持显式标记 `先保留本地，稍后人工合并`，并提示“已标记为稍后人工合并，当前继续保留本地草稿”，让“这次先不重载”的取舍也有可见状态。
  - 图谱冲突辅助卡片现在还会基于“最后一次已同步成功的图谱基线”展示当前未保存修改摘要，先告诉用户自己到底改了什么，再决定是否留存或放弃。
  - 图谱冲突辅助卡片现在还会静默拉取服务端最新 head，并并列展示“与最新图谱相比”的差异摘要，让用户不只知道自己本地改了什么，还知道这些改动与最新版本之间的主要差异。
  - 差异摘要已从“只有数量”进一步细化到“数量 + 关键对象名”，例如直接提示新增/修改的是哪些节点、哪些标题不一致，降低用户看到摘要后还要自己回画布猜测的成本。
  - 新导出的冲突摘要和冲突处理包现在都会附带“建议的人工合并步骤”清单，把留存草稿、核对本地摘要、核对最新 head 差异和最终是否重载的顺序直接写进导出物。
- 冲突辅助卡片、冲突摘要和冲突处理包现在还会共享对象级 `node / edge / group` 差异明细，统一使用 `节点｜新增｜新概念` 这类文本格式，为后续对象级保留 / 舍弃操作打底。
- 冲突辅助卡片现在还允许对每条对象级明细标记 `保留本地 / 保留服务端 / 稍后处理`，这些取舍草稿会同步进入 Markdown 冲突摘要和冲突处理包的 `resolutionDraft` 字段。
- 冲突辅助卡片现在还支持 `应用已标记取舍到当前草稿`，会基于最新 head 生成一份继续保持 dirty、但已经对齐最新版本号的合并草稿，供用户直接继续保存。
- 在真正应用这些取舍前，前端现在还会执行最小跨对象依赖校验：若合并草稿会留下 dangling edge / invalid group node，会直接列出阻断问题并要求用户先补齐相关节点或改为保留服务端。
- 当只标记了部分对象级取舍时，冲突辅助卡片现在还会显式统计剩余未标记对象，并说明“如果现在直接应用，这些对象会默认沿用最新图谱版本”；同样的默认行为也会写入人工合并清单，减少误操作。
- 当依赖校验真的触发阻断时，冲突辅助卡片现在还会直接给出联动取舍建议，例如一键补齐本地依赖节点，或一键把问题对象改为保留服务端，避免用户回到对象列表逐项搜索。
- 当同一组阻断会生成多条联动取舍建议时，冲突辅助卡片现在还支持 `一键应用 N 项联动取舍建议`：先把当前建议整组落成对象级取舍标记，再由用户决定是否继续应用到最新 head，减少逐条点击的重复操作。
- 在批量标记这些联动建议后，工作区状态栏现在还会同步返回带预检结论的反馈：既解释这次标记里有多少“保留本地 / 保留服务端 / 稍后处理”，也明确告知当前是否已经解除依赖阻断、能否继续应用已标记取舍。
- 当阻断尚未完全解除时，这条批量反馈现在还会补一段精简的剩余阻断对象摘要，例如“连线“Local edge”会引用未保留的节点”，帮助用户更快判断下一步还需要继续调整哪些对象。
- 在真正应用已标记取舍前，冲突卡片里的“取舍依赖校验问题”区块现在也会直接显示同一套阻断摘要，让最终预检卡片与状态提示使用一致的阻断解释。
- 同一组“取舍依赖校验问题”的逐条明细标题现在也会优先显示可读对象名，而不是裸 `targetId`，减少用户在摘要与明细之间来回对照时的认知跳转。
- 冲突卡片现在还会额外展示“应用前预检”摘要：直接告诉用户如果现在应用，会保留哪些取舍，或会被哪些依赖问题阻断，把结果预览前移到最终点击之前。
- 这条“应用前预检”摘要现在还会进一步并入未标记对象的默认回退结果，直接说明还有哪些对象会沿用最新图谱版本，减少“点应用后才意识到未标记对象被回退”的落差。
- 这条“应用前预检”摘要现在还会再补一层代表对象示例，例如“保留本地：本地节点 / 保留服务端：旧关系”，让用户在最终点击前不只知道数量，也知道这轮取舍主要覆盖了哪些对象。
- 这些阻断摘要现在会优先展示校验器生成的对象级短原因；当 message 只是泛化短码时，才回退到 `targetId` 或 `ruleType`，避免预检只暴露内部 ID。
- 冲突辅助现在还会为 `invalid_source_target` / `invalid_node_size` 这类节点级阻断生成可执行建议：如果本地节点来源信息不完整或尺寸非法，可直接改为保留服务端，而不是只停留在错误说明；对应阻断 message 与建议文案也已统一为中文。
- `GraphWorkspaceConflictResolutionDependencies` 页面级回归现在还锁定了 `invalid_source_target` / `invalid_node_size` 两条真实操作路径：先标记保留本地，再通过联动“保留服务端”解除阻断，并重新允许应用已标记取舍。
- 联动取舍建议现在还会按对象差异的 `action` 判定真正的“保留 / 放弃”方向；当阻断来自 latest head 里仍存在的边或分组、而当前取舍试图沿用本地删除结果时，建议会正确改成“保留服务端节点”或“按本地删除结果处理该服务端对象”，不再把 `removed` 语义反向解释成继续 `keep-local`。
- 当用户应用已标记取舍后，工作区状态栏现在还会返回可解释的结果摘要，例如“保留本地 2 项 / 保留服务端 1 项 / 稍后处理 1 项（已沿用最新版本）”，降低多端合并后的不确定感。
- 验证：
  - `go test ./internal/modules/graph/service`
  - `go test ./internal/modules/graph/...`
  - `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
  - `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
  - `npm run verify:docs`
- 后续待续：
- 继续补更系统的多端 conflict handling，再将 `WB-032` 标记为完成；优先考虑更完整的对象联动策略、更多冲突类型的批量取舍辅助，以及把这类已能解释“已标记数量 + 代表对象 + 未标记默认回退 + 可读阻断原因 + 可读明细标题 + 中文节点级建议 + 节点级来源/尺寸阻断页面路径 + 多目标连线附加依赖节点 + latest-head 删除语义下的分组依赖 + latest-head 删除语义下的多目标连线路径”，且已被页面级冲突回归锁定并开始覆盖真实未标记回退操作路径的应用前预检继续扩展成更完整的合并预检反馈；当前固定入口为 `npm run verify:graph-conflicts`，并已纳入带真实 `graph_version_conflict` 处理路径、窄屏 smoke、布局预览与导出状态、权限路径的 `e2e/v1-graph-workspace.spec.ts`，测试映射集中在 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`。

### 执行记录：WB-031

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/graph/dto/graph.go`
  - 更新 `backend/internal/modules/graph/repository/repository.go`
  - 更新 `backend/internal/modules/graph/router/router.go`
  - 更新 `backend/internal/modules/graph/handler/handler.go`
  - 更新 `backend/internal/modules/graph/handler/handler_test.go`
  - 更新 `backend/internal/modules/graph/service/service.go`
  - 新增 `backend/internal/modules/graph/service/layout.go`
  - 更新 `backend/internal/modules/graph/service/service_test.go`
  - 更新 `frontend-user/src/api/types.ts`
  - 更新 `frontend-user/src/api/graphs.ts`
  - 更新 `frontend-user/src/api/graphs.test.ts`
  - 更新 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`
  - 新增 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/architecture/ARCHITECTURE.md`
  - 更新 `docs/architecture/GRAPH_API_LIFECYCLE.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 图谱 head 现已显式暴露 `thumbnailFileId`，把 MySQL `graphs.thumbnail_file_id` 从数据库字段提升为前后端共享摘要契约。
  - 后端新增 `POST /graphs/:id/layouts/preview`，将来源泳道布局从前端局部 helper 提升为统一 graph API 契约，并明确该接口只返回草稿 document、不推进版本。
  - 前端图谱工作区现优先调用 layout preview API 生成来源泳道，接口不可用时回退本地 helper，兼顾统一契约与本地容错。
  - 新增 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`，把 JSON/SVG/PNG 导出边界、缩略图 head 模型和布局预览任务模型集中收口。
- 已执行验证：
  - `go test ./internal/modules/graph/service ./internal/modules/graph/handler`
  - `go test ./internal/modules/graph/...`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace @studymate/graph-core run test`
  - `npm run verify:docs`
- 未执行验证及原因：
  - `npm run ci`：本轮聚焦 graph 导出/缩略图/布局契约收口，先执行与图谱后端、前端 API 和 graph-core 直接相关的验证集合。
- 兼容性 / 迁移说明：
  - 新增 layout preview endpoint 不改变现有 batch-save / restore / import 路由与返回结构。
  - 来源泳道布局现在优先走后端预览接口；若本地开发或异常环境下接口不可用，工作区仍会回退到前端本地 helper。
  - `thumbnailFileId` 作为新增只读字段暴露到图谱摘要层，不会破坏旧客户端读取已有 graph payload。
- 下一建议任务：
  - `WB-032` 自动保存/快照/冲突处理可靠性
  - 原因：布局与产物模型已经收口，下一步最需要处理的是 autosave、snapshot 恢复与多端/旧草稿冲突的可见性和恢复安全。

### 执行记录：WB-030

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 新增 `backend/internal/modules/graph/service/service_test.go`
  - 更新 `backend/internal/modules/graph/service/service.go`
  - 新增 `backend/internal/modules/graph/dto/document_contract.go`
  - 新增 `backend/internal/modules/graph/dto/document_contract_test.go`
  - 新增 `frontend-user/src/api/graphs.test.ts`
  - 新增 `docs/architecture/GRAPH_API_LIFECYCLE.md`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/architecture/ARCHITECTURE.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `CHANGELOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 新增图谱生命周期文档，统一说明 graph head、Mongo current document、snapshot、version 索引和 source relation 的职责边界与版本推进语义。
  - 后端 graph service 新增 create / batch-save / restore 生命周期测试，锁定创建即落 version 1、batch-save 推进 head 版本，以及 restore 以旧内容生成新 head 的行为。
  - `NormalizeDocumentPayload(...)` 现改为始终以服务端权威覆盖 `graphId` / `version`，避免 snapshot restore 或客户端旧 payload 把过期版本号写回 current document。
  - restore snapshot 现会基于恢复后的 document 重新计算 `graph.mode`，避免 MySQL graph summary 与 Mongo current document 语义漂移。
  - 前端新增 `graphs.test.ts`，锁定 batch-save、snapshots、restore、markdown/mermaid import、validate 和 template endpoint 的 path / method / payload 契约。
- 已执行验证：
  - `go test ./internal/modules/graph/dto ./internal/modules/graph/service`
  - `go test ./internal/modules/graph/...`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts`
  - `npm --workspace @studymate/graph-core run test`
  - `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm run verify:docs`
- 未执行验证及原因：
  - `npm run ci`：本轮聚焦图谱 lifecycle 契约、后端 graph 模块与前端 graph API/工作区回归，先执行了与工作包直接相关的验证集合。
- 兼容性 / 迁移说明：
  - 本轮不新增破坏性 endpoint，不调整 graph API path，只收口版本推进和 restore 语义。
  - 现有客户端即使传入旧 `document.version`，服务端也会统一改写为当前权威 head 版本，避免静默写回过期快照版本号。
- 下一建议任务：
  - `WB-031` 图谱导出、缩略图与布局能力
  - 原因：图谱现有 document/snapshot/version 生命周期边界已经收口，下一步可以在稳定契约上补 export artifact、thumbnail 和 layout 任务模型，而不是继续修补 head 语义。

### 执行记录：WB-023

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `packages/graph-core/src/file-format.ts`
  - 更新 `packages/graph-core/test/graphProductization.test.ts`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `CHANGELOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - graph-core 已补齐旧 `.smtg` 缺失 `schemaVersion` 的兼容导入回归测试
  - graph-core 已补齐数组 root / 非法 `document` 包装拒绝测试
  - history readable label / fallback label / past-future limit 已由 graph-core 用例锁定
- 已执行验证：
  - `npm --workspace @studymate/graph-core run test -- --testNamePattern="legacy root documents|graph history respects|graph history stores readable|round trips and rejects invalid schema"`
  - `npm --workspace @studymate/graph-core run test`
  - `npm --workspace frontend-user run test -- src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
  - `npm --workspace frontend-user run typecheck`
- 未执行验证及原因：
  - `npm run ci`：本工作包只触及 graph-core 解析与相关文档，先执行了图谱相关最小回归集合；完整流水线留给后续更大工作包统一跑
- 兼容性/迁移说明：
  - 旧版缺失 `schemaVersion` 的 StudyMate 图谱 JSON 现在按 v1 兼容导入
  - 显式未知 schema、数组 root 和非法 `document` 包装仍会被拒绝，不放宽坏 payload 边界
- 下一建议任务：
  - `WB-031` 图谱导出、缩略图与布局能力
  - 原因：graph/document/snapshot/version 生命周期已经收口，下一步适合继续补导出产物与布局任务能力，而不是继续在契约层反复兜底

### 执行记录：WB-001

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `CODEX_PROJECT_CONTEXT.md`
  - 更新 `CODEX_EXECUTION_ROADMAP.md`
  - 更新 `CODEX_BACKLOG.md`
  - 新增 `WB-001_BASELINE_AUDIT.md`
  - 更新 `.env.example` 草案
- 完成证据：
  - 已核验 `search`、`share`、CI workflow、前后端壳层拆分均真实存在
  - 已记录配置默认值风险和文档漂移
  - 已给出 CI 与搜索的文件级后续计划
- 已执行验证：
  - `git status --short`
  - 关键配置、脚本、CI 与执行文档内容核对
- 未执行验证及原因：
  - 无
- 已补执行验证：
  - `npm run verify:docs`
  - `npm run typecheck`
  - `npm --workspace @studymate/graph-core run test`
  - `cd backend && go test ./...`
  - `npm run test:user`
  - `npm run test:admin`
  - `npm run build:user`
  - `npm run build:admin`
- 兼容性/迁移说明：
  - 本工作包仅修改执行文档与 `.env.example`
  - 不改后端默认行为，不改 API，不改数据库结构
- 已知风险：
  - `backend/internal/config/config.go` 的危险 fallback 仍存在，需在 WB-002 处理
- 下一建议任务：
  - `WB-002` 环境变量与安全默认值收口

### 执行记录：WB-002

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/config/config.go`
  - 新增 `backend/internal/config/config_test.go`
  - 更新 `backend/internal/app/server.go`
  - 更新 `backend/cmd/migrate/main.go`
  - 更新 `backend/cmd/backfill-note-documents/main.go`
  - 更新 `.env.example`
  - 更新 `docs/DEVELOPMENT.md`
- 完成证据：
  - `JWT_SECRET` 与 `MYSQL_DSN` 不再有可直接运行的 fallback
  - `server` 启动阶段会显式校验 `MYSQL_DSN` 与 `JWT_SECRET`
  - `migrate` / `backfill-note-documents` 会显式校验 MySQL 配置
  - `.env.example` 默认不再启用管理员引导账号
  - 开发文档已改为专用数据库账号与显式环境变量示例
- 已执行验证：
  - `gofmt -w backend/internal/config/config.go backend/internal/config/config_test.go backend/internal/app/server.go backend/cmd/migrate/main.go backend/cmd/backfill-note-documents/main.go`
  - `cd backend && go test ./internal/config`
  - `cd backend && go test ./...`
  - `npm run verify:docs`
  - `npm run typecheck`
  - `cd backend && $env:JWT_SECRET=''; $env:MYSQL_DSN=''; go run ./cmd/server`
  - `cd backend && $env:MYSQL_DSN=''; go run ./cmd/migrate`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 运行时不再接受缺失的 `MYSQL_DSN` 或 `JWT_SECRET`
  - 依赖旧 fallback 的本地环境需要显式设置环境变量后再启动
- 已知风险：
  - 现有 CI 仍未显式校验 `gofmt`、secret scan 与更强质量门禁，需在 `WB-003` 处理
- 下一建议任务：
  - `WB-003` 在现有 CI 基础上补强最小质量门禁

### 执行记录：WB-003

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 新增 `scripts/check-go-format.mjs`
  - 新增 `scripts/check-config-safety.mjs`
  - 更新 `package.json`
  - 更新 `.github/workflows/ci.yml`
  - 更新 `playwright.config.ts`
  - 更新 `e2e/v1-admin-governance.spec.ts`
  - 更新 `docs/DEVELOPMENT.md`
  - 对 `backend/` 全量 Go 文件执行 `gofmt -w`
- 完成证据：
  - CI 新增显式 `gofmt` 检查与配置安全检查
  - 本地 `npm run verify:backend:format` 与 `npm run verify:config-safety` 通过
  - `npm run ci` 在当前工作区完整通过
  - Playwright 预览端口已收口为更稳的高位默认值，并支持环境变量覆盖
- 已执行验证：
  - `npm run verify:backend:format`
  - `npm run verify:config-safety`
  - `go test ./...`
  - `npm run test:e2e`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - `npm run lint` 现在会额外执行 Go 格式化检查与配置安全检查
  - Playwright 默认 preview 端口改为 `44173` / `44174`，如有自定义环境可通过 `PLAYWRIGHT_USER_PORT` 与 `PLAYWRIGHT_ADMIN_PORT` 覆盖
- 已知风险：
  - 依赖审计、覆盖率闸门和更完整 secret scan 仍未纳入默认 CI
- 下一建议任务：
  - `WB-004` 版本与里程碑文档对齐

### 执行记录：WB-004

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/planning/versions/v1.0.0-release.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 外层版本文档已同步记录 `WB-002` 的配置安全收口：`JWT_SECRET` 与 `MYSQL_DSN` 不再允许危险 fallback，启动与迁移命令要求显式配置。
  - 外层版本文档已同步记录 `WB-003` 的最小 CI 门禁：`verify:backend:format`、`verify:config-safety`、`npm run ci` 与 Playwright 默认端口 `44173` / `44174`。
  - README、路线图、版本计划、变更记录和 release checklist 对当前基线的描述已一致，不再把已完成的工程收口项写成待做事项。
  - 执行面已把下一优先级重新收口到 `WB-010` 统一搜索契约。
- 已执行验证：
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包仅修改文档与执行记录，不改后端逻辑、不改前端行为、不改 API 契约、不改数据库结构。
- 已知风险：
  - 默认 CI 现已纳入依赖审计与 secret scan，但覆盖率硬门槛仍未落到默认流水线。
- 下一建议任务：
  - `WB-010` 核验并固定统一搜索契约

### 执行记录：WB-010

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/search/service/service.go`
  - 更新 `backend/internal/modules/search/service/service_test.go`
  - 更新 `backend/internal/modules/search/handler/handler.go`
  - 更新 `backend/internal/modules/search/handler/handler_test.go`
  - 更新 `frontend-user/src/api/searchShare.test.ts`
  - 更新 `frontend-user/src/api/types.ts`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 省略 `types` 或传空值时，搜索会稳定回退到 `material/post/note/graph/card` 五组默认搜索，而不再错误返回空分组。
  - 非法 `types` 会在 service 层先返回 `400 invalid_search_type`，不会继续落到 indexer。
  - `limit` 缺省/非法时回退为 `20`，超上限时稳定钳制为 `50`。
  - 前端搜索 API DTO 已显式固定 `SearchResult.type` 与 `source` 的联合类型，开发文档和 README 已同步 `source` 表示来源域而不是底层存储。
- 已执行验证：
  - `go test ./internal/modules/search/service`
  - `go test ./internal/modules/search/handler`
  - `go test ./internal/modules/search/...`
  - `npm --workspace frontend-user run test -- src/api/searchShare.test.ts`
  - `npm --workspace frontend-user run typecheck`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未改路由路径与 grouped payload 结构，仅收紧 query 参数和返回字段约束。
  - 若外部调用方此前显式传 `types=` 空值，现在会按默认五组搜索；若传未知类型，将稳定得到 `400 invalid_search_type`。
- 已知风险：
  - 当前仍未处理各结果分组内部的排序质量、摘要裁剪一致性与更多可见性边界，这些属于 `WB-011` 与 `WB-012`。
- 下一建议任务：
  - `WB-011` 聚合搜索结果质量补强

### 执行记录：WB-011

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/search/service/indexer.go`
  - 新增 `backend/internal/modules/search/service/indexer_test.go`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - fallback 搜索现在会先抓取一小批候选，再按“标题命中优先、摘要命中次之、同级保留原始更新时间顺序”稳定排序。
  - 搜索摘要已统一为单行预览，并在超长时裁剪到 160 个字符以内，避免把整段正文直接暴露给搜索结果卡片。
  - 结果质量规则已由纯逻辑测试锁定，不依赖真实数据库即可回归排序和摘要裁剪行为。
- 已执行验证：
  - `go test ./internal/modules/search/service`
  - `go test ./internal/modules/search/...`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未修改搜索路由与 grouped payload 结构，只改善组内排序与摘要展示质量。
  - 同一组内仍以数据库返回的最新顺序作为同级 tie-breaker；更复杂的相关性模型仍留在后续索引升级阶段。
- 已知风险：
  - 当前尚未系统补齐私有笔记、私有图谱、未发布内容的权限矩阵测试，这属于 `WB-012`。
- 下一建议任务：
  - `WB-012` 搜索权限/可见性过滤与测试

### 执行记录：WB-012

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `backend/internal/modules/search/service/indexer.go`
  - 更新 `backend/internal/modules/search/service/indexer_test.go`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `README.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `docs/engineering/CODEX_BACKLOG.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - note / graph / card 三类搜索在匿名请求下会直接短路为空结果，不再依赖隐含查询条件。
  - material / post 搜索继续显式限定公开内容；graph 搜索补上 `status = active`，并仅允许“owner 或 public”结果进入候选集。
  - 权限过滤已由纯 `searchQuerySpec` 测试锁定，不依赖真实数据库即可回归核心可见性矩阵。
- 已执行验证：
  - `go test ./internal/modules/search/service`
  - `go test ./internal/modules/search/...`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未修改搜索路由与 grouped payload 结构，重点是收紧 fallback 搜索的可见性条件。
  - graph 搜索现在明确只返回 `active` 状态的 owner/public 图谱；如果历史数据依赖其他状态被搜到，需要显式迁移到 `active`。
- 已知风险：
  - 当前 `/api/v1/search` 仍然只有 grouped payload 与 `limit`，没有 offset/cursor；搜索页分页目前明确限定在“当前批次结果”内。
- 下一建议任务：
  - `WB-013` 用户端搜索页体验与回归补强

### 执行记录：WB-013

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 更新 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`
  - 新增 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx`
  - 更新 `frontend-user/src/styles/search-review.css`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 搜索页新增 URL 驱动的类型筛选，`types` 会与页面状态和 API 请求保持同步。
  - 搜索页补齐页面级回归测试，覆盖无关键词空态、后端错误态、类型筛选请求形状，以及结果来源链接与当前批次分页切换。
  - 每组结果当前批次最多拉取 `12` 条、每页展示 `4` 条，并在 UI 中明确说明这不是后端 offset/page 分页。
- 已执行验证：
  - `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx`
  - `npm --workspace frontend-user run typecheck`
  - `npm --workspace frontend-user run test`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包未修改 `/api/v1/search` 路由或 grouped payload 结构，只补用户端交互、状态同步和页面级回归。
  - 若后续需要跨批次真分页，应先扩展后端 offset/cursor 契约，再调整前端表现。
- 已知风险：
  - 当前分页仍受 `limit` 上限约束，更适合做“当前批次浏览”；当结果规模进一步增大时，仍需要后端分页或 cursor 方案。
- 下一建议任务：
  - `WB-014` 搜索文档与回归记录

### 执行记录：WB-014

- 执行日期：2026-07-01
- 执行分支/提交：`master` / 未提交
- 实际变更：
  - 新增 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`
  - 更新 `package.json`
  - 更新 `README.md`
  - 更新 `docs/DEVELOPMENT.md`
  - 更新 `docs/planning/ROADMAP.md`
  - 更新 `docs/planning/VERSION_PLAN.md`
  - 更新 `CHANGELOG.md`
  - 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
  - 更新 `PROJECT_LOG.md`
- 完成证据：
  - 搜索 API 契约、权限矩阵、用户端 URL/分页边界和自动化映射已集中沉淀到单一文档，不再分散依赖 README、开发文档和历史日志拼接理解。
  - 根脚本新增 `npm run verify:search`，把前端 API 测试、搜索页页面测试、后端 search 模块测试、搜索 smoke 和文档同步串成一个固定入口。
  - 该文档显式写明“当前分页只覆盖当前批次结果”，为后续 `SearchIndexer` 升级或后端真分页扩展保留清晰边界。
- 已执行验证：
  - `npm run verify:search`
  - `npm run verify:docs`
  - `git diff --check`
  - `npm run ci`
- 未执行验证及原因：
  - 无
- 兼容性/迁移说明：
  - 本工作包不修改 `/api/v1/search` 路由、grouped payload 结构或现有权限逻辑，只补集中化文档与脚本入口。
  - `test:search:e2e` 当前依赖用户端 build 与 Playwright public flow smoke；若后续拆分专门的搜索 smoke 文件，可保持 `verify:search` 入口不变。
- 已知风险：
  - 搜索专项验证已集中化，但后端仍未提供 offset/cursor 真分页；任何需要跨批次翻页的产品需求都不能只靠当前文档或前端分页实现。
- 下一建议任务：
  - `WB-020` 图谱文档模型与版本策略
