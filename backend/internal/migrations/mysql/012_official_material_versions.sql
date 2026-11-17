SET @schema_name = DATABASE();
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'previous_version_id') = 0, 'ALTER TABLE `materials` ADD COLUMN `previous_version_id` char(36) NULL DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'change_summary') = 0, 'ALTER TABLE `materials` ADD COLUMN `change_summary` varchar(500) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'materials' AND index_name = 'idx_material_previous_version') = 0, 'CREATE UNIQUE INDEX `idx_material_previous_version` ON `materials` (`previous_version_id`)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
INSERT INTO `schema_migrations` (`version`, `name`, `checksum`) VALUES ('012', '012_official_material_versions.sql', NULL) ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
