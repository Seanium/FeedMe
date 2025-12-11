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
[![Live Demo](https://img.shields.io/badge/Demo-Online-2ea44f?style=flat-square&logo=safari&logoColor=white)](https://feedme.icu)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Seanium/FeedMe)

</div>

<p align="center">
  <b>AI-powered RSS reader, deployable to GitHub Pages or with Docker</b>
</p>

---

## 🍱 Lightweight, Smart, Made for You

- 🪶 **No Bloat**: Say goodbye to forced logins and app downloads, a responsive static page for all your feed needs

- 🤖 **Efficiency First**: AI automatically generates article summaries, helping you grasp key points

- ⚙️ **Customizable**: Full control over RSS sources and AI configuration

- 🚀 **Deploy Freely**: Zero-cost deployment to GitHub Pages or Docker

## ✨ Features

- **Aggregation & Summaries**: Integrate multi-source RSS feeds with LLM-powered automatic summaries

- **Auto Updates**: Keep content fresh via GitHub Actions / Cron jobs

- **Flexible Deployment**: Zero-cost static hosting on GitHub Pages / Self-hosted with Docker

- **Modern Experience**: Responsive design with light/dark themes

## 🚀 Deployment

### Method 1: GitHub Pages Deployment

This project uses GitHub Actions for automatic deployment to GitHub Pages, with a single workflow handling both data updates and website deployment.

1. **Fork or Clone the Repository** to your GitHub account

2. **Set GitHub Secrets**

   Add the following secrets in your project's Settings - Secrets and variables: Actions:
   - `LLM_API_KEY`: API key for AI summary generation
   - `LLM_API_BASE`: API base URL for the LLM service
   - `LLM_NAME`: Name of the model to use

3. **Enable GitHub Pages**

   In repository settings, choose to deploy from GitHub Actions

4. **Manually Trigger the Workflow** (optional)

   Manually trigger the "Update Data and Deploy" workflow from the Actions page of your GitHub repository

#### Workflow Description

**Update Data and Deploy** (`update-deploy.yml`):
- Trigger conditions:
  - Scheduled execution (every 3 hours)
  - Push code
  - Manual trigger
- Execution content:
  - **Single build process**: Fetch RSS content, generate summaries, and build static website in one go
  - **Multi-platform deployment**:
    - Automatically deploy to GitHub Pages
    - Push build artifacts to `deploy` branch for platforms like Vercel to monitor

#### Custom Deployment Configuration

- **Customize RSS Sources**:
  Edit the `src/config/rss-config.js` file to modify or add RSS sources. Each source should include:
  - Name
  - URL
  - Category

- **Modify Update Frequency**: Edit the cron expression in `.github/workflows/update-deploy.yml`
  ```yml
  # For example, change to update once daily at midnight
  cron: '0 0 * * *'
  ```

- **Adjust Retained Items**: Modify the `maxItemsPerFeed` value in `src/config/rss-config.js`

- **Customize Summary Generation**:
  If you need to customize the summary generation method, such as following a specific format or switching the summary language, modify the `prompt` variable in `scripts/update-feeds.js`

### Method 2: Vercel Deployment

1. Go to [Vercel Import page](https://vercel.com/import/git), select "GitHub" and authorize access
2. Select your forked FeedMe repository, change the deployment branch to `deploy`
3. Click "Deploy"

GitHub Actions will automatically push to the `deploy` branch after each build, and Vercel will automatically detect and deploy.

### Method 3: Docker Local Deployment

This method uses Docker to run FeedMe locally or on a server. It utilizes an in-container Cron job for automatic data updates and rebuilds, independent of GitHub Actions.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Seanium/feedme.git
    cd feedme
    ```

2.  **Configure Environment Variables**
    Copy the `.env.example` file to `.env` and fill in the necessary API keys:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file:
    ```dotenv
    LLM_API_KEY=your_api_key
    LLM_API_BASE=LLM_service_api_base_url
    LLM_NAME=model_name_to_use
    ```

3.  **Build and Start the Docker Container**
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application**
    The application will be available at [http://localhost:3000](http://localhost:3000).

5.  **Automatic Updates**
    The container will automatically run `pnpm update-feeds` and `pnpm build`, then restart the server based on the schedule in `src/config/crontab-docker` (defaults to every 3 hours).
    To modify the update frequency, edit the cron expression in the `src/config/crontab-docker` file (e.g., `0 */6 * * *` for updates every 6 hours).

## 💻 Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Seanium/feedme.git
   cd feedme
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   Copy the example environment file and edit it:
   ```bash
   cp .env.example .env
   ```

   Fill in the following content:
   ```
   LLM_API_KEY=your_api_key
   LLM_API_BASE=LLM service API base URL (e.g., https://api.siliconflow.cn/v1)
   LLM_NAME=model name (e.g., THUDM/GLM-4-9B-0414)
   ```
   These environment variables are used to configure the article summary generation feature and need to be obtained from an LLM service provider

4. **Update RSS Data**
   ```bash
   pnpm update-feeds
   ```
   This command fetches RSS sources and generates summaries, saving them to the `public/data` directory

5. **Start the Development Server**
   ```bash
   pnpm dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to view the application

## Star History

<a href="https://www.star-history.com/#Seanium/FeedMe&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date" />
 </picture>
</a>