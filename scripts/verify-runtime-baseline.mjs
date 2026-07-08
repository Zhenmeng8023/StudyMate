import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const requiredNodeRange = ">=24 <25";
export const requiredNpmRange = ">=11 <12";
const requiredNodeMajor = 24;
const requiredNpmMajor = 11;
const requiredGoMajor = 1;
const requiredGoMinor = 26;

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readCommandOutput(command, args) {
  const result = process.platform === "win32"
    ? spawnSync(`${command} ${args.join(" ")}`, {
        cwd: root,
        encoding: "utf8",
        shell: true,
      })
    : spawnSync(command, args, {
        cwd: root,
        encoding: "utf8",
      });

  if (result.error) {
    return null;
  }

  if (result.status !== 0) {
    return (result.stderr || result.stdout || "").trim() || null;
  }

  return result.stdout.trim();
}

function parseSemver(rawVersion) {
  if (typeof rawVersion !== "string") {
    return null;
  }

  const match = rawVersion.trim().match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function parseGoVersion(rawVersion) {
  if (typeof rawVersion !== "string") {
    return null;
  }

  const match = rawVersion.match(/go version go(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3] ?? 0),
  };
}

function parseGoModVersion(goModContent) {
  const match = goModContent.match(/^\s*go\s+(\d+)\.(\d+)\s*$/m);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
  };
}

function hasScript(packageJson, scriptName) {
  return typeof packageJson?.scripts?.[scriptName] === "string" && packageJson.scripts[scriptName].trim().length > 0;
}

function includesSnippet(content, snippet) {
  return typeof content === "string" && content.includes(snippet);
}

export function readRuntimeBaselineState() {
  return {
    rootPackageJson: readJson("package.json"),
    graphCorePackageJson: readJson("packages/graph-core/package.json"),
    backendGoMod: readText("backend/go.mod"),
    developmentDoc: readText("docs/DEVELOPMENT.md"),
    versions: {
      node: process.version,
      npm: readCommandOutput("npm", ["--version"]),
      go: readCommandOutput("go", ["version"]),
    },
  };
}

export function collectRuntimeBaselineIssues(state) {
  const issues = [];
  const rootPackageJson = state.rootPackageJson ?? {};
  const graphCorePackageJson = state.graphCorePackageJson ?? {};
  const rootScripts = rootPackageJson.scripts ?? {};
  const graphCoreScripts = graphCorePackageJson.scripts ?? {};
  const nodeVersion = parseSemver(state.versions?.node);
  const npmVersion = parseSemver(state.versions?.npm);
  const goVersion = parseGoVersion(state.versions?.go);
  const goModVersion = parseGoModVersion(state.backendGoMod ?? "");

  if (typeof rootPackageJson.packageManager !== "string" || !rootPackageJson.packageManager.startsWith(`npm@${requiredNpmMajor}.`)) {
    issues.push({
      id: "root-package-manager",
      message: `package.json must pin npm ${requiredNpmMajor}.x via packageManager.`,
    });
  }

  if (rootPackageJson.engines?.node !== requiredNodeRange) {
    issues.push({
      id: "root-node-engines",
      message: `package.json engines.node must be ${requiredNodeRange}.`,
    });
  }

  if (rootPackageJson.engines?.npm !== requiredNpmRange) {
    issues.push({
      id: "root-npm-engines",
      message: `package.json engines.npm must be ${requiredNpmRange}.`,
    });
  }

  if (!hasScript(rootPackageJson, "bootstrap")) {
    issues.push({
      id: "root-bootstrap-script",
      message: "package.json must expose npm run bootstrap.",
    });
  }

  if (!hasScript(rootPackageJson, "verify:runtimes")) {
    issues.push({
      id: "root-verify-runtimes-script",
      message: "package.json must expose npm run verify:runtimes.",
    });
  }

  if (!hasScript(rootPackageJson, "verify:deps")) {
    issues.push({
      id: "root-verify-deps-script",
      message: "package.json must expose npm run verify:deps.",
    });
  }

  if (!String(rootScripts.ci ?? "").includes("npm run verify:runtimes")) {
    issues.push({
      id: "root-ci-runtime-check",
      message: "package.json ci script must run verify:runtimes before the wider pipeline.",
    });
  }

  if (!String(graphCoreScripts.test ?? "").includes("--experimental-strip-types")) {
    issues.push({
      id: "graph-core-explicit-ts-test",
      message: "@studymate/graph-core test script must use an explicit TypeScript runner.",
    });
  }

  if (!String(graphCoreScripts["test:coverage"] ?? "").includes("--experimental-strip-types")) {
    issues.push({
      id: "graph-core-explicit-ts-coverage",
      message: "@studymate/graph-core coverage script must use an explicit TypeScript runner.",
    });
  }

  if (!goModVersion || goModVersion.major !== requiredGoMajor || goModVersion.minor !== requiredGoMinor) {
    issues.push({
      id: "backend-go-version",
      message: `backend/go.mod must declare Go ${requiredGoMajor}.${requiredGoMinor}.`,
    });
  }

  if (!nodeVersion || nodeVersion.major !== requiredNodeMajor) {
    issues.push({
      id: "installed-node-version",
      message: `Installed Node.js must be ${requiredNodeMajor}.x.`,
    });
  }

  if (!npmVersion || npmVersion.major !== requiredNpmMajor) {
    issues.push({
      id: "installed-npm-version",
      message: `Installed npm must be ${requiredNpmMajor}.x.`,
    });
  }

  if (!goVersion || goVersion.major !== requiredGoMajor || goVersion.minor !== requiredGoMinor) {
    issues.push({
      id: "installed-go-version",
      message: `Installed Go must be ${requiredGoMajor}.${requiredGoMinor}.x.`,
    });
  }

  if (!includesSnippet(state.developmentDoc, "npm run bootstrap")) {
    issues.push({
      id: "development-doc-bootstrap",
      message: "docs/DEVELOPMENT.md must document npm run bootstrap.",
    });
  }

  if (!includesSnippet(state.developmentDoc, "npm run verify:runtimes")) {
    issues.push({
      id: "development-doc-verify-runtimes",
      message: "docs/DEVELOPMENT.md must document npm run verify:runtimes.",
    });
  }

  if (!includesSnippet(state.developmentDoc, "npm run verify:deps")) {
    issues.push({
      id: "development-doc-verify-deps",
      message: "docs/DEVELOPMENT.md must document npm run verify:deps.",
    });
  }

  return issues;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const state = readRuntimeBaselineState();
  const issues = collectRuntimeBaselineIssues(state);

  if (issues.length > 0) {
    console.error("Runtime baseline verification failed:");
    for (const issue of issues) {
      console.error(`- [${issue.id}] ${issue.message}`);
    }
    process.exit(1);
  }

  console.log("Runtime baseline verification passed.");
}
