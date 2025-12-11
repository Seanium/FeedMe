import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ✅ 关键配置：使用相对路径，解决 basePath 问题
  base: './',

  // 构建配置
  build: {
    outDir: 'out',
    emptyOutDir: true,
  },

  // 路径别名（保持与 Next.js 一致）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 开发服务器
  server: {
    port: 3000,
    open: true,
  },
});
