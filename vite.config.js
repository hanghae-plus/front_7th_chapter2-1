import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/front_7th_chapter2-1/", // dev는 /, build는 /front_7th_chapter2-1/
  build: {
    outDir: "dist", // vite 기본 값이 `dist` 이므로 생략 가능
  },
}));
