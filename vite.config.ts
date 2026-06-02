import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { parseFeedmeConfig } from './src/config/feedme-config-loader.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [feedmeConfigYaml(), react()],

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

function feedmeConfigYaml() {
  return {
    name: 'feedme-config-yaml',
    enforce: 'pre' as const,
    load(id: string) {
      if (!id.replaceAll('\\', '/').endsWith('src/config/feedme.config.yaml')) {
        return null;
      }

      const configText = fs.readFileSync(id, 'utf8');
      const feedmeConfig = parseFeedmeConfig(configText);
      const clientConfig = {
        categories: feedmeConfig.categories,
        categoryOrder: feedmeConfig.categoryOrder,
        config: feedmeConfig.config,
        defaultSource: feedmeConfig.defaultSource,
      };

      return `export default ${JSON.stringify(clientConfig)};`;
    },
  };
}
