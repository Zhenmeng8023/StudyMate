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

function compareVersions(left, right) {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10));
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10));
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue > rightValue) {
      return 1;
    }

    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

function assertPackageVersionAtLeast(packageLock, packagePath, minimumVersion) {
  const actualVersion = packageLock.packages?.[packagePath]?.version;

  assert.ok(actualVersion, `expected ${packagePath} to exist in package-lock.json`);
  assert.ok(
    compareVersions(actualVersion, minimumVersion) >= 0,
    `expected ${packagePath} version ${actualVersion} to be >= ${minimumVersion}`,
  );
}

test("dependency security baseline requires safe npm lockfile versions and Go toolchain floors", () => {
  const packageLock = readJson("package-lock.json");
  const frontendUserPackageJson = readJson("frontend-user/package.json");
  const frontendAdminPackageJson = readJson("frontend-admin/package.json");
  const rootPackageJson = readJson("package.json");
  const backendGoMod = readText("backend/go.mod");
  const ciWorkflow = readText(".github/workflows/ci.yml");

  assert.equal(frontendUserPackageJson.dependencies?.vite, "^7.3.6");
  assert.equal(frontendAdminPackageJson.dependencies?.vite, "^7.3.6");
  assert.equal(rootPackageJson.devDependencies?.vitest, "^4.1.10");
  assert.equal(rootPackageJson.devDependencies?.["@vitest/coverage-v8"], "^4.1.10");
  assert.equal(rootPackageJson.devDependencies?.["@vue/test-utils"], "^2.4.11");
  assert.equal(rootPackageJson.overrides?.esbuild, "0.28.1");
  assert.equal(rootPackageJson.overrides?.undici, "7.28.0");
  assert.equal(rootPackageJson.overrides?.glob, "10.5.0");

  assertPackageVersionAtLeast(packageLock, "node_modules/vite", "7.3.6");
  assertPackageVersionAtLeast(packageLock, "node_modules/esbuild", "0.28.1");
  assertPackageVersionAtLeast(packageLock, "node_modules/undici", "7.28.0");
  assertPackageVersionAtLeast(packageLock, "node_modules/glob", "10.5.0");

  assert.match(backendGoMod, /^toolchain go1\.26\.5$/m);
  assert.match(backendGoMod, /^\s*golang\.org\/x\/net v0\.55\.0$/m);
  assert.match(backendGoMod, /^\s*github\.com\/quic-go\/quic-go v0\.59\.1 \/\/ indirect$/m);
  assert.match(ciWorkflow, /go-version: '1\.26\.5'/);
});
