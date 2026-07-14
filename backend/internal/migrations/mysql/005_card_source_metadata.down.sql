SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'source_metadata') = 1,
  'ALTER TABLE `cards` DROP COLUMN `source_metadata`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DELETE FROM `schema_migrations` WHERE `version` = '005';
