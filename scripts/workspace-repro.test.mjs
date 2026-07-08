import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  collectRuntimeBaselineIssues,
  readRuntimeBaselineState,
  requiredNodeRange,
  requiredNpmRange,
} from "./verify-runtime-baseline.mjs";
import { buildDependencyAuditCommands } from "./run-dependency-audits.mjs";

test("runtime baseline flags missing bootstrap, audit, and explicit graph-core TypeScript runner", () => {
  const issues = collectRuntimeBaselineIssues({
    rootPackageJson: {
      packageManager: "npm@10.9.0",
      engines: { node: ">=22 <23", npm: ">=10 <11" },
      scripts: {
        ci: "npm run lint",
      },
    },
    graphCorePackageJson: {
      scripts: {
        test: "node --test test/*.test.ts",
        "test:coverage": "node --experimental-test-coverage --test test/*.test.ts",
      },
    },
    backendGoMod: "module studymate/backend\n\ngo 1.25\n",
    developmentDoc: "# 开发说明\n",
    versions: {
      node: "v22.3.0",
      npm: "10.9.0",
      go: "go version go1.25.4 windows/amd64",
    },
  });

  assert.deepEqual(
    issues.map((issue) => issue.id),
    [
      "root-package-manager",
      "root-node-engines",
      "root-npm-engines",
      "root-bootstrap-script",
      "root-verify-runtimes-script",
      "root-verify-deps-script",
      "root-ci-runtime-check",
      "graph-core-explicit-ts-test",
      "graph-core-explicit-ts-coverage",
      "backend-go-version",
      "installed-node-version",
      "installed-npm-version",
      "installed-go-version",
      "development-doc-bootstrap",
      "development-doc-verify-runtimes",
      "development-doc-verify-deps",
    ],
  );
});

test("dependency audit commands use the public npm audit endpoint and govulncheck", () => {
  const root = "E:/Code/1108026_rust_go/StudyMate";

  assert.deepEqual(buildDependencyAuditCommands("E:/Code/1108026_rust_go/StudyMate"), [
    {
      command: "npm",
      args: ["audit", "--registry=https://registry.npmjs.org/", "--audit-level=high"],
      cwd: root,
      label: "npm audit",
    },
    {
      command: "go",
      args: ["run", "golang.org/x/vuln/cmd/govulncheck@latest", "./..."],
      cwd: path.join(root, "backend"),
      label: "govulncheck",
    },
  ]);
});

test("repository manifests satisfy the DEV-010 runtime baseline", () => {
  const state = readRuntimeBaselineState();
  const issues = collectRuntimeBaselineIssues(state);

  assert.deepEqual(issues, [], `expected no runtime baseline issues, got:\n${issues.map((issue) => `- ${issue.id}: ${issue.message}`).join("\n")}`);
  assert.equal(state.rootPackageJson.engines?.node, requiredNodeRange);
  assert.equal(state.rootPackageJson.engines?.npm, requiredNpmRange);
});
