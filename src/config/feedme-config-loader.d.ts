export interface LocalizedName {
  [locale: string]: string;
}

export interface RssSourceConfig {
  id: string;
  name: LocalizedName;
  url: string;
  category: string;
}

export interface RssCategoryConfig {
  name: LocalizedName;
}

export interface ParsedFeedmeConfig {
  categories: Record<string, RssCategoryConfig>;
  categoryOrder: string[];
  config: {
    sources: RssSourceConfig[];
    maxItemsPerFeed: number;
    dataPath: string;
  };
  defaultSource: RssSourceConfig;
  summary: {
    contentMaxChars: number;
    temperature: number;
    maxTokens: number;
    unavailableMessages: LocalizedName;
    prompt: string;
  };
}

export function parseFeedmeConfig(configText: string): ParsedFeedmeConfig;
