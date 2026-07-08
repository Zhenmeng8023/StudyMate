import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const checks = [
  {
    file: "backend/internal/config/config.go",
    banned: [
      "change-me-in-local-env",
      "root:123456@tcp(127.0.0.1:3306)/studymate", // secret-scan: allow
    ],
  },
  {
    file: ".env.example",
    banned: [
      "MYSQL_DSN=root:123456@tcp(127.0.0.1:3306)/studymate", // secret-scan: allow
      "ADMIN_BOOTSTRAP_PASSWORD=StudyMate123!",
      "ADMIN_BOOTSTRAP_USERNAME=admin",
      "ADMIN_BOOTSTRAP_EMAIL=admin@studymate.local",
    ],
  },
  {
    file: "docs/DEVELOPMENT.md",
    banned: [
      "$env:MYSQL_DSN='root:123456@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local'", // secret-scan: allow
      "$env:ADMIN_BOOTSTRAP_PASSWORD='StudyMate123!'", // secret-scan: allow
    ],
  },
];

const failures = [];

for (const check of checks) {
  const absolutePath = path.join(root, check.file);
  if (!existsSync(absolutePath)) {
    failures.push(`Missing file for config safety check: ${check.file}`);
    continue;
  }

  const content = readFileSync(absolutePath, "utf8");
  for (const bannedSnippet of check.banned) {
    if (content.includes(bannedSnippet)) {
      failures.push(`Found banned default in ${check.file}: ${bannedSnippet}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Config safety verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Config safety verification passed.");
