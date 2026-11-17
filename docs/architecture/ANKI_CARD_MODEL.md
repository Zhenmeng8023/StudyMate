# StudyMate Anki 式卡片模型契约（ANKI-000）

## 2026-11-16 管理与重生成契约补充

- `GET /api/v1/card-notes` 支持可选 `sourceType / sourceId`，读取范围限定当前用户；包含来源匹配兼容 annotation 的 `materialId`、graph-node 的 `graphId` 和 note-block 的 `noteId`。
- `GET /api/v1/card-notes/:id`、`PATCH /api/v1/card-notes/:id` 必须检查 CardNote 归属；来源标题、摘录更新保留定位信息和其他来源链接。
- PATCH 的 `tags` 未传表示保留，空数组表示清空。返回 `regeneration`，包含 `createdCount / updatedCount / removedCount / preservedCount`，供前端明确说明实际结果。
- Cloze 使用 `cN -> templateOrdinal = N - 1` 的稳定身份，同编号共享一张卡，不同编号分别生成。旧版多个 ordinal=0 的卡片先按原字段渲染结果恢复身份；无法唯一匹配时拒绝更新并保留原数据，不能猜测覆盖。
- Cloze 编号范围为 `1..1000000`，一条笔记最多 100 个不同编号、1000 次标记出现；空答案、越界编号和超出上限的请求拒绝生成，前端预览遵循同一限制。
- 安全重生成在事务中更新未学习卡片、创建新增编号卡片、移除没有复习历史的过时卡片，并同步 CardNote 与牌组计数。已有 ReviewLog、学习步进或调度进度的卡片保留正文与调度，即使上游删除了相应编号，也不能静默删除历史。
- `DELETE /api/v1/cards/:id` 删除单卡及其计划和复习记录，必须检查归属。有复习历史时需显式 `confirmDeleteHistory: true`；前端始终展示不可逆影响及暂停替代操作。删除事务同步计数并留下审计。
- 评分、撤销、状态、标签、删除共享 `Note -> Card` 行锁顺序，并在事务内重新检查归属；重生成持有 Note 锁后依次锁 Card。删除不能被较早读到卡片的评分/状态请求复活，评分日志与 schedule 写入同一事务。真实 MySQL 锁行为由可选 `TestMySQLCardMutationIsolation` 验证，SQLite 用例不能替代该验收。
- Basic Reverse 管理预览遵循既有卡片的模板子集；API 省略 `templateOrdinal = 0` 时按正向模板读取，不能误判成没有模板。
- 单卡删除不改来源 CardNote 的字段/模板，下次保存上游笔记可能重新生成缺失卡。前端应说明该行为；长期不参与复习应使用暂停。
- 今日总体薄弱来源与本次会话 Again 来源是不同读模型。会话按统一 SourceLink 去重；图谱最近复习时间来自真实 ReviewLog 聚合，仍属于运行时反馈，保存图谱前剥离。
- ReviewInsights 的复习量/评分是历史事实，mastery 趋势仍是可重算估计，不等同于事件化历史快照。

## 0. 2026-07-18 实现状态

