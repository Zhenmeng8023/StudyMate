# StudyMate 项目记录

> 记录规则：项目主要语言为汉语。每完成一个独立任务，就把完整结果追加到本文件开头；每条记录必须包含时间、项目版本编号、任务内容、完成结果和后续影响。代码标识符、包名、命令、API 路径等工程约定可继续使用英文。

## 2026-05-26 13:14:22 +08:00 | v0.0.13 | 调整管理端默认运行端口为 8002

### 任务内容
- 将前端管理端默认运行端口从 `5174` 调整为 `8002`。
- 同步修改后端跨域来源和开发文档中的管理端地址。
- 修正文档中用户端备用端口与管理端端口冲突的问题。

### 完成结果
- 更新 [frontend-admin/package.json](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/package.json)，将管理端默认启动端口改为 `8002`。
- 更新 [backend/internal/app/server.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/app/server.go)，将管理端开发环境跨域来源改为 `http://localhost:8002`。
- 更新 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)：
  - 管理端默认地址改为 `http://localhost:8002/`
  - 管理端占用时备用端口改为 `8004`
  - 用户端占用时备用端口调整为 `8003`

### 验证结果
- `npm run typecheck` 通过。
- 关键配置检索确认管理端默认端口已切换到 `8002`。

### 后续影响
- 默认本地开发端口现在统一为：
  - 用户端 `8001`
  - 管理端 `8002`
  - 后端 `8023`

## 2026-05-26 13:12:38 +08:00 | v0.0.12 | 调整前后端默认运行端口

### 任务内容
- 按用户要求，将前端默认运行端口调整为 `8001`。
- 将后端默认运行端口调整为 `8023`。
- 同步修改前端代理目标、后端跨域白名单和开发文档。

### 完成结果
- 更新 [frontend-user/package.json](/E:/Code/1108026_rust_go/StudyMate/frontend-user/package.json)，将用户端默认启动端口改为 `8001`。
- 更新 [backend/internal/config/config.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/config/config.go)，将后端默认 `APP_PORT` 改为 `8023`。
- 更新 [frontend-user/vite.config.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/vite.config.ts) 和 [frontend-admin/vite.config.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/vite.config.ts)，将默认 API 代理目标改为 `http://localhost:8023`。
- 更新 [backend/internal/app/server.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/app/server.go)，将用户端开发环境跨域来源调整为 `http://localhost:8001`，保留管理端来源。
- 更新 [.env.example](/E:/Code/1108026_rust_go/StudyMate/.env.example) 和 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)，同步新的默认端口和访问地址。

### 验证结果
- 关键配置检索确认：
  - 用户端默认端口为 `8001`。
  - 后端默认端口为 `8023`。
  - 前端代理默认指向 `http://localhost:8023`。
  - 开发说明中的默认访问地址已同步更新。

### 后续影响
- 后续默认启动地址应为：
  - 用户端 `http://localhost:8001/`
  - 后端 `http://localhost:8023/health`
- 管理端默认端口当前保持不变。

## 2026-05-26 12:44:57 +08:00 | v0.0.11 | 修复 Go 依赖代理导致的模块读取报错

### 任务内容
- 排查 GoLand 中 `go list -m -json all` 执行失败的问题。
- 复现 `goproxy.io` 对 `modernc.org/*`、`github.com/quic-go/qpack` 等依赖返回 404 的错误。
- 修复本机 Go 代理配置，并补充开发文档中的故障排查说明。

### 完成结果
- 确认报错根因不是本机 Git 版本，而是 `https://goproxy.io` 对部分依赖回源失败。
- 验证 `https://goproxy.cn,direct` 与 `https://proxy.golang.org,direct` 都可以正常完成模块读取。
- 将当前用户级 `GOPROXY` 更新为 `https://goproxy.cn,direct`，作为后续 IDE 与命令行的推荐代理。
- 更新 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)，新增 Go 依赖拉取报错排查说明。

