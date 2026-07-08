# StudyMate 前端能力矩阵

- **代码基线**：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- **工作包**：FE-00 前端现状审计与能力矩阵
- **状态**：FE-00 已冻结；FE-01 与 FE-02 已完成首轮实现，作为后续阅读、笔记、复习页面迁移的输入。
- **审计范围**：用户端 React 前端；2026-07-08 补充纳入前后台共享设计系统、API client 与管理端路由化缺口。

## 1. 结论

当前用户端的主要问题不是单一页面缺少组件，而是“统一三栏页面壳”被用于不同工作模式：资料库、阅读器、笔记、图谱、复习和 AI 的空间需求不同，却同时继承了全局主导航、顶部搜索和右侧 ContextPanel。

图谱页又在页面内部永久渲染图谱列表 / 来源 / 模板的左侧 Rail，以及节点详情、历史与冲突等上下文。这导致画布成为多个辅助区挤压后的剩余空间。FE-01 和 FE-02 必须先解决布局与信息架构，再继续增加图谱交互。

2026-07-08 PDF 评审补充：布局重构已经完成第一轮，但设计系统仍未真正成为共享能力。`frontend-user/src/styles/app.css` 与 `frontend-user/src/styles/ui-redesign.css` 存在同名 token 重复定义；`packages/ui`、`packages/api-client`、`packages/editor-core` 仍接近占位。后续 FE-040 / FE-041 / API-010 必须先把 token、状态协议、基础组件契约和 API 请求契约收成可复用底座。

## 2. 前端已识别能力与缺口

| 领域 | 已有用户端入口或能力 | 当前前端问题 | 目标布局 | 优先级 |
| --- | --- | --- | --- | --- |
| 全局导航 / 搜索 | 左侧导航、顶部搜索、登录状态、快速动作 | 所有路由共用同一 `ShellFrame`；侧栏文字与快速动作占用大量宽度；右侧 ContextPanel 含开发期说明文案 | `StandardLayout` 的可收缩导航；不同工作区不继承 ContextPanel | P0 |
| 资料库 | 资料导航、上传 / 阅读链路基础 | 详情和筛选不应永久侵占中屏空间；需要统一数据状态 | `StandardLayout`：列表优先，详情按需 Drawer | P1 |
| 阅读器 | 进度、书签、批注、来源联动基础 | 阅读区域不应被通用页面栏挤压；目录 / 批注需按任务打开 | `StudioLayout`：可折叠目录、正文、批注 / 摘录 | P1 |
| 笔记 | 富文本、版本、来源基础 | 编辑正文、来源、版本历史需要明确层次；开发期 ContextPanel 文案不应常驻 | `StudioLayout`：笔记列表、编辑器、Inspector | P1 |
| 图谱 | 创建保存、来源节点、模板、分组、搜索、导入导出、快照、冲突辅助等 | 左侧 Rail 三块内容永久展开；顶部说明过长；工具栏过密；全局右侧 ContextPanel 与内部检查器竞争画布空间 | `CanvasLayout`：已落地窄导航 + 抽屉资源区 + 最大化画布 + Tab 化 Inspector | P0 |
| 复习 | Deck / Card / 队列 / 回写基础 | 复习不应被全局工作区干扰；来源信息只在需要时显示 | `FocusLayout`：单任务、进度、卡片、评分动作 | P1 |
| AI 学伴 | AI 草稿、生成任务、卡片 / 图谱草稿基础 | 入口和草稿状态应嵌入阅读 / 笔记 / 图谱；不应依赖大量占位卡片 | 全局草稿队列 + 各工作区 Inspector Tab | P1 |
| 搜索 / 分享 / 社区 | 搜索、分享、社区入口基础 | 结果、空状态、筛选状态、来源跳转需要统一体验 | `StandardLayout` | P2 |
| 设计系统 / token | 用户端已有多套 CSS 变量与基础构件；共享包已建目录 | token 来源重复；前后台视觉契约未统一；`@studymate/ui` 仍接近空包 | `packages/design-tokens` 或等价共享来源 + `@studymate/ui` 基础组件契约 | P0 |
| API client / 会话 | 用户端 API 已按域拆分；后端有 refresh 接口 | 前后台 request/error/pagination/auth-session 未统一；401 refresh/replay/fail-logout 不完整 | `packages/api-client` core + auth session manager | P0 |
| 管理端治理 | 已接入真实 admin API 与治理工作台 | 仍主要集中在 `AdminWorkspaceView.vue`；模块 URL、详情抽屉、动作、审计与权限仍需治理化 | Vue Router 模块页 + shared table/filter/dialog/status | P1 |

