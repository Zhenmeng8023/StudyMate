# 学伴图谱数据库设计

本文档根据《学伴项目：对标 Project Graph 的升级设计》和当前已实现功能整理，作为后续数据库演进的主设计依据。

设计目标不是一次性把最终产品全部建完，而是先保证当前开发阶段可落地，同时让表结构、文档结构和 ID 关系能够自然扩展到最终形态。

## 0. 配套落地文件

- MySQL 初始幂等建库脚本：`backend/internal/migrations/mysql/001_init_schema.sql`
- MySQL 基础种子脚本：`backend/internal/migrations/mysql/002_seed_baseline.sql`
- MySQL 历史库对齐脚本：`backend/internal/migrations/mysql/003_align_current_tables.sql`
- 对应回滚脚本：
  - `backend/internal/migrations/mysql/001_init_schema.down.sql`
  - `backend/internal/migrations/mysql/002_seed_baseline.down.sql`
  - `backend/internal/migrations/mysql/003_align_current_tables.down.sql`
- Mongo 集合初始化脚本：`backend/internal/migrations/mongo/001_init_content_collections.js`
- Mongo 集合回滚脚本：`backend/internal/migrations/mongo/001_init_content_collections.down.js`
- 当前脚本定位：
  - 面向 MySQL 8.0+
  - 可在已创建的 `studymate` 数据库上重复执行
  - 使用 `CREATE TABLE IF NOT EXISTS`、`ON DUPLICATE KEY UPDATE`、唯一约束、组合索引、迁移记录表保证初始化阶段幂等
  - `.down.sql` 文件用于手动回滚，不会被后端启动时的自动迁移逻辑执行
  - Mongo 脚本当前通过 `mongosh --file` 手动执行，负责集合和索引初始化
  - 以“当前已实现功能可直接落地 + 最终设计方向预留扩展表”为目标
- 当前不做的事情：
  - 不通过单个初始化脚本处理历史表结构差异修复
  - 不在现阶段强制启用外键级联，避免影响已有 GORM 代码和渐进演进

## 1. 总体原则

### 1.1 数据库分工

```text
MySQL
- 权威业务事实
- 账号、权限、审核、状态、统计
- 资料、帖子、笔记、图谱、卡片、AI 任务等主记录
- 需要事务和强关联查询的数据

MongoDB
- 灵活内容文档
- 笔记块、图谱画布文档、PDF 高亮几何信息、AI 对话上下文
- 版本快照、导入解析结果、复杂 JSON 内容

Redis
- 缓存、限流、验证码、短期状态、队列、锁

对象存储
- PDF、图片、附件、封面、导出文件

搜索引擎
- 第一阶段预留 Meilisearch
- 后期可接 Elasticsearch 和向量数据库
```

### 1.2 ID 约定

- 所有业务主键统一使用 UUID 字符串，当前 Go 后端已按 `size:36` 实现。
- MongoDB 文档中保留 Mongo `_id`，同时必须保存 MySQL 业务 ID，例如 `note_id`、`graph_id`、`material_id`。
- 跨库关系以 MySQL 业务 ID 为准，MongoDB 不承担权限判断的权威来源。

### 1.3 内容归属原则

- MySQL 保存“这是什么、属于谁、能不能看、当前状态是什么”。
- MongoDB 保存“具体内容长什么样、画布里有哪些节点、编辑器里有哪些块”。
- 大文件不进入 MySQL 或 MongoDB，只保存文件索引和对象存储路径。

## 2. MySQL 当前阶段结构

当前阶段已经覆盖用户、认证、文件、资料、社区、阅读、笔记和后台审计。下面是当前表结构的规范化设计，字段命名保持和现有 GORM 模型一致或接近。

### 2.1 用户与认证

#### users

