import feedmeConfig from "./feedme.config.yaml";
import { defaultLocale, getLocalizedValue } from "./i18n-config.js";

export const categories = feedmeConfig.categories;
export const categoryOrder = feedmeConfig.categoryOrder;
export const config = feedmeConfig.config;
export const defaultSource = feedmeConfig.defaultSource;

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
