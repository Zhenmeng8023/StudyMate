SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'card_schedules' AND column_name = 'learning_step') = 1,
  'ALTER TABLE `card_schedules` DROP COLUMN `learning_step`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DELETE FROM `schema_migrations` WHERE `version` = '009';
