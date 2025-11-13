import { defineConfig } from "vite";

// GitHub Pages에 배포할 때 정적 자산 경로가 절대경로(/)로 나가지 않도록
// 저장소 이름을 base로 명시합니다.
export default defineConfig({
  base: "/front_7th_chapter2-1/",
});
