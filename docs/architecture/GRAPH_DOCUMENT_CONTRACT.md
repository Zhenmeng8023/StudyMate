# 图谱文档契约（WB-020）

## 目标

统一 StudyMate 图谱文档的最小读写契约，显式稳定以下内容：

- `GraphDocument` / `GraphDocumentPayload` 的核心字段边界
- `schemaVersion` 的单一来源
- 旧文档、空文档和缺省字段的兼容读取规则
- 前端工作区与后端持久化层的默认化顺序

## 当前稳定契约

### 核心字段

前端 `@studymate/graph-core` 的 `GraphDocument` 与后端 `GraphDocumentPayload` 当前都围绕同一组字段工作：

- 图标识：`id` / `graphId`
- 版本：`version`
- schema 版本：`schemaVersion`
- 视口：`viewport.x` / `viewport.y` / `viewport.zoom`
- 内容集合：`nodes`、`edges`、`groups`
- 可选扩展：`theme`、`metadata`

### schemaVersion

- 当前唯一支持的 schema 版本为 `1`
- 前端 canonical 常量：`packages/graph-core/src/model.ts` 中的 `supportedGraphSchemaVersion`
- 后端 canonical 常量：`backend/internal/modules/graph/dto/document_contract.go` 中的 `SupportedGraphSchemaVersion`

这两个常量都明确服务于同一份 v1 契约，不应在业务层再散落硬编码 `1`。

## 兼容读取规则

### 前端

用户端图谱工作区通过 `frontend-user/src/modules/graph/lib/graphDocumentPayload.ts` 进行 payload 兼容适配：

- 缺失 `graphId` 时回填当前图谱 id
- 缺失 `version` 时回填当前图谱版本
- 缺失 `schemaVersion` 时回填支持的 schema 版本
- 缺失 `nodes` / `edges` / `groups` 时回填空数组
- 缺失 `theme` / `metadata` 时回填空对象
- 工作区空文档默认 viewport 为 `{ x: 140, y: 120, zoom: 1 }`

这层适配会复用 `@studymate/graph-core` 的 `normalizeGraphDocument(...)`，但保留工作区自己的默认视口语义。

### 后端

后端通过 `backend/internal/modules/graph/dto/document_contract.go` 统一默认化：

- 缺失 `GraphID` 时回填目标图谱 id
- 缺失 `Version` 时回填目标版本号
- 缺失 `SchemaVersion` 时回填支持的 schema 版本
- `Viewport.Zoom == 0` 时回填为 `1`
- `Nodes` / `Edges` / `Groups` 为 `nil` 时转为空切片
- `Theme` / `Metadata` 为 `nil` 时转为空 map

Repository 读写、Service 批量保存、快照恢复、导入构建和空文档创建都必须复用这层 helper，而不是各自再补默认值。

## 生命周期约束

### 写入前

- Service 先对文档执行默认化，再做结构校验
- 持久化层写入 current document 与 snapshot 时使用同一份归一化结果

### 读取后

- Repository 从 Mongo 读取 current document / snapshot 后，必须再次走兼容默认化
- 前端收到后端 payload 后，进入工作区前仍需走一次 payload 适配，保证 UI 默认视口与类型边界稳定

## 测试锚点

- 前端：`frontend-user/src/modules/graph/lib/graphDocumentPayload.test.ts`
- 前端加载态：`frontend-user/src/modules/graph/lib/graphWorkspaceLoadState.test.ts`
- 后端 DTO：`backend/internal/modules/graph/dto/document_contract_test.go`
- 后端 repository/service：`go test ./internal/modules/graph/repository ./internal/modules/graph/service`
- graph-core：`npm --workspace @studymate/graph-core run test`

## 后续边界

`WB-020` 只稳定图谱文档模型与版本策略，不在这一包里继续扩张：

- `viewport` / `selection` / `history` 独立状态模型抽离属于 `WB-021`
- import/export/validation 统一接口属于 `WB-022`
- 更完整的 graph API 生命周期整理属于 `WB-030`
