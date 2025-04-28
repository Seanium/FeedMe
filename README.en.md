[中文文档](./README.md) | [English Documentation](./README.en.md)

# <p align="center">😋FeedMe</p>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-111111?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-111111?style=flat&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![RSS](https://img.shields.io/badge/RSS-Feed-orange?style=flat&logo=rss)](https://en.wikipedia.org/wiki/RSS)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Seanium/feedme/update-deploy.yml?branch=main&style=flat&logo=github)](https://github.com/Seanium/feedme/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Active-4EA94B?style=flat&logo=github)](https://feedme.icu)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![RSS Update](https://img.shields.io/badge/RSS%20Update-Every%203h-lightgrey?style=flat&logo=github-actions)](https://github.com/Seanium/feedme/blob/main/.github/workflows/update-deploy.yml)

</div>

<p align="center">
  <b>AI-powered RSS reader, deployable to GitHub Pages</b>
</p>

<p align="center">
  <a href="https://feedme.icu" target="_blank">🌐 Live Demo</a> •
  <a href="#key-features">✨ Features</a> •
  <a href="#tech-stack">🔧 Tech Stack</a> •
  <a href="#local-development">💻 Development</a> •
  <a href="#production-deployment">🚀 Deployment</a>
</p>

---

## Key Features

- **Multi-source RSS Aggregation**: Fetch and integrate RSS content from multiple information sources
- **AI Summary Generation**: Automatically generate summaries for articles using LLM
- **Scheduled Updates**: Regularly auto-update content via GitHub Actions
- **Category Browsing**: View different information sources by category
- **Theme Switching**: Support for light and dark themes
- **Static Deployment**: Can be deployed on GitHub Pages and other static hosting services

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Package Management**: [pnpm](https://pnpm.io/)
- **Deployment**: [GitHub Actions](https://github.com/features/actions), [GitHub Pages](https://pages.github.com/)
- **RSS Parsing**: [rss-parser](https://www.npmjs.com/package/rss-parser)

## Local Development

### Method 1: Using Docker

```bash
# Clone the repository
git clone https://github.com/Seanium/feedme.git
cd feedme

# Copy the example environment file and fill in your API keys
cp .env.example .env

# Start Docker container
docker-compose up
```

Visit [http://localhost:3000](http://localhost:3000) to view the application

Update RSS data:
```bash
# Run update command in a new terminal window
docker exec -it feedme pnpm update-feeds
# After data update, the Next.js development server automatically detects changes and updates the page
```

### Method 2: Step-by-Step Setup

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
   This command fetches RSS sources and generates summaries, saving them to the `data` directory

5. **Start the Development Server**
   ```bash
   pnpm dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to view the application

## Production Deployment

### Method 1: GitHub Pages Deployment

This project uses GitHub Actions for automatic deployment to GitHub Pages, with a single workflow handling both data updates and website deployment.

#### Deployment Steps

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

### Method 2: Vercel Deployment

Import your GitHub repository to Vercel:

1. Go to [Vercel Import page](https://vercel.com/import/git)
2. Select "GitHub" and authorize access
3. Search and select your forked FeedMe repository
4. Keep the default settings and click "Deploy" to start the deployment

**Configure automatic updates:**
1. After Vercel deployment, obtain the following information:
   - `VERCEL_TOKEN`: Create from [Vercel Tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID`: Find at [Account Settings](https://vercel.com/account) > General > bottom of the page
   - `VERCEL_PROJECT_ID`: Find at [Vercel Dashboard](https://vercel.com/dashboard) > Your Project > Settings > General > bottom of the page
2. Add the above information to repository secrets (**Secrets**) (Location: Settings -> Secrets and variables -> Actions -> **Secrets**)
3. Add repository variable (**Variables**) `ENABLE_VERCEL_DEPLOYMENT` and set it to `true` (Location: Settings -> Secrets and variables -> Actions -> **Variables**)

## Workflow Description

**Update Data and Deploy** (`update-deploy.yml`):
- Trigger conditions:
  - Scheduled execution (every 3 hours)
  - Push to main branch
  - Manual trigger
- Execution content:
  - Fetch latest RSS content and generate summaries
  - Build static website
  - Deploy based on repository variable settings:
    - Always deploy to GitHub Pages
    - Deploy to Vercel if `ENABLE_VERCEL_DEPLOYMENT` is `true`

## Custom Deployment Configuration

- **Customize RSS Sources**:
  Edit the `config/rss-config.js` file to modify or add RSS sources. Each source should include:
  - Name
  - URL
  - Category

- **Modify Update Frequency**: Edit the cron expression in `.github/workflows/update-deploy.yml`
  ```yml
  # For example, change to update once daily at midnight
  cron: '0 0 * * *'
  ```
- **Adjust Retained Items**: Modify the `maxItemsPerFeed` value in `config/rss-config.js`

- **Custom Domain Configuration**:
  Please follow these instructions to avoid page resource loading issues:
  - **Not using a custom domain**: Delete the `CNAME` file in the directory
  - **Using a custom domain**: Add your custom domain in the GitHub Pages section of repository settings, and modify the CNAME file content to your custom domain

- **Customize Summary Generation**:
  If you need to customize the summary generation method, such as following a specific format or switching the summary language, modify the `prompt` variable in `scripts\update-feeds.js`

## Star History

<a href="https://www.star-history.com/#Seanium/FeedMe&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Seanium/FeedMe&type=Date" />
 </picture>
</a>

## License

[MIT](LICENSE) © 2025 Seanium 
