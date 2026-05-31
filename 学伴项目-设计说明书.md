# 学伴项目：对标 Project Graph 的升级设计

## 1. 设计基准

参考项目：[graphif/project-graph](https://github.com/graphif/project-graph)

`Project Graph` 的实现程度不是普通“思维导图组件”级别，而是一个桌面级节点图谱编辑器。它的关键能力包括：

- 基于画布的节点图谱编辑。
- 节点、连线、分组、图片、URL、LaTeX、手绘笔迹等多类型对象。
- 拖拽、缩放、框选、连接、删除、改色、调整大小等复杂交互。
- 直线边、曲线边、多目标边等多种关系表达。
- 撤销/重做、历史记录、自动保存、文件备份。
- Markdown/Mermaid/图片/SVG/PNG 等导入导出能力。
- 快捷键、右键菜单、设置面板、主题、多语言。
- AI 工具、自动布局、内容搜索、引用扫描、插件扩展。
- Tauri + React + TypeScript + Rust 的桌面应用工程复杂度。

因此，学伴项目里的“思维导图”不能按 `Markmap` 这种展示型导图来做，而应该升级为：

> 学习知识图谱画布：支持笔记节点、资料节点、卡片节点、概念节点、公式节点、图片节点、PDF 锚点节点之间的自由连接、结构化组织、AI 生成、复习转化和长期沉淀。

但 Project Graph 只作为“画布引擎”的标杆。整个学伴项目的实现程度，应按每个模块对应赛道的头部产品来规划，而不是让所有模块都围绕画布展开。

全项目参考标杆：

```text
笔记/知识库：Notion、Obsidian、Logseq、RemNote
资料/文献/PDF：Zotero、Readwise Reader、Mendeley、MarginNote、LiquidText
AI 学习助手：NotebookLM、Notion AI、Quizlet AI、ChatGPT Study/Projects 类产品
卡片复习：Anki、Quizlet、RemNote、Mochi
学习社区：小红书、Medium、Discourse、Reddit
课程/作业/评测：Canvas LMS、Moodle、Coursera、GitHub Classroom
画布/工程图：Project Graph、draw.io、Miro、Lucidchart、Excalidraw、tldraw、Mermaid、PlantUML、Structurizr
后台运营：Discourse Admin、Reddit Mod Tools、Strapi、Retool、Metabase
```

设计原则：

- 每个模块都要达到对应赛道“可用产品”的深度。
- 不做功能孤岛，所有模块通过资料、笔记、图谱、卡片、AI、社区形成学习闭环。
- MVP 可以分阶段实现，但最终设计不能只停留在 CRUD。

## 2. 总体产品定位升级

项目名称建议：`StudyMate Graph`

产品不再只是“学习社区 + 资料库 + 笔记 + AI”，而是一个以知识图谱画布为核心的学习平台。

核心闭环：

```text
资料阅读 -> 笔记沉淀 -> 图谱组织 -> AI 辅助理解 -> Anki 卡片复习 -> 社区分享/讨论
```

产品端划分：

- 前台用户端：社区、资料库、PDF 阅读器、笔记编辑器、知识图谱画布、Anki 复习、AI 学习助手。
- 后台管理端：用户、内容、资料、图谱模板、AI 任务、举报审核、运营推荐、系统配置。
- 教学/课程端：课程空间、作业、测验、学习数据、班级/小组管理，可作为二期。
- 可选桌面端：后续使用 Tauri 包装前端，实现本地文件、离线图谱、快捷键和桌面体验。

## 3. 技术栈升级

已检测到本机环境：

- Go：`go1.26.2`
- Node.js：`v24.11.1`
- npm：`11.6.2`
- MySQL：`8.0.39`
- 全局 TypeScript CLI：未检测到
- MongoDB Server：已检测到，服务名 `MongoDB`，版本 `8.3.2`，运行在 `127.0.0.1:27017`

推荐主栈：

```text
后端：Go + Gin + GORM + MySQL
前台：React + Vite + TypeScript
后台：Vue 3 + TypeScript + Element Plus
图谱画布：React + Canvas 2D + Zustand/Jotai + 自研图对象模型
富文本：Plate.js 或 Tiptap
PDF：PDF.js
AI：OpenAI 兼容接口
搜索：Meilisearch 起步，后续按复杂度升级到 Elasticsearch 或双引擎并存
文件：本地存储起步，后续 MinIO/OSS/COS
缓存：Redis
异步任务：Asynq/RabbitMQ/Redis Stream 可选
```

图谱画布不建议完全依赖现成 mindmap 库。可以借鉴 Project Graph 的模式，自研一个轻量版本：

```text
GraphCanvas
├── Camera               # 平移、缩放、坐标转换
├── StageObject          # 画布对象基类
├── Entity               # 可显示实体
├── Association          # 关系/连线
├── Renderer             # Canvas 渲染
├── Controller           # 鼠标、触控、键盘交互
├── HistoryManager       # 撤销/重做
├── LayoutEngine         # 自动布局
├── ImportExportEngine   # 导入导出
└── GraphAIEngine        # AI 生成和扩展图谱
```

### 3.1 当前 MongoDB 检查结果

本机 MongoDB 状态：

```text
MongoDB Server：8.3.2
Windows 服务名：MongoDB
服务状态：Running
启动方式：Automatic
监听地址：127.0.0.1:27017
mongod 路径：E:\install\mongo\Server\8.3\bin\mongod.exe
mongosh 路径：E:\install\mongo\mongosh\mongosh.exe
数据目录：E:\install\mongo\Server\8.3\data
日志文件：E:\install\mongo\Server\8.3\log\mongod.log
当前数据库：admin、config、local
业务数据库：暂未创建
```

当前配置只绑定本机 `127.0.0.1`，适合本地开发。`mongosh` 没有加入系统 PATH，但可以通过完整路径调用。

### 3.2 数据库与检索总体架构

最终推荐架构：

```text
MySQL：业务主库
MongoDB：复杂 JSON 内容，如笔记块、图谱数据、AI 上下文
Meilisearch：第一阶段全文搜索、筛选、搜索体验
Elasticsearch：后期替换或补充 Meilisearch，承担复杂搜索、聚合统计、日志分析、混合检索
向量数据库：专业 RAG 语义检索，先放入计划，暂不实现
Redis：缓存、限流、验证码、会话状态、异步队列
对象存储：PDF、图片、附件、封面、导出文件
```

数据流建议：

```text
用户写入业务数据
-> MySQL 保存主记录和权限状态
-> MongoDB 保存大块 JSON/快照/上下文
-> Redis 处理缓存、限流、任务队列
-> 异步任务同步可搜索字段到 Meilisearch
-> 后期同步到 Elasticsearch 做复杂分析
-> 后期抽取资料/笔记/PDF 分片，写入向量数据库做 RAG
```

### 3.3 MySQL：业务主库

MySQL 负责项目里的“权威业务事实”。凡是需要事务、权限、审核、统计、关联查询的数据，都优先放 MySQL。

适合模块：

```text
用户与权限：users、roles、permissions、user_roles
认证与安全：login_logs、refresh_tokens、oauth_accounts
社区：posts、comments、likes、favorites、follows、reports
资料库：materials、material_categories、material_tags、material_files
笔记索引：notes、note_folders、note_tags、note_relations
图谱索引：graphs、graph_permissions、graph_versions
卡片复习：decks、cards、card_reviews、review_schedules
课程作业：courses、chapters、assignments、submissions、grades
AI 计费与任务：ai_tasks、ai_usage_logs、ai_quota_logs
后台：audit_logs、moderation_tasks、system_configs
文件索引：files、file_usages、storage_objects
搜索同步：search_sync_jobs
```

MySQL 中笔记和图谱只保存索引级信息，例如标题、作者、权限、状态、版本、更新时间、统计字段；正文块、画布节点等复杂内容交给 MongoDB。

推荐命名：

```text
数据库名：studymate
字符集：utf8mb4
排序规则：utf8mb4_0900_ai_ci
```

### 3.4 MongoDB：复杂 JSON 内容库

MongoDB 负责结构灵活、字段变化频繁、嵌套很深的内容。它不是业务主库，而是内容文档库。

推荐数据库名：

```text
studymate_content
```

推荐集合：

```text
note_blocks
- note_id
- user_id
- version
- blocks
- plain_text
- updated_at

note_snapshots
- note_id
- user_id
- version
- blocks
- html
- markdown
- created_at

graph_documents
- graph_id
- user_id
- version
- nodes
- edges
- groups
- viewport
- theme
- metadata
- updated_at

graph_snapshots
- graph_id
- user_id
- version
- document
- thumbnail_file_id
- created_at

diagram_sources
- graph_id
- source_type
- source_content
- parsed_document
- parse_errors
- updated_at

pdf_annotations
- material_id
- user_id
- annotations
- highlights
- bookmarks
- updated_at

ai_conversations
- conversation_id
- user_id
- source_refs
- messages
- summary
- updated_at

ai_drafts
- task_id
- user_id
- draft_type
- source_refs
- result_json
- status
- created_at

user_workspace_states
- user_id
- workspace_type
- state_json
- updated_at
```

索引建议：

```text
note_blocks：note_id 唯一索引，user_id + updated_at 普通索引
graph_documents：graph_id 唯一索引，user_id + updated_at 普通索引
pdf_annotations：material_id + user_id 唯一索引
ai_conversations：conversation_id 唯一索引，user_id + updated_at 普通索引
ai_drafts：task_id 唯一索引，user_id + status 普通索引
```

设计原则：

- MySQL 保存 `note_id/graph_id/material_id` 的主记录。
- MongoDB 文档用这些 ID 作为业务外键。
- 删除 MySQL 主记录时，通过后台任务清理 MongoDB 文档。
- MongoDB 内容保存版本号，防止并发覆盖。
- 大文件不要放 MongoDB，PDF/图片/附件放对象存储，只在 MongoDB 保存引用。

### 3.5 Meilisearch：第一阶段全文搜索

第一阶段建议用 Meilisearch 做全文搜索，因为部署简单、搜索体验好、开发快。

推荐索引：

```text
posts
materials
notes
graphs
cards
courses
users
```

每个索引保存“搜索摘要文档”，不保存完整业务数据。例如：

```json
{
  "id": "note_10001",
  "type": "note",
  "title": "GORM 关联查询总结",
  "summary": "Preload、Joins、一对多、多对多...",
  "tags": ["Go", "GORM", "数据库"],
  "owner_id": 12,
  "visibility": "private",
  "updated_at": "2026-05-26T10:00:00+08:00"
}
```

同步策略：

```text
MySQL/MongoDB 内容变更
-> 写入 search_sync_jobs
-> Redis 队列触发 worker
-> worker 汇总 MySQL 索引字段 + MongoDB plain_text
-> 写入 Meilisearch
```

第一阶段搜索能力：

- 全站搜索。
- 分类搜索。
- 标签筛选。
- 作者/时间筛选。
- 搜索结果高亮。
- 搜索建议。
- 拼写容错。

### 3.6 Elasticsearch：后期复杂搜索与分析

Elasticsearch 第一阶段不急着上，可以作为 Meilisearch 的后续升级或并行分析系统。

适合后期承担：

```text
大规模全文搜索
PDF 全文搜索
复杂聚合统计
搜索日志分析
运营数据分析
接口日志和错误日志检索
社区内容热度分析
AI/RAG 混合检索：关键词 + 向量
```

迁移策略：

- 第一阶段只用 Meilisearch。
- 搜索同步任务抽象成 `SearchIndexer` 接口。
- 后期增加 `ElasticsearchIndexer` 实现。
- 保留 Meilisearch 做轻量前台搜索，Elasticsearch 做后台分析和复杂检索；或者完全切换到 Elasticsearch。

### 3.7 向量数据库：RAG 计划，不急实现

向量数据库先放入长期规划，不作为第一阶段开发内容。

未来适合接入：

```text
PDF 多文档问答
笔记语义检索
资料相似推荐
图谱节点语义补全
AI 找前置知识
AI 生成学习路径
跨资料综合问答
相似卡片检测
```

候选方案：

```text
Qdrant：轻量、清晰，适合作为独立向量库
Milvus：大规模向量检索能力强，部署更重
Weaviate：功能完整，带对象模型
Chroma：适合原型和本地实验
pgvector：如果未来改用 PostgreSQL，可直接集成
Elasticsearch Vector Search：如果后期已使用 ES，可做混合检索
```

未来 RAG 数据流：

```text
PDF/笔记/资料
-> 文本抽取
-> 分片 chunk
-> embedding
-> 向量数据库
-> 用户提问
-> 向量召回相关片段
-> 结合 MySQL 权限过滤
-> 交给 AI 生成带来源回答
```

当前只需要在设计上预留：

- `document_chunks`
- `embedding_tasks`
- `rag_query_logs`
- 内容权限过滤逻辑
- 文档分片与来源定位字段

### 3.8 Redis：缓存、限流、队列

Redis 不保存权威业务数据，主要做高频、短生命周期、异步处理。

适合用途：

```text
登录验证码
短信/邮箱验证码
JWT 黑名单
Refresh Token 状态缓存
接口限流
AI 调用限流
搜索同步队列
文件处理队列
PDF 文本抽取队列
AI 任务队列
热点帖子缓存
资料详情缓存
用户会话状态
排行榜缓存
分布式锁
```

推荐 Key 设计：

```text
captcha:email:{email}
rate_limit:user:{user_id}:{api}
rate_limit:ip:{ip}:{api}
jwt:blacklist:{jti}
cache:post:{post_id}
cache:material:{material_id}
queue:search_sync
queue:ai_task
queue:pdf_extract
lock:graph:{graph_id}
```

第一阶段可以只实现：

- 验证码缓存。
- 接口限流。
- AI 限流。
- 搜索同步队列。
- 热点数据缓存。

### 3.9 各模块数据库分工

```text
用户、权限、角色：MySQL
帖子、评论、点赞、收藏：MySQL
帖子正文搜索摘要：Meilisearch
资料基础信息：MySQL
PDF 文件：对象存储
PDF 文本抽取结果：MongoDB，后期同步 Meilisearch/Elasticsearch
PDF 高亮批注：MongoDB
笔记标题、权限、归属：MySQL
笔记块 JSON：MongoDB
笔记搜索摘要：Meilisearch
图谱标题、权限、版本：MySQL
图谱节点、边、画布 JSON：MongoDB
工程图源代码和解析结果：MongoDB
图谱节点搜索摘要：Meilisearch
卡片、复习记录、调度：MySQL
AI 任务、用量、配额：MySQL
AI 对话上下文、生成草稿：MongoDB
课程、作业、成绩：MySQL
后台审核、日志：MySQL
缓存、限流、队列：Redis
语义检索：向量数据库，后期实现
复杂分析和日志搜索：Elasticsearch，后期实现
```

### 3.10 第一阶段落地方案

为了避免一开始组件过多，推荐第一阶段这样落地：

```text
必须实现：
- MySQL
- MongoDB
- Redis

建议实现：
- Meilisearch

暂缓实现：
- Elasticsearch
- 向量数据库
```

第一阶段数据库职责：

```text
MySQL：完整业务主库
MongoDB：笔记块、图谱文档、PDF 批注、AI 上下文
Redis：缓存、限流、队列
Meilisearch：全站搜索
```

后期升级路线：

```text
搜索复杂后：Meilisearch -> Elasticsearch 或双引擎并存
AI 问答成熟后：增加向量数据库
数据量增大后：增加异步任务、索引重建、快照归档、冷热数据分层
```

## 4. 全项目模块对标升级矩阵

本项目不是单个工具，而是一个综合学习平台。每个模块都要选择对应赛道的成熟产品作为标杆，并明确“最低可接受实现程度”。

### 4.1 笔记与知识库模块

参考产品：Notion、Obsidian、Logseq、RemNote、Craft、Heptabase。

目标定位：

```text
块编辑器 + 双链知识库 + 数据库视图 + 图谱视图 + AI 笔记助手
```

必须能力：

- 块级编辑，而不是只保存一整段 HTML。
- 支持富文本、Markdown 快捷输入、代码块、公式、表格、图片、附件、引用块、Callout。
- 支持双链：`[[概念]]`、反向链接、未创建页面提示。
- 支持标签、目录树、收藏、最近编辑。
- 支持块级引用和段落级评论。
- 支持页面模板，例如读书笔记、论文笔记、课程笔记、项目复盘。
- 支持数据库视图：表格、看板、列表、日历，可管理学习计划、资料清单、卡片组。
- 支持版本历史和恢复。
- 支持导出 Markdown、HTML、PDF。
- 支持与资料、PDF 高亮、图谱节点、Anki 卡片互相引用。
- AI 支持总结、改写、生成大纲、生成提问、生成卡片、生成图谱分支。

MVP 标准：

- 富文本/Markdown 编辑器。
- 页面/文件夹/标签。
- 双链和反链。
- 版本历史。
- 与资料、图谱、卡片的引用关系。

进阶标准：

- 块数据库。
- 协作编辑。
- 离线缓存。
- 插件系统。
- 页面发布和分享。

### 4.2 资料库、文献与 PDF 阅读模块

参考产品：Zotero、Readwise Reader、Mendeley、MarginNote、LiquidText、Google Scholar Library。

目标定位：

```text
资料管理 + PDF 深度阅读 + 高亮批注 + 引文管理 + AI 源材料问答
```

必须能力：

- 支持书籍、论文、课程资料、讲义、题库、网页链接、视频链接。
- 支持元数据：标题、作者、出版社、年份、ISBN/DOI、摘要、关键词、分类、标签。
- 支持 PDF 上传、在线预览、缩略图、目录、页码跳转、全文搜索。
- 支持高亮、下划线、批注、书签。
- 支持选区生成笔记、图谱节点、Anki 卡片。
- 支持资料收藏、评分、评论、阅读进度。
- 支持集合/文件夹管理。
- 支持重复资料检测。
- 支持 BibTeX/RIS/EndNote 导入导出，至少作为二期。
- 支持引用格式生成，至少 APA/MLA/GB/T 7714。
- AI 支持基于资料的总结、问答、术语表、学习指南、卡片和测验生成。

MVP 标准：

- 资料 CRUD。
- PDF 上传和阅读。
- 高亮、批注、书签。
- 资料元数据和标签。
- 从 PDF 选区生成笔记/卡片/图谱节点。

进阶标准：

- 文献引用管理。
- PDF 全文索引。
- 资料去重。
- 多来源导入。
- 阅读稍后看队列。
- AI 源材料问答带引用定位。

### 4.3 学习社区模块

参考产品：小红书、Medium、Discourse、Reddit、知乎、掘金。

目标定位：

```text
学习内容社区 + 资料分享 + 知识作品发布 + 问答讨论 + 内容治理
```

必须能力：

- 支持图文帖、长文帖、资料推荐帖、图谱分享帖、问题求助帖。
- 支持 Markdown/富文本发帖。
- 支持封面、多图、附件、资料引用、笔记引用、图谱引用、卡片组引用。
- 支持话题、标签、合集、专栏。
- 支持推荐流、关注流、最新流、热门流、问答流。
- 支持点赞、收藏、评论、楼中楼、转发。
- 支持草稿箱、编辑历史、内容版本。
- 支持用户主页、关注、粉丝、学习成就展示。
- 支持举报、审核、敏感词、封禁、内容下架。
- 支持社区等级、徽章、积分、精华内容。
- AI 支持长讨论总结、评论摘要、问答候选答案、违规检测。

MVP 标准：

- 发帖、评论、点赞、收藏。
- 标签和分类。
- 用户主页。
- 后台审核和举报。

进阶标准：

- 推荐算法。
- 关注流。
- 专栏/合集。
- 社区积分和信任等级。
- AI 话题总结。
- 内容 SEO。

### 4.4 卡片复习模块

参考产品：Anki、Quizlet、RemNote、Mochi、Memrise。

目标定位：

```text
间隔重复 + 多类型知识卡片 + AI 制卡 + 与资料/笔记/图谱闭环
```

必须能力：

- 卡片组 Deck。
- 基础卡、反向卡、填空卡、选择题卡、图片遮挡卡、代码卡。
- 支持文字、图片、音频、公式、代码。
- 支持 SM-2 或 FSRS 风格的间隔重复算法。
- 支持今日复习、逾期复习、新卡学习、复习队列。
- 支持复习评价：忘记、困难、一般、简单。
- 支持掌握度、正确率、连续学习天数、热力图。
- 支持从笔记、PDF 高亮、图谱节点、AI 输出生成卡片。
- 支持卡片与来源反向跳转。
- 支持导入导出 CSV/Markdown，二期支持 Anki apkg。
- 支持共享卡组和社区卡组。

MVP 标准：

- Deck/Card CRUD。
- 今日复习。
- SM-2 调度。
- 从笔记/PDF/图谱生成卡片。
- 基础统计。

进阶标准：

- 图片遮挡。
- 卡片模板。
- 卡组市场。
- Anki 导入导出。
- FSRS。
- 错题与薄弱知识图谱联动。

### 4.5 AI 学习助手模块

参考产品：NotebookLM、Notion AI、ChatGPT Projects、Perplexity Spaces、Quizlet AI、Khanmigo。

目标定位：

```text
基于用户资料和笔记的源材料 AI 学习助手
```

必须能力：

- 支持把资料、PDF、网页、笔记、图谱作为 AI 上下文。
- 支持带来源引用的问答。
- 支持总结、学习指南、术语表、FAQ、时间线、测验、卡片、思维导图。
- 支持对选中文本、选中节点、选中资料进行局部 AI 操作。
- 支持 AI 生成内容进入“待确认”状态。
- 支持 AI 任务历史。
- 支持用户配额、调用日志、失败重试。
- 支持后台查看 AI 成本、模型、Token 用量。
- 支持提示词模板库。
- 支持教师/管理员配置可用 AI 功能。

MVP 标准：

- 摘要、解释、生成卡片、生成图谱。
- AI 任务记录。
- 用户配额。
- 来源内容输入。

进阶标准：

- RAG。
- 向量检索。
- 多资料问答。
- 引用定位。
- 语音/音频概览。
- 个性化学习导师。

### 4.6 课程、学习路径与作业模块

参考产品：Canvas LMS、Moodle、Coursera、GitHub Classroom、ClassIn、雨课堂。

目标定位：

```text
自学路径 + 班级课程 + 作业测验 + 学习数据
```

必须能力：

- 支持学习路径：章节、任务、资料、笔记、图谱、卡片。
- 支持课程空间：课程介绍、章节、资源、讨论区、成员。
- 支持作业：文本作业、文件作业、链接作业、图谱作业、代码作业。
- 支持测验：单选、多选、判断、填空、简答。
- 支持截止时间、提交记录、批改、评分。
- 支持学习进度和完成度。
- 支持班级/小组管理。
- 支持通知和日程。
- 代码学习场景支持 Git 仓库作业和自动评分，二期实现。

MVP 标准：

- 学习路径。
- 课程资源。
- 简单作业和测验。
- 进度统计。

进阶标准：

- 自动批改。
- GitHub Classroom 风格代码作业。
- SCORM/LTI 兼容。
- 教师分析报表。

### 4.7 搜索、推荐与个人工作台

参考产品：Notion Enterprise Search、Readwise Reader、Reddit/小红书推荐流、GitHub Search、Algolia 文档搜索。

目标定位：

```text
统一搜索 + 个性化推荐 + 学习仪表盘
```

必须能力：

- 全局搜索：帖子、资料、笔记、图谱、卡片、课程。
- 支持筛选：类型、标签、作者、时间、收藏、来源。
- 支持最近访问和快速打开。
- 支持全文搜索和高亮。
- 支持个人学习仪表盘：今日复习、正在读、未完成任务、最近笔记、推荐资料。
- 支持推荐：热门内容、相似资料、相关笔记、薄弱知识复习。
- 支持搜索日志和点击日志，为推荐做数据基础。

MVP 标准：

- MySQL FULLTEXT 或简单搜索。
- 多类型聚合结果。
- 个人首页。

进阶标准：

- Elasticsearch/Meilisearch。
- 向量语义搜索。
- 个性化推荐。
- 搜索质量统计。

### 4.8 后台管理与运营模块

参考产品：Discourse Admin、Reddit Mod Tools、Strapi、Retool、Metabase、Moodle Admin。

目标定位：

```text
内容治理 + 用户管理 + 资料审核 + AI 成本控制 + 数据分析
```

必须能力：

- 用户管理：角色、状态、封禁、AI 配额、登录记录。
- 内容管理：帖子、评论、资料、笔记公开页、图谱公开页、卡组。
- 审核队列：待审、通过、驳回、下架、申诉。
- 举报处理：举报类型、证据、处理记录。
- 分类标签管理。
- 模板管理：笔记模板、图谱模板、工程图模板、卡片模板。
- AI 管理：模型配置、调用记录、Token 用量、失败任务、成本统计。
- 文件管理：上传文件、PDF、封面、附件、违规文件。
- 数据看板：用户增长、活跃、内容增长、资料下载、AI 用量、复习完成率。
- 操作日志和权限审计。

MVP 标准：

- 用户、帖子、评论、资料、举报审核。
- 分类标签。
- AI 任务和配额。
- 基础数据看板。

进阶标准：

- 审核工作流。
- 风控规则。
- 内容质量评分。
- 数据分析大屏。
- 自动化运营任务。

### 4.9 协作、分享与权限模块

参考产品：Notion Workspace、Google Docs、Miro、Figma、Obsidian Publish/Sync。

目标定位：

```text
个人知识库起步，逐步扩展到团队/班级协作
```

必须能力：

- 私有、公开、链接可见、指定用户可见。
- 资源级权限：资料、笔记、图谱、卡组、课程。
- 分享链接。
- 只读预览。
- 评论和协作讨论。
- 版本历史。
- 操作审计。

MVP 标准：

- 私有/公开。
- 分享链接。
- 评论。

进阶标准：

- 多人实时协作。
- 细粒度权限。
- 团队空间。
- 离线同步。

### 4.10 移动端与跨端体验

参考产品：Notion、AnkiMobile/AnkiDroid、Readwise Reader、Moodle App、Obsidian Mobile。

目标定位：

```text
Web 优先，移动端支持轻量学习和复习
```

必须能力：

- 响应式 Web。
- 移动端阅读资料、看帖子、记轻量笔记、复习卡片。
- 图谱移动端以浏览为主，编辑为辅。
- 离线缓存复习队列，二期实现。
- PWA 可选。

MVP 标准：

- 响应式布局。
- 移动端复习和阅读。

进阶标准：

- PWA。
- 离线缓存。
- 原生 App 或 Tauri/Capacitor 包装。

## 5. 知识图谱画布设计

### 5.1 目标

实现一个接近 Project Graph 复杂度的图谱编辑器，但服务于学习场景。

它不是单纯“思维导图”，而是：

- 思维导图
- 概念图谱
- 学习路径图
- 资料关系图
- 知识卡片网络
- 笔记结构图
- PDF 章节与知识点索引图

同时，画布引擎要支持软件工程体系中的常见工程图便捷创建。它不应只是“自由画布”，还要有专业图表模式、模板库、符号库、自动布局、文本转图、AI 生成、规范校验和导入导出。

对标方向：

- draw.io/diagrams.net：丰富模板、形状库、连接器、图层、标签、自动布局、Mermaid/SQL/CSV 生成图、在线/离线/多平台。
- Lucidchart/Miro：实时协作、模板、AI 生成、跨工具导入、团队工作区。
- Mermaid/PlantUML：diagram-as-code，适合开发者在文档、代码评审和版本管理中维护图。
- Structurizr/C4：从统一模型生成多层软件架构图。
- Excalidraw/tldraw：无限画布、手绘风、嵌入式 SDK、白板体验。

### 5.2 画布对象模型

基础对象：

```text
StageObject
- id
- graph_id
- type
- x
- y
- width
- height
- z_index
- selected
- locked
- hidden
- style_json
- created_at
- updated_at
```

实体对象：

```text
GraphEntity
- TextNode         文本/概念节点
- RichNoteNode     富文本笔记节点
- MaterialNode     资料/书籍节点
- PdfAnchorNode    PDF 页码/选区锚点
- CardNode         Anki 卡片节点
- ImageNode        图片节点
- FormulaNode      公式节点
- CodeNode         代码节点
- LinkNode         外链节点
- GroupNode        分组/区域
- TodoNode         学习任务节点
```

关系对象：

```text
GraphEdge
- StraightEdge         直线关系
- CurveEdge            曲线关系
- DashedEdge           弱关系/引用关系
- DirectedEdge         有向关系
- UndirectedEdge       无向关系
- MultiTargetEdge      多目标关系
- SyncEdge             同步关系，例如笔记节点与卡片节点
```

关系语义：

```text
包含
前置知识
推导
例子
反例
引用
相关
属于
需要复习
来自资料
生成卡片
```

### 5.3 画布核心交互

至少要达到以下能力：

- 鼠标拖拽创建节点。
- 节点自由移动、缩放、旋转可选。
- 节点自动根据文本撑开尺寸。
- 节点之间拖拽连接。
- 连线可编辑标签。
- 连线可切换直线、折线、曲线、虚线、箭头。
- 支持框选、多选、批量移动、批量删除、批量改色。
- 支持画布平移、缩放、缩放到选中、重置视野。
- 支持右键菜单。
- 支持快捷键。
- 支持撤销/重做。
- 支持自动保存。
- 支持迷你地图。
- 支持搜索并定位节点。
- 支持节点折叠/展开。
- 支持分组区域。
- 支持只读分享模式。

快捷键建议：

```text
Ctrl + Z       撤销
Ctrl + Y       重做
Ctrl + S       保存
Ctrl + F       搜索
Delete         删除选中
Space + Drag   拖动画布
Ctrl + 滚轮    缩放
Tab            从当前节点创建子节点
Enter          创建同级节点
Alt + Drag     快速连线
Ctrl + A       全选
```

### 5.4 笔记与图谱融合

笔记系统应分为两个视图：

- 文档视图：富文本/Markdown 编辑。
- 图谱视图：节点画布编辑。

二者可以互相转换：

```text
Markdown 标题层级 -> 图谱树
富文本选区 -> 新建概念节点
笔记块 -> 图谱节点
图谱节点 -> 笔记小节
图谱关系 -> 笔记目录/引用关系
```

节点详情可以嵌入富文本：

- 节点标题：用于图谱展示。
- 节点详情：富文本内容，支持图片、公式、代码、表格、引用。
- 节点来源：资料、PDF 页码、帖子、AI 任务、卡片。

### 5.5 PDF 与图谱融合

资料库中的 PDF 不只是预览文件，而是知识图谱来源。

能力：

- PDF 阅读器支持划线、高亮、批注。
- 高亮文字一键生成图谱节点。
- PDF 某一页或某个选区可成为 `PdfAnchorNode`。
- 图谱节点点击后跳转到 PDF 页码。
- AI 可以从选区生成解释、总结、卡片、图谱分支。

### 5.6 Anki 与图谱融合

卡片不再只是列表，而是图谱中的可视化知识点。

能力：

- 从节点生成卡片。
- 从笔记选区生成卡片。
- 从 PDF 高亮生成卡片。
- 从 AI 总结生成卡片。
- 卡片节点显示复习状态：未学、今日待复习、已掌握、易忘。
- 图谱中按颜色标记薄弱知识点。
- 复习后回写图谱节点熟练度。

### 5.7 AI 与图谱融合

AI 功能应围绕画布操作，而不是单独聊天。

AI 工具：

```text
选中节点 -> 解释概念
选中节点 -> 展开子知识点
选中节点 -> 生成例题
选中节点 -> 生成 Anki 卡片
选中多个节点 -> 总结关系
选中多个节点 -> 找出缺失前置知识
选中 PDF 文本 -> 生成图谱分支
选中笔记 -> 生成 Markdown 大纲
整张图谱 -> 生成学习路线
整张图谱 -> 生成复习计划
```

AI 生成结果不能直接覆盖用户内容，应进入“待确认变更”：

- 预览将新增哪些节点。
- 预览将新增哪些连线。
- 用户确认后写入图谱。
- 保存 AI 生成记录，方便审计和回滚。

## 6. 软件工程图谱与 UML 制图能力

这一部分是画布引擎的第二核心：让用户能像使用 draw.io、Lucidchart、Miro、PlantUML、Mermaid、Structurizr 一样快速创建软件工程图，并且把这些工程图与学习笔记、资料库、AI、社区内容关联起来。

### 6.1 支持的工程图类型

UML 图：

```text
用例图 Use Case Diagram
类图 Class Diagram
对象图 Object Diagram
包图 Package Diagram
组件图 Component Diagram
部署图 Deployment Diagram
组合结构图 Composite Structure Diagram
活动图 Activity Diagram
状态机图 State Machine Diagram
时序图 Sequence Diagram
通信图 Communication Diagram
交互概览图 Interaction Overview Diagram
时间图 Timing Diagram
```

软件架构图：

```text
C4 System Landscape
C4 System Context
C4 Container
C4 Component
C4 Code/类级结构
模块依赖图
服务依赖图
微服务架构图
分层架构图
事件驱动架构图
DDD 限界上下文图
领域模型图
```

数据库与数据流图：

```text
ERD 实体关系图
数据库表结构图
数据血缘图
数据流图 DFD
ETL 流程图
消息队列流转图
缓存读写路径图
```

流程与业务建模：

```text
流程图
BPMN 流程图
泳道图
状态流转图
用户旅程图
产品路线图
甘特图
决策树
故障处理流程图
```

云原生与运维图：

```text
网络拓扑图
Kubernetes 架构图
Docker Compose 服务图
CI/CD 流水线图
DevOps 流程图
监控告警链路图
日志链路图
安全威胁模型图
AWS/Azure/GCP/阿里云/腾讯云资源架构图
```

接口与系统交互：

```text
API 调用链路图
OAuth 登录流程图
支付流程图
权限模型图
消息推送流程图
WebSocket 连接状态图
前后端交互图
```

### 6.2 创建方式

用户应有多种创建入口：

```text
1. 从空白画布创建
2. 从模板创建
3. 从文本描述 AI 生成
4. 从 Mermaid 代码生成
5. 从 PlantUML 代码生成
6. 从 Structurizr DSL/C4 模型生成
7. 从 SQL DDL 生成 ERD
8. 从 Go/TypeScript/Java 等代码分析生成类图/依赖图
9. 从 OpenAPI/Swagger 生成接口图
10. 从 Docker Compose/Kubernetes YAML 生成部署图
11. 从 Git 仓库目录结构生成模块图
```

其中 MVP 阶段建议先做：

```text
模板创建
Mermaid 代码生成
SQL DDL -> ERD
OpenAPI -> API 调用概览
AI 文本 -> Mermaid/图谱草稿
```

PlantUML 和 Structurizr 可以作为第二阶段，因为它们涉及更多语法解析和后端渲染/转换。

### 6.3 专业图表模式

普通知识图谱是自由画布，工程图需要增加“规范模式”。

```text
自由模式
- 任意节点和连线
- 适合头脑风暴、学习笔记、知识图谱

UML 模式
- 启用 UML 符号库
- 约束可用连接类型
- 支持类/接口/枚举/包/Actor/UseCase 等对象
- 支持可见性、属性、方法、继承、实现、聚合、组合、依赖

C4 模式
- 启用 Person/System/Container/Component/Relationship
- 支持层级下钻
- 同一模型生成多张视图

ERD 模式
- 启用 Entity/Table/Column/Relationship
- 支持主键、外键、唯一索引、字段类型、Nullable
- 支持从 SQL 反向生成

BPMN/流程模式
- 启用开始、结束、任务、网关、事件、泳道
- 支持流程合法性校验

云架构模式
- 启用云厂商图标库
- 支持 VPC、子网、负载均衡、实例、数据库、对象存储、消息队列等资源
```

### 6.4 符号库与模板库

需要内置模板中心。

模板分类：

```text
UML
C4 架构
数据库 ERD
微服务
云架构
DevOps/CI/CD
BPMN/业务流程
前后端接口
权限认证
AI/RAG 系统架构
课程学习路径
考试知识框架
论文阅读结构
```

符号库：

```text
基础图形
流程图
UML
BPMN
ERD
C4
AWS
Azure
GCP
阿里云
腾讯云
Kubernetes
Docker
前端组件
数据库
消息队列
安全组件
手绘白板组件
```

模板应该支持：

- 预览图。
- 一键插入当前画布。
- 收藏模板。
- 后台管理模板。
- 用户自定义模板。
- 从已有图谱保存为模板。
- 模板版本管理。

### 6.5 连接器与自动布局

工程图的效率重点在连接器和布局。

连接器能力：

- 固定锚点。
- 浮动锚点。
- 自动吸附。
- 直线、折线、曲线。
- 箭头样式。
- 线条标签。
- 起点/终点多重标签。
- 连线避让。
- 连线重路由。
- UML 语义连接：继承、实现、依赖、关联、聚合、组合。
- ERD 连接：一对一、一对多、多对多。
- BPMN 连接：顺序流、消息流、关联。

自动布局：

```text
树形布局
DAG 布局
层次布局
力导向布局
泳道布局
时序图布局
ERD 布局
C4 层级布局
流程图布局
云架构分区布局
```

### 6.6 Diagram-as-Code

头部工具的趋势是“图形编辑 + 文本生成”双向结合。

支持语法：

```text
Mermaid
PlantUML
Structurizr DSL
Graphviz DOT
SQL DDL
OpenAPI YAML/JSON
Docker Compose YAML
Kubernetes YAML
```

建议实现方式：

- 前端内置 Mermaid 渲染和语法预览。
- 后端提供 PlantUML/Graphviz 可选渲染服务。
- Structurizr DSL 第二阶段支持解析为内部 C4 模型。
- 内部统一转换为 `GraphDocument` 数据结构。
- 支持“代码视图”和“画布视图”切换。
- 画布编辑后可导出 Mermaid/PlantUML 的子集。

注意：完全双向转换很难。MVP 可先做到：

```text
文本代码 -> 图谱
图谱 -> 图片/SVG/JSON
部分图谱 -> Mermaid
```

### 6.7 从代码和工程文件生成图

这是学伴项目面向软件学习者的差异化能力。

Go 项目：

- 解析 package。
- 解析 struct/interface。
- 解析方法。
- 生成包依赖图。
- 生成类图风格结构图。
- 生成 Gin 路由图。
- 生成 GORM Model ERD 草稿。

TypeScript 项目：

- 解析模块依赖。
- 解析 interface/type/class。
- 生成组件依赖图。
- 生成 API Client 调用图。

数据库：

- 从 MySQL schema 生成 ERD。
- 从迁移文件生成表结构演化图。

API：

- 从 OpenAPI 生成接口分组图。
- 从接口调用日志生成链路图。

DevOps：

- 从 Docker Compose 生成服务拓扑。
- 从 Kubernetes YAML 生成部署关系图。
- 从 GitHub Actions workflow 生成 CI/CD 流程图。

### 6.8 AI 工程图助手

AI 功能要围绕工程图创建。

```text
需求描述 -> 用例图
接口描述 -> 时序图
数据库字段说明 -> ERD
代码仓库 -> 模块依赖图
后端架构描述 -> C4 Container 图
部署说明 -> 部署图
业务流程描述 -> BPMN/泳道图
事故描述 -> 故障链路图
选中图形 -> 解释该架构
选中图形 -> 检查设计风险
选中图形 -> 生成学习笔记
选中图形 -> 生成 Anki 卡片
```

AI 输出必须有校验：

- Mermaid/PlantUML 语法校验。
- 图对象 schema 校验。
- UML 连接合法性校验。
- C4 层级合法性校验。
- ERD 主外键关系校验。
- 用户确认后才写入画布。

### 6.9 与学习平台的融合

工程图不能孤立存在，要进入学伴的学习闭环。

```text
工程图节点 -> 关联笔记
工程图节点 -> 关联资料/PDF 页码
工程图节点 -> 生成 Anki 卡片
工程图 -> 发布到学习社区
工程图 -> 作为课程作业提交
工程图 -> 导出到报告/PDF
工程图 -> AI 讲解
工程图 -> 生成复习路线
```

典型场景：

- 学 Go Gin 的学生上传一个项目，系统生成路由图、模型 ERD、模块依赖图。
- 学 UML 的学生通过模板创建用例图、类图、时序图，并由 AI 检查规范。
- 学微服务的学生用 C4 模型拆解系统，再把每个组件关联到资料和笔记。
- 学数据库的学生从 SQL 生成 ERD，再对每个表创建卡片复习字段含义。

### 6.10 工程图数据库表补充

```text
diagram_templates
- id
- name
- category
- description
- preview_url
- graph_json
- source_code
- source_type
- status
- created_by
- created_at
- updated_at

diagram_shape_libraries
- id
- name
- category
- icon_url
- schema_json
- style_json
- enabled
- created_at

diagram_sources
- id
- graph_id
- source_type
- source_content
- parsed_json
- parse_status
- error_message
- created_at
- updated_at

diagram_validations
- id
- graph_id
- rule_type
- status
- issues_json
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

### 6.11 工程图 API 补充

```text
GET    /api/v1/diagram/templates
POST   /api/v1/diagram/templates
GET    /api/v1/diagram/shape-libraries
POST   /api/v1/graphs/:id/import/mermaid
POST   /api/v1/graphs/:id/import/plantuml
POST   /api/v1/graphs/:id/import/sql
POST   /api/v1/graphs/:id/import/openapi
POST   /api/v1/graphs/:id/import/docker-compose
POST   /api/v1/graphs/:id/import/kubernetes
POST   /api/v1/graphs/:id/export/mermaid
POST   /api/v1/graphs/:id/export/plantuml
POST   /api/v1/graphs/:id/validate
POST   /api/v1/graphs/:id/layout
POST   /api/v1/code-analysis/upload
POST   /api/v1/code-analysis/repo
GET    /api/v1/code-analysis/tasks/:id
```

### 6.12 实现优先级

第一优先级：

- UML 类图、用例图、时序图。
- ERD。
- 流程图。
- C4 Context/Container。
- Mermaid 导入。
- 模板库。
- PNG/SVG/PDF 导出。

第二优先级：

- PlantUML 导入。
- Structurizr/C4 DSL。
- BPMN。
- Docker Compose/Kubernetes 生成图。
- Go/TypeScript 代码分析。
- AI 生成工程图。

第三优先级：

- 多人实时协作。
- Git 仓库持续分析。
- 工程图版本对比。
- 图与代码变更联动。
- 插件市场。

## 7. 图谱数据存储设计

推荐 MySQL + JSON 字段起步。

### 7.1 表结构

```text
graphs
- id
- user_id
- title
- description
- visibility
- cover_url
- node_count
- edge_count
- version
- status
- created_at
- updated_at

graph_nodes
- id
- graph_id
- user_id
- node_type
- title
- summary
- content_json
- content_html
- source_type
- source_id
- x
- y
- width
- height
- z_index
- color
- style_json
- metadata_json
- created_at
- updated_at

graph_edges
- id
- graph_id
- user_id
- edge_type
- source_node_id
- target_node_id
- label
- relation_type
- source_anchor_json
- target_anchor_json
- style_json
- metadata_json
- created_at
- updated_at

graph_groups
- id
- graph_id
- title
- x
- y
- width
- height
- collapsed
- style_json
- created_at
- updated_at

graph_node_groups
- node_id
- group_id

graph_snapshots
- id
- graph_id
- user_id
- version
- snapshot_json
- thumbnail_url
- created_at

graph_operations
- id
- graph_id
- user_id
- operation_type
- payload_json
- before_json
- after_json
- client_id
- created_at
```

### 7.2 保存策略

MVP：

- 前端本地维护画布状态。
- 每隔 5-10 秒自动保存。
- 保存时提交完整 `nodes + edges + groups`。
- 每次保存产生轻量版本号。

进阶：

- 提交 operation log。
- 服务端异步合并快照。
- 支持历史版本恢复。
- 多端同步时引入 CRDT，例如 Yjs。

## 8. 图谱后端 API

```text
GET    /api/v1/graphs
POST   /api/v1/graphs
GET    /api/v1/graphs/:id
PUT    /api/v1/graphs/:id
DELETE /api/v1/graphs/:id

GET    /api/v1/graphs/:id/nodes
POST   /api/v1/graphs/:id/nodes
PUT    /api/v1/graphs/:id/nodes/:nodeId
DELETE /api/v1/graphs/:id/nodes/:nodeId

GET    /api/v1/graphs/:id/edges
POST   /api/v1/graphs/:id/edges
PUT    /api/v1/graphs/:id/edges/:edgeId
DELETE /api/v1/graphs/:id/edges/:edgeId

POST   /api/v1/graphs/:id/batch-save
POST   /api/v1/graphs/:id/operations
GET    /api/v1/graphs/:id/snapshots
POST   /api/v1/graphs/:id/restore
POST   /api/v1/graphs/:id/export
POST   /api/v1/graphs/:id/import
POST   /api/v1/graphs/:id/thumbnail

POST   /api/v1/graphs/:id/ai/expand
POST   /api/v1/graphs/:id/ai/summarize
POST   /api/v1/graphs/:id/ai/generate-cards
POST   /api/v1/graphs/:id/ai/generate-learning-path
```

## 9. 其他模块的实现程度要求

既然图谱对标 Project Graph，其他模块也不能停留在简单 CRUD。每个模块都要达到“可用产品”的深度。

### 9.1 学习社区

不能只是发帖列表，应实现：

- 富文本/Markdown 发帖。
- 多图、封面、附件、资料引用、图谱引用、卡片引用。
- 话题、标签、合集、专栏。
- 推荐流、关注流、最新流、热门流。
- 评论、楼中楼、点赞、收藏、转发。
- 草稿箱、定时发布可选。
- 内容搜索。
- 用户主页和学习成果展示。
- 举报、审核、敏感词、后台下架。
- 社区内容可以一键转为笔记或图谱节点。

### 9.2 资料库

不能只是书籍表，应实现：

- 书籍/讲义/论文/题库/课程资料多类型。
- ISBN、作者、出版社、版本、简介、目录、封面。
- PDF 上传、预览、下载权限。
- PDF 高亮、批注、书签、阅读进度。
- 全文搜索，至少支持标题、作者、标签、简介；进阶支持 PDF 文本。
- 资料评分、评论、收藏。
- 资料合集和学习路径。
- 后台审核、上下架、版权状态。
- 资料可以生成笔记、图谱、卡片。

### 9.3 笔记系统

不能只是保存文本，应实现：

- 富文本编辑器。
- Markdown 快捷输入。
- 图片、表格、公式、代码块、引用、附件。
- 双链笔记。
- 标签和目录树。
- 版本历史。
- 文档视图和图谱视图切换。
- 节点级笔记。
- 导出 Markdown/PDF。
- 与资料、帖子、卡片、图谱互相引用。

### 9.4 Anki 卡片

不能只是问答表，应实现：

- 卡片组。
- 基础卡、填空卡、选择卡、图片卡。
- SM-2 或类似间隔重复算法。
- 今日复习队列。
- 复习评价：忘记、困难、一般、简单。
- 复习统计：连续天数、正确率、遗忘率、掌握度。
- AI 生成卡片。
- 从笔记、PDF、图谱节点生成卡片。
- 卡片导入导出，后续兼容 Anki apkg。

### 9.5 AI 学习助手

不能只是一个聊天框，应实现：

- 摘要。
- 解释概念。
- 生成图谱。
- 生成卡片。
- 生成题目。
- 生成学习计划。
- 资料/PDF 选区问答。
- 笔记改写。
- AI 任务记录。
- 用户配额。
- 后台可查看任务、用量、失败原因。

### 9.6 后台管理

不能只是管理员登录，应实现：

- 仪表盘：用户数、帖子数、资料数、AI 用量、活跃趋势。
- 用户管理：封禁、角色、配额。
- 内容审核：帖子、评论、资料、图谱公开内容。
- 举报处理。
- 标签/分类管理。
- 资料上下架。
- AI 任务监控。
- 系统配置。
- 操作日志。

## 10. 前端工程建议

建议前台不要再使用简单页面结构，而要拆为多个子系统：

```text
frontend-user
├── src
│   ├── app
│   ├── pages
│   ├── modules
│   │   ├── community
│   │   ├── materials
│   │   ├── reader
│   │   ├── notes
│   │   ├── graph
│   │   ├── cards
│   │   └── ai
│   ├── graph-core
│   │   ├── camera
│   │   ├── models
│   │   ├── renderer
│   │   ├── controller
│   │   ├── history
│   │   ├── layout
│   │   ├── import-export
│   │   └── ai
│   ├── shared
│   └── api
```

图谱核心建议单独做成内部包：

```text
packages/graph-core
packages/editor-core
packages/api-client
packages/ui
```

这样后续可以复用到：

- 前台 Web。
- 桌面端 Tauri。
- 管理端预览。
- 移动端只读图谱。

## 11. 后端工程建议

后端也需要从简单 CRUD 升级为领域模块。

```text
backend
├── cmd/server
├── internal
│   ├── app
│   ├── config
│   ├── middleware
│   ├── modules
│   │   ├── auth
│   │   ├── user
│   │   ├── community
│   │   ├── material
│   │   ├── note
│   │   ├── graph
│   │   ├── card
│   │   ├── ai
│   │   ├── file
│   │   ├── search
│   │   └── admin
│   ├── pkg
│   └── migrations
```

每个模块至少包含：

```text
handler
service
repository
model
dto
router
```

图谱模块额外包含：

```text
graph/domain
graph/operation
graph/snapshot
graph/importer
graph/exporter
graph/layout
graph/ai
```

## 12. 开发里程碑

### Phase 1：平台基础

- Go + Gin 后端骨架。
- MySQL + GORM。
- 用户注册登录。
- JWT 鉴权。
- 文件上传。
- 前台和后台基础工程。

### Phase 2：社区和资料库达到可用产品

- 社区发帖、评论、点赞、收藏。
- 资料库 CRUD。
- PDF 上传和预览。
- 阅读进度、收藏、评分。
- 后台审核。

### Phase 3：笔记和富文本

- 富文本编辑器。
- Markdown 快捷输入。
- 图片、公式、代码块、表格。
- 笔记版本。
- 笔记关联资料/PDF/帖子。

### Phase 4：图谱画布 MVP

- Canvas 画布。
- Camera 平移缩放。
- TextNode、RichNoteNode、MaterialNode、CardNode。
- StraightEdge、CurveEdge。
- 拖拽、框选、连线、删除。
- 撤销/重做。
- 自动保存。
- 图谱批量保存 API。

### Phase 5：图谱画布产品化

- 分组、折叠、迷你地图。
- 节点详情富文本。
- Markdown 导入导出。
- PNG/SVG 导出。
- 自动布局。
- 搜索定位。
- 快捷键和右键菜单。
- 版本快照。

### Phase 6：Anki 和 AI 深度融合

- SM-2 复习算法。
- 今日复习。
- 从图谱节点生成卡片。
- AI 生成图谱分支。
- AI 生成卡片。
- AI 解释选中节点。
- AI 任务记录和配额。

### Phase 7：对标 Project Graph 的高级能力

- 多类型节点：图片、公式、代码、URL、PDF 锚点。
- 多类型边：虚线、方向边、多目标边。
- 复杂历史记录。
- 图谱导入导出。
- 主题系统。
- 插件机制雏形。
- Tauri 桌面端可选。

## 13. 风险与取舍

这个目标已经明显超过普通课程设计或毕业设计 CRUD 项目，接近完整产品。

主要风险：

- 图谱画布交互复杂，开发量大。
- 富文本和图谱双向同步容易失控。
- AI、PDF、卡片、社区之间的引用关系需要设计清楚。
- 多端同步和协作编辑不适合第一阶段就做。

建议取舍：

- 第一版先做单人图谱，不做多人协作。
- 第一版使用 MySQL 保存图谱索引与权限，MongoDB 保存图谱节点、边、分组、画布状态等复杂 JSON。
- 第一版先做 Canvas 2D，不上 WebGL。
- 第一版先做自动保存 + 快照，不做 CRDT。
- 第一版先做 Markdown/PNG/SVG 导入导出，不做完整 `.prg` 兼容。

## 14. 最终结论

如果要达到 Project Graph 的实现程度，学伴项目的核心卖点应改成：

> 一个以知识图谱画布为中心的学习平台。用户可以从资料、PDF、笔记、帖子和 AI 输出中提炼知识节点，再通过可视化图谱组织知识、生成卡片并进入间隔复习。

这会让项目比普通学习社区更有辨识度，也更符合“学伴”的定位：不是只帮用户存资料，而是陪用户把知识真正组织起来、理解起来、记住。
