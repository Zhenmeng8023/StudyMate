# StudyMate 项目记录

> 记录规则：项目主要语言为汉语。每完成一个独立任务，就把完整结果追加到本文档开头。每条记录必须包含时间、项目版本编号、任务内容、完成结果、验证结果和后续影响。

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
