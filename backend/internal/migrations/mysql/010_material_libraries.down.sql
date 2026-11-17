-- Safety-first rollback: private records must NEVER become public legacy materials.
-- Archive new scopes before dropping the scope metadata. Restore a DB backup to recover scope data.
UPDATE `materials` SET `status` = 'archived' WHERE `library_scope` IN ('personal', 'official');
ALTER TABLE `materials` DROP INDEX `idx_material_library_owner`;
ALTER TABLE `materials` DROP COLUMN `folder_name`, DROP COLUMN `library_scope`;
DELETE FROM `schema_migrations` WHERE `version` = '010';
