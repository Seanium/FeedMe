// 命令行脚本，用于更新所有 RSS 源数据，供 GitHub Actions 直接调用。

import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import { OpenAI } from "openai";
import Parser from "rss-parser";

import { parseFeedmeConfig } from "../src/config/feedme-config-loader.ts";
import {
  defaultLocale,
  getLocaleMeta,
  getLocalizedValue,
  parseLocaleList,
  supportedLocales,
} from "../src/config/i18n-config.ts";
import { getSourceDataFilename } from "../src/lib/source-data-path.ts";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  isoDate: string;
  content: string;
  contentSnippet: string;
  creator: string;
  summary?: string;
  summaries?: Record<string, string>;
  enclosure?: {
    url: string;
    type: string;
  };
}

interface FeedData {
  sourceUrl: string;
  title: string;
  description: string;
  link: string;
  items: FeedItem[];
  lastUpdated?: string;
}

interface SummaryPlan {
  retainedNewItems: number;
  retainedExistingItems: number;
  generate: Record<string, number>;
  reuse: Record<string, number>;
  skippedMissingExisting: Record<string, number>;
}

type ParsedFeedItem = Partial<FeedItem> & {
  summary?: string;
};

const feedmeConfigPath = path.resolve(process.cwd(), "src/config/feedme.config.yaml");
const { config, summary: summaryConfig } = parseFeedmeConfig(
  fs.readFileSync(feedmeConfigPath, "utf8"),
);

const parser = new Parser<Record<string, never>, ParsedFeedItem>({
  customFields: {
    item: [
      ["content:encoded", "content"],
      ["dc:creator", "creator"],
      ["summary", "summary"],
    ],
  },
});

let openaiClient: OpenAI | null = null;
let summaryLocales: string[] | null = null;

function getSummaryLocales(): string[] {
  if (!summaryLocales) {
    summaryLocales = parseLocaleList(
      process.env.SUMMARY_LOCALES || process.env.SUMMARY_LANG,
      supportedLocales,
    );
  }

  return summaryLocales;
}

function loadEnvFiles(): void {
  if (loadEnvFile(path.resolve(process.cwd(), ".env"), ".env")) {
    return;
  }

  if (loadEnvFile(path.resolve(process.cwd(), ".env.local"), ".env.local")) {
    return;
  }

  console.warn("未找到.env或.env.local文件，请确保环境变量已设置");
}

function loadEnvFile(filePath: string, label: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const dotenvContent = fs.readFileSync(filePath, "utf8");
  dotenvContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) {
      return;
    }

    const key = match[1];
    let value = match[2] || "";

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.replace(/^"|"$/g, "");
    }

    process.env[key] = value;
  });

  console.log(`已从${label}加载环境变量`);
  return true;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`环境变量${name}未设置，无法生成摘要`);
  }

  return value;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = getRequiredEnv("LLM_API_KEY");
    const baseURL = getRequiredEnv("LLM_API_BASE");

    openaiClient = new OpenAI({
      baseURL,
      apiKey,
    });
  }

  return openaiClient;
}

function getOpenAIModelName(): string {
  return getRequiredEnv("LLM_NAME");
}

function ensureDataDir(): string {
  const configuredDataPath = process.env.DATA_DIR?.trim() || config.dataPath;
  const dataDir = path.isAbsolute(configuredDataPath)
    ? configuredDataPath
    : path.join(process.cwd(), configuredDataPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return dataDir;
}

function getSourceFilePath(sourceUrl: string): string {
  return path.join(ensureDataDir(), getSourceDataFilename(sourceUrl));
}

async function saveFeedData(sourceUrl: string, data: FeedData): Promise<void> {
  const filePath = getSourceFilePath(sourceUrl);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`保存数据 ${sourceUrl} 到 ${filePath}`);
  } catch (error) {
    console.error(`保存数据 ${sourceUrl} 时出错:`, error);
    throw new Error(`保存源数据失败: ${getErrorMessage(error)}`);
  }
}

function loadFeedData(sourceUrl: string): FeedData | null {
  const filePath = getSourceFilePath(sourceUrl);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as FeedData;
  } catch (error) {
    console.error(`加载数据 ${sourceUrl} 时出错:`, error);
    return null;
  }
}

function getSummaryUnavailableMessage(locale: string): string {
  return getLocalizedValue(summaryConfig.unavailableMessages, locale);
}

function normalizeSummaries(item?: Partial<FeedItem> | null): Record<string, string> {
  const summaries = { ...(item?.summaries || {}) };

  if (item?.summary && !summaries[defaultLocale]) {
    summaries[defaultLocale] = item.summary;
  }

  return summaries;
}

