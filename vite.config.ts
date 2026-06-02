import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {
  parseFeedmeConfig,
  type ClientFeedmeConfig,
} from './src/config/feedme-config-loader.ts';

const feedmeClientConfig = readFeedmeClientConfig();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    __FEEDME_CLIENT_CONFIG__: JSON.stringify(feedmeClientConfig),
  },

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

function readFeedmeClientConfig(): ClientFeedmeConfig {
  const configPath = path.resolve(__dirname, 'src/config/feedme.config.yaml');
  const feedmeConfig = parseFeedmeConfig(fs.readFileSync(configPath, 'utf8'));

  return {
    categories: feedmeConfig.categories,
    categoryOrder: feedmeConfig.categoryOrder,
    config: feedmeConfig.config,
    defaultSource: feedmeConfig.defaultSource,
  };
}