用户主表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| username | varchar(64) | 用户名，唯一 |
| email | varchar(128) | 邮箱，唯一 |
| password_hash | varchar(255) | 密码哈希 |
| display_name | varchar(128) | 显示名 |
| role | varchar(32) | 当前简化角色，后续可迁移到角色表 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
unique(username)
unique(email)
index(role)
```

#### refresh_tokens

刷新令牌表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| user_id | char(36) | 用户 ID |
| token_hash | varchar(64) | 令牌哈希，唯一 |
| expires_at | datetime | 过期时间 |
| revoked_at | datetime null | 吊销时间 |
| created_at | datetime | 创建时间 |

索引：

```text
index(user_id)
unique(token_hash)
```

### 2.2 文件与对象存储索引

#### files

所有上传文件的索引表。文件实体存储在本地目录或对象存储中。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| owner_user_id | char(36) | 上传者 |
| original_name | varchar(255) | 原始文件名 |
| stored_name | varchar(255) | 存储文件名 |
| mime_type | varchar(128) | MIME 类型 |
| size | bigint | 文件大小 |
| path | varchar(512) | 本地路径或对象存储 Key |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
index(owner_user_id)
index(mime_type)
```

后续扩展字段：

```text
storage_provider
bucket
checksum_sha256
visibility
scan_status
```

### 2.3 社区

#### posts

社区帖子主表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| author_user_id | char(36) | 作者 |
| title | varchar(200) | 标题 |
| body | text | 当前阶段帖子正文 |
| kind | varchar(32) | text/article/material/graph/question 等 |
| status | varchar(32) | pending/approved/rejected/hidden |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
index(author_user_id)
index(status)
index(kind)
index(created_at)
```

最终设计中，富文本正文可拆到 MongoDB `post_documents`，MySQL 保留摘要、状态和统计。

#### comments

评论表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| post_id | char(36) | 帖子 ID |
| author_user_id | char(36) | 评论者 |
| body | text | 评论正文 |
| status | varchar(32) | visible/hidden/pending |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
index(post_id)
index(author_user_id)
index(status)
```

后续支持楼中楼时增加：

```text
parent_comment_id
root_comment_id
reply_to_user_id
```

#### post_likes

帖子点赞表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| post_id | char(36) | 帖子 ID |
| user_id | char(36) | 用户 ID |
| created_at | datetime | 创建时间 |

索引：

```text
unique(post_id, user_id)
```

#### post_favorites

帖子收藏表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| post_id | char(36) | 帖子 ID |
| user_id | char(36) | 用户 ID |
| created_at | datetime | 创建时间 |

索引：

```text
unique(post_id, user_id)
```

### 2.4 资料库

#### materials

资料主表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| owner_user_id | char(36) | 创建者 |
| title | varchar(200) | 标题 |
| description | text | 描述 |
| category | varchar(64) | 分类 |
| tags | text | 当前阶段用逗号或 JSON 字符串保存 |
| cover_file_id | char(36) | 封面文件 ID |
| attachment_file_id | char(36) | 附件文件 ID |
| status | varchar(32) | pending/approved/rejected/hidden |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
index(owner_user_id)
index(category)
index(status)
index(updated_at)
```

最终扩展字段：

```text
material_type       book/paper/course/pdf/link/video/problem_set
authors
publisher
published_year
isbn
doi
language
copyright_status
source_url
metadata_status
```

#### material_favorites

资料收藏表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| material_id | char(36) | 资料 ID |
| user_id | char(36) | 用户 ID |
| created_at | datetime | 创建时间 |

索引：

```text
unique(material_id, user_id)
```

#### material_ratings

资料评分表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| material_id | char(36) | 资料 ID |
| user_id | char(36) | 用户 ID |
| score | int | 评分 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
unique(material_id, user_id)
index(material_id)
```

### 2.5 阅读器

#### reading_progress

