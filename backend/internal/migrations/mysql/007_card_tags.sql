-- v1.1 add card tags for browser filtering and manual card creation.

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'tags') = 0,
  'ALTER TABLE `cards` ADD COLUMN `tags` text NULL AFTER `back`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('007', '007_card_tags.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
