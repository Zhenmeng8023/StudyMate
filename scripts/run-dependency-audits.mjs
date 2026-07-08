import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function buildDependencyAuditCommands(baseDir = root) {
  return [
    {
      label: "npm audit",
      command: "npm",
      args: ["audit", "--registry=https://registry.npmjs.org/", "--audit-level=high"],
      cwd: baseDir,
    },
    {
      label: "govulncheck",
      command: "go",
      args: ["run", "golang.org/x/vuln/cmd/govulncheck@latest", "./..."],
      cwd: path.join(baseDir, "backend"),
    },
  ];
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const commands = buildDependencyAuditCommands();
  const failures = [];

  for (const command of commands) {
    console.log(`\n> ${command.label}`);
    const result = process.platform === "win32"
      ? spawnSync(`${command.command} ${command.args.join(" ")}`, {
          cwd: command.cwd,
          encoding: "utf8",
          shell: true,
        })
      : spawnSync(command.command, command.args, {
          cwd: command.cwd,
          encoding: "utf8",
        });

    if (result.stdout) {
      process.stdout.write(result.stdout);
      if (!result.stdout.endsWith("\n")) {
        process.stdout.write("\n");
      }
    }

    if (result.stderr) {
      process.stderr.write(result.stderr);
      if (!result.stderr.endsWith("\n")) {
        process.stderr.write("\n");
      }
    }

    if (result.error) {
      failures.push(`${command.label} failed to start: ${result.error.message}`);
      continue;
    }

    if (result.status !== 0) {
      failures.push(`${command.label} exited with status ${result.status ?? 1}.`);
    }
  }

  if (failures.length > 0) {
    console.error("\nDependency audit failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nDependency audit passed.");
}
