import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Nothing loads .env.test on its own: the Prisma CLI reads the environment here
// (test commands pass NODE_ENV=test), the seed script gets it from --env-file,
// and Playwright hands it to the app server it boots.
config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
