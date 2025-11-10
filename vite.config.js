import { defineConfig } from 'vitest/config';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/hh-week4/' : '/',
  alias: {
    '@': '/src',
  },
}));
