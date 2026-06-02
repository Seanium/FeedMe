import { defaultLocale, getLocalizedValue } from "./i18n-config.js";

// RSS source schema:
// id: stable source id
// name: localized source names
// url: RSS URL
// category: stable category id

export const categories = {
  techNews: {
    name: {
      zh: "科技资讯",
      en: "Tech News",
    },
  },
  personalBlogs: {
    name: {
      zh: "个人博客",
      en: "Personal Blogs",
    },
  },
  companyBlogs: {
    name: {
      zh: "企业博客",
      en: "Company Blogs",
    },
  },
  openSource: {
    name: {
      zh: "开源项目",
      en: "Open Source",
    },
  },
  research: {
    name: {
      zh: "科研资讯",
      en: "Research",
    },
  },
  forums: {
    name: {
      zh: "论坛",
      en: "Forums",
    },
  },
  anime: {
    name: {
      zh: "番剧资讯",
      en: "Anime",
    },
  },
  sports: {
    name: {
      zh: "体育资讯",
      en: "Sports",
    },
  },
  podcasts: {
    name: {
      zh: "播客",
      en: "Podcasts",
    },
  },
};

export const categoryOrder = [
  "techNews",
  "personalBlogs",
  "companyBlogs",
  "openSource",
  "research",
  "forums",
  "anime",
  "sports",
  "podcasts",
];

