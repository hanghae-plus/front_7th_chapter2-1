import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const base_path = mode === "production" ? "/front_7th_chapter2-1/" : "/"; // 로컬 개발 시에는 '/'

  return {
    base: base_path,
    build: {
      outDir: "dist",
    },
  };
});
