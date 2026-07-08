# StudyMate 前端布局重构规格（FE-01 / FE-03）

- **基线**：`master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- **设计目标**：从单一三栏页面壳升级为面向学习任务的多工作模式布局。

## 1. 路由布局映射

| 布局 | 路由 | 设计目标 |
| --- | --- | --- |
| `StandardLayout` | `/`、`/materials`、`/search`、`/community`、`/settings`、`/ai` | 信息浏览、列表检索、轻量操作 |
| `StudioLayout` | `/reader/*`、`/notes/*` | 内容优先；来源、目录、批注和历史按需打开 |
| `CanvasLayout` | `/graph/*` | 画布优先；工具与上下文不常驻挤压画布 |
| `FocusLayout` | `/review/*` | 单任务复习；降低导航与信息噪声 |

## 2. 建议文件结构

```text
frontend-user/src/
├── app/
│   ├── chrome/
│   │   └── CommandBar.tsx
│   ├── layouts/
│   │   ├── AppShell.tsx                # FE-01 多布局编排实现
│   │   └── layoutPolicy.ts             # 路由到布局模式的纯策略
│   ├── navigation/
│   │   ├── CompactNavigation.tsx
│   │   └── PrimaryNavigation.tsx
│   └── shell/
│       └── ShellFrame.tsx              # 过渡期兼容层，已瘦身
├── design-system/
│   └── primitives/
│       ├── Drawer.tsx
│       ├── Inspector.tsx
│       └── DataState.tsx
├── styles/
│   └── layouts.css                     # FE-01 布局与基础构件样式
└── modules/
    └── graph/
        └── components/
            ├── GraphWorkspaceCanvasChrome.tsx # 命令栏、资源/检查器 Tabs
            ├── GraphWorkspaceOverviewPanel.tsx
            └── GraphWorkspaceShell.tsx         # 图谱、来源、模板的领域内容
```

> **实现状态**：FE-01 已通过 `AppShell + layoutPolicy` 提供四类布局策略。FE-02 已在图谱模块内部落地 `GraphWorkspaceCanvasChrome`：左侧资源区和右侧检查器已按 Tab 拆分，宽屏并列、中小屏覆盖式 Drawer，不再使用旧的三栏固定网格。FE-03 已将同一“主内容优先、上下文按需打开”的原则应用到阅读、笔记与复习。

## 3. CanvasLayout API 草案

```ts
export type CanvasPanelState = "open" | "closed";

export type CanvasLayoutProps = {
  navigation: ReactNode;
  commandBar: ReactNode;
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  children: ReactNode;
  leftPanelState: CanvasPanelState;
  rightPanelState: CanvasPanelState;
  onLeftPanelChange: (state: CanvasPanelState) => void;
  onRightPanelChange: (state: CanvasPanelState) => void;
};
```

布局组件不得掌握图谱 document、保存、版本、节点选择或导入导出业务状态；它只负责区域、断点、焦点和抽屉可见性。

## 4. 图谱面板职责

### 左资源 Drawer

- **图谱**：最近图谱、我的图谱、图谱搜索、新建。
- **来源**：资料、笔记、批注 / 摘录；支持点击插入，FE-02 后段支持拖入画布。
- **模板**：学习闭环与工程图模板；使用“预览 / 追加 / 替换”明确操作。

### 右 Inspector

- **概览**：节点、连线、来源统计与最近保存信息。
- **检查器**：节点、连线、分组或空画布的上下文编辑。
- **历史**：快照、版本、恢复入口。
- **冲突**：本地草稿、服务端 head、差异摘要、导出与重载。
- **AI**：草稿、应用前预览与拒绝记录。

## 5. 命令栏信息层级

```text
左侧：返回 / 图谱标题 / 只读或共享状态
中部：保存状态（已保存、未保存、保存中、冲突）
右侧：保存（主操作） / 分享 / 导出 / 更多
```

以下操作应从常驻工具栏迁移到溢出菜单、快捷键或上下文菜单：

- JSON / SVG / PNG 导出；
- 快捷键指南；
- 低频布局操作；
- 低频节点类型选择；
- 全局帮助说明。

## 6. 断点策略

```css
--bp-canvas-wide: 1600px;
--bp-canvas-desktop: 1280px;
--bp-tablet: 1024px;
--bp-mobile: 720px;
```

- `>= 1600px`：左资源区、画布、右 Inspector 可并列。
- `1280px - 1599px`：两侧面板至少有一个默认 Drawer 化。
- `1024px - 1279px`：两侧面板均 Drawer 化。
- `< 1024px`：浏览 / 轻量编辑模式；不提供固定多栏。

## 7. 迁移约束

- 不一次性删除现有样式；新布局使用明确命名空间或 CSS Modules，旧样式逐页迁移。
- 不在 `graph.css` 中继续新增非图谱页面样式。
- `GraphWorkspacePage` 的领域逻辑不因布局重构被复制；通过 props / hooks 接入新的 panel 状态。
- 每迁移一个页面先补组件测试，再做 Playwright 视觉回归。


## 9. FE-02 实现记录

- `/graph` 顶部已改为紧凑命令栏，包含图谱标题、保存状态、保存和左右 Dock 开关。
- `GraphWorkspaceSourceRail` 已保留其数据和事件边界，但改为 `图谱 / 来源 / 模板` 按 Tab 单独渲染。
- 原始右侧长列表改为 `概览 / 属性 / 来源 / 历史 / 导入 / 冲突` 检查器 Tab；冲突卡不再占据画布上方空间。
- 宽度低于 `1600px` 时，资源与检查器覆盖画布外层而不改变画布列宽；低于 `760px` 时两者改为固定全屏近似抽屉。
- FE-02 没有改变 `GraphDocument`、版本冲突、快照、导入导出、来源 relation 或 `@studymate/graph-core` 纯逻辑。


## 10. FE-03 实现记录

- `/reader` 已从固定资料栏 / 阅读区 / 批注栏改为 `资料 Dock + 阅读舞台 + 批注 / 书签 / 草稿 Inspector`；窄屏时 Dock 覆盖内容区而非压缩 PDF。
- `/notes` 已从笔记列表和编辑器下方堆叠的信息块改为 `笔记库 Dock + 富文本编辑器 + 来源 / 历史 / 复习 Inspector`。
- `/review` 已采用 FocusLayout 的单任务舞台：翻面和评分为主流程，Deck / Card 管理移入按需打开的管理 Dock。
- FE-03 未改变阅读进度、批注、笔记版本、Deck/Card、SM-2、AI 草稿或图谱数据契约；它只调整前端区域、信息层级和响应式行为。
- 新增样式文件 `frontend-user/src/styles/studio-workspaces.css`，后续非图谱页面不得继续向 `graph.css` 追加样式。
