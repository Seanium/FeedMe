export interface RssSource {
  id: string;
  name: Record<string, string>;
  url: string;
  category: string;
}

export interface RssCategory {
  name: Record<string, string>;
}

export interface SourceGroup {
  label: string;
  sources: RssSource[];
}

export const categories: Record<string, RssCategory>;
export const categoryOrder: string[];
export const config: {
  sources: RssSource[];
  maxItemsPerFeed: number;
  dataPath: string;
};
export const defaultSource: RssSource;

export function findSourceByUrl(url: string): RssSource | undefined;
export function getSourceName(source: RssSource, locale?: string): string;
export function getCategoryName(categoryId: string, locale?: string): string;
export function getSourcesByCategory(locale?: string): Record<string, SourceGroup>;