## 3. 页面状态矩阵

每个主页面必须落实以下状态，而不是只实现“有数据的正常页面”。

| 页面 | Loading | Empty | Error | Unauthorized | Stale / Conflict |
| --- | --- | --- | --- | --- | --- |
| 资料库 | 骨架列表 | 无资料 + 上传引导 | 重试 / 错误详情 | 登录后访问私有资料 | 收藏、评分、上传结果刷新提示 |
| 阅读器 | 文档 / 页码骨架 | 无可读资料 | 加载失败 / 文件不可访问 | 私有资料无权限 | 进度、书签、批注同步失败 |
| 笔记 | 列表与编辑器骨架 | 新建笔记引导 | 保存失败 / 重试 | 私有笔记无权限 | 版本冲突、来源失效 |
| 图谱 | 画布占位与资源骨架 | 新建 / 从模板创建 | 加载、保存、导出失败 | 图谱无权限 | `409 graph_version_conflict`、草稿恢复 |
| 复习 | 队列加载 | 今日无卡片 | 提交失败 / 队列失败 | 登录 | 调度结果刷新 / 重复提交保护 |
| 搜索 | 结果骨架 | 无结果 + 优化建议 | 查询失败 | 私有结果隐藏 | URL 筛选和分页切换状态 |

## 4. FE-01 必须建立的共享构件

| 构件 | 用途 | 首批使用位置 |
| --- | --- | --- |
| `AppLayout` 路由元数据 | 按路由选择 Standard / Studio / Canvas / Focus | 全站 |
| `CompactNavigation` | 72px 图标导航；中小屏收起为触发器 | Canvas / Studio |
| `CommandBar` | 标题、保存状态、主操作、溢出操作 | 图谱、阅读、笔记 |
| `Drawer` | 左右侧辅助区按需展示；Esc / 焦点管理在 FE-020 接入实际抽屉时完成 | 图谱、资料库、阅读器 |
| `Inspector` | 右侧上下文容器，支持 Tabs、空状态和关闭 | 图谱、笔记、阅读器 |
| `DataState` | Loading / Empty / Error / Unauthorized / Stale | 所有数据页 |
| `ResponsivePanelPolicy` | 依据断点决定 panel 固定、抽屉或隐藏 | 全站 |

## 4.1 FE-040 / FE-041 新增共享底座要求

| 底座 | 当前问题 | 目标 |
| --- | --- | --- |
| Design tokens | `app.css` 与 `ui-redesign.css` 重复定义 `--bg-0`、`--surface`、`--accent`、`--radius-*`、`--sidebar-width` | 颜色、间距、字号、圆角、阴影、状态语义只有一个来源，用户端与管理端按同一 token 解释视觉语言。 |
| 页面状态协议 | 各页面仍有手写 loading / empty / error / unauthorized / conflict 展示 | 定义统一 `ResourceState` 或等价协议，所有数据页必须覆盖正常、加载、无内容、失败、无权限、保存失败、同步冲突和小屏状态。 |
| `@studymate/ui` | 当前只导出包名常量 | 至少沉淀 Button、IconButton、Input、Select、Tag、DataState、Drawer、Inspector、EmptyState、ConfirmDialog、CommandBar、PageHeader 的变体与状态契约。 |
| Drawer / Inspector | 已有基础容器，但仍需产品化状态 | 补遮罩、Esc 关闭、焦点锁定、焦点返回、滚动锁定、移动端尺寸策略和无障碍语义。 |
| API client | 用户端、管理端分别维护请求封装和错误处理 | 共享 request、error、pagination、upload、auth-session；前后台页面不再各自手写 fetch 和响应解析。 |

