-- v1.0.0 preserve review source context for annotation and PDF anchor backlinks.

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'source_metadata') = 0,
  'ALTER TABLE `cards` ADD COLUMN `source_metadata` text NULL AFTER `source_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('005', '005_card_source_metadata.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
