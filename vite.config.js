import { defineConfig } from "vitest/config";

export default defineConfig({
  // 배포할때는  이 주석을 풀어줘야 한다.
  // base: "/front_7th_chapter2-1/",
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
});
