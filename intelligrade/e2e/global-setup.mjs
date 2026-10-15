import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs once before the browser tests. The dedicated test database is brought to
// the current schema and reseeded here, so an end to end run never reads or
// writes the development database. The seed clears every table before it
// writes, which is what makes the run repeatable, and is also why this must
// only ever point at the throwaway container in docker-compose.test.yml.
//
// NODE_ENV=test makes prisma.config.ts select .env.test, and --env-file does the
// same for the seed, which the Prisma CLI would otherwise not do for it.
export default async function globalSetup() {
  const options = {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "test" },
  };

  // A container that has only just started still refuses connections for a
  // second or two. `up --wait` and the continuous integration service health
  // check both cover that, so these retries only turn a cold start into a short
  // pause rather than a confusing P1001.
  //
  // --accept-data-loss keeps the push from stopping to ask: the database is
  // disposable, and the seed wipes it on the next line anyway.
  //
  // --skip-generate matters on Windows: a push regenerates the client by
  // default, which tries to rename query_engine-windows.dll.node while it is
  // still loaded and prints an EPERM. Installing @prisma/client already
  // generates it, and the continuous integration job generates it explicitly.
  const attempts = 5;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      execSync("npx prisma db push --accept-data-loss --skip-generate", options);
      break;
    } catch (error) {
      if (attempt === attempts) {
        throw new Error(
          "Could not reach the test database after several attempts. Start it with:\n" +
            "  docker compose -f docker-compose.test.yml up -d --wait",
          { cause: error },
        );
      }

      console.log(`Test database is not ready yet, retrying (${attempt}/${attempts - 1})...`);
      await sleep(2000);
    }
  }

  execSync("node --env-file=.env.test prisma/seed.js", options);
}