### 验证结果
- 在 `backend` 目录下使用 `https://goproxy.cn,direct` 执行 `go list -m -json all` 成功。
- 在 `backend` 目录下使用 `https://proxy.golang.org,direct` 执行 `go list -m -json all` 成功。
- 会话内切换 `GOPROXY=https://goproxy.cn,direct` 后，模块解析恢复正常。

### 后续影响
- 后续本机 Go 开发建议统一使用 `https://goproxy.cn,direct`。
- 若 GoLand 重启后仍读取到旧的 `https://goproxy.io`，需要同步清理 Windows 机器级环境变量中的 `GOPROXY`。

## 2026-05-26 12:32:58 +08:00 | v0.0.10 | 实现 v0.3.0 社区资料版第一条业务闭环

### 任务内容
- 继续按规划推进，实现 `v0.3.0` 社区资料版。
- 增加社区帖子、评论、点赞、收藏能力。
- 增加资料库 CRUD、收藏、评分能力。
- 增加管理员审核队列和审核动作。
- 扩展前台和后台页面，完成社区、资料和审核联动。

### 完成结果
- 后端新增 `community` 模块：
  - `posts`
  - `comments`
  - `post_likes`
  - `post_favorites`
- 后端新增 `material` 模块：
  - `materials`
  - `material_favorites`
  - `material_ratings`
- 后端新增 `admin` 审核能力：
  - 审核列表。
  - 帖子通过、驳回、下架。
  - 资料通过、驳回、下架。
- 后端新增接口：
  - `GET /api/v1/posts`
  - `POST /api/v1/posts`
  - `GET /api/v1/posts/:id`
  - `POST /api/v1/posts/:id/comments`
  - `POST /api/v1/posts/:id/like`
  - `POST /api/v1/posts/:id/favorite`
  - `GET /api/v1/materials`
  - `POST /api/v1/materials`
  - `GET /api/v1/materials/:id`
  - `PUT /api/v1/materials/:id`
  - `DELETE /api/v1/materials/:id`
  - `POST /api/v1/materials/:id/favorite`
  - `POST /api/v1/materials/:id/rating`
  - `GET /api/v1/admin/moderation`
  - `POST /api/v1/admin/moderation/posts/:id/approve`
  - `POST /api/v1/admin/moderation/posts/:id/reject`
  - `POST /api/v1/admin/moderation/posts/:id/hide`
  - `POST /api/v1/admin/moderation/materials/:id/approve`
  - `POST /api/v1/admin/moderation/materials/:id/reject`
  - `POST /api/v1/admin/moderation/materials/:id/hide`
- 前台用户端升级：
  - 新增社区页，支持发帖、查看帖子详情、评论、点赞、收藏。
  - 新增资料库页，支持新建资料、查看详情、收藏、评分、删除自己的资料。
  - 首页文案和导航切换到 `v0.3.0` 目标。
- 后台管理端升级：
  - 登录后可查看待审核帖子和资料列表。
  - 支持通过、驳回、下架。
  - 审核列表中的提交人显示名可见，不再只显示用户 ID。
- 更新 `README.md` 和 `docs/DEVELOPMENT.md`，同步当前推进重点和新接口列表。

### 验证结果
- 后端测试通过：
  - `go test ./...`
- 前端类型检查通过：
  - `npm run typecheck`
- 前台构建通过：
  - `npm run build:user`
- 后台构建通过：
  - `npm run build:admin`
- 联调验证通过：
  - 普通用户可注册并登录。
  - 普通用户可创建帖子，状态默认为 `pending`。
  - 普通用户可创建资料，状态默认为 `pending`。
  - 管理员可读取审核队列。
  - 管理员可通过帖子和资料。
  - 审核通过后，帖子出现在公开社区列表。
  - 审核通过后，资料出现在公开资料列表。
  - 用户可对公开帖子点赞和评论。
  - 用户可对公开资料收藏和评分。

### 后续影响
- 项目已经具备平台基础层之上的第一条内容业务闭环。
- 下一步可以继续进入 `v0.4.0`，实现 PDF 阅读、批注和笔记沉淀。
- 后台构建包体仍偏大，后续可以在管理端按页面拆分路由和代码块。

