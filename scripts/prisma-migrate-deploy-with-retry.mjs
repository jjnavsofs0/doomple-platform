import { spawnSync } from "node:child_process";

const maxAttempts = Number(process.env.PRISMA_MIGRATE_MAX_ATTEMPTS || 4);
const baseDelayMs = Number(process.env.PRISMA_MIGRATE_RETRY_DELAY_MS || 5000);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableLockError(output) {
  const normalized = output.toLowerCase();
  return (
    normalized.includes("p1002") ||
    normalized.includes("pg_advisory_lock") ||
    normalized.includes("timed out trying to acquire a postgres advisory lock")
  );
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  console.log(`Running Prisma migrate deploy (attempt ${attempt}/${maxAttempts})`);

  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    encoding: "utf8",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status === 0) {
    process.exit(0);
  }

  const combinedOutput = `${result.stdout || ""}\n${result.stderr || ""}`;
  const canRetry = attempt < maxAttempts && isRetryableLockError(combinedOutput);

  if (!canRetry) {
    process.exit(result.status || 1);
  }

  const delayMs = baseDelayMs * attempt;
  console.warn(
    `Prisma migrate deploy hit an advisory lock timeout. Retrying in ${Math.round(delayMs / 1000)}s...`
  );
  await sleep(delayMs);
}

process.exit(1);
