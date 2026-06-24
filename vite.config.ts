import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    alias: {},
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