## 2026-05-26 01:39:57 +08:00 | v0.0.9 | 实现 v0.2.0 平台基础版最小闭环

### 任务内容
- 按版本规划开始实现 `v0.2.0` 平台基础版。
- 落地后端认证、用户资料、文件上传和管理员入口。
- 落地前台登录注册、个人资料页和文件上传页。
- 落地后台管理员登录页和管理员资料验证页。
- 对齐环境模板、开发文档和代理配置。

### 完成结果
- 后端配置从单层结构升级为模块化配置，新增：
  - 应用配置。
  - 认证配置。
  - SQL 配置。
  - MongoDB 配置。
  - Redis 配置。
  - 存储配置。
  - 管理员引导账号配置。
- 后端新增数据库与依赖装配能力：
  - `backend/internal/pkg/database/database.go`
  - 支持 `DB_DRIVER=sqlite` 的本地开发模式。
  - 保留 `mysql` 驱动切换能力。
  - 启动时检查 SQL、Redis、MongoDB 状态。
- 后端新增公共能力：
  - `internal/pkg/apperrors`
  - `internal/pkg/response`
  - `internal/pkg/security`
  - `internal/middleware/auth.go`
- 后端实现平台基础模块：
  - `auth`：注册、登录、刷新令牌、退出登录。
  - `user`：获取个人资料、更新个人资料。
  - `file`：上传文件、查询文件元数据、下载文件。
  - `admin`：管理员登录、管理员资料查询、基础审计日志。
- 后端新增数据模型：
  - `users`
  - `refresh_tokens`
  - `files`
  - `audit_logs`
- 后端自动迁移以上基础表结构。
- 后端实现管理员引导账号逻辑：
  - 通过环境变量注入管理员用户名、邮箱和密码。
- 后端健康检查返回依赖状态和 SQL 模式：
  - `sql`
  - `redis`
  - `mongo`
  - `mode`
- 后端已实现接口：
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/users/me`
  - `PUT /api/v1/users/me`
  - `POST /api/v1/files`
  - `GET /api/v1/files/:id`
  - `GET /api/v1/files/:id/download`
  - `POST /api/v1/admin/login`
  - `GET /api/v1/admin/me`
- 前台用户端升级为真实平台基础页：
  - 登录页。
  - 注册页。
  - 工作台页。
  - 受保护的个人资料页。
  - 文件上传入口。
- 前台新增本地会话持久化和基础路由守卫。
- 前台代理目标调整为 `http://localhost:8081`。
- 后台管理端升级为真实管理员入口页：
  - 管理员登录。
  - 管理员会话持久化。
  - `/api/v1/admin/me` 验证。
- 后台代理目标调整为 `http://localhost:8081`。
- 新增前台 API 客户端：
  - `frontend-user/src/api/client.ts`
- 更新环境模板 `.env.example`：
  - 默认 SQLite 本地开发。
  - 增加 JWT TTL。
  - 增加管理员引导账号变量。
- 更新开发说明 `docs/DEVELOPMENT.md`：
  - 增加 SQLite 启动方式。
  - 增加管理员引导账号启动示例。
  - 增加当前已实现的 `v0.2.0` 接口列表。
- 更新 `README.md`，标注当前推进重点为 `v0.2.0` 平台基础版。

### 验证结果
- 后端测试通过：
  - `go test ./...`
- 前端类型检查通过：
  - `npm run typecheck`
- 前台构建通过：
  - `npm run build:user`
- 后台构建通过：
  - `npm run build:admin`
- 运行时接口验证通过：
  - 健康检查返回 `sql=up`、`redis=up`、`mongo=up`、`mode=sqlite`
  - 用户注册成功。
  - 用户登录后可读取个人资料。
  - 用户可更新个人资料。
  - 文件上传成功。
  - 管理员登录成功。
  - 管理员可读取 `/api/v1/admin/me`。
- 后台构建仍存在非阻塞提醒：
  - VueUse 注释被 Rollup 清理。
  - 后台主 chunk 体积仍偏大，后续需要做分包优化。

