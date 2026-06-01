-- StudyMate Graph MySQL alignment migration
-- Align legacy local tables with the current init schema and add query-oriented indexes.

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'users' AND column_name = 'status') = 0,
  'ALTER TABLE `users` ADD COLUMN `status` varchar(32) NOT NULL DEFAULT ''active'' AFTER `role`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'users' AND column_name = 'avatar_file_id') = 0,
  'ALTER TABLE `users` ADD COLUMN `avatar_file_id` varchar(36) NULL AFTER `status`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'users' AND column_name = 'bio') = 0,
  'ALTER TABLE `users` ADD COLUMN `bio` varchar(500) NULL AFTER `avatar_file_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'users' AND index_name = 'idx_users_status_created_at') = 0,
  'ALTER TABLE `users` ADD INDEX `idx_users_status_created_at` (`status`, `created_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'file_records' AND column_name = 'storage_provider') = 0,
  'ALTER TABLE `file_records` ADD COLUMN `storage_provider` varchar(32) NOT NULL DEFAULT ''local'' AFTER `path`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'file_records' AND column_name = 'bucket') = 0,
  'ALTER TABLE `file_records` ADD COLUMN `bucket` varchar(128) NULL AFTER `storage_provider`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'file_records' AND column_name = 'checksum_sha256') = 0,
  'ALTER TABLE `file_records` ADD COLUMN `checksum_sha256` varchar(64) NULL AFTER `bucket`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'file_records' AND column_name = 'visibility') = 0,
  'ALTER TABLE `file_records` ADD COLUMN `visibility` varchar(32) NOT NULL DEFAULT ''private'' AFTER `checksum_sha256`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'file_records' AND column_name = 'scan_status') = 0,
  'ALTER TABLE `file_records` ADD COLUMN `scan_status` varchar(32) NOT NULL DEFAULT ''pending'' AFTER `visibility`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'file_records' AND index_name = 'idx_file_records_mime_type_created_at') = 0,
  'ALTER TABLE `file_records` ADD INDEX `idx_file_records_mime_type_created_at` (`mime_type`, `created_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'file_records' AND index_name = 'idx_file_records_checksum_sha256') = 0
  AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'file_records' AND column_name = 'checksum_sha256') = 1,
  'ALTER TABLE `file_records` ADD INDEX `idx_file_records_checksum_sha256` (`checksum_sha256`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'posts' AND column_name = 'visibility') = 0,
  'ALTER TABLE `posts` ADD COLUMN `visibility` varchar(32) NOT NULL DEFAULT ''public'' AFTER `status`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'posts' AND column_name = 'cover_file_id') = 0,
  'ALTER TABLE `posts` ADD COLUMN `cover_file_id` varchar(36) NULL AFTER `visibility`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'posts' AND column_name = 'summary') = 0,
  'ALTER TABLE `posts` ADD COLUMN `summary` varchar(500) NULL AFTER `cover_file_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'posts' AND column_name = 'likes_count') = 0,
  'ALTER TABLE `posts` ADD COLUMN `likes_count` bigint NOT NULL DEFAULT 0 AFTER `summary`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'posts' AND column_name = 'favorites_count') = 0,
  'ALTER TABLE `posts` ADD COLUMN `favorites_count` bigint NOT NULL DEFAULT 0 AFTER `likes_count`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'posts' AND column_name = 'comments_count') = 0,
  'ALTER TABLE `posts` ADD COLUMN `comments_count` bigint NOT NULL DEFAULT 0 AFTER `favorites_count`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'posts' AND index_name = 'idx_posts_status_created_at') = 0,
  'ALTER TABLE `posts` ADD INDEX `idx_posts_status_created_at` (`status`, `created_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'posts' AND index_name = 'idx_posts_visibility_created_at') = 0,
  'ALTER TABLE `posts` ADD INDEX `idx_posts_visibility_created_at` (`visibility`, `created_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'comments' AND column_name = 'parent_comment_id') = 0,
  'ALTER TABLE `comments` ADD COLUMN `parent_comment_id` varchar(36) NULL AFTER `author_user_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'comments' AND column_name = 'root_comment_id') = 0,
  'ALTER TABLE `comments` ADD COLUMN `root_comment_id` varchar(36) NULL AFTER `parent_comment_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'comments' AND column_name = 'reply_to_user_id') = 0,
  'ALTER TABLE `comments` ADD COLUMN `reply_to_user_id` varchar(36) NULL AFTER `root_comment_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'comments' AND index_name = 'idx_comments_post_status_created_at') = 0,
  'ALTER TABLE `comments` ADD INDEX `idx_comments_post_status_created_at` (`post_id`, `status`, `created_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'materials' AND index_name = 'idx_materials_status_created_at') = 0,
  'ALTER TABLE `materials` ADD INDEX `idx_materials_status_created_at` (`status`, `created_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'materials' AND index_name = 'idx_materials_owner_updated_at') = 0,
  'ALTER TABLE `materials` ADD INDEX `idx_materials_owner_updated_at` (`owner_user_id`, `updated_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'notes' AND index_name = 'idx_notes_owner_updated_at') = 0,
  'ALTER TABLE `notes` ADD INDEX `idx_notes_owner_updated_at` (`owner_user_id`, `updated_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'notes' AND index_name = 'idx_notes_owner_material_updated_at') = 0,
  'ALTER TABLE `notes` ADD INDEX `idx_notes_owner_material_updated_at` (`owner_user_id`, `material_id`, `updated_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'note_versions' AND index_name = 'uk_note_versions_note_version') = 0
  AND (
    SELECT COUNT(*) FROM (
      SELECT `note_id`, `version_number`, COUNT(*) AS duplicate_count
      FROM `note_versions`
      GROUP BY `note_id`, `version_number`
      HAVING COUNT(*) > 1
    ) AS duplicated_versions
  ) = 0,
  'ALTER TABLE `note_versions` ADD UNIQUE KEY `uk_note_versions_note_version` (`note_id`, `version_number`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'note_relations' AND index_name = 'idx_note_relations_note_target') = 0,
  'ALTER TABLE `note_relations` ADD INDEX `idx_note_relations_note_target` (`note_id`, `target_type`, `target_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'reading_progresses' AND index_name = 'uk_reading_progresses_user_material') = 0
  AND (
    SELECT COUNT(*) FROM (
      SELECT `user_id`, `material_id`, COUNT(*) AS duplicate_count
      FROM `reading_progresses`
      GROUP BY `user_id`, `material_id`
      HAVING COUNT(*) > 1
    ) AS duplicated_progresses
  ) = 0,
  'ALTER TABLE `reading_progresses` ADD UNIQUE KEY `uk_reading_progresses_user_material` (`user_id`, `material_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'reading_progresses' AND index_name = 'idx_reading_progresses_last_read_at') = 0,
  'ALTER TABLE `reading_progresses` ADD INDEX `idx_reading_progresses_last_read_at` (`last_read_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'pdf_annotations' AND column_name = 'rects') = 0,
  'ALTER TABLE `pdf_annotations` ADD COLUMN `rects` text NULL AFTER `color`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'pdf_annotations' AND index_name = 'idx_pdf_annotations_user_material_updated_at') = 0,
  'ALTER TABLE `pdf_annotations` ADD INDEX `idx_pdf_annotations_user_material_updated_at` (`user_id`, `material_id`, `updated_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'pdf_annotations' AND index_name = 'idx_pdf_annotations_material_page') = 0,
  'ALTER TABLE `pdf_annotations` ADD INDEX `idx_pdf_annotations_material_page` (`material_id`, `page`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('003', '003_align_current_tables.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
