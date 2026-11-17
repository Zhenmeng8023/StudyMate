# StudyMate 下一步开发方向与计划

## 2026-11-16 最新执行入口

以下状态优先于本文早期冲刺建议：CardNote / 模板 / SourceLink / 正式队列已经存在，不应重新开发其骨架。

本轮补齐的是已有学习工作台的正确性与可用性：Cloze 编号和预览、标签清空、安全重生成、按具体来源管理、带历史提示的单卡删除、去重学习反馈、逐日趋势及真实图谱最近复习时间。

后续工作以本轮验收结果为基础：

1. 继续扩展 `WB-034` 图谱权限、冲突与窄屏组合回归，保留脏草稿和运行时学习反馈边界。
2. `GPH-040` 按实际阻碍拆分剩余 controller 命令与状态；已有 feature helper 不回流大页面。
3. 只有多来源查询规模需要时，再把 SourceLink 兼容 read model 演进为规范化关系存储；mastery 快照需要明确可重算和历史事实边界。
4. AI 制卡在当前页面避免重复提交；跨刷新、跨客户端幂等及 AI 草稿持久确认需要单独的跨域事务/补偿设计，不能以客户端隐藏草稿冒充完成。

课程/LMS、Tauri、完整 RAG、完整 `.apkg`、协作和移动端继续后置。

**日期：2026-07-17**
**依据：根目录《学伴项目-设计说明书.md》、当前 `CODEX_EXECUTION_ROADMAP.md`、`CODEX_BACKLOG.md` 与仓库真实模块进展。**

## 0. 2026-07-17 落地更新

- `ANKI-000` 已完成并冻结领域契约。
- `ANKI-010A/B/C/D` 当前都已有最小实现：
  - Basic / Basic Reverse / Cloze 模板生成逻辑与测试已在后端落地。
  - `card_notes / note_types / card_templates` 与 `cards.card_note_id / template_id / template_ordinal` 最小骨架已存在。
  - `POST /api/v1/decks/:id/card-notes` 已能把 CardNote 生成的卡片写入现有 `cards / card_schedules`。
  - Reader 批注草稿已提供一个真实前端入口，可基于统一 SourceLink 选择模板并写入 deck。
- `SourceLink v1` 已完成兼容层第一段，当前应停止新增页面级 `sourceMetadata` 猜测逻辑。
- `ANKI-020` 本轮已完成第一段收口并进入持续验证：正式队列状态、默认上限、学习步进、重新学习和旧卡兼容链路都已有代码与测试覆盖。
- `WB-033 / LC-010` 当前也已有一条浏览器级主链路可验收：Reader/PDF 批注 -> CardNote -> 今日复习评分 -> Dashboard 反馈；下一步重点转为维持 SourceLink 与 mastery 边界清晰，而不是继续扩 `ANKI-010` 骨架。

## 1. 当前判断

StudyMate 已经跨过“能不能跑起来”的阶段。平台基础、社区/资料、阅读/笔记、图谱 MVP、复习 MVP、搜索、后台治理和共享工程底座都已有真实切片。

下一阶段不应该继续横向开课程、桌面端、完整工程图谱、RAG 或更多独立页面，而应该把设计说明书中的核心定位收紧成一条可持续深化的产品主线：

```text
资料 / PDF / AI / 笔记
  -> 来源锚点 SourceLink
  -> CardNote
  -> 模板生成 GeneratedCard
  -> Anki 式复习队列
  -> 图谱 / Dashboard / 笔记学习反馈
```

换句话说，图谱已经足够成为学习语义中心；现在最缺的是“卡片复习系统的正式领域模型”和“来源到反馈的稳定契约”。

## 2. 模块现状与缺口

