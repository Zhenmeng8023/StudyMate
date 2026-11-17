-- v1.1 add minimal Anki-style card note persistence and generated card metadata.

CREATE TABLE IF NOT EXISTS `note_types` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `kind` varchar(64) NOT NULL,
  `is_builtin` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `field_schema_json` text NULL,
  `template_count` int NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_note_types_code` (`code`),
  KEY `idx_note_types_owner_user_id` (`owner_user_id`),
  KEY `idx_note_types_kind` (`kind`),
  KEY `idx_note_types_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `card_templates` (
  `id` varchar(36) NOT NULL,
  `note_type_id` varchar(36) NOT NULL,
  `template_key` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `template_kind` varchar(64) NOT NULL,
  `ordinal` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `front_format` text NULL,
  `back_format` text NULL,
  `cloze_rule` text NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_card_templates_note_key` (`note_type_id`, `template_key`),
  KEY `idx_card_templates_template_kind` (`template_kind`),
  KEY `idx_card_templates_ordinal` (`ordinal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `card_notes` (
  `id` varchar(36) NOT NULL,
  `deck_id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `note_type_id` varchar(36) NOT NULL,
  `note_type_code` varchar(64) NOT NULL,
  `primary_source_type` varchar(64) NULL,
  `primary_source_id` varchar(64) NULL,
  `fields_json` text NULL,
  `source_links_json` text NULL,
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `generated_card_count` int NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_card_notes_deck_id` (`deck_id`),
  KEY `idx_card_notes_owner_user_id` (`owner_user_id`),
  KEY `idx_card_notes_note_type_id` (`note_type_id`),
  KEY `idx_card_notes_note_type_code` (`note_type_code`),
  KEY `idx_card_notes_primary_source` (`primary_source_type`, `primary_source_id`),
  KEY `idx_card_notes_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'card_note_id') = 0,
  'ALTER TABLE `cards` ADD COLUMN `card_note_id` varchar(36) NULL AFTER `owner_user_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'cards' AND index_name = 'idx_cards_card_note_id') = 0,
  'ALTER TABLE `cards` ADD KEY `idx_cards_card_note_id` (`card_note_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'template_id') = 0,
  'ALTER TABLE `cards` ADD COLUMN `template_id` varchar(64) NULL AFTER `card_note_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'cards' AND index_name = 'idx_cards_template_id') = 0,
  'ALTER TABLE `cards` ADD KEY `idx_cards_template_id` (`template_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'template_ordinal') = 0,
  'ALTER TABLE `cards` ADD COLUMN `template_ordinal` int NOT NULL DEFAULT 0 AFTER `template_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'cards' AND column_name = 'source_metadata') = 0,
  'ALTER TABLE `cards` ADD COLUMN `source_metadata` text NULL AFTER `source_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `note_types` (`id`, `owner_user_id`, `code`, `name`, `kind`, `is_builtin`, `status`, `field_schema_json`, `template_count`)
VALUES
  ('note-type-basic', NULL, 'basic', 'Basic', 'basic', 1, 'active', '[{"name":"front","label":"Front","kind":"text","required":true},{"name":"back","label":"Back","kind":"text","required":true}]', 1),
  ('note-type-basic-reverse', NULL, 'basic_reverse', 'Basic Reverse', 'basic_reverse', 1, 'active', '[{"name":"front","label":"Front","kind":"text","required":true},{"name":"back","label":"Back","kind":"text","required":true}]', 2),
  ('note-type-cloze', NULL, 'cloze', 'Cloze', 'cloze', 1, 'active', '[{"name":"text","label":"Text","kind":"cloze","required":true},{"name":"extra","label":"Extra","kind":"text","required":false}]', 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `kind` = VALUES(`kind`),
  `is_builtin` = VALUES(`is_builtin`),
  `status` = VALUES(`status`),
  `field_schema_json` = VALUES(`field_schema_json`),
  `template_count` = VALUES(`template_count`);

INSERT INTO `card_templates` (`id`, `note_type_id`, `template_key`, `name`, `template_kind`, `ordinal`, `is_active`, `front_format`, `back_format`, `cloze_rule`)
VALUES
  ('tmpl-basic-0', 'note-type-basic', 'basic-0', 'Card 1', 'basic', 0, 1, '{{front}}', '{{back}}', NULL),
  ('tmpl-basic-rev-0', 'note-type-basic-reverse', 'basic-reverse-0', 'Forward', 'basic', 0, 1, '{{front}}', '{{back}}', NULL),
  ('tmpl-basic-rev-1', 'note-type-basic-reverse', 'basic-reverse-1', 'Reverse', 'basic', 1, 1, '{{back}}', '{{front}}', NULL),
  ('tmpl-cloze-0', 'note-type-cloze', 'cloze-0', 'Cloze', 'cloze', 0, 1, '{{cloze:text}}', '{{text}}\n\n{{extra}}', '{{cN::...}}')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `template_kind` = VALUES(`template_kind`),
  `ordinal` = VALUES(`ordinal`),
  `is_active` = VALUES(`is_active`),
  `front_format` = VALUES(`front_format`),
  `back_format` = VALUES(`back_format`),
  `cloze_rule` = VALUES(`cloze_rule`);

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('008', '008_anki_card_notes.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