- 2026-07-19 更新：图谱学习工作区 2.0 已把图谱节点接入统一 `CardNoteComposer` 制卡闭环；图谱节点制卡使用 `sourceType = "graph-node"`、`sourceId = node.id`，并在 `locator` 中保存 `graphId / nodeId / focusX / focusY / focusWidth / focusHeight`。
- 2026-07-19 更新：图谱制卡成功后的 `关联 CardNote 数 / GeneratedCard 数` 只更新本地 runtime `reviewFeedback` read model，用于 Inspector 即时反馈；该反馈不属于 graph document 持久字段，保存、快照与导入导出仍应剥离运行时学习摘要。
- 2026-07-19 更新：前端读取侧新增 `SourceLinkReadModel`，优先解析 `primarySourceLink/sourceLinks`，再回退到旧 `sourceType/sourceId/sourceMetadata`；Graph / Review / Search 的 SourceProfile 入口应消费这层 read model，不再各自猜测 locator 字段。
- 2026-07-20 更新：后端读取侧也新增 SourceLink read model helper；review feedback、SourceProfile 和来源复习记录查询会统一兼容显式 SourceLink、旧字段 fallback，以及 `graph-node` locator `nodeId` 匹配。
- `ANKI-000` 已完成：本文档定义的 `CardNote / NoteType / CardTemplate / GeneratedCard / SourceLink` 边界已固定。
- `SourceLink v1` 已完成兼容层第一段：后端 `card` DTO / 来源 helper 与前端 `frontend-user/src/features/sources/sourceLinks.ts` 已统一 reader annotation / pdf-anchor、graph focus、ai draft / ai task 的回跳解析。
- `ANKI-010A` 已完成：后端已具备 Basic / Basic Reverse / Cloze 的模板生成纯逻辑与 Go 单元测试。
- `ANKI-010B` 已完成最小持久化骨架：`card_notes / note_types / card_templates` 迁移已存在，`cards` 已扩 `card_note_id / template_id / template_ordinal` 兼容字段。
- `ANKI-010C` 已完成最小 API：`POST /api/v1/decks/:id/card-notes` 已能在 deck 归属校验后创建 CardNote，并通过模板生成一张或多张卡片进入现有复习队列；`GET /api/v1/card-notes` 与 `PATCH /api/v1/card-notes/:id` 已补上 CardNote 管理视图所需的列表与更新入口。
- `ANKI-010D` 已完成统一前端入口：Reader 批注、笔记、AI 草稿与图谱来源入口已共用 `CardNoteComposer`，可选择 Basic / Basic Reverse / Cloze，并通过统一 SourceLink 创建 CardNote 后写入 deck。
- 旧 `Card(front/back)` 兼容仍然成立：旧卡片继续以 `LegacyStandaloneCard` 参与列表、今日复习、导入导出和来源回跳；新卡片是在不破坏旧读模型的前提下增量落地。
- `ANKI-020` 第一段已完成收口并进入验证：`card_schedules.state` 已承接 `new / learning / review / relearning`，`cards.status` 继续承接 `active / suspended / buried` 兼容层，复习会话已能展示队列分桶、学习计划、评分总结和弱来源回看。
- `ANKI-040` 已具备 CardNote 级管理入口：复习工作区 “Note 视图” 能展示一个 CardNote 生成的多张 GeneratedCard、队列状态和标签，并允许更新字段后只重算未开始复习的卡片。
- `ANKI-060 / WB-033 / LC-010` 已继续收口到图谱与 Dashboard：Dashboard 展示来源级薄弱反馈和复习入口，图谱节点可按学习状态过滤并显示来源级复习反馈徽标。
- `ReviewInsights / SourceProfile` 已完成二阶段最小契约：Dashboard 真实读取最近 7 天 ReviewLog 趋势，`/sources` 可展示一个来源的 CardNotes、GeneratedCards、队列分布、mastery 和最近复习记录。

## 1. 文档目标

本文档定义 StudyMate 从现有 `Card(front/back)` 原型升级到正式 Anki 式记忆模型时的领域边界、存储边界和兼容策略。

当前主线固定为：

```text
资料 / PDF / AI / 笔记
-> SourceLink
-> CardNote
-> 模板生成 GeneratedCard
-> Anki 式复习队列
-> 图谱 / Dashboard / 笔记学习反馈
```

本文档只做实现前契约，不直接引入数据库迁移、接口重写或前端重构。

## 2. 范围与非目标

### 2.1 本轮范围

- 定义 `Deck`
- 定义 `CardNote`
- 定义 `NoteType`
- 定义 `CardTemplate`
- 定义 `GeneratedCard`
- 定义 `Schedule`
- 定义 `ReviewLog`
- 定义 `Tag`
- 定义 `SourceLink`
- 明确旧 `Card(front/back)` 兼容策略
- 明确首批模板与首批队列状态

### 2.2 近期非目标

以下内容不进入最近实现范围，只保留接口和模型预留：

- 课程 / LMS / 班级 / 作业 / 测验
- Tauri 桌面端、离线、多端同步、多人协作
- RAG、向量数据库、多文档问答
- 完整工程图谱、PlantUML / SQL / OpenAPI 深集成
- 完整 `.apkg` 深兼容
- 媒体同步、音频同步、图片遮挡、插件生态
- FSRS