### 后续影响
- 项目已从工程壳进入“真实平台基础能力”阶段。
- 下一步可以进入 `v0.3.0`，开始实现学习社区和资料库闭环。
- 本地开发推荐继续使用 SQLite 跑平台基础版，再按需要切换到 MySQL。

## 2026-05-26 00:58:30 +08:00 | v0.0.8 | 生成未来版本规划文档

### 任务内容
- 根据最终项目目标，规划未来开发阶段。
- 为每个阶段生成对应版本说明文档。
- 建立版本总览索引，便于后续按版本推进、验收和复盘。

### 完成结果
- 新增版本规划总览 `docs/planning/VERSION_PLAN.md`。
- 新增版本说明目录 `docs/planning/versions`。
- 生成 10 个未来版本说明文档：
  - `docs/planning/versions/v0.1.0-foundation.md`：工程基础版。
  - `docs/planning/versions/v0.2.0-platform-base.md`：平台基础版。
  - `docs/planning/versions/v0.3.0-community-materials.md`：社区资料版。
  - `docs/planning/versions/v0.4.0-reader-notes.md`：阅读笔记版。
  - `docs/planning/versions/v0.5.0-graph-mvp.md`：图谱画布 MVP。
  - `docs/planning/versions/v0.6.0-graph-product.md`：图谱产品化版。
  - `docs/planning/versions/v0.7.0-cards-ai.md`：复习 AI 版。
  - `docs/planning/versions/v0.8.0-diagramming.md`：工程图谱版。
  - `docs/planning/versions/v0.9.0-operations-search.md`：增强运营版。
  - `docs/planning/versions/v1.0.0-release.md`：正式发布版。
- 每个版本文档都包含：
  - 版本定位。
  - 核心目标。
  - 功能范围。
  - 后端交付。
  - 前端交付。
  - 数据设计或基础设施。
  - 验收标准。
  - 暂不做内容。
- 更新 `docs/planning/ROADMAP.md`，增加版本规划总览入口。

### 后续影响
- 后续开发可以按 `v0.1.0` 到 `v1.0.0` 的版本顺序推进。
- 每个版本都有明确边界，能减少“想一次做完全部功能”的失控风险。
- 后续拆任务、建 issue、写变更记录和做验收时，可以直接引用对应版本说明文档。

## 2026-05-26 00:53:17 +08:00 | v0.0.7 | 验证汉语主语言调整

### 任务内容
- 对汉语主语言调整后的工程做轻量验证。
- 确认文档和 HTML 标题调整没有破坏前端类型检查。
- 确认后端基础服务仍可测试通过。

### 完成结果
- `npm run typecheck` 通过：
  - `frontend-user` 执行 `tsc --noEmit` 通过。
  - `frontend-admin` 执行 `vue-tsc --noEmit` 通过。
- `go test ./...` 通过：
  - `studymate/backend/cmd/server`
  - `studymate/backend/internal/app`
  - `studymate/backend/internal/config`

### 后续影响
- 项目已确认可以继续以汉语为主语言推进。
- 当前文案规范变更没有引入构建或类型问题。

## 2026-05-26 00:51:42 +08:00 | v0.0.6 | 确立项目主要语言为汉语

### 任务内容
- 根据用户要求，将项目主要语言明确为汉语。
- 统一已创建文档和可见文案的语言风格。
- 保留代码标识符、包名、命令和 API 路径中的英文工程约定。

### 完成结果
- 更新 `PROJECT_LOG.md` 标题和记录规则，明确“项目主要语言为汉语”。
- 更新 `README.md`，将项目说明、当前状态、应用规划和开发目标改为中文。
- 更新 `docs/DEVELOPMENT.md`，将开发环境、启动命令和验证说明改为中文。
- 更新 `docs/architecture/ARCHITECTURE.md`，将架构说明改为中文。
- 更新 `docs/planning/ROADMAP.md`，将阶段路线改为中文。
- 更新根 `package.json` 的项目描述为中文。
- 更新前台 HTML 标题为 `学伴图谱`。
- 更新后台 HTML 标题为 `学伴管理后台`。

