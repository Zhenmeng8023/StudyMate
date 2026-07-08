import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectSecretScanFindings, secretScanAllowComment } from "./verify-secret-scan.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("secret scan baseline is wired into scripts, CI, and release docs", () => {
  const packageJson = readJson("package.json");
  const ciWorkflow = readText(".github/workflows/ci.yml");
  const developmentDoc = readText("docs/DEVELOPMENT.md");
  const readme = readText("README.md");
  const releaseChecklist = readText("docs/planning/versions/v1.0.0-release.md");

  assert.equal(packageJson.scripts?.["verify:secrets"], "node scripts/verify-secret-scan.mjs");
  assert.match(packageJson.scripts?.ci ?? "", /npm run verify:secrets/);
  assert.match(ciWorkflow, /Verify secret scan[\s\S]*npm run verify:secrets/);
  assert.match(developmentDoc, /npm run verify:secrets/);
  assert.match(readme, /npm run verify:secrets/);
  assert.match(releaseChecklist, /npm run verify:secrets/);
});

test("secret scan flags committed secrets and private keys", () => {
  const findings = collectSecretScanFindings([
    {
      path: "frontend-user/src/lib/leak.ts",
      content: [
        "export const openAiApiKey = 'sk-proj-abcdefghijklmnopqrstuvwxyz123456';",
        "const sessionToken = \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature\";",
        "-----BEGIN PRIVATE KEY-----",
      ].join("\n"),
    },
  ]);

  assert.equal(findings.length, 3);
  assert.deepEqual(
    findings.map((finding) => finding.kind),
    ["credential-pattern", "generic-assignment", "private-key"],
  );
});

test("secret scan ignores documented placeholders and explicit allow markers", () => {
  const findings = collectSecretScanFindings([
    {
      path: ".env.example",
      content: [
        "MYSQL_DSN=studymate:change-me@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local",
        "JWT_SECRET=change-me-in-local-env",
        "ADMIN_BOOTSTRAP_PASSWORD=",
      ].join("\n"),
    },
    {
      path: "docs/DEVELOPMENT.md",
      content: [
        "$env:MYSQL_DSN='studymate:<local-password>@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local'",
        "$env:JWT_SECRET='<long-random-local-secret>'",
      ].join("\n"),
    },
    {
      path: "scripts/example.test.mjs",
      content: `const fakePassword = "demo-value-123"; // ${secretScanAllowComment}`,
    },
  ]);

  assert.equal(findings.length, 0);
});
