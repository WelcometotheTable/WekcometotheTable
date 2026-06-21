import { defineConfig } from 'vitest/config';

// Standalone test config — intentionally does NOT load vite.config.ts (and its
// PWA plugin), keeping unit tests fast and isolated from the build pipeline.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