### 后续影响
- 后续新增文档、页面文案、日志记录、注释说明默认使用汉语。
- 英文仍用于代码、命令、配置键、依赖包名、接口路径和第三方工具名称。

## 2026-05-26 00:46:30 +08:00 | v0.0.5 | 启动开发服务并补充开发说明

### 任务内容
- 检查默认开发端口占用情况。
- 避开已占用端口启动当前项目的后端、前台和后台开发服务。
- 验证服务可访问。
- 补充开发启动说明文档。

### 完成结果
- 检测到默认端口已有其他进程：
  - `8080` 被 `ApplicationWebServer` 占用，访问 `/health` 返回 404，不是当前 StudyMate 后端。
  - `5173` 被已有 `node` 进程占用。
  - `5174` 被已有 `node` 进程占用。
- 当前项目改用以下端口启动：
  - 后端：`http://localhost:8081`
  - 前台用户端：`http://localhost:5183/`
  - 后台管理端：`http://localhost:5184/`
- 后端健康检查验证成功：
  - `http://localhost:8081/health`
  - 返回 `{"app":"StudyMate Graph","env":"development","status":"ok"}`
- 前台用户端访问验证成功，HTTP 状态码 `200`。
- 后台管理端访问验证成功，HTTP 状态码 `200`。
- 开发服务日志输出到：
  - `logs/backend-dev.out.log`
  - `logs/backend-dev.err.log`
  - `logs/frontend-user-dev.out.log`
  - `logs/frontend-user-dev.err.log`
  - `logs/frontend-admin-dev.out.log`
  - `logs/frontend-admin-dev.err.log`
- 新增 `docs/DEVELOPMENT.md`，记录依赖安装、后端启动、前台启动、后台启动和验证命令。
- 更新 `README.md`，补充当前状态和开发文档入口。

### 后续影响
- 用户可以直接打开本轮启动的三个本地地址查看当前工程壳。
- 默认端口被占用时，后续开发可继续沿用 `8081`、`5183`、`5184`。
- `logs/*.log` 已被 `.gitignore` 忽略，不会污染版本控制。

## 2026-05-26 00:43:41 +08:00 | v0.0.4 | 验证基础工程可构建

### 任务内容
- 整理后端 Go 依赖。
- 验证后端基础服务可编译。
- 安装前端 monorepo 工作区依赖。
- 验证前台和后台 TypeScript 类型检查。
- 验证前台和后台生产构建。

### 完成结果
- 首次使用当前默认 Go proxy 执行 `go mod tidy` 失败，原因是代理返回 `github.com/gabriel-vasile/mimetype@v1.4.8` 404。
- 临时切换到 `https://proxy.golang.org,direct` 后仍失败，原因是当前网络无法连接官方 Go proxy。
- 临时切换到 `https://goproxy.cn,direct` 后 `go mod tidy` 成功。
- 后端生成 `backend/go.sum`。
- `go test ./...` 通过：
  - `studymate/backend/cmd/server`
  - `studymate/backend/internal/app`
  - `studymate/backend/internal/config`
- `npm install` 成功，新增根 `package-lock.json` 和工作区依赖。
- `npm run typecheck` 成功：
  - `frontend-user` 执行 `tsc --noEmit` 通过。
  - `frontend-admin` 执行 `vue-tsc --noEmit` 通过。
- `npm run build:user` 成功，Vite 构建前台产物。
- `npm run build:admin` 成功，Vite 构建后台产物。
- 后台构建出现非阻塞提醒：
  - VueUse 中部分 `/* #__PURE__ */` 注释位置无法被 Rollup 解释，构建时自动移除。
  - 后台主 chunk 超过 500 kB，后续需要通过路由懒加载或 manualChunks 优化。

### 后续影响
- Phase 0 的基础工程已经具备可安装、可类型检查、可构建的状态。
- 后续本机 Go 命令建议使用 `GOPROXY=https://goproxy.cn,direct`，或把该配置写入开发文档。
- 后台体积优化暂不影响当前开发，等管理端模块增多时统一做代码分包。