export const config = {
  sources: [
    {
      id: "hacker-news-best",
      name: {
        zh: "Hacker News 近期最佳",
        en: "Hacker News Best",
      },
      url: "https://hnrss.org/best",
      category: "techNews",
    },
    {
      id: "hacker-news-daily-top-10",
      name: {
        zh: "Hacker News 历史每日前十",
        en: "Hacker News Daily Top 10",
      },
      url: "https://rsshub.rssforever.com/github/issue/headllines/hackernews-daily",
      category: "techNews",
    },
    {
      id: "andrej-karpathy",
      name: {
        zh: "Andrej Karpathy",
        en: "Andrej Karpathy",
      },
      url: "https://karpathy.bearblog.dev/feed/",
      category: "personalBlogs",
    },
    {
      id: "simon-willison",
      name: {
        zh: "Simon Willison's Weblog",
        en: "Simon Willison's Weblog",
      },
      url: "https://simonwillison.net/atom/everything/",
      category: "personalBlogs",
    },
    {
      id: "mario-zechner",
      name: {
        zh: "Mario Zechner's Blog",
        en: "Mario Zechner's Blog",
      },
      url: "https://mariozechner.at/rss.xml",
      category: "personalBlogs",
    },
    {
      id: "ruanyifeng",
      name: {
        zh: "阮一峰的个人网站",
        en: "Ruanyifeng's Blog",
      },
      url: "http://www.ruanyifeng.com/blog/atom.xml",
      category: "personalBlogs",
    },
    {
      id: "openai-news",
      name: {
        zh: "OpenAI News",
        en: "OpenAI News",
      },
      url: "https://openai.com/news/rss.xml",
      category: "companyBlogs",
    },
    {
      id: "google-product-news",
      name: {
        zh: "Google 产品和技术新闻",
        en: "Google Product and Technology News",
      },
      url: "https://blog.google/rss/",
      category: "companyBlogs",
    },
    {
      id: "google-developers-blog",
      name: {
        zh: "Google 开发者博客",
        en: "Google Developers Blog",
      },
      url: "https://rsshub.rssforever.com/google/developers/en",
      category: "companyBlogs",
    },
    {
      id: "google-research-blog",
      name: {
        zh: "Google 研究博客",
        en: "Google Research Blog",
      },
      url: "https://rsshub.rssforever.com/google/research",
      category: "companyBlogs",
    },
    {
      id: "google-deepmind",
      name: {
        zh: "Google DeepMind",
        en: "Google DeepMind",
      },
      url: "https://deepmind.google/blog/rss.xml",
      category: "companyBlogs",
    },
    {
      id: "github-blog",
      name: {
        zh: "Github 博客",
        en: "GitHub Blog",
      },
      url: "https://github.blog/feed/",
      category: "companyBlogs",
    },
    {
      id: "hugging-face-blog",
      name: {
        zh: "Hugging Face 博客",
        en: "Hugging Face Blog",
      },
      url: "https://rsshub.rssforever.com/huggingface/blog",
      category: "companyBlogs",
    },
    {
      id: "microsoft-research",
      name: {
        zh: "Microsoft Research",
        en: "Microsoft Research",
      },
      url: "https://www.microsoft.com/en-us/research/feed/",
      category: "companyBlogs",
    },
    {
      id: "github-trending-daily",
      name: {
        zh: "Github 今日热门",
        en: "GitHub Trending Today",
      },
      url: "https://rsshub.rssforever.com/github/trending/daily/any",
      category: "openSource",
    },
    {
      id: "github-trending-weekly",
      name: {
        zh: "Github 近一周热门",
        en: "GitHub Trending This Week",
      },
      url: "https://rsshub.rssforever.com/github/trending/weekly/any",
      category: "openSource",
    },
    {
      id: "hugging-face-daily-papers",
      name: {
        zh: "Hugging Face 每日论文",
        en: "Hugging Face Daily Papers",
      },
      url: "https://rsshub.rssforever.com/huggingface/daily-papers",
      category: "research",
    },
    {
      id: "linux-do-daily-top",
      name: {
        zh: "LINUX DO 今日热门",
        en: "LINUX DO Daily Top",
      },
      url: "https://linux.do/top.rss?period=daily",
      category: "forums",
    },
    {
      id: "linux-do-weekly-top",
      name: {
        zh: "LINUX DO 近一周热门",
        en: "LINUX DO Weekly Top",
      },
      url: "https://linux.do/top.rss?period=weekly",
      category: "forums",
    },
    {
      id: "linux-do-monthly-top",
      name: {
        zh: "LINUX DO 近一月热门",
        en: "LINUX DO Monthly Top",
      },
      url: "https://linux.do/top.rss?period=monthly",
      category: "forums",
    },
    {
      id: "v2ex-hot",
      name: {
        zh: "V2EX 今日热门",
        en: "V2EX Hot Today",
      },
      url: "https://rsshub.rssforever.com/v2ex/topics/hot",
      category: "forums",
    },
    {
      id: "bangumi-monthly-popular",
      name: {
        zh: "Bangumi 近一月热门",
        en: "Bangumi Monthly Popular",
      },
      url: "https://rsshub.rssforever.com/bangumi.tv/anime/followrank",
      category: "anime",
    },
    {
      id: "f1-news",
      name: {
        zh: "F1 News",
        en: "F1 News",
      },
      url: "https://www.formula1.com/content/fom-website/en/latest/all.xml",
      category: "sports",
    },
    {
      id: "lex-fridman-podcast",
      name: {
        zh: "Lex Fridman Podcast",
        en: "Lex Fridman Podcast",
      },
      url: "https://lexfridman.com/feed/podcast/",
      category: "podcasts",
    },
  ],
  maxItemsPerFeed: 30,
  dataPath: "./public/data",
};

export const defaultSource = config.sources[0];

export function findSourceByUrl(url) {
  return config.sources.find((source) => source.url === url);
}

export function getSourceName(source, locale = defaultLocale) {
  return getLocalizedValue(source.name, locale);
}

export function getCategoryName(categoryId, locale = defaultLocale) {
  return getLocalizedValue(categories[categoryId]?.name, locale) || categoryId;
}

export function getSourcesByCategory(locale = defaultLocale) {
  const groupedSources = {};

  for (const categoryId of categoryOrder) {
    groupedSources[categoryId] = {
      label: getCategoryName(categoryId, locale),
      sources: [],
    };
  }

  for (const source of config.sources) {
    if (!groupedSources[source.category]) {
      groupedSources[source.category] = {
        label: getCategoryName(source.category, locale),
        sources: [],
      };
    }

    groupedSources[source.category].sources.push(source);
  }

  return Object.fromEntries(
    Object.entries(groupedSources).filter(([, group]) => group.sources.length > 0),
  );
}
