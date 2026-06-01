import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'README.md',
  'docs/DEVELOPMENT.md',
  'docs/planning/ROADMAP.md',
  'docs/planning/VERSION_PLAN.md',
  'docs/planning/versions/v0.6.0-graph-product.md',
  'docs/design/UPGRADE_DESIGN.md',
  '学伴项目-设计说明书.md',
  'CHANGELOG.md',
  'PROJECT_LOG.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/workflows/ci.yml',
];

const requiredContent = [
  ['README.md', '阅读/笔记主链路已闭环'],
  ['README.md', 'docs/design/UPGRADE_DESIGN.md'],
  ['README.md', '学伴项目-设计说明书.md'],
  ['docs/DEVELOPMENT.md', '文档与版本治理'],
  ['docs/planning/ROADMAP.md', 'A. 工程基线与文档治理'],
  ['docs/planning/VERSION_PLAN.md', '建议性能预算'],
  ['docs/planning/VERSION_PLAN.md', 'zh-CN'],
  ['docs/planning/VERSION_PLAN.md', 'npm run test:coverage'],
  ['docs/planning/ROADMAP.md', 'test:coverage'],
  ['docs/DEVELOPMENT.md', 'frontend-user/src/i18n/dictionary.ts'],
  ['docs/planning/versions/v0.6.0-graph-product.md', '强 MVP'],
  ['CHANGELOG.md', 'Unreleased'],
  ['.github/workflows/ci.yml', 'node-version: \'24\''],
  ['.github/workflows/ci.yml', 'npm run test:user'],
  ['.github/workflows/ci.yml', 'npm run test:admin'],
  ['package.json', '"test:e2e"'],
  ['package.json', '"test:coverage"'],
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(path.join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
}

for (const [file, snippet] of requiredContent) {
  const absolutePath = path.join(root, file);
  if (!existsSync(absolutePath)) {
    continue;
  }

  const content = readFileSync(absolutePath, 'utf8');
  if (!content.includes(snippet)) {
    failures.push(`Missing expected content in ${file}: ${snippet}`);
  }
}

if (failures.length > 0) {
  console.error('Document sync verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Document sync verification passed.');