## 2026-05-26 00:34:12 +08:00 | v0.0.3 | 补齐基础配置与工程入口

### 任务内容
- 为 monorepo 写入基础配置文件、后端入口、前台入口、后台入口、共享包占位和项目文档。
- 对新增 Go 文件执行格式化。

### 完成结果
- 新增根配置：`.gitignore`、`.env.example`、`package.json`、`README.md`。
- 新增后端 Go 模块 `backend/go.mod`。
- 新增后端服务入口 `backend/cmd/server/main.go`。
- 新增后端配置加载 `backend/internal/config/config.go`。
- 新增 Gin 服务封装和健康检查路由 `backend/internal/app/server.go`，包含 `/health` 和 `/api/v1/health`。
- 新增前台 React/Vite 工程入口：
  - `frontend-user/package.json`
  - `frontend-user/index.html`
  - `frontend-user/tsconfig.json`
  - `frontend-user/vite.config.ts`
  - `frontend-user/src/main.tsx`
  - `frontend-user/src/app/App.tsx`
  - `frontend-user/src/styles.css`
- 新增后台 Vue/Vite 工程入口：
  - `frontend-admin/package.json`
  - `frontend-admin/index.html`
  - `frontend-admin/tsconfig.json`
  - `frontend-admin/vite.config.ts`
  - `frontend-admin/src/main.ts`
  - `frontend-admin/src/App.vue`
- 新增共享包占位：
  - `packages/graph-core`
  - `packages/editor-core`
  - `packages/api-client`
  - `packages/ui`
- 新增项目文档：
  - `docs/planning/ROADMAP.md`
  - `docs/architecture/ARCHITECTURE.md`
- 新增 `storage/uploads/.gitkeep`，保留本地上传目录。

### 后续影响
- 后端已有最小 HTTP 服务结构，后续可以继续接入数据库、认证和业务模块。
- 前台和后台已有最小应用壳，后续可以安装依赖后启动开发服务器。
- 共享包已经预留图谱、编辑器、API 客户端和 UI 的边界。

## 2026-05-26 00:31:33 +08:00 | v0.0.2 | 初始化工程目录骨架

### 任务内容
- 按升级规划创建 StudyMate 的 monorepo 目录结构。
- 预留后端、前台、后台、共享包、文档和本地上传存储目录。

### 完成结果
- 新增后端目录 `backend`，包含 `cmd/server`、`internal/app`、`internal/config`、`internal/middleware`、`internal/modules`、`internal/migrations` 等基础结构。
- 在后端预留领域模块：`auth`、`user`、`file`、`material`、`community`、`note`、`graph`、`card`、`ai`、`search`、`admin`。
- 图谱模块额外预留：`domain`、`operation`、`snapshot`、`importer`、`exporter`、`layout`、`ai`。
- 新增前台目录 `frontend-user`，按 `app/pages/modules/graph-core/shared/api` 拆分。
- 新增后台目录 `frontend-admin`。
- 新增共享包目录 `packages/graph-core`、`packages/editor-core`、`packages/api-client`、`packages/ui`。
- 新增文档目录 `docs/architecture`、`docs/planning`。
- 新增本地文件目录 `storage/uploads`。

### 后续影响
- 项目已经具备按模块继续落地 Phase 0 的目录基础。
- 下一步将补齐根配置、后端 Go 入口、前台 Vite 入口、后台 Vue 入口和基础文档。

## 2026-05-26 00:30:33 +08:00 | v0.0.1 | 创建全局项目记录文件

### 任务内容
- 根据用户要求创建全局记录 log 文件。
- 约定后续所有任务完成后，都将完整结果写入本文件开头。
- 每条记录包含时间和项目版本编号。

### 完成结果
- 新增 `PROJECT_LOG.md`。
- 确立记录格式：
  - 时间
  - 项目版本编号
  - 任务内容
  - 完成结果
  - 后续影响

### 后续影响
- 后续每完成一个新的任务，都必须先更新本文件，再继续推进下一项工作。
- 项目版本从 `v0.0.1` 开始递增。
