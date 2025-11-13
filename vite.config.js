import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  return {
    base: mode === "production" ? "/front_7th_chapter2-1/" : "/",
    build: {
      outDir: "dist",
    },
  };
});
