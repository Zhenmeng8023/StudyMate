# 学伴图谱 v1.0 路线图

## 当前执行备注

- A 阶段补齐 `NOTE_READ_MODEL` 文档、覆盖率脚本和 `zh-CN` / `en-US` 字典框架后进入提交门禁。
- 覆盖率命令为 `npm run test:coverage`；每个里程碑仍必须先通过 `npm run ci`。
- B 阶段从超大文件继续拆分，优先处理图谱控制器、用户端 API client 和全局样式。
- B 阶段第一批已完成 API client 域拆分、CSS 分层和图谱 helper 抽取；图谱交互 hook 后续随 C 阶段继续下沉。
- C 阶段先完成 reader/notes 数据收口：历史笔记可回填到 Mongo，批注坐标具备兼容字段，来源信息可在阅读器侧展示。

本路线图已完成 `v1.0.0` 本地发布标签，当前用于指导 v1.1 质量硬化和后续设计方案推进。详细拆解见 [VERSION_PLAN.md](VERSION_PLAN.md)，版本说明位于 [versions](versions) 目录。

## v1.1 当前里程碑：产品质量与测试硬化

目标：不扩大 v1 范围，先把 search/share/admin/review/AI 这些新增入口变成可回归、可审计、可继续重构的质量基线。

交付：

- 用户端 search/share API 合约测试。
- 用户端 review/AI API 合约测试，已覆盖复习闭环和图谱变更草稿确认请求形状。
- 用户端 ReviewWorkspace 页面级复习回写测试。
- 用户端 AiPage 页面级 AI 卡片/图谱草稿确认测试。
- 管理端治理页真实 API 加载回归测试。
- 后端 search/share/admin/review/graph/AI 继续补 handler/service 测试；当前已补 search/share/admin/card/graph/AI handler 边界测试。
- 后端 search service 已抽出 `SearchIndexer` 边界，默认保持 MySQL fallback；后续 adapter 切换不作为当前阻塞项。
- Reader 链路已补到用户端 API 合约、`ReaderPage` 书签/批注来源回归，以及后端 `reader/handler`、`reader/service` 的鉴权、请求体、资料可见性和批注选择边界测试，后续继续向 notes 来源追踪闭环推进。
- 图谱工作区已开始把 `useGraphWorkspaceController.tsx` 的 history/autosave/undo-redo 状态迁到独立 helper，并新增状态回归测试锁定行为。
- 图谱导出、缩略图与布局契约已进一步收口：JSON/SVG/PNG 导出边界集中在 `graphFileImportExport.ts`，graph 摘要显式暴露 `thumbnailFileId`，来源泳道布局新增统一 `POST /graphs/:id/layouts/preview` 预览接口。
- Playwright 当前已覆盖公共壳层、搜索、分享只读页、复习队列回写和后台治理用户模块，并通过测试内 API 拦截降低本地后端耦合。
- 配置安全第一轮收口已完成：`JWT_SECRET`、`MYSQL_DSN` 不再回退到危险默认值，后端启动和迁移命令会显式校验关键环境变量。
- 最小 CI 质量门禁已完成：`gofmt` 检查、配置安全回归检查、Vitest、Playwright、Go test 与文档同步已纳入默认 `npm run ci`。

完成标志：

- v1 新增公共接口至少有一层自动化保护。
- 每个测试硬化里程碑继续同步 README、开发说明、版本计划、路线图、变更记录和项目日志。
- `npm run ci` 持续通过。

## 发布范围

`v1.0.0` 只覆盖：

- Web 主站
- Web 后台
- 后端 API

不作为 1.0 阻塞项：

- 课程/LMS
- Tauri 桌面端
- 多人实时协作
- PWA 离线
- 向量搜索
- 复杂调度算法

本地化策略：`zh-CN` 是源语言；`en-US` 先搭建占位字典框架，发布前不要求完整翻译。

## A. 工程基线与文档治理

目标：先让版本治理、CI 入口、文档树和真实项目状态对齐。

交付：

- README 当前阶段改为真实状态。
- `docs/design/UPGRADE_DESIGN.md` 成为设计主入口，根目录设计说明保留兼容链接。
- `docs/planning/VERSION_PLAN.md` 补齐 v1.0 阶段、取舍和性能预算。
- `CHANGELOG.md`、`PROJECT_LOG.md`、PR 模板、CI 和文档同步脚本进入版本管理。
- 每个里程碑都运行完整测试并提交。
- 当前进一步补强：`gofmt` 和配置安全回归已纳入默认门禁，危险 fallback 已从后端配置层移除。

完成标志：

- 文档同步脚本通过。
- README、开发说明、版本计划、路线图、变更记录和项目日志一致。
- Node 24 / Go 1.26 CI 基线覆盖前后台构建、Vitest、Playwright、图谱核心测试、后端测试和文档同步。
- 当前 CI 已纳入依赖审计与仓库级 secret scan，剩余主要增强项收敛为覆盖率硬门槛与覆盖率汇总治理。

## B. 拆分超大文件

目标：降低主应用、图谱工作区和后台入口的维护风险。

