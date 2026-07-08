import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("graph conflict regression entrypoint is wired into scripts and docs", () => {
  const packageJson = readJson("package.json");
  const readme = readText("README.md");
  const developmentDoc = readText("docs/DEVELOPMENT.md");
  const roadmap = readText("docs/engineering/CODEX_EXECUTION_ROADMAP.md");
  const backlog = readText("docs/engineering/CODEX_BACKLOG.md");
  const regressionDoc = readText("docs/engineering/GRAPH_CONFLICT_REGRESSION.md");
  const graphWorkspaceE2E = readText("e2e/v1-graph-workspace.spec.ts");

  assert.equal(
    packageJson.scripts?.["verify:graph-conflicts"],
    "npm run test:graph:conflicts:frontend && npm run test:graph:conflicts:backend && npm run test:graph:conflicts:e2e && npm run verify:docs"
  );
  assert.ok(packageJson.scripts?.["test:graph:conflicts:frontend"]);
  assert.equal(packageJson.scripts?.["test:graph:conflicts:backend"], "cd backend && go test ./internal/modules/graph/dto ./internal/modules/graph/handler ./internal/modules/graph/service");
  assert.equal(
    packageJson.scripts?.["test:graph:conflicts:e2e"],
    "npm run build:user && npm run build:admin && playwright test e2e/v1-graph-workspace.spec.ts"
  );
  assert.match(readme, /npm run verify:graph-conflicts/);
  assert.match(developmentDoc, /npm run verify:graph-conflicts/);
  assert.match(roadmap, /npm run verify:graph-conflicts/);
  assert.match(backlog, /npm run verify:graph-conflicts/);
  assert.match(regressionDoc, /npm run verify:graph-conflicts/);
  assert.match(regressionDoc, /GraphWorkspaceConflictResolutionDependencies\.test\.tsx/);
  assert.match(regressionDoc, /graphConflictSummary\.test\.ts/);
  assert.match(regressionDoc, /v1-graph-workspace\.spec\.ts/);
  assert.match(graphWorkspaceE2E, /version conflict/i);
  assert.match(graphWorkspaceE2E, /setViewportSize/);
  assert.match(graphWorkspaceE2E, /layouts\/preview/);
  assert.match(graphWorkspaceE2E, /forbidden/);
  assert.match(graphWorkspaceE2E, /宸插鍑?PNG 鍥捐氨/);
  assert.match(graphWorkspaceE2E, /宸插鍑?SVG 鍥捐氨/);
  assert.match(graphWorkspaceE2E, /宸插鍑?StudyMate 鍥捐氨 JSON/);
  assert.match(graphWorkspaceE2E, /鍥捐氨鍐茬獊杈呭姪/);
  assert.match(graphWorkspaceE2E, /鏀惧純鏈湴骞堕噸杞芥渶鏂板浘璋?/);
  assert.match(regressionDoc, /鐗堟湰鍐茬獊澶勭悊/);
  assert.match(regressionDoc, /妗岄潰/);
  assert.match(regressionDoc, /绐勫睆/);
  assert.match(regressionDoc, /甯冨眬棰勮/);
  assert.match(regressionDoc, /瀵煎嚭鐘舵€?/);
  assert.match(regressionDoc, /鏉冮檺璺緞/);
});
