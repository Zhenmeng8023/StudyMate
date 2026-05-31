-- StudyMate Graph MySQL schema
-- Idempotent initial schema for local development and future module growth.
-- Target: MySQL 8.0+

SET NAMES utf8mb4;
SET time_zone = '+08:00';

CREATE DATABASE IF NOT EXISTS `studymate`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `studymate`;

CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `version` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `checksum` varchar(128) NULL,
  `applied_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`version`),
  UNIQUE KEY `uk_schema_migrations_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(64) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `display_name` varchar(128) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'user',
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `avatar_file_id` varchar(36) NULL,
  `bio` varchar(500) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` varchar(36) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(500) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` varchar(36) NOT NULL,
  `code` varchar(128) NOT NULL,
  `name` varchar(128) NOT NULL,
  `resource` varchar(64) NOT NULL,
  `action` varchar(64) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_code` (`code`),
  KEY `idx_permissions_resource_action` (`resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_roles_user_role` (`user_id`, `role_id`),
  KEY `idx_user_roles_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `permission_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permissions_role_permission` (`role_id`, `permission_id`),
  KEY `idx_role_permissions_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `revoked_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refresh_tokens_token_hash` (`token_hash`),
  KEY `idx_refresh_tokens_user_id` (`user_id`),
  KEY `idx_refresh_tokens_expires_at` (`expires_at`),
  KEY `idx_refresh_tokens_revoked_at` (`revoked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `teams` (
  `id` varchar(36) NOT NULL,
  `name` varchar(128) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_teams_owner_user_id` (`owner_user_id`),
  KEY `idx_teams_visibility` (`visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `team_members` (
  `id` varchar(36) NOT NULL,
  `team_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'member',
  `joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_team_members_team_user` (`team_id`, `user_id`),
  KEY `idx_team_members_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `file_records` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `mime_type` varchar(128) NOT NULL,
  `size` bigint NOT NULL,
  `path` varchar(512) NOT NULL,
  `storage_provider` varchar(32) NOT NULL DEFAULT 'local',
  `bucket` varchar(128) NULL,
  `checksum_sha256` varchar(64) NULL,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `scan_status` varchar(32) NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_file_records_owner_user_id` (`owner_user_id`),
  KEY `idx_file_records_mime_type` (`mime_type`),
  KEY `idx_file_records_checksum_sha256` (`checksum_sha256`),
  KEY `idx_file_records_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `posts` (
  `id` varchar(36) NOT NULL,
  `author_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `kind` varchar(32) NOT NULL DEFAULT 'article',
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `visibility` varchar(32) NOT NULL DEFAULT 'public',
  `cover_file_id` varchar(36) NULL,
  `summary` varchar(500) NULL,
  `likes_count` bigint NOT NULL DEFAULT 0,
  `favorites_count` bigint NOT NULL DEFAULT 0,
  `comments_count` bigint NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_posts_author_user_id` (`author_user_id`),
  KEY `idx_posts_status` (`status`),
  KEY `idx_posts_kind` (`kind`),
  KEY `idx_posts_visibility` (`visibility`),
  KEY `idx_posts_created_at` (`created_at`),
  KEY `idx_posts_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `comments` (
  `id` varchar(36) NOT NULL,
  `post_id` varchar(36) NOT NULL,
  `author_user_id` varchar(36) NOT NULL,
  `parent_comment_id` varchar(36) NULL,
  `root_comment_id` varchar(36) NULL,
  `reply_to_user_id` varchar(36) NULL,
  `body` text NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'visible',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_comments_post_id` (`post_id`),
  KEY `idx_comments_author_user_id` (`author_user_id`),
  KEY `idx_comments_status` (`status`),
  KEY `idx_comments_parent_comment_id` (`parent_comment_id`),
  KEY `idx_comments_root_comment_id` (`root_comment_id`),
  KEY `idx_comments_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `post_likes` (
  `id` varchar(36) NOT NULL,
  `post_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_likes_post_user` (`post_id`, `user_id`),
  KEY `idx_post_likes_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `post_favorites` (
  `id` varchar(36) NOT NULL,
  `post_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_favorites_post_user` (`post_id`, `user_id`),
  KEY `idx_post_favorites_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `topics` (
  `id` varchar(36) NOT NULL,
  `name` varchar(128) NOT NULL,
  `slug` varchar(128) NOT NULL,
  `description` varchar(500) NULL,
  `status` varchar(32) NOT NULL DEFAULT 'enabled',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_topics_slug` (`slug`),
  KEY `idx_topics_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `post_topics` (
  `post_id` varchar(36) NOT NULL,
  `topic_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`post_id`, `topic_id`),
  KEY `idx_post_topics_topic_id` (`topic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `reports` (
  `id` varchar(36) NOT NULL,
  `reporter_user_id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `description` text NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `handled_by` varchar(36) NULL,
  `handled_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_reports_reporter_user_id` (`reporter_user_id`),
  KEY `idx_reports_target` (`target_type`, `target_id`),
  KEY `idx_reports_status` (`status`),
  KEY `idx_reports_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `follows` (
  `id` varchar(36) NOT NULL,
  `follower_user_id` varchar(36) NOT NULL,
  `following_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follows_pair` (`follower_user_id`, `following_user_id`),
  KEY `idx_follows_following_user_id` (`following_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `collections` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NULL,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_collections_owner_user_id` (`owner_user_id`),
  KEY `idx_collections_visibility` (`visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `collection_items` (
  `id` varchar(36) NOT NULL,
  `collection_id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collection_items_target` (`collection_id`, `target_type`, `target_id`),
  KEY `idx_collection_items_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `materials` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(64) NOT NULL,
  `tags` text NULL,
  `cover_file_id` varchar(36) NULL,
  `attachment_file_id` varchar(36) NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `material_type` varchar(32) NOT NULL DEFAULT 'pdf',
  `authors` varchar(500) NULL,
  `publisher` varchar(255) NULL,
  `published_year` int NULL,
  `isbn` varchar(32) NULL,
  `doi` varchar(128) NULL,
  `language` varchar(32) NULL,
  `copyright_status` varchar(32) NULL,
  `source_url` varchar(1024) NULL,
  `metadata_status` varchar(32) NOT NULL DEFAULT 'pending',
  `favorites_count` bigint NOT NULL DEFAULT 0,
  `ratings_count` bigint NOT NULL DEFAULT 0,
  `rating_sum` bigint NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_materials_owner_user_id` (`owner_user_id`),
  KEY `idx_materials_category` (`category`),
  KEY `idx_materials_status` (`status`),
  KEY `idx_materials_material_type` (`material_type`),
  KEY `idx_materials_updated_at` (`updated_at`),
  KEY `idx_materials_doi` (`doi`),
  KEY `idx_materials_isbn` (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `material_favorites` (
  `id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_favorites_material_user` (`material_id`, `user_id`),
  KEY `idx_material_favorites_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `material_ratings` (
  `id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `score` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_ratings_material_user` (`material_id`, `user_id`),
  KEY `idx_material_ratings_user_id` (`user_id`),
  CONSTRAINT `chk_material_ratings_score` CHECK (`score` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `material_categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(128) NOT NULL,
  `parent_id` varchar(36) NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_categories_name_parent` (`name`, `parent_id`),
  KEY `idx_material_categories_parent_id` (`parent_id`),
  KEY `idx_material_categories_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `material_tags` (
  `id` varchar(36) NOT NULL,
  `name` varchar(128) NOT NULL,
  `usage_count` bigint NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_tags_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `material_tag_links` (
  `material_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`material_id`, `tag_id`),
  KEY `idx_material_tag_links_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `material_files` (
  `id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `file_id` varchar(36) NOT NULL,
  `usage_type` varchar(32) NOT NULL DEFAULT 'attachment',
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_files_usage` (`material_id`, `file_id`, `usage_type`),
  KEY `idx_material_files_file_id` (`file_id`),
  KEY `idx_material_files_usage_type` (`usage_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `material_metadata` (
  `material_id` varchar(36) NOT NULL,
  `material_type` varchar(32) NOT NULL,
  `authors` json NULL,
  `publisher` varchar(255) NULL,
  `published_year` int NULL,
  `isbn` varchar(32) NULL,
  `doi` varchar(128) NULL,
  `source_url` varchar(1024) NULL,
  `citation_json` json NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`material_id`),
  KEY `idx_material_metadata_type` (`material_type`),
  KEY `idx_material_metadata_doi` (`doi`),
  KEY `idx_material_metadata_isbn` (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `reading_lists` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NULL,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_reading_lists_owner_user_id` (`owner_user_id`),
  KEY `idx_reading_lists_visibility` (`visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `reading_list_items` (
  `id` varchar(36) NOT NULL,
  `reading_list_id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` varchar(32) NOT NULL DEFAULT 'planned',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reading_list_items_material` (`reading_list_id`, `material_id`),
  KEY `idx_reading_list_items_material_id` (`material_id`),
  KEY `idx_reading_list_items_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `reading_progresses` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `current_page` bigint NOT NULL DEFAULT 1,
  `total_pages` bigint NOT NULL DEFAULT 1,
  `progress_percent` double NOT NULL DEFAULT 0,
  `bookmarks` text NULL,
  `last_read_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reading_progresses_user_material` (`user_id`, `material_id`),
  KEY `idx_reading_progresses_user_id` (`user_id`),
  KEY `idx_reading_progresses_material_id` (`material_id`),
  KEY `idx_reading_progresses_last_read_at` (`last_read_at`),
  CONSTRAINT `chk_reading_progresses_percent` CHECK (`progress_percent` >= 0 AND `progress_percent` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `pdf_annotations` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `page` bigint NOT NULL,
  `quote` varchar(1000) NULL,
  `comment` text NULL,
  `color` varchar(32) NULL,
  `mongo_document_id` varchar(64) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_pdf_annotations_user_id` (`user_id`),
  KEY `idx_pdf_annotations_material_id` (`material_id`),
  KEY `idx_pdf_annotations_material_page` (`material_id`, `page`),
  KEY `idx_pdf_annotations_mongo_document_id` (`mongo_document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `notes` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `summary` varchar(500) NULL,
  `content` text NOT NULL,
  `material_id` varchar(36) NULL,
  `folder_name` varchar(120) NULL,
  `tags` text NULL,
  `version_number` bigint NOT NULL DEFAULT 1,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `content_doc_id` varchar(64) NULL,
  `last_editor_user_id` varchar(36) NULL,
  `word_count` bigint NOT NULL DEFAULT 0,
  `linked_count` bigint NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_notes_owner_user_id` (`owner_user_id`),
  KEY `idx_notes_material_id` (`material_id`),
  KEY `idx_notes_folder_name` (`folder_name`),
  KEY `idx_notes_visibility` (`visibility`),
  KEY `idx_notes_status` (`status`),
  KEY `idx_notes_updated_at` (`updated_at`),
  KEY `idx_notes_content_doc_id` (`content_doc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `note_versions` (
  `id` varchar(36) NOT NULL,
  `note_id` varchar(36) NOT NULL,
  `editor_user_id` varchar(36) NOT NULL,
  `version_number` bigint NOT NULL,
  `title` varchar(200) NOT NULL,
  `summary` varchar(500) NULL,
  `content` text NOT NULL,
  `mongo_snapshot_id` varchar(64) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_note_versions_note_version` (`note_id`, `version_number`),
  KEY `idx_note_versions_note_id` (`note_id`),
  KEY `idx_note_versions_editor_user_id` (`editor_user_id`),
  KEY `idx_note_versions_mongo_snapshot_id` (`mongo_snapshot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `note_relations` (
  `id` varchar(36) NOT NULL,
  `note_id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `relation_type` varchar(32) NOT NULL DEFAULT 'reference',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_note_relations_target` (`note_id`, `target_type`, `target_id`, `relation_type`),
  KEY `idx_note_relations_note_id` (`note_id`),
  KEY `idx_note_relations_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `graphs` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NULL,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `graph_type` varchar(32) NOT NULL DEFAULT 'knowledge',
  `mode` varchar(32) NOT NULL DEFAULT 'free',
  `current_version` bigint NOT NULL DEFAULT 1,
  `node_count` bigint NOT NULL DEFAULT 0,
  `edge_count` bigint NOT NULL DEFAULT 0,
  `thumbnail_file_id` varchar(36) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_graphs_owner_user_id` (`owner_user_id`),
  KEY `idx_graphs_visibility` (`visibility`),
  KEY `idx_graphs_status` (`status`),
  KEY `idx_graphs_graph_type` (`graph_type`),
  KEY `idx_graphs_mode` (`mode`),
  KEY `idx_graphs_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `graph_permissions` (
  `id` varchar(36) NOT NULL,
  `graph_id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `permission` varchar(32) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_graph_permissions_target` (`graph_id`, `target_type`, `target_id`, `permission`),
  KEY `idx_graph_permissions_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `graph_versions` (
  `id` varchar(36) NOT NULL,
  `graph_id` varchar(36) NOT NULL,
  `version_number` bigint NOT NULL,
  `editor_user_id` varchar(36) NOT NULL,
  `mongo_snapshot_id` varchar(64) NOT NULL,
  `summary` varchar(500) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_graph_versions_graph_version` (`graph_id`, `version_number`),
  KEY `idx_graph_versions_editor_user_id` (`editor_user_id`),
  KEY `idx_graph_versions_mongo_snapshot_id` (`mongo_snapshot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `graph_relations` (
  `id` varchar(36) NOT NULL,
  `graph_id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `relation_type` varchar(32) NOT NULL DEFAULT 'reference',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_graph_relations_target` (`graph_id`, `target_type`, `target_id`, `relation_type`),
  KEY `idx_graph_relations_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `graph_operation_logs` (
  `id` varchar(36) NOT NULL,
  `graph_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `operation_type` varchar(64) NOT NULL,
  `operation_id` varchar(36) NOT NULL,
  `client_id` varchar(128) NULL,
  `mongo_operation_id` varchar(64) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_graph_operation_logs_operation` (`graph_id`, `operation_id`),
  KEY `idx_graph_operation_logs_graph_time` (`graph_id`, `created_at`),
  KEY `idx_graph_operation_logs_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `diagram_templates` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category` varchar(64) NOT NULL,
  `description` text NULL,
  `preview_file_id` varchar(36) NULL,
  `graph_id` varchar(36) NULL,
  `source_type` varchar(32) NULL,
  `status` varchar(32) NOT NULL DEFAULT 'enabled',
  `created_by` varchar(36) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_diagram_templates_category` (`category`),
  KEY `idx_diagram_templates_status` (`status`),
  KEY `idx_diagram_templates_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `diagram_shape_libraries` (
  `id` varchar(36) NOT NULL,
  `name` varchar(128) NOT NULL,
  `category` varchar(64) NOT NULL,
  `icon_file_id` varchar(36) NULL,
  `schema_json` json NULL,
  `style_json` json NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_diagram_shape_libraries_name` (`name`),
  KEY `idx_diagram_shape_libraries_category` (`category`),
  KEY `idx_diagram_shape_libraries_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `diagram_sources` (
  `id` varchar(36) NOT NULL,
  `graph_id` varchar(36) NOT NULL,
  `source_type` varchar(32) NOT NULL,
  `source_hash` varchar(64) NULL,
  `parse_status` varchar(32) NOT NULL DEFAULT 'pending',
  `mongo_source_id` varchar(64) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_diagram_sources_graph_id` (`graph_id`),
  KEY `idx_diagram_sources_type_status` (`source_type`, `parse_status`),
  KEY `idx_diagram_sources_hash` (`source_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `diagram_validations` (
  `id` varchar(36) NOT NULL,
  `graph_id` varchar(36) NOT NULL,
  `rule_type` varchar(64) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `issue_count` int NOT NULL DEFAULT 0,
  `mongo_result_id` varchar(64) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_diagram_validations_graph_id` (`graph_id`),
  KEY `idx_diagram_validations_rule_status` (`rule_type`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `code_analysis_tasks` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `repo_url` varchar(1024) NULL,
  `upload_file_id` varchar(36) NULL,
  `language` varchar(64) NOT NULL,
  `task_type` varchar(64) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `result_graph_id` varchar(36) NULL,
  `error_message` text NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_code_analysis_tasks_user_id` (`user_id`),
  KEY `idx_code_analysis_tasks_status` (`status`),
  KEY `idx_code_analysis_tasks_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `decks` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NULL,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `card_count` bigint NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_decks_owner_user_id` (`owner_user_id`),
  KEY `idx_decks_visibility` (`visibility`),
  KEY `idx_decks_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `cards` (
  `id` varchar(36) NOT NULL,
  `deck_id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `card_type` varchar(32) NOT NULL DEFAULT 'basic',
  `front` text NOT NULL,
  `back` text NOT NULL,
  `source_type` varchar(32) NULL,
  `source_id` varchar(36) NULL,
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_cards_deck_id` (`deck_id`),
  KEY `idx_cards_owner_user_id` (`owner_user_id`),
  KEY `idx_cards_source` (`source_type`, `source_id`),
  KEY `idx_cards_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `card_schedules` (
  `card_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `due_at` datetime(3) NOT NULL,
  `interval_days` int NOT NULL DEFAULT 0,
  `ease_factor` double NOT NULL DEFAULT 2.5,
  `repetition_count` int NOT NULL DEFAULT 0,
  `lapse_count` int NOT NULL DEFAULT 0,
  `state` varchar(32) NOT NULL DEFAULT 'new',
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`card_id`, `user_id`),
  KEY `idx_card_schedules_user_due` (`user_id`, `due_at`),
  KEY `idx_card_schedules_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `card_reviews` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rating` varchar(16) NOT NULL,
  `elapsed_ms` bigint NOT NULL DEFAULT 0,
  `reviewed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_card_reviews_card_id` (`card_id`),
  KEY `idx_card_reviews_user_reviewed` (`user_id`, `reviewed_at`),
  KEY `idx_card_reviews_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ai_tasks` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `task_type` varchar(64) NOT NULL,
  `source_type` varchar(32) NULL,
  `source_id` varchar(36) NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `model` varchar(128) NULL,
  `input_tokens` bigint NOT NULL DEFAULT 0,
  `output_tokens` bigint NOT NULL DEFAULT 0,
  `result_ref_type` varchar(32) NULL,
  `result_ref_id` varchar(36) NULL,
  `error_message` text NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_ai_tasks_user_id` (`user_id`),
  KEY `idx_ai_tasks_task_type` (`task_type`),
  KEY `idx_ai_tasks_source` (`source_type`, `source_id`),
  KEY `idx_ai_tasks_status` (`status`),
  KEY `idx_ai_tasks_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ai_usage_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `task_id` varchar(36) NULL,
  `model` varchar(128) NOT NULL,
  `input_tokens` bigint NOT NULL DEFAULT 0,
  `output_tokens` bigint NOT NULL DEFAULT 0,
  `cost_units` decimal(18,6) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_ai_usage_logs_user_id` (`user_id`),
  KEY `idx_ai_usage_logs_task_id` (`task_id`),
  KEY `idx_ai_usage_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ai_quota_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `quota_type` varchar(64) NOT NULL,
  `delta` bigint NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_ai_quota_logs_user_id` (`user_id`),
  KEY `idx_ai_quota_logs_quota_type` (`quota_type`),
  KEY `idx_ai_quota_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `courses` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NULL,
  `visibility` varchar(32) NOT NULL DEFAULT 'private',
  `status` varchar(32) NOT NULL DEFAULT 'draft',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_courses_owner_user_id` (`owner_user_id`),
  KEY `idx_courses_visibility` (`visibility`),
  KEY `idx_courses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `course_members` (
  `id` varchar(36) NOT NULL,
  `course_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'student',
  `joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_members_course_user` (`course_id`, `user_id`),
  KEY `idx_course_members_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `course_chapters` (
  `id` varchar(36) NOT NULL,
  `course_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_course_chapters_course_order` (`course_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `assignments` (
  `id` varchar(36) NOT NULL,
  `course_id` varchar(36) NOT NULL,
  `chapter_id` varchar(36) NULL,
  `title` varchar(200) NOT NULL,
  `description` text NULL,
  `due_at` datetime(3) NULL,
  `status` varchar(32) NOT NULL DEFAULT 'draft',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_assignments_course_id` (`course_id`),
  KEY `idx_assignments_chapter_id` (`chapter_id`),
  KEY `idx_assignments_due_at` (`due_at`),
  KEY `idx_assignments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `submissions` (
  `id` varchar(36) NOT NULL,
  `assignment_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `content_type` varchar(32) NOT NULL,
  `content_ref_id` varchar(36) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'submitted',
  `submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `graded_at` datetime(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_submissions_assignment_user` (`assignment_id`, `user_id`),
  KEY `idx_submissions_user_id` (`user_id`),
  KEY `idx_submissions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `grades` (
  `id` varchar(36) NOT NULL,
  `submission_id` varchar(36) NOT NULL,
  `grader_user_id` varchar(36) NOT NULL,
  `score` decimal(8,2) NOT NULL,
  `feedback` text NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_grades_submission_id` (`submission_id`),
  KEY `idx_grades_grader_user_id` (`grader_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `search_sync_jobs` (
  `id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `action` varchar(16) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `retry_count` int NOT NULL DEFAULT 0,
  `error_message` text NULL,
  `scheduled_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_search_sync_jobs_status_schedule` (`status`, `scheduled_at`),
  KEY `idx_search_sync_jobs_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `document_chunks` (
  `id` varchar(36) NOT NULL,
  `source_type` varchar(32) NOT NULL,
  `source_id` varchar(36) NOT NULL,
  `chunk_index` int NOT NULL,
  `plain_text` mediumtext NOT NULL,
  `token_count` int NOT NULL DEFAULT 0,
  `mongo_chunk_id` varchar(64) NULL,
  `search_status` varchar(32) NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_document_chunks_source_index` (`source_type`, `source_id`, `chunk_index`),
  KEY `idx_document_chunks_source` (`source_type`, `source_id`),
  KEY `idx_document_chunks_search_status` (`search_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `embedding_tasks` (
  `id` varchar(36) NOT NULL,
  `chunk_id` varchar(36) NOT NULL,
  `provider` varchar(64) NOT NULL,
  `model` varchar(128) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `vector_ref_id` varchar(128) NULL,
  `error_message` text NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_embedding_tasks_chunk_id` (`chunk_id`),
  KEY `idx_embedding_tasks_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `rag_query_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `query_text` text NOT NULL,
  `source_scope_json` json NULL,
  `retrieved_chunks_json` json NULL,
  `model` varchar(128) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_rag_query_logs_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `moderation_tasks` (
  `id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `reason` varchar(255) NULL,
  `assigned_admin_id` varchar(36) NULL,
  `handled_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_moderation_tasks_target` (`target_type`, `target_id`),
  KEY `idx_moderation_tasks_status` (`status`),
  KEY `idx_moderation_tasks_assigned_admin_id` (`assigned_admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` varchar(36) NOT NULL,
  `config_key` varchar(128) NOT NULL,
  `config_value` json NOT NULL,
  `description` varchar(500) NULL,
  `updated_by` varchar(36) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_system_configs_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(36) NOT NULL,
  `actor_id` varchar(36) NULL,
  `action` varchar(128) NOT NULL,
  `target` varchar(128) NOT NULL,
  `metadata` text NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_actor_id` (`actor_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_target` (`target`),
  KEY `idx_audit_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('001', '001_init_schema.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
