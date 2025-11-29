
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/features/jest/setup.js'],
    include: ['src/dialects/**/*.spec.js'],
  },
});
