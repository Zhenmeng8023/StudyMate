-- v1.2 add minimal learning step persistence for formal review queue states.

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'card_schedules' AND column_name = 'learning_step') = 0,
  'ALTER TABLE `card_schedules` ADD COLUMN `learning_step` int NOT NULL DEFAULT 0 AFTER `due_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('009', '009_card_schedule_learning_step.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
