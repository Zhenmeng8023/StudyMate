SET @schema_name = DATABASE();
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'materials' AND index_name = 'idx_material_previous_version') > 0, 'DROP INDEX `idx_material_previous_version` ON `materials`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'previous_version_id') > 0, 'ALTER TABLE `materials` DROP COLUMN `previous_version_id`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'change_summary') > 0, 'ALTER TABLE `materials` DROP COLUMN `change_summary`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
DELETE FROM `schema_migrations` WHERE `version` = '012';
