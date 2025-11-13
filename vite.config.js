import { defineConfig } from "vitest/config";

export default defineConfig(({ command }) => ({
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
  base: command === "build" ? "/front_7th_chapter2-1/" : "/", // 빌드할 때만 base 경로 적용
  build: {
    outDir: "dist",
  },
}));
