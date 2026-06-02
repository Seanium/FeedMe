import feedmeConfig from "./feedme-config-client";
import { defaultLocale, getLocalizedValue } from "./i18n-config";
import type { RssCategoryConfig, RssSourceConfig } from "./feedme-config-loader";

export type RssSource = RssSourceConfig;
export type RssCategory = RssCategoryConfig;

export interface SourceGroup {
  label: string;
  sources: RssSource[];
}

export const categories = feedmeConfig.categories;
export const categoryOrder = feedmeConfig.categoryOrder;
export const config = feedmeConfig.config;
export const defaultSource = feedmeConfig.defaultSource;

export function findSourceByUrl(url: string): RssSource | undefined {
  return config.sources.find((source) => source.url === url);
}

export function getSourceName(source: RssSource, locale = defaultLocale): string {
  return getLocalizedValue(source.name, locale);
}

export function getCategoryName(categoryId: string, locale = defaultLocale): string {
  return getLocalizedValue(categories[categoryId]?.name, locale) || categoryId;
}

export function getSourcesByCategory(locale = defaultLocale): Record<string, SourceGroup> {
  const groupedSources: Record<string, SourceGroup> = {};

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