## 3. 设计原则

### 3.1 兼容优先

- 不推翻现有 `decks / cards / card_schedules / card_reviews`
- 不删除现有 `front / back / sourceType / sourceId / sourceMetadata`
- 新模型先以“增量扩展 + 兼容读取”落地，而不是大爆炸迁移

### 3.2 MySQL 与 JSON 分工

进入 MySQL 列的字段只承担三类职责：

- 过滤、排序、分页、统计
- 归属、权限、状态、审计
- 跨模块稳定关联

进入 JSON / metadata 的字段承担三类职责：

- 可变字段结构
- 可变渲染规则
- 可变定位信息和上下文信息

如无特殊说明，本文中的“JSON 字段”可以实现为 MySQL `JSON` 列，或沿用当前仓库习惯用 `text` 存储 JSON 字符串；本契约只规定语义边界，不强制本轮迁移实现细节。

### 3.3 现有表优先复用

- `Deck` 继续落在现有 `decks`
- `GeneratedCard` 继续落在现有 `cards`
- `Schedule` 继续落在现有 `card_schedules`
- `ReviewLog` 继续落在现有 `card_reviews`

新增模型优先补充在这些表周围，而不是立即创建平行的第二套复习系统。

## 4. 旧 Card 兼容策略

### 4.1 兼容结论

现有 `cards.front/back` 不废弃，继续作为可展示、可复习、可导入导出的稳定读模型。

### 4.2 兼容分层

- 旧数据：`cards.card_note_id` 为空的记录，视为 `LegacyStandaloneCard`
- 新数据：由 `CardNote + CardTemplate` 生成的记录，物理上仍存放在 `cards`，但领域上视为 `GeneratedCard`

### 4.3 API 兼容

现有以下输出字段继续保留：

- `front`
- `back`
- `cardType`
- `sourceType`
- `sourceId`
- `sourceMetadata`
- `status`
- `schedule`

后续新增字段时，只做向后兼容扩展，例如：

- `cardNoteId`
- `noteTypeCode`
- `templateId`
- `templateOrdinal`
- `isGenerated`

### 4.4 迁移策略

- `ANKI-010` 只要求新建卡片链路支持 `CardNote -> GeneratedCard`
- 旧卡片不要求在同一轮强制回填成 `CardNote`
- 复习队列、卡片浏览器、导入导出必须同时支持旧卡片和新卡片
- `CardNote` 更新只允许自动重算未开始复习的 `GeneratedCard`；已产生复习历史或学习步进的卡片默认保留其 `front / back / schedule`，避免编辑上游笔记时破坏用户记忆轨迹。

## 5. SourceLink v1

## 5.1 定义

`SourceLink` 是“这张笔记 / 卡片来自哪里，以及如何回跳”的统一值对象。

### 5.2 结构

```ts
type SourceLink = {
  sourceType:
    | "material"
    | "annotation"
    | "pdf-anchor"
    | "note"
    | "note-block"
    | "graph"
    | "graph-node"
    | "ai-draft"
    | "ai-task"
    | "card";
  sourceId: string;
  title?: string;
  excerpt?: string;
  locator?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};
```

### 5.3 与现有 `sourceType / sourceId / sourceMetadata` 的兼容关系

旧字段与新契约一一对应：

- `sourceType` -> `primarySourceLink.sourceType`
- `sourceId` -> `primarySourceLink.sourceId`
- `sourceMetadata` -> `primarySourceLink.locator + primarySourceLink.metadata`

### 5.4 v1 存储规则

- 每个 `CardNote` 可以拥有多个 `SourceLink`
- 每个 `GeneratedCard` 至少暴露一个主来源 `primarySourceLink`
- 为了兼容现有过滤、回跳和接口，`primary_source_type`、`primary_source_id` 继续进入 MySQL 列
- 完整 `sourceLinks` 进入 JSON

### 5.5 v1 locator 约定

`locator` 只保存回跳定位必需信息，不承载业务主键身份：