| 模块 | 当前真实进展 | 下一步缺口 | 优先级 |
|---|---|---|---|
| 复习 / 卡片 | Deck/Card、SM-2、今日队列、评分、跳过、暂停、埋藏、撤销、浏览器、标签、导入导出、来源回跳已起步 | 缺 CardNote / NoteType / Template / GeneratedCard；缺正式 learning/relearning 队列、每日新卡/复习上限、Cloze 模板和来源契约归并 | P0 |
| 主学习闭环 | 阅读批注、图谱节点、AI 草稿、复习卡片、Dashboard/图谱反馈已有可演示路径 | 缺统一 SourceLink；反馈仍偏运行时摘要，mastery 持久边界不清 | P0 |
| 图谱 | graph-core、导入导出、校验、布局、冲突、快照、学习反馈展示和窄屏回归都已很强 | 缺 store/commands/features 拆分；避免继续把新增闭环逻辑堆进 `useGraphWorkspaceController` | P1 |
| AI | 草稿、任务、来源回跳、用量治理已有切片 | 缺 AI 结果确认到 CardNote / Graph 节点的统一模型，不能继续只靠页面局部字段拼接 | P1 |
| 笔记 / 知识库 | 笔记 CRUD、版本、资料关联、生成卡片/图谱草稿已有基础 | 缺块级模型深化、双链/反链、块引用和笔记学习状态回写 | P1 |
| 搜索 | MySQL fallback、分组结果、真实命中数、nextOffset 续取、来源跳转已有 | 缺全部类型视图的跨批次编排、排序/空结果建议、可替换索引任务 | P1 |
| 后台治理 | 用户、资料、举报、AI 任务、图谱模板治理已有真实动作 | 缺举报备注、资源权限矩阵、审计可读性、失败重试和运营语义细化 | P1 |
| 工程图 / 课程 / Tauri / RAG | 设计说明书保留清晰愿景 | 目前不应进入主冲刺，只保留技术预研和接口预留 | P2/P3 |

## 3. 下一步主线

### 第一优先级：Anki 式记忆模型兼容层

先做 `ANKI-000 -> ANKI-010 -> ANKI-020`，目标不是推翻现有 `Card(front/back)`，而是在兼容现有卡片的前提下补正式模型。

建议工作包：

1. `ANKI-000`：定义产品与领域契约。
   - 输出 Deck、CardNote、NoteType、CardTemplate、GeneratedCard、Schedule、ReviewLog、Tag、SourceLink 的边界。
   - 明确旧 `cards.front/back/sourceMetadata` 如何兼容读取。
   - 明确哪些 Anki 能力进入近期，哪些只预留。

2. `ANKI-010`：Note / Card 分离与模板生成最小落地。
   - 新增 CardNote / NoteType / CardTemplate / GeneratedCard 兼容模型。
   - 首批支持 Basic、Basic Reverse、Cloze。
   - 从批注、笔记块、图谱节点、AI 草稿生成 CardNote，再由模板生成卡片。
   - 旧卡片继续在复习页、导入导出和浏览器中可用。

3. `ANKI-020`：队列与调度语义做实。
   - 当前已由 `card_schedules.state` 承接 new / learning / review / relearning，由 `cards.status` 承接 active / suspended / buried。
   - 当前默认策略已固定为 `newLimit = 20`、`reviewLimit = 200`，今日队列排序为 `learning -> relearning -> review -> new`。
   - 保留 again / hard / good / easy 评分语义，并继续用测试锁定 `new -> learning/review`、`learning -> review`、`review -> relearning`、`relearning -> review` 的状态流转。

验收标准：

- 旧卡片不需要迁移也能继续复习。
- 一条 CardNote 可以生成一张或多张 GeneratedCard。
- Basic / Reverse / Cloze 至少各有一条端到端测试。
- 今日队列能区分新卡、学习中、复习、重新学习、暂停、埋藏。
- 前端复习页和卡片浏览器能显示 Note/Card 来源关系。

### 第二优先级：SourceLink 与反馈持久边界

当前 `sourceType / sourceId / sourceMetadata` 已经在 reader、graph、AI、review 多处使用，但还不是稳定领域契约。下一步应把它收口成最小 SourceLink。

建议工作包：

1. 定义 SourceLink 契约。
   - sourceType：material、annotation、pdf-anchor、note、note-block、graph、graph-node、ai-draft、ai-task、card。
   - sourceId：业务对象 ID。
   - locator：页码、选区 rect、节点焦点、草稿 ID、任务 ID 等定位信息。
   - title / excerpt：用于 UI 预览和导入导出。

2. 统一来源解析。
   - 后端 card / graph / note / reader / ai 模块共用来源 DTO 或转换 helper。
   - 前端 review / graph / reader / ai 共享来源回跳解析，不再各页面临时判断。
   - 第一段允许保留旧 `sourceType / sourceId / sourceMetadata`，但必须同步产出 `primarySourceLink / sourceLinks` 兼容字段。

3. 明确 mastery 持久边界。
   - 短期：`GET /review/feedback` 继续作为最新摘要来源。
   - 中期：为图谱节点或来源建立可重算的 mastery snapshot，不把运行时字段误写进 graph document。
   - 长期：学习反馈事件化，支持图谱、笔记、Dashboard 多入口一致展示。

验收标准：

- 同一张来源卡片在复习页、图谱 Inspector、AI 草稿确认页的回跳一致。
- 图谱刷新学习反馈不会丢本地未保存编辑。
- mastery 摘要有明确“运行时字段 / 可持久字段 / 可重算字段”划分。

### 第三优先级：闭环演示路径打磨

