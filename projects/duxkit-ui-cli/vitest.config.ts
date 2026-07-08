import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: 'projects/duxkit-ui-cli',
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
