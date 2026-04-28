[中文文档](./README.md) | [English Documentation](./README.en.md)

# <p align="center">😋FeedMe</p>

<div align="center">

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&labelColor=black&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Framework-React-61DAFB?style=flat-square&labelColor=black&logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind-06B6D4?style=flat-square&labelColor=black&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn-000000?style=flat-square&labelColor=black&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat-square&labelColor=black&logo=vite&logoColor=white)](https://vitejs.dev/)

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Seanium/feedme/update-deploy.yml?branch=main&style=flat-square&labelColor=black&logo=github&logoColor=white)](https://github.com/Seanium/feedme/actions)
[![RSS Update](https://img.shields.io/badge/RSS%20Update-Every%203h-orange?style=flat-square&labelColor=black&logo=rss&logoColor=white)](https://github.com/Seanium/feedme/blob/main/.github/workflows/update-deploy.yml)
[![Live Demo](https://img.shields.io/badge/Demo-Online-2ea44f?style=flat-square&logo=safari&logoColor=white)](https://seanium.github.io/FeedMe/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Seanium/FeedMe)

</div>

<p align="center">
  <b>用 AI 重新定义你的 RSS 阅读体验，轻松部署到 GitHub Pages / Docker</b>
</p>

---

## 🍱 轻量、智能、为你定制

- 🪶 **告别臃肿**：拒绝强制登录与 App 下载，一个响应式静态页面解决信息流阅读需求

- 🤖 **效率至上**：AI 自动生成文章摘要，把握重点

- ⚙️ **为你定制**：无论是订阅源还是 AI 配置，一切设置权归你所有

- 🚀 **自由部署**：零成本部署至 GitHub Pages 或 Docker

## ✨ 功能

- **聚合摘要**：一站式整合多源 RSS，通过 LLM 自动生成摘要

- **自动更新**：GitHub Actions / Cron 定时保持内容鲜活

- **灵活部署**：GitHub Pages 零成本静态托管 / Docker 私有化部署

- **现代体验**：响应式设计，明暗主题

---

<div align="center">

**本项目由[阿里云 ESA](https://www.aliyun.com/product/esa?spm=a2c22.12281978.0.0.6fb27f3bHEvaBX)提供加速、计算和保护**

<a href="https://www.aliyun.com/product/esa?spm=a2c22.12281978.0.0.6fb27f3bHEvaBX">
  <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="阿里云 ESA" width="600">
</a>

</div>

---

## 🚀 部署

### 方式一：GitHub Pages 部署

本项目使用 GitHub Actions 自动部署到 GitHub Pages，使用工作流处理数据更新和网站部署。

1. **Fork 或克隆仓库**到你的 GitHub 账号

2. **设置 GitHub Secrets**
   
   在项目顶端 Settings - 左侧 Secrets and variables -> Actions 中添加以下密钥（**Secrets**）：
   - `LLM_API_KEY`: 用于 AI 摘要生成的 API 密钥
   - `LLM_API_BASE`: LLM 服务的 API 基础 URL
   - `LLM_NAME`: 使用的模型名称

3. **启用 GitHub Pages**
   
   在仓库设置中，选择从 GitHub Actions 部署

4. **手动触发工作流**（可选）
   
   在 GitHub 仓库的 Actions 页面手动触发"更新数据并部署"工作流

#### 工作流说明

**更新数据并部署** (`update-deploy.yml`)：
- 触发条件：
  - 定时执行（每 3 小时一次）
  - 推送代码
  - 手动触发
- 执行内容：
  - **单次构建流程**：一次性获取 RSS 内容、生成摘要并构建静态网站
  - **多平台部署**：
    - 自动部署到 GitHub Pages
    - 将构建产物推送到 `deploy` 分支，供 Vercel 等平台监控部署

#### 自定义部署配置

- **自定义 RSS 源**：
  编辑 `src/config/rss-config.js` 文件以修改或添加 RSS 源。每个源需要包含：
  - 名称
  - URL
  - 分类

- **修改更新频率**: 编辑 `.github/workflows/update-deploy.yml` 中的 cron 表达式
  ```yml
  # 例如，改为每天凌晨更新一次
  cron: '0 0 * * *'
  ```

- **调整保留条目数**: 修改 `src/config/rss-config.js` 中的 `maxItemsPerFeed` 值

- **自定义摘要生成**：
  如果需要自定义摘要生成方法，比如遵循特定格式或切换摘要语言，请修改 `scripts/update-feeds.js` 中的 `prompt` 变量

### 方式二：Vercel 部署

1. 前往 [Vercel 导入页面](https://vercel.com/import/git)，选择 "GitHub" 并授权访问
2. 选择你 fork 的 FeedMe 仓库，点击 "Deploy"，这时部署失败是正常的，因为默认部署分支为 main
3. 参考 [Deploying Git Repositories with Vercel](https://vercel.com/docs/git#production-branch) 将生产分支改为 `deploy`，设置仅构建生产分支，并重新部署

GitHub Actions 每次构建后会自动推送到 `deploy` 分支，Vercel 会自动检测并部署。

### 方式三：阿里云 ESA Pages 部署

1. 前往 [阿里云 ESA 控制台](https://esa.console.aliyun.com/)，进入 Pages 服务
2. 点击"新建应用"，选择 "GitHub" 并授权访问
3. 选择你 fork 的 FeedMe 仓库，配置如下：
   - **生产分支**：`deploy`
   - **静态资源目录**：`.`（一个英文句号）
   - **安装命令**：留空
   - **构建命令**：留空
4. 点击"部署"即可

GitHub Actions 每次构建后会自动推送到 `deploy` 分支，阿里云 ESA Pages 会自动检测并部署。得益于阿里云 ESA 的边缘加速能力，应用在全球范围内均可获得极速访问体验。

### 方式四：Docker 本地部署

此方式使用 Docker 在本地或服务器上运行 FeedMe，并通过容器内的 Cron 任务自动更新数据和重建，不依赖 GitHub Actions。

1.  **克隆仓库**
    ```bash
    git clone https://github.com/Seanium/feedme.git
    cd feedme
    ```

2.  **配置环境变量**
    复制 `.env.example` 文件为 `.env` 并填入必要的 API 密钥：
    ```bash
    cp .env.example .env
    ```
    编辑 `.env` 文件：
    ```dotenv
    LLM_API_KEY=你的_API_密钥
    LLM_API_BASE=LLM服务的API基础URL
    LLM_NAME=使用的模型名称
    ```

3.  **构建并启动 Docker 容器**
    ```bash
    docker-compose up --build
    ```

4.  **访问应用**
    应用将在 [http://localhost:3000](http://localhost:3000) 上可用。

5.  **自动更新**
    容器将根据 `src/config/crontab-docker` 中的配置（默认为每 3 小时）自动执行 `pnpm update-feeds` 和 `pnpm build`，并重新启动服务。
    如需修改更新频率，请编辑 `src/config/crontab-docker` 文件中的 cron 表达式（例如 `0 */6 * * *` 表示每 6 小时执行一次）。

## 💻 开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/Seanium/feedme.git
   cd feedme
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   
   复制环境变量示例文件并编辑：
   ```bash
   cp .env.example .env
   ```
   
   填入以下内容：
   ```
   LLM_API_KEY=你的 API 密钥
   LLM_API_BASE=LLM服务的 API 基础 URL（例如：https://api.siliconflow.cn/v1）
   LLM_NAME=使用的模型名称（例如：THUDM/GLM-4-9B-0414）
   ```
   这些环境变量用于配置文章摘要生成功能，需要从 LLM 服务提供商获取

4. **更新 RSS 数据**
   ```bash
   pnpm update-feeds
   ```
   此命令会抓取 RSS 源并生成摘要，保存到 `public/data` 目录

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```
   访问 [http://localhost:3000](http://localhost:3000) 查看应用

## Star 趋势

<a href="https://www.star-history.com/#Seanium/FeedMe&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date" />
 </picture>
</a>