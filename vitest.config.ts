import "dotenv/config";

import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.ts", import.meta.url)
      ),
    },
  },
  test: {
    fileParallelism: false,
    testTimeout: 15000,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      include: [
        "src/app/api/auth/login/route.ts",
        "src/app/api/auth/logout/route.ts",
        "src/app/api/auth/register/route.ts",
        "src/lib/validations.ts",
        "src/server/auth.ts",
        "src/server/password.ts",
        "src/server/queue.ts",
        "src/server/wait-time.ts",
        "src/server/services.ts",
        "src/server/reports.ts",
      ],
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});