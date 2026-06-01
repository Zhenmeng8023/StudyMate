-- v1.0.0 share links for public read-only token resolution.

CREATE TABLE IF NOT EXISTS `share_links` (
  `id` varchar(36) NOT NULL,
  `owner_user_id` varchar(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `mode` varchar(32) NOT NULL,
  `token` varchar(96) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'active',
  `expires_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revoked_at` datetime(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_share_links_token` (`token`),
  KEY `idx_share_links_owner_created` (`owner_user_id`, `created_at`),
  KEY `idx_share_links_target` (`target_type`, `target_id`),
  KEY `idx_share_links_status_expiry` (`status`, `expires_at`),
  KEY `idx_share_links_revoked_at` (`revoked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `schema_migrations` (`version`, `name`, `checksum`)
VALUES ('004', '004_share_links.sql', NULL)
ON DUPLICATE KEY UPDATE `applied_at` = `applied_at`;