function createLocaleCounter(): Record<string, number> {
  return Object.fromEntries(getSummaryLocales().map((locale) => [locale, 0]));
}

function formatLocaleCounts(counter: Record<string, number>): string {
  return getSummaryLocales().map((locale) => `${locale}:${counter[locale] || 0}`).join(", ");
}

function createSummaryPlan(mergedItems: FeedItem[], newItemLinks: Set<string>): SummaryPlan {
  const plan: SummaryPlan = {
    retainedNewItems: 0,
    retainedExistingItems: 0,
    generate: createLocaleCounter(),
    reuse: createLocaleCounter(),
    skippedMissingExisting: createLocaleCounter(),
  };

  for (const item of mergedItems) {
    const summaries = normalizeSummaries(item);
    const isRetainedNewItem = Boolean(item.link && newItemLinks.has(item.link));

    if (isRetainedNewItem) {
      plan.retainedNewItems += 1;
    } else {
      plan.retainedExistingItems += 1;
    }

    for (const locale of getSummaryLocales()) {
      if (summaries[locale]) {
        plan.reuse[locale] += 1;
      } else if (isRetainedNewItem) {
        plan.generate[locale] += 1;
      } else {
        plan.skippedMissingExisting[locale] += 1;
      }
    }
  }

  return plan;
}

function buildSummaryPrompt(title: string, content: string, locale: string): string {
  const { summaryLanguage } = getLocaleMeta(locale);

  return summaryConfig.prompt
    .replaceAll("{{summaryLanguage}}", summaryLanguage)
    .replaceAll("{{title}}", title)
    .replaceAll("{{content}}", content.slice(0, summaryConfig.contentMaxChars));
}

async function generateSummary(title: string, content: string, locale: string): Promise<string> {
  try {
    const cleanContent = (content || "").replace(/<[^>]*>?/gm, "");
    const prompt = buildSummaryPrompt(title, cleanContent, locale);

    const completion = await getOpenAIClient().chat.completions.create({
      model: getOpenAIModelName(),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: summaryConfig.temperature,
      max_tokens: summaryConfig.maxTokens,
    });

    return completion.choices[0]?.message.content?.trim() || getSummaryUnavailableMessage(locale);
  } catch (error) {
    console.error("生成摘要时出错:", error);
    return getSummaryUnavailableMessage(locale);
  }
}

async function fetchRssFeed(url: string): Promise<Omit<FeedData, "sourceUrl" | "lastUpdated">> {
  try {
    const feed = await parser.parseURL(url);
    const serializedItems: FeedItem[] = feed.items.map((item) => {
      const serializedItem: FeedItem = {
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
        isoDate: item.isoDate || "",
        content: item.content || item.summary || item.contentSnippet || "",
        contentSnippet: item.contentSnippet || "",
        creator: item.creator || "",
      };

      if (item.enclosure) {
        serializedItem.enclosure = {
          url: item.enclosure.url || "",
          type: item.enclosure.type || "",
        };
      }

      return serializedItem;
    });

    return {
      title: feed.title || "",
      description: feed.description || "",
      link: feed.link || "",
      items: serializedItems,
    };
  } catch (error) {
    console.error("获取RSS源时出错:", error);
    throw new Error(`获取RSS源失败: ${getErrorMessage(error)}`);
  }
}

export function mergeFeedItems(
  oldItems: FeedItem[] = [],
  newItems: FeedItem[] = [],
  maxItems = config.maxItemsPerFeed,
): { mergedItems: FeedItem[]; newItemsForSummary: FeedItem[] } {
  const itemsMap = new Map<string, FeedItem>();

  for (const item of oldItems) {
    if (item.link) {
      itemsMap.set(item.link, item);
    }
  }

  const newItemsForSummary: FeedItem[] = [];

  for (const item of newItems) {
    if (!item.link) {
      continue;
    }

    const existingItem = itemsMap.get(item.link);

    if (!existingItem) {
      newItemsForSummary.push(item);
    }

    const normalizedItem = { ...item };
    const generatedSummary = existingItem?.summary;

    if (!normalizedItem.content && normalizedItem.summary && !generatedSummary) {
      normalizedItem.content = normalizedItem.summary;
      normalizedItem.summary = undefined;
    }

    const summaries = {
      ...normalizeSummaries(normalizedItem),
      ...normalizeSummaries(existingItem),
    };

    itemsMap.set(item.link, {
      ...normalizedItem,
      content: normalizedItem.content || existingItem?.content || "",
      summaries,
      summary: summaries[defaultLocale] || generatedSummary || normalizedItem.summary,
    });
  }

  const mergedItems: FeedItem[] = [];

  for (const item of newItems) {
    if (!item.link) {
      continue;
    }

    const mergedItem = itemsMap.get(item.link);

    if (mergedItem) {
      mergedItems.push(mergedItem);
    }

    if (mergedItems.length >= maxItems) {
      break;
    }
  }

  return { mergedItems, newItemsForSummary };
}

