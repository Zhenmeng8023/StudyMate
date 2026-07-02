# 图谱导出、缩略图与布局契约（WB-031）

## 目标

把 StudyMate 图谱当前已经存在的导出能力、缩略图主记录模型和布局预览入口收口成一份可执行契约，明确：

- JSON / SVG / PNG 导出产物的边界与职责
- graph head 如何关联缩略图文件，而不把缩略图生成绑死在版本推进流程里
- 布局能力如何以明确 API 进入 graph 生命周期，而不是长期停留在前端局部 helper

## 导出产物契约

### 1. 当前导出入口

当前导出统一经由前端 `graphFileImportExport.ts` 的 `buildGraphExportArtifact(...)`：

- `kind = json`
  - 产出 `.smtg`
  - `mimeType = application/vnd.studymate.graph+json`
  - 内容来自当前 `GraphDetailPayload.document` 的规范化导出
- `kind = svg`
  - 产出 `.svg`
  - `mimeType = image/svg+xml;charset=utf-8`
  - 内容来自当前画布文档与节点外观 token 的 SVG 序列化
- `PNG`
  - 不单独维护第三套图谱序列化
  - 通过先生成 SVG，再在前端渲染为 PNG blob 导出

### 2. 当前保证

- 文件名统一经过安全清洗，避免非法路径字符进入导出文件名
- JSON / SVG 导出不推进 graph 版本，不创建 snapshot，不修改 current document
- PNG 导出是 SVG 导出的派生产物，失败只影响下载提示，不影响 graph head

### 3. 回归锚点

- `frontend-user/src/modules/graph/lib/graphFileImportExport.test.ts`
- `frontend-user/src/modules/graph/hooks/useGraphImportExport.test.tsx`

## 缩略图主记录模型

### 1. Head 字段

MySQL `graphs.thumbnail_file_id` 现在通过 `GraphSummaryPayload` / `GraphDetailPayload.thumbnailFileId` 显式暴露到 API 层，作用是：

- 把“当前 graph head 对应的封面/缩略图文件”挂回摘要层
- 为列表页、搜索结果、分享卡片或后续后台治理提供统一的只读引用
- 让缩略图链路与 current document / snapshot 生命周期解耦

### 2. 当前任务模型

缩略图生成当前定义为异步产物流程，而不是 graph 版本推进步骤：

1. 基于当前规范化 `document` 渲染缩略图源内容
2. 上传或写入文件存储
3. 将结果文件 ID 回写到 `graphs.thumbnail_file_id`
4. 必要时把快照级缩略图引用写入 `graph_snapshots.thumbnail_file_id`

当前规则：

- 缩略图回写不应推进 `currentVersion`
- 缩略图失败不应阻断 batch-save / restore / import 成功
- head 只保留“当前生效缩略图”的文件引用，历史缩略图是否留存在 snapshot 由后续恢复链路决定

### 3. 当前边界

`WB-031` 只把 `thumbnailFileId` 的 head 合约显式化，不在本包内实现真实上传/渲染任务队列。

## 布局预览 API

### 1. Endpoint

`POST /api/v1/graphs/:id/layouts/preview`

### 2. 请求体

```json
{
  "mode": "source-swimlane",
  "nodeIds": ["node-1", "node-2"],
  "document": {}
}
```

字段说明：

- `mode`
  - 当前只支持 `source-swimlane`
- `nodeIds`
  - 需要参与布局的节点 ID 集合
  - 当前至少 2 个
- `document`
  - 客户端当前工作区文档草稿
  - 服务端会用当前 graph head 的 `graphId` / `version` 重新归一化

### 3. 响应体

```json
{
  "mode": "source-swimlane",
  "statusMessage": "已生成 2 条来源泳道",
  "laneCount": 2,
  "selectedNodeIds": ["node-1", "node-2"],
  "document": {}
}
```

字段说明：

- `document`
  - 带布局结果的新文档草稿
  - 当前只重排被选节点坐标，并生成 `metadata.layoutKind = source-swimlane` 的分组
- `selectedNodeIds`
  - 布局后仍应保持选中的节点顺序
- `laneCount`
  - 本次生成的泳道数量

### 4. 生命周期语义

布局预览是“只生成草稿，不推进 head”的接口：

- 不修改 MySQL `graphs.current_version`
- 不写入 Mongo current document
- 不创建 snapshot
- 不写入 `graph_versions`
- 不同步 `graph_relations`

它的作用是把“布局算法结果”从前端局部交互提升成可复用的 graph API 契约，再由工作区决定是否把返回文档并入本地 dirty 状态。

### 5. 前端接入

图谱工作区当前优先通过 `previewGraphLayout(...)` 调用该接口生成来源泳道。

为了兼容本地开发和异常兜底：

- 服务端可用时，优先使用后端预览结果
- 服务端不可用时，仍回退到前端本地 `buildGraphSourceSwimlaneDocument(...)`

### 6. 回归锚点

- `backend/internal/modules/graph/service/service_test.go`
- `backend/internal/modules/graph/handler/handler_test.go`
- `frontend-user/src/api/graphs.test.ts`

## 非目标

`WB-031` 不在本包内继续扩张：

- 缩略图上传任务调度与文件治理页面
- 后端统一导出文件落库
- 多种布局算法注册中心
- 布局结果自动持久化
- 带 optimistic locking 的协作布局任务