阅读进度表。该表是用户对资料的阅读状态索引。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| user_id | char(36) | 用户 ID |
| material_id | char(36) | 资料 ID |
| current_page | int | 当前页 |
| total_pages | int | 总页数 |
| progress_percent | decimal(5,2) | 阅读进度百分比 |
| bookmarks | text | 当前阶段书签页码 |
| last_read_at | datetime | 最近阅读时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
unique(user_id, material_id)
index(last_read_at)
```

目标设计中，书签和复杂高亮应进入 MongoDB，MySQL 仅保留阅读状态摘要。

#### pdf_annotations

当前阶段的 PDF 批注表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| user_id | char(36) | 用户 ID |
| material_id | char(36) | 资料 ID |
| page | int | 页码 |
| quote | varchar(1000) | 摘录 |
| comment | text | 批注说明 |
| color | varchar(32) | 高亮颜色 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
index(user_id, material_id)
index(material_id, page)
```

目标设计中，带坐标、选区矩形、跨页高亮的批注写入 MongoDB `pdf_annotation_documents`。MySQL 可保留批注摘要索引用于列表和统计。

### 2.6 笔记

#### notes

笔记主表。当前阶段正文仍保存在 `content`，最终设计会将块内容迁到 MongoDB。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| owner_user_id | char(36) | 所有者 |
| title | varchar(200) | 标题 |
| summary | varchar(500) | 摘要 |
| content | text | 当前阶段 HTML 正文 |
| material_id | char(36) | 关联资料 |
| folder_name | varchar(120) | 文件夹 |
| tags | text | 标签 |
| version_number | int | 当前版本号 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

索引：

```text
index(owner_user_id)
index(material_id)
index(folder_name)
index(updated_at)
```

最终扩展字段：

```text
visibility
status
content_doc_id
last_editor_user_id
word_count
linked_count
```

#### note_versions

笔记版本表。当前阶段保存完整内容快照，后续可仅保存 MongoDB 快照引用。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| note_id | char(36) | 笔记 ID |
| editor_user_id | char(36) | 编辑者 |
| version_number | int | 版本号 |
| title | varchar(200) | 标题快照 |
| summary | varchar(500) | 摘要快照 |
| content | text | 正文快照 |
| created_at | datetime | 创建时间 |

索引：

```text
index(note_id)
unique(note_id, version_number)
index(editor_user_id)
```

#### note_relations

笔记引用关系表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| note_id | char(36) | 笔记 ID |
| target_type | varchar(32) | material/post/graph/card/pdf_annotation 等 |
| target_id | char(36) | 目标 ID |
| created_at | datetime | 创建时间 |

索引：

```text
index(note_id)
index(target_type, target_id)
unique(note_id, target_type, target_id)
```

### 2.7 后台审计

#### audit_logs

后台操作日志表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | char(36) | 主键 |
| actor_id | char(36) | 操作者 |
| action | varchar(128) | 操作 |
| target | varchar(128) | 操作目标 |
| metadata | text | 扩展信息 JSON |
| created_at | datetime | 创建时间 |

索引：

```text
index(actor_id)
index(action)
index(target)
index(created_at)
```

## 3. MySQL 最终目标扩展结构

以下表可以按模块推进时逐步增加。

### 3.1 权限与组织

```text
roles
- id
- code
- name
- description
- created_at
- updated_at

permissions
- id
- code
- name
- resource
- action
- created_at

user_roles
- id
- user_id
- role_id
- created_at

teams
- id
- name
- owner_user_id
- visibility
- created_at
- updated_at

team_members
- id
- team_id
- user_id
- role
- joined_at
```

### 3.2 社区增强

```text
topics
- id
- name
- slug
- description
- status
- created_at
- updated_at

post_topics
- post_id
- topic_id

reports
- id
- reporter_user_id
- target_type
- target_id
- reason
- status
- handled_by
- handled_at
- created_at

follows
- id
- follower_user_id
- following_user_id
- created_at

collections
- id
- owner_user_id
- title
- description
- visibility
- created_at
- updated_at

collection_items
- id
- collection_id
- target_type
- target_id
- sort_order
- created_at
```

