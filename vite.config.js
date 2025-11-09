import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    base: "/front_7th_chapter2-1",
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    exclude: ["**/e2e/**", "**/*.e2e.spec.js", "**/node_modules/**"],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
