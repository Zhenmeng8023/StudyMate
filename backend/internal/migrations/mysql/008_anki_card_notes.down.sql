SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'cards' AND index_name = 'idx_cards_template_id') = 1,
  'ALTER TABLE `cards` DROP INDEX `idx_cards_template_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'cards' AND index_name = 'idx_cards_card_note_id') = 1,
  'ALTER TABLE `cards` DROP INDEX `idx_cards_card_note_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'template_ordinal') = 1,
  'ALTER TABLE `cards` DROP COLUMN `template_ordinal`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'template_id') = 1,
  'ALTER TABLE `cards` DROP COLUMN `template_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'card_note_id') = 1,
  'ALTER TABLE `cards` DROP COLUMN `card_note_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DELETE FROM `card_templates` WHERE `id` IN ('tmpl-basic-0', 'tmpl-basic-rev-0', 'tmpl-basic-rev-1', 'tmpl-cloze-0');
DELETE FROM `note_types` WHERE `id` IN ('note-type-basic', 'note-type-basic-reverse', 'note-type-cloze');

DROP TABLE IF EXISTS `card_notes`;
DROP TABLE IF EXISTS `card_templates`;
DROP TABLE IF EXISTS `note_types`;

DELETE FROM `schema_migrations` WHERE `version` = '008';
