import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/front-7th-chapter2-1/",
  server: {
    port: 5174,
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
  build: {
    outDir: "dist",
    base: "/front-7th-chapter2-1/",
  },
  preview: {
    port: 4173,
    base: "/front-7th-chapter2-1/",
    strictPort: false,
    open: "/front-7th-chapter2-1/",
  },
});
