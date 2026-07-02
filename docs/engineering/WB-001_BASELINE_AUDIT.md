# WB-001 基线核验报告

**执行日期：2026-07-01**  
**执行分支：`master`**  
**范围：只核验真实基线、更新执行文档与 `.env.example` 草案，不改运行时业务逻辑。**

## 1. 工作区状态

执行前 `git status --short` 结果显示工作区非干净：

- `M backend/go.mod`
- `?? AGENTS.md`
- `?? docs/engineering/`

本次未回退或覆盖上述现有变更，只在 `docs/engineering/` 与 `.env.example` 范围内工作。

## 2. 当前分支真实基线

### 2.1 代码结构

- 后端模块实存：`admin`、`ai`、`auth`、`card`、`community`、`file`、`graph`、`material`、`note`、`reader`、`search`、`share`、`user`。
- 用户端根入口已拆分：`frontend-user/src/app/App.tsx` 当前仅作导出，主路由在 `routes.tsx`。
- 管理端根入口已拆分：`frontend-admin/src/App.vue` 仅挂载 `AdminWorkspaceView`。
- 图谱共享包 `packages/graph-core` 已独立存在，并带 `node --test` 测试脚本。

### 2.2 构建与测试命令

根目录 `package.json` 已提供：

- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
- `npm run test:user`
- `npm run test:admin`
- `npm run test:e2e`
- `npm run test:coverage`
- `npm run verify:docs`
- `npm run ci`
- `cd backend && go test ./...`

### 2.3 CI 现状

`.github/workflows/ci.yml` 已存在并执行：

- Node 24 + `npm ci`
- Go 1.26
- 前后端 typecheck
- 用户端与管理端 build
- 用户端与管理端 Vitest
- `@studymate/graph-core` test
- Playwright Chromium 安装与 E2E
- 后端 `go test ./...`
- `npm run verify:docs`

结论：CI 不是“缺失”，而是“已有基础流水线，尚需补强质量闸门”。

### 2.4 配置与安全风险

`backend/internal/config/config.go` 当前仍存在可运行型 fallback：

- `JWT_SECRET=change-me-in-local-env`
- `MYSQL_DSN=root:123456@tcp(127.0.0.1:3306)/studymate?...`

原 `.env.example` 也存在以下风险：

- 示例 MySQL DSN 使用 root 与明文弱口令；
- 示例管理员引导密码为固定值；
- 未显式列出 `MONGO_TIMEOUT`、`REDIS_TIMEOUT`、`NOTE_READ_MODEL` 等已被代码消费的环境变量。

### 2.5 文档漂移

本轮确认以下执行文档与代码不一致：

- `docs/engineering/CODEX_PROJECT_CONTEXT.md` 仍写“搜索后端缺失”“CI 不足”“前端根文件过大”。
- `docs/engineering/CODEX_EXECUTION_ROADMAP.md` 仍把“新建 search module”“建立 CI”写成未开始任务。
- `docs/engineering/CODEX_BACKLOG.md` 仍把 WB-001 标为 `TODO`，且搜索/CI 任务定义落后于现状。

README、架构文档和 `PROJECT_LOG.md` 基本能反映当前主线，但工程执行文档明显落后。

## 3. 本次已完成的文档收口

- 更新 `docs/engineering/CODEX_PROJECT_CONTEXT.md`，纠正已过期判断。
- 新增本报告 `docs/engineering/WB-001_BASELINE_AUDIT.md`，固定 2026-07-01 基线。
- 更新 `docs/engineering/CODEX_EXECUTION_ROADMAP.md`，把后续任务从“创建能力”改为“补强现有能力”。
- 更新 `docs/engineering/CODEX_BACKLOG.md`，将 WB-001 标为已核验并补执行记录。
- 更新 `.env.example` 为更安全的示例值，并补全当前代码已读取的环境变量。

## 4. 后续文件级计划

### 4.1 CI / 质量门禁

说明：按当前 backlog 编号，对应 `WB-003`。

建议最小落点：

- `.github/workflows/ci.yml`
  把已有流水线补成显式质量门禁，优先增加 `gofmt`、更明确的命令分层和失败定位。
- `package.json`
  如有必要，补前端 lint / 审计 / 更细粒度 verify 脚本，但避免把本轮未核实的重型检查直接塞入默认 CI。
- `backend/`
  视实际情况补 `gofmt` 校验脚本或在 workflow 内直接执行。
- `docs/DEVELOPMENT.md`
  同步说明本地与 CI 的标准检查顺序，减少“本地能跑、CI 失败”的落差。

### 4.2 最小统一搜索

说明：按当前 backlog 编号，不再是主提示词中的“从零 WB-003”，而是现有 `WB-010` 到 `WB-014` 的补强工作。

建议最小落点：

- `backend/internal/modules/search/service/`
  先核对 DTO、过滤参数、权限过滤和 fallback indexer 行为是否覆盖资料/笔记/图谱/帖子四类结果。
- `backend/internal/modules/search/handler/`
  补 query 参数校验、错误响应与分页边界测试。
- `frontend-user/src/`
  核对搜索页是否已经完全走后端 API，必要时补空态、错误态与来源跳转回归。
- `docs/`
  为 `GET /api/v1/search` 补当前契约说明，避免 README、路线图与实际路由再次漂移。

## 5. 结论

WB-001 的核心结论不是“项目缺少搜索和 CI”，而是：

1. 搜索、分享、CI、后台治理和前端壳层拆分都已经存在。
2. 当前 P0 真正需要做的是安全默认值收口、CI 质量闸门补强、执行文档追平代码。
3. 后续搜索任务应进入测试与契约补强阶段，而不是重新立项从零实现。
