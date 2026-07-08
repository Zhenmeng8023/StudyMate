import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = "npm";
const goCommand = "go";

export const coverageBaselines = {
  frontendUser: {
    statements: 68,
    branches: 63,
    functions: 67,
    lines: 68,
  },
  frontendAdmin: {
    statements: 70,
    branches: 67,
    functions: 64,
    lines: 75,
  },
  graphCore: {
    lines: 96,
    branches: 79,
    functions: 100,
  },
  backend: {
    statements: 25,
  },
};

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function readJson(absolutePath) {
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function quoteWindowsArgument(argument) {
  if (!/[\s"]/u.test(argument)) {
    return argument;
  }

  return `"${argument.replace(/"/g, '\\"')}"`;
}

function removePathIfExists(absolutePath) {
  if (!fs.existsSync(absolutePath)) {
    return;
  }

  fs.rmSync(absolutePath, { recursive: true, force: true });
}

function runCommand(command, args, options = {}) {
  const spawnOptions = {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  };

  const result = process.platform === "win32"
    ? spawnSync(
      process.env.ComSpec ?? "cmd.exe",
      [
        "/d",
        "/s",
        "/c",
        [command, ...args].map(quoteWindowsArgument).join(" "),
      ],
      spawnOptions,
    )
    : spawnSync(command, args, spawnOptions);

  const output = [result.stdout, result.stderr]
    .filter(Boolean)
    .join("\n")
    .trim();

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = output ? `\n${output}` : "";
    throw new Error(`Command failed: ${command} ${args.join(" ")}${details}`);
  }

  return output;
}

export function parseVitestCoverageSummary(summary) {
  const total = summary?.total ?? summary;
  const statements = total?.statements?.pct;
  const branches = total?.branches?.pct;
  const functions = total?.functions?.pct;
  const lines = total?.lines?.pct;

  if (![statements, branches, functions, lines].every((value) => Number.isFinite(value))) {
    throw new Error("Unable to parse Vitest coverage summary.");
  }

  return {
    statements,
    branches,
    functions,
    lines,
  };
}

export function parseNodeCoverageReport(reportText) {
  const match = reportText.match(/all files\s+\|\s+([0-9.]+)\s+\|\s+([0-9.]+)\s+\|\s+([0-9.]+)/i);

  if (!match) {
    throw new Error("Unable to parse graph-core coverage report.");
  }

  return {
    lines: Number.parseFloat(match[1]),
    branches: Number.parseFloat(match[2]),
    functions: Number.parseFloat(match[3]),
  };
}

export function parseGoCoverageTotal(reportText) {
  const match = reportText.match(/total:\s+\(statements\)\s+([0-9.]+)%/i);

  if (!match) {
    throw new Error("Unable to parse Go total coverage report.");
  }

  return {
    statements: Number.parseFloat(match[1]),
  };
}

export function evaluateCoverageThresholds(scope, metrics, thresholds) {
  return Object.entries(thresholds).flatMap(([metricName, threshold]) => {
    const actual = metrics[metricName];

    if (!Number.isFinite(actual)) {
      return [`${scope} ${metricName} metric is missing.`];
    }

    if (actual + Number.EPSILON >= threshold) {
      return [];
    }

    return [
      `${scope} ${metricName} ${formatPercent(actual)} is below the baseline ${formatPercent(threshold)}.`,
    ];
  });
}

function collectFrontendCoverage(workspaceName, relativeDirectory) {
  const coverageDirectory = path.join(root, relativeDirectory, "coverage-gate");
  removePathIfExists(coverageDirectory);

  try {
    runCommand(npmCommand, [
      "--workspace",
      workspaceName,
      "run",
      "test:coverage",
      "--",
      "--coverage.reporter=json-summary",
      "--coverage.reporter=text-summary",
      "--coverage.reportsDirectory=coverage-gate",
    ]);

    const summaryPath = path.join(coverageDirectory, "coverage-summary.json");
    return parseVitestCoverageSummary(readJson(summaryPath));
  } finally {
    removePathIfExists(coverageDirectory);
  }
}

function collectGraphCoreCoverage() {
  const output = runCommand(npmCommand, [
    "--workspace",
    "@studymate/graph-core",
    "run",
    "test:coverage",
  ]);

  return parseNodeCoverageReport(output);
}

function collectBackendCoverage() {
  const backendDirectory = path.join(root, "backend");
  const profilePath = path.join(backendDirectory, "coverage-gate.out");
  removePathIfExists(profilePath);

  try {
    runCommand(goCommand, ["test", "./...", "-coverprofile=coverage-gate.out"], {
      cwd: backendDirectory,
    });
    const output = runCommand(goCommand, ["tool", "cover", "-func=coverage-gate.out"], {
      cwd: backendDirectory,
    });

    return parseGoCoverageTotal(output);
  } finally {
    removePathIfExists(profilePath);
  }
}

function buildCoverageSummaryLines(results) {
  return [
    `frontend-user: statements ${formatPercent(results.frontendUser.statements)}, branches ${formatPercent(results.frontendUser.branches)}, functions ${formatPercent(results.frontendUser.functions)}, lines ${formatPercent(results.frontendUser.lines)}`,
    `frontend-admin: statements ${formatPercent(results.frontendAdmin.statements)}, branches ${formatPercent(results.frontendAdmin.branches)}, functions ${formatPercent(results.frontendAdmin.functions)}, lines ${formatPercent(results.frontendAdmin.lines)}`,
    `graph-core: lines ${formatPercent(results.graphCore.lines)}, branches ${formatPercent(results.graphCore.branches)}, functions ${formatPercent(results.graphCore.functions)}`,
    `backend: statements ${formatPercent(results.backend.statements)}`,
  ];
}

export function collectCoverageResults() {
  return {
    frontendUser: collectFrontendCoverage("frontend-user", "frontend-user"),
    frontendAdmin: collectFrontendCoverage("frontend-admin", "frontend-admin"),
    graphCore: collectGraphCoreCoverage(),
    backend: collectBackendCoverage(),
  };
}

export function verifyCoverageBaselines() {
  const results = collectCoverageResults();
  const failures = [
    ...evaluateCoverageThresholds("frontend-user", results.frontendUser, coverageBaselines.frontendUser),
    ...evaluateCoverageThresholds("frontend-admin", results.frontendAdmin, coverageBaselines.frontendAdmin),
    ...evaluateCoverageThresholds("graph-core", results.graphCore, coverageBaselines.graphCore),
    ...evaluateCoverageThresholds("backend", results.backend, coverageBaselines.backend),
  ];

  return {
    results,
    failures,
    summaryLines: buildCoverageSummaryLines(results),
  };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const { failures, summaryLines } = verifyCoverageBaselines();

  if (failures.length > 0) {
    console.error("Coverage baseline failed:");
    for (const line of summaryLines) {
      console.error(`- ${line}`);
    }
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Coverage baseline passed.");
  for (const line of summaryLines) {
    console.log(`- ${line}`);
  }
}