- reader / PDF：`materialId`、`page`、`annotationId`、`anchorId`
- note：`noteId`、`blockId`
- graph：`graphId`、`nodeId`、`focusX`、`focusY`、`focusWidth`、`focusHeight`
- graph-node：`graphId`、`nodeId`、`focusX`、`focusY`、`focusWidth`、`focusHeight`；`sourceId` 必须是节点 ID，用于把 CardNote 精确绑定到图谱节点而不是只绑定整张图谱。
- ai：`taskId`、`draftId`

## 6. 领域模型

## 6.1 Deck

### 职责

`Deck` 是复习入口、配额策略和浏览组织边界，不承载笔记字段结构。

### 存储

物理上继续使用现有 `decks`。

### 进入 MySQL 的核心字段

- `id`
- `owner_user_id`
- `title`
- `description`
- `visibility`
- `status`
- `card_count`
- `new_limit_per_day`
- `review_limit_per_day`
- `default_note_type_id`（可空）
- `created_at`
- `updated_at`

### 进入 JSON / metadata 的字段

- `study_preferences_json`
  - 卡片展示顺序
  - bury/suspend 默认策略
  - 导入导出偏好
- `metadata_json`
  - UI 局部偏好
  - 非过滤型实验字段

## 6.2 NoteType

### 职责

`NoteType` 定义一类知识笔记的字段模式与模板集合，是 Anki 心智模型里的“笔记类型”。

### v1 内置类型

- `basic`
- `basic_reverse`
- `cloze`

### 建议物理表

- `note_types`

### 进入 MySQL 的核心字段

- `id`
- `owner_user_id`（系统内置类型可空或指向系统用户）
- `code`
- `name`
- `kind`
- `is_builtin`
- `status`
- `field_count`
- `template_count`
- `created_at`
- `updated_at`

### 进入 JSON / metadata 的字段

- `field_schema_json`
  - 字段名
  - 字段顺序
  - 是否必填
  - 是否允许 HTML / Markdown / Cloze
- `validation_rules_json`
- `metadata_json`

### v1 限制

- 只支持文本字段
- 不支持图片遮挡字段
- 不支持媒体字段同步语义

## 6.3 CardTemplate

### 职责

`CardTemplate` 定义如何把 `CardNote` 渲染成一张或多张 `GeneratedCard`。

### 建议物理表

- `card_templates`

### 进入 MySQL 的核心字段

- `id`
- `note_type_id`
- `name`
- `template_kind`
- `ordinal`
- `is_active`
- `created_at`
- `updated_at`

### 进入 JSON / metadata 的字段

- `front_format_json`
- `back_format_json`
- `generation_rules_json`
- `cloze_rules_json`
- `metadata_json`

### 首批模板约束

#### Basic

- 一个 `CardNote` 生成一张正向卡
- 典型字段：`front`、`back`

#### Basic Reverse

- 一个 `CardNote` 生成两张卡
- 模板 1：`front -> back`
- 模板 2：`back -> front`

#### Cloze

- 一个 `CardNote` 生成一张或多张填空卡
- v1 只支持文本 cloze
- v1 不做图片遮挡、嵌套 cloze、复杂模板脚本

## 6.4 CardNote

### 职责

`CardNote` 是“可生成卡片的知识笔记”，是 `GeneratedCard` 的上游实体。

它承接：

- 来源确认
- 字段内容
- 模板选择
- 重新生成卡片
- 与图谱 / reader / note / AI 的追溯关系

### 建议物理表

- `card_notes`

### 进入 MySQL 的核心字段

- `id`
- `deck_id`
- `owner_user_id`
- `note_type_id`
- `primary_source_type`
- `primary_source_id`
- `status`
- `tag_count`
- `generated_card_count`
- `created_at`
- `updated_at`

### 进入 JSON / metadata 的字段

- `fields_json`
  - `basic.front`
  - `basic.back`
  - `cloze.text`
  - `cloze.extra`
- `source_links_json`
  - 支持多来源
- `generation_context_json`
  - 由批注 / 图谱 / AI 草稿生成时的确认上下文
- `metadata_json`

### 说明

- `CardNote` 不直接承担调度
- `CardNote` 删除、更新后，允许重新计算其下的 `GeneratedCard`
- `CardNote` 是来源去重和模板重算的主要边界