async function updateFeed(sourceUrl: string): Promise<FeedData> {
  console.log(`更新源: ${sourceUrl}`);

  try {
    const existingData = loadFeedData(sourceUrl);
    const newFeed = await fetchRssFeed(sourceUrl);

    if (newFeed.items.length === 0 && existingData?.items?.length) {
      console.warn(
        `源统计 ${sourceUrl}: RSS返回 0 条，保留已有 ${existingData.items.length} 条数据，不覆盖旧文件`,
      );
      return existingData;
    }

    const { mergedItems, newItemsForSummary } = mergeFeedItems(
      existingData?.items || [],
      newFeed.items,
      config.maxItemsPerFeed,
    );

    const newItemLinks = new Set(newItemsForSummary.map((item) => item.link).filter(Boolean));
    const summaryPlan = createSummaryPlan(mergedItems, newItemLinks);

    console.log(
      `源统计 ${sourceUrl}: RSS返回 ${newFeed.items.length} 条，保留 ${mergedItems.length}/${config.maxItemsPerFeed} 条；` +
        `feed新链接 ${newItemsForSummary.length} 条，保留列表新条目 ${summaryPlan.retainedNewItems} 条，` +
        `复用已有条目 ${summaryPlan.retainedExistingItems} 条`,
    );
    console.log(
      `摘要计划 ${sourceUrl}: 将生成 ${formatLocaleCounts(summaryPlan.generate)}；` +
        `已有/复用 ${formatLocaleCounts(summaryPlan.reuse)}；` +
        `旧条目缺失但跳过 ${formatLocaleCounts(summaryPlan.skippedMissingExisting)}`,
    );

    const itemsWithSummaries = await Promise.all(
      mergedItems.map(async (item): Promise<FeedItem> => {
        const summaries = normalizeSummaries(item);

        if (item.link && newItemLinks.has(item.link)) {
          try {
            const contentForSummary = item.content || item.contentSnippet || "";
            const generatedSummaries = await Promise.all(
              getSummaryLocales().map(async (locale): Promise<[string, string]> => {
                if (summaries[locale]) {
                  return [locale, summaries[locale]];
                }

                return [locale, await generateSummary(item.title, contentForSummary, locale)];
              }),
            );

            for (const [locale, summary] of generatedSummaries) {
              summaries[locale] = summary;
            }

            return {
              ...item,
              summaries,
              summary: summaries[defaultLocale] || summaries[getSummaryLocales()[0]] || item.summary,
            };
          } catch (error) {
            console.error(`为条目 ${item.title} 生成摘要时出错:`, error);
            return {
              ...item,
              summaries,
              summary: summaries[defaultLocale] || getSummaryUnavailableMessage(defaultLocale),
            };
          }
        }

        return {
          ...item,
          summaries,
          summary: summaries[defaultLocale] || item.summary,
        };
      }),
    );

    const updatedData: FeedData = {
      sourceUrl,
      title: newFeed.title,
      description: newFeed.description,
      link: newFeed.link,
      items: itemsWithSummaries,
      lastUpdated: new Date().toISOString(),
    };

    await saveFeedData(sourceUrl, updatedData);

    return updatedData;
  } catch (error) {
    console.error(`更新源 ${sourceUrl} 时出错:`, error);
    throw new Error(`更新源失败: ${getErrorMessage(error)}`);
  }
}

async function updateAllFeeds(): Promise<Record<string, boolean>> {
  console.log("开始更新所有RSS源");

  const results: Record<string, boolean> = {};

  for (const source of config.sources) {
    try {
      await updateFeed(source.url);
      results[source.url] = true;
    } catch (error) {
      console.error(`更新 ${source.url} 失败:`, error);
      results[source.url] = false;
    }
  }

  console.log("所有RSS源更新完成");
  return results;
}

async function main(): Promise<void> {
  try {
    loadEnvFiles();
    summaryLocales = null;
    getOpenAIClient();
    getOpenAIModelName();
    await updateAllFeeds();
    console.log("RSS数据更新成功");
    process.exit(0);
  } catch (error) {
    console.error("RSS数据更新失败:", error);
    process.exit(1);
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isMainModule(): boolean {
  const entryPoint = process.argv[1];
  return Boolean(entryPoint && import.meta.url === pathToFileURL(path.resolve(entryPoint)).href);
}

if (isMainModule()) {
  void main();
}
