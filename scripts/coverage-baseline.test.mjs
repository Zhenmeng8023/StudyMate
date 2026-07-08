import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  coverageBaselines,
  evaluateCoverageThresholds,
  parseGoCoverageTotal,
  parseNodeCoverageReport,
  parseVitestCoverageSummary,
} from "./verify-coverage-gates.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("coverage baseline gate is wired into scripts, CI, and release docs", () => {
  const packageJson = readJson("package.json");
  const ciWorkflow = readText(".github/workflows/ci.yml");
  const developmentDoc = readText("docs/DEVELOPMENT.md");
  const readme = readText("README.md");
  const versionPlan = readText("docs/planning/VERSION_PLAN.md");
  const releaseChecklist = readText("docs/planning/versions/v1.0.0-release.md");

  assert.equal(packageJson.scripts?.["verify:coverage"], "node scripts/verify-coverage-gates.mjs");
  assert.match(packageJson.scripts?.ci ?? "", /npm run verify:coverage/);
  assert.match(ciWorkflow, /Verify coverage baseline[\s\S]*npm run verify:coverage/);
  assert.match(developmentDoc, /npm run verify:coverage/);
  assert.match(readme, /npm run verify:coverage/);
  assert.match(versionPlan, /npm run verify:coverage/);
  assert.match(releaseChecklist, /npm run verify:coverage/);
});

test("coverage threshold helpers parse frontend, graph-core, and backend reports", () => {
  const vitestMetrics = parseVitestCoverageSummary({
    total: {
      statements: { pct: 68.45 },
      branches: { pct: 63.49 },
      functions: { pct: 67.63 },
      lines: { pct: 68.95 },
    },
  });
  const nodeMetrics = parseNodeCoverageReport(`
ℹ start of coverage report
ℹ --------------------------------------------------------------------------------------
ℹ all files       |  96.71 |    79.64 |  100.00 |
ℹ --------------------------------------------------------------------------------------
ℹ end of coverage report
`);
  const goMetrics = parseGoCoverageTotal(`
studymate/backend/internal/pkg/security/token_manager.go:76: HashToken 0.0%
total:                                            (statements)                25.6%
`);

  assert.deepEqual(vitestMetrics, {
    statements: 68.45,
    branches: 63.49,
    functions: 67.63,
    lines: 68.95,
  });
  assert.deepEqual(nodeMetrics, {
    lines: 96.71,
    branches: 79.64,
    functions: 100,
  });
  assert.deepEqual(goMetrics, {
    statements: 25.6,
  });
});

test("coverage thresholds fail fast when a package regresses below the baseline", () => {
  const failures = evaluateCoverageThresholds(
    "frontend-user",
    {
      statements: coverageBaselines.frontendUser.statements - 0.01,
      branches: coverageBaselines.frontendUser.branches,
      functions: coverageBaselines.frontendUser.functions,
      lines: coverageBaselines.frontendUser.lines,
    },
    coverageBaselines.frontendUser,
  );

  assert.equal(failures.length, 1);
  assert.match(failures[0], /frontend-user statements/);
});
