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
| E2E smoke | 图谱工作区真实预览环境下的桌面与窄屏加载、保存、导入、历史、布局预览、导出状态、权限路径、失败态、dirty 状态下的快照恢复前保护、桌面与窄屏下的快照恢复成功路径、创建新图谱命中失败后仍保留当前图谱、保存当前图谱命中失败后仍保留 dirty 草稿与当前节点、布局预览接口失败后回退本地来源泳道布局、导出 `JSON / SVG / PNG` 失败后仍保留当前选中状态与图谱上下文、来源泳道已生成后导出 PNG 失败仍保留当前分组与当前选择、窄屏下来源泳道已生成后导出 PNG 失败仍保留当前分组与当前选择、窄屏下来源泳道本地 fallback 后导出 `PNG / JSON / SVG` 失败仍保留当前分组与当前选择、桌面与窄屏下的 restore 命中 `forbidden` 后仍保留当前图谱、桌面与窄屏下的 restore 后再次保存命中版本冲突组合路径、版本冲突处理、重载最新图谱命中 `forbidden` 后仍保留冲突辅助与本地草稿、桌面与窄屏下的删除当前图谱命中 `forbidden` 后仍保留当前图谱与确认上下文、桌面与窄屏下的打开他人图谱命中 `forbidden` 后仍保留当前图谱与当前列表激活态，以及桌面与窄屏下的“应用已标记取舍 -> 生成合并草稿 -> 以 rebased document 再次保存”“联动取舍建议清除阻断 -> 应用已标记取舍 -> 以 rebased document 再次保存”“未标记对象默认沿用最新版本 -> 以 rebased document 再次保存”“多目标本地连线联动建议 -> 应用已标记取舍 -> 以 rebased document 再次保存”与“latest-head 分组依赖阻断 -> 一键应用 2 项联动取舍建议 -> 应用已标记取舍 -> 以 rebased document 再次保存”的主路径 | `e2e/v1-graph-workspace.spec.ts` | `npm run test:graph:conflicts:e2e` |
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
- 当前固定入口已经覆盖对象级取舍应用后的真实保存路径、联动取舍建议清除阻断后的真实保存路径、未标记对象默认沿用最新版本后的真实保存路径、多目标本地连线联动建议后的真实保存路径，以及 latest-head 分组依赖阻断清除后的真实保存路径，并会断言第二次 `batch-save` 使用 rebased `document.version`；后续若再扩取舍能力，应继续把这类真实保存链路接进同一入口。
- 当前固定入口也已覆盖 dirty 状态下的快照恢复前保护：真实页面路径会阻断 restore 请求，并继续保留本地未保存草稿与 dirty 保存状态。
- 当前固定入口也已覆盖“创建新图谱”失败分支：若头部“新建图谱”动作被服务端拒绝，页面会显示失败提示，同时继续保留当前图谱标题、当前版本文案和当前画布节点，不会误切到空白图谱。
- 当前固定入口也已覆盖“保存当前图谱”失败分支：若用户创建本地新节点后点击保存时服务端报错，页面会显示失败提示，同时继续保留 `dirty` 草稿对应的节点数、当前节点与新节点，不会静默回退到保存前画布。
- 当前固定入口也已覆盖“布局预览接口失败”分支：若来源泳道预览接口不可用，页面会回退到本地来源泳道布局，并继续保留 3 个分组、选中状态与未保存修改提示，而不会中断当前整理流程。
- 当前固定入口也已覆盖“导出失败”分支：若浏览器下载能力不可用，`StudyMate JSON / SVG / PNG` 三个导出按钮都会回写明确失败提示，同时继续保留当前选中状态、当前版本文案和当前画布节点，不会误改图谱文档。
- 当前固定入口也已覆盖“来源泳道已生成后导出失败”组合路径：若先通过 layout preview 生成 3 条来源泳道，再触发 PNG 导出失败，页面仍会保留当前泳道分组、`dirty` 保存状态与“已选中 3 个节点”上下文，不会把刚生成的布局结果回退掉。
- 当前固定入口也已覆盖窄屏下的“来源泳道已生成后导出失败”组合路径：在 `390x844` 视口里，用户先生成来源泳道后再触发 PNG 导出失败，页面仍会保留 3 个泳道分组、`dirty` 保存状态与状态栏中的“已选 3 个节点”摘要。
- 当前固定入口也已覆盖窄屏下的“来源泳道本地 fallback 后导出失败”组合路径：在 `390x844` 视口里，若 layout preview 接口不可用，页面先回退到本地来源泳道布局，再触发 PNG 导出失败后仍会保留 `资料来源泳道 / 笔记来源泳道 / AI 草稿泳道`、`dirty` 保存状态与状态栏中的“已选 3 个节点”摘要。
- 当前固定入口也已覆盖窄屏下的“来源泳道本地 fallback 后 `JSON / SVG` 导出失败”组合路径：在 `390x844` 视口里，若 layout preview 接口不可用，页面先回退到本地来源泳道布局，再触发 `导出 StudyMate JSON` 与 `导出 SVG` 失败后仍会保留 `资料来源泳道 / 笔记来源泳道 / AI 草稿泳道`、`dirty` 保存状态与状态栏中的“已选 3 个节点”摘要。
- 当前固定入口也已覆盖桌面与窄屏下“恢复快照”命中 `forbidden` 的权限分支：若历史面板中的 restore 动作被服务端拒绝，页面会保留失败提示、当前图谱标题和当前画布内容，不会错误切换到空白或其他图谱。
- 当前固定入口也已覆盖窄屏下的“恢复快照”命中 `forbidden` 的权限分支：在 `390x844` 视口里，若图谱检查器“历史”标签中的 restore 动作被服务端拒绝，页面仍会保留 `窄屏快照恢复图谱`、`窄屏当前节点`、`保存失败` 状态和 `版本 4 · 1 节点 · 0 连线` 的原始版本语义。
- 当前固定入口也已覆盖快照恢复成功路径：真实页面路径会进入共享 `恢复历史快照` reset history 流程，切换回 `saved` 保存状态，并展示“已恢复到快照版本 X”的成功提示。
- 当前固定入口也已覆盖窄屏下的快照恢复成功路径：在 `390x844` 视口里，用户仍可通过检查器进入“历史”标签并完成 restore，说明恢复主链不只在桌面宽度下成立。
- 当前固定入口也已覆盖 restore 与 conflict 的组合主路径：快照恢复成功后继续编辑并保存时，若服务端又推进了更新，页面仍会基于 restored `document.version` 正确进入 `graph_version_conflict` 辅助流程，而不是回退到旧版本语义。
- 当前固定入口也已覆盖桌面与窄屏下“重载最新图谱”命中 `forbidden` 的权限分支：若冲突态下尝试放弃本地并重载最新图谱时被服务端拒绝，确认框会保留错误信息，关闭后冲突辅助与当前本地草稿仍继续可见，不会被提前清空。
- 当前固定入口也已覆盖窄屏下的“重载最新图谱”命中 `forbidden` 的权限分支：在 `390x844` 视口里，若冲突态下尝试放弃本地并重载最新图谱时被服务端拒绝，确认框仍会保留“只能访问自己的图谱”，关闭后冲突辅助、重载入口、检查器与当前本地草稿都继续可见。
- 当前固定入口也已覆盖桌面与窄屏下“删除当前图谱”命中 `forbidden` 的权限分支：若概览面板中的删除动作被服务端拒绝，确认框会保留错误信息，取消后当前图谱、当前标题和当前画布内容仍继续停留在原工作区里。
- 当前固定入口也已覆盖窄屏下的“删除当前图谱”命中 `forbidden` 的权限分支：在 `390x844` 视口里，若图谱检查器“概览”标签中的删除动作被服务端拒绝，确认框仍会保留“只能访问自己的图谱”，关闭后 `窄屏当前图谱`、`窄屏当前节点` 与 `版本 4 · 1 节点 · 0 连线` 都继续可见。
- 当前固定入口也已覆盖桌面与窄屏下“打开他人图谱”命中 `forbidden` 的权限分支：若资源面板中的他人图谱打开动作被服务端拒绝，页面会保留失败提示、当前图谱内容和当前列表激活态，不会错误切换到无权限图谱。
- 当前固定入口也已覆盖窄屏下的“打开他人图谱”命中 `forbidden` 的权限分支：在 `390x844` 视口里，若资源面板图谱列表中的 `窄屏他人图谱` 打开动作被服务端拒绝，页面仍会保留 `窄屏当前图谱`、当前激活图谱列表项、`窄屏当前节点` 与 `版本 4 · 1 节点 · 0 连线`。
- 当前固定入口也已覆盖窄屏下的 restore 与 conflict 组合主路径：在 `390x844` 视口里，用户仍可先通过检查器完成 restore，再收起检查器继续编辑并保存，随后命中 `graph_version_conflict` 辅助流程并重载到最新 head。
- 当前固定入口也已覆盖窄屏下的 restore 后对象级取舍再保存路径：在 `390x844` 视口里，用户可在冲突检查器中滚动到对象级取舍按钮，并通过真实点击完成“保留本地 -> 应用已标记取舍 -> 再次保存”，最终得到 rebased `document.version` 的成功保存结果。
- 当前固定入口也已覆盖窄屏下对象级取舍的 pointer 路径收口：`compact-navigation` 在 `390x844` 视口里会收口为底部导航栏，不再以整高侧栏形态拦截冲突检查器中的对象级取舍按钮点击。
- 它还没有覆盖：
  - 更完整的桌面 / 窄屏冲突组合矩阵
  - 更完整的 create/save/restore/export/layout/conflict/权限全矩阵，尤其是更多权限分支与桌面/窄屏组合

## 5. 后续迭代提醒

- `WB-032` 若继续补更多 latest-head、多目标依赖、未标记默认回退组合场景，应优先把新增路径接入这里的固定入口，而不是只留在零散命令里。
- `WB-034` 启动时，应直接复用本页命令与测试映射，再补 E2E smoke、权限路径和布局矩阵，而不是重新整理一套独立入口。
