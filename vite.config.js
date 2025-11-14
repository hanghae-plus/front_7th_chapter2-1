import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/front_7th_chapter2-1/" : "/",
}));
