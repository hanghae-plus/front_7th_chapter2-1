import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  // 프로덕션 모드(GitHub Pages 배포)일 때만 base path 추가
  // 로컬 개발 모드에서는 base path 없음
  const base = mode === "production" ? "/front_7th_chapter2-1/" : "/";

  return {
    base,
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
  };
});
