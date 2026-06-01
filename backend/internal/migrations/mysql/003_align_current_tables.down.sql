-- StudyMate Graph MySQL alignment rollback
-- 003 is a forward-only schema alignment migration.
-- This rollback removes only the optimization indexes introduced by 003
-- and keeps compatibility fields that were added to align old databases
-- with the current baseline schema.

SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'users' AND index_name = 'idx_users_status_created_at') = 1,
  'ALTER TABLE `users` DROP INDEX `idx_users_status_created_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'file_records' AND index_name = 'idx_file_records_mime_type_created_at') = 1,
  'ALTER TABLE `file_records` DROP INDEX `idx_file_records_mime_type_created_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'posts' AND index_name = 'idx_posts_status_created_at') = 1,
  'ALTER TABLE `posts` DROP INDEX `idx_posts_status_created_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'posts' AND index_name = 'idx_posts_visibility_created_at') = 1,
  'ALTER TABLE `posts` DROP INDEX `idx_posts_visibility_created_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'comments' AND index_name = 'idx_comments_post_status_created_at') = 1,
  'ALTER TABLE `comments` DROP INDEX `idx_comments_post_status_created_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'materials' AND index_name = 'idx_materials_status_created_at') = 1,
  'ALTER TABLE `materials` DROP INDEX `idx_materials_status_created_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'materials' AND index_name = 'idx_materials_owner_updated_at') = 1,
  'ALTER TABLE `materials` DROP INDEX `idx_materials_owner_updated_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'notes' AND index_name = 'idx_notes_owner_updated_at') = 1,
  'ALTER TABLE `notes` DROP INDEX `idx_notes_owner_updated_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'notes' AND index_name = 'idx_notes_owner_material_updated_at') = 1,
  'ALTER TABLE `notes` DROP INDEX `idx_notes_owner_material_updated_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @schema_name AND table_name = 'pdf_annotations' AND column_name = 'rects') = 1,
  'ALTER TABLE `pdf_annotations` DROP COLUMN `rects`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @schema_name AND table_name = 'pdf_annotations' AND index_name = 'idx_pdf_annotations_user_material_updated_at') = 1,
  'ALTER TABLE `pdf_annotations` DROP INDEX `idx_pdf_annotations_user_material_updated_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DELETE FROM `schema_migrations`
WHERE `version` = '003';
