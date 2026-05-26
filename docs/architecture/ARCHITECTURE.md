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

## 后端结构

每个领域模块按以下结构生长：

```text
handler -> service -> repository -> model/dto
```

图谱模块额外保留：

```text
domain
operation
snapshot
importer
exporter
layout
ai
```

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
