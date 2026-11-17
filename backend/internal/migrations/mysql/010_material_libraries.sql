-- Separate private learning resources from platform-published and legacy community materials.
-- Historical rows remain community resources; approval never implies official authorship.
SET @schema_name = DATABASE();
SET @sql = IF(
 (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'library_scope') = 0,
 'ALTER TABLE `materials` ADD COLUMN `library_scope` varchar(32) NOT NULL DEFAULT ''community'' AFTER `owner_user_id`',
 'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(
 (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'folder_name') = 0,
 'ALTER TABLE `materials` ADD COLUMN `folder_name` varchar(120) NOT NULL DEFAULT '''' AFTER `library_scope`',
 'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF(
 (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'materials' AND index_name = 'idx_material_library_owner') = 0,
 'CREATE INDEX `idx_material_library_owner` ON `materials` (`library_scope`, `owner_user_id`, `status`)',
 'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('010', '010_material_libraries.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
