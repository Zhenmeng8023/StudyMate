-- Official catalog metadata; existing rows remain valid with unknown provenance.
SET @schema_name = DATABASE();
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'material_type') = 0, 'ALTER TABLE `materials` ADD COLUMN `material_type` varchar(32) NOT NULL DEFAULT ''other''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'author') = 0, 'ALTER TABLE `materials` ADD COLUMN `author` varchar(200) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'source_url') = 0, 'ALTER TABLE `materials` ADD COLUMN `source_url` varchar(2048) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'publication_year') = 0, 'ALTER TABLE `materials` ADD COLUMN `publication_year` int NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'edition') = 0, 'ALTER TABLE `materials` ADD COLUMN `edition` varchar(120) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'license_status') = 0, 'ALTER TABLE `materials` ADD COLUMN `license_status` varchar(32) NOT NULL DEFAULT ''unknown''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'materials' AND column_name = 'archive_reason') = 0, 'ALTER TABLE `materials` ADD COLUMN `archive_reason` varchar(500) NOT NULL DEFAULT ''''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
INSERT INTO `schema_migrations` (`version`, `name`, `checksum`) VALUES ('011', '011_official_material_catalog.sql', NULL) ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