围绕 `LC-010` 做一条稳定可演示路径，而不是平均补所有页面。

推荐演示路径：

```text
资料上传或选择
-> PDF 阅读
-> 高亮 / 批注
-> 生成笔记块或图谱节点
-> 生成 CardNote
-> 模板生成 Basic / Cloze 卡片
-> 今日复习
-> 评分后回到图谱节点查看掌握度变化
-> Dashboard 显示薄弱来源与回补入口
```

近期要补：

- 批注 / 笔记 / 图谱节点生成 CardNote 的统一确认流。
- 复习完成后的图谱反馈刷新失败态。
- Dashboard 对 mastery / weakSources 的解释更清楚。
- 一条浏览器级 E2E 覆盖完整主路径，当前已由 `e2e/v1-study-loop.spec.ts` 锁定 Reader -> Review -> Dashboard 的最小学习闭环。

### 第四优先级：控制器与后台治理收口

这部分重要，但不应该抢 Anki 模型主线。

图谱侧：

- `GPH-040` 只拆会阻碍闭环开发的状态边界。
- 优先拆 selected/viewport/persistence/reviewFeedback/commands。
- 不为了架构完美长期停止产品切片。

后台侧：

- `ADM-011` 继续补举报备注、审计可读性、失败重试。
- 优先服务真实治理和安全边界，不扩新后台菜单。

搜索侧：

- `SE-020` 继续补全部类型视图跨批次续取、空结果建议、排序语义。
- Meilisearch 仍放在 `WB-043`，等 MySQL fallback 契约稳定后再评估。

## 4. 建议的四个冲刺

### Sprint 1：契约先行

目标：让后续复习能力有稳定地基。

- 完成 `ANKI-000`。
- 新增 `docs/architecture/ANKI_CARD_MODEL.md` 或等价契约文档。
- 定义 SourceLink v1。
- 更新 backlog 中 `ANKI-010/020/050/060` 的依赖和验收。

交付物：

- 领域模型文档。
- 旧 Card 兼容策略。
- API / DTO 草案。
- 测试矩阵。

### Sprint 2：Note/Card 最小落地

目标：让 CardNote 可以真实生成卡片。

- 完成 `ANKI-010` 第一段。
- 后端先补 `CardNotePayload / NoteTypePayload / CardTemplatePayload / GeneratedCardPayload` 草案，再决定最小迁移顺序。
- 前端复习页可展示 GeneratedCard 与来源 Note 信息，并兼容读取 `primarySourceLink / sourceLinks`。
- 批注或图谱节点至少有一个入口能生成 CardNote。

交付物：

- Basic / Reverse / Cloze 模板。
- 旧卡片兼容读取。
- 单元测试 + 页面级测试。

### Sprint 3：队列语义与复习体验归并

目标：把当前原型复习动作归并到正式队列。

- `ANKI-020` 第一段已完成并进入持续验证。
- new / learning / review / relearning / suspended / buried 已可区分。
- 每日新卡与复习上限已有默认策略，当前为 `20 / 200`。
- 撤销、暂停、埋藏、恢复继续可用。

交付物：

- 调度 service 测试。
- 今日队列 API 回归。
- 复习页队列状态展示。

### Sprint 4：闭环验收

目标：把设计说明书里的核心产品定位变成可演示路径。

- 已完成一条 `LC-010` 浏览器级 E2E。
- SourceLink 覆盖 reader / note / graph / ai / review 主要来源。
- Dashboard 和图谱 Inspector 展示一致的 mastery / weakSources。
- 记录未进入本阶段的 P2/P3 范围。

交付物：

- 主学习闭环 E2E。
- 更新 PROJECT_LOG。
- 更新 README 或演示说明。

## 5. 明确后置

以下内容仍是设计说明书愿景的一部分，但当前不进入最近 4 个冲刺：

- 课程 / LMS / 班级 / 作业 / 测验。
- Tauri 桌面端、离线、多端同步、多人协作。
- PlantUML / Structurizr / SQL / OpenAPI / 代码分析完整工程图谱。
- 向量数据库、完整 RAG、多文档问答。
- 完整 `.apkg` 兼容、媒体同步、Anki 插件生态。
- 推荐算法、社区增长体系、复杂运营后台。

## 6. 执行原则

- 所有新增能力必须回到学习闭环，不能新增孤立功能。
- 后端新增用户可见能力时，前端必须同步有可验收入口。
- 旧 Card 数据必须兼容，避免为模型升级破坏现有复习链路。
- 复习和来源模型优先稳定，图谱继续服务学习反馈，不倒退成单纯画布工具。
- 文档、测试和 PROJECT_LOG 必须跟随每个工作包更新。
