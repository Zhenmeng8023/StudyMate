# 图谱冲突回归矩阵

> 适用范围：`WB-032` 当前已经收口的自动保存 / 快照 / 冲突处理可靠性边界。
> 目标：把图谱冲突处理的后端契约、前端摘要逻辑、冲突卡片交互和当前可执行回归入口集中到一处，供后续 `WB-032` 深化与 `WB-034` 固定验证矩阵复用。

## 1. 当前覆盖范围

### 1.1 服务端生命周期边界

- `batch-save` 必须拒绝旧版本 `document.version` 的静默覆盖，并返回 `409 graph_version_conflict`
- `restore` 必须把旧快照提升为新的 head version，而不是回退当前版本号
- 后端 DTO 必须继续以服务端权威覆盖 `graphId` / `version`

### 1.2 前端冲突工作区边界

- dirty 状态下禁止直接恢复快照
- 同图谱且同版本的本地草稿可以恢复，stale draft 必须显式放弃
- 冲突卡片必须展示：
  - 当前未保存修改摘要
  - 与最新图谱相比的差异摘要
  - 对象级 `node / edge / group` 冲突明细
  - `保留本地 / 保留服务端 / 稍后处理` 草稿
  - 依赖阻断摘要、联动取舍建议与未标记默认回退说明

### 1.3 当前重点组合路径

- 本地新增节点 / 连线导致的 `dangling_edge`
- 本地新增节点来源失效触发的 `invalid_source_target`
- 本地新增节点尺寸非法触发的 `invalid_node_size`
- latest-head 删除语义下的 `dangling_edge`
- latest-head 删除语义下的 `invalid_group_node`
- 多目标连线 `metadata.targetNodeIds` 附加依赖节点
- latest-head 删除语义下的多目标连线

## 2. 可执行回归矩阵

| 覆盖层 | 关注点 | 主要文件 | 命令 |
| --- | --- | --- | --- |
| 前端 API | `batch-save` / `restore` / `validate` 路径与请求形状 | `frontend-user/src/api/graphs.test.ts` | `npm run test:graph:conflicts:frontend` |
| 前端 helper | 冲突摘要、对象级取舍、联动建议、未标记默认回退 | `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` | `npm run test:graph:conflicts:frontend` |
| 前端组件 | 冲突卡片阻断摘要、联动建议按钮、批量应用入口 | `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` | `npm run test:graph:conflicts:frontend` |
| 前端页面 | 图谱工作区真实冲突路径、latest-head 组合场景、页面级联动建议 | `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`、`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx` | `npm run test:graph:conflicts:frontend` |
| 前端持久化 | 本地草稿恢复、跨窗口提醒、冲突后状态保持 | `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`、`frontend-user/src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx` | `npm run test:graph:conflicts:frontend` |
| 后端 DTO / handler / service | 版本权威、`409 graph_version_conflict`、restore 生命周期 | `backend/internal/modules/graph/dto/*.go`、`handler/*.go`、`service/*.go` | `npm run test:graph:conflicts:backend` |
| E2E smoke | 图谱工作区真实预览环境下的桌面与窄屏加载、保存、导入、历史、布局预览、导出状态、权限路径、失败态、版本冲突处理，以及“应用已标记取舍 -> 生成合并草稿 -> 以 rebased document 再次保存”“联动取舍建议清除阻断 -> 应用已标记取舍 -> 以 rebased document 再次保存”“未标记对象默认沿用最新版本 -> 以 rebased document 再次保存”与“多目标本地连线联动建议 -> 应用已标记取舍 -> 以 rebased document 再次保存”的主路径 | `e2e/v1-graph-workspace.spec.ts` | `npm run test:graph:conflicts:e2e` |
| 文档同步 | 路线图、backlog、主文档与里程碑记录一致 | `README.md` / `docs/DEVELOPMENT.md` / `PROJECT_LOG.md` 等 | `npm run verify:docs` |

## 3. 推荐执行入口

### 3.1 图谱冲突专项验证

```powershell
npm run verify:graph-conflicts
```

该命令当前会执行：

1. `npm run test:graph:conflicts:frontend`
2. `npm run test:graph:conflicts:backend`
3. `npm run test:graph:conflicts:e2e`
4. `npm run verify:docs`

### 3.2 全量项目验证

```powershell
npm run ci
```

## 4. 当前边界说明

- 当前入口聚焦图谱冲突生命周期与工作区回归，不等同于 `WB-034` 已完成。
- 当前固定入口已经覆盖对象级取舍应用后的真实保存路径、联动取舍建议清除阻断后的真实保存路径、未标记对象默认沿用最新版本后的真实保存路径，以及多目标本地连线联动建议后的真实保存路径，并会断言第二次 `batch-save` 使用 rebased `document.version`；后续若再扩取舍能力，应继续把这类真实保存链路接进同一入口。
- 它还没有覆盖：
  - 更完整的桌面 / 窄屏冲突组合矩阵
- 更完整的 create/save/restore/export/layout/conflict/权限全矩阵，尤其是更多权限分支与桌面/窄屏组合

## 5. 后续迭代提醒

- `WB-032` 若继续补更多 latest-head、多目标依赖、未标记默认回退组合场景，应优先把新增路径接入这里的固定入口，而不是只留在零散命令里。
- `WB-034` 启动时，应直接复用本页命令与测试映射，再补 E2E smoke、权限路径和布局矩阵，而不是重新整理一套独立入口。
