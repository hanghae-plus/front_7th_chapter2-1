import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: mode === "development" ? "/" : env.VITE_BASE_PATH || "/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
    },
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
