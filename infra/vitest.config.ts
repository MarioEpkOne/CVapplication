import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: { environment: "node", globals: true, include: ["packages/**/tests/**/*.test.ts"] },
  resolve: {
    alias: { "@shared": fileURLToPath(new URL("./packages/shared/src", import.meta.url)) },
  },
});
