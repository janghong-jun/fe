import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@/...' → 'src/...'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // @use 'abstracts/variables' 처럼 짧은 경로 사용 가능
        loadPaths: [fileURLToPath(new URL('./src/assets/scss', import.meta.url))],
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // /api/posts → https://jsonplaceholder.typicode.com/posts
      '/api': {
        target: 'https://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
