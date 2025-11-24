import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/types.ts', 'src/adapter.ts', 'src/index.ts'],
      thresholds: {
        lines: 80,
        functions: 90,
        branches: 85,
        statements: 80
      }
    }
  }
});
