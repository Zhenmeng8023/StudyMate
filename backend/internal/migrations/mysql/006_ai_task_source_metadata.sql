-- v1.1 preserve AI task source context for precise reader backlinks in task history.

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'ai_tasks' AND column_name = 'source_metadata') = 0,
  'ALTER TABLE `ai_tasks` ADD COLUMN `source_metadata` text NULL AFTER `source_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('006', '006_ai_task_source_metadata.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