## 5. FE-02 图谱工作区布局契约

### 5.1 宽屏（>= 1600px）

- 全局导航为 72px 图标栏；不渲染全局 `ContextPanel`。
- 左资源区为 280px，可折叠，使用 `图谱 / 来源 / 模板` 三个 Tab。
- 右 Inspector 为 320px，可折叠，使用 `概览 / 检查器 / 历史 / 冲突 / AI` Tab。
- 画布为主区域，宽度不得低于 900px。

### 5.2 中屏（1280px - 1599px）

- 左资源区默认为关闭，触发后以 Drawer 打开。
- 右 Inspector 默认为关闭；选中节点时允许自动打开。
- 同一时刻最多一个大 Drawer 常驻，画布宽度不得低于 720px。

### 5.3 窄屏（1024px - 1279px）

- 不再维持三栏；只展示主画布和紧凑顶部命令栏。
- 资源、来源、Inspector、历史和冲突通过同一侧滑面板访问。
- 可以浏览、选择、查看来源、新建简单节点、保存；复杂批量排版、导入 / 导出、高级冲突合并使用桌面体验。

### 5.4 小于 1024px

- 默认以浏览与轻量编辑为主。
- 不允许固定两侧面板挤压画布。
- 弹出面板必须可关闭，且不阻塞保存 / 返回操作。

## 6. 不可破坏的图谱边界

布局重构不能改变以下现有协议与业务行为：

1. `GraphDocument` 及其 `schemaVersion` 兼容读取策略。
2. 保存、版本推进、快照恢复、来源 relation 和导入导出行为。
3. 后端 `409 graph_version_conflict` 冲突语义。
4. 本地草稿、冲突摘要、导出本地草稿、导出冲突处理包等既有能力。
5. `@studymate/graph-core` 中的纯数据 / 画布逻辑边界。

## 7. 实施顺序

1. **FE-01A**：新增 layout 类型与路由元数据；先保留旧 ShellFrame 作为 StandardLayout 的兼容实现。
2. **FE-01B**：抽出 `CompactNavigation`、`CommandBar`、`Drawer`、`Inspector`、`DataState` 和 design tokens。
3. **FE-02A**：图谱页切换到 CanvasLayout，移除全局 ContextPanel。
4. **FE-02B**：把 `GraphWorkspaceSourceRail` 拆为三类抽屉内容；把节点详情、历史和冲突迁入 Inspector Tabs。
5. **FE-02C**：收缩顶部 Header 与 toolbar；把低频操作迁移到“更多”菜单或快捷键。
6. **FE-02D**：做断点与视觉回归；完成后再把 WB-032 的冲突交互放入新 Inspector。

## 8. 验收标准

- `1920 × 1080`：图谱画布可用宽度 >= 900px。
- `1440 × 900`：图谱画布可用宽度 >= 720px；资源区与 Inspector 不同时永久挤压画布。
- `1280 × 800`：左右辅助区可以抽屉化；保存、选中、来源查看、撤销重做和导出入口可达。
- 全局 `ContextPanel` 不出现在图谱路由。
- 图谱工具栏不再含长篇产品说明；标题、保存状态、主操作在顶部 CommandBar 内清晰可见。
- 所有主页面均具备 Loading、Empty、Error、Unauthorized 与 Stale / Conflict 的明确 UI 策略。
- 任何新页面不得重新定义颜色、圆角、按钮、标签、状态提示和加载/错误/空态规则；若确需新增 token 或变体，应先更新共享 token / UI 契约。
