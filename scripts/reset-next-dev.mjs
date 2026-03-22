import { spawn } from "child_process";
import { existsSync, rmSync } from "fs";
import path from "path";
import process from "process";

const cwd = process.cwd();
const distDirs = [".next", ".next-dev"];

function removeDistDirs() {
  for (const dir of distDirs) {
    const fullPath = path.join(cwd, dir);
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

function listProcesses() {
  return new Promise((resolve, reject) => {
    const child = spawn("ps", ["-axo", "pid=,command="], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `ps exited with code ${code}`));
        return;
      }

      resolve(stdout);
    });
  });
}

async function findNextDevPids() {
  const output = await listProcesses();
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const firstSpace = line.indexOf(" ");
      return {
        pid: Number(line.slice(0, firstSpace)),
        command: line.slice(firstSpace + 1),
      };
    })
    .filter(({ pid, command }) => {
      if (!pid || pid === process.pid) {
        return false;
      }

      return (
        command.includes(cwd) &&
        (command.includes("next dev") || command.includes("next/dist/bin/next dev"))
      );
    })
    .map(({ pid }) => pid);
}

async function terminateProcesses(pids) {
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Ignore processes that already exited.
    }
  }

  if (pids.length === 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  for (const pid of pids) {
    try {
      process.kill(pid, 0);
      process.kill(pid, "SIGKILL");
    } catch {
      // Process already exited.
    }
  }
}

async function main() {
  const pids = await findNextDevPids();
  if (pids.length > 0) {
    console.log(`Stopping existing Next dev process${pids.length > 1 ? "es" : ""}: ${pids.join(", ")}`);
    await terminateProcesses(pids);
  }

  removeDistDirs();

  const child = spawn("npm", ["run", "dev"], {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("Failed to reset Next dev environment:", error);
  process.exit(1);
});