## 6.5 GeneratedCard

### 职责

`GeneratedCard` 是真正进入复习队列的卡片实体。

### 物理落点

领域名叫 `GeneratedCard`，但 v1 物理上继续落在现有 `cards` 表，不新增平行 `generated_cards` 表。

### 进入 MySQL 的核心字段

- 现有保留字段：
  - `id`
  - `deck_id`
  - `owner_user_id`
  - `card_type`
  - `front`
  - `back`
  - `status`
  - `source_type`
  - `source_id`
  - `created_at`
  - `updated_at`
- 新增建议字段：
  - `card_note_id`（可空，旧卡兼容）
  - `template_id`（可空）
  - `template_ordinal`
  - `primary_source_type`
  - `primary_source_id`

### 进入 JSON / metadata 的字段

- `source_metadata`
  - 继续兼容当前 reader / graph / AI 回跳字段
- `render_context_json`
  - 模板渲染快照
- `metadata_json`

### 兼容语义

- `front / back` 继续是最终展示内容
- 对旧卡片，`front / back` 就是唯一内容来源
- 对新卡片，`front / back` 是从 `CardNote + CardTemplate` 渲染出的稳定读模型

## 6.6 Schedule

### 职责

`Schedule` 是单张 `GeneratedCard` 的调度状态，不属于 `CardNote`。

### 物理落点

继续使用现有 `card_schedules`。

### 队列状态

v1 正式队列状态固定为：

- `new`
- `learning`
- `review`
- `relearning`
- `suspended`
- `buried`

### 状态定义

#### new

- 已生成但尚未进入首次学习

#### learning

- 正在学习步进中

#### review

- 已毕业，进入长期复习

#### relearning

- 已毕业卡片遗忘后重新学习

#### suspended

- 人工暂停，不进入任何自动队列

#### buried

- 临时从当前复习集合隐藏
- v1 允许显式恢复
- 自动日切恢复策略在 `ANKI-020` 收口

### 进入 MySQL 的核心字段

- `card_id`
- `user_id`
- `state`
- `due_at`
- `learning_step`
- `interval_days`
- `ease_factor`
- `repetition_count`
- `lapse_count`
- `last_reviewed_at`
- `buried_until`（可空）
- `updated_at`

### 进入 JSON / metadata 的字段

- `scheduler_context_json`
  - 调试信息
  - 可选实验字段

### 说明

- `new / learning / review / relearning / suspended / buried` 是调度状态，不是 `cards.status` 的替代品
- `cards.status` 继续承担记录级状态，例如 `active / archived / deleted` 这类非调度语义

## 6.7 ReviewLog

### 职责

`ReviewLog` 记录每一次评分事件，是反馈、审计和 mastery 计算来源。

### 物理落点

继续使用现有 `card_reviews`，领域上改名为 `ReviewLog`。

### 进入 MySQL 的核心字段

- `id`
- `card_id`
- `user_id`
- `rating`
- `elapsed_ms`
- `state_before`
- `state_after`
- `due_before`
- `due_after`
- `interval_before`
- `interval_after`
- `reviewed_at`

### 进入 JSON / metadata 的字段

- `source_snapshot_json`
- `client_context_json`
- `metadata_json`

### 评分语义

继续保留现有：

- `again`
- `hard`
- `good`
- `easy`

`ANKI-020` 负责把它们和 `new / learning / review / relearning` 的状态流转做实。

## 6.8 Tag

### 职责

`Tag` 是 deck / note / card 的横向组织维度，不承担来源定位。

### v1 方向

领域上以规范化 `Tag` 实体存在，但为兼容现有实现，允许保留 `cards.tags` 作为过渡读缓存。

### 建议物理表

- `tags`
- `card_note_tags`
- `card_tags`
- `deck_tags`（可后置）

### 进入 MySQL 的核心字段

`tags`

- `id`
- `owner_user_id`
- `name`
- `normalized_name`
- `usage_count`
- `created_at`
- `updated_at`

链接表：

- `card_note_id` / `card_id` / `deck_id`
- `tag_id`

### 进入 JSON / metadata 的字段

- 通常无
- 极少数 UI 展示偏好可进入 `metadata_json`