### 3.3 资料与文献增强

```text
material_categories
- id
- name
- parent_id
- sort_order
- enabled

material_tags
- id
- name
- usage_count
- created_at

material_tag_links
- material_id
- tag_id

material_files
- id
- material_id
- file_id
- usage_type        cover/attachment/source/export
- sort_order
- created_at

material_metadata
- material_id
- material_type
- authors
- publisher
- published_year
- isbn
- doi
- source_url
- citation_json
- updated_at

reading_lists
- id
- owner_user_id
- title
- description
- visibility
- created_at
- updated_at

reading_list_items
- id
- reading_list_id
- material_id
- sort_order
- status
- created_at
```

### 3.4 图谱画布

图谱主记录和权限放 MySQL，画布文档放 MongoDB。

```text
graphs
- id
- owner_user_id
- title
- description
- visibility
- status
- graph_type        knowledge/diagram/course_map/project_map
- mode              free/uml/c4/erd/bpmn/cloud
- current_version
- node_count
- edge_count
- thumbnail_file_id
- created_at
- updated_at

graph_permissions
- id
- graph_id
- target_type       user/team/public
- target_id
- permission        view/comment/edit/admin
- created_at

graph_versions
- id
- graph_id
- version_number
- editor_user_id
- mongo_snapshot_id
- summary
- created_at

graph_relations
- id
- graph_id
- target_type       material/note/post/card/file
- target_id
- relation_type
- created_at

graph_operation_logs
- id
- graph_id
- user_id
- operation_type
- operation_id
- client_id
- mongo_operation_id
- created_at
```

### 3.5 工程图与 Diagram-as-Code

```text
diagram_templates
- id
- name
- category
- description
- preview_file_id
- graph_id
- source_type       mermaid/plantuml/structurizr/sql/openapi
- status
- created_by
- created_at
- updated_at

diagram_shape_libraries
- id
- name
- category
- icon_file_id
- enabled
- created_at
- updated_at

diagram_sources
- id
- graph_id
- source_type
- source_hash
- parse_status
- mongo_source_id
- created_at
- updated_at

diagram_validations
- id
- graph_id
- rule_type
- status
- issue_count
- mongo_result_id
- created_at

code_analysis_tasks
- id
- user_id
- repo_url
- upload_file_id
- language
- task_type
- status
- result_graph_id
- error_message
- created_at
- updated_at
```

### 3.6 卡片复习

```text
decks
- id
- owner_user_id
- title
- description
- visibility
- card_count
- created_at
- updated_at

cards
- id
- deck_id
- owner_user_id
- card_type        basic/reverse/cloze/choice/image_occlusion/code
- front
- back
- source_type      note/material/pdf_annotation/graph/ai
- source_id
- status
- created_at
- updated_at

card_schedules
- card_id
- user_id
- due_at
- interval_days
- ease_factor
- repetition_count
- lapse_count
- state            new/learning/review/relearning
- updated_at

card_reviews
- id
- card_id
- user_id
- rating           again/hard/good/easy
- elapsed_ms
- reviewed_at
```

### 3.7 AI 学习助手

```text
ai_tasks
- id
- user_id
- task_type        summarize/explain/generate_graph/generate_cards/qa
- source_type
- source_id
- status
- model
- input_tokens
- output_tokens
- result_ref_type
- result_ref_id
- error_message
- created_at
- updated_at

ai_usage_logs
- id
- user_id
- task_id
- model
- input_tokens
- output_tokens
- cost_units
- created_at

ai_quota_logs
- id
- user_id
- quota_type
- delta
- reason
- created_at
```

### 3.8 课程与教学端

