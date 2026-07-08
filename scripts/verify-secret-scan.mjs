import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const maxFileSizeBytes = 1024 * 1024;

const ignoredDirectoryNames = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".turbo",
]);

const ignoredFileNames = new Set([
  "package-lock.json",
  "go.sum",
  ".env",
]);

const ignoredExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".tar",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".mov",
  ".avi",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
]);

const placeholderValueMatchers = [
  /^change-me(?:-in-local-env)?$/i,
  /^replace-me(?:-in-local-env)?$/i,
  /^<[^>]+>$/i,
  /^your[-_a-z0-9]+$/i,
  /^example(?:[-_a-z0-9]+)?$/i,
  /^placeholder(?:[-_a-z0-9]+)?$/i,
  /^demo(?:[-_a-z0-9]+)?$/i,
  /^secret-manager-value$/i,
  /^long-random-local-secret$/i,
  /^local-password$/i,
  /^studymate:change-me$/i,
  /^user:pass$/i,
];

const secretKeyPattern = String.raw`[A-Za-z0-9._-]*?(?:api[_-]?key|secret|token|password|passwd|client[_-]?secret|access[_-]?token|refresh[_-]?token|jwt[_-]?secret)[A-Za-z0-9._-]*`;

const detectors = [
  {
    kind: "private-key",
    priority: 1,
    message: "Found a committed private key block.",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g,
    getSecretValue: (match) => match[0],
  },
  {
    kind: "credential-pattern",
    priority: 2,
    message: "Found a value matching a known credential format.",
    regex: /sk-(?:proj|live|test)-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|xox[baprs]-[A-Za-z0-9-]{10,}|SG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g,
    getSecretValue: (match) => match[0],
  },
  {
    kind: "dsn-credential",
    priority: 3,
    message: "Found an inline credential inside a DSN or connection string.",
    regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp|https?):\/\/(?<username>[^/\s:@]+):(?<value>[^/\s@]{6,})@|(?:^|[=\s"'`])(?<username2>[A-Za-z0-9._-]+):(?<value2>[^@\s"'`]{6,})@tcp\(/gi,
    getSecretValue: (match) => match.groups?.value ?? match.groups?.value2 ?? null,
  },
  {
    kind: "generic-assignment",
    priority: 4,
    message: "Found a hardcoded secret-like assignment.",
    regex: new RegExp("\\b(?<key>" + secretKeyPattern + ")\\b[^:=\\r\\n]{0,40}[:=]\\s*(?<quote>[\"'`])(?<value>[^\"'`\\r\\n]{8,})(?:\\k<quote>)", "gi"),
    getSecretValue: (match) => match.groups?.value ?? null,
  },
  {
    kind: "generic-assignment",
    priority: 5,
    message: "Found a hardcoded secret-like environment assignment.",
    regex: /^(?<key>[A-Z][A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD)[A-Z0-9_]*)\s*=\s*(?<value>[^\s#]{8,})$/g,
    getSecretValue: (match) => match.groups?.value ?? null,
  },
];

export const secretScanAllowComment = "secret-scan: allow";

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function isDocumentationOrTestPath(relativePath) {
  return relativePath.startsWith("docs/")
    || relativePath.startsWith("e2e/")
    || /(?:^|\/)[^/]+\.(?:test|spec)\.[^.]+$/i.test(relativePath)
    || relativePath.endsWith("_test.go");
}

function isProbablyTextFile(buffer) {
  if (buffer.includes(0)) {
    return false;
  }

  let suspiciousControlBytes = 0;

  for (const byte of buffer) {
    if (byte === 9 || byte === 10 || byte === 13) {
      continue;
    }

    if (byte < 32) {
      suspiciousControlBytes += 1;
    }
  }

  return suspiciousControlBytes <= Math.max(8, Math.floor(buffer.length * 0.05));
}

function shouldSkipFile(relativePath, stats) {
  const extension = path.extname(relativePath).toLowerCase();
  const normalizedPath = normalizeRelativePath(relativePath);

  if (ignoredFileNames.has(path.basename(relativePath))) {
    return true;
  }

  if (ignoredExtensions.has(extension)) {
    return true;
  }

  if (normalizedPath.startsWith("frontend-user/public/")) {
    return true;
  }

  if (stats.size > maxFileSizeBytes) {
    return true;
  }

  return false;
}

function listScannableFiles(currentDirectory, relativeDirectory = "") {
  const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = relativeDirectory
      ? path.join(relativeDirectory, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue;
      }

      files.push(...listScannableFiles(path.join(currentDirectory, entry.name), relativePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const absolutePath = path.join(currentDirectory, entry.name);
    const stats = fs.statSync(absolutePath);

    if (shouldSkipFile(relativePath, stats)) {
      continue;
    }

    const buffer = fs.readFileSync(absolutePath);
    if (!isProbablyTextFile(buffer)) {
      continue;
    }

    files.push({
      path: normalizeRelativePath(relativePath),
      content: buffer.toString("utf8"),
    });
  }

  return files;
}

function listGitTrackedFiles(scanRoot) {
  const result = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: scanRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((relativePath) => normalizeRelativePath(relativePath));
}

function isPlaceholderValue(rawValue) {
  const trimmedValue = rawValue
    .trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/^["'`]+|["'`]+$/g, "");
  return placeholderValueMatchers.some((matcher) => matcher.test(trimmedValue));
}

function overlapsExistingFinding(findings, candidate) {
  return findings.some((finding) =>
    finding.path === candidate.path
      && finding.line === candidate.line
      && !(candidate.end <= finding.start || candidate.start >= finding.end),
  );
}

function sanitizeFindingValue(value) {
  if (value.length <= 8) {
    return "***";
  }

  return `${value.slice(0, 4)}***${value.slice(-2)}`;
}

function sanitizeLinePreview(lineText, secretValue) {
  if (!secretValue) {
    return lineText.trim();
  }

  return lineText.replace(secretValue, sanitizeFindingValue(secretValue)).trim();
}

export function readSecretScanFiles(scanRoot = root) {
  const gitTrackedFiles = listGitTrackedFiles(scanRoot);
  if (!gitTrackedFiles) {
    return listScannableFiles(scanRoot);
  }

  const files = [];

  for (const relativePath of gitTrackedFiles) {
    const absolutePath = path.join(scanRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const stats = fs.statSync(absolutePath);
    if (!stats.isFile() || shouldSkipFile(relativePath, stats)) {
      continue;
    }

    const buffer = fs.readFileSync(absolutePath);
    if (!isProbablyTextFile(buffer)) {
      continue;
    }

    files.push({
      path: normalizeRelativePath(relativePath),
      content: buffer.toString("utf8"),
    });
  }

  return files;
}

function shouldIgnoreFinding({ path: relativePath, lineText, kind, key, secretValue }) {
  if (isPlaceholderValue(secretValue)) {
    return true;
  }

  if (kind === "credential-pattern" || kind === "private-key") {
    return isDocumentationOrTestPath(relativePath);
  }

  if (isDocumentationOrTestPath(relativePath)) {
    return true;
  }

  if (kind === "generic-assignment" && relativePath.endsWith("package.json")) {
    return true;
  }

  if (kind === "generic-assignment" && /`[^`]*(?:json|gorm|binding):"/.test(lineText)) {
    return true;
  }

  if (kind === "generic-assignment" && secretValue.includes("${")) {
    return true;
  }

  if (kind === "generic-assignment" && typeof key === "string") {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.endsWith("expiresat") || normalizedKey.endsWith("tokens")) {
      return true;
    }
  }

  return false;
}

export function collectSecretScanFindings(files) {
  const findings = [];

  for (const file of files) {
    const normalizedPath = normalizeRelativePath(file.path);
    const lines = file.content.split(/\r?\n/);

    lines.forEach((lineText, lineIndex) => {
      if (!lineText || lineText.includes(secretScanAllowComment)) {
        return;
      }

      for (const detector of detectors) {
        detector.regex.lastIndex = 0;

        for (const match of lineText.matchAll(detector.regex)) {
          const secretValue = detector.getSecretValue(match);
          const key = match.groups?.key ?? null;

          if (!secretValue || shouldIgnoreFinding({
            path: normalizedPath,
            lineText,
            kind: detector.kind,
            key,
            secretValue,
          })) {
            continue;
          }

          const candidate = {
            path: normalizedPath,
            line: lineIndex + 1,
            column: (match.index ?? 0) + 1,
            start: match.index ?? 0,
            end: (match.index ?? 0) + match[0].length,
            kind: detector.kind,
            message: detector.message,
            preview: sanitizeLinePreview(lineText, secretValue),
          };

          if (overlapsExistingFinding(findings, candidate)) {
            continue;
          }

          findings.push(candidate);
        }
      }
    });
  }

  findings.sort((left, right) =>
    left.path.localeCompare(right.path)
    || left.line - right.line
    || left.column - right.column,
  );

  return findings;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const findings = collectSecretScanFindings(readSecretScanFiles());

  if (findings.length > 0) {
    console.error("Secret scan failed:");
    for (const finding of findings) {
      console.error(`- ${finding.path}:${finding.line}:${finding.column} [${finding.kind}] ${finding.preview}`);
    }
    process.exit(1);
  }

  console.log("Secret scan passed.");
}
