import { defineConfig } from "vitest/config";
import { copyFileSync, existsSync } from "fs";
import { resolve, join } from "path";

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
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    {
      name: "copy-404",
      closeBundle() {
        const distPath = resolve(process.cwd(), "dist");
        const indexPath = join(distPath, "index.html");
        const notFoundPath = join(distPath, "404.html");

        if (existsSync(indexPath)) {
          copyFileSync(indexPath, notFoundPath);
        }
      },
    },
  ],
  preview: {
    port: 4173,
    base: "/front-7th-chapter2-1/",
    strictPort: false,
    open: "/front-7th-chapter2-1/",
  },
});