### 兼容策略

- 现有 `cards.tags` 继续读写可用
- `ANKI-010 / ANKI-040` 期间逐步增加规范化标签关系
- 读接口可先同时返回规范化标签数组和旧缓存结果

## 7. 首批模板与制卡约束

### 7.1 Basic

- NoteType：`basic`
- 字段：`front`、`back`
- 生成卡片数：1

### 7.2 Basic Reverse

- NoteType：`basic_reverse`
- 字段：`front`、`back`
- 生成卡片数：2
- 卡 1：正向
- 卡 2：反向

### 7.3 Cloze

- NoteType：`cloze`
- 字段：`text`、`extra`
- 生成卡片数：按 cloze 数量生成
- v1 只支持文本 cloze，不支持图片遮挡

## 8. MySQL 与 JSON 字段划分总表

| 实体 | MySQL 核心列 | JSON / metadata |
|---|---|---|
| Deck | 身份、归属、标题、可见性、每日新卡/复习上限、默认 NoteType | 学习偏好、UI 偏好 |
| NoteType | code、name、kind、builtin、field/template 计数 | 字段 schema、校验规则 |
| CardTemplate | note_type_id、name、kind、ordinal、is_active | front/back 渲染规则、cloze 规则 |
| CardNote | deck_id、note_type_id、primary_source_type/id、状态、统计 | fields、sourceLinks、generationContext |
| GeneratedCard | 现有 front/back/status/source 字段，外加 card_note_id/template_id | sourceMetadata、renderContext |
| Schedule | state、due_at、step、interval、ease、repetition、lapse | scheduler 调试上下文 |
| ReviewLog | rating、state/due/interval 前后值、reviewed_at | 来源快照、客户端上下文 |
| Tag | name、normalized_name、usage_count、关系表 | 少量展示偏好 |
| SourceLink | primary_source_type/id 进入主表列用于过滤 | locator、excerpt、多个来源数组 |

## 9. 与现有 API / DTO 的关系

### 9.1 现有稳定输出不破坏

以下 DTO 继续有效：

- `DeckPayload`
- `CardPayload`
- `CardSchedulePayload`
- `ReviewFeedbackPayload`
- `ReviewQueuePayload`

### 9.2 后续允许新增但不替换的字段

可增量加入：

- `cardNoteId`
- `noteTypeCode`
- `templateId`
- `templateOrdinal`
- `primarySourceLink`
- `sourceLinks`

### 9.3 CardNote 管理 API

当前 CardNote 管理面板使用以下增量 API，不替换旧卡片列表、今日队列或导入导出接口：

- `GET /api/v1/card-notes`
  - 按当前登录用户列出可管理 CardNote。
  - 返回 `ManagedCardNotePayload[]`，其中包含 `cardNote`、`generatedCards`、`queueStates` 与 `tags`。
- `PATCH /api/v1/card-notes/:id`
  - 只允许 CardNote 所属用户更新。
  - 请求体沿用 `fields`、`sourceLinks`、`tags` 与兼容来源字段。
  - 服务端会重新按当前 NoteType / CardTemplate 渲染 GeneratedCard 草稿。
  - 只有未开始复习的 GeneratedCard 会写回新的 `front / back / source / tags`；已进入 `learning / review / relearning` 或已有复习次数、遗忘次数、学习步进的卡片不会被自动重置。

`ManagedCardNotePayload` 是管理读模型，不是新的复习事实来源。真正的调度事实仍然来自 `cards / card_schedules / card_reviews`。

### 9.4 ReviewInsights 与 SourceProfile

当前学习工作台二阶段新增两个只读契约，不替换 `review/feedback`：

- `GET /api/v1/review/insights`
  - 事实来源：`card_reviews`，并叠加当前 `cards / card_schedules / card_notes` 来源摘要。
  - 返回最近 7 天每日复习数、Again / Hard / Good / Easy 分布、薄弱来源新增 / 持续次数、来源级 mastery 趋势和当前来源摘要。
  - 当前 mastery 趋势是可重算版本：窗口内有评分样本时按 Good/Easy 正向率推导；没有评分样本时回落到当前 `sourceSummary.masteryScore`。这不是不可变历史快照。
