import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/front_7th_chapter2-1/" : "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));
