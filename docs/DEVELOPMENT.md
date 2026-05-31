# 开发说明

## 环境要求

- Go 1.26+
- Node.js 24+
- npm 11+
- MySQL 8+
- MongoDB 8+
- Redis

## 安装依赖

```powershell
npm install
```

Go 依赖建议在 `backend` 目录执行：

```powershell
$env:GOPROXY='https://goproxy.cn,direct'
go mod tidy
```

## Go 依赖拉取报错排查

如果你在 GoLand 或命令行里看到下面这类错误：

- `reading https://goproxy.io/... 404 Not Found`
- `git ls-remote ... unknown option 'end-of-options'`

通常不是本机 Git 版本问题，而是 `goproxy.io` 对部分依赖回源失败。建议切换到：

```powershell
go env -w GOPROXY=https://goproxy.cn,direct
[Environment]::SetEnvironmentVariable('GOPROXY', 'https://goproxy.cn,direct', 'User')
```

然后重启 GoLand，再执行：

```powershell
cd backend
go list -m -json all
```

如果仍显示旧的 `https://goproxy.io`，说明 Windows 机器级环境变量还在覆盖用户级配置，需要手动修改或删除系统级 `GOPROXY`。

## 启动后端

本地开发默认使用 MySQL，和项目最初规划保持一致。请先确认本机已经创建 `studymate` 数据库，并且 `root` 用户密码为 `123456`：

服务启动时会自动执行内置的 MySQL 迁移脚本，迁移目录位于 `backend/internal/migrations/mysql/`。
当前默认包括：

- `001_init_schema.sql`：基础表结构
- `002_seed_baseline.sql`：基础角色、权限、系统配置种子数据
- `003_align_current_tables.sql`：补齐历史本地库缺失字段和查询索引

对应回滚文件使用 `.down.sql` 命名，例如：

- `001_init_schema.down.sql`
- `002_seed_baseline.down.sql`
- `003_align_current_tables.down.sql`

如果只想先执行数据库迁移，可以单独运行：

```powershell
cd backend
go run ./cmd/migrate
```

MongoDB 当前采用脚本初始化集合与索引，脚本目录位于 `backend/internal/migrations/mongo/`。
初始化：

```powershell
mongosh "mongodb://127.0.0.1:27017/studymate_content" --file "backend/internal/migrations/mongo/001_init_content_collections.js"
```

回滚：

```powershell
mongosh "mongodb://127.0.0.1:27017/studymate_content" --file "backend/internal/migrations/mongo/001_init_content_collections.down.js"
```

当前 Mongo 脚本覆盖：

- `note_documents`
- `note_snapshots`
- `graph_documents`
- `graph_snapshots`
- `pdf_annotation_documents`
- `material_text_documents`
- `ai_conversations`
- `ai_drafts`
- `diagram_source_documents`
- `user_workspace_states`

```powershell
cd backend
$env:APP_PORT='8023'
$env:DB_DRIVER='mysql'
$env:MYSQL_DSN='root:123456@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local'
$env:ADMIN_BOOTSTRAP_USERNAME='admin'
$env:ADMIN_BOOTSTRAP_EMAIL='admin@studymate.local'
$env:ADMIN_BOOTSTRAP_PASSWORD='StudyMate123!'
go run ./cmd/server
```

健康检查：

```text
http://localhost:8023/health
```

## 启动用户端

```powershell
npm --workspace frontend-user run dev
```

默认地址：

```text
http://localhost:8001/
```

如果 `8001` 被占用，可临时改到备用端口：

```powershell
npm --workspace frontend-user run dev -- --port 8003
```

## 启动管理端

```powershell
npm --workspace frontend-admin run dev
```

默认地址：

```text
http://localhost:8002/
```

如果 `8002` 被占用，可临时改到备用端口：

```powershell
npm --workspace frontend-admin run dev -- --port 8004
```

## 当前本地能力说明

### 用户端

- 登录、注册、退出
- 资料列表、资料详情、上传附件、创建资料、编辑资料
- 阅读器进度、书签、批注
- 富文本笔记、版本历史、版本恢复
- 笔记正文双写到 MongoDB `note_documents / note_snapshots`
- 社区公开内容浏览

### 管理端

- 管理员登录
- 审核队列读取
- 帖子与资料通过 / 驳回 / 下架
- 治理后台壳层和模块占位

## 推荐验证命令

```powershell
npm run typecheck
npm run build:user
npm run build:admin
cd backend
go test ./...
```

## 编码说明

- 项目主语言使用汉语。
- 文档、UI 文案、日志默认使用中文。
- 代码标识符、包名、命令、API 路径、第三方工具名保留英文。
- 如果终端里出现一串明显不属于正常中文的乱码，要先区分是终端显示编码问题，还是文件本身真的被错误转码。