- `GET /api/v1/review/source-profile?sourceType=...&sourceId=...`
  - 事实来源：`CardNote.sourceLinks`、GeneratedCard 的旧 `sourceType/sourceId/sourceMetadata`、`card_schedules` 和 `card_reviews`。
  - 返回来源摘要、关联 CardNotes、GeneratedCards、队列分布、mastery、due/learning/weak 计数、lastReviewedAt、recentReviews 和可回跳 SourceLink。
  - 所有查询必须按当前登录用户过滤；不得因为 sourceId 相同泄露其他用户卡片或复习记录。

这两个契约共同把 SourceLink 从“回跳字段”提升为“学习对象档案”，但仍保持读模型可重算。长期若需要精确历史画像，应新增事件化 mastery snapshot 或规范化 source link relation，而不是把运行时反馈写入 graph document。

### 9.5 导入导出兼容

- JSON / CSV 现阶段继续围绕 `front/back/cardType/tags/sourceType/sourceId`
- 完整 `CardNote` 结构导入导出后置到 `ANKI-070` 之后
- `.apkg` 深兼容不进入当前阶段

## 10. 后续工作包顺序

### 10.1 ANKI-010：Note / Card 分离与模板生成最小落地

目标：

- 新增 `card_notes`
- 新增 `note_types`
- 新增 `card_templates`
- 扩展 `cards` 以承载 `GeneratedCard`
- 新卡走 `CardNote -> CardTemplate -> GeneratedCard`
- 旧卡继续直接复习

### 10.1.1 当前可直接沿用的最小实现骨架

为避免 `ANKI-010` 开始时再次从零讨论接口命名，当前建议直接沿下面的最小骨架推进：

- 后端 DTO / 类型草案先稳定：
  - `CardNotePayload`
  - `NoteTypePayload`
  - `CardTemplatePayload`
  - `GeneratedCardPayload = CardPayload`
- 前端 API 类型先同步同名草案，允许页面先展示 Note/Card 关系，而不要求数据库迁移同日完成。
- `GeneratedCard` 继续复用现有 `cards` 表与现有 `CardPayload` 读模型：
  - 旧卡：`card_note_id` 为空，按 `LegacyStandaloneCard` 解释
  - 新卡：带 `card_note_id / template_id / template_ordinal`，但仍返回同一套 `front/back/sourceType/sourceId` 兼容字段
- `CardNote` 先只承担：
  - `deckId`
  - `noteTypeId / noteTypeCode`
  - `fields`
  - `primarySourceLink / sourceLinks`
  - `generatedCardCount`
  - `status`
- `NoteType` 与 `CardTemplate` 第一段只要求覆盖内置：
  - `basic`
  - `basic_reverse`
  - `cloze`

这意味着 `ANKI-010` 第一段不需要先完成完整 `card_notes` 持久化迁移、完整 `note_types` 自定义编辑器或完整模板脚本系统，而是可以先让 DTO / 类型、最小 service 边界和最小页面展示先稳定，再逐步落数据库。

验收重点：

- Basic / Basic Reverse / Cloze 可生成卡片
- `cards.front/back` 兼容保留
- reader / note / graph / ai 至少一条入口能生成 `CardNote`

### 10.2 ANKI-020：正式队列与调度语义

目标：

- 做实 `new / learning / review / relearning / suspended / buried`
- 引入学习步进
- 引入重新学习
- 明确每日新卡 / 每日复习上限

验收重点：

- 队列状态不再只靠 `active/suspended/buried`
- 评分与状态流转一一对应

当前实现对齐：

- 正式队列状态由 `card_schedules.state` 承担，兼容状态由 `cards.status` 承担；`active / suspended / buried` 不再直接冒充正式调度状态。
- `new` 卡评分后可进入 `learning`，`easy` 可直接毕业到 `review`；`learning` 可按 `learning_step` 晋级并毕业到 `review`。
- `review` 卡评分 `again` 后进入 `relearning`；`relearning` 继续按学习步进重新毕业到 `review`。
- `suspended / buried` 会从今日队列移除，恢复 `active` 后重新参与排队。
- 今日队列 API 已返回 `newCount / learningCount / reviewCount / relearningCount / newLimit / reviewLimit`。
- 当前默认限额为 `newLimit = 20`、`reviewLimit = 200`；若未进入 deck 级配置，先以服务默认值作为明确策略。
- 当前排序固定为 `learning -> relearning -> review -> new`，并由后端测试锁定。

