import { defineConfig } from "vite";

export default defineConfig({
  base: "/hanghae-plus_front_7th_chapter2-1/", // Repository 이름과 일치
  //   base: process.env.NODE_ENV === "production" ? "/hanghae-plus_front_7th_chapter2-1/" : "/", // Repository 이름과 일치
  build: {
    outDir: "dist", // vite 기본 값이 `dist` 이므로 생략 가능
  },
});