```text
courses
- id
- owner_user_id
- title
- description
- visibility
- status
- created_at
- updated_at

course_members
- id
- course_id
- user_id
- role
- joined_at

course_chapters
- id
- course_id
- title
- sort_order
- created_at
- updated_at

assignments
- id
- course_id
- chapter_id
- title
- description
- due_at
- status
- created_at
- updated_at

submissions
- id
- assignment_id
- user_id
- content_type
- content_ref_id
- status
- submitted_at
- graded_at

grades
- id
- submission_id
- grader_user_id
- score
- feedback
- created_at
```

### 3.9 搜索同步

```text
search_sync_jobs
- id
- target_type
- target_id
- action           upsert/delete
- status
- retry_count
- error_message
- scheduled_at
- created_at
- updated_at

document_chunks
- id
- source_type      material/note/graph/post
- source_id
- chunk_index
- plain_text
- token_count
- mongo_chunk_id
- search_status
- created_at
- updated_at
```

## 4. MongoDB 结构

MongoDB 数据库名：

```text
studymate_content
```

### 4.1 note_documents

保存笔记块内容。MySQL `notes.content` 当前可作为过渡字段，目标形态以本集合为准。

```json
{
  "_id": "ObjectId",
  "note_id": "uuid",
  "owner_user_id": "uuid",
  "version": 12,
  "schema_version": 1,
  "blocks": [
    {
      "id": "block_uuid",
      "type": "paragraph",
      "text": "正文",
      "children": [],
      "attrs": {}
    }
  ],
  "html": "<p>正文</p>",
  "markdown": "正文",
  "plain_text": "正文",
  "updated_at": "datetime"
}
```

索引：

```text
unique(note_id)
index(owner_user_id, updated_at)
text(plain_text)
```

### 4.2 note_snapshots

笔记历史快照。

```json
{
  "_id": "ObjectId",
  "note_id": "uuid",
  "owner_user_id": "uuid",
  "version": 12,
  "title": "标题",
  "blocks": [],
  "html": "",
  "markdown": "",
  "plain_text": "",
  "created_at": "datetime"
}
```

索引：

```text
unique(note_id, version)
index(owner_user_id, created_at)
```

### 4.3 graph_documents

图谱画布当前文档。

```json
{
  "_id": "ObjectId",
  "graph_id": "uuid",
  "owner_user_id": "uuid",
  "version": 8,
  "schema_version": 1,
  "viewport": {
    "x": 0,
    "y": 0,
    "zoom": 1
  },
  "nodes": [
    {
      "id": "node_uuid",
      "type": "note",
      "title": "节点标题",
      "position": { "x": 120, "y": 80 },
      "size": { "width": 240, "height": 120 },
      "source": { "type": "note", "id": "uuid" },
      "content": {},
      "style": {},
      "metadata": {}
    }
  ],
  "edges": [
    {
      "id": "edge_uuid",
      "type": "curve",
      "source_node_id": "node_uuid",
      "target_node_id": "node_uuid",
      "label": "关系",
      "style": {},
      "metadata": {}
    }
  ],
  "groups": [],
  "theme": {},
  "updated_at": "datetime"
}
```

索引：

```text
unique(graph_id)
index(owner_user_id, updated_at)
```

### 4.4 graph_snapshots

图谱快照，用于版本恢复和导出。

```json
{
  "_id": "ObjectId",
  "graph_id": "uuid",
  "owner_user_id": "uuid",
  "version": 8,
  "document": {},
  "thumbnail_file_id": "uuid",
  "created_at": "datetime"
}
```

索引：

```text
unique(graph_id, version)
index(owner_user_id, created_at)
```

### 4.5 graph_operations

图谱操作日志，后续用于撤销、重做、增量同步和协作铺垫。

```json
{
  "_id": "ObjectId",
  "graph_id": "uuid",
  "user_id": "uuid",
  "operation_id": "uuid",
  "client_id": "string",
  "type": "node.create",
  "payload": {},
  "before": {},
  "after": {},
  "created_at": "datetime"
}
```

索引：

