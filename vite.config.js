import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/hh-week4/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
