import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    exclude: ["**/e2e/**", "**/*.e2e.spec.js", "**/node_modules/**"],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  preview: {
    port: 4173,
  },
});
