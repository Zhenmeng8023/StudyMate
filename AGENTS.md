# StudyMate · Codex 执行规则

> 本文件是仓库级长期约束。开始任何改动前，先阅读：
> - `docs/engineering/CODEX_PROJECT_CONTEXT.md`
> - `docs/engineering/CODEX_EXECUTION_ROADMAP.md`
> - `docs/engineering/CODEX_BACKLOG.md`
> - 仓库现有 `README.md`、`PROJECT_LOG.md`、`docs/architecture/*`

## 1. 产品主线

StudyMate 是学习闭环平台，不是单纯的图编辑器。核心主线是：

`资料/阅读 → 批注 → 笔记 → 图谱 → 卡片复习 → AI 辅助理解 → 学习反馈`

图谱是组织知识与承接学习反馈的中心，但不得为了“对标图编辑器”而削弱学习语义。

## 2. 当前阶段与优先级

当前可视状态：平台基础、社区/资料、阅读-笔记闭环、图谱 MVP、卡片复习 MVP 已存在；项目正处于 **Phase 5（图谱产品化）完成一部分，并为 Phase 6（AI/复习深化）预埋能力** 的阶段。

严格优先级：

1. P0：安全与配置、CI/测试、文档里程碑对齐、最小统一搜索。
2. P0：图谱内核抽离、图谱 API 生命周期补齐、图谱可靠性。
3. P1：后台治理去占位化、图谱-复习闭环、搜索升级。
4. P2：双链/反链与知识库增强。
5. P3：PlantUML/SQL/OpenAPI 工程图、代码分析、Tauri、课程/协作。

未完成 P0/P1 前，不新增大范围课程、作业、团队协作、移动端/PWA 等新域模块，除非用户明确改变路线。

## 3. 代码库边界

已知主要目录：

```text
backend/                       Go + Gin + GORM
  internal/modules/            admin, ai, auth, card, community, file,
                               graph, material, note, reader, user
frontend-user/                 React + Vite + Zustand
frontend-admin/                Vue 3 + Vite + Element Plus
packages/graph-core/           图谱共用能力的起点
docs/architecture/             架构与数据设计
```

### 必须遵守

- 后端维持模块边界：每个新增域能力必须放入明确 module，不允许把跨域业务继续堆进 `server.go`。
- 图谱领域逻辑优先进入 `packages/graph-core` 或其后续拆分包；页面层只承担组合、绑定与展示。
- 不允许继续扩大 `frontend-user/src/app/App.tsx` 或 `frontend-admin/src/App.vue` 的职责。新增页面/复杂能力应拆分到模块目录、hooks、components、api、stores、types。
- API 请求、DTO、领域类型、纯算法、UI 组件必须分层；禁止一个页面同时持有所有状态、业务规则和网络请求。
- 未经验证不能删除既有接口、迁移表字段或改变外部契约；破坏性变更必须提供兼容策略或迁移说明。

## 4. 每次执行前的流程

1. `git status`，确认工作区状态；不要覆盖用户未提交修改。
2. 阅读关联路由、handler、service、repository、migration、前端调用点和已有测试。
3. 先给出“本次工作包”的范围、影响文件、依赖与验收标准；范围不清时，选择最小安全实现并明确假设。
4. 先写/更新测试或至少定义可执行的验证步骤，再修改业务代码。
5. 保持小步、可回滚的变更；一个工作包只解决一个明确目标。
6. 完成后运行对应格式化、类型检查、单元测试、构建与必要的集成验证。
7. 修改或新增后端业务能力时，必须同步评估前端可见入口、状态展示、错误提示和验收路径；除纯内部重构/安全修复外，前端进展不得落后于后端实现，后端接口不能长期停留在“有 API 但无页面可验收”的状态。
8. 更新 `CODEX_BACKLOG.md` 对应条目状态，并在最终回复中报告：改了什么、为什么、验证结果、未解决风险、建议的下一个工作包。

## 5. 质量门禁

### 后端（Go）

- `gofmt` 必须通过。
- 修改模块后至少运行相关 `go test ./...` 或更窄范围测试；没有测试时应补关键 service/handler 的测试。
- 所有 API 必须验证身份、资源归属与输入合法性；管理员 API 必须显式角色校验。
- 任何异步/跨存储写入必须定义失败补偿、幂等键或可恢复状态。
- 不得把 JWT 密钥、数据库密码、AI Key 写入默认生产配置或提交到仓库。
- 面向用户或管理员的新/改 API 必须说明对应前端页面、组件、交互状态和验收方式；如果本工作包暂不补前端，必须在 `PROJECT_LOG.md` 记录原因、风险和最近补齐任务。

### 用户端（React）

- TypeScript 不能引入隐式 `any`、重复 DTO 或无边界状态。
- 新增图谱行为优先放入 hook/store/core；组件保持可测试的输入输出边界。
- 影响阅读/笔记/图谱/复习闭环时，至少验证一条端到端用户路径。

### 管理端（Vue）

- 禁止新增仅有“即将上线/占位”而没有数据契约的管理菜单。
- 去占位化时先补后端只读列表/统计 API，再补页面，再补编辑/审批操作。
- 所有管理操作应能进入审计日志或至少保留可追溯事件。

## 6. 图谱领域的实现原则

图谱必须逐步形成独立、可测试的编辑器内核，至少拥有以下明确状态模型：

- `GraphDocument`：节点、边、分组、元数据、schema version。
- `ViewportState`：缩放、平移、适配视图。
- `SelectionState`：单选、多选、框选、焦点。
- `HistoryState`：命令式撤销/重做，具备事务合并能力。
- `ImportExport`：统一入口，明确格式、版本和错误报告。
- `GraphValidation`：结构校验、孤立节点/非法边/循环规则等。
- `Persistence`：草稿/自动保存/快照/冲突处理/恢复。

不要把 `project-graph` 当作需要复制的产品；仅借鉴其编辑器内核分层、工具链和工程治理方式。

## 7. 文档与提交规则

- 功能完成时同步更新 README、PROJECT_LOG 或对应 docs；不要让代码版本领先文档。
- 提交按功能边界拆分，建议 Conventional Commits：`feat:`、`fix:`、`refactor:`、`test:`、`docs:`、`chore:`。
- 禁止单个提交同时混入大规模重构、多个无关功能和格式化噪声。
- 每个 PR/工作包必须附带验收清单与回归说明。

## 8. 不确定时的决策顺序

优先按如下顺序决策：

1. 数据安全与兼容性；
2. 当前学习闭环完整性；
3. 模块边界与可测试性；
4. 性能与用户体验；
5. 新功能广度。
