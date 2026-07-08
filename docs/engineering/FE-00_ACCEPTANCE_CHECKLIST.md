# FE-00 验收清单

## 基线

- [x] 已固定 `master@7b1e8f3a1e77dded69538d075758dc9529b31564`。
- [x] 已识别用户端入口为 React + BrowserRouter，根组件位于 `frontend-user/src/app/App`。
- [x] 已识别全局 `ShellFrame` 具有固定主导航、顶部栏和 `ContextPanel`。
- [x] 已识别图谱页具有独立 Header、左侧 SourceRail 和密集 Toolbar。

## 交付物

- [x] `FRONTEND_CAPABILITY_MATRIX.md`：领域能力、缺口、状态矩阵与验收标准。
- [x] `FRONTEND_LAYOUT_REFACTOR_SPEC.md`：多布局模式、CanvasLayout 和迁移边界。
- [x] 本清单：作为 FE-01 开始前的冻结门槛。

## FE-01 开始前必须确认

- [ ] 在本地检出同一 SHA，执行 `npm ci`。当前沙箱解析 npm 镜像时出现 `EAI_AGAIN`，需在正常开发机或 CI 复核。
- [x] 记录实际验证结果：2026-07-08 已执行 `npm --workspace frontend-user run typecheck`、`npm --workspace frontend-admin run typecheck`、前台相关 Vitest、`frontend-admin` 工作台 Vitest、`npm run build:user`、`npm run build:admin` 与 4 条 Playwright smoke。
- [ ] 在 1920×1080、1440×900、1280×800、1024×768 采集当前页面截图。
- [ ] 确认 React Router 的完整路由表与各页使用的壳层入口。
- [ ] 确认 `GraphWorkspacePage`、`GraphWorkspaceShell`、节点 Inspector、历史 / 冲突组件的实际依赖边界。

## FE-01 完成判定

- [x] 路由可声明 Standard / Studio / Canvas / Focus 四类布局（`layoutPolicy.ts`）。
- [x] CanvasLayout 不渲染通用 ContextPanel（由 `AppShell` 策略锁定）。
- [x] CompactNavigation / CommandBar 由 `AppShell.test.tsx` 覆盖；Drawer、Inspector、DataState 具备最小单元测试。命令执行待依赖安装后复核。
- [x] 无业务数据契约、保存语义或图谱版本逻辑变更。

## FE-02 完成判定

- [x] `/graph` 使用画布专属命令栏，移除旧的大段产品说明。
- [x] SourceRail 已按图谱 / 来源 / 模板拆为资源 Tab。
- [x] 节点属性、来源、历史、导入与冲突已迁入 Inspector Tab。
- [x] 低于 1600px 时，Dock 以覆盖式面板打开，不再永久压缩画布。
- [x] 已在真实依赖环境运行类型检查、Vitest、Vite build 与 Playwright 断点回归。