### 10.3 SourceLink v1：统一 reader / note / graph / ai / review 来源回跳

目标：

- 统一 `SourceLink` 解析
- 统一 `locator` 约定
- 减少页面层对 `sourceMetadata` 的临时猜测

验收重点：

- 同一来源在 graph / review / ai / reader 的回跳一致

### 10.3.1 当前最小代码收口要求

`SourceLink v1` 的第一段实现不要求全仓库一次性替换旧字段，但要求至少满足：

- 后端 `card dto / source metadata helper` 能把旧 `sourceType / sourceId / sourceMetadata` 兼容提升为：
  - `primarySourceLink`
  - `sourceLinks`
- 前端 `review / graph / ai` 共用同一套来源解析 helper：
  - 先优先读取 `primarySourceLink`
  - 否则回退到 `sourceLinks[0]`
  - 再回退到旧 `sourceType / sourceId / sourceMetadata`
- 首批必须锁定的回跳语义至少覆盖：
  - reader annotation / pdf-anchor
  - graph focus
  - ai draft / ai task

只要这层兼容解析稳定，后续再逐步让 note、reader、graph、ai 的正式接口直接产出 `SourceLink`，而不是继续让页面层各自猜测 locator 字段。

### 10.4 来源制卡统一确认流

目标：

- reader 批注
- note block
- graph node
- ai draft

全部先进入统一确认流，再写入 `CardNote`。

### 10.5 WB-033 / LC-010：复习反馈与图谱 / Dashboard mastery 边界

目标：

- 以 `ReviewLog + Schedule` 为反馈事实来源
- 图谱 / Dashboard 读取来源级 mastery 摘要
- 不把运行时反馈误写进 `graph document`

当前边界：

- `ReviewLog / Schedule` 继续作为事实来源，`mastery / weakSources / sourceSummaries` 属于可重算摘要。
- 图谱详情读链路允许把来源级摘要内嵌到节点 `metadata.reviewFeedback`，但保存、导入与快照恢复前必须剥离该运行时字段。
- 图谱工作区刷新学习反馈时只更新独立读模型，不应覆盖本地未保存的 graph document 编辑。
- 当前已存在浏览器级闭环验证：Reader/PDF 批注 -> CardNote -> 今日复习评分 -> Dashboard 反馈，以及图谱侧“刷新学习反馈且保留本地草稿”回归。

## 11. 当前结论

StudyMate 的下一步不是推翻现有卡片原型，而是：

1. 保留 `cards.front/back` 作为稳定读模型
2. 新增 `CardNote / NoteType / CardTemplate` 作为正式上游模型
3. 用 `GeneratedCard` 继续复用现有 `cards`
4. 用 `SourceLink` 把 reader / note / graph / ai / review 的来源契约统一起来
5. 用 `Schedule / ReviewLog` 承接正式的 Anki 式队列和学习反馈

这份契约完成后，最推荐的下一实现工作包是 `ANKI-010`。
## 2026-07-20 SourceLink relation/read model closeout

- Backend now exposes a code-level `SourceLinkRelationReadModel` boundary with `id`, `owner_user_id`, `linked_object_type`, `linked_object_id`, `source_type`, `source_id`, `locator_json`, `title`, `excerpt`, `metadata_json`, timestamps, and a primary flag.
- This is intentionally a read-model/interface boundary in the current package, not a new database migration. Existing payloads continue to prefer `primarySourceLink/sourceLinks`, then fall back to old `sourceType/sourceId/sourceMetadata` so legacy `Card(front/back)` remains compatible.
- `graph-node` sources continue to bind by node ID, with `locator.nodeId` used for matching when older records stored graph IDs differently.
- Graph-side `reviewFeedback` remains runtime-only enrichment. It must not be written into graph document, snapshots, save payloads, conflict drafts, or persisted graph metadata.
