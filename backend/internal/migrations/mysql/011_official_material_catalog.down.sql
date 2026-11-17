-- Removes catalog metadata only; original files and learning identities remain.
SET @schema_name = DATABASE();
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'material_type') > 0, 'ALTER TABLE `materials` DROP COLUMN `material_type`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'author') > 0, 'ALTER TABLE `materials` DROP COLUMN `author`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'source_url') > 0, 'ALTER TABLE `materials` DROP COLUMN `source_url`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'publication_year') > 0, 'ALTER TABLE `materials` DROP COLUMN `publication_year`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'edition') > 0, 'ALTER TABLE `materials` DROP COLUMN `edition`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'license_status') > 0, 'ALTER TABLE `materials` DROP COLUMN `license_status`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'archive_reason') > 0, 'ALTER TABLE `materials` DROP COLUMN `archive_reason`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
DELETE FROM `schema_migrations` WHERE `version` = '011';