```text
index(graph_id, created_at)
unique(graph_id, operation_id)
```

### 4.6 pdf_annotation_documents

复杂 PDF 批注文档。当前 MySQL `pdf_annotations` 可先承担基础批注，后续将坐标和跨页高亮信息写入本集合。

```json
{
  "_id": "ObjectId",
  "material_id": "uuid",
  "user_id": "uuid",
  "schema_version": 1,
  "annotations": [
    {
      "id": "annotation_uuid",
      "page": 12,
      "quote": "摘录文本",
      "comment": "理解说明",
      "color": "#f0d080",
      "rects": [
        { "page": 12, "x": 120, "y": 240, "width": 300, "height": 24 }
      ],
      "source_range": {},
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "bookmarks": [
    { "page": 12, "label": "关键章节", "created_at": "datetime" }
  ],
  "updated_at": "datetime"
}
```

索引：

```text
unique(material_id, user_id)
index(user_id, updated_at)
```

### 4.7 material_text_documents

PDF 或资料全文抽取结果。

```json
{
  "_id": "ObjectId",
  "material_id": "uuid",
  "file_id": "uuid",
  "extract_status": "done",
  "pages": [
    {
      "page": 1,
      "text": "页面文本",
      "blocks": []
    }
  ],
  "plain_text": "全文",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

索引：

```text
unique(material_id, file_id)
text(plain_text)
```

### 4.8 ai_conversations

AI 学习助手会话上下文。

```json
{
  "_id": "ObjectId",
  "conversation_id": "uuid",
  "user_id": "uuid",
  "source_refs": [
    { "type": "material", "id": "uuid" },
    { "type": "note", "id": "uuid" }
  ],
  "messages": [
    {
      "role": "user",
      "content": "解释这一页",
      "created_at": "datetime"
    }
  ],
  "summary": "会话摘要",
  "updated_at": "datetime"
}
```

索引：

```text
unique(conversation_id)
index(user_id, updated_at)
```

### 4.9 ai_drafts

AI 生成的待确认草稿。

```json
{
  "_id": "ObjectId",
  "task_id": "uuid",
  "user_id": "uuid",
  "draft_type": "graph_nodes",
  "source_refs": [],
  "result_json": {},
  "status": "pending",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

索引：

```text
unique(task_id)
index(user_id, status)
```

### 4.10 diagram_source_documents

工程图源代码和解析结果。

```json
{
  "_id": "ObjectId",
  "diagram_source_id": "uuid",
  "graph_id": "uuid",
  "source_type": "mermaid",
  "source_content": "graph TD; A-->B;",
  "parsed_document": {},
  "parse_errors": [],
  "updated_at": "datetime"
}
```

索引：

```text
unique(diagram_source_id)
index(graph_id, updated_at)
```

### 4.11 user_workspace_states

用户端工作区状态，例如当前打开的面板、阅读器布局、图谱视口偏好。

```json
{
  "_id": "ObjectId",
  "user_id": "uuid",
  "workspace_type": "reader",
  "state_json": {},
  "updated_at": "datetime"
}
```

索引：

```text
unique(user_id, workspace_type)
```

## 5. MySQL 与 MongoDB 写入流程

### 5.1 笔记保存

```text
1. 校验用户权限。
2. MySQL notes 更新标题、摘要、归属、版本号、更新时间。
3. MongoDB note_documents 更新 blocks/html/markdown/plain_text。
4. MySQL note_versions 记录版本索引。
5. MongoDB note_snapshots 记录内容快照。
6. 写入 search_sync_jobs，异步同步搜索索引。
```

当前阶段可以先保留 MySQL `notes.content`，等块编辑器稳定后再迁移为 MongoDB 主内容。

当前实现状态：

- 已接入 `notes` -> `note_documents`
- 已接入 `note_versions` -> `note_snapshots`
- 当前读取仍以 MySQL `notes.content` 为主，MongoDB 作为双写落点

### 5.2 图谱保存

```text
1. MySQL graphs 保存图谱主记录、权限、版本和统计。
2. MongoDB graph_documents 保存完整 nodes/edges/groups/viewport。
3. 自动保存只更新 graph_documents 和 graphs.updated_at。
4. 用户手动保存或重要节点变更时写 graph_snapshots。
5. 后续协作或撤销增强时写 graph_operations。
```

### 5.3 PDF 批注保存

```text
1. MySQL reading_progress 保存进度摘要。
2. 基础批注可继续写 MySQL pdf_annotations。
3. 页面坐标、跨页选区、高亮矩形写 MongoDB pdf_annotation_documents。
4. 批注可通过 note_relations、graph_relations、cards.source_id 进入学习闭环。
```

### 5.4 AI 草稿落地

```text
1. MySQL ai_tasks 保存任务状态和用量。
2. MongoDB ai_drafts 保存生成结果。
3. 用户确认后再写入 notes、graphs、cards 等正式业务表。
4. 未确认 AI 结果不直接污染主业务数据。
```

## 6. 分阶段落地路线

### Phase A：当前阶段

保持并规范现有 MySQL 表：

```text
users
refresh_tokens
files
posts
comments
post_likes
post_favorites
materials
material_favorites
material_ratings
reading_progress
pdf_annotations
notes
note_versions
note_relations
audit_logs
```

MongoDB 先接入：

```text
note_documents
note_snapshots
pdf_annotation_documents
material_text_documents
```

### Phase B：图谱画布 MVP

新增 MySQL：

```text
graphs
graph_permissions
graph_versions
graph_relations
graph_operation_logs
```

新增 MongoDB：

```text
graph_documents
graph_snapshots
graph_operations
user_workspace_states
```

### Phase C：卡片与 AI

新增 MySQL：

```text
decks
cards
card_schedules
card_reviews
ai_tasks
ai_usage_logs
ai_quota_logs
```

新增 MongoDB：

```text
ai_conversations
ai_drafts
```

### Phase D：工程图与代码分析

新增 MySQL：

```text
diagram_templates
diagram_shape_libraries
diagram_sources
diagram_validations
code_analysis_tasks
```

新增 MongoDB：

```text
diagram_source_documents
```

### Phase E：搜索与 RAG

新增 MySQL：

```text
search_sync_jobs
document_chunks
embedding_tasks
rag_query_logs
```

新增 MongoDB：

```text
material_text_documents
note_search_documents
graph_search_documents
```

接入：

```text
Meilisearch
Elasticsearch
向量数据库
```

## 7. 建库建议

MySQL：

```sql
CREATE DATABASE IF NOT EXISTS studymate
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
```

MongoDB：

```javascript
use studymate_content
db.createCollection("note_documents")
db.createCollection("note_snapshots")
db.createCollection("graph_documents")
db.createCollection("graph_snapshots")
db.createCollection("pdf_annotation_documents")
db.createCollection("material_text_documents")
db.createCollection("ai_conversations")
db.createCollection("ai_drafts")
db.createCollection("diagram_source_documents")
db.createCollection("user_workspace_states")
```

MongoDB 索引建议在模块接入时随代码或迁移脚本创建，避免一开始创建大量未使用索引。

## 8. 后续实现建议

1. 当前 GORM AutoMigrate 可以继续用于开发期，但应在 `backend/internal/migrations` 增加正式迁移脚本。
2. 下一阶段先接入 MongoDB 的 `note_documents`，让笔记从 HTML 文本过渡到块文档。
3. 图谱模块开始前，先实现 `graphs + graph_documents`，不要把节点和边拆成大量 MySQL 行。
4. PDF 高亮的页面坐标进入 MongoDB，MySQL 只保留摘要和关联。
5. 所有跨模块引用统一使用 `target_type + target_id`，为资料、笔记、图谱、卡片、社区内容打通做准备。
