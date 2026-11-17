# 学伴图谱架构

## 产品闭环

```text
资料/PDF -> 笔记 -> 知识图谱 -> AI 辅助 -> 卡片复习 -> 社区
```

## 存储职责

- MySQL：权威业务数据、权限、审核、统计和关联关系。
- MongoDB：灵活内容文档，例如笔记块、图谱文档、PDF 批注和 AI 上下文。
- Redis：缓存、限流、短生命周期认证状态、队列和锁。
- 本地存储起步：PDF、图片、附件、封面和导出文件。
- Meilisearch 后续接入：面向用户的全文搜索。

详细数据库结构见 [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)。
图谱文档结构契约见 [GRAPH_DOCUMENT_CONTRACT.md](./GRAPH_DOCUMENT_CONTRACT.md)，图谱 API 生命周期与版本推进规则见 [GRAPH_API_LIFECYCLE.md](./GRAPH_API_LIFECYCLE.md)，导出/缩略图/布局边界见 [GRAPH_EXPORT_LAYOUT_CONTRACT.md](./GRAPH_EXPORT_LAYOUT_CONTRACT.md)。

## 后端结构

每个领域模块按以下结构生长：

```text
handler -> service -> repository -> model/dto
```

图谱模块**规划**额外保留以下子包：

```text
domain
operation
snapshot
importer
exporter
layout
ai
```

> **2026-11-17 静态复核**：上述 7 个目录当前**已存在但全部为空**（0 个 Go 文件）。图谱领域逻辑实际集中在 `backend/internal/modules/graph/service/`：`helpers.go`（876 行，Markdown/Mermaid 导入与 `ValidateDocument`）、`layout.go`（316 行，来源泳道布局）、`service.go`（774 行，版本推进、快照恢复与 AI 提交）。新增图谱领域能力时应进入 `service/` 并补测试，不要假设这些分层目录已经在承载逻辑。

## 前端结构

前台用户端按学习模块组织：

```text
community
materials
reader
notes
graph
cards
ai
```

画布逻辑隔离在 `graph-core`，后续可复用到 Web 前台、后台预览、移动端只读视图，以及可选的 Tauri 桌面端。
