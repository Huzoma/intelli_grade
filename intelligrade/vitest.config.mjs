import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    // jsconfig.json paths are not read by Vite, so the "@/*" alias is mapped here.
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  test: {
    // globals stays off so lint does not fail on undefined test names.
    globals: false,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.js"],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["src/**/*.test.jsx"],
          setupFiles: ["./vitest.setup.js"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}"],
    },
  },
});