交付：

- `frontend-user/src/app/App.tsx` 拆到 `routes.tsx`、`shell/*`、`pages/*`、`features/*`。
- `GraphWorkspacePage.tsx` 拆到 `state/`、`components/`、`hooks/`、`lib/`、`exporters/`、`importers/`。
- `frontend-admin/src/App.vue` 拆到 `router/index.ts`、`views/*`、`components/admin/*`。
- 业务组件单文件不超过 500 行；复杂画布组件不超过 800 行；通用类型独立文件化。

完成标志：

- 行为保持一致。
- 类型检查、构建、图谱核心测试和后端测试通过。
- 三个旧入口文件不再承载完整业务实现，后续新增能力必须落入拆分后的目录边界。

## C. 阅读/笔记与图谱收口

目标：把已经存在的主链路变成 1.0 可发布质量。

阅读/笔记：

- 新增 `NOTE_READ_MODEL` 特性开关。
- 支持 `mysql_primary` 与 `mongo_primary` 两套读取策略。
- 回填历史 `notes.content` 到块文档。
- 接通 `pdf_annotation_documents` 坐标、跨页高亮与书签回写。
- UI 明确显示笔记来自哪条批注、哪份资料、哪个 PDF 页。

图谱：

- 保留搜索定位、来源泳道、来源摘要、AI 落点预览、Markdown/Mermaid 导入、PNG/SVG 导出。
- 新增图谱模板、验证规则面板、autosave/dirty 策略、Undo/Redo 边界、来源反链、键盘可达菜单、无障碍标签和设置面板。
- 当前优先从 history/autosave/undo-redo 状态机继续拆分大控制器，再沿同一边界下沉数据加载、交互和设置面板逻辑。
- 当前布局能力已从前端局部 helper 提升为统一 preview API，下一步重点转向 autosave、snapshot 和冲突处理可靠性，而不是继续分散补局部布局逻辑。
- 增加 200 节点、300 边、20 分组的性能回归用例。

完成标志：

- 用户能从资料阅读、批注、笔记进入图谱，并看见可信来源链。
- 图谱打开、拖动、保存、导出在性能预算内可用。

## D. 复习/AI、搜索、后台治理与分享

目标：补齐学习闭环和最小治理面。

复习/AI：

- 调度接口可替换，1.0 采用 SM-2 基线。
- Deck/Card CRUD、到期队列、复习记录、结果回写完整。
- 笔记/批注/图谱/资料到 AI 草稿，再到卡片或图谱的确认流打通。
- 后台增加 AI 用量、队列、失败任务和配额界面。

搜索/治理/分享：

- `/search` 做跨实体聚合搜索，先 MySQL fallback，再抽象 Meilisearch adapter。
- 后台用户、举报、标签、AI、审计、文件治理从占位变为可操作模块。
- 支持私有、公开、分享链接三种基础分享模式和只读页。

完成标志：

- 新用户能完成资料阅读、笔记沉淀、图谱组织、AI 草稿确认、卡片复习和分享。
- 管理员能处理核心治理任务。

## E. 发布与回滚

目标：让 `v1.0.0` 可部署、可演示、可回滚。

交付：

- 发布清单、环境变量清单、迁移顺序、回滚步骤。
- 演示数据与验收脚本。
- 安全、性能、文件访问、AI 用量和后台权限基础检查。
- `CHANGELOG.md` 标记 `v1.0.0`。

完成标志：

- CI 全绿。
- 完整测试通过。
- 文档可以指导第三方启动、演示和回滚。

## D 阶段当前完成

- 复习调度已形成 `Scheduler` 接口，v1 默认 SM-2 不再直接绑死在服务方法中。
- `/api/v1/search` 已提供 MySQL fallback 分组搜索，用户端搜索页改为后端搜索；省略 `types` 时默认覆盖 `material/post/note/graph/card` 五组，未知类型返回 `400 invalid_search_type`，`limit` 最大钳制为 `50`；搜索页现支持 URL 类型筛选、来源跳转和当前批次内分页切换，并已有集中化的搜索契约/回归矩阵文档与 `npm run verify:search` 入口。
- 搜索 fallback 组内现已按“标题命中优先、摘要命中次之”的规则稳定排序，并把长摘要压缩为单行 160 字符内预览。
- 搜索 fallback 的权限矩阵已显式固定：匿名请求只实际搜索资料与社区，graph 结果仅允许 `active` 且 owner/public 的图谱进入候选集。
- `/api/v1/share-links` 与 `/api/v1/share/:token` 已提供 generic share link 和只读解析页。
- 管理后台 users/reports/tags/AI/audit/files 模块已经从占位入口升级为真实 API 数据面。

## E 阶段当前完成

- v1.0.0 发布清单、环境变量矩阵、迁移顺序、演示数据步骤、回滚步骤和非阻塞项已集中到 `docs/planning/versions/v1.0.0-release.md`。
- `CHANGELOG.md` 已标记 `v1.0.0 - 2026-06-01`；最终只创建本地 tag，不推送远端。
