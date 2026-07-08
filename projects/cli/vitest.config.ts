import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: 'projects/cli',
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
