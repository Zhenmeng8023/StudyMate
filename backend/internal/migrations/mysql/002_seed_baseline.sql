-- StudyMate Graph MySQL seed baseline
-- Idempotent baseline data for roles, permissions and system configs.

INSERT INTO `roles` (`id`, `code`, `name`, `description`)
VALUES
  ('3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', 'admin', '系统管理员', '拥有平台全局管理权限'),
  ('3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe002', 'moderator', '内容审核员', '负责社区与资料审核治理'),
  ('3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', 'user', '普通用户', '默认注册用户角色')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`);

INSERT INTO `permissions` (`id`, `code`, `name`, `resource`, `action`)
VALUES
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a001', 'admin.audit.read', '读取审计日志', 'admin.audit', 'read'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a002', 'admin.moderation.manage', '处理审核任务', 'admin.moderation', 'manage'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a003', 'community.post.read', '读取社区帖子', 'community.post', 'read'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a004', 'community.post.write', '发布社区帖子', 'community.post', 'write'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a005', 'community.comment.write', '发布评论', 'community.comment', 'write'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a006', 'material.read', '读取资料', 'material', 'read'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a007', 'material.write', '创建和编辑资料', 'material', 'write'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a008', 'note.read', '读取笔记', 'note', 'read'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a009', 'note.write', '创建和编辑笔记', 'note', 'write'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a010', 'reader.progress.write', '保存阅读进度', 'reader.progress', 'write'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a011', 'graph.read', '读取知识图谱', 'graph', 'read'),
  ('6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a012', 'graph.write', '编辑知识图谱', 'graph', 'write')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `resource` = VALUES(`resource`),
  `action` = VALUES(`action`);

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`)
VALUES
  ('0d20d49e-b738-4f1a-a691-f5519b4db001', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a001'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db002', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a002'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db003', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a003'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db004', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a004'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db005', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a005'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db006', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a006'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db007', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a007'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db008', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a008'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db009', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a009'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db010', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a010'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db011', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a011'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db012', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a012'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db013', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe002', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a002'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db014', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe002', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a003'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db015', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe002', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a006'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db016', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a003'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db017', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a004'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db018', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a005'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db019', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a006'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db020', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a007'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db021', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a008'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db022', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a009'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db023', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a010'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db024', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a011'),
  ('0d20d49e-b738-4f1a-a691-f5519b4db025', '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003', '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a012')
ON DUPLICATE KEY UPDATE
  `role_id` = VALUES(`role_id`),
  `permission_id` = VALUES(`permission_id`);

INSERT INTO `system_configs` (`id`, `config_key`, `config_value`, `description`)
VALUES
  (
    'b98e49f1-6118-4ef2-ab8f-8d1a12b5c001',
    'platform.locale',
    JSON_OBJECT('value', 'zh-CN'),
    '平台默认语言'
  ),
  (
    'b98e49f1-6118-4ef2-ab8f-8d1a12b5c002',
    'platform.timezone',
    JSON_OBJECT('value', 'Asia/Shanghai'),
    '平台默认时区'
  ),
  (
    'b98e49f1-6118-4ef2-ab8f-8d1a12b5c003',
    'feature.graph',
    JSON_OBJECT('enabled', FALSE, 'targetVersion', 'v0.5.0'),
    '知识图谱功能开关'
  ),
  (
    'b98e49f1-6118-4ef2-ab8f-8d1a12b5c004',
    'feature.ai',
    JSON_OBJECT('enabled', FALSE, 'targetVersion', 'v0.7.0'),
    'AI 学伴功能开关'
  ),
  (
    'b98e49f1-6118-4ef2-ab8f-8d1a12b5c005',
    'search.provider',
    JSON_OBJECT('provider', 'meilisearch', 'status', 'planned'),
    '全文搜索提供方规划'
  )
ON DUPLICATE KEY UPDATE
  `config_value` = VALUES(`config_value`),
  `description` = VALUES(`description`);

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('002', '002_seed_baseline.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
