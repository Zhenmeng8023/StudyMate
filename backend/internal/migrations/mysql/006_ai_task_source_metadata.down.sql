-- rollback v1.1 AI task source metadata column.

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'ai_tasks' AND column_name = 'source_metadata') = 1,
  'ALTER TABLE `ai_tasks` DROP COLUMN `source_metadata`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DELETE FROM `schema_migrations` WHERE `version` = '006';
