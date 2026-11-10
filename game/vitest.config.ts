import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/engine/**/*.test.ts', 'tests/persistence/**/*.test.ts', 'tests/contracts/**/*.test.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
