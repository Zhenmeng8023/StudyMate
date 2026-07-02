import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.join(root, "backend");

function collectGoFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectGoFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && absolutePath.endsWith(".go")) {
      files.push(absolutePath);
    }
  }

  return files;
}

const goFiles = collectGoFiles(backendDir);
if (goFiles.length === 0) {
  console.log("No Go files found under backend/.");
  process.exit(0);
}

const result = spawnSync("gofmt", ["-l", ...goFiles], {
  cwd: root,
  encoding: "utf8",
});

if (result.error) {
  console.error("Failed to run gofmt:", result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.stderr.write(result.stderr || "gofmt failed.\n");
  process.exit(result.status ?? 1);
}

const unformatted = result.stdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((absolutePath) => path.relative(root, absolutePath));

if (unformatted.length > 0) {
  console.error("Go formatting check failed. Run `gofmt -w` on:");
  for (const file of unformatted) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log(`Go formatting check passed for ${goFiles.length} files.`);
