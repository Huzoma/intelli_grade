import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Runs once before the browser tests. The dedicated test database is brought to
// the current schema and reseeded here, so an end to end run never reads or
// writes the development database at prisma/dev.db. The seed clears every table
// before it writes, which is what makes the run repeatable.
//
// NODE_ENV=test makes prisma.config.ts select .env.test, and --env-file does the
// same for the seed, which the Prisma CLI would otherwise not do for it.
export default function globalSetup() {
  const options = {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "test" },
  };

  execSync("npx prisma db push", options);
  execSync("node --env-file=.env.test prisma/seed.js", options);
}
