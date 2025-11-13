import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/front_7th_chapter2-1/",
  build: {
    outDir: "dist",
  },
  plugins: [tsconfigPaths()],
});
