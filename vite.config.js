import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/front_7th_chapter2-1/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@e2e": path.resolve(__dirname, "./e2e"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@common": path.resolve(__dirname, "./src/components/common"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@mocks": path.resolve(__dirname, "./src/mocks"),
    },
  },
}));
