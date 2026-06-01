# Changelog

所有重要变更都会记录在此文件中。格式遵循 Keep a Changelog 的基本结构，版本号按 StudyMate 发布节奏维护。

## Unreleased

### Added

- 新增 `docs/design/UPGRADE_DESIGN.md` 作为升级设计主入口，并保留根目录设计说明兼容入口。
- 新增 v1.0 路线图、版本计划、图谱产品化说明、PR 模板、CI 骨架和文档同步脚本。

### Changed

- README 当前阶段更新为真实项目状态：阅读/笔记已闭环，图谱工作区为强 MVP，复习和 AI 部分实现，后台审核主链存在但治理能力不完整。
- `.gitignore` 重新允许 `PROJECT_LOG.md`、`docs/planning/` 和 `docs/design/` 进入版本治理。

### Planned

- 建立 CI 与前端测试基线。
- 拆分用户端、图谱工作区和管理端超大文件。
- 收口阅读/笔记、图谱、复习/AI、搜索/后台治理与分享。
