-- StudyMate Graph MySQL seed rollback
-- Remove baseline roles, permissions and system config seeds.

DELETE FROM `role_permissions`
WHERE `id` IN (
  '0d20d49e-b738-4f1a-a691-f5519b4db001',
  '0d20d49e-b738-4f1a-a691-f5519b4db002',
  '0d20d49e-b738-4f1a-a691-f5519b4db003',
  '0d20d49e-b738-4f1a-a691-f5519b4db004',
  '0d20d49e-b738-4f1a-a691-f5519b4db005',
  '0d20d49e-b738-4f1a-a691-f5519b4db006',
  '0d20d49e-b738-4f1a-a691-f5519b4db007',
  '0d20d49e-b738-4f1a-a691-f5519b4db008',
  '0d20d49e-b738-4f1a-a691-f5519b4db009',
  '0d20d49e-b738-4f1a-a691-f5519b4db010',
  '0d20d49e-b738-4f1a-a691-f5519b4db011',
  '0d20d49e-b738-4f1a-a691-f5519b4db012',
  '0d20d49e-b738-4f1a-a691-f5519b4db013',
  '0d20d49e-b738-4f1a-a691-f5519b4db014',
  '0d20d49e-b738-4f1a-a691-f5519b4db015',
  '0d20d49e-b738-4f1a-a691-f5519b4db016',
  '0d20d49e-b738-4f1a-a691-f5519b4db017',
  '0d20d49e-b738-4f1a-a691-f5519b4db018',
  '0d20d49e-b738-4f1a-a691-f5519b4db019',
  '0d20d49e-b738-4f1a-a691-f5519b4db020',
  '0d20d49e-b738-4f1a-a691-f5519b4db021',
  '0d20d49e-b738-4f1a-a691-f5519b4db022',
  '0d20d49e-b738-4f1a-a691-f5519b4db023',
  '0d20d49e-b738-4f1a-a691-f5519b4db024',
  '0d20d49e-b738-4f1a-a691-f5519b4db025'
);

DELETE FROM `system_configs`
WHERE `id` IN (
  'b98e49f1-6118-4ef2-ab8f-8d1a12b5c001',
  'b98e49f1-6118-4ef2-ab8f-8d1a12b5c002',
  'b98e49f1-6118-4ef2-ab8f-8d1a12b5c003',
  'b98e49f1-6118-4ef2-ab8f-8d1a12b5c004',
  'b98e49f1-6118-4ef2-ab8f-8d1a12b5c005'
);

DELETE FROM `permissions`
WHERE `id` IN (
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a001',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a002',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a003',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a004',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a005',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a006',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a007',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a008',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a009',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a010',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a011',
  '6f3f1db4-bf11-4b3d-a7c8-f4c5bc20a012'
);

DELETE FROM `roles`
WHERE `id` IN (
  '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe001',
  '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe002',
  '3c4f5ddf-a3ad-4f42-a1f2-f028cb1fe003'
);

DELETE FROM `schema_migrations`
WHERE `version` = '002';
